"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, Line, MeshReflectorMaterial, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { strike } from "./bowl";

/* =====================================================================
   One shot in a pale, calm studio with light falling from behind.
   1. 108 loose red-sandalwood beads lie in a slow spiral on the floor.
   2. A brass needle draws a thread through them, one by one (a loader).
   3. The strung beads gather into a circle, the two ends cross, a knot is
      tied and pulled tight; the guru bead and tassel settle. A bowl rings.
   4. The mala is then elastic: drag it, let go, it springs back.
   ===================================================================== */

const N = 108;
const BEAD = 0.06;
const Y = BEAD * 0.9; // bead centre height when resting on the floor
const GAP = BEAD * 2.04; // centre-to-centre spacing on the thread
const R = (N * GAP) / (Math.PI * 2); // closed-circle radius
const TAIL = 6; // points per loose thread end

// Timeline (seconds)
const T_THREAD = 1.2;
const T_GATHER = 6.0;
const T_TIE = 8.4;
const T_REST = 10.2;

const FRONT = Math.PI / 2; // angle on the floor that faces the camera (+z)

const BG = "#e5d9c6";
const THREAD = "#9a6a36";

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

/* Scratch objects reused every frame (no allocations in the loop). */
const scratch = new THREE.Object3D();
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y);

/** Shot clock and interaction state, shared by the scene parts. */
const shot = { t: 0, dragging: -1, hover: false };

/* ---------- Procedural heartwood ---------- */
function makeWoodMaps() {
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

/* ---------- Layouts ---------- */

/** Loose beads lying in a slow inward spiral, with room between them. */
function spiralLayout() {
  const r = rng(41);
  const turns = 2.1;
  const S = 4000;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= S; i++) {
    const u = i / S;
    const a = FRONT + 0.6 + u * turns * Math.PI * 2;
    const rad = lerp(2.7, 0.7, u);
    pts.push(new THREE.Vector3(Math.cos(a) * rad, Y, Math.sin(a) * rad * 0.92));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const p = curve.getPointAt(i / (N - 1));
    p.x += (r() - 0.5) * 0.03;
    p.z += (r() - 0.5) * 0.03;
    out.push(p);
  }
  return out;
}

/** The strung circle, open by `gap` radians at the front, with radius `rad`. */
function circleAt(i: number, gap: number, rad: number, out: THREE.Vector3) {
  const a = FRONT + gap / 2 + ((Math.PI * 2 - gap) * i) / (N - 1);
  return out.set(Math.cos(a) * rad, Y, Math.sin(a) * rad);
}

type Sim = {
  pos: Float32Array;
  vel: Float32Array;
  rest: Float32Array;
  thread: Float32Array;
  struck: boolean;
  lastCount: number;
  phase: string;
  grabStretch: number;
};

function makeSim(): Sim {
  const rest = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    circleAt(i, (GAP / R) * 0.98, R, v1);
    rest.set([v1.x, v1.y, v1.z], i * 3);
  }
  return {
    pos: new Float32Array(N * 3),
    vel: new Float32Array(N * 3),
    rest,
    thread: new Float32Array((N + TAIL * 2) * 3),
    struck: false,
    lastCount: -1,
    phase: "",
    grabStretch: 0,
  };
}

