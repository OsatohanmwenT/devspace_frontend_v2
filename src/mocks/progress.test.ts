import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getMockProgress } from "./progress";
import { getStandings } from "./leaderboard/league-sim";
import { getSeasonIndex } from "./leaderboard/season";

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
});

afterEach(() => vi.unstubAllGlobals());

describe("sample learner progress", () => {
  it("populates the preview for an onboarded learner without writing achievements to storage", () => {
    const saved = JSON.stringify({ profile: { pathId: "machine-learning" }, progress: null });
    localStorage.setItem("devspace-mock-db", saved);

    const progress = getMockProgress("Mon Oct 19 2026");

    expect(progress.seasonCoins).toBe(5);
    expect(progress.xp).toBe(25);
    expect(progress.earnedStreakMilestones).toEqual([]);
    expect(progress.streakDays).toBe(1);
    expect(progress.streakActivityDates.at(-1)).toBe("Mon Oct 19 2026");
    expect(Object.values(progress.completedLessons).some((lesson) => lesson.completedAt === "Mon Oct 19 2026")).toBe(true);
    const timestamp = new Date(2026, 9, 19, 14).getTime();
    const standings = getStandings(getSeasonIndex(timestamp), 0, progress.seasonCoins, timestamp, "Machine Learning Engineer path");
    const userIndex = standings.findIndex((entry) => entry.isCurrentUser);
    expect(standings.slice(userIndex - 2, userIndex + 1).map(({ rank, name, score }) => ({ rank, name, score }))).toEqual([
      { rank: 23, name: "Clara Bianchi", score: 6 },
      { rank: 24, name: "Omar Haddad", score: 5 },
      { rank: 25, name: "You", score: 5 },
    ]);
    expect(localStorage.getItem("devspace-mock-db")).toBe(saved);
  });

  it("retains explicitly saved progress, including the reference's zero-progress state", () => {
    localStorage.setItem("devspace-mock-db", JSON.stringify({ profile: { pathId: "machine-learning" }, progress: { xp: 0, seasonCoins: 0 } }));
    const progress = getMockProgress("Mon Oct 19 2026");
    expect(progress.xp).toBe(0);
    expect(progress.seasonCoins).toBe(0);
    expect(progress.completedLessons).toEqual({});
  });
});
