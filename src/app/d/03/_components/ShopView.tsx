"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, PRICE_BANDS, productsFor, queryProducts, SORTS, type CategoryId, type Product, type SortKey } from "@/lib/shop/products";
import { setWoodQuietly, type Wood } from "@/lib/wood";
import { SHOP } from "./bits";
import { Medallion } from "./Medallion";
import { useFlipWood } from "./Nav";
import { glideTo } from "./store";
import { capital, inWords } from "./words";

const PAGE = 12;
const PER_STRAND = 4;

const woodOfCategory = (c: string | null): Wood | null =>
  c ? ((Object.keys(CATEGORIES) as Wood[]).find((w) => CATEGORIES[w].some((x) => x.id === c)) ?? null) : null;

/** Reads ?c= (inside Suspense), follows the category's wood, and renders both woods' shops; CSS shows the current one. */
export function ShopClient() {
  const params = useSearchParams();
  const c = params.get("c");
  useEffect(() => {
    const w = woodOfCategory(c);
    if (w) setWoodQuietly(w);
  }, [c]);
  return <W red={<ShopView wood="red" c={c} />} white={<ShopView wood="white" c={c} />} />;
}

function setCategoryUrl(id: CategoryId | "all") {
  window.history.replaceState(null, "", id === "all" ? SHOP : `${SHOP}?c=${id}`);
}

