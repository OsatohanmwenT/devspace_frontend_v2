"use client";

import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { useDismiss } from "~/hooks/use-dismiss";
import { useTheme } from "~/hooks/use-theme";
import { useToast } from "~/providers/toast-provider";

const ITEM =
  "focus-ring flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-[15px] font-medium text-neutral-800 hover:bg-blue-50 dark:text-night-ink dark:hover:bg-[#262b34]";
const ICON = "size-[17px]";

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg
      className={ICON}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function AccountMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme, setTheme } = useTheme();
  const toast = useToast();

  useDismiss(open, () => setOpen(false), menuRef, buttonRef);
  const close = () => setOpen(false);

  function toggleTheme() {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    toast(`${next === "light" ? "Light" : "Dark"} mode enabled`);
    close();
  }

  return (
    <>
      <button
        ref={buttonRef}
        data-cuelume-toggle
        className="focus-ring min-h-9 min-w-9 rounded-lg p-1 text-xl text-ink-soft sm:min-h-11 sm:min-w-11 sm:p-2 sm:text-[21px] dark:text-night-soft"
        onClick={() => setOpen((current) => !current)}
        aria-label={open ? "Close account menu" : "Open account menu"}
        aria-expanded={open}
      >
        ☰
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute top-14 right-[max(22px,calc((100vw-1160px)/2))] z-[5] grid min-w-[216px] gap-0.5 rounded-[14px] border border-line bg-white p-2 shadow-[0_18px_44px_rgba(20,20,20,0.14)] max-[680px]:right-[18px] dark:border-night-line dark:bg-night-card dark:shadow-[0_18px_44px_rgba(0,0,0,0.42)]"
        >
          <Link href="/profile" role="menuitem" className={ITEM} onClick={close}>
            <span className="grid size-5 place-items-center text-[17px]" aria-hidden="true">♙</span>
            Profile
          </Link>
          <Link href="/profile?view=public" role="menuitem" className={ITEM} onClick={close}>
            <Glyph>
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
              <circle cx="12" cy="12" r="2.5" />
            </Glyph>
            Public profile
          </Link>
          <Link href="/plans" role="menuitem" className={ITEM} onClick={close}>
            <Glyph>
              <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6.5 6.5 9 9M15 15l2.5 2.5M17.5 6.5 15 9M9 15l-2.5 2.5" />
            </Glyph>
            Devspace Pro
          </Link>
          <div className="my-1 border-t border-line dark:border-night-line" role="separator" />
          <Link href="/settings" role="menuitem" className={ITEM} onClick={close}>
            <Glyph>
              <circle cx="12" cy="12" r="3" />
              <path d="M12 3v2M12 19v2M21 12h-2M5 12H3M18.4 5.6 17 7M7 17l-1.4 1.4M18.4 18.4 17 17M7 7 5.6 5.6" />
            </Glyph>
            Settings
          </Link>
          <button type="button" role="menuitem" className={ITEM} onClick={toggleTheme}>
            <Glyph>
              <path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5Z" />
            </Glyph>
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            role="menuitem"
            className={ITEM}
            onClick={() => {
              toast("Support is coming soon");
              close();
            }}
          >
            <Glyph>
              <circle cx="12" cy="12" r="8" />
              <path d="M9.8 9a2.3 2.3 0 1 1 3.9 1.7c-.9.8-1.7 1.2-1.7 2.5M12 16.5h.01" />
            </Glyph>
            Help / Report a problem
          </button>
          <div className="my-1 border-t border-line dark:border-night-line" role="separator" />
          <button
            type="button"
            role="menuitem"
            className={ITEM}
            onClick={() => {
              toast("Signed out");
              close();
            }}
          >
            <Glyph>
              <path d="M10 5H5v14h5M14 8l4 4-4 4M9 12h9" />
            </Glyph>
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
