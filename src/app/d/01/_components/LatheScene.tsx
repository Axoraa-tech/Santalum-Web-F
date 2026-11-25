"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useWood } from "@/lib/wood";
import { CHAPTERS, mulberry32, storyPhase } from "./data";
import { bounds, createLathe, createShavingGeometry, DISPLAY, lerpProfile, profile, PTS, radiusAt } from "./lathe";
import type { ProfileKey } from "./data";
import { story } from "./store";
import { createSteel, createWoodMaterial, woodTextures } from "./woodMaterial";

type Props = { lite: boolean; reduced: boolean; active: boolean; onReady?: () => void };

/** The story's lathe: one piece of heartwood, turned into each chapter's object as the page scrolls. */
export default function LatheScene({ lite, reduced, active, onReady }: Props) {
  return (
    <Canvas
      dpr={[1, lite ? 1.25 : 1.75]}
      camera={{ position: [0, 0.35, 8.6], fov: 30, near: 0.1, far: 80 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      onCreated={() => onReady?.()}
    >
      <Studio />
      <Work lite={lite} reduced={reduced} />
    </Canvas>
  );
}

/** Soft studio light: a large overhead box, a key from the front left, a cool rim strip behind. */
export function Studio() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[-4, 6, 5]} intensity={1.5} color="#fff4e6" />
      <directionalLight position={[5, 2.5, -6]} intensity={1.3} color="#e9f0ff" />
      <Environment resolution={256} frames={1}>
        <color attach="background" args={["#7d8086"]} />
        <Lightformer form="rect" intensity={2.4} position={[0, 7, 1]} scale={[12, 5, 1]} />
        <Lightformer form="rect" intensity={2.2} position={[-6, 2.5, 5]} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={4} position={[6, 1.5, -5]} scale={[1.6, 9, 1]} color="#eef3ff" />
        <Lightformer form="rect" intensity={1} position={[5, -1.5, 6]} scale={[8, 1.5, 1]} />
        <Lightformer form="circle" intensity={2.5} position={[-1.5, 3, 9]} scale={1.6} />
      </Environment>
    </>
  );
}

const SHAVINGS_FULL = 260;
const SHAVINGS_LITE = 90;

const _v = new THREE.Vector3();
const _w = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _m = new THREE.Matrix4();
const _s = new THREE.Vector3();
const _e = new THREE.Euler();
const _inv = new THREE.Matrix4();
const _t = new THREE.Vector3();
const Y = new THREE.Vector3(0, 1, 0);

function damp(a: number, b: number, lambda: number, dt: number) {
  return a + (b - a) * (1 - Math.exp(-lambda * dt));
}

const _d = { scale: 1, yaw: 0, pitch: 0, tail: 0 };
const _d2 = { scale: 1, yaw: 0, pitch: 0, tail: 0 };
let flip = false;

/** Display settings for a chapter, eased between the red piece and the white one. */
function display(r: ProfileKey, w: ProfileKey, k: number) {
  const a = DISPLAY[r];
  const b = DISPLAY[w];
  flip = !flip;
  const o = flip ? _d : _d2;
  o.scale = a.scale + (b.scale - a.scale) * k;
  o.yaw = a.yaw + (b.yaw - a.yaw) * k;
  o.pitch = a.pitch + (b.pitch - a.pitch) * k;
  o.tail = a.tail + (b.tail - a.tail) * k;
  return o;
}

/** Set opacity on every material under a group (tool and tailstock fade in and out). */
function fade(g: THREE.Object3D, v: number) {
  g.traverse((o) => {
    const m = (o as THREE.Mesh).material as THREE.Material | undefined;
    if (m) m.opacity = v;
  });
}

