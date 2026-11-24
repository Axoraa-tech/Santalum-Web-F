import { CATEGORIES, FAMILIES, type Family, type Tone } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood-boot";

/** Copy and data for design 05, "Index": a Swiss editorial catalogue. */

export type IndexItem = { id: string; label: string };

export const HOME_SECTIONS: IndexItem[] = [
  { id: "cover", label: "Two woods" },
  { id: "specimens", label: "Specimens" },
  { id: "essay", label: "From the heartwood" },
  { id: "catalogue", label: "Catalogue" },
  { id: "making", label: "Making" },
  { id: "provenance", label: "Provenance" },
  { id: "vault", label: "The 2011 Vault" },
  { id: "gifting", label: "Gifting" },
  { id: "circle", label: "Santalum Circle" },
  { id: "colophon", label: "Colophon" },
];

export const sectionNo = (id: string) => HOME_SECTIONS.findIndex((s) => s.id === id) + 1;

export const EASE = [0.22, 1, 0.36, 1] as const;

export const categoryLabel = (key: Family["category"]) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

/** Families made in a wood, in catalogue order, each with its catalogue number in that wood. */
export function familiesIn(wood: Wood) {
  return FAMILIES.filter((f) => f.variants[wood]).map((f, i) => ({ f, no: i + 1 }));
}

export function priceRange(wood: Wood) {
  const prices = familiesIn(wood).map(({ f }) => f.variants[wood]!.price);
  return [Math.min(...prices), Math.max(...prices)] as const;
}

export function careFor(f: Family): string[] {
  if (f.slug === "heartwood-oil")
    return ["Keep the vial upright and sealed, away from heat and light.", "A few drops are enough. Patch-test before use on skin."];
  if (f.slug === "heartwood-powder")
    return ["Keep the jar closed, dry and out of sunlight. Use a dry spoon.", "Patch-test before use on skin."];
  if (f.slug === "cufflinks")
    return ["Keep away from water and perfume. Store in the box.", "Polish the silver with a silver cloth and keep the cloth off the wood."];
  switch (f.category) {
    case "objects":
      return ["Keep dry and out of direct sun. Wipe with a soft cloth.", "Rub in a drop of natural oil once a season."];
    case "beads":
      return ["Take off before bathing or swimming. If the beads get wet, let them dry flat.", "Handling is good for them: they darken and smooth with wear."];
    case "gifting":
      return ["Keep the box out of direct sun and away from damp.", "Wipe with a dry cloth. Re-oil the wood once a year."];
    case "jewellery":
      return ["Keep away from water, perfume and lotions.", "Store in its box and wipe with a soft dry cloth after wearing."];
    default:
      return ["Keep dry and out of direct sun."];
  }
}

/* ---------------- Essay ---------------- */

export type EssayNote = { n: number; photo: PhotoRef; tone?: Tone; caption: string; fig: number };
export type EssayBlock =
  | { kind: "p"; text: string; note?: EssayNote }
  | { kind: "quote"; text: string; cite: string };

export const ESSAY_STANDFIRST =
  "Both are called sandalwood. They come from different trees, grow in different forests and ask different things of the hand. A short account of what you are holding.";

export const ESSAY: EssayBlock[] = [
  {
    kind: "p",
    text: "In Indian homes one word, chandan, covers two woods. One is red, dense and almost without scent. The other is pale gold and fragrant. They are not close relatives. Red sandalwood is Pterocarpus santalinus, a tree of the pea family; white sandalwood is Santalum album, the tree most people mean when they say sandalwood.",
  },
  {
    kind: "p",
    text: "Red sandalwood grows in the Eastern Ghats, mainly in Andhra Pradesh.[1] Its heartwood is heavy and close-grained, and its colour runs from brick to a red so deep that, in an aged piece, it reads as black at the core. It has almost no scent. The tree has been heavily cut, and international trade in it is regulated under CITES Appendix II.",
    note: { n: 1, fig: 4, photo: PHOTOS.redGrain, caption: "The close grain of red heartwood." },
  },
  {
    kind: "p",
    text: "White sandalwood grows in the dry forests of southern India, and Mysuru, in Karnataka, has long been the centre of its craft.[2] Its fragrance lives in the heartwood, as an oil; the pale sapwood around it carries very little. A finished piece smells faintly when it is warm, and more when it is worked.",
    note: { n: 2, fig: 5, photo: PHOTOS.whiteLog, caption: "A cut log of white sandalwood: heartwood within, pale sapwood around it." },
  },
  { kind: "quote", text: "The wood decides what it will become. The hand follows.", cite: "From the workshop brief" },
  {
    kind: "p",
    text: "Every piece begins as a reading. Before the first cut, the artisan studies the grain:[3] where the heartwood is densest, where it runs straight and where it turns. A bead for a mala needs a different part of the log from a coaster. A pendant panel is chosen for a figure in the grain that will not appear twice. Offcuts become smaller work, and the smallest become powder.",
    note: { n: 3, fig: 6, photo: PHOTOS.carving, caption: "A carver's hands working a block with a chisel." },
  },
  {
    kind: "p",
    text: "Red sandalwood is mostly for keeping and holding: beads, boxes and small objects that darken and smooth with use.[4] White sandalwood is that, and also scent: powder for paste and tilak, and oil from the heartwood. Only white sandalwood carries the oil. There is no red sandalwood oil in this catalogue, because there is none to make.",
    note: { n: 4, fig: 7, photo: PHOTOS.malaHand, caption: "Beads darken and smooth in the hand over the years." },
  },
  { kind: "quote", text: "Know what you hold.", cite: "The first rule of the record" },
  {
    kind: "p",
    text: "So we record what we can show. Each piece is entered with its wood, where the wood came from, its batch, the initials of the person who finished it and the date it left the workshop. If there is evidence, we show it. If there isn't, we don't invent it.",
  },
  {
    kind: "p",
    text: "Made with respect for the material. Designed for the life around it. That is the whole of the brief we work to, and the rest of this catalogue is what it looks like in practice.",
  },
];

