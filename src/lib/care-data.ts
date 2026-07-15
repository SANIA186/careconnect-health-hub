export type Role = "volunteer" | "doctor" | "admin";

export type QueueStatus = "waiting" | "in-consultation" | "completed";

export interface Camp {
  id: string;
  name: string;
  date: string;
  location: string;
  patientsServed: number;
  status: "upcoming" | "active" | "completed";
  volunteers: number;
  doctors: number;
}

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
  visits: Visit[];
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  expiry: string;
  distributed: number;
}

export const currentCamp: Camp = {
  id: "camp-2026-07-12",
  name: "Sunday Camp — Rampur Village",
  date: "July 12, 2026",
  location: "Rampur Community Hall",
  patientsServed: 42,
  status: "active",
  volunteers: 8,
  doctors: 3,
};

export const camps: Camp[] = [
  currentCamp,
  { id: "camp-2026-07-05", name: "Sunday Camp — Bhilwara", date: "July 5, 2026", location: "Bhilwara Panchayat", patientsServed: 68, status: "completed", volunteers: 10, doctors: 4 },
  { id: "camp-2026-06-28", name: "Sunday Camp — Sitapur", date: "June 28, 2026", location: "Sitapur School", patientsServed: 54, status: "completed", volunteers: 7, doctors: 3 },
  { id: "camp-2026-06-21", name: "Sunday Camp — Devgarh", date: "June 21, 2026", location: "Devgarh Temple Ground", patientsServed: 47, status: "completed", volunteers: 6, doctors: 2 },
  { id: "camp-2026-07-19", name: "Sunday Camp — Kotra", date: "July 19, 2026", location: "Kotra Health Sub-Centre", patientsServed: 0, status: "upcoming", volunteers: 0, doctors: 0 },
];

export const patients: Patient[] = [
  {
    id: "P-1042", token: 12, name: "Anita Sharma", age: 34, gender: "Female", phone: "+91 98•••32", village: "Rampur",
    campId: currentCamp.id, status: "waiting",
    symptoms: "Persistent cough for 5 days, mild fever in the evenings, fatigue.",
    vitals: { bp: "118/76", pulse: "88", temp: "99.2°F", weight: "54 kg" },
    volunteerNotes: "Patient reports dusty work environment. No known allergies. Not on any regular medication.",
    registeredAt: "9:42 AM",
    visits: [
      { campId: "camp-2026-06-21", campName: "Devgarh Camp", date: "June 21, 2026", symptoms: "Seasonal cold", diagnosis: "Upper respiratory infection",
        prescriptions: [{ medicine: "Paracetamol 500mg", dosage: "1 tab TID", duration: "3 days" }], followUp: "Not required" },
    ],
  },
  { id: "P-1043", token: 13, name: "Ramesh Kumar", age: 58, gender: "Male", phone: "+91 90•••11", village: "Rampur",
    campId: currentCamp.id, status: "in-consultation",
    symptoms: "Joint pain in knees, difficulty walking long distances, occasional swelling.",
    vitals: { bp: "142/90", pulse: "76", temp: "98.4°F", weight: "72 kg" },
    volunteerNotes: "Farmer, works long hours standing. History of hypertension. Currently on Amlodipine.",
    registeredAt: "9:48 AM", visits: [] },
  { id: "P-1044", token: 14, name: "Kavya Patel", age: 7, gender: "Female", phone: "+91 87•••55", village: "Chandpur",
    campId: currentCamp.id, status: "waiting",
    symptoms: "Rashes on arms and neck, itching, especially at night.",
    vitals: { bp: "—", pulse: "102", temp: "98.9°F", weight: "22 kg" },
    volunteerNotes: "Started 4 days ago. Mother mentions new laundry detergent at home.",
    registeredAt: "9:55 AM", visits: [] },
  { id: "P-1045", token: 15, name: "Mohan Singh", age: 45, gender: "Male", phone: "+91 99•••02", village: "Rampur",
    campId: currentCamp.id, status: "completed",
    symptoms: "Chest discomfort after meals, acidity.",
    vitals: { bp: "128/82", pulse: "80", temp: "98.6°F", weight: "68 kg" },
    volunteerNotes: "Irregular meals. Smoker. Reports stress at work.",
    registeredAt: "9:10 AM",
    visits: [{ campId: currentCamp.id, campName: currentCamp.name, date: currentCamp.date, symptoms: "Chest discomfort, acidity", diagnosis: "Gastroesophageal reflux",
      prescriptions: [{ medicine: "Pantoprazole 40mg", dosage: "1 tab OD", duration: "14 days", notes: "Before breakfast" }], followUp: "Review in 2 weeks" }] },
  { id: "P-1046", token: 16, name: "Suman Devi", age: 62, gender: "Female", phone: "+91 76•••18", village: "Sitapur",
    campId: currentCamp.id, status: "waiting",
    symptoms: "Blurred vision, headaches, dizziness when standing.",
    vitals: { bp: "156/94", pulse: "78", temp: "98.6°F", weight: "60 kg" },
    volunteerNotes: "Has not measured BP in 6 months. No prior medication.",
    registeredAt: "10:02 AM", visits: [] },
];

