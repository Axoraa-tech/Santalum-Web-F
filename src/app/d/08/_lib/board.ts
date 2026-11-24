import { CATEGORIES, FAMILIES, type CategoryKey, type Family } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { MAP_H, MAP_W, PIN, smooth, type Pt } from "./geo";

/** Everything on the Atlas board lives in one world coordinate space (px at zoom 1). */
export type Rect = { x: number; y: number; w: number; h: number };

export const BOARD = { w: 7100, h: 3860 };

/* ---------------- centre: title plate and map ---------------- */
export const TITLE: Rect = { x: 2560, y: 150, w: 2080, h: 590 };
export const MAP: Rect = { x: 3137, y: 800, w: MAP_W, h: MAP_H };
export const PIN_WORLD = {
  red: [MAP.x + PIN.red[0], MAP.y + PIN.red[1]] as Pt,
  white: [MAP.x + PIN.white[0], MAP.y + PIN.white[1]] as Pt,
};
export const RED_ORIGIN: Rect = { x: 2560, y: 980, w: 470, h: 350 };
export const CITES: Rect = { x: 2560, y: 1390, w: 470, h: 300 };
export const WHITE_ORIGIN: Rect = { x: 4180, y: 1160, w: 470, h: 350 };
export const TEMPLE: Rect = { x: 4200, y: 1640, w: 600, h: 420 };

/* ---------------- the two wood regions ---------------- */
export type Specimen = { id: string; photo: PhotoRef; rect: Rect; caption: string };
export type Note = { at: Pt; label: { x: number; y: number; w: number }; title: string; text: string };

export const RED_TITLE: Rect = { x: 240, y: 170, w: 1380, h: 500 };
export const RED_SPECIMENS: Specimen[] = [
  { id: "red-chip", photo: PHOTOS.redChip, rect: { x: 240, y: 720, w: 700, h: 760 }, caption: "A raw chip of heartwood" },
  { id: "red-grain", photo: PHOTOS.redGrain, rect: { x: 1020, y: 720, w: 600, h: 440 }, caption: "Grain, close up" },
  { id: "red-powder", photo: PHOTOS.redPowder, rect: { x: 1720, y: 700, w: 440, h: 560 }, caption: "Milled heartwood" },
];
export const RED_NOTES: Note[] = [
  { at: [567, 1085], label: { x: 1020, y: 1230, w: 300 }, title: "Heartwood", text: "Deep red, nearly black where it is oldest." },
  { at: [704, 1146], label: { x: 1020, y: 1380, w: 300 }, title: "Weight", text: "Dense and heavy for its size. Cool in the hand." },
  { at: [1480, 960], label: { x: 1360, y: 1230, w: 280 }, title: "Grain", text: "Fine and close. It polishes with oil and handling." },
  { at: [1940, 1000], label: { x: 1720, y: 1310, w: 440 }, title: "Scent", text: "Almost none. Milled, it turns brick red." },
];

export const WHITE_TITLE: Rect = { x: 5660, y: 170, w: 1360, h: 520 };
export const WHITE_SPECIMENS: Specimen[] = [
  { id: "white-log", photo: PHOTOS.whiteLog, rect: { x: 4820, y: 200, w: 740, h: 560 }, caption: "A cut log, heartwood and sapwood" },
  { id: "white-beads", photo: PHOTOS.whiteBeads, rect: { x: 4820, y: 1000, w: 420, h: 420 }, caption: "Turned beads" },
  { id: "white-powder", photo: PHOTOS.whitePowder, rect: { x: 5660, y: 760, w: 560, h: 440 }, caption: "Milled heartwood" },
  { id: "white-ritual", photo: PHOTOS.whiteRitual, rect: { x: 6300, y: 760, w: 660, h: 500 }, caption: "Offered in clay bowls, pale beside red" },
];
export const WHITE_NOTES: Note[] = [
  { at: [5217, 452], label: { x: 5150, y: 800, w: 400 }, title: "Heartwood", text: "The darker centre. This is where the oil is." },
  { at: [5020, 508], label: { x: 4820, y: 800, w: 290 }, title: "Sapwood", text: "Pale, with little scent." },
  { at: [5067, 1233], label: { x: 5280, y: 1080, w: 300 }, title: "On the skin", text: "As beads it keeps a faint scent when worn." },
  { at: [5940, 958], label: { x: 5660, y: 1240, w: 560 }, title: "Fragrance", text: "Pale gold, and fragrant even as powder." },
  { at: [6793, 1010], label: { x: 6560, y: 1300, w: 400 }, title: "Oil", text: "Distilled from the heartwood. Red sandalwood carries none." },
];

