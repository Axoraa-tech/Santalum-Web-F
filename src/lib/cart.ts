import { useSyncExternalStore } from "react";
import { getVariant } from "./catalog";
import type { Wood } from "./wood-boot";

/** Bag stored in localStorage. Client-only. `custom` holds a grain-studio configuration. */
export type Line = { slug: string; wood: Wood; qty: number; custom?: string };

const KEY = "santalum-bag";
const EMPTY: Line[] = [];
const listeners = new Set<() => void>();
let lines: Line[] = EMPTY;
let loaded = false;

const same = (l: Line, slug: string, wood: Wood, custom?: string) =>
  l.slug === slug && l.wood === wood && (l.custom ?? "") === (custom ?? "");

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Line[];
      lines = parsed.filter((l) => getVariant(l.slug, l.wood) && l.qty > 0);
    }
  } catch {}
}

function commit(next: Line[]) {
  lines = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      lines = EMPTY;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return lines;
}

export function useBag() {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export const bag = {
  add(slug: string, wood: Wood, qty = 1, custom?: string) {
    load();
    const i = lines.findIndex((l) => same(l, slug, wood, custom));
    if (i >= 0) commit(lines.map((l, j) => (j === i ? { ...l, qty: Math.min(l.qty + qty, 9) } : l)));
    else commit([...lines, { slug, wood, qty, ...(custom ? { custom } : {}) }]);
  },
  setQty(line: Line, qty: number) {
    load();
    if (qty <= 0) commit(lines.filter((l) => !same(l, line.slug, line.wood, line.custom)));
    else commit(lines.map((l) => (same(l, line.slug, line.wood, line.custom) ? { ...l, qty: Math.min(qty, 9) } : l)));
  },
  clear() {
    commit(EMPTY);
  },
};

export function bagTotals(ls: Line[]) {
  let count = 0;
  let subtotal = 0;
  for (const l of ls) {
    const v = getVariant(l.slug, l.wood);
    if (!v) continue;
    count += l.qty;
    subtotal += v.price * l.qty;
  }
  return { count, subtotal };
}

/* ---------- the bag island: open / closed ---------- */
const islandListeners = new Set<() => void>();
let islandOpen = false;
const emitIsland = () => islandListeners.forEach((l) => l());

export const island = {
  open() {
    islandOpen = true;
    emitIsland();
  },
  close() {
    islandOpen = false;
    emitIsland();
  },
};

export function useIslandOpen() {
  return useSyncExternalStore(
    (cb) => {
      islandListeners.add(cb);
      return () => {
        islandListeners.delete(cb);
      };
    },
    () => islandOpen,
    () => false,
  );
}

/* ---------- "fly to bag": a thumbnail travels from the button to the island ---------- */
export type Flight = { id: number; x: number; y: number; size: number; photo: string; tone?: "red" | "pale" };
const flightListeners = new Set<(f: Flight) => void>();
let flightId = 0;

export function launchFlight(from: DOMRect, photo: string, tone?: "red" | "pale") {
  const size = 72;
  const f: Flight = {
    id: ++flightId,
    x: from.left + from.width / 2 - size / 2,
    y: from.top + from.height / 2 - size / 2,
    size,
    photo,
    tone,
  };
  flightListeners.forEach((l) => l(f));
}

export function onFlight(cb: (f: Flight) => void) {
  flightListeners.add(cb);
  return () => {
    flightListeners.delete(cb);
  };
}
