"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR, WOOD_NAMES } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import k from "../k";
import { useRowFit } from "./Collection";
import { fitSize, onFonts, splitName } from "./lib";

/** Below a product page: the next piece as one huge stretching line, then the rest of the wood as rows. */
export function ProductMore({ slug }: { slug: string }) {
  const wood = useWood();
  const listRef = useRef<HTMLUListElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLSpanElement>(null);
  const inWood = FAMILIES.filter((f) => f.variants[wood]);
  const at = FAMILIES.findIndex((f) => f.slug === slug);
  const next = [...FAMILIES.slice(at + 1), ...FAMILIES.slice(0, at)].find((f) => f.variants[wood]) ?? inWood[0];
  const nextHead = splitName(next.name).head;
  const rest = inWood.filter((f) => f.slug !== slug && f.slug !== next.slug);
  useRowFit(listRef, `${wood}-${slug}`, [0.12, 0.06]);

  useEffect(() => {
    const box = boxRef.current;
    const el = nextRef.current;
    if (!box || !el) return;
    const fit = () => {
      el.style.fontSize = `${Math.min(window.innerHeight * 0.32, fitSize(nextHead, box.clientWidth * 0.98, 150, 840))}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [nextHead]);

  const v = next.variants[wood]!;

  return (
    <section aria-label="More pieces" className="border-t border-[var(--k-ink)]">
      <Link href={`/d/10/p/${next.slug}`} className={`${k.row} ${k.gut} group relative block py-8 md:py-12`} style={{ ["--hw" as string]: 150 }}>
        <span className={`${k.mono} flex justify-between text-[var(--k-grey)]`}>
          <span>Next piece</span>
          <span>{formatINR(v.price)}</span>
        </span>
        <div ref={boxRef} className="mt-4">
          <span ref={nextRef} className={`${k.rowName} block w-max text-[12vw]`}>
            {nextHead}
          </span>
        </div>
        <span className="pointer-events-none absolute right-[var(--k-gut)] top-1/2 hidden h-[60%] w-[18vw] -translate-y-1/2 scale-0 overflow-hidden rounded-full transition-transform duration-700 [transition-timing-function:var(--k-ease)] group-hover:scale-100 md:block">
          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="18vw" />
        </span>
      </Link>

      <div className={`${k.gut} flex items-baseline justify-between border-t border-[var(--k-line)] pb-4 pt-10`}>
        <h2 className={`${k.mono} text-[var(--k-grey)]`}>More in {WOOD_NAMES[wood].common.toLowerCase()}</h2>
        <Link href="/d/10#collection" className={`${k.mono} ${k.link}`}>
          The whole collection
        </Link>
      </div>
      <ul ref={listRef} className={`${k.rows} border-t border-[var(--k-ink)]`}>
        {rest.map((f) => (
          <li key={f.slug} data-row className="border-b border-[var(--k-line)]">
            <Link href={`/d/10/p/${f.slug}`} className={`${k.row} ${k.gut} grid grid-cols-[1fr_auto] items-end gap-6 py-2`}>
              <span data-slot className="block min-w-0">
                <span data-name className={`${k.rowName} block w-max text-[12vw] md:text-[6vw]`}>
                  {splitName(f.name).head}
                </span>
              </span>
              <span className={`${k.mono} pb-1 tabular-nums`}>{formatINR(f.variants[wood]!.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
