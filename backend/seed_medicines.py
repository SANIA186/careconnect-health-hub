from app import create_app
from database import db
from models.medicine import Medicine
from datetime import datetime

def seed_medicines():
    app = create_app('development')
    with app.app_context():
        essential_meds = [
            {
                "name": "Amoxicillin",
                "category": "Antibiotic",
                "manufacturer": "PharmaInc",
                "batch": "B1001",
                "stock": 200,
                "unit": "Capsules",
                "reorder": 50
            },
            {
                "name": "Ibuprofen",
                "category": "Painkiller",
                "manufacturer": "HealthCorp",
                "batch": "B1002",
                "stock": 150,
                "unit": "Tablets",
                "reorder": 30
            },
            {
                "name": "Cetirizine",
                "category": "Antihistamine",
                "manufacturer": "MedLife",
                "batch": "B1003",
                "stock": 100,
                "unit": "Tablets",
                "reorder": 20
            },
            {
                "name": "ORS Packets",
                "category": "Supplement",
                "manufacturer": "HydraTech",
                "batch": "B1004",
                "stock": 300,
                "unit": "Packets",
                "reorder": 100
            },
            {
                "name": "Multivitamins",
                "category": "Supplement",
                "manufacturer": "VitaCorp",
                "batch": "B1005",
                "stock": 150,
                "unit": "Tablets",
                "reorder": 40
            },
            {
                "name": "Antacid",
                "category": "Gastrointestinal",
                "manufacturer": "StomachCare",
                "batch": "B1006",
                "stock": 120,
                "unit": "Bottles",
                "reorder": 25
            }
        ]
        
        for m in essential_meds:
            existing = Medicine.query.filter_by(medicine_name=m["name"]).first()
            if not existing:
                new_med = Medicine(
                    medicine_name=m["name"],
                    category=m["category"],
                    manufacturer=m["manufacturer"],
                    batch_number=m["batch"],
                    expiry_date=datetime.strptime('2028-12-31', '%Y-%m-%d').date(),
                    stock_quantity=m["stock"],
                    unit=m["unit"],
                    reorder_level=m["reorder"]
                )
                db.session.add(new_med)
                print(f"Added {m['name']}")
            else:
                print(f"{m['name']} already exists")
                
        db.session.commit()
        print("Done seeding medicines.")

if __name__ == "__main__":
    seed_medicines()
