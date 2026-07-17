import { currentCampId, mockPatients } from "@/mock/patients";
import type { ConsultationInput, ConsultationSummary, Patient, PatientRegistrationInput, QueueStatus, Visit } from "@/types/patient";

export async function getPatients(): Promise<Patient[]> {
  await Promise.resolve();
  return mockPatients;
}

export async function getPatientById(id: string): Promise<Patient | null> {
  await Promise.resolve();
  return mockPatients.find((patient) => patient.id === id) ?? null;
}

export async function getPatientsByStatus(status: QueueStatus | "all" = "all"): Promise<Patient[]> {
  await Promise.resolve();
  if (status === "all") return mockPatients;
  return mockPatients.filter((patient) => patient.status === status);
}

export function getNextPatientId(): string {
  const nextNumber = mockPatients
    .map((patient) => Number.parseInt(patient.id.split("-")[1] ?? "0", 10))
    .filter((value) => Number.isFinite(value))
    .reduce((max, value) => Math.max(max, value), 0) + 1;

  return `P-${nextNumber}`;
}

export function getNextQueueToken(): number {
  return mockPatients.reduce((max, patient) => Math.max(max, patient.token), 0) + 1;
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

export async function registerPatient(input: PatientRegistrationInput): Promise<Patient> {
  validateRegistrationInput(input);

  const patient: Patient = {
    id: getNextPatientId(),
    token: getNextQueueToken(),
    name: input.name.trim(),
    age: Number(input.age),
    gender: input.gender,
    phone: input.phone?.trim() ?? "",
    village: input.village.trim(),
    campId: currentCampId,
    status: "waiting",
    symptoms: input.symptoms.trim(),
    vitals: {
      bp: input.vitals?.bp?.trim() || "—",
      pulse: input.vitals?.pulse?.trim() || "—",
      temp: input.vitals?.temp?.trim() || "—",
      weight: input.vitals?.weight?.trim() || "—",
    },
    volunteerNotes: (input.volunteerNotes ?? input.symptoms).trim(),
    registeredAt: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    visits: [],
  };

  mockPatients.push(patient);
  return patient;
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

export async function savePatientConsultation(patientId: string, input: ConsultationInput): Promise<Patient> {
  await Promise.resolve();

  const patient = mockPatients.find((entry) => entry.id === patientId);
  if (!patient) {
    throw new Error("Patient not found.");
  }

  const diagnosis = input.diagnosis.trim();
  const prescriptions = input.prescriptions
    .filter((prescription) => prescription.medicine?.trim() && prescription.dosage?.trim() && prescription.duration?.trim())
    .map((prescription) => ({
      medicine: prescription.medicine.trim(),
      dosage: prescription.dosage.trim(),
      duration: prescription.duration.trim(),
      notes: prescription.notes?.trim(),
    }));

  if (!diagnosis) {
    throw new Error("Please enter a diagnosis.");
  }

  if (prescriptions.length === 0) {
    throw new Error("Please add at least one prescription.");
  }

  const followUp = input.followUp?.trim() || "Not required";
  const advice = input.advice?.trim();
  const referral = input.referral?.trim();

  patient.visits.push({
    campId: patient.campId,
    campName: "Current Camp",
    date: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    symptoms: patient.symptoms,
    diagnosis,
    prescriptions,
    followUp,
    referral: referral || undefined,
    advice,
    notes: input.notes?.trim(),
  });
  patient.status = "completed";

  return patient;
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
