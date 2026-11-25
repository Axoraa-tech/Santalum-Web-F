"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import type { Tone } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { clamp, EASE, fv, useReduced } from "./lib";

type Step = { word: string; title: string; text: string; p: PhotoRef; tone?: Tone };

/** The steps differ by wood (the lathe for red, the still for white). Words longer than the column are shortened to their verb. */
const SHOTS: Record<Wood, { p: PhotoRef; tone?: Tone }[]> = {
  red: [{ p: PHOTOS.redChip }, { p: PHOTOS.turned, tone: "red" }, { p: PHOTOS.massageTools }, { p: PHOTOS.braceletDark }, { p: PHOTOS.boxRed }],
  white: [{ p: PHOTOS.whiteLog }, { p: PHOTOS.chipsPale }, { p: PHOTOS.oilDrop }, { p: PHOTOS.oilVials }, { p: PHOTOS.oilStand }],
};

const STEPS: Record<Wood, Step[]> = {
  red: CONTENT.red.making.map((m, i) => ({ word: m.title.split(" ")[0], title: m.title, text: m.text, ...SHOTS.red[i] })),
  white: CONTENT.white.making.map((m, i) => ({ word: m.title.split(" ")[0], title: m.title, text: m.text, ...SHOTS.white[i] })),
};
const N = 5;

/**
 * Making: the five steps of the current wood as a column of words. Scroll through and each one stretches
 * open in turn (wdth 50 → 150, wght 200 → 900) while its photograph and its line of text take the other side.
 */
export function Making() {
  const reduced = useReduced();
  const secRef = useRef<HTMLElement>(null);
  const wordRefs = useRef<Record<Wood, (HTMLSpanElement | null)[]>>({ red: [], white: [] });
  const [idx, setIdx] = useState(0);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const s = clamp(p, 0, 0.9999) * N;
    for (const w of ["red", "white"] as const) {
      for (let i = 0; i < N; i++) {
        const el = wordRefs.current[w][i];
        if (!el) continue;
        const c = clamp(1 - Math.abs(s - (i + 0.5)) / 0.95, 0, 1);
        const e = c * c * (3 - 2 * c);
        el.style.fontVariationSettings = fv(50 + 100 * e, 200 + 700 * e);
        el.style.color = e > 0.5 ? "var(--k10-ink)" : "var(--k10-grey)";
      }
    }
    const next = Math.floor(s);
    if (next !== idx) setIdx(next);
  });

  const words = (w: Wood) => (
    <ol className="flex flex-col justify-center md:col-span-7">
      {STEPS[w].map((s, i) => (
        <li key={s.title} className="border-b border-[var(--k10-line)] last:border-0">
          <span
            ref={(el) => {
              wordRefs.current[w][i] = el;
            }}
            className={`${k.step} block text-[length:min(15vw,8.6svh)] text-[var(--k10-grey)] md:text-[length:min(9.4vw,15.6svh)]`}
            style={i === 0 ? { fontVariationSettings: fv(150, 900), color: "var(--k10-ink)" } : undefined}
          >
            {s.word}
          </span>
        </li>
      ))}
    </ol>
  );

  const photo = (w: Wood) => {
    const s = STEPS[w][idx];
    return (
      <AnimatePresence initial={false}>
        <motion.div
          key={`${idx}-${w}`}
          initial={reduced ? { opacity: 0 } : { clipPath: "inset(100% 0% 0% 0%)", zIndex: 1 }}
          animate={reduced ? { opacity: 1 } : { clipPath: "inset(0% 0% 0% 0%)", zIndex: 1 }}
          exit={{ zIndex: 0, opacity: 0.99, transition: { duration: 0.9 } }}
          transition={{ duration: 0.9, ease: EASE }}
          className="absolute inset-0"
        >
          <Photo p={s.p} tone={s.tone} sizes="(min-width: 768px) 40vw, 50vw" />
        </motion.div>
      </AnimatePresence>
    );
  };

  const caption = (w: Wood) => {
    const s = STEPS[w][idx];
    return (
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: EASE }}
        >
          <p className={`${k.mono} tabular-nums text-[var(--k10-grey)]`}>
            Step <span className="text-[var(--k10-accent)]">{idx + 1}</span> of {N}
            {w === "red" ? ", at the lathe" : ", at the still"}
          </p>
          <p className={`${k.disp} mt-2 text-[length:clamp(28px,3vw,48px)] [font-variation-settings:'wdth'_120,'wght'_800]`}>{s.title}</p>
          <p className={`${k.monoL} mt-3 max-w-[44ch] max-md:text-[12px]`}>{s.text}</p>
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <section id="making" ref={secRef} aria-labelledby="k10-making" className="relative h-[420svh] scroll-mt-0 border-t border-[var(--k10-line)]">
      <div className="sticky top-0 flex h-svh flex-col overflow-hidden pt-12 md:pt-14">
        {/* the right edge stops short of the hanging bag tab, which stays over this pinned header */}
        <div className={`${k.gut} flex items-baseline justify-between gap-6 py-3 sm:pr-[118px] md:pr-[160px]`}>
          <h2 id="k10-making" className={`${k.mono} text-[var(--k10-grey)]`}>
            <WT red="Making, at the lathe, in five steps" white="Making, at the still and the bench, in five steps" />
          </h2>
          <p className={`${k.mono} hidden text-[var(--k10-grey)] sm:block`}>
            <WT red="Select, turn, finish, inspect, record" white="Select, season, distil, test, seal" />
          </p>
        </div>

        <div className={`${k.gut} grid grid-cols-1 min-h-0 flex-1 grid-rows-[auto_1fr] gap-4 pb-6 md:grid-cols-12 md:grid-rows-1 md:gap-8 md:pb-8`}>
          <W red={words("red")} white={words("white")} />

          <div className="grid min-h-0 grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-4 md:col-span-5 md:grid-cols-1 md:grid-rows-[1fr_auto] md:gap-6">
            <div className="relative min-h-0 overflow-hidden rounded-[999px] bg-[var(--k10-stone)] md:rounded-b-[32px] md:rounded-t-[999px]">
              <W red={photo("red")} white={photo("white")} />
            </div>
            <div className="self-end">
              <W red={caption("red")} white={caption("white")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
