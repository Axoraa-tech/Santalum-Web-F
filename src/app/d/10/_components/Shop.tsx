"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, categoryOf, PRICE_BANDS, priceLabel, productsFor, queryProducts, SORTS, type CategoryId, type SortKey } from "@/lib/shop/products";
import { switchWood, type Wood } from "@/lib/wood";
import k from "../k";
import { AddOrChoose, editionLine, Field, RatingInline, SelectField, Stretch, Thumb, Wish } from "./bits";
import { seededRating } from "@/lib/shop/reviews-data";
import { useRowFit } from "./Collection";
import { scrollToTop, splitName } from "./lib";

const PAGE = 12;

const INTRO: Record<Wood, string> = {
  red: "Beads, objects, powder, gifting and jewellery, turned and carved from the dense red heartwood. Every piece leaves with its batch record.",
  white: "Oil, attar, incense, chandan, beads and Mysuru carving from Santalum album. Every bottle and box carries its lot.",
};
const HINT: Record<Wood, string> = { red: "mala, bowl, powder, cuff", white: "oil, attar, stone, fan" };

/** Reads ?c= (inside Suspense) and renders both woods' shops; CSS shows the current one. */
export function ShopRoute() {
  const c = useSearchParams().get("c");
  return <ShopBoth c={c} />;
}

export function ShopBoth({ c }: { c: string | null }) {
  return <W red={<ShopView wood="red" c={c} />} white={<ShopView wood="white" c={c} />} />;
}

/**
 * The shop as a typographic list. Categories are words in a column (the chosen one stretched wide),
 * the result count is one huge number, and each piece is a row whose name stretches on hover while
 * its pill photograph turns to the second shot.
 */
