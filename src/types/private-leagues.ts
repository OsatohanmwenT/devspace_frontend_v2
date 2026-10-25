import type { LeaderboardEntry } from "./leaderboard";

export type PrivateLeague = {
  id: string;
  name: string;
  emoji: string;
  kind: "friends" | "class";
  code: string;
  ownerId?: "you" | null;
  organizerOnly?: boolean;
  memberRivalIds?: string[];
  createdAt?: number;
};

export type LeagueMessage = { id: string; authorId: string; name: string; text: string; at: number };
export type LeagueMessages = Record<string, Record<string, LeagueMessage[]>>;

export type PrivateLeagueParticipant = LeaderboardEntry & {
  daily: number[];
  last7: number;
  activeDays: number;
  lastActive: number | null;
};

export type PrivateLeagueData = PrivateLeague & {
  ownerId: "you" | null;
  memberRivalIds: string[];
  standings: PrivateLeagueParticipant[];
  capacity: number;
  openSpots: number;
  daysIn: number;
  dailyTotals: number[];
  leadId: string;
};

export type PrivateLeaguesData = { leagues: PrivateLeagueData[]; messages: LeagueMessages; seasonIndex: number };
