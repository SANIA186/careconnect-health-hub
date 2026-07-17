from datetime import datetime, timezone, date, timedelta
from database import db
from models.patient import Patient
from models.consultation import Consultation
from models.dispense_history import DispenseHistory

class CareGapService:
    @staticmethod
    def detect_care_gaps(patient_id):
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return None

        gaps = []
        today = date.today()

        consultations = sorted(patient.consultations, key=lambda c: c.created_at)

        # --- Rule A: Missed Follow-up ---
        for c in consultations:
            if c.follow_up_required and c.follow_up_date:
                if c.follow_up_date < today:
                    gaps.append({
                        "type": "MISSED_FOLLOWUP",
                        "severity": "HIGH",
                        "message": f"Patient missed scheduled follow-up on {c.follow_up_date.isoformat()}.",
                        "context": {
                            "consultation_id": c.id,
                            "due_date": c.follow_up_date.isoformat(),
                            "diagnosis": c.diagnosis
                        }
                    })

        # --- Rule B: Long Gap Between Visits (180 days) ---
        if consultations:
            last_visit = consultations[-1].created_at
            # Make offset-aware for comparison
            if last_visit.tzinfo is None:
                last_visit = last_visit.replace(tzinfo=timezone.utc)
            days_since_last_visit = (datetime.now(timezone.utc) - last_visit).days
            if days_since_last_visit > 180:
                gaps.append({
                    "type": "LONG_VISIT_GAP",
                    "severity": "MEDIUM",
                    "message": f"Patient has no health checkup in the last {days_since_last_visit} days.",
                    "context": {
                        "last_visit_date": consultations[-1].created_at.isoformat(),
                        "days_since_last_visit": days_since_last_visit
                    }
                })
        else:
            # Never visited
            if patient.created_at:
                registered_on = patient.created_at
                if registered_on.tzinfo is None:
                    registered_on = registered_on.replace(tzinfo=timezone.utc)
                days_since_registration = (datetime.now(timezone.utc) - registered_on).days
                if days_since_registration > 180:
                    gaps.append({
                        "type": "LONG_VISIT_GAP",
                        "severity": "MEDIUM",
                        "message": "Patient has no consultation records at all.",
                        "context": {"days_registered": days_since_registration}
                    })

        # --- Rule C: Medicine Continuation Gap ---
        # Check each prescription — if no dispense history exists, flag it
        for c in consultations:
            for rx in c.prescriptions:
                dispense_record = DispenseHistory.query.filter_by(
                    prescription_id=rx.id,
                    patient_id=patient_id
                ).first()
                if not dispense_record:
                    med_name = rx.medicine.medicine_name if rx.medicine else f"Medicine #{rx.medicine_id}"
                    gaps.append({
                        "type": "MEDICINE_GAP",
                        "severity": "MEDIUM",
                        "message": f"Medicine continuation may require review: {med_name} was prescribed but never dispensed.",
                        "context": {
                            "prescription_id": rx.id,
                            "medicine": med_name,
                            "consultation_id": c.id,
                            "prescribed_date": c.created_at.isoformat() if c.created_at else None
                        }
                    })

        return gaps