/* ---------------- the collection ---------------- */
export const COLLECTION_HEAD: Rect = { x: 1900, y: 1840, w: 1640, h: 200 };

export type CardPos = { x: number; y: number; w: number; rot: number };
export const CARD_POS: Record<string, CardPos> = {
  "key-fob": { x: 1900, y: 2230, w: 250, rot: -1.6 },
  "coaster-pair": { x: 2220, y: 2190, w: 290, rot: 1.2 },
  "incense-holder": { x: 2580, y: 2270, w: 280, rot: -0.8 },
  "japa-mala": { x: 2970, y: 2180, w: 340, rot: 0.9 },
  "bead-bracelet": { x: 3380, y: 2260, w: 270, rot: -1.4 },
  "heartwood-powder": { x: 3760, y: 2210, w: 280, rot: 1.1 },
  "presentation-box": { x: 4150, y: 2180, w: 330, rot: -0.7 },
  "grain-pendant": { x: 4590, y: 2240, w: 300, rot: 1.5 },
  cufflinks: { x: 4960, y: 2190, w: 290, rot: -1.2 },
  "heartwood-oil": { x: 5100, y: 1560, w: 290, rot: 1 },
  "vault-cuff": { x: 5300, y: 2760, w: 330, rot: -0.6 },
};
export const cardH = (w: number) => Math.round(w * 1.25 + 136);
export const cardRect = (slug: string): Rect => {
  const p = CARD_POS[slug];
  return { x: p.x, y: p.y, w: p.w, h: cardH(p.w) };
};

export const CATEGORY_LABELS: { key: CategoryKey; x: number; w: number }[] = [
  { key: "objects", x: 1900, w: 880 },
  { key: "beads", x: 2970, w: 680 },
  { key: "powder", x: 3760, w: 360 },
  { key: "gifting", x: 4150, w: 400 },
  { key: "jewellery", x: 4590, w: 660 },
];
export const CATEGORY_Y = 2066;
export const OIL_NOTE: Rect = { x: 5440, y: 1600, w: 360, h: 260 };
export const categoryOf = (k: CategoryKey) => CATEGORIES.find((c) => c.key === k)!;

/* Detail card that opens beside a product card. */
export const DETAIL_W = 780;
export const DETAIL_H = 640;
export function detailRect(slug: string): Rect {
  const c = cardRect(slug);
  const right = c.x + c.w + 56 + DETAIL_W <= BOARD.w - 40;
  const x = right ? c.x + c.w + 56 : c.x - 56 - DETAIL_W;
  const y = Math.max(60, Math.min(c.y - 30, BOARD.h - DETAIL_H - 60));
  return { x, y, w: DETAIL_W, h: DETAIL_H };
}
export function union(a: Rect, b: Rect): Rect {
  const x = Math.min(a.x, b.x);
  const y = Math.min(a.y, b.y);
  return { x, y, w: Math.max(a.x + a.w, b.x + b.w) - x, h: Math.max(a.y + a.h, b.y + b.h) - y };
}

/* ---------------- the making ---------------- */
export const MAKING_QUOTE: Rect = { x: 200, y: 1780, w: 960, h: 420 };
export const MAKING_PHOTO: Rect = { x: 1220, y: 1760, w: 560, h: 680 };
export const MAKING_HEAD: Rect = { x: 200, y: 2250, w: 960, h: 220 };
export const LEGEND: Rect = { x: 200, y: 3240, w: 560, h: 440 };

