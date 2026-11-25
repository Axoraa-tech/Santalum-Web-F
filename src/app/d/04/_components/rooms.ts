import { CATEGORIES, productsFor, type CategoryId, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";

/** Design 04 "Corridor": the rooms and catalogue helpers. Server-safe. */

/** Wide, not-portrait, motion allowed: the museum is walked sideways. Everything else stacks as a guide. */
export const H_QUERY =
  "(min-width: 900px) and (min-height: 560px) and (min-aspect-ratio: 5/4) and (prefers-reduced-motion: no-preference)";

/** A room has one number and a name in each wood: the red and the white museum hang different shows. */
export type Room = { id: string; n: string; red: string; white: string };

export const ROOMS: Room[] = [
  { id: "entrance", n: "1", red: "Raktachandan", white: "Srigandha" },
  { id: "wall-text", n: "2", red: "A dense red wood", white: "A fragrant wood" },
  { id: "two-woods", n: "3", red: "Red beside white", white: "White beside red" },
  { id: "collection", n: "4", red: "The red gallery", white: "The fragrant gallery" },
  { id: "making", n: "5", red: "At the lathe", white: "At the still" },
  { id: "provenance", n: "6", red: "The record room", white: "The lot room" },
  { id: "vault", n: "7", red: "The 2011 Vault", white: "The 2011 Reserve" },
  { id: "gifting", n: "8", red: "Gifts with weight", white: "Gifts for ritual" },
  { id: "exit", n: "Exit", red: "Exit to the red shop", white: "Exit to the white shop" },
];

export const isNumbered = (r: Room) => /^\d+$/.test(r.n);

/* ---------- catalogue helpers ---------- */
export const other = (w: Wood): Wood => (w === "red" ? "white" : "red");

/** Museum-style accession number for a piece, e.g. SM.2026.104 (1 = red room, 2 = white room). */
export function accession(p: Product) {
  const i = productsFor(p.wood).findIndex((x) => x.slug === p.slug);
  return `SM.2026.${p.wood === "red" ? 1 : 2}${String(i + 1).padStart(2, "0")}`;
}

export function countIn(wood: Wood, category: CategoryId) {
  return productsFor(wood).filter((p) => p.category === category).length;
}

export function categoryIds(wood: Wood) {
  return CATEGORIES[wood].map((c) => c.id);
}

/** Which wood a category belongs to (category ids never repeat across woods). */
export function woodOfCategory(id: string): Wood | null {
  if (CATEGORIES.red.some((c) => c.id === id)) return "red";
  if (CATEGORIES.white.some((c) => c.id === id)) return "white";
  return null;
}

export const shopHref = (category?: CategoryId) => (category ? `/d/04/shop?c=${category}` : "/d/04/shop");
