import { getCamps, getCurrentCamp } from "./camp.api";
import { apiClient } from "./client";

// ─── Backend response types ───────────────────────────────────────────────────

interface OverviewResponse {
  total_patients: number;
  total_consultations: number;
  total_camps: number;
  total_medicines_dispensed: number;
}

interface PatientReportResponse {
  total_registrations: number;
  gender_distribution: Record<string, number>;
  age_groups: Record<string, number>;
  village_wise_patients: Record<string, number>;
}

interface ConsultationReportResponse {
  total_consultations: number;
  completed_consultations: number;
  pending_consultations: number;
  common_diagnoses: { diagnosis: string; count: number }[];
}

interface MedicineReportResponse {
  total_medicines: number;
  total_dispensed: number;
  low_stock_count: number;
  low_stock_medicines: { id: string; medicine_name: string; stock_quantity: number; reorder_level: number }[];
  top_used_medicines: { medicine_name: string; total_dispensed: number }[];
}

interface CampReportResponse {
  total_camps: number;
  active_camps: number;
  completed_camps: number;
  upcoming_camps: number;
  patients_per_camp: { camp_name: string; status: string; patients: number }[];
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getReportAnalytics() {
  // Fetch all report data in parallel from real backend endpoints
  const [overview, patientReport, consultationReport, medicineReport, campReport, camps, currentCamp] =
    await Promise.all([
      apiClient<OverviewResponse>("/reports/overview"),
      apiClient<PatientReportResponse>("/reports/patients"),
      apiClient<ConsultationReportResponse>("/reports/consultations"),
      apiClient<MedicineReportResponse>("/reports/medicine"),
      apiClient<CampReportResponse>("/reports/camps"),
      getCamps(),
      getCurrentCamp(),
    ]);

  // Map age groups from backend keys to chart-friendly labels
  const ageGroupMap: Record<string, string> = {
    "0-18": "0-18",
    "19-35": "19-35",
    "36-60": "36-60",
    "60+": "60+",
  };
  const ageDistribution = Object.entries(patientReport.age_groups).map(([group, count]) => ({
    group: ageGroupMap[group] ?? group,
    count,
  }));

  // Map gender distribution
  const genderDistribution = Object.entries(patientReport.gender_distribution).map(([name, value]) => ({
    name,
    value,
  }));

  // Map common diagnoses → "common illnesses" chart
  const commonIllnesses = consultationReport.common_diagnoses.map((d) => ({
    name: d.diagnosis,
    count: d.count,
  }));

  // Map top used medicines → medicines distributed chart
  const medicinesDistributed = medicineReport.top_used_medicines.map((m) => ({
    name: m.medicine_name,
    count: m.total_dispensed,
  }));

  // Camp trend: patients per camp from backend
  const campTrend = campReport.patients_per_camp.map((c) => ({
    camp: c.camp_name,
    patients: c.patients,
  }));

  return {
    // Current active camp for camp report panel
    currentCamp: currentCamp ?? (camps[0] ?? null),
    // All camps for the "All camps" list
    camps,
    // Summary totals
    totals: {
      patients: overview.total_patients,
      consultations: overview.total_consultations,
      medicines: overview.total_medicines_dispensed,
      // Referrals not tracked as a separate metric in the backend; default to Unsupported
      referrals: "Unsupported",
    },
    // Detailed camp-level stats for CampReport panel
    campStats: {
      consultations: consultationReport.total_consultations,
      completedConsultations: consultationReport.completed_consultations,
      // Prescriptions count isn't a separate endpoint; use total dispensed as proxy
      prescriptions: medicineReport.total_dispensed,
    },
    // Chart data for Analytics panel
    analytics: {
      ageDistribution,
      genderDistribution,
      commonIllnesses,
      medicinesDistributed,
      campTrend,
    },
  };
}
