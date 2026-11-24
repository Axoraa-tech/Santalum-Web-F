"use client";

import { useState, useSyncExternalStore } from "react";
import { getFamily } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, type Wood } from "@/lib/wood";
import { ui } from "./store";

const noop = () => () => {};

/** true once hydrated on the client (lets client-only pieces render without a mismatch) */
export function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

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

/** Add to bag, or offer the other wood when this piece isn't made in the current one. */
export function AddToBag({
  slug,
  wood,
  className = "",
  tone = "dark",
}: {
  slug: string;
  wood: Wood;
  className?: string;
  tone?: "dark" | "light";
}) {
  const [added, setAdded] = useState(false);
  const f = getFamily(slug);
  if (!f) return null;
  const other: Wood = wood === "red" ? "white" : "red";
  const base = tone === "dark" ? "s3-btn s3-btn-dark" : "s3-btn s3-btn-line";
  if (!f.variants[wood]) {
    return (
      <button type="button" className={`${base} ${className}`} onClick={() => switchWood(other)}>
        Made in {other} sandalwood only. Switch wood
      </button>
    );
  }
  return (
    <button
      type="button"
      className={`${base} ${className}`}
      aria-live="polite"
      onClick={() => {
        bag.add(slug, wood);
        ui.added();
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1800);
      }}
    >
      <span className="s3-bead s3-btn-bead" aria-hidden />
      {added ? "Added to your bag" : "Add to bag"}
    </button>
  );
}
