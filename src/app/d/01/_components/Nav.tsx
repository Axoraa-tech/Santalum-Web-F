"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { CHAPTERS } from "./data";
import { chapterStore, scrollToId, sheet, sheetStore, useStore } from "./store";
import { WoodSwitch } from "./WoodSwitch";

/** What each page of the design is called on the drawing, shown where the chapter ruler sits on the home page. */
const SHEETS: { path: string; red: string; white: string }[] = [
  { path: "/d/01/shop", red: "Parts catalogue", white: "Lot catalogue" },
  { path: "/d/01/p/", red: "Part drawing", white: "Lot sheet" },
  { path: "/d/01/checkout", red: "Work order", white: "Work order" },
  { path: "/d/01/account", red: "Work-order file", white: "Work-order file" },
  { path: "/d/01/track", red: "Job card", white: "Job card" },
];

const LINKS = [
  { href: "/d/01/shop", label: "Shop" },
  { href: "/d/01/track", label: "Track order" },
];

/** Slim top bar: wordmark, the chapter ruler (home) or the sheet name, shop links, the wood switch and the bag. */
export function Nav() {
  const pathname = usePathname();
  const home = pathname === "/d/01";
  const chapter = useStore(chapterStore, -1);
  const open = useStore(sheetStore, false);
  const hydrated = useHydrated();
  const user = useUser();
  const { count } = bagSummary(useBag());
  const sheetName = SHEETS.find((x) => pathname.startsWith(x.path));
  const first = hydrated && user ? user.name.split(" ")[0] : null;

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[52px] border-b border-(--hair) bg-(--glass) backdrop-blur-md">
      <div className="relative flex h-full items-center justify-between gap-3 px-3 md:px-6">
        <Link href="/d/01" className={`${s.x125} shrink-0 text-[14px] font-[680] tracking-[-0.01em] transition-colors hover:text-(--accent) md:text-[15px]`}>
          Santalum<span className="hidden sm:inline"> Maison</span>
        </Link>

        {home ? (
          <nav aria-label="Lathe chapters" className="absolute left-1/2 top-0 hidden h-full -translate-x-1/2 items-center gap-4 xl:flex">
            <ol className="flex h-full items-end pb-[15px]">
              {CHAPTERS.red.map((c, i) => {
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
                      aria-current={on ? "step" : undefined}
                      className="group relative -mx-1.5 flex h-6 w-4 items-end justify-center"
                    >
                      <span
                        className={`block w-[2px] origin-bottom rounded-full transition-[height,background-color] duration-500 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] ${
                          on ? "h-[16px] bg-(--accent)" : "h-[9px] bg-(--steel) group-hover:h-[13px] group-hover:bg-(--ink)"
                        }`}
                      />
                      <span
                        className={`${s.mono} pointer-events-none absolute top-[calc(100%+12px)] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-[3px] bg-(--ink) px-1.5 py-0.5 text-[10.5px] text-(--paper) opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100`}
                      >
                        <span className="sr-only">Chapter {i + 1}: </span>
                        <WT red={c.short} white={CHAPTERS.white[i].short} />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ol>
            <span className={`${s.mono} w-[7.5rem] text-[11px] tabular-nums text-(--ink-2)`}>
              {chapter >= 0 ? (
                <>
                  {chapter + 1}/{CHAPTERS.red.length}{" "}
                  <span className="text-(--steel)">
                    <WT red={CHAPTERS.red[chapter].short} white={CHAPTERS.white[chapter].short} />
                  </span>
                </>
              ) : null}
            </span>
          </nav>
        ) : sheetName ? (
          <p aria-hidden className={`${s.mono} absolute left-1/2 hidden -translate-x-1/2 items-center gap-2 text-[11px] text-(--steel) xl:flex`}>
            <span className="h-px w-6 bg-(--hair-2)" />
            Sheet: <WT red={sheetName.red} white={sheetName.white} />
            <span className="h-px w-6 bg-(--hair-2)" />
          </p>
        ) : null}

        <div className="flex items-center gap-1 md:gap-2">
          <nav aria-label="Shop" className="hidden items-center md:flex">
            {LINKS.map((l) => (
              <NavLink key={l.href} href={l.href} active={pathname.startsWith(l.href)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink href="/d/01/account" active={pathname.startsWith("/d/01/account")}>
              {first ?? "Sign in"}
            </NavLink>
          </nav>
          <WoodSwitch compact />
          <button
            type="button"
            onClick={() => (open ? sheet.close() : sheet.open())}
            aria-expanded={open}
            aria-controls="work-order"
            aria-label={`Bag, ${hydrated ? count : 0} ${count === 1 ? "piece" : "pieces"}`}
            className={`${s.mono} inline-flex h-8 items-center gap-2 rounded-full border pl-3 pr-1 text-[12px] transition-colors hover:border-(--ink) active:bg-(--wash-2) ${
              open ? "border-(--ink)" : "border-(--hair-2)"
            }`}
          >
            Bag
            <span className="grid h-6 min-w-6 place-items-center rounded-full bg-(--ink) px-1.5 text-[11px] tabular-nums text-(--paper)">
              {hydrated ? count : 0}
            </span>
          </button>
          <MobileMenu first={first} />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`relative inline-flex h-8 items-center px-2.5 text-[13.5px] transition-colors hover:text-(--accent) active:opacity-70 lg:px-3 ${
        active ? "text-(--ink)" : "text-(--ink-2)"
      }`}
    >
      {children}
      {active && <span aria-hidden className="absolute inset-x-2.5 bottom-0.5 h-px bg-(--ink) lg:inset-x-3" />}
    </Link>
  );
}

/** Phones: an index card that drops from the bar with the shop links. */
function MobileMenu({ first }: { first: string | null }) {
  const pathname = usePathname();
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector("a")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const items = [
    { href: "/d/01/shop", label: "Shop", note: <WT red="Parts catalogue, 26 pieces" white="Lot catalogue, 26 pieces" /> },
    { href: "/d/01/track", label: "Track order", note: "Job card by order number" },
    { href: "/d/01/account", label: first ? `Account, ${first}` : "Sign in", note: first ? "Orders, wishlist, addresses" : "Or create an account" },
    { href: "/d/01", label: "The lathe", note: <WT red="Red sandalwood, from the heartwood" white="White sandalwood, where the scent sits" /> },
  ];

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-controls="l01-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className={`${s.icon} border border-(--hair-2)`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
          {open ? (
            <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.4" />
          ) : (
            <path d="M2 4.5 H14 M2 8 H14 M2 11.5 H10" stroke="currentColor" strokeWidth="1.4" />
          )}
        </svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            id="l01-menu"
            ref={panel}
            initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
            animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
            exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className={`${s.sheet} fixed inset-x-2 top-[58px] z-[60] border border-(--hair-2) shadow-[0_30px_70px_-30px_rgb(0_0_0/0.4)]`}
          >
            <nav aria-label="Menu">
              <ul>
                {items.map((it) => (
                  <li key={it.href} className="border-b border-(--hair) last:border-b-0">
                    <Link
                      href={it.href}
                      onClick={() => setOpen(false)}
                      aria-current={pathname === it.href ? "page" : undefined}
                      className="flex items-baseline justify-between gap-4 px-5 py-4 transition-colors active:bg-(--wash-2)"
                    >
                      <span className={`${s.x110} text-[20px] font-[600] leading-none`}>{it.label}</span>
                      <span className={`${s.mono} text-right text-[11px] text-(--steel)`}>{it.note}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
