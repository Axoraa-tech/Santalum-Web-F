"use client";

import type Lenis from "lenis";
import { useSyncExternalStore } from "react";

/* ---------- bag panel: open state, where it grows from, and a bump counter for the badge ---------- */
type BagUI = { open: boolean; x: number; y: number; r: number; bump: number };

const CLOSED: BagUI = { open: false, x: 0, y: 0, r: 0, bump: 0 };
let ui: BagUI = CLOSED;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export const bagUI = {
  open(from?: DOMRect | null) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const x = from ? from.left + from.width / 2 : w - 40;
    const y = from ? from.top + from.height / 2 : 40;
    const r = Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 8;
    ui = { ...ui, open: true, x, y, r };
    emit();
  },
  close() {
    if (!ui.open) return;
    ui = { ...ui, open: false };
    emit();
  },
  bump() {
    ui = { ...ui, bump: ui.bump + 1 };
    emit();
  },
};

export function useBagUI() {
  return useSyncExternalStore(
    subscribe,
    () => ui,
    () => CLOSED,
  );
}

/* ---------- smooth scroll instance + scroll lock for overlays ---------- */
let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(l: Lenis | null) {
  lenis = l;
}

export function lockScroll() {
  locks += 1;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    document.documentElement.style.overflow = "";
    lenis?.start();
  }
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { duration: 1.4 });
  else el.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  return true;
}

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: 1.2 });
  else window.scrollTo({ top: y, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

/* ---------- media query hook ---------- */
export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => server,
  );
}

/* ---------- seeded PRNG for stable, server-safe variety ---------- */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
