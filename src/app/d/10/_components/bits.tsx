"use client";

import Link from "next/link";
import { useEffect, useId, useRef, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { Photo } from "@/components/Photo";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import type { Product } from "@/lib/shop/products";
import k from "../k";
import { announceAdded, fitLetters, onFonts, splitName } from "./lib";

/**
 * A title that stretches open letter by letter and is sized to fill its column exactly at full width.
 * `cap` limits the size to a share of the viewport height.
 */
export function Stretch({
  text,
  cap = 0.34,
  id,
  as = "h1",
  className = "",
  tone = "",
  tnum = false,
}: {
  text: string;
  cap?: number;
  id?: string;
  as?: "h1" | "h2" | "p";
  className?: string;
  tone?: string;
  /** Set in tabular figures (order numbers): measured that way too. */
  tnum?: boolean;
}) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    const el = ref.current;
    if (!box || !el) return;
    const fit = () => {
      const max = Math.max(56, window.innerHeight * cap);
      const avail = box.clientWidth * 0.98;
      el.style.fontSize = `${Math.min(max, fitLetters(text, avail, 150, 820, tnum)).toFixed(2)}px`;
      // The probe can disagree with the rendered letters (tabular figures, letter boxes): trust the real width.
      const real = el.getBoundingClientRect().width;
      if (real > avail) el.style.fontSize = `${((parseFloat(el.style.fontSize) * avail) / real).toFixed(2)}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [text, cap, tnum]);
  const Tag = as as "h1";
  return (
    <div ref={boxRef} className={className}>
      <Tag id={id} ref={ref} aria-label={text} className={`${k.disp} w-max pt-[0.06em] text-[9vw] leading-[0.86] ${tnum ? "tabular-nums" : ""} ${tone}`}>
        {text.split("").map((c, i) => (
          <span key={i} aria-hidden className={k.titleL} style={{ animationDelay: `${60 + i * 34}ms` }}>
            {c === " " ? " " : c}
          </span>
        ))}
      </Tag>
    </div>
  );
}

type FieldProps = { label: string; name: string; error?: string | null; note?: ReactNode; small?: boolean; wrap?: string };

/** A large-type field: mono label, the value set in Anybody, the error tied to it. */
export function Field({ label, name, error, note, small, wrap = "", ...rest }: FieldProps & InputHTMLAttributes<HTMLInputElement>) {
  const uid = useId();
  const id = `k10f${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  const desc = [error ? `${id}-e` : "", note ? `${id}-n` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`min-w-0 ${wrap}`}>
      <label htmlFor={id} className={`${k.mono} block text-[var(--k10-grey)]`}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={desc}
        className={`${k.field} ${small ? "!text-[length:clamp(22px,2.2vw,32px)]" : ""}`}
        {...rest}
      />
      {note && (
        <p id={`${id}-n`} className={`${k.mono} mt-2 text-[var(--k10-grey)]`}>
          {note}
        </p>
      )}
      {error && (
        <p id={`${id}-e`} className={`${k.err} mt-2`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({ label, name, error, small, wrap = "", children, ...rest }: FieldProps & SelectHTMLAttributes<HTMLSelectElement>) {
  const uid = useId();
  const id = `k10s${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
  return (
    <div className={`min-w-0 ${wrap}`}>
      <label htmlFor={id} className={`${k.mono} block text-[var(--k10-grey)]`}>
        {label}
      </label>
      <select
        id={id}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-e` : undefined}
        className={`${k.field} ${small ? "!text-[length:clamp(22px,2.2vw,32px)]" : ""}`}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p id={`${id}-e`} className={`${k.err} mt-2`}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Large checkbox with a display-type label. */
export function Check({ label, note, ...rest }: { label: string; note?: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex cursor-pointer items-start gap-4">
      <input type="checkbox" className={`${k.check} mt-0.5`} {...rest} />
      <span>
        <span className={`${k.disp} block whitespace-normal text-[length:clamp(22px,2.2vw,30px)] leading-none [font-variation-settings:'wdth'_80,'wght'_680]`}>
          {label}
        </span>
        {note && <span className={`${k.mono} mt-1 block text-[var(--k10-grey)]`}>{note}</span>}
      </span>
    </label>
  );
}

/** Tabs as words: the chosen one is set wide, the rest condensed. Arrow keys move between them. */
export function TabBar<T extends string>({
  items,
  value,
  onChange,
  label,
  idBase,
  size = "text-[length:clamp(34px,5vw,84px)]",
  className = "",
}: {
  items: { id: T; label: string; note?: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
  idBase: string;
  size?: string;
  className?: string;
}) {
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!d) return;
    e.preventDefault();
    const next = items[(i + d + items.length) % items.length];
    onChange(next.id);
    document.getElementById(`${idBase}-tab-${next.id}`)?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className={`flex flex-wrap items-baseline gap-x-[0.3em] gap-y-1 ${size} ${className}`}>
      {items.map((t, i) => (
        <button
          key={t.id}
          id={`${idBase}-tab-${t.id}`}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          aria-controls={`${idBase}-panel`}
          tabIndex={value === t.id ? 0 : -1}
          onClick={() => onChange(t.id)}
          onKeyDown={(e) => onKey(e, i)}
          className={`${k.tab} rounded-sm text-left`}
        >
          {t.label}
          {t.note && <span className={`${k.mono} ml-1.5 align-top text-[var(--k10-grey)]`}>{t.note}</span>}
        </button>
      ))}
    </div>
  );
}

/** Wishlist toggle: a ring that fills. Works signed out too. */
export function Wish({ p, className = "" }: { p: Product; className?: string }) {
  const list = useWishlist();
  const on = list.includes(p.slug);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${p.name} from your wishlist` : `Save ${p.name} to your wishlist`}
      onClick={() => toggleWishlist(p.slug)}
      className={`${k.wish} ${className}`}
    >
      {on ? "Saved" : "Save"}
    </button>
  );
}

/** Quick add for pieces without options; "Choose" opens the product when there are sizes or weights. */
export function AddOrChoose({ p, className = "" }: { p: Product; className?: string }) {
  if (p.options) {
    return (
      <Link href={`/d/10/p/${p.slug}`} data-ghost className={`${k.mini} min-w-[7.5rem] ${className}`} aria-label={`Choose ${p.options.name.toLowerCase()} for ${p.name}`}>
        Choose
      </Link>
    );
  }
  return (
    <button
      type="button"
      onClick={() => {
        bag.add(p.slug);
        announceAdded(splitName(p.name).head, p.wood);
      }}
      aria-label={`Add ${p.name} to the bag`}
      className={`${k.mini} min-w-[7.5rem] ${className}`}
    >
      Add to bag
    </button>
  );
}

/** Pill photograph; the second shot wipes in on hover (desktop). */
export function Thumb({ p, sizes = "160px", className = "" }: { p: Product; sizes?: string; className?: string }) {
  const [a, b] = p.shots;
  return (
    <span className={`${k.thumb} ${className}`}>
      <Photo p={a.photo} tone={a.tone} sizes={sizes} />
      {b && (
        <span className={k.thumbAlt}>
          <Photo p={b.photo} tone={b.tone} sizes={sizes} />
        </span>
      )}
    </span>
  );
}

/** "7 of 21 left" for numbered pieces. */
export function editionLine(p: Product) {
  return p.edition ? `${p.edition.left} of ${p.edition.size} left` : "";
}

/** One tick per numbered piece. Filled: placed. Open ring: still free. */
export function EditionTicks({ size, left }: { size: number; left: number }) {
  return (
    <div aria-hidden className="flex flex-wrap gap-1.5">
      {Array.from({ length: size }, (_, i) => (
        <span key={i} className={k.tick} data-free={i >= size - left ? "" : undefined} />
      ))}
    </div>
  );
}

export const STAR = "polygon(50% 0%, 61.8% 35%, 98% 35.4%, 69% 57.4%, 79.4% 91.6%, 50% 71%, 20.6% 91.6%, 31% 57.4%, 2% 35.4%, 38.2% 35%)";

/** Five stars cut from the accent, filled to the rating (fractions included). */
export function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span role="img" aria-label={`${value.toFixed(1)} out of 5 stars`} className={`inline-flex shrink-0 gap-[0.14em] align-[-0.12em] ${className}`} style={{ fontSize: size }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const f = Math.round(Math.max(0, Math.min(1, value - i)) * 100);
        return (
          <span
            key={i}
            aria-hidden
            className="block size-[1em]"
            style={{ clipPath: STAR, background: `linear-gradient(90deg, var(--k10-accent) ${f}%, color-mix(in srgb, var(--k10-grey) 38%, transparent) ${f}%)` }}
          />
        );
      })}
    </span>
  );
}

/** Stars, the average and the count, in mono: for cards and rows. */
export function RatingInline({ avg, count, className = "" }: { avg: number; count: number; className?: string }) {
  if (!count) return null;
  return (
    <span className={`${k.mono} inline-flex items-center gap-1.5 whitespace-nowrap ${className}`}>
      <Stars value={avg} size={12} />
      <span className="tabular-nums">{avg.toFixed(1)}</span>
      <span className="text-[var(--k10-grey)] tabular-nums">({count})</span>
    </span>
  );
}
