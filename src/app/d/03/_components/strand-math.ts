/**
 * The strand: one long cord laid on air, shared by the 3D scene and the page around it.
 * Pure maths (no three.js), so the DOM can know where every bead sits without loading WebGL.
 * Units are scene units measured along the cord (arc length, "s").
 */

export const PLAIN = 108;

/** turn: fraction of a full turn over the segment (+ right, − left). pitch: climb in degrees. side: where the camera rides. */
type Seg = { len: number; turn: number; pitch: number; side: number };

const SEGS: Seg[] = [
  { len: 9, turn: 0.02, pitch: -2, side: -1 },
  { len: 12, turn: -0.12, pitch: -3, side: -1 },
  { len: 13, turn: 0.15, pitch: 2, side: -1 },
  { len: 24, turn: 1.0, pitch: 20, side: -1 }, // a full loop to the right, climbing over itself
  { len: 11, turn: -0.12, pitch: -6, side: 1 },
  { len: 13, turn: -0.2, pitch: -4, side: 1 },
  { len: 24, turn: -1.0, pitch: -20, side: 1 }, // a full loop to the left, falling under itself
  { len: 12, turn: 0.16, pitch: 3, side: -1 },
  { len: 15, turn: 0.28, pitch: 2, side: -1 },
  { len: 11, turn: -0.18, pitch: -1, side: 1 },
  { len: 9, turn: 0.0, pitch: -88, side: 1 }, // the cord drops into the guru bead
];

const STEP = 0.25;

function smooth(a: Float32Array, radius: number, passes = 2) {
  let src = a;
  for (let p = 0; p < passes; p++) {
    const out = new Float32Array(src.length);
    for (let i = 0; i < src.length; i++) {
      let sum = 0;
      let c = 0;
      for (let j = i - radius; j <= i + radius; j++) {
        const k = Math.min(src.length - 1, Math.max(0, j));
        sum += src[k];
        c++;
      }
      out[i] = sum / c;
    }
    src = out;
  }
  return src;
}

function buildPath() {
  const total = SEGS.reduce((a, s) => a + s.len, 0);
  const n = Math.round(total / STEP) + 1;
  const kT = new Float32Array(n);
  const pT = new Float32Array(n);
  const sideT = new Float32Array(n);
  let seg = 0;
  let segStart = 0;
  for (let i = 0; i < n; i++) {
    const s = i * STEP;
    while (seg < SEGS.length - 1 && s >= segStart + SEGS[seg].len) {
      segStart += SEGS[seg].len;
      seg++;
    }
    const g = SEGS[seg];
    kT[i] = (g.turn * Math.PI * 2) / g.len;
    pT[i] = (g.pitch * Math.PI) / 180;
    sideT[i] = g.side;
  }
  const kappa = smooth(kT, 10);
  const pitch = smooth(pT, 12);
  const side = smooth(sideT, 22, 3);

  const pos = new Float32Array(n * 3);
  const yaw = new Float32Array(n);
  let x = 0;
  let y = 0;
  let z = 0;
  let a = 0;
  for (let i = 0; i < n; i++) {
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    yaw[i] = a;
    const cp = Math.cos(pitch[i]);
    x += cp * Math.sin(a) * STEP;
    y += Math.sin(pitch[i]) * STEP;
    z += -cp * Math.cos(a) * STEP;
    a += kappa[i] * STEP;
  }
  return { n, length: (n - 1) * STEP, pos, yaw, kappa, side };
}

export const PATH = buildPath();
export const LENGTH = PATH.length;

export type V3 = [number, number, number];

function idx(s: number) {
  const f = Math.min(PATH.n - 1.0001, Math.max(0, s / STEP));
  const i = Math.floor(f);
  return [i, f - i] as const;
}

/** Point on the designed cord at arc length s (linear between dense samples). */
export function pathPoint(s: number): V3 {
  const [i, t] = idx(s);
  const p = PATH.pos;
  return [
    p[i * 3] + (p[i * 3 + 3] - p[i * 3]) * t,
    p[i * 3 + 1] + (p[i * 3 + 4] - p[i * 3 + 1]) * t,
    p[i * 3 + 2] + (p[i * 3 + 5] - p[i * 3 + 2]) * t,
  ];
}

/** Same as pathPoint, written into an existing vector (no allocation; used every frame). */
export function pointInto<T extends { x: number; y: number; z: number }>(s: number, out: T): T {
  const [i, t] = idx(s);
  const p = PATH.pos;
  out.x = p[i * 3] + (p[i * 3 + 3] - p[i * 3]) * t;
  out.y = p[i * 3 + 1] + (p[i * 3 + 4] - p[i * 3 + 1]) * t;
  out.z = p[i * 3 + 2] + (p[i * 3 + 5] - p[i * 3 + 2]) * t;
  return out;
}

export function railInto<T extends { x: number; y: number; z: number }>(rail: ReturnType<typeof cameraRail>, s: number, out: T): T {
  const [i, t] = idx(s);
  out.x = rail.x[i] + (rail.x[i + 1] - rail.x[i]) * t;
  out.y = rail.y[i] + (rail.y[i + 1] - rail.y[i]) * t;
  out.z = rail.z[i] + (rail.z[i + 1] - rail.z[i]) * t;
  return out;
}

export function pathYaw(s: number) {
  const [i, t] = idx(s);
  return PATH.yaw[i] + (PATH.yaw[i + 1] - PATH.yaw[i]) * t;
}

export function pathKappa(s: number) {
  const [i, t] = idx(s);
  return PATH.kappa[i] + (PATH.kappa[i + 1] - PATH.kappa[i]) * t;
}

