import { LEAGUE_CHANNELS, LEAGUE_EMOJIS, LEAGUE_KINDS } from "~/config/private-leagues";
import { hashString } from "~/lib/rng";
import { rivalDailyCoins } from "~/mocks/leaderboard/league-sim";
import { derivePrivateLeague, generateInviteCode, pickPrivateMembers } from "~/mocks/leaderboard/private-leagues";
import { rivals } from "~/mocks/leaderboard/rivals";
import { getSeasonIndex, getSeasonProgress } from "~/mocks/leaderboard/season";
import { readDb, writeDb } from "~/mocks/mock-db";
import { getPath } from "~/mocks/paths/get-path";
import { getMockProgress } from "~/mocks/progress";
import type { LeagueMessage, PrivateLeague, PrivateLeagueData, PrivateLeaguesData } from "~/types/private-leagues";

export async function getPrivateLeagues(timestamp = Date.now()): Promise<PrivateLeaguesData> {
  const db = readDb();
  const progress = getMockProgress();
  const seasonIndex = getSeasonIndex(timestamp);
  const seasonProgress = getSeasonProgress(timestamp);
  const today = Math.min(27, Math.floor(seasonProgress * 28));
  const userRole = db.profile ? `${getPath(db.profile.pathId).title} path` : "Learner";
  const leagues: PrivateLeagueData[] = (db.privateLeagues ?? []).map((stored) => {
    const memberRivalIds = stored.memberRivalIds ?? pickPrivateMembers(stored.id, stored.kind);
    const entries = memberRivalIds.flatMap((id) => {
      const rival = rivals.find((person) => person.id === id);
      if (!rival) return [];
      return [{ id, name: rival.name, role: rival.role, tag: rival.tag, isCurrentUser: false, daily: rivalDailyCoins(rival, seasonIndex, 0, seasonProgress) }];
    });
    if (!stored.organizerOnly) {
      const daily = Array<number>(28).fill(0);
      daily[today] = progress.seasonCoins;
      entries.push({ id: "you", name: "You", role: userRole, tag: null, isCurrentUser: true, daily });
    }
    const standings = entries.map((entry) => ({ ...entry, score: entry.daily.reduce((sum, coins) => sum + coins, 0) }))
      .sort((a, b) => b.score - a.score || hashString(a.id) - hashString(b.id))
      .map((entry, index) => {
        const lastActiveIndex = entry.daily.slice(0, today + 1).findLastIndex((coins) => coins > 0);
        return { ...entry, rank: index + 1, delta: null, last7: entry.daily.slice(Math.max(0, today - 6), today + 1).reduce((sum, coins) => sum + coins, 0), activeDays: entry.daily.filter((coins) => coins > 0).length, lastActive: lastActiveIndex === -1 ? null : today - lastActiveIndex };
      });
    const ownerId = stored.ownerId === undefined ? "you" : stored.ownerId;
    const seats = LEAGUE_KINDS[stored.kind].seats - (stored.kind === "class" && !stored.organizerOnly ? 1 : 0);
    return {
      ...stored, ownerId, memberRivalIds, standings,
      capacity: seats + (stored.organizerOnly ? 0 : 1),
      openSpots: Math.max(0, seats - memberRivalIds.length),
      daysIn: today + 1,
      dailyTotals: Array.from({ length: 28 }, (_, day) => standings.reduce((sum, entry) => sum + entry.daily[day], 0)),
      leadId: ownerId === "you" ? "you" : memberRivalIds[0],
    };
  });
  const messages: PrivateLeaguesData["messages"] = {};
  for (const league of leagues) {
    messages[league.id] = {};
    for (const channel of LEAGUE_CHANNELS) {
      const samples: LeagueMessage[] = league.standings.filter((entry) => !entry.isCurrentUser).slice(0, 2).map((entry, index) => ({
        id: `sample-${channel.id}-${index}`, authorId: entry.id, name: entry.name,
        text: channel.id === "general" ? ["Morning all — anyone else doing a lesson before class?", "Anyone want to pair up on the next module?"][index]
          : channel.id === "help" ? ["Stuck on the checkpoint question about loops — any hints without spoilers?", "What’s the best order to do the review questions in?"][index]
            : channel.id === "wins" ? ["Finished the whole first module today 🎉", "Cleared a checkpoint first try — finally!"][index]
              : "Welcome, everyone! Aim for a little progress most days rather than one big push.",
        at: (league.createdAt ?? timestamp) - (2 - index) * 3_600_000,
      }));
      const seeded = channel.leadOnly ? league.leadId === "you" ? [] : samples.slice(0, 1).map((message) => ({ ...message, authorId: league.leadId, name: league.standings.find((entry) => entry.id === league.leadId)?.name ?? "Lead" })) : samples;
      messages[league.id][channel.id] = [...seeded, ...(db.privateLeagueMessages?.[league.id]?.[channel.id] ?? [])];
    }
    for (const [key, posts] of Object.entries(db.privateLeagueMessages?.[league.id] ?? {})) {
      if (key.startsWith("dm:")) messages[league.id][key] = posts;
    }
  }
  return { leagues, messages, seasonIndex };
}

