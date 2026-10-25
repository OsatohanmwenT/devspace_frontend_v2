"use client";

import { useRouter } from "next/navigation";
import { saveProfile } from "~/features/profile";
import { usePageTransition } from "~/providers/page-transition-provider";
import type { Profile } from "~/types/profile";
import { OnboardingFlow } from "./onboarding-flow";

// Runs the flow, saves the finished profile, then leaves for the app.
export default function Onboarding() {
  const router = useRouter();
  const startTransition = usePageTransition();

  async function complete(profile: Profile) {
    await saveProfile(profile);
    startTransition(() => router.replace("/home"));
  }

  return <OnboardingFlow onComplete={complete} />;
}
