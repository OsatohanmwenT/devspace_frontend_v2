"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import type { HomeCourse } from "~/types/home";
import { answerHomePrompt } from "../lib/answer-prompt";

export type ChatMessage = { id: string; role: "user" | "devy"; text: string };

// map: the dashboard. compose: the input has focus and the suggestions show.
// chat: a conversation is under way.
export type HomeMode = "map" | "compose" | "chat";

const REPLY_DELAY_MS = 700;

// The Ask Devy bar's state: what mode the page is in, the conversation so far,
// and the actions that move between them.
export function useDevyChat(course: HomeCourse | undefined, inputRef: RefObject<HTMLInputElement | null>) {
  const [mode, setMode] = useState<HomeMode>("map");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const replyTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(replyTimer.current), []);

  function ask(text?: string) {
    const question = text?.trim();
    if (!question) return;
    setMode("chat");
    setMessages((current) => [...current, { id: `q-${Date.now()}`, role: "user", text: question }]);
    setTyping(true);
    window.clearTimeout(replyTimer.current);
    replyTimer.current = window.setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "devy",
          text: answerHomePrompt(question, course?.title, course?.nextLessonTitle),
        },
      ]);
      setTyping(false);
    }, REPLY_DELAY_MS);
    inputRef.current?.focus();
  }

  function close() {
    window.clearTimeout(replyTimer.current);
    setTyping(false);
    setMessages([]);
    setMode("map");
    inputRef.current?.blur();
  }

  return {
    mode,
    messages,
    typing,
    ask,
    close,
    // Focusing the input opens the suggestions; leaving it closes them, unless a
    // conversation is open.
    startCompose: () => setMode((current) => (current === "chat" ? "chat" : "compose")),
    endCompose: () => setMode((current) => (current === "chat" ? "chat" : "map")),
  };
}
