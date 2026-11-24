"use client";

import { switchWood, useWood, type Wood } from "@/lib/wood";
import k from "../k";

/**
 * The wood toggle is two words. The current wood is set wide (wdth 150), the other condensed (wdth 50);
 * CSS reads <html data-wood>, so it is right before hydration, and the axes ease when you switch.
 */
export function WoodToggle({ size = 22, className = "" }: { size?: number; className?: string }) {
  const wood = useWood();
  const go = (w: Wood) => {
    if (w !== wood) switchWood(w);
  };
  return (
    <div role="group" aria-label="Sandalwood" className={`flex items-baseline gap-[0.18em] ${className}`} style={{ fontSize: size }}>
      <button
        type="button"
        aria-pressed={wood === "red"}
        aria-label="Red sandalwood"
        onClick={() => go("red")}
        className={`${k.tog} ${k.togRed} rounded-sm px-[0.04em]`}
      >
        Red
      </button>
      <span aria-hidden className="text-[0.6em] text-[var(--k-grey)]">
        /
      </span>
      <button
        type="button"
        aria-pressed={wood === "white"}
        aria-label="White sandalwood"
        onClick={() => go("white")}
        className={`${k.tog} ${k.togWhite} rounded-sm px-[0.04em]`}
      >
        White
      </button>
    </div>
  );
}
