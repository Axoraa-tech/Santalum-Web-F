"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshReflectorMaterial, Sparkles } from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Vignette } from "@react-three/postprocessing";
import type { DepthOfFieldEffect } from "postprocessing";
import { useCallback, useMemo, useRef } from "react";
import * as THREE from "three";

/* =====================================================================
   One shot, no cuts: in a dark, quiet studio a mala of 108 red-sandalwood
   beads is lowered bead by bead onto a polished floor, settles into a loose
   loop under a single warm light, and the camera pulls back to reveal it.
   ===================================================================== */

const N = 108;
const BEAD = 0.06;
const INTRO = 7.5; // seconds for the camera pull-back

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}
const smooth = (x: number) => x * x * (3 - 2 * x);
/** Scratch object for building instance matrices each frame. */
const scratch = new THREE.Object3D();

/** Seconds since the shot began; the first call starts the clock. */
type Elapsed = (clock: number) => number;

const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/* ---------- Procedural heartwood: fibres, pores and figure ---------- */
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

/* ---------- Where each bead comes to rest: a loose, hand-dropped loop ---------- */
function restingLoop() {
  // Sample an organic closed curve, then place beads at equal arc length so they touch.
  const S = 400;
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i < S; i++) {
    const a = (i / S) * Math.PI * 2;
    const rad = 1 + 0.1 * Math.sin(2 * a + 0.7) + 0.06 * Math.sin(3 * a + 1.9) + 0.03 * Math.sin(5 * a);
    pts.push(new THREE.Vector3(Math.cos(a) * rad * 1.1, 0, Math.sin(a) * rad * 0.95));
  }
  const curve = new THREE.CatmullRomCurve3(pts, true);
  const scale = (N * BEAD * 2.04) / curve.getLength(); // bead diameter spacing, a hair of thread between
  const out: THREE.Vector3[] = [];
  for (let i = 0; i < N; i++) {
    const p = curve.getPointAt((i / N + 0.25) % 1).multiplyScalar(scale);
    p.y = BEAD * 0.9;
    out.push(p);
  }
  return out;
}

