import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      {children}
    </svg>
  );
}

export const HomeIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H14v-6h-4v6H5.5A1.5 1.5 0 0 1 4 19v-8.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const CompassIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
    <path d="M15.3 8.7 12.8 13 8.5 15.3 11 11l4.3-2.3Z" fill="currentColor" />
  </Icon>
);

export const PodiumIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M12 2.5l1.5 3 3.3.4-2.4 2.3.6 3.3L12 9.9l-2.9 1.6.6-3.3-2.4-2.3 3.3-.4L12 2.5Z" fill="currentColor" />
    <rect x="2.5" y="15" width="5.5" height="6.5" rx="1" fill="currentColor" opacity=".55" />
    <rect x="9.2" y="11" width="5.5" height="10.5" rx="1" fill="currentColor" />
    <rect x="16" y="13" width="5.5" height="8.5" rx="1" fill="currentColor" opacity=".55" />
  </Icon>
);

export const DumbbellIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="1.5" y="9" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="19.5" y="9" width="3" height="6" rx="1" fill="currentColor" />
    <rect x="4.5" y="7" width="2.5" height="10" rx="1" fill="currentColor" />
    <rect x="17" y="7" width="2.5" height="10" rx="1" fill="currentColor" />
    <rect x="7" y="11" width="10" height="2" rx="1" fill="currentColor" />
  </Icon>
);

export const SirenIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 16v-4a5 5 0 0 1 10 0v4H7Z" fill="currentColor" />
    <path
      d="M5 16h14v3H5zM12 4V2M5.6 6.1 4.2 4.7M18.4 6.1l1.4-1.4"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </Icon>
);

export const BoltIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
  </Icon>
);

export const PlayIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M7 4.2v15.6a1 1 0 0 0 1.53.85l12.4-7.8a1 1 0 0 0 0-1.7L8.53 3.35A1 1 0 0 0 7 4.2Z"
      fill="currentColor"
    />
  </Icon>
);

export const RocketIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M12 2c2.8 1.6 4.6 5.2 4 9.4-.9 1-1.9 1.6-1.9 1.6v3.6a2.1 2.1 0 0 1-4.2 0V13c0 0-1-.6-1.9-1.6C7.4 7.2 9.2 3.6 12 2Z"
      fill="currentColor"
    />
    <circle cx="12" cy="9.2" r="1.4" className="fill-night" />
    <path d="M7.3 12.6 4.5 15.8M16.7 12.6l2.8 3.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </Icon>
);

export const SparkleIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M9.8 2.2C9.8 8 8.8 9 3 9c5.8 0 6.8 1 6.8 6.8 0-5.8 1-6.8 6.8-6.8-5.8 0-6.8-1-6.8-6.8Z"
      fill="currentColor"
    />
    <path d="M18.6 13.4c0 3.4-.6 4-4 4 3.4 0 4 .6 4 4 0-3.4.6-4 4-4-3.4 0-4-.6-4-4Z" fill="currentColor" opacity=".78" />
    <path d="M5.6 16c0 2.4-.4 2.8-2.8 2.8 2.4 0 2.8.4 2.8 2.8 0-2.4.4-2.8 2.8-2.8-2.4 0-2.8-.4-2.8-2.8Z" fill="currentColor" opacity=".55" />
  </Icon>
);

export const ArrowLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m11 5-7 7 7 7M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const CheckIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m5 13 5 5 9-11" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const LockIcon = (props: IconProps) => (
  <Icon {...props}>
    <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="2" fill="none" />
  </Icon>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m15 5-7 7 7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const ChecklistIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m4 7 2 2 3-3M11 7h9M4 13l2 2 3-3M11 13h9M4 19l2 2 3-3M11 19h9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);

export const BookOpenIcon = (props: IconProps) => (
  <Icon {...props}>
    <path
      d="M3.5 5.5A3.5 3.5 0 0 1 7 2h4.5a3 3 0 0 1 3 3v15a3 3 0 0 0-3-3H7a3.5 3.5 0 0 0-3.5 3v-14.5ZM20.5 5.5A3.5 3.5 0 0 0 17 2h-2.5v15H17a3.5 3.5 0 0 1 3.5 3v-14.5Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Icon>
);

export const InfoIcon = (props: IconProps) => (
  <Icon {...props}>
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
    <path d="M12 11v6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <circle cx="12" cy="7.5" r="1.25" fill="currentColor" />
  </Icon>
);

export const TrophyIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" fill="currentColor" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M12 14v3M9 20h6M9.5 17h5l.5 3H9l.5-3Z" fill="currentColor" />
  </Icon>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Icon {...props}>
    <path d="m9 5 7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </Icon>
);
