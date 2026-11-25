"use client";

import { Environment, Lightformer, PerformanceMonitor } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { TONE_FILTER, type Tone } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { ui } from "./store";
import { BG } from "./palette";
import { DESK_RIG, PHONE_RIG, StrandEngine } from "./strand-engine";
import { STRAND } from "./strand-list";

/* ---------- product photos as textures (toned like the site's photos) ---------- */

const cache = new Map<string, Promise<THREE.Texture>>();

function loadPhoto(id: string, tone?: Tone) {
  const key = `${id}:${tone ?? ""}`;
  let p = cache.get(key);
  if (!p) {
    p = new Promise<THREE.Texture>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.decoding = "async";
      img.onload = () => {
        const S = 512;
        const c = document.createElement("canvas");
        c.width = S;
        c.height = S;
        const g = c.getContext("2d");
        if (!g) return reject(new Error("no 2d context"));
        if (tone && "filter" in g) g.filter = TONE_FILTER[tone];
        const r = Math.max(S / img.naturalWidth, S / img.naturalHeight);
        const w = img.naturalWidth * r;
        const h = img.naturalHeight * r;
        g.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
        const t = new THREE.CanvasTexture(c);
        t.colorSpace = THREE.SRGBColorSpace;
        t.anisotropy = 4;
        resolve(t);
      };
      img.onerror = () => {
        cache.delete(key);
        reject(new Error("photo failed"));
      };
      img.src = `https://images.unsplash.com/${id}?w=512&h=512&q=72&auto=format&fit=crop`;
    });
    cache.set(key, p);
  }
  return p;
}

/* ---------- the scene ---------- */

type Props = { wood: Wood; mobile: boolean; reduced: boolean; running: boolean };

export default function Scene({ wood, mobile, reduced, running }: Props) {
  const rig = mobile ? PHONE_RIG : DESK_RIG;
  const [dpr, setDpr] = useState(mobile ? 1.25 : 1.75);
  // the starting room colour; the engine eases it when the wood changes
  const [bg] = useState(() => BG[wood]);
  return (
    <Canvas
      flat
      dpr={[1, dpr]}
      frameloop={running ? "always" : "never"}
      camera={{ fov: rig.fov, near: 0.1, far: rig.far + 14, position: [0, 2, 6] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
      fallback={
        <p className="grid h-full place-items-center px-8 text-center text-[15px] text-(--muted)">
          The 3D strand needs WebGL. Everything below works without it.
        </p>
      }
    >
      <color attach="background" args={[bg]} />
      <fog attach="fog" args={[bg, rig.near, rig.far]} />
      <hemisphereLight args={["#fff8ee", "#b9a083", 1.35]} />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={["#2b2219"]} />
        <Lightformer form="rect" intensity={2.6} color="#fff3e2" position={[0, 9, 0]} rotation-x={Math.PI / 2} scale={[16, 6, 1]} />
        <Lightformer form="rect" intensity={1.4} color="#ffe6c8" position={[-9, 2, 4]} rotation-y={Math.PI / 2} scale={[4, 12, 1]} />
        <Lightformer form="rect" intensity={1} color="#ffffff" position={[9, 1, -3]} rotation-y={-Math.PI / 2} scale={[3, 9, 1]} />
      </Environment>
      <PerformanceMonitor onDecline={() => setDpr(1)} />
      <Strand wood={wood} mobile={mobile} reduced={reduced} />
    </Canvas>
  );
}

function Strand({ wood, mobile, reduced }: { wood: Wood; mobile: boolean; reduced: boolean }) {
  const engine = useMemo(() => new StrandEngine({ mobile, reduced }), [mobile, reduced]);
  const clock = useThree((s) => s.clock);
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);

  useEffect(() => () => engine.dispose(), [engine]);

  useEffect(() => {
    engine.setWood(wood, clock.elapsedTime);
  }, [engine, wood, clock]);

  // photos for the current wood first, then the other wood's, so a switch finds them ready
  useEffect(() => {
    let alive = true;
    const order = [...STRAND.filter((p) => p.wood === wood), ...STRAND.filter((p) => p.wood !== wood)];
    order.forEach((p) => {
      const shot = p.shots[0];
      loadPhoto(shot.photo.id, shot.tone)
        .then((tex) => {
          if (alive) engine.setPhoto(p.slug, tex);
        })
        .catch(() => {});
    });
    return () => {
      alive = false;
    };
  }, [engine, wood]);

  // pointing at a medallion or product bead opens the piece
  useEffect(() => {
    const el = gl.domElement;
    const ndc = new THREE.Vector2();
    const rc = new THREE.Raycaster();
    const toNdc = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      toNdc(e);
      el.style.cursor = engine.pick(rc, ndc, camera) ? "pointer" : "";
    };
    const click = (e: MouseEvent) => {
      toNdc(e);
      const slug = engine.pick(rc, ndc, camera);
      if (slug) ui.openProduct(slug);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("click", click);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("click", click);
    };
  }, [engine, gl, camera]);

  return (
    <>
      <Driver engine={engine} />
      <primitive object={engine.group} />
    </>
  );
}

/** One pass per frame: beads, camera, labels. */
function Driver({ engine }: { engine: StrandEngine }) {
  useFrame((state, dt) => {
    engine.update(state.clock.elapsedTime, Math.min(dt, 0.05), state.camera as THREE.PerspectiveCamera, state.scene, state.size);
  });
  return null;
}
