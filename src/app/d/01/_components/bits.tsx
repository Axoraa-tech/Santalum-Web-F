"use client";

import Link from "next/link";
import { useState } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import type { Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { sheet } from "./store";

/** Quick add for pieces with no options; "Choose" (to the product page) for pieces that need one. */
export function AddOrChoose({ p, className = "" }: { p: Product; className?: string }) {
  const [done, setDone] = useState(false);
  const cls = `${s.mono} inline-grid h-8 min-w-[4.6rem] place-items-center whitespace-nowrap rounded-full border px-3 text-[12px] transition-colors active:scale-95 ${className}`;
  if (p.options) {
    return (
      <Link href={`/d/01/p/${p.slug}`} className={`${cls} border-(--hair-2) hover:border-(--ink)`} aria-label={`Choose ${p.options.name.toLowerCase()} for ${p.name}`}>
        Choose
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        bag.add(p.slug);
        setDone(true);
        window.setTimeout(() => setDone(false), 1600);
        sheet.open();
      }}
      aria-label={`Add ${p.name} to bag`}
      className={`${cls} ${done ? "border-(--ink) bg-(--ink) text-(--paper)" : "border-(--hair-2) hover:border-(--ink) hover:bg-(--ink) hover:text-(--paper)"}`}
    >
      {done ? "Added" : "Add"}
    </button>
  );
}

/** Wishlist toggle: a bookmark tag, filled when saved. Works signed out too. */
export function WishToggle({ p, className = "", label = false }: { p: Product; className?: string; label?: boolean }) {
  const hydrated = useHydrated();
  const list = useWishlist();
  const on = hydrated && list.includes(p.slug);
  return (
    <button
      type="button"
      onClick={() => toggleWishlist(p.slug)}
      aria-pressed={on}
      aria-label={on ? `Remove ${p.name} from wishlist` : `Save ${p.name} to wishlist`}
      className={label ? `${s.btnLine} ${on ? "border-(--accent)! text-(--accent)" : ""} ${className}` : `${s.icon} ${className}`}
    >
      <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden className="shrink-0">
        <path
          d="M3 1.5 H13 V16 L8 12.4 L3 16 Z"
          fill={on ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
          className="transition-[fill] duration-300"
        />
      </svg>
      {label && <span>{on ? "Saved to wishlist" : "Save to wishlist"}</span>}
    </button>
  );
}

/** Edition counter as a row of ticks: taken ones drawn solid, the ones left drawn open. */
export function EditionTicks({ size, left, className = "" }: { size: number; left: number; className?: string }) {
  const taken = size - left;
  return (
    <div className={className}>
      <div aria-hidden className="flex flex-wrap gap-[3px]">
        {Array.from({ length: size }, (_, i) => (
          <span key={i} className={`h-3 w-[5px] rounded-[1px] ${i < taken ? "bg-(--ink) opacity-35" : "bg-(--accent)"}`} />
        ))}
      </div>
      <p className={`${s.mono} mt-2 text-[11.5px] text-(--ink-2)`}>
        <span className="tabular-nums text-(--accent)">{left}</span> of {size} left
      </p>
    </div>
  );
}

/** Badges read as small stamps on the drawing. */
export function BadgeStamp({ badge, className = "" }: { badge: string; className?: string }) {
  return <span className={`${s.mono} ${s.stamp} inline-block rotate-[-3deg] rounded-[3px] px-1.5 py-0.5 text-[10.5px] font-medium ${className}`}>{badge}</span>;
}
