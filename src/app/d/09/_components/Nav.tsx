"use client";

import Link from "next/link";
import type { KeyboardEvent } from "react";
import { WT } from "@/components/maison/W";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import s from "../styles";

/** Wordmark top left; the wood toggle (two bowls of powder) to the left of the sundial. */
export function Nav() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
      <div className="flex h-[76px] items-center justify-between pl-4 pr-[72px] sm:pl-6 sm:pr-[190px] lg:pl-10 lg:pr-[204px]">
        <Link
          href="/d/09"
          aria-label="Santalum Maison, home"
          className="pointer-events-auto group flex items-baseline gap-2 rounded-full py-1 transition-opacity active:opacity-70"
        >
          <span className={`${s.display} text-[24px] leading-none sm:text-[27px]`}>Santalum</span>
          <span className="hidden text-[12px] leading-none text-[var(--muted)] transition-colors group-hover:text-[var(--m-accent)] sm:inline">
            Maison
          </span>
        </Link>
        <Bowls className="pointer-events-auto" />
      </div>
    </header>
  );
}

function Bowl({ wood }: { wood: Wood }) {
  const red = wood === "red";
  const id = `d09-powder-${wood}`;
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" aria-hidden>
      <defs>
        <radialGradient id={id} cx="45%" cy="30%" r="75%">
          <stop offset="0%" stopColor={red ? "#c75a3c" : "#f6ead0"} />
          <stop offset="100%" stopColor={red ? "#7c2615" : "#d2b07a"} />
        </radialGradient>
      </defs>
      {/* the mound of powder */}
      <path d="M6 13 C9 6, 13 4, 17 4 C21 4, 25 6, 28 13 Z" fill={`url(#${id})`} />
      {[
        [11, 10.5],
        [15, 8],
        [19.5, 9.5],
        [23, 11.5],
        [14, 11.5],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="0.6" fill={red ? "#5c1a0e" : "#b48d52"} opacity="0.7" />
      ))}
      {/* the bowl */}
      <path d="M2 12.5 H32 C31 20, 25.5 24, 17 24 C8.5 24, 3 20, 2 12.5 Z" fill="#d9cbb9" />
      <path d="M2 12.5 H32 C31 20, 25.5 24, 17 24 C8.5 24, 3 20, 2 12.5 Z" fill="none" stroke="rgb(42 36 32 / 0.45)" strokeWidth="0.9" />
      <path d="M5 15.5 C8 19.5, 12 21, 17 21" fill="none" stroke="rgb(255 255 255 / 0.55)" strokeWidth="0.9" strokeLinecap="round" />
    </svg>
  );
}

/** The red / white switch: two small bowls of powder. A radio group, so arrow keys move between them. */
export function Bowls({ className = "", showName = true }: { className?: string; showName?: boolean }) {
  const wood = useWood();
  const onKey = (e: KeyboardEvent) => {
    if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
      e.preventDefault();
      const next: Wood = wood === "red" ? "white" : "red";
      switchWood(next);
      const el = (e.currentTarget as HTMLElement).querySelector<HTMLButtonElement>(`[data-wood-option="${next}"]`);
      el?.focus();
    }
  };
  return (
    <div className={`flex items-center gap-1 rounded-full border border-[var(--hair)] bg-[rgb(251_248_243/0.88)] p-0.5 ${className}`}>
      {showName && (
        <span className="hidden pl-3.5 pr-1 text-right text-[12px] leading-tight text-[var(--muted)] md:block">
          <WT red="Red sandalwood" white="White sandalwood" />
        </span>
      )}
      <div role="radiogroup" aria-label="Wood" onKeyDown={onKey} className="flex items-center">
        {(["red", "white"] as const).map((w) => (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={wood === w}
            aria-label={w === "red" ? "Red sandalwood" : "White sandalwood"}
            tabIndex={wood === w ? 0 : -1}
            data-wood-option={w}
            onClick={() => switchWood(w)}
            className={`${s.bowl} ${w === "red" ? s.bowlRed : s.bowlWhite}`}
          >
            <Bowl wood={w} />
            <span className={s.bowlDot} />
          </button>
        ))}
      </div>
    </div>
  );
}
