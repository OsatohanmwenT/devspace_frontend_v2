import type { LeaderboardEntry, LeaderboardLeague } from "~/types/leaderboard";

export type ZoneSummary = {
  user: LeaderboardEntry;
  inPromotion: boolean;
  inDemotion: boolean;
  promotesAnyone: boolean;
  // Coins still needed to break into the promotion zone.
  gapToPromotion: number;
  // Cushion over the first person outside it.
  promotionCushion: number;
  // Coins needed to climb out of the demotion zone.
  gapToSafety: number;
  // Row index of the cutoff lines, or -1 when the league has none.
  promotionLineIndex: number;
  demotionLineIndex: number;
};

export function getZoneSummary(standings: LeaderboardEntry[], league: LeaderboardLeague): ZoneSummary | null {
  const user = standings.find((entry) => entry.isCurrentUser);
  if (!user) return null;

  const { promoteCount, demoteCount } = league;
  const promotesAnyone = promoteCount > 0;
  const inPromotion = promotesAnyone && user.rank <= promoteCount;
  const demotionRank = standings.length - demoteCount;
  const inDemotion = demoteCount > 0 && user.rank > demotionRank;

  const firstOutside = standings[promoteCount];
  const lastInside = standings[promoteCount - 1];
  const lastSafe = standings[demotionRank - 1];

  return {
    user,
    inPromotion,
    inDemotion,
    promotesAnyone,
    gapToPromotion: !inPromotion && promotesAnyone && lastInside ? Math.max(1, lastInside.score - user.score + 1) : 0,
    promotionCushion: inPromotion && firstOutside ? user.score - firstOutside.score : 0,
    gapToSafety: inDemotion && lastSafe ? Math.max(1, lastSafe.score - user.score + 1) : 0,
    promotionLineIndex: promotesAnyone ? promoteCount : -1,
    demotionLineIndex: demoteCount > 0 ? demotionRank : -1,
  };
}
