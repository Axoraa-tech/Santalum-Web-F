"use client";

import { useState } from "react";
import { bag } from "@/lib/cart";
import type { Family } from "@/lib/catalog";
import { switchWood, useWood } from "@/lib/wood";
import { bagUI } from "./store";
import { WOOD_LABEL } from "./copy";
import { s } from "./cls";

export function BagIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden>
      <path d="M5 8.5h14l-1.1 11a1.6 1.6 0 0 1-1.6 1.5H7.7a1.6 1.6 0 0 1-1.6-1.5L5 8.5Z" strokeLinejoin="round" />
      <path d="M8.8 8.5V7a3.2 3.2 0 0 1 6.4 0v1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className} aria-hidden>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ArrowIcon({ className = "size-4", dir = "right" }: { className?: string; dir?: "right" | "left" | "up-right" }) {
  const rot = dir === "left" ? 180 : dir === "up-right" ? -45 : 0;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={className} style={{ transform: `rotate(${rot}deg)` }} aria-hidden>
      <path d="M4 12h15M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** A small round wood swatch in the current or a given wood. */
export function Swatch({ wood, className = "size-4" }: { wood: "red" | "white"; className?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${wood === "red" ? s.woodRed : s.woodWhite} ${className}`} />;
}

/**
 * Add to bag in the current wood. If the piece is not made in the current wood,
 * it offers to switch to the wood it is made in.
 */
export function AddButton({
  family,
  custom,
  label,
  className = "",
  dark = true,
}: {
  family: Family;
  custom?: string;
  label?: string;
  className?: string;
  dark?: boolean;
}) {
  const wood = useWood();
  const [added, setAdded] = useState(false);
  const made = !!family.variants[wood];
  const other = wood === "red" ? "white" : "red";
  const base = `group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full px-7 text-[15px] font-semibold transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${className}`;

  if (!made) {
    return (
      <button type="button" onClick={() => switchWood(other)} className={`${base} border border-[var(--o-ink)] text-[var(--o-ink)] hover:bg-[var(--o-ink)] hover:text-white`}>
        <Swatch wood={other} className="size-5" />
        Made only in {WOOD_LABEL[other].toLowerCase()}: switch wood
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        bag.add(family.slug, wood, 1, custom);
        bagUI.bump();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 2200);
      }}
      className={`${base} ${dark ? "bg-[var(--o-ink)] text-white hover:bg-black" : "bg-white text-[var(--o-ink)] hover:bg-[var(--o-floor)]"}`}
    >
      <span className="relative grid size-6 place-items-center rounded-full bg-[var(--m-accent)] text-white transition-transform duration-500 group-hover:rotate-90">
        {added ? <CheckIcon className="size-3.5" /> : <span className="text-[15px] leading-none">+</span>}
      </span>
      <span aria-live="polite">{added ? "Added to your bag" : (label ?? "Add to bag")}</span>
    </button>
  );
}