export const medicines: Medicine[] = [
  { id: "M01", name: "Paracetamol 500mg", category: "Analgesic", stock: 420, minStock: 100, unit: "tablets", expiry: "2027-03", distributed: 128 },
  { id: "M02", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 84, minStock: 60, unit: "capsules", expiry: "2026-11", distributed: 46 },
  { id: "M03", name: "ORS Sachet", category: "Rehydration", stock: 210, minStock: 80, unit: "sachets", expiry: "2027-08", distributed: 62 },
  { id: "M04", name: "Cetirizine 10mg", category: "Antihistamine", stock: 38, minStock: 50, unit: "tablets", expiry: "2026-09", distributed: 74 },
  { id: "M05", name: "Pantoprazole 40mg", category: "Antacid", stock: 156, minStock: 60, unit: "tablets", expiry: "2027-01", distributed: 40 },
  { id: "M06", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 92, minStock: 40, unit: "tablets", expiry: "2027-05", distributed: 28 },
  { id: "M07", name: "Iron + Folic Acid", category: "Supplement", stock: 340, minStock: 100, unit: "tablets", expiry: "2027-10", distributed: 88 },
  { id: "M08", name: "Cough Syrup 100ml", category: "Respiratory", stock: 24, minStock: 30, unit: "bottles", expiry: "2026-10", distributed: 22 },
];

export const analytics = {
  ageDistribution: [
    { group: "0-12", count: 38 }, { group: "13-25", count: 42 },
    { group: "26-45", count: 78 }, { group: "46-60", count: 56 }, { group: "60+", count: 44 },
  ],
  genderDistribution: [
    { name: "Female", value: 132 }, { name: "Male", value: 108 }, { name: "Other", value: 18 },
  ],
  commonIllnesses: [
    { name: "Respiratory", count: 68 }, { name: "Hypertension", count: 52 },
    { name: "Skin", count: 38 }, { name: "Gastric", count: 34 },
    { name: "Joint pain", count: 28 }, { name: "Diabetes", count: 22 },
  ],
  medicinesDistributed: [
    { name: "Paracetamol", count: 128 }, { name: "ORS", count: 62 },
    { name: "Cetirizine", count: 74 }, { name: "Iron+FA", count: 88 },
    { name: "Pantoprazole", count: 40 }, { name: "Amoxicillin", count: 46 },
  ],
  campTrend: [
    { camp: "May 31", patients: 39 }, { camp: "Jun 7", patients: 44 },
    { camp: "Jun 14", patients: 51 }, { camp: "Jun 21", patients: 47 },
    { camp: "Jun 28", patients: 54 }, { camp: "Jul 5", patients: 68 },
    { camp: "Jul 12", patients: 42 },
  ],
};

export function buildAiSummary(p: Patient): { headline: string; bullets: string[]; flags: string[] } {
  const bullets = [
    `${p.age}y ${p.gender.toLowerCase()} from ${p.village}, presenting with: ${p.symptoms}`,
    `Vitals — BP ${p.vitals.bp}, Pulse ${p.vitals.pulse}, Temp ${p.vitals.temp}, Weight ${p.vitals.weight}`,
    `Volunteer notes: ${p.volunteerNotes}`,
  ];
  const flags: string[] = [];
  const [sys] = p.vitals.bp.split("/").map((n) => parseInt(n, 10));
  if (!isNaN(sys) && sys >= 140) flags.push("Elevated systolic BP");
  if (parseFloat(p.vitals.temp) >= 99) flags.push("Low-grade fever");
  if (p.visits.length > 0) flags.push(`${p.visits.length} prior visit(s) on record`);
  return {
    headline: `Summary for ${p.name} (Token #${p.token})`,
    bullets,
    flags,
  };
}