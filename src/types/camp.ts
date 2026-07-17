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
