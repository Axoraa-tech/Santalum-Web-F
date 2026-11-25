import * as THREE from "three";
import type { ProfileKey } from "./data";

/**
 * Lathe profiles. Each is a half cross-section (x = radius, y = along the spindle axis), traced
 * counter-clockwise so normals face out, then resampled to exactly PTS points by arc length.
 * Equal point counts let any profile morph into any other while the work spins.
 */
export const PTS = 168;

type P2 = [number, number];

function trace(x0: number, y0: number) {
  const pts: P2[] = [[x0, y0]];
  const last = () => pts[pts.length - 1];
  const b = {
    pts,
    l(x: number, y: number) {
      pts.push([x, y]);
      return b;
    },
    q(cx: number, cy: number, x: number, y: number, n = 14) {
      const [ax, ay] = last();
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        pts.push([u * u * ax + 2 * u * t * cx + t * t * x, u * u * ay + 2 * u * t * cy + t * t * y]);
      }
      return b;
    },
    c(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number, n = 30) {
      const [ax, ay] = last();
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        const u = 1 - t;
        pts.push([
          u * u * u * ax + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x,
          u * u * u * ay + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y,
        ]);
      }
      return b;
    },
    arc(cx: number, cy: number, r: number, a0: number, a1: number, n = 40) {
      for (let i = 1; i <= n; i++) {
        const a = a0 + ((a1 - a0) * i) / n;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      return b;
    },
  };
  return b;
}

