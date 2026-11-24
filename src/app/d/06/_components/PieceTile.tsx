"use client";

import { motion } from "motion/react";
import type { CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, formatINR, type Family } from "@/lib/catalog";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, variantFor } from "./data";
import { views } from "./store";
import { Corner } from "./ui";

/**
 * A product tile. It owns layoutId `id` (and `${id}-img` for its photo) so the product view can
 * grow out of it. Hovering reveals the second photograph.
 */
export function PieceTile({
  family,
  wood,
  id,
  style,
  className,
  sizes = "(min-width:1024px) 25vw, (min-width:640px) 40vw, 50vw",
  enter = false,
  label,
}: {
  family: Family;
  wood: Wood;
  id: string;
  style?: CSSProperties;
  className?: string;
  sizes?: string;
  enter?: boolean;
  label?: string;
}) {
  const { variant } = variantFor(family, wood);
  const [a, b] = variant.shots;
  const cat = CATEGORIES.find((c) => c.key === family.category)?.label;

  return (
    <motion.div
      layoutId={id}
      style={{ borderRadius: 28, ...style }}
      className={cx(s.tile, s.t2, s.opener, "group", className)}
      initial={enter ? { opacity: 0, scale: 0.94 } : false}
      animate={{ opacity: 1, scale: 1 }}
      exit={enter ? { opacity: 0, scale: 0.94 } : undefined}
    >
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

      <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 z-[3] rounded-full bg-white px-2.5 py-1 text-[10.5px]")}>
        {label ?? family.edition ?? family.level}
      </span>
      <Corner />

      <motion.div
        layout="position"
        className="pointer-events-none absolute inset-x-2 bottom-2 z-[3] flex flex-col gap-1 rounded-[20px] bg-white px-3.5 py-3 @min-[250px]:flex-row @min-[250px]:items-end @min-[250px]:justify-between @min-[250px]:gap-3 @min-[250px]:px-4"
      >
        <span className="min-w-0">
          <span className="block text-[clamp(15px,4.4cqw,21px)] font-medium leading-tight tracking-[-0.025em] @min-[250px]:truncate">{family.name}</span>
          <span className={cx(s.mono, s.muted, "block truncate text-[10.5px]")}>{cat}</span>
        </span>
        <span className={cx(s.mono, "shrink-0 text-[12.5px]")}>{formatINR(variant.price)}</span>
      </motion.div>

      <button
        type="button"
        className={s.hit}
        onClick={() => views.open({ kind: "product", slug: family.slug, from: id, img: true })}
        aria-label={`Open ${family.name}, ${formatINR(variant.price)}`}
      />
    </motion.div>
  );
}
