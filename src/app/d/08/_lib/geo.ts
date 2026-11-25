import type { Wood } from "@/lib/wood";

/**
 * Hand-traced geography for the Atlas. Equirectangular projections, scaled by cos(latitude)
 * so shapes keep their proportions. Two kinds of map:
 *  - a regional plate per wood (the board's centre): red on the Eastern Ghats, white on Mysuru;
 *  - one subcontinent sheet for order routes (coastlines only, no political borders: the land fades out to the north).
 */

export type Pt = [number, number];
export type LonLat = [number, number];

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Catmull-Rom spline through the points, as cubic Bézier segments. */
export function smooth(pts: Pt[], closed = false): string {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r1(pts[0][0])} ${r1(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r1(c1[0])} ${r1(c1[1])} ${r1(c2[0])} ${r1(c2[1])} ${r1(p2[0])} ${r1(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

export type Proj = (ll: LonLat) => Pt;

/** A projection whose frame (w × h px) is centred on a point, at k px per degree of latitude. */
export function frameProj(center: LonLat, k: number, w: number, h: number): Proj {
  const kx = k * Math.cos((center[1] * Math.PI) / 180);
  const lon0 = center[0] - w / (2 * kx);
  const lat0 = center[1] + h / (2 * k);
  return ([lon, lat]) => [(lon - lon0) * kx, (lat0 - lat) * k];
}

/* ---------------- coastlines (lon, lat) ---------------- */

/** Peninsular coast, Gulf of Khambhat round the cape to the Sundarbans. */
const COAST: LonLat[] = [
  [72.6, 22.0], [72.75, 21.1], [72.85, 20.4], [72.78, 19.6], [72.85, 18.95], [73.0, 18.3], [73.25, 17.5],
  [73.45, 16.7], [73.7, 15.9], [73.85, 15.3], [74.1, 14.8], [74.45, 14.05], [74.7, 13.3], [74.85, 12.85],
  [75.15, 12.25], [75.45, 11.8], [75.8, 11.25], [75.95, 10.8], [76.2, 10.2], [76.3, 9.6], [76.55, 8.9],
  [76.95, 8.45], [77.3, 8.2], [77.55, 8.08], [77.85, 8.3], [78.15, 8.75], [78.45, 9.1], [79.0, 9.25],
  [79.3, 9.3], [79.05, 9.6], [78.95, 9.85], [79.2, 10.15], [79.55, 10.3], [79.85, 10.35], [79.85, 10.8],
  [79.82, 11.4], [79.8, 11.95], [80.15, 12.6], [80.3, 13.1], [80.25, 13.6], [80.15, 14.3], [80.15, 14.9],
  [80.4, 15.5], [80.95, 15.8], [81.2, 16.2], [81.7, 16.35], [82.3, 16.6], [82.3, 17.0], [82.85, 17.35],
  [83.3, 17.7], [83.9, 18.15], [84.5, 18.8], [85.1, 19.3], [85.85, 19.8], [86.4, 20.15], [86.85, 20.75],
  [87.05, 21.3], [87.5, 21.6], [88.0, 21.65],
];

/** West of the peninsula: the Indus delta, Kutch and Saurashtra, into the head of the Gulf of Khambhat. */
const COAST_WEST: LonLat[] = [
  [66.2, 25.45], [66.9, 24.85], [67.35, 24.4], [67.6, 24.0], [67.95, 23.75], [68.25, 23.6], [68.6, 23.3],
  [68.85, 23.05], [69.3, 22.85], [69.75, 22.82], [70.15, 22.98], [70.45, 22.85], [70.15, 22.55], [69.8, 22.45],
  [69.2, 22.42], [68.98, 22.25], [69.3, 21.92], [69.62, 21.6], [70.1, 21.15], [70.4, 20.9], [70.95, 20.72],
  [71.45, 20.85], [71.85, 21.15], [72.15, 21.7], [72.38, 22.15], [72.55, 22.3],
];

/** East of the Sundarbans: the Bengal delta and the Arakan coast. */
const COAST_EAST: LonLat[] = [
  [88.6, 21.6], [89.1, 21.75], [89.7, 21.85], [90.3, 21.9], [90.6, 22.2], [90.9, 22.55], [91.4, 22.5],
  [91.8, 22.25], [91.95, 21.5], [92.3, 20.85], [92.85, 20.2], [93.4, 19.5], [94.0, 18.8], [94.4, 18.0],
  [94.6, 17.2], [94.7, 16.4],
];

const LANKA: LonLat[] = [
  [79.95, 9.82], [80.3, 9.75], [80.85, 9.0], [81.25, 8.55], [81.4, 8.15], [81.8, 7.45], [81.9, 6.95],
  [81.65, 6.45], [81.2, 6.15], [80.6, 5.95], [80.1, 6.2], [79.85, 6.9], [79.8, 7.6], [79.85, 8.2],
  [79.75, 8.65], [80.0, 9.25],
];

const ANDAMAN: LonLat[] = [
  [92.85, 13.65], [93.0, 13.1], [92.95, 12.5], [92.8, 11.9], [92.7, 11.4], [92.6, 10.9], [92.5, 10.6],
];

const WESTERN_GHATS: LonLat[] = [
  [73.55, 21.0], [73.6, 19.5], [73.65, 18.2], [73.85, 17.0], [74.05, 15.9], [74.4, 14.9], [74.95, 13.6],
  [75.5, 12.6], [76.2, 11.5], [76.9, 10.4], [77.15, 9.5], [77.3, 8.7],
];

const EASTERN_GHATS: LonLat[] = [
  [78.3, 11.9], [78.6, 12.7], [78.95, 13.4], [79.25, 13.9], [79.35, 14.6], [79.45, 15.4], [79.95, 16.2],
  [80.9, 17.1], [81.9, 17.9], [82.8, 18.6], [83.6, 19.3], [84.4, 20.0], [85.0, 20.6],
];

/** The land: the whole coast, closed far to the north (the north is faded out, never drawn as a border). */
function landPath(p: Proj) {
  const pts = [...COAST_WEST, ...COAST, ...COAST_EAST].map(p);
  const ne = p([98, 16.4]);
  const n1 = p([98, 40]);
  const n2 = p([65, 40]);
  const w = p([65, 25.45]);
  return `${smooth(pts)} L${r1(ne[0])} ${r1(ne[1])} L${r1(n1[0])} ${r1(n1[1])} L${r1(n2[0])} ${r1(n2[1])} L${r1(w[0])} ${r1(w[1])} Z`;
}

/** Hachures (short ticks across a ridge line), the old cartographer's way of drawing hills. */
function hachures(p: Proj, pts: LonLat[], step = 9, size = 1): string {
  const q = pts.map(p);
  let d = "";
  let carry = 0;
  let k = 0;
  for (let i = 0; i < q.length - 1; i++) {
    const [x0, y0] = q[i];
    const [x1, y1] = q[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const tx = (x1 - x0) / len;
    const ty = (y1 - y0) / len;
    for (let s = carry; s < len; s += step) {
      const x = x0 + tx * s;
      const y = y0 + ty * s;
      const side = k % 2 === 0 ? 1 : -1;
      const l = (7 + 5 * Math.abs(Math.sin(k * 1.7))) * size;
      const nx = -ty * side;
      const ny = tx * side;
      d += `M${r1(x + nx * 2 * size)} ${r1(y + ny * 2 * size)}L${r1(x + nx * l)} ${r1(y + ny * l)}`;
      k++;
    }
    carry = (carry + step - (len % step)) % step;
  }
  return d;
}

/* ---------------- regional plates, one per wood ---------------- */

export const MAP_W = 927;
export const MAP_H = 990;

type Label = { text: string; at: LonLat; size: number; kind: "sea" | "state" | "hills" | "range"; rotate?: number; anchor?: "start" | "middle" | "end" };
type City = { name: string; at: LonLat; dx: number; dy: number; anchor?: "start" | "end" };

type RegionDef = {
  center: LonLat;
  k: number;
  pin: LonLat;
  pinLabel: string;
  pinSub: string;
  /** Where the tree grows, roughly. Drawn hatched and labelled as approximate. */
  range: LonLat[];
  cities: City[];
  labels: Label[];
  ridge: "east" | "west";
};

const REGION_DEFS: Record<Wood, RegionDef> = {
  red: {
    center: [79.45, 14.4],
    k: 120,
    pin: [79.15, 13.85],
    pinLabel: "Seshachalam hills",
    pinSub: "Red sandalwood",
    range: [
      [78.5, 13.5], [78.95, 13.25], [79.5, 13.35], [79.78, 13.8], [79.6, 14.4], [79.52, 15.0], [79.35, 15.6],
      [78.95, 15.85], [78.6, 15.4], [78.42, 14.75], [78.4, 14.1],
    ],
    cities: [
      { name: "Tirupati", at: [79.42, 13.63], dx: 12, dy: 18 },
      { name: "Kadapa", at: [78.82, 14.47], dx: -12, dy: 5, anchor: "end" },
      { name: "Nellore", at: [79.99, 14.44], dx: 12, dy: 5 },
      { name: "Chennai", at: [80.27, 13.08], dx: 12, dy: 5 },
      { name: "Bengaluru", at: [77.59, 12.97], dx: 12, dy: 5 },
      { name: "Vellore", at: [79.13, 12.92], dx: 12, dy: 5 },
      { name: "Kurnool", at: [78.04, 15.83], dx: 12, dy: 5 },
      { name: "Hyderabad", at: [78.47, 17.39], dx: 12, dy: 5 },
    ],
    labels: [
      { text: "Bay of Bengal", at: [81.9, 14.2], size: 26, kind: "sea", anchor: "middle" },
      { text: "Andhra Pradesh", at: [80.35, 16.85], size: 22, kind: "state", anchor: "middle" },
      { text: "Tamil Nadu", at: [78.6, 11.45], size: 22, kind: "state", anchor: "middle" },
      { text: "Karnataka", at: [76.55, 14.8], size: 22, kind: "state", anchor: "middle" },
      { text: "Palakonda", at: [78.55, 14.2], size: 16, kind: "range", rotate: -62, anchor: "middle" },
      { text: "Veligonda", at: [79.72, 15.0], size: 16, kind: "range", rotate: -80, anchor: "middle" },
      { text: "Nallamala", at: [78.85, 16.15], size: 16, kind: "range", rotate: -55, anchor: "middle" },
      { text: "Eastern Ghats", at: [80.7, 17.55], size: 18, kind: "hills", rotate: 38, anchor: "middle" },
    ],
    ridge: "east",
  },
  white: {
    center: [76.4, 13.9],
    k: 120,
    pin: [76.64, 12.3],
    pinLabel: "Mysuru",
    pinSub: "White sandalwood",
    range: [
      [75.15, 14.35], [76.1, 14.7], [77.2, 14.3], [78.15, 13.5], [78.5, 12.6], [78.05, 11.75], [77.45, 11.3],
      [77.35, 10.45], [77.0, 10.15], [76.6, 10.65], [76.45, 11.55], [75.8, 11.95], [75.3, 12.75], [75.05, 13.6],
    ],
    cities: [
      { name: "Bengaluru", at: [77.59, 12.97], dx: 12, dy: 5 },
      { name: "Mangaluru", at: [74.86, 12.91], dx: -12, dy: 5, anchor: "end" },
      { name: "Shivamogga", at: [75.57, 13.93], dx: 12, dy: 5 },
      { name: "Hassan", at: [76.1, 13.0], dx: 12, dy: -6 },
      { name: "Madikeri", at: [75.74, 12.42], dx: -12, dy: 18, anchor: "end" },
      { name: "Chamarajanagar", at: [76.94, 11.92], dx: 12, dy: 18 },
      { name: "Marayur", at: [77.16, 10.27], dx: 12, dy: 5 },
      { name: "Hubballi", at: [75.12, 15.36], dx: 12, dy: 5 },
      { name: "Panaji", at: [73.83, 15.49], dx: 12, dy: 5 },
    ],
    labels: [
      { text: "Arabian Sea", at: [73.2, 12.0], size: 26, kind: "sea", rotate: -72, anchor: "middle" },
      { text: "Karnataka", at: [76.6, 15.9], size: 24, kind: "state", anchor: "middle" },
      { text: "Kerala", at: [76.0, 10.4], size: 20, kind: "state", anchor: "middle" },
      { text: "Tamil Nadu", at: [78.6, 11.2], size: 20, kind: "state", anchor: "middle" },
      { text: "Andhra Pradesh", at: [78.9, 15.3], size: 20, kind: "state", anchor: "middle" },
      { text: "Western Ghats", at: [74.75, 14.95], size: 18, kind: "hills", rotate: 64, anchor: "middle" },
      { text: "Biligirirangan hills", at: [77.35, 12.05], size: 15, kind: "range", rotate: -20, anchor: "start" },
      { text: "Deccan plateau", at: [77.75, 16.9], size: 18, kind: "range", anchor: "middle" },
    ],
    ridge: "west",
  },
};

export type RegionMapData = {
  w: number;
  h: number;
  land: string;
  lanka: string;
  westHills: string;
  eastHills: string;
  range: string;
  pin: Pt;
  pinLabel: string;
  pinSub: string;
  pinLonLat: LonLat;
  cities: { name: string; at: Pt; dx: number; dy: number; anchor?: "start" | "end" }[];
  labels: (Omit<Label, "at"> & { at: Pt })[];
  grat: { lats: { lat: number; y: number }[]; lons: { lon: number; x: number }[] };
  ticks: { x: number[]; y: number[] };
  scale: { at: Pt; len: number; km: number };
  north: Pt;
  ridge: "east" | "west";
};

function buildRegion(wood: Wood): RegionMapData {
  const d = REGION_DEFS[wood];
  const p = frameProj(d.center, d.k, MAP_W, MAP_H);
  const kx = d.k * Math.cos((d.center[1] * Math.PI) / 180);
  const lonMin = d.center[0] - MAP_W / (2 * kx);
  const latMax = d.center[1] + MAP_H / (2 * d.k);
  const latMin = latMax - MAP_H / d.k;
  const lats: number[] = [];
  for (let l = Math.ceil(latMin); l <= Math.floor(latMax); l++) if (l % 2 === 0) lats.push(l);
  const lons: number[] = [];
  for (let l = Math.ceil(lonMin); l <= Math.floor(lonMin + MAP_W / kx); l++) if (l % 2 === 0) lons.push(l);
  const tx: number[] = [];
  for (let l = Math.ceil(lonMin * 2) / 2; l <= lonMin + MAP_W / kx; l += 0.5) tx.push(p([l, d.center[1]])[0]);
  const ty: number[] = [];
  for (let l = Math.ceil(latMin * 2) / 2; l <= latMax; l += 0.5) ty.push(p([d.center[0], l])[1]);
  const km = 100;
  return {
    w: MAP_W,
    h: MAP_H,
    land: landPath(p),
    lanka: smooth(LANKA.map(p), true),
    westHills: hachures(p, WESTERN_GHATS, 10, 1.15),
    eastHills: hachures(p, EASTERN_GHATS, 10, 1.15),
    range: smooth(d.range.map(p), true),
    pin: p(d.pin),
    pinLabel: d.pinLabel,
    pinSub: d.pinSub,
    pinLonLat: d.pin,
    cities: d.cities.map((c) => ({ ...c, at: p(c.at) })),
    labels: d.labels.map((l) => ({ ...l, at: p(l.at) })),
    grat: { lats: lats.map((lat) => ({ lat, y: p([d.center[0], lat])[1] })), lons: lons.map((lon) => ({ lon, x: p([lon, d.center[1]])[0] })) },
    ticks: { x: tx, y: ty },
    scale: { at: [MAP_W - 260, MAP_H - 70], len: (km / 111) * d.k, km },
    north: [MAP_W - 70, 120],
    ridge: d.ridge,
  };
}

export const REGION: Record<Wood, RegionMapData> = { red: buildRegion("red"), white: buildRegion("white") };

/** "13.85° N, 79.15° E" */
export function coordLabel([lon, lat]: LonLat) {
  return `${lat.toFixed(2)}° N, ${lon.toFixed(2)}° E`;
}

/* ---------------- the subcontinent sheet, for order routes ---------------- */

/** Global projection for route maps: 60 px per degree of latitude, scaled at 20° N. */
export const SHEET_K = 60;
const SHEET_KX = SHEET_K * Math.cos((20 * Math.PI) / 180);
const SHEET_LON0 = 65;
const SHEET_LAT0 = 40;
export const sheet: Proj = ([lon, lat]) => [(lon - SHEET_LON0) * SHEET_KX, (SHEET_LAT0 - lat) * SHEET_K];
export const SHEET_KX_ = SHEET_KX;

export const SHEET = {
  land: landPath(sheet),
  lanka: smooth(LANKA.map(sheet), true),
  andaman: smooth(ANDAMAN.map(sheet)),
  westHills: hachures(sheet, WESTERN_GHATS, 8, 0.7),
  eastHills: hachures(sheet, EASTERN_GHATS, 8, 0.7),
  /** Land fades out north of these latitudes, and at the far west and east. */
  fade: { n0: sheet([80, 30.5])[1], n1: sheet([80, 35.5])[1], w0: sheet([66.5, 20])[0], w1: sheet([68.2, 20])[0], e0: sheet([93.6, 20])[0], e1: sheet([96.5, 20])[0] },
  seas: [
    { text: "Arabian Sea", at: sheet([66.8, 16.5]) },
    { text: "Bay of Bengal", at: sheet([87.2, 15.5]) },
    { text: "Indian Ocean", at: sheet([76.5, 4.8]) },
  ],
};
