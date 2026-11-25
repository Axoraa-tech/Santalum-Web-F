"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { priceLabel, type Product } from "@/lib/shop/products";
import { productHref, splitName } from "./copy";
import { RatingLine } from "./Rating";
import { s } from "./cls";
import { QuickAdd, WishButton } from "./ui";

const C = 2 * Math.PI * 48.5;

/**
 * A piece in the shop, as one of the ring's discs. On a desktop pointer the disc turns over to show
 * its second photograph and the orbit line around it advances a quarter turn. An edition shows how
 * many are left as an arc of that orbit.
 */
export function ProductDisc({ product, sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 28vw, 44vw", headingLevel = 3 }: { product: Product; sizes?: string; headingLevel?: 2 | 3 }) {
  const two = product.shots.length > 1;
  const [name, sub] = splitName(product.name);
  const href = productHref(product.slug);
  const H = headingLevel === 2 ? "h2" : "h3";
  const ed = product.edition;
  return (
    <article className={`${s.card} group relative`}>
      <div className="relative aspect-square">
        <svg viewBox="0 0 100 100" className={`${s.orbit} pointer-events-none absolute inset-0 size-full`} aria-hidden>
          <circle cx="50" cy="50" r="48.5" fill="none" stroke="var(--o-line)" strokeWidth="0.5" strokeDasharray="0.8 2" />
          {ed && (
            <circle
              cx="50"
              cy="50"
              r="48.5"
              fill="none"
              stroke="var(--m-accent)"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeDasharray={`${((C * ed.left) / ed.size).toFixed(2)} ${C.toFixed(2)}`}
              transform="rotate(-90 50 50)"
            />
          )}
          <circle cx="50" cy="1.5" r="1.4" fill="var(--m-accent)" />
        </svg>

        <Link href={href} tabIndex={-1} aria-hidden className="absolute inset-[7%] block rounded-full shadow-[0_26px_50px_-26px_rgb(25_23_20/0.55)]">
          <span className={s.flip} data-two={two}>
            <span className={s.face}>
              <Photo p={product.shots[0].photo} tone={product.shots[0].tone} sizes={sizes} className="transition-transform duration-700 group-hover:scale-[1.04]" />
            </span>
            {two && (
              <span className={`${s.face} ${s.faceBack}`}>
                <Photo p={product.shots[1].photo} tone={product.shots[1].tone} sizes={sizes} />
              </span>
            )}
          </span>
        </Link>

        {product.badge && (
          <span className={`${s.syne} pointer-events-none absolute left-0 top-[5%] z-10 max-w-[70%] truncate rounded-full bg-[var(--o-ink)] px-2.5 py-1 text-[11px] font-bold text-white md:text-[12px]`}>
            {product.badge}
          </span>
        )}
        <WishButton slug={product.slug} name={product.name} className="absolute right-0 top-[3%] z-10 size-10 md:size-11" />
        <QuickAdd product={product} className="absolute bottom-[3%] right-0 z-10" />
      </div>

      <div className="mt-4 px-1 text-center">
        <H className={`${s.syne} text-[17px] font-bold leading-tight tracking-[-0.02em] md:text-[19px]`}>
          <Link href={href} className="underline-offset-4 hover:underline">
            {name}
          </Link>
        </H>
        {sub && <p className="mt-0.5 text-[13px] text-[var(--o-muted)]">{sub}</p>}
        <p className="mt-1 text-[15px] font-semibold tabular-nums">{priceLabel(product)}</p>
        <RatingLine slug={product.slug} className="mt-1 justify-center" />
        {ed && (
          <p className="mt-0.5 text-[13px] font-semibold text-[var(--m-accent)]">
            {ed.left} of {ed.size} left
          </p>
        )}
      </div>
    </article>
  );
}
