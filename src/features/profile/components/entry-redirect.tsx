"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { getProfile } from "../api/profile-api";

// The app's front door: a learner with no profile goes to onboarding, anyone
// else goes home.
export function EntryRedirect() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    getProfile().then((profile) => {
      if (!cancelled) router.replace(profile ? "/home" : "/onboarding");
    });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
