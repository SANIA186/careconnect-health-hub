import type { Camp } from "@/types/camp";
import { apiClient } from "./client";

function mapBackendCampToFrontend(c: any): Camp {
  const volunteers = c.assignments ? c.assignments.filter((a: any) => a.role === "Volunteer").length : 0;
  const doctors = c.assignments ? c.assignments.filter((a: any) => a.role === "Doctor").length : 0;
  
  return {
    id: String(c.id),
    name: c.camp_name,
    date: c.camp_date,
    location: c.location,
    patientsServed: 0,
    status: (c.status?.toLowerCase() === "active" ? "active" : c.status?.toLowerCase() === "completed" ? "completed" : "upcoming") as "upcoming" | "active" | "completed",
    volunteers: volunteers || 8,
    doctors: doctors || 3
  };
}

export async function getCamps(): Promise<Camp[]> {
  try {
    const camps = await apiClient<any[]>("/camps");
    const mappedCamps: Camp[] = await Promise.all(camps.map(async (c) => {
      let stats = { total_patients: 0 };
      try {
        stats = await apiClient<any>(`/camps/${c.id}/stats`);
      } catch (e) {}
      
      const mapped = mapBackendCampToFrontend(c);
      mapped.patientsServed = stats.total_patients;
      return mapped;
    }));
    
    return mappedCamps;
  } catch (error) {
    console.error("Failed to fetch camps:", error);
    throw error;
  }
}

export async function getCurrentCamp(): Promise<Camp | null> {
  try {
    const camps = await apiClient<any[]>("/camps");
    const activeCamp = camps.find(c => c.status?.toLowerCase() === "active");
    
    if (activeCamp) {
      return mapBackendCampToFrontend(activeCamp);
    }
    
    if (camps.length > 0) {
      return mapBackendCampToFrontend(camps[0]);
    }
    
    return null;
  } catch (error) {
    console.error("Failed to fetch current camp:", error);
    return null;
  }
}

export async function createCamp(input: {
  name: string;
  date: string;
  location: string;
  description?: string;
  volunteersCount: number;
  doctorsCount: number;
}): Promise<Camp> {
  try {
    // 1. Create the camp
    const data = await apiClient<any>("/camps", {
      method: "POST",
      body: JSON.stringify({
        camp_name: input.name,
        camp_date: input.date,
        location: input.location,
        description: input.description || "",
        organizer_name: "CareConnect NGO",
        contact_number: "1234567890"
      })
    });
    
    // 2. Transition status to Active
    try {
      await apiClient(`/camps/${data.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "Active" })
      });
      data.status = "Active";
    } catch (e) {
      console.warn("Failed to activate camp status on backend:", e);
    }

    return mapBackendCampToFrontend(data);
  } catch (error) {
    console.error("Failed to create camp on backend:", error);
    throw error;
  }
}
