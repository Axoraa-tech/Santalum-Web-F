"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import {
  CATEGORIES,
  PRICE_BANDS,
  SORTS,
  categoryOf,
  priceLabel,
  productsFor,
  queryProducts,
  type CategoryId,
  type Product,
  type SortKey,
} from "@/lib/shop/products";
import { setWoodQuietly, type Wood } from "@/lib/wood";
import s from "../styles";
import { Keep } from "./Buy";
import { CardRating } from "./Stars";
import { CATEGORY_MIN, EASE, hhmm, hourOf, other, word } from "./data";
import { Field, SelectField } from "./forms";
import { addPiece, scrollToY, swapWood } from "./store";

const PAGE = 12;
const SHAPES = ["arch", "egg", "pebble"] as const;

type Cat = CategoryId | "all";

/** Reads `?c=` (a category) for one wood. A category from the other wood brings the site over to that wood. */
export function ShopFromUrl({ wood }: { wood: Wood }) {
  const sp = useSearchParams();
  const c = sp.get("c");
  const mine = CATEGORIES[wood].some((x) => x.id === c);
  useEffect(() => {
    if (mine) setWoodQuietly(wood);
  }, [mine, wood]);
  return <ShopView wood={wood} initial={mine ? (c as CategoryId) : "all"} />;
}

