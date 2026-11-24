"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { s } from "./cx";

type Step = { name: string; text: string; out: string; glyph: ReactNode };

const G = { fill: "none", stroke: "currentColor", strokeWidth: 1.3, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

const STEPS: Step[] = [
  {
    name: "Select",
    text: "The artisan reads the colour and grain of the heartwood and chooses the length for the piece.",
    out: "A billet, its grain read",
    glyph: (
      <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
        <circle cx="24" cy="24" r="17" {...G} />
        <circle cx="21.5" cy="25.5" r="11.5" {...G} opacity="0.7" />
        <circle cx="20.5" cy="26" r="6.5" {...G} opacity="0.55" />
        <circle cx="20" cy="26.5" r="1.6" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Shape",
    text: "Turned on the lathe or carved by hand. Beads are turned, sized and polished one at a time.",
    out: "The form, to drawing",
    glyph: (
      <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
        <path d="M4 24 H44" {...G} strokeDasharray="5 2 1 2" opacity="0.6" />
        <path d="M10 15 C16 9 22 9 24 14 C26 19 32 11 38 15 V33 C32 37 26 29 24 34 C22 39 16 39 10 33 Z" {...G} />
      </svg>
    ),
  },
  {
    name: "Finish",
    text: "Sanded smooth, then rubbed with natural oil, and beeswax where the piece is handled.",
    out: "Oiled and waxed",
    glyph: (
      <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
        <path d="M24 7 C24 7 14 20 14 27 A10 10 0 0 0 34 27 C34 20 24 7 24 7 Z" {...G} />
        <path d="M19 28 A5 5 0 0 0 24 33" {...G} opacity="0.6" />
        <path d="M8 42 H40" {...G} opacity="0.5" />
      </svg>
    ),
  },
  {
    name: "Inspect",
    text: "Checked for size, finish and grain, and given a batch number that stays with it.",
    out: "A batch record",
    glyph: (
      <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
        <path d="M8 10 H40 V16 H8 Z" {...G} />
        <path d="M12 16 V34 L16 38 V16" {...G} />
        <path d="M30 16 V30 L26 34 V16" {...G} />
        <path d="M17 13 H18 M22 13 H23 M27 13 H28 M32 13 H33" {...G} opacity="0.6" />
      </svg>
    ),
  },
  {
    name: "Present",
    text: "Packed in cotton, linen or a sandalwood box, with its record inside.",
    out: "Ready to leave",
    glyph: (
      <svg viewBox="0 0 48 48" className="size-10" aria-hidden>
        <path d="M8 22 H40 V40 H8 Z" {...G} />
        <path d="M6 14 L38 8 L40 14 L8 20 Z" {...G} />
        <path d="M24 22 V40" {...G} opacity="0.5" />
      </svg>
    ),
  },
];

/** Making: five real steps as a process diagram. The connecting line is drawn as you scroll. */
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
            <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em]`}>Making</h2>
            <blockquote className="mt-8 max-w-[34rem] text-[clamp(1.25rem,1.9vw,1.7rem)] leading-[1.35] tracking-[-0.01em]">
              Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will
              become. <span className="text-(--m-accent)">The hand follows.</span>
            </blockquote>
            <p className="mt-6 max-w-[30rem] text-[15px] leading-[1.6] text-(--ink-2)">
              Five steps, in this order, for every piece we make. Nothing skips inspection, and every piece leaves with the
              record of its batch.
            </p>
          </div>

          <div ref={photo} className="relative mx-auto w-full max-w-[520px] lg:col-span-6">
            <div className="relative aspect-square">
              <motion.div style={{ rotate: turn }} aria-hidden className="absolute -inset-5 rounded-full border border-dashed border-(--hair-2)" />
              <div className="absolute inset-0 overflow-hidden rounded-full bg-(--paper-2)">
                <Photo p={PHOTOS.carving} sizes="(min-width:1024px) 520px, 90vw" />
              </div>
              <svg aria-hidden className="pointer-events-none absolute -bottom-10 -left-4 h-24 w-40 overflow-visible text-(--ink) md:-left-16">
                <circle cx="150" cy="10" r="3" fill="currentColor" />
                <path d="M150 10 L80 80 H0" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
              <p className={`${s.mono} absolute -bottom-[3.1rem] -left-4 text-[11.5px] md:-left-16`}>
                Detail A. Shaping, by hand
              </p>
            </div>
          </div>
        </div>

        {/* Process diagram */}
        <div ref={ref} className="relative mt-24 md:mt-32">
          <svg aria-hidden className="absolute left-[10%] right-[10%] top-[44px] hidden h-3 w-[80%] overflow-visible md:block" preserveAspectRatio="none" viewBox="0 0 100 2">
            <line x1="0" y1="1" x2="100" y2="1" stroke="var(--hair-2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <motion.line
              x1="0"
              y1="1"
              x2="100"
              y2="1"
              stroke="var(--ink)"
              strokeWidth="1.5"
              vectorEffect="non-scaling-stroke"
              style={{ pathLength: draw }}
            />
          </svg>
          <svg aria-hidden className="absolute bottom-0 left-[27px] top-0 w-2 md:hidden" preserveAspectRatio="none" viewBox="0 0 2 100">
            <line x1="1" y1="0" x2="1" y2="100" stroke="var(--hair-2)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            <motion.line x1="1" y1="0" x2="1" y2="100" stroke="var(--ink)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
          </svg>
          <ol className="relative grid gap-10 md:grid-cols-5 md:gap-6">
            {STEPS.map((st, i) => (
              <StepNode key={st.name} step={st} i={i} progress={draw} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function StepNode({ step, i, progress }: { step: Step; i: number; progress: MotionValue<number> }) {
  const at = i / (STEPS.length - 1);
  const on = useTransform(progress, [Math.max(0, at - 0.08), at + 0.02], [0, 1]);
  const ring = useTransform(on, (v) => `rgb(26 27 29 / ${0.2 + v * 0.8})`);
  return (
    <li className="relative grid grid-cols-[56px_1fr] gap-5 md:block md:text-center">
      <div className="relative md:mx-auto md:w-[88px]">
        <motion.div
          style={{ borderColor: ring }}
          className="relative z-10 grid size-14 place-items-center rounded-full border bg-(--paper) text-(--ink) md:size-[88px]"
        >
          {step.glyph}
          <motion.span
            style={{ scale: on, opacity: on }}
            className={`${s.mono} absolute -right-1 -top-1 grid size-6 place-items-center rounded-full bg-(--ink) text-[11px] text-(--paper)`}
          >
            {i + 1}
          </motion.span>
        </motion.div>
      </div>
      <div className="md:mt-6">
        <h3 className={`${s.x110} text-[22px] font-[600] leading-none tracking-[-0.01em]`}>{step.name}</h3>
        <p className="mt-3 text-[14.5px] leading-[1.55] text-(--ink-2) md:mx-auto md:max-w-[15rem]">{step.text}</p>
        <p className={`${s.mono} mt-3 inline-block border-t border-(--hair-2) pt-2 text-[11.5px] text-(--steel)`}>Out: {step.out}</p>
      </div>
    </li>
  );
}
