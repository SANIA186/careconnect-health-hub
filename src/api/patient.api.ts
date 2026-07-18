import type { ConsultationInput, ConsultationSummary, Patient, PatientRegistrationInput, QueueStatus, Visit } from "@/types/patient";
import { apiClient } from "./client";

export function mapStatusBackendToFrontend(status: string): QueueStatus {
  if (status === "Waiting") return "waiting";
  if (status === "In Consultation") return "in-consultation";
  if (status === "Completed" || status === "At Pharmacy") return "completed";
  return "waiting";
}

export function mapBackendQueueToFrontendPatient(queueItem: any, medicineMap?: Map<number, string>): Patient {
  const p = queueItem.patient;
  const status = queueItem.queue_status;
  return {
    id: String(p.id),
    token: queueItem.token_number,
    name: p.full_name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    village: p.village || p.address,
    campId: String(p.camp_id || "0"),
    status: mapStatusBackendToFrontend(status),
    symptoms: "Not recorded (Backend DB structure pending)", 
    vitals: { bp: "—", pulse: "—", temp: "—", weight: "—" },
    volunteerNotes: "Not recorded",
    registeredAt: queueItem.created_at ? new Date(queueItem.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "",
    medicineDispensed: status === "Completed",
    visits: p.consultations ? p.consultations.map((c: any) => ({
      campId: String(p.camp_id),
      campName: "Camp",
      date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      symptoms: "Not recorded",
      diagnosis: c.diagnosis || "",
      prescriptions: c.prescriptions ? c.prescriptions.map((px: any) => ({
        id: px.id,
        medicine: medicineMap?.get(px.medicine_id) || String(px.medicine_id),
        dosage: px.dosage,
        duration: px.duration,
        notes: px.instructions
      })) : [],
      notes: c.notes,
      advice: c.advice,
      followUp: c.follow_up_required ? "Required" : "Not required"
    })) : [],
  };
}

export function mapBackendPatientToFrontendPatient(p: any, medicineMap?: Map<number, string>): Patient {
  const status = p.status;
  return {
    id: String(p.id),
    token: 0, // Fallback when fetched directly from patients API instead of queue
    name: p.full_name,
    age: p.age,
    gender: p.gender,
    phone: p.phone,
    village: p.village || p.address,
    campId: String(p.camp_id || "0"),
    status: mapStatusBackendToFrontend(status),
    symptoms: "Not recorded", 
    vitals: { bp: "—", pulse: "—", temp: "—", weight: "—" },
    volunteerNotes: "Not recorded",
    registeredAt: p.created_at ? new Date(p.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : "",
    medicineDispensed: status === "Completed",
    visits: p.consultations ? p.consultations.map((c: any) => ({
      campId: String(p.camp_id),
      campName: "Camp",
      date: c.created_at ? new Date(c.created_at).toLocaleDateString() : "",
      symptoms: "Not recorded",
      diagnosis: c.diagnosis || "",
      prescriptions: c.prescriptions ? c.prescriptions.map((px: any) => ({
        id: px.id,
        medicine: medicineMap?.get(px.medicine_id) || String(px.medicine_id),
        dosage: px.dosage,
        duration: px.duration,
        notes: px.instructions
      })) : [],
      notes: c.notes,
      advice: c.advice,
      followUp: c.follow_up_required ? "Required" : "Not required"
    })) : [],
  };
}

export async function getPatients(): Promise<Patient[]> {
  try {
    const queue = await apiClient<any[]>("/queue/today");
    
    let medicineMap = new Map<number, string>();
    try {
      const medicines = await apiClient<any[]>("/pharmacy/medicines");
      for (const med of medicines) {
        medicineMap.set(med.id, med.medicine_name);
      }
    } catch (e) {
      console.warn("Could not fetch medicines for name mapping in getPatients:", e);
    }

    return queue.map(q => mapBackendQueueToFrontendPatient(q, medicineMap));
  } catch (error) {
    console.error("Failed to fetch patients/queue:", error);
    throw error;
  }
}

export async function getPatientById(id: string): Promise<Patient | null> {
  try {
    const patient = await apiClient<any>(`/patients/${id}`);
    
    let medicineMap = new Map<number, string>();
    try {
      const medicines = await apiClient<any[]>("/pharmacy/medicines");
      for (const med of medicines) {
        medicineMap.set(med.id, med.medicine_name);
      }
    } catch (e) {
      console.warn("Could not fetch medicines for name mapping in getPatientById:", e);
    }

    const mappedPatient = mapBackendPatientToFrontendPatient(patient, medicineMap);

    // If we are on the doctor consultation page, try to transition the queue status to 'In Consultation'
    if (typeof window !== "undefined" && window.location.pathname.includes("/doctor/consultation/")) {
      try {
        const queue = await apiClient<any[]>("/queue/today");
        const queueItem = queue.find(q => String(q.patient_id) === String(id));
        if (queueItem && queueItem.queue_status === "Waiting") {
          await apiClient(`/queue/${queueItem.id}/status`, {
            method: "PATCH",
            body: JSON.stringify({ status: "In Consultation" })
          });
          mappedPatient.status = "in-consultation";
        }
      } catch (err) {
        console.warn("Failed to automatically transition queue status to In Consultation:", err);
      }
    }

    return mappedPatient;
  } catch (error) {
    console.error("Failed to fetch patient:", error);
    return null;
  }
}

export async function getPatientsByStatus(status: QueueStatus | "all" = "all"): Promise<Patient[]> {
  try {
    const queue = await apiClient<any[]>("/queue/today");
    
    let medicineMap = new Map<number, string>();
    try {
      const medicines = await apiClient<any[]>("/pharmacy/medicines");
      for (const med of medicines) {
        medicineMap.set(med.id, med.medicine_name);
      }
    } catch (e) {
      console.warn("Could not fetch medicines for name mapping in getPatientsByStatus:", e);
    }

    const patients = queue.map(q => mapBackendQueueToFrontendPatient(q, medicineMap));
    
    if (status === "all") return patients;
    return patients.filter((patient) => patient.status === status);
  } catch (error) {
    console.error("Failed to fetch queue by status:", error);
    throw error;
  }
}

/** @deprecated Backend generates patient IDs. This is kept only for type compatibility. */
export function getNextPatientId(): string {
  return "P-0";
}

/** @deprecated Backend assigns queue tokens. This is kept only for type compatibility. */
export function getNextQueueToken(): number {
  return 0;
}

function validateRegistrationInput(input: PatientRegistrationInput): void {
  const missing = [
    [input.name?.trim(), "Full name"],
    [input.age !== undefined && input.age !== null && `${input.age}`.trim() !== "" ? `${input.age}` : "", "Age"],
    [input.village?.trim(), "Village"],
    [input.symptoms?.trim(), "Symptoms & volunteer notes"],
  ]
    .filter(([value]) => !value)
    .map(([, label]) => label);

  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(", ")}`);
  }

  const age = Number(input.age);
  if (!Number.isFinite(age) || age < 0 || age > 120) {
    throw new Error("Age must be a number between 0 and 120.");
  }
}

export async function registerPatient(
  input: PatientRegistrationInput
): Promise<Patient> {
  validateRegistrationInput(input);

  try {
    const response = await apiClient<any>("/patients", {
      method: "POST",
      body: JSON.stringify({
        full_name: input.name.trim(),
        age: Number(input.age),
        gender: input.gender,
        phone: input.phone?.trim() ?? "0000000000", // Backend requires phone
        village: input.village.trim(),
        address: input.village.trim(), // Map village to address as well since required
        camp_id: 1, // Defaulting to 1 as per previous mock logic
      }),
    });

    if (response.patient_id) {
      // Fetch the full queue to find the token number and full patient details
      const queue = await apiClient<any[]>("/queue/today");
      const queueItem = queue.find(q => String(q.patient_id) === String(response.patient_id));
      
      if (queueItem) {
         return mapBackendQueueToFrontendPatient(queueItem);
      }
      
      // Fallback if queue item not found for some reason
      const patient = await apiClient<any>(`/patients/${response.patient_id}`);
      return mapBackendPatientToFrontendPatient(patient);
    }
  } catch (error) {
    console.error("Backend registration failed:", error);
    throw error; // Let the UI handle the API error (e.g., show toast)
  }

  throw new Error("Registration failed.");
}

export function getLatestVisit(patient: Patient): Visit | undefined {
  return patient.visits[patient.visits.length - 1];
}

export function getLatestConsultationSummary(patient: Patient): ConsultationSummary {
  const latestVisit = getLatestVisit(patient);

  return {
    diagnosis: latestVisit?.diagnosis?.trim() || "No consultation history available.",
    prescriptions: latestVisit?.prescriptions ?? [],
    followUp: latestVisit?.followUp?.trim() || "Not required",
    advice: latestVisit?.advice?.trim() || "",
  };
}

/** @deprecated Use saveConsultation from doctor.api.ts instead. */
export async function savePatientConsultation(patientId: string, input: ConsultationInput): Promise<Patient> {
  // Delegate to the real backend consultation API
  const { saveConsultation } = await import("./doctor.api");
  return saveConsultation(patientId, input);
}

export function buildAiSummary(patient: Patient): { headline: string; bullets: string[]; flags: string[] } {
  const bullets = [
    `${patient.age}y ${patient.gender.toLowerCase()} from ${patient.village}, presenting with: ${patient.symptoms}`,
    `Vitals — BP ${patient.vitals.bp}, Pulse ${patient.vitals.pulse}, Temp ${patient.vitals.temp}, Weight ${patient.vitals.weight}`,
    `Volunteer notes: ${patient.volunteerNotes}`,
  ];
  const flags: string[] = [];
  const [sys] = patient.vitals.bp.split("/").map((n) => parseInt(n, 10));
  if (!Number.isNaN(sys) && sys >= 140) flags.push("Elevated systolic BP");
  if (parseFloat(patient.vitals.temp) >= 99) flags.push("Low-grade fever");
  if (patient.visits.length > 0) flags.push(`${patient.visits.length} prior visit(s) on record`);

  return {
    headline: `Summary for ${patient.name} (Token #${patient.token})`,
    bullets,
    flags,
  };
}