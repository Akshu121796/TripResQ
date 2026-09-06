from flask import Blueprint, request, jsonify
from app.core.db import db
from app.models.trip import Trip
from app.models.node import ItineraryNode
from app.models.edge import DependencyEdge

trips_bp = Blueprint('trips', __name__, url_prefix='/api/trips')

@trips_bp.route('', methods=['POST'])
def create_trip():
    """
    Create a new Trip Session
    ---
    tags:
      - Trips
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            name:
              type: string
    responses:
      201:
        description: Trip created
    """
    data = request.get_json(silent=True)
    if not data or 'name' not in data:
        return jsonify({"error": "Name is required"}), 400
        
    try:
        trip = Trip(name=data['name'])
        db.session.add(trip)
        db.session.commit()
        return jsonify({"id": trip.id, "name": trip.name}), 201
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).exception("Database error while creating trip")
        return jsonify({
            "error": "Failed to create trip",
            "message": str(e),
            "type": type(e).__name__
        }), 500

@trips_bp.route('', methods=['GET'])
def list_trips():
    """
    List all Trip Sessions
    ---
    tags:
      - Trips
    responses:
      200:
        description: All trips returned
    """
    trips = Trip.query.order_by(Trip.created_at.desc()).all()
    return jsonify([{
        "id": t.id,
        "name": t.name,
        "created_at": t.created_at.isoformat() if t.created_at else None,
    } for t in trips]), 200


@trips_bp.route('/<trip_id>/graph', methods=['GET'])
def get_trip_graph(trip_id):
    """
    Fetch the entire computed Graph for a trip
    ---
    tags:
      - Graph
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Graph returned successfully
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
        
    # Get nodes
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).all()
    node_list = []
    for node in nodes:
        node_data = {
            "id": node.id,
            "type": node.node_type,
            "title": node.title,
            "location": node.location,
            "origin": node.origin,
            "destination": node.destination,
            "operator": node.operator,
            "service_number": node.service_number,
            "start_time": node.start_time.isoformat(),
            "end_time": node.end_time.isoformat(),
            "status": node.status
        }
        if node.hard_cutoff:
            node_data["hard_cutoff"] = node.hard_cutoff.isoformat()
        node_list.append(node_data)
        
    # Get edges connected to these nodes
    node_ids = [n.id for n in nodes]
    edges = DependencyEdge.query.filter(DependencyEdge.source_node_id.in_(node_ids)).all()
    
    edge_list = []
    for edge in edges:
        edge_list.append({
            "id": edge.id,
            "source": edge.source_node_id,
            "target": edge.target_node_id,
            "min_buffer_minutes": edge.min_buffer_minutes,
            "constraint_type": edge.constraint_type
        })
        
    return jsonify({
        "trip_id": trip.id,
        "trip_name": trip.name,
        "nodes": node_list,
        "edges": edge_list
    }), 200

from app.services.disruption import apply_disruption

@trips_bp.route('/<trip_id>/disrupt', methods=['POST'])
def disrupt_trip(trip_id):
    """
    Apply a time disruption to a Node and execute BFS propagation
    ---
    tags:
      - Graph Disruption
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            node_id:
              type: string
            delay_minutes:
              type: integer
            reason:
              type: string
    responses:
      200:
        description: Disruption propagated
    """
    data = request.get_json() or {}
    if not data or 'node_id' not in data:
        return jsonify({"error": "node_id is required"}), 400

    delay_minutes = data.get('delay_minutes', 0)
    disruption_type = data.get('disruption_type') or data.get('type')
    reason = data.get('reason', 'Unknown Delay')

    try:
        res = apply_disruption(
            trip_id=trip_id,
            node_id=data['node_id'],
            delay_minutes=delay_minutes,
            reason=reason,
            disruption_type=disruption_type
        )
        if isinstance(res, tuple):
            impacts, metrics = res
        else:
            impacts = res
            metrics = impacts.get("metrics", {})
            
        graph_response = get_trip_graph(trip_id)[0].get_json()
        return jsonify({
            "message": "Disruption applied and propagated successfully",
            "impacts": impacts,
            "metrics": metrics,
            "updated_graph": graph_response
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).exception("Database error while applying disruption")
        return jsonify({
            "error": "Failed to apply disruption",
            "message": str(e),
            "type": type(e).__name__
        }), 500

from app.services.recovery import generate_recovery_proposals, generate_recovery_plans, apply_recovery_plan

@trips_bp.route('/<trip_id>/recover', methods=['POST'])
def recover_trip(trip_id):
    """
    Generate recovery proposals for broken nodes in the graph (backwards-compatible)
    ---
    tags:
      - Graph Recovery
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
    responses:
      200:
        description: Proposals and plans generated
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        return jsonify({"error": "Trip not found"}), 404

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    proposals = generate_recovery_proposals(trip_id)
    recovery_data = generate_recovery_plans(trip_id=trip_id, priority=priority)

    return jsonify({
        "trip_id": trip_id,
        "proposals": proposals,
        "priority": recovery_data.get("priority"),
        "recommended_plan": recovery_data.get("recommended_plan"),
        "plans": recovery_data.get("plans")
    }), 200

