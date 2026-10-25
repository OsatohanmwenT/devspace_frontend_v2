import type { ReactNode } from "react";

// Concept glyphs for reference surfaces. They key off the concept rather than
// the language, so each entry is distinguishable at a glance.
const STROKE = { stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const TOPIC_PATHS: Record<string, ReactNode> = {
  "program-execution": <path d="M12 4v13m0 0-4-4m4 4 4-4M5 20h14" {...STROKE} />,
  "variables-expressions": (
    <>
      <rect x="4" y="7" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M8 12h5" {...STROKE} />
    </>
  ),
  "assigning-updating-values": <path d="M5 9a7 7 0 0 1 12-2m2 6a7 7 0 0 1-12 2m0 0v-3m0 3h3M19 8V5m0 3h-3" {...STROKE} />,
  "printing-reading-input": (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
      <path d="m7 10 2.5 2L7 14m5 0h4" {...STROKE} />
    </>
  ),
  "comparisons-booleans": <path d="M5 9h14M5 15h14" {...STROKE} />,
  "conditional-branches": (
    <>
      <path d="M7 5v6a3 3 0 0 0 3 3h7" {...STROKE} />
      <path d="m14 11 3 3-3 3" {...STROKE} />
      <circle cx="7" cy="4" r="1.8" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
};

const FALLBACK = <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8" />;

export function TopicGlyph({ topicId, className }: { topicId: string; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {TOPIC_PATHS[topicId] ?? FALLBACK}
    </svg>
  );
}
