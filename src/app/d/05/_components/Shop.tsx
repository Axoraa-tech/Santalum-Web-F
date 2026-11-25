"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState, type PointerEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import {
  CATEGORIES,
  categoryOf,
  PRICE_BANDS,
  priceLabel,
  queryProducts,
  SORTS,
  type CategoryId,
  type Product,
  type SortKey,
  type Wood,
} from "@/lib/shop/products";
import { setWoodQuietly } from "@/lib/wood";
import { catNo, categoriesIn, countIn, EASE, other } from "./content";
import { useWoodSwitch } from "./Controls";
import { takePendingWood } from "./store";
import { MarkButton, QuickAdd } from "./Entry";
import { SideIndex } from "./SideIndex";
import { RatingLine } from "./Stars";

const PAGE = 12;
const SPRING = { stiffness: 240, damping: 24, mass: 0.6 };

function useCategory(wood: Wood): CategoryId | "all" {
  const c = useSearchParams().get("c");
  return CATEGORIES[wood].some((x) => x.id === c) ? (c as CategoryId) : "all";
}

/** The shop's left index: the wood's categories, as links that set ?c=. */
function CategoryIndex({ wood }: { wood: Wood }) {
  const cat = useCategory(wood);
  const items = [
    { id: "all", label: `All ${wood} pieces`, href: "/d/05/shop", count: countIn(wood) },
    ...categoriesIn(wood).map((c) => ({ id: c.id, label: c.label, href: `/d/05/shop?c=${c.id}`, count: c.n })),
  ];
  return (
    <SideIndex
      items={items}
      activeId={cat}
      heading="Categories"
      layoutKey={`x5shop-${wood}`}
      back={{ href: "/d/05", label: `Back to the ${wood} edition` }}
    />
  );
}

export function ShopIndex() {
  return <W red={<CategoryIndex wood="red" />} white={<CategoryIndex wood="white" />} />;
}

/** A link from another wood's category follows that wood (a shared link, say). */
export function FollowCategory() {
  const c = useSearchParams().get("c");
  // Arriving from a piece that has no counterpart in the chosen wood: the shop opens in that wood before it paints.
  useLayoutEffect(() => {
    const w = takePendingWood();
    if (w) setWoodQuietly(w);
  }, []);
  useEffect(() => {
    if (CATEGORIES.red.some((x) => x.id === c)) setWoodQuietly("red");
    else if (CATEGORIES.white.some((x) => x.id === c)) setWoodQuietly("white");
  }, [c]);
  return null;
}

/**
 * The search and filters belong to the catalogue, not to one wood: both editions read the same query, so a search
 * carried across ("9 matches in the white catalogue") arrives with its words still in the box.
 */
type Filters = { q: string; sort: SortKey; band: string; editions: boolean; view: "table" | "plates" };
const NO_FILTERS: Filters = { q: "", sort: "featured", band: "any", editions: false, view: "table" };
const FiltersCtx = createContext<{ f: Filters; set: (patch: Partial<Filters>) => void } | null>(null);

export function ShopFilters({ children }: { children: ReactNode }) {
  const [f, setF] = useState(NO_FILTERS);
  const set = useCallback((patch: Partial<Filters>) => setF((x) => ({ ...x, ...patch })), []);
  const value = useMemo(() => ({ f, set }), [f, set]);
  return <FiltersCtx.Provider value={value}>{children}</FiltersCtx.Provider>;
}

function useFilters() {
  const c = useContext(FiltersCtx);
  if (!c) throw new Error("ShopView needs <ShopFilters>");
  return c;
}

