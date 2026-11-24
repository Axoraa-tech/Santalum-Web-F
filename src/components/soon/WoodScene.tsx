"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { useMemo, useRef } from "react";
import * as THREE from "three";

/* ------------------------------------------------------------------
   Procedural sandalwood textures (no image downloads).
   End grain: growth rings around an off-centre pith, dark heartwood
   fading to pale sapwood. Side grain: long wavy fibres.
   ------------------------------------------------------------------ */

function rand(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function endGrainTexture() {
  const size = 512;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d")!;
  const img = ctx.createImageData(size, size);
  const r = rand(7);
  const wobble = Array.from({ length: 6 }, () => r() * Math.PI * 2);
  const cx = size * 0.47;
  const cy = size * 0.52;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const a = Math.atan2(dy, dx);
      const d = Math.hypot(dx, dy) / (size * 0.5);
      const warp = 0.012 * Math.sin(a * 3 + wobble[0]) + 0.008 * Math.sin(a * 7 + wobble[1]);
      const ring = Math.sin((d + warp) * 110);
      const line = Math.pow(Math.max(0, ring), 6);
      // Heartwood (deep amber-red) to sapwood (pale sand) toward the edge.
      const heart = THREE.MathUtils.smoothstep(d, 0.72, 0.9);
      const base = [
        THREE.MathUtils.lerp(150, 214, heart),
        THREE.MathUtils.lerp(92, 184, heart),
        THREE.MathUtils.lerp(52, 140, heart),
      ];
      const shade = 1 - line * 0.28 - (r() - 0.5) * 0.05;
      const i = (y * size + x) * 4;
      img.data[i] = base[0] * shade;
      img.data[i + 1] = base[1] * shade;
      img.data[i + 2] = base[2] * shade;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function sideGrainTexture() {
  const w = 512;
  const h = 256;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#9c6a3f";
  ctx.fillRect(0, 0, w, h);
  const r = rand(11);
  for (let k = 0; k < 140; k++) {
    const x0 = r() * w;
    const amp = 2 + r() * 6;
    const freq = 0.01 + r() * 0.03;
    ctx.strokeStyle = `rgba(${60 + r() * 40}, ${30 + r() * 20}, ${15 + r() * 10}, ${0.08 + r() * 0.18})`;
    ctx.lineWidth = 0.6 + r() * 2.2;
    ctx.beginPath();
    for (let y = 0; y <= h; y += 4) {
      const x = x0 + Math.sin(y * freq + k) * amp;
      if (y === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(3, 1);
  t.anisotropy = 4;
  return t;
}

/** A turned sandalwood slice: end-grain faces, fibrous sides, softly bevelled edge. */
function WoodSlice() {
  const group = useRef<THREE.Group>(null);
  const [endMat, sideMat] = useMemo(() => {
    const end = new THREE.MeshStandardMaterial({ map: endGrainTexture(), roughness: 0.62, metalness: 0 });
    const side = new THREE.MeshStandardMaterial({ map: sideGrainTexture(), roughness: 0.78, metalness: 0 });
    return [end, side];
  }, []);

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.18;
  });

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.6}>
      <group ref={group} rotation={[0.42, 0, 0.12]}>
        {/* cylinder material order: side, top, bottom */}
        <mesh material={[sideMat, endMat, endMat]}>
          <cylinderGeometry args={[1.25, 1.25, 0.42, 96, 1]} />
        </mesh>
        {/* thin bevel rings soften the hard edge */}
        <mesh position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]} material={sideMat}>
          <torusGeometry args={[1.235, 0.018, 8, 96]} />
        </mesh>
        <mesh position={[0, -0.21, 0]} rotation={[Math.PI / 2, 0, 0]} material={sideMat}>
          <torusGeometry args={[1.235, 0.018, 8, 96]} />
        </mesh>
      </group>
    </Float>
  );
}

/* ------------------------------------------------------------------
   Aroma: soft additive smoke particles rising and curling, GPU-animated.
   ------------------------------------------------------------------ */

const smokeVert = /* glsl */ `
  uniform float uTime;
  uniform float uPixel;
  attribute float aSeed;
  varying float vAlpha;
  void main() {
    float life = fract(uTime * 0.06 + aSeed);
    vec3 p = position;
    float rise = life * 4.2;
    p.y += rise;
    p.x += sin(rise * 1.6 + aSeed * 12.0 + uTime * 0.4) * (0.15 + rise * 0.22);
    p.z += cos(rise * 1.2 + aSeed * 9.0) * (0.1 + rise * 0.12);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = (0.35 + rise * 0.45) * uPixel / -mv.z;
    vAlpha = smoothstep(0.0, 0.15, life) * (1.0 - smoothstep(0.55, 1.0, life));
  }
`;

const smokeFrag = /* glsl */ `
  uniform vec3 uColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(uColor, a * a * vAlpha * 0.07);
  }
`;

function Smoke({ count = 220 }: { count?: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    const r = rand(3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (r() - 0.5) * 0.5;
      pos[i * 3 + 1] = -0.2;
      pos[i * 3 + 2] = -0.6 + (r() - 0.5) * 0.4;
      seed[i] = r();
    }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uPixel: { value: 1 }, uColor: { value: new THREE.Color("#e8d6bc") } }),
    [],
  );

  useFrame((state, dt) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value += dt;
    mat.current.uniforms.uPixel.value = state.size.height * state.viewport.dpr * 1.45;
  });

  return (
    <points geometry={geo} frustumCulled={false}>
      <shaderMaterial
        ref={mat}
        vertexShader={smokeVert}
        fragmentShader={smokeFrag}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** Pointer parallax: the camera drifts a little toward the cursor. */
function Rig() {
  useFrame((state) => {
    const { camera, pointer } = state;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, pointer.x * 0.35, 0.04);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 0.3 + pointer.y * 0.2, 0.04);
    camera.lookAt(0, 0, 0);
  });
  return null;
}

export default function WoodScene({ mobile = false }: { mobile?: boolean }) {
  return (
    <Canvas
      dpr={[1, mobile ? 1.25 : 1.75]}
      camera={{ position: [0, 0.3, 5.6], fov: 34 }}
      gl={{ antialias: !mobile, powerPreference: "high-performance", alpha: true }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <ambientLight intensity={0.25} color="#f5e6cf" />
      <directionalLight position={[3, 4, 3]} intensity={2.4} color="#ffd9a8" />
      <pointLight position={[-3, -1, 2]} intensity={6} distance={10} color="#c4975a" />
      <pointLight position={[0, 2, -3]} intensity={8} distance={10} color="#8b5e3c" />
      <group position={[0, -0.25, 0]} scale={0.95}>
        <WoodSlice />
        <Smoke count={mobile ? 120 : 220} />
      </group>
      <Sparkles count={mobile ? 30 : 60} scale={[6, 4, 3]} size={2} speed={0.25} color="#c4975a" opacity={0.6} />
      <Rig />
    </Canvas>
  );
}
