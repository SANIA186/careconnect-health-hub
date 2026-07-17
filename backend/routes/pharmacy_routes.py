from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.pharmacy_service import PharmacyService

pharmacy_bp = Blueprint('pharmacy_bp', __name__)

@pharmacy_bp.route('/queue', methods=['GET'])
@jwt_required()
def get_pharmacy_queue():
    queue = PharmacyService.get_pharmacy_queue()
    return jsonify(queue), 200

@pharmacy_bp.route('/medicines', methods=['GET'])
@jwt_required()
def get_medicines():
    medicines = PharmacyService.get_all_medicines()
    return jsonify(medicines), 200

@pharmacy_bp.route('/dispense', methods=['POST'])
@jwt_required()
def dispense_medicine():
    data = request.get_json()
    if not data or not data.get('prescription_id'):
        return jsonify({"error": "Bad Request", "message": "prescription_id is required"}), 400
        
    try:
        history = PharmacyService.dispense_medicine(data)
        return jsonify(history.to_dict()), 200
    except ValueError as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Internal Server Error", "message": str(e)}), 500

@pharmacy_bp.route('/queue/<int:queue_id>/complete', methods=['PATCH'])
@jwt_required()
def complete_pharmacy_visit(queue_id):
    queue_item = PharmacyService.complete_pharmacy_visit(queue_id)
    if not queue_item:
        return jsonify({"error": "Not Found", "message": "Queue item not found or not in Pharmacy"}), 404
    return jsonify({"message": "Pharmacy visit completed", "queue_item": queue_item.to_dict()}), 200
