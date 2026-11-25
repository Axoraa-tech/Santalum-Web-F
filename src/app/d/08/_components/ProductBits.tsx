"use client";

import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { formatINR, type Badge, type Product } from "@/lib/shop/products";
import { seededRating } from "@/lib/shop/reviews-data";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./styles";

/** Save to the wishlist: a map bookmark that fills when saved. Works signed out too. */
export function WishButton({ slug, name, className = "", withLabel = false }: { slug: string; name: string; className?: string; withLabel?: boolean }) {
  const list = useWishlist();
  const hydrated = useHydrated();
  const on = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={withLabel ? undefined : on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(slug);
      }}
      className={`${s.btn} group/wish ${withLabel ? `${s.btnLine} h-12 gap-2 px-4 text-[15px]` : "size-10 bg-(--a-card)/90 hover:bg-(--a-card)"} ${className}`}
    >
      <svg viewBox="0 0 20 20" className="size-[18px] transition-transform duration-300 group-hover/wish:-translate-y-0.5" aria-hidden>
        <path
          d="M5 2.8h10a.8.8 0 0 1 .8.8v13.2l-5.8-3.6-5.8 3.6V3.6a.8.8 0 0 1 .8-.8z"
          fill={on ? "var(--a-accent)" : "none"}
          stroke={on ? "var(--a-accent)" : "currentColor"}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {withLabel && <span>{on ? "Saved to your wishlist" : "Save to wishlist"}</span>}
    </button>
  );
}

/** The option picker (size, weight, volume), as pinned tabs with their prices. */
export function OptionPicker({ product, value, onChange, name }: { product: Product; value?: string; onChange: (id: string) => void; name: string }) {
  if (!product.options) return null;
  return (
    <fieldset>
      <legend className="text-[14px] text-(--a-muted)">{product.options.name}</legend>
      <div className="mt-2 flex flex-wrap gap-2">
        {product.options.values.map((v) => {
          const on = (value ?? product.options!.values[0].id) === v.id;
          return (
            <label
              key={v.id}
              className={`relative flex min-h-12 cursor-pointer flex-col justify-center rounded-[10px] border px-3.5 py-1.5 transition-[border-color,background-color,transform] duration-300 active:scale-[0.98] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--a-accent) ${
                on ? "border-(--a-ink) bg-(--a-ink) text-(--a-paper)" : "border-(--a-line-2) bg-(--a-card) hover:border-(--a-ink)"
              }`}
            >
              <input type="radio" name={name} value={v.id} checked={on} onChange={() => onChange(v.id)} className="sr-only" />
              <span className="text-[15px] font-medium leading-tight">{v.label}</span>
              <span className={`text-[13px] tabular-nums leading-tight ${on ? "opacity-80" : "text-(--a-muted)"}`}>{formatINR(v.price)}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function QtyStepper({ value, onChange, label, size = "md" }: { value: number; onChange: (n: number) => void; label: string; size?: "sm" | "md" }) {
  const b = size === "sm" ? "size-8 text-[16px]" : "size-11 text-[18px]";
  return (
    <div className="flex items-center rounded-full border border-(--a-line-2) bg-(--a-card)" role="group" aria-label={`Quantity of ${label}`}>
      <button type="button" aria-label={`One fewer ${label}`} onClick={() => onChange(value - 1)} disabled={value <= 1 && size === "md"} className={`grid ${b} place-items-center rounded-full hover:bg-(--a-ink)/[0.06] active:bg-(--a-ink)/10 disabled:opacity-35`}>
        −
      </button>
      <span className={`${size === "sm" ? "w-6 text-[14px]" : "w-8 text-[16px]"} text-center tabular-nums`} aria-live="polite">
        {value}
      </span>
      <button type="button" aria-label={`One more ${label}`} onClick={() => onChange(value + 1)} disabled={value >= 9} className={`grid ${b} place-items-center rounded-full hover:bg-(--a-ink)/[0.06] active:bg-(--a-ink)/10 disabled:opacity-35`}>
        +
      </button>
    </div>
  );
}

/** A small stamped tag: badges, editions. */
export function Stamp({ children, tone = "ink" }: { children: React.ReactNode; tone?: "ink" | "accent" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-[12.5px] font-semibold leading-tight ${
        tone === "accent" ? "border border-(--a-accent) bg-(--a-card) text-(--a-accent-deep)" : "bg-(--a-card) text-(--a-ink)"
      }`}
    >
      {children}
    </span>
  );
}

export function badgeTone(b?: Badge) {
  return b === "Edition" || b === "Limited" ? ("accent" as const) : ("ink" as const);
}

const STAR = "M10 1.6l2.5 5.3 5.8.7-4.3 4 1.1 5.8L10 14.6l-5.1 2.8 1.1-5.8-4.3-4 5.8-.7z";

/** Five survey stars, filled to the average. Decorative; pair it with text. */
export function Stars({ value, className = "size-4" }: { value: number; className?: string }) {
  const row = (filled: boolean) =>
    Array.from({ length: 5 }, (_, i) => (
      <svg key={i} viewBox="0 0 20 20" className={`${className} shrink-0`} aria-hidden>
        <path d={STAR} fill={filled ? "var(--a-accent)" : "none"} stroke="var(--a-accent)" strokeWidth="1.3" strokeLinejoin="round" />
      </svg>
    ));
  return (
    <span className="relative inline-flex" aria-hidden>
      <span className="flex gap-px">{row(false)}</span>
      <span className="absolute inset-y-0 left-0 flex gap-px overflow-hidden" style={{ width: `${(Math.max(0, Math.min(5, value)) / 5) * 100}%` }}>
        {row(true)}
      </span>
    </span>
  );
}

/** "4.7 (12)" with stars, from the seeded reviews (server-safe). */
export function RatingLine({ slug, className = "" }: { slug: string; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[14px] text-(--a-ink-2) ${className}`}>
      <Stars value={r.avg} className="size-[13px]" />
      <span className="tabular-nums">{r.avg.toFixed(1)}</span>
      <span className="text-(--a-muted)">({r.count})</span>
      <span className="sr-only">
        Rated {r.avg.toFixed(1)} out of 5 from {r.count} reviews
      </span>
    </span>
  );
}
