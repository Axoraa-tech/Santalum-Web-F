"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { s } from "./cx";

const G = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const glyph = (children: ReactNode) => (
  <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
    {children}
  </svg>
);

const RINGS = glyph(
  <>
    <circle cx="24" cy="24" r="17" {...G} />
    <circle cx="21.5" cy="25.5" r="11.5" {...G} opacity="0.7" />
    <circle cx="20.5" cy="26" r="6.5" {...G} opacity="0.55" />
    <circle cx="20" cy="26.5" r="1.6" fill="currentColor" />
  </>,
);

/** Each wood's five steps (from the shared content), with a glyph and what leaves the step. */
const STEPS: Record<Wood, { glyph: ReactNode; out: string }[]> = {
  red: [
    { glyph: RINGS, out: "A billet, its colour and grain read" },
    {
      glyph: glyph(
        <>
          <path d="M4 24 H44" {...G} strokeDasharray="5 2 1 2" opacity="0.6" />
          <path d="M10 15 C16 9 22 9 24 14 C26 19 32 11 38 15 V33 C32 37 26 29 24 34 C22 39 16 39 10 33 Z" {...G} />
        </>,
      ),
      out: "The form, to drawing",
    },
    {
      glyph: glyph(
        <>
          <path d="M24 7 C24 7 14 20 14 27 A10 10 0 0 0 34 27 C34 20 24 7 24 7 Z" {...G} />
          <path d="M19 28 A5 5 0 0 0 24 33" {...G} opacity="0.6" />
          <path d="M8 42 H40" {...G} opacity="0.5" />
        </>,
      ),
      out: "Oiled and waxed, no lacquer",
    },
    {
      glyph: glyph(
        <>
          <path d="M8 10 H40 V16 H8 Z" {...G} />
          <path d="M12 16 V34 L16 38 V16" {...G} />
          <path d="M30 16 V30 L26 34 V16" {...G} />
          <path d="M17 13 H18 M22 13 H23 M27 13 H28 M32 13 H33" {...G} opacity="0.6" />
        </>,
      ),
      out: "Checked twice, then numbered",
    },
    {
      glyph: glyph(
        <>
          <path d="M10 8 H32 L38 14 V40 H10 Z" {...G} />
          <path d="M32 8 V14 H38" {...G} opacity="0.6" />
          <path d="M15 20 H32 M15 26 H32 M15 32 H25" {...G} opacity="0.6" />
        </>,
      ),
      out: "Boxed with its batch record",
    },
  ],
  white: [
    { glyph: RINGS, out: "Heartwood only, sapwood set aside" },
    {
      glyph: glyph(
        <>
          <path d="M6 38 H42" {...G} />
          <circle cx="14" cy="31" r="7" {...G} />
          <circle cx="30" cy="31" r="7" {...G} />
          <circle cx="22" cy="18" r="7" {...G} />
          <circle cx="22" cy="18" r="2.4" {...G} opacity="0.6" />
          <path d="M38 8 A6 6 0 1 0 38 20 A4 4 0 1 1 38 8 Z" {...G} opacity="0.6" />
        </>,
      ),
      out: "Billets rested until settled",
    },
    {
      glyph: glyph(
        <>
          <path d="M8 40 H26 V24 C26 18 22 14 17 14 C12 14 8 18 8 24 Z" {...G} />
          <path d="M17 14 V8 H34 L40 14" {...G} />
          <path d="M40 14 V22" {...G} />
          <path d="M40 27 C40 27 37 31 37 33 A3 3 0 0 0 43 33 C43 31 40 27 40 27 Z" fill="currentColor" />
        </>,
      ),
      out: "Oil from the still, or a carving",
    },
    {
      glyph: glyph(
        <>
          <path d="M19 6 H29 M21 6 V20 L12 38 A3 3 0 0 0 15 42 H33 A3 3 0 0 0 36 38 L27 20 V6" {...G} />
          <path d="M15 32 H33" {...G} opacity="0.6" />
        </>,
      ),
      out: "A batch report, kept with the lot",
    },
    {
      glyph: glyph(
        <>
          <path d="M19 6 H29 V12 H19 Z" {...G} />
          <path d="M20 12 V16 C14 18 12 22 12 27 V40 H36 V27 C36 22 34 18 28 16 V12" {...G} />
          <path d="M17 28 H31 V35 H17 Z" {...G} opacity="0.6" />
        </>,
      ),
      out: "Amber glass, the lot on the label",
    },
  ],
};

