"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DESIGNS, designFor } from "@/lib/designs";

/**
 * Review tool: switch between the website designs. Sits bottom-left on every design.
 * Keyboard: [ and ] step to the previous / next design.
 */
export function DesignSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const current = designFor(pathname);
  const i = current ? DESIGNS.indexOf(current) : 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "]") router.push(DESIGNS[(i + 1) % DESIGNS.length].href);
      if (e.key === "[") router.push(DESIGNS[(i - 1 + DESIGNS.length) % DESIGNS.length].href);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, router]);

  const prev = DESIGNS[(i - 1 + DESIGNS.length) % DESIGNS.length];
  const next = DESIGNS[(i + 1) % DESIGNS.length];

  return (
    <div className="fixed bottom-3 left-3 z-[200] font-[system-ui,sans-serif] text-[13px] text-neutral-900 antialiased">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="absolute bottom-12 left-0 w-[min(92vw,380px)] origin-bottom-left overflow-hidden rounded-3xl border border-black/10 bg-white/95 p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] backdrop-blur-xl"
            data-lenis-prevent
          >
            <p className="px-3 pb-2 pt-2 text-[12px] text-neutral-500">Designs · press [ or ] to step through</p>
            <ul className="max-h-[60svh] overflow-y-auto">
              {DESIGNS.map((d) => {
                const on = d === current;
                return (
                  <li key={d.slug}>
                    <Link
                      href={d.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 rounded-2xl px-3 py-2.5 transition-colors ${on ? "bg-neutral-900 text-white" : "hover:bg-neutral-100"}`}
                    >
                      <span className={`w-6 shrink-0 tabular-nums ${on ? "text-white/60" : "text-neutral-400"}`}>{d.n}</span>
                      <span className="min-w-0">
                        <span className="block font-medium">
                          {d.name}
                          {d.threeD && <span className={`ml-2 rounded-full px-1.5 py-px text-[10px] ${on ? "bg-white/15" : "bg-neutral-200"}`}>3D</span>}
                        </span>
                        <span className={`block text-[12px] leading-snug ${on ? "text-white/70" : "text-neutral-500"}`}>{d.idea}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-1 rounded-full border border-black/10 bg-white/90 p-1 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.35)] backdrop-blur-xl">
        <Link href={prev.href} aria-label={`Previous design: ${prev.name}`} className="grid size-8 place-items-center rounded-full hover:bg-neutral-100">
          ‹
        </Link>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex h-8 items-center gap-2 rounded-full px-3 hover:bg-neutral-100"
        >
          <span className="tabular-nums text-neutral-400">{current?.n ?? "00"}</span>
          <span className="font-medium">{current?.name ?? "Designs"}</span>
        </button>
        <Link href={next.href} aria-label={`Next design: ${next.name}`} className="grid size-8 place-items-center rounded-full hover:bg-neutral-100">
          ›
        </Link>
      </div>
    </div>
  );
}
