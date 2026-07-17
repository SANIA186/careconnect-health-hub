from datetime import date
from database import db
from models.consultation import Consultation
from models.patient import Patient
from services.sms_service import SmsService

class ReminderService:
    @staticmethod
    def generate_followup_reminders():
        """
        Find all consultations where follow_up_date <= today and
        follow_up_required is True, then generate reminder SMS logs.
        Returns list of SMS logs created.
        """
        today = date.today()
        pending_followups = Consultation.query.filter(
            Consultation.follow_up_required == True,
            Consultation.follow_up_date <= today,
            Consultation.consultation_status == 'Completed'
        ).all()

        logs = []
        for c in pending_followups:
            patient = db.session.get(Patient, c.patient_id)
            if not patient:
                continue
            message = (
                f"Dear {patient.full_name}, your follow-up visit is pending "
                f"(due: {c.follow_up_date.isoformat()}). "
                f"Please visit CareConnect NGO camp at your earliest convenience."
            )
            try:
                log = SmsService.send_sms(patient.id, message, 'FOLLOW_UP')
                logs.append(log.to_dict())
            except Exception:
                pass
        return logs
