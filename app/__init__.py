import os
import threading
from flask import Flask
from flask_cors import CORS
from flasgger import Swagger
from app.core.db import db, migrate
from app.routers.trips import trips_bp
from app.routers.nodes import nodes_bp
from app.routers.risk import risk_bp

# How often the background Risk Radar scheduler recomputes every trip's
# proactive risk scores (seconds). Kept short so a live demo visibly shows
# the "background model thinking" without hammering the DB.
RISK_REFRESH_INTERVAL_SECONDS = 45

def create_app(test_config=None):
    app = Flask(__name__)
    
    # Configure CORS safely for deployed Vercel frontend and local development
    allowed_origins = [
        "https://trip-res-q.vercel.app",
        r"^https:\/\/trip-res-q.*\.vercel\.app$",
        r"^http:\/\/localhost:\d+$",
        r"^http:\/\/127\.0\.0\.1:\d+$",
    ]
    cors_env = os.environ.get("CORS_ORIGINS")
    if cors_env:
        for o in cors_env.split(","):
            if o.strip():
                allowed_origins.append(o.strip())

    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        allow_headers=["Content-Type", "Authorization", "X-Requested-With"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"]
    )
    
    # Initialize Swagger API Documentation
    swagger_config = {
        "headers": [],
        "specs": [
            {
                "endpoint": 'apispec_1',
                "route": '/apispec_1.json',
                "rule_filter": lambda rule: True,  # all in
                "model_filter": lambda tag: True,  # all in
            }
        ],
        "static_url_path": "/flasgger_static",
        "swagger_ui": True,
        "specs_route": "/api/docs"
    }
    Swagger(app, config=swagger_config)
    
    if test_config is None:
        db_path = os.path.join(app.instance_path, 'tripresq.sqlite')
        app.config.from_mapping(
            SECRET_KEY='dev',
            SQLALCHEMY_DATABASE_URI=f'sqlite:///{db_path}',
            SQLALCHEMY_TRACK_MODIFICATIONS=False,
        )
    else:
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    db.init_app(app)
    migrate.init_app(app, db)
    
    # Import models so they are registered with SQLAlchemy
    with app.app_context():
        from app import models
        db.create_all()
        if not app.config.get("TESTING"):
            try:
                from app.mock_data.seed import demo_trip_exists, seed_demo_trip
                if not demo_trip_exists():
                    seed_demo_trip(force=False)
            except Exception as e:
                app.logger.warning(f"Initial demo trip seeding skipped: {e}")
        
    from app.routers.trips import trips_bp
    from app.routers.nodes import nodes_bp
    from app.routers.cohort import cohort_bp
    from app.routers.risk import risk_bp

    app.register_blueprint(trips_bp)
    app.register_blueprint(nodes_bp)
    app.register_blueprint(cohort_bp)
    app.register_blueprint(risk_bp)
        
    @app.route('/health')
    def health():
        return {'status': 'ok'}

    @app.route('/api/seed-demo', methods=['POST'])
    def seed_demo():
        """
        Seed the deterministic demo trip into the database.
        ---
        tags:
          - Demo
        parameters:
          - in: body
            name: body
            schema:
              type: object
              properties:
                force:
                  type: boolean
                  default: false
        responses:
          200:
            description: Demo trip seeded
        """
        from flask import request, jsonify
        from app.mock_data import seed_demo_trip
        data = request.get_json(silent=True) or {}
        force = data.get('force', False)
        result = seed_demo_trip(force=force)

        from app.models.trip import Trip
        from app.models.node import ItineraryNode
        from app.models.edge import DependencyEdge

        trip_id = result["trip_id"]
        trip = db.session.get(Trip, trip_id)
        nodes = ItineraryNode.query.filter_by(trip_id=trip_id).order_by(
            ItineraryNode.start_time
        ).all()
        node_ids = [n.id for n in nodes]
        edges = DependencyEdge.query.filter(
            DependencyEdge.source_node_id.in_(node_ids)
        ).all()

        node_list = []
        for n in nodes:
            nd = {
                "id": n.id,
                "type": n.node_type,
                "title": n.title,
                "location": n.location,
                "start_time": n.start_time.isoformat(),
                "end_time": n.end_time.isoformat(),
                "status": n.status,
            }
            if n.hard_cutoff:
                nd["hard_cutoff"] = n.hard_cutoff.isoformat()
            node_list.append(nd)

        edge_list = [{
            "id": e.id,
            "source": e.source_node_id,
            "target": e.target_node_id,
            "min_buffer_minutes": e.min_buffer_minutes,
            "constraint_type": e.constraint_type,
        } for e in edges]

        return jsonify({
            "message": "Demo trip seeded successfully",
            "trip_id": trip_id,
            "trip_name": result["trip_name"],
            "already_existed": result["already_existed"],
            "graph": {
                "trip_id": trip_id,
                "trip_name": result["trip_name"],
                "nodes": node_list,
                "edges": edge_list,
            }
        }), 200

    _start_risk_radar_scheduler(app)

    return app


def _start_risk_radar_scheduler(app):
    """
    Background Risk Radar scheduler.

    This is what makes the risk model *proactive* instead of reactive: it
    keeps recomputing the Confidence Score / Risk Radar for every trip in
    the DB on a fixed interval, in a daemon thread, independent of any
    request. The frontend then just polls the cheap cached
    /risk-radar endpoint instead of triggering a recompute on every call.

    Guarded so it only starts once per real process (the Flask reloader
    spawns a duplicate process in debug mode which sets WERKZEUG_RUN_MAIN).
    """
    if app.config.get('TESTING'):
        return
    if app.debug and os.environ.get('WERKZEUG_RUN_MAIN') != 'true':
        # Flask's debug reloader spawns a parent watcher + a child process;
        # only the child (the one actually serving requests) should run this.
        return
    if getattr(app, '_risk_scheduler_started', False):
        return
    app._risk_scheduler_started = True

    from app.services.risk import refresh_all_trips_risk_cache

    def _loop():
        while True:
            refresh_all_trips_risk_cache(app)
            threading.Event().wait(RISK_REFRESH_INTERVAL_SECONDS)

    thread = threading.Thread(target=_loop, name="risk-radar-scheduler", daemon=True)
    thread.start()