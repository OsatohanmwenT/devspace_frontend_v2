import type { ComponentProps } from "react";
import { ArrowLeftIcon } from "~/components/ui/icons";

// The one obvious, full-width action a Home card ends on: a pressable button in
// the card's own accent colour.
export function CardCta({ children, className = "", ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-cuelume-press="pulse"
      data-cuelume-release="release"
      className={`focus-ring relative flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-accent bg-accent text-center font-bold text-white shadow-[0_2px_0_rgb(var(--card-accent)_/_0.38)] transition-[transform,box-shadow] duration-75 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none dark:shadow-[0_3px_0_rgb(var(--card-accent)_/_0.6)] ${className}`}
      {...props}
    >
      {children}
      <ArrowLeftIcon className="size-4 rotate-180" />
    </button>
  );
}
