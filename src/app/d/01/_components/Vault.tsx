"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { formatINR, getFamily } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { useWood } from "@/lib/wood";
import { s } from "./cx";
import { EASE, mulberry32 } from "./data";
import { sheet } from "./store";

/** Twenty-one cuff profiles. Seeded, so server and client draw the same set. */
const KINDS = ["Dome", "Chamfered flat", "Centre bead", "Cove", "Twin bead", "Ogee", "Knife edge"] as const;
type Cuff = { n: number; w: number; t: number; kind: number };
const rand = mulberry32(2011);
const CUFFS: Cuff[] = Array.from({ length: 21 }, (_, i) => ({
  n: i + 1,
  w: Math.round(16 + rand() * 10),
  t: Math.round((5 + rand() * 3) * 2) / 2,
  kind: (i * 3) % 7,
}));

const g = (u: number, c: number, w: number) => Math.exp(-(((u - c) / w) ** 2));

/** Wall thickness (mm) across the width of the band, u from 0 to 1: the lathe profile. */
function wall(c: Cuff, u: number) {
  const T = c.t;
  const edge = 0.82 + 0.18 * Math.min(1, Math.min(u, 1 - u) / 0.07);
  switch (c.kind) {
    case 0:
      return T * (0.48 + 0.52 * Math.sin(Math.PI * u));
    case 1:
      return T * Math.min(1, 0.5 + Math.min(u, 1 - u) * 3.4);
    case 2:
      return T * (0.58 + 0.16 * Math.sin(Math.PI * u) + 0.26 * g(u, 0.5, 0.1));
    case 3:
      return T * (1 - 0.4 * Math.sin(Math.PI * u)) * edge;
    case 4:
      return T * (0.56 + 0.44 * Math.max(g(u, 0.27, 0.12), g(u, 0.73, 0.12)));
    case 5:
      return T * (0.45 + 0.55 * Math.sin(Math.PI * Math.pow(u, 0.6)));
    default:
      return T * (0.32 + 0.68 * (1 - Math.pow(Math.abs(2 * u - 1), 1.6)));
  }
}

/** The profile as a closed path, bore line at y = base, in mm. */
function profilePath(c: Cuff, x0: number, base: number, k = 1) {
  const pts: string[] = [];
  const steps = 36;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    pts.push(`${(x0 + u * c.w * k).toFixed(2)} ${(base - wall(c, u) * k).toFixed(2)}`);
  }
  return `M${x0.toFixed(2)} ${base.toFixed(2)} L${pts.join(" L")} L${(x0 + c.w * k).toFixed(2)} ${base.toFixed(2)} Z`;
}

function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="1.6" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
      </pattern>
    </defs>
  );
}

/** Small drawing for the rack: every profile at the same scale, with its axis (broken, not to scale). */
function RackProfile({ c }: { c: Cuff }) {
  const W = 30;
  const x0 = (W - c.w) / 2;
  const base = 13;
  const id = `vh${c.n}`;
  return (
    <svg viewBox={`0 0 ${W} 22`} className="block w-full overflow-visible" aria-hidden>
      <Hatch id={id} />
      <path d={profilePath(c, x0, base)} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path
        d={`M1 19.5 H${W - 1}`}
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="6 1.5 1 1.5"
        vectorEffect="non-scaling-stroke"
        opacity="0.55"
      />
      <path d={`M${x0 - 1.2} 14.2 l0.8 1 l-1.2 0.9 l0.8 1`} fill="none" stroke="currentColor" strokeWidth="0.7" vectorEffect="non-scaling-stroke" opacity="0.5" />
    </svg>
  );
}

/** Large drawing of the selected profile, dimensioned. */
function ProfileDetail({ c }: { c: Cuff }) {
  const x0 = 4;
  const base = 14;
  const maxT = Math.max(...Array.from({ length: 41 }, (_, i) => wall(c, i / 40)));
  const top = base - maxT;
  const id = `vd${c.n}`;
  const R = c.w + x0;
  return (
    <svg viewBox={`0 0 ${c.w + 15} 29`} className="block h-full w-full overflow-visible" aria-hidden>
      <Hatch id={id} />
      <path d={profilePath(c, x0, base)} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <g className={s.mono} fontSize="1.15" fill="currentColor">
        {/* width */}
        <path d={`M${x0} ${top - 3.2} H${R}`} stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={`M${x0} ${top - 3.2} l1.3 -0.5 v1 Z M${R} ${top - 3.2} l-1.3 -0.5 v1 Z`} fill="currentColor" />
        <path d={`M${x0} ${top - 4.6} V${base - 0.6} M${R} ${top - 4.6} V${base - 0.6}`} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.45" />
        <text x={x0 + c.w / 2} y={top - 4} textAnchor="middle">
          {c.w}
        </text>
        {/* wall */}
        <path d={`M${R + 3} ${top} V${base}`} stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={`M${R + 3} ${top} l-0.5 1.3 h1 Z M${R + 3} ${base} l-0.5 -1.3 h1 Z`} fill="currentColor" />
        <path d={`M${R + 0.6} ${top} H${R + 4.4}`} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.45" />
        <text x={R + 4.2} y={(top + base) / 2 + 0.6}>
          t {c.t}
        </text>
        {/* bore and axis, broken */}
        <path d={`M${x0 - 3} ${base} H${R + 5}`} stroke="currentColor" strokeWidth="0.7" vectorEffect="non-scaling-stroke" opacity="0.5" />
        <text x={x0 - 3} y={base + 2.6} opacity="0.75">
          Bore, to your measurement
        </text>
        <path d={`M${x0 + 2} ${base + 4} l1 1.2 l-1.6 1 l1 1.2`} fill="none" stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" opacity="0.6" />
        <path
          d={`M${x0 - 3} ${base + 10} H${R + 5}`}
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="8 2 1.5 2"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
        <text x={R + 5} y={base + 12.6} textAnchor="end" opacity="0.75">
          Spindle axis
        </text>
      </g>
    </svg>
  );
}

