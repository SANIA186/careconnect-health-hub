import type { Medicine } from "@/types/medicine";

export const mockMedicines: Medicine[] = [
  { id: "M01", name: "Paracetamol 500mg", category: "Analgesic", stock: 420, minStock: 100, unit: "tablets", expiry: "2027-03", distributed: 128 },
  { id: "M02", name: "Amoxicillin 250mg", category: "Antibiotic", stock: 84, minStock: 60, unit: "capsules", expiry: "2026-11", distributed: 46 },
  { id: "M03", name: "ORS Sachet", category: "Rehydration", stock: 210, minStock: 80, unit: "sachets", expiry: "2027-08", distributed: 62 },
  { id: "M04", name: "Cetirizine 10mg", category: "Antihistamine", stock: 38, minStock: 50, unit: "tablets", expiry: "2026-09", distributed: 74 },
  { id: "M05", name: "Pantoprazole 40mg", category: "Antacid", stock: 156, minStock: 60, unit: "tablets", expiry: "2027-01", distributed: 40 },
  { id: "M06", name: "Amlodipine 5mg", category: "Antihypertensive", stock: 92, minStock: 40, unit: "tablets", expiry: "2027-05", distributed: 28 },
  { id: "M07", name: "Iron + Folic Acid", category: "Supplement", stock: 340, minStock: 100, unit: "tablets", expiry: "2027-10", distributed: 88 },
  { id: "M08", name: "Cough Syrup 100ml", category: "Respiratory", stock: 24, minStock: 30, unit: "bottles", expiry: "2026-10", distributed: 22 },
];
