"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { WoodDisc } from "./Logo";
import { WT } from "./W";

/**
 * A product page belongs to one wood. Flipping the wood there moves to the same piece in the other
 * wood, and until that page arrives the old piece must not sit on screen in the new wood's colours.
 * So the page turns: the content fades out, a slice of the new wood rolls in the middle, and the
 * next piece fades in. State lives on <html data-mz-turning> so CSS does the work.
 */
let safety = 0;

/**
 * Hide the old piece while the router fetches `to`. The veil never lifts on the wrong wood's piece:
 * if the client navigation has not landed after a while (a slow server, a failed fetch), the
 * browser is sent there directly and the veil stays up until the new page replaces this one.
 */
export function beginTurn(to: string) {
  document.documentElement.dataset.mzTurning = "1";
  window.clearTimeout(safety);
  safety = window.setTimeout(() => {
    if (window.location.pathname === to) endTurn();
    else window.location.assign(to);
  }, 8000);
}

export function endTurn() {
  window.clearTimeout(safety);
  delete document.documentElement.dataset.mzTurning;
}

/** Ends a turn when a page that is not a product arrives (a product page ends it itself, once its piece is on screen). */
export function TurnVeil() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    if (!pathname.startsWith("/maison/shop/")) endTurn();
  }, [pathname]);
  return (
    <div className="mz-veil" aria-hidden>
      <span className="flex flex-col items-center gap-5">
        <WoodDisc className="mz-veil-disc size-16" />
        <span className="font-display text-[19px] italic text-(--mz-ink-2)">
          <WT red="Turning to red sandalwood" white="Turning to white sandalwood" />
        </span>
      </span>
    </div>
  );
}
