import json
from datetime import datetime
from database import db
from models.queue import Queue
from models.medicine import Medicine
from models.prescription import Prescription
from models.dispense_history import DispenseHistory
from services.queue_service import QueueService
from services.sms_service import SmsService

class PharmacyService:
    @staticmethod
    def get_pharmacy_queue():
        today_start = QueueService.get_today_start()
        queue = Queue.query.filter(
            Queue.created_at >= today_start,
            Queue.queue_status == 'At Pharmacy'
        ).order_by(Queue.queue_position.asc()).all()
        return [q.to_dict() for q in queue]

    @staticmethod
    def get_all_medicines():
        medicines = Medicine.query.order_by(Medicine.medicine_name.asc()).all()
        return [m.to_dict() for m in medicines]

    @staticmethod
    def dispense_medicine(data):
        prescription_id = data.get('prescription_id')
        dispensed_quantity = data.get('dispensed_quantity', 1)
        
        prescription = db.session.get(Prescription, prescription_id)
        if not prescription:
            raise ValueError("Prescription not found")
            
        medicine = db.session.get(Medicine, prescription.medicine_id)
        if not medicine:
            raise ValueError("Medicine not found")
            
        if medicine.stock_quantity < dispensed_quantity:
            raise ValueError(f"Insufficient stock for {medicine.medicine_name}")
            
        # Deduct stock
        medicine.stock_quantity -= dispensed_quantity
        
        # Determine SMS payload
        patient = prescription.consultation.patient
        sms_payload = json.dumps({
            "to": patient.phone,
            "message": f"Dear {patient.full_name}, your medicine {medicine.medicine_name} ({dispensed_quantity} {medicine.unit}) has been dispensed. Instructions: {prescription.instructions}",
            "generated_at": datetime.now().isoformat()
        })
        
        # Save dispense history
        history = DispenseHistory(
            prescription_id=prescription_id,
            medicine_id=medicine.id,
            patient_id=patient.id,
            dispensed_quantity=dispensed_quantity,
            sms_payload=sms_payload
        )
        
        db.session.add(history)
        db.session.commit()

        try:
            SmsService.send_sms(
                patient_id=patient.id,
                message=(
                    f"Dear {patient.full_name}, your medicine "
                    f"{medicine.medicine_name} ({dispensed_quantity} {medicine.unit}) "
                    f"has been dispensed. Instructions: {prescription.instructions}"
                ),
                sms_type='MEDICINE_DISPENSED'
            )
        except Exception as e:
            print(f"SMS notification failed: {e}")

        
        return history

    @staticmethod
    def complete_pharmacy_visit(queue_id):
        queue_item = db.session.get(Queue, queue_id)
        if not queue_item or queue_item.queue_status != 'At Pharmacy':
            return None
            
        from services.queue_service import QueueService
        QueueService.update_queue_status(queue_item.id, 'Completed')
        return queue_item
