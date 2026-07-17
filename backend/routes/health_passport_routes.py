from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.qr_service import QRService
from services.health_passport_service import HealthPassportService

health_passport_bp = Blueprint('health_passport_bp', __name__)

@health_passport_bp.route('/patients/<int:patient_id>/generate-qr', methods=['POST'])
@jwt_required()
def generate_qr(patient_id):
    try:
        result = QRService.generate_qr_for_patient(patient_id)
        return jsonify(result), 200
    except ValueError as e:
        return jsonify({"error": "Not Found", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@health_passport_bp.route('/health-passport/<qr_token>', methods=['GET'])
@jwt_required()
def get_health_passport(qr_token):
    passport = HealthPassportService.get_health_passport(qr_token)
    if not passport:
        return jsonify({"error": "Not Found", "message": "No patient found for this QR token"}), 404
    return jsonify(passport), 200

@health_passport_bp.route('/patients/<int:patient_id>/history', methods=['GET'])
@jwt_required()
def get_patient_timeline(patient_id):
    timeline = HealthPassportService.get_patient_timeline(patient_id)
    if timeline is None:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify(timeline), 200
