"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUser } from "@/lib/shop/account";
import { bagPanel, bagSummary, useBag } from "@/lib/shop/bag";
import { useHydrated } from "@/lib/shop/store";
import { Logo } from "./Logo";
import { BagIcon, UserIcon } from "./shop/Icons";
import { WoodToggle } from "./WoodToggle";

type NavLink = { href: string; label: string; active?: (path: string) => boolean };

const LINKS: NavLink[] = [
  { href: "/maison/shop", label: "Shop", active: (p) => p.startsWith("/maison/shop") },
  { href: "/maison#studio", label: "Grain studio" },
  { href: "/maison#provenance", label: "Provenance" },
  { href: "/maison/track", label: "Track order", active: (p) => p.startsWith("/maison/track") },
];

const EASE = [0.22, 1, 0.36, 1] as const;
const RING = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)";

/**
 * Floating header: logo, a pill of links with a sliding highlight, the wood switch, the account
 * and the bag. Hides on the way down. Session and bag details render only after hydration.
 */
export function Nav() {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const pathname = usePathname();
  const hydrated = useHydrated();
  const user = useUser();
  const { count } = bagSummary(useBag());
  const first = user?.name.split(/\s+/)[0];
  const accountLabel = !hydrated ? "Account" : user ? first : "Sign in";

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 180);
  });

  const menuLinks: NavLink[] = [
    LINKS[0],
    LINKS[3],
    { href: "/maison/account", label: hydrated && user ? `${first}'s account` : "Sign in or create an account" },
    LINKS[1],
    { href: "/maison#material", label: "The two woods" },
    LINKS[2],
  ];

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden && !menu ? -120 : 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        // the shop's category bar reads this and rises into the space the header leaves (maison.css)
        data-hidden={hidden && !menu ? "" : undefined}
        className="fixed inset-x-0 top-0 z-40 px-4 pt-4 md:px-6"
      >
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-2">
          <div className="flex h-11 items-center rounded-full sm:bg-(--mz-bg)/75 sm:pl-2 sm:pr-4 sm:backdrop-blur-xl">
            <Logo />
          </div>

          <nav
            aria-label="Main"
            className="hidden items-center rounded-full border border-(--mz-line) bg-(--mz-bg)/75 p-1 backdrop-blur-xl lg:flex"
            onMouseLeave={() => setHover(null)}
          >
            {LINKS.map((l) => {
              const active = l.active?.(pathname) ?? false;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onMouseEnter={() => setHover(l.href)}
                  aria-current={active ? "page" : undefined}
                  className={`relative rounded-full px-4 py-2 text-[14px] transition-colors ${RING} ${active ? "text-(--mz-ink)" : "text-(--mz-ink-2) hover:text-(--mz-ink)"}`}
                >
                  {(hover ?? (active ? l.href : null)) === l.href && (
                    <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-(--mz-surface-2)/80" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} />
                  )}
                  <span className="relative">{l.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <WoodToggle />
            <Link
              href="/maison/account"
              aria-label={hydrated && user ? `Your account, signed in as ${user.name}` : "Sign in to your account"}
              aria-current={pathname.startsWith("/maison/account") ? "page" : undefined}
              className={`flex h-11 items-center gap-2 rounded-full border border-(--mz-line) bg-(--mz-bg)/75 px-3 text-[14px] text-(--mz-ink) backdrop-blur-xl transition-colors hover:border-(--mz-ink)/20 sm:pr-4 ${RING}`}
            >
              {hydrated && user ? (
                <span aria-hidden className="grid size-6 place-items-center rounded-full bg-(--mz-ink) text-[12px] font-medium uppercase text-(--mz-bg)">
                  {user.name.charAt(0)}
                </span>
              ) : (
                <UserIcon />
              )}
              <span className="hidden max-w-[7rem] truncate sm:inline">{accountLabel}</span>
            </Link>
            <button
              type="button"
              onClick={() => bagPanel.open()}
              aria-label={hydrated ? `Open your bag, ${count} ${count === 1 ? "piece" : "pieces"}` : "Open your bag"}
              className={`relative grid size-11 place-items-center rounded-full border border-(--mz-line) bg-(--mz-bg)/75 text-(--mz-ink) backdrop-blur-xl transition-colors hover:border-(--mz-ink)/20 ${RING}`}
            >
              <BagIcon />
              <AnimatePresence>
                {hydrated && count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-(--mz-accent) px-1 text-[11px] font-medium tabular-nums text-(--mz-bg)"
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
              aria-expanded={menu}
              className={`grid size-11 place-items-center rounded-full border border-(--mz-line) bg-(--mz-bg)/75 backdrop-blur-xl lg:hidden ${RING}`}
            >
              <span className="flex flex-col gap-1.5">
                <span className="block h-px w-4 bg-(--mz-ink)" />
                <span className="block h-px w-4 bg-(--mz-ink)" />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menu && (
          <motion.div
            key="menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            initial={{ clipPath: "circle(0% at 94% 3%)" }}
            animate={{ clipPath: "circle(150% at 94% 3%)" }}
            exit={{ clipPath: "circle(0% at 94% 3%)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-(--mz-bg) px-6 pb-24 pt-6 text-(--mz-ink) lg:hidden"
          >
            <div className="flex items-center justify-between">
              <Logo full />
              <button
                type="button"
                onClick={() => setMenu(false)}
                aria-label="Close menu"
                className={`grid size-11 place-items-center rounded-full border border-(--mz-line) text-[20px] leading-none ${RING}`}
              >
                ×
              </button>
            </div>
            <nav aria-label="Menu" className="mt-auto flex flex-col pt-10">
              {menuLinks.map((l, i) => (
                <motion.div key={l.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}>
                  <Link
                    href={l.href}
                    onClick={() => setMenu(false)}
                    className={`block border-b border-(--mz-line) py-3.5 font-display leading-none tracking-[-0.03em] ${i < 3 ? "text-[40px]" : "text-[26px] text-(--mz-ink-2)"} ${RING}`}
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <Link href="/" onClick={() => setMenu(false)} className="mt-8 text-[14px] text-(--mz-ink-3)">
              Back to the coming-soon page
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}


