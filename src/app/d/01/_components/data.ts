import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { getProduct, productsFor, type CategoryId, type Product, type Shot } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";

/** Lathe profiles the 3D work can take. Every profile has the same number of points, so any two can morph. */
export type ProfileKey = "billet" | "guru" | "bead" | "jar" | "coaster" | "bowl" | "cuff" | "vial" | "casket" | "ampoule";

export type Chapter = {
  id: number;
  /** Short name for the nav ticks and the readout. */
  short: string;
  title: [string, string];
  body: string;
  profile: ProfileKey;
  /** Readouts for the lathe bed: diameter of the finished piece (mm) and spindle speed. */
  dia: number;
  rpm: number;
  /** Hand-picked pieces from this wood that the chapter turns. */
  picks: string[];
  shop: { label: string; to: "next" | "shop" | "edition"; cat?: CategoryId };
};

/**
 * The story on the lathe, told twice. Red: density, colour, the Eastern Ghats, the turning floor,
 * the Vault. White: fragrance, oil, ritual, Mysuru carving, the Reserve.
 */
export const CHAPTERS: Record<Wood, Chapter[]> = {
  red: [
    {
      id: 0,
      short: "Heartwood",
      title: ["From the", "heartwood"],
      body: "One billet of red heartwood from the Eastern Ghats, heavy for its size, turned between centres. Keep scrolling and the lathe takes it through the pieces we make: a guru bead, a jar, a coaster, a bowl, and a cuff from the 2011 Vault.",
      profile: "billet",
      dia: 100,
      rpm: 600,
      picks: [],
      shop: { label: "Start the lathe", to: "next" },
    },
    {
      id: 1,
      short: "Bead",
      title: ["A bead, then", "a hundred and eight"],
      body: "Each bead is turned, sized and polished by hand, then knotted on cotton so the beads do not rub. A japa mala is 108 of them and a guru bead, all cut from one batch so the red runs true.",
      profile: "guru",
      dia: 12,
      rpm: 2800,
      picks: ["r-japa-mala-108", "r-wrist-mala-27"],
      shop: { label: "All beads and malas", to: "shop", cat: "beads" },
    },
    {
      id: 2,
      short: "Jar",
      title: ["What the lathe", "leaves behind"],
      body: "Nothing on the turning floor is swept away. Offcuts are milled into raktachandan, sieved twice and sealed in amber glass. The chips go to ritual fires and to dye; the red in them is santalin.",
      profile: "jar",
      dia: 64,
      rpm: 1400,
      picks: ["r-heartwood-powder", "r-heartwood-chips"],
      shop: { label: "Powder and material", to: "shop", cat: "powder" },
    },
    {
      id: 3,
      short: "Coaster",
      title: ["End grain,", "under your cup"],
      body: "Coasters are cut across a single length of heartwood with the end grain up, so the growth rings sit under your cup. The same lathe turns the key fob and the pen, weighted by the wood itself.",
      profile: "coaster",
      dia: 95,
      rpm: 1100,
      picks: ["r-coasters", "r-key-fob", "r-writing-pen"],
      shop: { label: "Everyday objects", to: "shop", cat: "objects" },
    },
    {
      id: 4,
      short: "Bowl",
      title: ["Give something", "that remains"],
      body: "A bowl left thick at the base so it sits low and heavy, and a hinged box with a drawer for the batch record. Red sandalwood gifts weigh more than they look, and they keep for a lifetime.",
      profile: "bowl",
      dia: 150,
      rpm: 800,
      picks: ["r-turned-bowl", "r-presentation-box"],
      shop: { label: "Gifting in red", to: "shop", cat: "gifting" },
    },
    {
      id: 5,
      short: "Cuff",
      title: ["The 2011", "Vault"],
      body: "Twenty-one cuffs turned from heartwood sourced in 2011 and aged since. Each is numbered and entered in our registry with its documented lot, the artisan's name and the date it left our hands.",
      profile: "cuff",
      dia: 66,
      rpm: 1200,
      picks: ["r-vault-cuff", "r-turned-bangle"],
      shop: { label: "Open the Vault", to: "edition" },
    },
  ],
  white: [
    {
      id: 0,
      short: "Heartwood",
      title: ["Where the", "scent sits"],
      body: "One billet of white sandalwood heartwood from Karnataka, turned between centres. As the tool cuts, the shavings give off the scent. Keep scrolling: a bead, an attar bottle, an offering bowl, a Mysuru box, and a vial from the 2011 Reserve.",
      profile: "billet",
      dia: 100,
      rpm: 600,
      picks: [],
      shop: { label: "Start the lathe", to: "next" },
    },
    {
      id: 1,
      short: "Bead",
      title: ["Beads that warm", "in the hand"],
      body: "White heartwood keeps its oil for years. Hold a mala between the palms and the scent rises from it; the guru bead is left a little larger so the fingers find it without looking.",
      profile: "bead",
      dia: 8,
      rpm: 2600,
      picks: ["w-japa-mala-108", "w-bead-bracelet"],
      shop: { label: "All beads and malas", to: "shop", cat: "w-beads" },
    },
    {
      id: 2,
      short: "Oil",
      title: ["Distilled,", "a drop at a time"],
      body: "Chips from aged heartwood go to slow steam distillation; nothing is added and nothing is cut. Attar is distilled into a sandalwood base the Kannauj way, without alcohol. Every batch is tested and the report kept with the lot.",
      profile: "vial",
      dia: 42,
      rpm: 1600,
      picks: ["w-heartwood-oil", "w-chandan-attar"],
      shop: { label: "Oil and attar", to: "shop", cat: "oil" },
    },
    {
      id: 3,
      short: "Ritual",
      title: ["Paste, smoke", "and the lamp"],
      body: "Fresh chandan ground on a wet stone for the tilak, incense rolled by hand in Mysuru, a small turned bowl for flowers and rice. The temple morning, kept at home.",
      profile: "bowl",
      dia: 100,
      rpm: 900,
      picks: ["w-chandan-stone", "w-incense-sticks", "w-offering-bowl"],
      shop: { label: "Incense and ritual", to: "shop", cat: "incense" },
    },
    {
      id: 4,
      short: "Mysuru",
      title: ["Carved", "in Mysuru"],
      body: "Karnataka is called the land of sandalwood, and Mysuru is still its carving centre. Fans are pierced leaf by leaf with a fine saw and figures are carved by one hand from one block. The lathe turns the round boxes; the carver does the rest.",
      profile: "casket",
      dia: 80,
      rpm: 1000,
      picks: ["w-mysuru-fan", "w-carved-figure"],
      shop: { label: "Carvings and objects", to: "shop", cat: "carvings" },
    },
    {
      id: 5,
      short: "Reserve",
      title: ["The 2011", "Reserve"],
      body: "Fifty vials of oil distilled from one lot of heartwood harvested in 2011 and aged since. Each vial is numbered by hand and entered in the registry with its lot and date.",
      profile: "ampoule",
      dia: 18,
      rpm: 2000,
      picks: ["w-reserve-oil", "w-boxed-oil"],
      shop: { label: "Open the Reserve", to: "edition" },
    },
  ],
};

