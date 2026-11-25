"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { scrollToCard, SHOP } from "../store";

type HeroCopy = {
  tagline: string;
  lines: [string, string, string];
  size: string;
  arch: PhotoRef;
  archCaption: string;
  circle: PhotoRef;
  square: PhotoRef;
  compare: string;
  stats: [string, string][];
};

const COPY: Record<Wood, HeroCopy> = {
  red: {
    tagline: "Turned in our workshop from documented lots of Eastern Ghats heartwood, dense enough to sink in water.",
    lines: ["Objects", "time cannot", "repeat"],
    size: "text-[23vw] md:text-[15vw] lg:text-[clamp(3.6rem,min(11.8vw,20vh),14rem)]",
    arch: PHOTOS.carving,
    archCaption: "The billet is read before the first cut",
    circle: PHOTOS.redGrain,
    square: PHOTOS.beadStrandsDark,
    compare: "Compare with white",
    stats: [
      [String(productsFor("red").length), "pieces in red sandalwood"],
      [String(CONTENT.red.edition.size), "numbered Vault cuffs"],
      [String(CONTENT.red.making.length), "steps, billet to box"],
    ],
  },
  white: {
    tagline: "Distilled and carved from Karnataka heartwood that has grown for fifteen years or more before it holds any oil.",
    lines: ["Fragrance", "lives in the", "heartwood"],
    size: "text-[21vw] md:text-[14vw] lg:text-[clamp(3.4rem,min(10.6vw,18.5vh),13rem)]",
    arch: PHOTOS.oilHands,
    archCaption: "One drop of heartwood oil is enough",
    circle: PHOTOS.whiteLog,
    square: PHOTOS.fanCarved,
    compare: "Compare with red",
    stats: [
      [String(productsFor("white").length), "pieces in white sandalwood"],
      [String(CONTENT.white.edition.size), "numbered Reserve vials"],
      ["15", "years before the oil forms"],
    ],
  },
};

