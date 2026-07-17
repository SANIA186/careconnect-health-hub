import { mockMedicines } from "@/mock/medicines";
import { mockPatients } from "@/mock/patients";
import type { Medicine } from "@/types/medicine";
import type { Patient, Prescription } from "@/types/patient";

export async function getMedicines(): Promise<Medicine[]> {
  await Promise.resolve();
  return mockMedicines;
}

export async function getLowStockMedicines(): Promise<Medicine[]> {
  await Promise.resolve();
  return mockMedicines.filter((medicine) => medicine.stock < medicine.minStock);
}

export async function dispenseMedicines(patientId: string, prescriptions: Prescription[]): Promise<{ patient: Patient; medicines: Medicine[] }> {
  await Promise.resolve();

  const patient = mockPatients.find((entry) => entry.id === patientId);
  if (!patient) {
    throw new Error("Patient not found.");
  }

  if (prescriptions.length === 0) {
    throw new Error("Select at least one medicine to dispense.");
  }

  const inventory = new Map<string, Medicine>();
  for (const medicine of mockMedicines) {
    inventory.set(medicine.name.toLowerCase(), medicine);
  }

  for (const prescription of prescriptions) {
    const medicineName = prescription.medicine.trim().toLowerCase();
    const medicine = inventory.get(medicineName);
    if (!medicine) {
      throw new Error(`Medicine not found in inventory: ${prescription.medicine}`);
    }
    if (medicine.stock <= 0) {
      throw new Error(`Insufficient stock for ${prescription.medicine}.`);
    }
  }

  for (const prescription of prescriptions) {
    const medicineName = prescription.medicine.trim().toLowerCase();
    const medicine = inventory.get(medicineName);
    if (!medicine) continue;
    medicine.stock -= 1;
    medicine.distributed += 1;
  }

  patient.medicineDispensed = true;
  return { patient, medicines: mockMedicines };
}