/* ---------- The mala ---------- */
function Mala({ mobile }: { mobile: boolean }) {
  const beads = useRef<THREE.InstancedMesh>(null);
  const guru = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);
  const needle = useRef<THREE.Mesh>(null);
  const line = useRef<Line2>(null);
  const sim = useRef<Sim | null>(null);
  const spiral = useMemo(() => spiralLayout(), []);

  const { geo, mat, brass, silk, cord, colors, spins } = useMemo(() => {
    const { map, bumpMap } = makeWoodMaps();
    const geo = new THREE.SphereGeometry(BEAD, 48, 32);
    geo.scale(1, 0.9, 1);
    const mat = new THREE.MeshPhysicalMaterial({
      map,
      bumpMap,
      bumpScale: 0.12,
      roughnessMap: bumpMap,
      roughness: 0.55,
      clearcoat: 0.45,
      clearcoatRoughness: 0.3,
    });
    const brass = new THREE.MeshPhysicalMaterial({ color: "#b8935a", metalness: 1, roughness: 0.28, clearcoat: 0.4 });
    const silk = new THREE.MeshPhysicalMaterial({ color: "#6e1d14", roughness: 0.7 });
    const cord = new THREE.MeshStandardMaterial({ color: THREAD, roughness: 0.8 });
    const r = rng(91);
    const colors = new Float32Array(N * 3);
    const col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      col.setHSL(0.02 + r() * 0.025, 0.5 + r() * 0.2, 0.62 + r() * 0.22);
      colors.set([col.r, col.g, col.b], i * 3);
    }
    const spins = Array.from({ length: N }, () => [r() * 6.28, r() * 6.28, r() * 6.28] as const);
    return { geo, mat, brass, silk, cord, colors, spins };
  }, []);

  const tassel = useMemo(() => {
    const r = rng(13);
    return Array.from({ length: 70 }, () => ({ ang: (r() - 0.5) * 0.22, len: 0.3 + r() * 0.08, lift: r() * 0.012 }));
  }, []);

  const initialThread = useMemo(() => Array.from({ length: N + TAIL * 2 }, () => new THREE.Vector3(0, -1, 0)), []);

  // Let go of the ring wherever the pointer is released; the bowl answers the pull.
  useEffect(() => {
    const up = () => {
      if (shot.dragging < 0) return;
      strike(Math.min(1, 0.25 + (sim.current?.grabStretch ?? 0) * 0.6), 1.25);
      shot.dragging = -1;
      document.body.style.cursor = "";
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      shot.t = 0;
      shot.dragging = -1;
    };
  }, []);

  const nearest = useCallback((p: THREE.Vector3) => {
    const s = sim.current;
    if (!s || shot.t < T_REST) return -1;
    let best = -1;
    let bd = 0.36 * 0.36;
    for (let i = 0; i < N; i++) {
      const dx = s.pos[i * 3] - p.x;
      const dz = s.pos[i * 3 + 2] - p.z;
      const d = dx * dx + dz * dz;
      if (d < bd) {
        bd = d;
        best = i;
      }
    }
    return best;
  }, []);

  const onDown = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      const i = nearest(e.point);
      if (i < 0) return;
      shot.dragging = i;
      document.body.style.cursor = "grabbing";
      e.stopPropagation();
    },
    [nearest],
  );
  const onMove = useCallback(
    (e: ThreeEvent<PointerEvent>) => {
      if (shot.dragging >= 0) return;
      const over = nearest(e.point) >= 0;
      if (over !== shot.hover) {
        shot.hover = over;
        document.body.style.cursor = over ? "grab" : "";
      }
    },
    [nearest],
  );

  useFrame((state, delta) => {
    const mesh = beads.current;
    if (!mesh) return;
    if (!mesh.instanceColor) mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    if (!sim.current) sim.current = makeSim();
    const s = sim.current;
    // The story runs on real time (so a slow device doesn't slow the film); physics steps are clamped.
    shot.t += Math.min(delta, 0.25);
    const dt = Math.min(delta, 1 / 30);
    const t = shot.t;

    // ---------- where each bead is ----------
    const threadP = clamp01((t - T_THREAD) / (T_GATHER - T_THREAD));
    const strung = threadP * (N - 1); // continuous index of the needle
    const tieP = smooth(clamp01((t - T_TIE) / (T_REST - T_TIE)));
    const gap = lerp(0.55, (GAP / R) * 0.98, tieP);
    const rad = lerp(R * 1.06, R, tieP);

    if (t < T_REST) {
      for (let i = 0; i < N; i++) {
        // Stagger the gathering so the circle closes like a drawstring.
        const g = smooth(clamp01((t - T_GATHER - (i / N) * 0.9) / 1.6));
        circleAt(i, gap, rad, v1);
        const a = spiral[i];
        // While being strung, a bead lifts a hair as the needle passes.
        const pass = t < T_GATHER ? Math.exp(-Math.pow((strung - i) * 0.9, 2)) * 0.04 : 0;
        s.pos[i * 3] = lerp(a.x, v1.x, g);
        s.pos[i * 3 + 1] = Y + pass + Math.sin(g * Math.PI) * 0.05;
        s.pos[i * 3 + 2] = lerp(a.z, v1.z, g);
      }
    } else {
      // ---------- elastic ring ----------
      const k = 26;
      const damp = Math.exp(-6 * dt);
      for (let i = 0; i < N * 3; i += 3) {
        s.vel[i] = (s.vel[i] + (s.rest[i] - s.pos[i]) * k * dt) * damp;
        s.vel[i + 2] = (s.vel[i + 2] + (s.rest[i + 2] - s.pos[i + 2]) * k * dt) * damp;
        s.pos[i] += s.vel[i] * dt;
        s.pos[i + 2] += s.vel[i + 2] * dt;
        s.pos[i + 1] = Y;
      }
      const d = shot.dragging;
      if (d >= 0) {
        state.raycaster.setFromCamera(state.pointer, state.camera);
        if (state.raycaster.ray.intersectPlane(floorPlane, v1)) {
          // The thread stretches, but only so far.
          v2.set(s.rest[d * 3], Y, s.rest[d * 3 + 2]);
          const off = v1.sub(v2);
          const max = 1.4;
          if (off.length() > max) off.setLength(max);
          s.grabStretch = off.length() / max;
          s.pos[d * 3] = v2.x + off.x;
          s.pos[d * 3 + 2] = v2.z + off.z;
          s.vel[d * 3] = 0;
          s.vel[d * 3 + 2] = 0;
        }
      }
      // Neighbours keep their spacing: never overlap, resist stretching.
      for (let it = 0; it < 4; it++) {
        for (let i = 0; i < N; i++) {
          const j = (i + 1) % N;
          const dx = s.pos[j * 3] - s.pos[i * 3];
          const dz = s.pos[j * 3 + 2] - s.pos[i * 3 + 2];
          const dist = Math.hypot(dx, dz) || 1e-6;
          const corr = ((dist - GAP) / dist) * (dist < GAP ? 0.5 : 0.22);
          const wi = i === d ? 0 : 1;
          const wj = j === d ? 0 : 1;
          const sum = wi + wj || 1;
          s.pos[i * 3] += dx * corr * (wi / sum);
          s.pos[i * 3 + 2] += dz * corr * (wi / sum);
          s.pos[j * 3] -= dx * corr * (wj / sum);
          s.pos[j * 3 + 2] -= dz * corr * (wj / sum);
        }
      }
    }

    // ---------- draw beads ----------
    for (let i = 0; i < N; i++) {
      const appear = smooth(clamp01((t - (i / N) * 1.0) / 0.5));
      scratch.position.set(s.pos[i * 3], s.pos[i * 3 + 1], s.pos[i * 3 + 2]);
      const [a, b, c] = spins[i];
      // Once on the thread, each bead turns so its hole follows the strand.
      const settle = smooth(clamp01((strung - i) / 3));
      scratch.rotation.set(lerp(a, Math.PI / 2, settle), lerp(b, -FRONT, settle), lerp(c, 0, settle));
      scratch.scale.setScalar(Math.max(0.0001, appear));
      scratch.updateMatrix();
      mesh.setMatrixAt(i, scratch.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    // ---------- junction where the two ends meet ----------
    const e = (N - 1) * 3;
    const jx = (s.pos[0] + s.pos[e]) / 2;
    const jz = (s.pos[2] + s.pos[e + 2]) / 2;
    const jl = Math.hypot(jx, jz) || 1;
    const ox = jx / jl;
    const oz = jz / jl;

    // ---------- the thread ----------
    const th = s.thread;
    const tip = Math.min(N - 1, Math.floor(strung));
    const frac = strung - tip;
    const tipX = tip < N - 1 ? lerp(s.pos[tip * 3], s.pos[(tip + 1) * 3], frac) : s.pos[tip * 3];
    const tipZ = tip < N - 1 ? lerp(s.pos[tip * 3 + 2], s.pos[(tip + 1) * 3 + 2], frac) : s.pos[tip * 3 + 2];
    const loose = 1 - tieP;
    // Free end before bead 0: a curl of slack, drawn in as the knot is tied.
    for (let k = 0; k < TAIL; k++) {
      const u = 1 - k / TAIL; // 1 = free end
      const lx = s.pos[0] + ox * 0.5 * u - oz * 0.18 * Math.sin(u * 3);
      const lz = s.pos[2] + oz * 0.5 * u + ox * 0.18 * Math.sin(u * 3);
      th[k * 3] = lerp(jx + ox * 0.2 * u, lx, loose);
      th[k * 3 + 1] = Y;
      th[k * 3 + 2] = lerp(jz + oz * 0.2 * u, lz, loose);
    }
    for (let i = 0; i < N; i++) {
      const o = (TAIL + i) * 3;
      const ahead = t < T_GATHER && i > tip;
      th[o] = ahead ? tipX : s.pos[i * 3];
      th[o + 1] = ahead ? Y : s.pos[i * 3 + 1];
      th[o + 2] = ahead ? tipZ : s.pos[i * 3 + 2];
    }
    for (let k = 0; k < TAIL; k++) {
      const u = (k + 1) / TAIL;
      const o = (TAIL + N + k) * 3;
      if (t < T_GATHER) {
        th[o] = tipX;
        th[o + 1] = Y;
        th[o + 2] = tipZ;
        continue;
      }
      const lx = s.pos[e] + ox * 0.5 * u + oz * 0.18 * Math.sin(u * 3);
      const lz = s.pos[e + 2] + oz * 0.5 * u - ox * 0.18 * Math.sin(u * 3);
      th[o] = lerp(jx + ox * 0.2 * u, lx, loose);
      th[o + 1] = Y;
      th[o + 2] = lerp(jz + oz * 0.2 * u, lz, loose);
    }
    line.current?.geometry.setPositions(th);

    // Needle leads the thread while stringing.
    const nd = needle.current;
    if (nd) {
      const on = t > T_THREAD - 0.3 && t < T_GATHER + 0.2;
      nd.visible = on;
      if (on) {
        const nx = tip < N - 1 ? s.pos[(tip + 1) * 3] - s.pos[tip * 3] : 1;
        const nz = tip < N - 1 ? s.pos[(tip + 1) * 3 + 2] - s.pos[tip * 3 + 2] : 0;
        nd.position.set(tipX, Y + 0.01, tipZ);
        nd.quaternion.setFromUnitVectors(UP, v1.set(nx, 0, nz).normalize());
      }
    }

    const kn = knot.current;
    if (kn) {
      const kp = smooth(clamp01((t - T_TIE - 0.6) / 1.0));
      kn.visible = kp > 0;
      kn.position.set(jx + ox * 0.2, Y * 0.7, jz + oz * 0.2);
      kn.scale.setScalar(Math.max(0.0001, kp));
      kn.rotation.set(Math.PI / 2, 0, t * (1 - kp) * 4);
    }
    const gu = guru.current;
    if (gu) {
      const gp = smooth(clamp01((t - T_TIE - 0.2) / 1.2));
      gu.visible = gp > 0;
      gu.position.set(jx + ox * 0.08, Y + (1 - gp) * 0.8, jz + oz * 0.08);
      gu.rotation.y = Math.atan2(ox, oz);
    }
    if (!s.struck && t > T_TIE + 1.4) {
      s.struck = true;
      strike(0.9);
    }

    // The loading counter in the page follows the needle.
    const count = t < T_THREAD ? 0 : Math.min(N, Math.round(strung + 1));
    if (count !== s.lastCount) {
      s.lastCount = count;
      const el = document.getElementById("bead-count");
      if (el) el.textContent = String(count).padStart(3, "0");
    }
    const phase = t > T_REST ? "rest" : t > T_TIE ? "tie" : t > T_GATHER ? "gather" : "thread";
    if (phase !== s.phase) {
      s.phase = phase;
      document.documentElement.dataset.shot = phase;
    }
  });

  return (
    <group>
      {/* invisible floor catcher for grabbing the ring */}
      <mesh rotation-x={-Math.PI / 2} position-y={Y} onPointerDown={onDown} onPointerMove={onMove} visible={false}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <instancedMesh ref={beads} args={[geo, mat, N]} castShadow receiveShadow frustumCulled={false} />
      <Line ref={line} points={initialThread} color={THREAD} lineWidth={mobile ? 1.2 : 1.6} />
      <mesh ref={needle} material={brass} visible={false} castShadow>
        <cylinderGeometry args={[0.004, 0.0015, 0.22, 8]} />
      </mesh>
      <mesh ref={knot} material={cord} visible={false} castShadow>
        <torusKnotGeometry args={[0.022, 0.0075, 96, 10, 2, 3]} />
      </mesh>
      <group ref={guru} visible={false}>
        <mesh material={brass} position-y={BEAD * 0.4} castShadow>
          <sphereGeometry args={[BEAD * 1.3, 48, 32]} />
        </mesh>
        {tassel.map((tt, k) => (
          <mesh
            key={k}
            material={silk}
            position={[Math.sin(tt.ang) * (tt.len / 2), -Y + 0.01 + tt.lift, 0.2 + Math.cos(tt.ang) * (tt.len / 2)]}
            rotation={[Math.PI / 2, 0, -tt.ang]}
            castShadow
          >
            <cylinderGeometry args={[0.0035, 0.003, tt.len, 4]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/* ---------- Light falling from behind ---------- */
function rayTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 512;
  const g = c.getContext("2d")!;
  const v = g.createLinearGradient(0, 0, 0, 512);
  v.addColorStop(0, "rgba(255,255,255,0)");
  v.addColorStop(0.15, "rgba(255,255,255,0.9)");
  v.addColorStop(0.6, "rgba(255,255,255,0.35)");
  v.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = v;
  g.fillRect(0, 0, 64, 512);
  g.globalCompositeOperation = "destination-in";
  const h = g.createLinearGradient(0, 0, 64, 0);
  h.addColorStop(0, "rgba(0,0,0,0)");
  h.addColorStop(0.5, "rgba(0,0,0,1)");
  h.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = h;
  g.fillRect(0, 0, 64, 512);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function Rays() {
  const group = useRef<THREE.Group>(null);
  const { tex, beams } = useMemo(() => {
    const r = rng(17);
    return {
      tex: rayTexture(),
      beams: Array.from({ length: 7 }, (_, i) => ({
        x: -2.6 + i * 0.75 + (r() - 0.5) * 0.4,
        w: 0.5 + r() * 1.1,
        tilt: (i - 3) * 0.07 + (r() - 0.5) * 0.05,
        o: 0.1 + r() * 0.12,
        speed: 0.15 + r() * 0.2,
        phase: r() * 6.28,
      })),
    };
  }, []);
  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const fadeIn = clamp01(t / 3);
    g.children.forEach((m, i) => {
      const b = beams[i];
      const mat = (m as THREE.Mesh).material as THREE.MeshBasicMaterial;
      mat.opacity = b.o * fadeIn * (0.75 + 0.25 * Math.sin(t * b.speed + b.phase));
    });
  });
  // Beams run from the key light (high, behind) down to the mala.
  const quat = useMemo(() => {
    const dir = new THREE.Vector3(-1.2, 7, -5).normalize();
    return new THREE.Quaternion().setFromUnitVectors(UP, dir);
  }, []);
  return (
    <group ref={group} position={[-0.7, 3.9, -2.9]} quaternion={quat}>
      {beams.map((b, i) => (
        <mesh key={i} position-x={b.x * 0.7} rotation-y={b.tilt * 2} renderOrder={-1}>
          <planeGeometry args={[b.w, 9]} />
          <meshBasicMaterial
            map={tex}
            color="#fff3df"
            transparent
            opacity={0}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            fog={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ---------- Camera: low beside the needle, then cranes up to the circle ---------- */
function Camera({ mobile, focus }: { mobile: boolean; focus: (d: number) => void }) {
  const look = useMemo(() => new THREE.Vector3(), []);
  const from = useMemo(() => new THREE.Vector3(2.4, 0.7, 3.6), []);
  const mid = useMemo(() => new THREE.Vector3(0.8, mobile ? 5.2 : 3.4, mobile ? 6.4 : 5.4), [mobile]);
  const to = useMemo(() => new THREE.Vector3(0, mobile ? 6.6 : 3.7, mobile ? 7.8 : 7.9), [mobile]);
  const finalLook = useMemo(() => new THREE.Vector3(0, mobile ? -1.5 : -1.05, mobile ? 1.9 : 1.5), [mobile]);
  useFrame((state) => {
    const t = shot.t;
    const cam = state.camera;
    const a = easeInOut(clamp01(t / T_GATHER));
    const b = easeInOut(clamp01((t - T_GATHER + 0.5) / (T_REST - T_GATHER + 0.5)));
    cam.position.lerpVectors(from, mid, a).lerp(to, b);
    if (shot.dragging < 0) {
      cam.position.x += state.pointer.x * 0.18 * b;
      cam.position.y += state.pointer.y * 0.08 * b;
    }
    const idle = Math.max(0, t - T_REST);
    cam.position.x += Math.sin(idle * 0.07) * 0.3 * Math.min(1, idle / 5);
    look.set(lerp(0.9, 0, a), 0, lerp(1.2, 0, a)).lerp(finalLook, b);
    cam.lookAt(look);
    focus(cam.position.distanceTo(look));
  });
  return null;
}

function Floor({ mobile }: { mobile: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[60, 60]} />
      {mobile ? (
        <meshStandardMaterial color="#e6dac8" roughness={0.85} />
      ) : (
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={0.9}
          mixContrast={1}
          roughness={0.9}
          metalness={0.05}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#e6dac8"
          mirror={0}
        />
      )}
    </mesh>
  );
}

function Lights() {
  const { scene } = useThree();
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    scene.add(o);
    return o;
  }, [scene]);
  return (
    <>
      {/* Key light from behind and above, along the rays, so shadows fall toward us. */}
      <spotLight
        position={[-1.2, 7, -5]}
        target={target}
        angle={0.5}
        penumbra={1}
        intensity={260}
        color="#fff0da"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      <hemisphereLight args={["#fbf5ec", "#d9c7ae", 1.1]} />
      <directionalLight position={[2, 3, 6]} intensity={0.5} color="#fff6ea" />
    </>
  );
}

export default function MalaScene({ mobile = false }: { mobile?: boolean }) {
  // Phones start light; laptops drop to the light setup if the frame rate falls.
  const [lite, setLite] = useState(mobile);
  const [dpr, setDpr] = useState(mobile ? 1.3 : 1.6);
  const dof = useRef<DepthOfFieldEffect>(null);
  const focus = useCallback((d: number) => {
    if (dof.current) dof.current.cocMaterial.focusDistance = d;
  }, []);
  return (
    <Canvas
      shadows="soft"
      dpr={dpr}
      camera={{ position: [2.4, 0.7, 3.6], fov: mobile ? 44 : 30, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
      }}
    >
      <PerformanceMonitor
        onDecline={() => {
          setLite(true);
          setDpr(1);
        }}
        flipflops={2}
        onFallback={() => {
          setLite(true);
          setDpr(1);
        }}
      />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, mobile ? 9 : 8, mobile ? 20 : 17]} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff4e4" position={[-2, 5, -4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#f5e6cf" position={[4, 2, 3]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, 6, 4]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
      </Environment>
      <Lights />
      <Rays />
      <Mala mobile={mobile} />
      <Floor mobile={lite} />
      <Sparkles count={mobile ? 30 : 60} scale={[6, 4, 5]} position={[0, 2, -1]} size={2} speed={0.12} color="#b08d57" opacity={0.5} />
      <Camera mobile={mobile} focus={focus} />
      {lite ? (
        <EffectComposer multisampling={0}>
          <Vignette offset={0.35} darkness={0.4} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={2}>
          <DepthOfField ref={dof} focusDistance={7} focusRange={3} bokehScale={2.6} height={540} />
          <Vignette offset={0.35} darkness={0.42} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
