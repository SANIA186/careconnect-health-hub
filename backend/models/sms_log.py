from datetime import datetime, timezone
from database import db

class SmsLog(db.Model):
    __tablename__ = 'sms_logs'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    phone_number = db.Column(db.String(20), nullable=False)
    message = db.Column(db.Text, nullable=False)
    sms_type = db.Column(db.String(50), nullable=False)  # PRESCRIPTION, FOLLOW_UP, CAMP_NOTIFICATION, CARE_ALERT
    status = db.Column(db.String(20), default='PENDING')  # PENDING, SENT, FAILED
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    patient = db.relationship('Patient', backref='sms_logs')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "phone_number": self.phone_number,
            "message": self.message,
            "sms_type": self.sms_type,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