function Mala({ elapsed }: { elapsed: Elapsed }) {
  const beads = useRef<THREE.InstancedMesh>(null);
  const guru = useRef<THREE.Group>(null);
  const rest = useMemo(() => restingLoop(), []);

  const { geo, mat, guruMat, silkMat, colors, spins } = useMemo(() => {
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
    const guruMat = new THREE.MeshPhysicalMaterial({ color: "#b8935a", metalness: 1, roughness: 0.3, clearcoat: 0.4 });
    const silkMat = new THREE.MeshPhysicalMaterial({
      color: "#5a1610",
      roughness: 0.7,
    });
    const r = rng(91);
    const colors = new Float32Array(N * 3);
    const col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      // Each bead a slightly different piece of heartwood.
      col.setHSL(0.02 + r() * 0.025, 0.5 + r() * 0.2, 0.62 + r() * 0.22);
      colors.set([col.r, col.g, col.b], i * 3);
    }
    const spins = Array.from({ length: N }, () => [r() * 6.28, r() * 6.28, r() * 6.28] as const);
    return { geo, mat, guruMat, silkMat, colors, spins };
  }, []);

  // Tassel threads, fanned out on the floor beyond the guru bead.
  const tassel = useMemo(() => {
    const r = rng(13);
    return Array.from({ length: 70 }, () => ({ ang: (r() - 0.5) * 0.22, len: 0.3 + r() * 0.08, lift: r() * 0.012 }));
  }, []);

  // The guru bead sits between the last and first bead, its tassel pointing outward.
  const guruPose = useMemo(() => {
    const mid = rest[0].clone().add(rest[N - 1]).multiplyScalar(0.5);
    const outward = mid.clone().setY(0).normalize();
    return { pos: mid.clone().addScaledVector(outward, 0.05), yaw: Math.atan2(outward.x, outward.z) };
  }, [rest]);

  useFrame((state) => {
    const mesh = beads.current;
    if (!mesh) return;
    if (!mesh.instanceColor) mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    const t = elapsed(state.clock.elapsedTime);
    const tmp = scratch;

    for (let i = 0; i < N; i++) {
      const target = rest[i];
      // The strand is lowered from one end: each bead arrives a moment after the last.
      const delay = 0.5 + (i / N) * 2.6;
      const p = THREE.MathUtils.clamp((t - delay) / 0.9, 0, 1);
      const fall = (1 - p) * (1 - p);
      const q = THREE.MathUtils.clamp((t - delay - 0.9) / 0.6, 0, 1);
      const settle = q > 0 ? Math.abs(Math.sin(q * Math.PI * 2)) * Math.exp(-5 * q) * 0.05 : 0;
      // Beads slide the last few centimetres into place along the loop.
      const slide = 1 - smooth(p);
      tmp.position.set(target.x + target.z * 0.25 * slide, target.y + fall * 2.6 + settle, target.z - target.x * 0.25 * slide);
      const [a, b, c] = spins[i];
      tmp.rotation.set(a * (1 - p) + 1.57, b, c * (1 - p));
      tmp.scale.setScalar(t > delay - 0.4 ? 1 : 0.0001);
      tmp.updateMatrix();
      mesh.setMatrixAt(i, tmp.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;

    if (guru.current) {
      const p = THREE.MathUtils.clamp((t - 3.4) / 1.1, 0, 1);
      guru.current.position.set(guruPose.pos.x, (1 - p) * (1 - p) * 2.4, guruPose.pos.z);
      guru.current.visible = t > 3.0;
    }
  });

  return (
    <group>
      <instancedMesh ref={beads} args={[geo, mat, N]} castShadow receiveShadow frustumCulled={false} />
      <group ref={guru} rotation-y={guruPose.yaw} visible={false}>
        <mesh material={guruMat} position-y={BEAD * 1.2} castShadow>
          <sphereGeometry args={[BEAD * 1.3, 48, 32]} />
        </mesh>
        {/* brass cap and silk tassel, lying on the floor */}
        <mesh material={guruMat} position={[0, 0.035, 0.12]} rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.028, 0.034, 0.07, 24]} />
        </mesh>
        {tassel.map((th, k) => (
          <mesh
            key={k}
            material={silkMat}
            position={[Math.sin(th.ang) * (th.len / 2), 0.01 + th.lift, 0.15 + Math.cos(th.ang) * (th.len / 2)]}
            rotation={[Math.PI / 2, 0, -th.ang]}
            castShadow
          >
            <cylinderGeometry args={[0.0035, 0.003, th.len, 4]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

/** A long, slow pull-back from floor level, then a barely-there drift. */
function Camera({ elapsed, mobile, focus }: { elapsed: Elapsed; mobile: boolean; focus: (d: number) => void }) {
  const from = useMemo(() => new THREE.Vector3(1.6, 0.35, 2.4), []);
  const to = useMemo(() => new THREE.Vector3(0, mobile ? 4.6 : 2.9, mobile ? 7.4 : 7.2), [mobile]);
  const look = useMemo(() => new THREE.Vector3(), []);
  useFrame((state) => {
    const t = elapsed(state.clock.elapsedTime);
    const k = easeInOut(THREE.MathUtils.clamp(t / INTRO, 0, 1));
    const cam = state.camera;
    cam.position.lerpVectors(from, to, k);
    const idle = Math.max(0, t - INTRO);
    cam.position.x += Math.sin(idle * 0.08) * 0.35 * Math.min(1, idle / 4) + state.pointer.x * 0.2;
    cam.position.y += state.pointer.y * 0.1;
    // Aim below the loop so it rests in the upper half of the frame, above the title.
    look.set(0.25 * (1 - k), 0.05 - (mobile ? 1.0 : 0.62) * k, 0.2 * (1 - k) + (mobile ? 1.4 : 1.05) * k);
    cam.lookAt(look);
    // Follow focus: keep the strand sharp as the camera pulls away.
    focus(cam.position.length());
  });
  return null;
}

function Floor({ mobile }: { mobile: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[40, 40]} />
      {mobile ? (
        <meshStandardMaterial color="#120d0a" roughness={0.75} metalness={0.2} />
      ) : (
        <MeshReflectorMaterial
          resolution={1024}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={4}
          mixContrast={1}
          roughness={0.85}
          metalness={0.35}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#110c09"
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
      {/* The one warm key light, high and to the side, like a gallery spot. */}
      <spotLight
        position={[2.2, 6.5, 2.4]}
        target={target}
        angle={0.42}
        penumbra={1}
        intensity={140}
        color="#ffd2a1"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0002}
      />
      {/* A faint rim from behind to separate the beads from the dark. */}
      <directionalLight position={[-3, 1.5, -5]} intensity={1.4} color="#e8d6c0" />
      <ambientLight intensity={0.04} />
    </>
  );
}

export default function MalaScene({ mobile = false }: { mobile?: boolean }) {
  const start = useRef<number | null>(null);
  const dof = useRef<DepthOfFieldEffect>(null);
  const elapsed = useCallback<Elapsed>((clock) => {
    if (start.current === null) start.current = clock;
    return clock - start.current;
  }, []);
  const focus = useCallback((d: number) => {
    if (dof.current) dof.current.cocMaterial.focusDistance = d;
  }, []);
  return (
    <Canvas
      shadows="soft"
      dpr={[1, mobile ? 1.3 : 1.75]}
      camera={{ position: [1.6, 0.35, 2.4], fov: mobile ? 42 : 30, near: 0.1, far: 40 }}
      gl={{ antialias: false, powerPreference: "high-performance", stencil: false }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.0;
      }}
    >
      <color attach="background" args={["#0b0806"]} />
      <fog attach="fog" args={["#0b0806", 6, 13]} />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={2.6} color="#ffd9b0" position={[-4, 4, 3]} scale={[4, 2, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#f5e6cf" position={[4, 2, 2]} scale={[2, 4, 1]} />
        <Lightformer form="ring" intensity={2.5} color="#c4975a" position={[0, 3, -5]} scale={3} />
      </Environment>
      <Lights />
      {/* A portrait frame is narrow: show the whole loop rather than crop it. */}
      <group scale={mobile ? 0.6 : 1}>
        <Mala elapsed={elapsed} />
      </group>
      <Floor mobile={mobile} />
      <Sparkles count={mobile ? 25 : 50} scale={[5, 3, 4]} position={[0.6, 1.6, 0.4]} size={1.6} speed={0.15} color="#e8c89a" opacity={0.35} />
      <Camera elapsed={elapsed} mobile={mobile} focus={focus} />
      {mobile ? (
        <EffectComposer multisampling={0}>
          <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.45} />
          <Vignette offset={0.28} darkness={0.85} />
        </EffectComposer>
      ) : (
        <EffectComposer multisampling={4}>
          <DepthOfField ref={dof} focusDistance={7.6} focusRange={2.6} bokehScale={3} height={540} />
          <Bloom mipmapBlur luminanceThreshold={0.95} luminanceSmoothing={0.2} intensity={0.45} />
          <Vignette offset={0.28} darkness={0.85} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
