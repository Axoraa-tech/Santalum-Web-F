"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import {
  CATEGORIES,
  PRICE_BANDS,
  SORTS,
  featured,
  productsFor,
  queryProducts,
  type CategoryId,
  type SortKey,
  type Wood,
} from "@/lib/shop/products";
import { setWoodQuietly, switchWood, useWood } from "@/lib/wood";
import { EASE, SHOP, WOOD_LABEL, otherWood, plural, shopHref } from "./copy";
import { ProductDisc } from "./ProductDisc";
import { scrollToY } from "./store";
import { ArrowIcon, CloseIcon, SearchIcon, Swatch, Toggle } from "./ui";
import { s } from "./cls";

const PAGE = 12;

/** Follow a category deep link into its wood, and drop a category that the other wood does not have. */
export function ShopWoodFromQuery() {
  const params = useSearchParams();
  const c = params.get("c");
  const wood = useWood();
  const prev = useRef<Wood | null>(null);
  const cRef = useRef(c);

  useEffect(() => {
    cRef.current = c;
  }, [c]);

  useEffect(() => {
    const cat = cRef.current;
    if (!cat) return;
    const owner = (["red", "white"] as Wood[]).find((w) => CATEGORIES[w].some((x) => x.id === cat));
    if (owner) setWoodQuietly(owner);
  }, []);

  useEffect(() => {
    const was = prev.current;
    prev.current = wood;
    if (!was || was === wood) return;
    const cat = cRef.current;
    if (cat && !CATEGORIES[wood].some((x) => x.id === cat)) window.history.replaceState(null, "", SHOP);
  }, [wood]);

  return null;
}

