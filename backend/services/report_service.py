from datetime import datetime, timezone, date
from database import db
from models.patient import Patient
from models.consultation import Consultation
from models.medicine import Medicine
from models.dispense_history import DispenseHistory
from models.camp import Camp
from models.user import User

class ReportService:
    
    @staticmethod
    def get_today_start():
        today = date.today()
        return datetime(today.year, today.month, today.day, tzinfo=timezone.utc)

    @staticmethod
    def get_overview():
        total_patients = Patient.query.count()
        total_consultations = Consultation.query.count()
        total_camps = Camp.query.count()
        total_medicines_dispensed = db.session.query(
            db.func.sum(DispenseHistory.dispensed_quantity)
        ).scalar() or 0
        
        return {
            "total_patients": total_patients,
            "total_consultations": total_consultations,
            "total_camps": total_camps,
            "total_medicines_dispensed": int(total_medicines_dispensed)
        }

    @staticmethod
    def get_patient_report():
        total_registrations = Patient.query.count()
        
        # Gender distribution
        gender_counts = db.session.query(
            Patient.gender, db.func.count(Patient.id)
        ).group_by(Patient.gender).all()
        gender_distribution = {g: c for g, c in gender_counts if g}
        
        # Age groups
        patients = Patient.query.with_entities(Patient.age).all()
        age_groups = {"0-18": 0, "19-35": 0, "36-60": 0, "60+": 0}
        for (age,) in patients:
            if age is None:
                continue
            if age <= 18:
                age_groups["0-18"] += 1
            elif age <= 35:
                age_groups["19-35"] += 1
            elif age <= 60:
                age_groups["36-60"] += 1
            else:
                age_groups["60+"] += 1
        
        # Village-wise patients
        village_counts = db.session.query(
            Patient.village, db.func.count(Patient.id)
        ).group_by(Patient.village).order_by(db.func.count(Patient.id).desc()).limit(10).all()
        village_wise = {v: c for v, c in village_counts if v}
        
        return {
            "total_registrations": total_registrations,
            "gender_distribution": gender_distribution,
            "age_groups": age_groups,
            "village_wise_patients": village_wise
        }

    @staticmethod
    def get_consultation_report():
        total_consultations = Consultation.query.count()
        completed_consultations = Consultation.query.filter_by(consultation_status='Completed').count()
        pending_consultations = Consultation.query.filter_by(consultation_status='Started').count()
        
        # Common diagnoses (non-null)
        diagnoses = db.session.query(
            Consultation.diagnosis, db.func.count(Consultation.id)
        ).filter(
            Consultation.diagnosis.isnot(None),
            Consultation.diagnosis != ''
        ).group_by(Consultation.diagnosis).order_by(
            db.func.count(Consultation.id).desc()
        ).limit(10).all()
        
        common_diagnoses = [{"diagnosis": d, "count": c} for d, c in diagnoses]
        
        return {
            "total_consultations": total_consultations,
            "completed_consultations": completed_consultations,
            "pending_consultations": pending_consultations,
            "common_diagnoses": common_diagnoses
        }

    @staticmethod
    def get_medicine_report():
        total_medicines = Medicine.query.count()
        
        # Total dispensed
        total_dispensed = db.session.query(
            db.func.sum(DispenseHistory.dispensed_quantity)
        ).scalar() or 0
        
        # Low stock medicines
        low_stock = Medicine.query.filter(
            Medicine.stock_quantity <= Medicine.reorder_level
        ).all()
        low_stock_list = [
            {"id": m.id, "medicine_name": m.medicine_name, "stock_quantity": m.stock_quantity, "reorder_level": m.reorder_level}
            for m in low_stock
        ]
        
        # Top used medicines
        top_used = db.session.query(
            Medicine.medicine_name,
            db.func.sum(DispenseHistory.dispensed_quantity).label('total_dispensed')
        ).join(DispenseHistory, Medicine.id == DispenseHistory.medicine_id).group_by(
            Medicine.medicine_name
        ).order_by(
            db.func.sum(DispenseHistory.dispensed_quantity).desc()
        ).limit(10).all()
        
        top_used_list = [{"medicine_name": name, "total_dispensed": int(total or 0)} for name, total in top_used]
        
        return {
            "total_medicines": total_medicines,
            "total_dispensed": int(total_dispensed),
            "low_stock_count": len(low_stock_list),
            "low_stock_medicines": low_stock_list,
            "top_used_medicines": top_used_list
        }

    @staticmethod
    def get_camp_report():
        total_camps = Camp.query.count()
        active_camps = Camp.query.filter_by(status='Active').count()
        completed_camps = Camp.query.filter_by(status='Completed').count()
        upcoming_camps = Camp.query.filter_by(status='Upcoming').count()
        
        # Patients served per camp
        camp_patient_counts = db.session.query(
            Camp.camp_name,
            Camp.status,
            db.func.count(Patient.id).label('patients')
        ).outerjoin(Patient, Camp.id == Patient.camp_id).group_by(Camp.id).all()
        
        patients_per_camp = [
            {"camp_name": name, "status": status, "patients": count}
            for name, status, count in camp_patient_counts
        ]
        
        return {
            "total_camps": total_camps,
            "active_camps": active_camps,
            "completed_camps": completed_camps,
            "upcoming_camps": upcoming_camps,
            "patients_per_camp": patients_per_camp
        }

    @staticmethod
    def get_admin_dashboard():
        today_start = ReportService.get_today_start()
        
        total_patients = Patient.query.count()
        today_patients = Patient.query.filter(Patient.created_at >= today_start).count()
        
        total_consultations = Consultation.query.count()
        completed_consultations = Consultation.query.filter_by(consultation_status='Completed').count()
        
        total_dispensed = db.session.query(
            db.func.sum(DispenseHistory.dispensed_quantity)
        ).scalar() or 0
        
        low_stock_count = Medicine.query.filter(
            Medicine.stock_quantity <= Medicine.reorder_level
        ).count()
        
        total_camps = Camp.query.count()
        active_camps = Camp.query.filter_by(status='Active').count()
        
        return {
            "patients": {
                "total": total_patients,
                "today": today_patients
            },
            "consultations": {
                "total": total_consultations,
                "completed": completed_consultations
            },
            "pharmacy": {
                "dispensed": int(total_dispensed),
                "low_stock": low_stock_count
            },
            "camps": {
                "total": total_camps,
                "active": active_camps
            }
        }
