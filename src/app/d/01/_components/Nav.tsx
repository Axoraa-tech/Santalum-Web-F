"use client";

import Link from "next/link";
import { bagTotals, useBag } from "@/lib/cart";
import { s } from "./cx";
import { CHAPTERS } from "./data";
import { chapterStore, scrollToId, sheet, sheetStore, useStore } from "./store";
import { WoodSwitch } from "./WoodSwitch";

/** Slim top bar: wordmark, the story's chapter ticks as a small ruler, the wood switch and the bag. */
export function Nav() {
  const chapter = useStore(chapterStore, -1);
  const open = useStore(sheetStore, false);
  const { count } = bagTotals(useBag());

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[52px] border-b border-(--hair) bg-[rgb(243_243_241/0.9)] backdrop-blur-md">
      <div className="relative flex h-full items-center justify-between gap-3 px-3 md:px-6">
        <Link
          href="/d/01"
          className={`${s.x125} shrink-0 text-[14px] font-[680] tracking-[-0.01em] transition-colors hover:text-(--m-accent) md:text-[15px]`}
        >
          Santalum<span className="hidden sm:inline"> Maison</span>
        </Link>

        <nav aria-label="Lathe chapters" className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 items-center gap-4 lg:flex">
          <ol className="flex h-full items-end pb-[15px]">
            {CHAPTERS.map((c, i) => {
              const on = chapter === c.id;
              return (
                <li key={c.id} className="flex items-end">
                  {i > 0 && (
                    <span aria-hidden className="mx-[3px] flex items-end gap-[5px]">
                      {[0, 1, 2, 3].map((k) => (
                        <span key={k} className="h-[4px] w-px bg-(--hair-2)" />
                      ))}
                    </span>
                  )}
                  <Link
                    href={`/d/01#ch-${c.id}`}
                    onClick={(e) => {
                      if (document.getElementById(`ch-${c.id}`)) {
                        e.preventDefault();
                        scrollToId(`ch-${c.id}`);
                      }
                    }}
                    aria-label={`Chapter ${c.id + 1}: ${c.short}`}
                    aria-current={on ? "step" : undefined}
                    className="group relative -mx-1.5 flex h-6 w-4 items-end justify-center"
                  >
                    <span
                      className={`block w-[2px] origin-bottom rounded-full transition-[height,background-color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                        on ? "h-[16px] bg-(--m-accent)" : "h-[9px] bg-(--steel) group-hover:h-[13px] group-hover:bg-(--ink)"
                      }`}
                    />
                    <span
                      className={`${s.mono} pointer-events-none absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-(--ink) px-1.5 py-0.5 text-[10.5px] text-(--paper) opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100`}
                    >
                      {c.short}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
          <span className={`${s.mono} w-[7.5rem] text-[11px] tabular-nums text-(--ink-2)`}>
            {chapter >= 0 ? (
              <>
                {chapter + 1}/{CHAPTERS.length} <span className="text-(--steel)">{CHAPTERS[chapter].short}</span>
              </>
            ) : null}
          </span>
        </nav>

        <div className="flex items-center gap-1 md:gap-3">
          <WoodSwitch compact />
          <button
            type="button"
            onClick={() => (open ? sheet.close() : sheet.open())}
            aria-expanded={open}
            aria-controls="work-order"
            className={`${s.mono} inline-flex h-8 items-center gap-2 rounded-full border border-(--hair-2) pl-3 pr-1 text-[12px] transition-colors hover:border-(--ink) active:bg-[rgb(26_27_29/0.06)] ${
              open ? "border-(--ink)" : ""
            }`}
          >
            Bag
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-(--ink) px-1.5 text-[11px] tabular-nums text-(--paper)">
              {count}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
