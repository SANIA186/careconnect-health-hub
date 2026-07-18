from datetime import datetime
from database import db
from services.sms_service import SmsService
from models.consultation import Consultation
from models.prescription import Prescription



class ConsultationService:
    @staticmethod
    def start_consultation(doctor_id, data):
        patient_id = data.get('patient_id')
        
        consultation = Consultation(
            patient_id=patient_id,
            doctor_id=doctor_id,
            diagnosis=data.get('diagnosis'),
            clinical_notes=data.get('clinical_notes'),
            advice=data.get('advice'),
            consultation_status='Started'
        )
        
        if data.get('follow_up_date'):
            try:
                consultation.follow_up_date = datetime.strptime(data.get('follow_up_date'), '%Y-%m-%d').date()
                consultation.follow_up_required = True
            except:
                pass
                
        db.session.add(consultation)
        
        from models.queue import Queue
        from services.queue_service import QueueService
        queue_item = Queue.query.filter_by(patient_id=patient_id, queue_status='Waiting').first()
        if queue_item:
            QueueService.update_queue_status(queue_item.id, 'In Consultation')
            
        db.session.commit()
        return consultation

    @staticmethod
    def update_consultation(consultation_id, data):
        consultation = db.session.get(Consultation, consultation_id)
        if not consultation:
            return None
            
        if 'diagnosis' in data: consultation.diagnosis = data['diagnosis']
        if 'clinical_notes' in data: consultation.clinical_notes = data['clinical_notes']
        if 'advice' in data: consultation.advice = data['advice']
        if 'follow_up_date' in data: 
            try:
                consultation.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date()
                consultation.follow_up_required = True
            except:
                pass
        
        db.session.commit()
        return consultation

    @staticmethod
    def complete_consultation(consultation_id):
        consultation = db.session.get(Consultation, consultation_id)
        if not consultation:
            return None
            
        consultation.consultation_status = 'Completed'
        
        from models.queue import Queue
        from services.queue_service import QueueService
        queue_item = Queue.query.filter_by(patient_id=consultation.patient_id, queue_status='In Consultation').first()
        if queue_item:
            if consultation.prescriptions:
                QueueService.update_queue_status(queue_item.id, 'At Pharmacy')
            else:
                QueueService.update_queue_status(queue_item.id, 'Completed')
            
        db.session.commit()
        return consultation

    @staticmethod
    def get_patient_history(patient_id):
        consultations = Consultation.query.filter_by(patient_id=patient_id).order_by(Consultation.created_at.desc()).all()
        return [c.to_dict() for c in consultations]

    @staticmethod
    def get_consultation(consultation_id):
        return db.session.get(Consultation, consultation_id)

    @staticmethod
    def add_prescription(consultation_id, data):
        prescription = Prescription(
            consultation_id=consultation_id,
            medicine_id=data.get('medicine_id'),
            dosage=data.get('dosage'),
            frequency=data.get('frequency'),
            duration=data.get('duration'),
            instructions=data.get('instructions')
        )

        db.session.add(prescription)
        db.session.commit()

        # Automatic prescription SMS
        consultation = Consultation.query.get(consultation_id)

        if consultation and consultation.patient:
            SmsService.send_prescription_sms(
                consultation.patient
            )

        return prescription

    @staticmethod
    def get_prescriptions(consultation_id):
        prescriptions = Prescription.query.filter_by(consultation_id=consultation_id).all()
        return [p.to_dict() for p in prescriptions]
