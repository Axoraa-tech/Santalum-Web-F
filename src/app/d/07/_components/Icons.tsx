import type { SVGProps } from "react";

const base = (p: SVGProps<SVGSVGElement>) => ({
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  ...p,
});

/** A small deck of three cards. */
export function IconDeck(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <rect x="5" y="9" width="14" height="11" rx="3.2" />
      <path d="M7 6.2h10" />
      <path d="M9 3.6h6" />
    </svg>
  );
}

/** The end grain of a log: two woods. */
export function IconRings(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12.6" cy="11.6" r="1.8" />
    </svg>
  );
}

/** A short strand of beads. */
export function IconBeads(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <circle cx="5.5" cy="9" r="2.3" />
      <circle cx="9.6" cy="14.6" r="2.3" />
      <circle cx="15.2" cy="16.4" r="2.3" />
      <circle cx="19.2" cy="11.6" r="2.3" />
      <path d="M12 4.5v3.3" />
    </svg>
  );
}

/** A carving chisel. */
export function IconChisel(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M14.5 3.5l6 6-2.2 2.2-6-6z" />
      <path d="M12.3 5.7L4 14l-.6 5.6L9 19l8.3-8.3" />
      <path d="M6.6 15.8l1.6 1.6" />
    </svg>
  );
}

export function IconBag(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M5.5 8.5h13l-1.1 11a1.6 1.6 0 0 1-1.6 1.5H8.2a1.6 1.6 0 0 1-1.6-1.5z" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" />
    </svg>
  );
}

export function IconArrow({ dir = "right", ...p }: SVGProps<SVGSVGElement> & { dir?: "left" | "right" | "up" | "down" }) {
  const r = { right: 0, down: 90, left: 180, up: 270 }[dir];
  return (
    <svg {...base(p)} style={{ transform: `rotate(${r}deg)`, ...p.style }}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}

export function IconFlip(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7" />
      <path d="M20 4v4.7h-4.7" />
      <path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3" />
      <path d="M4 20v-4.7h4.7" />
    </svg>
  );
}

export function IconClose(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/** Three cards fanned: the shop. */
export function IconShop(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <rect x="7.5" y="5" width="9" height="13" rx="2.2" />
      <path d="M6.2 7.4l-2.4.9 3.4 10.2 3-1" />
      <path d="M17.8 7.4l2.4.9-3.4 10.2-3-1" />
    </svg>
  );
}

/** A route from the workshop to a door. */
export function IconTrack(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <circle cx="6" cy="6.5" r="2.2" />
      <path d="M6 8.7v2.3a3 3 0 0 0 3 3h6a3 3 0 0 1 3 3v.3" />
      <path d="M15.6 18.4h4.8" />
      <path d="M18 16v4.8" />
    </svg>
  );
}

export function IconUser(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="8.4" r="3.6" />
      <path d="M4.8 20c.9-3.6 3.7-5.6 7.2-5.6s6.3 2 7.2 5.6" />
    </svg>
  );
}

export function IconHeart({ filled, ...p }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
  return (
    <svg {...base(p)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z" />
    </svg>
  );
}

export function IconSearch(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
    </svg>
  );
}

export function IconCheck(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)} strokeWidth={2.2}>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

export function IconPlus(p: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
