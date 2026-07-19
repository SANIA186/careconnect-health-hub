from app import create_app
from database import db
from models.user import User

app = create_app()

with app.app_context():
    pharmacist = User.query.filter_by(email='pharmacist@careconnect.org').first()
    if not pharmacist:
        pharmacist = User(
            full_name='Pharmacist User',
            email='pharmacist@careconnect.org',
            role='Pharmacist'
        )
        pharmacist.set_password('Pharmacist@123')
        db.session.add(pharmacist)
        db.session.commit()
        print('Pharmacist created with Pharmacist@123')
    else:
        pharmacist.set_password('Pharmacist@123')
        db.session.commit()
        print('Pharmacist already exists, updated password to Pharmacist@123')
