import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function base({ size = 18, ...rest }: IconProps): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
    ...rest,
  };
}

export const PlayIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M7 4.5v15l12-7.5L7 4.5Z" fill="currentColor" stroke="none" />
  </svg>
);

export const PauseIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
    <rect x="14" y="4.5" width="4" height="15" rx="1" fill="currentColor" stroke="none" />
  </svg>
);

export const SearchIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.8-3.8" />
  </svg>
);

export const HeartIcon = ({ filled, ...p }: IconProps & { filled?: boolean }) => (
  <svg {...base(p)}>
    <path
      d="M12 20.5 4.7 13a5 5 0 0 1 7.07-7.07l.23.22.23-.22A5 5 0 1 1 19.3 13L12 20.5Z"
      fill={filled ? "currentColor" : "none"}
    />
  </svg>
);

export const ClockIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const UserIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8.5" r="3.8" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1v-9.5Z" />
  </svg>
);

export const VolumeIcon = ({ level = 1, ...p }: IconProps & { level?: number }) => (
  <svg {...base(p)}>
    <path d="M5 9.5v5h3.5L13 18.5v-13L8.5 9.5H5Z" fill="currentColor" stroke="none" />
    {level > 0 && <path d="M16 9.5a4 4 0 0 1 0 5" />}
    {level > 0.55 && <path d="M18.5 7a8 8 0 0 1 0 10" />}
    {level === 0 && <path d="m16 9.5 5 5m0-5-5 5" />}
  </svg>
);

export const FullscreenIcon = ({ exit, ...p }: IconProps & { exit?: boolean }) =>
  exit ? (
    <svg {...base(p)}>
      <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" />
    </svg>
  ) : (
    <svg {...base(p)}>
      <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />
    </svg>
  );

export const CinemaIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="6" width="18" height="12" rx="2" />
    <path d="M7 21h10" opacity="0.6" />
  </svg>
);

export const SettingsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.5-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.5-2-1.5c.07-.4.1-.8.1-1.2Z" />
  </svg>
);

export const CaptionsIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="M10.5 10.5a2 2 0 1 0 0 3M17 10.5a2 2 0 1 0 0 3" />
  </svg>
);

export const SpeedIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 19a8 8 0 1 1 8-8" />
    <path d="m12 11 5.5-3" />
  </svg>
);

export const ChevronLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m14.5 5-7 7 7 7" />
  </svg>
);

export const ChevronRightIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9.5 5 7 7-7 7" />
  </svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M19 12H5m0 0 6-6m-6 6 6 6" />
  </svg>
);

export const InfoIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5M12 7.8v.4" />
  </svg>
);

export const TrashIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4.5 7h15M9.5 7V5a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v2M6.5 7l1 12.2a1 1 0 0 0 1 .8h7a1 1 0 0 0 1-.8l1-12.2" />
  </svg>
);

export const SkipBackIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M11 8.5 6.5 12l4.5 3.5" />
    <path d="M17.5 7.7a6 6 0 1 1-8-1.2" />
  </svg>
);

export const SkipForwardIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m13 8.5 4.5 3.5L13 15.5" />
    <path d="M6.5 7.7a6 6 0 1 0 8-1.2" />
  </svg>
);

export const FilmIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M4 9h16M4 15h16M9 4v16M15 4v16" opacity="0.7" />
  </svg>
);

export const VertyxMark = ({ size = 24, ...rest }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true" {...rest}>
    <path d="M6 7l10 18L26 7" stroke="url(#vv-mark-grad)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M11.5 7l4.5 8 4.5-8" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <defs>
      <linearGradient id="vv-mark-grad" x1="6" y1="7" x2="26" y2="25">
        <stop stopColor="#a583ff" />
        <stop offset="1" stopColor="#3d76f2" />
      </linearGradient>
    </defs>
  </svg>
);
