import type { Medicine } from "@/types/medicine";
import type { Patient, Prescription } from "@/types/patient";
import { getPatientById } from "./patient.api";
import { apiClient } from "./client";

function mapBackendMedicineToFrontend(m: any): Medicine {
  return {
    id: String(m.id),
    name: m.medicine_name,
    category: m.category,
    stock: m.stock_quantity,
    minStock: m.reorder_level,
    unit: m.unit,
    expiry: m.expiry_date || "",
    distributed: 0,
  };
}

export async function getMedicines(): Promise<Medicine[]> {
  try {
    const medicines = await apiClient<any[]>("/pharmacy/medicines");
    return medicines.map(mapBackendMedicineToFrontend);
  } catch (error) {
    console.error("Failed to fetch medicines:", error);
    throw error;
  }
}

export async function getLowStockMedicines(): Promise<Medicine[]> {
  try {
    const medicines = await getMedicines();
    return medicines.filter((medicine) => medicine.stock < medicine.minStock);
  } catch (error) {
    console.error("Failed to fetch low stock medicines:", error);
    throw error;
  }
}

export async function dispenseMedicines(patientId: string, prescriptions: Prescription[]): Promise<{ patient: Patient; medicines: Medicine[] }> {
  if (prescriptions.length === 0) {
    throw new Error("Select at least one medicine to dispense.");
  }

  try {
    // 1. Dispense each prescription on the backend
    for (const rx of prescriptions) {
      if (!rx.id) {
        console.warn("Skipping prescription without backend ID:", rx.medicine);
        continue;
      }
      await apiClient("/pharmacy/dispense", {
        method: "POST",
        body: JSON.stringify({
          prescription_id: rx.id,
          dispensed_quantity: 1 // Default quantity to dispense
        })
      });
    }

    // 2. Fetch queue items to find this patient's queue_id
    const queue = await apiClient<any[]>("/queue/today");
    const queueItem = queue.find(q => String(q.patient_id) === String(patientId));

    if (queueItem) {
      // 3. Transition the queue status to Completed
      await apiClient(`/pharmacy/queue/${queueItem.id}/complete`, {
        method: "PATCH"
      });
    } else {
      console.warn("Could not find queue item to complete pharmacy visit for patient:", patientId);
    }

    // 4. Fetch updated patient and medicine inventory
    const updatedPatient = await getPatientById(patientId);
    if (!updatedPatient) {
      throw new Error("Failed to fetch patient details after dispensing");
    }

    const updatedMedicines = await getMedicines();

    return {
      patient: updatedPatient,
      medicines: updatedMedicines
    };
  } catch (error) {
    console.error("Failed to dispense medicines on backend:", error);
    throw error;
  }
}
