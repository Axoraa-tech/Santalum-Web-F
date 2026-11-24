import type { CategoryKey, Family, Shot } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood-boot";

export const HOME = "/d/02";
export const productHref = (slug: string) => `/d/02/p/${slug}`;

export const WOOD_LABEL: Record<Wood, string> = { red: "Red sandalwood", white: "White sandalwood" };
export const WOOD_SHORT: Record<Wood, string> = { red: "Red", white: "White" };

/** The part of a name before the comma is the display name; the rest is a size or count. */
export function splitName(name: string): [string, string | undefined] {
  const i = name.indexOf(", ");
  return i < 0 ? [name, undefined] : [name.slice(0, i), name.slice(i + 2)];
}

export function firstShot(f: Family, wood: Wood): Shot {
  const v = f.variants[wood] ?? f.variants.white ?? f.variants.red;
  return v!.shots[0];
}

export const LEVEL_LINE: Record<Family["level"], string> = {
  Discovery: "A first piece",
  Ritual: "For daily ritual",
  Gifting: "Made for giving",
  Personal: "A personal piece",
  Collector: "For collectors",
};

export const COMPARE: { label: string; red: string; white: string }[] = [
  {
    label: "Colour",
    red: "Deep red and close-grained, nearly black at the core",
    white: "Pale gold, warming to light brown at the heart",
  },
  { label: "Scent", red: "Almost none", white: "Soft and creamy; the oil sits in the heartwood" },
  {
    label: "Where it grows",
    red: "Eastern Ghats, mainly Andhra Pradesh",
    white: "Dry forests of southern India; Mysuru is its craft centre",
  },
  { label: "What we make", red: "Beads, objects, powder and jewellery", white: "All of those, and the heartwood oil" },
  {
    label: "Trade rules",
    red: "Listed in CITES Appendix II; international trade is regulated",
    white: "Felling and sale are regulated under Indian forest law",
  },
];

export type Step = { name: string; line: string; body: string; photo: Record<Wood, PhotoRef> };

export const STEPS: Step[] = [
  {
    name: "Select",
    line: "Every piece begins as a reading.",
    body: "The artisan studies the grain before the first cut: the colour, the density, the run of the fibres. Offcuts are set aside for beads and powder.",
    photo: { red: PHOTOS.redChip, white: PHOTOS.whiteLog },
  },
  {
    name: "Shape",
    line: "The wood decides what it will become. The hand follows.",
    body: "Cut with a saw, turned on a slow lathe or carved with hand tools. Beads are turned and sized one at a time.",
    photo: { red: PHOTOS.turned, white: PHOTOS.turned },
  },
  {
    name: "Finish",
    line: "Sanded smooth, then oiled by hand.",
    body: "Worked through finer and finer grits, then rubbed with natural oil. Turned pieces such as coasters take a coat of beeswax.",
    photo: { red: PHOTOS.woodRounds, white: PHOTOS.woodRounds },
  },
  {
    name: "Inspect",
    line: "Checked before it is numbered.",
    body: "Each piece is checked for cracks, size and finish against its batch. Anything that falls short goes back to the bench.",
    photo: { red: PHOTOS.redGrain, white: PHOTOS.whiteBeads },
  },
  {
    name: "Present",
    line: "Wrapped to be kept.",
    body: "Packed in raw cotton or linen, boxed where the piece calls for it, and sent with its batch record.",
    photo: { red: PHOTOS.boxCarved, white: PHOTOS.giftLinen },
  },
];

export type RecordRow = { label: string; red: string; white: string };

/** An example batch record. Clearly labelled as an example wherever it is shown. */
export const RECORD: RecordRow[] = [
  { label: "Piece", red: "Japa Mala, 108 beads", white: "Heartwood Powder, 50 g" },
  { label: "Wood", red: "Pterocarpus santalinus", white: "Santalum album" },
  { label: "Origin", red: "Eastern Ghats, Andhra Pradesh", white: "Southern India, worked in Karnataka" },
  { label: "Batch", red: "R-26-0412", white: "W-26-0187" },
  { label: "Artisan", red: "K. R.", white: "S. M." },
  { label: "Finished", red: "14 November 2026", white: "21 November 2026" },
];

export function careFor(f: Family): string[] {
  if (f.slug === "heartwood-oil") {
    return ["Store upright, away from heat and direct light.", "Close the vial after use.", "Patch-test before use on skin."];
  }
  const byCat: Record<CategoryKey, string[]> = {
    objects: ["Wipe with a soft, dry cloth.", "Keep away from standing water and direct heat.", "Re-oil lightly once a season."],
    beads: ["Take off before bathing or swimming.", "If it gets wet, let it dry naturally.", "Keep it in its pouch, away from perfume."],
    powder: ["Keep the jar closed, cool and dry.", "Use a dry spoon.", "Patch-test before use on skin."],
    gifting: ["Wipe with a soft, dry cloth.", "Keep the clasp dry.", "Re-oil the outside once a season."],
    jewellery: ["Take off before washing or swimming.", "Wipe the wood with a dry cloth.", "Store in its box between wears."],
  };
  return byCat[f.category];
}

export const NAV_LINKS: { id: string; label: string }[] = [
  { id: "ring", label: "The ring" },
  { id: "pieces", label: "All pieces" },
  { id: "woods", label: "Two woods" },
  { id: "making", label: "Making" },
  { id: "provenance", label: "Provenance" },
  { id: "vault", label: "The 2011 Vault" },
  { id: "gifting", label: "Gifting" },
  { id: "circle", label: "Santalum Circle" },
];

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const EASE = [0.22, 1, 0.36, 1] as const;
