import { describe, expect, it } from "vitest";
import { buildStandings } from "./leagues";

describe("Bronze standings", () => {
  it("ranks the learner by season coins and keeps the rival roles used by By path", () => {
    const standings = buildStandings(60, "Backend Developer");
    const learner = standings.find((entry) => entry.isCurrentUser);

    expect(standings).toHaveLength(30);
    expect(learner?.role).toBe("Backend Developer path");
    expect(learner?.rank).toBe(7);
    expect(standings.filter((entry) => entry.role === learner?.role).length).toBeGreaterThan(1);
    expect(standings.map((entry) => entry.rank)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1));
  });
});
