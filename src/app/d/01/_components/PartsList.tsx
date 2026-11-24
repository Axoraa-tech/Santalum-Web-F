"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, WOOD_NAMES, type CategoryKey, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { EASE, keyDimension, partNo } from "./data";
import { CentreMark, DimH } from "./Dim";
import { filterStore, sheet, useStore } from "./store";

const SEGMENTS: { key: CategoryKey | "all"; label: string }[] = [{ key: "all", label: "All" }, ...CATEGORIES.map((c) => ({ key: c.key, label: c.label }))];

/** The collection as a parts list: a technical table, with the hovered part drawn large beside it. */
export function PartsList() {
  const wood = useWood();
  const filter = useStore(filterStore, "all");
  const [picked, setPicked] = useState<string | null>(null);

  const inWood = FAMILIES.filter((f) => f.variants[wood]);
  const shown = inWood.filter((f) => filter === "all" || f.category === filter);
  const missing = FAMILIES.filter((f) => !f.variants[wood] && (filter === "all" || f.category === filter));
  const sel = shown.find((f) => f.slug === picked) ?? shown[0] ?? inWood[0];
  const cat = CATEGORIES.find((c) => c.key === filter);

  return (
    <section id="parts" className="relative scroll-mt-14 border-t border-(--hair) bg-(--paper) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em] md:col-span-6`}>
            Parts list
          </h2>
          <p className="max-w-[30rem] text-[16px] leading-[1.6] text-(--ink-2) md:col-span-6 md:justify-self-end md:text-[17px]">
            Every piece we make in {WOOD_NAMES[wood].common.toLowerCase()}, with the one measurement that matters for it.
            {cat ? ` ${cat.line}` : ""}
          </p>
        </div>

        {/* Mono segmented control */}
        <div className={`${s.noScrollbar} -mx-4 mt-10 overflow-x-auto px-4 md:mx-0 md:mt-14 md:px-0`}>
          <div role="group" aria-label="Filter by category" className={`${s.mono} inline-flex border border-(--ink) p-[3px] text-[12px]`}>
            <LayoutGroup id="seg">
              {SEGMENTS.map((g) => {
                const on = filter === g.key;
                const n = g.key === "all" ? inWood.length : inWood.filter((f) => f.category === g.key).length;
                return (
                  <button
                    key={g.key}
                    type="button"
                    aria-pressed={on}
                    onClick={() => {
                      filterStore.set(g.key);
                      setPicked(null);
                    }}
                    className={`relative flex h-9 items-center gap-2 whitespace-nowrap px-3.5 transition-colors ${
                      on ? "text-(--paper)" : "text-(--ink) hover:bg-[rgb(26_27_29/0.06)] active:bg-[rgb(26_27_29/0.1)]"
                    }`}
                  >
                    {on && <motion.span layoutId="seg-on" className="absolute inset-0 bg-(--ink)" transition={{ duration: 0.45, ease: EASE }} />}
                    <span className="relative">{g.label}</span>
                    <span className={`relative tabular-nums ${on ? "text-white/60" : "text-(--steel)"}`}>{n}</span>
                  </button>
                );
              })}
            </LayoutGroup>
          </div>
        </div>

        <div className="mt-10 grid gap-10 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          {/* The part, drawn */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24">{sel && <PartDrawing family={sel} wood={wood} />}</div>
          </div>

          {/* The table */}
          <div className="lg:col-span-7">
            <div className={`${s.mono} grid grid-cols-[3.2rem_1fr_auto] gap-3 border-b border-(--ink) pb-2 text-[10.5px] text-(--steel) md:grid-cols-[3.4rem_1fr_11.5rem_5rem_7.2rem]`}>
              <span>Part</span>
              <span>Item</span>
              <span className="hidden md:block">Key dimension</span>
              <span className="text-right">Price</span>
              <span className="hidden text-right md:block">Action</span>
            </div>
            <ul>
              <AnimatePresence initial={false}>
                {shown.map((f) => (
                  <PartRow
                    key={f.slug}
                    family={f}
                    wood={wood}
                    selected={sel?.slug === f.slug}
                    onPick={() => setPicked(f.slug)}
                  />
                ))}
              </AnimatePresence>
            </ul>
            {missing.map((f) => (
              <div key={f.slug} className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-(--hair-2) py-4">
                <p className="text-[14px] text-(--ink-2)">
                  <span className={`${s.mono} mr-3 text-[11px] text-(--steel)`}>{partNo(f.slug)}</span>
                  {f.name} is made in {WOOD_NAMES[wood === "red" ? "white" : "red"].common.toLowerCase()} only.
                </p>
                <button type="button" onClick={() => switchWood(wood === "red" ? "white" : "red")} className={s.link}>
                  Switch to {wood === "red" ? "Santalum" : "Pterocarpus"}
                </button>
              </div>
            ))}
            {shown.length === 0 && (
              <p className="py-10 text-[15px] text-(--ink-2)">Nothing in this category is made in this wood yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function PartRow({ family: f, wood, selected, onPick }: { family: Family; wood: Wood; selected: boolean; onPick: () => void }) {
  const v = f.variants[wood]!;
  const shot = v.shots[0];
  return (
    <motion.li
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: EASE }}
      onPointerEnter={onPick}
      onFocusCapture={onPick}
      className={`group relative grid grid-cols-[3.2rem_1fr_auto] items-center gap-3 border-b border-(--hair) py-3.5 md:grid-cols-[3.4rem_1fr_11.5rem_5rem_7.2rem] ${
        selected ? "bg-[rgb(26_27_29/0.03)]" : ""
      }`}
    >
      <span
        aria-hidden
        className={`absolute -left-3 top-0 h-full w-[2px] origin-top bg-(--m-accent) transition-transform duration-500 ${selected ? "scale-y-100" : "scale-y-0"}`}
      />
      <span className={`${s.mono} text-[11.5px] tabular-nums text-(--steel)`}>{partNo(f.slug)}</span>
      <div className="flex min-w-0 items-center gap-3.5">
        <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-(--paper-2) md:size-14">
          <Photo p={shot.photo} tone={shot.tone} sizes="56px" className="transition-transform duration-500 group-hover:scale-110" />
        </span>
        <div className="min-w-0">
          <Link href={`/d/01/p/${f.slug}`} className="block truncate text-[15.5px] font-[540] transition-colors hover:text-(--m-accent)">
            {f.name}
          </Link>
          <p className="line-clamp-1 text-[13px] text-(--steel)">
            {f.edition ? `${f.edition}. ` : ""}
            {f.summary}
          </p>
          <p className={`${s.mono} mt-0.5 text-[11px] text-(--ink-2) md:hidden`}>{keyDimension(f)}</p>
        </div>
      </div>
      <span className={`${s.mono} hidden text-[12px] text-(--ink-2) md:block`}>{keyDimension(f)}</span>
      <span className={`${s.mono} text-right text-[13px] tabular-nums`}>{formatINR(v.price)}</span>
      <div className="col-span-3 flex items-center justify-end gap-4 md:col-span-1">
        <Link href={`/d/01/p/${f.slug}`} className={s.link} aria-label={`View ${f.name}`}>
          View
        </Link>
        <button
          type="button"
          onClick={() => {
            bag.add(f.slug, wood);
            sheet.open();
          }}
          aria-label={`Add ${f.name} to bag`}
          className={`${s.mono} grid h-8 place-items-center rounded-full border border-(--hair-2) px-3 text-[12px] transition-colors hover:border-(--ink) hover:bg-(--ink) hover:text-(--paper) active:scale-95`}
        >
          Add
        </button>
      </div>
    </motion.li>
  );
}

function PartDrawing({ family: f, wood }: { family: Family; wood: Wood }) {
  const v = f.variants[wood]!;
  const shot = v.shots[0];
  return (
    <figure className="relative">
      <div className="relative mx-auto aspect-square w-[min(100%,440px)] pt-2">
        <div className="relative size-full">
          <AnimatePresence initial={false}>
            <motion.div
              key={`${f.slug}-${wood}`}
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-0 overflow-hidden rounded-full bg-(--paper-2)"
            >
              <Photo p={shot.photo} tone={shot.tone} sizes="440px" />
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgb(26_27_29/0.25)]" />
          <CentreMark className="inset-0 size-full text-white/70 mix-blend-difference" />
          <DimH label={keyDimension(f)} className="-top-7 left-0 right-0" />
        </div>
      </div>
      <figcaption className="mt-8 grid grid-cols-[auto_1fr] gap-x-6 border-t border-(--ink) pt-4">
        <span className={`${s.mono} text-[11px] text-(--steel)`}>{partNo(f.slug)}</span>
        <div>
          <p className={`${s.x110} text-[22px] font-[600] leading-tight tracking-[-0.01em]`}>{f.name}</p>
          <p className="mt-1 text-[14px] text-(--ink-2)">{v.note}</p>
          <dl className={`${s.mono} mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-[12px]`}>
            {f.details.slice(0, 3).map((d) => (
              <div key={d.label} className="contents">
                <dt className="text-(--steel)">{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
            <dt className="text-(--steel)">Level</dt>
            <dd>{f.level}</dd>
          </dl>
        </div>
      </figcaption>
    </figure>
  );
}