function resample(pts: P2[], n = PTS) {
  const acc = [0];
  for (let i = 1; i < pts.length; i++) {
    acc.push(acc[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  }
  const total = acc[acc.length - 1];
  const out = new Float32Array(n * 2);
  let k = 0;
  for (let i = 0; i < n; i++) {
    const s = (i / (n - 1)) * total;
    while (k < pts.length - 2 && acc[k + 1] < s) k++;
    const len = acc[k + 1] - acc[k] || 1;
    const t = Math.min(1, Math.max(0, (s - acc[k]) / len));
    out[i * 2] = Math.max(0, pts[k][0] + (pts[k + 1][0] - pts[k][0]) * t);
    out[i * 2 + 1] = pts[k][1] + (pts[k + 1][1] - pts[k][1]) * t;
  }
  return out;
}

const D2R = Math.PI / 180;

const RAW: Record<ProfileKey, () => P2[]> = {
  // A blank turned round between centres, ends chamfered.
  billet: () =>
    trace(0, -1.3)
      .l(0.53, -1.3)
      .q(0.62, -1.3, 0.62, -1.21)
      .l(0.62, 1.21)
      .q(0.62, 1.3, 0.53, 1.3)
      .l(0, 1.3).pts,
  // Guru bead: a sphere with a turned collar where the tassel is tied.
  guru: () =>
    trace(0, -0.86)
      .arc(0, -0.14, 0.72, -90 * D2R, 52 * D2R, 60)
      .q(0.26, 0.6, 0.2, 0.66)
      .l(0.2, 0.74)
      .q(0.31, 0.74, 0.31, 0.83)
      .q(0.31, 0.93, 0.18, 0.94)
      .l(0, 0.94).pts,
  // Plain bead, bored through for the cord (a closed loop that never touches the axis).
  bead: () => {
    const r = 0.76;
    const f = 0.56;
    const xf = Math.sqrt(r * r - f * f);
    const a = Math.asin(f / r);
    return trace(0.13, -f)
      .l(xf, -f)
      .arc(0, 0, r, -a, a, 60)
      .l(0.13, f)
      .l(0.13, -f).pts;
  },
  // Jar with a fitted lid and a knob.
  jar: () =>
    trace(0, -0.96)
      .l(0.47, -0.96)
      .q(0.56, -0.96, 0.56, -0.88)
      .l(0.53, -0.83)
      .q(0.52, -0.78, 0.58, -0.75)
      .c(0.71, -0.6, 0.73, -0.1, 0.66, 0.3)
      .l(0.64, 0.36)
      .l(0.6, 0.38)
      .l(0.6, 0.42)
      .q(0.6, 0.44, 0.66, 0.44)
      .q(0.7, 0.44, 0.7, 0.5)
      .l(0.7, 0.56)
      .q(0.7, 0.65, 0.6, 0.68)
      .c(0.46, 0.73, 0.31, 0.76, 0.2, 0.78)
      .q(0.15, 0.79, 0.15, 0.83)
      .q(0.25, 0.85, 0.23, 0.93)
      .q(0.19, 1.0, 0, 1.0).pts,
  // Coaster: a disc with a raised rim and a recessed face, end grain up.
  coaster: () =>
    trace(0, -0.13)
      .l(0.93, -0.13)
      .q(1.0, -0.13, 1.0, -0.06)
      .l(1.0, 0.06)
      .q(1.0, 0.13, 0.93, 0.13)
      .l(0.87, 0.13)
      .q(0.82, 0.13, 0.81, 0.07)
      .l(0.36, 0.07)
      .q(0.33, 0.07, 0.32, 0.04)
      .q(0.31, 0.07, 0.28, 0.07)
      .l(0, 0.07).pts,
  // Bowl, which also reads as the lid of a turned box.
  bowl: () =>
    trace(0, -0.52)
      .l(0.34, -0.52)
      .q(0.4, -0.52, 0.4, -0.46)
      .l(0.4, -0.43)
      .q(0.4, -0.38, 0.46, -0.37)
      .c(0.86, -0.3, 1.04, -0.02, 1.07, 0.4)
      .q(1.08, 0.48, 1.02, 0.48)
      .q(0.98, 0.48, 0.98, 0.42)
      .c(0.95, 0.02, 0.76, -0.32, 0.3, -0.36)
      .l(0, -0.37).pts,
  // Cuff: a domed band, a closed loop around the spindle.
  cuff: () =>
    trace(0.7, -0.29)
      .l(0.8, -0.29)
      .q(0.87, -0.29, 0.89, -0.22)
      .c(0.95, -0.1, 0.95, 0.1, 0.89, 0.22)
      .q(0.87, 0.29, 0.8, 0.29)
      .l(0.7, 0.29)
      .q(0.65, 0.29, 0.65, 0.24)
      .l(0.65, -0.24)
      .q(0.65, -0.29, 0.7, -0.29).pts,
  // Attar bottle: a round body, a narrow neck and a tall teardrop stopper.
  vial: () =>
    trace(0, -0.95)
      .l(0.4, -0.95)
      .q(0.48, -0.95, 0.48, -0.88)
      .l(0.45, -0.83)
      .c(0.74, -0.72, 0.76, -0.1, 0.44, 0.05)
      .q(0.2, 0.14, 0.15, 0.22)
      .l(0.15, 0.3)
      .q(0.24, 0.3, 0.24, 0.36)
      .q(0.24, 0.41, 0.14, 0.42)
      .l(0.09, 0.45)
      .c(0.32, 0.55, 0.28, 0.84, 0.11, 0.99)
      .q(0.04, 1.06, 0, 1.07).pts,
  // Round box with a domed lid and a turned finial, as Mysuru boxes are made.
  casket: () =>
    trace(0, -0.62)
      .l(0.78, -0.62)
      .q(0.86, -0.62, 0.86, -0.54)
      .l(0.86, 0.05)
      .l(0.82, 0.07)
      .l(0.82, 0.09)
      .l(0.88, 0.1)
      .q(0.91, 0.1, 0.91, 0.16)
      .c(0.91, 0.42, 0.6, 0.6, 0.22, 0.64)
      .q(0.13, 0.66, 0.13, 0.72)
      .q(0.25, 0.75, 0.21, 0.86)
      .q(0.15, 0.95, 0, 0.95).pts,
  // A slim numbered vial with a turned cap.
  ampoule: () =>
    trace(0, -1.18)
      .l(0.22, -1.18)
      .q(0.28, -1.18, 0.28, -1.12)
      .l(0.28, 0.46)
      .q(0.28, 0.54, 0.21, 0.56)
      .l(0.19, 0.6)
      .l(0.26, 0.62)
      .q(0.3, 0.62, 0.3, 0.67)
      .l(0.3, 0.8)
      .l(0.27, 0.83)
      .l(0.3, 0.86)
      .l(0.3, 1.08)
      .q(0.3, 1.17, 0.2, 1.19)
      .l(0, 1.2).pts,
};

const cache = new Map<ProfileKey, Float32Array>();

export function profile(key: ProfileKey) {
  let p = cache.get(key);
  if (!p) {
    p = resample(RAW[key]());
    cache.set(key, p);
  }
  return p;
}

/** Display scale per profile, so a 12 mm bead and a 150 mm bowl read at a similar size on screen. */
export const DISPLAY: Record<ProfileKey, { scale: number; yaw: number; pitch: number; tail: number }> = {
  billet: { scale: 1.0, yaw: -0.42, pitch: 0.16, tail: 1 },
  guru: { scale: 1.06, yaw: -0.5, pitch: 0.18, tail: 1 },
  bead: { scale: 1.1, yaw: -0.7, pitch: 0.2, tail: 0 },
  jar: { scale: 1.0, yaw: -0.62, pitch: 0.2, tail: 0 },
  coaster: { scale: 1.04, yaw: -1.05, pitch: 0.26, tail: 0 },
  bowl: { scale: 0.98, yaw: -0.98, pitch: 0.24, tail: 0 },
  cuff: { scale: 1.3, yaw: -0.86, pitch: 0.22, tail: 0 },
  vial: { scale: 1.02, yaw: -0.6, pitch: 0.2, tail: 0 },
  casket: { scale: 1.0, yaw: -0.9, pitch: 0.24, tail: 0 },
  ampoule: { scale: 1.0, yaw: -0.48, pitch: 0.18, tail: 0 },
};

export function lerpProfile(a: Float32Array, b: Float32Array, t: number, out: Float32Array) {
  for (let i = 0; i < out.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
  return out;
}

/** Extents of a profile along the axis, and its largest radius. */
export function bounds(p: Float32Array) {
  let minY = Infinity;
  let maxY = -Infinity;
  let maxR = 0;
  for (let i = 0; i < p.length; i += 2) {
    if (p[i + 1] < minY) minY = p[i + 1];
    if (p[i + 1] > maxY) maxY = p[i + 1];
    if (p[i] > maxR) maxR = p[i];
  }
  return { minY, maxY, maxR };
}

/** Outermost radius of the profile near height y (where the tool would touch). */
export function radiusAt(p: Float32Array, y: number) {
  let best = 0;
  let bestD = Infinity;
  let bestR = 0;
  for (let i = 0; i < p.length; i += 2) {
    const d = Math.abs(p[i + 1] - y);
    if (d < 0.05 && p[i] > best) best = p[i];
    if (d < bestD) {
      bestD = d;
      bestR = p[i];
    }
  }
  return best || bestR;
}

/**
 * A lathe mesh whose profile can be rewritten in place (no new geometry per frame).
 * Vertex layout and winding match THREE.LatheGeometry.
 */
export function createLathe(segments = 112) {
  const n = PTS;
  const count = (segments + 1) * n;
  const pos = new Float32Array(count * 3);
  const nor = new Float32Array(count * 3);
  const index: number[] = [];
  for (let i = 0; i < segments; i++) {
    for (let j = 0; j < n - 1; j++) {
      const base = j + i * n;
      const a = base;
      const b = base + n;
      const c = base + n + 1;
      const d = base + 1;
      index.push(a, b, d, c, d, b);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setIndex(index);
  geometry.setAttribute("position", new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.setAttribute("normal", new THREE.BufferAttribute(nor, 3).setUsage(THREE.DynamicDrawUsage));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 2);

  const sin = new Float32Array(segments + 1);
  const cos = new Float32Array(segments + 1);
  for (let i = 0; i <= segments; i++) {
    const phi = (i / segments) * Math.PI * 2;
    sin[i] = Math.sin(phi);
    cos[i] = Math.cos(phi);
  }
  const pn = new Float32Array(n * 2);

  function segNormal(p: Float32Array, j: number, acc: [number, number]) {
    const dx = p[(j + 1) * 2] - p[j * 2];
    const dy = p[(j + 1) * 2 + 1] - p[j * 2 + 1];
    const l = Math.hypot(dx, dy);
    if (l > 1e-7) {
      acc[0] += dy / l;
      acc[1] += -dx / l;
    }
  }

  const acc: [number, number] = [0, 0];

  function update(p: Float32Array) {
    const closed = Math.hypot(p[0] - p[(n - 1) * 2], p[1] - p[(n - 1) * 2 + 1]) < 1e-4;
    let lx = 0;
    let ly = -1;
    for (let j = 0; j < n; j++) {
      acc[0] = 0;
      acc[1] = 0;
      if (j > 0) segNormal(p, j - 1, acc);
      else if (closed) segNormal(p, n - 2, acc);
      if (j < n - 1) segNormal(p, j, acc);
      else if (closed) segNormal(p, 0, acc);
      const l = Math.hypot(acc[0], acc[1]);
      if (l > 1e-7) {
        lx = acc[0] / l;
        ly = acc[1] / l;
      }
      pn[j * 2] = lx;
      pn[j * 2 + 1] = ly;
    }
    for (let i = 0; i <= segments; i++) {
      const s = sin[i];
      const c = cos[i];
      for (let j = 0; j < n; j++) {
        const k = (i * n + j) * 3;
        const x = p[j * 2];
        pos[k] = x * s;
        pos[k + 1] = p[j * 2 + 1];
        pos[k + 2] = x * c;
        nor[k] = pn[j * 2] * s;
        nor[k + 1] = pn[j * 2 + 1];
        nor[k + 2] = pn[j * 2] * c;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }

  return { geometry, update };
}

/** Curled wood shaving: a thin ribbon wound into a loose helix. */
export function createShavingGeometry() {
  const g = new THREE.PlaneGeometry(1, 0.2, 18, 1);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) + 0.5;
    const v = p.getY(i);
    const a = u * 4.4;
    const r = 0.16 * (1 - 0.45 * u);
    p.setXYZ(i, r * Math.cos(a), v * (1 - 0.3 * u) + u * 0.14, r * Math.sin(a));
  }
  g.computeVertexNormals();
  return g;
}
