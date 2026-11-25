"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, PRICE_BANDS, SORTS, categoryOf, priceLabel, productsFor, queryProducts, type CategoryId, type Product, type SortKey } from "@/lib/shop/products";
import { setWoodQuietly, type Wood } from "@/lib/wood";
import { AddOrChoose, BadgeStamp, WishToggle } from "./bits";
import { s } from "./cx";
import { EASE, keyDimension, partNo, shotsOf } from "./data";
import { CentreMark, DimH } from "./Dim";
import { Tick } from "./forms";
import { RatingLine } from "./Stars";
import { useFlipWood } from "./WoodSwitch";

const PAGE = 12;

const OTHER: Record<Wood, { sheet: string; line: string; cta: string }> = {
  red: {
    sheet: "Sheet B, Santalum album",
    line: "The fragrant one: heartwood oil, attar, chandan, incense and Mysuru carving, with the lot on every label.",
    cta: "Open the white sandalwood catalogue",
  },
  white: {
    sheet: "Sheet A, Pterocarpus santalinus",
    line: "The dense one: beads, turned objects, jewellery and the 2011 Vault, each with its batch record.",
    cta: "Open the red sandalwood catalogue",
  },
};

/** Placeholder while the URL is read: the catalogue's frame, drawn empty. */
export function ShopSkeleton() {
  return (
    <div aria-hidden className="grid gap-8 lg:grid-cols-[16.5rem_1fr] lg:gap-10">
      <div className="hidden border-t border-(--ink) lg:block">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-12 border-b border-(--hair)" />
        ))}
      </div>
      <div>
        <div className="h-16 border-b border-(--hair-2)" />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`${s.corners} aspect-[4/5] border border-(--hair-2) bg-(--sheet)`} />
          ))}
        </div>
      </div>
    </div>
  );
}

