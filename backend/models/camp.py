from datetime import datetime, timezone
from database import db

class Camp(db.Model):
    __tablename__ = 'camps'

    id = db.Column(db.Integer, primary_key=True)
    camp_name = db.Column(db.String(150), nullable=False)
    camp_date = db.Column(db.Date, nullable=False)
    location = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    organizer_name = db.Column(db.String(150), nullable=False)
    contact_number = db.Column(db.String(50), nullable=False)
    status = db.Column(db.String(50), default='Upcoming') # Upcoming, Active, Completed, Cancelled
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    creator = db.relationship('User', backref='created_camps')
    assignments = db.relationship('CampAssignment', back_populates='camp', cascade='all, delete-orphan')
    patients = db.relationship('Patient', back_populates='camp')

    def to_dict(self):
        return {
            "id": self.id,
            "camp_name": self.camp_name,
            "camp_date": self.camp_date.isoformat() if self.camp_date else None,
            "location": self.location,
            "description": self.description,
            "organizer_name": self.organizer_name,
            "contact_number": self.contact_number,
            "status": self.status,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "assignments": [a.to_dict() for a in self.assignments] if hasattr(self, 'assignments') else []
        }
