from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.queue_service import QueueService

dashboard_bp = Blueprint('dashboard_bp', __name__)

@dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    summary = QueueService.get_dashboard_summary()
    return jsonify(summary), 200
