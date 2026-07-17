import os
import logging
from flask import Flask, jsonify
from config import config_by_name
from database import db, migrate, jwt, cors, bcrypt
from routes.health import health_bp
from routes.auth import auth_bp
from routes.patient_routes import patient_bp
from routes.queue_routes import queue_bp
from routes.dashboard_routes import dashboard_bp
from routes.doctor_routes import doctor_bp
from routes.pharmacy_routes import pharmacy_bp
from models import User, Patient, Queue, Consultation, Prescription, Medicine
from sqlalchemy.exc import OperationalError, ProgrammingError
from datetime import datetime
def create_app(config_name=None):
    if config_name is None:
        config_name = os.environ.get('FLASK_ENV', 'development')
        
    app = Flask(__name__)
    app.config.from_object(config_by_name.get(config_name, config_by_name['development']))

    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    logger = logging.getLogger(__name__)
    logger.info(f"Starting app with {config_name} configuration")

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    bcrypt.init_app(app)

    # Register blueprints
    app.register_blueprint(health_bp, url_prefix='/api')
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(patient_bp, url_prefix='/api/patients')
    app.register_blueprint(queue_bp, url_prefix='/api/queue')
    app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    app.register_blueprint(doctor_bp, url_prefix='/api')
    app.register_blueprint(pharmacy_bp, url_prefix='/api/pharmacy')

    # Global error handlers
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({"error": "Bad Request", "message": str(error)}), 400

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "message": str(error)}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "message": str(error)}), 403

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not Found", "message": "The requested URL was not found on the server."}), 404

    @app.errorhandler(500)
    def internal_server_error(error):
        app.logger.error(f"Internal Server Error: {str(error)}")
        return jsonify({"error": "Internal Server Error", "message": "An unexpected error has occurred."}), 500

    # Seed data if DB is empty
    with app.app_context():
        try:
            if not User.query.first():
                admin = User(full_name='Admin User', email='admin@careconnect.org', role='Admin')
                admin.set_password('Admin@123')
                
                doctor = User(full_name='Doctor User', email='doctor@careconnect.org', role='Doctor')
                doctor.set_password('Doctor@123')
                
                volunteer = User(full_name='Volunteer User', email='volunteer@careconnect.org', role='Volunteer')
                volunteer.set_password('Volunteer@123')
                
                db.session.add_all([admin, doctor, volunteer])
                db.session.commit()
                app.logger.info("Seed data created successfully.")
            
            if not Medicine.query.first():
                paracetamol = Medicine(
                    medicine_name="Paracetamol",
                    category="Painkiller",
                    manufacturer="PharmaInc",
                    batch_number="B123",
                    expiry_date=datetime.strptime('2028-01-01', '%Y-%m-%d').date(),
                    stock_quantity=100,
                    unit="Tablets",
                    reorder_level=20
                )
                db.session.add(paracetamol)
                db.session.commit()
        except (OperationalError, ProgrammingError):
            pass

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000)
