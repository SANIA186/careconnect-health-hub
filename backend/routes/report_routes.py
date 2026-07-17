from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required
from services.report_service import ReportService

report_bp = Blueprint('report_bp', __name__)

@report_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_overview():
    return jsonify(ReportService.get_overview()), 200

@report_bp.route('/patients', methods=['GET'])
@jwt_required()
def get_patient_report():
    return jsonify(ReportService.get_patient_report()), 200

@report_bp.route('/consultations', methods=['GET'])
@jwt_required()
def get_consultation_report():
    return jsonify(ReportService.get_consultation_report()), 200

@report_bp.route('/medicine', methods=['GET'])
@jwt_required()
def get_medicine_report():
    return jsonify(ReportService.get_medicine_report()), 200

@report_bp.route('/camps', methods=['GET'])
@jwt_required()
def get_camp_report():
    return jsonify(ReportService.get_camp_report()), 200

@report_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def get_admin_dashboard():
    return jsonify(ReportService.get_admin_dashboard()), 200