/** The ranges as a row of round photographs: the shop's category filter. */
function RangeOrbit({ wood, value, onChange }: { wood: Wood; value: CategoryId | "all"; onChange: (c: CategoryId | "all") => void }) {
  const all = productsFor(wood);
  const opts = [
    { id: "all" as const, label: "Everything", count: all.length, shot: null },
    ...CATEGORIES[wood].map((c) => {
      const items = all.filter((p) => p.category === c.id);
      return { id: c.id, label: c.label, count: items.length, shot: (items.find((p) => p.featured) ?? items[0]).shots[0] };
    }),
  ];
  return (
    <div className={`-mx-5 overflow-x-auto px-5 pb-2 md:mx-0 md:px-0 ${s.noBar}`}>
      <ul className="flex min-w-max gap-3 md:gap-5" aria-label="Ranges">
        {opts.map((o) => {
          const on = value === o.id;
          return (
            <li key={o.id}>
              <button type="button" aria-pressed={on} onClick={() => onChange(o.id)} className="group flex w-[88px] flex-col items-center gap-2 text-center md:w-[112px]">
                <span
                  className={`relative block size-[76px] rounded-full transition-[box-shadow,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1 group-active:scale-95 md:size-[96px] ${
                    on ? "shadow-[0_0_0_3px_var(--o-bg),0_0_0_5px_var(--m-accent)]" : ""
                  }`}
                >
                  <span className="absolute inset-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
                    {o.shot ? <Photo p={o.shot.photo} tone={o.shot.tone} sizes="96px" /> : <span className={`absolute inset-0 ${wood === "red" ? s.woodRed : s.woodWhite}`} />}
                  </span>
                  <span className={`absolute -right-1 -top-1 grid min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold leading-6 tabular-nums ring-2 ring-[var(--o-bg)] ${on ? "bg-[var(--m-accent)] text-white" : "bg-[var(--o-ink)] text-white"}`}>
                    {o.count}
                  </span>
                </span>
                <span className={`${s.syne} text-[13px] font-bold leading-tight md:text-[14px] ${on ? "text-[var(--o-ink)]" : "text-[var(--o-muted)] group-hover:text-[var(--o-ink)]"}`}>{o.label}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** The result count as an arc: how much of the wood's shop is showing. */
function CountRing({ n, total }: { n: number; total: number }) {
  const C = 2 * Math.PI * 26;
  return (
    <span className="relative grid size-[64px] shrink-0 place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--o-line)" strokeWidth="2" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="var(--m-accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - n / Math.max(1, total))}
          style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className={`${s.syne} text-[18px] font-bold tabular-nums`}>{n}</span>
    </span>
  );
}

/** One wood's whole shop: ranges, search, sort, price, editions, the discs, and more on demand. */
export function ShopView({ wood }: { wood: Wood }) {
  const params = useSearchParams();
  const reduced = !!useReducedMotion();
  const c = params.get("c");
  const category: CategoryId | "all" = CATEGORIES[wood].some((x) => x.id === c) ? (c as CategoryId) : "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [editions, setEditions] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const topRef = useRef<HTMLDivElement>(null);

  const all = productsFor(wood);
  const content = CONTENT[wood];
  const other = otherWood(wood);
  const results = useMemo(() => queryProducts(wood, { category, q, sort, band, editionsOnly: editions }), [wood, category, q, sort, band, editions]);
  const visible = results.slice(0, shown);
  const cat = CATEGORIES[wood].find((x) => x.id === category);
  const filtered = category !== "all" || !!q.trim() || !!band || editions;
  const ids = `o2-shop-${wood}`;

  const setCategory = (id: CategoryId | "all") => {
    window.history.replaceState(null, "", shopHref(id));
    setShown(PAGE);
  };
  const clearAll = () => {
    setQ("");
    setBand(undefined);
    setEditions(false);
    setSort("featured");
    setShown(PAGE);
    window.history.replaceState(null, "", SHOP);
  };
  const goOther = () => {
    window.history.replaceState(null, "", SHOP);
    switchWood(other);
    const top = topRef.current ? topRef.current.getBoundingClientRect().top + window.scrollY - 120 : 0;
    scrollToY(Math.max(0, top));
  };

  const bandLabel = band ? (PRICE_BANDS.find((b) => b.id === band)?.label.toLowerCase() ?? "") : "";
  const emptyLine = [
    q.trim() ? `nothing matches “${q.trim()}”` : "nothing matches",
    cat ? `in ${cat.label.toLowerCase()}` : null,
    bandLabel ? (bandLabel.startsWith("₹") ? `at ${bandLabel}` : bandLabel) : null,
    editions ? "among the editions" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={topRef}>
      <RangeOrbit wood={wood} value={category} onChange={setCategory} />

      {/* search, sort, price and editions */}
      <div className="mt-8 grid gap-3 md:grid-cols-[minmax(0,1fr)_240px] md:gap-4">
        <div className="relative">
          <label htmlFor={`${ids}-q`} className="sr-only">
            Search {WOOD_LABEL[wood].toLowerCase()}
          </label>
          <SearchIcon className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-[var(--o-muted)]" />
          <input
            id={`${ids}-q`}
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
            placeholder={wood === "red" ? "Search: mala, bangle, powder" : "Search: attar, incense, fan"}
            className={`${s.field} pl-14 pr-12`}
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              aria-label="Clear the search"
              className="absolute right-2 top-1/2 grid size-9 -translate-y-1/2 place-items-center rounded-full text-[var(--o-muted)] transition-colors hover:bg-[var(--o-floor)] hover:text-[var(--o-ink)]"
            >
              <CloseIcon className="size-4" />
            </button>
          )}
        </div>
        <div>
          <label htmlFor={`${ids}-sort`} className="sr-only">
            Sort
          </label>
          <select id={`${ids}-sort`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={s.field}>
            {SORTS.map((o) => (
              <option key={o.key} value={o.key}>
                Sort: {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className={`-mx-5 overflow-x-auto px-5 md:mx-0 md:px-0 ${s.noBar}`}>
          <div role="group" aria-label="Price" className="flex min-w-max gap-2">
            {[{ id: undefined, label: "Any price" }, ...PRICE_BANDS].map((b) => {
              const on = band === b.id;
              return (
                <button
                  key={b.label}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    setBand(b.id);
                    setShown(PAGE);
                  }}
                  className={`h-10 rounded-full border px-4 text-[14px] font-semibold tabular-nums transition-colors duration-300 active:scale-95 ${
                    on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] bg-[var(--o-card)] hover:border-[var(--o-ink)]"
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </div>
        <Toggle
          checked={editions}
          onChange={(v) => {
            setEditions(v);
            setShown(PAGE);
          }}
        >
          Editions and limited pieces
        </Toggle>
      </div>

      {/* the count, and what the current range is */}
      <div className="mt-10 flex items-center gap-4 border-t border-[var(--o-line)] pt-6">
        <CountRing n={results.length} total={all.length} />
        <div className="min-w-0 flex-1" aria-live="polite">
          <p className={`${s.syne} text-[20px] font-bold leading-tight tracking-[-0.02em]`}>
            {plural(results.length, "piece")} {cat ? `in ${cat.label.toLowerCase()}` : `in ${WOOD_LABEL[wood].toLowerCase()}`}
          </p>
          <p className="mt-0.5 text-[14px] text-[var(--o-muted)]">{cat ? cat.line : content.oneLine}</p>
        </div>
        {filtered && (
          <button type="button" onClick={clearAll} className="hidden h-10 shrink-0 rounded-full border border-[var(--o-line)] px-4 text-[14px] font-semibold transition-colors hover:border-[var(--o-ink)] sm:block">
            Clear filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="mt-12 grid items-center gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">
          <div className="relative mx-auto grid aspect-square w-[min(84vw,380px)] place-items-center rounded-full border-2 border-dashed border-[var(--o-line)] text-center">
            <div className="max-w-[240px]">
              <p className={`${s.display} text-[40px]`}>Nothing here.</p>
              <p className="mt-3 text-[16px] leading-snug text-[var(--o-ink-2)]">In {WOOD_LABEL[wood].toLowerCase()}, {emptyLine}.</p>
              <button
                type="button"
                onClick={clearAll}
                className="mt-5 h-12 rounded-full bg-[var(--o-ink)] px-6 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-95"
              >
                Clear filters
              </button>
            </div>
          </div>
          <div>
            <p className={`${s.syne} text-[18px] font-bold`}>Or begin with one of these</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3">
              {featured(wood, 3).map((p) => (
                <li key={p.slug}>
                  <ProductDisc product={p} sizes="(min-width: 768px) 18vw, 44vw" />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <ul className={`${s.wave} mt-10 grid grid-cols-2 gap-x-4 gap-y-12 pb-12 md:grid-cols-3 md:gap-x-10 md:gap-y-16 xl:grid-cols-4`}>
          <AnimatePresence initial={false} mode="popLayout">
            {visible.map((p, i) => (
              <motion.li
                key={p.slug}
                layout={!reduced}
                initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.86 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.86 }}
                transition={{ duration: reduced ? 0.15 : 0.5, ease: EASE, delay: reduced ? 0 : Math.min(i % PAGE, 8) * 0.03 }}
              >
                <ProductDisc product={p} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {results.length > shown && (
        <div className="mt-10 flex justify-center">
          <MoreButton shown={shown} total={results.length} onClick={() => setShown((n) => n + PAGE)} />
        </div>
      )}

      {/* the other wood is another shop */}
      <div className="mt-24 grid items-center gap-10 rounded-[48px] bg-[var(--o-stone)] p-6 md:grid-cols-[auto_1fr_auto] md:gap-12 md:rounded-full md:p-5 md:pr-8">
        <div className="relative mx-auto h-[150px] w-[230px] shrink-0 md:mx-0 md:h-[160px] md:w-[250px]">
          <span className={`absolute left-0 top-0 size-[150px] rounded-full md:size-[160px] ${wood === "red" ? s.woodRed : s.woodWhite}`} />
          <span className="absolute right-0 top-0 size-[150px] overflow-hidden rounded-full mix-blend-multiply md:size-[160px]">
            <Photo p={CONTENT[other].hero.photo} sizes="160px" />
          </span>
        </div>
        <div className="text-center md:text-left">
          <p className={`${s.syne} text-[clamp(1.5rem,2.6vw,2.2rem)] font-bold leading-tight tracking-[-0.03em]`}>
            {WOOD_LABEL[other]} is another shop.
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-[var(--o-ink-2)]">
            {CONTENT[other].oneLine} {productsFor(other).length} pieces, from {CATEGORIES[other].map((x) => x.label.toLowerCase()).slice(0, 3).join(", ")} and more.
          </p>
        </div>
        <button
          type="button"
          onClick={goOther}
          className="group mx-auto flex h-14 items-center gap-3 rounded-full bg-[var(--o-ink)] pl-2 pr-6 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.98] md:mx-0"
        >
          <Swatch wood={other} className="size-10" />
          Open the {other} shop
          <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
}

function MoreButton({ shown, total, onClick }: { shown: number; total: number; onClick: () => void }) {
  const C = 2 * Math.PI * 66;
  const next = Math.min(PAGE, total - shown);
  return (
    <button type="button" onClick={onClick} className="group relative grid size-[156px] place-items-center rounded-full text-center transition-transform duration-500 hover:scale-[1.04] active:scale-95">
      <svg viewBox="0 0 156 156" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="78" cy="78" r="66" fill="var(--o-card)" stroke="var(--o-line)" strokeWidth="2" />
        <circle cx="78" cy="78" r="66" fill="none" stroke="var(--m-accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - shown / total)} />
      </svg>
      <span className="relative block max-w-[108px]">
        <span className="block text-[13px] font-semibold leading-none text-[var(--o-muted)]">Show</span>
        <span className={`${s.syne} mt-1 block whitespace-nowrap text-[20px] font-bold leading-none tracking-[-0.02em] tabular-nums`}>{next} more</span>
        <span className="mt-1.5 block text-[12px] leading-tight tabular-nums text-[var(--o-muted)]">
          {shown} of {total} shown
        </span>
      </span>
    </button>
  );
}
