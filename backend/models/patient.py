from datetime import datetime, timezone
from database import db

class Patient(db.Model):
    __tablename__ = 'patients'

    id = db.Column(db.Integer, primary_key=True)
    patient_code = db.Column(db.String(20), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    village = db.Column(db.String(100), nullable=False)
    address = db.Column(db.Text, nullable=False)
    blood_group = db.Column(db.String(10), nullable=True)
    emergency_contact = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(50), nullable=False, default='Waiting') # Waiting, In Consultation, Completed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    queues = db.relationship('Queue', back_populates='patient', cascade='all, delete-orphan')
    consultations = db.relationship('Consultation', back_populates='patient', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_code": self.patient_code,
            "full_name": self.full_name,
            "age": self.age,
            "gender": self.gender,
            "phone": self.phone,
            "village": self.village,
            "address": self.address,
            "blood_group": self.blood_group,
            "emergency_contact": self.emergency_contact,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "consultations": [c.to_dict() for c in self.consultations] if hasattr(self, 'consultations') else []
        }