/** A row of text choices: the shop's filters are set as words, not widgets. */
function Choice<T extends string>({ label, value, options, onChange }: { label: string; value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="x5s-choice" role="group" aria-label={label}>
      <span className="x5s-choiceLabel">{label}</span>
      {options.map((o) => (
        <button key={o.id} type="button" className="x5s-choiceBtn" aria-pressed={o.id === value} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** One wood's full catalogue: filters set as text, the table (or plates), load more, and the other edition. */
export function ShopView({ wood }: { wood: Wood }) {
  const router = useRouter();
  const category = useCategory(wood);
  const { f, set } = useFilters();
  const { q, sort, band, editions, view } = f;
  const [page, setPage] = useState({ key: "", n: PAGE });
  const [hover, setHover] = useState<string | null>(null);
  const change = useWoodSwitch();

  const filterKey = `${category}|${q}|${band}|${editions}`;
  const shown = page.key === filterKey ? page.n : PAGE;
  const results = queryProducts(wood, { category, q, sort, band: band === "any" ? undefined : band, editionsOnly: editions });
  const visible = results.slice(0, shown);
  const remaining = results.length - visible.length;
  const cats = categoriesIn(wood);
  const cat = cats.find((c) => c.id === category);
  const otherWood = other(wood);
  // the same search and price, in the other wood (categories never cross, so the switch drops ours)
  const elsewhere = q.trim() ? queryProducts(otherWood, { q, band: band === "any" ? undefined : band, editionsOnly: editions }).length : 0;
  const filtered = category !== "all" || q.trim() !== "" || band !== "any" || editions;

  const setCategory = (id: CategoryId | "all") => router.replace(id === "all" ? "/d/05/shop" : `/d/05/shop?c=${id}`, { scroll: false });
  const clearAll = () => {
    set({ q: "", band: "any", editions: false });
    setCategory("all");
  };

  // the pointer-following plate (second photograph) over the table rows
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1800, 0, 1800], [-11, 0, 11]);
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mx.set(e.clientX);
    my.set(e.clientY);
  };
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    mx.jump(e.clientX);
    my.jump(e.clientY);
    sx.jump(e.clientX);
    sy.jump(e.clientY);
  };
  const hovered = visible.find((p) => p.slug === hover);

  return (
    <div className="x5s-view">
      {/* categories as tabs on phones and tablets; the left index carries them on desktop */}
      <nav className="x5s-tabs" aria-label={`The ${wood} catalogue by category`}>
        <button type="button" className="x5-tab" aria-pressed={category === "all"} onClick={() => setCategory("all")}>
          All
          <sup>{countIn(wood)}</sup>
        </button>
        {cats.map((c) => (
          <button key={c.id} type="button" className="x5-tab" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
            <sup>{c.n}</sup>
          </button>
        ))}
      </nav>

      <div className="x5s-query">
        <div className="x5s-search">
          <label htmlFor={`x5s-q-${wood}`} className="x5s-choiceLabel">
            Search the {wood} catalogue
          </label>
          <div className="x5s-searchRow">
            <input
              id={`x5s-q-${wood}`}
              type="search"
              className="x5s-searchInput"
              placeholder={wood === "red" ? "mala, pen, pendant" : "oil, incense, fan"}
              value={q}
              autoComplete="off"
              onChange={(e) => set({ q: e.target.value })}
            />
            {q && (
              <button type="button" className="x5-textBtn" onClick={() => set({ q: "" })}>
                Clear
              </button>
            )}
          </div>
        </div>
        <Choice label="Order" value={sort} options={SORTS.map((s) => ({ id: s.key, label: s.label }))} onChange={(v) => set({ sort: v })} />
        <Choice
          label="Price"
          value={band}
          options={[{ id: "any", label: "Any price" }, ...PRICE_BANDS.map((b) => ({ id: b.id, label: b.label }))]}
          onChange={(v) => set({ band: v })}
        />
        <div className="x5s-choice" role="group" aria-label="Show">
          <span className="x5s-choiceLabel">Show</span>
          <button type="button" className="x5s-choiceBtn" aria-pressed={editions} onClick={() => set({ editions: !editions })}>
            Editions and limited only
          </button>
          <span className="x5s-sep" aria-hidden />
          <button type="button" className="x5s-choiceBtn" aria-pressed={view === "table"} onClick={() => set({ view: "table" })}>
            As a table
          </button>
          <button type="button" className="x5s-choiceBtn" aria-pressed={view === "plates"} onClick={() => set({ view: "plates" })}>
            As plates
          </button>
        </div>
      </div>

      <div className="x5s-count" aria-live="polite">
        <p>
          <b>
            {results.length} of {countIn(wood)}
          </b>{" "}
          {results.length === 1 ? "entry" : "entries"}
          {cat ? ` in ${cat.label}` : ` in ${wood} sandalwood`}
          {q.trim() ? `, matching “${q.trim()}”` : ""}
          {editions ? ", editions and limited" : ""}
          {band !== "any" ? `, ${PRICE_BANDS.find((b) => b.id === band)?.label.toLowerCase()}` : ""}.
        </p>
        {cat ? <p className="x5s-catLine">{cat.line}</p> : null}
        {filtered && results.length > 0 && (
          <button type="button" className="x5-textBtn" onClick={clearAll}>
            Clear the filters
          </button>
        )}
      </div>

      {results.length === 0 ? (
        <div className="x5s-empty">
          <p className="x5s-emptyLine">
            No entry in the {wood} catalogue answers to that{q.trim() ? <> search, “{q.trim()}”</> : " choice"}.
          </p>
          <p className="x5s-emptyNote">
            {wood === "red"
              ? "Red sandalwood is beads, objects, powder, gifts and jewellery. It carries no oil, so there is no red attar or incense."
              : "White sandalwood is oil, incense, chandan, beads, carving and gifts. Pens, coasters and cuffs are turned in red."}
          </p>
          <div className="x5s-emptyActions">
            <button type="button" className="x5-addBtn" onClick={clearAll}>
              <span>Clear the search and filters</span>
              <span>{countIn(wood)} entries</span>
            </button>
            {elsewhere > 0 && (
              <button type="button" className="x5-textLink" onClick={() => change(otherWood)}>
                {elsewhere} {elsewhere === 1 ? "match" : "matches"} in the {otherWood} catalogue
              </button>
            )}
          </div>
        </div>
      ) : view === "table" ? (
        <div className="x5s-table" onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={() => setHover(null)}>
          <div className="x5s-thead" aria-hidden>
            <span className="x5s-cNo">No.</span>
            <span className="x5s-cName">Name</span>
            <span className="x5s-cCat">Category</span>
            <span className="x5s-cPrice">Price</span>
            <span className="x5s-cAct">Order</span>
          </div>
          <ol className="x5s-rows">
            <AnimatePresence initial={false} mode="popLayout">
              {visible.map((p) => (
                <motion.li
                  key={p.slug}
                  layout="position"
                  className="x5s-row"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ layout: { type: "spring", stiffness: 380, damping: 40 }, opacity: { duration: 0.25 } }}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setHover(p.slug)}
                  onPointerLeave={() => setHover(null)}
                >
                  <Row p={p} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </div>
      ) : (
        <ol className="x5s-plates">
          {visible.map((p) => (
            <li key={p.slug}>
              <Plate p={p} />
            </li>
          ))}
        </ol>
      )}

      {remaining > 0 && (
        <button type="button" className="x5s-more" onClick={() => setPage({ key: filterKey, n: shown + PAGE })}>
          <span>Show the next {Math.min(PAGE, remaining)} entries</span>
          <span>
            {visible.length} of {results.length} shown
          </span>
        </button>
      )}

      <aside className="x5s-other" aria-label="The other edition">
        <p className="x5s-otherLabel">The other edition</p>
        <p className="x5s-otherLine">
          {otherWood === "white"
            ? `White sandalwood: oil, attar, incense, chandan and Mysuru carving, ${countIn("white")} pieces in six categories.`
            : `Red sandalwood: beads, turned objects, powder, gifts and jewellery, ${countIn("red")} pieces in five categories.`}
        </p>
        <button
          type="button"
          className="x5-textLink"
          onClick={() => {
            set({ q: "", band: "any", editions: false });
            change(otherWood);
          }}
        >
          Read the {otherWood} catalogue
        </button>
      </aside>

      {view === "table" && (
        <motion.div className="x5-preview" style={{ x: sx, y: sy, rotate }} aria-hidden>
          <div className="x5-previewOffset">
            <motion.div
              className="x5-previewCard"
              initial={false}
              animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.86 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {visible.map((p) => {
                const shot = p.shots[1] ?? p.shots[0];
                return (
                  <div key={p.slug} className="x5-previewImg" data-on={hover === p.slug || undefined}>
                    <Photo p={shot.photo} tone={shot.tone} sizes="240px" />
                  </div>
                );
              })}
              <span className="x5-previewLabel">{hovered ? `Plate ${catNo(hovered)}b` : ""}</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function Tag({ p }: { p: Product }) {
  if (p.edition)
    return (
      <span className="x5-edition">
        {p.edition.left} of {p.edition.size} left
      </span>
    );
  return p.badge ? <span className="x5-edition">{p.badge}</span> : null;
}

/** A table row: number, thumbnail, name and note, category, price, wishlist and add. */
function Row({ p }: { p: Product }) {
  const shot = p.shots[0];
  return (
    <div className="x5s-rowGrid">
      <span className="x5s-cNo">{catNo(p)}</span>
      <Link href={`/d/05/p/${p.slug}`} className="x5s-thumb" tabIndex={-1} aria-hidden>
        <Photo p={shot.photo} tone={shot.tone} sizes="96px" />
      </Link>
      <div className="x5s-cName">
        <Link href={`/d/05/p/${p.slug}`} className="x5s-name">
          {p.name}
        </Link>
        <Tag p={p} />
        <p className="x5s-short">{p.short}</p>
        <RatingLine slug={p.slug} />
      </div>
      <span className="x5s-cCat">{categoryOf(p).label}</span>
      <span className="x5s-cPrice">{priceLabel(p)}</span>
      <span className="x5s-cAct">
        <QuickAdd product={p} />
        <MarkButton slug={p.slug} name={p.name} />
      </span>
    </div>
  );
}

/** A plate: the piece as a figure with its caption, the second photograph on hover. */
function Plate({ p }: { p: Product }) {
  const a = p.shots[0];
  const b = p.shots[1];
  return (
    <figure className="x5s-plate">
      <Link href={`/d/05/p/${p.slug}`} className="x5s-plateFrame" aria-label={p.name}>
        <span className="x5s-plateImg">
          <Photo p={a.photo} tone={a.tone} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 46vw" />
        </span>
        {b && (
          <span className="x5s-plateImg x5s-plateAlt">
            <Photo p={b.photo} tone={b.tone} sizes="(min-width: 1280px) 20vw, (min-width: 768px) 28vw, 46vw" />
          </span>
        )}
      </Link>
      <figcaption className="x5s-plateCap">
        <span className="x5s-plateNo">Plate {catNo(p)}</span>
        <Link href={`/d/05/p/${p.slug}`} className="x5s-name">
          {p.name}
        </Link>
        <span className="x5s-platePrice">{priceLabel(p)}</span>
        <RatingLine slug={p.slug} />
        <Tag p={p} />
        <span className="x5s-plateAct">
          <MarkButton slug={p.slug} name={p.name} />
          <QuickAdd product={p} />
        </span>
      </figcaption>
    </figure>
  );
}
