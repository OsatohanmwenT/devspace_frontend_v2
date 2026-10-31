"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { DevyLottie, DevyMood } from "~/components/devy";
import { RichText } from "~/components/ui/rich-text";
import type { Profile } from "~/types/profile";
import { getFallbackResponse, getGreeting, getPrompts, getResponse, matchPrompt, type DevyResponse, type Prompt, type PromptId } from "../lib/devy-answers";
import type { FlowStep } from "../lib/lesson-flow";
import { StreamedRichText } from "./streamed-rich-text";

const THINK_MS = 600;
// Older turns fade back so the latest reads as the one to look at.
const FADED = "opacity-25 blur-[4px] transition-[filter,opacity] duration-300";

type Turn = { key: string; label: string; response: DevyResponse };

function Bubble({ children }: { children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl rounded-tl-md border border-[#e1e1e1] bg-[#f5f5f5] px-3.5 py-3 text-[15px] leading-[1.55] text-neutral-800 dark:border-night-line dark:bg-[#262626] dark:text-[#e4e4e6]">
      {children}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div
      className="flex animate-msg-in items-center gap-1.5 justify-self-start rounded-2xl rounded-tl-md border border-[#e1e1e1] bg-[#f5f5f5] px-4 py-3.5 dark:border-night-line dark:bg-[#262626]"
      aria-label="Devy is thinking"
      role="status"
    >
      {[0, 120, 240].map((delay) => (
        <span key={delay} className="size-1.5 animate-thinking-dot rounded-full bg-night-soft" style={{ animationDelay: `${delay}ms` }} aria-hidden="true" />
      ))}
    </div>
  );
}

type DevyAssistantProps = {
  step: FlowStep;
  // Whether this step has been answered or finished, which opens up fuller answers.
  checked: boolean;
  profile: Pick<Profile, "role"> | null;
  // What Devy said from the footer lately, shown above the greeting.
  recentLines: string[];
  lessonTitle: string;
  onClose: () => void;
};

// Devy's side panel: a few step-aware questions it can answer from the lesson
// itself. Typed text is matched to those same answers.
export function DevyAssistant({ step, checked, profile, recentLines, lessonTitle, onClose }: DevyAssistantProps) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const conversation = useRef<HTMLDivElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const turnCount = useRef(0);
  const available = getPrompts(step, checked);
  const prompts = available.filter(({ id }) => !turns.some((turn) => turn.key === id));
  const hintOnly = step.kind === "activity" && step.type === "question" && !checked;

  useEffect(() => {
    conversation.current?.scrollTo({ top: conversation.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking, streaming]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const reply = (turn: Turn) => {
    setThinking(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setTurns((current) => [...current, turn]);
      setThinking(false);
      setStreaming(true);
    }, THINK_MS);
  };

  const ask = (id: PromptId, label: string) => {
    const response = getResponse(id, step, checked);
    if (response) reply({ key: id, label, response });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;
    const matched = matchPrompt(text, available);
    const response = (matched && getResponse(matched, step, checked)) || getFallbackResponse(available);
    turnCount.current += 1;
    reply({ key: `text-${turnCount.current}`, label: text, response });
    setDraft("");
  };

  const lastIndex = turns.length - 1;

  return (
    <>
      <div className="flex items-center justify-between gap-3 text-neutral-800 dark:text-night-ink">
        <span className="flex min-w-0 items-center gap-2.5">
          {/* Devy visibly "thinks" while a reply is on its way, then settles. */}
          <span className="grid size-9 flex-none place-items-center" aria-hidden="true">
            {thinking || streaming ? <DevyLottie clip="thinking" className="size-full" /> : <DevyMood mood="neutral" className="size-full" />}
          </span>
          <span className="grid min-w-0">
            <strong className="text-[17px] leading-tight">Devy</strong>
            <span className="truncate text-[13px] text-ink-soft dark:text-night-soft">Helping with {lessonTitle}</span>
          </span>
        </span>
        {/* A "hide panel" glyph rather than a second ×, so it can't be mistaken
            for the lesson's own close button beside it. */}
        <button
          type="button"
          className="focus-ring grid size-9 flex-none place-items-center rounded-lg text-[#777] hover:bg-[#f5f5f5] dark:text-[#b2b2b6] dark:hover:bg-[#262626]"
          onClick={onClose}
          aria-label="Hide Devy"
          title="Hide Devy"
        >
          <svg className="size-5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="3.5" y="4.5" width="17" height="15" rx="3" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9 4.5v15" stroke="currentColor" strokeWidth="1.8" />
            <path d="m15.5 10-2 2 2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <div ref={conversation} className="mt-5 min-h-0 flex-1 overflow-y-auto [scrollbar-width:none]" aria-live="polite">
        <div className="grid min-h-full content-end gap-3">
          {recentLines.map((line, index) => (
            <div key={`${line}-${index}`} className={index === recentLines.length - 1 ? "animate-msg-in" : FADED}>
              <Bubble>{line}</Bubble>
            </div>
          ))}

          <div className={turns.length ? FADED : ""}>
            <Bubble>{getGreeting(profile, hintOnly)}</Bubble>
          </div>

          {turns.map((turn, index) => {
            const latest = index === lastIndex;
            const typing = latest && streaming;
            return (
              <div key={`${turn.key}-${index}`} className={`grid gap-2 ${latest ? "animate-msg-in" : ""}`}>
                <p className={`m-0 justify-self-end rounded-2xl rounded-tr-md bg-[#e4eaf4] px-4 py-2.5 text-sm text-neutral-800 transition-[filter,opacity] duration-300 dark:bg-[#2f2e3e] dark:text-night-ink ${latest ? "" : "opacity-20 blur-[4px]"}`}>
                  {turn.label}
                </p>
                <div className={latest ? "" : FADED}>
                  <Bubble>
                    {typing ? <StreamedRichText content={turn.response.body} onDone={() => setStreaming(false)} /> : <RichText content={turn.response.body} />}
                    {!typing && turn.response.suggestions && (
                      <span className="mt-3 flex flex-wrap gap-2">
                        {turn.response.suggestions.map((suggestion: Prompt) => (
                          <button
                            key={suggestion.id}
                            type="button"
                            className="focus-ring rounded-full border border-[#bfd3f7] bg-[#eff4ff] px-3 py-1.5 text-[13px] font-semibold text-[#2563eb] transition-colors hover:bg-[#6699ec]/20 dark:border-[#6699ec]/40 dark:bg-[#6699ec]/10 dark:text-[#88bdf2]"
                            onClick={() => ask(suggestion.id, suggestion.label)}
                          >
                            {suggestion.label}
                          </button>
                        ))}
                      </span>
                    )}
                    {!typing && turn.response.code && (
                      <pre className="mt-2.5 overflow-x-auto rounded-lg bg-[#1e1e1e] px-3.5 py-3 text-sm leading-[1.7] text-[#d4d4d4]">
                        <code>{turn.response.code}</code>
                      </pre>
                    )}
                  </Bubble>
                </div>
              </div>
            );
          })}
          {thinking && <ThinkingBubble />}
        </div>
      </div>

      <div className="mt-4 mb-2.5 flex animate-composer-in gap-2 overflow-x-auto [scrollbar-width:none]" role="group" aria-label="Ask Devy">
        {prompts.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            className="focus-ring min-h-9 flex-none rounded-full border border-[#d4d4d4] bg-white px-3.5 py-2 text-left text-sm whitespace-nowrap text-[#525252] transition-[border-color,transform,background-color] hover:-translate-y-px hover:border-[#6699ec] dark:border-[#5c5c60] dark:bg-[#1a1a1a] dark:text-[#c4c4c7]"
            onClick={() => ask(id, label)}
          >
            {label}
          </button>
        ))}
      </div>

      <form
        className="mb-5 flex animate-composer-in items-center gap-2 rounded-full border border-[#d4d4d4] bg-white pr-1.5 transition-[border-color,box-shadow] duration-150 focus-within:border-[#6699ec] focus-within:shadow-[0_0_0_3px_rgba(102,153,236,0.15)] max-[720px]:mb-4 dark:border-[#5c5c60] dark:bg-[#1a1a1a]"
        onSubmit={submit}
      >
        <input
          type="text"
          className="h-12 min-w-0 flex-1 rounded-full bg-transparent px-4 text-[15px] text-neutral-800 placeholder:text-ink-soft focus:outline-none dark:text-night-ink dark:placeholder:text-[#b8b8bb]"
          placeholder="Ask Devy"
          aria-label="Ask Devy a question"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
        />
        <button
          type="submit"
          className="focus-ring grid size-10 flex-none place-items-center rounded-full bg-[#2563eb] text-white transition-[transform,background-color] duration-150 enabled:hover:-translate-y-px enabled:hover:bg-[#3b82f6] disabled:opacity-40"
          disabled={!draft.trim()}
          aria-label="Send message to Devy"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </>
  );
}
