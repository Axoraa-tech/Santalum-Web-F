"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, PRICE_BANDS, SORTS, productsFor, queryProducts, type CategoryId, type SortKey } from "@/lib/shop/products";
import { setWoodQuietly, switchWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { Switch } from "../forms/Field";
import { Pill } from "../Pill";
import { ChevronIcon, CloseIcon, SearchIcon } from "./Icons";
import { ProductCard } from "./ProductCard";

const PAGE = 12;

/** Only the price bands this wood has pieces in (white tops out under ₹25,000, so it has no "Above"). */
const BANDS: Record<Wood, typeof PRICE_BANDS> = {
  red: PRICE_BANDS.filter((b) => productsFor("red").some((p) => p.price >= b.min && p.price <= b.max)),
  white: PRICE_BANDS.filter((b) => productsFor("white").some((p) => p.price >= b.min && p.price <= b.max)),
};
const EASE = [0.22, 1, 0.36, 1] as const;

/* An uneven rhythm: wide, medium, narrow; then the reverse, each dropped by a different amount. */
const RHYTHM = ["md:col-span-5", "md:col-span-4 md:mt-28", "md:col-span-3 md:mt-10", "md:col-span-3 md:mt-16", "md:col-span-4", "md:col-span-5 md:mt-32"];

const VOICE: Record<Wood, { search: string; empty: string; other: string; otherCta: string }> = {
  red: {
    search: "Search red sandalwood: mala, bowl, pen",
    empty: "Nothing in red sandalwood matches that. Try fewer filters, or search for a mala, a bowl or the Vault cuff.",
    other: "White sandalwood is a different shop: heartwood oil, attar, chandan, incense and Mysuru carving.",
    otherCta: "Visit the white sandalwood shop",
  },
  white: {
    search: "Search white sandalwood: oil, attar, fan",
    empty: "Nothing in white sandalwood matches that. Try fewer filters, or search for oil, attar or chandan.",
    other: "Red sandalwood is a different shop: dense red beads, turned objects, jewellery and the 2011 Vault.",
    otherCta: "Visit the red sandalwood shop",
  },
};

/**
 * The full shop for one wood. The page renders one per wood (CSS shows the current one), so each
 * keeps its own filters and a reload never flashes the other wood. The category lives in the URL
 * (?c=) so it can be linked; the rest is local to this visit.
 */
export function ShopView({ wood }: { wood: Wood }) {
  const params = useSearchParams();
  const router = useRouter();
  const uid = useId().replace(/:/g, "");
  const cats = CATEGORIES[wood];
  const raw = params.get("c");
  const category: CategoryId | "all" = cats.some((c) => c.id === raw) ? (raw as CategoryId) : "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>();
  const [editions, setEditions] = useState(false);

  const list = queryProducts(wood, { category, q, sort, band, editionsOnly: editions });
  const sig = `${category}|${q}|${sort}|${band ?? ""}|${editions}`;
  const [more, setMore] = useState({ sig, pages: 1 });
  const pages = more.sig === sig ? more.pages : 1;
  const shown = list.slice(0, pages * PAGE);
  const filtered = category !== "all" || !!q || !!band || editions;
  const voice = VOICE[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const cat = cats.find((c) => c.id === category);

  // A link to a category of this wood (/maison/shop?c=w-beads) brings the site to this wood.
  useEffect(() => {
    if (raw && cats.some((c) => c.id === raw)) setWoodQuietly(wood);
  }, [raw, cats, wood]);

  const pick = (id: CategoryId | "all") => router.replace(id === "all" ? "/maison/shop" : `/maison/shop?c=${id}`, { scroll: false });
  const clear = () => {
    setQ("");
    setSort("featured");
    setBand(undefined);
    setEditions(false);
    pick("all");
  };
  const visitOther = () => {
    switchWood(other);
    router.replace("/maison/shop", { scroll: false });
    window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  };

  const tabs: { id: CategoryId | "all"; label: string }[] = [{ id: "all", label: "Everything" }, ...cats.map((c) => ({ id: c.id, label: c.label }))];

  return (
    <div>
      {/* categories: the same sliding pill as the header */}
      <div className="mz-catbar sticky top-[5.25rem] z-20 -mx-5 -mt-2 pb-6 pt-2 md:-mx-3 md:px-3">
        <nav aria-label={`${CONTENT[wood].name} categories`} className="mz-strip mz-strip-fade overflow-x-auto pl-5 pr-20 md:px-0">
          <div className="inline-flex rounded-full border border-(--mz-line) bg-(--mz-bg) p-1 shadow-[0_12px_30px_-18px_rgb(23_19_15/0.45)]">
            {tabs.map((t) => {
              const on = category === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => pick(t.id)}
                  aria-pressed={on}
                  className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
                    on ? "text-(--mz-bg)" : "text-(--mz-ink-2) hover:text-(--mz-ink)"
                  }`}
                >
                  {on && <motion.span layoutId={`shop-tab-${wood}`} className="absolute inset-0 rounded-full bg-(--mz-ink)" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} />}
                  <span className="relative">{t.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      {/* refine: search and sort with the editions switch, then the price bands on their own line */}
      <div className="mt-1 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex h-12 w-full items-center rounded-full bg-(--mz-surface) pl-4 pr-1.5 ring-1 ring-transparent transition-shadow focus-within:bg-(--mz-bg) focus-within:ring-2 focus-within:ring-(--mz-accent) sm:w-[22rem]">
            <SearchIcon className="shrink-0 text-(--mz-ink-3)" />
            <label htmlFor={`q-${uid}`} className="sr-only">
              Search {CONTENT[wood].name.toLowerCase()}
            </label>
            <input
              id={`q-${uid}`}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={voice.search}
              autoComplete="off"
              className="h-full min-w-0 flex-1 bg-transparent px-3 text-[16px] outline-none placeholder:text-(--mz-ink-3) [&::-webkit-search-cancel-button]:hidden"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                aria-label="Clear search"
                className="grid size-9 shrink-0 place-items-center rounded-full text-(--mz-ink-2) hover:bg-(--mz-surface-2) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
              >
                <CloseIcon />
              </button>
            )}
          </div>
          <div className="relative h-12 shrink-0">
            <label htmlFor={`sort-${uid}`} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[14px] text-(--mz-ink-3)">
              Sort
            </label>
            <select
              id={`sort-${uid}`}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="mz-select h-12 w-full cursor-pointer rounded-full border border-(--mz-line) bg-transparent pl-14 pr-11 text-[15px] text-(--mz-ink) outline-none transition-colors hover:border-(--mz-ink)/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) sm:w-auto"
            >
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
            <ChevronIcon className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-(--mz-ink-3)" />
          </div>
        </div>

        <Switch on={editions} onChange={setEditions} label="Editions and limited" className="shrink-0" />
      </div>
      <div className="mt-4 flex items-center gap-3">
        <span className="shrink-0 text-[14px] text-(--mz-ink-3)">Price</span>
        <div role="group" aria-label="Price" className="mz-strip mz-strip-fade -mr-5 flex min-w-0 flex-1 gap-1.5 overflow-x-auto pr-10 sm:mr-0 sm:flex-wrap sm:overflow-visible sm:pr-0">
          {BANDS[wood].map((b) => {
            const on = band === b.id;
            return (
              <button
                key={b.id}
                type="button"
                aria-pressed={on}
                onClick={() => setBand(on ? undefined : b.id)}
                className={`h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[14px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
                  on ? "bg-(--mz-ink) text-(--mz-bg)" : "bg-(--mz-surface) text-(--mz-ink-2) hover:text-(--mz-ink)"
                }`}
              >
                {b.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* what is showing */}
      <div className="mt-10 flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-(--mz-line) pb-5">
        <p className="max-w-2xl font-display text-[26px] leading-tight tracking-[-0.01em] md:text-[32px]">
          {cat ? (
            <>
              {cat.label}
              <span className="text-(--mz-ink-3)">. {cat.line}</span>
            </>
          ) : (
            <>
              Everything in {CONTENT[wood].name.toLowerCase()}
              <span className="text-(--mz-ink-3)">. {CONTENT[wood].oneLine}</span>
            </>
          )}
        </p>
        <p className="flex items-center gap-4 text-[15px] text-(--mz-ink-2)" aria-live="polite">
          <span className="tabular-nums">
            {list.length} {list.length === 1 ? "piece" : "pieces"}
            {q ? ` matching “${q.trim()}”` : ""}
          </span>
          {filtered && (
            <button type="button" onClick={clear} className="rounded-full text-(--mz-ink) underline decoration-(--mz-line) underline-offset-4 hover:decoration-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)">
              Clear filters
            </button>
          )}
        </p>
      </div>

      {list.length === 0 ? (
        <Empty wood={wood} text={voice.empty} onClear={clear} />
      ) : (
        <motion.div layout className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
          <AnimatePresence mode="popLayout" initial={false}>
            {shown.map((p, i) => (
              <motion.div
                key={p.slug}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE }}
                className={RHYTHM[i % RHYTHM.length]}
              >
                <ProductCard p={p} priority={i < 2} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {shown.length < list.length && (
        <div className="mt-20 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => setMore({ sig, pages: pages + 1 })}
            className="group relative grid size-40 place-items-center overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent) active:scale-[0.97]"
          >
            <span className={`absolute inset-0 transition-transform duration-[1600ms] ease-out-soft group-hover:rotate-[120deg] ${wood === "red" ? "ring-red" : "ring-white"}`} />
            <span className="relative rounded-full bg-(--mz-bg)/90 px-4 py-2 text-center text-[15px] leading-tight backdrop-blur">
              Show {Math.min(PAGE, list.length - shown.length)} more
            </span>
          </button>
          <p className="text-[14px] tabular-nums text-(--mz-ink-3)">
            {shown.length} of {list.length} shown
          </p>
        </div>
      )}

      {/* the other wood's shop */}
      <aside className="mt-28 grid items-center gap-8 rounded-[2.5rem] bg-(--mz-surface) p-6 md:grid-cols-[auto_1fr_auto] md:gap-10 md:rounded-full md:p-5 md:pr-10">
        <span className="relative mx-auto block size-28 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)] md:mx-0">
          <span className={`absolute inset-0 ${other === "red" ? "ring-red" : "ring-white"}`} />
        </span>
        <div className="text-center md:text-left">
          <p className="font-display text-[26px] leading-tight tracking-[-0.01em]">
            {CONTENT[other].name}, {productsFor(other).length} pieces
          </p>
          <p className="mt-2 text-[16px] leading-relaxed text-(--mz-ink-2)">{voice.other}</p>
        </div>
        <div className="flex justify-center">
          <Pill onClick={visitOther} variant="line" size="lg">
            {voice.otherCta}
          </Pill>
        </div>
      </aside>
    </div>
  );
}

function Empty({ wood, text, onClear }: { wood: Wood; text: string; onClear: () => void }) {
  return (
    <div className="mt-12 grid items-center gap-10 rounded-[2.5rem] border border-dashed border-(--mz-ink)/15 p-8 md:grid-cols-[auto_1fr] md:p-12">
      <span className="relative mx-auto block size-36 md:mx-0">
        <span className={`absolute inset-0 rounded-full opacity-40 ${wood === "red" ? "ring-red" : "ring-white"}`} />
        <span className="absolute inset-[22%] rounded-full bg-(--mz-bg)" />
      </span>
      <div>
        <p className="font-display text-[30px] leading-tight tracking-[-0.02em]">Nothing on the string</p>
        <p className="mt-3 max-w-lg text-[16px] leading-relaxed text-(--mz-ink-2)">{text}</p>
        <Pill onClick={onClear} size="lg" className="mt-6">
          Clear filters
        </Pill>
      </div>
    </div>
  );
}

/** Shown while the URL is read (the shop renders behind Suspense). Same rhythm, no photographs yet. */
export function ShopSkeleton() {
  return (
    <div aria-hidden>
      <div className="h-11 w-[min(40rem,100%)] rounded-full bg-(--mz-surface)" />
      <div className="mt-6 h-12 w-full max-w-[22rem] rounded-full bg-(--mz-surface)" />
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-12 md:gap-x-8">
        {RHYTHM.map((r, i) => (
          <div key={i} className={r}>
            <div className="aspect-square rounded-full bg-(--mz-surface)" />
            <div className="mt-5 h-6 w-2/3 rounded-full bg-(--mz-surface)" />
          </div>
        ))}
      </div>
    </div>
  );
}