function Work({ lite, reduced }: { lite: boolean; reduced: boolean }) {
  const wood = useWood();
  const viewport = useThree((s) => s.viewport);

  const lathe = useMemo(() => createLathe(lite ? 72 : 120), [lite]);
  const wood3 = useMemo(() => createWoodMaterial(woodTextures(lite)), [lite]);
  const steel = useMemo(() => createSteel(), []);
  const toolSteel = useMemo(() => {
    const m = createSteel();
    m.transparent = true;
    return m;
  }, []);
  const handle = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#221715", roughness: 0.55, metalness: 0.1, transparent: true }),
    [],
  );
  const tailSteel = useMemo(() => {
    const m = createSteel();
    m.transparent = true;
    return m;
  }, []);
  const shavingGeo = useMemo(() => createShavingGeometry(), []);
  const shavingMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#c0603f", roughness: 0.75, side: THREE.DoubleSide }),
    [],
  );
  const COUNT = lite ? SHAVINGS_LITE : SHAVINGS_FULL;

  const scratch = useMemo(() => new Float32Array(PTS * 2), []);
  const scratchR = useMemo(() => new Float32Array(PTS * 2), []);
  const scratchW = useMemo(() => new Float32Array(PTS * 2), []);
  const st = useRef({
    p: 0,
    spin: 0,
    cut: 0,
    lastC: -1,
    lastM: -1,
    lastW: -1,
    wood: wood === "white" ? 1 : 0,
    side: 1,
    emit: 0,
    seed: mulberry32(42),
    head: 0,
    parts: {
      pos: new Float32Array(COUNT * 3),
      vel: new Float32Array(COUNT * 3),
      rot: new Float32Array(COUNT * 3),
      spn: new Float32Array(COUNT * 3),
      life: new Float32Array(COUNT),
      size: new Float32Array(COUNT),
      landed: new Uint8Array(COUNT),
    },
  });

  const rig = useRef<THREE.Group>(null);
  const axis = useRef<THREE.Group>(null);
  const spinner = useRef<THREE.Mesh>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const rest = useRef<THREE.Group>(null);
  const post = useRef<THREE.Mesh>(null);
  const tool = useRef<THREE.Group>(null);
  const shavings = useRef<THREE.InstancedMesh>(null);
  const shadow = useRef<THREE.Group>(null);

  const camera = useThree((st3) => st3.camera);
  useEffect(() => {
    // Hardware lives on layer 1: the camera sees it, the contact shadow does not.
    camera.layers.enable(1);
    for (const r of [head, tail, rest, post, tool]) r.current?.traverse((o) => o.layers.set(1));
  }, [camera]);

  useEffect(() => {
    lathe.update(profile("billet"));
    const im = shavings.current;
    if (im) {
      _m.makeScale(0, 0, 0);
      for (let i = 0; i < im.count; i++) im.setMatrixAt(i, _m);
      im.instanceMatrix.needsUpdate = true;
    }
    return () => {
      lathe.geometry.dispose();
    };
  }, [lathe]);

  useEffect(
    () => () => {
      wood3.material.dispose();
      steel.dispose();
      toolSteel.dispose();
      tailSteel.dispose();
      handle.dispose();
      shavingGeo.dispose();
      shavingMat.dispose();
    },
    [wood3, steel, toolSteel, tailSteel, handle, shavingGeo, shavingMat],
  );

  const redShaving = useMemo(() => new THREE.Color("#9e3f27"), []);
  const whiteShaving = useMemo(() => new THREE.Color("#d9bd8c"), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const dtD = Math.min(rawDt, 0.25);
    const s = st.current;
    const phone = viewport.aspect < 0.8;

    // Scroll, softened so the lathe never jumps.
    s.p = damp(s.p, story.p, reduced ? 12 : 5, dtD);
    const ph = storyPhase(s.p);

    // Wood eases with the switch: colour, and the shape itself, since each wood turns its own pieces.
    const target = wood === "white" ? 1 : 0;
    s.wood = damp(s.wood, target, 3.2, dtD);
    if (Math.abs(s.wood - target) < 1e-4) s.wood = target;
    const RED = CHAPTERS.red;
    const WHITE = CHAPTERS.white;

    // Re-cut the profile only when it changes.
    if (ph.c !== s.lastC || Math.abs(ph.m - s.lastM) > 1e-5 || s.wood !== s.lastW) {
      lerpProfile(profile(RED[ph.from].profile), profile(RED[ph.to].profile), ph.m, scratchR);
      if (s.wood > 0) {
        lerpProfile(profile(WHITE[ph.from].profile), profile(WHITE[ph.to].profile), ph.m, scratchW);
        lerpProfile(scratchR, scratchW, s.wood, scratch);
      } else scratch.set(scratchR);
      lathe.update(scratch);
      s.lastC = ph.c;
      s.lastM = ph.m;
      s.lastW = s.wood;
    }
    const prof = scratch;
    const b = bounds(prof);

    const A = display(RED[ph.from].profile, WHITE[ph.from].profile, s.wood);
    const B = display(RED[ph.to].profile, WHITE[ph.to].profile, s.wood);
    const mix = (x: number, y: number) => x + (y - x) * ph.m;
    const fit = (phone ? Math.min(1, viewport.width / 3.4) : Math.min(1, viewport.width / 7.4)) * 0.76;
    const scale = mix(A.scale, B.scale) * fit;
    const yawA = Math.abs(mix(A.yaw, B.yaw));
    s.side = ph.side;
    const sideT = (ph.side + 1) / 2; // 1 = work on the right
    const yaw = -yawA + (yawA - Math.PI - -yawA) * sideT;
    const pitch = -mix(A.pitch, B.pitch);

    const g = rig.current;
    const ax = axis.current;
    const sp = spinner.current;
    if (!g || !ax || !sp) return;

    const t = state.clock.elapsedTime;
    const x = phone ? 0 : ph.side * viewport.width * 0.235;
    const baseY = phone ? viewport.height * 0.29 : 0.02;
    const y = baseY + (reduced ? 0 : Math.sin(t * 0.6) * 0.025);
    const floorY = baseY - 1.64 * fit;
    g.position.set(x, y, 0);
    g.rotation.set(pitch, yaw, 0);
    g.scale.setScalar(scale);

    // Spin like work between centres; faster for small pieces, as on a real lathe.
    const rpmA = RED[ph.from].rpm + (WHITE[ph.from].rpm - RED[ph.from].rpm) * s.wood;
    const rpmB = RED[ph.to].rpm + (WHITE[ph.to].rpm - RED[ph.to].rpm) * s.wood;
    const rpm = rpmA + (rpmB - rpmA) * ph.rpmT;
    s.spin += dt * (reduced ? 0.25 : 0.35 + (rpm / 2800) * 1.25);
    sp.rotation.y = s.spin;

    const woodMat = sp.material as THREE.MeshPhysicalMaterial;
    woodMat.userData.uniforms.uWood.value = s.wood;
    shavingMat.color.copy(redShaving).lerp(whiteShaving, s.wood);

    // Camera answers the pointer a little.
    const camera = state.camera;
    if (!reduced) {
      camera.position.x = damp(camera.position.x, story.px * 0.32, 2.5, dt);
      camera.position.y = damp(camera.position.y, 0.35 + story.py * 0.18, 2.5, dt);
    }
    camera.lookAt(0, 0, 0);

    // Directions in profile space: toward the camera ("front") and down.
    g.updateMatrixWorld();
    _inv.copy(ax.matrixWorld).invert();
    _v.copy(camera.position).applyMatrix4(_inv);
    const fx0 = _v.x;
    const fz0 = _v.z;
    const fl = Math.hypot(fx0, fz0) || 1;
    const fx = fx0 / fl;
    const fz = fz0 / fl;
    _w.set(0, -1, 0).transformDirection(_inv);
    let dx = _w.x;
    let dz = _w.z;
    const dl = Math.hypot(dx, dz) || 1;
    dx /= dl;
    dz /= dl;

    // Headstock: drive centre and spindle at the low end of the work.
    if (head.current) head.current.position.set(0, b.minY, 0);
    // Tailstock: live centre at the high end; withdraws for hollow work.
    const tailOn = mix(A.tail, B.tail);
    if (tail.current) {
      tail.current.position.set(0, b.maxY + (1 - tailOn) * 0.7, 0);
      tail.current.visible = tailOn > 0.04;
      fade(tail.current, tailOn * tailOn);
    }

    // Tool rest: below and in front of the work, parallel to the axis.
    const rx = dx * 0.88 + fx * 0.48;
    const rz = dz * 0.88 + fz * 0.48;
    const rl = Math.hypot(rx, rz) || 1;
    const restR = b.maxR + 0.26;
    if (rest.current) {
      rest.current.position.set((rx / rl) * restR, (b.minY + b.maxY) / 2, (rz / rl) * restR);
      rest.current.scale.set(1, b.maxY - b.minY + 0.5, 1);
      rest.current.rotation.set(0, Math.atan2(rx, rz), 0);
    }
    if (post.current) {
      // From the bar straight down to the floor (the shadow plane).
      const barWorldY = y - restR * scale * 0.9;
      const len = Math.max(0.1, (barWorldY - floorY) / scale);
      post.current.position.set((rx / rl) * restR + dx * (len / 2), (b.minY + b.maxY) / 2, (rz / rl) * restR + dz * (len / 2));
      post.current.scale.set(1, len, 1);
      _w.set(dx, 0, dz).normalize();
      post.current.quaternion.setFromUnitVectors(Y, _w);
    }

    // The tool: a gouge on the rest, sweeping along the work while it cuts.
    const engage = reduced ? 0 : ph.tool;
    const sweep = 0.5 - 0.5 * Math.cos(ph.m * Math.PI * 3);
    const toolY = b.minY + 0.08 + (b.maxY - b.minY - 0.16) * (ph.c === 0 ? 0.5 : sweep);
    const toolR = radiusAt(prof, toolY);
    const tx = dx * 0.9 + fx * 0.42;
    const tz = dz * 0.9 + fz * 0.42;
    const tl = Math.hypot(tx, tz) || 1;
    const tdx = tx / tl;
    const tdz = tz / tl;
    if (tool.current) {
      tool.current.visible = engage > 0.01;
      const back = (1 - engage) * 0.9;
      tool.current.position.set(tdx * (toolR + 0.01 + back), toolY, tdz * (toolR + 0.01 + back));
      _w.set(tdx, 0, tdz);
      tool.current.quaternion.setFromUnitVectors(Y, _w);
      fade(tool.current, engage);
    }

    if (shadow.current) shadow.current.position.set(x, floorY, 0);

    // Shavings fly from the tool point while the cut advances, then fall and settle.
    const cut = ph.c + ph.m;
    const dCut = Math.abs(cut - s.cut);
    s.cut = cut;
    const im = shavings.current;
    if (!im) return;
    const P = s.parts;
    if (!reduced && engage > 0.3 && dCut > 0) {
      s.emit += Math.min((dCut / dt) * 200, lite ? 40 : 95) * dt;
    }
    let spawn = Math.floor(s.emit);
    s.emit -= spawn;
    if (spawn > 0) {
      // Tool tip and axis in world space.
      const tip = _v.set(tdx * toolR, toolY, tdz * toolR);
      ax.localToWorld(tip);
      const axisW = _w.set(0, 1, 0).transformDirection(ax.matrixWorld);
      const out = _s.set(tdx, 0, tdz).transformDirection(ax.matrixWorld);
      const tan = _t.crossVectors(axisW, out).normalize();
      const R = s.seed;
      while (spawn-- > 0) {
        const i = s.head;
        s.head = (s.head + 1) % COUNT;
        P.pos[i * 3] = tip.x + (R() - 0.5) * 0.06;
        P.pos[i * 3 + 1] = tip.y + (R() - 0.5) * 0.06;
        P.pos[i * 3 + 2] = tip.z + (R() - 0.5) * 0.06;
        const vo = (0.7 + R() * 1.1) * fit;
        const vt = -(0.5 + R() * 1.0) * fit;
        const vu = (0.8 + R() * 1.3) * fit;
        const va = (R() - 0.5) * 0.8 * fit;
        P.vel[i * 3] = out.x * vo + tan.x * vt + axisW.x * va;
        P.vel[i * 3 + 1] = out.y * vo + tan.y * vt + vu;
        P.vel[i * 3 + 2] = out.z * vo + tan.z * vt + axisW.z * va;
        P.rot[i * 3] = R() * 6.28;
        P.rot[i * 3 + 1] = R() * 6.28;
        P.rot[i * 3 + 2] = R() * 6.28;
        P.spn[i * 3] = (R() - 0.5) * 14;
        P.spn[i * 3 + 1] = (R() - 0.5) * 14;
        P.spn[i * 3 + 2] = (R() - 0.5) * 14;
        P.life[i] = 3.2 + R() * 1.6;
        P.size[i] = (0.13 + R() * 0.15) * fit;
        P.landed[i] = 0;
      }
    }
    const floor = floorY + 0.02;
    let any = false;
    for (let i = 0; i < COUNT; i++) {
      if (P.life[i] <= 0) continue;
      any = true;
      P.life[i] -= dt;
      const k = i * 3;
      if (!P.landed[i]) {
        P.vel[k + 1] -= 5.2 * fit * dt;
        const drag = 1 - 0.9 * dt;
        P.vel[k] *= drag;
        P.vel[k + 2] *= drag;
        P.pos[k] += P.vel[k] * dt;
        P.pos[k + 1] += P.vel[k + 1] * dt;
        P.pos[k + 2] += P.vel[k + 2] * dt;
        P.rot[k] += P.spn[k] * dt;
        P.rot[k + 1] += P.spn[k + 1] * dt;
        P.rot[k + 2] += P.spn[k + 2] * dt;
        if (P.pos[k + 1] < floor) {
          P.pos[k + 1] = floor;
          P.landed[i] = 1;
          P.life[i] = Math.min(P.life[i], 1.4);
          P.rot[k] = Math.PI / 2 + (P.rot[k] % 0.4);
        }
      }
      const fade = Math.min(1, P.life[i] / 0.6);
      _e.set(P.rot[k], P.rot[k + 1], P.rot[k + 2]);
      _q.setFromEuler(_e);
      _s.setScalar(P.life[i] > 0 ? P.size[i] * fade : 0);
      _v.set(P.pos[k], P.pos[k + 1], P.pos[k + 2]);
      _m.compose(_v, _q, _s);
      im.setMatrixAt(i, _m);
    }
    if (any) im.instanceMatrix.needsUpdate = true;
  });

  return (
    <>
      <group ref={rig}>
        {/* Profile space: the spindle axis is y. Rotated so the spindle runs across the screen. */}
        <group ref={axis} rotation={[0, 0, -Math.PI / 2]}>
          <mesh ref={spinner} geometry={lathe.geometry} material={wood3.material} frustumCulled={false} />
          <group ref={head}>
            <mesh material={steel} position={[0, -0.13, 0]}>
              <coneGeometry args={[0.075, 0.26, 24]} />
            </mesh>
            <mesh material={steel} position={[0, -0.34, 0]}>
              <cylinderGeometry args={[0.2, 0.2, 0.16, 40]} />
            </mesh>
            <mesh material={steel} position={[0, -3.9, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 7, 16]} />
            </mesh>
          </group>
          <group ref={tail}>
            <mesh material={tailSteel} position={[0, 0.1, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.07, 0.24, 24]} />
            </mesh>
            <mesh material={tailSteel} position={[0, 0.82, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 1.2, 20]} />
            </mesh>
          </group>
          <group ref={rest}>
            <mesh material={steel}>
              <boxGeometry args={[0.035, 1, 0.07]} />
            </mesh>
          </group>
          <mesh ref={post} material={steel}>
            <cylinderGeometry args={[0.032, 0.032, 1, 16]} />
          </mesh>
          <group ref={tool} visible={false}>
            <mesh material={toolSteel} position={[0, 0.05, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.03, 0.1, 16]} />
            </mesh>
            <mesh material={toolSteel} position={[0, 0.4, 0]}>
              <cylinderGeometry args={[0.026, 0.026, 0.6, 16]} />
            </mesh>
            <mesh material={handle} position={[0, 0.88, 0]}>
              <cylinderGeometry args={[0.05, 0.045, 0.36, 20]} />
            </mesh>
          </group>
        </group>
      </group>
      <instancedMesh ref={shavings} args={[shavingGeo, shavingMat, COUNT]} frustumCulled={false} />
      <group ref={shadow} position={[0, -1.62, 0]}>
        <ContactShadows scale={8} blur={2.4} far={2.4} opacity={0.5} resolution={lite ? 256 : 512} color={wood === "white" ? "#2a2318" : "#221715"} />
      </group>
    </>
  );
}