export const ESSAY_WORDS = ESSAY.reduce((n, b) => n + b.text.split(" ").length, ESSAY_STANDFIRST.split(" ").length);

/* ---------------- Making ---------------- */

export type Step = { name: string; text: string; photo: Record<Wood, { p: PhotoRef; tone?: Tone }>; caption: string };

export const STEPS: Step[] = [
  {
    name: "Select",
    text: "The artisan reads the log before cutting: where the heartwood is densest, where the grain runs straight, where it turns.",
    photo: { red: { p: PHOTOS.redChip }, white: { p: PHOTOS.whiteLog } },
    caption: "Raw heartwood, before the first cut.",
  },
  {
    name: "Shape",
    text: "Cut, turned or carved by hand into the piece the grain allows. Offcuts go to smaller work and to powder.",
    photo: { red: { p: PHOTOS.carving }, white: { p: PHOTOS.carving } },
    caption: "Carving by hand.",
  },
  {
    name: "Finish",
    text: "Sanded smooth and rubbed by hand with natural oil, or oil and beeswax, until the grain shows through.",
    photo: { red: { p: PHOTOS.turned, tone: "red" }, white: { p: PHOTOS.turned } },
    caption: "Turned pieces after oiling.",
  },
  {
    name: "Inspect",
    text: "Checked for cracks, fit and finish, then entered in the batch record with the artisan's initials and the date.",
    photo: { red: { p: PHOTOS.redGrain }, white: { p: PHOTOS.beadsPale } },
    caption: "Grain and finish, checked close.",
  },
  {
    name: "Present",
    text: "Packed in cotton, linen or a sandalwood box with its batch number, ready to keep or to give.",
    photo: { red: { p: PHOTOS.boxCarved }, white: { p: PHOTOS.giftLinen } },
    caption: "Ready to leave the workshop.",
  },
];

/* ---------------- Provenance ---------------- */

export type RecordKey = "piece" | "wood" | "origin" | "batch" | "artisan" | "finished";

export const RECORD_FIELDS: { key: RecordKey; label: string; note: string }[] = [
  { key: "piece", label: "Piece", note: "The piece as it is listed in the catalogue, so the record and the object can be matched." },
  { key: "wood", label: "Wood", note: "The botanical name, because both woods are sold as chandan. This removes any doubt about which one you hold." },
  { key: "origin", label: "Origin", note: "Where the wood came from, as far as the supplier's documents show it. We do not go further than the paperwork." },
  { key: "batch", label: "Batch", note: "R for red, W for white, then the year and the batch. Powder jars carry the same number on the label." },
  { key: "artisan", label: "Finished by", note: "The initials of the person who finished the piece, as entered by the workshop." },
  { key: "finished", label: "Date", note: "The day the piece passed inspection and left the workshop." },
];

export const RECORD: Record<Wood, Record<RecordKey, string>> = {
  red: {
    piece: "Japa Mala, 108 beads",
    wood: "Pterocarpus santalinus (red sandalwood)",
    origin: "Eastern Ghats, Andhra Pradesh",
    batch: "R-26-0412",
    artisan: "K. R.",
    finished: "18 November 2026",
  },
  white: {
    piece: "Japa Mala, 108 beads",
    wood: "Santalum album (white sandalwood)",
    origin: "Southern India",
    batch: "W-26-0187",
    artisan: "M. S.",
    finished: "12 November 2026",
  },
};

/* ---------------- Checkout ---------------- */

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
