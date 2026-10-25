"use client";

import { useId, useState, type ReactNode } from "react";
import { InfoIcon } from "./icons";

const ALIGNMENT = { start: "left-0", end: "right-0", center: "left-1/2 -translate-x-1/2" };

// Hover or focus shows it like a real tooltip; a click also toggles it, so it
// still works on touch devices that have no hover.
export function InfoTooltip({ label, children, align = "center" }: { label: string; children: ReactNode; align?: keyof typeof ALIGNMENT }) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="grid size-5 place-items-center rounded-full text-[#9a9a9d] hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#073c72] dark:text-[#7d7d80] dark:hover:text-night-ink dark:focus-visible:outline-[#88bdf2]"
        aria-label={label}
        aria-describedby={id}
        aria-expanded={open}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((current) => !current)}
      >
        <InfoIcon className="size-full" />
      </button>
      {/* Fully hidden while closed, not just transparent: an invisible panel
          still takes layout, and near a screen edge it widened the page on
          phones. Width is capped to the viewport. */}
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={`absolute bottom-[calc(100%+8px)] z-10 w-max max-w-[min(240px,calc(100vw-36px))] rounded-lg border border-[#eeeeeb] bg-white p-2.5 text-left text-xs leading-[1.45] font-normal tracking-normal text-neutral-800 normal-case shadow-[0_8px_24px_rgba(20,20,20,0.12)] dark:border-night-line dark:bg-[#262626] dark:text-night-ink dark:shadow-[0_8px_24px_rgba(0,0,0,.3)] ${ALIGNMENT[align]}`}
      >
        {children}
      </span>
    </span>
  );
}
