"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { glowFragment, glowVertex } from "./materials";
import { LOOP, RET0 } from "./timeline";

/* =====================================================================
   The story behind the mala, told as an animated storybook in sepia
   (public-domain prints by Raja Ravi Varma and the Ravi Varma Press):

   1 court   Ayodhya, the day Rama was crowned.
   2 sita    Sita lifts the necklace from her neck,
   3 gift    and gives it to Hanuman. The necklace (a ring of light)
             travels from her hands to his, as the real mala's knot is tied.
   4 —       (the full view) He turns it bead by bead, searching.
   5 search  Hanuman holds it; the beads loosen as he looks for Rama.
   6 heart   "What does not hold Rama is not precious to me." He opens
             his heart: Rama and Sita are there.
   ...and the loop returns to the court.

   The stage floats behind the beads, following the camera with a little
   lag so it reads as part of the scene, and fades out for the still view.
   Captions are written into #story-line in the page.
   ===================================================================== */

type Beat = { from: number; to: number; panels: Partial<Record<Panel, number>>; line: string };
type Panel = "court" | "sita" | "hanuman" | "heart";

const SRC: Record<Panel, string> = {
  court: "/story/court.webp",
  sita: "/story/sita.webp",
  hanuman: "/story/hanuman.webp",
  heart: "/story/heart.webp",
};

// Where each figure stands on the stage (stage units, facing the camera).
const LAYOUT: Record<Panel, { x: number; y: number; h: number }> = {
  court: { x: 0, y: 0.15, h: 3.5 },
  sita: { x: -1.25, y: 0.05, h: 3.4 },
  hanuman: { x: 1.35, y: 0.05, h: 3.4 },
  heart: { x: 0, y: 0.15, h: 3.5 },
};

const SITA_HANDS = new THREE.Vector3(-1.2, -0.25, 0.05);
const HANUMAN_HANDS = new THREE.Vector3(1.55, 0.35, 0.05);
const HEART = new THREE.Vector3(0, -0.05, 0.05);

const BEATS: Beat[] = [
  { from: 0, to: 2.2, panels: { court: 1 }, line: "Ayodhya, the day Rama was crowned." },
  { from: 2.2, to: 4.4, panels: { sita: 1 }, line: "Sita lifted the necklace from her neck," },
  { from: 4.4, to: 7.4, panels: { sita: 0.75, hanuman: 1 }, line: "and gave it to Hanuman, the most devoted of all." },
  { from: 7.4, to: RET0, panels: {}, line: "He turned it bead by bead, looking for Rama in each one." },
  { from: RET0, to: RET0 + 2, panels: { hanuman: 1 }, line: "“Whatever does not hold Rama is not precious to me.”" },
  { from: RET0 + 2, to: LOOP + 0.01, panels: { heart: 1 }, line: "He opened his heart. Rama and Sita were there." },
];

const RING = 28; // points in the necklace of light
const FADE = 0.7;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);

export type StoryCue = () => { t: number; vis: number };

const loader = new THREE.TextureLoader();
const camDir = new THREE.Vector3();
const target = new THREE.Vector3();
const tmp = new THREE.Vector3();

/** How much of a panel shows at time t: its weight in the beat, eased in and out. */
function weight(p: Panel, t: number) {
  let w = 0;
  for (const b of BEATS) {
    const v = b.panels[p];
    if (!v) continue;
    const inn = smooth(clamp01((t - b.from) / FADE));
    const out = 1 - smooth(clamp01((t - b.to + FADE * 0.5) / FADE));
    // Panels carried over from the previous beat do not fade in again.
    const prev = BEATS[BEATS.indexOf(b) - 1];
    const held = prev && prev.panels[p] ? 1 : inn;
    w = Math.max(w, v * held * out);
  }
  return w;
}

