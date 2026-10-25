import type { ProgressSummary } from "./progress";

// A path the learner has started: the one they are continuing, plus any they
// paused or built themselves. Titles are `null` once a path has run out of
// lessons.
export type HomeCourse = {
  id: string;
  title: string;
  isPrimary: boolean;
  regionTitle: string | null;
  regionImage: string | null;
  emblem: string | null;
  percent: number;
  regionPercent: number;
  regionLessonsCompleted: number;
  regionLessonsTotal: number;
  nextLessonId: string | null;
  nextLessonTitle: string | null;
  upNextTitle: string | null;
};

export type Quest = {
  id: "xp" | "lesson" | "practice";
  label: string;
  current: number;
  target: number;
  done: boolean;
};

// A streak milestone: `earned` once reached, `next` for the one being worked
// towards (with how far along), `locked` beyond that.
export type Badge = {
  days: number;
  label: string;
  state: "earned" | "next" | "locked";
  progress: number;
};

export type StandingEntry = {
  id: string;
  name: string;
  role?: string;
  rank: number;
  score: number;
  isCurrentUser: boolean;
};

export type HomeLeague = {
  name: string;
  // Hex colour of the league's medal.
  color: string;
  // Leagues only mean something after a first lesson.
  unlocked: boolean;
  rank: number | null;
  seasonCoins: number;
  promoteCount: number;
  inPromotionZone: boolean;
  coinsToPromotion: number;
  seasonTimeLeft: string;
  // The learner and the rows around them.
  neighbors: StandingEntry[];
  neighborsWide: StandingEntry[];
  // Rank change today; null when just joined.
  rankDelta: number | null;
};

// The one signal that matters most right now, in priority order.
export type HomeUpdate = {
  kind: "path-complete" | "streak-risk" | "checkpoint" | "streak" | "welcome";
  title: string;
  body: string;
  cta: string;
};

export type HomeData = {
  // `name` is empty until the learner sets one.
  learner: { name: string; headline: string; avatarUrl: string };
  stats: ProgressSummary & { longestStreak: number; completedLessonsCount: number };
  quests: Quest[];
  badges: Badge[];
  courses: HomeCourse[];
  league: HomeLeague;
  update: HomeUpdate;
  lessonDoneToday: boolean;
  practiceDoneToday: boolean;
};
