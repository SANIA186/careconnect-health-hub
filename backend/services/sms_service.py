import os
from twilio.rest import Client
from twilio.base.exceptions import TwilioRestException
from database import db
from models.sms_log import SmsLog
from models.patient import Patient

class SmsService:
    @staticmethod
    def send_sms(patient_id, message, sms_type):
        """
        Sends an SMS using Twilio and logs it.
        """
        patient = db.session.get(Patient, patient_id)
        if not patient:
            raise ValueError(f"Patient {patient_id} not found")

        account_sid = os.environ.get('TWILIO_ACCOUNT_SID')
        auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
        twilio_number = os.environ.get('TWILIO_PHONE_NUMBER')

        if not account_sid or not auth_token or not twilio_number:
            log = SmsLog(
                patient_id=patient_id,
                phone_number=patient.phone,
                message=message,
                sms_type=sms_type,
                status='CREDENTIALS_MISSING'
            )
            db.session.add(log)
            db.session.commit()
            return log

        try:
            client = Client(account_sid, auth_token)
            
            # Note: Twilio requires phones in E.164 format (e.g. +1234567890)
            # We assume patient.phone is correctly formatted or we just try sending
            twilio_msg = client.messages.create(
                body=message,
                from_=twilio_number,
                to=patient.phone
            )
            
            log = SmsLog(
                patient_id=patient_id,
                phone_number=patient.phone,
                message=message,
                sms_type=sms_type,
                status='SMS Sent Successfully'
            )
        except TwilioRestException as e:
            print(f"Twilio error: {e}")
            log = SmsLog(
                patient_id=patient_id,
                phone_number=patient.phone,
                message=message,
                sms_type=sms_type,
                status='SMS Failed'
            )
        except Exception as e:
            print(f"Unknown SMS error: {e}")
            log = SmsLog(
                patient_id=patient_id,
                phone_number=patient.phone,
                message=message,
                sms_type=sms_type,
                status='SMS Failed'
            )

        db.session.add(log)
        db.session.commit()
        return log

    @staticmethod
    def get_all_logs(limit=100):
        logs = SmsLog.query.order_by(SmsLog.created_at.desc()).limit(limit).all()
        return [l.to_dict() for l in logs]

    @staticmethod
    def get_patient_logs(patient_id):
        logs = SmsLog.query.filter_by(patient_id=patient_id).order_by(SmsLog.created_at.desc()).all()
        return [l.to_dict() for l in logs]

    @staticmethod
    def send_prescription_sms(patient):
        """Auto-called when prescription is created."""
        message = (
            f"Dear {patient.full_name}, your prescription has been generated. "
            f"Please collect medicines from CareConnect pharmacy."
        )
        return SmsService.send_sms(patient.id, message, 'PRESCRIPTION')

    @staticmethod
    def send_camp_notification(camp, patient_ids, message):
        """Notify all patients in a camp."""
        logs = []
        for patient_id in patient_ids:
            try:
                log = SmsService.send_sms(patient_id, message, 'CAMP_NOTIFICATION')
                logs.append(log.to_dict())
            except ValueError:
                pass
        return logs
