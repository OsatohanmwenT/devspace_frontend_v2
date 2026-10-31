"use client";

import * as Menu from "@radix-ui/react-dropdown-menu";
import type { ArticleContent } from "~/types/lesson";
import { useLessonNarration } from "../hooks/use-lesson-narration";
import { NARRATION_RATES } from "../lib/narration";

const PANEL =
  "z-30 grid max-h-[min(var(--radix-dropdown-menu-content-available-height),360px)] w-[min(280px,calc(100vw-24px))] gap-0.5 overflow-y-auto rounded-xl border border-[#eeeeeb] bg-white p-2 shadow-[0_12px_28px_rgba(20,20,20,.12)] dark:border-night-line dark:bg-night-card dark:shadow-[0_12px_28px_rgba(0,0,0,.32)]";
const ROW =
  "flex min-h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 text-left text-[15px] text-neutral-800 outline-none data-[highlighted]:bg-[#f5f5f5] dark:text-night-ink dark:data-[highlighted]:bg-[#262626]";
const HINT = "min-w-0 truncate text-sm text-ink-soft dark:text-night-soft";

// Looks like a switch; the menu item around it carries the role and state.
function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden="true" className={`relative h-6 w-11 flex-none rounded-full transition-colors ${on ? "bg-[#6699ec]" : "bg-[#d4d4d4] dark:bg-night-line"}`}>
      <span className={`absolute top-1 left-1 size-4 rounded-full bg-white transition-transform ${on ? "translate-x-5" : "translate-x-0"}`} />
    </span>
  );
}


type NarrationControlProps = {
  article: ArticleContent;
  personality: boolean;
  onPersonalityChange: (on: boolean) => void;
  onStart: () => void;
  onEnd: () => void;
};

// Listen to the article instead of reading it. The pill plays and stops; its
// menu holds Audio mode (read each article as it opens), Devy's commentary,
// and the voice and speed. Shown only while an article is on screen.
export function NarrationControl({ article, personality, onPersonalityChange, onStart, onEnd }: NarrationControlProps) {
  const narration = useLessonNarration(article, { personality, onStart, onEnd });
  if (!narration.supported) return null;

  return (
    <Menu.Root>
      <div className="flex items-center">
        <button
          type="button"
          className="focus-ring flex h-10 items-center gap-2 rounded-l-[10px] bg-[#f5f5f5] pr-2.5 pl-3 text-sm font-medium text-neutral-800 hover:bg-[#eeeeeb] dark:bg-[#262626] dark:text-night-ink dark:hover:bg-[#303030]"
          onClick={narration.toggle}
          aria-pressed={narration.speaking}
          aria-label={narration.speaking ? "Stop audio" : "Listen to this lesson"}
        >
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            {narration.speaking ? (
              <path d="M8 6v12M16 6v12" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
            ) : (
              <path d="M4 10v4h3.5l4.5 3.5v-11L7.5 10H4Zm12.5-.5a4 4 0 0 1 0 5M19 7a7.5 7.5 0 0 1 0 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            )}
          </svg>
          <span className="max-[720px]:hidden">{narration.speaking ? "Listening" : "Audio"}</span>
        </button>
        <Menu.Trigger
          className="focus-ring group grid h-10 w-8 place-items-center rounded-r-[10px] border-l border-black/5 bg-[#f5f5f5] text-neutral-800 hover:bg-[#eeeeeb] dark:border-white/10 dark:bg-[#262626] dark:text-night-ink dark:hover:bg-[#303030]"
          aria-label="Audio settings"
        >
          <svg className="size-4 transition-transform group-data-[state=open]:rotate-180" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Menu.Trigger>
      </div>

      <Menu.Portal>
        <Menu.Content className={PANEL} align="end" sideOffset={8} collisionPadding={12}>
          <Menu.CheckboxItem className={ROW} checked={narration.autoPlay} onCheckedChange={narration.changeAutoPlay} onSelect={(event) => event.preventDefault()}>
            Audio mode
            <Switch on={narration.autoPlay} />
          </Menu.CheckboxItem>
          <Menu.CheckboxItem className={ROW} checked={personality} onCheckedChange={onPersonalityChange} onSelect={(event) => event.preventDefault()}>
            Devy’s commentary
            <Switch on={personality} />
          </Menu.CheckboxItem>

          <Menu.Sub>
            <Menu.SubTrigger className={ROW}>
              Voice
              <span className={HINT}>{narration.activeVoice?.name ?? "Default"}</span>
            </Menu.SubTrigger>
            <Menu.Portal>
              <Menu.SubContent className={PANEL} sideOffset={8} collisionPadding={12}>
                <Menu.RadioGroup value={narration.activeVoice?.name} onValueChange={narration.changeVoice}>
                  {narration.voices.map((voice) => (
                    <Choice key={voice.name} value={voice.name} label={voice.name} />
                  ))}
                </Menu.RadioGroup>
                {narration.voices.length === 0 && <p className={`m-0 px-2.5 py-2 ${HINT}`}>No voices available.</p>}
              </Menu.SubContent>
            </Menu.Portal>
          </Menu.Sub>

          <Menu.Sub>
            <Menu.SubTrigger className={ROW}>
              Speed
              <span className={HINT}>{narration.rate}×</span>
            </Menu.SubTrigger>
            <Menu.Portal>
              <Menu.SubContent className={PANEL} sideOffset={8} collisionPadding={12}>
                <Menu.RadioGroup value={String(narration.rate)} onValueChange={(value) => narration.changeRate(Number(value))}>
                  {NARRATION_RATES.map((rate) => (
                    <Choice key={rate} value={String(rate)} label={`${rate}×`} />
                  ))}
                </Menu.RadioGroup>
              </Menu.SubContent>
            </Menu.Portal>
          </Menu.Sub>
        </Menu.Content>
      </Menu.Portal>
    </Menu.Root>
  );
}

function Choice({ value, label }: { value: string; label: string }) {
  return (
    <Menu.RadioItem value={value} className={ROW} onSelect={(event) => event.preventDefault()}>
      <span className="min-w-0 truncate">{label}</span>
      <Menu.ItemIndicator className="text-[#2563eb]">✓</Menu.ItemIndicator>
    </Menu.RadioItem>
  );
}
