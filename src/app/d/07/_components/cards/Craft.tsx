"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import { useSlot } from "../Stack";
import { EASE, scrollToY } from "../store";

type Step = { name: string; text: string; check: string; result: string; photo: (w: Wood) => PhotoRef };

const STEPS: Step[] = [
  {
    name: "Select",
    text: "The log is read before it is bought: colour, weight, cracks and the run of the grain. Only heartwood goes on; the pale sapwood is set aside.",
    check: "Even colour, sound heartwood, no hidden splits",
    result: "Colour that runs evenly from one end of the piece to the other.",
    photo: (w) => (w === "red" ? PHOTOS.redChip : PHOTOS.whiteLog),
  },
  {
    name: "Shape",
    text: "Cut, carved or turned by hand. Beads are turned one at a time and sized on a gauge, so a strand runs even.",
    check: "Chisel, gouge and the lathe",
    result: "Small differences between beads. The mark of a hand, not a fault.",
    photo: () => PHOTOS.carving,
  },
  {
    name: "Finish",
    text: "Sanded through finer and finer grits, then rubbed with natural oil and beeswax until the grain shows its depth.",
    check: "No lacquer, no stain",
    result: "A soft sheen rather than a gloss. The grain can be felt as well as seen.",
    photo: () => PHOTOS.turned,
  },
  {
    name: "Inspect",
    text: "Every piece is checked in daylight for cracks and filler. A piece that fails is not sold. One that passes is given its number and batch.",
    check: "Numbered and entered in the record",
    result: "The same number on the piece’s record and on its box.",
    photo: (w) => (w === "red" ? PHOTOS.braceletClose : PHOTOS.beadsPale),
  },
  {
    name: "Present",
    text: "Wrapped in cotton or linen and packed with its record and a care card. The box is made to be kept.",
    check: "Record, care card, wrap",
    result: "A box made to be kept, not thrown away.",
    photo: (w) => (w === "red" ? PHOTOS.boxRed : PHOTOS.giftLinen),
  },
];

/** Card 4: pinned inside the card, the five making steps swap as you scroll. */
export function Craft() {
  const { inner, start, span } = useSlot();
  const wood = useWood();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);

  useMotionValueEvent(inner, "change", (v) => setStep(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length))));

  const jump = (i: number) => scrollToY(start.get() + span.get() * ((i + 0.5) / STEPS.length));
  const s = STEPS[step];

  return (
    <div className="flex h-full flex-col gap-4 p-3 pb-[134px] md:p-4 md:pb-[150px] lg:grid lg:grid-cols-12 lg:gap-8 lg:p-4 lg:pb-[78px]">
      {/* image sequence */}
      <div className="relative h-[30svh] shrink-0 overflow-hidden rounded-[22px] md:h-[32svh] md:rounded-[30px] lg:col-span-6 lg:h-auto lg:rounded-[36px]">
        {STEPS.map((st, i) => (
          <motion.div
            key={st.name}
            className="absolute inset-0"
            initial={false}
            animate={{ opacity: i === step ? 1 : 0, scale: i === step || reduce ? 1 : 1.07 }}
            transition={{ duration: reduce ? 0 : 0.9, ease: EASE }}
            aria-hidden={i !== step}
          >
            <Photo p={st.photo(wood)} sizes="(min-width: 1024px) 48vw, 100vw" />
          </motion.div>
        ))}
        <span className="d1 num absolute bottom-3 left-4 text-[64px] leading-none text-white [text-shadow:0_2px_24px_rgba(0,0,0,0.35)] md:bottom-5 md:left-6 md:text-[110px]">
          {step + 1}
        </span>
        <span className="absolute right-3 top-3 max-w-[70%] rounded-full bg-white/90 px-3 py-1.5 text-right text-[12px] leading-tight md:right-4 md:top-4 md:text-[12.5px]">
          {s.photo(wood).alt}
        </span>
      </div>

      {/* step text */}
      <div className="flex min-h-0 flex-1 flex-col px-2 md:px-4 lg:col-span-6 lg:px-0 lg:pr-8 lg:pt-5">
        <h2 className="d2 text-[30px] md:text-[clamp(2.2rem,min(3.6vw,6.4vh),3.8rem)]">Every piece begins as a reading</h2>
        <p className="mt-3 hidden max-w-[52ch] text-[15.5px] leading-relaxed text-[#77706A] md:block">
          The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.
        </p>

        <div className="relative mt-4 flex-1 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={s.name}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, y: -22 }}
              transition={{ duration: 0.45, ease: EASE }}
            >
              <p className="num text-[13px] text-[#77706A]">
                Step {step + 1} of {STEPS.length}
              </p>
              <p className="d1 mt-1 text-[clamp(3.4rem,min(11vw,18vh),11rem)]">{s.name}</p>
              <div className="mt-4 grid gap-4 md:grid-cols-[1.35fr_1fr] md:gap-6">
                <p className="max-w-[48ch] text-[15px] leading-relaxed md:text-[16.5px]">{s.text}</p>
                <dl className="grid content-start gap-3 text-[14px] md:border-l md:border-[#1B1712]/15 md:pl-5">
                  <div>
                    <dt className="flex items-center gap-2 text-[#77706A]">
                      <span className="size-1.5 rounded-full bg-[var(--m-accent)]" aria-hidden />
                      The check
                    </dt>
                    <dd className="mt-0.5 font-medium">{s.check}</dd>
                  </div>
                  <div className="hidden md:block">
                    <dt className="text-[#77706A]">In the finished piece</dt>
                    <dd className="mt-0.5">{s.result}</dd>
                  </div>
                </dl>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <ol className="mt-4 grid grid-cols-5 gap-1.5 md:gap-2">
          {STEPS.map((st, i) => (
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
                  <Photo p={st.photo(wood)} sizes="120px" />
                </span>
                <Seg inner={inner} i={i} n={STEPS.length} />
                <span
                  className={`mt-2 block truncate text-[12px] transition-colors md:text-[14px] ${
                    i === step ? "font-medium text-[#1B1712]" : "text-[#77706A] group-hover:text-[#1B1712]"
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
    <span className="relative block h-[4px] overflow-hidden rounded-full bg-[#1B1712]/12">
      <motion.span className="absolute inset-0 origin-left rounded-full bg-[#1B1712]" style={{ scaleX: fill }} />
    </span>
  );
}
