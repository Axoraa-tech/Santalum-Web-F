import * as THREE from "three";
import { FAMILIES } from "@/lib/catalog";
import type { Wood } from "@/lib/wood";
import { J } from "./store";
import {
  BEAD_R,
  GURU_R,
  LENGTH,
  PLAIN,
  PRODUCT_R,
  cameraRail,
  controlPoints,
  layoutStrand,
  pathKappa,
  pointInto,
  railInto,
  type StrandLayout,
} from "./strand-math";

/**
 * The 3D mala, built imperatively so the frame loop can do everything in one pass:
 * 108 instanced beads with knots, eleven product beads with hanging photo medallions,
 * the cord, the guru bead and tassel, and the camera that rides beside the cord.
 * React (Scene.tsx) only mounts it and feeds it the wood and the photos.
 */

export const LINEN = "#F6F1E9";
const THREAD = "#B08D57";
const BRASS = "#b48c4a";

const DROP = 0.5;
const RING_R = 0.085;
export const MED_R = 0.8;
const MED_DROP = DROP + RING_R * 2 + MED_R - 0.03; // product bead bottom → medallion centre

export type Rig = {
  side: number;
  lift: number;
  back: number;
  fov: number;
  near: number;
  far: number;
  endDist: number;
  segs: [number, number];
  tube: number;
};

export const DESK_RIG: Rig = { side: 3.2, lift: 1.8, back: 3.4, fov: 42, near: 7, far: 34, endDist: 7.6, segs: [32, 24], tube: 1500 };
export const PHONE_RIG: Rig = { side: 2.7, lift: 2.2, back: 4.4, fov: 56, near: 5.5, far: 25, endDist: 8.2, segs: [20, 14], tube: 900 };

const WOOD_COL: Record<Wood, THREE.Color> = { red: new THREE.Color("#7a2a1d"), white: new THREE.Color("#d4b383") };
const TASSEL_COL: Record<Wood, THREE.Color> = { red: new THREE.Color("#8c2b1b"), white: new THREE.Color("#b48f57") };

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (a: number, b: number, x: number) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3);

