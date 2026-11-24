/**
 * A simplified, hand-traced map of peninsular India (south of 22°N) for the Atlas board.
 * Equirectangular, scaled by cos(15°) so the peninsula keeps its shape. All values are map-local px.
 */

export type Pt = [number, number];

const K = 60; // px per degree of latitude
const KX = K * Math.cos((15 * Math.PI) / 180);
const LON0 = 72;
const LAT0 = 22;

export const MAP_W = Math.round(16 * KX); // 72°E → 88°E
export const MAP_H = Math.round(16.5 * K); // 22°N → 5.5°N

export const proj = (lon: number, lat: number): Pt => [(lon - LON0) * KX, (LAT0 - lat) * K];

const r = (n: number) => Math.round(n * 10) / 10;

/** Catmull-Rom spline through the points, as cubic Bézier segments. */
export function smooth(pts: Pt[], closed = false): string {
  const n = pts.length;
  const at = (i: number) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M${r(pts[0][0])} ${r(pts[0][1])}`;
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = at(i - 1);
    const p1 = at(i);
    const p2 = at(i + 1);
    const p3 = at(i + 2);
    const c1: Pt = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: Pt = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${r(c1[0])} ${r(c1[1])} ${r(c2[0])} ${r(c2[1])} ${r(p2[0])} ${r(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/* Coastline, Gulf of Khambhat round the cape to the Sundarbans (lon, lat). */
const COAST: Pt[] = [
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

const LANKA: Pt[] = [
  [79.95, 9.82], [80.3, 9.75], [80.85, 9.0], [81.25, 8.55], [81.4, 8.15], [81.8, 7.45], [81.9, 6.95],
  [81.65, 6.45], [81.2, 6.15], [80.6, 5.95], [80.1, 6.2], [79.85, 6.9], [79.8, 7.6], [79.85, 8.2],
  [79.75, 8.65], [80.0, 9.25],
];

const WESTERN_GHATS: Pt[] = [
  [73.55, 21.0], [73.6, 19.5], [73.65, 18.2], [73.85, 17.0], [74.05, 15.9], [74.4, 14.9], [74.95, 13.6],
  [75.5, 12.6], [76.2, 11.5], [76.9, 10.4], [77.15, 9.5], [77.3, 8.7],
];

const EASTERN_GHATS: Pt[] = [
  [78.3, 11.9], [78.6, 12.7], [78.95, 13.4], [79.25, 13.9], [79.35, 14.6], [79.45, 15.4], [79.95, 16.2],
  [80.9, 17.1], [81.9, 17.9], [82.8, 18.6], [83.6, 19.3], [84.4, 20.0], [85.0, 20.6],
];

const P = (pts: Pt[]) => pts.map(([lon, lat]) => proj(lon, lat));

export const LAND_PATH = (() => {
  const c = P(COAST);
  const tr = proj(88.6, 22.6);
  const tl = proj(72.4, 22.6);
  return `${smooth(c)} L${r(tr[0])} ${r(c[c.length - 1][1])} L${r(tr[0])} ${r(tr[1])} L${r(tl[0])} ${r(tl[1])} Z`;
})();

export const LANKA_PATH = smooth(P(LANKA), true);

/** Hachures (short ticks across a ridge line), the old cartographer's way of drawing hills. */
function hachures(pts: Pt[], step = 9): string {
  const p = P(pts);
  let d = "";
  let carry = 0;
  let k = 0;
  for (let i = 0; i < p.length - 1; i++) {
    const [x0, y0] = p[i];
    const [x1, y1] = p[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    const tx = (x1 - x0) / len;
    const ty = (y1 - y0) / len;
    for (let s = carry; s < len; s += step) {
      const x = x0 + tx * s;
      const y = y0 + ty * s;
      const side = k % 2 === 0 ? 1 : -1;
      const l = 7 + 5 * Math.abs(Math.sin(k * 1.7));
      const nx = -ty * side;
      const ny = tx * side;
      d += `M${r(x + nx * 2)} ${r(y + ny * 2)}L${r(x + nx * l)} ${r(y + ny * l)}`;
      k++;
    }
    carry = (carry + step - (len % step)) % step;
  }
  return d;
}

export const WESTERN_GHATS_PATH = hachures(WESTERN_GHATS);
export const EASTERN_GHATS_PATH = hachures(EASTERN_GHATS);
export const EASTERN_RIDGE = smooth(P(EASTERN_GHATS));
export const WESTERN_RIDGE = smooth(P(WESTERN_GHATS));

export const PIN = {
  red: proj(79.3, 13.75), // Seshachalam hills, southern Eastern Ghats
  white: proj(76.64, 12.3), // Mysuru
} as const;

export const CITIES: { name: string; at: Pt; dx: number; dy: number }[] = [
  { name: "Bengaluru", at: proj(77.59, 12.97), dx: 10, dy: -8 },
  { name: "Chennai", at: proj(80.27, 13.08), dx: 10, dy: 4 },
  { name: "Hyderabad", at: proj(78.47, 17.39), dx: 10, dy: 4 },
  { name: "Mumbai", at: proj(72.88, 19.08), dx: 10, dy: 4 },
];

export const GRATICULE = {
  lats: [10, 15, 20].map((lat) => ({ lat, y: proj(72, lat)[1] })),
  lons: [75, 80, 85].map((lon) => ({ lon, x: proj(lon, 10)[0] })),
};

/** km → px at this projection (1° of latitude ≈ 111 km). */
export const KM = K / 111;
