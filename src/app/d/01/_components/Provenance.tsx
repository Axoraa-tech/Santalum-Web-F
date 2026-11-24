"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { WOOD_NAMES } from "@/lib/catalog";
import { useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";

const RECORD: Record<Wood, { batch: string; origin: string; artisan: string; finished: string }> = {
  red: { batch: "R-26-0412", origin: "Eastern Ghats, Andhra Pradesh", artisan: "S. K.", finished: "14 November 2026" },
  white: { batch: "W-26-0187", origin: "Southern India; worked in Mysuru, Karnataka", artisan: "M. R.", finished: "21 November 2026" },
};

const CHECKS = [
  "Grain read before the first cut",
  "108 beads and the guru bead counted",
  "Bead size checked, approx. 8 mm",
  "Knots and tassel checked",
  "Finish inspected under daylight",
  "Batch number recorded and packed with the piece",
];

/** Provenance: the example batch record, styled as an inspection sheet with checkboxes and stamps. */
export function Provenance() {
  const wood = useWood();
  const r = RECORD[wood];
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.45"] });
  const stamp = useTransform(scrollYProgress, [0.82, 1], [1.5, 1]);
  const stampOp = useTransform(scrollYProgress, [0.82, 0.9], [0, 0.9]);

  return (
    <section id="provenance" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>
            Know what
            <br />
            you hold
          </h2>
          <p className="mt-8 max-w-[30rem] text-[clamp(1.2rem,1.7vw,1.5rem)] leading-[1.4] tracking-[-0.01em]">
            If there is evidence, we show it. If there isn&rsquo;t, we don&rsquo;t invent it.
          </p>
          <p className="mt-6 max-w-[30rem] text-[15px] leading-[1.6] text-(--ink-2)">
            Every piece leaves with a batch record. It says what the piece is, which wood and where it grew, the batch, the
            initials of the artisan who made it, and the day it was finished. Lab reports for oil are attached where they exist.
          </p>
          <dl className={`${s.mono} mt-10 grid max-w-[30rem] grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-(--ink) pt-5 text-[12px]`}>
            <dt className="text-(--steel)">On the record</dt>
            <dd>Piece, wood, origin, batch, artisan, date</dd>
            <dt className="text-(--steel)">Not on it</dt>
            <dd>Anything we cannot show</dd>
            <dt className="text-(--steel)">Vault cuffs</dt>
            <dd>Also entered in the provenance registry by number</dd>
          </dl>
        </div>

        <div ref={ref} className="relative lg:col-span-7">
          <div className={`${s.sheet} relative mx-auto max-w-[720px] rotate-[-0.8deg] border border-(--hair-2) shadow-[0_40px_80px_-50px_rgb(26_27_29/0.55)]`}>
            {/* Header */}
            <div className="grid grid-cols-[1fr_auto] border-b-2 border-(--ink)">
              <div className="px-5 py-4 md:px-7 md:py-5">
                <p className={`${s.x110} text-[clamp(1.3rem,2.2vw,1.8rem)] font-[620] leading-none tracking-[-0.01em]`}>Inspection record</p>
                <p className={`${s.mono} mt-2 text-[11px] text-(--steel)`}>Santalum Maison workshop</p>
              </div>
              <div className={`${s.mono} grid content-center border-l border-(--hair-2) px-4 text-right text-[11px] md:px-6`}>
                <span className="text-(--steel)">Batch</span>
                <span className="text-[15px] tabular-nums">{r.batch}</span>
              </div>
            </div>

            {/* Fields */}
            <dl className="grid sm:grid-cols-2">
              <Field k="Piece" v="Japa Mala, 108 beads" />
              <Field k="Wood" v={`${WOOD_NAMES[wood].latin} (${WOOD_NAMES[wood].common.toLowerCase()})`} />
              <Field k="Origin" v={r.origin} />
              <Field k="Batch" v={r.batch} mono />
              <Field k="Artisan" v={r.artisan} mono />
              <Field k="Finished" v={r.finished} />
            </dl>

            {/* Checklist */}
            <div className="border-t border-(--hair-2) px-5 py-5 md:px-7">
              <p className={`${s.mono} text-[11px] text-(--steel)`}>Inspection</p>
              <ul className="mt-3 grid gap-2.5">
                {CHECKS.map((c, i) => (
                  <Check key={c} label={c} i={i} progress={scrollYProgress} />
                ))}
              </ul>
            </div>

            {/* Sign-off */}
            <div className="grid grid-cols-2 border-t border-(--hair-2)">
              <div className="border-r border-(--hair-2) px-5 py-4 md:px-7">
                <p className={`${s.mono} text-[11px] text-(--steel)`}>Inspected by</p>
                <p className={`${s.mono} mt-3 border-b border-(--ink) pb-1 text-[15px]`}>{r.artisan}</p>
              </div>
              <div className="px-5 py-4 md:px-7">
                <p className={`${s.mono} text-[11px] text-(--steel)`}>Date</p>
                <p className={`${s.mono} mt-3 border-b border-(--ink) pb-1 text-[15px]`}>{r.finished}</p>
              </div>
            </div>

            {/* Stamps */}
            <motion.div
              aria-hidden
              style={{ scale: stamp, opacity: stampOp }}
              className={`${s.stamp} pointer-events-none absolute right-5 top-[36%] grid size-[132px] rotate-[-14deg] place-items-center rounded-full md:right-10 md:size-[150px]`}
            >
              <svg viewBox="0 0 150 150" className="absolute inset-0 size-full">
                <defs>
                  <path id="stamp-ring" d="M75 75 m-56 0 a56 56 0 1 1 112 0 a56 56 0 1 1 -112 0" />
                </defs>
                <circle cx="75" cy="75" r="44" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <text className={s.mono} fontSize="10.5" fill="currentColor" letterSpacing="1">
                  <textPath href="#stamp-ring">SANTALUM MAISON  INSPECTED  SANTALUM MAISON  INSPECTED</textPath>
                </text>
              </svg>
              <span className={`${s.mono} relative text-center text-[12px] font-medium leading-tight`}>
                Passed
                <br />
                <span className="text-[10px]">{r.batch}</span>
              </span>
            </motion.div>
            <span
              className={`${s.stamp} ${s.mono} absolute -top-3 left-6 rotate-[3deg] rounded-[3px] bg-(--sheet) px-2 py-0.5 text-[12px] font-medium`}
            >
              Example record
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ k, v, mono = false }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="border-b border-(--hair) px-5 py-3 sm:odd:border-r md:px-7">
      <dt className={`${s.mono} text-[10.5px] text-(--steel)`}>{k}</dt>
      <dd className={`mt-1 text-[15px] ${mono ? `${s.mono} tabular-nums` : ""}`}>{v}</dd>
    </div>
  );
}

function Check({ label, i, progress }: { label: string; i: number; progress: MotionValue<number> }) {
  const a = 0.15 + i * 0.1;
  const tick = useTransform(progress, [a, a + 0.12], [0, 1]);
  return (
    <li className="flex items-center gap-3 text-[14.5px]">
      <span className="relative grid size-[18px] shrink-0 place-items-center border border-(--ink) bg-(--sheet)">
        <svg viewBox="0 0 18 18" className="absolute inset-0 size-full overflow-visible text-(--m-accent)" aria-hidden>
          <motion.path d="M3.5 9.5 L7.5 13.5 L16 2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ pathLength: tick }} />
        </svg>
      </span>
      <span>{label}</span>
    </li>
  );
}
