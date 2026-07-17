from datetime import datetime, timezone
from database import db

class Prescription(db.Model):
    __tablename__ = 'prescriptions'

    id = db.Column(db.Integer, primary_key=True)
    consultation_id = db.Column(db.Integer, db.ForeignKey('consultations.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=True)
    dosage = db.Column(db.String(100), nullable=True)
    frequency = db.Column(db.String(100), nullable=True)
    duration = db.Column(db.String(50), nullable=True)
    instructions = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    consultation = db.relationship('Consultation', back_populates='prescriptions')
    medicine = db.relationship('Medicine', backref='prescriptions')

    def to_dict(self):
        return {
            "id": self.id,
            "consultation_id": self.consultation_id,
            "medicine_id": self.medicine_id,
            "dosage": self.dosage,
            "frequency": self.frequency,
            "duration": self.duration,
            "instructions": self.instructions,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
