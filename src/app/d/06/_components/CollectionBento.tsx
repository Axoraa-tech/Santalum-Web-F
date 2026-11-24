"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { CATEGORIES, formatINR, type CategoryKey } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, familiesIn, priceRange, WOOD_SHORT } from "./data";
import { PieceTile } from "./PieceTile";

/**
 * The collection as packed blocks of 4 × 2 cells, so any count of pieces tiles with no holes.
 * Block sizes per item count (the intro tile counts as an item and always sits second).
 */
const PLAN: Record<number, number[]> = {
  2: [2], 3: [3], 4: [4], 5: [3, 2], 6: [3, 3], 7: [3, 4], 8: [4, 4], 9: [4, 5], 10: [3, 4, 3], 11: [3, 4, 4], 12: [4, 3, 5], 13: [4, 5, 4],
};

type Size = "big" | "tall" | "wide" | "small";
type Cell = { d: string; size: Size };
const A = (r: number, c: number, rs: number, cs: number) => `${r} / ${c} / span ${rs} / span ${cs}`;

function block(n: number, r: number, flip: boolean): Cell[] {
  const L = flip ? 3 : 1; // where the large piece sits
  const S = flip ? 1 : 3; // where the small ones sit
  switch (n) {
    case 2:
      return [{ d: A(r, 1, 2, 2), size: "big" }, { d: A(r, 3, 2, 2), size: "big" }];
    case 3:
      return [{ d: A(r, L, 2, 2), size: "big" }, { d: A(r, S, 2, 1), size: "tall" }, { d: A(r, S + 1, 2, 1), size: "tall" }];
    case 4:
      return [
        { d: A(r, L, 2, 2), size: "big" },
        { d: A(r, S, 1, 2), size: "wide" },
        { d: A(r + 1, S, 1, 1), size: "small" },
        { d: A(r + 1, S + 1, 1, 1), size: "small" },
      ];
    case 5:
      return [
        { d: A(r, L, 2, 2), size: "big" },
        { d: A(r, S, 1, 1), size: "small" },
        { d: A(r, S + 1, 1, 1), size: "small" },
        { d: A(r + 1, S, 1, 1), size: "small" },
        { d: A(r + 1, S + 1, 1, 1), size: "small" },
      ];
    default:
      return [
        { d: A(r, L, 2, 1), size: "tall" },
        { d: A(r, L + 1, 2, 1), size: "tall" },
        { d: A(r, S, 1, 1), size: "small" },
        { d: A(r, S + 1, 1, 1), size: "small" },
        { d: A(r + 1, S, 1, 1), size: "small" },
        { d: A(r + 1, S + 1, 1, 1), size: "small" },
      ];
  }
}

/** Desktop/tablet placements (4 columns) and phone placements (2 columns) for `count` items. */
function placements(count: number) {
  const plan = PLAN[count] ?? [count];
  const desk: Cell[] = plan.flatMap((n, bi) => block(n, 1 + bi * 2, bi % 2 === 1));
  // phone: intro full width first, then a full-width piece followed by two halves
  const order = [1, 0, ...Array.from({ length: count - 2 }, (_, i) => i + 2)];
  let row = 1;
  const byItem: string[] = new Array(count);
  order.forEach((item, k) => {
    if (k === 0) {
      byItem[item] = A(row++, 1, 1, 2);
      return;
    }
    const pos = (k - 1) % 3;
    const last = k === order.length - 1;
    if (pos === 0 || (pos === 1 && last)) byItem[item] = A(row++, 1, 1, 2);
    else if (pos === 1) byItem[item] = A(row, 1, 1, 1);
    else byItem[item] = A(row++, 2, 1, 1);
  });
  return desk.map((c, i) => ({ ...c, p: byItem[i] }));
}

export function CollectionBento() {
  const wood = useWood();
  const [cat, setCat] = useState<CategoryKey | null>(null);
  const all = familiesIn(wood);
  const shown = cat ? all.filter((f) => f.category === cat) : all;
  const prices = shown.map((f) => f.variants[wood]!.price);
  const cells = placements(shown.length + 1);
  // the intro tile is item 1; pieces fill the rest in order
  const pieceCells = [cells[0], ...cells.slice(2)];
  const intro = cells[1];

  return (
    <section id="collection" aria-label="The collection" className={cx(s.coll, s.section)}>
      <motion.div
        layout
        style={{ "--d": intro.d, "--p": intro.p, borderRadius: 28 } as CSSProperties}
        className={cx(s.tile, s.cslot, "p-5 sm:p-6")}
      >
        <motion.div layout="position" className="flex h-full flex-col">
          <h2 className={cx(s.display, "text-[clamp(34px,9cqw,60px)]")}>The collection</h2>
          <p className={cx(s.muted, "mt-3 max-w-[36ch] text-[15px] leading-[1.45]")}>
            {shown.length} {shown.length === 1 ? "piece" : "pieces"} in {WOOD_SHORT[wood].toLowerCase()}
            {shown.length > 1 ? `, from ${formatINR(Math.min(...prices))} to ${formatINR(Math.max(...prices))}` : `, ${formatINR(prices[0])}`}.
          </p>
          <p className="mt-4 max-w-[30ch] text-[clamp(18px,4.6cqw,24px)] font-medium leading-[1.2] tracking-[-0.025em]">
            {cat ? CATEGORIES.find((c) => c.key === cat)?.line : "Objects, beads, powder and oil, gifting and jewellery. Made in small batches, each with its record."}
          </p>
          <PriceStrip prices={prices} wood={wood} />
          <div className="mt-auto flex flex-wrap gap-1.5 pt-5" role="group" aria-label="Filter by category">
            <button type="button" className={s.chip} aria-pressed={cat === null} onClick={() => setCat(null)}>
              All <span className={cx(s.mono, "text-[10.5px] opacity-60")}>{all.length}</span>
            </button>
            {CATEGORIES.map((c) => {
              const n = all.filter((f) => f.category === c.key).length;
              if (!n) return null;
              return (
                <button key={c.key} type="button" className={s.chip} aria-pressed={cat === c.key} onClick={() => setCat(cat === c.key ? null : c.key)}>
                  {c.label} <span className={cx(s.mono, "text-[10.5px] opacity-60")}>{n}</span>
                </button>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence mode="popLayout" initial={false}>
        {shown.map((f, i) => {
          const c = pieceCells[i];
          return (
            <PieceTile
              key={f.slug}
              family={f}
              wood={wood}
              id={`col-${f.slug}`}
              enter
              style={{ "--d": c.d, "--p": c.p } as CSSProperties}
              className={cx(s.cslot, c.p.includes("span 2") && "max-sm:min-h-[300px]")}
              sizes={c.size === "big" ? "(min-width:640px) 50vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 25vw, 50vw"}
            />
          );
        })}
      </AnimatePresence>
    </section>
  );
}

/** Where the pieces on show sit on the whole price range of this wood (log scale). */
function PriceStrip({ prices, wood }: { prices: number[]; wood: "red" | "white" }) {
  const { min, max } = priceRange(wood);
  const pos = (p: number) => ((Math.log(p) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
  return (
    <div className="mt-5 hidden @min-[300px]:block" aria-hidden>
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/10" />
        {prices.map((p, i) => (
          <motion.span
            key={`${p}-${i}`}
            layout
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-white"
            style={{ left: `${pos(p)}%` }}
          />
        ))}
      </div>
      <div className={cx(s.mono, s.muted, "mt-1.5 flex justify-between text-[10px]")}>
        <span>{formatINR(min)}</span>
        <span>{formatINR(max)}</span>
      </div>
    </div>
  );
}
