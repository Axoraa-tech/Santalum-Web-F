"use client";

import { motion, useAnimationFrame, useMotionValue, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import type { Tone } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import k from "../k";
import { useReduced } from "./lib";

type Item = { t: string; c: "wide" | "thin" | "mid" | "outline" } | { p: PhotoRef; tone?: Tone };

/** Each wood has its own two bands: what it is called and where it grows, then what is done with it. */
const BANDS: Record<Wood, [Item[], Item[]]> = {
  red: [
    [
      { t: "Red sandalwood", c: "wide" },
      { p: PHOTOS.redChip },
      { t: "Pterocarpus santalinus", c: "thin" },
      { p: PHOTOS.redPowder },
      { t: "Eastern Ghats", c: "outline" },
      { p: PHOTOS.redGrain },
      { t: "Seshachalam hills", c: "mid" },
      { p: PHOTOS.beadStrandsDark },
    ],
    [
      { t: "Turned at the lathe", c: "mid" },
      { p: PHOTOS.turned, tone: "red" },
      { t: "dense as stone", c: "thin" },
      { p: PHOTOS.chipsRed },
      { t: "CITES records", c: "outline" },
      { p: PHOTOS.braceletDark },
      { t: "The 2011 Vault", c: "wide" },
      { p: PHOTOS.massageTools },
    ],
  ],
  white: [
    [
      { t: "White sandalwood", c: "wide" },
      { p: PHOTOS.whiteLog },
      { t: "Santalum album", c: "thin" },
      { p: PHOTOS.whitePowder },
      { t: "Mysuru", c: "outline" },
      { p: PHOTOS.whiteBeads },
      { t: "Srigandha, Karnataka", c: "mid" },
      { p: PHOTOS.chipsPale },
    ],
    [
      { t: "Slow distillation", c: "mid" },
      { p: PHOTOS.oilDrop },
      { t: "for the temple and the puja", c: "thin" },
      { p: PHOTOS.incenseDrying },
      { t: "Mysuru carving", c: "outline" },
      { p: PHOTOS.fanCarved },
      { t: "The 2011 Reserve", c: "wide" },
      { p: PHOTOS.oilVials },
    ],
  ],
};

const CLS = { wide: k.bandWide, thin: k.bandThin, mid: k.bandMid, outline: k.bandOutline };
const wrap = (min: number, max: number, v: number) => {
  const r = max - min;
  return ((((v - min) % r) + r) % r) + min;
};

function Items({ items }: { items: Item[] }) {
  return (
    <>
      {items.map((it, i) =>
        "t" in it ? (
          <span key={i} className={`${CLS[it.c]} px-[0.12em]`}>
            {it.t}
          </span>
        ) : (
          <span key={i} className={k.bandPill}>
            <Photo p={it.p} tone={it.tone} sizes="260px" />
          </span>
        ),
      )}
    </>
  );
}

function Band({ row, dir, className }: { row: 0 | 1; dir: 1 | -1; className: string }) {
  const reduced = useReduced();
  const x = useMotionValue(dir === 1 ? -50 : 0);
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const smooth = useSpring(vel, { damping: 50, stiffness: 380 });
  const skew = useTransform(smooth, [-2400, 0, 2400], [dir * 8, 0, dir * -8], { clamp: true });
  const boost = useTransform(smooth, [-3000, 0, 3000], [5, 0, 5], { clamp: false });
  const tx = useTransform(x, (v) => `${v}%`);

  useAnimationFrame((_, delta) => {
    if (reduced) return;
    const base = dir * 1.6 * (Math.min(delta, 64) / 1000);
    x.set(wrap(-50, 0, x.get() + base * (1 + boost.get())));
  });

  return (
    <div className={`${className} overflow-hidden py-[0.6vw]`}>
      <motion.div style={{ skewX: reduced ? 0 : skew }}>
        <motion.div style={{ x: tx }} className={`${k.band} flex w-max text-[length:clamp(64px,10.5vw,176px)] max-md:text-[16vw]`}>
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 items-center pr-[0.25em]">
              <W red={<Items items={BANDS.red[row]} />} white={<Items items={BANDS.white[row]} />} />
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

/** Two bands of the current wood running in opposite directions; they lean and speed up with the speed of your scroll. */
export function Marquee() {
  return (
    <section aria-label="The wood, by name and by craft" className="relative border-y border-[var(--k10-line)] py-[5vw]">
      {/* both band classes on the first band: its wide words always take the accent */}
      <Band row={0} dir={-1} className={`${k.bandRed} ${k.bandWhite}`} />
      <div className="my-[1.2vw] border-t border-[var(--k10-line)]" />
      <Band row={1} dir={1} className="" />
    </section>
  );
}
