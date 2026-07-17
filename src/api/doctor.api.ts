import { mockPatients } from "@/mock/patients";
import { savePatientConsultation } from "@/api/patient.api";
import type { ConsultationInput, Patient } from "@/types/patient";

export async function getQueuedPatients(): Promise<Patient[]> {
  await Promise.resolve();
  return mockPatients.filter((patient) => patient.status === "waiting" || patient.status === "in-consultation");
}

export async function getCompletedConsultations(): Promise<Patient[]> {
  await Promise.resolve();
  return mockPatients.filter((patient) => patient.status === "completed");
}

export async function saveConsultation(patientId: string, input: ConsultationInput): Promise<Patient> {
  await Promise.resolve();
  return savePatientConsultation(patientId, input);
}
