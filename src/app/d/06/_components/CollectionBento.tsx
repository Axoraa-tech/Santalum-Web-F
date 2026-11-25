"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, priceRange, productsFor, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, homePieces, shopHref, shotsOf } from "./data";
import { PieceTile } from "./PieceTile";
import { IconArrow } from "./ui";

/**
 * The collection as packed blocks of 4 × 2 cells, so any count of tiles packs with no holes.
 * Block sizes per item count. The intro tile always sits second; the "shop all" tile takes the
 * last large cell. Only the featured pieces live here; the rest are in the shop.
 */
const PLAN: Record<number, number[]> = {
  3: [3], 4: [4], 5: [3, 2], 6: [3, 3], 7: [3, 4], 8: [4, 4], 9: [4, 5], 10: [3, 4, 3], 11: [3, 4, 4], 12: [4, 3, 5],
};

type Size = "big" | "tall" | "wide" | "small";
type Cell = { d: string; size: Size };
const A = (r: number, c: number, rs: number, cs: number) => `${r} / ${c} / span ${rs} / span ${cs}`;

function block(n: number, r: number, flip: boolean): Cell[] {
  const L = flip ? 3 : 1; // where the large tile sits
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
    default:
      return [
        { d: A(r, L, 2, 2), size: "big" },
        { d: A(r, S, 1, 1), size: "small" },
        { d: A(r, S + 1, 1, 1), size: "small" },
        { d: A(r + 1, S, 1, 1), size: "small" },
        { d: A(r + 1, S + 1, 1, 1), size: "small" },
      ];
  }
}

/** Desktop cells for `count` items, the index of the cell the "shop all" tile takes, and phone cells. */
function placements(count: number) {
  const plan = PLAN[count] ?? [count];
  const desk: Cell[] = plan.flatMap((n, bi) => block(n, 1 + bi * 2, bi % 2 === 1));
  let all = desk.length - 1;
  for (let i = desk.length - 1; i > 1; i--)
    if (desk[i].size === "big") {
      all = i;
      break;
    }
  // phone: intro full width, then a full-width piece and two halves, and "shop all" last at full width
  const pieces = desk.map((_, i) => i).filter((i) => i !== 1 && i !== all);
  const phone: string[] = new Array(count);
  let row = 1;
  phone[1] = A(row++, 1, 1, 2);
  pieces.forEach((item, k) => {
    const pos = k % 3;
    const last = k === pieces.length - 1;
    if (pos === 0 || (pos === 1 && last)) phone[item] = A(row++, 1, 1, 2);
    else if (pos === 1) phone[item] = A(row, 1, 1, 1);
    else phone[item] = A(row++, 2, 1, 1);
  });
  phone[all] = A(row, 1, 1, 2);
  return { cells: desk.map((c, i) => ({ ...c, p: phone[i] })), all };
}

const COPY: Record<Wood, { title: string; line: string }> = {
  red: {
    title: "Turned in red",
    line: "Beads for practice, objects for the desk, powder from the offcuts, and the Vault cuffs.",
  },
  white: {
    title: "Poured and carved in white",
    line: "Oil and attar, incense for the morning, chandan for the stone, and the carving of Mysuru.",
  },
};

