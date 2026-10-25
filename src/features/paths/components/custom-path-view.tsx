"use client";

import { useState } from "react";
import { PageIntroStages, type IntroStage } from "~/components/ui/page-intro-stages";
import { useLoad } from "~/hooks/use-load";
import { hasSeenCustomPathIntro, markCustomPathIntroSeen } from "../api/paths-api";
import { CustomPathBuilder } from "./custom-path-builder";

const STAGES: IntroStage[] = [
  { title: "Build a path around your goal", body: "Tell Devy what you want to learn, build, or prepare for.", mood: "neutral" },
  { title: "Get a route that fits", body: "Your route is shaped around your goal, experience, and the work you want to make.", mood: "neutral" },
  { title: "Start with a real lesson", body: "Build practical skills now, then work toward a project you can share.", mood: "celebrating" },
];

// The first visit explains custom paths; after that it goes straight to the builder.
export function CustomPathView() {
  const seen = useLoad(hasSeenCustomPathIntro);
  const [dismissed, setDismissed] = useState(false);

  if (seen.status !== "ready") return <main className="min-h-dvh" aria-busy="true" />;
  if (!seen.data && !dismissed) {
    return (
      <PageIntroStages
        stages={STAGES}
        finalActionLabel="Build my path"
        ariaLabel="About custom paths"
        onDone={() => {
          markCustomPathIntroSeen();
          setDismissed(true);
        }}
      />
    );
  }
  return <CustomPathBuilder />;
}
