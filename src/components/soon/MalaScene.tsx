"use client";

import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Environment, Lightformer, Line, PerformanceMonitor, Sparkles } from "@react-three/drei";
import { DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { Line2 } from "three-stdlib";
import { strike } from "./bowl";
import { glowFragment, glowVertex, makeWoodMaps, rng } from "./materials";
import { FloorInscriptions } from "./Inscriptions";
import { Motifs } from "./Motifs";
import { Floor, Lights, Rays, SOURCE, rayTexture } from "./Studio";

/* =====================================================================
   A loop, like life. In a pale, calm studio light falls from behind.
   1. Draw    A spark of light descends the ray and runs around a circle,
              laying a golden thread. Each bead is born from the light:
              it streams down the ray, glowing, and cools into red wood.
   2. Tie     The ends meet, a knot is tied and pulled tight; the guru
              bead and tassel settle. A singing bowl rings.
   3. Rest    The mala is elastic: draw it out, let go, it springs back.
   4. Return  The light runs back along the thread; each bead rises up
              the ray into the light, and the thread unwinds.
   ...and the same light descends again. The end is the beginning.
   ===================================================================== */

const N = 108;
const BEAD = 0.06;
const Y = BEAD * 0.9;
const GAP = BEAD * 2.04;
const R = (N * GAP) / (Math.PI * 2);
const TAIL = 6;
const FRONT = Math.PI / 2;

// One cycle (seconds)
const DRAW0 = 1.1;
const DRAW = 5.0;
const TIE0 = DRAW0 + DRAW + 0.5;
const TIE = 1.8;
const REST0 = TIE0 + TIE;
const RET0 = REST0 + 8;
const RET = 3.4;
const LOOP = RET0 + RET + 0.8;
const FALL = 0.6; // a bead's journey down the ray
const COOL = 1.4; // glow fading into wood

const BG = "#e5d9c6";
const THREAD = "#9a6a36";

const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => x * x * (3 - 2 * x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIn = (x: number) => x * x * x;
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const lerp = THREE.MathUtils.lerp;

const scratch = new THREE.Object3D();
const v1 = new THREE.Vector3();
const v2 = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);
const floorPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -Y);
/** Where a bead enters the frame: part-way up the ray of light. */
const RAY_START = 0.42;

/** Shot clock and interaction state. `total` keeps running across loops. */
const shot = { t: 0, total: 0, cycle: 0, dragging: -1, hover: false, hold: false };

function circleAt(i: number, gap: number, rad: number, out: THREE.Vector3) {
  const a = FRONT + gap / 2 + ((Math.PI * 2 - gap) * i) / (N - 1);
  return out.set(Math.cos(a) * rad, Y, Math.sin(a) * rad);
}

type Sim = {
  pos: Float32Array;
  vel: Float32Array;
  rest: Float32Array;
  from: Float32Array; // where each bead was when the return began
  thread: Float32Array;
  phase: string;
  count: number;
  rang: number; // cycle in which the bowl last rang for the knot
  captured: number; // cycle in which `from` was captured
  grabStretch: number;
};

function makeSim(): Sim {
  const rest = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    circleAt(i, (GAP / R) * 0.98, R, v1);
    rest.set([v1.x, v1.y, v1.z], i * 3);
  }
  return {
    pos: rest.slice(),
    vel: new Float32Array(N * 3),
    rest,
    from: new Float32Array(N * 3),
    thread: new Float32Array((N + TAIL * 2) * 3),
    phase: "",
    count: -1,
    rang: -1,
    captured: -1,
    grabStretch: 0,
  };
}

