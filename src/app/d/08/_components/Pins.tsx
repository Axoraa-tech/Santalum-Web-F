"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { setWoodQuietly, switchWood, useWood, type Wood } from "@/lib/wood";
import { atlas } from "../_lib/engine";
import { s } from "./styles";

export const WOOD_HEX: Record<Wood, string> = { red: "#9b3520", white: "#b8894a" };

/** A map pin glyph, tip at the bottom centre. */
export function PinGlyph({ color, filled = true, className = "" }: { color: string; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden>
      <path
        d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z"
        fill={filled ? color : "var(--a-card, #fbfaf7)"}
        stroke={color}
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.6" fill={filled ? "var(--a-card, #fbfaf7)" : color} />
    </svg>
  );
}

/** Choose a wood. The board keeps its layout; with `fly`, the camera also turns to the wood's home on the map. */
export function pickWood(w: Wood, fly = false) {
  switchWood(w);
  atlas.onWood(w);
  if (fly) atlas.turnTo(w);
}

/**
 * A wood chosen on a product page waits for the next page: the old page keeps its own wood until
 * the new route is on screen, so a red piece is never shown in white colours (or the reverse).
 */
let pendingWood: Wood | null = null;

/** On a product page the page belongs to its wood: flipping goes to the counterpart, or to the shop. */
function useChooser() {
  const pathname = usePathname();
  const router = useRouter();
  // which pin is "turning" while the next page loads; it belongs to the page it was pressed on
  const [turning, setTurning] = useState<{ at: string; to: Wood } | null>(null);

  // The new route has committed: apply the waiting wood before it paints, with no crossfade.
  useLayoutEffect(() => {
    if (!pendingWood) return;
    const w = pendingWood;
    pendingWood = null;
    setWoodQuietly(w);
    atlas.onWood(w);
  }, [pathname]);

  const choose = (w: Wood) => {
    const m = pathname.match(/^\/d\/08\/p\/([^/?#]+)/);
    const p = m ? getProduct(decodeURIComponent(m[1])) : undefined;
    if (p && p.wood !== w) {
      const c = p.counterpart ? getProduct(p.counterpart) : undefined;
      pendingWood = w;
      setTurning({ at: pathname, to: w });
      router.push(c && c.wood === w ? `/d/08/p/${c.slug}` : "/d/08/shop");
      return;
    }
    pickWood(w);
  };
  return { choose, turning: turning && turning.at === pathname ? turning.to : null };
}

/**
 * The wood toggle: two map pins, Red and White. Which pin stands filled is drawn by CSS from
 * html[data-wood] (set before first paint), so the toggle is right before React hydrates.
 */
export function WoodPins({ compact = false }: { compact?: boolean }) {
  const wood = useWood();
  const { choose, turning } = useChooser();
  return (
    <div role="radiogroup" aria-label="Choose the wood" aria-busy={turning ? true : undefined} className={`${s.chip} flex h-11 items-center gap-0.5 rounded-full px-1`}>
      {(["red", "white"] as const).map((w) => {
        const on = wood === w;
        return (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => !on && !turning && choose(w)}
            title={w === "red" ? "Red sandalwood: the Eastern Ghats" : "White sandalwood: Mysuru"}
            data-turning={turning === w ? "" : undefined}
            className={`a8-wp a8-wp-${w} group relative flex h-9 items-center gap-1.5 rounded-full pl-2 text-[14px] hover:bg-(--a-ink)/[0.05] active:bg-(--a-ink)/[0.08] ${compact ? "pr-2 xl:pr-3" : "pr-3"}`}
          >
            <span className="relative block h-6 w-[18px]">
              <span className="a8-wp-glyph absolute inset-0 block origin-bottom">
                <svg viewBox="0 0 24 32" className="h-6 w-[18px]" aria-hidden>
                  <path className="a8-wp-body" d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z" strokeWidth="1.6" />
                  <circle className="a8-wp-eye" cx="12" cy="12" r="3.6" />
                </svg>
              </span>
              <span className="a8-wp-shadow absolute -bottom-0.5 left-1/2 h-[3px] w-3 -translate-x-1/2 rounded-full bg-black/25 blur-[1px]" />
            </span>
            <span className={`${compact ? "sr-only xl:not-sr-only" : ""} font-medium`}>{w === "red" ? "Red" : "White"}</span>
          </button>
        );
      })}
    </div>
  );
}
