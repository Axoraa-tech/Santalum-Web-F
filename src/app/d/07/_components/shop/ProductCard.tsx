"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { categoryOf, priceLabel, type Product } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { IconCheck, IconHeart, IconPlus } from "../Icons";
import { shotsOf, ShotPhoto } from "../shots";
import { RatingLine } from "../Stars";
import { productHref } from "../store";

/**
 * A piece as a small card: photograph (the second shot shows on hover), name, price, badge, edition count,
 * a wishlist heart, and quick add when there is nothing to choose.
 */
export function ProductCard({ product: p, sizes = "(min-width: 1024px) 24vw, 46vw", footer }: { product: Product; sizes?: string; footer?: ReactNode }) {
  const hydrated = useHydrated();
  const wish = useWishlist();
  const saved = hydrated && wish.includes(p.slug);
  const [added, setAdded] = useState(false);
  const [a, b] = shotsOf(p);

  const add = () => {
    bag.add(p.slug);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative flex h-full flex-col rounded-[24px] bg-(--s7-surface) p-1.5 shadow-[0_18px_40px_-30px_rgba(27,23,18,0.45)] ring-1 ring-(--s7-ink)/[0.05] transition-[transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:shadow-[0_30px_50px_-30px_rgba(27,23,18,0.55)] md:rounded-[28px] md:p-2">
      <Link href={productHref(p.slug)} className="relative block aspect-[4/5] overflow-hidden rounded-[19px] md:rounded-[22px]" aria-label={p.name}>
        <ShotPhoto shot={a} sizes={sizes} className="transition-transform duration-[1.1s] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]" />
        {b && (
          <span className="s7-shot2 absolute inset-0">
            <ShotPhoto shot={b} sizes={sizes} />
          </span>
        )}
        {p.badge && (
          <span className="absolute left-2 top-2 rounded-full bg-white/92 px-2.5 py-1 text-[11.5px] font-medium text-[#1B1712] md:left-3 md:top-3 md:px-3 md:text-[12px]">
            {p.badge}
          </span>
        )}
        {p.edition && (
          <span className="num absolute bottom-2 left-2 rounded-full bg-[#1B1712]/80 px-2.5 py-1 text-[11.5px] text-white md:bottom-3 md:left-3 md:text-[12px]">
            {p.edition.left} of {p.edition.size} left
          </span>
        )}
      </Link>
      <button
        type="button"
        onClick={() => toggleWishlist(p.slug)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${p.name} from your wishlist` : `Save ${p.name} to your wishlist`}
        className={`absolute right-3 top-3 grid size-9 place-items-center rounded-full backdrop-blur transition active:scale-90 md:right-4 md:top-4 md:size-10 ${
          saved ? "bg-(--s7-accent) text-white" : "bg-white/85 text-[#1B1712] hover:bg-white"
        }`}
      >
        <IconHeart filled={saved} width={18} height={18} />
      </button>

      <div className="flex flex-1 flex-col px-1.5 pb-1 pt-2.5 md:px-2 md:pt-3">
        <p className="text-[12.5px] text-(--s7-muted)">{categoryOf(p).label}</p>
        <Link href={productHref(p.slug)} className="d3 mt-0.5 text-[17px] transition hover:text-(--s7-accent) md:text-[19px]">
          {p.name}
        </Link>
        <RatingLine slug={p.slug} className="mt-1" />
        <p className="mt-1 line-clamp-2 text-[14px] leading-snug text-(--s7-muted) max-md:hidden">{p.short}</p>
        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <span className="num text-[14.5px] font-medium md:text-[15px]">{priceLabel(p)}</span>
          {footer ??
            (p.options ? (
              <Link
                href={productHref(p.slug)}
                className="inline-flex h-9 items-center rounded-full px-3.5 text-[13px] font-medium ring-1 ring-(--s7-ink)/15 transition hover:bg-(--s7-ink) hover:text-(--s7-page) active:scale-95"
              >
                Choose
              </Link>
            ) : (
              <button
                type="button"
                onClick={add}
                aria-label={`Add ${p.name} to the bag`}
                className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium transition active:scale-95 ${
                  added ? "bg-(--s7-accent) text-white" : "bg-(--s7-ink) text-(--s7-page) hover:bg-(--s7-accent)"
                }`}
              >
                {added ? <IconCheck width={15} height={15} /> : <IconPlus width={15} height={15} />}
                {added ? "Added" : "Add"}
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}
