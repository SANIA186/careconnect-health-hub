export type UserRole = "volunteer" | "doctor" | "pharmacist" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}
