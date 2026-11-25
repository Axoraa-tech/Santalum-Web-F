"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import k from "../k";
import { addedStore, EASE, lockScroll, menuStore, onFonts, scrollToId, sheetStore, unlockScroll, useStore, wdthFor } from "./lib";
import { WoodRouteSync, WoodToggle } from "./WoodToggle";

/** A link to a section of the home page; on the home page it scrolls smoothly instead of navigating. */
export function HashLink({
  id,
  children,
  className = "",
  before,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  /** Runs first (e.g. close the menu); the scroll then waits a beat for the scroll lock to lift. */
  before?: () => void;
}) {
  const pathname = usePathname();
  return (
    <Link
      href={`/d/10#${id}`}
      className={className}
      onClick={(e) => {
        before?.();
        if (pathname !== "/d/10") return;
        e.preventDefault();
        window.setTimeout(() => scrollToId(id), before ? 90 : 0);
      }}
    >
      {children}
    </Link>
  );
}

/** "Sign in" for visitors, the first name once signed in. Session state only shows after hydration. */
export function useAccountLabel() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated) return "Account";
  return user ? user.name.trim().split(/\s+/)[0] : "Sign in";
}

export function Nav() {
  const menu = useStore(menuStore, false);
  const pathname = usePathname();
  const account = useAccountLabel();
  const here = (href: string) => (pathname === href ? "page" : undefined);
  return (
    <>
      <WoodRouteSync />
      <header className="fixed inset-x-0 top-0 z-[100]">
        <div className={`${k.navLine} ${k.gut} flex h-10 items-center gap-2.5 pr-[110px] sm:gap-6 md:h-11 md:pr-[150px]`}>
          <Link
            href="/d/10"
            className={`${k.disp} text-[15px] [font-variation-settings:'wdth'_96,'wght'_820] hover:text-[var(--k10-accent)] sm:text-[17px] sm:[font-variation-settings:'wdth'_130,'wght'_820] md:text-[19px]`}
          >
            Santalum
          </Link>
          <nav aria-label="Shop and account" className="flex min-w-0 items-center gap-2.5 sm:gap-5">
            <Link href="/d/10/shop" aria-current={here("/d/10/shop")} className={`${k.mono} ${k.link} aria-[current=page]:text-[var(--k10-accent)]`}>
              Shop
            </Link>
            <Link href="/d/10/track" aria-current={here("/d/10/track")} className={`${k.mono} ${k.link} hidden aria-[current=page]:text-[var(--k10-accent)] md:inline`}>
              Track order
            </Link>
            <Link
              href="/d/10/account"
              aria-current={here("/d/10/account")}
              className={`${k.mono} ${k.link} hidden max-w-[14ch] truncate aria-[current=page]:text-[var(--k10-accent)] md:inline`}
            >
              {account}
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2.5 md:gap-7">
            <WoodToggle size={15} className="sm:hidden" />
            <WoodToggle size={19} className="hidden sm:flex" />
            <button
              type="button"
              onClick={() => menuStore.set(true)}
              aria-expanded={menu}
              aria-controls="k10-menu"
              className={`${k.mono} ${k.link} py-2`}
            >
              Menu
            </button>
          </div>
        </div>
        <BagTab />
      </header>
      <Menu />
    </>
  );
}