export function Story({ cue }: { cue: StoryCue }) {
  const stage = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Points>(null);
  const ringMat = useRef<THREE.ShaderMaterial>(null);
  const meshes = useRef<Partial<Record<Panel, THREE.Mesh>>>({});
  const last = useRef(-1);
  const [tex, setTex] = useState<Record<Panel, { t: THREE.Texture; aspect: number }> | null>(null);

  const ringGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RING * 3), 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(RING), 1));
    g.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(RING), 1));
    return g;
  }, []);
  const ringUniforms = useMemo(() => ({ uScale: { value: 500 }, uColor: { value: new THREE.Color("#e2a04a") } }), []);

  useEffect(() => {
    let alive = true;
    const keys = Object.keys(SRC) as Panel[];
    void Promise.all(
      keys.map((k) =>
        loader.loadAsync(SRC[k]).then((t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 4;
          const img = t.image as { width: number; height: number };
          return [k, { t, aspect: img.width / img.height }] as const;
        }),
      ),
    )
      .then((pairs) => {
        if (alive) setTex(Object.fromEntries(pairs) as Record<Panel, { t: THREE.Texture; aspect: number }>);
      })
      .catch(() => {
        /* the film still plays without the story art */
      });
    return () => {
      alive = false;
    };
  }, []);
  useEffect(() => () => Object.values(tex ?? {}).forEach((v) => v.t.dispose()), [tex]);

  useFrame((state, delta) => {
    const { t, vis } = cue();
    const T = state.clock.elapsedTime;

    // ---------- caption ----------
    const beat = BEATS.findIndex((b) => t >= b.from && t < b.to);
    if (beat !== last.current) {
      last.current = beat;
      const el = document.getElementById("story-line");
      if (el) {
        el.classList.remove("is-in");
        void el.offsetWidth; // restart the fade
        el.textContent = beat >= 0 ? BEATS[beat].line : "";
        el.classList.add("is-in");
      }
    }

    const g = stage.current;
    if (!g || !tex) return;
    g.visible = vis > 0.002;
    if (!g.visible) return;

    // ---------- stage follows the camera, a little behind it in time ----------
    const cam = state.camera;
    cam.getWorldDirection(camDir);
    target.copy(cam.position).addScaledVector(camDir, 8.5);
    target.y = Math.max(target.y - 0.45, 0.95);
    const k = 1 - Math.exp(-3 * Math.min(delta, 0.05));
    g.position.lerp(target, k);
    g.quaternion.slerp(cam.quaternion, k);

    // ---------- panels ----------
    (Object.keys(LAYOUT) as Panel[]).forEach((p) => {
      const m = meshes.current[p];
      if (!m) return;
      const w = weight(p, t);
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.62 * w * vis;
      m.visible = mat.opacity > 0.002;
      // A slow push-in while a panel is on screen, and a breath of movement.
      const L = LAYOUT[p];
      m.scale.setScalar(1 + 0.05 * w + Math.sin(T * 0.5) * 0.005);
      m.position.set(L.x + (1 - w) * (L.x >= 0 ? 0.35 : -0.35), L.y + Math.sin(T * 0.6 + L.x) * 0.03, 0);
    });

    // ---------- the necklace of light ----------
    const pts = ring.current;
    if (!pts) return;
    const pos = pts.geometry.attributes.position.array as Float32Array;
    const size = pts.geometry.attributes.aSize.array as Float32Array;
    const alpha = pts.geometry.attributes.aAlpha.array as Float32Array;
    let centre = SITA_HANDS;
    let on = 0;
    let loosen = 0;
    let radius = 0.26;
    if (t >= 2.6 && t < 4.8) {
      // Sita lifts it: it rises a little from her hands and brightens.
      on = smooth(clamp01((t - 2.6) / 0.6));
      centre = tmp.copy(SITA_HANDS).setY(SITA_HANDS.y + 0.25 * smooth(clamp01((t - 2.6) / 1.8)));
    } else if (t >= 4.8 && t < 7.4) {
      // She gives it: an arc from her hands to his.
      const a = smooth(clamp01((t - 4.8) / 1.8));
      centre = tmp.lerpVectors(SITA_HANDS, HANUMAN_HANDS, a);
      centre.y += Math.sin(a * Math.PI) * 0.38 + 0.25 * (1 - a);
      on = 1;
    } else if (t >= RET0 && t < RET0 + 2) {
      // He searches: the beads loosen and drift apart.
      centre = HANUMAN_HANDS;
      on = smooth(clamp01((t - RET0) / 0.5)) * (1 - smooth(clamp01((t - RET0 - 1.6) / 0.4)));
      loosen = smooth(clamp01((t - RET0 - 0.3) / 1.4));
    } else if (t >= RET0 + 2 && t < LOOP) {
      // His heart: one warm glow where Rama and Sita are.
      centre = HEART;
      on = smooth(clamp01((t - RET0 - 2.2) / 0.6));
      radius = 0;
    }
    for (let i = 0; i < RING; i++) {
      const a = (i / RING) * Math.PI * 2 + T * 0.6;
      const drift = loosen * (0.15 + ((i * 37) % 11) / 22);
      const r = radius + drift;
      pos[i * 3] = centre.x + Math.cos(a) * r;
      pos[i * 3 + 1] = centre.y + Math.sin(a) * r * 0.55 - loosen * 0.2 * ((i % 3) / 2);
      pos[i * 3 + 2] = centre.z;
      size[i] = radius === 0 ? (i === 0 ? 0.9 + Math.sin(T * 3) * 0.08 : 0) : 0.12;
      alpha[i] = on * vis * (radius === 0 ? 0.9 : 0.85 * (1 - loosen * 0.6));
    }
    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.aSize.needsUpdate = true;
    pts.geometry.attributes.aAlpha.needsUpdate = true;
    if (ringMat.current) {
      const pc = cam as THREE.PerspectiveCamera;
      ringMat.current.uniforms.uScale.value =
        (state.size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(pc.fov) / 2));
    }
  });

  if (!tex) return null;
  return (
    <group ref={stage} visible={false}>
      {(Object.keys(LAYOUT) as Panel[]).map((p) => (
        <mesh
          key={p}
          ref={(m) => {
            if (m) meshes.current[p] = m;
          }}
          renderOrder={-1}
          visible={false}
        >
          <planeGeometry args={[LAYOUT[p].h * tex[p].aspect, LAYOUT[p].h]} />
          <meshBasicMaterial map={tex[p].t} transparent opacity={0} depthWrite={false} fog={false} toneMapped={false} />
        </mesh>
      ))}
      <points ref={ring} geometry={ringGeo} frustumCulled={false} renderOrder={0}>
        <shaderMaterial
          ref={ringMat}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={ringUniforms}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

