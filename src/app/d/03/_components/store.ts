import { useSyncExternalStore } from "react";
import { journeyKeys, layoutStrand, type Keys, type StrandLayout } from "./strand-math";

/* ---------- open / closed UI for design 03 (bag, menu, product overlay) ---------- */

type UI = { bag: boolean; menu: boolean; product: string | null; added: number };

let state: UI = { bag: false, menu: false, product: null, added: 0 };
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
const set = (next: Partial<UI>) => {
  state = { ...state, ...next };
  emit();
};

export const ui = {
  openBag: () => set({ bag: true, menu: false }),
  closeBag: () => set({ bag: false }),
  toggleBag: () => set({ bag: !state.bag, menu: false }),
  openMenu: () => set({ menu: true, bag: false }),
  closeMenu: () => set({ menu: false }),
  openProduct: (slug: string) => set({ product: slug, menu: false, bag: false }),
  closeProduct: () => set({ product: null }),
  /** a piece was added: the bag beads give a small tug */
  added: () => set({ added: state.added + 1 }),
};

const SERVER: UI = { bag: false, menu: false, product: null, added: 0 };

export function useUI() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => state,
    () => SERVER,
  );
}

/* ---------- the journey along the strand: shared between the DOM loop and the 3D scene ---------- */

export type Journey = {
  /** raw scroll progress through the pinned strand, 0–1 */
  p: number;
  /** smoothed focus position along the cord (scene units) */
  s: number;
  /** smoothed closing-shot blend, 0–1 */
  end: number;
  /** screen position of the medallion ring of the product in focus, for the thread to the card */
  anchor: { x: number; y: number; on: boolean };
  layout: StrandLayout;
  keys: Keys;
  /** product slugs on the strand, in order */
  slugs: string[];
  /** DOM labels (name and price) for every medallion, placed by the 3D engine each frame */
  labelEls: (HTMLElement | null)[];
};

const initial = layoutStrand(8);
export const J: Journey = {
  p: 0,
  s: initial.beads[0] + 2.2,
  end: 0,
  anchor: { x: 0, y: 0, on: false },
  layout: initial,
  keys: journeyKeys(initial),
  slugs: [],
  labelEls: [],
};

/* ---------- smooth scrolling (Lenis) handle, so buttons can glide to a place on the page ---------- */

type Scroller = { scrollTo: (y: number, opts?: { immediate?: boolean; duration?: number }) => void; stop: () => void; start: () => void };
let scroller: Scroller | null = null;
export const setScroller = (s: Scroller | null) => {
  scroller = s;
};

export function glideTo(y: number) {
  if (scroller) scroller.scrollTo(y, { duration: 1.6 });
  else window.scrollTo({ top: y, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}

export function pauseScroll(paused: boolean) {
  if (!scroller) return;
  if (paused) scroller.stop();
  else scroller.start();
}
