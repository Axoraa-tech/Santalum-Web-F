"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Classical Sanskrit lines about sandalwood, carved faintly into the studio floor
 * in two rings around the mala that turn slowly in opposite directions. As the
 * camera circles, the text sweeps past beneath it, so the movement is felt even
 * against a plain backdrop. No deities.
 */
const LINES = {
  // "Sandalwood is cool in the world; the moon is cooler still than sandalwood."
  cool: "चन्दनं शीतलं लोके चन्दनादपि चन्द्रमाः",
  // "Cooler than both the moon and sandalwood is the company of the good."
  company: "चन्द्रचन्दनयोर्मध्ये शीतला साधुसङ्गतिः",
  // "Rubbed again and again, sandalwood remains fragrant."
  rubbed: "घृष्टं घृष्टं पुनरपि पुनश्चन्दनं चारुगन्धम्",
  // "Gandhasāra": the essence of fragrance, a classical name for sandalwood.
  essence: "गन्धसारः",
  // "Malayaja": born of the Malaya hills.
  malaya: "मलयजम्",
  red: "रक्तचन्दनम्", // red sandalwood
  white: "श्वेतचन्दनम्", // white sandalwood
};

const RINGS = [
  { r: 3.05, band: 0.42, speed: 0.01, text: [LINES.cool, LINES.company] },
  { r: 3.75, band: 0.36, speed: -0.007, text: [LINES.rubbed, LINES.essence, LINES.malaya, LINES.red, LINES.white] },
];

const INK = "rgba(92, 52, 30, 1)";
const OPACITY = 0.17;

/** The family name next/font gave Tiro Devanagari Sanskrit, read from the page. */
function devanagariFamily() {
  const probe = document.createElement("span");
  probe.style.fontFamily = "var(--font-tiro)";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "serif";
  probe.remove();
  return family;
}

async function loadFont(px: number) {
  const font = `400 ${px}px ${devanagariFamily()}, "Noto Serif Devanagari", serif`;
  try {
    await document.fonts.load(font, "चन्दनम्");
  } catch {
    /* fall back to whatever the system has */
  }
  return font;
}

/** A flat annulus whose texture runs around it (u along the circle, v across the band). */
function ringGeometry(r: number, band: number, segments = 256) {
  const pos: number[] = [];
  const uv: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= segments; i++) {
    const a = (i / segments) * Math.PI * 2;
    const c = Math.cos(a);
    const s = Math.sin(a);
    // Reads left to right for a viewer at the front, letters upright toward the centre.
    const u = 1 - i / segments;
    pos.push(c * (r - band / 2), 0, s * (r - band / 2), c * (r + band / 2), 0, s * (r + band / 2));
    uv.push(u, 1, u, 0);
    if (i < segments) {
      const k = i * 2;
      idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  return g;
}

async function ringTexture(r: number, band: number, parts: string[]) {
  const W = 4096;
  const H = Math.max(48, Math.round(W / ((Math.PI * 2 * r) / band)));
  const font = await loadFont(Math.round(H * 0.62));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  ctx.font = font;
  ctx.fillStyle = INK;
  ctx.textBaseline = "middle";
  const sep = "   ॥   ";
  const line = parts.join(sep) + sep;
  const lw = ctx.measureText(line).width;
  // Repeat the verse until the circle is full, spacing the copies evenly.
  const copies = Math.max(1, Math.floor(W / lw));
  const step = W / copies;
  for (let k = 0; k < copies; k++) ctx.fillText(line, k * step + (step - lw) / 2, H * 0.55);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = THREE.RepeatWrapping;
  return tex;
}

type Ring = { geo: THREE.BufferGeometry; tex: THREE.CanvasTexture; speed: number };

export function FloorInscriptions() {
  const group = useRef<THREE.Group>(null);
  const [rings, setRings] = useState<Ring[] | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all(
      RINGS.map(async (f) => ({ geo: ringGeometry(f.r, f.band), tex: await ringTexture(f.r, f.band, f.text), speed: f.speed })),
    ).then((r) => {
      if (alive) setRings(r);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () =>
      rings?.forEach((r) => {
        r.geo.dispose();
        r.tex.dispose();
      }),
    [rings],
  );

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !rings) return;
    const fade = Math.min(1, state.clock.elapsedTime / 5);
    g.children.forEach((m, i) => {
      m.rotation.y += delta * rings[i].speed;
      ((m as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = OPACITY * fade;
    });
  });

  if (!rings) return null;
  return (
    <group ref={group} position-y={0.003}>
      {rings.map((r, i) => (
        <mesh key={i} geometry={r.geo} renderOrder={-1}>
          <meshBasicMaterial
            map={r.tex}
            transparent
            opacity={0}
            depthWrite={false}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
