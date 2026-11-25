"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, formatINR, priceLabel, productsFor } from "@/lib/shop/products";
import { seededRating } from "@/lib/shop/reviews-data";
import { RatingLine, Stars } from "../reviews/Stars";
import type { Wood } from "@/lib/wood-boot";
import { Photo } from "../../Photo";
import { Pill } from "../Pill";
import { firstShot } from "../shop/shots";

const EASE = [0.22, 1, 0.36, 1] as const;
const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight"];

const COPY: Record<Wood, { title: (n: number) => string; lead: (min: string, max: string) => string; end: string }> = {
  red: {
    title: (n) => `${WORDS[n] ?? n} pieces of red heartwood`,
    lead: (min, max) => `Beads, desk things and the Vault cuff, from ${min} to ${max}. Scroll to move along the string; the whole red shop waits at the end of it.`,
    end: "Turned, carved and strung from one dense red wood.",
  },
  white: {
    title: (n) => `${WORDS[n] ?? n} pieces that carry the scent`,
    lead: (min, max) => `Oil, attar, chandan and a Mysuru fan, from ${min} to ${max}. Scroll to move along the string; the whole white shop waits at the end of it.`,
    end: "Distilled, rolled and carved from fragrant heartwood.",
  },
};

/**
 * The featured pieces, strung like a mala: each piece is a bead on a hanging cord.
 * Scrolling moves the beads along the cord; the one at the low point is in focus.
 * The last bead on the string is the door to the full shop.
 * Rendered once per wood (see page.tsx) so a reload in white never shows red first.
 */
