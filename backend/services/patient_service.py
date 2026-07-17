from database import db
from models.patient import Patient
from services.queue_service import QueueService

class PatientService:
    @staticmethod
    def generate_patient_code():
        last_patient = Patient.query.order_by(Patient.id.desc()).first()
        if not last_patient:
            return "P-1001"
        last_code = last_patient.patient_code
        try:
            num = int(last_code.split('-')[1])
            return f"P-{num + 1}"
        except:
            return "P-1001"

    @staticmethod
    def create_patient(data):
        patient_code = PatientService.generate_patient_code()
        
        patient = Patient(
            patient_code=patient_code,
            full_name=data.get('full_name'),
            age=data.get('age'),
            gender=data.get('gender'),
            phone=data.get('phone'),
            village=data.get('village'),
            address=data.get('address'),
            blood_group=data.get('blood_group'),
            emergency_contact=data.get('emergency_contact'),
            status='Waiting'
        )
        
        db.session.add(patient)
        db.session.flush() # flush to get patient.id
        
        QueueService.add_to_queue(patient.id, data.get('priority', 'Normal'))
        
        db.session.commit()
        return patient

    @staticmethod
    def get_all_patients():
        return Patient.query.order_by(Patient.created_at.desc()).all()

    @staticmethod
    def get_patient_by_id(patient_id):
        return db.session.get(Patient, patient_id)

    @staticmethod
    def update_patient(patient_id, data):
        patient = db.session.get(Patient, patient_id)
        if not patient:
            return None
            
        if 'full_name' in data: patient.full_name = data['full_name']
        if 'age' in data: patient.age = data['age']
        if 'gender' in data: patient.gender = data['gender']
        if 'phone' in data: patient.phone = data['phone']
        if 'village' in data: patient.village = data['village']
        if 'address' in data: patient.address = data['address']
        if 'blood_group' in data: patient.blood_group = data['blood_group']
        if 'emergency_contact' in data: patient.emergency_contact = data['emergency_contact']
        if 'status' in data: patient.status = data['status']
        
        db.session.commit()
        return patient

    @staticmethod
    def delete_patient(patient_id):
        patient = db.session.get(Patient, patient_id)
        if patient:
            db.session.delete(patient)
            db.session.commit()
            return True
        return False
