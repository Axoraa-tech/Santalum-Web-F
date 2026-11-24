"use client";

import Link from "next/link";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx } from "./data";
import { PieceTile } from "./PieceTile";
import { IconArrow } from "./ui";

/** Three more pieces (same category first) and a way back to the full collection. */
export function Related({ slug }: { slug: string }) {
  const wood = useWood();
  const f = getFamily(slug);
  const pool = FAMILIES.filter((x) => x.slug !== slug && x.variants[wood]);
  const same = pool.filter((x) => x.category === f?.category);
  const more = [...same, ...pool.filter((x) => x.category !== f?.category)].slice(0, 3);

  return (
    <section aria-label="More pieces" className="grid auto-rows-[240px] grid-cols-2 gap-3 sm:auto-rows-[300px] lg:grid-cols-4">
      {more.map((x, i) => (
        <PieceTile key={x.slug} family={x} wood={wood} id={`rel-${x.slug}`} className={i === 0 ? "col-span-2 lg:col-span-1" : ""} />
      ))}
      <Link
        href="/d/06#collection"
        className={cx(
          s.tile,
          s.dark,
          "group col-span-2 flex flex-col justify-between p-6 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] lg:col-span-1",
        )}
      >
        <span className="text-[clamp(26px,9cqw,40px)] font-medium leading-none tracking-[-0.04em]">Back to the whole collection</span>
        <span className="flex items-center justify-between">
          <span className="text-[14px] text-white/60">{FAMILIES.filter((x) => x.variants[wood]).length} pieces in this wood</span>
          <span className="grid size-11 place-items-center rounded-full bg-white text-[#141414] transition-transform duration-500 group-hover:translate-x-1">
            <IconArrow size={18} />
          </span>
        </span>
      </Link>
    </section>
  );
}