const SIDE: Record<Wood, { title: [string, string]; quote: ReactNode; text: string; photo: PhotoRef; caption: string }> = {
  red: {
    title: ["Turned", "by hand"],
    quote: (
      <>
        Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become.{" "}
        <span className="text-(--accent)">The hand follows.</span>
      </>
    ),
    text: "Five steps, in this order, for every red sandalwood piece. Nothing skips inspection, and every piece leaves with the record of its batch.",
    photo: PHOTOS.turned,
    caption: "Detail A. Turned, then oiled",
  },
  white: {
    title: ["Distilled", "and carved"],
    quote: (
      <>
        The scent sits in the oil of the heartwood, and the oil only forms after many years of growth.{" "}
        <span className="text-(--accent)">So we wait, then work slowly.</span>
      </>
    ),
    text: "Five steps for every white sandalwood bottle, jar and carving. Every batch of oil is tested, and the lot number goes on the label.",
    photo: PHOTOS.oilDrop,
    caption: "Detail B. One drop of heartwood oil",
  },
};

/** Making: each wood's five real steps as the shop-floor route card. Each operation is punched off as the card comes up the page. */
export function Making() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.6"] });
  const draw = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const photo = useRef<HTMLDivElement>(null);
  const { scrollYProgress: pp } = useScroll({ target: photo, offset: ["start end", "end start"] });
  const turn = useTransform(pp, [0, 1], [-12, 12]);

  return (
    <section id="making" className="relative scroll-mt-14 overflow-hidden border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <W red={<Side wood="red" />} white={<Side wood="white" />} />
          </div>

          <div ref={photo} className="relative mx-auto w-full max-w-[520px] lg:col-span-6">
            <div className="relative aspect-square">
              <motion.div style={{ rotate: turn }} aria-hidden className="absolute -inset-5 rounded-full border border-dashed border-(--hair-2)" />
              <div className="absolute inset-0 overflow-hidden rounded-full bg-(--paper-2)">
                <W
                  red={<Photo p={SIDE.red.photo} sizes="(min-width:1024px) 520px, 90vw" />}
                  white={<Photo p={SIDE.white.photo} sizes="(min-width:1024px) 520px, 90vw" />}
                />
              </div>
              <svg aria-hidden className="pointer-events-none absolute -bottom-10 -left-4 h-24 w-40 overflow-visible text-(--ink) md:-left-16">
                <circle cx="150" cy="10" r="3" fill="currentColor" />
                <path d="M150 10 L80 80 H0" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <p className={`${s.mono} absolute -bottom-[3.1rem] -left-4 text-[11.5px] md:-left-16`}>
                <WT red={SIDE.red.caption} white={SIDE.white.caption} />
              </p>
            </div>
          </div>
        </div>

        {/* Route card: the operations every piece goes through, punched off as the card comes up the page */}
        <div ref={ref} className="mt-24 md:mt-32">
          <W red={<Route wood="red" progress={draw} />} white={<Route wood="white" progress={draw} />} />
        </div>
      </div>
    </section>
  );
}

function Side({ wood }: { wood: Wood }) {
  const c = SIDE[wood];
  return (
    <>
      <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>
        {c.title[0]}
        <br />
        {c.title[1]}
      </h2>
      <blockquote className="mt-8 max-w-[34rem] text-[clamp(1.25rem,1.9vw,1.7rem)] leading-[1.35] tracking-[-0.01em]">{c.quote}</blockquote>
      <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.6] text-(--ink-2)">{c.text}</p>
    </>
  );
}

const ROUTE: Record<Wood, { scope: string; record: string }> = {
  red: { scope: "Every red sandalwood piece", record: "Its batch record" },
  white: { scope: "Every white sandalwood bottle, jar and carving", record: "Its lot and test report" },
};

