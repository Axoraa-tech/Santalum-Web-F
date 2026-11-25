"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, PRICE_BANDS, SORTS, priceLabel, productsFor, queryProducts, type CategoryId, type Product, type SortKey } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { COPY } from "../_lib/copy";
import { addToBag } from "../_lib/ui";
import { PinGlyph, WOOD_HEX, pickWood } from "./Pins";
import { RatingLine, Stamp, WishButton, badgeTone } from "./ProductBits";
import { RegionMap } from "./RegionMap";
import { s } from "./styles";

const PAGE = 12;
const ROT = [-0.9, 0.7, -0.4, 1, -1.1, 0.5];

function ShopCard({ p, i }: { p: Product; i: number }) {
  const [a, b] = p.shots;
  const [added, setAdded] = useState(false);
  return (
    <li className={`${s.card} ${s.flow} group flex flex-col ${i % 3 === 1 ? "lg:mt-10" : ""}`} style={{ ["--rot" as string]: `${ROT[i % ROT.length]}deg` }}>
      <span className={s.pinHead} aria-hidden />
      <Link href={`/d/08/p/${p.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-(--a-paper-2)">
        <Photo p={a.photo} tone={a.tone} sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 92vw" className={s.photoZoom} />
        {b && (
          <span className={`${s.alt} absolute inset-0`}>
            <Photo p={b.photo} tone={b.tone} sizes="(min-width: 1024px) 300px, 1px" />
          </span>
        )}
        <span className="absolute left-3 top-3 flex flex-col items-start gap-1">
          {p.badge && <Stamp tone={badgeTone(p.badge)}>{p.badge}</Stamp>}
          {p.edition && (
            <span className="bg-(--a-ink) px-2 py-0.5 text-[12.5px] font-semibold text-(--a-paper)">
              {p.edition.left} of {p.edition.size} left
            </span>
          )}
        </span>
      </Link>
      <WishButton slug={p.slug} name={p.name} className="absolute right-3 top-3 z-[2]" />
      <div className="flex flex-1 flex-col p-4">
        <Link href={`/d/08/p/${p.slug}`} className={`${s.serif} text-[21px] leading-tight decoration-(--a-accent) underline-offset-4 hover:underline`}>
          {p.name}
        </Link>
        <RatingLine slug={p.slug} className="mt-1" />
        <p className="mt-1 line-clamp-2 text-[15px] leading-snug text-(--a-muted)">{p.short}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-[16px] font-semibold tabular-nums">{priceLabel(p)}</span>
          {p.options ? (
            <Link href={`/d/08/p/${p.slug}`} className={`${s.btn} ${s.btnLine} h-10 px-4 text-[14px]`} aria-label={`Choose a ${p.options.name.toLowerCase()} for ${p.name}`}>
              Choose
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => {
                addToBag(p.slug);
                setAdded(true);
                window.setTimeout(() => setAdded(false), 1600);
              }}
              className={`${s.btn} ${s.btnInk} h-10 px-4 text-[14px] font-medium`}
              aria-label={`Add ${p.name} to the bag`}
            >
              {added ? "Added" : "Add to bag"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}

/** One wood's shop: a legend of filters on the left, the pinned pieces on the right. */
export function ShopView({ wood }: { wood: Wood }) {
  const params = useSearchParams();
  const cats = CATEGORIES[wood];
  const fromUrl = params.get("c");
  const initialCat = cats.some((c) => c.id === fromUrl) ? (fromUrl as CategoryId) : "all";
  const [category, setCategory] = useState<CategoryId | "all">(initialCat);
  const [q, setQ] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>();
  const [editionsOnly, setEditions] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [more, setMore] = useState(false);
  const id = useId();
  const all = productsFor(wood);
  const list = queryProducts(wood, { category, q, sort, band, editionsOnly });
  const c = CONTENT[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const filtered = category !== "all" || q || band || editionsOnly;
  const reset = () => {
    setCategory("all");
    setQ("");
    setBand(undefined);
    setEditions(false);
    setShown(PAGE);
  };
  const pickCat = (cat: CategoryId | "all") => {
    setCategory(cat);
    setShown(PAGE);
    window.history.replaceState(null, "", cat === "all" ? "/d/08/shop" : `/d/08/shop?c=${cat}`);
  };
  const catName = category === "all" ? `the ${c.name.toLowerCase()} shop` : cats.find((x) => x.id === category)!.label.toLowerCase();

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
      {/* header: the shop's place on the map */}
      <header className="grid grid-cols-[minmax(0,1fr)] gap-8 border-b border-(--a-ink) pb-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
        <div>
          <p className="flex items-center gap-2 text-[15px] text-(--a-ink-2)">
            <PinGlyph color="var(--a-accent)" className="h-5 w-4" />
            {COPY[wood].originTitle}, {COPY[wood].originSub}
          </p>
          <h1 className={`${s.serif} mt-4 text-[clamp(2.6rem,6vw,5rem)] leading-[0.95] tracking-[-0.02em]`}>{COPY[wood].shop.title}</h1>
          <p className="mt-4 max-w-[640px] text-[17px] leading-relaxed text-(--a-ink-2)">
            {all.length} pieces in {cats.length} categories. {c.oneLine} {COPY[wood].shop.text}
          </p>
        </div>
        <div className="relative hidden aspect-[927/990] w-[300px] overflow-hidden border border-(--a-line-2) md:block">
          <RegionMap wood={wood} id={`shop-${wood}`} className="block h-full w-full" />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12">
        {/* the legend */}
        <aside aria-label="Filters" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="border border-(--a-ink) bg-(--a-card) p-4 md:p-5">
            <p className={`${s.serif} border-b-2 border-(--a-ink) pb-2 text-[22px]`}>Legend</p>
            <label htmlFor={`${id}-q`} className="mt-4 block text-[14px] text-(--a-muted)">
              Search this shop
            </label>
            <input
              id={`${id}-q`}
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setShown(PAGE);
              }}
              placeholder={wood === "red" ? "Mala, pendant, powder" : "Oil, attar, incense"}
              className={`${s.field} mt-1.5`}
            />
            <fieldset className="mt-5 min-w-0">
              <legend className="text-[14px] text-(--a-muted)">Category</legend>
              <ul className={`${s.rail} mt-2 flex gap-2 overflow-x-auto lg:block lg:space-y-0.5 lg:overflow-visible`}>
                {[{ id: "all" as const, label: "Everything" }, ...cats].map((cat) => {
                  const on = category === cat.id;
                  const n = cat.id === "all" ? all.length : all.filter((p) => p.category === cat.id).length;
                  return (
                    <li key={cat.id} className="shrink-0">
                      <button
                        type="button"
                        aria-pressed={on}
                        onClick={() => pickCat(cat.id)}
                        className={`flex w-full items-center justify-between gap-3 whitespace-nowrap rounded-full border px-3 py-2 text-left text-[15px] transition-colors lg:rounded-[8px] lg:border-transparent ${
                          on ? "border-(--a-ink) bg-(--a-ink) text-(--a-paper)" : "border-(--a-line-2) hover:bg-(--a-paper-2)"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <span className={`size-2.5 rounded-full border-2 ${on ? "border-(--a-paper) bg-(--a-accent)" : "border-(--a-accent)"}`} aria-hidden />
                          {cat.label}
                        </span>
                        <span className={`tabular-nums ${on ? "opacity-75" : "text-(--a-muted)"}`}>{n}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
            <button
              type="button"
              aria-expanded={more}
              aria-controls={`${id}-more`}
              onClick={() => setMore((m) => !m)}
              className="mt-4 flex w-full items-center justify-between gap-3 border-t border-dashed border-(--a-line-2) pt-3 text-[15px] text-(--a-ink-2) lg:hidden"
            >
              <span>{more ? "Fewer marks" : "Price, editions and order"}</span>
              <svg viewBox="0 0 16 16" className={`size-4 transition-transform duration-300 ${more ? "rotate-180" : ""}`} aria-hidden>
                <path d="M3.5 6l4.5 4.5L12.5 6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <div id={`${id}-more`} className={`${more ? "" : "max-lg:hidden"}`}>
            <fieldset className="mt-5">
              <legend className="text-[14px] text-(--a-muted)">Price scale</legend>
              <div className="mt-2 grid grid-cols-4 gap-px border border-(--a-ink)" role="group">
                {PRICE_BANDS.map((b, i) => {
                  const on = band === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      aria-pressed={on}
                      aria-label={b.label}
                      title={b.label}
                      onClick={() => {
                        setBand(on ? undefined : b.id);
                        setShown(PAGE);
                      }}
                      className={`h-3 transition-colors ${on ? "bg-(--a-accent)" : i % 2 ? "bg-(--a-card) hover:bg-(--a-accent-soft)" : "bg-(--a-ink) hover:bg-(--a-accent)"}`}
                    />
                  );
                })}
              </div>
              <p className="mt-1.5 flex justify-between text-[12.5px] text-(--a-muted)">
                <span>₹1k</span>
                <span>₹3k</span>
                <span>₹10k</span>
                <span>₹25k+</span>
              </p>
              <p className="mt-1 text-[14px]">{band ? PRICE_BANDS.find((b) => b.id === band)!.label : "Any price"}</p>
            </fieldset>
            <label className="mt-5 flex cursor-pointer items-center gap-3 text-[15px]">
              <input type="checkbox" checked={editionsOnly} onChange={(e) => (setEditions(e.target.checked), setShown(PAGE))} className={`${s.check} size-5`} />
              Editions and limited pieces
            </label>
            <fieldset className="mt-5">
              <legend className="text-[14px] text-(--a-muted)">Order the pins</legend>
              <div role="radiogroup" aria-label="Sort" className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 lg:grid-cols-1">
                {SORTS.map((o) => {
                  const on = sort === o.key;
                  return (
                    <label key={o.key} className="group flex cursor-pointer items-center gap-2.5 rounded-[8px] px-1.5 py-1.5 text-[15px] transition-colors hover:bg-(--a-paper-2) has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-(--a-accent)">
                      <input type="radio" name={`${id}-sort`} value={o.key} checked={on} onChange={() => setSort(o.key)} className="sr-only" />
                      <span className={`h-[2px] w-4 shrink-0 transition-colors ${on ? "bg-(--a-accent)" : "bg-(--a-line-2) group-hover:bg-(--a-ink)"}`} aria-hidden />
                      <span className={on ? "font-semibold text-(--a-ink)" : "text-(--a-ink-2)"}>{o.label}</span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
            </div>
          </div>
          <div className="mt-4 hidden border border-dashed border-(--a-line-2) bg-(--a-card) p-4 lg:block">
            <p className="flex items-center gap-2">
              <PinGlyph color={WOOD_HEX[other]} filled={false} className="h-6 w-5" />
              <span className={`${s.serif} text-[18px]`}>{COPY[other].shop.title}</span>
            </p>
            <p className="mt-2 text-[15px] leading-snug text-(--a-ink-2)">{CONTENT[other].oneLine}</p>
            <button type="button" onClick={() => (pickWood(other), window.scrollTo({ top: 0 }))} className={`${s.link} mt-2 text-[15px]`}>
              Open the {CONTENT[other].name.toLowerCase()} shop
            </button>
          </div>
        </aside>

        {/* the pieces */}
        <section aria-labelledby={`${id}-count`} className="min-w-0">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p id={`${id}-count`} className="text-[16px] text-(--a-ink-2)" aria-live="polite">
              <span className="font-semibold text-(--a-ink)">{list.length}</span> {list.length === 1 ? "piece" : "pieces"} in {catName}
              {q.trim() ? ` matching “${q.trim()}”` : ""}
            </p>
            {filtered && (
              <button type="button" onClick={reset} className={`${s.link} text-[15px]`}>
                Clear the legend
              </button>
            )}
          </div>
          {list.length === 0 ? (
            <div className="mt-6 grid gap-6 border border-dashed border-(--a-line-2) bg-(--a-card) p-6 sm:grid-cols-[160px_1fr] md:p-10">
              <svg viewBox="0 0 160 120" className="w-[160px]" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <ellipse key={i} cx="80" cy="60" rx={70 - i * 16} ry={50 - i * 11} fill="none" stroke="var(--a-accent)" strokeOpacity={0.25 + i * 0.15} strokeDasharray={i ? "4 5" : "none"} />
                ))}
                <path d="M80 60l-2-9a5 5 0 1 1 4 0z" fill="var(--a-ink)" />
              </svg>
              <div>
                <p className={`${s.serif} text-[26px] leading-tight`}>Nothing on this part of the map.</p>
                <p className="mt-2 max-w-[460px] text-[16px] leading-relaxed text-(--a-ink-2)">
                  No {c.name.toLowerCase()} piece fits all of those marks. Loosen the price scale, try a plainer word, or clear the legend.
                </p>
                <button type="button" onClick={reset} className={`${s.btn} ${s.btnInk} mt-5 h-11 px-5 text-[15px] font-medium`}>
                  Clear the legend
                </button>
              </div>
            </div>
          ) : (
            <>
              <ul className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {list.slice(0, shown).map((p, i) => (
                  <ShopCard key={p.slug} p={p} i={i} />
                ))}
              </ul>
              {list.length > shown && (
                <div className="mt-10 flex items-center gap-4">
                  <span className={`${s.hroute} h-[3px] flex-1`} aria-hidden />
                  <button type="button" onClick={() => setShown((n) => n + PAGE)} className={`${s.btn} ${s.btnLine} h-12 px-6 text-[15px]`}>
                    Show {Math.min(PAGE, list.length - shown)} more of {list.length}
                  </button>
                  <span className={`${s.hroute} h-[3px] flex-1`} aria-hidden />
                </div>
              )}
            </>
          )}
          <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-(--a-line-2) pt-6 lg:hidden">
            <PinGlyph color={WOOD_HEX[other]} filled={false} className="h-7 w-5" />
            <p className="flex-1 text-[16px] text-(--a-ink-2)">
              {COPY[other].shop.title}: {CONTENT[other].oneLine}
            </p>
            <button type="button" onClick={() => (pickWood(other), window.scrollTo({ top: 0 }))} className={`${s.btn} ${s.btnLine} h-11 px-5 text-[15px]`}>
              Open it
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
