"use client";

import { useState, type ReactNode } from "react";
import { BoltIcon } from "~/components/ui/icons";
import { useCountUp } from "~/hooks/use-count-up";
import type { LessonReward } from "~/types/lesson";
import { ConceptTransition } from "./concept-transition";
import { QuestProgressScreen } from "./quest-progress-screen";
import { StreakCelebration } from "./streak-celebration";

const TargetIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="2.2" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="2.2" />
    <path d="M12 9v4l2.5 2M10 3h4" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// A result card: a coloured frame whose top band names the result, around a
// panel holding the value in the same colour.
function ResultCard({ tone, label, icon, value, index }: { tone: string; label: string; icon: ReactNode; value: string | number; index: number }) {
  return (
    <div
      className="relative grid animate-card-float overflow-hidden rounded-2xl px-[3px] pb-[3px] text-center after:pointer-events-none after:absolute after:inset-0 after:z-1 after:-translate-x-[120%] after:animate-sheen after:bg-[linear-gradient(105deg,transparent_35%,rgb(255_255_255/0.45)_50%,transparent_65%)] after:content-[''] motion-reduce:animate-none motion-reduce:after:animate-none"
      style={{
        ["--idle-delay" as string]: `${1.8 + index * 0.35}s`,
        // A top sheen over the card's colour, a darker lip of it underneath
        // (the raised-tile depth), and a soft glow below that.
        background: `linear-gradient(180deg, rgb(255 255 255 / 0.22), transparent 45%), rgb(${tone})`,
        boxShadow: `0 5px 0 color-mix(in srgb, rgb(${tone}) 68%, #000), 0 18px 28px -16px rgb(${tone} / 0.7)`,
      }}
    >
      <span className="py-1.5 text-[13px] font-bold text-[#1a1a1a] [text-shadow:0_1px_0_rgb(255_255_255/0.25)]">{label}</span>
      <span
        className="flex items-center justify-center gap-2 rounded-[13px] bg-white px-3 py-3.5 text-[22px] font-bold shadow-[inset_0_3px_0_rgb(0_0_0/0.05)] max-tab:py-3 max-tab:text-[19px] dark:bg-[#1f1f1f] dark:shadow-[inset_0_3px_0_rgb(0_0_0/0.25)]"
        style={{ color: `rgb(${tone})` }}
      >
        {icon}
        {value}
      </span>
    </div>
  );
}

const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
const accuracyLabel = (percent: number) => (percent >= 100 ? "Perfect" : percent >= 80 ? "Great" : percent >= 50 ? "Good" : "Accuracy");

type LessonCompleteSequenceProps = {
  title: string;
  body: string;
  reward: LessonReward;
  // Share of questions answered right, or null when the lesson has none.
  accuracy: number | null;
  seconds: number;
  onFinish: () => void;
  onExit: () => void;
};

// The end of a lesson as a short sequence: the results, then the daily quests
// it moved, then (only when this lesson extends the streak) the streak
// moment, then back to the path.
export function LessonCompleteSequence({ title, body, reward, accuracy, seconds, onFinish, onExit }: LessonCompleteSequenceProps) {
  const [screen, setScreen] = useState<"results" | "quests" | "streak">("results");
  const xpShown = useCountUp(reward.xpEarned, { delay: 1.3, duration: 0.7 });

  const afterQuests = () => (reward.streak ? setScreen("streak") : onFinish());

  if (screen === "quests" && reward.quests) return <QuestProgressScreen quests={reward.quests} onContinue={afterQuests} />;
  if (screen === "streak" && reward.streak) return <StreakCelebration {...reward.streak} onContinue={onFinish} />;

  return (
    <ConceptTransition
      title={title}
      body={body}
      clip="lesson-complete"
      accentTitle
      pinAction
      markClassName="size-[184px] max-tab:size-[140px]"
      onExit={onExit}
      action={{ label: reward.xpEarned > 0 ? "Claim XP" : "Continue", onClick: () => (reward.quests ? setScreen("quests") : afterQuests()) }}
    >
      <div className="mx-auto mt-9 grid w-full max-w-[520px] grid-cols-3 gap-3 max-tab:mt-7 max-tab:gap-2">
        <ResultCard index={0} tone="245 180 0" label="Total XP" icon={<BoltIcon className="size-5" />} value={xpShown} />
        {accuracy !== null && <ResultCard index={1} tone="34 197 94" label={accuracyLabel(accuracy)} icon={<TargetIcon className="size-5" />} value={`${accuracy}%`} />}
        <ResultCard index={2} tone="59 130 246" label={seconds < 180 ? "Speedy" : "Time"} icon={<ClockIcon className="size-5" />} value={formatTime(seconds)} />
      </div>
    </ConceptTransition>
  );
}
