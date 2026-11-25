"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, PRICE_BANDS, productsFor, queryProducts, SORTS, type CategoryId, type SortKey } from "@/lib/shop/products";
import { setWoodQuietly, switchWood, type Wood } from "@/lib/wood";
import { IconArrow, IconClose, IconSearch } from "../Icons";
import { StackSheet } from "../Stack";
import { HOME, otherWood, scrollToY, SHOP, shopHref, WOODS } from "../store";
import { shotOf, ShotPhoto, type Shot7 } from "../shots";
import { ProductCard } from "./ProductCard";

const PAGE = 12;
const PER_SHEET = 4;

const COPY: Record<Wood, { sub: string; invite: string; search: string; empty: string }> = {
  red: {
    sub: "Beads, everyday objects, powder, gifts and jewellery turned from Pterocarpus santalinus. Dense, deep red and almost without scent. Every piece leaves with its batch record.",
    invite: "Malas, turned objects and jewellery, dense and deep red.",
    search: "Malas, bowls, powder, cuffs",
    empty: "Nothing in red sandalwood matches that.",
  },
  white: {
    sub: "Oil, attar, incense, chandan, beads and Mysuru carving from Santalum album heartwood. Pale gold and fragrant. Every bottle and box carries its lot.",
    invite: "Oil, attar, chandan and Mysuru carving, pale gold and fragrant.",
    search: "Oil, attar, incense, fans",
    empty: "Nothing in white sandalwood matches that.",
  },
};

const woodOfCategory = (c: string | null): Wood | null => {
  for (const w of WOODS) if (CATEGORIES[w].some((x) => x.id === c)) return w;
  return null;
};

/** The shop: both woods render (each with its own filters); CSS shows the current one. */
export function ShopView() {
  const c = useSearchParams().get("c");

  // A category link names its wood (categories never overlap), so the site follows it.
  useEffect(() => {
    const w = woodOfCategory(c);
    if (w) setWoodQuietly(w);
  }, [c]);

  return <W red={<ShopDeck wood="red" c={c} />} white={<ShopDeck wood="white" c={c} />} />;
}

