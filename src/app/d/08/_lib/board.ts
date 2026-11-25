import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, getProduct, productsFor, type CategoryId, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { COPY } from "./copy";
import { MAP_H, MAP_W, REGION, smooth, type Pt } from "./geo";

/**
 * Everything on the Atlas board lives in one world coordinate space (px at zoom 1).
 * One layout, two boards: the geometry is shared, the content is the wood's own. The map at the
 * centre is the wood's home: the Eastern Ghats for red, Mysuru for white.
 */
export type Rect = { x: number; y: number; w: number; h: number };

export const BOARD = { w: 7100, h: 3860 };

/** The wood the page is showing (client only; red on the server). */
export function woodNow(): Wood {
  return typeof document !== "undefined" && document.documentElement.dataset.wood === "white" ? "white" : "red";
}
export const woodOf = (slug: string): Wood => (slug.startsWith("w-") ? "white" : "red");

/* ---------------- shared frames ---------------- */
export const TITLE: Rect = { x: 2560, y: 150, w: 2080, h: 590 };
export const MAP: Rect = { x: 3137, y: 800, w: MAP_W, h: MAP_H };
export const ORIGIN: Rect = { x: 2560, y: 960, w: 470, h: 410 };
export const REG: Rect = { x: 2560, y: 1420, w: 470, h: 330 };
export const FACTS: Rect = { x: 4180, y: 860, w: 560, h: 640 };

export const REGION_TITLE: Rect = { x: 240, y: 170, w: 1500, h: 500 };
export const USE_A: Rect = { x: 4820, y: 200, w: 740, h: 540 };
export const USE_B: Rect = { x: 4820, y: 820, w: 520, h: 400 };
export const USE_HEAD: Rect = { x: 5660, y: 190, w: 1340, h: 380 };
export const JOURNAL: Rect = { x: 5660, y: 620, w: 1340, h: 420 };
export const OTHER: Rect = { x: 5420, y: 1110, w: 1560, h: 330 };

export const COLLECTION_HEAD: Rect = { x: 1900, y: 1800, w: 2400, h: 210 };
export const CATEGORY_Y = 2066;
export const SHOP: Rect = { x: 4790, y: 2060, w: 440, h: 700 };

export const MAKING_QUOTE: Rect = { x: 200, y: 1780, w: 960, h: 420 };
export const MAKING_PHOTO: Rect = { x: 1220, y: 1760, w: 560, h: 680 };
export const MAKING_HEAD: Rect = { x: 200, y: 2250, w: 960, h: 220 };
export const LEGEND: Rect = { x: 200, y: 3240, w: 560, h: 460 };
const STEP_W = 420;
const STEP_H = 520;
export const STEP_RECTS: Rect[] = [
  { x: 200, y: 2560, w: STEP_W, h: STEP_H },
  { x: 820, y: 2820, w: STEP_W, h: STEP_H },
  { x: 1440, y: 2640, w: STEP_W, h: STEP_H },
  { x: 2060, y: 2960, w: STEP_W, h: STEP_H },
  { x: 2680, y: 2880, w: STEP_W, h: STEP_H },
];

export const RECORD: Rect = { x: 3330, y: 2880, w: 820, h: 840 };
export const VAULT_HEAD: Rect = { x: 4380, y: 2860, w: 880, h: 230 };
export const VAULT_RING = { cx: 4790, cy: 3420, r: 262 };
export const VAULT_NOTE: Rect = { x: 5300, y: 3330, w: 440, h: 330 };
export const GIFTING: Rect = { x: 5440, y: 1960, w: 1520, h: 560 };
export const CIRCLE: Rect = { x: 5800, y: 2640, w: 1060, h: 460 };
export const CREDITS: Rect = { x: 5800, y: 3200, w: 1100, h: 560 };

