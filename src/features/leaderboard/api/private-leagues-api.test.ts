import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createPrivateLeague, getPrivateLeagues, joinPrivateLeague, leavePrivateLeague, postLeagueMessage, updatePrivateLeague } from "./private-leagues-api";

beforeEach(() => {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
  });
  localStorage.setItem("devspace-mock-db", JSON.stringify({ profile: { pathId: "machine-learning" }, progress: { xp: 25, seasonCoins: 5 } }));
});

afterEach(() => vi.unstubAllGlobals());

describe("private league flows", () => {
  it("creates a populated friends league that survives reopening and leaves official progress intact", async () => {
    const { data, id } = await createPrivateLeague("Study Crew", "🚀", "friends", true);
    const league = data.leagues.find((entry) => entry.id === id)!;
    expect(league.organizerOnly).toBe(false);
    expect(league.code).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    expect(league.standings.length).toBeGreaterThanOrEqual(5);
    expect(league.standings.find((entry) => entry.isCurrentUser)?.score).toBe(5);
    expect((await getPrivateLeagues()).leagues[0].memberRivalIds).toEqual(league.memberRivalIds);
    expect(JSON.parse(localStorage.getItem("devspace-mock-db")!).progress).toEqual({ xp: 25, seasonCoins: 5 });
  });

  it("keeps a class organizer off the standings", async () => {
    const { data } = await createPrivateLeague("Coding Cup", "🏆", "class", true);
    expect(data.leagues[0].standings.length).toBeGreaterThanOrEqual(18);
    expect(data.leagues[0].standings.some((entry) => entry.isCurrentUser)).toBe(false);
    expect(data.leagues[0].leadId).toBe("you");
  });

  it("validates codes and prevents joining your own league or the same joined league twice", async () => {
    const { data } = await createPrivateLeague("My League", "🚀", "friends", false);
    await expect(joinPrivateLeague(data.leagues[0].code)).rejects.toThrow("your own league");
    await expect(joinPrivateLeague("O0I1AB")).rejects.toThrow("double-check");
    const joined = await joinPrivateLeague("ABC234");
    expect(joined.data.leagues.find((entry) => entry.id === joined.id)?.ownerId).toBeNull();
    await expect(joinPrivateLeague("ABC234")).rejects.toThrow("already in");
    await leavePrivateLeague(joined.id);
    expect((await joinPrivateLeague("ABC234")).id).toBe(joined.id);
  });

  it("removes a member without filling the freed spot and retires regenerated invite codes", async () => {
    const { data, id } = await createPrivateLeague("Study Crew", "🚀", "friends", false);
    const league = data.leagues[0];
    const updated = await updatePrivateLeague(id, { removeMember: league.memberRivalIds[0], name: "New name" });
    expect(updated.leagues[0].memberRivalIds.length).toBe(league.memberRivalIds.length - 1);
    expect(updated.leagues[0].openSpots).toBe(league.openSpots + 1);
    expect(updated.leagues[0].name).toBe("New name");
    await updatePrivateLeague(id, { regenerateCode: true });
    await expect(joinPrivateLeague(league.code)).rejects.toThrow("expired");
    expect((await getPrivateLeagues()).leagues[0].memberRivalIds).toEqual(updated.leagues[0].memberRivalIds);
  });

  it("saves messages and restricts announcements and settings to the league owner", async () => {
    const { id } = await createPrivateLeague("Study Crew", "🚀", "friends", false);
    await postLeagueMessage(id, "general", "A saved message");
    expect((await getPrivateLeagues()).messages[id].general.at(-1)?.text).toBe("A saved message");
    const joined = await joinPrivateLeague("ABC234");
    await expect(postLeagueMessage(joined.id, "announcements", "Not the lead")).rejects.toThrow("Only the lead");
    await expect(updatePrivateLeague(joined.id, { name: "Changed" })).rejects.toThrow("Only the league owner");
    await leavePrivateLeague(id);
    expect((await getPrivateLeagues()).messages[id]).toBeUndefined();
  });
});
