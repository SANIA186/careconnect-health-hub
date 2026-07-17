from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.consultation_service import ConsultationService

doctor_bp = Blueprint('doctor_bp', __name__)

@doctor_bp.route('/consultations', methods=['POST'])
@jwt_required()
def create_consultation():
    doctor_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('patient_id'):
        return jsonify({"error": "Bad Request", "message": "patient_id is required"}), 400
        
    try:
        consultation = ConsultationService.start_consultation(int(doctor_id), data)
        return jsonify(consultation.to_dict()), 201
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@doctor_bp.route('/consultations/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_consultations(patient_id):
    history = ConsultationService.get_patient_history(patient_id)
    return jsonify(history), 200

@doctor_bp.route('/consultations/<int:consultation_id>', methods=['GET'])
@jwt_required()
def get_consultation_details(consultation_id):
    consultation = ConsultationService.get_consultation(consultation_id)
    if not consultation:
        return jsonify({"error": "Not Found", "message": "Consultation not found"}), 404
    return jsonify(consultation.to_dict()), 200

@doctor_bp.route('/consultations/<int:consultation_id>', methods=['PUT'])
@jwt_required()
def update_consultation(consultation_id):
    data = request.get_json()
    consultation = ConsultationService.update_consultation(consultation_id, data)
    if not consultation:
        return jsonify({"error": "Not Found", "message": "Consultation not found"}), 404
    return jsonify(consultation.to_dict()), 200

@doctor_bp.route('/consultations/<int:consultation_id>/complete', methods=['PATCH'])
@jwt_required()
def complete_consultation(consultation_id):
    consultation = ConsultationService.complete_consultation(consultation_id)
    if not consultation:
        return jsonify({"error": "Not Found", "message": "Consultation not found"}), 404
    return jsonify(consultation.to_dict()), 200

@doctor_bp.route('/prescriptions', methods=['POST'])
@jwt_required()
def create_prescription():
    data = request.get_json()
    if not data or not data.get('consultation_id'):
        return jsonify({"error": "Bad Request", "message": "consultation_id is required"}), 400
        
    prescription = ConsultationService.add_prescription(data.get('consultation_id'), data)
    return jsonify(prescription.to_dict()), 201

@doctor_bp.route('/prescriptions/<int:consultation_id>', methods=['GET'])
@jwt_required()
def get_prescriptions(consultation_id):
    prescriptions = ConsultationService.get_prescriptions(consultation_id)
    return jsonify(prescriptions), 200
