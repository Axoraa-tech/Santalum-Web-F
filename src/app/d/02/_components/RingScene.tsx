"use client";

import { ContactShadows, Environment, Lightformer } from "@react-three/drei";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { useMemo, useRef, type RefObject } from "react";
import * as THREE from "three";
import type { Tone } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { PAGE_BG } from "./BodyTint";
import { endGrainTexture, photoTexture, rimTexture, shadowTexture } from "./textures";

/** Shared, mutable state of the ring. The DOM (drag, scroll, keys) writes it; the scene reads it every frame. */
export type RingState = {
  rot: number;
  target: number;
  vel: number;
  dragging: boolean;
  dragged: boolean;
  hover: number;
  open: boolean;
};

export type RingItem = { slug: string; photo: string; tone?: Tone };

type Props = {
  items: RingItem[];
  wood: Wood;
  ringRef: RefObject<RingState>;
  onActive: (slug: string) => void;
  onOpen: () => void;
  reduced: boolean;
  running: boolean;
};

const R = 4.2; // ring radius
const DR = 0.8; // disc radius
const T = 0.32; // disc thickness
const B = 0.08; // bevel
const BASE_Y = 0.9;
const FAN = -0.34; // discs beside the front turn a little towards the viewer, so their photos read

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const damp = (a: number, b: number, l: number, dt: number) => a + (b - a) * (1 - Math.exp(-l * dt));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function useDiscGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const seg = 7;
    for (let i = 0; i <= seg; i++) {
      const a = ((i / seg) * Math.PI) / 2;
      pts.push(new THREE.Vector2(DR - B + Math.sin(a) * B, -T / 2 + B - Math.cos(a) * B));
    }
    for (let i = 0; i <= seg; i++) {
      const a = ((i / seg) * Math.PI) / 2;
      pts.push(new THREE.Vector2(DR - B + Math.cos(a) * B, T / 2 - B + Math.sin(a) * B));
    }
    const rim = new THREE.LatheGeometry(pts, 96);
    rim.rotateX(Math.PI / 2);
    const face = new THREE.CircleGeometry(DR - B, 96);
    face.translate(0, 0, T / 2);
    const back = new THREE.CircleGeometry(DR - B, 96);
    back.rotateY(Math.PI);
    back.translate(0, 0, -T / 2);
    const shadow = new THREE.PlaneGeometry(1, 1);
    shadow.rotateX(-Math.PI / 2);
    return { rim, face, back, shadow };
  }, []);
}

/** Spring the ring towards its target and report which piece is at the front. Runs before the discs. */
function Physics({ ringRef, items, onActive, reduced }: Pick<Props, "ringRef" | "items" | "onActive" | "reduced">) {
  const last = useRef("");
  useFrame((_, delta) => {
    const s = ringRef.current;
    const dt = Math.min(delta, 1 / 30);
    if (!s.dragging) {
      if (reduced) {
        s.rot = damp(s.rot, s.target, 16, dt);
        s.vel = 0;
      } else {
        const k = 64;
        const c = 2 * Math.sqrt(k) * 0.8;
        s.vel += ((s.target - s.rot) * k - s.vel * c) * dt;
        s.rot += s.vel * dt;
      }
      if (Math.abs(s.target - s.rot) < 1e-4 && Math.abs(s.vel) < 1e-3) {
        s.rot = s.target;
        s.vel = 0;
      }
    }
    const n = items.length;
    const fi = ((Math.round(s.rot) % n) + n) % n;
    const slug = items[fi]?.slug;
    if (slug && slug !== last.current) {
      last.current = slug;
      onActive(slug);
    }
  });
  return null;
}

type DiscProps = {
  item: RingItem;
  index: number;
  count: number;
  wood: Wood;
  geo: ReturnType<typeof useDiscGeometry>;
  ringRef: RefObject<RingState>;
  onOpen: () => void;
  reduced: boolean;
};

