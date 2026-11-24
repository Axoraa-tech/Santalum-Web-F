"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, WOOD_NAMES, formatINR } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { productHref, splitName } from "./copy";
import { s } from "./cls";
import { ArrowIcon } from "./ui";

/** Every piece in the current wood, grouped by range. A round photo follows the pointer over the list. */
export function CollectionIndex() {
  const wood = useWood();
  const reduced = !!useReducedMotion();
  const list = FAMILIES.filter((f) => f.variants[wood]);
  const groups = CATEGORIES.map((c) => ({ ...c, items: list.filter((f) => f.category === c.key) })).filter((g) => g.items.length);
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const width = useMotionValue(1);
  const tilt = useTransform(() => (sx.get() / Math.max(1, width.get()) - 0.5) * 16);
  const hovered = hover ? list.find((f) => f.slug === hover) : undefined;
  const hv = hovered?.variants[wood];

  return (
    <section id="pieces" className="relative bg-[var(--o-bg)] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
      <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-28">
            <h2 className={`${s.display} text-[clamp(2.8rem,5.4vw,5.4rem)]`}>
              <WT red="Ten pieces" white="Eleven pieces" />
              <span className="block text-[var(--o-muted)]">
                <WT red="in red." white="in white." />
              </span>
            </h2>
            <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed text-[var(--o-ink-2)]">
              From the heartwood, in five ranges. Every piece is made in both woods except the heartwood oil: only white sandalwood carries it.
            </p>
            <div className="mt-10 flex items-center gap-5">
              <span className="relative grid size-[104px] shrink-0 place-items-center overflow-hidden rounded-full">
                <span className={`absolute inset-0 ${wood === "red" ? s.woodRed : s.woodWhite}`} />
              </span>
              <div>
                <p className={`${s.deva} text-[34px] leading-none`}>{WOOD_NAMES[wood].sa}</p>
                <p className="mt-2 text-[14px] text-[var(--o-ink-2)]">{WOOD_NAMES[wood].latin}</p>
                <p className="text-[14px] text-[var(--o-muted)]">{WOOD_NAMES[wood].origin}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative lg:col-span-8"
          onPointerMove={(e) => {
            const r = e.currentTarget.getBoundingClientRect();
            width.set(r.width);
            x.set(e.clientX - r.left);
            y.set(e.clientY - r.top);
          }}
          onPointerLeave={() => setHover(null)}
        >
          {/* the follower: a disc that carries the photo of the row under the pointer */}
          <AnimatePresence>
            {hovered && hv && (
              <motion.div
                key="follower"
                aria-hidden
                className="pointer-events-none absolute left-0 top-0 z-20 hidden size-[260px] md:block"
                style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", rotate: reduced ? 0 : tilt }}
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.4, opacity: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <div className="relative size-full overflow-hidden rounded-full border-[7px] border-white bg-[var(--o-floor)] shadow-[0_30px_60px_-24px_rgb(25_23_20/0.55)]">
                  <AnimatePresence initial={false}>
                    <motion.div key={hovered.slug} className="absolute inset-0" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                      <Photo p={hv.shots[0].photo} tone={hv.shots[0].tone} sizes="260px" />
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {groups.map((g) => (
            <div key={g.key} className="mb-10 last:mb-0">
              <div className="flex items-baseline justify-between gap-6 border-b border-[var(--o-ink)] pb-3">
                <h3 className={`${s.syne} text-[15px] font-bold`}>{g.label}</h3>
                <p className="hidden text-[13px] text-[var(--o-muted)] sm:block">{g.line}</p>
              </div>
              <ul>
                {g.items.map((f) => {
                  const v = f.variants[wood]!;
                  const [name, sub] = splitName(f.name);
                  return (
                    <li key={f.slug} className="border-b border-[var(--o-line)]">
                      <Link
                        href={productHref(f.slug)}
                        onPointerEnter={() => setHover(f.slug)}
                        onFocus={() => setHover(f.slug)}
                        onBlur={() => setHover(null)}
                        className="group grid grid-cols-[56px_1fr_auto] items-center gap-4 py-4 transition-colors md:grid-cols-[1fr_minmax(0,260px)_110px_48px] md:gap-6 md:py-5"
                      >
                        <span className="relative size-14 overflow-hidden rounded-full bg-[var(--o-floor)] md:hidden">
                          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="56px" />
                        </span>
                        <span className="min-w-0">
                          <span className={`${s.syne} block text-[24px] font-bold leading-none tracking-[-0.035em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3 md:text-[clamp(1.8rem,3vw,2.75rem)]`}>
                            {name}
                            {sub && <span className="ml-2 whitespace-nowrap align-middle text-[0.45em] font-semibold tracking-normal text-[var(--o-muted)]">{sub}</span>}
                          </span>
                          {f.edition && <span className="mt-1 block text-[13px] text-[var(--m-accent)]">{f.edition}</span>}
                        </span>
                        <span className="hidden text-[14px] leading-snug text-[var(--o-muted)] md:block">{v.note}</span>
                        <span className="text-right text-[15px] font-semibold tabular-nums md:text-[16px]">{formatINR(v.price)}</span>
                        <span className="hidden size-12 place-items-center rounded-full border border-[var(--o-line)] transition-[background-color,color,transform,border-color] duration-300 group-hover:rotate-[-45deg] group-hover:border-[var(--o-ink)] group-hover:bg-[var(--o-ink)] group-hover:text-white md:grid">
                          <ArrowIcon />
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
