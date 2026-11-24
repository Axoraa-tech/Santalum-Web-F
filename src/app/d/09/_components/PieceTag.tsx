"use client";

import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { switchWood, type Wood } from "@/lib/wood";
import s from "../styles";
import { hhmm, hourOf } from "./data";
import { openPiece } from "./store";

/**
 * A piece placed in a scene: its photograph cut into a shape, and a small label on the sky
 * with the hour it belongs to, its name, its price and a way to open it.
 * Rendered once per wood (inside <W>), so the right one shows before hydration.
 */
export function PieceTag({
  slug,
  wood,
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
  wood: Wood;
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
  const f = getFamily(slug);
  if (!f) return null;
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const shown = v ?? f.variants[other];
  if (!shown) return null;
  const sh = shown.shots[shot] ?? shown.shots[0];
  const dir =
    side === "below" ? "flex-col items-start" : side === "right" ? "flex-row items-end" : "flex-row-reverse items-end text-right";

  return (
    <div className={`flex gap-4 ${dir} ${className}`}>
      <button
        type="button"
        onClick={() => openPiece(slug)}
        aria-label={`Open ${f.name}`}
        className={`${s.press} ${s.mask} ${s[shape]} shrink-0 ${photoClass}`}
      >
        <span className={`${s.zoom} absolute inset-0`}>
          <Photo p={sh.photo} tone={sh.tone} sizes={sizes} priority={priority} />
        </span>
      </button>
      <div className={`min-w-0 pb-1 ${labelClass}`}>
        <p className={`${s.tab} text-[12px] text-[var(--muted)]`}>{hhmm(hourOf(slug).min)}</p>
        <p className={`${s.display} mt-1 leading-[1.02] ${nameClass}`}>{f.name}</p>
        {v ? (
          <p className={`${s.tab} mt-1.5 text-[14px]`}>{formatINR(v.price)}</p>
        ) : (
          <p className="mt-1.5 text-[13px] leading-snug text-[var(--muted)]">
            Made only in {WOOD_NAMES[other].common.toLowerCase()}, {formatINR(shown.price)}
          </p>
        )}
        <div className={`mt-2 flex flex-wrap gap-x-4 gap-y-1 ${side === "left" ? "justify-end" : ""}`}>
          <button type="button" onClick={() => openPiece(slug)} className={s.link}>
            Open
          </button>
          {!v && (
            <button type="button" onClick={() => switchWood(other)} className={s.link}>
              See it in {other}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
