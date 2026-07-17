from datetime import datetime, timezone
from database import db

class Consultation(db.Model):
    __tablename__ = 'consultations'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    doctor_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    diagnosis = db.Column(db.Text, nullable=True)
    clinical_notes = db.Column(db.Text, nullable=True)
    advice = db.Column(db.Text, nullable=True)
    follow_up_date = db.Column(db.Date, nullable=True)
    follow_up_required = db.Column(db.Boolean, default=False)
    
    referral_facility = db.Column(db.String(255), nullable=True)
    referral_reason = db.Column(db.Text, nullable=True)
    urgency_level = db.Column(db.String(50), nullable=True)
    
    consultation_status = db.Column(db.String(50), default='Started') # Started, Completed
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    patient = db.relationship('Patient', back_populates='consultations')
    doctor = db.relationship('User', backref='consultations')
    prescriptions = db.relationship('Prescription', back_populates='consultation', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "doctor_id": self.doctor_id,
            "diagnosis": self.diagnosis,
            "clinical_notes": self.clinical_notes,
            "advice": self.advice,
            "follow_up_date": self.follow_up_date.isoformat() if self.follow_up_date else None,
            "follow_up_required": self.follow_up_required,
            "referral_facility": self.referral_facility,
            "referral_reason": self.referral_reason,
            "urgency_level": self.urgency_level,
            "consultation_status": self.consultation_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "prescriptions": [p.to_dict() for p in self.prescriptions]
        }
