"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore, type ReactNode } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { ui } from "./store";

export { useHydrated };

export const HOME = "/d/03";
export const SHOP = "/d/03/shop";
export const productHref = (slug: string) => `/d/03/p/${slug}`;

export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Add to bag. A piece with sizes or volumes needs a choice first, so without an option
 * it becomes "Choose", a link to its page.
 */
export function AddToBag({
  slug,
  option,
  qty = 1,
  className = "",
  tone = "dark",
  size = "md",
  label = "Add to bag",
  compact = false,
}: {
  slug: string;
  option?: string;
  qty?: number;
  className?: string;
  tone?: "dark" | "light";
  size?: "md" | "sm";
  label?: string;
  /** short labels for cards: "Add" and "Choose" */
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);
  const p = getProduct(slug);
  if (!p) return null;
  const base = `s3-btn ${tone === "dark" ? "s3-btn-dark" : "s3-btn-line"} ${size === "sm" ? "s3-btn-sm" : ""}`;
  if (p.options && !option) {
    return (
      <Link href={productHref(slug)} className={`${base} ${className}`} onClick={ui.closeProduct}>
        <span className="s3-bead s3-btn-bead" aria-hidden />
        {compact ? "Choose" : `Choose ${p.options.name.toLowerCase()}`}
      </Link>
    );
  }
  return (
    <button
      type="button"
      className={`${base} ${className}`}
      onClick={() => {
        bag.add(slug, { option, qty });
        ui.added();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
    >
      <span className="s3-bead s3-btn-bead" aria-hidden />
      <span aria-live="polite">{added ? (compact ? "Added" : "On the thread") : compact ? "Add" : label}</span>
    </button>
  );
}

/** Keep a piece for later: a bead that fills. Works signed out too. */
export function WishBead({ slug, name, className = "" }: { slug: string; name: string; className?: string }) {
  const hydrated = useHydrated();
  const list = useWishlist();
  const on = hydrated && list.includes(slug);
  return (
    <button
      type="button"
      className={`s3-wish ${className}`}
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Save ${name} to your wishlist`}
      onClick={() => toggleWishlist(slug)}
    >
      <span className="s3-wish-bead" aria-hidden />
      {on ? "Saved" : "Save"}
    </button>
  );
}

/** A labelled field with its error tied by aria-describedby. */
export function Field({
  label,
  error,
  className = "",
  hint,
  children,
}: {
  label: string;
  error?: string | null;
  className?: string;
  hint?: ReactNode;
  children: (a: { id: string; "aria-invalid": boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const described = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`s3-field ${className}`}>
      <label htmlFor={id} className="mb-1.5 block text-[14px] text-(--muted)">
        {label}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": described })}
      {hint && (
        <p id={hintId} className="mt-1.5 text-[13px] text-(--muted)">
          {hint}
        </p>
      )}
      {error && (
        <p id={errId} className="s3-err">
          {error}
        </p>
      )}
    </div>
  );
}

/** A short horizontal thread with a knot, used as a quiet divider. */
export function Knotline({ className = "" }: { className?: string }) {
  return (
    <span className={`flex items-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-16 bg-(--thread)" />
      <span className="s3-knot" />
      <span className="h-px flex-1 bg-(--thread)" />
    </span>
  );
}

/** The "preview" line: quiet, one sentence. */
export function PreviewNote({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return (
    <p className={`flex items-start gap-2.5 text-[14px] leading-[1.5] text-(--muted) ${className}`}>
      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-(--thread)" aria-hidden />
      <span>{children ?? "Preview: accounts and orders are saved in this browser until our store opens."}</span>
    </p>
  );
}
