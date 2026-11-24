"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { bagTotals, useBag } from "@/lib/cart";
import { switchWood, useWood } from "@/lib/wood";
import { HOME, NAV_LINKS } from "./copy";
import { bagUI, scrollToId, useBagUI, useMedia } from "./store";
import { BagIcon } from "./ui";
import { s } from "./cls";

/** Round menu button that fans its links out along a quarter circle. */
function RadialMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduced = !!useReducedMotion();
  const desktop = useMedia("(min-width: 768px)", true);
  const btnRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLAnchorElement>(null);
  // links sit on a quarter circle around the button: even vertical steps, right edge on the arc
  const r = desktop ? 440 : 340;
  const step = desktop ? 48 : 36;
  const cx = desktop ? 52 : 44;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => firstRef.current?.focus({ preventScroll: true }), 120);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open]);

  const onHome = pathname === HOME;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="catch" className="fixed inset-0 z-[118]" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} aria-hidden />
            <motion.div
              key="disc"
              aria-hidden
              className="fixed z-[119] rounded-full border border-[var(--o-line)] bg-[var(--o-bg)]/95 shadow-[0_30px_90px_-30px_rgb(25_23_20/0.35)] backdrop-blur-md"
              style={{
                width: (r + 70) * 2,
                height: (r + 70) * 2,
                left: cx - (r + 70),
                top: cx - (r + 70),
                backgroundImage: "repeating-radial-gradient(circle, transparent 0 63px, rgb(25 23 20 / 0.06) 63px 64px)",
              }}
              initial={{ scale: reduced ? 1 : 0.05, opacity: reduced ? 0 : 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: reduced ? 1 : 0.05, opacity: 0 }}
              transition={{ duration: reduced ? 0.15 : 0.55, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.nav key="links" id="o2-menu" aria-label="Main" className="fixed left-0 top-0 z-[121]" initial="closed" animate="open" exit="closed">
              <ul>
                {NAV_LINKS.map((l, i) => {
                  const dy = 40 + i * step;
                  const maxX = (typeof window === "undefined" ? 1440 : window.innerWidth) - 14;
                  const x = Math.round(Math.min(maxX, cx + Math.sqrt(r * r - dy * dy)));
                  const y = Math.round(cx + dy);
                  return (
                    <li key={l.id} className="absolute" style={{ left: x, top: y }}>
                      <motion.div
                        variants={{
                          closed: reduced ? { opacity: 0 } : { opacity: 0, x: cx - x, y: cx - y, scale: 0.3 },
                          open: { opacity: 1, x: 0, y: 0, scale: 1, transition: { type: "spring", stiffness: 380, damping: 30, delay: reduced ? 0 : i * 0.035 } },
                        }}
                        className="-translate-x-full -translate-y-1/2"
                      >
                        <Link
                          ref={i === 0 ? firstRef : undefined}
                          href={`${HOME}#${l.id}`}
                          onClick={(e) => {
                            setOpen(false);
                            if (onHome && scrollToId(l.id)) e.preventDefault();
                          }}
                          className={`${s.syne} block whitespace-nowrap rounded-full border border-[var(--o-line)] bg-white px-4 py-1.5 text-[14px] font-bold tracking-[-0.01em] text-[var(--o-ink)] shadow-[0_8px_20px_-12px_rgb(25_23_20/0.4)] transition-colors duration-200 hover:border-[var(--o-ink)] hover:bg-[var(--o-ink)] hover:text-white active:scale-95 md:px-5 md:py-2.5 md:text-[16px]`}
                        >
                          {l.label}
                        </Link>
                      </motion.div>
                    </li>
                  );
                })}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>

      <button
        ref={btnRef}
        type="button"
        aria-expanded={open}
        aria-controls="o2-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((o) => !o)}
        className="fixed left-4 top-4 z-[122] grid size-14 place-items-center rounded-full bg-[var(--o-ink)] text-white shadow-[0_12px_30px_-12px_rgb(25_23_20/0.6)] transition-transform duration-300 hover:scale-105 active:scale-95 md:left-6 md:top-6 md:size-[56px]"
      >
        <span aria-hidden className="relative block size-6">
          {[0, 1, 2].map((k) => (
            <motion.span
              key={k}
              className="absolute left-1/2 top-1/2 block size-[5px] rounded-full bg-white"
              animate={
                open
                  ? { x: [-7, 0, 7][k] - 2.5, y: -2.5, scale: k === 1 ? 0 : 1, rotate: 0 }
                  : { x: Math.cos(((200 + k * 70) * Math.PI) / 180) * 8 - 2.5, y: Math.sin(((200 + k * 70) * Math.PI) / 180) * 8 - 2.5 + 3, scale: 1 }
              }
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
            />
          ))}
          <motion.span
            className="absolute inset-0 rounded-full border border-white/70"
            animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
            transition={{ duration: 0.3 }}
          />
          {open && (
            <svg viewBox="0 0 24 24" className="absolute inset-0" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" aria-hidden>
              <path d="M7 7l10 10M17 7L7 17" />
            </svg>
          )}
        </span>
      </button>
    </>
  );
}

