"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { WT } from "@/components/maison/W";

type SlotState = {
  /** 0 → 1 while the card slides up into view. */
  arrive: MotionValue<number>;
  /** 0 → 1 across the card's own extra scroll (pinned cards only). */
  inner: MotionValue<number>;
  /** 0 → 1 while the next card slides over this one. */
  covered: MotionValue<number>;
  /** Document y of the card's start, and its scroll span (for jumping to a point inside a pinned card). */
  start: MotionValue<number>;
  span: MotionValue<number>;
};

const SlotContext = createContext<SlotState | null>(null);

export function useSlot() {
  const s = useContext(SlotContext);
  if (!s) throw new Error("useSlot must be used inside <Slot>");
  return s;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * One card of the deck. Every card is sticky inside the same parent, so the next card slides over it.
 * Cards taller than the screen stick by their bottom edge (negative top), so all of their content is seen first.
 * A card with `extra` holds still (pinned) for that many extra screens, for scroll-driven content.
 */
export function Slot({
  id,
  label,
  caption,
  index,
  total,
  tint,
  extra = 0,
  children,
}: {
  id: string;
  label: string;
  /** The small corner caption, one per wood. */
  caption?: { red: string; white: string };
  index: number;
  total: number;
  tint: string;
  extra?: number;
  children: ReactNode;
}) {
  const marker = useRef<HTMLDivElement>(null);
  const section = useRef<HTMLElement>(null);
  const start = useMotionValue(0);
  const height = useMotionValue(1);
  const vh = useMotionValue(1);
  const top = useMotionValue(0);
  const originY = useMotionValue(0);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      const m = marker.current;
      const s = section.current;
      if (!m || !s) return;
      const v = window.innerHeight;
      const h = s.offsetHeight;
      start.set(m.getBoundingClientRect().top + window.scrollY);
      height.set(h);
      vh.set(v);
      top.set(Math.min(0, v - h));
      originY.set(h > v + 1 && !extra ? (h - v) / h : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    if (section.current) ro.observe(section.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [extra, start, height, vh, top, originY]);

  const covered = useTransform(() => {
    const y = scrollY.get();
    const s = start.get();
    const h = height.get();
    const v = vh.get();
    return clamp01((y - (s + h - v)) / v);
  });
  const arrive = useTransform(() => {
    const y = scrollY.get();
    const s = start.get();
    const v = vh.get();
    return clamp01((y - (s - v)) / v);
  });
  const inner = useTransform(() => {
    const y = scrollY.get();
    const s = start.get();
    const d = height.get() - vh.get();
    return d > 1 ? clamp01((y - s) / d) : 0;
  });
  const span = useTransform(() => height.get() - vh.get());

  const scale = useTransform(covered, (c) => (reduce ? 1 : 1 - 0.085 * c));
  const y = useTransform(covered, (c) => (reduce ? 0 : -16 * c));
  const dim = useTransform(covered, (c) => (reduce ? 0 : 0.2 * c));

  const card = (
    <motion.div
      className={`relative overflow-hidden rounded-[28px] shadow-[0_-24px_60px_-34px_rgba(27,23,18,0.38)] md:rounded-[40px] lg:rounded-[48px] ${
        extra
          ? "h-full"
          : "min-h-[calc(100svh-16px)] md:min-h-[calc(100svh-24px)] lg:min-h-[calc(100svh-28px)]"
      }`}
      style={{ scale, y, originY, backgroundColor: tint }}
    >
      {children}
      <p
        aria-hidden
        className="pointer-events-none absolute bottom-6 right-8 hidden items-baseline gap-2 text-[13px] text-(--s7-muted) lg:flex"
      >
        <span className="num">
          {index}/{total}
        </span>
        <span>{caption ? <WT red={caption.red} white={caption.white} /> : label}</span>
      </p>
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-(--s7-ink)" style={{ opacity: dim }} />
    </motion.div>
  );

  return (
    <SlotContext.Provider value={{ arrive, inner, covered, start, span }}>
      <div ref={marker} id={id} aria-hidden className="h-0" />
      <motion.section
        ref={section}
        aria-label={label}
        className="sticky p-2 md:p-3 lg:p-[14px]"
        style={extra ? { top, height: `${(1 + extra) * 100}svh`, padding: 0 } : { top }}
      >
        {extra ? <div className="sticky top-0 h-svh p-2 md:p-3 lg:p-[14px]">{card}</div> : card}
      </motion.section>
    </SlotContext.Provider>
  );
}

/** The deck itself: a plain relative parent so every card sticks within the same block. */
export function Deck({ children }: { children: ReactNode }) {
  return <div className="relative">{children}</div>;
}

/**
 * A smaller card for listings (shop results, tracking stages). Sticky like the deck's cards: it holds at the top
 * while the next one slides over it, then sinks back and dims. Tall sheets stick higher, so their bottom edge
 * stays clear of the dock.
 */
export function StackSheet({
  children,
  className = "",
  tint = "var(--s7-surface)",
  top = 14,
}: {
  children: ReactNode;
  className?: string;
  tint?: string;
  top?: number;
}) {
  const marker = useRef<HTMLDivElement>(null);
  const el = useRef<HTMLDivElement>(null);
  const start = useMotionValue(0);
  const height = useMotionValue(1);
  const stick = useMotionValue(top);
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();

  useEffect(() => {
    const measure = () => {
      const m = marker.current;
      const s = el.current;
      if (!m || !s) return;
      const v = window.innerHeight;
      const h = s.offsetHeight;
      const clear = window.innerWidth < 1024 ? 150 : 92;
      start.set(m.getBoundingClientRect().top + window.scrollY);
      height.set(Math.max(1, h));
      stick.set(Math.min(top, v - h - clear));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(document.body);
    if (el.current) ro.observe(el.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [top, start, height, stick]);

  const covered = useTransform(() => clamp01((scrollY.get() - (start.get() - stick.get())) / height.get()));
  const scale = useTransform(covered, (c) => (reduce ? 1 : 1 - 0.06 * c));
  const y = useTransform(covered, (c) => (reduce ? 0 : -12 * c));
  const dim = useTransform(covered, (c) => (reduce ? 0 : 0.16 * c));

  return (
    <>
      <div ref={marker} aria-hidden className="mt-2 h-0 first:mt-0 md:mt-3" />
      <motion.div ref={el} className="sticky" style={{ top: stick }}>
        <motion.div
          className={`relative overflow-hidden rounded-[28px] shadow-[0_-22px_50px_-34px_rgba(27,23,18,0.4)] md:rounded-[36px] ${className}`}
          style={{ scale, y, originY: 0, backgroundColor: tint }}
        >
          {children}
          <motion.div aria-hidden className="pointer-events-none absolute inset-0 bg-(--s7-ink)" style={{ opacity: dim }} />
        </motion.div>
      </motion.div>
    </>
  );
}
