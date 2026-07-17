import uuid
from datetime import datetime, timezone
from database import db
from models.patient import Patient

class QRService:
    @staticmethod
    def generate_qr_token(patient):
        """Generate a unique QR token for a patient in the format CARE-P-XXXX-RANDOM"""
        unique_suffix = uuid.uuid4().hex[:6].upper()
        token = f"CARE-{patient.patient_code}-{unique_suffix}"
        return token

    @staticmethod
    def generate_qr_for_patient(patient_id):
        patient = db.session.get(Patient, patient_id)
        if not patient:
            raise ValueError("Patient not found")
        
        # Generate a fresh token even if one already exists (re-generate)
        token = QRService.generate_qr_token(patient)
        patient.qr_token = token
        patient.qr_created_at = datetime.now(timezone.utc)
        db.session.commit()
        
        return {
            "patient_id": patient.id,
            "patient_code": patient.patient_code,
            "patient_name": patient.full_name,
            "qr_token": token,
            "qr_created_at": patient.qr_created_at.isoformat()
        }