/** Procedural grain: fibres run pole to pole, so on a turned bead they gather at the cord holes. */
function makeGrain(seed: number) {
  const W = 512;
  const H = 256;
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  if (!g) return tex;
  const rnd = mulberry32(seed);
  g.fillStyle = "#f4efe8";
  g.fillRect(0, 0, W, H);
  const wavy = (x0: number, amp: number, freq: number, ph: number, width: number, style: string) => {
    for (const off of [-W, 0, W]) {
      g.beginPath();
      for (let y = -4; y <= H + 4; y += 4) {
        const x = x0 + off + Math.sin(y * freq + ph) * amp + Math.sin(y * freq * 2.7 + ph * 1.3) * amp * 0.35;
        if (y === -4) g.moveTo(x, y);
        else g.lineTo(x, y);
      }
      g.lineWidth = width;
      g.strokeStyle = style;
      g.stroke();
    }
  };
  // broad bands of late wood
  for (let i = 0; i < 22; i++) {
    wavy(rnd() * W, 4 + rnd() * 10, 0.012 + rnd() * 0.02, rnd() * 6, 6 + rnd() * 22, `rgba(70,42,24,${0.05 + rnd() * 0.08})`);
  }
  // fine fibres
  for (let i = 0; i < 170; i++) {
    wavy(rnd() * W, 2 + rnd() * 7, 0.015 + rnd() * 0.03, rnd() * 6, 0.6 + rnd() * 1.6, `rgba(52,30,16,${0.07 + rnd() * 0.22})`);
  }
  // light ribbons
  for (let i = 0; i < 26; i++) {
    wavy(rnd() * W, 3 + rnd() * 6, 0.02 + rnd() * 0.02, rnd() * 6, 1 + rnd() * 3, `rgba(255,248,236,${0.12 + rnd() * 0.2})`);
  }
  // pores
  for (let i = 0; i < 1400; i++) {
    const x = rnd() * W;
    const y = rnd() * H;
    g.fillStyle = `rgba(40,22,12,${0.08 + rnd() * 0.2})`;
    g.fillRect(x, y, 0.8 + rnd() * 0.8, 2 + rnd() * 5);
  }
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

function woodMaterial(grain: THREE.Texture, mobile: boolean, color = "#ffffff") {
  if (mobile) {
    return new THREE.MeshStandardMaterial({ color, map: grain, bumpMap: grain, bumpScale: 1.4, roughness: 0.5, metalness: 0 });
  }
  return new THREE.MeshPhysicalMaterial({
    color,
    map: grain,
    bumpMap: grain,
    bumpScale: 1.4,
    roughness: 0.5,
    metalness: 0,
    clearcoat: 0.55,
    clearcoatRoughness: 0.3,
  });
}

type Prod = {
  slug: string;
  root: THREE.Group;
  axis: THREE.Group;
  hang: THREE.Group;
  ring: THREE.Mesh;
  labelAnchor: THREE.Object3D;
  pivot: THREE.Group;
  medallion: THREE.Group;
  woodMat: THREE.MeshStandardMaterial;
  photo: THREE.Mesh;
  photoMat: THREE.MeshStandardMaterial;
  photoFade: number;
  s: number;
  sT: number;
  sc: number;
  scT: number;
  from: THREE.Color;
  to: THREE.Color;
  phase: number;
};

const UP = new THREE.Vector3(0, 1, 0);

export class StrandEngine {
  readonly group = new THREE.Group();
  readonly hits: THREE.Object3D[] = [];
  /** product index nearest the focus, or -1 */
  active = -1;

  private readonly rig: Rig;
  private readonly mobile: boolean;
  private readonly reduced: boolean;
  private readonly rail: ReturnType<typeof cameraRail>;
  private readonly cord: THREE.Mesh;
  private readonly beads: THREE.InstancedMesh;
  private readonly knots: THREE.InstancedMesh;
  private readonly beadS = new Float32Array(PLAIN);
  private readonly beadT = new Float32Array(PLAIN);
  private readonly colFrom = new Float32Array(PLAIN * 3);
  private readonly colTo = new Float32Array(PLAIN * 3);
  private readonly jitter: { spin: number; size: number; tone: number }[] = [];
  private readonly products: Prod[] = [];
  private readonly guruRoot = new THREE.Group();
  private readonly guruMat: THREE.MeshStandardMaterial;
  private readonly tassel = new THREE.Group();
  private readonly tasselMat: THREE.MeshStandardMaterial;
  private readonly guruCol = { from: new THREE.Color(), to: new THREE.Color() };
  private readonly tasselCol = { from: new THREE.Color(), to: new THREE.Color() };
  private readonly key: THREE.DirectionalLight;
  private readonly disposables: { dispose: () => void }[] = [];
  private layout: StrandLayout;
  private wood: Wood | null = null;
  private wave = { start: -100, origin: 0 };
  private t0 = -1;
  private roll = 0;
  private first = true;
  private guruS: number;
  private endDir = new THREE.Vector3(0, 0, 1);

  // scratch
  private v = new THREE.Vector3();
  private v2 = new THREE.Vector3();
  private v3 = new THREE.Vector3();
  private q = new THREE.Quaternion();
  private q2 = new THREE.Quaternion();
  private m = new THREE.Matrix4();
  private sc = new THREE.Vector3();
  private col = new THREE.Color();
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private right = new THREE.Vector3();

  constructor(opts: { mobile: boolean; reduced: boolean }) {
    this.mobile = opts.mobile;
    this.reduced = opts.reduced;
    this.rig = opts.mobile ? PHONE_RIG : DESK_RIG;
    this.rail = cameraRail(this.rig.side, this.rig.lift);
    this.layout = layoutStrand(10);
    const rnd = mulberry32(108);
    for (let i = 0; i < PLAIN; i++) this.jitter.push({ spin: rnd() * Math.PI * 2, size: 0.95 + rnd() * 0.09, tone: 0.84 + rnd() * 0.26 });

    const grain = makeGrain(11);
    const grainB = makeGrain(29);
    this.disposables.push(grain, grainB);

    /* cord */
    const curve = new THREE.CatmullRomCurve3(
      controlPoints().map((p) => new THREE.Vector3(p[0], p[1], p[2])),
      false,
      "centripetal",
    );
    const tubeGeo = new THREE.TubeGeometry(curve, this.rig.tube, 0.024, 6, false);
    const cordMat = new THREE.MeshStandardMaterial({ color: THREAD, roughness: 0.72, metalness: 0.12 });
    this.cord = new THREE.Mesh(tubeGeo, cordMat);
    this.cord.frustumCulled = false;
    this.group.add(this.cord);
    this.disposables.push(tubeGeo, cordMat);

    /* plain beads */
    const beadGeo = new THREE.SphereGeometry(BEAD_R, this.rig.segs[0], this.rig.segs[1]);
    const beadMat = woodMaterial(grain, this.mobile);
    this.beads = new THREE.InstancedMesh(beadGeo, beadMat, PLAIN);
    this.beads.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(PLAIN * 3), 3);
    this.beads.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.beads.frustumCulled = false;
    this.group.add(this.beads);
    this.disposables.push(beadGeo, beadMat);

    /* knots between beads */
    const knotGeo = new THREE.SphereGeometry(0.068, 10, 8);
    const knotMat = new THREE.MeshStandardMaterial({ color: "#94713f", roughness: 0.85 });
    this.knots = new THREE.InstancedMesh(knotGeo, knotMat, PLAIN + 16);
    this.knots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.knots.frustumCulled = false;
    this.group.add(this.knots);
    this.disposables.push(knotGeo, knotMat);

    /* product beads with hanging medallions */
    const brass = new THREE.MeshStandardMaterial({ color: BRASS, metalness: 1, roughness: 0.32 });
    const pGeo = new THREE.SphereGeometry(PRODUCT_R, this.mobile ? 28 : 44, this.mobile ? 20 : 30);
    const capGeo = new THREE.TorusGeometry(0.13, 0.042, 10, 28).rotateX(Math.PI / 2);
    const dropGeo = new THREE.CylinderGeometry(0.013, 0.013, DROP, 6).translate(0, -DROP / 2, 0);
    const ringGeo = new THREE.TorusGeometry(RING_R, 0.018, 8, 24);
    const backGeo = new THREE.CylinderGeometry(MED_R + 0.07, MED_R + 0.07, 0.1, 64).rotateX(Math.PI / 2);
    const bezelGeo = new THREE.TorusGeometry(MED_R + 0.012, 0.04, 12, 72);
    const photoGeo = new THREE.CircleGeometry(MED_R - 0.012, 64);
    this.disposables.push(brass, pGeo, capGeo, dropGeo, ringGeo, backGeo, bezelGeo, photoGeo);

    FAMILIES.forEach((f, k) => {
      const root = new THREE.Group();
      const axis = new THREE.Group();
      const woodMat = woodMaterial(grainB, this.mobile);
      this.disposables.push(woodMat);
      const bead = new THREE.Mesh(pGeo, woodMat);
      bead.userData.slug = f.slug;
      const capA = new THREE.Mesh(capGeo, brass);
      capA.position.y = PRODUCT_R - 0.03;
      const capB = new THREE.Mesh(capGeo, brass);
      capB.position.y = -PRODUCT_R + 0.03;
      axis.add(bead, capA, capB);
      root.add(axis);

      const hang = new THREE.Group();
      hang.position.y = -PRODUCT_R;
      const drop = new THREE.Mesh(dropGeo, cordMat);
      const ring = new THREE.Mesh(ringGeo, brass);
      ring.position.y = -DROP - RING_R + 0.02;
      // the medallion hangs from a pivot at the ring, so it can lean toward the camera without leaving the ring
      const pivot = new THREE.Group();
      pivot.position.y = -(DROP + RING_R * 2 - 0.03);
      pivot.rotation.order = "YXZ";
      const medallion = new THREE.Group();
      medallion.position.y = -MED_R;
      const back = new THREE.Mesh(backGeo, woodMat);
      back.userData.slug = f.slug;
      const bezel = new THREE.Mesh(bezelGeo, brass);
      bezel.position.z = 0.05;
      const photoMat = new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.62, metalness: 0, transparent: true, opacity: 0, emissive: "#ffffff", emissiveIntensity: 0.28 });
      this.disposables.push(photoMat);
      const photo = new THREE.Mesh(photoGeo, photoMat);
      photo.position.z = 0.053;
      photo.visible = false;
      photo.userData.slug = f.slug;
      const labelAnchor = new THREE.Object3D();
      labelAnchor.position.y = -(MED_R + 0.3);
      medallion.add(back, bezel, photo, labelAnchor);
      pivot.add(medallion);
      hang.add(drop, ring, pivot);
      root.add(hang);
      this.group.add(root);
      this.hits.push(bead, back, photo);

      this.products.push({
        slug: f.slug,
        root,
        axis,
        hang,
        ring,
        labelAnchor,
        pivot,
        medallion,
        woodMat,
        photo,
        photoMat,
        photoFade: 0,
        s: 0,
        sT: 0,
        sc: 0,
        scT: 0,
        from: new THREE.Color(),
        to: new THREE.Color(),
        phase: k * 1.73,
      });
    });

    /* guru bead and tassel */
    this.guruS = layoutStrand(11).guru;
    this.guruMat = woodMaterial(grainB, this.mobile);
    this.tasselMat = new THREE.MeshStandardMaterial({ color: "#8c2b1b", roughness: 0.92, metalness: 0 });
    this.disposables.push(this.guruMat, this.tasselMat);
    const guruGeo = new THREE.SphereGeometry(GURU_R, 48, 32);
    const guru = new THREE.Mesh(guruGeo, this.guruMat);
    guru.scale.set(1, 1.08, 1);
    const gCapGeo = new THREE.TorusGeometry(0.16, 0.05, 10, 32).rotateX(Math.PI / 2);
    const gCapTop = new THREE.Mesh(gCapGeo, brass);
    gCapTop.position.y = GURU_R * 1.08 - 0.04;
    const gCapBot = new THREE.Mesh(gCapGeo, brass);
    gCapBot.position.y = -GURU_R * 1.08 + 0.04;
    this.disposables.push(guruGeo, gCapGeo);
    const bottom = -GURU_R * 1.08;
    const knotGeoBig = new THREE.SphereGeometry(0.11, 16, 12);
    const tKnot = new THREE.Mesh(knotGeoBig, this.tasselMat);
    tKnot.position.y = bottom - 0.1;
    this.tassel.position.y = bottom - 0.18;
    const collarH = 0.4;
    const collarGeo = new THREE.CylinderGeometry(0.1, 0.12, collarH, 28).translate(0, -collarH / 2, 0);
    const collar = new THREE.Mesh(collarGeo, this.tasselMat);
    const bandGeo = new THREE.TorusGeometry(0.118, 0.016, 8, 32).rotateX(Math.PI / 2);
    const bandA = new THREE.Mesh(bandGeo, brass);
    bandA.position.y = -0.07;
    const bandB = new THREE.Mesh(bandGeo, brass);
    bandB.position.y = -collarH + 0.06;
    bandB.scale.setScalar(1.06);
    this.disposables.push(knotGeoBig, collarGeo, bandGeo);
    const strands = this.mobile ? 90 : 150;
    const strandGeo = new THREE.CylinderGeometry(0.0085, 0.006, 1, 4, 1).translate(0, -0.5, 0);
    const strandMesh = new THREE.InstancedMesh(strandGeo, this.tasselMat, strands);
    this.disposables.push(strandGeo);
    const trnd = mulberry32(21);
    const e = new THREE.Euler();
    for (let i = 0; i < strands; i++) {
      const a = trnd() * Math.PI * 2;
      const r = Math.sqrt(trnd()) * 0.085;
      const tilt = 0.015 + trnd() * 0.12;
      const len = 2.0 + trnd() * 0.38;
      e.set(Math.sin(a) * tilt, 0, -Math.cos(a) * tilt);
      this.q.setFromEuler(e);
      this.m.compose(this.v.set(Math.cos(a) * r, -collarH + 0.04, Math.sin(a) * r), this.q, this.sc.set(1, len, 1));
      strandMesh.setMatrixAt(i, this.m);
    }
    strandMesh.frustumCulled = false;
    this.tassel.add(collar, bandA, bandB, strandMesh);
    this.guruRoot.add(guru, gCapTop, gCapBot, tKnot, this.tassel);
    this.group.add(this.guruRoot);
    pointInto(this.guruS, this.guruRoot.position);

    // the closing shot looks at the guru bead from the side the camera arrives on
    railInto(this.rail, this.guruS - 9, this.v);
    this.endDir.set(this.v.x - this.guruRoot.position.x, 0, this.v.z - this.guruRoot.position.z).normalize();

    /* a key light that travels with the camera, so the beads are always lit from over the shoulder */
    this.key = new THREE.DirectionalLight("#fff1dc", 2.4);
    this.group.add(this.key, this.key.target);
  }

  /** Re-lay the strand for a wood: products not made in it leave, the rest slide along the cord; colour runs out from the camera. */
  setWood(wood: Wood, now: number) {
    if (wood === this.wood) return;
    const firstTime = this.wood === null;
    this.wood = wood;
    const avail = FAMILIES.map((f) => Boolean(f.variants[wood]));
    const count = avail.filter(Boolean).length;
    this.layout = layoutStrand(count);
    for (let i = 0; i < PLAIN; i++) {
      this.beadT[i] = this.layout.beads[i];
      if (firstTime) this.beadS[i] = this.beadT[i];
    }
    let j = 0;
    this.products.forEach((p, k) => {
      if (avail[k]) {
        p.sT = this.layout.products[j++];
        p.scT = 1;
      } else {
        // a missing piece folds into the cord where it sits
        p.scT = 0;
        if (p.sT === 0) p.sT = k > 0 ? this.products[k - 1].sT + 2 : 10;
      }
      if (firstTime) {
        p.s = p.sT;
        p.sc = p.scT;
      }
    });

    // colour wave
    const target = WOOD_COL[wood];
    for (let i = 0; i < PLAIN; i++) {
      const jt = this.jitter[i].tone;
      if (firstTime) {
        this.colFrom[i * 3] = target.r * jt;
        this.colFrom[i * 3 + 1] = target.g * jt;
        this.colFrom[i * 3 + 2] = target.b * jt;
      } else {
        const w = this.beadWave(i, now);
        for (let c = 0; c < 3; c++) this.colFrom[i * 3 + c] = this.colFrom[i * 3 + c] + (this.colTo[i * 3 + c] - this.colFrom[i * 3 + c]) * w;
      }
      this.colTo[i * 3] = target.r * jt;
      this.colTo[i * 3 + 1] = target.g * jt;
      this.colTo[i * 3 + 2] = target.b * jt;
    }
    this.products.forEach((p) => {
      p.from.copy(firstTime ? target : p.woodMat.color);
      p.to.copy(target).multiplyScalar(0.94);
    });
    this.guruCol.from.copy(firstTime ? target : this.guruMat.color);
    this.guruCol.to.copy(target).multiplyScalar(0.9);
    this.tasselCol.from.copy(firstTime ? TASSEL_COL[wood] : this.tasselMat.color);
    this.tasselCol.to.copy(TASSEL_COL[wood]);
    this.wave = { start: firstTime ? -100 : now, origin: J.s };
  }

  setPhoto(slug: string, tex: THREE.Texture | null) {
    const p = this.products.find((x) => x.slug === slug);
    if (!p) return;
    if (p.photoMat.map === tex) return;
    p.photoMat.map = tex;
    p.photoMat.emissiveMap = tex;
    p.photoMat.needsUpdate = true;
    p.photo.visible = Boolean(tex);
    p.photoFade = 0;
  }

  private waveAt(s: number, now: number) {
    if (this.reduced) return 1;
    const t = (now - this.wave.start - Math.abs(s - this.wave.origin) * 0.02) / 0.75;
    return smooth(0, 1, t);
  }

  private beadWave(i: number, now: number) {
    return this.waveAt(this.beadS[i], now);
  }

  private tangentInto(s: number, out: THREE.Vector3) {
    pointInto(Math.min(LENGTH, s + 0.12), out);
    pointInto(Math.max(0, s - 0.12), this.v3);
    return out.sub(this.v3).normalize();
  }

  update(now: number, dt: number, camera: THREE.PerspectiveCamera, scene: THREE.Scene, size: { width: number; height: number }) {
    if (this.t0 < 0) this.t0 = now;
    const it = this.reduced ? 100 : now - this.t0;
    const k = 1 - Math.exp(-dt * 3.2);
    const focus = J.s;
    const end = J.end;
    const rig = this.rig;

    /* cord lays itself first */
    const cordGeo = this.cord.geometry as THREE.TubeGeometry;
    const total = cordGeo.index ? cordGeo.index.count : 0;
    const lay = easeOut((it - 0.05) / 1.8);
    cordGeo.setDrawRange(0, lay >= 1 ? Infinity : Math.floor((total * lay) / 6) * 6);

    /* plain beads: slide to their places, inside a window around the camera */
    const lo = focus - 10 - end * 30;
    const hi = focus + rig.far + 6;
    let n = 0;
    const colors = this.beads.instanceColor!.array as Float32Array;
    for (let i = 0; i < PLAIN; i++) {
      const d = this.beadT[i] - this.beadS[i];
      if (Math.abs(d) > 1e-4) this.beadS[i] += d * k;
      const intro = 1 - easeOut((it - 0.35 - i * 0.012) / 1.25);
      const s = Math.min(LENGTH - 0.5, this.beadS[i] + intro * 24);
      if (s < lo || s > hi) continue;
      const jt = this.jitter[i];
      pointInto(s, this.v);
      this.tangentInto(s, this.v2);
      this.q.setFromUnitVectors(UP, this.v2);
      this.q2.setFromAxisAngle(UP, jt.spin);
      this.q.multiply(this.q2);
      const sz = jt.size * (intro > 0.98 ? 0.001 : 1);
      this.m.compose(this.v, this.q, this.sc.set(sz, sz, sz));
      this.beads.setMatrixAt(n, this.m);
      const w = this.beadWave(i, now);
      colors[n * 3] = this.colFrom[i * 3] + (this.colTo[i * 3] - this.colFrom[i * 3]) * w;
      colors[n * 3 + 1] = this.colFrom[i * 3 + 1] + (this.colTo[i * 3 + 1] - this.colFrom[i * 3 + 1]) * w;
      colors[n * 3 + 2] = this.colFrom[i * 3 + 2] + (this.colTo[i * 3 + 2] - this.colFrom[i * 3 + 2]) * w;
      n++;
    }
    this.beads.count = n;
    this.beads.instanceMatrix.needsUpdate = true;
    this.beads.instanceColor!.needsUpdate = true;

    /* products */
    let best = -1;
    let bestD = 1e9;
    this.products.forEach((p, idx) => {
      const d = p.sT - p.s;
      if (Math.abs(d) > 1e-4) p.s += d * k;
      p.sc += (p.scT - p.sc) * k;
      const before = this.layout.before[Math.min(this.layout.before.length - 1, Math.max(0, idx))] ?? 0;
      const intro = 1 - easeOut((it - 0.5 - before * 0.012) / 1.3);
      const s = Math.min(LENGTH - 0.5, p.s + intro * 24);
      const scale = p.sc * (1 - intro * 0.6);
      p.root.visible = scale > 0.01 && s > lo - 4 && s < hi + 4;
      if (!p.root.visible) return;
      pointInto(s, p.root.position);
      p.root.scale.setScalar(Math.max(0.001, scale));
      this.tangentInto(s, this.v2);
      p.axis.quaternion.setFromUnitVectors(UP, this.v2);
      // the medallion turns to face the camera as it will be when this piece is in focus
      railInto(this.rail, s - rig.back, this.v);
      const yaw = Math.atan2(this.v.x - p.root.position.x, this.v.z - p.root.position.z);
      const sway = this.reduced ? 0 : 1;
      p.hang.rotation.set(0, yaw + Math.sin(now * 0.55 + p.phase) * 0.07 * sway, Math.sin(now * 0.9 + p.phase) * 0.045 * sway);
      const medY = p.root.position.y - PRODUCT_R - MED_DROP;
      const elev = Math.atan2(this.v.y - medY, Math.hypot(this.v.x - p.root.position.x, this.v.z - p.root.position.z));
      p.pivot.rotation.x = -Math.max(-0.2, Math.min(0.6, elev * 0.72));
      // colour
      const w = this.waveAt(p.s, now);
      p.woodMat.color.copy(p.from).lerp(p.to, w);
      if (p.photo.visible && p.photoFade < 1) {
        p.photoFade = Math.min(1, p.photoFade + dt * 1.6);
        p.photoMat.opacity = p.photoFade;
      }
      if (p.scT > 0.5) {
        const dd = Math.abs(p.s - focus);
        if (dd < bestD) {
          bestD = dd;
          best = idx;
        }
      }
    });
    this.active = bestD < 2.6 ? best : -1;

    /* knots: midway between neighbours on the cord */
    let kn = 0;
    const kScale = easeOut((it - 1.6) / 0.8);
    const addKnot = (a: number, b: number) => {
      const s = (a + b) / 2;
      if (s < lo || s > hi || kn >= PLAIN + 16) return;
      pointInto(s, this.v);
      this.tangentInto(s, this.v2);
      this.q.setFromUnitVectors(UP, this.v2);
      this.m.compose(this.v, this.q, this.sc.set(kScale, kScale * 0.8, kScale));
      this.knots.setMatrixAt(kn++, this.m);
    };
    if (kScale > 0.01) {
      const prodAt = new Map<number, number>();
      let j = 0;
      this.products.forEach((p) => {
        if (p.scT > 0.5) prodAt.set(this.layout.before[j++], p.s);
      });
      for (let i = 0; i < PLAIN - 1; i++) {
        const ps = prodAt.get(i + 1);
        if (ps !== undefined) {
          addKnot(this.beadS[i], ps - PRODUCT_R - 0.2);
          addKnot(ps + PRODUCT_R + 0.2, this.beadS[i + 1]);
        } else addKnot(this.beadS[i], this.beadS[i + 1]);
      }
      addKnot(this.beadS[PLAIN - 1], this.guruS - GURU_R - 0.1);
    }
    this.knots.count = kn;
    this.knots.instanceMatrix.needsUpdate = true;

    /* guru and tassel */
    const gw = this.waveAt(this.guruS, now);
    this.guruMat.color.copy(this.guruCol.from).lerp(this.guruCol.to, gw);
    this.tasselMat.color.copy(this.tasselCol.from).lerp(this.tasselCol.to, gw);
    if (!this.reduced) {
      this.tassel.rotation.x = Math.sin(now * 0.7) * 0.035;
      this.tassel.rotation.z = Math.sin(now * 0.53 + 1) * 0.045;
    }
    this.guruRoot.visible = this.guruS < hi + 6;

    /* camera */
    const pos = railInto(this.rail, focus - rig.back, this.v);
    const look = pointInto(Math.min(LENGTH, focus + 2.4), this.v2);
    look.y -= 0.35;
    const w = best >= 0 ? 1 - smooth(0.3, 3.6, bestD) : 0;
    if (w > 0) {
      const p = this.products[best];
      this.v3.copy(p.root.position);
      this.v3.y -= PRODUCT_R + MED_DROP * 0.62;
      look.lerp(this.v3, w);
      // step back a little to see the piece with the strand around it
      this.v3.subVectors(pos, look).normalize();
      pos.addScaledVector(this.v3, w * (this.mobile ? 1.2 : 1.9));
      pos.y += w * 0.2;
    }
    // framing: the card sits to the right on desktop, the sheet below on phones
    const right = this.right.subVectors(look, pos).normalize().cross(UP).normalize();
    const aspect = size.width / Math.max(1, size.height);
    if (!this.mobile) look.addScaledVector(right, w * (aspect > 1.2 ? 1.25 : 0.6));
    else look.y -= w * 1.05;
    // opening shot: further back and higher, the strand drawn off to the right of the headline
    const hero = this.reduced ? 0 : 1 - smooth(J.keys.s[0], J.keys.s[1] - 1.5, focus);
    if (hero > 0) {
      pointInto(Math.min(LENGTH, focus + 1), this.v3);
      const fx = this.v3.x;
      const fz = this.v3.z;
      pointInto(Math.max(0, focus - 1), this.v3);
      const dx = fx - this.v3.x;
      const dz = fz - this.v3.z;
      const dl = Math.hypot(dx, dz) || 1;
      const hx = pos.x - (dx / dl) * 5.5 + (dz / dl) * (this.mobile ? 0.5 : 1.6);
      const hz = pos.z - (dz / dl) * 5.5 - (dx / dl) * (this.mobile ? 0.5 : 1.6);
      const hy = pos.y + (this.mobile ? 3.2 : 2.6);
      pointInto(Math.min(LENGTH, focus + 11), this.v3);
      const lx = this.v3.x;
      const ly = this.v3.y - 1.4;
      const lz = this.v3.z;
      pos.lerp(this.v3.set(hx, hy, hz), hero);
      look.lerp(this.v3.set(lx, ly, lz), hero);
      if (!this.mobile) look.addScaledVector(right, -2.4 * hero);
      else look.y -= 3.4 * hero; // phones: the strand above, the headline below
    }
    // closing shot
    if (end > 0) {
      const g = this.guruRoot.position;
      const ex = g.x + this.endDir.x * rig.endDist;
      const ez = g.z + this.endDir.z * rig.endDist;
      pos.lerp(this.v3.set(ex, g.y - 0.55, ez), end);
      look.lerp(this.v3.set(g.x, g.y - (this.mobile ? 2.3 : 1.2), g.z), end);
    }
    if (this.first) {
      this.camPos.copy(pos);
      this.camLook.copy(look);
      this.first = false;
    } else {
      const f = 1 - Math.exp(-dt * 9);
      this.camPos.lerp(pos, f);
      this.camLook.lerp(look, f);
    }
    const bank = this.mobile || this.reduced ? 0 : Math.max(-0.11, Math.min(0.11, pathKappa(focus) * 0.5)) * (1 - end);
    this.roll += (bank - this.roll) * (1 - Math.exp(-dt * 2.5));
    camera.position.copy(this.camPos);
    this.v3.subVectors(this.camLook, this.camPos).normalize();
    camera.up.copy(UP).applyAxisAngle(this.v3, this.roll);
    camera.lookAt(this.camLook);
    camera.updateMatrixWorld();

    // fog opens up a little for the closing shot
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = rig.near + end * 3;
      scene.fog.far = rig.far + end * 8;
    }

    // key light over the shoulder
    this.v3.set(-3.5, 5, 2).applyQuaternion(camera.quaternion);
    this.key.position.copy(camera.position).add(this.v3);
    this.key.target.position.copy(this.camLook);
    this.key.target.updateMatrixWorld();

    /* labels and the anchor for the card's thread */
    this.group.updateMatrixWorld();
    // name and price under each medallion (DOM, placed here so it moves in the same frame as the 3D)
    this.products.forEach((p, idx) => {
      const el = J.labelEls[idx];
      if (!el) return;
      let o = 0;
      if (p.root.visible && p.scT > 0.5 && idx !== this.active) {
        p.labelAnchor.getWorldPosition(this.v);
        const d = camera.position.distanceTo(this.v);
        o = (1 - smooth(10, 17, d)) * smooth(2.6, 4, d) * (1 - end) * (1 - hero) * Math.min(1, p.sc);
        if (o > 0.01) {
          this.v.project(camera);
          if (this.v.z > 1) o = 0;
          else el.style.transform = `translate3d(${((this.v.x * 0.5 + 0.5) * size.width).toFixed(1)}px, ${((-this.v.y * 0.5 + 0.5) * size.height).toFixed(1)}px, 0) translate(-50%, 0)`;
        }
      }
      el.style.opacity = o.toFixed(3);
    });
    if (this.active >= 0 && end < 0.5) {
      const p = this.products[this.active];
      // desktop: from the ring at the top of the medallion to the card; phones: from its foot down to the sheet
      if (this.mobile) p.labelAnchor.getWorldPosition(this.v);
      else p.ring.getWorldPosition(this.v);
      this.v.project(camera);
      J.anchor.x = (this.v.x * 0.5 + 0.5) * size.width;
      J.anchor.y = (-this.v.y * 0.5 + 0.5) * size.height;
      J.anchor.on = this.v.z < 1;
    } else J.anchor.on = false;
  }

  /** Product under a pointer, from normalised device coordinates. */
  pick(raycaster: THREE.Raycaster, ndc: THREE.Vector2, camera: THREE.Camera): string | null {
    raycaster.setFromCamera(ndc, camera);
    const visible = this.hits.filter((h) => {
      const p = this.products.find((x) => x.slug === h.userData.slug);
      return p && p.root.visible && p.scT > 0.5 && h.visible;
    });
    const hit = raycaster.intersectObjects(visible, false)[0];
    return hit ? (hit.object.userData.slug as string) : null;
  }

  dispose() {
    this.disposables.forEach((d) => d.dispose());
  }
}