export async function createPrivateLeague(name: string, emoji: string, kind: PrivateLeague["kind"], organizerOnly: boolean) {
  if (!name.trim()) throw new Error("Enter a league name.");
  const db = readDb();
  const code = generateInviteCode([...(db.privateLeagues ?? []).map((league) => league.code), ...(db.retiredPrivateLeagueCodes ?? [])]);
  const id = `private-${crypto.randomUUID()}`;
  const league: PrivateLeague = { id, name: name.trim().slice(0, 40), emoji: LEAGUE_EMOJIS.includes(emoji) ? emoji : LEAGUE_EMOJIS[0], kind, organizerOnly: kind === "class" && organizerOnly, code, ownerId: "you", memberRivalIds: pickPrivateMembers(id, kind), createdAt: Date.now() };
  writeDb({ ...db, privateLeagues: [...(db.privateLeagues ?? []), league] });
  return { data: await getPrivateLeagues(), id };
}

export async function joinPrivateLeague(value: string) {
  const code = value.trim().toUpperCase();
  if (!/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/.test(code)) throw new Error("Invite codes are 6 letters and numbers — double-check it.");
  const db = readDb();
  const existing = db.privateLeagues?.find((league) => league.code === code);
  if (existing) throw new Error(existing.ownerId === null ? `You’re already in ${existing.name}.` : `That’s the code for ${existing.name} — your own league.`);
  if (db.retiredPrivateLeagueCodes?.includes(code)) throw new Error("That invite code has expired. Ask for a new code.");
  const league = derivePrivateLeague(code);
  writeDb({ ...db, privateLeagues: [...(db.privateLeagues ?? []), league] });
  return { data: await getPrivateLeagues(), id: league.id };
}

export async function updatePrivateLeague(id: string, changes: { name?: string; removeMember?: string; regenerateCode?: boolean }) {
  const db = readDb();
  const league = db.privateLeagues?.find((entry) => entry.id === id);
  if (!league || league.ownerId === null) throw new Error("Only the league owner can change these settings.");
  const next = { ...league };
  if (changes.name !== undefined) {
    if (!changes.name.trim()) throw new Error("Enter a league name.");
    next.name = changes.name.trim().slice(0, 40);
  }
  if (changes.removeMember) next.memberRivalIds = (league.memberRivalIds ?? pickPrivateMembers(id, league.kind)).filter((member) => member !== changes.removeMember);
  if (changes.regenerateCode) next.code = generateInviteCode([...(db.privateLeagues ?? []).map((entry) => entry.code), ...(db.retiredPrivateLeagueCodes ?? [])]);
  writeDb({ ...db, privateLeagues: db.privateLeagues?.map((entry) => entry.id === id ? next : entry), retiredPrivateLeagueCodes: changes.regenerateCode ? [...(db.retiredPrivateLeagueCodes ?? []), league.code] : db.retiredPrivateLeagueCodes });
  return getPrivateLeagues();
}

export async function leavePrivateLeague(id: string) {
  const db = readDb();
  const league = db.privateLeagues?.find((entry) => entry.id === id);
  const messages = { ...db.privateLeagueMessages };
  delete messages[id];
  writeDb({ ...db, privateLeagues: db.privateLeagues?.filter((entry) => entry.id !== id), privateLeagueMessages: messages, retiredPrivateLeagueCodes: league && league.ownerId !== null ? [...(db.retiredPrivateLeagueCodes ?? []), league.code] : db.retiredPrivateLeagueCodes });
  return getPrivateLeagues();
}

export async function postLeagueMessage(id: string, channel: string, text: string) {
  const db = readDb();
  const league = db.privateLeagues?.find((entry) => entry.id === id);
  if (!league || !text.trim()) throw new Error("Enter a message.");
  if (channel === "announcements" && league.ownerId === null) throw new Error("Only the lead can post in announcements.");
  if (!LEAGUE_CHANNELS.some((entry) => entry.id === channel) && !channel.startsWith("dm:")) throw new Error("Unknown conversation.");
  if (channel.startsWith("dm:") && !(league.memberRivalIds ?? pickPrivateMembers(id, league.kind)).includes(channel.slice(3))) throw new Error("This person is no longer in the league.");
  const message: LeagueMessage = { id: crypto.randomUUID(), authorId: "you", name: "You", text: text.trim().slice(0, 2000), at: Date.now() };
  const chats = db.privateLeagueMessages ?? {};
  writeDb({ ...db, privateLeagueMessages: { ...chats, [id]: { ...chats[id], [channel]: [...(chats[id]?.[channel] ?? []), message] } } });
  return getPrivateLeagues();
}