/* ---------------- per-wood pieces ---------------- */
export type Specimen = { id: string; photo: PhotoRef; rect: Rect; caption: string };
export type Note = { at: Pt; label: { x: number; y: number; w: number }; title: string; text: string };
export type CardPos = { x: number; y: number; w: number; rot: number };
export type CatLabel = { id: CategoryId; x: number; w: number };
export type Waypoint = { id: string; title: string; caption: string; rect: Rect };
export type SearchItem = {
  key: string;
  label: string;
  hint: string;
  terms: string;
  target: { slug: string } | { rect: Rect } | { href: string };
};
export type MiniShape = { r: Rect; kind: "photo" | "card" | "text" };

export type BoardSpec = {
  wood: Wood;
  pin: Pt;
  specimens: Specimen[];
  notes: Note[];
  cards: Record<string, CardPos>;
  categories: CatLabel[];
  featured: Product[];
  edition: { slug: string; size: number; left: number; token: number };
  waypoints: Waypoint[];
  search: SearchItem[];
  mini: MiniShape[];
  routes: { origin: string; out: string };
  contour: string[];
  contourUse: string[];
};

const SPECIMENS: Record<Wood, Specimen[]> = {
  red: [
    { id: "red-chip", photo: PHOTOS.redChip, rect: { x: 240, y: 720, w: 700, h: 760 }, caption: "A raw chip of heartwood" },
    { id: "red-grain", photo: PHOTOS.redGrain, rect: { x: 1020, y: 720, w: 600, h: 440 }, caption: "Grain, close up" },
    { id: "red-powder", photo: PHOTOS.redPowder, rect: { x: 1720, y: 700, w: 440, h: 560 }, caption: "Milled heartwood" },
  ],
  white: [
    { id: "white-log", photo: PHOTOS.whiteLog, rect: { x: 240, y: 720, w: 760, h: 575 }, caption: "A cut log: heartwood and sapwood" },
    { id: "white-powder", photo: PHOTOS.whitePowder, rect: { x: 1080, y: 720, w: 520, h: 400 }, caption: "Milled heartwood" },
    { id: "white-beads", photo: PHOTOS.whiteBeads, rect: { x: 1680, y: 700, w: 480, h: 480 }, caption: "Turned beads" },
  ],
};

const NOTES: Record<Wood, Note[]> = {
  red: [
    { at: [567, 1085], label: { x: 1020, y: 1230, w: 300 }, title: "Heartwood", text: "Deep red, nearly black where it is oldest." },
    { at: [704, 1146], label: { x: 1020, y: 1380, w: 300 }, title: "Weight", text: "Dense and heavy for its size. Cool in the hand." },
    { at: [1480, 960], label: { x: 1360, y: 1230, w: 280 }, title: "Grain", text: "Fine and close. It polishes with oil and handling." },
    { at: [1940, 1000], label: { x: 1720, y: 1310, w: 440 }, title: "Scent", text: "Almost none. Milled, it turns brick red." },
  ],
  white: [
    { at: [445, 1036], label: { x: 240, y: 1345, w: 300 }, title: "Sapwood", text: "Pale, with almost no scent. Set aside." },
    { at: [647, 979], label: { x: 600, y: 1345, w: 400 }, title: "Heartwood", text: "The darker centre. This is where the oil is." },
    { at: [1340, 900], label: { x: 1080, y: 1175, w: 520 }, title: "Fragrance", text: "Pale gold, and fragrant even as powder." },
    { at: [1962, 966], label: { x: 1680, y: 1235, w: 480 }, title: "On the skin", text: "As beads it warms in the hand and gives its scent." },
  ],
};

