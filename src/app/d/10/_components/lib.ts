import { useSyncExternalStore } from "react";
import type Lenis from "lenis";
import type { Wood } from "@/lib/wood";

/* ------------------------------------------------------------------ */
/* Media queries                                                       */
/* ------------------------------------------------------------------ */

function media(query: string) {
  return {
    subscribe(cb: () => void) {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    get: () => window.matchMedia(query).matches,
  };
}

const fineMq = media("(hover: hover) and (pointer: fine)");
const reduceMq = media("(prefers-reduced-motion: reduce)");

/** True on a mouse / trackpad device. Phones get scroll-driven type only. */
export function useFinePointer() {
  return useSyncExternalStore(fineMq.subscribe, fineMq.get, () => false);
}

export function useReduced() {
  return useSyncExternalStore(reduceMq.subscribe, reduceMq.get, () => false);
}

export const isReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isFine = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

/* ------------------------------------------------------------------ */
/* Tiny stores                                                         */
/* ------------------------------------------------------------------ */

export type Store<T> = { get: () => T; set: (v: T) => void; subscribe: (cb: () => void) => () => void };

function store<T>(initial: T): Store<T> {
  let v = initial;
  const ls = new Set<() => void>();
  return {
    get: () => v,
    set(next) {
      v = next;
      ls.forEach((l) => l());
    },
    subscribe(cb) {
      ls.add(cb);
      return () => {
        ls.delete(cb);
      };
    },
  };
}

export function useStore<T>(s: Store<T>, server: T) {
  return useSyncExternalStore(s.subscribe, s.get, () => server);
}

/** The product takeover on the home page. `top`/`height` is the row it grew from. */
export type Takeover = { slug: string; top: number; height: number; vh: number } | null;
export const takeoverStore = store<Takeover>(null);
export const menuStore = store(false);
export const sheetStore = store(false);

/** "Added to bag" notice for the big bag number. */
export type Added = { id: number; name: string; wood: Wood } | null;
export const addedStore = store<Added>(null);
let addedId = 0;
let addedTimer: ReturnType<typeof setTimeout> | undefined;
export function announceAdded(name: string, wood: Wood) {
  addedStore.set({ id: ++addedId, name, wood });
  clearTimeout(addedTimer);
  addedTimer = setTimeout(() => addedStore.set(null), 2600);
}

let returnFocus: HTMLElement | null = null;
export function openTakeover(slug: string, from?: HTMLElement | null) {
  const vh = window.innerHeight;
  const r = from?.getBoundingClientRect();
  returnFocus = from ?? null;
  const top = r ? Math.max(0, Math.min(vh, r.top)) : vh / 2;
  const height = r ? Math.max(0, Math.min(vh - top, r.height)) : 0;
  takeoverStore.set({ slug, top, height, vh });
}
export function closeTakeover() {
  takeoverStore.set(null);
  const el = returnFocus;
  returnFocus = null;
  if (el) requestAnimationFrame(() => el.focus({ preventScroll: true }));
}

/* ------------------------------------------------------------------ */
/* Smooth scroll + scroll lock                                         */
/* ------------------------------------------------------------------ */

let lenis: Lenis | null = null;
let locks = 0;

export function setLenis(l: Lenis | null) {
  lenis = l;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.4 });
  else el.scrollIntoView({ behavior: isReduced() ? "auto" : "smooth", block: "start" });
  return true;
}

export function scrollToTop() {
  if (lenis) lenis.scrollTo(0, { duration: 1.6 });
  else window.scrollTo({ top: 0, behavior: isReduced() ? "auto" : "smooth" });
}

export function lockScroll() {
  locks += 1;
  if (locks !== 1) return;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  lenis?.stop();
  document.documentElement.style.overflow = "hidden";
  if (gap > 0) document.documentElement.style.paddingRight = `${gap}px`;
}

export function unlockScroll() {
  locks = Math.max(0, locks - 1);
  if (locks !== 0) return;
  document.documentElement.style.overflow = "";
  document.documentElement.style.paddingRight = "";
  lenis?.start();
}

/* ------------------------------------------------------------------ */
/* Type measurement                                                    */
/* ------------------------------------------------------------------ */

export const fv = (wdth: number, wght: number) => `"wdth" ${wdth.toFixed(1)}, "wght" ${Math.round(wght)}`;

let probe: HTMLSpanElement | null = null;

/** Width of `text` set in Anybody at the given axes and size, in px. Needs the design root in the page. */
export function measure(text: string, wdth: number, wght: number, size = 100, tracking = 0, italic = false) {
  if (!probe || !probe.isConnected) {
    probe = document.createElement("span");
    probe.setAttribute("aria-hidden", "true");
    Object.assign(probe.style, {
      position: "absolute",
      left: "-20000px",
      top: "0",
      visibility: "hidden",
      whiteSpace: "pre",
      pointerEvents: "none",
      lineHeight: "1",
      fontFamily: "var(--font-anybody)",
    });
    (document.querySelector("[data-k10]") ?? document.body).appendChild(probe);
  }
  probe.style.fontSize = `${size}px`;
  probe.style.letterSpacing = `${tracking}em`;
  probe.style.fontStyle = italic ? "italic" : "normal";
  probe.style.fontVariationSettings = fv(wdth, wght);
  probe.textContent = text;
  return probe.getBoundingClientRect().width;
}

/** Font size (px) that makes `text` exactly `width` wide at these axes. */
export function fitSize(text: string, width: number, wdth: number, wght: number, tracking = 0) {
  const w = measure(text, wdth, wght, 100, tracking);
  return w ? (width * 100) / w : 100;
}

/** The wdth (50–150) at which `text` fills `width` at `size`; 150 if it fits fully stretched. */
export function wdthFor(text: string, width: number, size: number, wght: number, tracking = 0) {
  const a = measure(text, 50, wght, size, tracking);
  const b = measure(text, 150, wght, size, tracking);
  if (b <= width) return 150;
  if (a >= width) return 50;
  return 50 + (100 * (width - a)) / (b - a);
}

/** Runs `cb` now and whenever web fonts finish loading. */
export function onFonts(cb: () => void) {
  cb();
  let alive = true;
  document.fonts?.ready.then(() => alive && cb());
  const h = () => alive && cb();
  document.fonts?.addEventListener?.("loadingdone", h);
  return () => {
    alive = false;
    document.fonts?.removeEventListener?.("loadingdone", h);
  };
}

/* ------------------------------------------------------------------ */
/* Misc                                                                */
/* ------------------------------------------------------------------ */

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const EASE = [0.22, 1, 0.36, 1] as const;

/** Seeded PRNG so layouts are identical on server and client. */
export function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** The family name split into a display part and a quieter remainder: "Japa Mala" + "108 beads". */
export function splitName(name: string) {
  const i = name.indexOf(",");
  return i < 0 ? { head: name, tail: "" } : { head: name.slice(0, i), tail: name.slice(i + 1).trim() };
}

export const unsplash = (id: string, w = 1600) => `https://images.unsplash.com/${id}?w=${w}&q=72&auto=format&fit=crop`;
