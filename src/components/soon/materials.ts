import * as THREE from "three";

/** Small deterministic random generator, so every visit looks the same. */
export function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* ---------- Procedural heartwood ---------- */
export function makeWoodMaps() {
  const w = 1024;
  const h = 512;
  const color = document.createElement("canvas");
  color.width = w;
  color.height = h;
  const c = color.getContext("2d")!;
  const r = rng(29);
  const g = c.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, "#7a2416");
  g.addColorStop(0.5, "#8e2e1a");
  g.addColorStop(1, "#6a1f13");
  c.fillStyle = g;
  c.fillRect(0, 0, w, h);
  for (let k = 0; k < 26; k++) {
    const y = r() * h;
    const bh = 8 + r() * 40;
    c.fillStyle = r() > 0.5 ? `rgba(40,8,4,${0.08 + r() * 0.12})` : `rgba(190,90,55,${0.05 + r() * 0.08})`;
    c.beginPath();
    for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.006 + k) * 14 + Math.sin(x * 0.021 + k * 3) * 4);
    for (let x = w; x >= 0; x -= 16) c.lineTo(x, y + bh + Math.sin(x * 0.006 + k) * 14 + Math.sin(x * 0.017 + k) * 5);
    c.fill();
  }
  for (let k = 0; k < 900; k++) {
    const y = r() * h;
    const x0 = r() * w;
    const len = 60 + r() * 260;
    c.strokeStyle = r() > 0.4 ? `rgba(30,6,3,${0.06 + r() * 0.14})` : `rgba(210,120,80,${0.04 + r() * 0.07})`;
    c.lineWidth = 0.5 + r() * 1.3;
    c.beginPath();
    c.moveTo(x0, y);
    c.bezierCurveTo(x0 + len * 0.33, y + (r() - 0.5) * 6, x0 + len * 0.66, y + (r() - 0.5) * 6, x0 + len, y + (r() - 0.5) * 4);
    c.stroke();
  }
  for (let k = 0; k < 2600; k++) {
    c.fillStyle = `rgba(20,4,2,${0.2 + r() * 0.35})`;
    c.fillRect(r() * w, r() * h, 1 + r() * 2.2, 0.7 + r() * 0.8);
  }
  const bump = document.createElement("canvas");
  bump.width = w;
  bump.height = h;
  const b = bump.getContext("2d")!;
  b.filter = "grayscale(1) contrast(1.6) brightness(1.4)";
  b.drawImage(color, 0, 0);
  const map = new THREE.CanvasTexture(color);
  map.colorSpace = THREE.SRGBColorSpace;
  map.anisotropy = 8;
  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.anisotropy = 8;
  return { map, bumpMap };
}


/** Soft round sprite shader for light: per-point size and alpha, additive. */
export const glowVertex = /* glsl */ `
  attribute float aSize;
  attribute float aAlpha;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uScale / -mv.z;
    vAlpha = aAlpha;
  }
`;
export const glowFragment = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5) * 2.0;
    float core = smoothstep(1.0, 0.0, d);
    float a = pow(core, 2.2) * vAlpha;
    if (a < 0.003) discard;
    gl_FragColor = vec4(min(uColor * (0.85 + core * 0.3), vec3(1.0)), a);
  }
`;