const CARDS: Record<Wood, Record<string, CardPos>> = {
  red: {
    "r-japa-mala-108": { x: 1900, y: 2180, w: 320, rot: -1.2 },
    "r-wrist-mala-27": { x: 2270, y: 2240, w: 260, rot: 1.1 },
    "r-key-fob": { x: 2630, y: 2200, w: 240, rot: -1.5 },
    "r-coasters": { x: 2920, y: 2250, w: 280, rot: 0.9 },
    "r-heartwood-powder": { x: 3300, y: 2190, w: 270, rot: -0.8 },
    "r-presentation-box": { x: 3670, y: 2230, w: 300, rot: 1.2 },
    "r-grain-pendant": { x: 4070, y: 2180, w: 270, rot: -1.1 },
    "r-vault-cuff": { x: 4390, y: 2250, w: 290, rot: 0.8 },
  },
  white: {
    "w-heartwood-oil": { x: 1900, y: 2190, w: 290, rot: -1.0 },
    "w-chandan-attar": { x: 2240, y: 2250, w: 260, rot: 1.2 },
    "w-reserve-oil": { x: 2550, y: 2180, w: 270, rot: -0.7 },
    "w-incense-sticks": { x: 2920, y: 2240, w: 270, rot: 1.0 },
    "w-chandan-stone": { x: 3240, y: 2190, w: 280, rot: -1.3 },
    "w-chandan-powder": { x: 3620, y: 2230, w: 270, rot: 0.9 },
    "w-japa-mala-108": { x: 3990, y: 2180, w: 290, rot: -0.9 },
    "w-mysuru-fan": { x: 4380, y: 2240, w: 290, rot: 1.1 },
  },
};

const CATS: Record<Wood, CatLabel[]> = {
  red: [
    { id: "beads", x: 1900, w: 630 },
    { id: "objects", x: 2630, w: 570 },
    { id: "powder", x: 3300, w: 310 },
    { id: "gifting", x: 3670, w: 300 },
    { id: "jewellery", x: 4070, w: 610 },
  ],
  white: [
    { id: "oil", x: 1900, w: 920 },
    { id: "incense", x: 2920, w: 600 },
    { id: "skin", x: 3620, w: 300 },
    { id: "w-beads", x: 3990, w: 290 },
    { id: "carvings", x: 4380, w: 330 },
  ],
};

export const cardH = (w: number) => Math.round(w * 1.25 + 136);

/* ---------------- lines on the board ---------------- */
const LABEL_LINE = 22;
/** A leader line from a point on a photo to its label: straight down/up, or out to the side with a shoulder. */
export function leader(n: Note): string {
  const { at, label } = n;
  if (at[0] >= label.x && at[0] <= label.x + label.w) {
    const y = label.y > at[1] ? label.y - 16 : label.y + 110;
    return `M${at[0]} ${at[1]} L${at[0]} ${y}`;
  }
  const right = label.x > at[0];
  const ax = right ? label.x - 14 : label.x + label.w + 14;
  const ay = label.y + LABEL_LINE;
  const kx = ax + (right ? -46 : 46);
  return `M${at[0]} ${at[1]} L${kx} ${ay} L${ax} ${ay}`;
}

const centre = (r: Rect): Pt => [r.x + r.w / 2, r.y + r.h / 2];
export const MAKING_PATH = smooth([
  [MAKING_HEAD.x + 210, MAKING_HEAD.y + 200],
  ...STEP_RECTS.map(centre),
  [RECORD.x - 10, RECORD.y + 300],
]);

/** Soft topographic contours behind a region. Deterministic. */
function blob(cx: number, cy: number, rx: number, ry: number, phase: number, n = 16): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(3 * a + phase) + 0.045 * Math.sin(5 * a + phase * 1.7) + 0.025 * Math.cos(7 * a - phase);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}