/** Rotary knob: a turned wood face that rotates half a turn between red and white. */
export function WoodKnob() {
  const wood = useWood();
  const white = wood === "white";
  const [k, setK] = useState(0);
  const parity = white ? 0 : 1;
  const kk = k % 2 === parity ? k : k + 1;
  return (
    <button
      type="button"
      role="switch"
      aria-checked={white}
      aria-label="White sandalwood"
      onClick={() => {
        setK(kk + 1);
        switchWood(white ? "red" : "white");
      }}
      className="group flex h-14 items-center gap-1.5 rounded-full border border-[var(--o-line)] bg-white/85 px-3 shadow-[0_10px_30px_-18px_rgb(25_23_20/0.5)] backdrop-blur-md transition-colors hover:border-[var(--o-ink)] active:scale-[0.98] sm:gap-2.5 sm:px-4"
    >
      <span className={`${s.syne} text-[13px] font-bold transition-colors duration-500 ${white ? "text-[var(--o-muted)]" : "text-[var(--o-ink)]"}`}>Red</span>
      <span className="relative grid size-10 place-items-center rounded-full bg-[var(--o-floor)] shadow-[inset_0_1px_3px_rgb(0_0_0/0.18)]">
        {/* fixed tick marks around the knob */}
        <span aria-hidden className="absolute -left-[3px] top-1/2 h-[2px] w-[4px] -translate-y-1/2 rounded-full bg-[var(--o-ink)]/40" />
        <span aria-hidden className="absolute -right-[3px] top-1/2 h-[2px] w-[4px] -translate-y-1/2 rounded-full bg-[var(--o-ink)]/40" />
        <span
          className="absolute inset-[3px] rounded-full shadow-[0_2px_6px_rgb(0_0_0/0.3)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 motion-reduce:transition-none"
          style={{ transform: `rotate(${kk * 180}deg)` }}
        >
          <span className={`absolute inset-0 rounded-full ${s.woodRed} transition-opacity duration-500 ${white ? "opacity-0" : "opacity-100"}`} />
          <span className={`absolute inset-0 rounded-full ${s.woodWhite} transition-opacity duration-500 ${white ? "opacity-100" : "opacity-0"}`} />
          <span className="absolute right-[3px] top-1/2 size-[7px] -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_2px_var(--m-accent)]" />
        </span>
      </span>
      <span className={`${s.syne} text-[13px] font-bold transition-colors duration-500 ${white ? "text-[var(--o-ink)]" : "text-[var(--o-muted)]"}`}>White</span>
    </button>
  );
}

export function BagButton({ className = "" }: { className?: string }) {
  const lines = useBag();
  const { count } = bagTotals(lines);
  const { bump, open } = useBagUI();
  return (
    <button
      type="button"
      aria-label={`Open bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
      onClick={(e) => bagUI.open(e.currentTarget.getBoundingClientRect())}
      className={`relative grid size-14 place-items-center rounded-full bg-[var(--o-ink)] text-white shadow-[0_12px_30px_-12px_rgb(25_23_20/0.6)] transition-[transform,opacity] duration-300 hover:scale-105 active:scale-95 ${open ? "opacity-0" : ""} ${className}`}
    >
      <BagIcon className="size-[22px]" />
      {count > 0 && (
        <motion.span
          key={bump}
          initial={{ scale: bump ? 1.7 : 1 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -right-0.5 -top-0.5 grid min-w-5 place-items-center rounded-full bg-[var(--m-accent)] px-1 text-[11px] font-bold leading-5 text-white ring-2 ring-[var(--o-bg)]"
        >
          {count}
        </motion.span>
      )}
    </button>
  );
}

export function Nav() {
  return (
    <>
      <RadialMenu />
      <Link
        href={HOME}
        className={`${s.syne} fixed left-[76px] top-4 z-[100] flex h-14 w-[100px] items-center rounded-full bg-[var(--o-bg)]/85 px-3 text-[15px] font-extrabold leading-[1.05] tracking-[-0.03em] text-[var(--o-ink)] backdrop-blur-md transition-colors hover:bg-white sm:w-auto sm:px-4 md:left-[88px] md:top-6 md:px-5 md:text-[19px]`}
      >
        Santalum Maison
      </Link>
      <div className="fixed right-4 top-4 z-[100] flex items-center gap-2 md:right-6 md:top-6">
        <WoodKnob />
        <BagButton className="hidden md:grid" />
      </div>
      {/* phones: the bag moves to the thumb */}
      <BagButton className="!fixed bottom-4 right-4 z-[100] md:!hidden" />
    </>
  );
}
