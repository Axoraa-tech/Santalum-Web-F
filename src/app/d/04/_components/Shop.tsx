"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { W } from "@/components/maison/W";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import {
  CATEGORIES,
  PRICE_BANDS,
  priceLabel,
  productsFor,
  queryProducts,
  SORTS,
  type CategoryId,
  type Product,
  type SortKey,
} from "@/lib/shop/products";
import { setWoodQuietly, switchWood, type Wood } from "@/lib/wood";
import { sh } from "./cls";
import { Keep } from "./Keep";
import { Pic, platesOf } from "./plates";
import { Rating } from "./Reviews";
import { accession, other, woodOfCategory } from "./store";
import { capital, cx, vars, words } from "./ui";

const PAGE = 12;
/** Frames on the catalogue wall are not all one shape: portrait, square, landscape, as the pieces are. */
const SHAPES = [0.8, 1, 0.75, 1.18, 0.88, 1.05];

/** Reads ?c= (a department) and hangs both woods' shops; CSS shows the lit one. */
export function ShopFromParams() {
  const params = useSearchParams();
  const c = params.get("c") ?? "";
  const owner = woodOfCategory(c);

  // a department link names its wood: follow it
  useEffect(() => {
    if (owner) setWoodQuietly(owner);
  }, [owner]);

  return (
    <W
      red={<ShopView key={`red-${c}`} wood="red" initial={owner === "red" ? (c as CategoryId) : "all"} />}
      white={<ShopView key={`white-${c}`} wood="white" initial={owner === "white" ? (c as CategoryId) : "all"} />}
    />
  );
}

/** Before the URL is read (prerender): both shops, unfiltered. */
export function ShopFallback() {
  return <W red={<ShopView wood="red" initial="all" />} white={<ShopView wood="white" initial="all" />} />;
}

const VOICE: Record<Wood, { search: string; empty: string; invite: string; inviteText: string }> = {
  red: {
    search: "Mala, pen, bangle",
    empty: "No red piece matches all of that. Loosen one of the filters, or clear them and walk the whole wall.",
    invite: "The white room has a shop of its own",
    inviteText: "Oil and attar, incense, chandan for the stone, pale fragrant beads and Mysuru carving. Twenty-six pieces, none of them the same as these.",
  },
  white: {
    search: "Attar, incense, fan",
    empty: "No white piece matches all of that. Loosen one of the filters, or clear them and walk the whole wall.",
    invite: "The red room has a shop of its own",
    inviteText: "Malas and bracelets, turned objects for the desk, raktachandan powder and jewellery set in silver. Twenty-six pieces, none of them the same as these.",
  },
};

