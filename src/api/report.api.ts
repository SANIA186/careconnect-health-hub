import { mockCamps, mockCurrentCamp } from "@/mock/camps";
import { mockPatients } from "@/mock/patients";
import { mockMedicines } from "@/mock/medicines";

export async function getReportAnalytics() {
  await Promise.resolve();
  return {
    currentCamp: mockCurrentCamp,
    camps: mockCamps,
    patients: mockPatients,
    medicines: mockMedicines,
    totals: {
      patients: mockPatients.length,
      consultations: mockPatients.filter((patient) => patient.status === "completed").length + 41,
      medicines: mockMedicines.reduce((sum, medicine) => sum + medicine.distributed, 0),
      referrals: 17,
    },
  };
}
