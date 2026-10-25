"use client";

import Link from "next/link";
import { assetUrl } from "~/config/assets";
import type { ProgressSummary } from "~/types/progress";
import { AccountMenu } from "./account-menu";
import { HeaderStats } from "./header-stats";
import { PrimaryNav } from "./primary-nav";

// The header's content lines up with the 1160px page column, so its side
// padding grows with the viewport.
export function SiteHeader({ summary }: { summary: ProgressSummary }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center border-b border-line bg-white/95 px-[max(22px,calc((100vw-1160px)/2))] backdrop-blur-md max-[680px]:px-4 dark:border-night-line dark:bg-night/95">
      <Link
        href="/home"
        data-cuelume-press="pulse"
        data-cuelume-release="release"
        className="focus-ring flex items-center rounded-lg"
        aria-label="Devspace home"
      >
        {/* Phones show just the mark: the first 33px of the wordmark image. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
        <img
          className="hidden h-[19px] w-[129px] brightness-0 tab:block dark:brightness-100"
          src={assetUrl("logo.svg")}
          alt="Devspace"
        />
        <span className="mr-6 block h-5 w-[33px] overflow-hidden min-[420px]:mr-8 min-[540px]:mr-10 tab:hidden">
          {/* eslint-disable-next-line @next/next/no-img-element -- SVG logo */}
          <img
            className="h-5 w-[135px] max-w-none brightness-0 dark:brightness-100"
            src={assetUrl("logo.svg")}
            alt="Devspace"
          />
        </span>
      </Link>

      <PrimaryNav />

      <div className="ml-auto flex items-center gap-3.5 max-tab:gap-2.5 sm:gap-3">
        <HeaderStats summary={summary} />
        <AccountMenu />
      </div>
    </header>
  );
}
