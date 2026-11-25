"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef } from "react";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood";
import { s } from "./cx";

type Sheet = {
  title: [string, string];
  lead: string;
  text: string;
  onRecord: [string, string][];
  sheet: string;
  piece: string;
  checks: string[];
  key: string;
};

const SHEETS: Record<Wood, Sheet> = {
  red: {
    title: ["Know what", "you hold"],
    lead: "If there is evidence, we show it. If there isn’t, we don’t invent it.",
    text: CONTENT.red.provenance.text,
    onRecord: [
      ["On the record", "Species, lot, origin, batch, who finished it, the date"],
      ["Trade", "CITES Appendix II; documented lots, paperwork shown"],
      ["Vault cuffs", "Also entered in the registry by number"],
    ],
    sheet: "Inspection record",
    piece: "Japa Mala, 108 beads",
    checks: [
      "Billet colour and grain read before the first cut",
      "108 beads and the guru bead counted",
      "Bead size checked, 8 mm",
      "Knots and tassel checked",
      "Finish inspected under daylight, no lacquer",
      "Batch number recorded and packed with the piece",
    ],
    key: "Batch",
  },
  white: {
    title: ["Know what is", "in the bottle"],
    lead: "Heartwood only, and the lot on every label. If there is evidence, we show it.",
    text: CONTENT.white.provenance.text,
    onRecord: [
      ["On the label", "Species, lot, where the wood grew, the distilling date"],
      ["Rules", "Grown and sold under state forest rules in India"],
      ["Reserve vials", "Numbered by hand and entered in the registry"],
    ],
    sheet: "Distillation record",
    piece: "Heartwood Oil, 10 ml",
    checks: [
      "Heartwood only; sapwood set aside",
      "Lot weighed and logged before the still",
      "Slow steam distillation, nothing added",
      "Batch tested, report filed with the lot",
      "Bottled in amber glass with a glass dropper",
      "Lot number printed on the label and the box",
    ],
    key: "Lot",
  },
};

