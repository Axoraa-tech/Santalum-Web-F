"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, priceLabel, productsFor, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { AddOrChoose, BadgeStamp } from "./bits";
import { s } from "./cx";
import { EASE, keyDimension, partNo, shotsOf } from "./data";
import { CentreMark, DimH } from "./Dim";
import { RatingLine } from "./Stars";

const COPY: Record<Wood, { title: string; lede: string; drawers: string }> = {
  red: {
    title: "Parts list",
    lede: "Eight of the twenty-six pieces we turn and carve in red sandalwood, each with the one measurement that matters for it. The rest are in the catalogue, drawer by drawer.",
    drawers: "Drawers in the red catalogue",
  },
  white: {
    title: "Lot list",
    lede: "Eight of the twenty-six things we make from white heartwood: oil, attar, chandan, beads and Mysuru carving. Every one carries its lot number. The rest are in the catalogue.",
    drawers: "Drawers in the white catalogue",
  },
};

/** The featured pieces as a parts list: a technical table, with the hovered part drawn large beside it. */
export function PartsList() {
  return (
    <section id="parts" className="relative scroll-mt-14 border-t border-(--hair) bg-(--paper) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <W red={<Parts wood="red" />} white={<Parts wood="white" />} />
      </div>
    </section>
  );
}

