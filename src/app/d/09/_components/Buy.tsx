"use client";

import { useId, type KeyboardEvent } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { useHydrated } from "@/lib/shop/store";
import { formatINR, getOption, priceOf, type Product } from "@/lib/shop/products";
import s from "../styles";
import { addPiece } from "./store";

/** Size, weight or volume, as a row of pills. A radio group: arrow keys move between them. */
export function OptionPicker({ p, value, onChange }: { p: Product; value?: string; onChange: (id: string) => void }) {
  const id = useId();
  if (!p.options) return null;
  const current = getOption(p, value)?.id;
  const vals = p.options.values;
  const varies = new Set(vals.map((v) => v.price)).size > 1;
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = vals.findIndex((v) => v.id === current);
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = vals[(i + d + vals.length) % vals.length];
    onChange(next.id);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-opt="${next.id}"]`)?.focus();
  };
  return (
    <div>
      <p id={`${id}-l`} className="text-[13px] text-[var(--muted)]">
        {p.options.name}
      </p>
      <div role="radiogroup" aria-labelledby={`${id}-l`} onKeyDown={onKey} className="mt-3 flex flex-wrap gap-2">
        {vals.map((v) => {
          const on = v.id === current;
          return (
            <button
              key={v.id}
              type="button"
              role="radio"
              aria-checked={on}
              tabIndex={on ? 0 : -1}
              data-opt={v.id}
              onClick={() => onChange(v.id)}
              className={s.chip}
            >
              <span aria-hidden className={s.chipSun} />
              <span>{v.label}</span>
              {varies && <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{formatINR(v.price)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Quantity, one to nine. */
export function Qty({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const btn =
    "grid size-11 place-items-center rounded-full text-[18px] transition-colors hover:bg-[var(--m-accent-soft)] active:scale-90 disabled:opacity-35 disabled:hover:bg-transparent";
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full border border-[var(--hair)] p-0.5">
      <button type="button" className={btn} onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} aria-label="One fewer">
        −
      </button>
      <span className={`${s.tab} w-8 text-center text-[16px]`} aria-live="polite">
        {value}
      </span>
      <button type="button" className={btn} onClick={() => onChange(Math.min(9, value + 1))} disabled={value >= 9} aria-label="One more">
        +
      </button>
    </div>
  );
}

/** Add to the offering tray, showing the price for the chosen option and quantity. */
export function AddToTray({ p, option, qty = 1, className = "" }: { p: Product; option?: string; qty?: number; className?: string }) {
  return (
    <button type="button" onClick={() => addPiece(p.slug, { option, qty })} className={`${s.btn} ${className}`}>
      Add to the tray
      <span className={`${s.tab} opacity-70`}>{formatINR(priceOf(p, option) * qty)}</span>
    </button>
  );
}

/** Keep a piece for later: a small sun that fills when kept. Works signed in or out. */
export function Keep({ p, className = "" }: { p: Product; className?: string }) {
  const list = useWishlist();
  const hydrated = useHydrated();
  const kept = hydrated && list.includes(p.slug);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(p.slug)}
      aria-pressed={kept}
      aria-label={kept ? `Remove ${p.name} from your wishlist` : `Save ${p.name} to your wishlist`}
      title={kept ? "In your wishlist" : "Save to your wishlist"}
      className={`${s.keep} ${className}`}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <circle className={s.keepDisc} cx="11" cy="11" r="4.6" stroke="currentColor" strokeWidth="1.3" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={(11 + Math.cos(a) * 7.2).toFixed(2)}
              y1={(11 + Math.sin(a) * 7.2).toFixed(2)}
              x2={(11 + Math.cos(a) * 9.4).toFixed(2)}
              y2={(11 + Math.sin(a) * 9.4).toFixed(2)}
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
    </button>
  );
}

/** "7 of 21 remain", with a row of small lamps: lit for the numbers already placed. */
export function EditionLamps({ p, className = "" }: { p: Product; className?: string }) {
  if (!p.edition) return null;
  const { size, left } = p.edition;
  const placed = size - left;
  return (
    <div className={className}>
      <p className="text-[15px]">
        <span className={`${s.num} text-[24px] leading-none text-[var(--m-accent)]`}>{left}</span>{" "}
        <span className="text-[var(--muted)]">of {size} remain, each numbered and entered in the registry</span>
      </p>
      <div aria-hidden className="mt-3 flex max-w-[22rem] flex-wrap gap-[5px]">
        {Array.from({ length: size }, (_, i) => (
          <span
            key={i}
            className={`block rounded-full ${size > 30 ? "size-[7px]" : "size-[9px]"} ${
              i < placed ? "bg-[var(--m-accent)]" : "border border-[rgb(42_36_32/0.3)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
