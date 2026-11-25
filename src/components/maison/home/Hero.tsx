"use client";

import { motion } from "motion/react";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood-boot";
import { W, WT } from "../W";
import { Pill } from "../Pill";
import { WoodCanvas } from "../WoodCanvas";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The hero titles, broken where the line should break. */
const TITLE: Record<Wood, string[]> = {
  red: ["Objects time", "cannot repeat."],
  white: ["The fragrance", "lives in the", "heartwood."],
};

function Lines({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={l} className="block overflow-hidden pb-[0.06em]">
          <motion.span className="block" initial={{ y: "105%" }} animate={{ y: 0 }} transition={{ duration: 1.1, ease: EASE, delay: delay + 0.12 * i }}>
            {l}
          </motion.span>
        </span>
      ))}
    </>
  );
}

function Names({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  return (
    <>
      <p className="flex items-baseline gap-3 leading-none text-(--mz-accent)">
        <span lang="sa" className="font-deva text-[22px]">
          {c.sanskrit}
        </span>
        <span lang="kn" className="text-[17px]">
          {c.kannada}
        </span>
      </p>
      <p className="mt-2 font-display text-[15px] italic text-(--mz-ink-2)">{c.latin}</p>
    </>
  );
}

/** The one orchestrated entrance on the site: the slice grows from its pith while the headline rises. */
export function Hero() {
  return (
    <section className="relative overflow-hidden px-5 pb-14 pt-28 md:px-10 md:pt-32 lg:min-h-[100svh] lg:pb-10">
      {/* on desktop the words sit level with the slice's heart, so both actions stay well above the fold */}
      {/* minmax(0,1fr) on phones: the slice bleeds past the edges, and must not widen the column the words sit in */}
      <div className="mx-auto grid max-w-[1500px] grid-cols-[minmax(0,1fr)] items-end gap-10 lg:min-h-[calc(100svh-10.5rem)] lg:grid-cols-12 lg:items-center">
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-6">
          <h1 className="font-display text-[clamp(3.1rem,6.4vw,7.4rem)] font-[350] leading-[0.92] tracking-[-0.035em] [@media(min-width:1024px)_and_(max-height:760px)]:text-[clamp(3rem,5.2vw,6rem)]">
            <WT red={<Lines lines={TITLE.red} />} white={<Lines lines={TITLE.white} />} />
          </h1>
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.55 }}>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
              <WT red={CONTENT.red.hero.sub} white={CONTENT.white.hero.sub} />
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Pill href="/maison/shop" size="lg">
                <WT red={CONTENT.red.hero.cta} white={CONTENT.white.hero.cta} />
              </Pill>
              <Pill href="#studio" variant="line" size="lg">
                <WT red="Shape your own pendant" white="Shape a scented pendant" />
              </Pill>
            </div>
          </motion.div>
        </div>

        <div className="relative order-1 -mx-5 flex justify-center lg:order-2 lg:col-span-6 lg:mx-0 lg:block">
          <WoodCanvas
            mode="hero"
            label="A slice of sandalwood, its growth rings moving under the cursor"
            className="aspect-square w-[min(118vw,94svh)] max-w-none shrink-0 lg:ml-auto lg:-mr-[6vw] lg:w-[min(52vw,calc(100svh-9rem))]"
          />
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.2, delay: 1.4 }} className="absolute bottom-[4%] left-6 lg:left-[6%]">
            <W red={<Names wood="red" />} white={<Names wood="white" />} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
