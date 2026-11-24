"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "motion/react";
import type { CSSProperties, PointerEvent, ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { inWood, scrollToCard } from "../store";

/** Card 1: the condensed headline and a three-photo collage that drifts with the pointer. */
export function Hero() {
  const wood = useWood();
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

  const names = WOOD_NAMES[wood];
  const count = inWood(wood).length;

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
        <p className="hidden max-w-[34ch] text-[14px] leading-snug text-[#77706A] md:block">
          Sandalwood objects, beads and jewellery. Shaped by hand in India and recorded piece by piece.
        </p>
        <p className="text-right text-[13px] leading-snug md:text-[14px]">
          <span className="block">{names.latin}</span>
          <span className="block text-[#77706A]" lang="sa">
            {names.sa}
          </span>
        </p>
      </header>

      <div className="mt-6 grid flex-1 gap-8 lg:mt-4 lg:grid-cols-12 lg:gap-6">
        {/* collage */}
        <div className="relative order-1 h-[80vw] max-h-[520px] lg:order-2 lg:col-span-6 lg:h-auto lg:max-h-none">
          <Drift sx={sx} sy={sy} depth={-24} turn={-2} className="absolute right-0 top-0 h-full w-[46%] lg:h-[80%] lg:w-[44%]">
            <div className="s7-settle relative size-full overflow-hidden rounded-b-[30px] rounded-t-full" style={{ "--d": "0.25s" } as CSSProperties}>
              <Photo p={PHOTOS.carving} sizes="(min-width: 1024px) 26vw, 46vw" priority />
              <span className="absolute bottom-3 left-3 right-3 hidden rounded-full bg-[#1B1712]/80 px-3 py-1.5 text-center text-[12px] leading-tight text-white sm:block md:bottom-4 md:text-[12.5px]">
                The grain is read before the first cut
              </span>
            </div>
          </Drift>
          <Drift sx={sx} sy={sy} depth={36} turn={3} className="absolute left-[2%] top-[2%] w-[50%] lg:left-[8%] lg:top-[3%] lg:w-[44%]">
            <div
              className="s7-settle relative aspect-square overflow-hidden rounded-full ring-[6px] ring-[#EFE9E0]"
              style={{ "--d": "0.4s" } as CSSProperties}
            >
              <Photo p={wood === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog} sizes="(min-width: 1024px) 24vw, 50vw" priority />
            </div>
          </Drift>
          <Drift sx={sx} sy={sy} depth={-48} turn={-4} className="absolute bottom-0 left-[26%] w-[36%] lg:bottom-auto lg:left-[30%] lg:top-[47%] lg:w-[30%]">
            <div
              className="s7-settle relative aspect-square overflow-hidden rounded-[38%] ring-[6px] ring-[#EFE9E0]"
              style={{ "--d": "0.55s" } as CSSProperties}
            >
              <Photo p={wood === "red" ? PHOTOS.beadStrandsDark : PHOTOS.whiteBeads} sizes="(min-width: 1024px) 18vw, 36vw" />
            </div>
          </Drift>
          <Stats count={count} wood={names.common} className="absolute bottom-0 left-0 hidden w-[56%] lg:grid" />
        </div>

        {/* headline + intro */}
        <div className="order-2 flex flex-col justify-end lg:order-1 lg:col-span-6">
          <h1 className="d1 text-[23vw] md:text-[15vw] lg:text-[clamp(3.6rem,min(11.8vw,20vh),14rem)]">
            <Line d="0.05s">Objects</Line>
            <Line d="0.14s">time cannot</Line>
            <Line d="0.23s">
              repeat<span className="text-[var(--m-accent)]">.</span>
            </Line>
          </h1>

          <p className="mt-7 max-w-[46ch] text-[16px] leading-relaxed text-[#3d3731] md:text-[17px] lg:mt-8">
            Beads, small objects and jewellery in two sandalwoods: deep red <i>Pterocarpus santalinus</i> and fragrant white{" "}
            <i>Santalum album</i>. Each piece leaves with its own record.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => scrollToCard("pieces")}
              className="group inline-flex h-12 items-center gap-3 rounded-full bg-[#1B1712] pl-5 pr-2 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
            >
              See the {count} pieces
              <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
                <IconArrow width={16} height={16} />
              </span>
            </button>
            <button
              type="button"
              onClick={() => scrollToCard("woods")}
              className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-[#1B1712]/20 transition hover:bg-white hover:ring-[#1B1712]/40 active:scale-[0.98]"
            >
              Compare the woods
            </button>
          </div>
          <Stats count={count} wood={names.common} className="mt-8 grid lg:hidden" />
        </div>
      </div>
    </div>
  );
}

function Stats({ count, wood, className }: { count: number; wood: string; className: string }) {
  return (
    <dl className={`grid-cols-3 gap-3 border-t border-[#1B1712]/12 pt-4 ${className}`}>
      {[
        [String(count), `pieces in ${wood.toLowerCase().replace(" sandalwood", "")}`],
        ["21", "numbered Vault cuffs"],
        ["5", "steps, log to box"],
      ].map(([n, t]) => (
        <div key={t} className="flex flex-col-reverse">
          <dt className="mt-1 text-[13px] leading-snug text-[#77706A]">{t}</dt>
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
