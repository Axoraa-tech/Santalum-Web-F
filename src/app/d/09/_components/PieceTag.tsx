"use client";

import { Photo } from "@/components/Photo";
import { getProduct, priceLabel } from "@/lib/shop/products";
import s from "../styles";
import { hhmm, hourOf } from "./data";
import { openPiece } from "./store";
import { CardRating } from "./Stars";

/**
 * A piece placed in a scene: its photograph cut into a shape, and a small label on the sky
 * with the hour it belongs to, its name, its price and a way to open its ritual card.
 * Each wood has its own pieces, so chapters render one PieceTag per wood inside <W>.
 */
export function PieceTag({
  slug,
  shape = "circle",
  photoClass = "size-36",
  side = "below",
  className = "",
  sizes = "240px",
  shot = 0,
  priority = false,
  nameClass = "text-[22px] lg:text-[26px]",
  labelClass = "max-w-[15rem]",
}: {
  slug: string;
  shape?: "arch" | "circle" | "pebble" | "egg";
  photoClass?: string;
  side?: "below" | "right" | "left";
  className?: string;
  sizes?: string;
  shot?: number;
  priority?: boolean;
  nameClass?: string;
  labelClass?: string;
}) {
  const p = getProduct(slug);
  if (!p) return null;
  const sh = p.shots[shot] ?? p.shots[0];
  const dir =
    side === "below" ? "flex-col items-start" : side === "right" ? "flex-row items-end" : "flex-row-reverse items-end text-right";

  return (
    <div className={`flex gap-4 ${dir} ${className}`}>
      <button
        type="button"
        onClick={() => openPiece(slug)}
        aria-label={`Open ${p.name}`}
        className={`${s.press} ${s.mask} ${s[shape]} shrink-0 ${photoClass}`}
      >
        <span className={`${s.zoom} absolute inset-0`}>
          <Photo p={sh.photo} tone={sh.tone} sizes={sizes} priority={priority} />
        </span>
      </button>
      <div className={`min-w-0 pb-1 ${labelClass}`}>
        <p className={`${s.tab} text-[12px] text-[var(--muted)]`}>{hhmm(hourOf(slug).min)}</p>
        <p className={`${s.display} mt-1 leading-[1.02] ${nameClass}`}>{p.name}</p>
        <p className={`${s.tab} mt-1.5 text-[14px]`}>
          {priceLabel(p)}
          {p.edition && <span className="text-[var(--muted)]">, {p.edition.left} of {p.edition.size} left</span>}
        </p>
        <CardRating slug={slug} className="mt-1" />
        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 ${side === "left" ? "justify-end" : ""}`}>
          <button type="button" onClick={() => openPiece(slug)} className={s.link}>
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
