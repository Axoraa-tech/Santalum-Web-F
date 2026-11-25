"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, productsFor, type Wood } from "@/lib/shop/products";
import { SHOP, shopHref } from "./copy";
import { s } from "./cls";
import { ArrowIcon } from "./ui";

const LEAD: Record<Wood, { title: string; sub: string; body: string }> = {
  red: {
    title: "Five ranges",
    sub: "in red.",
    body: "Everything here is turned or carved from the one dense, deep red heartwood. The ring above holds eight pieces. The ranges below open the rest of the shop.",
  },
  white: {
    title: "Six ranges",
    sub: "in white.",
    body: "From the still, the incense rollers and the carver's bench in Mysuru. The ring above holds eight pieces. The ranges below open the rest of the shop.",
  },
};

/** One wood's ranges as entry points into the shop. A round photo follows the pointer over the list. */
function Index({ wood }: { wood: Wood }) {
  const reduced = !!useReducedMotion();
  const all = productsFor(wood);
  const c = CONTENT[wood];
  const lead = LEAD[wood];
  const groups = CATEGORIES[wood].map((cat) => {
    const items = all.filter((p) => p.category === cat.id);
    return { ...cat, items, from: Math.min(...items.map((p) => p.price)), cover: (items.find((p) => p.featured) ?? items[0]).shots[0] };
  });
  const [hover, setHover] = useState<string | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 28, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 260, damping: 28, mass: 0.6 });
  const width = useMotionValue(1);
  const tilt = useTransform(() => (sx.get() / Math.max(1, width.get()) - 0.5) * 16);
  const hovered = hover ? groups.find((g) => g.id === hover) : undefined;

  return (
    <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <h2 className={`${s.display} text-[clamp(2.8rem,5.4vw,5.4rem)]`}>
            {lead.title}
            <span className="block text-[var(--o-muted)]">{lead.sub}</span>
          </h2>
          <p className="mt-6 max-w-[380px] text-[16px] leading-relaxed text-[var(--o-ink-2)]">{lead.body}</p>
          <div className="mt-10 flex items-center gap-5">
            <span className={`relative size-[104px] shrink-0 overflow-hidden rounded-full ${wood === "red" ? s.woodRed : s.woodWhite}`} />
            <div>
              <p className={`${s.deva} text-[30px] leading-none`}>{c.sanskrit}</p>
              <p className={`${s.deva} mt-1.5 text-[18px] leading-none text-[var(--o-ink-2)]`}>{c.kannada}</p>
              <p className="mt-2 text-[14px] italic text-[var(--o-ink-2)]">{c.latin}</p>
              <p className="text-[14px] text-[var(--o-muted)]">{c.origin.region}</p>
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
        {/* the follower: a disc that carries the photo of the range under the pointer */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="follower"
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 z-20 hidden size-[240px] md:block"
              style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%", rotate: reduced ? 0 : tilt }}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.4, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
            >
              <div className="relative size-full overflow-hidden rounded-full border-[7px] border-white bg-[var(--o-floor)] shadow-[0_30px_60px_-24px_rgb(25_23_20/0.55)]">
                <AnimatePresence initial={false}>
                  <motion.div key={hovered.id} className="absolute inset-0" initial={{ opacity: 0, scale: 1.12 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                    <Photo p={hovered.cover.photo} tone={hovered.cover.tone} sizes="240px" />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <ul className="border-t border-[var(--o-ink)]">
          {groups.map((g) => (
            <li key={g.id} className="border-b border-[var(--o-line)]">
              <Link
                href={shopHref(g.id)}
                onPointerEnter={() => setHover(g.id)}
                onFocus={() => setHover(g.id)}
                onBlur={() => setHover(null)}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-4 py-5 md:grid-cols-[auto_1fr_minmax(0,230px)_auto] md:gap-6 md:py-6"
              >
                {/* up to three pieces of the range, overlapping like coins */}
                <span className="flex shrink-0">
                  {g.items.slice(0, 3).map((p, i) => (
                    <span
                      key={p.slug}
                      className={`relative size-12 overflow-hidden rounded-full border-[3px] border-[var(--o-bg)] bg-[var(--o-floor)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] md:size-14 ${i ? "-ml-5" : ""} group-hover:translate-x-[calc(var(--i)*6px)]`}
                      style={{ zIndex: 3 - i, "--i": i } as React.CSSProperties}
                    >
                      <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="56px" />
                    </span>
                  ))}
                </span>
                <span className="min-w-0">
                  <span className={`${s.syne} block text-[22px] font-bold leading-none tracking-[-0.035em] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-2 sm:text-[26px] md:text-[clamp(1.8rem,2.8vw,2.6rem)]`}>
                    {g.label}
                  </span>
                  <span className="mt-1.5 block text-[14px] text-[var(--o-muted)]">
                    {g.items.length} pieces, from <span className="tabular-nums">{formatINR(g.from)}</span>
                  </span>
                </span>
                <span className="hidden text-[14px] leading-snug text-[var(--o-ink-2)] md:block">{g.line}</span>
                <span className="grid size-11 place-items-center rounded-full border border-[var(--o-line)] transition-[background-color,color,transform,border-color] duration-300 group-hover:rotate-[-45deg] group-hover:border-[var(--o-ink)] group-hover:bg-[var(--o-ink)] group-hover:text-white md:size-12">
                  <ArrowIcon />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        {/* the way into the whole shop */}
        <Link
          href={SHOP}
          className="group mt-10 flex items-center gap-5 rounded-full bg-[var(--o-ink)] p-2 pr-3 text-white transition-colors hover:bg-black md:mt-14 md:gap-8 md:p-3 md:pr-4"
        >
          <span className="flex shrink-0">
            {all.slice(0, 4).map((p, i) => (
              <span key={p.slug} className={`relative size-12 overflow-hidden rounded-full border-2 border-[var(--o-ink)] md:size-16 ${i ? "-ml-6" : ""} ${i > 1 ? "hidden sm:block" : ""}`}>
                <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="64px" />
              </span>
            ))}
          </span>
          <span className={`${s.syne} min-w-0 flex-1 text-[17px] font-bold leading-tight tracking-[-0.02em] md:text-[clamp(1.4rem,2.2vw,2rem)]`}>
            All {all.length} {c.name.toLowerCase()} pieces
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-500 group-hover:rotate-[-45deg] md:size-16">
            <ArrowIcon className="size-5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

/** The ranges of the current wood, each one a way into the shop. Rendered in both woods; CSS shows one. */
export function CollectionIndex() {
  return (
    <section id="pieces" className="relative bg-[var(--o-bg)] px-5 pb-28 pt-24 md:px-10 md:pb-36 md:pt-32">
      <W red={<Index wood="red" />} white={<Index wood="white" />} />
    </section>
  );
}
