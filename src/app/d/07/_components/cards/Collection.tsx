"use client";

import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type PointerEvent, type RefObject, type WheelEvent } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, categoryOf, featured, formatINR, priceLabel, productsFor, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { shotOf, ShotPhoto } from "../shots";
import { RatingLine } from "../Stars";
import { productHref, shopHref, SHOP } from "../store";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

const COPY: Record<Wood, { title: string; text: (rest: number) => string }> = {
  red: {
    title: "Heavy in the hand",
    text: (rest) =>
      `The pieces the workshop turns most often, from a ${formatINR(1200)} key fob to the Vault cuff. The other ${rest} are in the shop, sorted by what they are for.`,
  },
  white: {
    title: "Scent you can hold",
    text: (rest) =>
      `The pieces for the altar, the dressing table and the wrist, from hand-rolled incense to the 2011 Reserve. The other ${rest} are in the shop, sorted by what they are for.`,
  },
};

/** Card 3: the featured pieces of the current wood on a draggable, snapping row, ending in the whole shop. */
export function Collection() {
  return <W red={<Pieces wood="red" />} white={<Pieces wood="white" />} />;
}

function Pieces({ wood }: { wood: Wood }) {
  const reduce = useReducedMotion();
  const list = featured(wood);
  const all = productsFor(wood);
  const cats = CATEGORIES[wood];

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

  return (
    <div className="flex min-h-[inherit] flex-col pb-[150px] pt-5 md:pt-7 lg:pb-[84px] lg:pt-8">
      <div className="flex flex-col gap-5 px-5 md:px-8 lg:flex-row lg:items-end lg:justify-between lg:px-10">
        <div>
          <h2 className="d1 text-[clamp(3.4rem,min(6.6vw,11vh),7rem)]">{COPY[wood].title}</h2>
          <p className="mt-3 max-w-[50ch] text-[16px] leading-relaxed text-(--s7-muted)">
            {COPY[wood].text(all.length - list.length)} Drag the row or use the arrows.
          </p>
        </div>
        <div className="flex flex-col gap-4 lg:items-end">
          <nav aria-label={`Shop ${CONTENT[wood].name.toLowerCase()} by category`} className="s7-noscroll -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1 md:-mx-1 md:flex-wrap md:overflow-visible md:px-1 md:pb-0 lg:max-w-[620px] lg:justify-end">
            {cats.map((c) => (
              <Link
                key={c.id}
                href={shopHref(c.id)}
                className="inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-(--s7-surface)/60 pl-4 pr-1.5 text-[14px] font-medium ring-1 ring-(--s7-ink)/10 transition hover:bg-(--s7-ink) hover:text-(--s7-page) active:scale-95"
              >
                {c.label}
                <span className="num grid h-7 min-w-7 place-items-center rounded-full bg-(--s7-ink)/[0.07] px-1.5 text-[12px]">
                  {all.filter((p) => p.category === c.id).length}
                </span>
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="relative h-[3px] w-40 overflow-hidden rounded-full bg-(--s7-ink)/12" aria-hidden>
              <motion.span className="absolute inset-y-0 left-0 rounded-full bg-(--s7-accent)" style={{ width: knob }} />
            </div>
            <button
              type="button"
              aria-label="Previous pieces"
              onClick={() => by(-1)}
              className="grid size-11 place-items-center rounded-full bg-(--s7-surface) ring-1 ring-(--s7-ink)/10 transition hover:bg-(--s7-ink) hover:text-(--s7-page) active:scale-90"
            >
              <IconArrow dir="left" width={18} height={18} />
            </button>
            <button
              type="button"
              aria-label="Next pieces"
              onClick={() => by(1)}
              className="grid size-11 place-items-center rounded-full bg-(--s7-surface) ring-1 ring-(--s7-ink)/10 transition hover:bg-(--s7-ink) hover:text-(--s7-page) active:scale-90"
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
          {list.map((p) => (
            <PieceCard key={p.slug} product={p} dragged={dragged} onFocus={bringIntoView} />
          ))}
          <ShopAll wood={wood} dragged={dragged} onFocus={bringIntoView} />
        </motion.div>
      </div>
    </div>
  );
}

function useTilt() {
  const rx = useSpring(0, { stiffness: 220, damping: 20 });
  const ry = useSpring(0, { stiffness: 220, damping: 20 });
  const lift = useSpring(0, { stiffness: 260, damping: 24 });
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 16);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 14);
    lift.set(-6);
  };
  const reset = () => {
    rx.set(0);
    ry.set(0);
    lift.set(0);
  };
  return { rx, ry, lift, onMove, reset };
}

