"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { bagTotals, island, useBag } from "@/lib/cart";
import { Logo } from "./Logo";
import { WoodToggle } from "./WoodToggle";

const LINKS = [
  { href: "/maison/shop", label: "Collection" },
  { href: "/maison#studio", label: "Grain studio" },
  { href: "/maison#material", label: "The woods" },
  { href: "/maison#provenance", label: "Provenance" },
];

const EASE = [0.22, 1, 0.36, 1] as const;

/** Floating header: logo, a pill of links with a sliding highlight, the wood switch and the bag. Hides on the way down. */
export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const { count } = bagTotals(useBag());

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 180);
  });

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menu ? -120 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-6"
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3">
          <div className="flex h-11 items-center rounded-full sm:bg-paper/75 sm:pl-2 sm:pr-4 sm:backdrop-blur-xl">
            <Logo />
          </div>

          <nav
            className="hidden items-center rounded-full border border-hair bg-paper/75 p-1 backdrop-blur-xl lg:flex"
            onMouseLeave={() => setHover(null)}
          >
            {LINKS.map((l) => {
              const active = l.href === "/maison/shop" ? pathname.startsWith("/maison/shop") : false;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHover(l.href)}
                  className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${active ? "text-ink" : "text-ink-2 hover:text-ink"}`}
                >
                  {(hover ?? (active ? l.href : null)) === l.href && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-paper-3/70"
                      transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                    />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <WoodToggle />
            <button
              type="button"
              onClick={() => island.open()}
              aria-label={`Open your bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
              className="relative grid size-11 place-items-center rounded-full border border-hair bg-paper/75 backdrop-blur-xl transition-colors hover:border-ink/20"
            >
              <BagIcon />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-medium tabular-nums text-paper"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
            <button
              type="button"
              onClick={() => setMenu(true)}
              aria-label="Open menu"
              className="grid size-11 place-items-center rounded-full border border-hair bg-paper/75 backdrop-blur-xl lg:hidden"
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-px w-4 bg-ink" />
                <span className="block h-px w-4 bg-ink" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            key="menu"
            initial={{ clipPath: "circle(0% at 94% 3%)" }}
            animate={{ clipPath: "circle(150% at 94% 3%)" }}
            exit={{ clipPath: "circle(0% at 94% 3%)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-50 flex flex-col bg-paper px-6 pb-10 pt-6 lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo />
              <button
                type="button"
                onClick={() => setMenu(false)}
                aria-label="Close menu"
                className="grid size-11 place-items-center rounded-full border border-hair text-[20px] leading-none"
              >
                ×
              </button>
            </div>
            <nav className="mt-auto flex flex-col">
              {LINKS.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.15 + i * 0.06, duration: 0.6, ease: EASE }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className="block border-b border-hair py-4 font-display text-[44px] leading-none tracking-[-0.03em]"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link href="/" onClick={() => setMenu(false)} className="mt-8 text-[14px] text-ink-3">
              Back to the coming-soon page
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden className={className}>
      <path d="M6 8.5h12l-.9 10.2a2 2 0 0 1-2 1.8H8.9a2 2 0 0 1-2-1.8L6 8.5Z" strokeLinejoin="round" />
      <path d="M9 8.5V7a3 3 0 0 1 6 0v1.5" strokeLinecap="round" />
    </svg>
  );
}
