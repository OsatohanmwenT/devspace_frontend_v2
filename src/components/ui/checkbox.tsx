"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import type { ComponentProps } from "react";
import { CheckIcon } from "./icons";

// shadcn's Radix checkbox, styled with the app's existing blue and neutral tokens.
export function Checkbox({ className = "", ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-cuelume-toggle
      className={`peer size-4 shrink-0 rounded-[4px] border border-neutral-300 shadow-xs transition-shadow outline-none focus-visible:border-blue-400 focus-visible:ring-[3px] focus-visible:ring-blue-400/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-red-500 aria-invalid:ring-red-500/20 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white dark:border-neutral-600 dark:bg-white/5 dark:data-[state=checked]:bg-blue-600 ${className}`}
      {...props}
    >
      <CheckboxPrimitive.Indicator data-slot="checkbox-indicator" className="grid place-content-center text-current">
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
