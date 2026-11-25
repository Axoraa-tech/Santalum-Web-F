"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, getProduct, priceLabel, productsFor, type Product } from "@/lib/shop/products";
import k from "../k";
import { AddOrChoose, Thumb, Wish } from "./bits";
import { useRowFit } from "./Collection";
import { fitSize, onFonts, splitName } from "./lib";

/** Three pieces from the same wood: one from the same shelf, then the house's favourites from other shelves. */
function pairsFor(p: Product): Product[] {
  const rest = productsFor(p.wood).filter((x) => x.slug !== p.slug);
  const same = rest.filter((x) => x.category === p.category);
  const other = rest.filter((x) => x.category !== p.category).sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
  return [...same.slice(0, 1), ...other].slice(0, 3);
}

/** A single huge line that stretches to the full width on hover: the counterpart, or the next piece. */
function BigLine({ href, kicker, right, name, shot }: { href: string; kicker: string; right: string; name: string; shot: Product["shots"][number] }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    const el = ref.current;
    if (!box || !el) return;
    const fit = () => {
      el.style.fontSize = `${Math.min(window.innerHeight * 0.3, fitSize(name, box.clientWidth * 0.98, 150, 840))}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [name]);
  return (
    <Link href={href} className={`${k.row} ${k.gut} group relative block border-t border-[var(--k10-ink)] py-8 md:py-12`} style={{ ["--hw" as string]: 150 }}>
      <span className={`${k.mono} flex justify-between gap-6 text-[var(--k10-grey)]`}>
        <span>{kicker}</span>
        <span>{right}</span>
      </span>
      <div ref={boxRef} className="mt-4">
        <span ref={ref} className={`${k.rowName} block w-max text-[12vw]`}>
          {name}
        </span>
      </div>
      <span className="pointer-events-none absolute right-[var(--k10-gut)] top-1/2 hidden h-[60%] w-[18vw] -translate-y-1/2 scale-0 overflow-hidden rounded-full transition-transform duration-700 [transition-timing-function:var(--k10-ease)] group-hover:scale-100 md:block">
        <Photo p={shot.photo} tone={shot.tone} sizes="18vw" />
      </span>
    </Link>
  );
}

/** Below a product page: pairs from the same wood, the same piece in the other wood, then the next piece. */
export function ProductMore({ slug }: { slug: string }) {
  const p = getProduct(slug);
  const listRef = useRef<HTMLUListElement>(null);
  useRowFit(listRef, slug, [0.11, 0.055]);
  if (!p) return null;
  const c = CONTENT[p.wood];
  const all = productsFor(p.wood);
  const pairs = pairsFor(p);
  const twin = p.counterpart ? getProduct(p.counterpart) : undefined;
  const at = all.findIndex((x) => x.slug === p.slug);
  const next = all[(at + 1) % all.length];

  return (
    <section aria-label="More pieces" className="border-t border-[var(--k10-ink)]">
      <div className={`${k.gut} flex flex-wrap items-baseline justify-between gap-4 pb-4 pt-10`}>
        <h2 className={`${k.disp} text-[length:clamp(30px,3.4vw,54px)] leading-[0.9] [font-variation-settings:'wdth'_70,'wght'_780]`}>Pairs with</h2>
        <p className={`${k.mono} text-[var(--k10-grey)]`}>Three more in {c.name.toLowerCase()}</p>
      </div>
      <ul ref={listRef} className={`${k.rows} border-t border-[var(--k10-ink)]`}>
        {pairs.map((x) => (
          <li key={x.slug} data-row className={`${k.srow} ${k.gut} grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-4 gap-y-3 border-b border-[var(--k10-line)] py-3 md:grid-cols-[auto_minmax(0,1fr)_auto_auto] md:gap-x-6`}>
            <Link href={`/d/10/p/${x.slug}`} tabIndex={-1} aria-hidden>
              <Thumb p={x} className="h-[56px] w-[92px] md:h-[76px] md:w-[136px]" sizes="136px" />
            </Link>
            <div data-slot className="min-w-0">
              <Link href={`/d/10/p/${x.slug}`} className="block">
                <span data-name className={`${k.rowName} block w-max text-[11vw] md:text-[5.5vw]`}>
                  {splitName(x.name).head}
                </span>
              </Link>
              <p className={`${k.mono} mt-1 truncate text-[var(--k10-grey)]`}>
                {categoryOf(x).label}, {x.short}
              </p>
            </div>
            <p className={`${k.monoL} col-span-2 tabular-nums md:col-span-1 md:text-right`}>{priceLabel(x)}</p>
            <div className="col-span-2 flex items-center justify-between gap-3 md:col-span-1 md:justify-end">
              <Wish p={x} />
              <AddOrChoose p={x} />
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-10">
        {twin && (
          <BigLine
            href={`/d/10/p/${twin.slug}`}
            kicker={`Also in ${CONTENT[twin.wood].name.toLowerCase()}: the site turns ${twin.wood}`}
            right={priceLabel(twin)}
            name={splitName(twin.name).head}
            shot={twin.shots[0]}
          />
        )}
        <BigLine href={`/d/10/p/${next.slug}`} kicker={`Next in ${c.name.toLowerCase()}`} right={priceLabel(next)} name={splitName(next.name).head} shot={next.shots[0]} />
      </div>

      <div className={`${k.gut} flex flex-wrap items-baseline justify-between gap-4 border-t border-[var(--k10-line)] py-6`}>
        <Link href={`/d/10/shop?c=${p.category}`} className={`${k.mono} ${k.link}`}>
          More {categoryOf(p).label.toLowerCase()}
        </Link>
        <Link href="/d/10/shop" className={`${k.mono} ${k.link}`}>
          All {all.length} {c.name.toLowerCase()} pieces
        </Link>
      </div>
    </section>
  );
}