/** The shop for one wood: categories as hours of its day, search, sort, price, editions, and the cut-out cards. */
export function ShopView({ wood, initial = "all" }: { wood: Wood; initial?: Cat }) {
  const id = useId();
  const [category, setCategory] = useState<Cat>(initial);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [editions, setEditions] = useState(false);
  const [shown, setShown] = useState(PAGE);

  const c = CONTENT[wood];
  const all = productsFor(wood);
  const cats = [...CATEGORIES[wood]].sort((a, b) => CATEGORY_MIN[a.id] - CATEGORY_MIN[b.id]);
  const list = queryProducts(wood, { category, q, sort, band, editionsOnly: editions });
  const visible = list.slice(0, shown);
  const filtered = category !== "all" || q.trim() !== "" || band !== undefined || editions;
  const cat = cats.find((x) => x.id === category);

  const pickCategory = (next: Cat) => {
    setCategory(next);
    setShown(PAGE);
    const url = next === "all" ? "/d/09/shop" : `/d/09/shop?c=${next}`;
    window.history.replaceState(null, "", url);
  };
  const clear = () => {
    pickCategory("all");
    setQ("");
    setBand(undefined);
    setEditions(false);
  };

  return (
    <div>
      {/* categories, each at the hour the wood's day reaches it */}
      <div role="group" aria-label={`${c.name} categories`} className={`${s.rail} mt-12`}>
        <button type="button" aria-pressed={category === "all"} onClick={() => pickCategory("all")} className={s.chip}>
          <span aria-hidden className={s.chipSun} />
          All day
          <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{all.length}</span>
        </button>
        {cats.map((x) => (
          <button key={x.id} type="button" aria-pressed={category === x.id} onClick={() => pickCategory(x.id)} className={s.chip}>
            <span aria-hidden className={s.chipSun} />
            <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{hhmm(CATEGORY_MIN[x.id])}</span>
            {x.label}
            <span className={`${s.tab} text-[13px] text-[var(--muted)]`}>{all.filter((p) => p.category === x.id).length}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2 lg:grid-cols-12 lg:items-end">
        <div className="relative lg:col-span-4">
          <Field
            label={`Search the ${c.short.toLowerCase()} shop`}
            type="search"
            name="q"
            autoComplete="off"
            enterKeyHint="search"
            placeholder={wood === "red" ? "Mala, pen, bangle" : "Oil, attar, incense"}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setShown(PAGE);
            }}
          />
        </div>
        <SelectField
          label="Sort"
          name="sort"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as SortKey);
            setShown(PAGE);
          }}
          className="lg:col-span-3"
        >
          {SORTS.map((x) => (
            <option key={x.key} value={x.key}>
              {x.label}
            </option>
          ))}
        </SelectField>
        <div className="md:col-span-2 lg:col-span-5">
          <p id={`${id}-price`} className="text-[13px] text-[var(--muted)]">
            Price
          </p>
          <div role="group" aria-labelledby={`${id}-price`} className={`${s.rail} mt-1.5`}>
            {PRICE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={band === b.id}
                onClick={() => {
                  setBand((cur) => (cur === b.id ? undefined : b.id));
                  setShown(PAGE);
                }}
                className={`${s.chip} min-h-[2.5rem] px-3.5 text-[14px]`}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-col gap-5 border-t border-[var(--hair)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          role="switch"
          aria-checked={editions}
          onClick={() => {
            setEditions((e) => !e);
            setShown(PAGE);
          }}
          className="group flex items-center gap-4 text-left"
        >
          <span
            className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors duration-300 ${
              editions ? "border-[var(--m-accent)] bg-[var(--m-accent)]" : "border-[rgb(42_36_32/0.25)] group-hover:border-[var(--ink)]"
            }`}
          >
            <motion.span
              className={`absolute left-[3px] top-[3px] size-6 rounded-full ${editions ? "bg-[var(--paper)]" : "bg-[var(--ink)]"}`}
              animate={{ x: editions ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 32 }}
            />
          </span>
          <span className="text-[16px]">Editions and limited only</span>
        </button>
        <div className="flex items-baseline gap-5">
          <p aria-live="polite" className="text-[15px] text-[var(--muted)]">
            <span className={`${s.display} text-[30px] leading-none text-[var(--ink)]`}>
              {word(list.length)} {list.length === 1 ? "piece" : "pieces"}
            </span>
            {cat ? <span className="hidden md:inline">, {cat.label.toLowerCase()}</span> : null}
          </p>
          {filtered && (
            <button type="button" onClick={clear} className={s.link}>
              Clear
            </button>
          )}
        </div>
      </div>
      {cat && <p className="mt-3 max-w-[40rem] text-[16px] leading-[1.6] text-[var(--muted)]">{cat.line}</p>}

      {list.length === 0 ? (
        <Empty wood={wood} q={q} onClear={clear} />
      ) : (
        <ul className={`${s.grid} mt-14`}>
          <AnimatePresence initial={false}>
            {visible.map((p, i) => (
              <motion.li
                key={p.slug}
                layout="position"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <Card p={p} i={i} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {list.length > shown && (
        <div className="mt-20 flex flex-col items-center gap-4">
          <div aria-hidden className="h-px w-40 overflow-hidden bg-[var(--hair)]">
            <span className="block h-full bg-[var(--ink)]" style={{ width: `${(shown / list.length) * 100}%` }} />
          </div>
          <p className={`${s.tab} text-[14px] text-[var(--muted)]`}>
            {shown} of {list.length}
          </p>
          <button type="button" onClick={() => setShown((n) => n + PAGE)} className={s.ghost}>
            Show {Math.min(PAGE, list.length - shown)} more
          </button>
        </div>
      )}

      <OtherWood wood={wood} />
    </div>
  );
}

function Card({ p, i }: { p: Product; i: number }) {
  const shape = SHAPES[i % SHAPES.length];
  const alt = p.shots[1];
  const href = `/d/09/p/${p.slug}`;
  return (
    <article className="relative">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden className={`${s.press} block`}>
          <span className={`${s.mask} ${s[shape]} ${shape === "arch" ? s.niche : ""} block aspect-[4/5] w-full`}>
            <span className={`${s.zoom} absolute inset-0`}>
              <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
              {alt && (
                <span className={`${s.cardAlt} absolute inset-0`}>
                  <Photo p={alt.photo} tone={alt.tone} sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 46vw" />
                </span>
              )}
            </span>
          </span>
        </Link>
        <Keep p={p} className="absolute -right-1 -top-1" />
      </div>
      <div className="mt-4">
        <p className="flex flex-wrap items-baseline gap-x-2 text-[12px] text-[var(--muted)]">
          <span className={s.tab}>{hhmm(hourOf(p.slug).min)}</span>
          <span className="hidden sm:inline">{categoryOf(p).label}</span>
          {p.badge && <span className="text-[var(--m-accent)]">{p.badge}</span>}
        </p>
        <h3 className={`${s.display} mt-1 text-[21px] leading-[1.05] sm:text-[24px]`}>
          <Link href={href} className="transition-colors hover:text-[var(--m-accent)]">
            {p.name}
          </Link>
        </h3>
        <CardRating slug={p.slug} className="mt-1.5" />
        <p className="mt-1 text-[15px]">
          <span className={s.tab}>{priceLabel(p)}</span>
          {p.edition && (
            <span className="block text-[13px] text-[var(--m-accent)] sm:inline">
              <span className="hidden sm:inline">, </span>
              {p.edition.left} of {p.edition.size} left
            </span>
          )}
        </p>
        <div className="mt-3">
          {p.options ? (
            <Link href={href} className={`${s.ghost} min-h-[2.75rem] px-4 text-[14px]`}>
              Choose
            </Link>
          ) : (
            <button type="button" onClick={() => addPiece(p.slug)} className={`${s.ghost} min-h-[2.75rem] px-4 text-[14px]`}>
              Add to tray
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function Empty({ wood, q, onClear }: { wood: Wood; q: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center py-24 text-center">
      <svg width="56" height="56" viewBox="0 0 44 44" aria-hidden>
        <defs>
          <mask id={`d09-empty-moon-${wood}`}>
            <rect width="44" height="44" fill="white" />
            <circle cx="30" cy="16" r="16" fill="black" />
          </mask>
        </defs>
        <circle cx="22" cy="22" r="17" style={{ fill: "var(--paper)" }} stroke="rgb(42 36 32 / 0.25)" mask={`url(#d09-empty-moon-${wood})`} />
      </svg>
      <p className={`${s.display} mt-6 text-[clamp(2.2rem,6vw,3.4rem)] leading-none`}>Nothing at this hour</p>
      <p className="mt-4 max-w-[28rem] text-[16px] leading-[1.65] text-[var(--muted)]">
        No {CONTENT[wood].name.toLowerCase()} piece matches {q.trim() ? `“${q.trim()}” with ` : ""}these filters. Try another word, or start the day again.
      </p>
      <button type="button" onClick={onClear} className={`${s.ghost} mt-7`}>
        Clear the filters
      </button>
    </div>
  );
}

const OTHER = {
  red: { line: "Beads, desk objects, powder and jewellery, dense and deep red.", a: PHOTOS.redGrain, b: PHOTOS.malaHand },
  white: { line: "Oil and attar, incense, chandan and Mysuru carving, pale and fragrant.", a: PHOTOS.whiteLog, b: PHOTOS.oilHands },
} as const;

/** A small invitation to the other wood's day. */
function OtherWood({ wood }: { wood: Wood }) {
  const o = other(wood);
  const oc = CONTENT[o];
  return (
    <aside aria-label={`The ${oc.name.toLowerCase()} shop`} className="mt-28 grid items-center gap-10 border-t border-[var(--hair)] pt-12 md:grid-cols-12 md:gap-8">
      <div className="relative h-56 md:col-span-4 md:h-64">
        <div className="absolute left-3 top-3 h-[calc(100%-12px)] w-[46%] max-w-[12rem]">
          <div className={`${s.mask} ${s.arch} ${s.niche} size-full`}>
            <Photo p={OTHER[o].a} sizes="200px" />
          </div>
        </div>
        <div className="absolute bottom-0 left-[40%] size-32 md:size-36">
          <div className={`${s.mask} ${s.circle} size-full`}>
            <Photo p={OTHER[o].b} sizes="144px" />
          </div>
        </div>
      </div>
      <div className="md:col-span-7 md:col-start-6">
        <p className="text-[14px] text-[var(--muted)]">The other day</p>
        <p className={`${s.display} mt-2 text-[clamp(2.2rem,5vw,3.6rem)] leading-[0.98]`}>
          {productsFor(o).length} pieces in {oc.name.toLowerCase()}
        </p>
        <p className="mt-4 max-w-[32rem] text-[16px] leading-[1.65] text-[var(--muted)]">
          {OTHER[o].line} {oc.oneLine}
        </p>
        <button
          type="button"
          onClick={() => {
            scrollToY(0);
            swapWood(o);
          }}
          className={`${s.btn} mt-7`}
        >
          See the {oc.short.toLowerCase()} shop
        </button>
      </div>
    </aside>
  );
}