export const N_CHAPTERS = 6;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Which side of the screen the work sits on in chapter k (the text takes the other side). */
export const workSide = (k: number) => (k % 2 === 0 ? 1 : -1);

/**
 * Where the story is for a scroll progress p (0–1). Shared by the 3D scene and the overlay.
 * Within each chapter (t from 0 to 1): the text arrives at 0.12–0.24, the tool cuts the previous
 * shape into this one at 0.16–0.6, the text leaves at 0.84–0.94 and the work crosses the screen.
 */
export function storyPhase(p: number) {
  const n = N_CHAPTERS;
  const f = Math.min(Math.max(p, 0), 0.99999) * n;
  const c = Math.floor(f);
  const t = f - c;
  const from = Math.max(0, c - 1);
  const m = c === 0 ? 1 : smooth(0.16, 0.6, t);
  const tool = c === 0 ? 0 : smooth(0.06, 0.16, t) * (1 - smooth(0.6, 0.72, t));
  const g = f - 0.9;
  const k = Math.floor(g);
  const side =
    k < 0 ? workSide(0) : k + 1 > n - 1 ? workSide(n - 1) : workSide(k) + (workSide(k + 1) - workSide(k)) * smooth(0, 0.26, g - k);
  const rpmT = c === 0 ? 1 : smooth(0.04, 0.14, t);
  return { c, t, from, to: c, m, tool, side, rpmT };
}

/** Readouts for a progress: current diameter (mm) and spindle speed. */
export function readout(p: number, wood: Wood) {
  const s = storyPhase(p);
  const a = CHAPTERS[wood][s.from];
  const b = CHAPTERS[wood][s.to];
  return { dia: a.dia + (b.dia - a.dia) * s.m, rpm: a.rpm + (b.rpm - a.rpm) * s.rpmT, c: s.c };
}

