from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.patient_service import PatientService

patient_bp = Blueprint('patient_bp', __name__)

@patient_bp.route('', methods=['POST'])
@jwt_required()
def create_patient():
    data = request.get_json()
    required_fields = ['full_name', 'age', 'gender', 'phone', 'village', 'address']
    
    if not data or not all(field in data for field in required_fields):
        return jsonify({"error": "Bad Request", "message": "Missing required fields"}), 400
        
    try:
        patient = PatientService.create_patient(data)
        return jsonify({
            "patient_id": patient.id,
            "patient_code": patient.patient_code,
            "message": "Patient registered successfully"
        }), 201
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@patient_bp.route('', methods=['GET'])
@jwt_required()
def get_patients():
    patients = PatientService.get_all_patients()
    return jsonify([p.to_dict() for p in patients]), 200

@patient_bp.route('/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient(patient_id):
    patient = PatientService.get_patient_by_id(patient_id)
    if not patient:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify(patient.to_dict()), 200

@patient_bp.route('/<int:patient_id>', methods=['PUT'])
@jwt_required()
def update_patient(patient_id):
    data = request.get_json()
    patient = PatientService.update_patient(patient_id, data)
    if not patient:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify(patient.to_dict()), 200

@patient_bp.route('/<int:patient_id>', methods=['DELETE'])
@jwt_required()
def delete_patient(patient_id):
    success = PatientService.delete_patient(patient_id)
    if not success:
        return jsonify({"error": "Not Found", "message": "Patient not found"}), 404
    return jsonify({"message": "Patient deleted successfully"}), 200