from app.services.recovery import (
    generate_recovery_proposals,
    generate_recovery_plans,
    generate_recovery_options,
    apply_recovery_plan
)

@trips_bp.route('/<trip_id>/recovery-options', methods=['POST'])
def get_recovery_options(trip_id):
    """
    Generate preference-ranked recovery options for broken nodes in a trip
    ---
    tags:
      - Recovery Control
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          properties:
            priority:
              type: string
              enum: [FASTEST, CHEAPEST, MAX_REFUND, LEAST_DISRUPTION]
              default: FASTEST
    responses:
      200:
        description: Ranked recovery options returned
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        trip = Trip.query.filter_by(id=trip_id).first() or Trip.query.order_by(Trip.created_at.desc()).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    trip_id = trip.id

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    result = generate_recovery_options(trip_id=trip_id, priority=priority, trip_context=data)
    return jsonify(result), 200

@trips_bp.route('/<trip_id>/recovery', methods=['POST'])
def get_recovery_plans(trip_id):
    """
    Generate preference-ranked recovery plans for a disrupted trip
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        trip = Trip.query.filter_by(id=trip_id).first() or Trip.query.order_by(Trip.created_at.desc()).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    trip_id = trip.id

    data = request.get_json(silent=True) or {}
    priority = data.get("priority", "FASTEST")

    recovery_data = generate_recovery_options(trip_id=trip_id, priority=priority, trip_context=data)
    return jsonify(recovery_data), 200
    
@trips_bp.route('/<trip_id>/apply-plan', methods=['POST'])
def apply_plan(trip_id):
    """
    Atomically apply a list of recovery proposals to restore the trip
    ---
    tags:
      - Graph Recovery
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: body
        name: body
        schema:
          type: object
          required:
            - proposals
          properties:
            proposals:
              type: array
              items:
                type: object
    responses:
      200:
        description: Recovery plan successfully applied
      400:
        description: Proposals list missing
      404:
        description: Trip not found
    """
    trip = db.session.get(Trip, trip_id)
    if not trip:
        trip = Trip.query.filter_by(id=trip_id).first() or Trip.query.order_by(Trip.created_at.desc()).first()
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
    trip_id = trip.id

    data = request.get_json()
    if not data or 'proposals' not in data:
        return jsonify({"error": "proposals list is required"}), 400
        
    apply_recovery_plan(trip_id, data['proposals'])
    
    # Return the restored graph
    graph_response = get_trip_graph(trip_id)[0].get_json()
    plan_info = data.get('plan') or {}
    
    return jsonify({
        "message": "Recovery plan applied atomically. Trip restored.",
        "updated_graph": graph_response,
        "applied_plan": plan_info,
        "strategy": plan_info.get("title", "Intelligent Personalized Recovery"),
        "priority": plan_info.get("priority", "FASTEST"),
        "replacement": plan_info.get("subtitle", "Confirmed Alternative Connection"),
        "cost": plan_info.get("estimated_cost", 0),
        "time_saved": plan_info.get("time_saved_minutes", 0),
        "refund": plan_info.get("estimated_refund", 0),
        "affected_nodes": plan_info.get("affected_nodes", len(data.get("proposals", [])))
    }), 200


