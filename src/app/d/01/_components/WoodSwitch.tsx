"use client";

import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cx";

/** Two-position switch, labelled with the two genera. The knob is a cut of the current wood. */
export function WoodSwitch({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const wood = useWood();
  const white = wood === "white";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={white}
      aria-label="White sandalwood, Santalum album (off: red sandalwood, Pterocarpus santalinus)"
      onClick={() => switchWood(white ? "red" : "white")}
      className={`${s.mono} group inline-flex h-8 items-center gap-2 rounded-full px-1.5 text-[11px] transition-colors hover:bg-[rgb(26_27_29/0.05)] active:bg-[rgb(26_27_29/0.08)] ${className}`}
    >
      <span className={`transition-colors duration-300 ${white ? "text-(--steel)" : "text-(--ink)"} ${compact ? "hidden sm:inline" : ""}`}>
        Pterocarpus
      </span>
      <span className="relative h-5 w-[38px] shrink-0 rounded-full bg-(--paper-2) shadow-[inset_0_0_0_1px_var(--hair-2)] transition-shadow group-hover:shadow-[inset_0_0_0_1px_var(--ink)]">
        <span
          className={`absolute left-[2px] top-[2px] size-4 rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgb(0_0_0/0.15)] transition-transform duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] group-active:scale-90 ${
            white ? "ring-white translate-x-[18px]" : "ring-red translate-x-0"
          }`}
        />
      </span>
      <span className={`transition-colors duration-300 ${white ? "text-(--ink)" : "text-(--steel)"} ${compact ? "hidden sm:inline" : ""}`}>
        Santalum
      </span>
      {compact && <span className="text-(--ink) sm:hidden">{white ? "Santalum" : "Pterocarpus"}</span>}
    </button>
  );
}
