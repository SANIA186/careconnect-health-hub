export interface VisitRecord {
  id: string;
  patientId: string;
  campId: string;
  visitDate: string;
  diagnosis: string;
  notes: string;
  prescriptions: string[];
}
