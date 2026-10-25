import type { ComponentType, SVGProps } from "react";
import { CompassIcon, DumbbellIcon, HomeIcon, PodiumIcon } from "~/components/ui/icons";

export type NavItem = {
  href: string;
  label: string;
  // Phones show icons only, with a shorter label for assistive tech.
  mobileLabel: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  // Active colours on phones: the icon, and the bar under it.
  activeText: string;
  activeBar: string;
};

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/home",
    label: "Home",
    mobileLabel: "Home",
    Icon: HomeIcon,
    activeText: "text-blue-600 dark:text-blue-400",
    activeBar: "bg-blue-600 dark:bg-blue-400",
  },
  {
    href: "/paths",
    label: "Paths",
    mobileLabel: "Paths",
    Icon: CompassIcon,
    activeText: "text-cyan-700 dark:text-cyan-500",
    activeBar: "bg-cyan-700 dark:bg-cyan-500",
  },
  {
    href: "/leaderboard",
    label: "Leaderboard",
    mobileLabel: "Ranks",
    Icon: PodiumIcon,
    activeText: "text-rose-600 dark:text-rose-400",
    activeBar: "bg-rose-600 dark:bg-rose-400",
  },
  {
    href: "/practice",
    label: "Practice",
    mobileLabel: "Practice",
    Icon: DumbbellIcon,
    activeText: "text-amber-600 dark:text-amber-500",
    activeBar: "bg-amber-600 dark:bg-amber-500",
  },
];
