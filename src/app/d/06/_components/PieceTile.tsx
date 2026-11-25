"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { categoryOf, priceLabel, type Product } from "@/lib/shop/products";
import { seededRating } from "@/lib/shop/reviews-data";
import { s } from "./cls";
import { cx, shotsOf } from "./data";
import { views } from "./store";
import { Corner, Stars } from "./ui";

/**
 * A product tile. It owns layoutId `id` (and `${id}-img` for its photo) so the product view can
 * grow out of it. Hovering reveals the second photograph.
 */
export function PieceTile({
  product,
  id,
  style,
  className,
  sizes = "(min-width:1024px) 25vw, (min-width:640px) 40vw, 50vw",
  label,
}: {
  product: Product;
  id: string;
  style?: CSSProperties;
  className?: string;
  sizes?: string;
  label?: string;
}) {
  const [a, b] = shotsOf(product);
  const cat = categoryOf(product).label;
  const rating = seededRating(product.slug);
  const tag = label ?? (product.edition ? `Edition of ${product.edition.size}` : (product.badge ?? cat));

  return (
    <motion.div layoutId={id} style={{ borderRadius: 28, ...style }} className={cx(s.tile, s.t2, s.opener, "group", className)}>
      <motion.div layoutId={`${id}-img`} className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
        <div className={s.zoom}>
          <Photo p={a.photo} tone={a.tone} sizes={sizes} />
          {b && (
            <Photo
              p={b.photo}
              tone={b.tone}
              sizes={sizes}
              className="opacity-0 transition-opacity duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:opacity-100 group-focus-within:opacity-100"
            />
          )}
        </div>
      </motion.div>

      <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 z-[3] max-w-[calc(100%-76px)] truncate rounded-full bg-[var(--b-tile)] px-2.5 py-1 text-[10.5px]")}>{tag}</span>
      <Corner />

      <motion.div
        layout="position"
        className="pointer-events-none absolute inset-x-2 bottom-2 z-[3] flex flex-col gap-1 rounded-[20px] bg-[var(--b-tile)] px-3.5 py-3 @min-[250px]:flex-row @min-[250px]:items-end @min-[250px]:justify-between @min-[250px]:gap-3 @min-[250px]:px-4"
      >
        <span className="min-w-0">
          <span className="block text-[clamp(15px,4.4cqw,21px)] font-medium leading-tight tracking-[-0.025em] @min-[250px]:truncate">{product.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <Stars value={rating.avg} size={11} />
            <span className={cx(s.mono, s.muted, "truncate text-[10.5px]")}>
              {rating.avg.toFixed(1)} ({rating.count})
            </span>
          </span>
        </span>
        <span className={cx(s.mono, "shrink-0 text-[12.5px]")}>{priceLabel(product)}</span>
      </motion.div>

      <button
        type="button"
        className={s.hit}
        onClick={() => views.open({ kind: "product", slug: product.slug, from: id, img: true })}
        aria-label={`Open ${product.name}, ${priceLabel(product)}, rated ${rating.avg} from ${rating.count} reviews`}
      />
    </motion.div>
  );
}
