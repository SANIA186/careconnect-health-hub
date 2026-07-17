from datetime import datetime, timezone
from database import db

class Queue(db.Model):
    __tablename__ = 'queues'

    id = db.Column(db.Integer, primary_key=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False)
    token_number = db.Column(db.Integer, nullable=False)
    queue_position = db.Column(db.Integer, nullable=False)
    priority = db.Column(db.String(20), nullable=False, default='Normal') # Normal, Urgent, Emergency
    queue_status = db.Column(db.String(50), nullable=False, default='Waiting') # Waiting, In Consultation, Completed
    estimated_wait_time = db.Column(db.Integer, nullable=True) # in minutes
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    patient = db.relationship('Patient', back_populates='queues')

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "token_number": self.token_number,
            "queue_position": self.queue_position,
            "priority": self.priority,
            "queue_status": self.queue_status,
            "estimated_wait_time": self.estimated_wait_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "patient": self.patient.to_dict() if self.patient else None
        }
