import requests
import json

BASE_URL = "http://localhost:5000/api"

def run_tests():
    print("--- AUTHENTICATION ---")
    
    # 1. Login Volunteer
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "volunteer@careconnect.org", "password": "Volunteer@123"})
    if res.status_code != 200:
        print("Volunteer Login Failed!", res.text)
        return
    volunteer_token = res.json()['access_token']
    v_headers = {"Authorization": f"Bearer {volunteer_token}"}
    print("Volunteer Login: OK")
    
    # 2. Login Doctor
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "doctor@careconnect.org", "password": "Doctor@123"})
    doctor_token = res.json()['access_token']
    d_headers = {"Authorization": f"Bearer {doctor_token}"}
    print("Doctor Login: OK")
    
    # 3. Login Pharmacist
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "pharmacist@careconnect.org", "password": "Pharmacist@123"})
    pharmacist_token = res.json()['access_token']
    p_headers = {"Authorization": f"Bearer {pharmacist_token}"}
    print("Pharmacist Login: OK")
    
    # 4. Login Admin
    res = requests.post(f"{BASE_URL}/auth/login", json={"email": "admin@careconnect.org", "password": "Admin@123"})
    admin_token = res.json()['access_token']
    a_headers = {"Authorization": f"Bearer {admin_token}"}
    print("Admin Login: OK")

    print("\n--- VOLUNTEER WORKFLOW ---")
    
    # Create camp
    camp_data = {
        "camp_name": "Test Camp",
        "camp_date": "2026-07-20",
        "location": "Test Location",
        "description": "Test",
        "organizer_name": "Org",
        "contact_number": "123"
    }
    res = requests.post(f"{BASE_URL}/camps", json=camp_data, headers=v_headers)
    if res.status_code == 201:
        camp_id = res.json()['id']
        print(f"Camp Created: OK (ID {camp_id})")
        requests.patch(f"{BASE_URL}/camps/{camp_id}/status", json={"status": "Active"}, headers=v_headers)
        print("Camp Activated: OK")
    else:
        print("Camp creation failed!", res.text)
        return

    # Register patient
    patient_data = {
        "full_name": "John Doe",
        "age": 30,
        "gender": "Male",
        "phone": "9999999999",
        "village": "Test Village",
        "address": "Test Village",
        "camp_id": camp_id
    }
    res = requests.post(f"{BASE_URL}/patients", json=patient_data, headers=v_headers)
    if res.status_code == 201:
        patient_id = res.json()['patient_id']
        print(f"Patient Registered: OK (ID {patient_id})")
    else:
        print("Patient registration failed!", res.text)
        return

    # Check Queue
    res = requests.get(f"{BASE_URL}/queue/today", headers=v_headers)
    queue = res.json()
    q_item = next((q for q in queue if q['patient_id'] == patient_id), None)
    if q_item:
        print(f"Patient in Queue: OK (Queue ID {q_item['id']}, Status: {q_item['queue_status']})")
        queue_id = q_item['id']
    else:
        print("Patient not found in queue!")
        return

    print("\n--- DOCTOR WORKFLOW ---")
    
    # Start Consultation
    consult_data = {
        "patient_id": patient_id,
        "diagnosis": "Fever",
        "clinical_notes": "High temp",
        "advice": "Rest",
    }
    res = requests.post(f"{BASE_URL}/consultations", json=consult_data, headers=d_headers)
    if res.status_code == 201:
        consult_id = res.json()['id']
        print(f"Consultation Started: OK (ID {consult_id})")
    else:
        print("Consultation start failed!", res.text)
        return

    # Add Prescription
    rx_data = {
        "consultation_id": consult_id,
        "medicine_id": 1, # Paracetamol
        "dosage": "1 tablet",
        "frequency": "Daily",
        "duration": "3 days",
        "instructions": "After meal"
    }
    res = requests.post(f"{BASE_URL}/prescriptions", json=rx_data, headers=d_headers)
    if res.status_code == 201:
        rx_id = res.json()['id']
        print(f"Prescription Added: OK (ID {rx_id})")
    else:
        print("Prescription add failed!", res.text)
        return
        
    # Complete Consultation
    res = requests.patch(f"{BASE_URL}/consultations/{consult_id}/complete", headers=d_headers)
    if res.status_code == 200:
        print("Consultation Completed: OK")
    else:
        print("Consultation completion failed!", res.text)
        return
        
    # Check Queue Status
    res = requests.get(f"{BASE_URL}/queue/today", headers=d_headers)
    q_item = next((q for q in res.json() if q['id'] == queue_id), None)
    print(f"Queue Status after Doctor: {q_item['queue_status']}")

    print("\n--- PHARMACY WORKFLOW ---")
    
    # Dispense Medicine
    dispense_data = {
        "prescription_id": rx_id,
        "dispensed_quantity": 2
    }
    res = requests.post(f"{BASE_URL}/pharmacy/dispense", json=dispense_data, headers=p_headers)
    if res.status_code == 200:
        print("Medicine Dispensed: OK")
    else:
        print("Medicine dispense failed!", res.text)
        return
        
    # Complete Pharmacy Visit
    res = requests.patch(f"{BASE_URL}/pharmacy/queue/{queue_id}/complete", headers=p_headers)
    if res.status_code == 200:
        print("Pharmacy Visit Completed: OK")
    else:
        print("Pharmacy visit complete failed!", res.text)
        return

    # Check Queue Status
    res = requests.get(f"{BASE_URL}/queue/today", headers=v_headers)
    q_item = next((q for q in res.json() if q['id'] == queue_id), None)
    print(f"Final Queue Status: {q_item['queue_status']}")
    
    print("\n--- ADMIN WORKFLOW ---")
    res = requests.get(f"{BASE_URL}/reports/overview", headers=a_headers)
    if res.status_code == 200:
        print("Admin Reports Overview: OK", res.json())
    else:
        print("Admin Reports Overview failed!", res.text)
        return

if __name__ == "__main__":
    run_tests()
