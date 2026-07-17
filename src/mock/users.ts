import type { User } from "@/types/user";

export const mockUsers: User[] = [
  {
    id: "U-001",
    name: "Priya Sharma",
    email: "priya@ngo.org",
    phone: "+91 9876543210",
    role: "volunteer",
    active: true,
    createdAt: "2026-07-01",
  },
  {
    id: "U-002",
    name: "Dr. Meera Iyer",
    email: "meera@ngo.org",
    phone: "+91 9876543211",
    role: "doctor",
    active: true,
    createdAt: "2026-06-25",
  },
  {
    id: "U-003",
    name: "Ravi Shah",
    email: "ravi@ngo.org",
    phone: "+91 9876543212",
    role: "pharmacist",
    active: true,
    createdAt: "2026-06-28",
  },
  {
    id: "U-004",
    name: "Asha Rao",
    email: "asha@ngo.org",
    phone: "+91 9876543213",
    role: "admin",
    active: true,
    createdAt: "2026-05-18",
  },
];
