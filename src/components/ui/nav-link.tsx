import type { ReactNode } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "./icons";

// Small in-page navigation: bold, neutral text with a chevron, in the same
// language as the "My learning" back button. For links that sit above content,
// not for page-level nav.
const LINK =
  "focus-ring inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-neutral-800 hover:text-[#073c72] dark:text-night-ink dark:hover:text-[#88bdf2]";

export function BackLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={LINK}>
      <ChevronLeftIcon className="size-4 flex-none" />
      <span>{children}</span>
    </button>
  );
}

export function ForwardLink({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={LINK}>
      <span>{children}</span>
      <ChevronRightIcon className="size-4 flex-none" />
    </button>
  );
}
