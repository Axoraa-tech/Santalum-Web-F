"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { Photo } from "@/components/Photo";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, featured, formatINR, getProduct, priceLabel, priceOf, productsFor, type Product } from "@/lib/shop/products";
import { setWoodQuietly } from "@/lib/wood";
import { BadgeStamp, EditionTicks, WishToggle } from "./bits";
import { s } from "./cx";
import { DELIVERY_LINE, EASE, keyDimension, latheProfile, otherWoodPiece, partNo, RECORD_LINE, shotsOf } from "./data";
import { HeaderRating, Reviews } from "./Reviews";
import { openPiece } from "./SheetChange";
import { productRoute, sheet, useMedia } from "./store";

const ProductViewer = dynamic(() => import("./ProductViewer"), {
  ssr: false,
  loading: () => <div className={`${s.mono} grid h-full place-items-center text-[11px] text-(--steel)`}>Setting the work on the lathe</div>,
});

/** Product page: photographs and the lathe profile on the left, the specification and the order on the right. */
export function ProductView({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const c = CONTENT[p.wood];
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [view, setView] = useState(0); // photo index; -1 = the 3D lathe profile
  const [opt, setOpt] = useState(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const ids = useId();
  const prof = latheProfile(p);
  const cat = categoryOf(p);
  const price = priceOf(p, opt);
  const shots = shotsOf(p);
  const photo = view >= 0 ? shots[Math.min(view, shots.length - 1)] : null;
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;

  // The page belongs to its piece's wood; the switch, flipped here, goes to the counterpart.
  const nearest = otherWoodPiece(p);
  useEffect(() => {
    setWoodQuietly(p.wood);
    productRoute.set({ wood: p.wood, counterpart: nearest });
    return () => productRoute.set(null);
  }, [p.wood, nearest]);

  const pairs = pairsFor(p);

  return (
    <div className="px-4 pb-10 pt-[76px] md:px-8 md:pt-[92px]">
      <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: viewer and strip */}
        <div className="min-w-0 lg:col-span-7">
          <div className="lg:sticky lg:top-[76px]">
            <div className={`${s.corners} relative aspect-square w-full border border-(--hair-2) bg-(--sheet) sm:aspect-[5/4] md:aspect-[4/3]`}>
              <div className="absolute inset-0">
                <AnimatePresence initial={false} mode="wait">
                  {photo ? (
                    <motion.div
                      key={`p-${view}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="absolute inset-x-6 bottom-11 top-11 overflow-hidden md:inset-x-10 md:bottom-12 md:top-12"
                    >
                      <Photo p={photo.photo} tone={photo.tone} sizes="(min-width:1024px) 55vw, 92vw" priority={view === 0} />
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
                      <ProductViewer shape={prof.key} reduced={reduced} wood={p.wood} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className={`${s.mono} pointer-events-none absolute inset-x-5 top-4 flex justify-between gap-4 text-[11px] text-(--steel)`}>
                <span>{photo ? `Photograph ${view + 1} of ${shots.length}` : `Lathe profile: ${prof.label.toLowerCase()}`}</span>
                <span className="text-right">{photo ? c.latin : "Drag to turn"}</span>
              </div>
              <div className={`${s.mono} pointer-events-none absolute inset-x-5 bottom-4 flex justify-between gap-4 text-[11px] text-(--steel)`}>
                <span>{partNo(p.slug)}</span>
                <span className="truncate text-right">{keyDimension(p)}</span>
              </div>
            </div>

            <div className={`${s.noScrollbar} mt-3 flex gap-3 overflow-x-auto`} role="group" aria-label="Views">
              {shots.map((sh, i) => (
                <button
                  key={`${sh.photo.id}-${i}`}
                  type="button"
                  aria-pressed={view === i}
                  aria-label={`Photograph ${i + 1}: ${sh.photo.alt}`}
                  onClick={() => setView(i)}
                  className={`relative h-20 w-24 shrink-0 overflow-hidden border-2 transition-colors md:h-24 md:w-28 ${view === i ? "border-(--ink)" : "border-transparent hover:border-(--hair-2)"}`}
                >
                  <Photo p={sh.photo} tone={sh.tone} sizes="112px" />
                </button>
              ))}
              <button
                type="button"
                aria-pressed={view === -1}
                onClick={() => setView(-1)}
                className={`${s.mono} grid h-20 w-24 shrink-0 place-items-center border px-2 text-center text-[11px] leading-snug transition-colors md:h-24 md:w-28 ${
                  view === -1 ? "border-(--ink) bg-(--ink) text-(--paper)" : "border-(--hair-2) hover:border-(--ink) active:bg-(--wash-2)"
                }`}
              >
                Lathe profile, 3D
              </button>
            </div>
          </div>
        </div>

        {/* Right: the specification and the order */}
        <div className="min-w-0 lg:col-span-5">
          <nav aria-label="Breadcrumb" className={`${s.mono} flex flex-wrap items-center gap-2 text-[11.5px] text-(--steel)`}>
            <Link href="/d/01/shop" className="transition-colors hover:text-(--ink)">
              {p.wood === "red" ? "Parts catalogue" : "Lot catalogue"}
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/d/01/shop?c=${cat.id}`} className="transition-colors hover:text-(--ink)">
              {cat.label}
            </Link>
            <span aria-hidden>/</span>
            <span className="text-(--ink)">{partNo(p.slug)}</span>
          </nav>
          <div className="mt-5 flex items-start justify-between gap-4">
            <h1 className={`${s.x125} text-[clamp(2.1rem,4.2vw,3.8rem)] font-[600] leading-[0.94] tracking-[-0.025em]`}>{p.name}</h1>
            {p.badge && <BadgeStamp badge={p.badge} className="mt-2 shrink-0 text-[12px]!" />}
          </div>
          <p className="mt-3 flex items-center gap-2.5 text-[15px] text-(--ink-2)">
            <span aria-hidden className={`size-4 shrink-0 rounded-full ${p.wood === "red" ? "ring-red" : "ring-white"} shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]`} />
            {c.name}, <em className="italic">{c.latin}</em>
          </p>
          <div className="mt-3">
            <HeaderRating slug={p.slug} />
          </div>
          <p className="mt-5 max-w-[32rem] text-[17px] leading-[1.55] text-(--ink-2)">{p.short}</p>

          <p className={`${s.x110} mt-7 text-[30px] font-[600] tabular-nums leading-none`} aria-live="polite">
            {formatINR(price)}
            {p.options && <span className={`${s.mono} ml-3 align-middle text-[12px] font-normal text-(--steel)`}>{priceLabel(p)}</span>}
          </p>

          {/* Options */}
          {p.options && (
            <fieldset className="mt-6">
              <legend className={`${s.mono} text-[11px] text-(--steel)`}>{p.options.name}</legend>
              <div className="mt-2 border-t border-(--ink)">
                {p.options.values.map((v) => {
                  const on = (opt ?? p.options!.values[0].id) === v.id;
                  return (
                    <label
                      key={v.id}
                      className={`grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-(--hair-2) px-1 py-3 transition-colors hover:bg-(--wash) ${on ? "bg-(--wash)" : ""}`}
                    >
                      <input type="radio" name={`${ids}-opt`} value={v.id} checked={on} onChange={() => setOpt(v.id)} className="peer sr-only" />
                      <span className="grid size-5 place-items-center rounded-full border border-(--hair-2) peer-checked:border-(--ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)">
                        {on && <span className="size-2.5 rounded-full bg-(--accent)" />}
                      </span>
                      <span className="text-[15px]">{v.label}</span>
                      <span className={`${s.mono} text-[13px] tabular-nums`}>{formatINR(v.price)}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {/* Quantity and add */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            {/* Quantity as a counter on the machine: two keys and a number window */}
            <div className={`${s.mono} inline-grid h-[2.9rem] grid-cols-[2.4rem_auto_2.4rem] border border-(--ink) text-[14px]`} role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                disabled={qty <= 1}
                aria-label="One fewer"
                className="grid place-items-center transition-colors hover:bg-(--wash-2) active:bg-(--wash-3) disabled:cursor-not-allowed disabled:opacity-30"
              >
                −
              </button>
              <span className="flex flex-col items-center justify-center border-x border-(--ink) bg-(--sheet) px-3">
                <span className="text-[9px] leading-none text-(--steel)">Qty</span>
                <span className="mt-0.5 text-[16px] leading-none tabular-nums" aria-live="polite">
                  {String(qty).padStart(2, "0")}
                </span>
              </span>
              <button
                type="button"
                onClick={() => setQty((n) => Math.min(9, n + 1))}
                disabled={qty >= 9}
                aria-label="One more"
                className="grid place-items-center transition-colors hover:bg-(--wash-2) active:bg-(--wash-3) disabled:cursor-not-allowed disabled:opacity-30"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className={s.btn}
              onClick={() => {
                bag.add(p.slug, { option: opt, qty });
                sheet.open();
              }}
            >
              Add to bag, {formatINR(price * qty)}
            </button>
            <WishToggle p={p} />
          </div>

          <dl className="mt-7 grid gap-3 border-y border-(--hair-2) py-4 text-[14.5px] leading-[1.5]">
            <div className="grid grid-cols-[6.5rem_1fr] gap-3">
              <dt className={`${s.mono} text-[11px] leading-6 text-(--steel)`}>Delivery</dt>
              <dd>{DELIVERY_LINE}</dd>
            </div>
            <div className="grid grid-cols-[6.5rem_1fr] gap-3">
              <dt className={`${s.mono} text-[11px] leading-6 text-(--steel)`}>{p.wood === "red" ? "Batch record" : "Lot"}</dt>
              <dd>{RECORD_LINE[p.wood]}</dd>
            </div>
          </dl>

          {p.edition && (
            <div className="mt-6 border border-(--hair-2) bg-(--sheet) p-4">
              <p className={`${s.mono} text-[11px] text-(--steel)`}>Edition of {p.edition.size}, numbered</p>
              <EditionTicks size={p.edition.size} left={p.edition.left} className="mt-3" />
            </div>
          )}

          {/* Spec table */}
          <dl className="mt-10 border-t border-(--ink)">
            <Spec k="Part" v={partNo(p.slug)} />
            {p.details.map((d) => (
              <Spec key={d.label} k={d.label} v={d.value} />
            ))}
            <Spec k="Wood" v={`${c.latin}, ${c.name.toLowerCase()}`} />
            <Spec k="Drawer" v={cat.label} />
            <Spec k="Lathe profile" v={prof.label} />
          </dl>

          <div className="mt-10 space-y-4 text-[16px] leading-[1.65] text-(--ink-2)">
            {p.story.map((t) => (
              <p key={t}>{t}</p>
            ))}
          </div>

          <div className="mt-10 grid gap-6 border-t border-(--hair-2) pt-6 sm:grid-cols-2">
            <div>
              <p className={`${s.mono} text-[11px] text-(--steel)`}>Care</p>
              <p className="mt-2 text-[15px] leading-[1.55]">{p.care}</p>
            </div>
            <div>
              <p className={`${s.mono} text-[11px] text-(--steel)`}>{p.wood === "red" ? "The wood" : "The heartwood"}</p>
              <p className="mt-2 text-[15px] leading-[1.55]">{c.oneLine}</p>
            </div>
          </div>
        </div>
      </div>

      <Reviews p={p} />

      {/* Counterpart and pairs */}
      <section className="mx-auto mt-24 max-w-[1400px]" aria-labelledby={`${ids}-pairs`}>
        {counterpart && (
          <Link
            href={`/d/01/p/${counterpart.slug}`}
            onClick={(e) => openPiece(e, counterpart.slug)}
            className="group mb-12 grid items-center gap-5 border border-(--ink) bg-(--sheet) p-4 transition-colors hover:bg-(--wash) active:bg-(--wash-2) sm:grid-cols-[auto_1fr_auto] md:p-5"
          >
            <span className="flex items-center gap-4">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                <Photo p={shotsOf(counterpart)[0].photo} tone={shotsOf(counterpart)[0].tone} sizes="64px" />
              </span>
              <span aria-hidden className={`size-5 shrink-0 rounded-full ${counterpart.wood === "red" ? "ring-red" : "ring-white"} shadow-[inset_0_0_0_1px_rgb(0_0_0/0.15)]`} />
            </span>
            <span>
              <span className={`${s.mono} block text-[11px] text-(--steel)`}>Also in {CONTENT[counterpart.wood].name.toLowerCase()}</span>
              <span className={`${s.x110} mt-1 block text-[21px] font-[600] leading-tight`}>{counterpart.name}</span>
              <span className="mt-1 block text-[14.5px] text-(--ink-2)">{counterpart.short}</span>
            </span>
            <span className={`${s.mono} flex items-center gap-3 text-[13px] tabular-nums`}>
              {priceLabel(counterpart)}
              <svg width="34" height="10" viewBox="0 0 34 10" aria-hidden className="transition-transform duration-500 group-hover:translate-x-1">
                <path d="M0 5 H32 M27 1 L32 5 L27 9" fill="none" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </span>
          </Link>
        )}
        <div className="flex items-end justify-between gap-4 border-b border-(--ink) pb-3">
          <h2 id={`${ids}-pairs`} className={`${s.x110} text-[clamp(1.6rem,2.6vw,2.3rem)] font-[600] leading-none tracking-[-0.015em]`}>
            Pairs with
          </h2>
          <Link href="/d/01/shop" className={s.link}>
            All {productsFor(p.wood).length} {c.name.toLowerCase()} pieces
          </Link>
        </div>
        <ul className="grid sm:grid-cols-3">
          {pairs.map((x) => (
            <li key={x.slug} className="border-b border-(--hair) sm:border-r sm:last:border-r-0">
              <Link href={`/d/01/p/${x.slug}`} className="group flex items-center gap-4 px-1 py-5 transition-colors hover:bg-(--wash) sm:px-5">
                <span className="relative size-16 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                  <Photo p={shotsOf(x)[0].photo} tone={shotsOf(x)[0].tone} sizes="64px" className="transition-transform duration-500 group-hover:scale-110" />
                </span>
                <span className="min-w-0">
                  <span className={`${s.mono} block text-[11px] text-(--steel)`}>{partNo(x.slug)}</span>
                  <span className="block truncate text-[15.5px] font-[540] transition-colors group-hover:text-(--accent)">{x.name}</span>
                  <span className={`${s.mono} block text-[12px] tabular-nums`}>{priceLabel(x)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Three pieces from the same wood: the same drawer first, then the featured ones. */
function pairsFor(p: Product) {
  const same = productsFor(p.wood).filter((x) => x.slug !== p.slug && x.category === p.category);
  const feat = featured(p.wood).filter((x) => x.slug !== p.slug && x.category !== p.category);
  return [...same.slice(0, 2), ...feat, ...same.slice(2)].slice(0, 3);
}

function Spec({ k, v }: { k: string; v: string }) {
  return (
    <div className="grid grid-cols-[8.5rem_1fr] gap-4 border-b border-(--hair) py-2.5 md:grid-cols-[9rem_1fr]">
      <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>{k}</dt>
      <dd className={`${s.mono} text-[13px] leading-6`}>{v}</dd>
    </div>
  );
}
