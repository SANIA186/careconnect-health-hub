import type { User, UserRole } from "@/types/user";
import { apiClient, ApiError } from "./client";

export async function loginUser(
  emailOrPhone: string,
  password: string
): Promise<User | null> {
  try {
    const data = await apiClient<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: emailOrPhone.trim(),
        password,
      }),
    });

    if (data.access_token) {
      // Store JWT for all API requests
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token", data.access_token);

      if (data.user) {
        return { ...data.user } as User;
      }
    }

    return null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      console.error("Login failed: Invalid credentials");
      return null;
    }
    console.error("Login failed:", error);
    throw error;
  }
}

export async function validateToken(): Promise<User | null> {
  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  if (!token) return null;

  try {
    const data = await apiClient<{ user: User }>("/auth/me");
    if (data.user) {
      return data.user;
    }
  } catch (error) {
    console.error("Token validation failed:", error);
    localStorage.removeItem("access_token");
    localStorage.removeItem("token");
  }

  return null;
}

export async function getUserByRole(
  role: UserRole
): Promise<User | null> {
  // Not yet implemented on backend — returns null until a /users?role= endpoint is added
  void role;
  return null;
}