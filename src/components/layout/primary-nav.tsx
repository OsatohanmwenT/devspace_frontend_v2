"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./nav-items";

const isActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`);

// Icon tabs on phones, text tabs from 681px up. Both are the same four links.
export function PrimaryNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="flex items-center gap-1 tab:hidden sm:gap-1.5" aria-label="Mobile navigation">
        {NAV_ITEMS.map(({ href, mobileLabel, Icon, activeText, activeBar }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              data-cuelume-toggle
              aria-label={mobileLabel}
              aria-current={active ? "page" : undefined}
              className={`focus-ring relative flex h-16 items-center px-1.5 transition-colors min-[380px]:px-2.5 ${
                active
                  ? activeText
                  : "text-ink-soft hover:text-neutral-800 dark:text-night-soft dark:hover:text-night-ink"
              }`}
            >
              <Icon className="size-[22px] max-[360px]:size-5" />
              {active && (
                <span
                  className={`absolute inset-x-1 bottom-0 h-[3px] rounded-full ${activeBar}`}
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      <nav className="mr-auto ml-12 hidden gap-6 tab:flex" aria-label="Primary navigation">
        {NAV_ITEMS.map(({ href, label }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              data-cuelume-hover="tick"
              data-cuelume-toggle
              aria-current={active ? "page" : undefined}
              className={`focus-ring relative flex h-16 items-center px-0.5 text-sm font-medium after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:content-[''] ${
                active
                  ? "text-neutral-800 after:bg-blue-400 dark:text-night-ink"
                  : "text-ink-soft after:bg-transparent hover:text-neutral-700 dark:text-night-soft dark:hover:text-night-ink"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
