"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, WOOD_NAMES, formatINR, getFamily } from "@/lib/catalog";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { HOME, LEVEL_LINE, WOOD_LABEL, careFor, splitName } from "./copy";
import { s } from "./cls";
import { AddButton, ArrowIcon, Swatch } from "./ui";

/**
 * The full page for one piece. The photo starts as a circle (a disc from the ring) and,
 * as you scroll, grows and un-masks into a rounded rectangle.
 */
export function ProductView({ slug }: { slug: string }) {
  const family = getFamily(slug)!;
  const wood = useWood();
  const reduced = !!useReducedMotion();
  const other: Wood = wood === "red" ? "white" : "red";
  const v = family.variants[wood];
  const shown = v ?? family.variants[other]!;
  const [shotIdx, setShotIdx] = useState(0);
  const shot = shown.shots[Math.min(shotIdx, shown.shots.length - 1)];
  const [name, sub] = splitName(family.name);
  const longest = Math.max(...name.split(" ").map((w) => w.length));
  const cat = CATEGORIES.find((c) => c.key === family.category)!;

  const boxRef = useRef<HTMLDivElement>(null);
  const w = useMotionValue(560);
  const h = useMotionValue(700);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      w.set(e.contentRect.width);
      h.set(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, 520], [0, 1], { clamp: true });
  const clip = useTransform(() => {
    const t = reduced ? 1 : p.get();
    const W = w.get();
    const H = h.get();
    const d = Math.min(W, H) * 0.86;
    const ix = ((W - d) / 2) * (1 - t);
    const iy = ((H - d) / 2) * (1 - t);
    const r = d / 2 + (28 - d / 2) * t;
    return `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${r.toFixed(1)}px)`;
  });
  const imgScale = useTransform(p, [0, 1], [1.16, 1]);
  const ringOpacity = useTransform(p, [0, 0.4], [1, 0]);
  const ringScale = useTransform(p, [0, 0.4], [1, 1.15]);

  return (
    <article className="px-5 pb-10 pt-28 md:px-10 md:pt-32">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <div ref={boxRef} className="relative aspect-[4/5] w-full lg:aspect-auto lg:h-[calc(100svh-150px)] lg:min-h-[520px]">
              <motion.div className="absolute inset-0 overflow-hidden bg-[var(--o-floor)]" style={{ clipPath: clip }}>
                <motion.div className="absolute inset-0" style={{ scale: reduced ? 1 : imgScale }}>
                  <AnimatePresence initial={false}>
                    <motion.div key={shot.photo.id + wood} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                      <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 1024px) 58vw, 100vw" priority />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              {/* orbit line around the disc, gone once the photo opens out */}
              <motion.div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center" style={{ opacity: ringOpacity, scale: ringScale }}>
                <svg viewBox="0 0 100 100" className={`aspect-square h-auto w-[min(100%,calc((100svh-150px)))] max-h-full ${s.spinSlow}`}>
                  <circle cx="50" cy="50" r="48.6" fill="none" stroke="var(--o-ink)" strokeWidth="0.15" strokeDasharray="0.6 1.6" />
                  <circle cx="50" cy="1.4" r="0.9" fill="var(--m-accent)" />
                </svg>
              </motion.div>
              {shown.shots.length > 1 && (
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full bg-[var(--o-bg)]/85 p-1.5 backdrop-blur-md">
                  {shown.shots.map((sh, i) => (
                    <button
                      key={sh.photo.id + i}
                      type="button"
                      onClick={() => setShotIdx(i)}
                      aria-label={`Show photo ${i + 1}: ${sh.photo.alt}`}
                      aria-pressed={i === shotIdx}
                      className={`relative size-14 overflow-hidden rounded-full bg-[var(--o-floor)] transition-[box-shadow,transform] duration-300 hover:scale-105 ${
                        i === shotIdx ? "shadow-[0_0_0_2px_var(--o-bg),0_0_0_4px_var(--m-accent)]" : ""
                      }`}
                    >
                      <Photo p={sh.photo} tone={sh.tone} sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pt-6">
          <Link href={`${HOME}#ring`} className="group inline-flex items-center gap-2 text-[14px] text-[var(--o-muted)] transition-colors hover:text-[var(--o-ink)]">
            <ArrowIcon dir="left" className="size-4 transition-transform group-hover:-translate-x-0.5" />
            Back to the ring
          </Link>
          <p className="mt-8 text-[14px] text-[var(--o-muted)]">
            {cat.label}. {LEVEL_LINE[family.level]}
            {family.edition ? `, ${family.edition.toLowerCase()}` : ""}.
          </p>
          <h1
            className={`${s.display} mt-3 text-[length:var(--fm)] lg:text-[length:var(--fd)]`}
            style={{ "--fm": `min(16vw, ${(86 / (longest * 0.86)).toFixed(2)}vw)`, "--fd": `min(5.6rem, ${(36 / (longest * 0.86)).toFixed(2)}vw)` } as React.CSSProperties}
          >
            {name}
          </h1>
          {sub && <p className={`${s.syne} mt-3 text-[22px] font-semibold text-[var(--o-ink-2)]`}>{sub}</p>}

          <p className="mt-6 text-[18px] leading-relaxed">{family.summary}</p>

          {/* price per wood and the choice */}
          <fieldset className="mt-8">
            <legend className="mb-3 text-[14px] font-semibold">Choose the wood</legend>
            <div className="grid grid-cols-2 gap-3">
              {(["red", "white"] as Wood[]).map((wd) => {
                const vv = family.variants[wd];
                const on = wd === wood;
                return (
                  <button
                    key={wd}
                    type="button"
                    aria-pressed={on}
                    onClick={() => switchWood(wd)}
                    className={`flex items-center gap-3 rounded-[28px] border p-2.5 pr-4 text-left transition-colors duration-300 ${
                      on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] hover:border-[var(--o-ink)]"
                    }`}
                  >
                    <Swatch wood={wd} className="size-12" />
                    <span className="min-w-0 leading-tight">
                      <span className="block text-[15px] font-semibold">{WOOD_LABEL[wd]}</span>
                      <span className={`mt-0.5 block text-[14px] tabular-nums ${on ? "text-white/75" : "text-[var(--o-muted)]"}`}>{vv ? formatINR(vv.price) : "Not made in this wood"}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-6 rounded-[28px] bg-[var(--o-stone)] p-5">
            {v ? (
              <>
                <div className="flex items-baseline justify-between gap-4">
                  <p className={`${s.syne} text-[34px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(v.price)}</p>
                  <p className="text-right text-[14px] text-[var(--o-muted)]">{WOOD_LABEL[wood]}</p>
                </div>
                <p className="mt-1 text-[15px] text-[var(--o-ink-2)]">{v.note}</p>
              </>
            ) : (
              <p className="text-[15px] leading-relaxed text-[var(--o-ink-2)]">
                {family.name} is made only in {WOOD_LABEL[other].toLowerCase()}: {WOOD_NAMES[other].latin}. Red sandalwood does not carry the oil.
              </p>
            )}
            <AddButton family={family} className="mt-5 w-full" />
          </div>

          <div className="mt-12 space-y-4 text-[16px] leading-relaxed text-[var(--o-ink-2)]">
            {family.story.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <h2 className={`${s.syne} mt-12 text-[18px] font-bold`}>Details</h2>
          <dl className="mt-3 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
            <div className="flex justify-between gap-6 py-3 text-[15px]">
              <dt className="text-[var(--o-muted)]">Wood</dt>
              <dd className="text-right font-medium">
                {WOOD_NAMES[v ? wood : other].latin}, {WOOD_NAMES[v ? wood : other].origin}
              </dd>
            </div>
            {family.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-[var(--o-muted)]">{d.label}</dt>
                <dd className="text-right font-medium">{d.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className={`${s.syne} mt-10 text-[18px] font-bold`}>Care</h2>
          <ul className="mt-3 space-y-2 text-[15px] text-[var(--o-ink-2)]">
            {careFor(family).map((c) => (
              <li key={c} className="flex gap-3">
                <span aria-hidden className="mt-[9px] size-1.5 shrink-0 rounded-full bg-[var(--m-accent)]" />
                {c}
              </li>
            ))}
          </ul>
          <p className="mt-10 text-[14px] text-[var(--o-muted)]">Every piece leaves with its batch record. Delivered across India.</p>
        </div>
      </div>
    </article>
  );
}
