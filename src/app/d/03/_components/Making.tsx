"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { W, WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { glideTo } from "./store";

type Step = { name: string; line: string; detail: string; photo: PhotoRef };

/** Each wood has its own sequence: red is turned and recorded, white is seasoned, distilled or carved, tested and sealed. */
const LINES: Record<Wood, { line: string; photo: PhotoRef }[]> = {
  red: [
    { line: "Every piece begins as a reading. The turner studies the billet before the first cut.", photo: PHOTOS.redChip },
    { line: "The wood decides what it will become. The hand follows, on the lathe or at the bench.", photo: PHOTOS.turned },
    { line: "Finer and finer grits, until the red comes up from inside the wood.", photo: PHOTOS.braceletClose },
    { line: "A second pair of hands, and a second look at the colour.", photo: PHOTOS.malaHand },
    { line: "Nothing leaves the workshop without its batch record.", photo: PHOTOS.boxCarved },
  ],
  white: [
    { line: "The scent is only in the heartwood, so the heartwood is all we use.", photo: PHOTOS.whiteLog },
    { line: "The billets rest until the oil settles. It cannot be hurried.", photo: PHOTOS.chipsPale },
    { line: "Chips go to the still. The best blocks go to a carver in Mysuru.", photo: PHOTOS.carving },
    { line: "A batch of oil is only bottled once its test report is back.", photo: PHOTOS.oilVials },
    { line: "Amber glass or a sandalwood box, with the lot number on the label.", photo: PHOTOS.oil },
  ],
};

const STEPS: Record<Wood, Step[]> = {
  red: CONTENT.red.making.map((m, i) => ({ name: m.title, detail: m.text, ...LINES.red[i] })),
  white: CONTENT.white.making.map((m, i) => ({ name: m.title, detail: m.text, ...LINES.white[i] })),
};
const N = 5;

const EASE = [0.22, 1, 0.36, 1] as const;

/** The five steps as beads on a short thread. Scrolling slides the working bead from one to the next. */
export function Making() {
  const wrap = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: wrap, offset: ["start start", "end end"] });
  // settle on each step: the bead lingers at every knot, then moves on
  const pos = useTransform(scrollYProgress, (p) => {
    const t = Math.min(0.9999, Math.max(0, p)) * (N - 1) * 1.08 - 0.04 * (N - 1);
    const c = Math.min(N - 1, Math.max(0, t));
    const i = Math.floor(c);
    const f = c - i;
    const e = f < 0.35 ? 0 : f > 0.85 ? 1 : (f - 0.35) / 0.5;
    const s = e * e * (3 - 2 * e);
    return (i + s) / (N - 1);
  });
  const left = useTransform(pos, (v) => `${v * 100}%`);
  const [active, setActive] = useState(0);
  useMotionValueEvent(pos, "change", (v) => {
    const a = Math.round(v * (N - 1));
    if (a !== active) setActive(a);
  });

  const jump = (i: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    const p = (i / (N - 1) + 0.04) / 1.08;
    glideTo(top + Math.min(1, Math.max(0, p + 0.03)) * span);
  };

  return (
    <section ref={wrap} id="making" aria-labelledby="making-h" className="relative z-[1] h-[380vh]">
      {/* the page thread runs down the gutter beside the pinned steps; phones have no gutter, so there the
          pinned panel is papered over and the thread passes behind it */}
      <span data-knot className="absolute right-4 top-6 hidden h-px w-px md:right-6 md:block" aria-hidden />
      <span data-knot className="absolute bottom-6 right-4 hidden h-px w-px md:right-6 md:block" aria-hidden />
      {/* phones: the thread ties off at a knot on the panel's top edge and comes out of one at its foot */}
      <span data-knot className="s3-knot absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2 md:hidden" aria-hidden />
      <span data-knot className="s3-knot absolute bottom-0 left-1/2 z-[2] -translate-x-1/2 translate-y-1/2 md:hidden" aria-hidden />

      <div className="sticky top-0 flex h-svh flex-col overflow-hidden px-4 pb-[92px] pt-[86px] max-md:bg-(--linen) md:px-10 md:pb-10 md:pt-[104px]">
        <div className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col">
          <div className="flex items-end justify-between gap-6">
            <h2 id="making-h" className="s3-h2 text-[clamp(2.3rem,5vw,5.2rem)]">
              <WT red="Turned in five steps" white="Distilled and carved in five steps" />
            </h2>
            <p className="hidden max-w-[22rem] pb-2 text-[15px] leading-[1.6] text-(--muted) md:block">
              <WT
                red="The same order for a key fob and for a Vault cuff. Nothing is skipped because a piece is small."
                white="The same order for a box of incense and for a Reserve vial. The oil waits as long as it needs to."
              />
            </p>
          </div>

          <W red={<StepView wood="red" active={active} />} white={<StepView wood="white" active={active} />} />

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
              <W red={<StepKnots wood="red" active={active} jump={jump} />} white={<StepKnots wood="white" active={active} jump={jump} />} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepView({ wood, active }: { wood: Wood; active: number }) {
  const step = STEPS[wood][active];
  return (
    <div className="mt-6 grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] gap-6 md:mt-8 md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-10">
      {/* the bead-shaped photograph */}
      <div className="relative mx-auto aspect-square h-full max-h-[min(54vh,560px)] max-w-full md:col-span-6 md:h-[min(58vh,600px)] md:max-h-none">
        <AnimatePresence initial={false}>
          <motion.div
            key={step.name}
            className="absolute inset-0 overflow-hidden rounded-full bg-(--warm)"
            initial={{ opacity: 0, scale: 1.04, rotate: -6 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.98, rotate: 4 }}
            transition={{ duration: 0.9, ease: EASE }}
          >
            <Photo p={step.photo} sizes="(min-width: 768px) 46vw, 80vw" />
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
              Step {active + 1} of {N}, {wood} sandalwood
            </p>
            <h3 className="s3-serif mt-1 text-[clamp(2.4rem,5.4vw,5.6rem)] leading-[0.95]">{step.name}</h3>
            <p className="mt-3 max-w-[30rem] text-[clamp(1.05rem,1.4vw,1.3rem)] leading-[1.5] md:mt-5">{step.line}</p>
            <p className="mt-3 hidden max-w-[30rem] text-[16px] leading-[1.6] text-(--ink)/70 sm:block">{step.detail}</p>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function StepKnots({ wood, active, jump }: { wood: Wood; active: number; jump: (i: number) => void }) {
  return (
    <ol className="relative">
      {STEPS[wood].map((s, i) => (
        <li key={s.name} className="absolute top-0 -translate-x-1/2" style={{ left: `${(i / (N - 1)) * 100}%` }}>
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
  );
}
