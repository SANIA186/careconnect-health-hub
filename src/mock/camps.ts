import type { Camp } from "@/types/camp";

export const mockCamps: Camp[] = [
  {
    id: "camp-2026-07-12",
    name: "Sunday Camp — Rampur Village",
    date: "July 12, 2026",
    location: "Rampur Community Hall",
    patientsServed: 42,
    status: "active",
    volunteers: 8,
    doctors: 3,
  },
  {
    id: "camp-2026-07-05",
    name: "Sunday Camp — Bhilwara",
    date: "July 5, 2026",
    location: "Bhilwara Panchayat",
    patientsServed: 68,
    status: "completed",
    volunteers: 10,
    doctors: 4,
  },
  {
    id: "camp-2026-06-28",
    name: "Sunday Camp — Sitapur",
    date: "June 28, 2026",
    location: "Sitapur School",
    patientsServed: 54,
    status: "completed",
    volunteers: 7,
    doctors: 3,
  },
  {
    id: "camp-2026-06-21",
    name: "Sunday Camp — Devgarh",
    date: "June 21, 2026",
    location: "Devgarh Temple Ground",
    patientsServed: 47,
    status: "completed",
    volunteers: 6,
    doctors: 2,
  },
  {
    id: "camp-2026-07-19",
    name: "Sunday Camp — Kotra",
    date: "July 19, 2026",
    location: "Kotra Health Sub-Centre",
    patientsServed: 0,
    status: "upcoming",
    volunteers: 0,
    doctors: 0,
  },
];

export const mockCurrentCamp = mockCamps[0];
