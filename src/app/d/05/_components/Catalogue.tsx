"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { useState, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { CATEGORIES, formatINR, type CategoryKey } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { categoryLabel, EASE, familiesIn, sectionNo } from "./content";
import { Entry } from "./Entry";
import { Head } from "./Head";

type SortKey = "no" | "name" | "category" | "wood" | "price";
type Sort = { key: SortKey; dir: 1 | -1 };

const COLS: { key: SortKey; label: string; cls: string }[] = [
  { key: "no", label: "No.", cls: "cNo" },
  { key: "name", label: "Name", cls: "cName" },
  { key: "category", label: "Category", cls: "cCat" },
  { key: "wood", label: "Wood", cls: "cWood" },
  { key: "price", label: "Price", cls: "cPrice" },
];

const N_RED = familiesIn("red").length;
const N_WHITE = familiesIn("white").length;

const SPRING = { stiffness: 240, damping: 24, mass: 0.6 };

/**
 * Every family made in the current wood, as a sortable table. Hovering a row brings a photograph that
 * follows the pointer on a spring and leans with its speed; clicking a row opens its entry in place.
 */
export function Catalogue() {
  const wood = useWood();
  const [cat, setCat] = useState<CategoryKey | "all">("all");
  const [sort, setSort] = useState<Sort>({ key: "no", dir: 1 });
  const [open, setOpen] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);
  const vx = useVelocity(sx);
  const rotate = useTransform(vx, [-1800, 0, 1800], [-11, 0, 11]);

  const all = familiesIn(wood);
  const tabs = [
    { key: "all" as const, label: "All", n: all.length },
    ...CATEGORIES.map((c) => ({ key: c.key, label: c.label, n: all.filter((x) => x.f.category === c.key).length })).filter((c) => c.n > 0),
  ];
  const catLine = CATEGORIES.find((c) => c.key === cat)?.line;

  const rows = (cat === "all" ? all : all.filter((x) => x.f.category === cat)).slice().sort((a, b) => {
    const va = a.f.variants[wood]!;
    const vb = b.f.variants[wood]!;
    let d = 0;
    if (sort.key === "no") d = a.no - b.no;
    else if (sort.key === "name") d = a.f.name.localeCompare(b.f.name);
    else if (sort.key === "category") d = categoryLabel(a.f.category).localeCompare(categoryLabel(b.f.category)) || a.no - b.no;
    else if (sort.key === "wood") d = va.note.localeCompare(vb.note);
    else d = va.price - vb.price;
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
  const hovered = all.find((x) => x.f.slug === hover);

  return (
    <section id="catalogue" className="x5-section" aria-labelledby="catalogue-title">
      <Head
        id="catalogue-title"
        n={sectionNo("catalogue")}
        title="Catalogue"
        meta={`${rows.length} of ${all.length} shown`}
        dek={
          <p>
            Every piece made in <WT red={`red sandalwood, ${N_RED}`} white={`white sandalwood, ${N_WHITE}`} /> in all. Sort by any column; open a row to read
            its entry.
          </p>
        }
      />

      <div className="x5-filters">
        <div className="x5-tabs" role="group" aria-label="Filter by category">
          {tabs.map((t) => (
            <button key={t.key} type="button" className="x5-tab" aria-pressed={cat === t.key} onClick={() => setCat(t.key)}>
              {t.label}
              <sup>{t.n}</sup>
              {cat === t.key && <motion.span layoutId="idx-tab-line" className="x5-tabLine" transition={{ type: "spring", stiffness: 420, damping: 38 }} />}
            </button>
          ))}
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={cat}
            className="x5-catLine"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {catLine ?? "Objects, beads, powder and oil, gifting and jewellery, in catalogue order."}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="x5-table" onPointerMove={onMove} onPointerEnter={onEnter} onPointerLeave={() => setHover(null)}>
        <div className="x5-thead">
          {COLS.map((c) => {
            const on = sort.key === c.key;
            return (
              <button
                key={c.key}
                type="button"
                className={`x5-th x5-${c.cls}`}
                aria-pressed={on}
                aria-label={`Sort by ${c.label === "No." ? "number" : c.label.toLowerCase()}${on ? (sort.dir === 1 ? ", ascending" : ", descending") : ""}`}
                onClick={() => toggleSort(c.key)}
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
            {rows.map(({ f, no }) => {
              const v = f.variants[wood]!;
              const isOpen = open === f.slug;
              return (
                <motion.li
                  key={f.slug}
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
                      aria-controls={`entry-${f.slug}`}
                      onClick={() => setOpen(isOpen ? null : f.slug)}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setHover(f.slug)}
                      onPointerLeave={() => setHover(null)}
                    >
                      <span className="x5-cNo">{no}</span>
                      <span className="x5-cName">
                        <span className="x5-rowName">{f.name}</span>
                        {f.edition && <span className="x5-edition">{f.edition}</span>}
                      </span>
                      <span className="x5-cCat">{categoryLabel(f.category)}</span>
                      <span className="x5-cWood">{v.note}</span>
                      <span className="x5-cPrice">{formatINR(v.price)}</span>
                      <span className="x5-rowToggle" aria-hidden>
                        {isOpen ? "Close" : "Open"}
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`entry-${f.slug}`}
                        key="entry"
                        className="x5-entryWrap"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ height: { duration: 0.7, ease: EASE }, opacity: { duration: 0.35 } }}
                      >
                        <Entry family={f} wood={wood} no={no} onClose={() => setOpen(null)} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
      </div>

      {/* the pointer-following preview */}
      <motion.div className="x5-preview" style={{ x: sx, y: sy, rotate }} aria-hidden>
        <div className="x5-previewOffset">
          <motion.div
            className="x5-previewCard"
            initial={false}
            animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.86 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {all.map(({ f }) => {
              const shot = f.variants[wood]!.shots[0];
              return (
                <div key={f.slug} className="x5-previewImg" data-on={hover === f.slug || undefined}>
                  <Photo p={shot.photo} tone={shot.tone} sizes="240px" />
                </div>
              );
            })}
            <span className="x5-previewLabel">{hovered ? `No. ${hovered.no}` : ""}</span>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}
