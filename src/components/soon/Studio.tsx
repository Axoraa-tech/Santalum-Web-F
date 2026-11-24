"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { rng } from "./materials";

const UP = new THREE.Vector3(0, 1, 0);
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

/** Where the light comes from: high and behind the mala. Beads are born from it. */
export const SOURCE = new THREE.Vector3(-1.2, 7, -5);

/* ---------- Light falling from behind ---------- */
export function rayTexture() {
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

export function Rays() {
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
    const dir = SOURCE.clone().normalize();
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

export function Floor({ mobile }: { mobile: boolean }) {
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

export function Lights() {
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
        position={SOURCE.toArray()}
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

