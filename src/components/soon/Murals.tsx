"use client";

import { useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/**
 * The Ramayana, as sepia mural drawings on a curved wall around the studio, in story order:
 * Rama breaks the bow (Sita's swayamvara) · Sita in the Ashoka grove · Hanuman carries the
 * mountain · Rama and Sita enthroned (Ramapanchayan). Made from public-domain prints by
 * Raja Ravi Varma and the Ravi Varma Press (see public/murals/CREDITS.md).
 *
 * They only appear while the camera is moving with the beads (threading and the return) and
 * fade away for the still, full view. The mural nearest the light glows a little brighter,
 * so the story lights up as the light travels round.
 */

const MURALS = [
  "/murals/1-rama-bow.webp",
  "/murals/2-sita-ashoka.webp",
  "/murals/3-hanuman.webp",
  "/murals/4-ramapanchayan.webp",
];

const WALL_R = 5.4; // radius of the mural wall
const HEIGHT = 2.6; // world height of each mural
const LEAN = 0.12; // murals lean back so the overhead cameras see them face-on
const START = Math.PI / 2 + 0.55; // first mural just after where the light lands
const COUNT = MURALS.length * 2; // the story told twice round the circle
const SPREAD = (Math.PI * 2) / COUNT;

export type MuralCue = () => { vis: number; angle: number };

const loader = new THREE.TextureLoader();

function angleDiff(a: number, b: number) {
  let d = (a - b) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d < -Math.PI) d += Math.PI * 2;
  return d;
}

export function Murals({ cue }: { cue: MuralCue }) {
  const group = useRef<THREE.Group>(null);
  const [items, setItems] = useState<{ tex: THREE.Texture; aspect: number }[] | null>(null);

  useEffect(() => {
    let alive = true;
    void Promise.all(
      MURALS.map((src) =>
        loader.loadAsync(src).then((tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 4;
          const img = tex.image as { width: number; height: number };
          return { tex, aspect: img.width / img.height };
        }),
      ),
    )
      .then((l) => {
        if (alive) setItems(l);
      })
      .catch(() => {
        /* decoration only: skip if they fail to load */
      });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => () => items?.forEach((i) => i.tex.dispose()), [items]);

  useFrame((state) => {
    const g = group.current;
    if (!g || !items) return;
    const { vis, angle } = cue();
    g.visible = vis > 0.002;
    if (!g.visible) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((pivot, i) => {
      const m = pivot.children[0] as THREE.Mesh;
      const a = START + i * SPREAD;
      // The scene the light is passing glows a little.
      const near = Math.exp(-Math.pow(angleDiff(angle, a) / 0.9, 2));
      const mat = m.material as THREE.MeshBasicMaterial;
      mat.opacity = vis * (0.45 + 0.4 * near);
      // A slow breath, as if the wall were lit by moving light.
      pivot.position.y = Math.sin(t * 0.4 + i) * 0.03;
    });
  });

  if (!items) return null;
  return (
    <group ref={group} visible={false}>
      {Array.from({ length: COUNT }, (_, i) => {
        const it = items[i % items.length];
        const a = START + i * SPREAD;
        const x = Math.cos(a) * WALL_R;
        const z = Math.sin(a) * WALL_R;
        return (
          // Each mural stands on the floor facing the centre, leaning back from its base.
          <group key={i} position={[x, 0, z]} rotation-y={Math.atan2(-x, -z)}>
            <mesh position={[0, (HEIGHT / 2) * Math.cos(LEAN), -(HEIGHT / 2) * Math.sin(LEAN)]} rotation-x={-LEAN} renderOrder={-1}>
              <planeGeometry args={[HEIGHT * it.aspect, HEIGHT]} />
              <meshBasicMaterial map={it.tex} transparent opacity={0} depthWrite={false} fog={false} toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
