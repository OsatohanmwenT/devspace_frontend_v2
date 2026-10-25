import { LEAGUE_EMOJIS } from "~/config/private-leagues";
import { seededRandom } from "~/lib/rng";
import type { PrivateLeague } from "~/types/private-leagues";
import { rivals } from "./rivals";

export const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateInviteCode(existing: string[]) {
  let code: string;
  do {
    code = Array.from({ length: 6 }, () => CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]).join("");
  } while (existing.includes(code));
  return code;
}

export function pickPrivateMembers(seed: string, kind: PrivateLeague["kind"]) {
  const random = seededRandom("private-members", seed);
  const count = kind === "class" ? 18 + Math.floor(random() * 11) : 4 + Math.floor(random() * 3);
  const pool = [...rivals];
  for (let index = pool.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [pool[index], pool[swap]] = [pool[swap], pool[index]];
  }
  return pool.slice(0, count).map((rival) => rival.id);
}

export function derivePrivateLeague(code: string): PrivateLeague {
  const random = seededRandom("private-league", code);
  const adjectives = ["Midnight", "Steady", "Bright", "Quiet", "Rapid", "Golden", "Northern", "Prime"];
  const nouns = ["Coders", "Learners", "Builders", "Crew", "Circle", "Squad", "Collective", "League"];
  return {
    id: `private-${code}`,
    name: `${adjectives[Math.floor(random() * adjectives.length)]} ${nouns[Math.floor(random() * nouns.length)]}`,
    emoji: LEAGUE_EMOJIS[Math.floor(random() * LEAGUE_EMOJIS.length)],
    code,
    kind: "friends",
    ownerId: null,
    memberRivalIds: pickPrivateMembers(code, "friends"),
    createdAt: Date.now(),
  };
}
