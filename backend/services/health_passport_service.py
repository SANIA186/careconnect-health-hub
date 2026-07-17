from database import db
from models.patient import Patient
from models.consultation import Consultation
from models.prescription import Prescription
from models.medicine import Medicine
from models.dispense_history import DispenseHistory

class HealthPassportService:
    @staticmethod
    def get_health_passport(qr_token):
        patient = Patient.query.filter_by(qr_token=qr_token).first()
        if not patient:
            return None
        
        # Build visits from consultations
        visits = []
        for c in sorted(patient.consultations, key=lambda x: x.created_at, reverse=True):
            doctor_name = c.doctor.full_name if c.doctor else "Unknown"
            visits.append({
                "date": c.created_at.isoformat() if c.created_at else None,
                "doctor": doctor_name,
                "diagnosis": c.diagnosis,
                "notes": c.clinical_notes,
                "advice": c.advice,
                "status": c.consultation_status,
                "follow_up_date": c.follow_up_date.isoformat() if c.follow_up_date else None,
                "follow_up_required": c.follow_up_required,
                "referral_facility": c.referral_facility
            })
        
        # Build prescriptions from all consultations
        prescriptions = []
        for c in patient.consultations:
            for rx in c.prescriptions:
                med_name = rx.medicine.medicine_name if rx.medicine else f"Medicine #{rx.medicine_id}"
                prescriptions.append({
                    "consultation_date": c.created_at.isoformat() if c.created_at else None,
                    "medicine": med_name,
                    "dosage": rx.dosage,
                    "frequency": rx.frequency,
                    "duration": rx.duration,
                    "instructions": rx.instructions
                })
        
        # Medicines dispensed history
        dispense_records = DispenseHistory.query.filter_by(patient_id=patient.id).all()
        medicines_dispensed = []
        for d in dispense_records:
            med_name = d.medicine.medicine_name if d.medicine else f"Medicine #{d.medicine_id}"
            medicines_dispensed.append({
                "date": d.dispensed_date.isoformat() if d.dispensed_date else None,
                "medicine": med_name,
                "quantity": d.dispensed_quantity
            })
        
        # Follow-up details from the most recent consultation requiring follow-up
        follow_up_details = {}
        follow_ups = [c for c in patient.consultations if c.follow_up_required and c.follow_up_date]
        if follow_ups:
            latest_fu = max(follow_ups, key=lambda c: c.follow_up_date)
            follow_up_details = {
                "follow_up_date": latest_fu.follow_up_date.isoformat(),
                "doctor": latest_fu.doctor.full_name if latest_fu.doctor else "Unknown",
                "referral_facility": latest_fu.referral_facility,
                "referral_reason": latest_fu.referral_reason
            }
        
        patient_details = {
            "id": patient.id,
            "patient_code": patient.patient_code,
            "full_name": patient.full_name,
            "age": patient.age,
            "gender": patient.gender,
            "phone": patient.phone,
            "village": patient.village,
            "blood_group": patient.blood_group,
            "emergency_contact": patient.emergency_contact,
            "status": patient.status,
            "qr_token": patient.qr_token
        }
        
        return {
            "patient_details": patient_details,
            "visits": visits,
            "prescriptions": prescriptions,
            "medicines_dispensed": medicines_dispensed,
            "follow_up_details": follow_up_details
        }

    @staticmethod
    def get_patient_timeline(patient_id):
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return None
        
        timeline = []
        
        # Add consultation events
        for c in patient.consultations:
            doctor_name = c.doctor.full_name if c.doctor else "Unknown"
            timeline.append({
                "date": c.created_at.isoformat() if c.created_at else None,
                "type": "Consultation",
                "title": f"Consultation with Dr. {doctor_name}",
                "description": c.diagnosis or "General Consultation",
                "status": c.consultation_status
            })
            # Add prescription events under each consultation
            for rx in c.prescriptions:
                med_name = rx.medicine.medicine_name if rx.medicine else f"Medicine #{rx.medicine_id}"
                timeline.append({
                    "date": c.created_at.isoformat() if c.created_at else None,
                    "type": "Prescription",
                    "title": f"Prescribed: {med_name}",
                    "description": f"{rx.dosage} | {rx.frequency} | {rx.duration}",
                    "status": "Issued"
                })
        
        # Add medicine dispense events
        for d in DispenseHistory.query.filter_by(patient_id=patient_id).all():
            med_name = d.medicine.medicine_name if d.medicine else f"Medicine #{d.medicine_id}"
            timeline.append({
                "date": d.dispensed_date.isoformat() if d.dispensed_date else None,
                "type": "Medicine",
                "title": f"Dispensed: {med_name}",
                "description": f"{d.dispensed_quantity} unit(s) dispensed from pharmacy",
                "status": "Dispensed"
            })
        
        # Sort chronologically, most recent first
        timeline.sort(key=lambda x: x['date'] or '', reverse=True)
        return timeline
