import { FAMILIES, formatINR, type CategoryKey, type Family, type Shot, type Variant } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood-boot";

/* ---------- helpers ---------- */

export function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export const other = (w: Wood): Wood => (w === "red" ? "white" : "red");

/** The variant to show for a family in a wood; falls back to the wood it is made in. */
export function variantFor(f: Family, wood: Wood): { variant: Variant; wood: Wood; made: boolean } {
  const v = f.variants[wood];
  if (v) return { variant: v, wood, made: true };
  const w = other(wood);
  return { variant: f.variants[w]!, wood: w, made: false };
}

export function familiesIn(wood: Wood) {
  return FAMILIES.filter((f) => f.variants[wood]);
}

export function priceRange(wood: Wood) {
  const ps = familiesIn(wood).map((f) => f.variants[wood]!.price);
  return { min: Math.min(...ps), max: Math.max(...ps) };
}

export const WOOD_SHORT: Record<Wood, string> = { red: "Red sandalwood", white: "White sandalwood" };

/* ---------- care notes (not in the catalogue) ---------- */

export const CARE: Record<CategoryKey, string[]> = {
  objects: [
    "Wipe with a dry, soft cloth. Keep out of standing water.",
    "Once a season, rub in a drop of neutral oil and let it rest overnight.",
  ],
  beads: [
    "Keep away from water, soap and perfume.",
    "Store in its pouch when you are not wearing it. The beads darken and smooth with use.",
  ],
  powder: [
    "Keep the lid closed, away from light, heat and damp.",
    "Use a dry spoon. Patch-test before using on skin.",
  ],
  gifting: [
    "Dust with a soft, dry cloth. Keep out of direct sun.",
    "Oil the brass hinge with a drop of oil if it stiffens.",
  ],
  jewellery: [
    "Take it off before washing, swimming or exercise.",
    "Wipe with a soft dry cloth and store it in its box.",
  ],
};

/* ---------- example batch records (clearly labelled as examples) ---------- */

export type BatchRecord = {
  piece: string;
  slug: string;
  wood: Wood;
  origin: string;
  batch: string;
  artisan: string;
  finished: string;
};

export const RECORDS: BatchRecord[] = [
  { piece: "Japa Mala, 108 beads", slug: "japa-mala", wood: "red", origin: "Eastern Ghats, Andhra Pradesh", batch: "R-26-0412", artisan: "K.R.", finished: "18 Nov 2026" },
  { piece: "Heartwood Oil, 5 ml", slug: "heartwood-oil", wood: "white", origin: "Southern India", batch: "W-26-0187", artisan: "S.M.", finished: "12 Nov 2026" },
  { piece: "Coaster Pair", slug: "coaster-pair", wood: "red", origin: "Eastern Ghats, Andhra Pradesh", batch: "R-26-0409", artisan: "A.V.", finished: "9 Nov 2026" },
  { piece: "Bead Bracelet", slug: "bead-bracelet", wood: "white", origin: "Southern India", batch: "W-26-0191", artisan: "P.N.", finished: "21 Nov 2026" },
  { piece: "Grain Pendant", slug: "grain-pendant", wood: "red", origin: "Eastern Ghats, Andhra Pradesh", batch: "R-26-0415", artisan: "K.R.", finished: "22 Nov 2026" },
];

/* ---------- the five making steps ---------- */

type WoodShot = Record<Wood, Shot>;

export const STEPS: { name: string; line: string; long: string; shot: WoodShot }[] = [
  {
    name: "Select",
    line: "The grain is read before the first cut.",
    long: "The artisan reads the billet: its colour, its density, how the grain runs and where it twists. Only then is a piece assigned to it.",
    shot: { red: { photo: PHOTOS.redChip }, white: { photo: PHOTOS.whiteLog } },
  },
  {
    name: "Shape",
    line: "Cut, turned or carved by hand, along the grain.",
    long: "Each piece is cut, turned on the lathe or carved by hand, following the grain rather than fighting it. Offcuts become smaller pieces and powder.",
    shot: { red: { photo: PHOTOS.carving }, white: { photo: PHOTOS.carving } },
  },
  {
    name: "Finish",
    line: "Sanded fine, then rubbed with natural oil.",
    long: "The surface is sanded through finer and finer grades, then rubbed with natural oil and, for some pieces, beeswax, so the wood can still be felt.",
    shot: { red: { photo: PHOTOS.turned, tone: "red" }, white: { photo: PHOTOS.turned } },
  },
  {
    name: "Inspect",
    line: "Checked for cracks and fit, then numbered.",
    long: "Every piece is checked for cracks, finish and fit. It is then entered with its batch number and the initials of the artisan who finished it.",
    shot: { red: { photo: PHOTOS.redGrain }, white: { photo: PHOTOS.whiteBeads } },
  },
  {
    name: "Present",
    line: "Packed in cotton, linen or wood, with its record.",
    long: "The piece is packed in raw cotton, linen or a sandalwood box with its record, ready to keep or to give.",
    shot: { red: { photo: PHOTOS.boxCarved }, white: { photo: PHOTOS.giftLinen } },
  },
];

