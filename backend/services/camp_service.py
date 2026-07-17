from datetime import datetime
from database import db
from models.camp import Camp
from models.camp_assignment import CampAssignment
from models.patient import Patient
from models.consultation import Consultation
from models.dispense_history import DispenseHistory

class CampService:
    @staticmethod
    def create_camp(user_id, data):
        camp = Camp(
            camp_name=data.get('camp_name'),
            camp_date=datetime.strptime(data.get('camp_date'), '%Y-%m-%d').date(),
            location=data.get('location'),
            description=data.get('description'),
            organizer_name=data.get('organizer_name'),
            contact_number=data.get('contact_number'),
            created_by=user_id
        )
        db.session.add(camp)
        db.session.commit()
        return camp

    @staticmethod
    def get_all_camps():
        camps = Camp.query.order_by(Camp.camp_date.desc()).all()
        return [c.to_dict() for c in camps]

    @staticmethod
    def get_camp(camp_id):
        return db.session.get(Camp, camp_id)

    @staticmethod
    def update_camp(camp_id, data):
        camp = db.session.get(Camp, camp_id)
        if not camp:
            return None
            
        if 'camp_name' in data: camp.camp_name = data['camp_name']
        if 'camp_date' in data: camp.camp_date = datetime.strptime(data['camp_date'], '%Y-%m-%d').date()
        if 'location' in data: camp.location = data['location']
        if 'description' in data: camp.description = data['description']
        if 'organizer_name' in data: camp.organizer_name = data['organizer_name']
        if 'contact_number' in data: camp.contact_number = data['contact_number']
        
        db.session.commit()
        return camp

    @staticmethod
    def update_camp_status(camp_id, status):
        camp = db.session.get(Camp, camp_id)
        if not camp:
            return None
        camp.status = status
        db.session.commit()
        return camp

    @staticmethod
    def assign_user(camp_id, data):
        assignment = CampAssignment(
            camp_id=camp_id,
            user_id=data.get('user_id'),
            role=data.get('role')
        )
        db.session.add(assignment)
        db.session.commit()
        return assignment

    @staticmethod
    def get_camp_stats(camp_id):
        patients = Patient.query.filter_by(camp_id=camp_id).all()
        patient_ids = [p.id for p in patients]
        
        total_patients = len(patients)
        
        if patient_ids:
            completed_consultations = Consultation.query.filter(
                Consultation.patient_id.in_(patient_ids),
                Consultation.consultation_status == 'Completed'
            ).count()
            
            medicines_dispensed = db.session.query(
                db.func.sum(DispenseHistory.dispensed_quantity)
            ).filter(
                DispenseHistory.patient_id.in_(patient_ids)
            ).scalar() or 0
        else:
            completed_consultations = 0
            medicines_dispensed = 0
        
        pending_patients = len([p for p in patients if p.status not in ('Completed',)])
        
        return {
            "total_patients": total_patients,
            "completed_consultations": completed_consultations,
            "medicines_dispensed": medicines_dispensed,
            "pending_patients": pending_patients
        }

    @staticmethod
    def get_dashboard_summary():
        total_camps = Camp.query.count()
        active_camps = Camp.query.filter_by(status='Active').count()
        upcoming_camps = Camp.query.filter_by(status='Upcoming').count()
        patients_served = Patient.query.filter(Patient.camp_id.isnot(None)).count()
        
        return {
            "total_camps": total_camps,
            "active_camps": active_camps,
            "upcoming_camps": upcoming_camps,
            "patients_served": patients_served
        }
