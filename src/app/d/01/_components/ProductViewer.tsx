"use client";

import { ContactShadows, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import type * as THREE from "three";
import type { Wood } from "@/lib/wood";
import type { ProfileKey } from "./data";
import { bounds, createLathe, DISPLAY, profile } from "./lathe";
import { Studio } from "./LatheScene";
import { createWoodMaterial, woodTextures } from "./woodMaterial";

/** Small viewer for the product page: the piece's lathe profile, standing, in the piece's own wood. */
export default function ProductViewer({ shape, reduced, wood }: { shape: ProfileKey; reduced: boolean; wood: Wood }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.5, 5.6], fov: 30 }} gl={{ antialias: true, alpha: true }}>
      <Studio />
      <Piece shape={shape} wood={wood} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate={!reduced}
        autoRotateSpeed={1.1}
        minPolarAngle={Math.PI * 0.18}
        maxPolarAngle={Math.PI * 0.55}
        target={[0, -0.15, 0]}
      />
    </Canvas>
  );
}

function Piece({ shape, wood }: { shape: ProfileKey; wood: Wood }) {
  const lathe = useMemo(() => createLathe(128), []);
  const mat = useMemo(() => createWoodMaterial(woodTextures(false)), []);
  const mesh = useRef<THREE.Mesh>(null);
  const holder = useRef<THREE.Group>(null);
  const floor = useRef<THREE.Group>(null);
  const w = useRef(wood === "white" ? 1 : 0);

  useEffect(() => {
    const p = profile(shape);
    lathe.update(p);
    const b = bounds(p);
    const size = Math.max(b.maxY - b.minY, b.maxR * 2);
    const k = (2.25 / size) * Math.min(1.15, DISPLAY[shape].scale);
    const g = holder.current;
    const mid = (b.minY + b.maxY) / 2;
    if (g) {
      g.scale.setScalar(k);
      g.position.y = -0.15 - mid * k;
    }
    if (floor.current) floor.current.position.y = -0.15 + (b.minY - mid) * k - 0.005;
  }, [lathe, shape]);

  useEffect(
    () => () => {
      lathe.geometry.dispose();
      mat.material.dispose();
    },
    [lathe, mat],
  );

  useFrame((_, dt) => {
    const m = mesh.current;
    if (!m) return;
    const target = wood === "white" ? 1 : 0;
    w.current += (target - w.current) * (1 - Math.exp(-3.5 * Math.min(dt, 0.05)));
    (m.material as THREE.MeshPhysicalMaterial).userData.uniforms.uWood.value = w.current;
  });

  return (
    <>
      <group ref={holder}>
        <mesh ref={mesh} geometry={lathe.geometry} material={mat.material} frustumCulled={false} />
      </group>
      <group ref={floor}>
        <ContactShadows scale={6} blur={2.2} far={2.4} opacity={0.45} resolution={512} color={wood === "white" ? "#2a2318" : "#221715"} />
      </group>
    </>
  );
}
