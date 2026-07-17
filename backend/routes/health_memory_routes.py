from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.health_memory_service import HealthMemoryService
from services.care_gap_service import CareGapService

health_memory_bp = Blueprint('health_memory_bp', __name__)

@health_memory_bp.route('/<int:patient_id>/health-memory', methods=['GET'])
@jwt_required()
def get_health_memory(patient_id):
    result = HealthMemoryService.reconstruct_health_memory(patient_id)
    if result is None:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify(result), 200

@health_memory_bp.route('/<int:patient_id>/care-gaps', methods=['GET'])
@jwt_required()
def get_care_gaps(patient_id):
    result = CareGapService.detect_care_gaps(patient_id)
    if result is None:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify(result), 200

@health_memory_bp.route('/<int:patient_id>/health-summary', methods=['GET'])
@jwt_required()
def get_health_summary(patient_id):
    health_memory = HealthMemoryService.reconstruct_health_memory(patient_id)
    if health_memory is None:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    care_gaps = CareGapService.detect_care_gaps(patient_id)
    return jsonify({
        "health_memory": health_memory,
        "care_gaps": care_gaps
    }), 200
