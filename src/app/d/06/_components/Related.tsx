"use client";

import Link from "next/link";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, productsFor } from "@/lib/shop/products";
import { s } from "./cls";
import { cx } from "./data";
import { PieceTile } from "./PieceTile";
import { IconArrow } from "./ui";

/** Three pieces from the same wood (same category first), and the way back to that wood's shop. */
export function PairsWith({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const pool = productsFor(p.wood).filter((x) => x.slug !== slug && x.slug !== p.counterpart);
  const same = pool.filter((x) => x.category === p.category);
  const rest = pool.filter((x) => x.category !== p.category).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  const more = [...same, ...rest].slice(0, 3);
  const n = productsFor(p.wood).length;
  const name = CONTENT[p.wood].name.toLowerCase();

  return (
    <section aria-labelledby="b6-pairs" className="flex flex-col gap-3">
      <div className={cx(s.tile, "flex flex-wrap items-end justify-between gap-4 p-5 sm:p-6")}>
        <h2 id="b6-pairs" className={cx(s.display, "text-[clamp(32px,6cqw,56px)]")}>
          Pairs with
        </h2>
        <p className={cx(s.muted, "max-w-[46ch] text-[15px] leading-[1.45]")}>
          {p.wood === "red" ? "Three more pieces turned from the same red heartwood." : "Three more pieces from the same white heartwood."}
        </p>
      </div>
      <div className="grid auto-rows-[260px] grid-cols-2 gap-3 sm:auto-rows-[320px] lg:grid-cols-4">
        {more.map((x, i) => (
          <PieceTile key={x.slug} product={x} id={`rel-${x.slug}`} className={i === 0 ? "col-span-2 lg:col-span-1" : ""} />
        ))}
        <Link
          href="/d/06/shop"
          className={cx(
            s.tile,
            s.dark,
            "group col-span-2 flex flex-col justify-between p-6 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] lg:col-span-1",
          )}
        >
          <span className="text-[clamp(26px,9cqw,40px)] font-medium leading-none tracking-[-0.04em]">
            All {n} {name} pieces
          </span>
          <span className="flex items-center justify-between gap-3">
            <span className="text-[14px] text-white/60">{p.wood === "red" ? "Beads, objects, powder, gifting, jewellery" : "Oil, incense, skin, beads, carving, gifting"}</span>
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-[var(--b-tile)] text-[var(--b-ink)] transition-transform duration-500 group-hover:translate-x-1">
              <IconArrow size={18} />
            </span>
          </span>
        </Link>
      </div>
    </section>
  );
}
