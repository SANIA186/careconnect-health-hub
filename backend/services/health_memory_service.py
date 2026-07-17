from datetime import datetime, timezone, date
from database import db
from models.patient import Patient
from models.consultation import Consultation
from models.prescription import Prescription
from models.dispense_history import DispenseHistory

class HealthMemoryService:
    @staticmethod
    def reconstruct_health_memory(patient_id):
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return None

        consultations = sorted(patient.consultations, key=lambda c: c.created_at)
        total_visits = len(consultations)

        # Medical timeline
        medical_timeline = []
        for c in consultations:
            doctor_name = c.doctor.full_name if c.doctor else "Unknown"
            medical_timeline.append({
                "date": c.created_at.isoformat() if c.created_at else None,
                "event": "Consultation",
                "details": f"Dr. {doctor_name} | Diagnosis: {c.diagnosis or 'N/A'} | Status: {c.consultation_status}"
            })
            for rx in c.prescriptions:
                med_name = rx.medicine.medicine_name if rx.medicine else f"Medicine #{rx.medicine_id}"
                medical_timeline.append({
                    "date": c.created_at.isoformat() if c.created_at else None,
                    "event": "Prescription",
                    "details": f"{med_name} | {rx.dosage or ''} | {rx.frequency or ''} | {rx.duration or ''}"
                })

        dispense_records = DispenseHistory.query.filter_by(patient_id=patient_id).all()
        for d in dispense_records:
            med_name = d.medicine.medicine_name if d.medicine else f"Medicine #{d.medicine_id}"
            medical_timeline.append({
                "date": d.dispensed_date.isoformat() if d.dispensed_date else None,
                "event": "Medicine Dispensed",
                "details": f"{med_name} x {d.dispensed_quantity} units"
            })

        # Sort chronologically
        medical_timeline.sort(key=lambda x: x['date'] or '')

        # Previous conditions (distinct, non-null diagnoses)
        previous_conditions = list({
            c.diagnosis for c in consultations
            if c.diagnosis and c.diagnosis.strip()
        })

        # Medicine history
        med_map = {}
        for c in consultations:
            for rx in c.prescriptions:
                med_name = rx.medicine.medicine_name if rx.medicine else f"Medicine #{rx.medicine_id}"
                last_dispense = DispenseHistory.query.filter_by(
                    medicine_id=rx.medicine_id, patient_id=patient_id
                ).order_by(DispenseHistory.dispensed_date.desc()).first()

                med_map[med_name] = {
                    "medicine": med_name,
                    "usage": f"{rx.dosage or ''} | {rx.frequency or ''} | {rx.duration or ''}".strip(' |'),
                    "last_taken": last_dispense.dispensed_date.isoformat() if last_dispense else "Not dispensed"
                }
        medicines_history = list(med_map.values())

        # Follow-up status
        follow_up_completed = 0
        follow_up_pending = 0
        today = date.today()
        for c in consultations:
            if c.follow_up_required and c.follow_up_date:
                if c.follow_up_date < today:
                    follow_up_pending += 1
                else:
                    follow_up_completed += 1

        # Natural-language patient summary
        last_consultation = consultations[-1] if consultations else None
        last_date = last_consultation.created_at.strftime('%Y-%m-%d') if last_consultation else "N/A"
        conditions_text = ", ".join(previous_conditions) if previous_conditions else "no recorded conditions"
        follow_note = "Follow-up pending." if follow_up_pending > 0 else "No pending follow-ups."

        patient_summary = (
            f"Patient visited {total_visits} time(s). "
            f"Previous complaints include {conditions_text}. "
            f"Last consultation was on {last_date}. "
            f"{follow_note}"
        )

        return {
            "patient_summary": patient_summary,
            "total_visits": total_visits,
            "medical_timeline": medical_timeline,
            "previous_conditions": previous_conditions,
            "medicines_history": medicines_history,
            "follow_up_status": {
                "completed": follow_up_completed,
                "pending": follow_up_pending
            }
        }
