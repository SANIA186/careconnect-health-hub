export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = "ApiError";
  }
}

/**
 * Shared fetch utility that automatically attaches the JWT token
 * and handles common errors like 401 Unauthorized.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const headers = new Headers(options.headers || {});
  
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = localStorage.getItem("access_token") || localStorage.getItem("token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      if (response.status === 401) {
        // Handle token expiration/unauthorized access
        console.warn("API request failed with 401 Unauthorized. Clearing local tokens.");
        localStorage.removeItem("access_token");
        localStorage.removeItem("token");
        // We could emit an event here to notify the app to redirect to login
        window.dispatchEvent(new Event("auth-unauthorized"));
      }
      
      let errorData;
      try {
        errorData = await response.json();
      } catch (err) {
        errorData = { message: response.statusText };
      }
      
      throw new ApiError(response.status, errorData.message || response.statusText, errorData);
    }

    // Handle empty responses
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    // Network errors
    console.error("API Request Failed:", error);
    throw new Error("Network error or API is unreachable");
  }
}
