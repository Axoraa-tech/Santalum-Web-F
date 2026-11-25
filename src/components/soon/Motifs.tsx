"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * Hand-drawn watermarks from 19th-century public-domain plates (see public/motifs/CREDITS.md),
 * turned into sepia pencil sketches: red and white sandalwood branches, a lotus pond and a
 * spotted deer (the golden deer of the epic). They stand on the floor around the mala, sway in
 * a slow breeze and turn to face the camera; the deer walks the circle, always facing where it
 * goes. The polished floor reflects them. No deities.
 */

type Spec = { src: string; height: number; radius: number; angle: number; walk?: number; sway: number; opacity: number };

const SPECS: Spec[] = [
  { src: "/motifs/red-sandalwood.webp", height: 1.7, radius: 4.1, angle: 2.35, sway: 0.03, opacity: 0.34 },
  { src: "/motifs/white-sandalwood.webp", height: 1.8, radius: 4.3, angle: 0.75, sway: 0.03, opacity: 0.3 },
  { src: "/motifs/lotus.webp", height: 1.25, radius: 3.45, angle: -0.55, sway: 0.045, opacity: 0.32 },
  { src: "/motifs/lotus.webp", height: 1.0, radius: 3.6, angle: 3.75, sway: 0.05, opacity: 0.26 },
  // The deer walks the circle (radians per second).
  { src: "/motifs/chital.webp", height: 0.9, radius: 3.25, angle: 1.4, walk: 0.06, sway: 0, opacity: 0.4 },
];

const loader = new THREE.TextureLoader();
const v = new THREE.Vector3();
const right = new THREE.Vector3();

type Loaded = Spec & { tex: THREE.Texture; aspect: number };

export function Motifs() {
  const group = useRef<THREE.Group>(null);
  const [items, setItems] = useState<Loaded[] | null>(null);

  useEffect(() => {
    let alive = true;
    const cache = new Map<string, Promise<THREE.Texture>>();
    const load = (src: string) => {
      if (!cache.has(src))
        cache.set(
          src,
          loader.loadAsync(src).then((t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            t.anisotropy = 4;
            return t;
          }),
        );
      return cache.get(src)!;
    };
    void Promise.all(
      SPECS.map(async (s) => {
        const tex = await load(s.src);
        const img = tex.image as { width: number; height: number };
        return { ...s, tex, aspect: img.width / img.height };
      }),
    )
      .then((l) => {
        if (alive) setItems(l);
      })
      .catch(() => {
        /* watermarks are decoration: skip them if they fail to load */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => items?.forEach((i) => i.tex.dispose()), [items]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g || !items) return;
    const t = state.clock.elapsedTime;
    const fade = Math.min(1, t / 4);
    const cam = state.camera;
    right.set(1, 0, 0).applyQuaternion(cam.quaternion);
    g.children.forEach((node, i) => {
      const it = items[i];
      const pivot = node as THREE.Group;
      const ud = pivot.userData as { a?: number };
      ud.a = (ud.a ?? it.angle) + (it.walk ?? 0) * delta;
      const a = ud.a;
      pivot.position.set(Math.cos(a) * it.radius, 0, Math.sin(a) * it.radius);
      // Turn to face the camera around the vertical axis only, like a cut-out standing on the floor.
      pivot.rotation.y = Math.atan2(cam.position.x - pivot.position.x, cam.position.z - pivot.position.z);
      const mesh = pivot.children[0] as THREE.Mesh;
      // Breeze: a slow lean from the base.
      mesh.rotation.z = Math.sin(t * 0.6 + i * 1.7) * it.sway;
      if (it.walk) {
        // Face the way it walks, as seen from the camera; a gentle bob with each step.
        v.set(-Math.sin(a), 0, Math.cos(a));
        mesh.scale.x = v.dot(right) >= 0 ? 1 : -1; // the drawing faces right
        mesh.position.y = it.height / 2 + Math.abs(Math.sin(t * 2.2)) * 0.015;
      }
      (mesh.material as THREE.MeshBasicMaterial).opacity = Math.min(1, it.opacity * 1.35) * fade;
    });
  });

  if (!items) return null;
  return (
    <group ref={group}>
      {items.map((it, i) => (
        <group key={i}>
          {/* pivot at the base so swaying leans from the ground */}
          <mesh position-y={it.height / 2} renderOrder={-1}>
            <planeGeometry args={[it.height * it.aspect, it.height]} />
            <meshBasicMaterial map={it.tex} transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
