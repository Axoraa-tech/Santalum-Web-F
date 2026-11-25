"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { priceLabel, type Product } from "@/lib/shop/products";
import { AddToBag, productHref, WishBead } from "./bits";
import { RatingLine } from "./Rating";

/**
 * A piece in the shop: a round medallion hanging from the row's thread, like the ones on the strand.
 * Hover (desktop) swings it a little and shows the second photograph.
 */
export function Medallion({ p, actions, priority = false }: { p: Product; actions?: ReactNode; priority?: boolean }) {
  const [a, b] = p.shots;
  const edition = p.edition ? `${p.edition.left} of ${p.edition.size} left` : null;
  const sizes = "(min-width: 1100px) 280px, (min-width: 640px) 30vw, 46vw";
  return (
    <li className="s3-med">
      <div className="s3-med-hang">
        <span className="s3-med-drop" aria-hidden />
        <Link href={productHref(p.slug)} className="s3-med-ring" tabIndex={-1} aria-hidden>
          <Photo p={a.photo} tone={a.tone} sizes={sizes} priority={priority} />
          {b && <Photo p={b.photo} tone={b.tone} sizes={sizes} className="s3-med-alt" />}
        </Link>
        <div className="mt-4 flex w-full flex-col items-center">
          {p.badge ? <span className="s3-badge">{p.badge}</span> : <span className="h-[24px]" aria-hidden />}
          <h3 className="s3-serif mt-2 text-balance text-[20px] leading-[1.1] md:text-[23px]">
            <Link href={productHref(p.slug)} className="transition-colors hover:text-(--m-accent)">
              {p.name}
            </Link>
          </h3>
          <p className="mt-1.5 text-[15px] tabular-nums">{priceLabel(p)}</p>
          <RatingLine slug={p.slug} className="mt-1" />
          {edition && <p className="mt-0.5 text-[13px] text-(--muted)">{edition}</p>}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1">
            {actions ?? (
              <>
                <AddToBag slug={p.slug} size="sm" compact />
                <WishBead slug={p.slug} name={p.name} />
              </>
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
