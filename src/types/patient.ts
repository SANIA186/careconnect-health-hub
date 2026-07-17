export type QueueStatus = "waiting" | "in-consultation" | "completed";

export interface Prescription {
  medicine: string;
  dosage: string;
  duration: string;
  notes?: string;
}

export interface Visit {
  campId: string;
  campName: string;
  date: string;
  symptoms: string;
  diagnosis: string;
  prescriptions: Prescription[];
  followUp?: string;
  referral?: string;
  advice?: string;
  notes?: string;
}

export interface Patient {
  id: string;
  token: number;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  phone: string;
  village: string;
  campId: string;
  status: QueueStatus;
  symptoms: string;
  vitals: { bp: string; pulse: string; temp: string; weight: string };
  volunteerNotes: string;
  registeredAt: string;
  medicineDispensed?: boolean;
  visits: Visit[];
}

export interface ConsultationInput {
  diagnosis: string;
  notes?: string;
  prescriptions: Prescription[];
  advice?: string;
  followUp?: string;
  referral?: string;
}

export interface ConsultationSummary {
  diagnosis: string;
  prescriptions: Prescription[];
  followUp: string;
  advice: string;
}

export interface PatientRegistrationInput {
  name: string;
  age: number | string;
  gender: Patient["gender"];
  phone?: string;
  village: string;
  symptoms: string;
  volunteerNotes?: string;
  vitals?: { bp?: string; pulse?: string; temp?: string; weight?: string };
}
