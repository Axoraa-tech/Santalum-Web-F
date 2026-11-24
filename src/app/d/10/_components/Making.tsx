"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import type { Tone } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { clamp, EASE, fv, useReduced } from "./lib";

type Step = { word: string; text: string; photo: Record<Wood, { p: PhotoRef; tone?: Tone }> };

const STEPS: Step[] = [
  {
    word: "Select",
    text: "A billet is chosen for its heartwood: the colour, the density and the run of the grain. The paler sapwood is cut away.",
    photo: { red: { p: PHOTOS.redChip }, white: { p: PHOTOS.whiteLog } },
  },
  {
    word: "Shape",
    text: "The artisan studies the grain before the first cut. The wood decides what it will become; the hand follows, on the lathe or with the chisel.",
    photo: { red: { p: PHOTOS.carving }, white: { p: PHOTOS.carving } },
  },
  {
    word: "Finish",
    text: "Sanded by hand through finer grades, then rubbed with natural oil, and beeswax where the piece needs it.",
    photo: { red: { p: PHOTOS.turned, tone: "red" }, white: { p: PHOTOS.turned } },
  },
  {
    word: "Inspect",
    text: "A second pair of hands checks the size, the finish and the grain before the piece is entered in its batch record.",
    photo: { red: { p: PHOTOS.braceletClose }, white: { p: PHOTOS.beadsPale } },
  },
  {
    word: "Present",
    text: "Wrapped in raw cotton or linen, or set in a sandalwood box, with its record, and sent across India.",
    photo: { red: { p: PHOTOS.boxRed }, white: { p: PHOTOS.giftLinen } },
  },
];

/**
 * Making: the five steps as a column of words. Scroll through and each one stretches open in turn
 * (wdth 50 → 150, wght 200 → 900) while its photograph and its line of text take the other side.
 */
export function Making() {
  const wood = useWood();
  const reduced = useReduced();
  const secRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = clamp(p, 0, 0.9999) * STEPS.length;
    STEPS.forEach((_, i) => {
      const el = wordRefs.current[i];
      if (!el) return;
      const c = clamp(1 - Math.abs(s - (i + 0.5)) / 0.95, 0, 1);
      const e = c * c * (3 - 2 * c);
      el.style.fontVariationSettings = fv(50 + 100 * e, 200 + 700 * e);
      el.style.color = e > 0.5 ? "var(--k-ink)" : "var(--k-grey)";
    });
    const next = Math.floor(s);
    if (next !== idx) setIdx(next);
  });

  const step = STEPS[idx];
  const shot = step.photo[wood];

  return (
    <section id="making" ref={secRef} aria-labelledby="k10-making" className="relative h-[420svh] scroll-mt-0 border-t border-[var(--k-line)]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-12 md:pt-14">
        <div className={`${k.gut} flex items-baseline justify-between gap-6 py-3`}>
          <h2 id="k10-making" className={`${k.mono} text-[var(--k-grey)]`}>
            Making, in five steps
          </h2>
        </div>

        <div className={`${k.gut} grid grid-cols-1 min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 pb-6 md:grid-cols-12 md:grid-rows-1 md:gap-8 md:pb-8`}>
          <ol className="flex flex-col justify-center md:col-span-7">
            {STEPS.map((s, i) => (
              <li key={s.word} className="border-b border-[var(--k-line)] last:border-0">
                <span
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  className={`${k.step} block text-[length:min(15vw,8.6svh)] text-[var(--k-grey)] md:text-[length:min(9.4vw,15.6svh)]`}
                  style={i === 0 ? { fontVariationSettings: fv(150, 900), color: "var(--k-ink)" } : undefined}
                >
                  {s.word}
                </span>
              </li>
            ))}
          </ol>

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 md:col-span-5 md:grid-cols-1 md:grid-rows-[1fr_auto] md:gap-6">
            <div className="relative min-h-0 overflow-hidden rounded-[999px] bg-[var(--k-stone)] md:rounded-b-[32px] md:rounded-t-[999px]">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`${idx}-${wood}`}
                  initial={reduced ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)", zIndex: 1 }}
                  animate={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", zIndex: 1 }}
                  exit={{ zIndex: 0, opacity: 0.99, transition: { duration: 0.9 } }}
                  transition={{ duration: 0.9, ease: EASE }}
                  className="absolute inset-0"
                >
                  <Photo p={shot.p} tone={shot.tone} sizes="(min-width: 768px) 40vw, 50vw" />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="self-end">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p className={`${k.mono} tabular-nums text-[var(--k-grey)]`}>
                    Step <span className="text-[var(--m-accent)]">{idx + 1}</span> of {STEPS.length}
                  </p>
                  <p className={`${k.disp} mt-2 text-[length:clamp(28px,3vw,48px)] [font-variation-settings:'wdth'_120,'wght'_800]`}>{step.word}</p>
                  <p className={`${k.monoL} mt-3 max-w-[44ch] max-md:text-[12px]`}>{step.text}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