function Disc({ item, index, count, wood, geo, ringRef, onOpen, reduced }: DiscProps) {
  const group = useRef<THREE.Group>(null);
  const shadow = useRef<THREE.Mesh>(null);
  const shadowMat = useRef<THREE.MeshBasicMaterial>(null);
  const faceMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const rimMat = useRef<THREE.MeshStandardMaterial>(null);
  const backMat = useRef<THREE.MeshStandardMaterial>(null);
  const hov = useRef(0);
  const openT = useRef(0);
  const photo = useMemo(() => photoTexture(item.photo, item.tone), [item.photo, item.tone]);
  const rim = useMemo(() => rimTexture(wood), [wood]);
  const back = useMemo(() => endGrainTexture(wood), [wood]);
  const soft = useMemo(() => shadowTexture(), []);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const s = ringRef.current;
    let d = index - s.rot;
    d = ((d % count) + count) % count;
    if (d > count / 2) d -= count;
    const ad = Math.abs(d);
    const f = clamp01(1 - ad);
    const fs = f * f * (3 - 2 * f);
    const theta = (d / count) * Math.PI * 2;
    const t = state.clock.elapsedTime;

    // the page-load moment: discs rise out of the floor and fan into the ring, front first
    const it = reduced ? 1 : clamp01((t - 0.2 - Math.min(ad, 6) * 0.085) / 1.25);
    const ie = 1 - Math.pow(1 - it, 3);

    hov.current = damp(hov.current, s.hover === index && ad > 0.5 ? 1 : 0, 10, delta);
    openT.current = damp(openT.current, s.open ? 1 : 0, reduced ? 30 : 4, delta);
    const o = openT.current;

    const lift = fs * (0.46 + 0.12 * o) + hov.current * 0.2;
    const bob = reduced ? 0 : Math.sin(t * 1.3 + index) * 0.035 * fs;
    const rr = R * (0.35 + 0.65 * ie);
    g.position.set(Math.sin(theta) * rr, BASE_Y + lift + bob - (1 - ie) * 2.4, Math.cos(theta) * rr);

    const sway = reduced ? 0 : Math.sin(t * 0.55) * 0.07 * fs * (1 - o);
    const yaw = theta + Math.sign(d) * FAN * Math.min(1, ad) * (1 - fs) + sway - o * fs * 0.38 + (1 - ie) * 2.2 * Math.sign(d || 1);
    const pitch = -0.34 * fs + 0.04 * (1 - fs);
    g.rotation.set(pitch, yaw, 0, "YXZ");

    const sc = (0.88 + 0.17 * fs + 0.1 * o * fs - 0.14 * o * (1 - fs)) * (0.5 + 0.5 * ie);
    g.scale.setScalar(sc);

    const depth = (Math.cos(theta) + 1) / 2;
    const b = (0.52 + 0.28 * depth + 0.2 * fs) * (1 - 0.4 * o * (1 - fs));
    if (faceMat.current) {
      faceMat.current.color.setScalar(b);
      faceMat.current.emissiveIntensity = 0.32 * b * b;
    }
    rimMat.current?.color.setScalar(b);
    backMat.current?.color.setScalar(b);

    // soft shadow on the floor: wider, fainter and blurrier the higher the disc floats
    const sh = shadow.current;
    if (sh && shadowMat.current) {
      const h = Math.max(0, g.position.y - DR * sc * Math.cos(pitch));
      sh.position.set(g.position.x, 0.004, g.position.z + 0.06);
      sh.rotation.set(0, yaw, 0);
      sh.scale.set(2 * DR * sc * (0.95 + 0.45 * h), 1, (T + 0.42 + 1.1 * h + 0.5 * Math.abs(Math.sin(pitch))) * sc);
      shadowMat.current.opacity = (0.5 / (1 + 2.4 * h)) * ie * (0.55 + 0.45 * depth);
    }
  });

  const signed = () => {
    const s = ringRef.current;
    let d = index - s.rot;
    d = ((d % count) + count) % count;
    if (d > count / 2) d -= count;
    return d;
  };

  const onClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    const s = ringRef.current;
    if (s.dragged || e.delta > 6) return;
    const d = signed();
    if (Math.abs(d) < 0.5) onOpen();
    else s.target = Math.round(s.rot + d);
  };

  return (
    <>
    <mesh ref={shadow} geometry={geo.shadow} renderOrder={-1}>
      <meshBasicMaterial ref={shadowMat} map={soft} color="#3a2416" transparent depthWrite={false} opacity={0} />
    </mesh>
    <group
      ref={group}
      onClick={onClick}
      onPointerOver={(e) => {
        e.stopPropagation();
        ringRef.current.hover = index;
        (e.nativeEvent.target as HTMLElement | null)?.style.setProperty("cursor", "pointer");
      }}
      onPointerOut={(e) => {
        if (ringRef.current.hover === index) ringRef.current.hover = -1;
        (e.nativeEvent.target as HTMLElement | null)?.style.removeProperty("cursor");
      }}
    >
      <mesh geometry={geo.rim}>
        <meshStandardMaterial ref={rimMat} map={rim} roughness={0.5} metalness={0} />
      </mesh>
      <mesh geometry={geo.face}>
        <meshPhysicalMaterial
          ref={faceMat}
          map={photo}
          emissive="#ffffff"
          emissiveMap={photo}
          emissiveIntensity={0.3}
          roughness={0.42}
          clearcoat={0.55}
          clearcoatRoughness={0.28}
        />
      </mesh>
      <mesh geometry={geo.back} rotation-z={index * 2.39}>
        <meshStandardMaterial ref={backMat} map={back} roughness={0.55} />
      </mesh>
    </group>
    </>
  );
}

