import { PHOTOS, type PhotoRef } from "./photos";
import type { Wood } from "./wood-boot";

/**
 * Product catalogue. Prices are placeholders inside the client's ₹1K–₹25K ladder
 * (Discovery → Ritual → Gifting → Personal → Collector). Replace with real SKUs.
 */

export type CategoryKey = "objects" | "beads" | "powder" | "gifting" | "jewellery";

export const CATEGORIES: { key: CategoryKey; label: string; line: string }[] = [
  { key: "beads", label: "Beads & Malas", line: "Quiet objects for personal ritual." },
  { key: "objects", label: "Everyday Objects", line: "Keys, coasters and small things for the desk and home." },
  { key: "powder", label: "Powder & Oil", line: "Prepared from the heartwood, with clear notes on origin and use." },
  { key: "gifting", label: "Gifting", line: "Considered objects for personal and corporate occasions." },
  { key: "jewellery", label: "Jewellery", line: "Contemporary pieces shaped around the character of the wood." },
];

export type Tone = "red" | "pale";
export type Shot = { photo: PhotoRef; tone?: Tone };

export type Variant = {
  price: number;
  shots: Shot[];
  /** One line about how this wood reads in this piece. */
  note: string;
};

export type Family = {
  slug: string;
  name: string;
  category: CategoryKey;
  level: "Discovery" | "Ritual" | "Gifting" | "Personal" | "Collector";
  summary: string;
  story: string[];
  details: { label: string; value: string }[];
  edition?: string;
  variants: Partial<Record<Wood, Variant>>;
};

export const WOOD_NAMES: Record<Wood, { common: string; latin: string; sa: string; origin: string }> = {
  red: { common: "Red sandalwood", latin: "Pterocarpus santalinus", sa: "रक्तचन्दन", origin: "Eastern Ghats, Andhra Pradesh" },
  white: { common: "White sandalwood", latin: "Santalum album", sa: "श्वेतचन्दन", origin: "Southern India" },
};

