"use client";

import { useId, type ReactNode } from "react";
import { s } from "./cls";
import { CheckIcon } from "./ui";

const C = 2 * Math.PI * 22;

/**
 * Orbit's form field. Every answer is a station: a capsule with a small dial at its left that
 * closes its ring (and turns ink with a check) once the answer is good. The label sits inside
 * the capsule, above the value, so a form reads as a row of stations rather than a stack of boxes.
 * Inputs inside take `s.stIn`.
 */
export function Station({
  label,
  glyph,
  done = false,
  error,
  hint,
  locked = false,
  trailing,
  className = "",
  children,
}: {
  label: string;
  /** One or two characters on the dial before it closes. */
  glyph: ReactNode;
  done?: boolean;
  error?: string | null;
  hint?: string;
  /** Read-only: the dial shows the glyph on stone, never a check. */
  locked?: boolean;
  /** Something at the right end of the capsule (a turn mark for a picker). */
  trailing?: ReactNode;
  className?: string;
  children: (a: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : "";
  const errId = error ? `${id}-err` : "";
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  const closed = done && !locked && !error;
  return (
    <div className={className}>
      <div
        className={`relative flex items-center gap-3 rounded-full border p-1.5 pr-5 transition-[border-color,box-shadow,background-color] duration-300 focus-within:border-[var(--o-ink)] focus-within:shadow-[0_0_0_4px_var(--m-accent-soft)] ${
          error ? "border-[#b3261e]" : "border-[var(--o-line)] hover:border-[rgb(25_23_20/0.3)]"
        } ${locked ? "bg-[var(--o-stone)]" : "bg-[var(--o-card)]"}`}
      >
        <span aria-hidden className="relative grid size-12 shrink-0 place-items-center">
          <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
            <circle cx="24" cy="24" r="22" fill={closed ? "var(--o-ink)" : "var(--o-bg)"} stroke="var(--o-line)" strokeWidth="1.5" style={{ transition: "fill 0.5s" }} />
            <circle
              cx="24"
              cy="24"
              r="22"
              fill="none"
              stroke="var(--m-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={closed ? 0 : C}
              style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
            />
          </svg>
          <span className={`${s.syne} relative text-[14px] font-bold leading-none transition-colors duration-500 ${closed ? "text-white" : locked ? "text-[var(--o-muted)]" : "text-[var(--o-ink)]"}`}>
            {closed ? <CheckIcon className="size-4" /> : glyph}
          </span>
        </span>
        <span className="min-w-0 flex-1 py-0.5">
          <label htmlFor={id} className="block truncate text-[12px] font-semibold leading-tight text-[var(--o-muted)]">
            {label}
          </label>
          {children({ id, describedBy, invalid: !!error })}
        </span>
        {trailing}
      </div>
      {hint && !error && (
        <p id={hintId} className="mt-1.5 pl-[68px] text-[13px] text-[var(--o-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-2 pl-[68px] text-[13px] font-medium text-[#a3241b]">
          <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-[#a3241b]" />
          {error}
        </p>
      )}
    </div>
  );
}

/** The mark at the end of a picker station: two arcs chasing each other, a knob to turn. */
export function TurnMark() {
  return (
    <svg viewBox="0 0 24 24" className="pointer-events-none size-5 shrink-0 text-[var(--o-muted)]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M19 12a7 7 0 0 0-12.2-4.7" />
      <path d="M6.6 4.2v3.4H10" />
      <path d="M5 12a7 7 0 0 0 12.2 4.7" />
      <path d="M17.4 19.8v-3.4H14" />
    </svg>
  );
}
