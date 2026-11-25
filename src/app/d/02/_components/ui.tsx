"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import type { Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { bagUI } from "./store";
import { productHref } from "./copy";
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

export function SearchIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className={className} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.5 15.5L20 20" />
    </svg>
  );
}

export function HeartIcon({ className = "size-5", filled = false }: { className?: string; filled?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M12 20s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.6-7.5 10-7.5 10Z" />
    </svg>
  );
}

/** A small round wood swatch in the given wood. */
export function Swatch({ wood, className = "size-4" }: { wood: "red" | "white"; className?: string }) {
  return <span aria-hidden className={`inline-block shrink-0 rounded-full ${wood === "red" ? s.woodRed : s.woodWhite} ${className}`} />;
}

/** The swatch of whichever wood is showing, decided by CSS so it is right before hydration. */
export function CurrentSwatch({ className = "size-4" }: { className?: string }) {
  return (
    <>
      <span aria-hidden className={`${s.onlyRed} inline-block shrink-0 rounded-full ${s.woodRed} ${className}`} />
      <span aria-hidden className={`${s.onlyWhite} inline-block shrink-0 rounded-full ${s.woodWhite} ${className}`} />
    </>
  );
}

/** A thin rotating ring while client-only state (bag, session) arrives. */
export function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="grid min-h-[60svh] place-items-center" role="status">
      <span className="relative grid size-24 place-items-center">
        <svg viewBox="0 0 96 96" className={`absolute inset-0 ${s.loader}`} aria-hidden>
          <circle cx="48" cy="48" r="44" fill="none" stroke="var(--o-line)" strokeWidth="2" />
          <circle cx="48" cy="48" r="44" fill="none" stroke="var(--m-accent)" strokeWidth="2" strokeLinecap="round" strokeDasharray="60 300" />
        </svg>
        <span className="sr-only">{label}</span>
      </span>
    </div>
  );
}

/** The house's main button: an ink pill with an accent disc carrying the arrow. */
export function PillLink({ href, children, className = "", onClick }: { href: string; children: ReactNode; className?: string; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group inline-flex h-14 items-center justify-between gap-4 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-[background-color,transform] duration-300 hover:bg-black active:scale-[0.98] ${className}`}
    >
      {children}
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:rotate-[-45deg]">
        <ArrowIcon />
      </span>
    </Link>
  );
}

/** Add a piece (with its chosen option) to the bag. */
export function AddButton({
  product,
  option,
  qty = 1,
  note,
  label,
  className = "",
  dark = true,
}: {
  product: Product;
  option?: string;
  qty?: number;
  note?: string;
  label?: string;
  className?: string;
  dark?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const base = `group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full px-7 text-[15px] font-semibold transition-[transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] ${className}`;
  return (
    <button
      type="button"
      onClick={() => {
        bag.add(product.slug, { option, qty, note });
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

/**
 * The small round action on a card: "+" adds a piece that has no options;
 * a piece with sizes or volumes links to its page with "Choose".
 */
export function QuickAdd({ product, className = "" }: { product: Product; className?: string }) {
  const [added, setAdded] = useState(false);
  if (product.options) {
    return (
      <Link
        href={productHref(product.slug)}
        className={`${s.syne} inline-flex h-11 items-center rounded-full border border-[var(--o-ink)] bg-[var(--o-card)] px-4 text-[13px] font-bold text-[var(--o-ink)] transition-colors hover:bg-[var(--o-ink)] hover:text-white active:scale-95 ${className}`}
      >
        Choose<span className="sr-only"> a {product.options.name.toLowerCase()} for {product.name}</span>
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-label={added ? `${product.name} added to your bag` : `Add ${product.name} to your bag`}
      onClick={() => {
        bag.add(product.slug);
        bagUI.bump();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
      className={`grid size-11 place-items-center rounded-full bg-[var(--o-ink)] text-white shadow-[0_10px_24px_-12px_rgb(25_23_20/0.7)] transition-[transform,background-color] duration-300 hover:rotate-90 hover:bg-black active:scale-90 ${className}`}
    >
      {added ? <CheckIcon className="size-4" /> : <span className="text-[20px] leading-none">+</span>}
    </button>
  );
}

/** Save a piece for later. Works signed in or out; the list merges on sign-in. */
export function WishButton({ slug, name, className = "size-11", light = true }: { slug: string; name: string; className?: string; light?: boolean }) {
  const list = useWishlist();
  const hydrated = useHydrated();
  const on = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={() => toggleWishlist(slug)}
      className={`grid shrink-0 place-items-center rounded-full border transition-[transform,background-color,color,border-color] duration-300 active:scale-90 ${
        on
          ? "border-[var(--m-accent)] bg-[var(--m-accent)] text-white"
          : light
            ? "border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-ink)] hover:border-[var(--o-ink)]"
            : "border-[var(--o-line)] text-[var(--o-ink)] hover:border-[var(--o-ink)]"
      } ${className}`}
    >
      <HeartIcon className="size-[18px]" filled={on} />
    </button>
  );
}

/** Round minus / count / plus. */
export function QtyStepper({ value, onChange, max = 9, label }: { value: number; onChange: (n: number) => void; max?: number; label: string }) {
  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-[var(--o-line)] bg-[var(--o-card)] p-1" role="group" aria-label={`Quantity of ${label}`}>
      <button
        type="button"
        aria-label="One fewer"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className="grid size-10 place-items-center rounded-full text-[18px] transition-colors hover:bg-[var(--o-floor)] active:scale-90 disabled:opacity-35"
      >
        −
      </button>
      <span className="w-8 text-center text-[16px] font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="One more"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className="grid size-10 place-items-center rounded-full text-[18px] transition-colors hover:bg-[var(--o-floor)] active:scale-90 disabled:opacity-35"
      >
        +
      </button>
    </div>
  );
}

/** A labelled field with its hint and error tied to the input through aria-describedby. */
export function Field({
  label,
  error,
  hint,
  children,
  className = "",
}: {
  label: string;
  error?: string | null;
  hint?: string;
  className?: string;
  children: (a: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : "";
  const errId = error ? `${id}-err` : "";
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] font-semibold text-[var(--o-ink)]">
        {label}
      </label>
      {children({ id, describedBy, invalid: !!error })}
      {hint && !error && (
        <p id={hintId} className="mt-1.5 pl-5 text-[13px] text-[var(--o-muted)]">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="mt-1.5 flex items-center gap-2 pl-5 text-[13px] font-medium text-[#a3241b]">
          <span aria-hidden className="size-1.5 rounded-full bg-[#a3241b]" />
          {error}
        </p>
      )}
    </div>
  );
}

/** A round radio mark for option cards. */
export function RadioDot({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors ${on ? "border-[var(--o-ink)]" : "border-[var(--o-line)]"}`}>
      <span className={`size-2.5 rounded-full bg-[var(--m-accent)] transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} />
    </span>
  );
}

/** A round toggle used for checkboxes (save address, newsletter, editions only). */
export function Toggle({ checked, onChange, children, id }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; id?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[15px]">
      <input id={id} type="checkbox" className="peer sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span
        aria-hidden
        className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--m-accent)] ${checked ? "bg-[var(--o-ink)]" : "bg-[var(--o-floor)] shadow-[inset_0_0_0_1px_var(--o-line)]"}`}
      >
        <span className={`absolute top-1 size-5 rounded-full bg-white shadow transition-[left] duration-300 ${checked ? "left-6" : "left-1"}`} />
      </span>
      <span>{children}</span>
    </label>
  );
}
