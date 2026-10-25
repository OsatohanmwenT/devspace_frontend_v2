import { buildMockHome } from "~/mocks/home";
import { getMockProfile } from "~/mocks/profile";
import type { HomeData } from "~/types/home";

// Mock-backed for now. When the backend exists, only this body changes.
export async function getHome(): Promise<HomeData | null> {
  const profile = getMockProfile();
  return profile ? buildMockHome(profile) : null;
}