function Mala({ mobile }: { mobile: boolean }) {
  const beads = useRef<THREE.InstancedMesh>(null);
  const glow = useRef<THREE.Points>(null);
  const glowMat = useRef<THREE.ShaderMaterial>(null);
  const beam = useRef<THREE.Mesh>(null);
  const guru = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Mesh>(null);
  const line = useRef<Line2>(null);
  const sim = useRef<Sim | null>(null);

  const { geo, mat, brass, silk, cord, spins, beamMat, glowGeo, glowUniforms } = useMemo(() => {
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
    const spins = Array.from({ length: N }, () => [r() * 6.28, r() * 6.28, r() * 6.28] as const);
    const beamMat = new THREE.MeshBasicMaterial({
      map: rayTexture(),
      color: "#fff1d6",
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
      toneMapped: false,
      side: THREE.DoubleSide,
    });
    // One glow per bead plus one for the spark of light.
    const glowGeo = new THREE.BufferGeometry();
    glowGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array((N + 1) * 3), 3));
    glowGeo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N + 1), 1));
    glowGeo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(N + 1), 1));
    const glowUniforms = { uScale: { value: 500 }, uColor: { value: new THREE.Color("#ffd49a") } };
    return { geo, mat, brass, silk, cord, spins, beamMat, glowGeo, glowUniforms };
  }, []);

  const tassel = useMemo(() => {
    const r = rng(13);
    return Array.from({ length: 70 }, () => ({ ang: (r() - 0.5) * 0.22, len: 0.3 + r() * 0.08, lift: r() * 0.012 }));
  }, []);
  const initialThread = useMemo(() => Array.from({ length: N + TAIL * 2 }, () => new THREE.Vector3(0, -1, 0)), []);

  useEffect(() => {
    // Review aid: `/?at=21` starts the shot at 21 s (and `&hold` freezes it there).
    const q = new URLSearchParams(window.location.search);
    const at = Number(q.get("at"));
    if (at > 0) Object.assign(shot, { t: at % LOOP, total: 30, hold: q.has("hold") });
    if (at % LOOP > TIE0) document.documentElement.dataset.tied = "1";
  }, []);

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
      Object.assign(shot, { t: 0, total: 0, cycle: 0, dragging: -1, hover: false, hold: false });
    };
  }, []);

  const nearest = useCallback((p: THREE.Vector3) => {
    const s = sim.current;
    if (!s || shot.t < REST0 || shot.t > RET0) return -1;
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
    const pts = glow.current;
    if (!mesh || !pts) return;
    if (!sim.current) sim.current = makeSim();
    const s = sim.current;

    // ---------- clock: real time, held while someone is holding the mala ----------
    const step = Math.min(delta, 0.25);
    shot.total += step;
    if (!shot.hold && !(shot.dragging >= 0 && shot.t > RET0 - 0.5)) shot.t += step;
    if (shot.t >= LOOP) {
      shot.t -= LOOP;
      shot.cycle += 1;
    }
    const t = shot.t;
    const dt = Math.min(delta, 1 / 30);

    const head = clamp01((t - DRAW0) / DRAW) * (N - 1); // spark index while drawing
    const tieP = smooth(clamp01((t - TIE0) / TIE));
    const gap = lerp(0.42, (GAP / R) * 0.98, tieP);
    const rad = lerp(R * 1.04, R, tieP);
    const back = (N - 1) * (1 - clamp01((t - RET0) / (RET * 0.8))); // spark index while returning

    const sizes = pts.geometry.attributes.aSize.array as Float32Array;
    const alphas = pts.geometry.attributes.aAlpha.array as Float32Array;
    const gpos = pts.geometry.attributes.position.array as Float32Array;

    // Capture where every bead is the moment the return begins (it may have been pulled).
    if (t >= RET0 && s.captured !== shot.cycle) {
      s.captured = shot.cycle;
      s.from.set(s.pos);
    }

    for (let i = 0; i < N; i++) {
      const born = DRAW0 + (i / (N - 1)) * DRAW;
      const fall = easeOut(clamp01((t - born) / FALL));
      let gl = t >= born ? 1 - smooth(clamp01((t - born) / COOL)) : 0;
      let scale = t >= born ? lerp(0.35, 1, fall) : 0;

      if (t < REST0) {
        // Born from light: stream down the ray onto the thread.
        circleAt(i, gap, rad, v1);
        v2.copy(v1).lerp(SOURCE, RAY_START * (1 - fall));
        s.pos[i * 3] = v2.x;
        s.pos[i * 3 + 1] = v2.y;
        s.pos[i * 3 + 2] = v2.z;
        s.vel[i * 3] = 0;
        s.vel[i * 3 + 2] = 0;
      } else if (t >= RET0) {
        // Return: last bead first, each rises back up the ray into the light.
        const go = RET0 + ((N - 1 - i) / (N - 1)) * RET * 0.8;
        const g = clamp01((t - go) / FALL);
        v1.set(s.from[i * 3], s.from[i * 3 + 1], s.from[i * 3 + 2]);
        v2.copy(v1).lerp(SOURCE, RAY_START * easeIn(g));
        s.pos[i * 3] = v2.x;
        s.pos[i * 3 + 1] = v2.y;
        s.pos[i * 3 + 2] = v2.z;
        gl = smooth(clamp01((t - go + 0.15) / 0.4)) * (1 - g * 0.3);
        scale = g >= 1 ? 0 : lerp(1, 0.3, g);
      }
      // A soft halo, light enough that the bead stays visible inside it.
      sizes[i] = BEAD * 7 * gl;
      alphas[i] = gl * 0.38;
      gpos[i * 3] = s.pos[i * 3];
      gpos[i * 3 + 1] = s.pos[i * 3 + 1];
      gpos[i * 3 + 2] = s.pos[i * 3 + 2];

      scratch.position.set(s.pos[i * 3], s.pos[i * 3 + 1], s.pos[i * 3 + 2]);
      const [a, b, c] = spins[i];
      const settle = fall;
      scratch.rotation.set(lerp(a, Math.PI / 2, settle), lerp(b, -FRONT, settle), lerp(c, 0, settle));
      scratch.scale.setScalar(Math.max(0.0001, scale));
      scratch.updateMatrix();
      mesh.setMatrixAt(i, scratch.matrix);
    }

    // ---------- rest: an elastic ring ----------
    if (t >= REST0 && t < RET0) {
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
      for (let i = 0; i < N; i++) {
        scratch.position.set(s.pos[i * 3], Y, s.pos[i * 3 + 2]);
        const [a, b, c] = spins[i];
        scratch.rotation.set(lerp(a, Math.PI / 2, 1), lerp(b, -FRONT, 1), lerp(c, 0, 1));
        scratch.scale.setScalar(1);
        scratch.updateMatrix();
        mesh.setMatrixAt(i, scratch.matrix);
        gpos[i * 3] = s.pos[i * 3];
        gpos[i * 3 + 2] = s.pos[i * 3 + 2];
      }
    }
    mesh.instanceMatrix.needsUpdate = true;

    // ---------- the spark of light and its ray ----------
    const drawing = t >= DRAW0 - 0.6 && t < DRAW0 + DRAW + 0.4;
    const returning = t >= RET0 && t < RET0 + RET * 0.8 + 0.4;
    const idx = drawing ? head : back;
    const hi = Math.min(N - 1, Math.floor(idx));
    const hf = idx - hi;
    if (drawing) {
      circleAt(hi, gap, rad, v1);
      circleAt(Math.min(N - 1, hi + 1), gap, rad, v2);
    } else {
      v1.set(s.from[hi * 3], Y, s.from[hi * 3 + 2]);
      const n = Math.min(N - 1, hi + 1);
      v2.set(s.from[n * 3], Y, s.from[n * 3 + 2]);
    }
    v1.lerp(v2, hf);
    // Before drawing starts, the spark descends the ray to its first point.
    const descend = drawing ? easeOut(clamp01((t - (DRAW0 - 0.6)) / 0.6)) : 1;
    v1.lerp(SOURCE, 0.5 * (1 - descend));
    const sparkOn = (drawing || returning ? 1 : 0) * (returning ? 1 - smooth(clamp01((t - RET0 - RET * 0.8) / 0.4)) : 1);
    gpos[N * 3] = v1.x;
    gpos[N * 3 + 1] = v1.y + 0.02;
    gpos[N * 3 + 2] = v1.z;
    sizes[N] = 0.55 * sparkOn * (0.9 + 0.1 * Math.sin(shot.total * 18));
    alphas[N] = sparkOn;
    pts.geometry.attributes.position.needsUpdate = true;
    pts.geometry.attributes.aSize.needsUpdate = true;
    pts.geometry.attributes.aAlpha.needsUpdate = true;

    const bm = beam.current;
    if (bm) {
      bm.visible = sparkOn > 0.01;
      if (bm.visible) {
        // A shaft of light from the source to the spark, facing the camera.
        v2.copy(SOURCE).sub(v1);
        const len = v2.length();
        bm.position.copy(v1).addScaledVector(v2, 0.5);
        bm.quaternion.setFromUnitVectors(UP, v2.normalize());
        bm.scale.set(1, len, 1);
        (bm.material as THREE.MeshBasicMaterial).opacity = 0.55 * sparkOn * (0.85 + 0.15 * Math.sin(shot.total * 9));
      }
    }
    if (glowMat.current) {
      const cam = state.camera as THREE.PerspectiveCamera;
      glowMat.current.uniforms.uScale.value =
        (state.size.height * state.viewport.dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2));
    }

    // ---------- the thread ----------
    const e = (N - 1) * 3;
    // Where the two ends meet: on the floor circle while drawing, where the beads lie after.
    const ends = t < REST0 ? null : t >= RET0 ? s.from : s.pos;
    const a0 = ends ? v2.set(ends[0], Y, ends[2]) : circleAt(0, gap, rad, v2);
    const ax = a0.x;
    const az = a0.z;
    const b0 = ends ? v2.set(ends[e], Y, ends[e + 2]) : circleAt(N - 1, gap, rad, v2);
    const jx = (ax + b0.x) / 2;
    const jz = (az + b0.z) / 2;
    const jl = Math.hypot(jx, jz) || 1;
    const ox = jx / jl;
    const oz = jz / jl;
    const th = s.thread;
    const knotOut = smooth(clamp01((t - RET0) / 0.8)); // knot loosens as the return begins
    const loose = Math.max(1 - tieP, knotOut);
    const visibleTo = t < REST0 ? head : t >= RET0 ? back : N - 1;
    const lineOn = t >= DRAW0 - 0.2 && !(t >= RET0 + RET * 0.8 + 0.2);
    for (let k = 0; k < TAIL; k++) {
      const u = 1 - k / TAIL;
      const lx = ax + ox * 0.45 * u - oz * 0.16 * Math.sin(u * 3);
      const lz = az + oz * 0.45 * u + ox * 0.16 * Math.sin(u * 3);
      th[k * 3] = lerp(jx + ox * 0.2 * u, lx, loose);
      th[k * 3 + 1] = lineOn ? Y : -1;
      th[k * 3 + 2] = lerp(jz + oz * 0.2 * u, lz, loose);
    }
    for (let i = 0; i < N; i++) {
      const o = (TAIL + i) * 3;
      // The thread lies on the floor where each bead will land.
      const onFloor = t < REST0 ? circleAt(i, gap, rad, v2) : v2.set(s.pos[i * 3], Y, s.pos[i * 3 + 2]);
      const ahead = i > visibleTo;
      th[o] = ahead ? v1.x : t >= RET0 ? s.from[i * 3] : onFloor.x;
      th[o + 1] = lineOn ? Y : -1;
      th[o + 2] = ahead ? v1.z : t >= RET0 ? s.from[i * 3 + 2] : onFloor.z;
    }
    for (let k = 0; k < TAIL; k++) {
      const u = (k + 1) / TAIL;
      const o = (TAIL + N + k) * 3;
      if (t < TIE0 - 0.3 || (t >= RET0 && back < N - 1)) {
        th[o] = th[(TAIL + N - 1) * 3];
        th[o + 1] = lineOn ? Y : -1;
        th[o + 2] = th[(TAIL + N - 1) * 3 + 2];
        continue;
      }
      const lx = th[(TAIL + N - 1) * 3] + ox * 0.45 * u + oz * 0.16 * Math.sin(u * 3);
      const lz = th[(TAIL + N - 1) * 3 + 2] + oz * 0.45 * u - ox * 0.16 * Math.sin(u * 3);
      th[o] = lerp(jx + ox * 0.2 * u, lx, loose);
      th[o + 1] = lineOn ? Y : -1;
      th[o + 2] = lerp(jz + oz * 0.2 * u, lz, loose);
    }
    // Never let two points coincide: zero-length segments make the line shader output NaN pixels.
    for (let i = 3; i < th.length; i += 3) {
      if (Math.abs(th[i] - th[i - 3]) + Math.abs(th[i + 2] - th[i - 1]) < 1e-4) {
        th[i] = th[i - 3] + 2e-4;
        th[i + 2] = th[i - 1] + 1e-4;
      }
    }
    line.current?.geometry.setPositions(th);

    // ---------- knot, guru bead, tassel ----------
    const tied = t >= TIE0 && t < RET0 + 1.2;
    const kn = knot.current;
    if (kn) {
      const kp = smooth(clamp01((t - TIE0 - 0.5) / 1.0)) * (1 - knotOut);
      kn.visible = tied && kp > 0.001;
      kn.position.set(jx + ox * 0.2, Y * 0.7, jz + oz * 0.2);
      kn.scale.setScalar(Math.max(0.0001, kp));
      kn.rotation.set(Math.PI / 2, 0, shot.total * (1 - kp) * 4);
    }
    const gu = guru.current;
    if (gu) {
      const arrive = smooth(clamp01((t - TIE0) / 1.2));
      const leave = smooth(clamp01((t - RET0 - 0.2) / 1.0));
      gu.visible = tied && arrive > 0.001 && leave < 0.999;
      gu.position.set(lerp(jx + ox * 0.08, SOURCE.x * 0.4, leave), Y + (1 - arrive) * 0.8 + leave * 2.4, lerp(jz + oz * 0.08, SOURCE.z * 0.4, leave));
      gu.scale.setScalar(Math.max(0.0001, 1 - leave * 0.7));
      gu.rotation.y = Math.atan2(ox, oz);
    }
    if (t > TIE0 + 1.3 && s.rang !== shot.cycle) {
      s.rang = shot.cycle;
      strike(0.9);
    }

    // ---------- the page: counter and phase ----------
    const count = t < DRAW0 ? 0 : t < RET0 ? Math.min(N, Math.round(head + 1)) : Math.max(0, Math.round(back));
    if (count !== s.count) {
      s.count = count;
      const el = document.getElementById("bead-count");
      if (el) el.textContent = String(count).padStart(3, "0");
    }
    const phase = t < TIE0 ? "draw" : t < REST0 ? "tie" : t < RET0 ? "rest" : "return";
    if (phase !== s.phase) {
      s.phase = phase;
      document.documentElement.dataset.shot = phase;
      if (phase === "tie") document.documentElement.dataset.tied = "1";
    }
  });

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={Y} onPointerDown={onDown} onPointerMove={onMove} visible={false}>
        <planeGeometry args={[14, 14]} />
      </mesh>
      <instancedMesh ref={beads} args={[geo, mat, N]} castShadow receiveShadow frustumCulled={false} />
      <Line ref={line} points={initialThread} color={THREAD} lineWidth={mobile ? 1.2 : 1.6} />
      <mesh ref={beam} material={beamMat} visible={false} renderOrder={2}>
        <planeGeometry args={[0.16, 1]} />
      </mesh>
      <points ref={glow} geometry={glowGeo} frustumCulled={false} renderOrder={3}>
        <shaderMaterial
          ref={glowMat}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          uniforms={glowUniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
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

/** Angle on the floor of bead `i` on the (possibly open) circle. */
function angleAt(i: number, gap: number) {
  return FRONT + gap / 2 + ((Math.PI * 2 - gap) * i) / (N - 1);
}

/* =====================================================================
   Camera: one continuous take, shot like a film. Each "rig" is a camera
   move (position, target, roll, lens); the timeline cross-fades between
   them, and a gimbal float keeps it alive.
   descend  drone comes down with the light from the ray
   gimbal   low tracking shot beside the light, at bead height
   orbit    drone rises and arcs across the circle, banking into the turn
   lead     macro, low ahead of the light: beads come toward the lens
   wide     crane up to the full page for the knot; slow drone drift at rest
   top      bird's-eye, rising as the beads return to the light
   ===================================================================== */

type Rig = { pos: THREE.Vector3; look: THREE.Vector3; roll: number; fov: number };
const mkRig = (): Rig => ({ pos: new THREE.Vector3(), look: new THREE.Vector3(), roll: 0, fov: 30 });

function blendInto(out: Rig, a: Rig, b: Rig, k: number) {
  out.pos.lerpVectors(a.pos, b.pos, k);
  out.look.lerpVectors(a.look, b.look, k);
  out.roll = lerp(a.roll, b.roll, k);
  out.fov = lerp(a.fov, b.fov, k);
  // Lift the path between two moves so a blend never dips through the mala.
  out.pos.y += Math.sin(k * Math.PI) * 0.35;
  return out;
}

/** 0 → 1 across [a, b], eased. */
const win = (t: number, a: number, b: number) => easeInOut(clamp01((t - a) / (b - a)));

function Camera({ mobile, focus }: { mobile: boolean; focus: (d: number) => void }) {
  const store = useRef<{ rigs: Record<string, Rig>; spark: THREE.Vector3; pos: THREE.Vector3; look: THREE.Vector3; roll: number; ready: boolean } | null>(null);

  useFrame((state, delta) => {
    store.current ??= {
      rigs: { descend: mkRig(), gimbal: mkRig(), orbit: mkRig(), lead: mkRig(), wide: mkRig(), top: mkRig(), a: mkRig(), out: mkRig() },
      spark: new THREE.Vector3(),
      pos: new THREE.Vector3(),
      look: new THREE.Vector3(),
      roll: 0,
      ready: false,
    };
    const { rigs, spark } = store.current;
    const t = shot.t;
    const T = shot.total;
    const far = mobile ? 1.5 : 1; // phones stand further back
    const tieP = smooth(clamp01((t - TIE0) / TIE));
    const gap = lerp(0.42, (GAP / R) * 0.98, tieP);
    const returning = t >= RET0;
    const idx = returning
      ? (N - 1) * (1 - clamp01((t - RET0) / (RET * 0.8)))
      : clamp01((t - DRAW0) / DRAW) * (N - 1);
    const ang = angleAt(idx, gap);
    const dir = returning ? -1 : 1; // travel: +1 = increasing angle
    spark.set(Math.cos(ang) * R, Y, Math.sin(ang) * R);
    // While descending, the light is still up the ray.
    const descend = returning ? 1 : easeOut(clamp01((t - (DRAW0 - 0.9)) / 0.9));
    const sparkAir = rigs.a.look.copy(spark).lerp(SOURCE, 0.5 * (1 - descend));

    // descend: high drone above the landing point, sinking and turning as the light falls
    {
      const r = rigs.descend;
      const k = clamp01(t / (DRAW0 + 0.4));
      const a = ang - 0.9 + k * 0.6;
      r.pos.set(spark.x + Math.cos(a) * 2.2 * far, lerp(6.5, 2.4, easeInOut(k)) * far, spark.z + Math.sin(a) * 2.2 * far);
      r.look.copy(sparkAir);
      r.roll = 0;
      r.fov = 34;
    }
    // gimbal: low beside and behind the light
    {
      const r = rigs.gimbal;
      const ca = ang - dir * 0.62;
      const d = R + 1.55 * far;
      r.pos.set(Math.cos(ca) * d, 0.8 * far, Math.sin(ca) * d);
      const la = ang + dir * 0.22;
      r.look.set(Math.cos(la) * R * 0.96, 0.05, Math.sin(la) * R * 0.96);
      r.roll = -dir * 0.03;
      r.fov = 32;
    }
    // orbit: drone across the circle, rising, banking into the turn
    {
      const r = rigs.orbit;
      const ca = ang + Math.PI * 0.78 + Math.sin(T * 0.2) * 0.05;
      const d = R + 2.6 * far;
      r.pos.set(Math.cos(ca) * d, 2.5 * far, Math.sin(ca) * d);
      r.look.copy(spark).multiplyScalar(0.7);
      r.roll = dir * 0.09;
      r.fov = 30;
    }
    // lead: macro, very low, ahead of the light, looking back at it
    {
      const r = rigs.lead;
      const ca = ang + dir * 0.42;
      const d = R + 0.55 * far;
      r.pos.set(Math.cos(ca) * d, 0.3 * far, Math.sin(ca) * d);
      r.look.set(spark.x, 0.07, spark.z);
      r.roll = dir * 0.02;
      r.fov = 38;
    }
    // wide: the full page, with a slow drone drift
    {
      const r = rigs.wide;
      const sway = Math.sin(T * 0.05) * 0.16;
      const y = mobile ? 6.6 : 3.7;
      const z = mobile ? 7.8 : 7.9;
      r.pos.set(Math.sin(sway) * z, y, Math.cos(sway) * z);
      r.look.set(0, mobile ? -1.5 : -1.05, mobile ? 1.9 : 1.5);
      r.roll = 0;
      r.fov = 30;
    }
    // top: bird's-eye, rising and turning as the beads go back to the light
    {
      const r = rigs.top;
      const k = clamp01((t - RET0) / (LOOP - RET0));
      const a = T * 0.06;
      r.pos.set(Math.sin(a) * 0.9, lerp(7, 9.5, k) * far, Math.cos(a) * 0.9 + 0.6);
      r.look.set(0, 0, 0);
      r.roll = 0;
      r.fov = 34;
    }

    // ---------- the timeline ----------
    const out = rigs.out;
    const p = (t - DRAW0) / DRAW; // draw progress
    if (t < RET0) {
      // Start of a cycle: from the bird's-eye of the last return into the descent (first visit starts on the descent).
      const fromTop = shot.total > LOOP ? 1 - win(t, 0, 1.1) : 0;
      blendInto(out, rigs.descend, rigs.top, fromTop);
      blendInto(out, out, rigs.gimbal, win(p, -0.06, 0.1));
      blendInto(out, out, rigs.orbit, win(p, 0.32, 0.46));
      blendInto(out, out, rigs.lead, win(p, 0.66, 0.8));
      blendInto(out, out, rigs.wide, win(t, TIE0 - 0.7, REST0 + 0.4));
    } else {
      const q = (t - RET0) / (RET * 0.8); // return progress
      blendInto(out, rigs.wide, rigs.gimbal, win(t, RET0, RET0 + 1.1));
      blendInto(out, out, rigs.top, win(q, 0.45, 0.9));
    }

    // ---------- gimbal float: tiny, slow, never shaky ----------
    const cam = state.camera as THREE.PerspectiveCamera;
    // Stabiliser: the camera eases toward each rig instead of snapping, like a gimbal's damping.
    const st = store.current;
    const dt = Math.min(delta, 0.05);
    if (!st.ready) {
      st.pos.copy(out.pos);
      st.look.copy(out.look);
      st.roll = out.roll;
      st.ready = true;
    }
    st.pos.x = THREE.MathUtils.damp(st.pos.x, out.pos.x, 5, dt);
    st.pos.y = THREE.MathUtils.damp(st.pos.y, out.pos.y, 5, dt);
    st.pos.z = THREE.MathUtils.damp(st.pos.z, out.pos.z, 5, dt);
    st.look.x = THREE.MathUtils.damp(st.look.x, out.look.x, 7, dt);
    st.look.y = THREE.MathUtils.damp(st.look.y, out.look.y, 7, dt);
    st.look.z = THREE.MathUtils.damp(st.look.z, out.look.z, 7, dt);
    st.roll = THREE.MathUtils.damp(st.roll, out.roll, 3, dt);
    cam.position.copy(st.pos);
    cam.position.x += Math.sin(T * 0.71) * 0.025 + Math.sin(T * 0.23) * 0.04;
    cam.position.y += Math.sin(T * 1.13) * 0.015;
    cam.position.z += Math.cos(T * 0.83) * 0.025;
    const wideK = t >= REST0 - 0.3 && t < RET0 ? 1 : 0;
    if (shot.dragging < 0 && wideK) {
      cam.position.x += state.pointer.x * 0.18;
      cam.position.y += state.pointer.y * 0.08;
    }
    cam.lookAt(st.look);
    cam.rotateZ(st.roll + Math.sin(T * 0.37) * 0.006);
    const fov = out.fov + (mobile ? 12 : 0);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }
    focus(cam.position.distanceTo(st.look));
  });
  return null;
}

