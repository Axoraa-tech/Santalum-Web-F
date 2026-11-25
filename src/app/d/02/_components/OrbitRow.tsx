"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { featured, priceLabel, productsFor, type Product, type Wood } from "@/lib/shop/products";
import { SHOP, WOOD_LABEL, productHref, splitName } from "./copy";
import { RatingLine } from "./Rating";
import { s } from "./cls";
import { ArrowIcon } from "./ui";

function Item({ f, i, n, base }: { f: Product; i: number; n: number; base: MotionValue<number> }) {
  const step = (Math.PI * 2) / n;
  const angle = useTransform(base, (b) => i * step + b);
  // front of the orbit is the bottom of the ellipse: larger, sharper, on top
  const left = useTransform(angle, (a) => `calc(50% + ${Math.sin(a).toFixed(4)} * (50% - 90px))`);
  const top = useTransform(angle, (a) => `${(50 + Math.cos(a) * 26).toFixed(2)}%`);
  const depth = useTransform(angle, (a) => (Math.cos(a) + 1) / 2);
  const scale = useTransform(depth, (d) => 0.5 + d * 0.5);
  const opacity = useTransform(depth, (d) => 0.35 + d * 0.65);
  const zIndex = useTransform(depth, (d) => Math.round(d * 100));
  const labelOpacity = useTransform(depth, [0.7, 0.95], [0, 1]);
  return (
    <motion.div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left, top, scale, opacity, zIndex }}>
      <Link href={productHref(f.slug)} className="group flex w-[170px] flex-col items-center text-center">
        <span className="relative block size-[150px] overflow-hidden rounded-full border-[6px] border-white bg-[var(--o-floor)] shadow-[0_24px_50px_-24px_rgb(25_23_20/0.55)] transition-transform duration-500 group-hover:-translate-y-2">
          <Photo p={f.shots[0].photo} tone={f.shots[0].tone} sizes="150px" />
        </span>
        <motion.span style={{ opacity: labelOpacity }} className="mt-3 block">
          <span className={`${s.syne} block text-[17px] font-bold leading-tight tracking-[-0.02em] group-hover:underline`}>{splitName(f.name)[0]}</span>
          <span className="block text-[13px] tabular-nums text-[var(--o-muted)]">{priceLabel(f)}</span>
          <RatingLine slug={f.slug} size={11} />
        </motion.span>
      </Link>
    </motion.div>
  );
}

/** The wood's featured pieces riding a flat elliptical orbit. It drifts slowly; hover or focus holds it; the arrows step it. */
export function OrbitRow({ current, wood }: { current: string; wood: Wood }) {
  const reduced = !!useReducedMotion();
  const list = featured(wood).filter((f) => f.slug !== current);
  const total = productsFor(wood).length;
  const n = list.length;
  const base = useMotionValue(0);
  const held = useRef(false);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!held.current) base.set(base.get() - dt * 0.12);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [base, reduced]);

  const stepBy = (d: number) => {
    const step = (Math.PI * 2) / n;
    const target = Math.round(base.get() / step) * step - d * step;
    animate(base, target, reduced ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 });
  };

  return (
    <section aria-label="More from the ring" className="relative overflow-hidden px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6">
        <h2 className={`${s.display} text-[clamp(2.4rem,4.6vw,4.4rem)]`}>More from the ring</h2>
        <div className="flex gap-2">
          <button type="button" onClick={() => stepBy(-1)} aria-label="Turn the orbit back" className="grid size-12 place-items-center rounded-full border border-[var(--o-line)] transition-colors hover:border-[var(--o-ink)] active:scale-95">
            <ArrowIcon dir="left" />
          </button>
          <button type="button" onClick={() => stepBy(1)} aria-label="Turn the orbit on" className="grid size-12 place-items-center rounded-full border border-[var(--o-line)] transition-colors hover:border-[var(--o-ink)] active:scale-95">
            <ArrowIcon />
          </button>
        </div>
      </div>
      <div
        className="relative mx-auto mt-6 h-[400px] max-w-[1300px] md:h-[440px]"
        onPointerEnter={() => (held.current = true)}
        onPointerLeave={() => (held.current = false)}
        onFocus={() => (held.current = true)}
        onBlur={() => (held.current = false)}
      >
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-[90px] inset-y-[24%] h-[52%] w-[calc(100%-180px)]" aria-hidden>
          <ellipse cx="50" cy="50" rx="49.8" ry="49.5" fill="none" stroke="var(--o-line)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        </svg>
        {list.map((f, i) => (
          <Item key={f.slug} f={f} i={i} n={n} base={base} />
        ))}
      </div>
      <div className="mt-4 flex justify-center">
        <Link
          href={SHOP}
          className={`${s.syne} group inline-flex h-14 items-center gap-3 rounded-full border border-[var(--o-ink)] pl-6 pr-2 text-[15px] font-bold transition-colors hover:bg-[var(--o-ink)] hover:text-white`}
        >
          All {total} {WOOD_LABEL[wood].toLowerCase()} pieces
          <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] text-white transition-transform duration-300 group-hover:rotate-[-45deg]">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </section>
  );
}
