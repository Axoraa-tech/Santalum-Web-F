"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, categoryOf, PRICE_BANDS, priceLabel, productsFor, queryProducts, SORTS, type CategoryId, type Product, type SortKey } from "@/lib/shop/products";
import { seededRating } from "@/lib/shop/reviews-data";
import { useHydrated } from "@/lib/shop/store";
import { setWoodQuietly, switchWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, GRAIN, other, shotsOf, woodOfCategory } from "./data";
import { views } from "./store";
import { addToBag, IconArrow, IconCheck, IconHeart, IconOpen, IconSearch, Stars } from "./ui";

/**
 * The shop board. Both woods are rendered (CSS shows the current one). A `?c=` category belongs to
 * one wood, so that wood shows from the first paint and the site quietly follows it.
 */
export function ShopBoard({ c }: { c?: string }) {
  const hydrated = useHydrated();
  const cw = woodOfCategory(c);
  useEffect(() => {
    if (cw) setWoodQuietly(cw);
  }, [cw]);
  const force = !hydrated && cw;
  return (
    <div className={force ? `b6-force-${cw}` : undefined} data-b6w={force ? cw : undefined}>
      <W red={<ShopView wood="red" initial={cw === "red" ? (c as CategoryId) : undefined} />} white={<ShopView wood="white" initial={cw === "white" ? (c as CategoryId) : undefined} />} />
    </div>
  );
}

const PAGE = 12;

