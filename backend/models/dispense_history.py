from datetime import datetime, timezone
from database import db

class DispenseHistory(db.Model):
    __tablename__ = 'dispense_histories'

    id = db.Column(db.Integer, primary_key=True)
    prescription_id = db.Column(db.Integer, db.ForeignKey('prescriptions.id'), nullable=False)
    medicine_id = db.Column(db.Integer, db.ForeignKey('medicines.id'), nullable=False)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    dispensed_quantity = db.Column(db.Integer, nullable=False)
    dispensed_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    sms_payload = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    prescription = db.relationship('Prescription', backref='dispense_records')
    medicine = db.relationship('Medicine', backref='dispense_records')
    patient = db.relationship('Patient', backref='dispense_records')

    def to_dict(self):
        return {
            "id": self.id,
            "prescription_id": self.prescription_id,
            "medicine_id": self.medicine_id,
            "patient_id": self.patient_id,
            "dispensed_quantity": self.dispensed_quantity,
            "dispensed_date": self.dispensed_date.isoformat() if self.dispensed_date else None,
            "sms_payload": self.sms_payload,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
