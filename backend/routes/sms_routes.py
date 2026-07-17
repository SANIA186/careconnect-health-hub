from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.sms_service import SmsService
from services.reminder_service import ReminderService
from models.camp import Camp
from models.patient import Patient

sms_bp = Blueprint('sms_bp', __name__)

@sms_bp.route('/logs', methods=['GET'])
@jwt_required()
def get_sms_logs():
    logs = SmsService.get_all_logs()
    return jsonify(logs), 200

@sms_bp.route('/send', methods=['POST'])
@jwt_required()
def send_sms():
    data = request.get_json()
    patient_id = data.get('patient_id')
    message = data.get('message')
    sms_type = data.get('sms_type', 'CARE_ALERT')

    if not patient_id or not message:
        return jsonify({"error": "Bad Request", "message": "patient_id and message are required"}), 400

    try:
        log = SmsService.send_sms(int(patient_id), message, sms_type)
        return jsonify(log.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": "Not Found", "message": str(e)}), 404
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@sms_bp.route('/camp-notification', methods=['POST'])
@jwt_required()
def send_camp_notification():
    data = request.get_json()
    camp_id = data.get('camp_id')
    message = data.get('message')

    if not camp_id or not message:
        return jsonify({"error": "Bad Request", "message": "camp_id and message are required"}), 400

    camp = Camp.query.get(camp_id)
    if not camp:
        return jsonify({"error": "Not Found", "message": "Camp not found"}), 404

    patients = Patient.query.filter_by(camp_id=camp_id).all()
    if not patients:
        return jsonify({"message": "No patients registered under this camp", "sent": 0}), 200

    patient_ids = [p.id for p in patients]
    logs = SmsService.send_camp_notification(camp, patient_ids, message)
    return jsonify({"message": f"Notifications queued for {len(logs)} patients", "sent": len(logs), "logs": logs}), 201

@sms_bp.route('/patient/<int:patient_id>', methods=['GET'])
@jwt_required()
def get_patient_sms(patient_id):
    logs = SmsService.get_patient_logs(patient_id)
    return jsonify(logs), 200

@sms_bp.route('/followup-reminders', methods=['POST'])
@jwt_required()
def trigger_followup_reminders():
    """Manually trigger follow-up reminder generation."""
    logs = ReminderService.generate_followup_reminders()
    return jsonify({"message": f"{len(logs)} reminder(s) generated", "reminders": logs}), 201
