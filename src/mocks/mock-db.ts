import type { Profile } from "~/types/profile";
import type { MockProgress } from "./progress";
import type { Path } from "./paths/types";
import type { PrivateLeague, LeagueMessages } from "~/types/private-leagues";

// Stands in for the backend's database so the mock user survives a reload.
// Client-only: it reads localStorage. Deleted along with mocks/ when the real
// backend lands.
const STORAGE_KEY = "devspace-mock-db";

type MockDb = {
  profile: Profile | null;
  // Absent until the learner earns something; defaults fill in.
  progress: Partial<MockProgress> | null;
  customPaths?: Record<string, Path>;
  pathHistory?: string[];
  // Intros the learner has already clicked through, by id.
  seenPageIntroductions?: Record<string, boolean>;
  privateLeagues?: PrivateLeague[];
  privateLeagueMessages?: LeagueMessages;
  retiredPrivateLeagueCodes?: string[];
  h2hRivalId?: string;
  h2hRivalWeek?: number;
};

const emptyDb: MockDb = { profile: null, progress: null };

export function readDb(): MockDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...emptyDb, ...JSON.parse(raw) } : emptyDb;
  } catch {
    return emptyDb;
  }
}

export function writeDb(db: MockDb) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}