export const FAMILIES: Family[] = [
  {
    slug: "key-fob",
    name: "Key Fob",
    category: "objects",
    level: "Discovery",
    summary: "A small block of heartwood on a brass ring. The first piece most people carry.",
    story: [
      "Cut from offcuts of larger work, shaped by hand and finished with natural oil.",
      "It darkens and smooths with handling. After a year it will look like yours.",
    ],
    details: [
      { label: "Size", value: "Approx. 55 × 28 × 8 mm" },
      { label: "Fittings", value: "Solid brass split ring" },
      { label: "Finish", value: "Hand-rubbed natural oil" },
      { label: "Packaging", value: "Raw cotton pouch" },
    ],
    variants: {
      red: { price: 1200, note: "Deep red, dense, cool in the hand.", shots: [{ photo: PHOTOS.keyTag }, { photo: PHOTOS.redChip }] },
      white: { price: 1500, note: "Pale gold, with a faint scent when warm.", shots: [{ photo: PHOTOS.keyTag, tone: "pale" }, { photo: PHOTOS.whiteLog }] },
    },
  },
  {
    slug: "coaster-pair",
    name: "Coaster Pair",
    category: "objects",
    level: "Discovery",
    summary: "Two turned coasters, end grain up, so the rings of the tree sit under your cup.",
    story: [
      "Turned on a lathe from a single length of heartwood, so both coasters share the same grain.",
      "Sealed lightly with oil and wax. Wipe dry; re-oil once a season.",
    ],
    details: [
      { label: "Size", value: "Approx. Ø 95 mm, 10 mm thick" },
      { label: "Set", value: "Two coasters" },
      { label: "Finish", value: "Natural oil and beeswax" },
      { label: "Packaging", value: "Linen wrap" },
    ],
    variants: {
      red: { price: 1800, note: "Red rings, nearly black at the centre.", shots: [{ photo: PHOTOS.coasterSet, tone: "red" }, { photo: PHOTOS.redGrain }] },
      white: { price: 2400, note: "Pale rings with a darker heart.", shots: [{ photo: PHOTOS.woodRounds }, { photo: PHOTOS.coasterSet }] },
    },
  },
  {
    slug: "incense-holder",
    name: "Incense Holder",
    category: "objects",
    level: "Ritual",
    summary: "A low carved rest for a single stick. Ash falls into the groove, not onto the table.",
    story: ["Hand-carved, then finished smooth along the groove where the ash collects."],
    details: [
      { label: "Size", value: "Approx. 240 × 30 mm" },
      { label: "Holds", value: "Standard incense sticks" },
      { label: "Packaging", value: "Hemp pouch" },
    ],
    variants: {
      red: { price: 2200, note: "Red heartwood against grey ash.", shots: [{ photo: PHOTOS.incenseDark }, { photo: PHOTOS.redChip }] },
      white: { price: 2600, note: "Pale wood, faintly fragrant itself.", shots: [{ photo: PHOTOS.incenseBox }, { photo: PHOTOS.woodSmoke }] },
    },
  },
  {
    slug: "japa-mala",
    name: "Japa Mala, 108 beads",
    category: "beads",
    level: "Ritual",
    summary: "One hundred and eight hand-turned beads and a guru bead, knotted on cotton cord.",
    story: [
      "Each bead is turned, sized and polished by hand, then knotted so beads do not rub.",
      "Made for counting. Also simply for holding.",
    ],
    details: [
      { label: "Beads", value: "108 + 1 guru bead, approx. 8 mm" },
      { label: "Cord", value: "Hand-knotted cotton, tassel" },
      { label: "Packaging", value: "Linen pouch in a sandalwood box" },
    ],
    variants: {
      red: { price: 4800, note: "Deep red beads that warm to the hand.", shots: [{ photo: PHOTOS.beadStrandsDark }, { photo: PHOTOS.malaHand }] },
      white: { price: 6800, note: "Pale beads with the scent of the heartwood.", shots: [{ photo: PHOTOS.whiteBeads }, { photo: PHOTOS.beadStrands }] },
    },
  },
  {
    slug: "bead-bracelet",
    name: "Bead Bracelet",
    category: "beads",
    level: "Ritual",
    summary: "Twenty-one beads on a strong elastic cord. Worn every day, never taken off.",
    story: ["The same beads as our malas, strung short. Sized at the order; tell us your wrist."],
    details: [
      { label: "Beads", value: "21, approx. 8 mm" },
      { label: "Fit", value: "Small 16 cm · Medium 17.5 cm · Large 19 cm" },
      { label: "Packaging", value: "Raw cotton pouch" },
    ],
    variants: {
      red: { price: 2500, note: "Red-brown, deepening with wear.", shots: [{ photo: PHOTOS.braceletDark }, { photo: PHOTOS.braceletClose }] },
      white: { price: 3400, note: "Pale, lightly fragrant on the skin.", shots: [{ photo: PHOTOS.braceletPale }, { photo: PHOTOS.beadsPale }] },
    },
  },
  {
    slug: "heartwood-powder",
    name: "Heartwood Powder, 50 g",
    category: "powder",
    level: "Ritual",
    summary: "Finely milled heartwood in an amber apothecary jar. Never plastic.",
    story: [
      "Milled from heartwood offcuts in small batches, sieved twice.",
      "Each jar carries its batch number. Traditionally used for tilak and paste; patch-test before use on skin.",
    ],
    details: [
      { label: "Weight", value: "50 g" },
      { label: "Jar", value: "Amber glass, cork and brass lid" },
      { label: "Batch", value: "Printed on the jar" },
    ],
    variants: {
      red: { price: 1600, note: "Brick red, earthy, no strong scent.", shots: [{ photo: PHOTOS.redPowder }, { photo: PHOTOS.redChip }] },
      white: { price: 3900, note: "Pale gold and fragrant.", shots: [{ photo: PHOTOS.whitePowder }, { photo: PHOTOS.whiteRitual }] },
    },
  },
  {
    slug: "heartwood-oil",
    name: "Heartwood Oil, 5 ml",
    category: "powder",
    level: "Gifting",
    summary: "Distilled from white sandalwood heartwood. A few drops are enough.",
    story: [
      "Red sandalwood does not carry this oil — only white sandalwood does, and only in the heartwood.",
      "Supplied in a sealed amber vial with its batch record.",
    ],
    details: [
      { label: "Volume", value: "5 ml" },
      { label: "Vessel", value: "Amber glass vial, sealed" },
      { label: "Documentation", value: "Batch record; lab report where available" },
    ],
    variants: {
      white: { price: 5800, note: "Soft, creamy, long-lasting.", shots: [{ photo: PHOTOS.oil }, { photo: PHOTOS.oilDuo }, { photo: PHOTOS.attar }] },
    },
  },
  {
    slug: "presentation-box",
    name: "Presentation Box",
    category: "gifting",
    level: "Gifting",
    summary: "A hinged box with a brass clasp and a drawer for the certificate. Made to be kept.",
    story: [
      "The box is the gift as much as what goes in it. Dovetailed, hand-finished, lined in raw cotton.",
      "Choose it empty, or ask us to fill it with a mala, powder or oil.",
    ],
    details: [
      { label: "Size", value: "Approx. 180 × 120 × 70 mm" },
      { label: "Hardware", value: "Brass hinge and clasp" },
      { label: "Inside", value: "Cotton lining, certificate drawer" },
    ],
    variants: {
      red: { price: 5500, note: "Red outside, raw cotton inside.", shots: [{ photo: PHOTOS.boxCarved }, { photo: PHOTOS.boxRed }] },
      white: { price: 7200, note: "Pale wood that scents what it holds.", shots: [{ photo: PHOTOS.giftLinen }, { photo: PHOTOS.boxes }] },
    },
  },
  {
    slug: "grain-pendant",
    name: "Grain Pendant",
    category: "jewellery",
    level: "Personal",
    summary: "A single carved panel on a fine cord. The grain decides the pattern.",
    story: ["Each panel is chosen for its grain before it is carved, so no two are alike."],
    details: [
      { label: "Size", value: "Approx. 38 × 24 mm" },
      { label: "Cord", value: "Waxed silk, adjustable" },
      { label: "Packaging", value: "Sandalwood box with linen pouch" },
    ],
    variants: {
      red: { price: 9800, note: "Carved red heartwood.", shots: [{ photo: PHOTOS.carvedTag }, { photo: PHOTOS.redGrain }] },
      white: { price: 12500, note: "Carved pale heartwood.", shots: [{ photo: PHOTOS.carvedTag, tone: "pale" }, { photo: PHOTOS.whiteLog }] },
    },
  },
  {
    slug: "cufflinks",
    name: "Cufflinks",
    category: "jewellery",
    level: "Personal",
    summary: "Heartwood set in sterling silver. A pair, in a small wooden box.",
    story: ["The wood faces are cut from the same piece, so the pair matches."],
    details: [
      { label: "Setting", value: "Sterling silver" },
      { label: "Face", value: "Approx. 16 mm" },
      { label: "Packaging", value: "Hinged sandalwood box" },
    ],
    variants: {
      red: { price: 8500, note: "Red against silver.", shots: [{ photo: PHOTOS.cufflinks, tone: "red" }, { photo: PHOTOS.redGrain }] },
      white: { price: 11000, note: "Pale gold against silver.", shots: [{ photo: PHOTOS.cufflinks }, { photo: PHOTOS.whiteLog }] },
    },
  },
  {
    slug: "vault-cuff",
    name: "The 2011 Vault Cuff",
    category: "jewellery",
    level: "Collector",
    edition: "Edition of 21",
    summary: "Turned from aged heartwood sourced in 2011. Twenty-one pieces, each numbered.",
    story: [
      "The wood was sourced in 2011. It has been waiting since then for the right hands and the right moment.",
      "Each cuff is entered in our provenance registry with its number, harvest origin, the artisan's name and the date it left our hands.",
    ],
    details: [
      { label: "Edition", value: "21 pieces, numbered" },
      { label: "Inner diameter", value: "Made to your measurement" },
      { label: "Comes with", value: "Registry certificate and a sealed vial of heartwood oil" },
    ],
    variants: {
      red: { price: 19500, note: "Aged red heartwood, nearly black at the core.", shots: [{ photo: PHOTOS.turned, tone: "red" }, { photo: PHOTOS.boxRed }] },
      white: { price: 24000, note: "Aged white heartwood, fragrant still.", shots: [{ photo: PHOTOS.turned }, { photo: PHOTOS.boxes }] },
    },
  },
];

export function getFamily(slug: string) {
  return FAMILIES.find((f) => f.slug === slug);
}

export function getVariant(slug: string, wood: Wood) {
  return getFamily(slug)?.variants[wood];
}

const inr = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
export function formatINR(n: number) {
  return inr.format(n);
}

export const TONE_FILTER: Record<Tone, string> = {
  red: "sepia(0.45) saturate(1.9) hue-rotate(-16deg) brightness(0.8) contrast(1.05)",
  pale: "sepia(0.35) saturate(0.45) brightness(1.55) contrast(0.85)",
};