/* ---------------- assembling a board ---------------- */
function build(wood: Wood): BoardSpec {
  const region = REGION[wood];
  const pin: Pt = [MAP.x + region.pin[0], MAP.y + region.pin[1]];
  const copy = COPY[wood];
  const feat = featured(wood);
  const cards = CARDS[wood];
  const ed = wood === "red" ? getProduct("r-vault-cuff")! : getProduct("w-reserve-oil")!;
  const cardRectOf = (slug: string): Rect => {
    const p = cards[slug];
    return { x: p.x, y: p.y, w: p.w, h: cardH(p.w) };
  };

  const ey = ORIGIN.y + 230;
  const lastSpec = SPECIMENS[wood].reduce((a, s) => (s.rect.x + s.rect.w > a.rect.x + a.rect.w ? s : a));
  const outX = lastSpec.rect.x + lastSpec.rect.w + 8;
  const outY = lastSpec.rect.y + 300;
  const routes = {
    origin: `M${pin[0]} ${pin[1]} C${pin[0] - 40} ${pin[1] - 170} ${pin[0] - 330} ${ey - 40} ${ORIGIN.x + ORIGIN.w + 8} ${ey}`,
    out: `M${ORIGIN.x - 8} ${ey} C${ORIGIN.x - 160} ${ey} ${outX + 130} ${outY} ${outX} ${outY}`,
  };

  const t = copy.tour;
  const waypoints: Waypoint[] = [
    { id: "start", ...t.start, rect: { x: pin[0] - 1120, y: 110, w: 2240, h: 1180 } },
    { id: "place", ...t.place, rect: { x: 2520, y: 820, w: 2260, h: 1000 } },
    { id: "wood", ...t.wood, rect: { x: 200, y: 150, w: 2000, h: 1360 } },
    { id: "use", ...t.use, rect: { x: 4790, y: 150, w: 2220, h: 1320 } },
    { id: "collection", ...t.collection, rect: { x: 1860, y: 1780, w: 2900, h: 980 } },
    { id: "shop", ...t.shop, rect: { x: SHOP.x - 60, y: SHOP.y - 50, w: SHOP.w + 120, h: SHOP.h + 100 } },
    { id: "making", ...t.making, rect: { x: 180, y: 1740, w: 2960, h: 1760 } },
    { id: "provenance", ...t.provenance, rect: { x: 3290, y: 2840, w: 900, h: 900 } },
    { id: "edition", ...t.edition, rect: { x: 4340, y: 2820, w: 1420, h: 980 } },
    { id: "gifting", ...t.gifting, rect: { x: 5400, y: 1900, w: 1620, h: 1300 } },
  ];

  const pad = (r: Rect, p = 60): Rect => ({ x: r.x - p, y: r.y - p, w: r.w + p * 2, h: r.h + p * 2 });
  const onBoard = new Set(feat.map((p) => p.slug));
  const catLabel = (id: CategoryId) => CATEGORIES[wood].find((c) => c.id === id)?.label ?? "";
  const search: SearchItem[] = [
    ...productsFor(wood).map(
      (p): SearchItem => ({
        key: p.slug,
        label: p.name,
        hint: onBoard.has(p.slug) ? catLabel(p.category) : "In the shop",
        terms: `${p.name} ${p.short} ${catLabel(p.category)} ${p.badge ?? ""}`.toLowerCase(),
        target: onBoard.has(p.slug) ? { slug: p.slug } : { href: `/d/08/p/${p.slug}` },
      }),
    ),
    ...waypoints.map((w): SearchItem => ({ key: `wp-${w.id}`, label: w.title, hint: "On the board", terms: `${w.title} ${w.caption}`.toLowerCase(), target: { rect: w.rect } })),
    ...CONTENT[wood].making.map(
      ({ title: s }, i): SearchItem => ({
        key: `step-${i}`,
        label: s,
        hint: `The making, step ${i + 1}`,
        terms: `${s} making step`.toLowerCase(),
        target: { rect: pad(STEP_RECTS[i], 80) },
      }),
    ),
    { key: "record", label: wood === "red" ? "Example batch record" : "Example lot record", hint: "Provenance", terms: "record batch lot provenance evidence registry r-26-0412 w-26-0188", target: { rect: pad(RECORD) } },
    { key: "circle", label: "The Santalum Circle", hint: "Letters from the house", terms: "circle newsletter letters email sign up join", target: { rect: pad(CIRCLE, 80) } },
    { key: "reg", label: copy.regTitle, hint: copy.place, terms: `${copy.regTitle} regulation law trade rules cites`.toLowerCase(), target: { rect: pad(REG) } },
    { key: "origin", label: `${copy.originTitle}, ${copy.originSub}`, hint: "Where it grows", terms: `${copy.originTitle} ${copy.originSub} ${copy.place} origin map`.toLowerCase(), target: { rect: pad(ORIGIN) } },
  ];

  const mini: MiniShape[] = [
    { r: TITLE, kind: "text" },
    { r: REGION_TITLE, kind: "text" },
    { r: ORIGIN, kind: "card" },
    { r: REG, kind: "card" },
    { r: FACTS, kind: "card" },
    ...SPECIMENS[wood].map((s) => ({ r: s.rect, kind: "photo" as const })),
    { r: USE_A, kind: "photo" },
    { r: USE_B, kind: "photo" },
    { r: USE_HEAD, kind: "text" },
    { r: JOURNAL, kind: "card" },
    { r: OTHER, kind: "card" },
    { r: COLLECTION_HEAD, kind: "text" },
    ...feat.map((p) => ({ r: cardRectOf(p.slug), kind: "card" as const })),
    { r: SHOP, kind: "card" },
    { r: MAKING_PHOTO, kind: "photo" },
    { r: MAKING_QUOTE, kind: "text" },
    { r: MAKING_HEAD, kind: "text" },
    { r: LEGEND, kind: "card" },
    { r: VAULT_HEAD, kind: "text" },
    ...STEP_RECTS.map((r) => ({ r, kind: "card" as const })),
    { r: RECORD, kind: "card" },
    { r: GIFTING, kind: "card" },
    { r: CIRCLE, kind: "card" },
    { r: CREDITS, kind: "card" },
  ];

  return {
    wood,
    pin,
    specimens: SPECIMENS[wood],
    notes: NOTES[wood],
    cards,
    categories: CATS[wood],
    featured: feat,
    edition: { slug: ed.slug, size: ed.edition!.size, left: ed.edition!.left, token: wood === "red" ? 34 : 24 },
    waypoints,
    search,
    mini,
    routes,
    contour: [0, 1, 2, 3].map((i) => blob(1190, 870, 1180 - i * 120, 780 - i * 92, (wood === "red" ? 0.6 : 2.2) + i * 0.35)),
    contourUse: [0, 1, 2].map((i) => blob(5900, 820, 1160 - i * 130, 720 - i * 100, (wood === "red" ? 1.4 : 3.1) + i * 0.3)),
  };
}

export const BOARDS: Record<Wood, BoardSpec> = { red: build("red"), white: build("white") };
export const boardFor = (w: Wood) => BOARDS[w];

/** A featured card's rect on its wood's board (null when the piece is not on the board). */
export function cardRect(slug: string): Rect | null {
  const p = BOARDS[woodOf(slug)].cards[slug];
  return p ? { x: p.x, y: p.y, w: p.w, h: cardH(p.w) } : null;
}

/* Detail card that opens beside a product card. */
export const DETAIL_W = 800;
export const DETAIL_H = 700;
export function detailRect(slug: string): Rect {
  const c = cardRect(slug) ?? { x: SHOP.x, y: SHOP.y, w: SHOP.w, h: SHOP.h };
  const right = c.x + c.w + 56 + DETAIL_W <= BOARD.w - 40;
  const x = right ? c.x + c.w + 56 : c.x - 56 - DETAIL_W;
  const y = Math.max(60, Math.min(c.y - 60, BOARD.h - DETAIL_H - 60));
  return { x, y, w: DETAIL_W, h: DETAIL_H };
}
export function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}