@trips_bp.route('/<trip_id>/next-stop', methods=['GET'])
def get_next_stop(trip_id):
    """
    Detect the user's next upcoming itinerary stop for travel-aware dining and local services.
    ---
    tags:
      - Trips
    parameters:
      - in: path
        name: trip_id
        type: string
        required: true
      - in: query
        name: current_time
        type: string
        required: false
    responses:
      200:
        description: Next stop details or availability status
      404:
        description: Trip not found
    """
    import re
    from datetime import datetime, timezone

    trip = db.session.get(Trip, trip_id)
    if not trip:
        trip = Trip.query.filter_by(id=trip_id).first() or Trip.query.order_by(Trip.created_at.desc()).first()
    if not trip:
        return jsonify({
            "available": False,
            "reason": "NO_ACTIVE_TRIP"
        }), 200
    trip_id = trip.id

    # Optional reference time for testing or simulation
    curr_time_str = request.args.get('current_time')
    if curr_time_str:
        try:
            curr_time = datetime.fromisoformat(curr_time_str.replace('Z', '+00:00'))
        except ValueError:
            curr_time = datetime.now(timezone.utc)
    else:
        curr_time = datetime.now(timezone.utc)

    # Fetch all nodes ordered chronologically by start_time
    nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(ItineraryNode.start_time.asc()).all()
    if not nodes:
        return jsonify({
            "available": False,
            "reason": "NO_UPCOMING_STOP"
        }), 200

    CITY_NAMES = {
        "BOM": "Mumbai", "DEL": "Delhi", "PUN": "Pune", "BLR": "Bangalore",
        "HYD": "Hyderabad", "CCU": "Kolkata", "MAA": "Chennai", "AGR": "Agra",
        "GOI": "Goa", "PNQ": "Pune", "NYC": "New York", "LON": "London",
        "JAI": "Jaipur", "COK": "Kochi", "AMD": "Ahmedabad", "GAU": "Guwahati",
        "VNS": "Varanasi", "IXC": "Chandigarh", "SXR": "Srinagar"
    }

    def resolve_destination_city(node):
        dest_field = (node.destination or "").strip()
        loc_field = (node.location or "").strip()
        title_field = (node.title or "").strip()

        # 1. Check destination field first
        if dest_field:
            for code, city in CITY_NAMES.items():
                if re.search(rf'\b{code}\b', dest_field, re.IGNORECASE) or re.search(rf'\b{city}\b', dest_field, re.IGNORECASE):
                    return city
            clean_dest = re.sub(r'\(.*?\)', '', dest_field).strip()
            if clean_dest:
                return clean_dest

        # 2. Check location destination segment (after arrow or "to")
        loc_target = loc_field
        if "→" in loc_field:
            loc_target = loc_field.split("→")[-1].strip()
        elif "->" in loc_field:
            loc_target = loc_field.split("->")[-1].strip()
        elif " to " in loc_field.lower():
            loc_target = re.split(r'\s+to\s+', loc_field, flags=re.IGNORECASE)[-1].strip()

        for code, city in CITY_NAMES.items():
            if re.search(rf'\b{code}\b', loc_target, re.IGNORECASE) or re.search(rf'\b{city}\b', loc_target, re.IGNORECASE):
                return city

        # 3. Check full location string for known city/code
        for code, city in CITY_NAMES.items():
            if re.search(rf'\b{code}\b', loc_field, re.IGNORECASE) or re.search(rf'\b{city}\b', loc_field, re.IGNORECASE):
                return city

        # 4. Check title for known city/code
        for code, city in CITY_NAMES.items():
            if re.search(rf'\b{code}\b', title_field, re.IGNORECASE) or re.search(rf'\b{city}\b', title_field, re.IGNORECASE):
                return city

        return loc_target or loc_field or title_field

    # Find the first node whose relevant end_time (or start_time for hotel/activity) is in the future
    upcoming_node = None
    for n in nodes:
        node_end = n.end_time
        if node_end.tzinfo is None and curr_time.tzinfo is not None:
            node_end = node_end.replace(tzinfo=timezone.utc)
        elif node_end.tzinfo is not None and curr_time.tzinfo is None:
            curr_time = curr_time.replace(tzinfo=timezone.utc)

        if node_end >= curr_time:
            upcoming_node = n
            break

    # If all nodes are in the past (e.g. demo/hackathon trips with fixed historical timestamps),
    # fallback to the first transit node (or first node) so Dining still resolves a useful destination.
    if not upcoming_node:
        transit_nodes = [n for n in nodes if (n.node_type or "").upper() in ("FLIGHT", "TRAIN", "CAB")]
        upcoming_node = transit_nodes[0] if transit_nodes else nodes[0]

    node_type = (upcoming_node.node_type or "").upper()
    dest_city = resolve_destination_city(upcoming_node)
    loc = upcoming_node.location or ""
    title = upcoming_node.title or ""

    if node_type == "TRAIN":
        if dest_city:
            stop_name = f"{dest_city} Railway Station"
            stop_location = stop_name
            destination = dest_city
        elif loc and not loc.startswith("Platform"):
            stop_name = loc
            stop_location = loc
            destination = loc
        else:
            stop_name = title
            stop_location = loc or title
            destination = title
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "FLIGHT":
        if dest_city:
            stop_name = f"{dest_city} Airport"
            stop_location = stop_name
            destination = dest_city
        elif loc and not loc.startswith("Terminal"):
            stop_name = loc
            stop_location = loc
            destination = loc
        else:
            stop_name = title
            stop_location = loc or title
            destination = title
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "CAB":
        destination = dest_city or loc or title
        stop_name = loc or dest_city or title
        stop_location = loc or dest_city or title
        arrival_time = upcoming_node.end_time.isoformat()

    elif node_type == "HOTEL":
        destination = dest_city or loc or title
        stop_name = title
        stop_location = loc or title
        arrival_time = upcoming_node.start_time.isoformat()

    else:  # ACTIVITY or generic
        destination = dest_city or loc or title
        stop_name = title
        stop_location = loc or title
        arrival_time = upcoming_node.start_time.isoformat()

    return jsonify({
        "available": True,
        "trip_id": trip_id,
        "node_id": upcoming_node.id,
        "node_type": node_type,
        "name": stop_name,
        "location": stop_location,
        "destination": destination,
        "arrival_time": arrival_time,
        "latitude": None,
        "longitude": None
    }), 200