/* ---------- long-form stories that tiles open into ---------- */

export type StoryId = "house" | "red" | "white" | "craft" | "provenance" | "vault" | "gifting";

export type Story = {
  title: string;
  lede: string;
  photo: WoodShot;
  photo2: WoodShot;
  body: string[];
  quote: string;
  facts: (wood: Wood) => { label: string; value: string }[];
  cta?: { label: string; slug?: string; section?: string };
  steps?: boolean;
  record?: boolean;
  enquiry?: boolean;
};

const same = (p: PhotoRef, tone?: Shot["tone"]): WoodShot => ({ red: { photo: p, tone }, white: { photo: p, tone } });

const count = (w: Wood) => String(FAMILIES.filter((f) => f.variants[w]).length);

export const STORIES: Record<StoryId, Story> = {
  house: {
    title: "Objects time cannot repeat",
    lede: "Santalum Maison is a contemporary Indian house for sandalwood objects, jewellery and gifting. We work in two woods: red sandalwood and white sandalwood.",
    photo: same(PHOTOS.carving),
    photo2: same(PHOTOS.malaHand),
    body: [
      "Sandalwood grows slowly. The heartwood, the dense centre that carries the colour and, in white sandalwood, the scent, takes many years to form. A piece cut from it cannot be made again in quite the same way. The house is built on that idea.",
      "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
      "The range is small on purpose: everyday objects, beads and malas, powder and oil, gifting, and a few pieces of jewellery. It runs from a key fob you carry every day to a numbered edition of twenty-one cuffs.",
      "And we write down what we know. Each piece carries a batch record. If there is evidence, we show it. If there isn't, we don't invent it.",
    ],
    quote: "Made with respect for the material. Designed for the life around it.",
    facts: () => [
      { label: "Woods", value: "Red and white sandalwood" },
      { label: "Families", value: `${FAMILIES.length} pieces` },
      { label: "Prices", value: `${formatINR(Math.min(...FAMILIES.flatMap((f) => Object.values(f.variants).map((v) => v!.price))))} to ${formatINR(Math.max(...FAMILIES.flatMap((f) => Object.values(f.variants).map((v) => v!.price))))}` },
      { label: "Making", value: "Select, Shape, Finish, Inspect, Present" },
    ],
    cta: { label: "See the collection", section: "collection" },
  },
  red: {
    title: "Red sandalwood",
    lede: "Pterocarpus santalinus, रक्तचन्दन. Deep red, dense and fine-grained, with almost no scent.",
    photo: same(PHOTOS.redGrain),
    photo2: same(PHOTOS.redChip),
    body: [
      "Red sandalwood grows in the Eastern Ghats, mainly in Andhra Pradesh. Its heartwood is a deep red that can look almost black at the centre of a turned piece.",
      "It is regulated internationally under CITES Appendix II, which governs how it may cross borders. Each batch record names where the wood came from.",
      "It carries almost no scent, and none of the oil white sandalwood is known for. What it offers is colour and weight: beads that warm in the hand, coasters with dark rings, a box that feels heavier than it looks.",
    ],
    quote: "Deep red, dense, cool in the hand.",
    facts: () => [
      { label: "Botanical name", value: "Pterocarpus santalinus" },
      { label: "Sanskrit", value: "रक्तचन्दन" },
      { label: "Grows in", value: "Eastern Ghats, Andhra Pradesh" },
      { label: "Trade", value: "CITES Appendix II" },
      { label: "Pieces in red", value: count("red") },
    ],
    cta: { label: "Show me red sandalwood", section: "collection" },
  },
  white: {
    title: "White sandalwood",
    lede: "Santalum album, श्वेतचन्दन. Pale gold and fragrant. The oil is in the heartwood.",
    photo: same(PHOTOS.whiteLog),
    photo2: same(PHOTOS.whiteRitual),
    body: [
      "White sandalwood grows in the dry forests of southern India. Mysuru, in Karnataka, is its traditional craft centre.",
      "Its scent lives in the oil of the heartwood, so the wood itself is fragrant, more so when it is warmed by the hand. The same heartwood gives our oil, which red sandalwood cannot.",
      "In the workshop it is softer in colour than red sandalwood and shows its grain more quietly: pale rings with a darker heart.",
    ],
    quote: "Four thousand years found its way to you.",
    facts: () => [
      { label: "Botanical name", value: "Santalum album" },
      { label: "Sanskrit", value: "श्वेतचन्दन" },
      { label: "Grows in", value: "Dry forests of southern India" },
      { label: "Craft centre", value: "Mysuru, Karnataka" },
      { label: "Pieces in white", value: count("white") },
    ],
    cta: { label: "Show me white sandalwood", section: "collection" },
  },
  craft: {
    title: "How a piece is made",
    lede: "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
    photo: same(PHOTOS.carving),
    photo2: { red: { photo: PHOTOS.turned, tone: "red" }, white: { photo: PHOTOS.turned } },
    body: [],
    steps: true,
    quote: "The wood decides what it will become. The hand follows.",
    facts: () => STEPS.map((s, i) => ({ label: `Step ${i + 1}`, value: s.name })),
    cta: { label: "See what the hands made", section: "collection" },
  },
  provenance: {
    title: "Know what you hold",
    lede: "If there is evidence, we show it. If there isn't, we don't invent it.",
    photo: same(PHOTOS.malaHand),
    photo2: { red: { photo: PHOTOS.redPowder }, white: { photo: PHOTOS.whitePowder } },
    body: [
      "Every piece leaves with a batch record: the piece, the wood, where the wood came from, the batch number, the initials of the artisan who finished it and the date it was finished.",
      "Where a document exists, such as a lab report for an oil batch, it travels with the record. Where it does not, the record says so instead of filling the gap.",
      "The record shown here is an example of the format, not a real batch.",
    ],
    record: true,
    quote: "Know what you hold.",
    facts: () => [
      { label: "Every record has", value: "Piece, wood, origin, batch, artisan, date" },
      { label: "Oil batches", value: "Lab report where available" },
      { label: "Red sandalwood", value: "CITES Appendix II" },
    ],
    cta: { label: "Look up a batch", section: "provenance" },
  },
  vault: {
    title: "The 2011 Vault",
    lede: "Twenty-one numbered cuffs, turned from aged heartwood sourced in 2011.",
    photo: { red: { photo: PHOTOS.turned, tone: "red" }, white: { photo: PHOTOS.turned } },
    photo2: { red: { photo: PHOTOS.boxRed }, white: { photo: PHOTOS.boxes } },
    body: [
      "The wood was sourced in 2011. It has been waiting since then for the right hands and the right moment.",
      "Each cuff is made to your measurement, numbered from one to twenty-one, and entered in our provenance registry with its number, harvest origin, the artisan's name and the date it left our hands.",
      "It comes with its registry certificate and a sealed vial of heartwood oil. When the twenty-first is made, the edition is closed.",
    ],
    quote: "Twenty-one pieces. Then the edition is closed.",
    facts: (w) => [
      { label: "Edition", value: "21 pieces, numbered" },
      { label: "Wood", value: "Aged heartwood, sourced 2011" },
      { label: "Fit", value: "Made to your measurement" },
      { label: `Price in ${w}`, value: formatINR(FAMILIES.find((f) => f.slug === "vault-cuff")!.variants[w]!.price) },
    ],
    cta: { label: "See the Vault cuff", slug: "vault-cuff" },
  },
  gifting: {
    title: "Give something that remains",
    lede: "A sandalwood object outlasts the occasion it was given for. Every piece is packed in raw cotton, linen or a sandalwood box.",
    photo: { red: { photo: PHOTOS.giftLinen }, white: { photo: PHOTOS.boxes } },
    photo2: { red: { photo: PHOTOS.boxCarved }, white: { photo: PHOTOS.giftLinen } },
    body: [
      "The presentation box is the gift as much as what goes in it: dovetailed, lined in raw cotton, with a drawer for the certificate. Choose it empty, or ask us to fill it with a mala, powder or oil.",
      "At checkout you can mark an order as a gift and add a written message.",
      "For corporate gifting, tell us how many pieces you need and by when. We will reply with what the workshop can make in that time.",
    ],
    enquiry: true,
    quote: "Give something that remains.",
    facts: (w) => [
      { label: "Presentation box", value: formatINR(FAMILIES.find((f) => f.slug === "presentation-box")!.variants[w]!.price) },
      { label: "Inside", value: "Cotton lining, certificate drawer" },
      { label: "Gift message", value: "Added at checkout" },
    ],
    cta: { label: "See the presentation box", slug: "presentation-box" },
  },
};

/* ---------- page sections, for the command palette and footer ---------- */

export const SECTIONS: { id: string; label: string; words: string }[] = [
  { id: "woods", label: "The two woods", words: "red white sandalwood compare origin" },
  { id: "collection", label: "The collection", words: "shop all pieces products" },
  { id: "craft", label: "How a piece is made", words: "craft making select shape finish inspect present" },
  { id: "provenance", label: "Provenance and batch records", words: "record batch evidence origin cites" },
  { id: "vault", label: "The 2011 Vault", words: "cuff edition 21 collector" },
  { id: "gifting", label: "Gifting", words: "gift corporate box presentation" },
  { id: "circle", label: "The Santalum Circle", words: "newsletter letters sign up email" },
];

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
