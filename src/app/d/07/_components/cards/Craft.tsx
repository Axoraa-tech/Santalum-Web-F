"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { useSlot } from "../Stack";
import { EASE, scrollToY } from "../store";

type Step = { name: string; text: string; check: string; result: string; photo: PhotoRef };

const DETAIL: Record<Wood, { check: string; result: string; photo: PhotoRef }[]> = {
  red: [
    { check: "Even colour, sound heartwood, no hidden splits", result: "Colour that runs evenly from one end of the piece to the other.", photo: PHOTOS.redChip },
    { check: "The lathe, the bead gauge and the gouge", result: "Small differences between beads. The mark of a hand, not a fault.", photo: PHOTOS.bowlsSlice },
    { check: "No lacquer, no stain", result: "A soft sheen rather than a gloss. The grain can be felt as well as seen.", photo: PHOTOS.massageTools },
    { check: "A second pair of hands, in daylight", result: "The same number on the piece’s record and on its box.", photo: PHOTOS.malaHand },
    { check: "Batch record, care card, linen", result: "A record that names the lot, the origin and the hands that finished it.", photo: PHOTOS.giftLinen },
  ],
  white: [
    { check: "Heartwood only; the sapwood is set aside", result: "Powder and oil that smell of sandalwood, because they are sandalwood.", photo: PHOTOS.whiteLog },
    { check: "Weeks to months in a dry room", result: "Carvings that stay true, and oil that comes out rounder.", photo: PHOTOS.chipsPale },
    { check: "Slow steam, or the Mysuru carver’s fine saw", result: "Oil from the chips; fans and figures from the best blocks.", photo: PHOTOS.oilDrop },
    { check: "A batch report for every lot of oil", result: "A report that travels with the bottle.", photo: PHOTOS.oilVials },
    { check: "Amber glass, the lot on the label", result: "A bottle you can trace back to the lot it came from.", photo: PHOTOS.apothecary },
  ],
};

const STEPS: Record<Wood, Step[]> = {
  red: CONTENT.red.making.map((m, i) => ({ name: m.title, text: m.text, ...DETAIL.red[i] })),
  white: CONTENT.white.making.map((m, i) => ({ name: m.title, text: m.text, ...DETAIL.white[i] })),
};

const HEAD: Record<Wood, { title: string; sub: string }> = {
  red: {
    title: "Every piece begins as a reading",
    sub: "The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
  },
  white: {
    title: "Every drop begins in the heartwood",
    sub: "Only the heartwood holds the oil. It rests until it settles, then goes to the still or to a Mysuru carver.",
  },
};

/** Card 4: pinned inside the card, the five making steps of the current wood swap as you scroll. */
export function Craft() {
  return <W red={<CraftBody wood="red" />} white={<CraftBody wood="white" />} />;
}

function CraftBody({ wood }: { wood: Wood }) {
  const { inner, start, span } = useSlot();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const steps = STEPS[wood];

  useMotionValueEvent(inner, "change", (v) => setStep(Math.min(steps.length - 1, Math.floor(v * steps.length))));

  const jump = (i: number) => scrollToY(start.get() + span.get() * ((i + 0.5) / steps.length));
  const s = steps[step];

  return (
    <div className="flex h-full flex-col gap-4 p-3 pb-[134px] md:p-4 md:pb-[150px] lg:grid lg:grid-cols-12 lg:gap-8 lg:p-4 lg:pb-[78px]">
      {/* image sequence */}
      <div className="relative h-[30svh] shrink-0 overflow-hidden rounded-[22px] md:h-[32svh] md:rounded-[30px] lg:col-span-6 lg:h-auto lg:rounded-[36px]">
        {steps.map((st, i) => (
          <motion.div
            key={st.name}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === step ? 1 : 0, scale: i === step || reduce ? 1 : 1.07 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
            aria-hidden={i !== step}
          >
            <Photo p={st.photo} sizes="(min-width: 1024px) 48vw, 100vw" />
          </motion.div>
        ))}
        <span className="d1 num absolute bottom-3 left-4 text-[64px] leading-none text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] md:bottom-5 md:left-6 md:text-[110px]">
          {step + 1}
        </span>
        <span className="absolute right-3 top-3 max-w-[70%] rounded-full bg-(--s7-surface)/90 px-3 py-1.5 text-right text-[12px] leading-tight md:right-4 md:top-4 md:text-[12.5px]">
          {s.photo.alt}
        </span>
      </div>

      {/* step text */}
      <div className="flex min-h-0 flex-1 flex-col px-2 md:px-4 lg:col-span-6 lg:px-0 lg:pr-8 lg:pt-5">
        <h2 className="d2 text-[30px] md:text-[clamp(2.2rem,min(3.6vw,6.4vh),3.8rem)]">{HEAD[wood].title}</h2>
        <p className="mt-3 hidden max-w-[52ch] text-[16px] leading-relaxed text-(--s7-muted) md:block">{HEAD[wood].sub}</p>

        <div className="relative mt-4 flex-1 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -22 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="num text-[13px] text-(--s7-muted)">
                Step {step + 1} of {steps.length}
              </p>
              <p className="d1 mt-1 text-[clamp(3.4rem,min(11vw,18vh),11rem)]">{s.name}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.35fr_1fr] md:gap-6">
                <p className="max-w-[48ch] text-[16px] leading-relaxed md:text-[16.5px]">{s.text}</p>
                <dl className="grid content-start gap-3 text-[14px] md:border-l md:border-(--s7-ink)/15 md:pl-5">
                  <div>
                    <dt className="flex items-center gap-2 text-(--s7-muted)">
                      <span className="size-1.5 rounded-full bg-(--s7-accent)" aria-hidden />
                      The check
                    </dt>
                    <dd className="mt-0.5 font-medium">{s.check}</dd>
                  </div>
                  <div className="hidden md:block">
                    <dt className="text-(--s7-muted)">In the finished piece</dt>
                    <dd className="mt-0.5">{s.result}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="mt-4 grid grid-cols-5 gap-1.5 md:gap-2">
          {steps.map((st, i) => (
            <li key={st.name}>
              <button
                type="button"
                onClick={() => jump(i)}
                aria-current={i === step ? "step" : undefined}
                className="group w-full text-left transition active:scale-[0.97]"
              >
                <span
                  className={`relative mb-2.5 hidden h-14 overflow-hidden rounded-[14px] transition duration-500 md:block ${
                    i === step ? "opacity-100" : "opacity-55 group-hover:opacity-90"
                  }`}
                >
                  <Photo p={st.photo} sizes="120px" />
                </span>
                <Seg inner={inner} i={i} n={steps.length} />
                <span
                  className={`mt-2 block truncate text-[12px] transition-colors md:text-[14px] ${
                    i === step ? "font-medium text-(--s7-ink)" : "text-(--s7-muted) group-hover:text-(--s7-ink)"
                  }`}
                >
                  {st.name}
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

function Seg({ inner, i, n }: { inner: MotionValue<number>; i: number; n: number }) {
  const fill = useTransform(inner, (v) => Math.min(1, Math.max(0, v * n - i)));
  return (
    <span className="relative block h-[4px] overflow-hidden rounded-full bg-(--s7-ink)/12">
      <motion.span className="absolute inset-0 origin-left rounded-full bg-(--s7-ink)" style={{ scaleX: fill }} />
    </span>
  );
}
