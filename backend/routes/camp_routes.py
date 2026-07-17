from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.camp_service import CampService

camp_bp = Blueprint('camp_bp', __name__)
camp_dashboard_bp = Blueprint('camp_dashboard_bp', __name__)

@camp_bp.route('', methods=['POST'])
@jwt_required()
def create_camp():
    user_id = get_jwt_identity()
    data = request.get_json()
    try:
        camp = CampService.create_camp(int(user_id), data)
        return jsonify(camp.to_dict()), 201
    except Exception as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

@camp_bp.route('', methods=['GET'])
@jwt_required()
def get_camps():
    camps = CampService.get_all_camps()
    return jsonify(camps), 200

@camp_bp.route('/<int:camp_id>', methods=['GET'])
@jwt_required()
def get_camp_details(camp_id):
    camp = CampService.get_camp(camp_id)
    if not camp:
        return jsonify({"error": "Not Found"}), 404
    return jsonify(camp.to_dict()), 200

@camp_bp.route('/<int:camp_id>', methods=['PUT'])
@jwt_required()
def update_camp(camp_id):
    data = request.get_json()
    try:
        camp = CampService.update_camp(camp_id, data)
        if not camp:
            return jsonify({"error": "Not Found"}), 404
        return jsonify(camp.to_dict()), 200
    except Exception as e:
        return jsonify({"error": "Bad Request", "message": str(e)}), 400

@camp_bp.route('/<int:camp_id>/status', methods=['PATCH'])
@jwt_required()
def update_camp_status(camp_id):
    data = request.get_json()
    status = data.get('status')
    camp = CampService.update_camp_status(camp_id, status)
    if not camp:
        return jsonify({"error": "Not Found"}), 404
    return jsonify(camp.to_dict()), 200

@camp_bp.route('/<int:camp_id>/assign', methods=['POST'])
@jwt_required()
def assign_user(camp_id):
    data = request.get_json()
    assignment = CampService.assign_user(camp_id, data)
    return jsonify(assignment.to_dict()), 201

@camp_bp.route('/<int:camp_id>/stats', methods=['GET'])
@jwt_required()
def get_camp_stats(camp_id):
    stats = CampService.get_camp_stats(camp_id)
    return jsonify(stats), 200

@camp_dashboard_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_dashboard_summary():
    summary = CampService.get_dashboard_summary()
    return jsonify(summary), 200