/** The 2011 Vault: 21 turned silhouettes, numbered, with the selected one drawn large. */
export function Vault() {
  const wood = useWood();
  const f = getFamily("vault-cuff")!;
  const v = f.variants[wood]!;
  const [sel, setSel] = useState(7);
  const c = CUFFS[sel - 1];

  return (
    <section id="vault" className="relative scroll-mt-14 border-t border-(--hair) bg-(--paper-2) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <h2 className={`${s.x125} text-[clamp(3rem,8.4vw,8.8rem)] font-[620] leading-[0.84] tracking-[-0.035em] lg:col-span-8`}>
            The 2011
            <br />
            Vault
          </h2>
          <div className="lg:col-span-4 lg:pb-3">
            <p className="text-[16px] leading-[1.6] text-(--ink-2)">
              Twenty-one cuffs, turned from aged heartwood sourced in 2011. The wood waited for the right hands. Each cuff is
              numbered and entered in our provenance registry with its origin, the artisan&rsquo;s name and the date it left
              our hands.
            </p>
            <p className={`${s.mono} mt-5 flex items-baseline gap-4 text-[13px]`}>
              <span className="text-[22px] tabular-nums text-(--ink)">{formatINR(v.price)}</span>
              <span className="text-(--steel)">{f.edition}</span>
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-12 md:mt-20 lg:grid-cols-12 lg:gap-14">
          {/* Selected cuff, dimensioned */}
          <div className="lg:col-span-5">
            <div className="relative aspect-[5/4] border border-(--hair-2) bg-(--sheet) px-6 py-8">
              <span className={`${s.mono} absolute left-4 top-3 text-[10.5px] text-(--steel)`}>Lathe profile, enlarged</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={sel}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, ease: EASE }}
                  className="absolute inset-x-6 inset-y-8 text-(--ink)"
                >
                  <ProfileDetail c={c} />
                </motion.div>
              </AnimatePresence>
            </div>
            <p className={`${s.x125} mt-7 text-[clamp(2rem,3.6vw,3.3rem)] font-[620] leading-none tracking-[-0.02em]`}>
              <span className="tabular-nums">No. {String(c.n).padStart(2, "0")}</span>
              <span className="text-(--steel)"> of 21</span>
            </p>
            <dl className={`${s.mono} mt-5 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 border-t border-(--ink) pt-4 text-[12.5px]`}>
              <dt className="text-(--steel)">Profile</dt>
              <dd>{KINDS[c.kind]}</dd>
              <dt className="text-(--steel)">Width</dt>
              <dd className="tabular-nums">{c.w} mm</dd>
              <dt className="text-(--steel)">Wall</dt>
              <dd className="tabular-nums">{c.t} mm</dd>
              <dt className="text-(--steel)">Bore</dt>
              <dd>Made to your measurement</dd>
              <dt className="text-(--steel)">Comes with</dt>
              <dd>Registry certificate and a sealed vial of heartwood oil</dd>
            </dl>
            <div className="mt-7 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className={s.btn}
                onClick={() => {
                  bag.add("vault-cuff", wood);
                  sheet.open();
                }}
              >
                Add a cuff, {formatINR(v.price)}
              </button>
              <Link href="/d/01/p/vault-cuff" className={s.btnLine}>
                View the cuff
              </Link>
            </div>
          </div>

          {/* The board: 21 profiles */}
          <div className="lg:col-span-7">
            <div className={`${s.mono} mb-3 flex items-center justify-between text-[11px] text-(--steel)`}>
              <span>Profiles, numbered 01 to 21</span>
              <span className="hidden md:inline">Point at a number to draw it</span>
            </div>
            <div
              role="group"
              aria-label="Vault cuffs, 1 to 21"
              className="grid grid-cols-3 border-l border-t border-(--hair-2) sm:grid-cols-7"
            >
              {CUFFS.map((cf) => {
                const on = cf.n === sel;
                return (
                  <button
                    key={cf.n}
                    type="button"
                    aria-pressed={on}
                    aria-label={`Cuff ${cf.n} of 21, ${KINDS[cf.kind].toLowerCase()} profile`}
                    onClick={() => setSel(cf.n)}
                    onPointerEnter={() => setSel(cf.n)}
                    className={`group relative flex flex-col items-stretch gap-2 border-b border-r border-(--hair-2) px-3 pb-3 pt-4 text-left transition-colors ${
                      on ? "bg-(--sheet) text-(--m-accent)" : "text-(--ink) hover:bg-[rgb(255_255_255/0.5)] active:bg-[rgb(255_255_255/0.8)]"
                    }`}
                  >
                    <span className="block transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5">
                      <RackProfile c={cf} />
                    </span>
                    <span className={`${s.mono} flex items-baseline justify-between text-[11px] tabular-nums`}>
                      <span className={on ? "" : "text-(--ink)"}>{String(cf.n).padStart(2, "0")}</span>
                      <span className="text-[10px] text-(--steel)">{cf.w}×{cf.t}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="mt-5 max-w-[34rem] text-[13.5px] leading-[1.55] text-(--steel)">
              Profiles are drawn for illustration, to scale with one another. Each cuff is turned to the wearer&rsquo;s
              measurement.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
