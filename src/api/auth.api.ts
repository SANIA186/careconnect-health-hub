import { mockUsers } from "@/mock/users";
import type { User, UserRole } from "@/types/user";

export async function loginUser(emailOrPhone: string, password: string): Promise<User | null> {
  await Promise.resolve();

  const normalized = emailOrPhone.trim().toLowerCase();
  const user = mockUsers.find((entry) => {
    const matchesEmail = entry.email.toLowerCase() === normalized;
    const matchesPhone = entry.phone.replace(/\s+/g, "") === normalized.replace(/\s+/g, "");
    return matchesEmail || matchesPhone;
  });

  if (!user || !password) {
    return null;
  }

  return user;
}

export async function getUserByRole(role: UserRole): Promise<User | null> {
  await Promise.resolve();
  return mockUsers.find((user) => user.role === role) ?? null;
}