/** The shop-floor route card: operation numbers, the operation, a sketch, the instruction, what leaves it, and a punch. */
function Route({ wood, progress }: { wood: Wood; progress: MotionValue<number> }) {
  const ops = CONTENT[wood].making;
  const r = ROUTE[wood];
  return (
    <div className={`${s.sheet} border border-(--ink)`}>
      {/* Title block */}
      <div className={`${s.mono} grid border-b border-(--ink) text-[11.5px] sm:grid-cols-[1fr_auto_auto]`}>
        <div className="px-4 py-3 md:px-6">
          <span className="block text-[10.5px] text-(--steel)">Route card, sheet {wood === "red" ? "A" : "B"}</span>
          <span className={`${s.x110} mt-1 block font-[family-name:var(--f01-archivo)] text-[clamp(1.25rem,2vw,1.6rem)] font-[600] leading-tight`}>{r.scope}</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-(--hair-2) px-4 py-2.5 sm:block sm:border-l sm:border-t-0 sm:px-5 sm:py-3">
          <span className="block text-[10.5px] text-(--steel)">Operations</span>
          <span className="block tabular-nums sm:mt-1 sm:text-[14px]">{ops.length}, in this order</span>
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-(--hair-2) px-4 py-2.5 sm:block sm:border-l sm:border-t-0 sm:px-5 sm:py-3">
          <span className="block text-[10.5px] text-(--steel)">Leaves with</span>
          <span className="block sm:mt-1 sm:text-[14px]">{r.record}</span>
        </div>
      </div>
      {/* Column heads */}
      <div className={`${s.mono} hidden grid-cols-[5rem_9.5rem_5.5rem_1fr_14rem_6rem] border-b border-(--hair-2) text-[10.5px] text-(--steel) md:grid`}>
        <span className="px-6 py-2">Op.</span>
        <span className="py-2">Operation</span>
        <span className="py-2">Sketch</span>
        <span className="py-2 pr-6">Instruction</span>
        <span className="border-l border-(--hair-2) px-4 py-2">Leaves the bench as</span>
        <span className="border-l border-(--hair-2) py-2 text-center">Punched</span>
      </div>
      <ol>
        {ops.map((st, i) => (
          <Op key={st.title} i={i} name={st.title} text={st.text} {...STEPS[wood][i]} last={i === ops.length - 1} progress={progress} />
        ))}
      </ol>
    </div>
  );
}

function Op({ name, text, glyph: g, out, i, last, progress }: { name: string; text: string; glyph: ReactNode; out: string; i: number; last: boolean; progress: MotionValue<number> }) {
  const at = i / 4;
  const on = useTransform(progress, [Math.max(0, at - 0.06), at + 0.04], [0, 1]);
  const punch = useTransform(on, [0, 1], [1.8, 1]);
  return (
    <li
      className={`grid grid-cols-[3.4rem_3.5rem_1fr_2.75rem] items-center gap-x-3 gap-y-3 px-4 py-5 md:grid-cols-[5rem_9.5rem_5.5rem_1fr_14rem_6rem] md:gap-0 md:p-0 ${last ? "" : "border-b border-(--hair-2)"}`}
    >
      <span className={`${s.mono} text-[13px] tabular-nums text-(--steel) md:px-6`}>{String((i + 1) * 10).padStart(3, "0")}</span>
      <h3 className={`${s.x110} col-span-2 text-[21px] font-[600] leading-none tracking-[-0.01em] md:col-span-1`}>{name}</h3>
      {/* The punch: an open ring until this operation is reached, then a clean hole through the card */}
      <span aria-hidden className="relative grid size-10 place-items-center justify-self-end md:col-start-6 md:row-start-1 md:h-full md:min-h-[6rem] md:w-full md:border-l md:border-(--hair-2)">
        <span className="size-7 rounded-full border border-dashed border-(--hair-2)" />
        <motion.span
          style={{ opacity: on, scale: punch }}
          className="absolute left-1/2 top-1/2 -ml-[11px] -mt-[11px] size-[22px] rounded-full bg-(--paper-3) shadow-[inset_0_2px_4px_rgb(0_0_0/0.42),0_0_0_1px_var(--hair-2),0_1px_0_1px_rgb(255_255_255/0.6)]"
        />
      </span>
      <span className="col-start-1 row-start-2 self-start text-(--ink) md:col-start-3 md:row-start-1 md:self-center">
        <span className="grid size-12 place-items-center border border-(--hair-2) bg-(--paper)">{g}</span>
      </span>
      <p className="col-span-3 col-start-2 row-start-2 text-[15px] leading-[1.55] text-(--ink-2) md:col-span-1 md:col-start-4 md:row-start-1 md:py-6 md:pr-6">{text}</p>
      <p className={`${s.mono} col-span-3 col-start-2 row-start-3 border-t border-dashed border-(--hair-2) pt-2 text-[12px] leading-[1.45] md:col-span-1 md:col-start-5 md:row-start-1 md:flex md:h-full md:items-center md:border-l md:border-t-0 md:border-solid md:px-4 md:py-6`}>
        <span className="text-(--steel) md:hidden">Leaves as: </span>
        {out}
      </p>
    </li>
  );
}
