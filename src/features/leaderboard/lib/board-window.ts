import type { LeaderboardEntry } from "~/types/leaderboard";
import type { ZoneSummary } from "./zone-summary";

export type BoardItem =
  | { type: "row"; entry: LeaderboardEntry }
  | { type: "gap"; hiddenCount: number }
  | { type: "promotion-line" }
  | { type: "demotion-line" };

const PODIUM_ROWS = 3;
const ROWS_BEFORE_LINE = 2;
const ROWS_AFTER_LINE = 1;
const ROWS_AROUND_USER = 2;

function flatten(standings: LeaderboardEntry[], shown: Set<number>, lines: Map<number, BoardItem["type"]>): BoardItem[] {
  const items: BoardItem[] = [];
  let hidden = 0;

  standings.forEach((entry, index) => {
    if (!shown.has(index)) {
      hidden += 1;
      return;
    }
    if (hidden > 0) {
      items.push({ type: "gap", hiddenCount: hidden });
      hidden = 0;
    }
    const line = lines.get(index);
    if (line === "promotion-line" || line === "demotion-line") items.push({ type: line });
    items.push({ type: "row", entry });
  });

  if (hidden > 0) items.push({ type: "gap", hiddenCount: hidden });
  return items;
}

// Thirty rows is more board than anyone reads, and the promotion cutoff sits
// well down the list. This keeps the rows that carry meaning (the podium, both
// cutoffs and the learner's own neighbourhood) and collapses the rest into
// counted gaps. Revealing the whole cohort comes with Pro.
export function getBoardWindow(standings: LeaderboardEntry[], summary: ZoneSummary): BoardItem[] {
  const lines = new Map<number, BoardItem["type"]>();
  if (summary.promotionLineIndex >= 0 && summary.promotionLineIndex < standings.length) lines.set(summary.promotionLineIndex, "promotion-line");
  if (summary.demotionLineIndex >= 0 && summary.demotionLineIndex < standings.length) lines.set(summary.demotionLineIndex, "demotion-line");

  const shown = new Set<number>();
  const keep = (from: number, to: number) => {
    for (let index = Math.max(0, from); index <= Math.min(standings.length - 1, to); index += 1) shown.add(index);
  };

  keep(0, PODIUM_ROWS - 1);
  for (const index of lines.keys()) keep(index - ROWS_BEFORE_LINE, index + ROWS_AFTER_LINE);
  keep(summary.user.rank - 1 - ROWS_AROUND_USER, summary.user.rank - 1 + ROWS_AROUND_USER);
  return flatten(standings, shown, lines);
}
