import type { ReactNode } from "react";
import { s } from "./cx";

/** Drawing primitives: dimension lines with arrowheads and extension ticks, centre marks, leaders. */

function Arrow({ dir }: { dir: "l" | "r" | "u" | "d" }) {
  const rot = { l: 0, r: 180, u: 90, d: 270 }[dir];
  return (
    <svg width="9" height="7" viewBox="0 0 9 7" className="shrink-0" style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M0 3.5 L9 0.5 L9 6.5 Z" fill="currentColor" />
    </svg>
  );
}

/** Horizontal dimension. Position it with className (absolute left/right/top). */
export function DimH({ label, className = "", bg = "var(--paper)" }: { label: ReactNode; className?: string; bg?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute flex items-center text-(--ink) ${className}`}>
      <span className="absolute -top-[7px] left-0 h-[15px] w-px bg-current opacity-60" />
      <span className="absolute -top-[7px] right-0 h-[15px] w-px bg-current opacity-60" />
      <Arrow dir="l" />
      <span className="h-px flex-1 bg-current" />
      {/* The figure stays between the arrowheads: a long one breaks onto a second line rather than running over them. */}
      <span className={`${s.mono} min-w-0 px-2 text-center text-[11px] leading-[1.25] tabular-nums [text-wrap:balance]`} style={{ background: bg }}>
        {label}
      </span>
      <span className="h-px flex-1 bg-current" />
      <Arrow dir="r" />
    </div>
  );
}

/** Vertical dimension. */
export function DimV({ label, className = "", bg = "var(--paper)" }: { label: ReactNode; className?: string; bg?: string }) {
  return (
    <div aria-hidden className={`pointer-events-none absolute flex flex-col items-center text-(--ink) ${className}`}>
      <span className="absolute -left-[7px] top-0 h-px w-[15px] bg-current opacity-60" />
      <span className="absolute -left-[7px] bottom-0 h-px w-[15px] bg-current opacity-60" />
      <Arrow dir="u" />
      <span className="w-px flex-1 bg-current" />
      <span
        className={`${s.mono} whitespace-nowrap py-2 text-[11px] leading-none tabular-nums [writing-mode:vertical-rl] rotate-180`}
        style={{ background: bg }}
      >
        {label}
      </span>
      <span className="w-px flex-1 bg-current" />
      <Arrow dir="d" />
    </div>
  );
}

/** Centre lines through a circle: dash-dot, running a little past the edge. */
export function CentreMark({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden className={`pointer-events-none absolute overflow-visible ${className}`} viewBox="0 0 100 100" preserveAspectRatio="none">
      <line x1="-8" y1="50" x2="108" y2="50" stroke="currentColor" strokeWidth="1" strokeDasharray="12 3 2 3" vectorEffect="non-scaling-stroke" />
      <line x1="50" y1="-8" x2="50" y2="108" stroke="currentColor" strokeWidth="1" strokeDasharray="12 3 2 3" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}
