import type { ConsultationInput, Patient } from "@/types/patient";
import { apiClient } from "./client";
import { 
  getPatientById,
  mapBackendQueueToFrontendPatient 
} from "./patient.api";

function parseFollowUpToDateStr(followUp: string | undefined): string | undefined {
  if (!followUp || followUp === "Not required" || followUp === "Custom") return undefined;
  
  const now = new Date();
  if (followUp.includes("week")) {
    const weeks = parseInt(followUp, 10) || 1;
    now.setDate(now.getDate() + weeks * 7);
  } else if (followUp.includes("month")) {
    const months = parseInt(followUp, 10) || 1;
    now.setMonth(now.getMonth() + months);
  } else {
    now.setDate(now.getDate() + 14); // Default to 2 weeks
  }
  
  return now.toISOString().split("T")[0]; // YYYY-MM-DD
}

export async function getQueuedPatients(): Promise<Patient[]> {
  try {
    const queue = await apiClient<any[]>("/queue");
    return queue.map((q) => mapBackendQueueToFrontendPatient(q));
  } catch (error) {
    console.error("Failed to fetch queued patients:", error);
    throw error;
  }
}

export async function getCompletedConsultations(): Promise<Patient[]> {
  try {
    const queue = await apiClient<any[]>("/queue/today");
    return queue
      .filter((q) => q.queue_status === "Completed")
      .map((q) => mapBackendQueueToFrontendPatient(q));
  } catch (error) {
    console.error("Failed to fetch completed consultations:", error);
    throw error;
  }
}

export async function saveConsultation(patientId: string, input: ConsultationInput): Promise<Patient> {
  try {
    // 1. Resolve medicine IDs from backend pharmacy inventory
    let medicinesList: any[] = [];
    try {
      medicinesList = await apiClient<any[]>("/pharmacy/medicines");
    } catch (e) {
      console.warn("Could not fetch medicines for mapping, falling back to null IDs:", e);
    }

    const medicineMap = new Map<string, number>();
    for (const med of medicinesList) {
      medicineMap.set(med.medicine_name.toLowerCase().trim(), med.id);
    }

    const followUpDate = parseFollowUpToDateStr(input.followUp);

    // 2. Start (create) the consultation on the backend
    const consultation = await apiClient<any>("/consultations", {
      method: "POST",
      body: JSON.stringify({
        patient_id: parseInt(patientId, 10),
        diagnosis: input.diagnosis,
        clinical_notes: input.notes || "",
        advice: input.advice || "",
        follow_up_date: followUpDate
      })
    });

    const consultationId = consultation.id;

    // 3. Post each prescription
    for (const rx of input.prescriptions) {
      const medName = rx.medicine.toLowerCase().trim();
      const medicineId = medicineMap.get(medName) || null;

      await apiClient("/prescriptions", {
        method: "POST",
        body: JSON.stringify({
          consultation_id: consultationId,
          medicine_id: medicineId,
          dosage: rx.dosage,
          frequency: "Daily", // Default value as expected by backend model
          duration: rx.duration,
          instructions: rx.notes || ""
        })
      });
    }

    // 4. Complete the consultation to update backend queue status (to Completed / At Pharmacy)
    await apiClient(`/consultations/${consultationId}/complete`, {
      method: "PATCH"
    });

    // 5. Fetch updated patient details from backend and return them
    const updatedPatient = await getPatientById(patientId);
    if (!updatedPatient) {
      throw new Error("Could not fetch patient details after complete");
    }

    return updatedPatient;
  } catch (error) {
    console.error("Failed to save consultation to backend:", error);
    throw error;
  }
}