export function CollectionBento({ wood }: { wood: Wood }) {
  const shown = homePieces(wood);
  const all = productsFor(wood);
  const prices = shown.map((p) => p.price);
  const { cells, all: allIdx } = placements(shown.length + 2);
  const pieceCells = cells.filter((_, i) => i !== 1 && i !== allIdx);
  const intro = cells[1];
  const allCell = cells[allIdx];
  const name = CONTENT[wood].name.toLowerCase();

  return (
    <div className={s.coll}>
      <div style={{ "--d": intro.d, "--p": intro.p } as CSSProperties} className={cx(s.tile, s.cslot, "flex flex-col p-5 sm:p-6")}>
        <h2 className={cx(s.display, "text-[clamp(34px,9cqw,56px)]")}>{COPY[wood].title}</h2>
        <p className={cx(s.muted, "mt-3 max-w-[36ch] text-[15px] leading-[1.45]")}>
          {shown.length} of the {all.length} pieces in {name}, from {formatINR(Math.min(...prices))} to {formatINR(Math.max(...prices))}.
        </p>
        <p className="mt-4 max-w-[30ch] text-[clamp(18px,4.6cqw,22px)] font-medium leading-[1.2] tracking-[-0.025em]">{COPY[wood].line}</p>
        <PriceStrip prices={prices} wood={wood} />
        <nav className="mt-auto flex flex-wrap gap-1.5 pt-5" aria-label={`Shop ${name} by category`}>
          {CATEGORIES[wood].map((c) => (
            <Link key={c.id} href={shopHref(c.id)} className={s.chip}>
              {c.label} <span className={cx(s.mono, "text-[10.5px] opacity-60")}>{all.filter((p) => p.category === c.id).length}</span>
            </Link>
          ))}
        </nav>
      </div>

      {shown.map((p, i) => {
        const c = pieceCells[i];
        return (
          <PieceTile
            key={p.slug}
            product={p}
            id={`col-${p.slug}`}
            style={{ "--d": c.d, "--p": c.p } as CSSProperties}
            className={cx(s.cslot, c.p.includes("span 2") && "max-sm:min-h-[300px]")}
            sizes={c.size === "big" ? "(min-width:640px) 50vw, 100vw" : "(min-width:1024px) 25vw, (min-width:640px) 25vw, 50vw"}
          />
        );
      })}

      <ShopAll wood={wood} style={{ "--d": allCell.d, "--p": allCell.p } as CSSProperties} rest={all.filter((p) => !shown.includes(p))} />
    </div>
  );
}

/** The large way into the shop: the pieces that are not on this page, as a strip of photographs. */
function ShopAll({ wood, style, rest }: { wood: Wood; style: CSSProperties; rest: Product[] }) {
  const name = CONTENT[wood].name.toLowerCase();
  const n = productsFor(wood).length;
  const strip = rest.slice(0, 6);
  return (
    <Link
      href="/d/06/shop"
      style={style}
      className={cx(
        s.tile,
        s.dark,
        s.cslot,
        "group flex min-h-[320px] flex-col justify-between gap-6 p-6 transition-transform duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] sm:p-7",
      )}
    >
      <span className="flex items-start justify-between gap-4">
        <span className={cx(s.mono, "text-[11px] text-white/55")}>The shop</span>
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--b-tile)] text-[var(--b-ink)] transition-transform duration-500 group-hover:translate-x-1 group-hover:-rotate-45">
          <IconArrow size={18} />
        </span>
      </span>
      <span className="flex -space-x-3" aria-hidden>
        {strip.map((p, i) => (
          <span
            key={p.slug}
            className="relative size-[clamp(48px,11cqw,76px)] shrink-0 overflow-hidden rounded-[18px] ring-[3px] ring-[var(--b-ink)] transition-transform duration-500 group-hover:translate-y-[-4px]"
            style={{ transitionDelay: `${i * 40}ms` }}
          >
            <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="76px" />
          </span>
        ))}
      </span>
      <span>
        <span className="block text-[clamp(30px,7.4cqw,60px)] font-medium leading-[0.95] tracking-[-0.045em]">
          All {n} {name} pieces
        </span>
        <span className="mt-3 block max-w-[44ch] text-[15px] leading-[1.45] text-white/65">
          {wood === "red"
            ? "Every bead, bowl, pen and box we turn, with filters by category, price and edition."
            : "Every oil, attar, incense, powder and carving we make, with filters by category, price and edition."}
        </span>
      </span>
    </Link>
  );
}

/** Where the pieces on show sit on the whole price range of this wood (log scale). */
function PriceStrip({ prices, wood }: { prices: number[]; wood: Wood }) {
  const [min, max] = priceRange(wood);
  const pos = (p: number) => ((Math.log(p) - Math.log(min)) / (Math.log(max) - Math.log(min))) * 100;
  return (
    <div className="mt-5 hidden @min-[300px]:block" aria-hidden>
      <div className="relative h-3">
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[var(--b-line)]" />
        {prices.map((p, i) => (
          <span
            key={`${p}-${i}`}
            className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-2 ring-[var(--b-tile)]"
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
