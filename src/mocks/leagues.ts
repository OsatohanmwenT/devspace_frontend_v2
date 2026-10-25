import type { StandingEntry } from "~/types/home";

export const COHORT_SIZE = 30;

// Every learner starts in Bronze. Higher tiers arrive with the Leaderboard.
export const BRONZE = {
  name: "Bronze League",
  color: "#d98a52",
  promotePercent: 0.15,
};

// A stand-in cohort: a fixed field of rivals with falling scores, so the
// learner's rank follows from their own season coins.
const RIVALS = [
  "Stefano D'Avascio", "Nuriye Sarıca", "Varun Yadav", "Pranay Goud", "Narduccio van der Veekens",
  "Amara Kim", "Jonas Berg", "Priya Sharma", "Leo Ferreira", "Mina Torres", "Hooriya Ibrar",
  "Samri Bek", "Grid Guru", "Kazuhiro Chō", "Sridevi Rao", "Tomáš Novák", "Aisha Mahmoud", "Wei Lin",
  "Sofia Ramírez", "Daniel Okonkwo", "Elena Vasquez", "Hiroshi Tanaka", "Fatima Zahra",
  "Lucas Müller", "Ingrid Larsen", "Omar Haddad", "Yuki Sato", "Nadia Petrova", "Carlos Silva",
];

const RIVAL_ROLES = [
  "Product Designer", "Product Designer", "UX/UI Designer", "Product Designer", "UX/UI Designer",
  "Data Scientist path", "Backend Developer path", "AI Engineer path", "Machine Learning Engineer path", "Data Scientist path",
  "Backend Developer path", "UX/UI Designer", "AI Engineer path", "Student", "Data Scientist path",
  "Backend Developer path", "AI Engineer path", "Machine Learning Engineer path", "Data Scientist path", "Student",
  "UX/UI Designer", "Backend Developer path", "AI Engineer path", "Machine Learning Engineer path", "Data Scientist path",
  "Student", "Product Designer", "Backend Developer path", "AI Engineer path",
];

export function buildStandings(seasonCoins: number, userPathTitle?: string): StandingEntry[] {
  const rivals = RIVALS.map((name, index) => ({
    id: `rival-${index}`,
    name,
    role: RIVAL_ROLES[index],
    score: Math.round(120 * 0.88 ** index),
    isCurrentUser: false,
  }));
  return [...rivals, { id: "you", name: "You", role: userPathTitle ? `${userPathTitle} path` : undefined, score: seasonCoins, isCurrentUser: true }]
    .sort((a, b) => b.score - a.score || Number(a.isCurrentUser) - Number(b.isCurrentUser))
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;
const SEASON_MS = 28 * DAY_MS;
// Seasons are 28 days long and roll over on a Sunday at 23:00.
const ANCHOR = new Date(2024, 0, 7, 23, 0, 0, 0).getTime();

export function formatSeasonTimeLeft(timestamp = Date.now()) {
  const elapsed = (timestamp - ANCHOR) % SEASON_MS;
  const remaining = SEASON_MS - elapsed;
  const days = Math.floor(remaining / DAY_MS);
  const hours = Math.floor((remaining % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((remaining % HOUR_MS) / 60_000);
  if (days > 0) return `${days}d left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}