/** Camera: raised studio view of the whole ring; dollies in to the front disc when a piece is opened. */
function Rig({ ringRef, reduced }: { ringRef: RefObject<RingState>; reduced: boolean }) {
  const look = useRef(new THREE.Vector3(0, 1.1, 0.6));
  const tmp = useMemo(() => ({ p: new THREE.Vector3(), l: new THREE.Vector3() }), []);
  useFrame((state, delta) => {
    const cam = state.camera as THREE.PerspectiveCamera;
    const a = state.size.width / Math.max(1, state.size.height);
    const w = clamp01((a - 0.55) / (1.45 - 0.55));
    const fov = lerp(40, 30, w);
    const htan = Math.tan((fov * Math.PI) / 360) * a;
    const fit = (R + DR + 0.55) / htan;
    const z = Math.min(Math.max(fit, R + 6.9), lerp(R + 7.4, R + 10.6, w));
    const elev = lerp(0.3, 0.36, w);
    const open = ringRef.current.open;
    if (open) {
      if (a > 1) {
        tmp.p.set(2.75, BASE_Y + 1.05, R + 4.6);
        tmp.l.set(2.15, BASE_Y + 0.42, R - 0.4);
      } else {
        tmp.p.set(0, BASE_Y + 1.6, R + 4.2);
        tmp.l.set(0, BASE_Y + 1.2, R);
      }
    } else {
      tmp.p.set(0, BASE_Y + Math.tan(elev) * z, z);
      tmp.l.set(0, lerp(1.5, 0.98, w), lerp(1.4, 0.55, w));
    }
    const k = reduced ? 1 : 1 - Math.exp(-3.2 * Math.min(delta, 1 / 20));
    cam.position.lerp(tmp.p, k);
    look.current.lerp(tmp.l, k);
    cam.lookAt(look.current);
    if (Math.abs(cam.fov - fov) > 0.01) {
      cam.fov = lerp(cam.fov, fov, k);
      cam.updateProjectionMatrix();
    }
  });
  return null;
}

export default function RingScene({ items, wood, ringRef, onActive, onOpen, reduced, running }: Props) {
  const geo = useDiscGeometry();
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={running ? "always" : "never"}
      camera={{ fov: 30, position: [0, 4.4, 15], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <fog attach="fog" args={[PAGE_BG[wood], 13, 26]} />
      <hemisphereLight args={["#fffaf3", "#d8d0c4", 1.25]} />
      <directionalLight position={[2.5, 7, 6]} intensity={2.1} color="#fff4e6" />
      <directionalLight position={[-6, 3, -4]} intensity={0.8} color="#ffe0bf" />
      <Environment resolution={128} frames={1} environmentIntensity={0.55}>
        <Lightformer form="rect" intensity={3} position={[0, 5, 6]} scale={[10, 2.5, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-7, 2, 1]} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={2.2} position={[5, 3, -4]} scale={3} />
      </Environment>
      <Physics ringRef={ringRef} items={items} onActive={onActive} reduced={reduced} />
      {items.map((it, i) => (
        <Disc key={it.slug} item={it} index={i} count={items.length} wood={wood} geo={geo} ringRef={ringRef} onOpen={onOpen} reduced={reduced} />
      ))}
      <ContactShadows position={[0, 0.001, 0]} scale={16} far={2.4} blur={2.6} opacity={0.32} resolution={512} color="#2b1d14" />
      <Rig ringRef={ringRef} reduced={reduced} />
    </Canvas>
  );
}
