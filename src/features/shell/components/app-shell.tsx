"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "~/features/profile";
import { getProgressSummary } from "~/features/progress";
import { useLoad } from "~/hooks/use-load";
import { SiteHeader } from "~/components/layout/site-header";

async function loadShell() {
  const profile = await getProfile();
  return profile ? { summary: await getProgressSummary() } : null;
}

// Everything signed-in pages share: the header, and the rule that someone
// without a profile belongs in onboarding. Focused surfaces that take over the
// whole screen turn the header off and keep the rule.
export function AppShell({ header = true }: { header?: boolean }) {
  const router = useRouter();
  const shell = useLoad(loadShell);
  const needsOnboarding = shell.status === "ready" && shell.data === null;

  useEffect(() => {
    if (needsOnboarding) router.replace("/onboarding");
  }, [needsOnboarding, router]);

  if (!header || shell.status !== "ready" || !shell.data) return null;

  return <SiteHeader summary={shell.data.summary} />;
}
