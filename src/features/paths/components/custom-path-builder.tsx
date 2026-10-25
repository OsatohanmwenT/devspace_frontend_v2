"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, type FormEvent } from "react";
import { assetUrl } from "~/config/assets";
import { createCustomPath } from "../api/paths-api";
import { useCustomPathChat } from "../hooks/use-custom-path-chat";
import { AssistantRow, ChipRow, TextBubble, ThinkingBubble, UserBubble } from "./chat-bubbles";
import { ReviewCard, RouteCard } from "./route-cards";

const EXAMPLES = [
  "Prepare for a junior React role",
  "React Native state management",
  "Learn Docker for backend deployment",
  "Build a recommendation system",
];

const COMPOSER_SHELL =
  "flex w-full items-end gap-1.5 border border-[#d4d4d4] bg-white pr-1 transition-[border-color,box-shadow] duration-150 focus-within:border-[#6699ec] focus-within:shadow-[0_0_0_3px_rgba(102,153,236,0.15)] dark:border-[#5c5c60] dark:bg-[#1a1a1a]";

const BACK_BUTTON =
  "focus-ring grid size-9 flex-none place-items-center rounded-lg text-night-soft hover:bg-[#f5f5f5] dark:hover:bg-[#262626]";

function Composer({
  hero,
  input,
  onInput,
  onSend,
}: {
  hero: boolean;
  input: string;
  onInput: (value: string) => void;
  onSend: () => void;
}) {
  const textarea = useRef<HTMLTextAreaElement>(null);

  // Grows with Shift+Enter line breaks, capped so a long paste can't swallow
  // the message list; beyond the cap the textarea scrolls instead.
  useEffect(() => {
    const node = textarea.current;
    if (!node) return;
    node.style.height = "auto";
    node.style.height = `${Math.min(node.scrollHeight, 160)}px`;
  }, [input]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSend();
  };

  // One shared layout id, so the input slides from its centred hero spot down
  // into the docked bar rather than popping.
  return (
    <motion.form
      layoutId="custom-path-composer"
      transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
      className={`${COMPOSER_SHELL} ${hero ? "rounded-[26px] py-2.5 pl-2 motion-safe:animate-composer-in" : "my-4 rounded-[22px] py-2 pl-1.5"}`}
      onSubmit={submit}
    >
      <textarea
        ref={textarea}
        rows={1}
        className="max-h-40 min-h-9 min-w-0 flex-1 resize-none overflow-y-auto rounded-full bg-transparent px-3 py-2 text-sm leading-[1.4] text-neutral-800 placeholder:text-[#89898e] focus:outline-none dark:text-night-ink"
        placeholder={hero ? "Describe your learning goal…" : "Ask a question or reply…"}
        aria-label="Message Devy"
        value={input}
        onChange={(event) => onInput(event.target.value)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" || event.shiftKey) return;
          event.preventDefault();
          onSend();
        }}
      />
      <button
        type="submit"
        disabled={!input.trim()}
        aria-label="Send"
        className="focus-ring mr-0.5 grid size-10 flex-none place-items-center rounded-full bg-[#2f6fed] text-white transition-[transform,background-color] duration-150 enabled:hover:-translate-y-px enabled:hover:bg-[#3b82f6] enabled:active:translate-y-0 disabled:opacity-40"
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M5 12h13M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </motion.form>
  );
}

// Building a custom path is its own focused surface, a conversation with Devy:
// a goal, two quick questions, a review, then the route itself.
export function CustomPathBuilder() {
  const router = useRouter();
  const chat = useCustomPathChat();
  const list = useRef<HTMLDivElement>(null);
  const hero = chat.stage === "goal";

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [chat.messages, chat.typing]);

  const leave = () => router.push("/paths");

  return (
    <main
      className={`mx-auto grid h-dvh w-full max-w-[860px] px-4 ${hero ? "grid-rows-[auto_minmax(0,1fr)]" : "grid-rows-[auto_minmax(0,1fr)_auto]"}`}
      aria-label="Build a custom path"
    >
      <header className="flex items-center gap-3 py-4">
        <button type="button" onClick={leave} aria-label="Back to paths" className={BACK_BUTTON}>
          <svg className="size-[18px]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m15 6-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <strong className="text-[15px] text-neutral-800 dark:text-night-ink">Build a custom path</strong>
      </header>

      {hero ? (
        <div className="flex min-h-0 items-center justify-center">
          <div className="flex w-full max-w-[640px] flex-col items-center gap-6 px-4">
            <div className={`flex flex-col items-center gap-6 transition-[opacity,transform] duration-200 motion-safe:animate-msg-in ${chat.heroLeaving ? "-translate-y-1.5 opacity-0" : ""}`}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local Devy illustration */}
              <img className="size-9 object-contain" src={assetUrl("devy/neutral.svg")} alt="" />
              <h1 className="m-0 text-center text-[26px] leading-[1.3] font-semibold text-neutral-800 dark:text-night-ink">
                What do you want to learn, build, or prepare for?
              </h1>
            </div>

            <Composer hero input={chat.input} onInput={chat.setInput} onSend={chat.send} />

            <div className={`flex flex-wrap justify-center gap-2 transition-opacity duration-200 ${chat.heroLeaving ? "pointer-events-none opacity-0" : ""}`} aria-label="Example goals">
              {EXAMPLES.map((example) => (
                <button
                  key={example}
                  type="button"
                  onClick={() => chat.submitGoal(example)}
                  className="focus-ring rounded-full border border-[#e8e6e1] px-3.5 py-2 text-[12.5px] text-ink-soft hover:border-[#6699ec] dark:border-night-line dark:text-[#c4c4c7]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div ref={list} className="flex min-h-0 flex-col overflow-y-auto [scrollbar-width:none]" aria-live="polite">
            <div className="flex flex-col gap-4 py-2">
              {chat.messages.map((message) => {
                if (message.role === "user") return <UserBubble key={message.id}>{message.text}</UserBubble>;
                switch (message.kind) {
                  case "goal-prompt":
                    return (
                      <AssistantRow key={message.id}>
                        <TextBubble>What do you want to learn, build, or prepare for?</TextBubble>
                      </AssistantRow>
                    );
                  case "text":
                    return (
                      <AssistantRow key={message.id}>
                        <TextBubble>{message.text}</TextBubble>
                      </AssistantRow>
                    );
                  case "choice":
                    return (
                      <AssistantRow key={message.id}>
                        <TextBubble>{message.question}</TextBubble>
                        <ChipRow
                          options={message.options}
                          answered={message.answered}
                          onPick={message.answerKey === "experience" ? chat.pickComfort : chat.pickOutcome}
                        />
                      </AssistantRow>
                    );
                  case "review-card":
                    return (
                      <AssistantRow key={message.id}>
                        <ReviewCard
                          route={message.route}
                          disabled={chat.stage !== "review"}
                          onConfirm={() => chat.confirmReview(message.route)}
                          onAdjust={chat.revisit}
                        />
                      </AssistantRow>
                    );
                  case "route-card":
                    return (
                      <AssistantRow key={message.id}>
                        <RouteCard
                          route={message.route}
                          disabled={chat.stage !== "ready"}
                          onStart={async () => {
                            const path = await createCustomPath(message.route);
                            if (path) router.push(`/paths/${path.id}`);
                          }}
                          onAdjust={chat.revisit}
                        />
                      </AssistantRow>
                    );
                }
              })}
              {chat.typing && <ThinkingBubble />}
            </div>
          </div>
          <Composer hero={false} input={chat.input} onInput={chat.setInput} onSend={chat.send} />
        </>
      )}
    </main>
  );
}
