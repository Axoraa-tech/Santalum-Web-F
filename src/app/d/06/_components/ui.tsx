"use client";

import type { ReactNode } from "react";
import { bag } from "@/lib/cart";
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

/** Add to the shared bag and nudge the bag tile. */
export function addToBag(slug: string, wood: Wood) {
  bag.add(slug, wood);
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