/** Control points for the CatmullRom curve the scene threads (one per scene unit). */
export function controlPoints(): V3[] {
  const out: V3[] = [];
  for (let s = 0; s < LENGTH; s += 1) out.push(pathPoint(s));
  out.push(pathPoint(LENGTH));
  return out;
}

/**
 * Camera rail: the cord offset to the outside of each turn and lifted, then smoothed.
 * Returns samples every STEP along s.
 */
export function cameraRail(sideDist: number, lift: number) {
  const n = PATH.n;
  const cx = new Float32Array(n);
  const cy = new Float32Array(n);
  const cz = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = PATH.yaw[i];
    const sd = PATH.side[i] * sideDist;
    // right of travel = (cos a, 0, sin a); lift more while crossing over the cord
    const over = 1 - Math.abs(PATH.side[i]);
    cx[i] = PATH.pos[i * 3] + Math.cos(a) * sd;
    cy[i] = PATH.pos[i * 3 + 1] + lift + over * 1.2;
    cz[i] = PATH.pos[i * 3 + 2] + Math.sin(a) * sd;
  }
  return { x: smooth(cx, 16), y: smooth(cy, 16), z: smooth(cz, 16) };
}

export function railPoint(rail: ReturnType<typeof cameraRail>, s: number): V3 {
  const [i, t] = idx(s);
  return [
    rail.x[i] + (rail.x[i + 1] - rail.x[i]) * t,
    rail.y[i] + (rail.y[i + 1] - rail.y[i]) * t,
    rail.z[i] + (rail.z[i + 1] - rail.z[i]) * t,
  ];
}

/* ---------------- what hangs where ---------------- */

export const BEAD_R = 0.27;
export const PRODUCT_R = 0.5;
export const GURU_R = 0.62;
const LEAD = 4; // bare cord before the first bead
const PITCH = 1; // plain bead to plain bead
const PRODUCT_HALF = 1.75; // room either side of a product bead, so its medallion can hang
const GURU_HALF = 1.1;

export type StrandLayout = {
  beads: number[]; // s of the 108 plain beads
  products: number[]; // s of each product bead, in catalogue order
  guru: number;
  /** plain beads before each product bead (for the counter) */
  before: number[];
};

/** Lay out 108 plain beads, `count` product beads spaced evenly between them, and the guru bead at the end. */
export function layoutStrand(count: number): StrandLayout {
  const groups = count + 1;
  const base = Math.floor(PLAIN / groups);
  const extra = PLAIN % groups;
  const raw: { kind: "b" | "p" | "g"; s: number }[] = [];
  let s = 0;
  for (let g = 0; g < groups; g++) {
    // extra beads go to the middle groups, so the strand starts and ends evenly
    const mid = Math.floor((groups - extra) / 2);
    const n = base + (g >= mid && g < mid + extra ? 1 : 0);
    for (let i = 0; i < n; i++) {
      s += PITCH / 2;
      raw.push({ kind: "b", s });
      s += PITCH / 2;
    }
    if (g < count) {
      s += PRODUCT_HALF;
      raw.push({ kind: "p", s });
      s += PRODUCT_HALF;
    }
  }
  s += GURU_HALF;
  raw.push({ kind: "g", s });
  const end = LENGTH - 0.05;
  const k = (end - LEAD) / s;
  const beads: number[] = [];
  const products: number[] = [];
  const before: number[] = [];
  let guru = end;
  for (const r of raw) {
    const at = LEAD + r.s * k;
    if (r.kind === "b") beads.push(at);
    else if (r.kind === "p") {
      products.push(at);
      before.push(beads.length);
    } else guru = at;
  }
  return { beads, products, guru, before };
}

/* ---------------- scroll ↔ strand ---------------- */

export const P_FIRST = 0.075;
export const P_LAST = 0.84;
export const P_GURU = 0.93;

export type Keys = { p: number[]; s: number[] };

export function journeyKeys(l: StrandLayout): Keys {
  const p: number[] = [0];
  const s: number[] = [l.beads[0] + 2.2];
  const n = l.products.length;
  l.products.forEach((ps, k) => {
    p.push(P_FIRST + (k / Math.max(1, n - 1)) * (P_LAST - P_FIRST));
    s.push(ps);
  });
  p.push(P_GURU, 1);
  s.push(l.guru, l.guru);
  return { p, s };
}

/** Scroll progress → focus s. Eases into each product bead so the strand "settles" on it. */
export function sAtProgress(keys: Keys, p: number) {
  const { p: kp, s: ks } = keys;
  if (p <= 0) return ks[0];
  for (let i = 0; i < kp.length - 1; i++) {
    if (p <= kp[i + 1]) {
      const f = (p - kp[i]) / (kp[i + 1] - kp[i]);
      const sm = f * f * (3 - 2 * f);
      const e = i === 0 ? f : 0.3 * f + 0.7 * sm;
      return ks[i] + (ks[i + 1] - ks[i]) * e;
    }
  }
  return ks[ks.length - 1];
}

/** How far into the closing shot (guru bead and tassel) the journey is, 0–1. */
export function endAtProgress(p: number) {
  const t = Math.min(1, Math.max(0, (p - (P_GURU - 0.035)) / 0.06));
  return t * t * (3 - 2 * t);
}

export const productProgress = (k: number, n: number) => P_FIRST + (k / Math.max(1, n - 1)) * (P_LAST - P_FIRST);

/** Plain beads passed at focus s (the "bead 027 of 108" counter). */
export function beadCount(l: StrandLayout, s: number) {
  let c = 0;
  for (const b of l.beads) if (b <= s + 0.35) c++;
  return Math.max(1, c);
}