export type Step = {
  n: number;
  name: string;
  text: string;
  photo: { red: PhotoRef; white: PhotoRef };
  rect: Rect;
};
const STEP_W = 420;
const STEP_H = 520;
export const STEPS: Step[] = [
  {
    n: 1,
    name: "Select",
    text: "The artisan reads the grain and chooses the piece before any cut is made.",
    photo: { red: PHOTOS.redGrain, white: PHOTOS.whiteLog },
    rect: { x: 200, y: 2560, w: STEP_W, h: STEP_H },
  },
  {
    n: 2,
    name: "Shape",
    text: "Cut, turned or carved by hand, following the grain rather than fighting it.",
    photo: { red: PHOTOS.carving, white: PHOTOS.carving },
    rect: { x: 820, y: 2820, w: STEP_W, h: STEP_H },
  },
  {
    n: 3,
    name: "Finish",
    text: "Sanded smooth, then rubbed with natural oil. Beads are polished one at a time.",
    photo: { red: PHOTOS.turned, white: PHOTOS.woodRounds },
    rect: { x: 1440, y: 2640, w: STEP_W, h: STEP_H },
  },
  {
    n: 4,
    name: "Inspect",
    text: "Checked in the hand for cracks, fit and finish, then given its batch number.",
    photo: { red: PHOTOS.malaHand, white: PHOTOS.malaHand },
    rect: { x: 2060, y: 2960, w: STEP_W, h: STEP_H },
  },
  {
    n: 5,
    name: "Present",
    text: "Wrapped in cotton or linen, boxed, and sent with its record.",
    photo: { red: PHOTOS.boxRed, white: PHOTOS.giftLinen },
    rect: { x: 2680, y: 2880, w: STEP_W, h: STEP_H },
  },
];

/* ---------------- provenance, vault, gifting, circle, credits ---------------- */
export const RECORD: Rect = { x: 3330, y: 2880, w: 820, h: 840 };
export const VAULT_HEAD: Rect = { x: 4380, y: 2860, w: 880, h: 230 };
export const VAULT_RING = { cx: 4790, cy: 3420, r: 262, token: 34 };
export const VAULT_NOTE: Rect = { x: 5300, y: 3360, w: 420, h: 220 };
export const GIFTING: Rect = { x: 5440, y: 1960, w: 1520, h: 560 };
export const CIRCLE: Rect = { x: 5800, y: 2640, w: 1060, h: 460 };
export const CREDITS: Rect = { x: 5800, y: 3280, w: 1060, h: 380 };

export const RECORD_EXAMPLE = {
  red: {
    piece: "Japa Mala, 108 beads",
    wood: "Red sandalwood",
    latin: "Pterocarpus santalinus",
    origin: "Eastern Ghats, Andhra Pradesh",
    batch: "R-26-0412",
    artisan: "S. K.",
    finished: "18 November 2026",
  },
  white: {
    piece: "Japa Mala, 108 beads",
    wood: "White sandalwood",
    latin: "Santalum album",
    origin: "Southern India, worked in Mysuru",
    batch: "W-26-0187",
    artisan: "M. R.",
    finished: "12 November 2026",
  },
} as const;

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

export const ROUTES = {
  red: (() => {
    const [x, y] = PIN_WORLD.red;
    const end = RED_ORIGIN.x + RED_ORIGIN.w;
    const ey = RED_ORIGIN.y + 210;
    return `M${x} ${y} C${x - 40} ${y - 170} ${x - 330} ${ey - 40} ${end + 8} ${ey}`;
  })(),
  redOut: `M${RED_ORIGIN.x - 8} ${RED_ORIGIN.y + 210} C${RED_ORIGIN.x - 160} ${RED_ORIGIN.y + 210} ${2300} 1000 ${2168} 1000`,
  white: (() => {
    const [x, y] = PIN_WORLD.white;
    const ey = WHITE_ORIGIN.y + 210;
    return `M${x} ${y} C${x + 50} ${y + 230} ${WHITE_ORIGIN.x - 320} ${ey + 140} ${WHITE_ORIGIN.x - 8} ${ey}`;
  })(),
  whiteOut: `M${WHITE_ORIGIN.x + WHITE_ORIGIN.w + 8} ${WHITE_ORIGIN.y + 210} C${4740} ${WHITE_ORIGIN.y + 210} ${4760} 1230 ${4812} 1230`,
  oil: `M${OIL_NOTE.x + 120} ${OIL_NOTE.y - 14} C${OIL_NOTE.x + 120} 1480 ${6793} 1520 ${6793} 1420`,
};

