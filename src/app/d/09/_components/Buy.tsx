"use client";

import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { switchWood, type Wood } from "@/lib/wood";
import s from "../styles";
import { addPiece } from "./store";

const SWATCH: Record<Wood, string> = {
  red: "radial-gradient(circle at 40% 35%, #c4583a, #7e2716)",
  white: "radial-gradient(circle at 40% 35%, #f3e4c2, #cfae74)",
};

/** Choose the wood for a piece. Choosing switches the whole site, as the bowls in the header do. */
export function WoodChoice({ slug, wood }: { slug: string; wood: Wood }) {
  const f = getFamily(slug);
  if (!f) return null;
  return (
    <fieldset>
      <legend className="text-[13px] text-[var(--muted)]">Wood</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {(["red", "white"] as const).map((w) => {
          const vv = f.variants[w];
          const on = w === wood;
          return (
            <button
              key={w}
              type="button"
              disabled={!vv}
              aria-pressed={on}
              onClick={() => switchWood(w)}
              className={`flex items-center gap-3 rounded-full border px-4 py-3 text-left transition-colors duration-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 ${
                on ? "border-[var(--ink)] bg-[rgb(255_255_255/0.5)]" : "border-[var(--hair)] hover:border-[var(--ink)]"
              }`}
            >
              <span aria-hidden className="size-5 shrink-0 rounded-full" style={{ background: SWATCH[w] }} />
              <span className="min-w-0 flex-1 text-[15px]">{WOOD_NAMES[w].common}</span>
              <span className={`${s.tab} text-[14px] text-[var(--muted)]`}>{vv ? formatINR(vv.price) : `Not made in ${w}`}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/** Add to the tray in this wood, or, if the piece isn't made in it, offer the other wood. */
export function AddOrSwitch({ slug, wood }: { slug: string; wood: Wood }) {
  const f = getFamily(slug);
  if (!f) return null;
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  if (v) {
    return (
      <button type="button" onClick={() => addPiece(slug, wood)} className={s.btn}>
        Add to the tray
        <span className={`${s.tab} opacity-70`}>{formatINR(v.price)}</span>
      </button>
    );
  }
  return (
    <button type="button" onClick={() => switchWood(other)} className={s.btn}>
      Show it in {WOOD_NAMES[other].common.toLowerCase()}
    </button>
  );
}