/** One wood's shop: categories as beads on a thread, then the pieces hanging in strands. */
function ShopView({ wood, c }: { wood: Wood; c: string | null }) {
  const cats = CATEGORIES[wood];
  const category: CategoryId | "all" = cats.some((x) => x.id === c) ? (c as CategoryId) : "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [editionsOnly, setEditionsOnly] = useState(false);
  const id = useId();
  const all = productsFor(wood);
  const list = queryProducts(wood, { category, q, sort, band, editionsOnly });
  const grouped = category === "all" && !q.trim() && !band && !editionsOnly && sort === "featured";
  const filtered = category !== "all" || q.trim() || band || editionsOnly;
  const clear = () => {
    setQ("");
    setBand(undefined);
    setEditionsOnly(false);
    setSort("featured");
    setCategoryUrl("all");
  };

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-10">
      {/* categories: beads on one thread */}
      <nav aria-label={`${CONTENT[wood].name} categories`} className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
        <div className="s3-cats min-w-max">
          <CatBead on={category === "all"} label="Everything" n={all.length} onClick={() => setCategoryUrl("all")} />
          {cats.map((x) => (
            <CatBead key={x.id} on={category === x.id} label={x.label} n={all.filter((p) => p.category === x.id).length} onClick={() => setCategoryUrl(x.id)} />
          ))}
        </div>
      </nav>

      {/* search and sort are lengths of thread; price is one thread knotted into four lengths; editions is a bead pushed to a knot */}
      <div className="mt-6 grid grid-cols-[minmax(0,1fr)_minmax(0,150px)] items-end gap-x-6 gap-y-4 border-y border-(--line) pb-4 pt-3 md:grid-cols-[minmax(0,1fr)_200px] lg:grid-cols-[minmax(0,280px)_200px_minmax(0,1fr)_auto] lg:gap-x-10">
        <div className="relative">
          <label htmlFor={`${id}-q`} className="sr-only">
            Search {CONTENT[wood].name.toLowerCase()}
          </label>
          <span className="pointer-events-none absolute left-0 top-[calc(50%-2px)] h-3 w-3 -translate-y-1/2 rounded-full border-[1.5px] border-(--thread)" aria-hidden />
          <input
            id={`${id}-q`}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={wood === "red" ? "Search: mala, pen, powder" : "Search: attar, incense, fan"}
            autoComplete="off"
            className="s3-input pl-6"
          />
        </div>
        <div className="relative">
          <label htmlFor={`${id}-s`} className="sr-only">
            Sort
          </label>
          <select id={`${id}-s`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="s3-input">
            {SORTS.map((s) => (
              <option key={s.key} value={s.key}>
                Sort: {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2 lg:col-span-1">
          <PriceThread band={band} onChange={setBand} />
        </div>
        <button type="button" className="s3-toggle col-span-2 justify-self-start lg:col-span-1" aria-pressed={editionsOnly} onClick={() => setEditionsOnly(!editionsOnly)}>
          <span className="s3-mala" aria-hidden />
          Editions and limited
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3">
        <p className="text-[15px] text-(--muted)" aria-live="polite">
          {list.length === all.length && !filtered
            ? `${capital(inWords(all.length))} pieces of ${CONTENT[wood].name.toLowerCase()}`
            : `${list.length} of ${all.length} ${list.length === 1 ? "piece" : "pieces"}`}
        </p>
        {filtered && (
          <button type="button" onClick={clear} className="s3-link text-[15px]">
            Clear the filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <Empty wood={wood} q={q} onClear={clear} />
      ) : grouped ? (
        <div className="mt-10 space-y-20 md:space-y-24">
          {cats.map((x) => {
            const pieces = list.filter((p) => p.category === x.id);
            if (!pieces.length) return null;
            return (
              <section key={x.id} aria-labelledby={`${id}-${x.id}`}>
                <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
                  <div>
                    <h2 id={`${id}-${x.id}`} className="s3-serif text-[clamp(2rem,3.4vw,3.2rem)] leading-[1]">
                      {x.label}
                    </h2>
                    <p className="mt-2 text-[16px] text-(--ink)/70">{x.line}</p>
                  </div>
                  {pieces.length > PER_STRAND && (
                    <button type="button" className="s3-link text-[15px]" onClick={() => setCategoryUrl(x.id)}>
                      All {pieces.length} on this strand
                    </button>
                  )}
                </div>
                <ul className="s3-meds s3-meds-even mt-8">
                  {pieces.slice(0, PER_STRAND).map((p, i) => (
                    <Medallion key={p.slug} p={p} priority={x.id === cats[0].id && i < 2} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      ) : (
        <Results key={`${category}|${q}|${sort}|${band}|${editionsOnly}`} list={list} />
      )}

      <OtherWood wood={wood} />
    </div>
  );
}

/** Short names for the four price lengths; the full range is in the title. */
const BAND_SHORT: Record<string, string> = { u3: "Under ₹3k", "3-10": "₹3k–10k", "10-25": "₹10k–25k", "25p": "Over ₹25k" };

/** One thread knotted into four lengths of price. The chosen length takes three beads; choosing it again lets them go. */
function PriceThread({ band, onChange }: { band: string | undefined; onChange: (b: string | undefined) => void }) {
  return (
    <div role="group" aria-label="Price" className="s3-price">
      {PRICE_BANDS.map((b, i) => (
        <button key={b.id} type="button" className="s3-price-seg" aria-pressed={band === b.id} title={b.label} onClick={() => onChange(band === b.id ? undefined : b.id)}>
          {BAND_SHORT[b.id] ?? b.label}
          {i < PRICE_BANDS.length - 1 && <span className="s3-price-knot" aria-hidden />}
        </button>
      ))}
    </div>
  );
}

function CatBead({ on, label, n, onClick }: { on: boolean; label: string; n: number; onClick: () => void }) {
  return (
    <button type="button" className="s3-cat" aria-pressed={on} onClick={onClick}>
      <span className="s3-cat-bead" aria-hidden />
      <span>{label}</span>
      <span className="s3-cat-n">{n}</span>
    </button>
  );
}

/** A flat strand of results, twelve at a time. */
function Results({ list }: { list: Product[] }) {
  const [shown, setShown] = useState(PAGE);
  const rest = list.length - shown;
  return (
    <>
      <ul className="s3-meds mt-10">
        {list.slice(0, shown).map((p) => (
          <Medallion key={p.slug} p={p} />
        ))}
      </ul>
      {rest > 0 && (
        <div className="mt-14 flex flex-col items-center gap-3">
          <span className="flex items-center gap-2" aria-hidden>
            {Array.from({ length: Math.min(rest, 12) }, (_, i) => (
              <span key={i} className="s3-bead h-2 w-2 opacity-60" />
            ))}
          </span>
          <button type="button" className="s3-btn s3-btn-line" onClick={() => setShown((n) => n + PAGE)}>
            String {Math.min(rest, PAGE)} more
          </button>
          <p className="text-[14px] text-(--muted)">{rest} still to come</p>
        </div>
      )}
    </>
  );
}

function Empty({ wood, q, onClear }: { wood: Wood; q: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center py-20 text-center md:py-28">
      <svg width="220" height="40" viewBox="0 0 220 40" aria-hidden>
        <path d="M0 20 C 40 20, 60 22, 92 21" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        <path d="M128 23 C 160 24, 180 20, 220 20" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        <circle cx="92" cy="21" r="4" fill="#8f6c3c" />
        <circle cx="128" cy="23" r="4" fill="#8f6c3c" />
      </svg>
      <h2 className="s3-serif mt-8 text-[clamp(2rem,4vw,3.2rem)] leading-[1]">Nothing on this thread</h2>
      <p className="mt-4 max-w-[30rem] text-[16px] leading-[1.6] text-(--ink)/75">
        No {wood} sandalwood piece matches {q.trim() ? `"${q.trim()}"` : "these filters"}. Try a wider price, or another word.
        {wood === "red" && /oil|attar|incense|scent|fan|soap|candle/i.test(q) && " Oils and incense are in white sandalwood."}
        {wood === "white" && /pen|chess|cuff|ring|bangle|coaster|ubtan/i.test(q) && " Pens, jewellery and coasters are in red sandalwood."}
      </p>
      <button type="button" className="s3-btn s3-btn-dark mt-7" onClick={onClear}>
        <span className="s3-bead s3-btn-bead" aria-hidden />
        Clear the filters
      </button>
    </div>
  );
}

/** A small invitation to the other wood's shop. */
function OtherWood({ wood }: { wood: Wood }) {
  const other: Wood = wood === "red" ? "white" : "red";
  const flip = useFlipWood();
  const o = CONTENT[other];
  return (
    <aside className="mt-24 grid items-center gap-6 rounded-[32px] border border-(--line) bg-(--warm) p-6 md:mt-32 md:grid-cols-[auto_minmax(0,1fr)_auto] md:gap-8 md:p-9">
      <span className="flex items-center" aria-hidden>
        <span className="h-px w-10 bg-(--thread)" />
        <span className="s3-bead h-14 w-14" data-w={other} />
        <span className="h-px w-10 bg-(--thread)" />
      </span>
      <div>
        <p className="s3-serif text-[clamp(1.6rem,2.6vw,2.3rem)] leading-[1.05]">The other strand: {o.name.toLowerCase()}</p>
        <p className="mt-2 max-w-[40rem] text-[16px] leading-[1.6] text-(--ink)/75">
          {other === "white"
            ? `${capital(inWords(productsFor("white").length))} different pieces: heartwood oil and attar, incense, chandan, pale beads and Mysuru carving. None of them is repeated here.`
            : `${capital(inWords(productsFor("red").length))} different pieces: malas, turned objects, powder, gifting and jewellery in the dense red wood. None of them is repeated here.`}
        </p>
      </div>
      <button
        type="button"
        className="s3-btn s3-btn-line justify-self-start"
        onClick={() => {
          flip(other);
          glideTo(0);
        }}
      >
        <span className="s3-bead s3-btn-bead" data-w={other} aria-hidden />
        Show the {other} shop
      </button>
    </aside>
  );
}