/** Provenance: the example record of each wood, styled as an inspection sheet with checkboxes and stamps. */
export function Provenance() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "center 0.45"] });
  const stamp = useTransform(scrollYProgress, [0.82, 1], [1.25, 1]);
  const stampOp = useTransform(scrollYProgress, [0.82, 0.9], [0, 0.9]);

  return (
    <section id="provenance" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] gap-14 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <W red={<Intro wood="red" />} white={<Intro wood="white" />} />
        </div>

        <div ref={ref} className="relative lg:col-span-7">
          <div className={`${s.sheet} relative mx-auto max-w-[720px] rotate-[-0.8deg] border border-(--hair-2) shadow-[0_40px_80px_-50px_rgb(0_0_0/0.45)]`}>
            <W red={<Record wood="red" progress={scrollYProgress} />} white={<Record wood="white" progress={scrollYProgress} />} />

            {/* Stamp */}
            <motion.div
              aria-hidden
              style={{ scale: stamp, opacity: stampOp }}
              className={`${s.stamp} pointer-events-none absolute right-6 top-[36%] grid size-[118px] rotate-[-14deg] place-items-center rounded-full md:right-10 md:size-[150px]`}
            >
              <svg viewBox="0 0 150 150" className="absolute inset-0 size-full">
                <defs>
                  <path id="l01-stamp-ring" d="M75 75 m-56 0 a56 56 0 1 1 112 0 a56 56 0 1 1 -112 0" />
                </defs>
                <circle cx="75" cy="75" r="44" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <text className={`${s.mono} l01-r`} fontSize="10.5" fill="currentColor" letterSpacing="1">
                  <textPath href="#l01-stamp-ring">SANTALUM MAISON  INSPECTED  SANTALUM MAISON  INSPECTED</textPath>
                </text>
                <text className={`${s.mono} l01-w`} fontSize="10.5" fill="currentColor" letterSpacing="1">
                  <textPath href="#l01-stamp-ring">SANTALUM MAISON  LOT TESTED  SANTALUM MAISON  LOT TESTED</textPath>
                </text>
              </svg>
              <span className={`${s.mono} relative text-center text-[12px] font-medium leading-tight`}>
                <WT red="Passed" white="Tested" />
                <br />
                <span className="text-[10px]">
                  <WT red={CONTENT.red.provenance.record[0].value} white={CONTENT.white.provenance.record[0].value} />
                </span>
              </span>
            </motion.div>
            <span className={`${s.stamp} ${s.mono} absolute -top-3 left-6 rotate-[3deg] rounded-[3px] bg-(--sheet) px-2 py-0.5 text-[12px] font-medium`}>Example record</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function Intro({ wood }: { wood: Wood }) {
  const c = SHEETS[wood];
  return (
    <>
      <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>
        {c.title[0]}
        <br />
        {c.title[1]}
      </h2>
      <p className="mt-8 max-w-[30rem] text-[clamp(1.2rem,1.7vw,1.5rem)] leading-[1.4] tracking-[-0.01em]">{c.lead}</p>
      <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.6] text-(--ink-2)">{c.text}</p>
      <dl className={`${s.mono} mt-10 grid max-w-[30rem] grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-(--ink) pt-5 text-[12px]`}>
        {c.onRecord.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-(--steel)">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

function Record({ wood, progress }: { wood: Wood; progress: MotionValue<number> }) {
  const c = SHEETS[wood];
  const rec = CONTENT[wood].provenance.record;
  const keyValue = rec[0].value;
  return (
    <>
      <div className="grid grid-cols-[1fr_auto] border-b-2 border-(--ink)">
        <div className="px-5 py-4 md:px-7 md:py-5">
          <p className={`${s.x110} text-[clamp(1.3rem,2.2vw,1.8rem)] font-[620] leading-none tracking-[-0.01em]`}>{c.sheet}</p>
          <p className={`${s.mono} mt-2 text-[11px] text-(--steel)`}>Santalum Maison workshop</p>
        </div>
        <div className={`${s.mono} grid content-center border-l border-(--hair-2) px-4 text-right text-[11px] md:px-6`}>
          <span className="text-(--steel)">{c.key}</span>
          <span className="text-[15px] tabular-nums">{keyValue}</span>
        </div>
      </div>

      <dl className="grid sm:grid-cols-2">
        <Field k="Piece" v={c.piece} />
        {rec.map((r) => (
          <Field key={r.label} k={r.label} v={r.value} mono={/\d/.test(r.value) && r.value.length < 12} />
        ))}
      </dl>

      <div className="border-t border-(--hair-2) px-5 py-5 md:px-7">
        <p className={`${s.mono} text-[11px] text-(--steel)`}>{wood === "red" ? "Inspection" : "Checks on the lot"}</p>
        <ul className="mt-3 grid gap-2.5">
          {c.checks.map((label, i) => (
            <Check key={label} label={label} i={i} progress={progress} />
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 border-t border-(--hair-2)">
        <div className="border-r border-(--hair-2) px-5 py-4 md:px-7">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>{rec[3].label}</p>
          <p className={`${s.mono} mt-3 border-b border-(--ink) pb-1 text-[15px]`}>{rec[3].value}</p>
        </div>
        <div className="px-5 py-4 md:px-7">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>{rec[4].label}</p>
          <p className={`${s.mono} mt-3 border-b border-(--ink) pb-1 text-[15px]`}>{rec[4].value}</p>
        </div>
      </div>
    </>
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
    <li className="flex items-center gap-3 text-[15px]">
      <span className="relative grid size-[18px] shrink-0 place-items-center border border-(--ink) bg-(--sheet)">
        <svg viewBox="0 0 18 18" className="absolute inset-0 size-full overflow-visible text-(--accent)" aria-hidden>
          <motion.path d="M3.5 9.5 L7.5 13.5 L16 2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ pathLength: tick }} />
        </svg>
      </span>
      <span>{label}</span>
    </li>
  );
}
