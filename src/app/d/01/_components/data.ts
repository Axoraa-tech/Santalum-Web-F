import { FAMILIES, type CategoryKey, type Family } from "@/lib/catalog";

/** Lathe profiles the 3D work can take. Every profile has the same number of points, so any two can morph. */
export type ProfileKey = "billet" | "guru" | "bead" | "jar" | "coaster" | "bowl" | "cuff";

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
  products: string[];
  shop: { label: string; to: "next" | "parts" | "vault"; cat?: CategoryKey };
};

export const CHAPTERS: Chapter[] = [
  {
    id: 0,
    short: "Heartwood",
    title: ["From the", "heartwood"],
    body: "One billet of heartwood, turned between centres. Keep scrolling and the lathe takes it through the pieces we make: a guru bead, a jar, a coaster, a bowl, and a cuff from the 2011 Vault.",
    profile: "billet",
    dia: 100,
    rpm: 600,
    products: [],
    shop: { label: "Start the lathe", to: "next" },
  },
  {
    id: 1,
    short: "Bead",
    title: ["A bead, then", "a hundred and eight"],
    body: "Each bead is turned, sized and polished by hand, then knotted so the beads do not rub. A mala is 108 of them and a guru bead. A bracelet is 21.",
    profile: "guru",
    dia: 12,
    rpm: 2800,
    products: ["japa-mala", "bead-bracelet"],
    shop: { label: "Shop beads and malas", to: "parts", cat: "beads" },
  },
  {
    id: 2,
    short: "Jar",
    title: ["What the lathe", "leaves behind"],
    body: "Offcuts from larger work are milled into powder, sieved twice and sealed in amber glass. Only white sandalwood carries oil, and only in its heartwood.",
    profile: "jar",
    dia: 64,
    rpm: 1400,
    products: ["heartwood-powder", "heartwood-oil"],
    shop: { label: "Shop powder and oil", to: "parts", cat: "powder" },
  },
  {
    id: 3,
    short: "Coaster",
    title: ["End grain,", "under your cup"],
    body: "Coasters are turned from a single length of heartwood with the end grain up, so the rings of the tree sit under your cup. The same lathe makes the small things for the desk and the door.",
    profile: "coaster",
    dia: 95,
    rpm: 1100,
    products: ["coaster-pair", "key-fob", "incense-holder"],
    shop: { label: "Shop everyday objects", to: "parts", cat: "objects" },
  },
  {
    id: 4,
    short: "Bowl",
    title: ["Give something", "that remains"],
    body: "The box is the gift as much as what goes in it. Dovetailed, lined in raw cotton, with a drawer for the certificate. Choose it empty, or ask us to fill it.",
    profile: "bowl",
    dia: 150,
    rpm: 800,
    products: ["presentation-box", "grain-pendant"],
    shop: { label: "Shop gifting", to: "parts", cat: "gifting" },
  },
  {
    id: 5,
    short: "Cuff",
    title: ["The 2011", "Vault"],
    body: "Twenty-one cuffs turned from aged heartwood sourced in 2011. Each is numbered and entered in our provenance registry with its origin, the artisan's name and the date it left our hands.",
    profile: "cuff",
    dia: 66,
    rpm: 1200,
    products: ["vault-cuff", "cufflinks"],
    shop: { label: "See all 21", to: "vault" },
  },
];

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
  const n = CHAPTERS.length;
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
export function readout(p: number) {
  const s = storyPhase(p);
  const a = CHAPTERS[s.from];
  const b = CHAPTERS[s.to];
  return { dia: a.dia + (b.dia - a.dia) * s.m, rpm: a.rpm + (b.rpm - a.rpm) * s.rpmT, c: s.c };
}

/** The lathe profile that matches each family, for the product viewer. */
export const FAMILY_PROFILE: Record<string, { key: ProfileKey; label: string }> = {
  "key-fob": { key: "billet", label: "Turned blank" },
  "coaster-pair": { key: "coaster", label: "Coaster, end grain up" },
  "incense-holder": { key: "bowl", label: "Shallow dish" },
  "japa-mala": { key: "guru", label: "Guru bead" },
  "bead-bracelet": { key: "bead", label: "Bead, bored through" },
  "heartwood-powder": { key: "jar", label: "Lidded jar" },
  "heartwood-oil": { key: "jar", label: "Lidded jar" },
  "presentation-box": { key: "bowl", label: "Bowl and lid" },
  "grain-pendant": { key: "coaster", label: "Disc for the panel" },
  cufflinks: { key: "coaster", label: "Disc for the faces" },
  "vault-cuff": { key: "cuff", label: "Cuff" },
};

export const CARE: Record<CategoryKey, string> = {
  objects: "Wipe with a dry cloth. Once a season, rub in a drop of neutral oil and buff it off.",
  beads: "Keep dry and take off before bathing. Store in the pouch when not worn; the beads darken and smooth with handling.",
  powder: "Keep the jar closed and away from moisture. Patch-test before use on skin.",
  gifting: "Dust with a soft dry cloth and keep out of direct sun. The cotton lining can be brushed clean.",
  jewellery: "Keep away from water and perfume. Wipe with a soft cloth after wearing.",
};

/** The one measurement worth drawing for each family (from its details). */
export function keyDimension(f: Family) {
  const order = ["Size", "Face", "Beads", "Weight", "Volume", "Edition"];
  for (const label of order) {
    const d = f.details.find((x) => x.label === label);
    if (d) return d.value;
  }
  return f.details[0]?.value ?? "";
}

/** Part numbers follow the catalogue order. */
export function partNo(slug: string) {
  const i = FAMILIES.findIndex((f) => f.slug === slug);
  return `P-${String(i + 1).padStart(2, "0")}`;
}

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const GIFT_WRAP = 350;

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
