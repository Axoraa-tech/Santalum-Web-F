import * as THREE from "three";
import { mulberry32 } from "./data";

/**
 * Procedural sandalwood for the lathe.
 * Two canvases per wood are drawn once: a strip of growth rings (x = distance from the pith)
 * and a sheet of fine grain (fibres along the spindle axis, pores, short rays).
 * The shader treats the work as a solid block: rings come from the distance to an off-centre
 * pith, so whatever shape the lathe cuts, the grain runs through it the way it would in wood.
 */

type RGB = [number, number, number];
type Palette = { early: RGB; late: RGB; dark: RGB; light: RGB };

const PALETTES: Record<"red" | "white", Palette> = {
  // Pterocarpus santalinus: deep red, darkening to near black in the late wood.
  red: { early: [132, 38, 24], late: [84, 20, 12], dark: [46, 10, 7], light: [156, 58, 36] },
  // Santalum album: pale gold heartwood with honey-coloured late wood.
  white: { early: [224, 190, 136], late: [198, 154, 96], dark: [166, 120, 70], light: [238, 212, 168] },
};

export const RINGS = 40;

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function ringCanvas(kind: "red" | "white", w: number, h: number) {
  const pal = PALETTES[kind];
  const rand = mulberry32(kind === "red" ? 1187 : 2903);
  const widths = Array.from({ length: RINGS }, () => 0.5 + rand() * 1.0);
  const sum = widths.reduce((a, b) => a + b, 0);
  const edges = [0];
  for (const v of widths) edges.push(edges[edges.length - 1] + v / sum);
  const tone = widths.map(() => 0.9 + rand() * 0.16);
  const lateShare = widths.map(() => 0.25 + rand() * 0.45);
  const streak = widths.map(() => (rand() < 0.1 ? 0.1 + rand() * 0.14 : 0));
  const ph = [rand() * 6.28, rand() * 6.28, rand() * 6.28];

  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(w, h);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const fy = y / h;
    const warp =
      0.010 * Math.sin(fy * Math.PI * 4 + ph[0]) + 0.006 * Math.sin(fy * Math.PI * 10 + ph[1]) + 0.003 * Math.sin(fy * Math.PI * 26 + ph[2]);
    let ring = 0;
    for (let x = 0; x < w; x++) {
      let u = x / w + warp;
      u -= Math.floor(u);
      ring = 0;
      while (ring < RINGS - 1 && edges[ring + 1] <= u) ring++;
      const t = (u - edges[ring]) / (edges[ring + 1] - edges[ring]);
      // Early wood is lighter; late wood darkens toward the ring boundary, which is sharp.
      const lw = smooth(1 - lateShare[ring], 1, t) * (1 - smooth(0.985, 1, t) * 0.4) * 0.75;
      const k = tone[ring];
      let r = (pal.early[0] + (pal.late[0] - pal.early[0]) * lw) * k;
      let g = (pal.early[1] + (pal.late[1] - pal.early[1]) * lw) * k;
      let b = (pal.early[2] + (pal.late[2] - pal.early[2]) * lw) * k;
      // A few rings carry a darker streak, a few a lighter flush.
      const s = streak[ring] * Math.sin(Math.PI * t);
      r += (pal.dark[0] - r) * s;
      g += (pal.dark[1] - g) * s;
      b += (pal.dark[2] - b) * s;
      const lift = smooth(0.0, 0.08, t) * (1 - smooth(0.08, 0.3, t)) * 0.18;
      r += (pal.light[0] - r) * lift;
      g += (pal.light[1] - g) * lift;
      b += (pal.light[2] - b) * lift;
      const i = (y * w + x) * 4;
      d[i] = r;
      d[i + 1] = g;
      d[i + 2] = b;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

function grainCanvas(size: number) {
  const rand = mulberry32(77);
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const ctx = c.getContext("2d")!;
  // Fibres: each column gets its own value, slowly drifting along its length.
  const col = new Float32Array(size);
  for (let x = 0; x < size; x++) col[x] = rand();
  const soft = new Float32Array(size);
  for (let x = 0; x < size; x++) {
    soft[x] = (col[(x - 1 + size) % size] + 2 * col[x] + col[(x + 1) % size]) / 4;
  }
  const drift = new Float32Array(size * 4);
  for (let i = 0; i < drift.length; i++) drift[i] = rand();
  const img = ctx.createImageData(size, size);
  const d = img.data;
  for (let y = 0; y < size; y++) {
    const fy = (y / size) * 4;
    const y0 = Math.floor(fy);
    const ty = fy - y0;
    for (let x = 0; x < size; x++) {
      const a = drift[(x * 4 + (y0 % 4)) % drift.length];
      const b = drift[(x * 4 + ((y0 + 1) % 4)) % drift.length];
      const dr = a + (b - a) * (ty * ty * (3 - 2 * ty));
      const v = 0.62 + (soft[x] - 0.5) * 0.55 + (dr - 0.5) * 0.18;
      const i = (y * size + x) * 4;
      const g = Math.max(0, Math.min(255, v * 255));
      d[i] = g;
      d[i + 1] = g;
      d[i + 2] = g;
      d[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  // Pores: short dark dashes along the grain. Drawn with wrap so the sheet tiles.
  const dash = (x: number, y: number, len: number, wdt: number, style: string) => {
    ctx.fillStyle = style;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) ctx.fillRect(x + ox, y + oy, wdt, len);
  };
  for (let i = 0; i < size * 1.4; i++) {
    dash(rand() * size, rand() * size, 4 + rand() * 18, 1 + rand() * 1.2, `rgba(0,0,0,${0.18 + rand() * 0.32})`);
  }
  // Rays: tiny lighter flecks across the grain.
  for (let i = 0; i < size * 0.5; i++) {
    ctx.save();
    const x = rand() * size;
    const y = rand() * size;
    ctx.fillStyle = `rgba(255,255,255,${0.1 + rand() * 0.18})`;
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) ctx.fillRect(x + ox, y + oy, 3 + rand() * 6, 1);
    ctx.restore();
  }
  return c;
}

type WoodTextures = { red: THREE.CanvasTexture; white: THREE.CanvasTexture; grain: THREE.CanvasTexture };

let cached: { key: string; tex: WoodTextures } | null = null;

export function woodTextures(lite = false): WoodTextures {
  const key = lite ? "lite" : "full";
  if (cached && cached.key === key) return cached.tex;
  const w = lite ? 512 : 1024;
  const make = (c: HTMLCanvasElement, srgb: boolean) => {
    const t = new THREE.CanvasTexture(c);
    t.wrapS = THREE.RepeatWrapping;
    t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.anisotropy = 8;
    t.generateMipmaps = true;
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.needsUpdate = true;
    return t;
  };
  const tex = {
    red: make(ringCanvas("red", w, lite ? 128 : 256), true),
    white: make(ringCanvas("white", w, lite ? 128 : 256), true),
    grain: make(grainCanvas(lite ? 256 : 512), false),
  };
  cached = { key, tex };
  return tex;
}

const NOISE = /* glsl */ `
varying vec3 vWoodPos;
uniform sampler2D uRedRings;
uniform sampler2D uWhiteRings;
uniform sampler2D uGrain;
uniform float uWood;
uniform float uRingDensity;
uniform vec2 uPith;
uniform float uBump;
float woodHash(vec3 p) {
  p = fract(p * 0.3183099 + 0.1);
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float woodNoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(woodHash(i), woodHash(i + vec3(1.0, 0.0, 0.0)), f.x), mix(woodHash(i + vec3(0.0, 1.0, 0.0)), woodHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(woodHash(i + vec3(0.0, 0.0, 1.0)), woodHash(i + vec3(1.0, 0.0, 1.0)), f.x), mix(woodHash(i + vec3(0.0, 1.0, 1.0)), woodHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}
vec3 woodPerturb(vec3 surfPos, vec3 surfNorm, vec2 dHdxy, float faceDir) {
  vec3 sx = normalize(dFdx(surfPos));
  vec3 sy = normalize(dFdy(surfPos));
  vec3 r1 = cross(sy, surfNorm);
  vec3 r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDir;
  vec3 grad = sign(det) * (dHdxy.x * r1 + dHdxy.y * r2);
  return normalize(abs(det) * surfNorm - grad);
}
`;

const COLOR = /* glsl */ `
vec3 P = vWoodPos;
vec2 q = P.xz - uPith;
float rr = length(q);
float ang = atan(q.y, q.x);
float nLow = woodNoise(P * vec3(1.4, 0.42, 1.4)) - 0.5;
float nMid = woodNoise(P * vec3(4.2, 1.1, 4.2) + 7.0) - 0.5;
float ringU = (rr + nLow * 0.14 + nMid * 0.03) * uRingDensity;
vec2 stR = vec2(ringU, P.y * 0.07 + nLow * 0.05);
vec3 woodCol = mix(texture2D(uRedRings, stR).rgb, texture2D(uWhiteRings, stR).rgb, uWood);
vec2 stG = vec2(ang * 0.4774648 + rr * 0.9, P.y * 0.5 + nMid * 0.04);
vec2 gdx = dFdx(stG);
vec2 gdy = dFdy(stG);
if (abs(gdx.x) > 1.0) gdx.x = 0.0;
if (abs(gdy.x) > 1.0) gdy.x = 0.0;
float woodFib = textureGrad(uGrain, stG, gdx, gdy).r;
woodCol *= mix(0.8, 1.08, woodFib);
diffuseColor.rgb *= woodCol;
`;

/**
 * MeshPhysicalMaterial with an oil-and-wax finish and the procedural wood grain.
 * `uWood` eases between red (0) and white (1).
 */
export function createWoodMaterial(tex: WoodTextures) {
  const uniforms = {
    uRedRings: { value: tex.red },
    uWhiteRings: { value: tex.white },
    uGrain: { value: tex.grain },
    uWood: { value: 0 },
    uRingDensity: { value: 26 / RINGS },
    uPith: { value: new THREE.Vector2(0.21, -0.14) },
    uBump: { value: 0.0016 },
  };
  const m = new THREE.MeshPhysicalMaterial({
    color: "#ffffff",
    roughness: 0.52,
    metalness: 0,
    clearcoat: 0.3,
    clearcoatRoughness: 0.32,
    side: THREE.DoubleSide,
  });
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nvarying vec3 vWoodPos;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvWoodPos = position;");
    shader.fragmentShader = shader.fragmentShader
      .replace("#include <common>", `#include <common>\n${NOISE}`)
      .replace("#include <map_fragment>", `#include <map_fragment>\n${COLOR}`)
      .replace(
        "#include <roughnessmap_fragment>",
        "#include <roughnessmap_fragment>\nroughnessFactor *= mix(1.18, 0.9, woodFib);",
      )
      .replace(
        "#include <normal_fragment_maps>",
        "#include <normal_fragment_maps>\nnormal = woodPerturb(-vViewPosition, normal, vec2(dFdx(woodFib), dFdy(woodFib)) * uBump, faceDirection);",
      );
  };
  m.userData.uniforms = uniforms;
  m.customProgramCacheKey = () => "lathe-wood-v1";
  return { material: m, uniforms };
}

/** Steel for centres, spindle and tool rest. */
export function createSteel() {
  return new THREE.MeshStandardMaterial({ color: "#a9abb0", metalness: 0.92, roughness: 0.32 });
}
