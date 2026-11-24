"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { glideTo } from "./store";

type Step = { name: string; line: string; detail: string; photo: (w: Wood) => PhotoRef };

const STEPS: Step[] = [
  {
    name: "Select",
    line: "Every piece begins as a reading. The artisan studies the grain before the first cut.",
    detail: "Only heartwood is used. Sapwood and cracked lengths are set aside; offcuts are kept for powder.",
    photo: (w) => (w === "red" ? PHOTOS.redChip : PHOTOS.whiteLog),
  },
  {
    name: "Shape",
    line: "The wood decides what it will become. The hand follows.",
    detail: "Beads are turned one at a time and sized by gauge. Panels are carved along the grain, never across it.",
    photo: () => PHOTOS.carving,
  },
  {
    name: "Finish",
    line: "Sanded through finer and finer grits, then rubbed with natural oil and beeswax.",
    detail: "No lacquer. The surface stays open, so the wood darkens and smooths with your hands.",
    photo: (w) => (w === "red" ? PHOTOS.braceletClose : PHOTOS.beadsPale),
  },
  {
    name: "Inspect",
    line: "A second pair of hands checks the grain, the finish and the fit.",
    detail: "Then the piece is written into the record: wood, origin, batch, who made it and when.",
    photo: () => PHOTOS.malaHand,
  },
  {
    name: "Present",
    line: "Wrapped in raw cotton or linen, boxed, and sent with its record.",
    detail: "Boxes are made from the same wood. Nothing in the packaging is plastic.",
    photo: (w) => (w === "red" ? PHOTOS.boxCarved : PHOTOS.giftLinen),
  },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** The five steps as beads on a short thread. Scrolling slides the working bead from one to the next. */
export function Making() {
  const wood = useWood();
  const wrap = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  // settle on each step: the bead lingers at every knot, then moves on
  const pos = useTransform(scrollYProgress, (p) => {
    const t = Math.min(0.9999, Math.max(0, p)) * (STEPS.length - 1) * 1.08 - 0.04 * (STEPS.length - 1);
    const c = Math.min(STEPS.length - 1, Math.max(0, t));
    const i = Math.floor(c);
    const f = c - i;
    const e = f < 0.35 ? 0 : f > 0.85 ? 1 : (f - 0.35) / 0.5;
    const s = e * e * (3 - 2 * e);
    return (i + s) / (STEPS.length - 1);
  });
  const left = useTransform(pos, (v) => `${v * 100}%`);
  const [active, setActive] = useState(0);
  useMotionValueEvent(pos, "change", (v) => {
    const a = Math.round(v * (STEPS.length - 1));
    if (a !== active) setActive(a);
  });
  const step = STEPS[active];

  const jump = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const p = (i / (STEPS.length - 1) + 0.04) / 1.08;
    glideTo(top + Math.min(1, Math.max(0, p + 0.03)) * span);
  };

  return (
    <section ref={wrap} id="making" aria-labelledby="making-h" className="relative z-[1] h-[380vh]">
      {/* the page thread runs down the gutter beside the pinned steps */}
      <span data-knot className="absolute right-4 top-6 hidden h-px w-px md:right-6 md:block" aria-hidden />
      <span data-knot className="absolute bottom-6 right-4 hidden h-px w-px md:right-6 md:block" aria-hidden />

      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-4 pb-[92px] pt-[86px] md:px-10 md:pb-10 md:pt-[104px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
          <div className="flex items-end justify-between gap-6">
            <h2 id="making-h" className="s3-h2 text-[clamp(2.3rem,5vw,5.2rem)]">
              Made in five steps
            </h2>
            <p className="hidden max-w-[22rem] pb-2 text-[15px] leading-[1.6] text-(--muted) md:block">
              The same order for a key fob and for a Vault cuff. Nothing is skipped because a piece is small.
            </p>
          </div>

          <div className="mt-6 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-6 md:mt-8 md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-10">
            {/* the bead-shaped photograph */}
            <div className="relative mx-auto aspect-square h-full max-h-[min(54vh,560px)] max-w-full md:col-span-6 md:h-[min(58vh,600px)] md:max-h-none">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${step.name}-${wood}`}
                  className="absolute inset-0 overflow-hidden rounded-full bg-(--warm)"
                  initial={{ opacity: 0, scale: 1.04, rotate: -6 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 0.98, rotate: 4 }}
                  transition={{ duration: 0.9, ease: EASE }}
                >
                  <Photo p={step.photo(wood)} sizes="(min-width: 768px) 46vw, 80vw" />
                </motion.div>
              </AnimatePresence>
              <span className="pointer-events-none absolute -inset-3 rounded-full border border-(--thread)/50 md:-inset-5" aria-hidden />
            </div>

            <div className="md:col-span-5 md:col-start-8">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step.name}
                  initial={{ opacity: 0, x: 18 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.45, ease: EASE }}
                  aria-live="polite"
                >
                  <p className="text-[14px] text-(--muted)">
                    Step {active + 1} of {STEPS.length}
                  </p>
                  <h3 className="s3-serif mt-1 text-[clamp(2.4rem,5.4vw,5.6rem)] leading-[0.95]">{step.name}</h3>
                  <p className="mt-3 max-w-[30rem] text-[clamp(1.05rem,1.4vw,1.3rem)] leading-[1.5] md:mt-5">{step.line}</p>
                  <p className="mt-3 hidden max-w-[30rem] text-[15px] leading-[1.6] text-(--ink)/70 sm:block">{step.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* the short thread with five beads; the working bead slides along it */}
          <div className="relative mx-auto mt-6 w-full max-w-[1100px] px-4 md:mt-8 md:px-8">
            <div className="relative h-14">
              <span className="absolute inset-x-[-16px] top-[14px] h-px bg-(--thread)" aria-hidden />
              <span className="s3-knot absolute left-[-20px] top-[10px]" aria-hidden />
              <span className="s3-knot absolute right-[-20px] top-[10px]" aria-hidden />
              <motion.span
                className="s3-bead absolute top-[3px] z-[2] h-[23px] w-[23px] -translate-x-1/2 shadow-[0_6px_14px_-6px_rgba(34,24,15,0.6)]"
                style={{ left }}
                aria-hidden
              />
              <ol className="relative">
                {STEPS.map((s, i) => (
                  <li key={s.name} className="absolute top-0 -translate-x-1/2" style={{ left: `${(i / (STEPS.length - 1)) * 100}%` }}>
                    <button
                      type="button"
                      onClick={() => jump(i)}
                      aria-current={i === active ? "step" : undefined}
                      className="group flex flex-col items-center gap-2"
                    >
                      <span
                        className={`mt-[7px] block h-[15px] w-[15px] rounded-full border transition-[background-color,transform] duration-500 group-hover:scale-125 group-active:scale-95 ${
                          i <= active ? "border-(--thread) bg-(--thread)" : "border-(--thread) bg-(--linen)"
                        }`}
                      />
                      <span
                        className={`whitespace-nowrap text-[12px] transition-colors md:text-[14px] ${i === active ? "text-(--ink)" : "text-(--muted) group-hover:text-(--ink)"}`}
                      >
                        {s.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