function ShopView({ wood, initial }: { wood: Wood; initial: CategoryId | "all" }) {
  const [category, setCategory] = useState<CategoryId | "all">(initial);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<SortKey>("featured");
  const [band, setBand] = useState("");
  const [editions, setEditions] = useState(false);
  const [shown, setShown] = useState(PAGE);
  const [more, setMore] = useState(false);
  const ids = { q: useId(), sort: useId(), ed: useId(), more: useId() };
  const all = productsFor(wood);
  const results = queryProducts(wood, { category, q, sort, band, editionsOnly: editions });
  const visible = results.slice(0, shown);
  const v = VOICE[wood];
  const filtered = category !== "all" || q.trim() !== "" || band !== "" || editions;
  const cat = CATEGORIES[wood].find((x) => x.id === category);
  // the index counts what the other filters leave on the wall, so a search shows where its pieces hang
  const narrowed = q.trim() !== "" || band !== "" || editions;
  const inDept = (id: CategoryId | "all") =>
    narrowed ? queryProducts(wood, { category: id, q, band, editionsOnly: editions }).length : id === "all" ? all.length : all.filter((p) => p.category === id).length;

  // any change to the filters starts the wall again from the first twelve
  const reset = () => setShown(PAGE);
  const clear = () => {
    setCategory("all");
    setQ("");
    setBand("");
    setEditions(false);
    reset();
  };

  return (
    <div className={sh.layout}>
      <aside className={sh.index} aria-label={`Refine the ${wood} sandalwood shop`}>
        <div className={sh.search}>
          <label htmlFor={ids.q}>Find in the catalogue</label>
          <input
            id={ids.q}
            type="search"
            value={q}
            placeholder={v.search}
            autoComplete="off"
            onChange={(e) => {
              setQ(e.target.value);
              reset();
            }}
          />
        </div>

        <div className={sh.group}>
          <p className={sh.groupName}>Departments</p>
          <ul className={sh.depts}>
            <li>
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => {
                  setCategory("all");
                  reset();
                }}
              >
                <span>All departments</span>
                <span className={sh.leader} aria-hidden="true" />
                <span>{inDept("all")}</span>
              </button>
            </li>
            {CATEGORIES[wood].map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  data-none={narrowed && inDept(x.id) === 0 ? "" : undefined}
                  aria-pressed={category === x.id}
                  onClick={() => {
                    setCategory(x.id);
                    reset();
                  }}
                >
                  <span>{x.label}</span>
                  <span className={sh.leader} aria-hidden="true" />
                  <span>{inDept(x.id)}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button type="button" className={sh.moreToggle} aria-expanded={more} aria-controls={ids.more} onClick={() => setMore((m) => !m)}>
          Price and editions
          <span aria-hidden="true">{more ? "Hide" : "Show"}</span>
        </button>
        <div id={ids.more} className={sh.moreBox} data-open={more ? "" : undefined}>
          <div className={sh.group}>
            <p className={sh.groupName}>Price</p>
            <div className={sh.bands} role="group" aria-label="Price">
              <button
                type="button"
                aria-pressed={band === ""}
                onClick={() => {
                  setBand("");
                  reset();
                }}
              >
                Any price
              </button>
              {PRICE_BANDS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={band === b.id}
                  onClick={() => {
                    setBand(b.id);
                    reset();
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
          <label className={cx("c4r-check", sh.edCheck)} htmlFor={ids.ed}>
            <input
              id={ids.ed}
              type="checkbox"
              checked={editions}
              onChange={(e) => {
                setEditions(e.target.checked);
                reset();
              }}
            />
            <span>
              Editions and limited pieces only
              <small>{wood === "red" ? "The Vault cuffs, the heirloom casket, the chess set." : "The Reserve oil and the carved Saraswati."}</small>
            </span>
          </label>
        </div>
      </aside>

      <section className={sh.wall} aria-label={`${CONTENT[wood].name} pieces`}>
        <div className={sh.toolbar}>
          <p className={sh.count} aria-live="polite">
            <b>{results.length}</b>{" "}
            {results.length === all.length
              ? `${wood} sandalwood pieces`
              : `of ${all.length} ${wood} pieces${cat ? ` in ${cat.label.toLowerCase()}` : ""}`}
          </p>
          {cat && <p className={sh.catLine}>{cat.line}</p>}
          <div className={sh.sort}>
            <label htmlFor={ids.sort}>Hang by</label>
            <select
              id={ids.sort}
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as SortKey);
                reset();
              }}
            >
              {SORTS.map((x) => (
                <option key={x.key} value={x.key}>
                  {x.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {results.length === 0 ? (
          <div className={sh.empty}>
            <div className={sh.emptyFrame} aria-hidden="true">
              <span />
            </div>
            <div>
              <p className={sh.emptyTitle}>Nothing hangs here</p>
              <p className={sh.emptyText}>{v.empty}</p>
              <button type="button" className="c4-btn" onClick={clear}>
                Clear the filters
              </button>
            </div>
          </div>
        ) : (
          <>
            <ol className={sh.grid}>
              {visible.map((p, i) => (
                <Card key={p.slug} p={p} n={i + 1} shape={SHAPES[i % SHAPES.length]} />
              ))}
            </ol>
            <div className={sh.pager}>
              <p className={sh.pagerNote}>
                {visible.length} of {results.length} hung
              </p>
              {results.length > shown && (
                <button type="button" className="c4-btnLine" onClick={() => setShown((x) => x + PAGE)}>
                  Hang {words(Math.min(PAGE, results.length - shown))} more
                </button>
              )}
              {filtered && (
                <button type="button" className="c4-link" onClick={clear}>
                  Clear the filters
                </button>
              )}
            </div>
          </>
        )}

        <div className={sh.invite}>
          <span className={cx(sh.inviteRing, other(wood) === "red" ? "ring-red" : "ring-white")} aria-hidden="true" />
          <div>
            <p className={sh.inviteTitle}>{v.invite}</p>
            <p className={sh.inviteText}>{v.inviteText}</p>
          </div>
          <button
            type="button"
            className="c4-btnLine"
            onClick={() => {
              switchWood(other(wood));
              window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
            }}
          >
            Light the {other(wood)} room
          </button>
        </div>
      </section>
    </div>
  );
}

function Card({ p, n, shape }: { p: Product; n: number; shape: number }) {
  const [a, b] = platesOf(p);
  const href = `/d/04/p/${p.slug}`;
  const [added, setAdded] = useState(false);
  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 1800);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <li className={sh.card} style={vars({ ar: shape })}>
      <Link href={href} className={sh.frame} tabIndex={-1} aria-hidden="true">
        <span className={sh.fixture} />
        <span className={sh.mat}>
          <Pic p={a.photo} tone={a.tone} crop={a.crop} sizes="(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw" />
          {b && <Pic p={{ id: b.photo.id, alt: "" }} tone={b.tone} crop={b.crop} sizes="(min-width: 1100px) 22vw, (min-width: 700px) 30vw, 46vw" className={sh.second} />}
        </span>
        {p.badge && <span className={sh.badge}>{p.badge}</span>}
      </Link>
      <div className={sh.label}>
        <p className={sh.no}>
          Cat. {n}
          <span>{accession(p)}</span>
        </p>
        <h3 className={sh.name}>
          <Link href={href}>{p.name}</Link>
        </h3>
        {p.edition && (
          <p className={sh.ed}>
            {capital(words(p.edition.left))} of {p.edition.size} remain
          </p>
        )}
        <Rating slug={p.slug} />
        <p className={sh.price}>{priceLabel(p)}</p>
        <div className={sh.actions}>
          <Keep slug={p.slug} name={p.name} quiet />
          {p.options ? (
            <Link href={href} className={sh.act} aria-label={`Choose ${p.options.name.toLowerCase()} for ${p.name}`}>
              Choose
            </Link>
          ) : (
            <button
              type="button"
              className={sh.act}
              data-done={added ? "" : undefined}
              aria-label={added ? `${p.name} added to acquisitions` : `Add ${p.name} to acquisitions`}
              onClick={() => {
                bag.add(p.slug);
                setAdded(true);
              }}
            >
              {added ? "Added" : "Acquire"}
            </button>
          )}
        </div>
      </div>
    </li>
  );
}
