"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { formatINR, getFamily } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import k from "../k";
import { clamp, mulberry32, openTakeover, useReduced } from "./lib";

/* ---- the giant "21", drawn by 21 small numbers placed along the strokes of the two digits ---- */

type Pt = [number, number];
const BOX_W = 1.14;

function along(path: Pt[], count: number): Pt[] {
  const seg: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    seg.push(d);
    total += d;
  }
  const out: Pt[] = [];
  for (let n = 0; n < count; n++) {
    let want = (total * n) / (count - 1);
    let i = 0;
    while (i < seg.length - 1 && want > seg[i]) {
      want -= seg[i];
      i++;
    }
    const t = seg[i] ? Math.min(1, want / seg[i]) : 0;
    out.push([path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]);
  }
  return out;
}

const TWO: Pt[] = (() => {
  const pts: Pt[] = [];
  const cx = 0.31;
  const cy = 0.3;
  const r = 0.25;
  for (let a = Math.PI; a <= Math.PI * 2 + Math.PI / 6 + 1e-6; a += Math.PI / 36) pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  pts.push([0.06, 0.95], [0.6, 0.95]);
  return pts;
})();
/* the "1": the flag's foot and the corner, then six down the stem */
const ONE_PTS: Pt[] = [
  [0.79, 0.25],
  [1.02, 0.05],
  ...Array.from({ length: 6 }, (_, i): Pt => [1.02, 0.23 + (0.72 * i) / 5]),
];

const rand = mulberry32(2011);
const NUMS = [...along(TWO, 13), ...ONE_PTS].map(([x, y], i) => ({
  n: i + 1,
  x: (x / BOX_W) * 100 + 2,
  y: y * 100,
  sx: rand() * 100,
  sy: -25 + rand() * 150,
  rot: -50 + rand() * 100,
}));

function Num({ d, progress, on, onHover }: { d: (typeof NUMS)[number]; progress: MotionValue<number>; on: boolean; onHover: (n: number | null) => void }) {
  const delay = (d.n - 1) * 0.018;
  const t = useTransform(progress, (p) => {
    const v = clamp((p - delay) / 0.62, 0, 1);
    return 1 - Math.pow(1 - v, 3);
  });
  const left = useTransform(t, (v) => `${d.sx + (d.x - d.sx) * v}%`);
  const top = useTransform(t, (v) => `${d.sy + (d.y - d.sy) * v}%`);
  const rotate = useTransform(t, (v) => d.rot * (1 - v));
  const opacity = useTransform(t, [0, 0.4, 1], [0.15, 0.6, 1]);
  return (
    <motion.span
      data-on={on}
      onPointerEnter={() => onHover(d.n)}
      onPointerLeave={() => onHover(null)}
      style={{ left, top, rotate, opacity, x: "-50%", y: "-50%" }}
      className={`${k.vnum} text-[11cqw] tabular-nums`}
    >
      {String(d.n).padStart(2, "0")}
    </motion.span>
  );
}

/** The 2011 Vault: twenty-one numbered cuffs. The numbers gather into a giant "21" as you scroll in. */
export function Vault() {
  const wood = useWood();
  const reduced = useReduced();
  const secRef = useRef<HTMLElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [sel, setSel] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start end", "start 0.15"] });
  const done = useTransform(scrollYProgress, () => 1);
  const progress = reduced ? done : scrollYProgress;
  const f = getFamily("vault-cuff")!;
  const v = f.variants[wood]!;

  return (
    <section id="vault" ref={secRef} aria-labelledby="k10-vault" className="relative scroll-mt-12 overflow-hidden bg-[var(--k-stone)] pb-[7vw] pt-10 md:pt-14">
      <div className={`${k.gut} grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-7">
          <h2 id="k10-vault" className={`${k.mono} text-[var(--k-grey)]`}>
            The 2011 Vault
          </h2>
          <p className="sr-only">Twenty-one numbered cuffs, numbers 01 to 21.</p>
          <div aria-hidden className="relative mt-6 aspect-[1.14/1] w-full [container-type:inline-size]">
            {NUMS.map((d) => (
              <Num key={d.n} d={d} progress={progress} on={sel === d.n} onHover={setSel} />
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-end md:col-span-5">
          <p className={`${k.disp} text-[length:clamp(72px,9vw,150px)] tabular-nums leading-[0.8] [font-variation-settings:'wdth'_60,'wght'_860]`}>
            {sel ? `No. ${String(sel).padStart(2, "0")}` : "21 of 21"}
          </p>
          <p className={`${k.mono} mt-3 text-[var(--k-grey)]`}>
            {sel ? "One of twenty-one, entered in the provenance registry by its number." : "Twenty-one numbers, one for each cuff."}
          </p>
          <p className={`${k.disp} mt-8 whitespace-normal text-[length:clamp(26px,2.6vw,40px)] leading-[0.98] [font-variation-settings:'wdth'_80,'wght'_620]`}>
            Twenty-one cuffs, turned from aged heartwood sourced in 2011.
          </p>
          <div className="mt-5 space-y-3">
            {f.story.map((s) => (
              <p key={s} className={k.monoL}>
                {s}
              </p>
            ))}
          </div>
          <dl className="mt-6">
            {f.details.map((d) => (
              <div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 border-t border-[var(--k-line)] py-2">
                <dt className={`${k.mono} text-[var(--k-grey)]`}>{d.label}</dt>
                <dd className={k.monoL}>{d.value}</dd>
              </div>
            ))}
            <div className="grid grid-cols-[8rem_1fr] gap-4 border-t border-[var(--k-line)] py-2">
              <dt className={`${k.mono} text-[var(--k-grey)]`}>In {wood}</dt>
              <dd className={k.monoL}>
                {formatINR(v.price)}. {v.note}
              </dd>
            </div>
          </dl>
          <button ref={btnRef} type="button" aria-haspopup="dialog" onClick={() => openTakeover(f.slug, btnRef.current)} className={`${k.btn} mt-8 w-full`}>
            <span className={k.btnLabel}>See the Vault Cuff</span>
            <span className={`${k.mono} opacity-70`}>{formatINR(v.price)}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
