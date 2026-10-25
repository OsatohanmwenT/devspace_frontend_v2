"use client";

import { useEffect, useRef, useState } from "react";
import type { CustomRoute } from "~/types/paths";
import { buildCustomRoute, matchOption } from "../lib/build-custom-route";

export type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; kind: "goal-prompt" }
  | { id: string; role: "assistant"; kind: "text"; text: string }
  | { id: string; role: "assistant"; kind: "choice"; question: string; options: string[]; answerKey: "experience" | "outcome"; answered?: string }
  | { id: string; role: "assistant"; kind: "review-card"; route: CustomRoute }
  | { id: string; role: "assistant"; kind: "route-card"; route: CustomRoute };

type Reply =
  | { kind: "text"; text: string }
  | { kind: "choice"; question: string; options: string[]; answerKey: "experience" | "outcome" }
  | { kind: "review-card"; route: CustomRoute }
  | { kind: "route-card"; route: CustomRoute };

export type Stage = "goal" | "comfort" | "outcome" | "review" | "ready";

const MIN_GOAL_LENGTH = 8;
// Devy and the heading fade out for this long before the docked layout takes over.
const HERO_LEAVE_MS = 200;

// The conversation that turns a goal into a route: goal, how familiar, what
// they want to be able to do, a review, then the finished route. It is
// scripted; the backend will generate the route for real.
export function useCustomPathChat() {
  const nextId = useRef(0);
  const timers = useRef<number[]>([]);
  const [goal, setGoal] = useState("");
  const [experience, setExperience] = useState("");
  const [stage, setStage] = useState<Stage>("goal");
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [heroLeaving, setHeroLeaving] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{ id: "m0", role: "assistant", kind: "goal-prompt" }]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(window.clearTimeout);
  }, []);

  const schedule = (callback: () => void, delay: number) => {
    timers.current.push(window.setTimeout(callback, delay));
  };

  const id = () => `m${++nextId.current}`;
  const pushUser = (text: string) => setMessages((current) => [...current, { id: id(), role: "user", text }]);
  const pushAssistant = (reply: Reply) => setMessages((current) => [...current, { id: id(), role: "assistant", ...reply } as ChatMessage]);

  const replyAfter = (reply: Reply, delay = 550) => {
    setTyping(true);
    schedule(() => {
      setTyping(false);
      pushAssistant(reply);
    }, delay);
  };

  // Stamps the answer onto the choice that was still open, so a later "adjust"
  // doesn't blank an answer that was already given.
  const answerChoice = (answerKey: "experience" | "outcome", value: string) =>
    setMessages((current) =>
      current.map((message) =>
        "kind" in message && message.kind === "choice" && message.answerKey === answerKey && !message.answered ? { ...message, answered: value } : message,
      ),
    );

  const askComfort = (forGoal: string) => {
    const route = buildCustomRoute(forGoal, "", "");
    replyAfter({ kind: "choice", question: route.comfort, options: route.comfortOptions, answerKey: "experience" });
  };

  const submitGoal = (text: string) => {
    const trimmed = text.trim();
    if (heroLeaving || trimmed.length < MIN_GOAL_LENGTH) return;
    setHeroLeaving(true);
    schedule(() => {
      pushUser(trimmed);
      setGoal(trimmed);
      setInput("");
      setStage("comfort");
      setHeroLeaving(false);
      askComfort(trimmed);
    }, HERO_LEAVE_MS);
  };

  // `shown` is what the learner actually typed; `option` is the canonical
  // value the rest of the flow reasons about.
  const pickComfort = (option: string, shown = option) => {
    answerChoice("experience", option);
    pushUser(shown);
    setExperience(option);
    setInput("");
    setStage("outcome");
    const route = buildCustomRoute(goal, option, "");
    replyAfter({ kind: "choice", question: route.outcomeQuestion, options: route.outcomeOptions, answerKey: "outcome" });
  };

  const pickOutcome = (option: string, shown = option) => {
    answerChoice("outcome", option);
    pushUser(shown);
    setInput("");
    setStage("review");
    replyAfter({ kind: "review-card", route: buildCustomRoute(goal, experience, option) }, 1400);
  };

  const confirmReview = (route: CustomRoute) => {
    setStage("ready");
    replyAfter({ kind: "route-card", route }, 1200);
  };

  // Shared by "Adjust" on the review and the final card: forget the last two
  // answers and ask again, as fresh chat turns rather than a reopened form.
  const revisit = () => {
    setExperience("");
    pushAssistant({ kind: "text", text: "No problem — let’s revisit a couple of things." });
    setStage("comfort");
    askComfort(goal);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    if (stage === "goal") return submitGoal(text);

    // Typing is never a dead end: an unmatched reply falls back to the first option.
    if (stage === "comfort") {
      const { comfortOptions } = buildCustomRoute(goal, "", "");
      return pickComfort(matchOption(text, comfortOptions) ?? comfortOptions[0], text);
    }
    if (stage === "outcome") {
      const { outcomeOptions } = buildCustomRoute(goal, experience, "");
      return pickOutcome(matchOption(text, outcomeOptions) ?? outcomeOptions[0], text);
    }

    pushUser(text);
    setInput("");
    replyAfter(
      stage === "review"
        ? { kind: "text", text: "Noted — tap “Looks good, create path” above when you’re ready, or “Adjust” to change your answers." }
        : { kind: "text", text: "I can’t regenerate the route from a message yet — tap “Adjust route” below and I’ll walk through the questions again." },
      450,
    );
  };

  return { messages, stage, input, setInput, typing, heroLeaving, send, submitGoal, pickComfort, pickOutcome, confirmReview, revisit };
}