function ShopView({ wood, c }: { wood: Wood; c: string | null }) {
  const cats = CATEGORIES[wood];
  const all = productsFor(wood);
  const content = CONTENT[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const cat: CategoryId | "all" = cats.some((x) => x.id === c) ? (c as CategoryId) : "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [ed, setEd] = useState(false);
  const key = [cat, q.trim().toLowerCase(), sort, band ?? "", ed ? 1 : 0].join("|");
  const [page, setPage] = useState({ key, n: PAGE });
  const n = page.key === key ? page.n : PAGE;
  const list = useMemo(() => queryProducts(wood, { category: cat, q, sort, band, editionsOnly: ed }), [wood, cat, q, sort, band, ed]);
  const shown = list.slice(0, n);
  const listRef = useRef<HTMLUListElement>(null);
  const otherRef = useRef<HTMLDivElement>(null);
  useRowFit(listRef, `${key}|${n}`, [0.1, 0.052]);
  useRowFit(otherRef, wood);

  const setCat = (id: CategoryId | "all") => {
    window.history.replaceState(null, "", id === "all" ? "/d/10/shop" : `/d/10/shop?c=${id}`);
  };
  const filtered = cat !== "all" || q.trim() !== "" || !!band || ed;
  const clear = () => {
    setQ("");
    setBand(undefined);
    setEd(false);
    setCat("all");
  };
  const count = (id: CategoryId) => all.filter((p) => p.category === id).length;
  const catLine = cat === "all" ? INTRO[wood] : cats.find((x) => x.id === cat)?.line;

  return (
    <div className="pb-10 pt-24 md:pt-28">
      <div className={k.gut}>
        <p className={`${k.mono} flex flex-wrap justify-between gap-x-6 gap-y-1 text-[var(--k10-grey)]`}>
          <span>The shop, {content.name.toLowerCase()}</span>
          <span>
            {all.length} pieces, <i>{content.latin}</i>
          </span>
        </p>
        <Stretch text={content.name} cap={0.3} className="mt-3" />
      </div>

      <div className={`${k.gut} mt-8 grid grid-cols-1 gap-8 md:mt-10 md:grid-cols-12 md:gap-8`}>
        <nav aria-label={`${content.name} shelves`} className="md:col-span-7">
          <ul className="border-t border-[var(--k10-ink)]">
            {[{ id: "all" as const, label: "Everything", n: all.length }, ...cats.map((x) => ({ id: x.id, label: x.label, n: count(x.id) }))].map((x) => (
              <li key={x.id} className="border-b border-[var(--k10-line)]">
                <button
                  type="button"
                  aria-pressed={cat === x.id}
                  onClick={() => setCat(x.id)}
                  className={`${k.tab} flex w-full items-baseline justify-between gap-4 py-1 text-left text-[length:clamp(26px,3.4vw,54px)]`}
                >
                  <span className="min-w-0">{x.label}</span>
                  <span className={`${k.mono} tabular-nums text-[var(--k10-grey)]`}>{x.n}</span>
                </button>
              </li>
            ))}
          </ul>
          <p className={`${k.monoL} mt-4 max-w-[60ch]`}>{catLine}</p>
        </nav>

        <div className="flex flex-col justify-between gap-8 md:col-span-5">
          <div className="flex items-end justify-between gap-4 md:justify-end">
            <p className={`${k.mono} max-w-[16ch] pb-3 text-[var(--k10-grey)] md:text-right`} aria-live="polite">
              {list.length === 1 ? "piece shows" : "pieces show"} with these filters
            </p>
            <p
              key={list.length}
              aria-hidden
              className={`${k.disp} ${k.titleL} text-[length:clamp(120px,15vw,240px)] leading-[0.78] tabular-nums text-[var(--k10-accent)]`}
            >
              {list.length}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <Field small label={`Search ${content.name.toLowerCase()}`} name={`q-${wood}`} type="search" autoComplete="off" placeholder={HINT[wood]} value={q} onChange={(e) => setQ(e.target.value)} />
            <SelectField small label="Sort" name={`sort-${wood}`} value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
              {SORTS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </SelectField>
          </div>
        </div>
      </div>

      <div className={`${k.gut} mt-8 flex flex-wrap items-center gap-2 border-t border-[var(--k10-line)] pt-4`}>
        <span className={`${k.mono} mr-2 text-[var(--k10-grey)]`}>Price</span>
        {PRICE_BANDS.map((b) => (
          <button key={b.id} type="button" aria-pressed={band === b.id} onClick={() => setBand(band === b.id ? undefined : b.id)} className={k.chip}>
            {b.label}
          </button>
        ))}
        <button type="button" aria-pressed={ed} onClick={() => setEd(!ed)} className={`${k.chip} md:ml-4`}>
          Editions and limited
        </button>
        {filtered && (
          <button type="button" onClick={clear} className={`${k.mono} ${k.link} ml-auto`}>
            Clear the filters
          </button>
        )}
      </div>

      {list.length === 0 ? (
        <div className={`${k.gut} mt-8 border-t border-[var(--k10-ink)] pb-6 pt-10`}>
          <p className={`${k.disp} whitespace-normal text-[length:clamp(56px,10vw,170px)] leading-[0.82] text-[var(--k10-grey)] [font-variation-settings:'wdth'_50,'wght'_260]`}>
            Nothing on this shelf
          </p>
          <p className={`${k.monoL} mt-6 max-w-[56ch]`}>
            No {content.name.toLowerCase()} piece matches {q.trim() ? `“${q.trim()}” with ` : ""}these filters. Clear them, or try a plainer word.
          </p>
          <button type="button" onClick={clear} className={`${k.btn} mt-6`}>
            <span className={k.btnLabel}>Clear the filters</span>
          </button>
        </div>
      ) : (
        <ul ref={listRef} className={`${k.rows} mt-8 border-t border-[var(--k10-ink)]`}>
          {shown.map((p) => {
            const { head, tail } = splitName(p.name);
            const extra = editionLine(p);
            return (
              <li
                key={p.slug}
                data-row
                className={`${k.srow} ${k.gut} grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-[var(--k10-line)] py-3 md:grid-cols-[auto_minmax(0,1fr)_13rem_auto] md:gap-x-6 md:py-2`}
              >
                <Link href={`/d/10/p/${p.slug}`} tabIndex={-1} aria-hidden>
                  <Thumb p={p} sizes="(min-width: 768px) 160px, 100px" className="h-[60px] w-[100px] md:h-[88px] md:w-[156px]" />
                </Link>
                <div data-slot className="min-w-0">
                  <Link href={`/d/10/p/${p.slug}`} className="block">
                    <span data-name className={`${k.rowName} block w-max text-[10vw] md:text-[5.2vw]`}>
                      {head}
                    </span>
                  </Link>
                  <p className={`${k.mono} mt-1 truncate text-[var(--k10-grey)]`}>
                    {tail ? `${tail}. ` : ""}
                    {p.short}
                  </p>
                </div>
                <div className="col-span-2 flex flex-wrap items-center gap-x-3 gap-y-1 md:col-span-1 md:block md:text-right">
                  <p className={`${k.monoL} tabular-nums`}>{priceLabel(p)}</p>
                  <RatingInline {...seededRating(p.slug)} className="md:mt-1 md:justify-end" />
                  <p className="flex flex-wrap gap-1.5 md:mt-1 md:justify-end">
                    {p.badge && <span className={k.badge}>{p.badge}</span>}
                    {extra && <span className={`${k.badge} !bg-transparent !text-[var(--k10-accent)] shadow-[inset_0_0_0_1px_var(--k10-accent)]`}>{extra}</span>}
                    <span className={`${k.mono} text-[var(--k10-grey)] md:hidden`}>{categoryOf(p).label}</span>
                  </p>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:justify-end">
                  <Wish p={p} />
                  <AddOrChoose p={p} />
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {list.length > n && (
        <div className={`${k.gut} flex flex-wrap items-center justify-between gap-4 pt-8`}>
          <p className={`${k.mono} text-[var(--k10-grey)] tabular-nums`}>
            {n} of {list.length} shown
          </p>
          <button type="button" onClick={() => setPage({ key, n: n + PAGE })} className={`${k.btn} ${k.ghost} w-full sm:w-auto sm:min-w-[340px]`}>
            <span className={k.btnLabel}>Show {Math.min(PAGE, list.length - n)} more</span>
          </button>
        </div>
      )}

      {/* the other wood's shop: crossing over changes the whole house */}
      <div ref={otherRef} className="mt-14">
        <button
          type="button"
          data-row
          data-big
          onClick={() => {
            switchWood(other);
            setCat("all");
            scrollToTop();
          }}
          className={`${k.row} ${k.gut} block w-full border-t border-[var(--k10-ink)] pb-8 pt-6 text-left`}
        >
          <span className={`${k.mono} flex flex-wrap justify-between gap-x-6 gap-y-1 text-[var(--k10-grey)]`}>
            <span>The other shop: the whole house changes with it</span>
            <span>{productsFor(other).length} pieces</span>
          </span>
          <span data-slot className="mt-3 block min-w-0">
            <span data-name className={`${k.rowName} block w-max text-[12vw]`}>
              {CONTENT[other].name}
            </span>
          </span>
          <span className={`${k.monoL} mt-3 block max-w-[64ch]`}>
            {other === "white"
              ? "Oil, attar, incense, chandan and Mysuru carving, from the fragrant heartwood of Santalum album."
              : "Malas, objects, powder and jewellery turned from the dense red heartwood of Pterocarpus santalinus."}
          </span>
        </button>
      </div>
    </div>
  );
}
