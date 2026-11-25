import type Lenis from "lenis";
import { useSyncExternalStore } from "react";
import { getProduct, productsFor, type Product } from "@/lib/shop/products";
import { switchWood, type Wood } from "@/lib/wood";

/* ---------- routes ---------- */
export const HOME = "/d/07";
export const SHOP = `${HOME}/shop`;
export const CHECKOUT = `${HOME}/checkout`;
export const ACCOUNT = `${HOME}/account`;
export const TRACK = `${HOME}/track`;
export const productHref = (slug: string) => `${HOME}/p/${slug}`;
export const shopHref = (category?: string) => (category ? `${SHOP}?c=${category}` : SHOP);

/* ---------- the bag sheet: open / closed ---------- */
const sheetListeners = new Set<() => void>();
let sheetOpen = false;
const emitSheet = () => sheetListeners.forEach((l) => l());

export const sheet = {
  open() {
    sheetOpen = true;
    emitSheet();
  },
  close() {
    sheetOpen = false;
    emitSheet();
  },
  toggle() {
    sheetOpen = !sheetOpen;
    emitSheet();
  },
};

export function useSheetOpen() {
  return useSyncExternalStore(
    (cb) => {
      sheetListeners.add(cb);
      return () => {
        sheetListeners.delete(cb);
      };
    },
    () => sheetOpen,
    () => false,
  );
}

/* ---------- smooth scrolling ---------- */
let lenis: Lenis | null = null;
export function setLenis(l: Lenis | null) {
  lenis = l;
}
export function getLenis() {
  return lenis;
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: reduced() ? 0 : 1.3, immediate: reduced() });
  else window.scrollTo({ top: y, behavior: reduced() ? "auto" : "smooth" });
}

/** Cards are sticky, so we scroll to the plain marker that sits before each one. */
export function scrollToCard(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
  return true;
}

/* A wood waiting for the next page to land (see chooseWood). */
let pendingWood: Wood | null = null;
export function takePendingWood() {
  const w = pendingWood;
  pendingWood = null;
  return w;
}

/**
 * Flip the wood. On a product page the page belongs to one wood, so we go to the piece's counterpart in the
 * other wood (or that wood's shop when there is none) first, and the wood changes when that page lands:
 * the old piece is never shown in the new wood's colours. Returns true when it navigated.
 */
export function chooseWood(next: Wood, pathname: string, push: (href: string) => void) {
  const m = pathname.match(/^\/d\/07\/p\/([^/?#]+)/);
  const p = m ? getProduct(decodeURIComponent(m[1])) : undefined;
  if (p && p.wood !== next) {
    pendingWood = next;
    push(p.counterpart ? productHref(p.counterpart) : SHOP);
    return true;
  }
  switchWood(next);
  return false;
}

/* ---------- small shared data ---------- */
export const EASE = [0.22, 1, 0.36, 1] as const;
export const WOODS: Wood[] = ["red", "white"];
export const otherWood = (w: Wood): Wood => (w === "red" ? "white" : "red");

/** Small pieces to begin with: no options to choose, lowest price first. */
export const starters = (wood: Wood, n = 3): Product[] =>
  productsFor(wood)
    .filter((p) => !p.options && !p.edition)
    .sort((a, b) => a.price - b.price)
    .slice(0, n);

export const pad2 = (n: number) => String(n).padStart(2, "0");
export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? name;
