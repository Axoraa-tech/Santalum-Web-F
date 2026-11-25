"use client";

import { usePathname } from "next/navigation";
import { WT } from "@/components/maison/W";
import { getProduct } from "@/lib/shop/products";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { changeSheet } from "./SheetChange";
import { productRoute, sheetChangeStore } from "./store";

/**
 * Change wood from anywhere in the design. On a product page the page belongs to one wood, so
 * the switch changes the sheet: it moves to the matching piece in the other wood (or that wood's
 * catalogue) under a fresh sheet, and the piece is never shown in the other wood's colours.
 */
export function useFlipWood() {
  const pathname = usePathname();
  return (next: Wood) => {
    // A sheet change is already under way: let it finish.
    if (sheetChangeStore.get()) return;
    const pr = productRoute.get();
    if (pr && pr.wood !== next) {
      const to = pr.counterpart ? getProduct(pr.counterpart) : undefined;
      changeSheet(next, to ? `/d/01/p/${to.slug}` : "/d/01/shop", to?.name);
      return;
    }
    switchWood(next);
    if (pathname === "/d/01/shop" && window.location.search.includes("c=")) {
      // A category belongs to one wood; drop it so the other catalogue opens whole.
      window.history.replaceState(null, "", "/d/01/shop");
    }
  };
}

/** Two-position switch, labelled with the two genera. The knob is a cut of the current wood. */
export function WoodSwitch({ className = "", compact = false }: { className?: string; compact?: boolean }) {
  const wood = useWood();
  const flip = useFlipWood();
  const white = wood === "white";
  return (
    <button
      type="button"
      role="switch"
      aria-checked={white}
      aria-label="White sandalwood, Santalum album (off: red sandalwood, Pterocarpus santalinus)"
      onClick={() => flip(white ? "red" : "white")}
      className={`${s.mono} group inline-flex h-8 items-center gap-2 rounded-full px-1.5 text-[11px] transition-colors hover:bg-(--wash) active:bg-(--wash-2) ${className}`}
    >
      <span className={`l01-on-red transition-colors duration-300 ${compact ? "hidden xl:inline" : ""}`}>Pterocarpus</span>
      <span className="relative h-5 w-[38px] shrink-0 rounded-full bg-(--paper-2) shadow-[inset_0_0_0_1px_var(--hair-2)] transition-shadow group-hover:shadow-[inset_0_0_0_1px_var(--ink)]">
        <span className="l01-knob absolute left-[2px] top-[2px] size-4 overflow-hidden rounded-full shadow-[0_1px_3px_rgb(0_0_0/0.3),inset_0_0_0_1px_rgb(0_0_0/0.15)] group-active:scale-90">
          <WT red={<span className="ring-red absolute inset-0" />} white={<span className="ring-white absolute inset-0" />} />
        </span>
      </span>
      <span className={`l01-on-white transition-colors duration-300 ${compact ? "hidden xl:inline" : ""}`}>Santalum</span>
      {compact && (
        <span className="text-(--ink) xl:hidden">
          <WT red="Red" white="White" />
        </span>
      )}
    </button>
  );
}
