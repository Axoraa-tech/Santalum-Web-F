import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood-boot";

/* ---------- routes ---------- */
export const HOME = "/d/02";
export const SHOP = "/d/02/shop";
export const CHECKOUT = "/d/02/checkout";
export const ACCOUNT = "/d/02/account";
export const TRACK = "/d/02/track";
export const productHref = (slug: string) => `/d/02/p/${slug}`;
export const shopHref = (category?: string) => (category && category !== "all" ? `${SHOP}?c=${category}` : SHOP);
export const trackHref = (id: string) => `${TRACK}?o=${encodeURIComponent(id)}`;

export const WOOD_LABEL: Record<Wood, string> = { red: "Red sandalwood", white: "White sandalwood" };
export const WOOD_SHORT: Record<Wood, string> = { red: "Red", white: "White" };
export const otherWood = (w: Wood): Wood => (w === "red" ? "white" : "red");

/** The part of a name before the comma is the display name; the rest is a size or count. */
export function splitName(name: string): [string, string | undefined] {
  const i = name.indexOf(", ");
  return i < 0 ? [name, undefined] : [name.slice(0, i), name.slice(i + 2)];
}

export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/* ---------- the two woods, side by side (the comparison in "Two woods") ---------- */
export const COMPARE: { label: string; red: string; white: string }[] = [
  { label: "Colour", red: "Brick red, darkening to near black at the core", white: "Pale gold heartwood inside white sapwood" },
  { label: "Scent", red: "Almost none", white: "Warm and soft; the oil sits in the heartwood" },
  { label: "Where it grows", red: "Eastern Ghats, mainly Andhra Pradesh", white: "Dry forests of the south; Mysuru is its craft centre" },
  { label: "What we make", red: "Beads, turned objects, powder and jewellery", white: "Oil, attar, incense, chandan, beads and carving" },
  { label: "The rules", red: "CITES Appendix II; trade in India is controlled", white: "Grown and sold under state forest rules" },
];

/* ---------- making: the step titles and texts come from CONTENT; these are Orbit's own lines and photos ---------- */
export const MAKING_LINES: Record<Wood, { line: string; photo: PhotoRef; tone?: "red" | "pale" }[]> = {
  red: [
    { line: "Every piece begins as a reading.", photo: PHOTOS.redChip },
    { line: "The wood decides what it will become. The hand follows.", photo: PHOTOS.turned, tone: "red" },
    { line: "No lacquer and no stain: oil, then beeswax.", photo: PHOTOS.woodRounds },
    { line: "A second pair of hands, then a number.", photo: PHOTOS.redGrain },
    { line: "It leaves with its batch record.", photo: PHOTOS.boxRed },
  ],
  white: [
    { line: "Heartwood only. The pale sapwood has no scent.", photo: PHOTOS.whiteLog },
    { line: "The oil settles while the billet rests.", photo: PHOTOS.chipsPale },
    { line: "Chips go to the still, the best blocks to the carver.", photo: PHOTOS.oilDrop },
    { line: "A report for every batch of oil.", photo: PHOTOS.oilVials },
    { line: "Amber glass, with the lot on the label.", photo: PHOTOS.oil },
  ],
};

/** The quiet line on a product page that says what travels with the piece. */
export const PROVENANCE_LINE: Record<Wood, string> = {
  red: "Leaves with its batch record: species, lot, origin, who finished it and when.",
  white: "Carries its lot on the label. Oils travel with the batch test report.",
};

export const DELIVERY_LINE = "Free delivery across India, 3–5 working days. Express ₹350.";
export const PREVIEW_ACCOUNTS = "Preview: accounts and orders are saved in this browser until our store opens.";
export const PREVIEW_PAYMENTS = "Payments are not connected yet, so no money is taken.";

/* ---------- landing anchors, named in each wood's voice ---------- */
export const ANCHORS: { id: string; red: string; white: string }[] = [
  { id: "ring", red: "The ring", white: "The ring" },
  { id: "pieces", red: "Five ranges", white: "Six ranges" },
  { id: "woods", red: "Not the perfume wood", white: "The temple wood" },
  { id: "making", red: "On the lathe", white: "At the still" },
  { id: "provenance", red: "Batch records", white: "Lot records" },
  { id: "vault", red: "The 2011 Vault", white: "The 2011 Reserve" },
  { id: "gifting", red: "Gifts with weight", white: "Gifts that fill a room" },
];

export const EASE = [0.22, 1, 0.36, 1] as const;
