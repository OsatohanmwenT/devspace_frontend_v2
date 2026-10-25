export type League = {
  id: string;
  name: string;
  // The medal's colour.
  color: string;
  // Share of the cohort that moves up / down at season end.
  promotePercent: number;
  demotePercent: number;
  // Silver and above need Pro, or a one-season pass earned by a top-ten Bronze finish.
  requiresPro: boolean;
  // Scales the whole rival field: the dial that decides what a season costs in coins.
  pace: number;
};

export const LEAGUES: League[] = [
  { id: "bronze", name: "Bronze League", color: "#d98a52", promotePercent: 0.15, demotePercent: 0, requiresPro: false, pace: 0.036 },
  { id: "silver", name: "Silver League", color: "#c7c9d1", promotePercent: 0.15, demotePercent: 0.1, requiresPro: true, pace: 0.057 },
  { id: "gold", name: "Gold League", color: "#ffcf8b", promotePercent: 0.12, demotePercent: 0.1, requiresPro: true, pace: 0.081 },
  { id: "sapphire", name: "Sapphire League", color: "#5fb8ff", promotePercent: 0.1, demotePercent: 0.12, requiresPro: true, pace: 0.108 },
  { id: "diamond", name: "Diamond League", color: "#04adc0", promotePercent: 0, demotePercent: 0.15, requiresPro: true, pace: 0.138 },
];

export const COHORT_SIZE = 30;

export const getLeague = (index: number) => LEAGUES[Math.min(LEAGUES.length - 1, Math.max(0, index))];
export const getPromoteCount = (league: League) => Math.round(league.promotePercent * COHORT_SIZE);
export const getDemoteCount = (league: League) => Math.round(league.demotePercent * COHORT_SIZE);
