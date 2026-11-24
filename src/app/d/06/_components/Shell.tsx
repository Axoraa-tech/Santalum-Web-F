"use client";

import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { useEffect, type ReactNode } from "react";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cls";
import { BagLayer } from "./BagLayer";
import { cx } from "./data";
import { Expansion } from "./Expansion";
import { Palette } from "./Palette";
import { palette, useBagUI, useIsMac, useView } from "./store";
import { IconSearch, Kbd, Mark, Swatch } from "./ui";

const SPRING = { type: "spring", visualDuration: 0.55, bounce: 0.12 } as const;

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

/** Client chrome for design 06: wordmark, command bar, wood switch, bag, expansions. */
export function Shell({ children }: { children: ReactNode }) {
  const view = useView();
  const bagOpen = useBagUI().open;
  const locked = !!view || bagOpen;

  useEffect(() => {
    const h = document.documentElement;
    const prev = h.style.getPropertyValue("scrollbar-gutter");
    h.style.setProperty("scrollbar-gutter", "stable");
    return () => {
      h.style.setProperty("scrollbar-gutter", prev);
    };
  }, []);

  useEffect(() => {
    if (!locked) return;
    const h = document.documentElement;
    const prev = h.style.overflow;
    h.style.overflow = "hidden";
    return () => {
      h.style.overflow = prev;
    };
  }, [locked]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        palette.toggle();
      } else if (e.key === "/" && !typing(e.target)) {
        e.preventDefault();
        palette.open();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <MotionConfig reducedMotion="user" transition={SPRING}>
      <TopBar />
      {children}
      <BagLayer />
      <Expansion />
      <Palette />
    </MotionConfig>
  );
}

const PILL = "shadow-[0_1px_2px_rgba(20,20,20,0.06),0_12px_30px_-16px_rgba(20,20,20,0.3)]";

function TopBar() {
  const mac = useIsMac();
  return (
    <>
      <Link
        href="/d/06"
        aria-label="Santalum Maison, home"
        className={cx(
          PILL,
          "fixed left-3 top-3 z-[120] flex h-11 items-center gap-2 rounded-full bg-white pl-3 pr-4 transition-transform hover:-translate-y-px focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]",
        )}
      >
        <Mark />
        <span className="text-[16px] font-semibold tracking-[-0.035em]">Santalum</span>
        <span className={cx(s.mono, s.muted, "hidden text-[11px] lg:inline")}>Maison</span>
      </Link>

      <div className="pointer-events-none fixed inset-x-0 top-3 z-[119] flex justify-center px-[150px] sm:px-[204px] lg:px-[240px]">
        <motion.button
          layoutId="cmd"
          type="button"
          onClick={() => palette.open()}
          aria-haspopup="dialog"
          aria-keyshortcuts="Control+K Meta+K"
          style={{ borderRadius: 22 }}
          className={cx(
            PILL,
            "pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center gap-3 bg-white text-[#6b6b66] transition-colors hover:text-[#141414] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:w-full sm:max-w-[460px] sm:justify-start sm:px-4",
          )}
        >
          <IconSearch />
          <span className="hidden truncate text-[14px] sm:inline">Search pieces, woods, stories</span>
          <span className="sr-only sm:hidden">Search</span>
          <span className="ml-auto hidden sm:inline-flex">
            <Kbd>{mac ? "⌘K" : "Ctrl K"}</Kbd>
          </span>
        </motion.button>
      </div>

      <WoodPill className={cx(PILL, "fixed right-3 top-3 z-[120]")} />
    </>
  );
}

export function WoodPill({ className }: { className?: string }) {
  const wood = useWood();
  return (
    <div
      role="radiogroup"
      aria-label="Wood"
      className={cx("flex h-11 items-center gap-0.5 rounded-full bg-white p-1", className)}
      onKeyDown={(e) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          switchWood(wood === "red" ? "white" : "red");
        }
      }}
    >
      {(["red", "white"] as const).map((w) => {
        const on = wood === w;
        return (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={w === "red" ? "Red sandalwood" : "White sandalwood"}
            tabIndex={on ? 0 : -1}
            onClick={() => !on && switchWood(w)}
            className={cx(
              "relative flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent active:scale-[0.96] sm:px-3",
              on ? "text-white" : "text-[#141414] hover:bg-[#f6f4f0]",
            )}
          >
            {on && <motion.span layoutId="b6-woodpill" className="absolute inset-0 rounded-full bg-[#141414]" />}
            <Swatch wood={w} className="relative" />
            <span className="relative hidden sm:inline">{w === "red" ? "Red" : "White"}</span>
          </button>
        );
      })}
    </div>
  );
}
