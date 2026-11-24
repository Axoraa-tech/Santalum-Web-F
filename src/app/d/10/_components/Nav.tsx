"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { FAMILIES, WOOD_NAMES } from "@/lib/catalog";
import { bagTotals, useBag } from "@/lib/cart";
import { useWood } from "@/lib/wood";
import k from "../k";
import { addedStore, EASE, lockScroll, menuStore, scrollToId, sheetStore, unlockScroll, useStore } from "./lib";
import { WoodToggle } from "./WoodToggle";

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

const LINKS = [
  { id: "collection", label: "Collection" },
  { id: "woods", label: "Two woods" },
  { id: "making", label: "Making" },
  { id: "provenance", label: "Provenance" },
  { id: "vault", label: "Vault" },
  { id: "gifting", label: "Gifting" },
  { id: "circle", label: "Circle" },
];

export function Nav() {
  const menu = useStore(menuStore, false);
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[100]">
        <div className={`${k.navLine} ${k.gut} flex h-10 items-center gap-3 pr-[114px] sm:gap-6 md:h-11 md:pr-[150px]`}>
          <Link href="/d/10" className={`${k.disp} text-[17px] [font-variation-settings:'wdth'_130,'wght'_820] hover:text-[var(--m-accent)] md:text-[19px]`}>
            Santalum
          </Link>
          <nav aria-label="Sections" className="hidden min-w-0 flex-1 items-center gap-5 lg:flex">
            {LINKS.map((l) => (
              <HashLink key={l.id} id={l.id} className={`${k.mono} ${k.link}`}>
                {l.label}
              </HashLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3 md:gap-7">
            <WoodToggle size={16} className="sm:hidden" />
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
  const { count } = bagTotals(lines);
  const added = useStore(addedStore, null);
  const open = useStore(sheetStore, false);
  return (
    <div className={inline ? "relative" : "absolute right-0 top-0"}>
      <button
        type="button"
        onClick={() => sheetStore.set(true)}
        aria-expanded={open}
        aria-label={`Bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
        className={`${k.bagTab} flex h-[64px] items-start gap-3 pl-4 pr-[var(--k-gut)] pt-2 md:h-[84px] md:gap-4 md:pl-6 ${inline ? "rounded-bl-[22px]" : ""}`}
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
            className={`${k.mono} absolute right-[var(--k-gut)] top-full mt-2 whitespace-nowrap rounded-full bg-[var(--k-ink)] px-3 py-1.5 text-[var(--k-bg)]`}
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
  const lines = useBag();
  const { count } = bagTotals(lines);
  const closeRef = useRef<HTMLButtonElement>(null);
  const inWood = FAMILIES.filter((f) => f.variants[wood]).length;

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
  const items: { id: string; word: string; note: string }[] = [
    { id: "collection", word: "Collection", note: `${inWood} families in ${WOOD_NAMES[wood].common.toLowerCase()}` },
    { id: "woods", word: "Two woods", note: "Pterocarpus santalinus and Santalum album" },
    { id: "heartwood", word: "Heartwood", note: "Where the colour, and the scent, is held" },
    { id: "making", word: "Making", note: "Select, shape, finish, inspect, present" },
    { id: "provenance", word: "Provenance", note: "An example record, printed" },
    { id: "vault", word: "The 2011 Vault", note: "Twenty-one numbered cuffs" },
    { id: "gifting", word: "Gifting", note: "Personal and corporate" },
    { id: "circle", word: "Circle", note: "Letters from the Maison" },
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
          className="fixed inset-0 z-[170] flex flex-col overflow-y-auto bg-[var(--k-bg)]"
        >
          <div className={`${k.gut} flex h-12 shrink-0 items-center justify-between border-b border-[var(--k-line)]`}>
            <span className={`${k.disp} text-[19px] [font-variation-settings:'wdth'_130,'wght'_820]`}>Santalum</span>
            <button ref={closeRef} type="button" onClick={close} className={`${k.mono} ${k.link} py-2`}>
              Close
            </button>
          </div>
          <ul className={`${k.menuList} ${k.gut} flex-1 py-4`}>
            {items.map((it, i) => (
              <li key={it.id} className="overflow-hidden border-b border-[var(--k-line)]">
                <motion.div
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, ease: EASE, delay: 0.12 + i * 0.045 }}
                >
                  <HashLink id={it.id} before={close} className={`${k.menuItem} flex items-end justify-between gap-6 pb-1 pt-2`}>
                    <span className={`${k.menuWord} text-[length:min(8.2svh,12.4vw)]`}>{it.word}</span>
                    <span className={`${k.mono} hidden max-w-[30ch] pb-2 text-right text-[var(--k-grey)] md:block`}>{it.note}</span>
                  </HashLink>
                </motion.div>
              </li>
            ))}
            <li className="overflow-hidden">
              <motion.div initial={{ y: "105%" }} animate={{ y: "0%" }} transition={{ duration: 0.8, ease: EASE, delay: 0.12 + items.length * 0.045 }}>
                <Link href="/d/10/checkout" onClick={close} className={`${k.menuItem} flex items-end justify-between gap-6 pb-1 pt-2`}>
                  <span className={`${k.menuWord} text-[length:min(8.2svh,12.4vw)]`}>Checkout</span>
                  <span className={`${k.mono} pb-2 text-right text-[var(--k-grey)]`}>
                    {count} {count === 1 ? "piece" : "pieces"} in the bag
                  </span>
                </Link>
              </motion.div>
            </li>
          </ul>
          <div className={`${k.gut} flex shrink-0 flex-wrap items-end justify-end gap-x-10 gap-y-4 border-t border-[var(--k-line)] pb-24 pt-5 md:pb-6`}>
            <WoodToggle size={44} />
            <p className={`${k.mono} max-w-[42ch] text-[var(--k-grey)] md:text-right`}>
              Santalum Maison makes sandalwood objects, jewellery and gifts in India. Choose a wood; the whole site follows it.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
