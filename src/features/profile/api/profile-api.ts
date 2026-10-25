import { getMockProfile, saveMockProfile } from "~/mocks/profile";
import type { Profile } from "~/types/profile";

// Mock-backed for now. When the backend exists, only these bodies change.

export async function getProfile(): Promise<Profile | null> {
  return getMockProfile();
}

export async function saveProfile(profile: Profile): Promise<Profile> {
  return saveMockProfile(profile);
}
