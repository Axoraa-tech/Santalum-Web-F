"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { setMode, useEffectiveMode } from "../_lib/view";
import { Bag } from "./Bag";
import { WoodPins } from "./Pins";
import { s } from "./styles";

/** Contour-ring mark: the wordmark's little emblem, like the rings on a cut log or a hill on a map. */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 28 28" className={className} aria-hidden>
      <path d="M14 2.5c6.6 0 11.5 4.6 11.5 11.2 0 6.9-5.2 11.8-11.7 11.8C7.4 25.5 2.5 20.6 2.5 14 2.5 7.5 7.6 2.5 14 2.5z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M14.3 7c3.9 0 6.8 2.8 6.8 6.7 0 4.1-3 7-7 7-3.9 0-6.7-2.9-6.7-6.8C7.4 9.9 10.4 7 14.3 7z" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="14.2" cy="13.8" r="2.6" fill="var(--m-accent)" />
    </svg>
  );
}

export function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  const mode = useEffectiveMode();
  const home = pathname === "/d/08";

  const choose = (m: "canvas" | "list") => {
    setMode(m);
    if (!home) router.push("/d/08");
    else window.scrollTo({ top: 0 });
  };

  const onBoard = home && mode === "canvas";
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-start justify-between gap-2 px-3 pt-3 md:px-4 md:pt-4">
      {!onBoard && (
        <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-24 bg-[linear-gradient(to_bottom,var(--a-paper)_45%,transparent)]" />
      )}
      <Link
        href="/d/08"
        aria-label="Santalum Maison, home"
        className={`${s.chip} pointer-events-auto flex h-11 shrink-0 items-center gap-2 rounded-full pl-2.5 pr-2.5 text-(--a-ink) transition-colors hover:border-(--a-ink) lg:pr-4`}
      >
        <Mark className="size-7" />
        <span className={`${s.serif} hidden text-[18px] leading-none lg:inline`}>
          Santalum <span className="text-(--a-muted)">Maison</span>
        </span>
      </Link>

      <div
        role="group"
        aria-label="View"
        className={`${s.chip} pointer-events-auto relative flex h-11 shrink-0 items-center rounded-full p-1 lg:absolute lg:left-1/2 lg:top-4 lg:-translate-x-1/2`}
      >
        {(["canvas", "list"] as const).map((m) => {
          const on = home ? mode === m : false;
          return (
            <button
              key={m}
              type="button"
              aria-pressed={on}
              onClick={() => choose(m)}
              className={`relative flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[14px] font-medium transition-colors duration-300 sm:px-3.5 ${
                on ? "text-(--a-paper)" : "text-(--a-ink-2) hover:text-(--a-ink) active:text-(--a-ink)"
              }`}
            >
              {on && (
                <motion.span
                  layoutId="a8-view-pill"
                  className="absolute inset-0 rounded-full bg-(--a-ink)"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative">
                {m === "canvas" ? (
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                    <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="5.5" cy="6" r="1.4" fill="currentColor" />
                    <circle cx="10.5" cy="10" r="1.4" fill="currentColor" />
                    <path d="M5.5 6 C8 6 8 10 10.5 10" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="1.5 1.5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                    <path d="M2 4h12M2 8h12M2 12h8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  </svg>
                )}
              </span>
              <span className="relative hidden min-[420px]:inline">{m === "canvas" ? "Canvas" : "List"}</span>
              <span className="sr-only min-[420px]:hidden">{m === "canvas" ? "Canvas view" : "List view"}</span>
            </button>
          );
        })}
      </div>

      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <WoodPins compact />
        <Bag />
      </div>
    </header>
  );
}
