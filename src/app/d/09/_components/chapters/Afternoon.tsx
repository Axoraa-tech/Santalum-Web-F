"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { EASE, STEPS } from "../data";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer, useScene } from "../Scene";
import { scrollToY } from "../store";

const STEP_PHOTOS: Record<Wood, { p: PhotoRef; tone?: "red" | "pale" }[]> = {
  red: [{ p: PHOTOS.redGrain }, { p: PHOTOS.turned, tone: "red" }, { p: PHOTOS.braceletClose }, { p: PHOTOS.beadStrandsDark }, { p: PHOTOS.boxRed }],
  white: [{ p: PHOTOS.whiteLog }, { p: PHOTOS.turned }, { p: PHOTOS.beadsPale }, { p: PHOTOS.beadStrands }, { p: PHOTOS.giftLinen }],
};

function StepPhoto({ wood, step }: { wood: Wood; step: number }) {
  const x = STEP_PHOTOS[wood][step];
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={step}
        initial={{ opacity: 0, scale: 1.08 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="absolute inset-0"
      >
        <Photo p={x.p} tone={x.tone} sizes="(min-width: 1024px) 14vw, 36vw" />
      </motion.div>
    </AnimatePresence>
  );
}

function Mala({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="japa-mala"
      wood={wood}
      shape="pebble"
      side="right"
      photoClass="size-[30vw] sm:size-36 lg:size-[min(13svh,8vw)]"
      nameClass="text-[20px] lg:text-[22px]"
      labelClass="max-w-[11rem]"
    />
  );
}
function Bracelet({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="bead-bracelet"
      wood={wood}
      shape="circle"
      side="right"
      photoClass="size-[30vw] sm:size-36 lg:size-[min(13svh,8vw)]"
      nameClass="text-[20px] lg:text-[22px]"
      labelClass="max-w-[11rem]"
    />
  );
}

/** 14:30. The hand: the five making steps advance as the scene holds, beside the carver's hands. */
export function Afternoon() {
  return (
    <Chapter id="afternoon" len="280vh" label="Afternoon: the making">
      <Workshop />
    </Chapter>
  );
}

function Workshop() {
  const ctx = useScene();
  const fallback = useMotionValue(0);
  const pin = ctx?.pin ?? fallback;
  const [step, setStep] = useState(0);
  useMotionValueEvent(pin, "change", (v) => {
    const next = Math.max(0, Math.min(STEPS.length - 1, Math.floor(v * STEPS.length * 1.02)));
    setStep((prev) => (prev === next ? prev : next));
  });

  const goTo = (i: number) => {
    const el = document.getElementById("ch-afternoon");
    const pinned = window.matchMedia("(min-width: 1024px) and (min-height: 640px)").matches;
    if (!el || !pinned) {
      setStep(i);
      return;
    }
    // scroll to the point in the held scene where this step is active
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + travel * ((i + 0.5) / STEPS.length));
  };

  return (
    <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
      <div className="relative lg:col-span-6 lg:h-full">
        <Layer speed={0.14} className="relative mx-auto aspect-[3/4] w-[84%] lg:absolute lg:left-[3%] lg:top-0 lg:mx-0 lg:h-full lg:w-auto">
          <Cut photo={PHOTOS.carving} shape="arch" niche className="size-full" sizes="(min-width: 1024px) 34vw, 84vw" />
          <Layer speed={0.5} className="absolute -right-[12%] bottom-[8%] aspect-square w-[40%]">
            <div className={`${s.mask} ${s.circle} size-full shadow-[0_24px_50px_-24px_rgb(42_36_32/0.55)]`}>
              <W red={<StepPhoto wood="red" step={step} />} white={<StepPhoto wood="white" step={step} />} />
            </div>
          </Layer>
        </Layer>
      </div>

      <Layer speed={0.08} className="flex flex-col justify-center lg:col-span-6 lg:pl-4">
        <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>14:30</p>
        <Lines
          lines={["Every piece", "begins as a reading"]}
          className={`${s.display} mt-1 text-[clamp(2.8rem,12vw,4.4rem)] leading-[0.94] lg:text-[min(4.7vw,8.6svh)]`}
        />
        <p className="mt-5 max-w-[34rem] text-[17px] leading-[1.7] text-[var(--muted)]">
          The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.
        </p>

        {/* wide screens: the step in focus follows the scroll */}
        <div className="mt-[min(2rem,3.6svh)] hidden lg:block">
          <ol className="relative grid grid-cols-5 border-t border-[var(--hair)]">
            <motion.span
              aria-hidden
              className="absolute left-0 top-[-1px] h-[2px] w-full origin-left bg-[var(--m-accent)]"
              style={{ scaleX: pin }}
            />
            {STEPS.map((st, i) => (
              <li key={st.name}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-current={i === step ? "step" : undefined}
                  className={`group w-full pt-3 text-left transition-colors duration-500 ${i === step ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"}`}
                >
                  <span className={`${s.tab} block text-[12px]`}>{i + 1}</span>
                  <span className={`${s.display} block text-[22px] leading-tight xl:text-[25px]`}>{st.name}</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="relative mt-3 min-h-[3.4em] max-w-[34rem] text-[16px] leading-[1.6]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.4, ease: EASE }}
                aria-live="polite"
              >
                {STEPS[step].text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* phones: the full sequence */}
        <ol className="mt-8 border-t border-[var(--hair)] lg:hidden">
          {STEPS.map((st, i) => (
            <li key={st.name} className="grid grid-cols-[2rem_1fr] gap-x-3 border-b border-[var(--hair)] py-4">
              <span className={`${s.tab} pt-1 text-[12px] text-[var(--muted)]`}>{i + 1}</span>
              <div>
                <p className={`${s.display} text-[24px] leading-tight`}>{st.name}</p>
                <p className="mt-1 text-[15px] leading-[1.6] text-[var(--muted)]">{st.text}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-[min(2.25rem,4svh)] lg:gap-6">
          <W red={<Mala wood="red" />} white={<Mala wood="white" />} />
          <W red={<Bracelet wood="red" />} white={<Bracelet wood="white" />} />
        </div>
      </Layer>
    </div>
  );
}
