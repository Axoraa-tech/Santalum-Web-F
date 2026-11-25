"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, useState } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, priceLabel } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { EditionTicks } from "./bits";
import { clamp, mulberry32, openTakeover, useReduced } from "./lib";

/* ---- the edition size drawn large by its own small numbers, placed along the strokes of the digits ---- */

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

function arc(cx: number, cy: number, rx: number, ry: number, from: number, to: number, step = Math.PI / 36): Pt[] {
  const pts: Pt[] = [];
  for (let a = from; a <= to + 1e-6; a += step) pts.push([cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);
  return pts;
}

const deg = Math.PI / 180;
/* "21" for the Vault's twenty-one cuffs */
const TWO: Pt[] = [...arc(0.31, 0.3, 0.25, 0.25, Math.PI, Math.PI * 2 + Math.PI / 6), [0.06, 0.95], [0.6, 0.95]];
const ONE: Pt[] = [[0.79, 0.25], [1.02, 0.05], ...Array.from({ length: 6 }, (_, i): Pt => [1.02, 0.23 + (0.72 * i) / 5])];
/* "50" for the Reserve's fifty vials. The bowl of the 5 and the 0 keep a clear channel between them,
   so no number in one digit touches a number in the other (checked at the 5.4cqw size below). */
const FIVE: Pt[] = [[0.54, 0.05], [0.13, 0.05], [0.1, 0.44], ...arc(0.3, 0.665, 0.24, 0.245, -125 * deg, 145 * deg)];
const ZERO: Pt[] = arc(0.88, 0.5, 0.19, 0.45, -90 * deg, 270 * deg);

type Num = { n: number; x: number; y: number; sx: number; sy: number; rot: number };

function scatter(pts: Pt[], seed: number): Num[] {
  const rand = mulberry32(seed);
  return pts.map(([x, y], i) => ({
    n: i + 1,
    x: (x / BOX_W) * 100 + 2,
    y: y * 100,
    sx: rand() * 100,
    sy: -25 + rand() * 150,
    rot: -50 + rand() * 100,
  }));
}

const NUMS: Record<Wood, Num[]> = {
  red: scatter([...along(TWO, 13), ...ONE], 2011),
  white: scatter([...along(FIVE, 22), ...along(ZERO, 29).slice(0, 28)], 2011),
};
const FONT: Record<Wood, string> = { red: "text-[11cqw]", white: "text-[5.4cqw]" };

function Number_({ d, progress, on, onHover, wood, count }: { d: Num; progress: MotionValue<number>; on: boolean; onHover: (n: number | null) => void; wood: Wood; count: number }) {
  const delay = ((d.n - 1) / count) * 0.38;
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
      className={`${k.vnum} ${FONT[wood]} tabular-nums`}
    >
      {String(d.n).padStart(2, "0")}
    </motion.span>
  );
}

const COPY: Record<Wood, { unit: string; units: string; line: string; button: string }> = {
  red: {
    unit: "cuff",
    units: "One small number for each cuff.",
    line: "Twenty-one cuffs, turned from red heartwood sourced in 2011 and aged since.",
    button: "See the Vault Cuff",
  },
  white: {
    unit: "vial",
    units: "One small number for each vial.",
    line: "Fifty vials of oil, distilled from one lot of white heartwood harvested in 2011.",
    button: "See the Reserve Oil",
  },
};

/** The edition of the current wood: the 2011 Vault (21 cuffs) or the 2011 Reserve (50 vials). The numbers gather into the size as you scroll in. */
export function Vault() {
  const reduced = useReduced();
  const secRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start end", "start 0.15"] });
  const done = useTransform(scrollYProgress, () => 1);
  const progress = reduced ? done : scrollYProgress;

  return (
    <section id="vault" ref={secRef} className="relative scroll-mt-12 overflow-hidden bg-[var(--k10-stone)] pb-[7vw] pt-10 md:pt-14">
      <W red={<Body wood="red" progress={progress} />} white={<Body wood="white" progress={progress} />} />
    </section>
  );
}

function Body({ wood, progress }: { wood: Wood; progress: MotionValue<number> }) {
  const [sel, setSel] = useState<number | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const ed = CONTENT[wood].edition;
  const p = getProduct(ed.productSlug)!;
  const copy = COPY[wood];
  const nums = NUMS[wood];
  const left = p.edition?.left ?? ed.size;

  return (
    <div className={`${k.gut} grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8`}>
      <div className="md:col-span-7">
        <h2 className={`${k.mono} text-[var(--k10-grey)]`}>{ed.name}</h2>
        <p className="sr-only">
          {ed.size} numbered {copy.unit}s, numbers 01 to {ed.size}.
        </p>
        <div aria-hidden className="relative mt-6 aspect-[1.14/1] w-full [container-type:inline-size]">
          {nums.map((d) => (
            <Number_ key={d.n} d={d} progress={progress} on={sel === d.n} onHover={setSel} wood={wood} count={nums.length} />
          ))}
        </div>
      </div>

      <div className="flex flex-col justify-end md:col-span-5">
        <p className={`${k.disp} text-[length:clamp(64px,8vw,136px)] tabular-nums leading-[0.8] [font-variation-settings:'wdth'_60,'wght'_860]`}>
          {sel ? `No. ${String(sel).padStart(2, "0")}` : `${left} of ${ed.size}`}
        </p>
        <p className={`${k.mono} mt-3 text-[var(--k10-grey)]`}>
          {sel ? `One of ${ed.size}, entered in the registry by its number.` : `${copy.units} ${left} are still to be placed.`}
        </p>
        <div className="mt-4">
          <EditionTicks size={ed.size} left={left} />
        </div>
        <p className={`${k.disp} mt-8 whitespace-normal text-[length:clamp(26px,2.6vw,40px)] leading-[0.98] [font-variation-settings:'wdth'_80,'wght'_620]`}>
          {copy.line}
        </p>
        {/* the headline already says what and when; the small print says only what the registry holds */}
        <p className={`${k.monoL} mt-5`}>{p.story[p.story.length - 1]}</p>
        <dl className="mt-6">
          {p.details.map((d) => (
            <div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 border-t border-[var(--k10-line)] py-2">
              <dt className={`${k.mono} text-[var(--k10-grey)]`}>{d.label}</dt>
              <dd className={k.monoL}>{d.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[8rem_1fr] gap-4 border-t border-[var(--k10-line)] py-2">
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>Price</dt>
            <dd className={k.monoL}>{priceLabel(p)}</dd>
          </div>
        </dl>
        <button ref={btnRef} type="button" aria-haspopup="dialog" onClick={() => openTakeover(p.slug, btnRef.current)} className={`${k.btn} mt-8 w-full`}>
          <span className={k.btnLabel}>{copy.button}</span>
          <span className={`${k.mono} opacity-70`}>{priceLabel(p)}</span>
        </button>
      </div>
    </div>
  );
}
