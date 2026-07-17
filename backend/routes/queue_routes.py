from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from services.queue_service import QueueService

queue_bp = Blueprint('queue_bp', __name__)

@queue_bp.route('', methods=['GET'])
@jwt_required()
def get_queue():
    queue = QueueService.get_current_queue()
    return jsonify([q.to_dict() for q in queue]), 200

@queue_bp.route('/today', methods=['GET'])
@jwt_required()
def get_today_queue():
    queue = QueueService.get_today_queue()
    return jsonify([q.to_dict() for q in queue]), 200

@queue_bp.route('/<int:queue_id>/status', methods=['PATCH'])
@jwt_required()
def update_queue_status(queue_id):
    data = request.get_json()
    if not data or 'status' not in data:
        return jsonify({"error": "Bad Request", "message": "Status is required"}), 400
        
    status = data.get('status')
    if status not in ['Waiting', 'In Consultation', 'Completed']:
        return jsonify({"error": "Bad Request", "message": "Invalid status"}), 400
        
    queue_item = QueueService.update_queue_status(queue_id, status)
    if not queue_item:
        return jsonify({"error": "Not Found", "message": "Queue item not found"}), 404
        
    return jsonify(queue_item.to_dict()), 200
