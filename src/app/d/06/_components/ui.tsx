"use client";

import type { ReactNode } from "react";
import { bag } from "@/lib/shop/bag";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx } from "./data";
import { added } from "./store";

/* ---------- icons (stroke, currentColor) ---------- */

type IconProps = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
});

export const IconSearch = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </svg>
);
export const IconClose = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
);
export const IconOpen = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconExpand = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7" />
  </svg>
);
export const IconMinus = ({ size = 16, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14" />
  </svg>
);
export const IconBag = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 8h14l-1 12H6L5 8Z" />
    <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
  </svg>
);
export const IconUp = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
);
export const IconCheck = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IconArrow = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const IconHeart = ({ size = 18, className, filled = false }: IconProps & { filled?: boolean }) => (
  <svg {...base(size)} className={className} fill={filled ? "currentColor" : "none"}>
    <path d="M12 19.5s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 7.6a3.9 3.9 0 0 1 7 2.3c0 5.3-7 9.6-7 9.6Z" />
  </svg>
);
export const IconUser = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="12" cy="8.5" r="3.6" />
    <path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5" />
  </svg>
);
export const IconTrack = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <circle cx="6" cy="17" r="2" />
    <circle cx="18" cy="7" r="2" />
    <path d="M8 17h5a3 3 0 0 0 0-6h-2a3 3 0 0 1 0-6h5" />
  </svg>
);
export const IconGrid = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <rect x="4" y="4" width="7" height="7" rx="2" />
    <rect x="13" y="4" width="7" height="7" rx="2" />
    <rect x="4" y="13" width="7" height="7" rx="2" />
    <rect x="13" y="13" width="7" height="7" rx="2" />
  </svg>
);
export const IconOut = ({ size = 18, className }: IconProps) => (
  <svg {...base(size)} className={className}>
    <path d="M14 5h4a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4" />
  </svg>
);

/** The round open mark in a tile corner (decorative; the tile's hit button carries the label). */
export function Corner({ className, icon = "plus" }: { className?: string; icon?: "plus" | "expand" }) {
  return (
    <span className={cx(s.corner, className)} aria-hidden>
      {icon === "plus" ? <IconOpen /> : <IconExpand />}
    </span>
  );
}

/** A wood swatch: a few grain lines, drawn, not photographed. */
export function Swatch({ wood, size = 16, className }: { wood: Wood; size?: number; className?: string }) {
  const bg =
    wood === "red"
      ? "repeating-linear-gradient(104deg, #5e1a0c 0 1.5px, #9b3520 1.5px 4px, #b4492b 4px 5px, #8a2c18 5px 7px)"
      : "repeating-linear-gradient(104deg, #b98d52 0 1px, #ecd7ae 1px 4px, #d6b57f 4px 5px, #f3e4c4 5px 7px)";
  return (
    <span
      aria-hidden
      className={cx("inline-block shrink-0 rounded-full ring-1 ring-black/10", className)}
      style={{ width: size, height: size, background: bg }}
    />
  );
}

/** The house mark: a four-cell bento, one cell in the wood's accent. */
export function Mark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 22 22" aria-hidden>
      <rect x="0" y="0" width="13" height="13" rx="4" fill="currentColor" />
      <rect x="15" y="0" width="7" height="13" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="0" y="15" width="7" height="7" rx="3" fill="currentColor" opacity="0.35" />
      <rect x="9" y="15" width="13" height="7" rx="3" fill="var(--m-accent)" />
    </svg>
  );
}

/** Add to the shared bag and nudge every bag in the chrome. */
export function addToBag(slug: string, opts: { option?: string; qty?: number; note?: string } = {}) {
  bag.add(slug, opts);
  added.bump();
}

export function Kbd({ children }: { children: ReactNode }) {
  return <kbd className={cx(s.kbd, s.mono)}>{children}</kbd>;
}

/** Keep Tab inside an open dialog. */
export function trapTab(e: KeyboardEvent, root: HTMLElement) {
  const els = Array.from(
    root.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])'),
  ).filter((el) => el.offsetParent !== null);
  if (!els.length) return;
  const first = els[0];
  const last = els[els.length - 1];
  const a = document.activeElement;
  if (!root.contains(a)) {
    e.preventDefault();
    first.focus();
  } else if (e.shiftKey && a === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && a === last) {
    e.preventDefault();
    first.focus();
  }
}

const STAR = "M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z";
function StarRow({ size, className }: { size: number; className?: string }) {
  return (
    <span className={cx("flex", className)}>
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
          <path d={STAR} fill="currentColor" />
        </svg>
      ))}
    </span>
  );
}

/** Five stars, filled to the rating (fractions included). */
export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value.toFixed(1)} out of 5`} className={cx("relative inline-flex shrink-0", className)}>
      <StarRow size={size} className="text-[var(--b-dim)]" />
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${(value / 5) * 100}%` }}>
        <StarRow size={size} className="text-accent" />
      </span>
    </span>
  );
}

export const StarIcon = ({ size = 18, className }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className={className}>
    <path d={STAR} fill="currentColor" />
  </svg>
);