function PieceCard({
  product: p,
  dragged,
  onFocus,
}: {
  product: Product;
  dragged: RefObject<boolean>;
  onFocus: (el: HTMLElement) => void;
}) {
  const { rx, ry, lift, onMove, reset } = useTilt();
  const px = useTransform(ry, (r) => r * -0.9);
  const py = useTransform(rx, (r) => r * 0.9);
  const shot = shotOf(p);
  const chip = p.edition ? `${p.edition.left} of ${p.edition.size} left` : p.badge;

  return (
    <motion.div
      data-piece
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, y: lift, transformPerspective: 900 }}
      className="aspect-[0.68] h-full shrink-0"
    >
      <Link
        href={productHref(p.slug)}
        draggable={false}
        onFocus={(e) => onFocus(e.currentTarget.parentElement as HTMLElement)}
        onClick={(e) => {
          if (dragged.current) e.preventDefault();
        }}
        className="group flex h-full flex-col rounded-[28px] bg-(--s7-surface) p-2 shadow-[0_24px_50px_-30px_rgba(27,23,18,0.45)] transition-shadow duration-500 hover:shadow-[0_34px_60px_-28px_rgba(27,23,18,0.55)] md:rounded-[32px] md:p-2.5"
      >
        <div className="relative flex-1 overflow-hidden rounded-[22px] md:rounded-[24px]">
          <motion.div className="absolute -inset-5" style={{ x: px, y: py }}>
            <ShotPhoto shot={shot} sizes="(min-width: 1024px) 26vw, 60vw" />
          </motion.div>
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-[12px] font-medium text-[#1B1712]">
            {categoryOf(p).label}
          </span>
          {chip && (
            <span className="num absolute right-3 top-3 rounded-full bg-(--s7-ink) px-3 py-1.5 text-[12px] font-medium text-(--s7-page)">
              {chip}
            </span>
          )}
        </div>
        <div className="px-2 pb-1.5 pt-3">
          <div className="flex items-baseline justify-between gap-3">
            <p className="d3 text-[19px] md:text-[21px]">{p.name}</p>
            <p className="num shrink-0 text-[15px] font-medium">{priceLabel(p)}</p>
          </div>
          <div className="mt-1 flex items-center justify-between gap-3">
            <p className="line-clamp-1 text-[14px] text-(--s7-muted)">{p.short}</p>
            <RatingLine slug={p.slug} className="shrink-0" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

/** The last card in the row: a small fanned deck of what else is in the shop. */
function ShopAll({ wood, dragged, onFocus }: { wood: Wood; dragged: RefObject<boolean>; onFocus: (el: HTMLElement) => void }) {
  const { rx, ry, lift, onMove, reset } = useTilt();
  const all = productsFor(wood);
  const rest = all.filter((p) => !p.featured);
  const fan = [rest[2], rest[6], rest[11]].filter(Boolean);
  const c = CONTENT[wood];

  return (
    <motion.div
      data-piece
      onPointerMove={onMove}
      onPointerLeave={reset}
      style={{ rotateX: rx, rotateY: ry, y: lift, transformPerspective: 900 }}
      className="aspect-[0.68] h-full shrink-0"
    >
      <Link
        href={SHOP}
        draggable={false}
        onFocus={(e) => onFocus(e.currentTarget.parentElement as HTMLElement)}
        onClick={(e) => {
          if (dragged.current) e.preventDefault();
        }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[28px] bg-(--s7-ink) p-5 text-(--s7-page) shadow-[0_24px_50px_-30px_rgba(27,23,18,0.55)] md:rounded-[32px] md:p-6"
      >
        <div className="relative h-[46%] shrink-0">
          {fan.map((p, i) => (
            <span
              key={p.slug}
              className="absolute left-1/2 top-[6%] h-[88%] w-[48%] overflow-hidden rounded-[18px] ring-4 ring-(--s7-ink) transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${-50 + (i - 1) * 46}%) rotate(${(i - 1) * 9}deg)`,
                zIndex: i === 1 ? 3 : 1,
              }}
            >
              <span className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                <ShotPhoto shot={shotOf(p)} sizes="160px" />
              </span>
            </span>
          ))}
        </div>
        <div className="mt-auto">
          <p className="text-[14px] text-(--s7-page)/65">The whole shop</p>
          <p className="d1 mt-2 text-[clamp(2.4rem,4.4vw,3.8rem)]">
            All {all.length} {c.name.toLowerCase()} pieces
          </p>
          <p className="mt-4 flex items-center justify-between gap-3 text-[15px] font-medium">
            <span>{CATEGORIES[wood].length} categories, search and filters</span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-(--s7-accent) text-white transition group-hover:translate-x-1">
              <IconArrow width={18} height={18} />
            </span>
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
