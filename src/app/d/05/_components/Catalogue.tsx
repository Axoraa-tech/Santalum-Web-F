"use client";

import { AnimatePresence, motion, useMotionValue, useSpring, useTransform, useVelocity } from "motion/react";
import Link from "next/link";
import { useState, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { categoryOf, featured, priceLabel, type Product, type Wood } from "@/lib/shop/products";
import { catNo, categoriesIn, countIn, EASE, sectionNo } from "./content";
import { Entry } from "./Entry";
import { Head } from "./Head";
import { RatingLine } from "./Stars";

type SortKey = "no" | "name" | "category" | "price";
type Sort = { key: SortKey; dir: 1 | -1 };

const COLS: { key: SortKey | null; label: string; cls: string }[] = [
  { key: "no", label: "No.", cls: "cNo" },
  { key: "name", label: "Name", cls: "cName" },
  { key: "category", label: "Category", cls: "cCat" },
  { key: null, label: "Note", cls: "cWood" },
  { key: "price", label: "Price", cls: "cPrice" },
];

const SPRING = { stiffness: 240, damping: 24, mass: 0.6 };

const LEAD: Record<Wood, string> = {
  red: "The red catalogue by category. Each opens the full list, with filters.",
  white: "The white catalogue by category. Each opens the full list, with filters.",
};

/**
 * The selected pieces of one wood as a sortable table. Hovering a row brings a photograph that follows the
 * pointer on a spring and leans with its speed; clicking a row opens its entry in place.
 */
function Selection({ wood }: { wood: Wood }) {
  const all = featured(wood);
  const [sort, setSort] = useState<Sort>({ key: "no", dir: 1 });
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1800, 0, 1800], [-11, 0, 11]);

  const rows = all.slice().sort((a: Product, b: Product) => {
    let d = 0;
    if (sort.key === "no") d = catNo(a) - catNo(b);
    else if (sort.key === "name") d = a.name.localeCompare(b.name);
    else if (sort.key === "category") d = categoryOf(a).label.localeCompare(categoryOf(b).label) || catNo(a) - catNo(b);
    else d = a.price - b.price;
    return d * sort.dir;
  });

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));

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

  const show = hover !== null && hover !== open;
  const hovered = all.find((p) => p.slug === hover);
  const cats = categoriesIn(wood);

  return (
    <>
      <div className="x5-filters">
        <nav className="x5-tabs" aria-label={`The ${wood} catalogue by category`}>
          {cats.map((c) => (
            <Link key={c.id} href={`/d/05/shop?c=${c.id}`} className="x5-tab">
              {c.label}
              <sup>{c.n}</sup>
            </Link>
          ))}
        </nav>
        <p className="x5-catLine">{LEAD[wood]}</p>
      </div>

      <div className="x5-table" onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={() => setHover(null)}>
        <div className="x5-thead">
          {COLS.map((c) => {
            if (!c.key)
              return (
                <span key={c.label} className={`x5-th x5-${c.cls}`}>
                  {c.label}
                </span>
              );
            const key = c.key;
            const on = sort.key === key;
            return (
              <button
                key={c.label}
                type="button"
                className={`x5-th x5-${c.cls}`}
                aria-pressed={on}
                aria-label={`Sort by ${c.label === "No." ? "number" : c.label.toLowerCase()}${on ? (sort.dir === 1 ? ", ascending" : ", descending") : ""}`}
                onClick={() => toggleSort(key)}
              >
                {c.label}
                <span className="x5-sortMark" aria-hidden>
                  {on ? (sort.dir === 1 ? "↑" : "↓") : "↕"}
                </span>
              </button>
            );
          })}
        </div>

        <ol className="x5-rows">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((p) => {
              const isOpen = open === p.slug;
              return (
                <motion.li
                  key={p.slug}
                  layout="position"
                  className="x5-row"
                  data-open={isOpen || undefined}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ layout: { type: "spring", stiffness: 380, damping: 40 }, opacity: { duration: 0.25 } }}
                >
                  <h3 className="x5-rowH">
                    <button
                      type="button"
                      className="x5-rowBtn"
                      aria-expanded={isOpen}
                      aria-controls={`entry-${p.slug}`}
                      onClick={() => setOpen(isOpen ? null : p.slug)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(p.slug)}
                      onPointerLeave={() => setHover(null)}
                    >
                      <span className="x5-cNo">{catNo(p)}</span>
                      <span className="x5-cName">
                        <span className="x5-rowName">{p.name}</span>
                        {p.edition ? (
                          <span className="x5-edition">
                            {p.edition.left} of {p.edition.size} left
                          </span>
                        ) : (
                          p.badge && <span className="x5-edition">{p.badge}</span>
                        )}
                        <RatingLine slug={p.slug} />
                      </span>
                      <span className="x5-cCat">{categoryOf(p).label}</span>
                      <span className="x5-cWood">{p.short}</span>
                      <span className="x5-cPrice">{priceLabel(p)}</span>
                      <span className="x5-rowToggle" aria-hidden>
                        {isOpen ? "Close" : "Open"}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`entry-${p.slug}`}
                        key="entry"
                        className="x5-entryWrap"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.7, ease: EASE }, opacity: { duration: 0.35 } }}
                      >
                        <Entry product={p} onClose={() => setOpen(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>

      <Link href="/d/05/shop" className="x5-toShop">
        <span className="x5-toShopN">{countIn(wood)}</span>
        <span className="x5-toShopText">
          <b>All {countIn(wood)} {wood} sandalwood pieces</b>
          <span>
            The full catalogue, with every category, search, prices and the {wood === "red" ? "Vault and limited pieces" : "Reserve and limited pieces"}.
          </span>
        </span>
        <span className="x5-toShopGo">Open the catalogue</span>
      </Link>

      {/* the pointer-following preview */}
      <motion.div className="x5-preview" style={{ x: sx, y: sy, rotate }} aria-hidden>
        <div className="x5-previewOffset">
          <motion.div
            className="x5-previewCard"
            initial={false}
            animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.86 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {all.map((p) => {
              const shot = p.shots[0];
              return (
                <div key={p.slug} className="x5-previewImg" data-on={hover === p.slug || undefined}>
                  <Photo p={shot.photo} tone={shot.tone} sizes="240px" />
                </div>
              );
            })}
            <span className="x5-previewLabel">{hovered ? `No. ${catNo(hovered)}` : ""}</span>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}

/** The landing page's catalogue section: a selection, never the whole list. */
export function Catalogue() {
  const nRed = featured("red").length;
  const nWhite = featured("white").length;
  return (
    <section id="catalogue" className="x5-section" aria-labelledby="catalogue-title">
      <Head
        id="catalogue-title"
        n={sectionNo("catalogue")}
        title={
          <>
            Selected
            <br />
            in <WT red="red" white="white" />
          </>
        }
        meta={<WT red={`${nRed} of ${countIn("red")} pieces`} white={`${nWhite} of ${countIn("white")} pieces`} />}
        dek={
          <p>
            <WT
              red={`${nRed} of the ${countIn("red")} pieces in red sandalwood, chosen for this edition: beads, turned objects, powder, a box, a pendant and the Vault cuff. Sort by any column; open a row to read its entry.`}
              white={`${nWhite} of the ${countIn("white")} pieces in white sandalwood, chosen for this edition: oils, attar, incense, chandan, a mala and a Mysuru fan. Sort by any column; open a row to read its entry.`}
            />
          </p>
        }
      />
      <W red={<Selection wood="red" />} white={<Selection wood="white" />} />
    </section>
  );
}
