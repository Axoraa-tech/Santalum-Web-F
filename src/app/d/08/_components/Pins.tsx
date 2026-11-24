"use client";

import { switchWood, useWood, type Wood } from "@/lib/wood";
import { atlas } from "../_lib/engine";
import { s } from "./styles";

export const WOOD_HEX: Record<Wood, string> = { red: "#9b3520", white: "#b8894a" };

/** A map pin glyph, tip at the bottom centre. */
export function PinGlyph({ color, filled = true, className = "" }: { color: string; filled?: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 32" className={className} aria-hidden>
      <path
        d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z"
        fill={filled ? color : "#fbfaf7"}
        stroke={color}
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.6" fill={filled ? "#fbfaf7" : color} />
    </svg>
  );
}

/** Choose a wood. On the board this also flies the camera to that wood's region. */
export function pickWood(w: Wood, fly = true) {
  switchWood(w);
  if (fly && atlas.live) atlas.goRegion(w);
}

/** The wood toggle: two map pins, Red and White. */
export function WoodPins({ compact = false }: { compact?: boolean }) {
  const wood = useWood();
  return (
    <div role="radiogroup" aria-label="Choose the wood" className={`${s.chip} flex h-11 items-center gap-0.5 rounded-full px-1`}>
      {(["red", "white"] as const).map((w) => {
        const on = wood === w;
        return (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => pickWood(w)}
            title={w === "red" ? "Red sandalwood: fly to its region" : "White sandalwood: fly to its region"}
            className={`group relative flex h-9 items-center gap-1.5 rounded-full pl-2 text-[14px] transition-colors duration-300 hover:bg-black/[0.04] active:bg-black/[0.07] ${
              on ? "text-(--a-ink)" : "text-(--a-muted)"
            } ${compact ? "pr-2 md:pr-3" : "pr-3"}`}
          >
            <span className="relative block h-6 w-[18px]">
              <span
                className={`absolute inset-0 block origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  on ? "-translate-y-0.5" : "rotate-[-14deg] group-hover:-translate-y-1 group-hover:rotate-0"
                }`}
              >
                <PinGlyph color={WOOD_HEX[w]} filled={on} className="h-6 w-[18px]" />
              </span>
              <span
                className={`absolute -bottom-0.5 left-1/2 h-[3px] w-3 -translate-x-1/2 rounded-full bg-black/25 blur-[1px] transition-opacity duration-500 ${on ? "opacity-100" : "opacity-0"}`}
              />
            </span>
            <span className={`${compact ? "sr-only md:not-sr-only" : ""} font-medium`}>{w === "red" ? "Red" : "White"}</span>
          </button>
        );
      })}
    </div>
  );
}
