"use client";

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type RefObject, type WheelEvent } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, formatINR, WOOD_NAMES, type CategoryKey, type Family } from "@/lib/catalog";
import { useWood, type Wood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { catLabel, HOME, inWood } from "../store";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/** Card 3: every piece in the current wood on a draggable, snapping row of tall tilting cards. */
export function Collection() {
  const wood = useWood();
  const reduce = useReducedMotion();
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const all = inWood(wood);
  const cats = CATEGORIES.filter((c) => all.some((f) => f.category === c.key));
  const active = cat !== "all" && cats.some((c) => c.key === cat) ? cat : "all";
  const list = active === "all" ? all : all.filter((f) => f.category === active);

  const x = useMotionValue(0);
  const minX = useMotionValue(0);
  const view = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const dragged = useRef(false);
  const [bounds, setBounds] = useState({ min: 0, step: 360 });

  useEffect(() => {
    const v = view.current;
    const t = track.current;
    if (!v || !t) return;
    const ro = new ResizeObserver(() => {
      const first = t.querySelector<HTMLElement>("[data-piece]");
      const gap = parseFloat(getComputedStyle(t).columnGap) || 0;
      const step = first ? first.offsetWidth + gap : 360;
      const min = Math.min(0, v.clientWidth - t.offsetWidth);
      minX.set(min);
      setBounds({ min, step });
      if (x.get() < min) x.set(min);
    });
    ro.observe(v);
    ro.observe(t);
    return () => ro.disconnect();
  }, [x, minX]);

  const progress = useTransform(() => {
    const m = minX.get();
    const v = x.get();
    return m < 0 ? clamp(v / m, 0, 1) : 1;
  });
  const knob = useTransform(progress, (p) => `${p * 100}%`);

  const go = (target: number) => {
    animate(x, clamp(target, bounds.min, 0), reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 26 });
  };
  const by = (dir: 1 | -1) => go(Math.round(x.get() / bounds.step) * bounds.step - dir * bounds.step);

  const choose = (c: CategoryKey | "all") => {
    setCat(c);
    go(0);
  };

  const onWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    x.set(clamp(x.get() - e.deltaX, bounds.min, 0));
  };

  const bringIntoView = (el: HTMLElement) => {
    const v = view.current;
    if (!v) return;
    const left = el.offsetLeft + x.get();
    const right = left + el.offsetWidth;
    if (left < 16) go(x.get() - left + 40);
    else if (right > v.clientWidth - 16) go(x.get() - (right - v.clientWidth) - 40);
  };

  const pill = (on: boolean) =>
    `h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition active:scale-95 ${
      on ? "bg-[#1B1712] text-white" : "bg-white/60 text-[#1B1712] ring-1 ring-[#1B1712]/10 hover:bg-white hover:ring-[#1B1712]/30"
    }`;

  return (
    <div className="flex min-h-[inherit] flex-col pb-[150px] pt-5 md:pt-7 lg:pb-[84px] lg:pt-8">
      <div className="flex flex-col gap-5 px-5 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <h2 className="d1 text-[clamp(3.4rem,min(6.6vw,11vh),7rem)]">The pieces</h2>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-[#77706A]">
            {active === "all"
              ? `All ${all.length} families made in ${WOOD_NAMES[wood].common.toLowerCase()}.`
              : `${list.length} of ${all.length} in ${WOOD_NAMES[wood].common.toLowerCase()}: ${CATEGORIES.find((c) => c.key === active)?.line.toLowerCase()}`}{" "}
            Drag the row or use the arrows.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <div role="group" aria-label="Filter by category" className="-mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 [scrollbar-width:none] md:-mx-1 md:flex-wrap md:overflow-visible md:px-1 md:pb-0">
            <button type="button" aria-pressed={active === "all"} onClick={() => choose("all")} className={pill(active === "all")}>
              All
            </button>
            {cats.map((c) => (
              <button key={c.key} type="button" aria-pressed={active === c.key} onClick={() => choose(c.key)} className={pill(active === c.key)}>
                {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-[#1B1712]/12" aria-hidden>
              <motion.span className="absolute inset-y-0 left-0 rounded-full bg-[var(--m-accent)]" style={{ width: knob }} />
            </div>
            <button
              type="button"
              aria-label="Previous pieces"
              onClick={() => by(-1)}
              className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-[#1B1712]/10 transition hover:bg-[#1B1712] hover:text-white active:scale-90"
            >
              <IconArrow dir="left" width={18} height={18} />
            </button>
            <button
              type="button"
              aria-label="Next pieces"
              onClick={() => by(1)}
              className="grid size-11 place-items-center rounded-full bg-white ring-1 ring-[#1B1712]/10 transition hover:bg-[#1B1712] hover:text-white active:scale-90"
            >
              <IconArrow width={18} height={18} />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={view}
        onWheel={onWheel}
        onDragStartCapture={(e) => e.preventDefault()}
        className="relative mt-5 flex flex-1 items-center overflow-hidden py-3 lg:mt-4"
      >
        <motion.div
          ref={track}
          drag="x"
          style={{ x }}
          dragConstraints={{ left: bounds.min, right: 0 }}
          dragElastic={0.14}
          dragTransition={{
            power: 0.3,
            timeConstant: 300,
            bounceStiffness: 260,
            bounceDamping: 30,
            modifyTarget: (t) => clamp(Math.round(t / bounds.step) * bounds.step, bounds.min, 0),
          }}
          onDragStart={() => {
            dragged.current = true;
          }}
          onDragEnd={() => {
            window.setTimeout(() => {
              dragged.current = false;
            }, 80);
          }}
          className="s7-grab flex h-[min(60svh,520px)] w-max gap-3 px-5 md:gap-4 md:px-8 lg:h-[min(58svh,600px)] lg:px-10"
        >
          {list.map((f) => (
            <PieceCard key={`${wood}-${f.slug}`} family={f} wood={wood} dragged={dragged} onFocus={bringIntoView} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function PieceCard({
  family: f,
  wood,
  dragged,
  onFocus,
}: {
  family: Family;
  wood: Wood;
  dragged: RefObject<boolean>;
  onFocus: (el: HTMLElement) => void;
}) {
  const v = f.variants[wood]!;
  const rx = useSpring(0, { stiffness: 220, damping: 20 });
  const ry = useSpring(0, { stiffness: 220, damping: 20 });
  const lift = useSpring(0, { stiffness: 260, damping: 24 });
  const px = useTransform(ry, (r) => r * -0.9);
  const py = useTransform(rx, (r) => r * 0.9);

  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    ry.set(nx * 16);
    rx.set(-ny * 14);
    lift.set(-6);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  };

  return (
    <motion.div
      data-piece
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, y: lift, transformPerspective: 900 }}
      className="aspect-[0.68] h-full shrink-0"
    >
      <Link
        href={`${HOME}/p/${f.slug}`}
        draggable={false}
        onFocus={(e) => onFocus(e.currentTarget.parentElement as HTMLElement)}
        onClick={(e) => {
          if (dragged.current) e.preventDefault();
        }}
        className="group flex h-full flex-col rounded-[28px] bg-white p-2 shadow-[0_24px_50px_-30px_rgba(27,23,18,0.45)] transition-shadow duration-500 hover:shadow-[0_34px_60px_-28px_rgba(27,23,18,0.55)] md:rounded-[32px] md:p-2.5"
      >
        <div className="relative flex-1 overflow-hidden rounded-[22px] md:rounded-[24px]">
          <motion.div className="absolute -inset-5" style={{ x: px, y: py }}>
            <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="(min-width: 1024px) 26vw, 60vw" />
          </motion.div>
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#1B1712]">
            {catLabel(f.category)}
          </span>
          {f.edition && (
            <span className="absolute right-3 top-3 rounded-full bg-[#1B1712] px-3 py-1.5 text-[12px] font-medium text-white">
              {f.edition}
            </span>
          )}
        </div>
        <div className="px-2 pb-1.5 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="d3 text-[19px] md:text-[21px]">{f.name}</p>
            <p className="num shrink-0 text-[15px] font-medium">{formatINR(v.price)}</p>
          </div>
          <p className="mt-1 line-clamp-1 text-[13.5px] text-[#77706A]">{v.note}</p>
        </div>
      </Link>
    </motion.div>
  );
}

