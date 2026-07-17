from datetime import datetime, timezone
from database import db

class CampAssignment(db.Model):
    __tablename__ = 'camp_assignments'

    id = db.Column(db.Integer, primary_key=True)
    camp_id = db.Column(db.Integer, db.ForeignKey('camps.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(50), nullable=False) # Doctor, Volunteer
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    camp = db.relationship('Camp', back_populates='assignments')
    user = db.relationship('User', backref='camp_assignments')

    def to_dict(self):
        return {
            "id": self.id,
            "camp_id": self.camp_id,
            "user_id": self.user_id,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "user_name": self.user.full_name if self.user else None
        }
