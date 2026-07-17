import { mockCamps, mockCurrentCamp } from "@/mock/camps";
import type { Camp } from "@/types/camp";

export async function getCamps(): Promise<Camp[]> {
  await Promise.resolve();
  return mockCamps;
}

export async function getCurrentCamp(): Promise<Camp> {
  await Promise.resolve();
  return mockCurrentCamp;
}
