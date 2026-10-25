"use client";

import { AnimatePresence } from "motion/react";
import { useRef, useState } from "react";
import { useBreakpoint } from "~/hooks/use-breakpoint";
import { useLoad } from "~/hooks/use-load";
import type { HomeData } from "~/types/home";
import { getHome } from "../api/home-api";
import { useDevyChat } from "../hooks/use-devy-chat";
import { useHomeActions } from "../hooks/use-home-actions";
import { ACCENTS } from "../lib/accents";
import { buildSuggestions } from "../lib/compose-suggestions";
import { ComposeStage } from "./compose-stage";
import { HomeCarousel } from "./home-carousel";
import { HomeDesktop } from "./home-desktop";
import { PromptBar } from "./prompt-bar";

function HomeContent({ data }: { data: HomeData }) {
  const breakpoint = useBreakpoint();
  const actions = useHomeActions(data);
  const course = data.courses[0];
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [promptText, setPromptText] = useState("");
  // The accent of the suggestion in front while composing, for the bar's glow.
  const [composeAccent, setComposeAccent] = useState<string | null>(null);
  const chat = useDevyChat(course, promptInputRef);
  const composing = chat.mode !== "map";

  const promptBar = (cardAccent: string) => (
    <PromptBar
      accent={composing && composeAccent ? composeAccent : cardAccent}
      isComposing={composing}
      placeholder={chat.mode === "chat" ? "Ask a follow-up..." : undefined}
      value={promptText}
      onValueChange={setPromptText}
      inputRef={promptInputRef}
      onComposeStart={chat.startCompose}
      onComposeEnd={chat.endCompose}
      onDismiss={chat.close}
      onAsk={chat.ask}
    />
  );

  const stage = (
    <AnimatePresence>
      {composing && (
        <ComposeStage
          mode={chat.mode}
          name={data.learner.name.trim().split(/\s+/)[0]}
          suggestions={buildSuggestions(course)}
          messages={chat.messages}
          typing={chat.typing}
          onPick={chat.ask}
          onClose={chat.close}
          onFrontChange={setComposeAccent}
        />
      )}
    </AnimatePresence>
  );

  return breakpoint === "desktop" ? (
    <HomeDesktop
      data={data}
      actions={actions}
      promptBar={promptBar(ACCENTS.continueLearning)}
      composing={composing}
      stage={stage}
    />
  ) : (
    <HomeCarousel data={data} actions={actions} promptBar={promptBar} composing={composing} stage={stage} />
  );
}

export function HomeView() {
  const home = useLoad(getHome);
  if (home.status !== "ready" || !home.data) return null;
  return <HomeContent data={home.data} />;
}