/** The lathe profile closest to each piece, for the 3D view on its product page. */
const PROFILE_BY_CATEGORY: Record<CategoryId, { key: ProfileKey; label: string }> = {
  beads: { key: "guru", label: "Guru bead" },
  objects: { key: "billet", label: "Turned blank" },
  powder: { key: "jar", label: "Lidded jar" },
  gifting: { key: "casket", label: "Turned box" },
  jewellery: { key: "coaster", label: "Disc, for the face" },
  oil: { key: "vial", label: "Attar bottle" },
  incense: { key: "bowl", label: "Shallow dish" },
  skin: { key: "jar", label: "Lidded jar" },
  "w-beads": { key: "bead", label: "Bead, bored through" },
  carvings: { key: "casket", label: "Turned box" },
  "w-gifting": { key: "casket", label: "Turned box" },
};

const PROFILE_BY_SLUG: Record<string, { key: ProfileKey; label: string }> = {
  "r-wrist-mala-27": { key: "bead", label: "Bead, bored through" },
  "r-bead-bracelet": { key: "bead", label: "Bead, bored through" },
  "r-coasters": { key: "coaster", label: "Coaster, end grain up" },
  "r-incense-holder": { key: "bowl", label: "Shallow tray" },
  "r-turned-bowl": { key: "bowl", label: "Bowl" },
  "r-chess-set": { key: "guru", label: "Turned piece" },
  "r-heartwood-chips": { key: "jar", label: "Lidded jar" },
  "r-tilak-set": { key: "billet", label: "Stick, turned round" },
  "r-turned-bangle": { key: "cuff", label: "Bangle" },
  "r-signet-ring": { key: "cuff", label: "Ring blank" },
  "r-vault-cuff": { key: "cuff", label: "Cuff" },
  "r-carved-ganesha": { key: "billet", label: "Carving blank" },
  "w-reserve-oil": { key: "ampoule", label: "Numbered vial" },
  "w-chandan-stone": { key: "billet", label: "Stick, turned round" },
  "w-heartwood-chips": { key: "jar", label: "Lidded jar" },
  "w-candle": { key: "jar", label: "Jar" },
  "w-japa-mala-108": { key: "guru", label: "Guru bead" },
  "w-mysuru-fan": { key: "billet", label: "Blank for the leaves" },
  "w-carved-figure": { key: "billet", label: "Carving blank" },
  "w-offering-bowl": { key: "bowl", label: "Bowl" },
  "w-key-fob": { key: "billet", label: "Turned blank" },
  "w-scented-pendant": { key: "coaster", label: "Disc, for the face" },
  "w-wedding-tray": { key: "coaster", label: "Tray" },
};

export function latheProfile(p: Product) {
  return PROFILE_BY_SLUG[p.slug] ?? PROFILE_BY_CATEGORY[p.category];
}

const MEASURE = /\d+(?:\.\d+)?\s?(?:mm|cm|ml|g)\b/;
const DIM_ORDER = ["Size", "Beads", "Volume", "Length", "Face", "Width", "Height", "King", "Leaves", "Holds", "Count", "Burn", "Bar", "Edition"];
/** Short enough to sit on a dimension line in a card or a table cell. */
const DIM_MAX = 24;
const clip = (v: string) => (v.length <= DIM_MAX ? v : v.split(",")[0]);

/**
 * The one measurement worth drawing for a piece, kept short enough for a dimension line:
 * measured options first (bead sizes, volumes, weights), then a measured detail, then what a set holds.
 */
export function keyDimension(p: Product) {
  const opts = p.options?.values.map((v) => v.label) ?? [];
  if (opts.length && opts.every((l) => MEASURE.test(l))) {
    const m = opts.map((l) => l.match(MEASURE)![0]);
    const all = m.join(", ");
    return all.length <= DIM_MAX - 4 ? all : `${m[0]} to ${m[m.length - 1]}`;
  }
  for (const label of DIM_ORDER) {
    const d = p.details.find((x) => x.label === label);
    if (!d) continue;
    const v = d.value.replace(/^Approx\. /, "≈ ");
    if (label === "Beads") return clip(v.replace(/^(\d+), /, "$1 beads, "));
    if (label === "Edition") return clip(v.replace(/^(\d+)\b.*/, "Edition of $1"));
    return clip(v);
  }
  const inc = p.details.find((x) => x.label === "Includes");
  if (inc) return `Set of ${inc.value.split(",").length}`;
  if (opts.length) {
    const named = `${p.options!.name} ${opts.join(", ")}`;
    if (named.length <= DIM_MAX) return named;
  }
  for (const d of p.details) {
    const m = d.value.match(MEASURE);
    if (m) return `${d.label} ${m[0]}`;
  }
  return clip(p.details[0]?.value ?? "");
}

