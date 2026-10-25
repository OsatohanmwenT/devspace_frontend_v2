import type { Profile } from "~/types/profile";
import { readDb, writeDb } from "./mock-db";

export function getMockProfile(): Profile | null {
  return readDb().profile;
}

export function saveMockProfile(profile: Profile): Profile {
  writeDb({ ...readDb(), profile });
  return profile;
}