const centre = (r: Rect): Pt => [r.x + r.w / 2, r.y + r.h / 2];
export const MAKING_PATH = smooth([
  [MAKING_HEAD.x + 210, MAKING_HEAD.y + 200],
  centre(STEPS[0].rect),
  centre(STEPS[1].rect),
  centre(STEPS[2].rect),
  centre(STEPS[3].rect),
  centre(STEPS[4].rect),
  [RECORD.x - 10, RECORD.y + 300],
]);

/** Soft topographic contours behind each wood region. Deterministic. */
function blob(cx: number, cy: number, rx: number, ry: number, phase: number, n = 16): string {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const k = 1 + 0.07 * Math.sin(3 * a + phase) + 0.045 * Math.sin(5 * a + phase * 1.7) + 0.025 * Math.cos(7 * a - phase);
    pts.push([cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k]);
  }
  return smooth(pts, true);
}
export const CONTOURS = {
  red: [0, 1, 2, 3].map((i) => blob(1190, 870, 1180 - i * 120, 780 - i * 92, 0.6 + i * 0.35)),
  white: [0, 1, 2, 3].map((i) => blob(5900, 830, 1230 - i * 120, 760 - i * 92, 2.2 + i * 0.3)),
};

/* ---------------- tour and search ---------------- */
export type Waypoint = { id: string; title: string; caption: string; rect: Rect };
export const WAYPOINTS: Waypoint[] = [
  {
    id: "start",
    title: "The board",
    caption: "Everything the house makes, the two woods it comes from and how each piece is recorded, on one board.",
    rect: { x: 2480, y: 110, w: 2240, h: 1180 },
  },
  {
    id: "map",
    title: "Two woods, two places",
    caption: "Red sandalwood from the Eastern Ghats. White sandalwood from the dry forests of the south, worked in Mysuru.",
    rect: { x: 2520, y: 820, w: 2200, h: 1040 },
  },
  {
    id: "red",
    title: "Red sandalwood",
    caption: "Pterocarpus santalinus. Deep red, dense, fine-grained, with almost no scent.",
    rect: { x: 200, y: 150, w: 2000, h: 1360 },
  },
  {
    id: "white",
    title: "White sandalwood",
    caption: "Santalum album. Pale gold and fragrant. The oil is in the heartwood.",
    rect: { x: 4790, y: 150, w: 2220, h: 1300 },
  },
  {
    id: "collection",
    title: "The collection",
    caption: "Eleven families. Those made in both woods sit between the two regions; the oil sits on the white side.",
    rect: { x: 1860, y: 1820, w: 3440, h: 940 },
  },
  {
    id: "making",
    title: "The making",
    caption: "Select, shape, finish, inspect, present. The wood decides what it will become. The hand follows.",
    rect: { x: 180, y: 1740, w: 2960, h: 1760 },
  },
  {
    id: "provenance",
    title: "Know what you hold",
    caption: "Every piece leaves with a record like this one: wood, origin, batch, the artisan and the date.",
    rect: { x: 3290, y: 2840, w: 900, h: 900 },
  },
  {
    id: "vault",
    title: "The 2011 Vault",
    caption: "Twenty-one numbered cuffs, turned from heartwood sourced in 2011.",
    rect: { x: 4340, y: 2720, w: 1420, h: 1080 },
  },
  {
    id: "gifting",
    title: "Give something that remains",
    caption: "Gifting, and the Santalum Circle: occasional letters from the house.",
    rect: { x: 5400, y: 1900, w: 1620, h: 1300 },
  },
];
export const waypoint = (id: string) => WAYPOINTS.find((w) => w.id === id)!;

export type SearchItem = { key: string; label: string; hint: string; terms: string; target: { slug: string } | { rect: Rect } };

