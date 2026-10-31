import { DevyLottie, DevyMood } from "~/components/devy";
import { Button } from "~/components/ui/button";
import { DevySpeechBubble } from "./devy-speech-bubble";

export type FooterAction = { label: string; onClick: () => void; disabled?: boolean };

type LessonFooterProps = {
  action: FooterAction | null;
  // What Devy says right now, if anything.
  line: string | undefined;
  // A run of right answers: Devy celebrates and gets a gold ring.
  streaking: boolean;
  onOpenDevy: () => void;
  devyOpen: boolean;
  // A short status beside the button, such as "Audio complete".
  note?: string;
};

// Devy on the left, reacting; the one thing to do next on the right.
export function LessonFooter({ action, line, streaking, onOpenDevy, devyOpen, note }: LessonFooterProps) {
  return (
    <footer className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-t border-[#e1e1e1] px-6 py-2 max-[720px]:px-3.5 dark:border-night-line">
      <div className="relative">
        <button type="button" className="focus-ring relative grid size-[72px] place-items-center rounded-full max-[720px]:size-14" onClick={onOpenDevy} aria-label="Open Devy chat" aria-expanded={devyOpen}>
          {streaking ? <DevyMood key="streaking" mood="celebrating" className="size-full" /> : <DevyLottie clip="thinking" className="size-full" />}
          {streaking && <span className="absolute inset-0 rounded-full ring-2 ring-[#f0c964]" aria-hidden="true" />}
        </button>
        <DevySpeechBubble text={line} />
      </div>
      <div className="min-w-0 text-center text-sm font-semibold text-[#197a4b] max-[720px]:hidden dark:text-[#6ee7a8]">{note}</div>
      {action && (
        <Button className="min-h-11 min-w-[200px] text-[15px] font-semibold max-[720px]:min-w-[140px]" onClick={action.onClick} disabled={action.disabled}>
          {action.label}
        </Button>
      )}
    </footer>
  );
}