/**
 * Photographs as this design shows them. One placeholder carries another maker's name on the lid,
 * so the presentation box is shown by its carved photograph, and the casket by the carver at work
 * (so the two do not share a first photograph in the gift list).
 */
const SHOTS: Record<string, Shot[]> = {
  "r-presentation-box": [{ photo: PHOTOS.boxCarved }, { photo: PHOTOS.boxes }],
  "r-heirloom-casket": [{ photo: PHOTOS.carving }, { photo: PHOTOS.boxCarved }],
};
const SWAP_ID: Record<string, string> = { [PHOTOS.boxRed.id]: PHOTOS.boxCarved.id };

export function shotsOf(p: Product): Shot[] {
  return SHOTS[p.slug] ?? p.shots;
}

/** Photo for an order or bag line (orders store the photo id they were placed with). */
export function linePhoto(l: { slug: string; photoId: string; name: string }): PhotoRef {
  const p = getProduct(l.slug);
  if (p && SHOTS[p.slug]) return { ...SHOTS[p.slug][0].photo, alt: l.name };
  return { id: SWAP_ID[l.photoId] ?? l.photoId, alt: l.name };
}

/**
 * The piece the wood switch moves to from a product page: its own counterpart where it has one,
 * otherwise the nearest piece in the other wood by what it is for.
 */
const NEAREST: Record<string, string> = {
  "r-half-mala-54": "w-scented-mala-54",
  "w-scented-mala-54": "r-half-mala-54",
  "r-wrist-mala-27": "w-bead-bracelet",
  "r-pocket-mala-18": "w-scented-mala-54",
  "r-incense-holder": "w-incense-holder",
  "w-incense-holder": "r-incense-holder",
  "r-turned-bowl": "w-offering-bowl",
  "w-offering-bowl": "r-turned-bowl",
  "r-carved-ganesha": "w-carved-figure",
  "w-carved-figure": "r-carved-ganesha",
  "r-writing-pen": "w-card-case",
  "w-card-case": "r-writing-pen",
  "r-heartwood-chips": "w-heartwood-chips",
  "w-heartwood-chips": "r-heartwood-chips",
  "r-ubtan": "w-face-pack",
  "w-face-pack": "r-ubtan",
  "r-presentation-box": "w-boxed-oil",
  "w-boxed-oil": "r-presentation-box",
  "r-mala-box": "w-morning-ritual",
  "w-morning-ritual": "r-mala-box",
  "r-desk-set": "w-wedding-tray",
  "w-wedding-tray": "r-desk-set",
  "r-heirloom-casket": "w-mysuru-fan",
  "r-vault-cuff": "w-reserve-oil",
  "w-reserve-oil": "r-vault-cuff",
};
const NEAREST_BY_CATEGORY: Record<CategoryId, string> = {
  beads: "w-japa-mala-108",
  objects: "w-offering-bowl",
  powder: "w-chandan-powder",
  gifting: "w-boxed-oil",
  jewellery: "w-scented-pendant",
  oil: "r-heartwood-powder",
  incense: "r-incense-holder",
  skin: "r-heartwood-powder",
  "w-beads": "r-japa-mala-108",
  carvings: "r-carved-ganesha",
  "w-gifting": "r-presentation-box",
};

export function otherWoodPiece(p: Product): string | undefined {
  const slug = p.counterpart ?? NEAREST[p.slug] ?? NEAREST_BY_CATEGORY[p.category];
  const q = slug ? getProduct(slug) : undefined;
  return q && q.wood !== p.wood ? q.slug : undefined;
}

/** Part numbers follow the catalogue order: R-01 to R-26 in red, W-01 to W-26 in white. */
export function partNo(slug: string) {
  const wood: Wood = slug.startsWith("w-") ? "white" : "red";
  const i = productsFor(wood).findIndex((p) => p.slug === slug);
  return `${wood === "red" ? "R" : "W"}-${String(i + 1).padStart(2, "0")}`;
}

/** Sheet letter for each wood, as on the two spec sheets. */
export const SHEET: Record<Wood, "A" | "B"> = { red: "A", white: "B" };

/** What a piece leaves with, by wood. */
export const RECORD_LINE: Record<Wood, string> = {
  red: "Leaves with its batch record: species, documented lot, origin, who finished it and the day it was finished.",
  white: "Carries its lot on the label: where the wood came from and when it was distilled or carved. Oils travel with their batch test report.",
};

export const DELIVERY_LINE = "Free delivery across India, 3–5 working days. Express ₹350.";

export const EASE = [0.22, 1, 0.36, 1] as const;

/** Seeded PRNG for anything that must look random but render the same on server and client. */
export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