export const SEARCH: SearchItem[] = [
  ...FAMILIES.map(
    (f: Family): SearchItem => ({
      key: f.slug,
      label: f.name,
      hint: categoryOf(f.category).label,
      terms: `${f.name} ${f.category} ${categoryOf(f.category).label} ${f.summary} ${f.level}`.toLowerCase(),
      target: { slug: f.slug },
    }),
  ),
  ...WAYPOINTS.map(
    (w): SearchItem => ({ key: `wp-${w.id}`, label: w.title, hint: "Section", terms: `${w.title} ${w.caption}`.toLowerCase(), target: { rect: w.rect } }),
  ),
  ...STEPS.map(
    (s): SearchItem => ({
      key: `step-${s.n}`,
      label: s.name,
      hint: `Making, step ${s.n}`,
      terms: `${s.name} making ${s.text}`.toLowerCase(),
      target: { rect: { x: s.rect.x - 80, y: s.rect.y - 80, w: s.rect.w + 160, h: s.rect.h + 160 } },
    }),
  ),
  {
    key: "record",
    label: "Example batch record",
    hint: "Provenance",
    terms: "record batch provenance evidence certificate registry r-26-0412 w-26-0187",
    target: { rect: { x: RECORD.x - 60, y: RECORD.y - 60, w: RECORD.w + 120, h: RECORD.h + 120 } },
  },
  {
    key: "circle",
    label: "The Santalum Circle",
    hint: "Letters from the house",
    terms: "circle newsletter letters email sign up join",
    target: { rect: { x: CIRCLE.x - 80, y: CIRCLE.y - 80, w: CIRCLE.w + 160, h: CIRCLE.h + 160 } },
  },
  {
    key: "cites",
    label: "CITES Appendix II",
    hint: "Red sandalwood",
    terms: "cites appendix regulation trade law",
    target: { rect: { x: CITES.x - 60, y: CITES.y - 60, w: CITES.w + 120, h: CITES.h + 120 } },
  },
  {
    key: "mysuru",
    label: "Mysuru, Karnataka",
    hint: "White sandalwood",
    terms: "mysuru mysore karnataka origin",
    target: { rect: { x: WHITE_ORIGIN.x - 60, y: WHITE_ORIGIN.y - 60, w: WHITE_ORIGIN.w + 120, h: WHITE_ORIGIN.h + 120 } },
  },
  {
    key: "ghats",
    label: "Eastern Ghats, Andhra Pradesh",
    hint: "Red sandalwood",
    terms: "eastern ghats andhra pradesh origin",
    target: { rect: { x: RED_ORIGIN.x - 60, y: RED_ORIGIN.y - 60, w: RED_ORIGIN.w + 120, h: RED_ORIGIN.h + 120 } },
  },
];

/* ---------------- minimap shapes ---------------- */
export type MiniShape = { r: Rect; kind: "photo" | "card" | "text" };
export const MINI_SHAPES: MiniShape[] = [
  { r: TITLE, kind: "text" },
  { r: RED_TITLE, kind: "text" },
  { r: WHITE_TITLE, kind: "text" },
  { r: RED_ORIGIN, kind: "card" },
  { r: CITES, kind: "card" },
  { r: WHITE_ORIGIN, kind: "card" },
  { r: TEMPLE, kind: "photo" },
  ...RED_SPECIMENS.map((s) => ({ r: s.rect, kind: "photo" as const })),
  ...WHITE_SPECIMENS.map((s) => ({ r: s.rect, kind: "photo" as const })),
  ...FAMILIES.map((f) => ({ r: cardRect(f.slug), kind: "card" as const })),
  { r: MAKING_PHOTO, kind: "photo" },
  { r: MAKING_QUOTE, kind: "text" },
  { r: MAKING_HEAD, kind: "text" },
  { r: LEGEND, kind: "card" },
  { r: VAULT_HEAD, kind: "text" },
  ...STEPS.map((s) => ({ r: s.rect, kind: "card" as const })),
  { r: RECORD, kind: "card" },
  { r: GIFTING, kind: "card" },
  { r: CIRCLE, kind: "card" },
  { r: CREDITS, kind: "card" },
];

/** Care notes per category (general guidance, not claims). */
export const CARE_OIL = "Keep the vial sealed and upright, away from light and heat. Patch-test before use on skin.";
export const careFor = (f: Family) => (f.slug === "heartwood-oil" ? CARE_OIL : CARE[f.category]);
export const CARE: Record<CategoryKey, string> = {
  objects: "Wipe with a soft dry cloth. Rub in a drop of natural oil once a season. Keep out of standing water.",
  beads: "Keep dry; take off before bathing or swimming. Store in the pouch when not worn.",
  powder: "Keep the jar closed, away from heat and damp. Patch-test before use on skin.",
  gifting: "Dust with a soft dry cloth. Keep out of direct sun so the wood colours evenly.",
  jewellery: "Wipe the wood with a soft dry cloth and keep perfume off it. Polish silver separately.",
};