/** The bag count is a big condensed number hanging from the top-right corner. */
export function BagTab({ inline = false }: { inline?: boolean }) {
  const lines = useBag();
  const { count } = bagSummary(lines);
  const added = useStore(addedStore, null);
  const open = useStore(sheetStore, false);
  return (
    <div className={inline ? "relative" : "absolute right-0 top-0"}>
      <button
        type="button"
        onClick={() => sheetStore.set(true)}
        aria-expanded={open}
        aria-label={`Bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
        className={`${k.bagTab} flex h-[64px] items-start gap-3 pl-4 pr-[var(--k10-gut)] pt-2 md:h-[84px] md:gap-4 md:pl-6 ${inline ? "rounded-bl-[22px]" : ""}`}
      >
        <span className={`${k.mono} pt-0.5`}>Bag</span>
        <span className="relative block h-[48px] min-w-[0.6em] overflow-hidden text-[56px] md:h-[66px] md:text-[78px]">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.span
              key={count}
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.55, ease: EASE }}
              className={`${k.bagNum} block text-right tabular-nums`}
            >
              {count}
            </motion.span>
          </AnimatePresence>
        </span>
      </button>
      <AnimatePresence>
        {added && (
          <motion.p
            key={added.id}
            role="status"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className={`${k.mono} absolute right-[var(--k10-gut)] top-full mt-2 max-w-[80vw] truncate whitespace-nowrap rounded-full bg-[var(--k10-ink)] px-3 py-1.5 text-[var(--k10-bg)]`}
          >
            Added: {added.name}, {added.wood}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

function Menu() {
  const open = useStore(menuStore, false);
  const wood = useWood();
  const c = CONTENT[wood];
  const lines = useBag();
  const { count } = bagSummary(lines);
  const account = useAccountLabel();
  const closeRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const n = productsFor(wood).length;

  // each word may stretch on hover only as far as its row allows (beside its note)
  useEffect(() => {
    const list = listRef.current;
    if (!open || !list) return;
    const calc = () => {
      list.querySelectorAll<HTMLElement>("[data-menu-row]").forEach((row) => {
        const word = row.querySelector<HTMLElement>("[data-menu-word]");
        const note = row.querySelector<HTMLElement>("[data-menu-note]");
        if (!word) return;
        const avail = row.clientWidth - (note?.offsetWidth ? note.offsetWidth + 24 : 0);
        const size = parseFloat(getComputedStyle(word).fontSize);
        if (avail > 0 && size) row.style.setProperty("--hw", wdthFor(word.textContent ?? "", avail * 0.98, size, 860).toFixed(1));
      });
    };
    const off = onFonts(calc);
    const ro = new ResizeObserver(calc);
    ro.observe(list);
    return () => {
      off();
      ro.disconnect();
    };
  }, [open, account]);

  useEffect(() => {
    if (!open) return;
    lockScroll();
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menuStore.set(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      unlockScroll();
      window.removeEventListener("keydown", onKey);
      prev?.focus?.({ preventScroll: true });
    };
  }, [open]);

  const close = () => menuStore.set(false);
  const routes: { href: string; word: string; note: string }[] = [
    { href: "/d/10/shop", word: "Shop", note: `${n} pieces in ${c.name.toLowerCase()}` },
    { href: "/d/10/track", word: "Track order", note: "Order number and the email or phone on it" },
    {
      href: "/d/10/account",
      word: account === "Sign in" || account === "Account" ? "Sign in" : "Account",
      note: account === "Sign in" || account === "Account" ? "Or create an account to place an order" : `Signed in as ${account}`,
    },
    { href: "/d/10/checkout", word: "Checkout", note: `${count} ${count === 1 ? "piece" : "pieces"} in the bag` },
  ];
  const sections = [
    { id: "collection", label: wood === "red" ? "Turned in red" : "Chosen in white" },
    { id: "woods", label: "Two woods" },
    { id: "heartwood", label: wood === "red" ? "Colour" : "Fragrance" },
    { id: "making", label: wood === "red" ? "At the lathe" : "At the still" },
    { id: "provenance", label: wood === "red" ? "Batch records" : "Lot records" },
    { id: "vault", label: c.edition.name },
    { id: "gifting", label: "Gifting" },
    { id: "circle", label: "Santalum Circle" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="k10-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          data-lenis-prevent
          initial={{ clipPath: "inset(0% 0% 100% 0%)" }}
          animate={{ clipPath: "inset(0% 0% 0% 0%)" }}
          exit={{ clipPath: "inset(0% 0% 100% 0%)" }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-0 z-[170] flex flex-col overflow-y-auto bg-[var(--k10-bg)]"
        >
          <div className={`${k.gut} flex h-12 shrink-0 items-center justify-between border-b border-[var(--k10-line)]`}>
            <span className={`${k.disp} text-[19px] [font-variation-settings:'wdth'_130,'wght'_820]`}>Santalum</span>
            <button ref={closeRef} type="button" onClick={close} className={`${k.mono} ${k.link} py-2`}>
              Close
            </button>
          </div>
          {/* From md up the four words share whatever height the sheet has (a size container), so there is no empty band. */}
          <ul ref={listRef} className={`${k.menuList} ${k.gut} py-4 md:min-h-0 md:flex-1 md:[container-type:size]`}>
            {routes.map((it, i) => (
              <li key={it.href} data-menu-row className="overflow-hidden border-b border-[var(--k10-line)]">
                <motion.div initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.12 + i * 0.05 }}>
                  <Link href={it.href} onClick={close} className={`${k.menuItem} flex items-end justify-between gap-6 pb-1 pt-2`}>
                    <span data-menu-word className={k.menuWord} style={{ fontSize: "min(15vw, calc((100cqh - 2rem) / 4 / 0.86 - 16px))" }}>
                      {it.word}
                    </span>
                    <span data-menu-note className={`${k.mono} hidden max-w-[34ch] shrink-0 pb-2 text-right text-[var(--k10-grey)] sm:block`}>
                      {it.note}
                    </span>
                  </Link>
                </motion.div>
              </li>
            ))}
          </ul>
          <div className={`${k.gut} flex-1 pb-6 md:flex-none`}>
            <p className={`${k.mono} text-[var(--k10-grey)]`}>On the home page, in {c.name.toLowerCase()}</p>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <HashLink id={s.id} before={close} className={`${k.disp} ${k.link} text-[length:clamp(22px,2.4vw,34px)] [font-variation-settings:'wdth'_70,'wght'_640] hover:[font-variation-settings:'wdth'_120,'wght'_760]`}>
                    {s.label}
                  </HashLink>
                </li>
              ))}
            </ul>
          </div>
          <div className={`${k.gut} flex shrink-0 flex-wrap items-end justify-end gap-x-10 gap-y-4 border-t border-[var(--k10-line)] pb-24 pt-5 md:pb-6`}>
            <WoodToggle size={44} />
            <p className={`${k.mono} max-w-[42ch] text-[var(--k10-grey)] md:text-right`}>
              {wood === "red"
                ? "You are in red sandalwood: beads, objects and jewellery turned from the dense heartwood. Choose white and the whole house changes."
                : "You are in white sandalwood: oil, attar, incense and Mysuru carving. Choose red and the whole house changes."}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
