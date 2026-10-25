import type { ReactNode } from "react";
import { assetUrl } from "~/config/assets";

const BUBBLE_SURFACE = "border border-[#e1e1e1] bg-[#f5f5f5] dark:border-night-line dark:bg-[#262626]";

export function AssistantRow({ children }: { children: ReactNode }) {
  return <div className="min-w-0 flex-1 motion-safe:animate-msg-in">{children}</div>;
}

export function TextBubble({ children }: { children: ReactNode }) {
  return (
    <div className={`inline-block w-fit max-w-full rounded-2xl rounded-tl-md px-3.5 py-3 text-[15px] leading-[1.55] text-neutral-800 dark:text-[#e4e4e6] ${BUBBLE_SURFACE}`}>
      {children}
    </div>
  );
}

export function UserBubble({ children }: { children: ReactNode }) {
  return (
    <p className="m-0 ml-auto w-fit max-w-[85%] rounded-2xl rounded-tr-md bg-[#2f6fed] px-4 py-2.5 text-[15px] leading-normal text-white motion-safe:animate-msg-in">
      {children}
    </p>
  );
}

export function ThinkingBubble() {
  return (
    <div className="flex items-center gap-2.5 motion-safe:animate-msg-in" role="status" aria-label="Devy is thinking">
      {/* eslint-disable-next-line @next/next/no-img-element -- local Devy illustration */}
      <img className="size-7 flex-none object-contain" src={assetUrl("devy/neutral.svg")} alt="" />
      <div className={`flex items-center gap-1.5 rounded-2xl rounded-tl-md px-4 py-3.5 ${BUBBLE_SURFACE}`} aria-hidden="true">
        {[0, 120, 240].map((delay) => (
          <span
            key={delay}
            className="size-1.5 rounded-full bg-night-soft motion-safe:animate-thinking-dot"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

// Once answered, the pick is already echoed as its own user bubble right
// below, so the options go away rather than repeat it.
export function ChipRow({ options, answered, onPick }: { options: string[]; answered?: string; onPick: (option: string) => void }) {
  if (answered) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-2" role="group">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onPick(option)}
          className="focus-ring min-h-10 rounded-full border border-[#d4d4d4] px-4 py-2 text-sm text-[#525252] transition-colors hover:border-[#6699ec] dark:border-night-line dark:text-[#c4c4c7]"
        >
          {option}
        </button>
      ))}
    </div>
  );
}
