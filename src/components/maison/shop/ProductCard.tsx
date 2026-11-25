"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { priceLabel, type Product } from "@/lib/shop/products";
import { seededRating } from "@/lib/shop/reviews-data";
import { RatingLine } from "../reviews/Stars";
import { Pill } from "../Pill";
import { addToBag } from "./addToBag";
import { FRAME } from "./frames";
import { shotsOf } from "./shots";
import { CheckIcon } from "./Icons";
import { WishButton } from "./WishButton";

/**
 * A piece in the shop. The frame takes the silhouette of its kind; on desktop the second
 * photograph rises on hover. Pieces without sizes add straight to the bag; the rest open to choose.
 */
export function ProductCard({ p, sizes = "(min-width: 1024px) 30vw, (min-width: 768px) 40vw, 50vw", priority = false }: { p: Product; sizes?: string; priority?: boolean }) {
  const [a, b] = shotsOf(p);
  const f = FRAME[p.category];
  const href = `/maison/shop/${p.slug}`;
  const btn = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);

  const quickAdd = () => {
    addToBag(btn.current, p);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1600);
  };

  return (
    <article className="group relative">
      <Link href={href} className="block rounded-[2rem] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)" aria-label={p.name}>
        <div className={`relative overflow-hidden bg-(--mz-surface) transition-[border-radius] duration-700 ease-out-soft ${f.shape} ${f.hover} ${f.aspect}`}>
          <Photo p={a.photo} tone={a.tone} sizes={sizes} priority={priority} className="transition-transform duration-[1400ms] ease-out-soft group-hover:scale-[1.05]" />
          {b && <Photo p={b.photo} tone={b.tone} sizes={sizes} className="opacity-0 transition-opacity duration-700 md:group-hover:opacity-100" />}
          {p.edition && (
            <span className="absolute bottom-[9%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-(--mz-bg)/88 px-3 py-1 text-[12px] tabular-nums backdrop-blur">
              {p.edition.left} of {p.edition.size} left
            </span>
          )}
        </div>
      </Link>

      {p.badge && (
        <span
          className={`pointer-events-none absolute left-0 top-0 rounded-full px-3 py-1 text-[12px] ${
            p.badge === "Edition" || p.badge === "Limited" ? "bg-(--mz-ink) text-(--mz-bg)" : "bg-(--mz-accent-soft) text-(--mz-accent-deep)"
          }`}
        >
          {p.badge}
        </span>
      )}
      <WishButton slug={p.slug} name={p.name} className="absolute right-0 top-0" />

      <div className="mt-5 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
        <h3 className="font-display text-[21px] leading-tight tracking-[-0.01em] md:text-[24px]">
          <Link href={href} tabIndex={-1} className="transition-colors hover:text-(--mz-accent)">
            {p.name}
          </Link>
        </h3>
        <span className="shrink-0 text-[15px] tabular-nums text-(--mz-ink-2)">{priceLabel(p)}</span>
      </div>
      <RatingLine {...seededRating(p.slug)} className="mt-1.5" size={13} />
      <p className="mt-1 text-[15px] leading-snug text-(--mz-ink-3) max-sm:line-clamp-3">{p.short}</p>
      <div className="mt-4">
        {p.options ? (
          <Pill href={href} variant="line" size="sm" className="max-w-full" aria-label={`Choose ${p.options.name.toLowerCase()} for ${p.name}`}>
            Choose {p.options.name.toLowerCase()}
          </Pill>
        ) : (
          <Pill ref={btn} onClick={quickAdd} size="sm" aria-label={`Add ${p.name} to your bag`}>
            {added ? (
              <>
                <CheckIcon /> In your bag
              </>
            ) : (
              "Add to bag"
            )}
          </Pill>
        )}
      </div>
    </article>
  );
}
