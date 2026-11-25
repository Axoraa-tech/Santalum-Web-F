import type Lenis from "lenis";
import { useSyncExternalStore } from "react";
import { bag } from "@/lib/shop/bag";
import { setWoodQuietly, type Wood } from "@/lib/wood";

/* Client-only helpers for design 09: smooth scroll handle, the wood change, the bottom sheet, and the "added" note. */

/* ---------- changing wood: the page dims like dusk, the day changes, and it comes back up ---------- */
/**
 * A page that belongs to one wood (a piece) registers where the other wood lives, so the toggle
 * goes there instead of leaving a white piece inside the red site.
 */
type WoodRoute = (next: Wood) => string | null;
let woodRoute: WoodRoute | null = null;
export function setWoodRoute(fn: WoodRoute | null) {
  woodRoute = fn;
}
let pendingWood: Wood | null = null;
let swapTimer: ReturnType<typeof setTimeout> | undefined;
let failsafe: ReturnType<typeof setTimeout> | undefined;
const rootEl = () => document.querySelector<HTMLElement>(".d09-root");
const liveWood = (): Wood => (document.documentElement.dataset.wood === "white" ? "white" : "red");
const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function rise(el: HTMLElement | null) {
  if (!el) return;
  requestAnimationFrame(() => {
    el.dataset.swap = "in";
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      if (el.dataset.swap === "in") delete el.dataset.swap;
    }, 700);
  });
}

/**
 * Switch woods without a cross-dissolve: the content sinks out, the wood changes while nothing is
 * on screen (so two layouts never overlap), and the new day rises in. On a piece's page the toggle
 * navigates to the piece in the other wood (or that wood's shop), and the wood changes on arrival.
 */
export function swapWood(next: Wood, push?: (href: string) => void) {
  if (liveWood() === next && !pendingWood) return;
  const el = rootEl();
  const still = reduced() || !el;
  const href = woodRoute?.(next) ?? null;
  if (href && push) {
    pendingWood = next;
    // the page dims like dusk while the other wood's page is fetched; it is replaced, never overlapped
    if (!still) el!.dataset.swap = "go";
    push(href);
    clearTimeout(failsafe);
    failsafe = setTimeout(settleWood, 15000);
    return;
  }
  if (still) {
    setWoodQuietly(next);
    return;
  }
  el!.dataset.swap = "out";
  clearTimeout(swapTimer);
  swapTimer = setTimeout(() => {
    setWoodQuietly(next);
    rise(el);
  }, 280);
}

/** After a route change: apply a wood that was waiting for the new page, and bring the page back up. */
export function settleWood() {
  clearTimeout(failsafe);
  if (pendingWood) {
    setWoodQuietly(pendingWood);
    pendingWood = null;
  }
  const el = rootEl();
  if (el?.dataset.swap === "out" || el?.dataset.swap === "go") rise(el);
}

/* ---------- media queries ---------- */
const mediaSubs = new Map<string, (cb: () => void) => () => void>();
function mediaSub(q: string) {
  let s = mediaSubs.get(q);
  if (!s) {
    s = (cb) => {
      const m = window.matchMedia(q);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    };
    mediaSubs.set(q, s);
  }
  return s;
}
export function useMedia(q: string) {
  return useSyncExternalStore(
    mediaSub(q),
    () => window.matchMedia(q).matches,
    () => false,
  );
}
export const WIDE = "(min-width: 1024px)";

/* ---------- smooth scroll ---------- */
let lenis: Lenis | null = null;
export function setLenis(l: Lenis | null) {
  lenis = l;
}
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { duration: 1.9 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
export function scrollToY(y: number) {
  if (lenis) {
    lenis.scrollTo(y, { duration: 1.4 });
    return;
  }
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
}
let locks = 0;
export function lockScroll() {
  locks++;
  if (locks === 1) {
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
  }
}
export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks === 0) {
    lenis?.start();
    document.documentElement.style.overflow = "";
  }
}

/* ---------- one bottom sheet at a time: a piece's ritual card, or the corporate gifting note ---------- */
export type SheetState = { kind: "piece"; slug: string } | { kind: "corporate" } | null;
let sheet: SheetState = null;
let returnFocus: HTMLElement | null = null;
const sheetListeners = new Set<() => void>();
const emitSheet = () => sheetListeners.forEach((l) => l());

export function openPiece(slug: string) {
  if (!sheet) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  sheet = { kind: "piece", slug };
  emitSheet();
}
export function openCorporate() {
  if (!sheet) returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  sheet = { kind: "corporate" };
  emitSheet();
}
export function closeSheet() {
  if (!sheet) return;
  sheet = null;
  emitSheet();
  const r = returnFocus;
  returnFocus = null;
  if (r) requestAnimationFrame(() => r.focus({ preventScroll: true }));
}
export function useSheet() {
  return useSyncExternalStore(
    (cb) => {
      sheetListeners.add(cb);
      return () => {
        sheetListeners.delete(cb);
      };
    },
    () => sheet,
    () => null,
  );
}

/* ---------- adding to the offering tray, with a short note by the tray ---------- */
export type Added = { slug: string; option?: string; qty: number; n: number } | null;
let added: Added = null;
let addedN = 0;
let addedTimer: ReturnType<typeof setTimeout> | undefined;
const addedListeners = new Set<() => void>();
const emitAdded = () => addedListeners.forEach((l) => l());

export function addPiece(slug: string, opts: { option?: string; qty?: number } = {}) {
  const qty = opts.qty ?? 1;
  bag.add(slug, { option: opts.option, qty });
  added = { slug, option: opts.option, qty, n: ++addedN };
  emitAdded();
  clearTimeout(addedTimer);
  addedTimer = setTimeout(() => {
    added = null;
    emitAdded();
  }, 2800);
}
export function useAdded() {
  return useSyncExternalStore(
    (cb) => {
      addedListeners.add(cb);
      return () => {
        addedListeners.delete(cb);
      };
    },
    () => added,
    () => null,
  );
}