export default function MalaScene({ mobile = false }: { mobile?: boolean }) {
  // Phones start light; laptops drop to the light setup if the frame rate falls.
  const [lite, setLite] = useState(mobile);
  const [dpr, setDpr] = useState(mobile ? 1.3 : 1.6);
  const dof = useRef<DepthOfFieldEffect>(null);
  const focus = useCallback((d: number) => {
    if (dof.current) dof.current.cocMaterial.focusDistance = d;
  }, []);
  const degrade = useCallback(() => {
    setLite(true);
    setDpr(1);
  }, []);
  return (
    <Canvas
      shadows="soft"
      dpr={dpr}
      camera={{ position: [0, 3.7, 7.9], fov: mobile ? 44 : 30, near: 0.1, far: 60 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 0.95;
      }}
    >
      <PerformanceMonitor onDecline={degrade} onFallback={degrade} flipflops={2} />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, mobile ? 9 : 8, mobile ? 20 : 17]} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff4e4" position={[-2, 5, -4]} scale={[6, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#f5e6cf" position={[4, 2, 3]} scale={[3, 4, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[0, 6, 4]} rotation-x={Math.PI / 2} scale={[8, 4, 1]} />
      </Environment>
      <Lights />
      <Rays />
      <FloorInscriptions />
      <Motifs />
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