function Parts({ wood }: { wood: Wood }) {
  const list = featured(wood, 8);
  const all = productsFor(wood);
  const [picked, setPicked] = useState<string | null>(null);
  const sel = list.find((p) => p.slug === picked) ?? list[0];
  const c = COPY[wood];

  return (
    <>
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em] md:col-span-6`}>{c.title}</h2>
        <p className="max-w-[30rem] text-[16px] leading-[1.6] text-(--ink-2) md:col-span-6 md:justify-self-end md:text-[17px]">{c.lede}</p>
      </div>

      {/* Category drawers: each opens the catalogue at that drawer. */}
      <nav aria-label={c.drawers} className="mt-10 md:mt-14">
        <ul className={`${s.noScrollbar} -mx-4 flex overflow-x-auto border-y border-(--ink) px-4 md:mx-0 md:grid md:px-0`} style={{ gridTemplateColumns: `repeat(${CATEGORIES[wood].length}, minmax(0, 1fr))` }}>
          {CATEGORIES[wood].map((cat, i) => {
            const n = all.filter((p) => p.category === cat.id).length;
            return (
              <li key={cat.id} className={`min-w-[11.5rem] shrink-0 md:min-w-0 ${i > 0 ? "border-l border-(--hair-2)" : ""}`}>
                <Link href={`/d/01/shop?c=${cat.id}`} className="group flex h-full flex-col gap-2 px-4 py-4 transition-colors hover:bg-(--wash) active:bg-(--wash-2) md:px-5">
                  <span className={`${s.mono} flex items-center justify-between text-[11px] text-(--steel)`}>
                    <span>Drawer {String.fromCharCode(65 + i)}</span>
                    <span className="tabular-nums">{n}</span>
                  </span>
                  <span className={`${s.x110} text-[17px] font-[600] leading-tight transition-colors group-hover:text-(--accent)`}>{cat.label}</span>
                  <span aria-hidden className="mx-auto mt-auto h-[5px] w-10 rounded-full border border-(--hair-2) transition-[width,border-color] duration-500 group-hover:w-14 group-hover:border-(--ink)" />
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
        {/* The part, drawn */}
        <div className="hidden lg:col-span-5 lg:block">
          <div className="sticky top-24">{sel && <PartDrawing p={sel} />}</div>
        </div>

        {/* The table */}
        <div className="lg:col-span-7">
          <div className={`${s.mono} grid grid-cols-[3.2rem_1fr_auto] gap-3 border-b border-(--ink) pb-2 text-[10.5px] text-(--steel) md:grid-cols-[3.4rem_1fr_9.5rem_6.5rem_7.2rem]`}>
            <span>Part</span>
            <span>Item</span>
            <span className="hidden md:block">Key dimension</span>
            <span className="text-right">Price</span>
            <span className="hidden text-right md:block">Action</span>
          </div>
          <ul>
            {list.map((p) => (
              <PartRow key={p.slug} p={p} selected={sel?.slug === p.slug} onPick={() => setPicked(p.slug)} />
            ))}
          </ul>
          <Link
            href="/d/01/shop"
            className="group mt-8 flex items-center justify-between gap-6 border border-(--ink) bg-(--sheet) px-5 py-5 transition-colors hover:bg-(--ink) hover:text-(--paper) active:scale-[0.995] md:px-7"
          >
            <span>
              <span className={`${s.mono} block text-[11px] text-(--steel) transition-colors group-hover:text-(--paper)/70`}>
                Sheet {wood === "red" ? "A" : "B"}, complete
              </span>
              <span className={`${s.x110} mt-1 block text-[clamp(1.3rem,2.2vw,1.8rem)] font-[600] leading-tight`}>
                All {all.length} {CONTENT[wood].name.toLowerCase()} pieces
              </span>
            </span>
            <svg width="64" height="14" viewBox="0 0 64 14" aria-hidden className="shrink-0 transition-transform duration-500 group-hover:translate-x-1">
              <path d="M0 7 H60 M53 2 L60 7 L53 12" fill="none" stroke="currentColor" strokeWidth="1.3" />
              <path d="M0 3 V11" stroke="currentColor" strokeWidth="1" opacity="0.6" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

function PartRow({ p, selected, onPick }: { p: Product; selected: boolean; onPick: () => void }) {
  const shot = shotsOf(p)[0];
  return (
    <li
      onPointerEnter={onPick}
      onFocusCapture={onPick}
      className={`group relative grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 border-b border-(--hair) py-3.5 md:grid-cols-[3.4rem_1fr_9.5rem_6.5rem_7.2rem] ${
        selected ? "bg-(--wash)" : ""
      }`}
    >
      <span aria-hidden className={`absolute -left-3 top-0 h-full w-[2px] origin-top bg-(--accent) transition-transform duration-500 ${selected ? "scale-y-100" : "scale-y-0"}`} />
      <span className={`${s.mono} text-[11.5px] tabular-nums text-(--steel)`}>{partNo(p.slug)}</span>
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-(--paper-2) md:size-14">
          <Photo p={shot.photo} tone={shot.tone} sizes="56px" className="transition-transform duration-500 group-hover:scale-110" />
        </span>
        <div className="min-w-0">
          <Link href={`/d/01/p/${p.slug}`} className="block text-[15.5px] font-[540] leading-snug transition-colors hover:text-(--accent)">
            {p.name}
          </Link>
          <p className="hidden text-[13px] leading-snug text-(--steel) md:line-clamp-1">{p.short}</p>
          <RatingLine slug={p.slug} className="mt-1" />
          <p className={`${s.mono} mt-0.5 text-[11px] text-(--ink-2) md:hidden`}>{keyDimension(p)}</p>
          {p.badge && <BadgeStamp badge={p.badge} className="mt-2 md:hidden" />}
        </div>
      </div>
      <span className={`${s.mono} hidden pr-2 text-[12px] leading-[1.4] text-(--ink-2) md:block`}>{keyDimension(p)}</span>
      <span className={`${s.mono} text-right text-[13px] tabular-nums`}>{priceLabel(p)}</span>
      <div className="col-span-3 flex items-center justify-end gap-4 md:col-span-1">
        <Link href={`/d/01/p/${p.slug}`} className={s.link} aria-label={`View ${p.name}`}>
          View
        </Link>
        <AddOrChoose p={p} />
      </div>
    </li>
  );
}

function PartDrawing({ p }: { p: Product }) {
  const shot = shotsOf(p)[0];
  return (
    <figure className="relative">
      <div className="relative mx-auto aspect-square w-[min(100%,440px)] pt-2">
        <div className="relative size-full">
          <AnimatePresence initial={false}>
            <motion.div
              key={p.slug}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 overflow-hidden rounded-full bg-(--paper-2)"
            >
              <Photo p={shot.photo} tone={shot.tone} sizes="440px" />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--hair-2)]" />
          <CentreMark className="inset-0 size-full text-white/70 mix-blend-difference" />
          <DimH label={keyDimension(p)} className="-top-7 left-0 right-0" />
          {p.badge && <BadgeStamp badge={p.badge} className="absolute bottom-[8%] right-[6%] bg-(--paper) text-[12px]!" />}
        </div>
      </div>
      <figcaption className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 border-t border-(--ink) pt-4">
        <span className={`${s.mono} text-[11px] text-(--steel)`}>{partNo(p.slug)}</span>
        <div>
          <p className={`${s.x110} text-[22px] font-[600] leading-tight tracking-[-0.01em]`}>{p.name}</p>
          <p className="mt-1 text-[15px] text-(--ink-2)">{p.short}</p>
          <RatingLine slug={p.slug} className="mt-2" />
          <dl className={`${s.mono} mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12px]`}>
            {p.details.slice(0, 3).map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-(--steel)">{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
            {p.edition && (
              <>
                <dt className="text-(--steel)">Edition</dt>
                <dd>
                  {p.edition.left} of {p.edition.size} left
                </dd>
              </>
            )}
          </dl>
        </div>
      </figcaption>
    </figure>
  );
}
