import * as THREE from "three";
import { TONE_FILTER, type Tone } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { mulberry32 } from "./store";

/** Procedural wood for the ring: long grain for the disc rims, end grain (tree rings) for the backs. */

const PALETTE: Record<Wood, { base: string; dark: string; light: string; sap: string; pith: string }> = {
  red: { base: "#8e2d19", dark: "#56140a", light: "#b9563b", sap: "#e8d2a9", pith: "#2c0904" },
  white: { base: "#d5b17d", dark: "#a07642", light: "#efd8ad", sap: "#f5e9cf", pith: "#7a5528" },
};

const rimCache = new Map<Wood, THREE.CanvasTexture>();
const endCache = new Map<Wood, THREE.CanvasTexture>();
const photoCache = new Map<string, THREE.CanvasTexture>();

function finish(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

export function rimTexture(wood: Wood) {
  const hit = rimCache.get(wood);
  if (hit) return hit;
  const p = PALETTE[wood];
  const W = 1024;
  const H = 128;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  const r = mulberry32(wood === "red" ? 7 : 11);
  ctx.fillStyle = p.base;
  ctx.fillRect(0, 0, W, H);
  // broad colour bands
  for (let i = 0; i < 30; i++) {
    ctx.globalAlpha = 0.07 + r() * 0.16;
    ctx.fillStyle = r() > 0.45 ? p.dark : p.light;
    ctx.fillRect(0, r() * H, W, 2 + r() * 14);
  }
  // fine wavy grain; whole-number waves so the texture wraps around the rim without a seam
  for (let i = 0; i < 170; i++) {
    ctx.globalAlpha = 0.08 + r() * 0.32;
    ctx.strokeStyle = r() > 0.3 ? p.dark : p.light;
    ctx.lineWidth = 0.5 + r() * 1.3;
    const y0 = r() * H;
    const amp = 0.6 + r() * 3.2;
    const k = ((1 + Math.floor(r() * 3)) * Math.PI * 2) / W;
    const ph = r() * Math.PI * 2;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 8) {
      const y = y0 + Math.sin(x * k + ph) * amp;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // pores
  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.12 + r() * 0.2;
    ctx.fillStyle = p.dark;
    ctx.fillRect(r() * W, r() * H, 1 + r() * 3, 0.8);
  }
  ctx.globalAlpha = 1;
  const t = finish(c);
  t.wrapS = THREE.RepeatWrapping;
  t.repeat.set(2, 1);
  rimCache.set(wood, t);
  return t;
}

export function endGrainTexture(wood: Wood) {
  const hit = endCache.get(wood);
  if (hit) return hit;
  const p = PALETTE[wood];
  const S = 512;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const r = mulberry32(wood === "red" ? 21 : 34);
  const cx = S * 0.47;
  const cy = S * 0.53;
  const g = ctx.createRadialGradient(cx, cy, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, p.dark);
  g.addColorStop(0.6, p.base);
  g.addColorStop(0.88, p.light);
  g.addColorStop(0.93, p.sap);
  g.addColorStop(1, p.sap);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  // growth rings
  for (let rad = 5; rad < S * 0.46; rad += 3 + r() * 7) {
    ctx.beginPath();
    const ph = r() * 6.28;
    for (let a = 0; a <= 96; a++) {
      const ang = (a / 96) * Math.PI * 2;
      const wob = 1 + Math.sin(ang * 3 + ph) * 0.018 + Math.sin(ang * 7 + rad * 0.07) * 0.007;
      const x = cx + Math.cos(ang) * rad * wob;
      const y = cy + Math.sin(ang) * rad * wob;
      if (a === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.globalAlpha = 0.18 + r() * 0.32;
    ctx.strokeStyle = p.dark;
    ctx.lineWidth = 0.6 + r() * 1.8;
    ctx.stroke();
  }
  // rays and a couple of drying checks
  for (let i = 0; i < 70; i++) {
    const ang = r() * Math.PI * 2;
    const r0 = r() * S * 0.2;
    const r1 = r0 + S * (0.05 + r() * 0.18);
    ctx.globalAlpha = 0.06 + r() * 0.08;
    ctx.strokeStyle = p.light;
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
    ctx.lineTo(cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    const ang = r() * Math.PI * 2;
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = p.pith;
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(ang) * 6, cy + Math.sin(ang) * 6);
    ctx.lineTo(cx + Math.cos(ang + 0.03) * S * 0.12, cy + Math.sin(ang + 0.03) * S * 0.12);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = p.pith;
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fill();
  const t = finish(c);
  endCache.set(wood, t);
  return t;
}

/**
 * A square, centre-cropped photo for a disc face. Returns a texture right away (warm paper),
 * then paints the photo into it when it arrives. Tone filters warm or pale a placeholder photo.
 */
export function photoTexture(id: string, tone?: Tone) {
  const key = `${id}|${tone ?? ""}`;
  const hit = photoCache.get(key);
  if (hit) return hit;
  const S = 640;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = tone === "pale" ? "#efe4d0" : "#e9d9d1";
  ctx.fillRect(0, 0, S, S);
  const t = finish(c);
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.decoding = "async";
  img.onload = () => {
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    if (tone) ctx.filter = TONE_FILTER[tone];
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, S, S);
    ctx.filter = "none";
    t.needsUpdate = true;
  };
  img.src = `https://images.unsplash.com/${id}?w=${S}&h=${S}&fit=crop&q=78&auto=format`;
  photoCache.set(key, t);
  return t;
}

let shadowTex: THREE.CanvasTexture | null = null;

/** A soft round shadow (white, alpha falls off), tinted by the material colour. */
export function shadowTexture() {
  if (shadowTex) return shadowTex;
  const S = 128;
  const c = document.createElement("canvas");
  c.width = S;
  c.height = S;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(S / 2, S / 2, 0, S / 2, S / 2, S / 2);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.75)");
  g.addColorStop(0.7, "rgba(255,255,255,0.22)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  shadowTex = new THREE.CanvasTexture(c);
  return shadowTex;
}