/** Card 1: the condensed headline and a three-photo collage that drifts with the pointer. Both woods render; CSS shows one. */
export function Hero() {
  const reduce = useReducedMotion();
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 45, damping: 15, mass: 0.9 });
  const sy = useSpring(py, { stiffness: 45, damping: 15, mass: 0.9 });

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width - 0.5);
    py.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    px.set(0);
    py.set(0);
  };

  const both = (pick: (c: HeroCopy) => ReactNode) => <W red={pick(COPY.red)} white={pick(COPY.white)} />;
  const bothT = (pick: (c: HeroCopy, w: Wood) => ReactNode) => <WT red={pick(COPY.red, "red")} white={pick(COPY.white, "white")} />;

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative flex min-h-[inherit] flex-col px-5 pb-[150px] pt-5 md:px-8 md:pt-7 lg:px-10 lg:pb-[84px] lg:pt-8"
    >
      <header className="flex items-start justify-between gap-6">
        <p className="d2 text-[26px] leading-[0.86] md:text-[32px]">
          Santalum
          <br />
          Maison
        </p>
        <p className="hidden max-w-[38ch] text-[14px] leading-snug text-(--s7-muted) md:block">{bothT((c) => c.tagline)}</p>
        <p className="text-right text-[13px] leading-snug md:text-[14px]">
          {bothT((_, w) => (
            <>
              <span className="block italic">{CONTENT[w].latin}</span>
              <span className="block text-(--s7-muted)">
                <span lang="sa">{CONTENT[w].sanskrit}</span>
                <span lang="kn" className="ml-2">
                  {CONTENT[w].kannada}
                </span>
              </span>
            </>
          ))}
        </p>
      </header>

      <div className="mt-6 grid flex-1 gap-8 lg:mt-4 lg:grid-cols-12 lg:gap-6">
        {/* collage */}
        <div className="relative order-1 h-[80vw] max-h-[520px] lg:order-2 lg:col-span-6 lg:h-auto lg:max-h-none">
          <Drift sx={sx} sy={sy} depth={-24} turn={-2} className="absolute right-0 top-0 h-full w-[46%] lg:h-[80%] lg:w-[44%]">
            <div className="s7-settle relative size-full overflow-hidden rounded-b-[30px] rounded-t-full" style={{ "--d": "0.25s" } as CSSProperties}>
              {both((c) => (
                <>
                  <Photo p={c.arch} sizes="(min-width: 1024px) 26vw, 46vw" priority />
                  <span className="absolute bottom-3 left-3 right-3 hidden rounded-full bg-(--s7-ink)/80 px-3 py-1.5 text-center text-[12px] leading-tight text-white sm:block md:bottom-4 md:text-[12.5px]">
                    {c.archCaption}
                  </span>
                </>
              ))}
            </div>
          </Drift>
          <Drift sx={sx} sy={sy} depth={36} turn={3} className="absolute left-[2%] top-[2%] w-[50%] lg:left-[8%] lg:top-[3%] lg:w-[44%]">
            <div
              className="s7-settle relative aspect-square overflow-hidden rounded-full ring-[6px] ring-(--s7-sand)"
              style={{ "--d": "0.4s" } as CSSProperties}
            >
              {both((c) => (
                <Photo p={c.circle} sizes="(min-width: 1024px) 24vw, 50vw" priority />
              ))}
            </div>
          </Drift>
          <Drift sx={sx} sy={sy} depth={-48} turn={-4} className="absolute bottom-0 left-[26%] w-[36%] lg:bottom-auto lg:left-[30%] lg:top-[47%] lg:w-[30%]">
            <div
              className="s7-settle relative aspect-square overflow-hidden rounded-[38%] ring-[6px] ring-(--s7-sand)"
              style={{ "--d": "0.55s" } as CSSProperties}
            >
              {both((c) => (
                <Photo p={c.square} sizes="(min-width: 1024px) 18vw, 36vw" />
              ))}
            </div>
          </Drift>
          <div className="absolute bottom-0 left-0 hidden w-[56%] lg:block">{both((c) => <Stats stats={c.stats} />)}</div>
        </div>

        {/* headline + intro */}
        <div className="order-2 flex flex-col justify-end lg:order-1 lg:col-span-6">
          {both((c) => (
            <h1 className={`d1 ${c.size}`}>
              <Line d="0.05s">{c.lines[0]}</Line>
              <Line d="0.14s">{c.lines[1]}</Line>
              <Line d="0.23s">
                {c.lines[2]}
                <span className="text-(--s7-accent)">.</span>
              </Line>
            </h1>
          ))}

          <p className="mt-7 max-w-[46ch] text-[16px] leading-relaxed text-(--s7-body) md:text-[17px] lg:mt-8">
            {bothT((_, w) => CONTENT[w].hero.sub)}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href={SHOP}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-ink) pl-5 pr-2 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98]"
            >
              {bothT((_, w) => CONTENT[w].hero.cta)}
              <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
                <IconArrow width={16} height={16} />
              </span>
            </Link>
            <button
              type="button"
              onClick={() => scrollToCard("woods")}
              className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface) hover:ring-(--s7-ink)/40 active:scale-[0.98]"
            >
              {bothT((c) => c.compare)}
            </button>
          </div>
          <div className="mt-8 lg:hidden">{both((c) => <Stats stats={c.stats} />)}</div>
        </div>
      </div>
    </div>
  );
}

function Stats({ stats }: { stats: [string, string][] }) {
  return (
    <dl className="grid grid-cols-3 gap-3 border-t border-(--s7-ink)/12 pt-4">
      {stats.map(([n, t]) => (
        <div key={t} className="flex flex-col-reverse justify-end">
          <dt className="mt-1 text-[13px] leading-snug text-(--s7-muted)">{t}</dt>
          <dd className="d1 num text-[44px] md:text-[52px]">{n}</dd>
        </div>
      ))}
    </dl>
  );
}

function Line({ d, children }: { d: string; children: ReactNode }) {
  return (
    <span className="block overflow-hidden pb-[0.06em]">
      <span className="s7-rise" style={{ "--d": d } as CSSProperties}>
        {children}
      </span>
    </span>
  );
}

function Drift({
  sx,
  sy,
  depth,
  turn,
  className,
  children,
}: {
  sx: MotionValue<number>;
  sy: MotionValue<number>;
  depth: number;
  turn: number;
  className: string;
  children: ReactNode;
}) {
  const x = useTransform(sx, (v) => v * depth);
  const y = useTransform(sy, (v) => v * depth * 0.8);
  const rotate = useTransform(sx, (v) => v * turn);
  return (
    <motion.div className={className} style={{ x, y, rotate }}>
      {children}
    </motion.div>
  );
}
