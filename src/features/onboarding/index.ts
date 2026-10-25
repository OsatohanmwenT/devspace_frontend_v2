"use client";

import dynamic from "next/dynamic";

// Rendered on the client only: the flow animates every screen in on mount, so
// server-rendered markup would just flash before it did.
export const Onboarding = dynamic(() => import("./components/onboarding"), {
  ssr: false,
});

export { getRoleLabelByValue } from "./lib/role-label";
