import { useSyncExternalStore } from "react";
import { getOption, getProduct, priceOf, type Product, type OptionValue, type Tone } from "./products";
import { createStore } from "./store";

/**
 * The bag. Lines hold a product slug, an option id (size, weight, volume) and a quantity.
 * A bag can hold red and white pieces together; the toggle changes what the site shows, not the bag.
 */
export type BagLine = { key: string; slug: string; option?: string; qty: number; note?: string };

export type BagItem = BagLine & { product: Product; optionValue?: OptionValue; unitPrice: number; total: number };

const MAX_QTY = 9;
/** Delivery is free across India; express is optional. */
export const DELIVERY = {
  standard: { id: "standard" as const, label: "Standard, 3–5 working days", price: 0 },
  express: { id: "express" as const, label: "Express, 1–2 working days", price: 350 },
};
export type DeliveryId = keyof typeof DELIVERY;

const lineKey = (slug: string, option?: string, note?: string) => [slug, option ?? "", note ?? ""].join("|");

const store = createStore<BagLine[]>("santalum-bag-v2", [], (raw) =>
  Array.isArray(raw) ? (raw as BagLine[]).filter((l) => getProduct(l.slug) && l.qty > 0) : [],
);

export function useBag(): BagLine[] {
  return store.use();
}

export const bag = {
  add(slug: string, opts: { option?: string; qty?: number; note?: string } = {}) {
    const p = getProduct(slug);
    if (!p) return;
    const option = p.options ? (getOption(p, opts.option)?.id ?? undefined) : undefined;
    const key = lineKey(slug, option, opts.note);
    const qty = opts.qty ?? 1;
    store.set((lines) => {
      const hit = lines.find((l) => l.key === key);
      if (hit) return lines.map((l) => (l.key === key ? { ...l, qty: Math.min(l.qty + qty, MAX_QTY) } : l));
      return [...lines, { key, slug, qty: Math.min(qty, MAX_QTY), ...(option ? { option } : {}), ...(opts.note ? { note: opts.note } : {}) }];
    });
  },
  setQty(key: string, qty: number) {
    store.set((lines) => (qty <= 0 ? lines.filter((l) => l.key !== key) : lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, MAX_QTY) } : l))));
  },
  remove(key: string) {
    store.set((lines) => lines.filter((l) => l.key !== key));
  },
  clear() {
    store.set([]);
  },
};

export function bagItems(lines: BagLine[]): BagItem[] {
  const out: BagItem[] = [];
  for (const l of lines) {
    const product = getProduct(l.slug);
    if (!product) continue;
    const unitPrice = priceOf(product, l.option);
    out.push({ ...l, product, optionValue: getOption(product, l.option), unitPrice, total: unitPrice * l.qty });
  }
  return out;
}

export function bagSummary(lines: BagLine[], delivery: DeliveryId = "standard") {
  const items = bagItems(lines);
  const count = items.reduce((n, i) => n + i.qty, 0);
  const subtotal = items.reduce((n, i) => n + i.total, 0);
  const shipping = count ? DELIVERY[delivery].price : 0;
  return { items, count, subtotal, shipping, total: subtotal + shipping };
}

/* ---------- open / closed state for whatever bag UI a design uses ---------- */
const openListeners = new Set<() => void>();
let open = false;
const emitOpen = () => openListeners.forEach((l) => l());

export const bagPanel = {
  open() {
    open = true;
    emitOpen();
  },
  close() {
    open = false;
    emitOpen();
  },
  toggle() {
    open = !open;
    emitOpen();
  },
};

export function useBagOpen() {
  return useSyncExternalStore(
    (cb) => {
      openListeners.add(cb);
      return () => {
        openListeners.delete(cb);
      };
    },
    () => open,
    () => false,
  );
}

/* ---------- "fly to bag": a thumbnail travels from the button to the bag ---------- */
export type Flight = { id: number; x: number; y: number; size: number; photo: string; tone?: Tone };
const flightListeners = new Set<(f: Flight) => void>();
let flightId = 0;

export function launchFlight(from: DOMRect, photo: string, tone?: Tone) {
  const size = 72;
  const f: Flight = { id: ++flightId, x: from.left + from.width / 2 - size / 2, y: from.top + from.height / 2 - size / 2, size, photo, tone };
  flightListeners.forEach((l) => l(f));
}

export function onFlight(cb: (f: Flight) => void) {
  flightListeners.add(cb);
  return () => {
    flightListeners.delete(cb);
  };
}
