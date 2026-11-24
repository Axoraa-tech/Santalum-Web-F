"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { FAMILIES, formatINR, WOOD_NAMES } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { Photo } from "../../Photo";
import { Pill } from "../Pill";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * The collection, strung like a mala: each piece is a bead on a hanging cord.
 * Scrolling moves the beads along the cord; the one at the low point is in focus.
 */
export function MalaString() {
  const wood = useWood();
  const items = useMemo(() => FAMILIES.filter((f) => f.variants[wood]), [wood]);
  const prices = items.map((f) => f.variants[wood]!.price);
  const n = items.length;

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const beads = useRef<(HTMLAnchorElement | null)[]>([]);
  const spacers = useRef<(HTMLSpanElement | null)[]>([]);
  const [size, setSize] = useState({ w: 1200, h: 800 });
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const bead = Math.round(Math.max(150, Math.min(size.w * 0.19, size.h * 0.36, 300)));
  const d = `M ${-0.2 * size.w} ${0.24 * size.h} C ${0.24 * size.w} ${0.8 * size.h}, ${0.76 * size.w} ${0.8 * size.h}, ${1.2 * size.w} ${0.22 * size.h}`;

  const place = useCallback(
    (p: number) => {
      const path = pathRef.current;
      if (!path) return;
      const L = path.getTotalLength();
      const gap = bead * 1.5;
      const start = L / 2 - p * gap * (n - 1);
      const put = (el: HTMLElement | null, s: number, sz: number, focusable: boolean) => {
        if (!el) return;
        if (s < -sz || s > L + sz) {
          el.style.opacity = "0";
          return;
        }
        const pt = path.getPointAtLength(Math.min(Math.max(s, 0), L));
        const dist = Math.abs(s - L / 2);
        const focus = focusable ? Math.max(0, 1 - dist / (gap * 1.1)) : 0;
        const scale = focusable ? 0.7 + 0.42 * focus : 1;
        el.style.opacity = "1";
        el.style.transform = `translate3d(${pt.x - sz / 2}px, ${pt.y - sz / 2}px, 0) scale(${scale})`;
        el.style.zIndex = String(Math.round(focus * 10) + 1);
      };
      for (let i = 0; i < n; i++) {
        put(beads.current[i], start + i * gap, bead, true);
        if (i < n - 1) put(spacers.current[i], start + (i + 0.5) * gap, 18, false);
      }
    },
    [bead, n],
  );

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    place(p);
    const i = Math.min(n - 1, Math.max(0, Math.round(p * (n - 1))));
    setActive(i);
  });

  useEffect(() => {
    const id = requestAnimationFrame(() => place(scrollYProgress.get()));
    return () => cancelAnimationFrame(id);
  }, [place, size, scrollYProgress, wood]);

  const current = items[Math.min(active, n - 1)];
  const v = current.variants[wood]!;

  return (
    <section
      ref={section}
      id="collection"
      className="relative md:h-[var(--mala-h)]"
      style={{ "--mala-h": `${n * 34 + 100}svh` } as CSSProperties}
    >
      {/* desktop: pinned stage */}
      <div ref={stage} className="sticky top-0 hidden h-svh overflow-hidden md:block">
        <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1500px] items-start justify-between px-10 pt-28">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,4.4vw,4.4rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
              {n} pieces in {WOOD_NAMES[wood].common.toLowerCase()}
            </h2>
            <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-ink-2">
              From a {formatINR(Math.min(...prices))} key fob to a numbered cuff at {formatINR(Math.max(...prices))}. Keep
              scrolling to move along the string.
            </p>
          </div>
          <p className="pt-3 font-display text-[22px] tabular-nums text-ink-3">
            <span className="text-ink">{String(active + 1).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
          </p>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
          <path ref={pathRef} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink/25" />
        </svg>

        {items.slice(0, -1).map((f, i) => (
          <span
            key={`sp-${f.slug}`}
            ref={(el) => {
              spacers.current[i] = el;
            }}
            className="absolute left-0 top-0 size-[18px] overflow-hidden rounded-full opacity-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
          >
            <span className={`absolute inset-0 ${wood === "red" ? "ring-red" : "ring-white"}`} />
          </span>
        ))}

        {items.map((f, i) => {
          const s = f.variants[wood]!.shots[0];
          return (
            <Link
              key={f.slug}
              href={`/maison/shop/${f.slug}`}
              ref={(el) => {
                beads.current[i] = el;
              }}
              aria-label={f.name}
              className="absolute left-0 top-0 overflow-hidden rounded-full opacity-0 shadow-[0_30px_60px_-25px_rgb(23_19_15/0.5)] ring-1 ring-black/5 will-change-transform"
              style={{ width: bead, height: bead }}
            >
              <Photo p={s.photo} tone={s.tone} sizes="300px" />
            </Link>
          );
        })}

        <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.slug}-${wood}`}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: EASE }}
              className="flex items-center gap-5 rounded-full border border-hair bg-paper/80 py-2 pl-7 pr-2 backdrop-blur-xl"
            >
              <span>
                <span className="block font-display text-[22px] leading-tight tracking-[-0.01em]">{current.name}</span>
                <span className="block text-[13px] text-ink-2">{v.note}</span>
              </span>
              <span className="text-[15px] tabular-nums">{formatINR(v.price)}</span>
              <Pill href={`/maison/shop/${current.slug}`}>View</Pill>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* phones: a swipeable row of beads */}
      <div className="px-5 py-24 md:hidden">
        <h2 className="font-display text-[42px] font-[350] leading-[0.95] tracking-[-0.03em]">
          {n} pieces in {WOOD_NAMES[wood].common.toLowerCase()}
        </h2>
        <p className="mt-4 text-[16px] leading-relaxed text-ink-2">
          From {formatINR(Math.min(...prices))} to {formatINR(Math.max(...prices))}.
        </p>
        <div className="-mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
          {items.map((f) => {
            const s = f.variants[wood]!.shots[0];
            return (
              <Link key={f.slug} href={`/maison/shop/${f.slug}`} className="w-[62vw] shrink-0 snap-center">
                <span className="relative block aspect-square overflow-hidden rounded-full">
                  <Photo p={s.photo} tone={s.tone} sizes="62vw" />
                </span>
                <span className="mt-4 block text-center font-display text-[22px] leading-tight">{f.name}</span>
                <span className="block text-center text-[14px] tabular-nums text-ink-2">{formatINR(f.variants[wood]!.price)}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
