"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { CARE, EASE, FAMILY_PROFILE, keyDimension, partNo } from "./data";
import { sheet, useMedia } from "./store";

const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: () => (
    <div className={`${s.mono} grid h-full place-items-center text-[11px] text-(--steel)`}>Setting the work on the lathe</div>
  ),
});

const WOODS: Wood[] = ["red", "white"];

/** Product view: the lathe profile in 3D with a photo strip on the left, the specification on the right. */
export function ProductView({ slug }: { slug: string }) {
  const f = getFamily(slug)!;
  const wood = useWood();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [view, setView] = useState<number>(-1); // -1 = 3D, else photo index
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const shown = v ?? f.variants[other]!;
  const prof = FAMILY_PROFILE[f.slug];
  const cat = CATEGORIES.find((c) => c.key === f.category)!;
  const related = FAMILIES.filter((x) => x.slug !== f.slug && x.category === f.category);
  const more = [...related, ...FAMILIES.filter((x) => x.slug !== f.slug && x.category !== f.category)].slice(0, 4);
  const photo = view >= 0 ? shown.shots[Math.min(view, shown.shots.length - 1)] : null;

  return (
    <div className="px-4 pb-10 pt-[76px] md:px-8 md:pt-[92px]">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: viewer and photo strip */}
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-[76px]">
            <div className="relative aspect-[5/4] w-full border border-(--hair-2) bg-(--sheet) md:aspect-[4/3]">
              {/* Corner marks and axis, as on a drawing */}
              {["left-2 top-2 border-l border-t", "right-2 top-2 border-r border-t", "bottom-2 left-2 border-b border-l", "bottom-2 right-2 border-b border-r"].map((c) => (
                <span key={c} aria-hidden className={`absolute size-4 border-(--ink) ${c}`} />
              ))}
              <div className="absolute inset-0">
                <AnimatePresence initial={false} mode="wait">
                  {photo ? (
                    <motion.div
                      key={`p-${view}-${wood}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-6 overflow-hidden md:inset-10"
                    >
                      <Photo p={photo.photo} tone={photo.tone} sizes="(min-width:1024px) 55vw, 92vw" priority />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="3d"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-0 cursor-grab active:cursor-grabbing"
                    >
                      <ProductViewer shape={prof.key} reduced={reduced} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={`${s.mono} pointer-events-none absolute inset-x-5 top-4 flex justify-between text-[11px] text-(--steel)`}>
                <span>{photo ? "Photograph" : `Lathe profile: ${prof.label.toLowerCase()}`}</span>
                <span>{photo ? WOOD_NAMES[v ? wood : other].latin : "Drag to turn"}</span>
              </div>
              <div className={`${s.mono} pointer-events-none absolute inset-x-5 bottom-4 flex justify-between text-[11px] text-(--steel)`}>
                <span>{partNo(f.slug)}</span>
                <span>{keyDimension(f)}</span>
              </div>
            </div>

            {/* Strip */}
            <div className={`${s.noScrollbar} mt-3 flex gap-3 overflow-x-auto`} role="group" aria-label="Views">
              <button
                type="button"
                aria-pressed={view === -1}
                onClick={() => setView(-1)}
                className={`${s.mono} grid h-20 w-24 shrink-0 place-items-center border text-[11px] transition-colors md:h-24 md:w-28 ${
                  view === -1 ? "border-(--ink) bg-(--ink) text-(--paper)" : "border-(--hair-2) hover:border-(--ink) active:bg-[rgb(26_27_29/0.06)]"
                }`}
              >
                3D profile
              </button>
              {shown.shots.map((sh, i) => (
                <button
                  key={`${sh.photo.id}-${i}`}
                  type="button"
                  aria-pressed={view === i}
                  aria-label={`Photo ${i + 1}: ${sh.photo.alt}`}
                  onClick={() => setView(i)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden border-2 transition-colors md:h-24 md:w-28 ${
                    view === i ? "border-(--ink)" : "border-transparent hover:border-(--hair-2)"
                  }`}
                >
                  <Photo p={sh.photo} tone={sh.tone} sizes="112px" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: specification */}
        <div className="lg:col-span-5">
          <nav aria-label="Breadcrumb" className={`${s.mono} flex flex-wrap items-center gap-2 text-[11.5px] text-(--steel)`}>
            <Link href="/d/01#parts" className="transition-colors hover:text-(--ink)">
              Parts list
            </Link>
            <span aria-hidden>/</span>
            <span>{cat.label}</span>
            <span aria-hidden>/</span>
            <span className="text-(--ink)">{partNo(f.slug)}</span>
          </nav>
          <h1 className={`${s.x125} mt-5 text-[clamp(2.2rem,4.4vw,4rem)] font-[600] leading-[0.92] tracking-[-0.025em]`}>{f.name}</h1>
          {f.edition && <p className={`${s.mono} mt-3 text-[12px] text-(--m-accent)`}>{f.edition}</p>}
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.55] text-(--ink-2)">{f.summary}</p>

          {/* Price per wood */}
          <fieldset className="mt-8">
            <legend className={`${s.mono} text-[11px] text-(--steel)`}>Wood and price</legend>
            <div role="radiogroup" aria-label="Wood" className="mt-2 border-t border-(--ink)">
              {WOODS.map((w) => {
                const vv = f.variants[w];
                const on = wood === w;
                return (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    disabled={!vv}
                    onClick={() => !on && switchWood(w)}
                    className={`grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-(--hair-2) px-1 py-3.5 text-left transition-colors ${
                      vv ? "hover:bg-[rgb(26_27_29/0.03)] active:bg-[rgb(26_27_29/0.06)]" : "cursor-not-allowed opacity-50"
                    }`}
                  >
                    <span className={`grid size-5 place-items-center rounded-full border ${on ? "border-(--ink)" : "border-(--hair-2)"}`}>
                      {on && <span className={`size-3 rounded-full ${w === "red" ? "ring-red" : "ring-white"}`} />}
                    </span>
                    <span>
                      <span className="block text-[15px]">
                        <em className="italic">{WOOD_NAMES[w].latin}</em>
                      </span>
                      <span className={`${s.mono} block text-[11px] text-(--steel)`}>
                        {vv ? vv.note : "Not made in this wood"}
                      </span>
                    </span>
                    <span className={`${s.mono} text-[15px] tabular-nums`}>{vv ? formatINR(vv.price) : "—"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            {v ? (
              <button
                type="button"
                className={s.btn}
                onClick={() => {
                  bag.add(f.slug, wood);
                  sheet.open();
                }}
              >
                Add to bag, {formatINR(v.price)}
              </button>
            ) : (
              <button type="button" className={s.btn} onClick={() => switchWood(other)}>
                Switch to {other === "white" ? "Santalum" : "Pterocarpus"} to order
              </button>
            )}
            <span className="text-[13.5px] text-(--steel)">Delivery in India is complimentary.</span>
          </div>

          {/* Spec table */}
          <dl className="mt-12 border-t border-(--ink)">
            <Spec k="Part" v={partNo(f.slug)} />
            {f.details.map((d) => (
              <Spec key={d.label} k={d.label} v={d.value} />
            ))}
            <Spec k="Wood" v={v ? `${WOOD_NAMES[wood].latin}, ${WOOD_NAMES[wood].common.toLowerCase()}` : `${WOOD_NAMES[other].latin} only`} />
            <Spec k="Level" v={f.level} />
            <Spec k="Lathe profile" v={prof.label} />
          </dl>

          <div className="mt-10 space-y-4 text-[15.5px] leading-[1.65] text-(--ink-2)">
            {f.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-6 border-t border-(--hair-2) pt-6 sm:grid-cols-2">
            <div>
              <p className={`${s.mono} text-[11px] text-(--steel)`}>In this wood</p>
              <p className="mt-2 text-[15px] leading-[1.55]">{shown.note}</p>
            </div>
            <div>
              <p className={`${s.mono} text-[11px] text-(--steel)`}>Care</p>
              <p className="mt-2 text-[15px] leading-[1.55]">{CARE[f.category]}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Other parts */}
      <section className="mx-auto mt-24 max-w-[1400px]" aria-labelledby="more-parts">
        <div className="flex items-end justify-between gap-4 border-b border-(--ink) pb-3">
          <h2 id="more-parts" className={`${s.x110} text-[clamp(1.6rem,2.6vw,2.3rem)] font-[600] leading-none tracking-[-0.015em]`}>
            Other parts
          </h2>
          <Link href="/d/01#parts" className={s.link}>
            Full parts list
          </Link>
        </div>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-4">
          {more.map((x) => {
            const xv = x.variants[wood] ?? x.variants[other]!;
            return (
              <li key={x.slug} className="border-b border-(--hair) sm:odd:border-r lg:border-r lg:last:border-r-0">
                <Link href={`/d/01/p/${x.slug}`} className="group flex items-center gap-4 px-1 py-5 lg:px-5">
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                    <Photo p={xv.shots[0].photo} tone={xv.shots[0].tone} sizes="64px" className="transition-transform duration-500 group-hover:scale-110" />
                  </span>
                  <span className="min-w-0">
                    <span className={`${s.mono} block text-[11px] text-(--steel)`}>{partNo(x.slug)}</span>
                    <span className="block truncate text-[15px] font-[540] transition-colors group-hover:text-(--m-accent)">{x.name}</span>
                    <span className={`${s.mono} block text-[12px] tabular-nums`}>{formatINR(xv.price)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-4 border-b border-(--hair) py-2.5">
      <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>{k}</dt>
      <dd className={`${s.mono} text-[13px] leading-6`}>{v}</dd>
    </div>
  );
}