function ShopDeck({ wood, c }: { wood: Wood; c: string | null }) {
  const cats = CATEGORIES[wood];
  const all = productsFor(wood);
  const cat: CategoryId | "all" = cats.some((x) => x.id === c) ? (c as CategoryId) : "all";
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>(undefined);
  const [eds, setEds] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [pinned, setPinned] = useState(false);
  const header = useRef<HTMLDivElement>(null);
  const k = COPY[wood];
  const other = otherWood(wood);

  const list = queryProducts(wood, { category: cat, q, sort, band, editionsOnly: eds });
  const visible = list.slice(0, shown);
  const sheets: (typeof list)[] = [];
  for (let i = 0; i < visible.length; i += PER_SHEET) sheets.push(visible.slice(i, i + PER_SHEET));
  const filtered = cat !== "all" || q.trim() !== "" || !!band || eds;
  const elsewhere = q.trim() ? queryProducts(other, { q }) : [];

  useEffect(() => {
    const el = header.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setPinned(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const chooseCat = (id: CategoryId | "all") => {
    window.history.replaceState(null, "", id === "all" ? SHOP : shopHref(id));
    setShown(PAGE);
  };
  const clear = () => {
    chooseCat("all");
    setQ("");
    setBand(undefined);
    setEds(false);
    setSort("featured");
  };

  const chip = (on: boolean) =>
    `inline-flex h-10 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-medium transition active:scale-95 ${
      on ? "bg-(--s7-ink) text-(--s7-page)" : "bg-(--s7-surface)/70 ring-1 ring-(--s7-ink)/10 hover:bg-(--s7-surface) hover:ring-(--s7-ink)/30"
    }`;

  return (
    <div className="px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      {/* the header card: title, categories as a row of small cards, and the filters */}
      <section ref={header} aria-label="Find a piece" className="relative rounded-[28px] bg-(--s7-sand) px-4 pb-5 pt-5 md:rounded-[40px] md:px-8 md:pb-8 md:pt-7 lg:rounded-[48px] lg:px-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[14px] text-(--s7-muted)">
            <Link href={HOME} className="underline-offset-4 transition hover:text-(--s7-ink) hover:underline">
              Santalum Maison
            </Link>
            <span aria-hidden>/</span>
            <span className="text-(--s7-ink)">Shop</span>
          </nav>
          <button
            type="button"
            onClick={() => switchWood(other)}
            className="group flex items-center gap-3 self-start rounded-[22px] bg-(--s7-surface)/70 p-2 pr-4 text-left ring-1 ring-(--s7-ink)/8 transition hover:bg-(--s7-surface) hover:ring-(--s7-ink)/25 active:scale-[0.98] md:max-w-[360px]"
          >
            <span aria-hidden className={`size-11 shrink-0 rounded-full ${other === "red" ? "ring-red" : "ring-white"}`} />
            <span className="min-w-0">
              <span className="block text-[14px] font-medium">Also in {CONTENT[other].name.toLowerCase()}</span>
              <span className="block text-[13px] leading-snug text-(--s7-muted)">{COPY[other].invite}</span>
            </span>
            <IconArrow width={16} height={16} className="shrink-0 transition group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="mt-6 grid gap-4 lg:mt-4 lg:grid-cols-12 lg:items-end lg:gap-8">
          <h1 className="d1 text-[clamp(3.4rem,12vw,9.5rem)] lg:col-span-8">
            {CONTENT[wood].name}
            <sup className="num ml-2 align-top text-[0.22em] font-medium tracking-normal text-(--s7-accent)">{all.length}</sup>
          </h1>
          <p className="max-w-[46ch] text-[16px] leading-relaxed text-(--s7-body) lg:col-span-4 lg:pb-3">{k.sub}</p>
        </div>

        {/* categories: a row of small cards; the chosen one lifts out of the row */}
        <div role="group" aria-label="Category" className="s7-noscroll -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-2 pt-3 md:-mx-8 md:px-8 lg:-mx-10 lg:px-10">
          <CatCard label="Everything" count={all.length} on={cat === "all"} onClick={() => chooseCat("all")} wood={wood} />
          {cats.map((x) => {
            const inCat = all.filter((p) => p.category === x.id);
            return (
              <CatCard
                key={x.id}
                label={x.label}
                count={inCat.length}
                photo={inCat[0] ? shotOf(inCat[0]) : undefined}
                on={cat === x.id}
                onClick={() => chooseCat(x.id)}
                wood={wood}
              />
            );
          })}
        </div>
        {cat !== "all" && <p className="mt-2 text-[15px] text-(--s7-muted)">{cats.find((x) => x.id === cat)?.line}</p>}

        {/* filters */}
        <div className="mt-5 grid gap-3 border-t border-(--s7-ink)/10 pt-5 lg:grid-cols-[minmax(240px,1fr)_auto] lg:items-center">
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="relative flex-1">
              <span className="sr-only">Search {CONTENT[wood].name.toLowerCase()}</span>
              <IconSearch width={18} height={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--s7-muted)" />
              <input
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setShown(PAGE);
                }}
                placeholder={k.search}
                autoComplete="off"
                className="s7-input h-11 rounded-full! py-0 pl-11"
              />
            </label>
            <label className="flex items-center gap-2">
              <span className="text-[14px] text-(--s7-muted)">Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="s7-input h-11 w-auto rounded-full! py-0 text-[15px]">
                {SORTS.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div role="group" aria-label="Price and editions" className="s7-noscroll -mx-4 flex gap-1.5 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0 lg:justify-end">
            <button type="button" aria-pressed={!band} onClick={() => { setBand(undefined); setShown(PAGE); }} className={chip(!band)}>
              Any price
            </button>
            {PRICE_BANDS.map((b) => (
              <button
                key={b.id}
                type="button"
                aria-pressed={band === b.id}
                onClick={() => {
                  setBand(band === b.id ? undefined : b.id);
                  setShown(PAGE);
                }}
                className={chip(band === b.id)}
              >
                {b.label}
              </button>
            ))}
            <button
              type="button"
              aria-pressed={eds}
              onClick={() => {
                setEds(!eds);
                setShown(PAGE);
              }}
              className={chip(eds)}
            >
              <span aria-hidden className={`size-2 rounded-full ${eds ? "bg-(--s7-accent)" : "bg-(--s7-ink)/25"}`} />
              Editions and limited
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="num text-[15px]" aria-live="polite">
            <span className="font-medium">{list.length}</span> {list.length === 1 ? "piece" : "pieces"}
            {cat !== "all" ? ` in ${cats.find((x) => x.id === cat)?.label}` : ""}
          </p>
          {filtered && (
            <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-[14px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4 transition hover:decoration-(--s7-ink)">
              <IconClose width={14} height={14} />
              Clear the filters
            </button>
          )}
        </div>
      </section>

      {/* results: sheets of four that stack as you scroll */}
      <div className="relative mt-2 pb-[150px] md:mt-3 lg:pb-[96px]">
        {list.length === 0 ? (
          <StackSheet tint="var(--s7-surface)">
            <div className="grid gap-6 px-5 py-10 md:grid-cols-12 md:px-10 md:py-14">
              <div className="md:col-span-7">
                <p className="d2 text-[clamp(2.4rem,5vw,4.4rem)]">{k.empty}</p>
                <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-(--s7-muted)">
                  Try fewer filters, or a plainer word: the name of the piece, or what it is for.
                </p>
                <button
                  type="button"
                  onClick={clear}
                  className="mt-6 inline-flex h-12 items-center rounded-full bg-(--s7-ink) px-6 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98]"
                >
                  Show all {all.length} pieces
                </button>
              </div>
              {elsewhere.length > 0 && (
                <div className="rounded-[24px] bg-(--s7-sand) p-5 md:col-span-5">
                  <p className="text-[15px]">
                    {elsewhere.length} {elsewhere.length === 1 ? "piece" : "pieces"} in {CONTENT[other].name.toLowerCase()} {elsewhere.length === 1 ? "matches" : "match"} &ldquo;{q.trim()}&rdquo;.
                  </p>
                  <ul className="mt-3 grid gap-1 text-[15px] font-medium">
                    {elsewhere.slice(0, 3).map((p) => (
                      <li key={p.slug}>{p.name}</li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={() => switchWood(other)}
                    className="mt-4 inline-flex h-11 items-center rounded-full px-5 text-[14.5px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface) active:scale-[0.98]"
                  >
                    Look in {CONTENT[other].name.toLowerCase()}
                  </button>
                </div>
              )}
            </div>
          </StackSheet>
        ) : (
          sheets.map((group, i) => (
            <StackSheet key={`${cat}-${sort}-${i}`} tint={i % 2 ? "var(--s7-clay)" : "var(--s7-surface)"}>
              <div className="p-2 md:p-3">
                <p className="num px-2 pb-2.5 pt-1.5 text-[13.5px] text-(--s7-muted) md:px-3 md:pb-3">
                  {i * PER_SHEET + 1}&ndash;{i * PER_SHEET + group.length} of {list.length}
                </p>
                <ul className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
                  {group.map((p) => (
                    <li key={p.slug}>
                      <ProductCard product={p} />
                    </li>
                  ))}
                </ul>
              </div>
            </StackSheet>
          ))
        )}
        {list.length > shown && (
          <StackSheet tint="var(--s7-ink)">
            <div className="flex flex-col items-start gap-4 px-5 py-8 text-(--s7-page) md:flex-row md:items-center md:justify-between md:px-10 md:py-10">
              <p className="d2 text-[clamp(2.2rem,4.4vw,3.8rem)]">
                {list.length - shown} more under this card
              </p>
              <button
                type="button"
                onClick={() => setShown(shown + PAGE)}
                className="inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-page) pl-6 pr-2 text-[15px] font-medium text-(--s7-ink) transition hover:bg-(--s7-accent) hover:text-white active:scale-[0.98]"
              >
                Deal the next {Math.min(PAGE, list.length - shown)}
                <span className="grid size-8 place-items-center rounded-full bg-(--s7-ink)/10">
                  <IconArrow dir="down" width={16} height={16} />
                </span>
              </button>
            </div>
          </StackSheet>
        )}
      </div>

      {/* once the header has scrolled away: the count and a way back to the filters */}
      <AnimatePresence>
        {pinned && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="fixed right-3 top-3 z-[140] flex items-center gap-1 rounded-full bg-(--s7-page)/90 p-1 pl-4 shadow-[0_16px_34px_-20px_rgba(27,23,18,0.6)] ring-1 ring-(--s7-ink)/10 backdrop-blur-xl md:right-5 md:top-5"
          >
            <span className="num text-[14px]">
              {list.length} {list.length === 1 ? "piece" : "pieces"}
            </span>
            <button
              type="button"
              onClick={() => scrollToY(0)}
              className="ml-2 h-9 rounded-full bg-(--s7-ink) px-4 text-[13.5px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-95"
            >
              Refine
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CatCard({
  label,
  count,
  photo,
  on,
  onClick,
  wood,
}: {
  label: string;
  count: number;
  photo?: Shot7;
  on: boolean;
  onClick: () => void;
  wood: Wood;
}) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`group relative flex h-[150px] w-[118px] shrink-0 flex-col overflow-hidden rounded-[20px] p-1.5 text-left transition duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.97] md:h-[176px] md:w-[142px] md:rounded-[24px] ${
        on
          ? "-translate-y-2 bg-(--s7-ink) text-(--s7-page) shadow-[0_18px_30px_-18px_rgba(27,23,18,0.7)]"
          : "bg-(--s7-surface) shadow-[0_10px_24px_-20px_rgba(27,23,18,0.5)] hover:-translate-y-1"
      }`}
    >
      <span className="relative block flex-1 overflow-hidden rounded-[15px] md:rounded-[18px]">
        {photo ? (
          <ShotPhoto shot={photo} sizes="142px" className="transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <span aria-hidden className={`absolute inset-0 ${wood === "red" ? "ring-red" : "ring-white"}`} />
        )}
      </span>
      <span className="block px-1.5 pb-1 pt-2 text-[13px] font-medium leading-tight md:text-[14px]">{label}</span>
      <span className={`num block px-1.5 pb-0.5 text-[12px] ${on ? "text-(--s7-page)/65" : "text-(--s7-muted)"}`}>
        {count} {count === 1 ? "piece" : "pieces"}
      </span>
    </button>
  );
}
