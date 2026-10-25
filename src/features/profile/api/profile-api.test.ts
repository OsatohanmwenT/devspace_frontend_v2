import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Profile } from "~/types/profile";
import { getProfile, saveProfile } from "./profile-api";

const profile: Profile = {
  branch: "software",
  branchAnswer: "software",
  role: "frontend_developer",
  roleAnswer: "frontend_developer",
  stack: "react",
  javascriptExperience: "some_javascript",
  frameworkDecision: "complete",
  motivation: "career_change",
  experience: "beginner",
  rung: 1,
  startingPoint: null,
  projectInterest: ["web_apps"],
  immediateNeed: [],
  dailyMinutes: 15,
  pathId: "frontend-developer",
  completedAt: "Sat Oct 10 2026",
};

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

describe("profile api (mock-backed)", () => {
  it("has no profile before onboarding", async () => {
    expect(await getProfile()).toBeNull();
  });

  it("returns the saved profile on a later read", async () => {
    await saveProfile(profile);
    expect(await getProfile()).toEqual(profile);
  });

  it("falls back to no profile when stored data is corrupt", async () => {
    localStorage.setItem("devspace-mock-db", "{not json");
    expect(await getProfile()).toBeNull();
  });
});
