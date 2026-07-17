from datetime import datetime, timezone
from database import db

class Medicine(db.Model):
    __tablename__ = 'medicines'

    id = db.Column(db.Integer, primary_key=True)
    medicine_name = db.Column(db.String(150), nullable=False, index=True)
    category = db.Column(db.String(100), nullable=False)
    manufacturer = db.Column(db.String(150), nullable=True)
    batch_number = db.Column(db.String(50), nullable=True)
    expiry_date = db.Column(db.Date, nullable=False)
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    unit = db.Column(db.String(50), nullable=False)
    reorder_level = db.Column(db.Integer, nullable=False, default=10)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "id": self.id,
            "medicine_name": self.medicine_name,
            "category": self.category,
            "manufacturer": self.manufacturer,
            "batch_number": self.batch_number,
            "expiry_date": self.expiry_date.isoformat() if self.expiry_date else None,
            "stock_quantity": self.stock_quantity,
            "unit": self.unit,
            "reorder_level": self.reorder_level,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
