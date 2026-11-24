import type Lenis from "lenis";
import { useSyncExternalStore } from "react";
import { bag } from "@/lib/cart";
import type { Wood } from "@/lib/wood-boot";

/* Client-only helpers for design 09: smooth scroll handle, the bottom sheet, and the "added" note. */

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
export type Added = { slug: string; wood: Wood; n: number } | null;
let added: Added = null;
let addedN = 0;
let addedTimer: ReturnType<typeof setTimeout> | undefined;
const addedListeners = new Set<() => void>();
const emitAdded = () => addedListeners.forEach((l) => l());

export function addPiece(slug: string, wood: Wood) {
  bag.add(slug, wood);
  added = { slug, wood, n: ++addedN };
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
