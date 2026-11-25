"use client";

import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { CONTENT } from "@/lib/shop/content";
import { getProduct } from "@/lib/shop/products";
import { setWoodQuietly, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { EASE } from "./data";
import { sheetChangeStore, useStore } from "./store";

/** How long the sheet's colours take to ease from one wood to the other (lathe.css transitions). */
const EASE_MS = 950;

/** Start a sheet change to a page that belongs to the other wood. */
export function changeSheet(to: Wood, href: string, piece?: string) {
  if (sheetChangeStore.get()) return;
  sheetChangeStore.set({ to, href, piece });
}

/**
 * Click handler for links to a single piece: when the piece is in the other wood, the link goes
 * through a sheet change instead of opening the piece in this wood's colours.
 */
export function openPiece(e: MouseEvent, slug: string, onGo?: () => void) {
  const p = getProduct(slug);
  if (!p || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  const current = document.documentElement.dataset.wood === "white" ? "white" : "red";
  if (p.wood === current) return;
  e.preventDefault();
  onGo?.();
  changeSheet(p.wood, `/d/01/p/${p.slug}`, p.name);
}

/**
 * The sheet change: a fresh drawing sheet drops over the page, the wood changes underneath it,
 * the other wood's page is opened, and the sheet lifts once that page is up and its colours have settled.
 */
export function SheetChange() {
  const job = useStore(sheetChangeStore, null);
  const pathname = usePathname();
  const router = useRouter();
  const appliedAt = useRef<number | null>(null);

  // Once the sheet covers the page: change the wood underneath, then open the other page.
  useEffect(() => {
    if (!job) return;
    const go = window.setTimeout(() => {
      setWoodQuietly(job.to);
      appliedAt.current = performance.now();
      router.push(job.href);
    }, 420);
    // If the client route is slow to arrive, never lift the sheet over the old piece in the new colours:
    // the wood is already stored, so load the other page outright under the sheet.
    const safety = window.setTimeout(() => {
      if (window.location.pathname !== job.href.split("?")[0]) window.location.assign(job.href);
      else sheetChangeStore.set(null);
    }, 12000);
    return () => {
      window.clearTimeout(go);
      window.clearTimeout(safety);
    };
  }, [job, router]);

  // The other page is up: lift the sheet when the colours have finished easing.
  useEffect(() => {
    if (!job || pathname !== job.href.split("?")[0]) return;
    const since = appliedAt.current === null ? 0 : performance.now() - appliedAt.current;
    const t = window.setTimeout(
      () => {
        appliedAt.current = null;
        sheetChangeStore.set(null);
      },
      Math.max(200, EASE_MS - since),
    );
    return () => window.clearTimeout(t);
  }, [job, pathname]);

  const c = job ? CONTENT[job.to] : null;
  return (
    <AnimatePresence>
      {job && c && (
        <motion.div
          key="sheet-change"
          role="status"
          aria-live="polite"
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(100% 0% 0% 0%)" }}
          transition={{ duration: 0.42, ease: EASE }}
          className={`${s.sheet} fixed inset-x-0 bottom-0 top-[52px] z-[45] border-t border-(--ink)`}
        >
          <div className="mx-auto flex h-full max-w-[1400px] flex-col justify-center px-4 md:px-8">
            <div className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto_auto]">
              <div className="px-5 py-5 md:px-7 md:py-6">
                <p className={`${s.mono} text-[11px] text-(--steel)`}>Sheet change</p>
                <p className={`${s.x125} mt-2 text-[clamp(2rem,5vw,4.4rem)] font-[600] leading-[0.95] tracking-[-0.03em]`}>{c.name}</p>
                <p className="mt-2 text-[15px] text-(--ink-2)">
                  <em className="italic">{c.latin}</em>
                  {job.piece ? <>, drawing the {job.piece.toLowerCase()}</> : <>, opening the catalogue</>}
                </p>
              </div>
              <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] md:block md:border-l md:border-t-0 md:px-6 md:py-6`}>
                <span className="block text-[10.5px] text-(--steel)">Sheet</span>
                <span className="block md:mt-2 md:text-[15px]">{job.to === "red" ? "A, red" : "B, white"}</span>
              </div>
              <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] md:block md:border-l md:border-t-0 md:px-6 md:py-6`}>
                <span className="block text-[10.5px] text-(--steel)">{job.to === "red" ? "Record" : "Lot"}</span>
                <span className="block md:mt-2 md:text-[15px]">{job.to === "red" ? "Batch record" : "Lot sheet"}</span>
              </div>
            </div>
            {/* The pen ruling the new sheet. */}
            <div aria-hidden className="relative mt-6 h-px bg-(--hair-2)">
              <motion.span
                className="absolute inset-y-0 left-0 w-full origin-left bg-(--ink)"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.6, ease: EASE }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