function ShopView({ wood, initial }: { wood: Wood; initial?: CategoryId }) {
  const [cat, setCat] = useState<CategoryId | "all">(initial ?? "all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState<string | undefined>();
  const [editions, setEditions] = useState(false);
  const [limit, setLimit] = useState(PAGE);
  const all = productsFor(wood);
  const list = queryProducts(wood, { category: cat, q, sort, band, editionsOnly: editions });
  const shown = list.slice(0, limit);
  const c = CONTENT[wood];
  const o = CONTENT[other(wood)];
  const filtered = cat !== "all" || !!q.trim() || !!band || editions;

  const pick = (next: CategoryId | "all") => {
    setCat(next);
    setLimit(PAGE);
    window.history.replaceState(null, "", next === "all" ? "/d/06/shop" : `/d/06/shop?c=${next}`);
  };
  const clear = () => {
    pick("all");
    setQ("");
    setBand(undefined);
    setEditions(false);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* header: the wood, its categories as tiles, and the other wood */}
      <div className="grid gap-3 sm:grid-cols-6 lg:grid-cols-12">
        <div className={cx(s.tile, "flex min-h-[260px] flex-col justify-between gap-6 p-6 sm:col-span-6 sm:p-8 lg:col-span-5 lg:row-span-2")}>
          <div>
            <p className={cx(s.mono, s.muted, "text-[11px]")}>
              The shop, {all.length} pieces
            </p>
            <h1 className={cx(s.display, "mt-3 text-[clamp(44px,9cqw,88px)]")}>{c.name}</h1>
            <p className={cx(s.muted, "mt-4 max-w-[40ch] text-[17px] leading-[1.5]")}>
              {wood === "red"
                ? "Beads, objects, powder, gifting and jewellery, turned and finished by hand. Every piece leaves with its batch record."
                : "Oil and attar, incense and ritual, chandan, beads and Mysuru carving. Heartwood only, with the lot on every label."}
            </p>
          </div>
          <label className="relative block">
            <span className={s.srOnly}>Search {c.name.toLowerCase()}</span>
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--b-muted)]" />
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setLimit(PAGE);
              }}
              placeholder={wood === "red" ? "Mala, pen, bangle" : "Oil, attar, incense"}
              className={cx(s.field, s.fieldIcon)}
              autoComplete="off"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:col-span-6 sm:grid-cols-3 lg:col-span-7">
          <CatTile label="Everything" n={all.length} photo={all[0]} on={cat === "all"} onClick={() => pick("all")} />
          {CATEGORIES[wood].map((k) => {
            const ps = all.filter((p) => p.category === k.id);
            return <CatTile key={k.id} label={k.label} n={ps.length} photo={ps[0]} on={cat === k.id} onClick={() => pick(k.id)} />;
          })}
        </div>

        {/* the other wood's shop: a tile with that wood's grain drawn down one side */}
        <button
          type="button"
          onClick={() => switchWood(other(wood))}
          className={cx(s.tile, "group flex items-stretch text-left transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-span-6 lg:col-span-7")}
        >
          <span aria-hidden className="m-2 mr-0 w-[72px] shrink-0 rounded-[20px] transition-[width] duration-500 group-hover:w-[96px] sm:w-[120px] sm:group-hover:w-[150px]" style={{ background: GRAIN[other(wood)] }} />
          <span className="flex min-w-0 flex-1 items-center gap-4 p-5">
          <span className="min-w-0 flex-1">
            <span className="block text-[17px] font-medium leading-tight">{o.name} is a different shop</span>
            <span className={cx(s.muted, "mt-1 block text-[14px] leading-snug")}>
              {wood === "red" ? "Oil, attar, chandan and Mysuru carving." : "Beads, objects and jewellery in dense red heartwood."} {productsFor(other(wood)).length} pieces.
            </span>
          </span>
          <span className={cx(s.btn, s.btnSm, "shrink-0")}>Visit</span>
          </span>
        </button>
      </div>

      {/* filters */}
      <div className={cx(s.tile, s.stickyLg, "flex flex-wrap items-center gap-2 p-2 pl-4")}>
        <p className={cx(s.mono, "mr-2 text-[12px]")} aria-live="polite">
          {list.length} {list.length === 1 ? "piece" : "pieces"}
        </p>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Price">
          {PRICE_BANDS.map((b) => (
            <button key={b.id} type="button" className={cx(s.chip, s.chipSm)} aria-pressed={band === b.id} onClick={() => setBand(band === b.id ? undefined : b.id)}>
              {b.label}
            </button>
          ))}
          <button type="button" className={cx(s.chip, s.chipSm)} aria-pressed={editions} onClick={() => setEditions(!editions)}>
            Editions and limited
          </button>
        </div>
        <label className="ml-auto flex items-center gap-2">
          <span className={cx(s.muted, "text-[13px]")}>Sort</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={cx(s.field, "h-10 w-auto pr-10 text-[14px]")}>
            {SORTS.map((x) => (
              <option key={x.key} value={x.key}>
                {x.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* results */}
      {list.length === 0 ? (
        <div className={cx(s.tile, "grid gap-6 p-6 sm:grid-cols-2 sm:p-10")}>
          <div>
            <h2 className={cx(s.display, "text-[clamp(32px,6cqw,56px)]")}>Nothing here yet</h2>
            <p className={cx(s.muted, "mt-4 max-w-[42ch] text-[16px] leading-[1.5]")}>
              No {c.name.toLowerCase()} piece matches {q.trim() ? <>&ldquo;{q.trim()}&rdquo; with </> : null}these filters. Clear them, or look in the other wood.
            </p>
          </div>
          <div className="flex flex-wrap content-end gap-2 sm:justify-end">
            <button type="button" className={s.btn} onClick={clear}>
              Clear filters
            </button>
            <button type="button" className={s.ghost} onClick={() => switchWood(other(wood))}>
              Visit {o.name.toLowerCase()}
            </button>
          </div>
        </div>
      ) : (
        <div className={s.grid}>
          {shown.map((p, i) => (
            <ShopCard key={p.slug} p={p} size={!filtered && i % 9 === 0 ? "big" : !filtered && i % 9 === 5 ? "wide" : undefined} />
          ))}
          {list.length > shown.length && (
            <button
              type="button"
              onClick={() => setLimit((n) => n + PAGE)}
              className={cx(s.tile, s.dark, "group flex flex-col justify-between p-6 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99]")}
            >
              <span className={cx(s.mono, "text-[11px] text-white/55")}>
                {shown.length} of {list.length}
              </span>
              <span className="text-[clamp(26px,9cqw,36px)] font-medium leading-none tracking-[-0.04em]">Show {Math.min(PAGE, list.length - shown.length)} more</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function CatTile({ label, n, photo, on, onClick }: { label: string; n: number; photo?: Product; on: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        s.tile,
        "group relative flex min-h-[120px] flex-col justify-end p-3 text-left transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
        on && "shadow-[inset_0_0_0_2px_var(--b-ink)]",
      )}
    >
      {photo && (
        <span className={cx("absolute inset-0 transition-opacity duration-500", on ? "opacity-100" : "opacity-70 group-hover:opacity-100")}>
          <Photo p={shotsOf(photo)[0].photo} tone={shotsOf(photo)[0].tone} sizes="(min-width:1024px) 18vw, 45vw" />
        </span>
      )}
      <span className={cx("relative flex items-center justify-between gap-2 rounded-[14px] px-3 py-2", on ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile)]")}>
        <span className="truncate text-[14px] font-medium">{label}</span>
        <span className={cx(s.mono, "text-[11px] opacity-70")}>{n}</span>
      </span>
    </button>
  );
}

/** A shop card: opens the product view in place; quick add when there is nothing to choose. */
function ShopCard({ p, size }: { p: Product; size?: "big" | "wide" }) {
  const hydrated = useHydrated();
  const wish = useWishlist();
  const saved = hydrated && wish.includes(p.slug);
  const [added, setAdded] = useState(false);
  const id = `shop-${p.slug}`;
  const rating = seededRating(p.slug);
  const [a, b] = shotsOf(p);
  const tag = p.edition ? `${p.edition.left} of ${p.edition.size} left` : (p.badge ?? categoryOf(p).label);
  const add = () => {
    addToBag(p.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };
  return (
    <div className={cx(s.tile, s.t2, s.opener, "group", size === "big" && s.big, size === "wide" && s.wide)}>
      <div className={s.zoom}>
        <Photo p={a.photo} tone={a.tone} sizes={size ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"} />
        {b && (
          <Photo
            p={b.photo}
            tone={b.tone}
            sizes={size ? "(min-width:1024px) 50vw, 100vw" : "(min-width:1024px) 25vw, 50vw"}
            className="opacity-0 transition-opacity duration-700 [@media(hover:hover)]:group-hover:opacity-100"
          />
        )}
      </div>
      <button type="button" className={s.hit} onClick={() => views.open({ kind: "product", slug: p.slug, from: `solo-${id}`, img: false })} aria-label={`Open ${p.name}, ${priceLabel(p)}`} />
      <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 z-[3] max-w-[calc(100%-68px)] truncate rounded-full px-2.5 py-1 text-[10.5px]", p.edition ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile)]")}>
        {tag}
      </span>
      <button
        type="button"
        onClick={() => toggleWishlist(p.slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${p.name} from your wishlist` : `Save ${p.name} to your wishlist`}
        className={cx(s.icon, s.iconSm, s.onWhite, "absolute right-3 top-3 z-[4]")}
      >
        <IconHeart size={16} filled={saved} />
      </button>
      {/* caption: on a half-width card the name takes the full row and the action becomes a round key beside the price */}
      <div className="absolute inset-x-2 bottom-2 z-[4] grid grid-cols-[minmax(0,1fr)_auto] items-end gap-x-2 rounded-[20px] bg-[var(--b-tile)] py-2.5 pl-3.5 pr-2 [grid-template-areas:'n_n'_'p_b'_'s_b'] @min-[250px]:[grid-template-areas:'n_b'_'p_b'_'s_b']">
        <span className="line-clamp-2 text-[15px] font-medium leading-tight tracking-[-0.02em] [grid-area:n] @min-[250px]:line-clamp-1">{p.name}</span>
        <span className={cx(s.mono, s.muted, "mt-0.5 block truncate text-[11px] [grid-area:p]")}>{priceLabel(p)}</span>
        <span className="mt-0.5 flex min-w-0 items-center gap-1.5 [grid-area:s]">
          <Stars value={rating.avg} size={11} />
          <span className={cx(s.mono, s.muted, "text-[10.5px]")}>({rating.count})</span>
        </span>
        <span className="self-end [grid-area:b]">
          {p.options ? (
            <Link href={`/d/06/p/${p.slug}`} aria-label={`Choose an option of ${p.name}`} className="block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent">
              <span className="block @min-[250px]:hidden">
                <span className={cx(s.icon, s.iconSm)}>
                  <IconArrow size={15} />
                </span>
              </span>
              <span className="hidden @min-[250px]:block">
                <span className={cx(s.ghost, s.btnSm)}>Choose</span>
              </span>
            </Link>
          ) : (
            <button type="button" onClick={add} className="block rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" aria-label={added ? `${p.name} added to bag` : `Add ${p.name} to bag`}>
              <span className="block @min-[250px]:hidden">
                <span className={cx(s.icon, s.iconSm, s.iconInk)}>{added ? <IconCheck size={15} /> : <IconOpen size={15} />}</span>
              </span>
              <span className="hidden @min-[250px]:block">
                <span className={cx(s.btn, s.btnSm)}>
                  {added ? <IconCheck size={15} /> : <IconOpen size={15} />}
                  {added ? "Added" : "Add"}
                </span>
              </span>
            </button>
          )}
        </span>
      </div>
    </div>
  );
}
