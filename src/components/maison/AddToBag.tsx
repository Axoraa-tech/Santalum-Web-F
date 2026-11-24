"use client";

import { useRef, useState } from "react";
import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { bag, launchFlight } from "@/lib/cart";
import { switchWood, useWood } from "@/lib/wood";
import { Pill } from "./Pill";

/**
 * Adds the piece in the wood currently shown, then sends its thumbnail flying to the bag island.
 * If the piece isn't made in that wood, offers the other wood instead.
 */
export function AddToBag({ slug, custom, label }: { slug: string; custom?: string; label?: string }) {
  const wood = useWood();
  const [qty, setQty] = useState(1);
  const anchor = useRef<HTMLDivElement>(null);
  const family = getFamily(slug)!;
  const variant = family.variants[wood];

  if (!variant) {
    const other = wood === "red" ? "white" : "red";
    return (
      <div className="rounded-[1.75rem] bg-paper-2 p-5">
        <p className="text-[15px] leading-relaxed text-ink-2">
          {family.name} is made only in {WOOD_NAMES[other].common.toLowerCase()}.
        </p>
        <Pill variant="line" className="mt-4" onClick={() => switchWood(other)}>
          Show it in {WOOD_NAMES[other].common.toLowerCase()}
        </Pill>
      </div>
    );
  }

  const add = () => {
    bag.add(slug, wood, qty, custom);
    const r = anchor.current?.getBoundingClientRect();
    const s = variant.shots[0];
    if (r) launchFlight(r, s.photo.id, s.tone);
  };

  return (
    <div ref={anchor} className="flex items-center gap-2">
      {!custom && (
        <span className="flex h-14 items-center rounded-full border border-hair px-1">
          <button type="button" aria-label="One fewer" onClick={() => setQty((q) => Math.max(1, q - 1))} className="grid size-11 place-items-center rounded-full text-[18px] text-ink-2 hover:bg-paper-2 hover:text-ink">
            −
          </button>
          <span className="w-6 text-center tabular-nums">{qty}</span>
          <button type="button" aria-label="One more" onClick={() => setQty((q) => Math.min(9, q + 1))} className="grid size-11 place-items-center rounded-full text-[18px] text-ink-2 hover:bg-paper-2 hover:text-ink">
            +
          </button>
        </span>
      )}
      <Pill size="lg" onClick={add} className="flex-1 justify-between!">
        <span>{label ?? "Add to bag"}</span>
        <span className="tabular-nums opacity-80">{formatINR(variant.price * qty)}</span>
      </Pill>
    </div>
  );
}