/** One wood's catalogue: drawers (categories), search, sort, price bands, editions, the parts and "Show more". */
export function ShopView({ wood }: { wood: Wood }) {
  const params = useSearchParams();
  const cParam = params.get("c");
  const other: Wood = wood === "red" ? "white" : "red";
  const cats = CATEGORIES[wood];
  const category: CategoryId | "all" = cats.some((c) => c.id === cParam) ? (cParam as CategoryId) : "all";
  const foreign = !!cParam && CATEGORIES[other].some((c) => c.id === cParam);

  // A deep link to a drawer of the other wood opens that wood.
  useEffect(() => {
    if (foreign) setWoodQuietly(other);
  }, [foreign, other]);

  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [editions, setEditions] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const flip = useFlipWood();
  const ids = useId();

  const all = productsFor(wood);
  const list = queryProducts(wood, { category, q, sort, band, editionsOnly: editions });
  const visible = list.slice(0, shown);
  const noun = wood === "red" ? "part" : "piece";
  const cat = cats.find((c) => c.id === category);

  const setCategory = (id: CategoryId | "all") => {
    window.history.replaceState(null, "", id === "all" ? "/d/01/shop" : `/d/01/shop?c=${id}`);
    setShown(PAGE);
  };
  const clearAll = () => {
    setQ("");
    setBand(undefined);
    setEditions(false);
    setCategory("all");
  };
  const filtered = category !== "all" || !!q.trim() || !!band || editions;
  const [panel, setPanel] = useState(false);
  const counts = Object.fromEntries(PRICE_BANDS.map((b) => [b.id, queryProducts(wood, { category, q, band: b.id, editionsOnly: editions }).length]));
  const pickBand = (id: string) => {
    setBand(band === id ? undefined : id);
    setShown(PAGE);
  };
  const pickEditions = (v: boolean) => {
    setEditions(v);
    setShown(PAGE);
  };
  const active = (band ? 1 : 0) + (editions ? 1 : 0);

  return (
    <div className="grid gap-8 lg:grid-cols-[16.5rem_1fr] lg:gap-10">
      {/* Drawers and filters */}
      <aside className="min-w-0 lg:sticky lg:top-[76px] lg:self-start">
        <p className={`${s.mono} text-[11px] text-(--steel)`} id={`${ids}-drawers`}>
          Drawers
        </p>
        <ul aria-labelledby={`${ids}-drawers`} className={`${s.noScrollbar} -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:block lg:border-t lg:border-(--ink) lg:px-0 lg:pb-0`}>
          {[{ id: "all" as const, label: wood === "red" ? "All parts" : "All pieces", line: "" }, ...cats].map((c, i) => {
            const on = category === c.id;
            const n = c.id === "all" ? all.length : all.filter((p) => p.category === c.id).length;
            return (
              <li key={c.id} className="shrink-0 lg:border-b lg:border-(--hair)">
                <span className="lg:hidden">
                  <button
                    type="button"
                    aria-current={on ? "true" : undefined}
                    onClick={() => setCategory(c.id)}
                    className={s.chip}
                  >
                    {c.label}
                    <span className="tabular-nums opacity-60">{n}</span>
                  </button>
                </span>
                <button
                  type="button"
                  aria-current={on ? "true" : undefined}
                  onClick={() => setCategory(c.id)}
                  className={`group hidden w-full items-center gap-3 py-3 pr-1 text-left transition-colors hover:bg-(--wash) active:bg-(--wash-2) lg:flex ${on ? "text-(--ink)" : "text-(--ink-2)"}`}
                >
                  <span className={`${s.mono} w-5 text-[10.5px] text-(--steel)`}>{i === 0 ? "" : String.fromCharCode(64 + i)}</span>
                  <span className={`flex-1 text-[15px] ${on ? "font-[600]" : ""}`}>{c.label}</span>
                  <span className={`${s.mono} text-[11px] tabular-nums text-(--steel)`}>{n}</span>
                  <span aria-hidden className={`h-4 w-[2px] rounded-full transition-colors ${on ? "bg-(--accent)" : "bg-transparent group-hover:bg-(--hair-2)"}`} />
                </button>
              </li>
            );
          })}
        </ul>

        <div className="hidden lg:block">
          <Filters wood={wood} ids={`${ids}-a`} counts={counts} band={band} onBand={pickBand} editions={editions} onEditions={pickEditions} />
        </div>

        <div className="hidden lg:block">
          <OtherWood wood={wood} onOpen={() => flip(other)} />
        </div>
      </aside>

      {/* Results */}
      <div className="min-w-0">
        <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] items-end gap-x-4 gap-y-4 border-b border-(--hair-2) pb-4 sm:grid-cols-[1fr_12rem] sm:gap-x-6">
          <div className="relative">
            <label className={s.field}>
              <input type="search" value={q} onChange={(e) => {
                  setQ(e.target.value);
                  setShown(PAGE);
                }} placeholder=" " autoComplete="off" enterKeyHint="search" />
              <span className="truncate pr-8">{wood === "red" ? "Search parts: mala, pen, cuff" : "Search: oil, attar, fan"}</span>
            </label>
            {q && (
              <button type="button" onClick={() => setQ("")} aria-label="Clear search" className={`${s.icon} absolute bottom-1 right-0 size-8!`}>
                <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden>
                  <path d="M2 2 L10 10 M10 2 L2 10" stroke="currentColor" strokeWidth="1.4" />
                </svg>
              </button>
            )}
          </div>
          <label className={s.field}>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((o) => (
                <option key={o.key} value={o.key}>
                  {o.label}
                </option>
              ))}
            </select>
            <span>Sort</span>
            <svg aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-(--steel)" width="12" height="12" viewBox="0 0 12 12">
              <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className={`${s.mono} text-[12px] text-(--ink-2)`} aria-live="polite">
            <span className="tabular-nums text-(--ink)">{list.length}</span> of {all.length} {noun}s
            {cat ? `, ${cat.label.toLowerCase()}` : ""}
          </p>
          <div className="flex items-center gap-4">
            {filtered && (
              <button type="button" onClick={clearAll} className={s.link}>
                Clear filters
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanel((v) => !v)}
              aria-expanded={panel}
              aria-controls={`${ids}-panel`}
              className={`${s.mono} inline-flex h-8 items-center gap-2 border border-(--ink) px-2.5 text-[11.5px] transition-colors active:bg-(--wash-2) lg:hidden ${panel ? "bg-(--ink) text-(--paper)" : ""}`}
            >
              Price, editions
              <span className="tabular-nums opacity-70">{active ? `(${active})` : panel ? "−" : "+"}</span>
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {panel && (
            <motion.div
              id={`${ids}-panel`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="overflow-hidden lg:hidden"
            >
              <div className={`${s.sheet} mt-3 border border-(--hair-2) px-4 pb-4`}>
                <Filters wood={wood} ids={`${ids}-m`} counts={counts} band={band} onBand={pickBand} editions={editions} onEditions={pickEditions} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {cat && <p className="mt-2 max-w-[40rem] text-[15px] leading-[1.55] text-(--ink-2)">{cat.line}</p>}

        {list.length === 0 ? (
          <Empty wood={wood} q={q} onClear={clearAll} onDrawer={setCategory} />
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((p) => (
                <motion.li
                  key={p.slug}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="flex"
                >
                  <Card p={p} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}

        {list.length > shown && (
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-(--ink) pt-5">
            <p className={`${s.mono} text-[12px] text-(--ink-2)`}>
              Showing <span className="tabular-nums">{visible.length}</span> of <span className="tabular-nums">{list.length}</span>
            </p>
            <button type="button" onClick={() => setShown((n) => n + PAGE)} className={s.btnLine}>
              Show {Math.min(PAGE, list.length - shown)} more {noun}s
            </button>
          </div>
        )}

        <div className="mt-10 lg:hidden">
          <OtherWood wood={wood} onOpen={() => flip(other)} />
        </div>
      </div>
    </div>
  );
}

/**
 * Price and editions. Prices read as a scale cut into four bands (cells of the drawing's table,
 * not pills); editions are a tick box like the ones on the work order.
 */
function Filters({
  wood,
  ids,
  counts,
  band,
  onBand,
  editions,
  onEditions,
}: {
  wood: Wood;
  ids: string;
  counts: Record<string, number>;
  band: string | undefined;
  onBand: (id: string) => void;
  editions: boolean;
  onEditions: (v: boolean) => void;
}) {
  return (
    <>
      <div className="mt-5 lg:mt-8">
        <p className={`${s.mono} flex items-center justify-between text-[11px] text-(--steel)`} id={`${ids}-bands`}>
          <span>Price scale</span>
          <span>₹</span>
        </p>
        <div role="group" aria-labelledby={`${ids}-bands`} className="mt-2 grid grid-cols-2 border-l border-t border-(--hair-2)">
          {PRICE_BANDS.map((b, i) => {
            const n = counts[b.id] ?? 0;
            const on = band === b.id;
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={on}
                disabled={n === 0 && !on}
                onClick={() => onBand(b.id)}
                className={`${s.mono} relative border-b border-r border-(--hair-2) px-2.5 pb-2 pt-3.5 text-left text-[11.5px] leading-tight transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  on ? "bg-(--ink) text-(--paper)" : "hover:bg-(--wash) active:bg-(--wash-2)"
                }`}
              >
                <span aria-hidden className="absolute inset-x-0 top-0 flex h-2 justify-between px-[1px]">
                  {[0, 1, 2, 3, 4].map((k) => (
                    <span key={k} className={`w-px ${k === 0 || k === 4 ? "h-2" : "h-1"} ${on ? "bg-(--paper)/50" : "bg-(--hair-2)"}`} />
                  ))}
                </span>
                <span className="block">{b.label}</span>
                <span className={`mt-0.5 block text-[10.5px] tabular-nums ${on ? "opacity-70" : "text-(--steel)"}`}>
                  {String.fromCharCode(97 + i)}. {n} {n === 1 ? "piece" : "pieces"}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 border-y border-(--hair-2) py-3 lg:mt-8">
        <Tick checked={editions} onChange={onEditions}>
          <span className="block text-[15px]">Editions and limited</span>
          <span className={`${s.mono} block text-[11px] text-(--steel)`}>{wood === "red" ? "The Vault, the casket, the chess set" : "The Reserve, the Saraswati"}</span>
        </Tick>
      </div>
    </>
  );
}

/** A catalogue card: the part drawn in plan, its number, dimension, price and actions. */
function Card({ p }: { p: Product }) {
  const [a, b] = shotsOf(p);
  return (
    <article className={`${s.corners} group relative flex w-full flex-col border border-(--hair-2) bg-(--sheet) transition-[border-color,box-shadow] duration-500 hover:border-(--ink) hover:shadow-[0_24px_50px_-36px_rgb(0_0_0/0.45)]`}>
      <div className={`${s.mono} flex items-center justify-between px-3 pt-3 text-[11px] text-(--steel) sm:px-5 sm:pt-4`}>
        <span className="tabular-nums">{partNo(p.slug)}</span>
        <span className="hidden truncate pl-3 sm:inline">{categoryOf(p).label}</span>
      </div>
      <div className="relative px-4 pt-3 sm:px-7 sm:pt-4">
        <Link href={`/d/01/p/${p.slug}`} className="relative block aspect-square overflow-hidden rounded-full bg-(--paper-2)" aria-label={p.name}>
          <Photo p={a.photo} tone={a.tone} sizes="(min-width:1280px) 22vw, (min-width:640px) 40vw, 84vw" className="transition-transform duration-[900ms] group-hover:scale-[1.04]" />
          {b && (
            <Photo
              p={b.photo}
              tone={b.tone}
              sizes="(min-width:1280px) 22vw, (min-width:640px) 40vw, 84vw"
              className="opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            />
          )}
          <span className="pointer-events-none absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_var(--hair-2)]" />
          <CentreMark className="inset-0 size-full text-white/70 opacity-0 mix-blend-difference transition-opacity duration-500 group-hover:opacity-100" />
        </Link>
        {p.badge && <BadgeStamp badge={p.badge} className="absolute bottom-0 left-2 bg-(--sheet) text-[9.5px]! sm:bottom-auto sm:left-5 sm:top-5 sm:text-[10.5px]!" />}
        <WishToggle p={p} className="absolute -top-7 right-1 bg-(--sheet) sm:right-4 sm:top-3" />
      </div>
      <div className="relative mx-3 mt-5 h-3 sm:mx-5">
        <DimH label={keyDimension(p)} className="inset-x-0 top-1/2 -translate-y-1/2" bg="var(--sheet)" />
      </div>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-4 sm:px-5 sm:pb-5">
        <h3 className={`${s.x110} text-[15.5px] font-[600] leading-tight tracking-[-0.01em] sm:text-[19px]`}>
          <Link href={`/d/01/p/${p.slug}`} className="transition-colors hover:text-(--accent)">
            {p.name}
          </Link>
        </h3>
        <RatingLine slug={p.slug} className="mt-1.5" />
        <p className="mt-2 hidden text-[14.5px] leading-[1.5] text-(--ink-2) sm:line-clamp-2">{p.short}</p>
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-2 border-t border-(--hair) pt-3 sm:pt-4">
          <div className="min-w-0">
            <p className={`${s.mono} text-[12.5px] tabular-nums sm:text-[14px]`}>{priceLabel(p)}</p>
            {p.edition && (
              <p className={`${s.mono} mt-0.5 text-[11px] text-(--accent)`}>
                {p.edition.left} of {p.edition.size} left
              </p>
            )}
          </div>
          <AddOrChoose p={p} />
        </div>
      </div>
    </article>
  );
}

function Empty({ wood, q, onClear, onDrawer }: { wood: Wood; q: string; onClear: () => void; onDrawer: (id: CategoryId) => void }) {
  return (
    <div className="mt-6 grid gap-8 border border-dashed border-(--hair-2) bg-(--sheet) px-6 py-12 md:grid-cols-[180px_1fr] md:items-center md:px-10">
      <svg viewBox="0 0 180 120" className="mx-auto w-40 text-(--ink)" aria-hidden>
        <path d="M10 30 H170 V110 H10 Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M22 44 H158 V98 H22 Z" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 3" opacity="0.6" />
        <path d="M72 18 H108 M80 18 V30 M100 18 V30" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <path d="M30 71 H150" stroke="currentColor" strokeWidth="0.8" strokeDasharray="10 3 2 3" opacity="0.5" />
      </svg>
      <div>
        <p className={`${s.x110} text-[24px] font-[600] leading-tight`}>{wood === "red" ? "This drawer is empty." : "Nothing in this tray."}</p>
        <p className="mt-2 max-w-[34rem] text-[16px] leading-[1.6] text-(--ink-2)">
          {q.trim() ? (
            <>
              Nothing in {CONTENT[wood].name.toLowerCase()} matches &ldquo;{q.trim()}&rdquo; with these filters.
            </>
          ) : (
            <>No {CONTENT[wood].name.toLowerCase()} piece fits all of these filters.</>
          )}{" "}
          Clear them, or open another drawer.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <button type="button" onClick={onClear} className={s.btn}>
            Clear filters
          </button>
          {CATEGORIES[wood].slice(0, 3).map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onClear();
                onDrawer(c.id);
              }}
              className={s.chip}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function OtherWood({ wood, onOpen }: { wood: Wood; onOpen: () => void }) {
  const o = OTHER[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  return (
    <div className="mt-8 border border-(--hair-2) bg-(--paper-2) p-5">
      <div className="flex items-center gap-3">
        <span aria-hidden className={`size-8 shrink-0 rounded-full ${other === "red" ? "ring-red" : "ring-white"} shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]`} />
        <p className={`${s.mono} text-[11px] text-(--steel)`}>{o.sheet}</p>
      </div>
      <p className="mt-3 text-[15px] leading-[1.55]">{o.line}</p>
      <button type="button" onClick={onOpen} className={`${s.link} mt-4 text-left text-(--ink)`}>
        {o.cta}
      </button>
    </div>
  );
}