export function MalaString({ wood }: { wood: Wood }) {
  const items = featured(wood);
  const all = productsFor(wood).length;
  const n = items.length;
  const total = n + 1; // the pieces, then the shop
  const copy = COPY[wood];
  const prices = items.map((p) => p.price);
  const min = formatINR(Math.min(...prices));
  const max = formatINR(Math.max(...prices));
  const shopLabel = `All ${all} ${CONTENT[wood].name.toLowerCase()} pieces`;

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
    const ro = new ResizeObserver(([e]) => {
      if (e.contentRect.width > 0) setSize({ w: e.contentRect.width, h: e.contentRect.height });
    });
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
      const start = L / 2 - p * gap * (total - 1);
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
      for (let i = 0; i < total; i++) {
        put(beads.current[i], start + i * gap, bead, true);
        if (i < total - 1) put(spacers.current[i], start + (i + 0.5) * gap, 18, false);
      }
    },
    [bead, total],
  );

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    place(p);
    setActive(Math.min(total - 1, Math.max(0, Math.round(p * (total - 1)))));
  });

  // Re-place after a resize, or when this wood's string becomes visible after a switch.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = section.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const span = r.height - window.innerHeight;
      place(span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : scrollYProgress.get());
    });
    return () => cancelAnimationFrame(id);
  }, [place, size, scrollYProgress]);

  const current = active < n ? items[active] : null;

  return (
    <section ref={section} id="collection" className="relative md:h-[var(--mala-h)]" style={{ "--mala-h": `${total * 34 + 100}svh` } as CSSProperties}>
      {/* desktop: pinned stage */}
      <div ref={stage} className="sticky top-0 hidden h-svh overflow-hidden md:block">
        <div className="absolute inset-x-0 top-0 z-20 mx-auto flex max-w-[1500px] items-start justify-between gap-10 px-10 pt-28">
          <div>
            <h2 className="font-display text-[clamp(2.4rem,4.4vw,4.4rem)] font-[350] leading-[0.95] tracking-[-0.03em]">{copy.title(n)}</h2>
            <p className="mt-4 max-w-md text-[16px] leading-relaxed text-(--mz-ink-2)">{copy.lead(min, max)}</p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-3 pt-3">
            <p className="font-display text-[22px] tabular-nums text-(--mz-ink-3)">
              <span className="text-(--mz-ink)">{String(Math.min(active + 1, n)).padStart(2, "0")}</span> / {String(n).padStart(2, "0")}
            </p>
            <Link
              href="/maison/shop"
              className="rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 transition-colors hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
            >
              Skip to all {all}
            </Link>
          </div>
        </div>

        <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${size.w} ${size.h}`} aria-hidden>
          <path ref={pathRef} d={d} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-(--mz-ink)/25" />
        </svg>

        {Array.from({ length: total - 1 }, (_, i) => (
          <span
            key={`sp-${i}`}
            ref={(el) => {
              spacers.current[i] = el;
            }}
            className="absolute left-0 top-0 size-[18px] overflow-hidden rounded-full opacity-0 shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]"
          >
            <span className={`absolute inset-0 ${wood === "red" ? "ring-red" : "ring-white"}`} />
          </span>
        ))}

        {items.map((p, i) => {
          const s = firstShot(p);
          return (
            <Link
              key={p.slug}
              href={`/maison/shop/${p.slug}`}
              ref={(el) => {
                beads.current[i] = el;
              }}
              aria-label={`${p.name}, ${priceLabel(p)}`}
              className="absolute left-0 top-0 overflow-hidden rounded-full bg-(--mz-surface) opacity-0 shadow-[0_30px_60px_-25px_rgb(23_19_15/0.5)] ring-1 ring-black/5 will-change-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
              style={{ width: bead, height: bead }}
            >
              <Photo p={s.photo} tone={s.tone} sizes="300px" />
            </Link>
          );
        })}

        {/* the last bead: the shop */}
        <Link
          href="/maison/shop"
          ref={(el) => {
            beads.current[n] = el;
          }}
          aria-label={shopLabel}
          className="group absolute left-0 top-0 grid place-items-center overflow-hidden rounded-full opacity-0 shadow-[0_30px_60px_-25px_rgb(23_19_15/0.5)] will-change-transform focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
          style={{ width: bead, height: bead }}
        >
          <span className={`absolute inset-0 transition-transform duration-[1600ms] ease-out-soft group-hover:rotate-90 ${wood === "red" ? "ring-red" : "ring-white"}`} />
          <span className="relative rounded-full bg-(--mz-bg)/90 px-4 py-2 text-center font-display text-[19px] leading-tight backdrop-blur">
            All {all}
            <span className="block text-[13px] font-ui text-(--mz-ink-2)">pieces</span>
          </span>
        </Link>

        <div className="absolute inset-x-0 bottom-10 z-20 flex justify-center px-10">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.div
                key={current.slug}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex max-w-full items-center gap-5 rounded-full border border-(--mz-line) bg-(--mz-bg)/85 py-2 pl-7 pr-2 backdrop-blur-xl"
              >
                <span className="min-w-0">
                  <span className="block truncate font-display text-[22px] leading-tight tracking-[-0.01em]">{current.name}</span>
                  <span className="flex items-center gap-3 text-[14px] text-(--mz-ink-2)">
                    <RatingLine {...seededRating(current.slug)} size={12} className="shrink-0" />
                    <span className="truncate">{current.short}</span>
                  </span>
                </span>
                <span className="shrink-0 text-[15px] tabular-nums">{priceLabel(current)}</span>
                <Pill href={`/maison/shop/${current.slug}`}>View</Pill>
              </motion.div>
            ) : (
              <motion.div
                key="end"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex max-w-full flex-col items-center gap-4 rounded-[2rem] border border-(--mz-line) bg-(--mz-bg)/88 p-3 pt-4 backdrop-blur-xl xl:flex-row xl:rounded-full xl:py-2 xl:pl-7 xl:pr-2"
              >
                <span className="px-3 text-center text-[15px] text-(--mz-ink-2) xl:px-0 xl:text-left">{copy.end}</span>
                <CategoryLinks wood={wood} />
                <Pill href="/maison/shop">{shopLabel}</Pill>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* phones: a swipeable row of beads, ending at the shop */}
      <div className="px-5 py-24 md:hidden">
        <h2 className="font-display text-[42px] font-[350] leading-[0.95] tracking-[-0.03em]">{copy.title(n)}</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-(--mz-ink-2)">{copy.lead(min, max)}</p>
        <div className="mz-strip -mx-5 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
          {items.map((p) => {
            const s = firstShot(p);
            return (
              <Link key={p.slug} href={`/maison/shop/${p.slug}`} className="w-[62vw] shrink-0 snap-center">
                <span className="relative block aspect-square overflow-hidden rounded-full bg-(--mz-surface)">
                  <Photo p={s.photo} tone={s.tone} sizes="62vw" />
                </span>
                <span className="mt-4 block text-center font-display text-[22px] leading-tight">{p.name}</span>
                <span className="flex items-center justify-center gap-2 text-[15px] tabular-nums text-(--mz-ink-2)">
                  {priceLabel(p)}
                  <Stars value={seededRating(p.slug).avg} size={11} />
                </span>
              </Link>
            );
          })}
          <Link href="/maison/shop" className="w-[62vw] shrink-0 snap-center">
            <span className="relative grid aspect-square place-items-center overflow-hidden rounded-full">
              <span className={`absolute inset-0 ${wood === "red" ? "ring-red" : "ring-white"}`} />
              <span className="relative rounded-full bg-(--mz-bg)/90 px-5 py-2.5 text-center font-display text-[22px] leading-tight">All {all} pieces</span>
            </span>
            <span className="mt-4 block text-center font-display text-[22px] leading-tight">The full shop</span>
            <span className="block text-center text-[15px] text-(--mz-ink-2)">{CONTENT[wood].name}</span>
          </Link>
        </div>
        <div className="mt-8 flex flex-col items-start gap-5">
          <CategoryLinks wood={wood} wrap />
          <Pill href="/maison/shop" size="lg">
            {shopLabel}
          </Pill>
        </div>
      </div>
    </section>
  );
}

/** Ways into the shop by kind of piece. */
function CategoryLinks({ wood, wrap = false }: { wood: Wood; wrap?: boolean }) {
  return (
    <nav aria-label={`${CONTENT[wood].name} by kind`} className={`flex gap-1.5 ${wrap ? "flex-wrap" : "flex-wrap justify-center xl:flex-nowrap"}`}>
      {CATEGORIES[wood].map((c) => (
        <Link
          key={c.id}
          href={`/maison/shop?c=${c.id}`}
          className="whitespace-nowrap rounded-full bg-(--mz-surface) px-3.5 py-2 text-[14px] text-(--mz-ink-2) transition-colors hover:bg-(--mz-ink) hover:text-(--mz-bg) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
        >
          {c.label}
        </Link>
      ))}
    </nav>
  );
}
