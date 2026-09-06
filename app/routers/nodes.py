from flask import Blueprint, request, jsonify
from datetime import datetime
from app.core.db import db
from app.models.node import ItineraryNode, NodeType, NodeStatus
from app.models.trip import Trip
from app.services.linker import run_auto_linker

nodes_bp = Blueprint('nodes', __name__, url_prefix='/api/nodes')

@nodes_bp.route('', methods=['POST'])
def add_node():
    """
    Ingest a new node into a trip
    ---
    tags:
      - Nodes
    parameters:
      - in: body
        name: body
        schema:
          type: object
          properties:
            trip_id:
              type: string
            node_type:
              type: string
              enum: [FLIGHT, TRAIN, CAB, HOTEL, ACTIVITY]
            title:
              type: string
            start_time:
              type: string
            end_time:
              type: string
            hard_cutoff:
              type: string
    responses:
      201:
        description: Node added successfully
    """
    data = request.get_json()
    required_fields = ['trip_id', 'node_type', 'title', 'start_time', 'end_time']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"{field} is required"}), 400
            
    # Validate trip exists
    trip = db.session.get(Trip, data['trip_id'])
    if not trip:
        return jsonify({"error": "Trip not found"}), 404
        
    try:
        start_dt = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_dt = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({"error": "Invalid date format, use ISO 8601"}), 400

    node = ItineraryNode(
        trip_id=data['trip_id'],
        node_type=data['node_type'],
        title=data['title'],
        location=data.get('location'),
        origin=data.get('origin'),
        destination=data.get('destination'),
        operator=data.get('operator'),
        service_number=data.get('service_number'),
        start_time=start_dt,
        end_time=end_dt,
        buffer_time=data.get('buffer_time', 0),
        status=NodeStatus.OK.value
    )
    
    if 'hard_cutoff' in data and data['hard_cutoff']:
        try:
            node.hard_cutoff = datetime.fromisoformat(data['hard_cutoff'].replace('Z', '+00:00'))
        except ValueError:
            pass

    try:
        db.session.add(node)
        db.session.commit()
        
        # Run dynamic auto-linker engine
        run_auto_linker(data['trip_id'])
        
        return jsonify({
            "id": node.id,
            "message": "Node added successfully, graph dependencies dynamically recalculated."
        }), 201
    except Exception as e:
        db.session.rollback()
        import logging
        logging.getLogger(__name__).exception("Database error while adding node")
        return jsonify({
            "error": "Failed to add node",
            "message": str(e),
            "type": type(e).__name__
        }), 500
