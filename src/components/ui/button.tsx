import type { ComponentProps } from "react";

// `primary` is the call to action: a solid blue face (the exact Teams blues; Tailwind's own
// blue-600 renders more saturated) with a darker lower edge
// that presses flat when clicked. `neutral` is the same press for secondary
// actions, on a plain surface.
const VARIANTS = {
  primary:
    "rounded-xl border border-[#3b82f6] bg-[#2563eb] text-white shadow-[0_3px_0_#1d4ed8] hover:bg-[#3b82f6]",
  neutral:
    "rounded-[14px] border border-[#b8b2a8] bg-white text-neutral-800 shadow-[0_4px_0_#d8d4cd] hover:brightness-110 dark:border-[#666] dark:bg-[#262626] dark:text-night-ink dark:shadow-[0_4px_0_#3d3d3d]",
};

type ButtonProps = ComponentProps<"button"> & { variant?: keyof typeof VARIANTS };

export function Button({ variant = "primary", className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button
      type={type}
      data-cuelume-press="pulse"
      data-cuelume-release="release"
      className={`relative px-4 font-medium transition-[transform,filter,box-shadow] duration-75 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-blue-300 ${VARIANTS[variant]} ${className}`}
      {...props}
    />
  );
}
