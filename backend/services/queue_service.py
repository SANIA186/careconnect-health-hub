from datetime import datetime, timezone, date
from database import db
from models.queue import Queue
from models.patient import Patient

class QueueService:
    @staticmethod
    def get_today_start():
        today = date.today()
        return datetime.combine(today, datetime.min.time(), tzinfo=timezone.utc)

    @staticmethod
    def generate_token_number():
        today_start = QueueService.get_today_start()
        count = Queue.query.filter(Queue.created_at >= today_start).count()
        return count + 1

    @staticmethod
    def calculate_estimated_wait_time(position):
        return position * 15

    @staticmethod
    def add_to_queue(patient_id, priority='Normal'):
        today_start = QueueService.get_today_start()
        waiting_count = Queue.query.filter(
            Queue.created_at >= today_start,
            Queue.queue_status == 'Waiting'
        ).count()
        
        position = waiting_count + 1
        token = QueueService.generate_token_number()
        
        queue_item = Queue(
            patient_id=patient_id,
            token_number=token,
            queue_position=position,
            priority=priority,
            queue_status='Waiting',
            estimated_wait_time=QueueService.calculate_estimated_wait_time(position)
        )
        
        db.session.add(queue_item)
        return queue_item

    @staticmethod
    def get_current_queue():
        today_start = QueueService.get_today_start()
        return Queue.query.filter(Queue.created_at >= today_start, Queue.queue_status != 'Completed')\
                          .order_by(Queue.queue_position.asc()).all()
                          
    @staticmethod
    def get_today_queue():
        today_start = QueueService.get_today_start()
        return Queue.query.filter(Queue.created_at >= today_start).order_by(Queue.created_at.asc()).all()

    @staticmethod
    def update_queue_status(queue_id, status):
        queue_item = db.session.get(Queue, queue_id)
        if not queue_item:
            return None
            
        queue_item.queue_status = status
        
        if queue_item.patient:
            queue_item.patient.status = status
            
        QueueService.recalculate_positions()
        return queue_item

    @staticmethod
    def recalculate_positions():
        today_start = QueueService.get_today_start()
        waiting_queues = Queue.query.filter(
            Queue.created_at >= today_start,
            Queue.queue_status == 'Waiting'
        ).order_by(Queue.created_at.asc()).all()
        
        for index, item in enumerate(waiting_queues):
            item.queue_position = index + 1
            item.estimated_wait_time = QueueService.calculate_estimated_wait_time(item.queue_position)
            
        db.session.commit()

    @staticmethod
    def get_dashboard_summary():
        today_start = QueueService.get_today_start()
        today_queues = Queue.query.filter(Queue.created_at >= today_start).all()
        
        total = len(today_queues)
        waiting = sum(1 for q in today_queues if q.queue_status == 'Waiting')
        consulting = sum(1 for q in today_queues if q.queue_status == 'In Consultation')
        completed = sum(1 for q in today_queues if q.queue_status == 'Completed')
        next_token = total + 1
        
        return {
            "total_patients_today": total,
            "waiting_patients": waiting,
            "consulting_patients": consulting,
            "completed_patients": completed,
            "next_token": next_token
        }
