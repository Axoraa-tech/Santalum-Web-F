"use client";

import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLayoutEffect, useRef } from "react";
import { WT } from "@/components/maison/W";
import { useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { setPendingWood, slipFlag, useFlag } from "./store";

const WOODS: { key: Wood; label: string }[] = [
  { key: "red", label: "Red" },
  { key: "white", label: "White" },
];

/** The account link: the reader's first name once signed in, otherwise "Sign in". Session bits wait for hydration. */
export function AccountLabel() {
  const hydrated = useHydrated();
  const user = useUser();
  if (!hydrated || !user) return <>Sign in</>;
  return <>{user.name.split(" ")[0]}</>;
}

export const NAV = [
  { href: "/d/05/shop", label: "Shop" },
  { href: "/d/05/track", label: "Track order" },
  { href: "/d/05/account", label: null },
] as const;

/**
 * Switching wood on a product page follows the product into the other wood (its counterpart, or the shop).
 * The piece on screen belongs to its own wood, so the page is left first and the wood changes where it lands:
 * a counterpart sets its own wood, the shop takes the pending one. On the shop it drops the old wood's category.
 */
export function useWoodSwitch() {
  const pathname = usePathname();
  const router = useRouter();
  return (next: Wood) => {
    const m = pathname.match(/^\/d\/05\/p\/([^/]+)/);
    const p = m ? getProduct(decodeURIComponent(m[1])) : undefined;
    if (p && p.wood !== next) {
      if (p.counterpart) router.push(`/d/05/p/${p.counterpart}`);
      else {
        setPendingWood(next);
        router.push("/d/05/shop");
      }
      return;
    }
    switchWood(next);
    if (pathname === "/d/05/shop" && window.location.search.includes("c=")) router.replace("/d/05/shop", { scroll: false });
  };
}

/** The running head's page name, as a printed catalogue names the part you are in. */
function pageName(pathname: string) {
  if (pathname.startsWith("/d/05/shop")) return "Catalogue";
  if (pathname.startsWith("/d/05/p/")) return "Entry";
  if (pathname.startsWith("/d/05/checkout")) return "Order form";
  if (pathname.startsWith("/d/05/track")) return "Dispatch log";
  if (pathname.startsWith("/d/05/account")) return "Your file";
  return "The edition";
}

/** Top-right: Shop, Track order, Account, the wood toggle set as text with a sliding underline, and Bag (n). */
export function Controls() {
  const wood = useWood();
  const pathname = usePathname();
  const { count } = bagSummary(useBag());
  const open = useFlag(slipFlag);
  const woodsRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const change = useWoodSwitch();

  // The running head takes a hairline once the page has moved under it.
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (y) => bandRef.current?.toggleAttribute("data-scrolled", y > 4));
  useLayoutEffect(() => {
    bandRef.current?.toggleAttribute("data-scrolled", window.scrollY > 4);
  }, []);

  // Measure both words so the underline can slide between them in CSS (driven by html[data-wood], no flash).
  useLayoutEffect(() => {
    const el = woodsRef.current;
    if (!el) return;
    const measure = () => {
      const r = el.querySelector<HTMLElement>('[data-w="red"]');
      const w = el.querySelector<HTMLElement>('[data-w="white"]');
      if (!r || !w) return;
      el.style.setProperty("--rx", `${r.offsetLeft}px`);
      el.style.setProperty("--rw", `${r.offsetWidth}px`);
      el.style.setProperty("--wx", `${w.offsetLeft}px`);
      el.style.setProperty("--ww", `${w.offsetWidth}px`);
      el.dataset.ready = "";
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={bandRef} className="x5-controls">
      <p className="x5-runHead" aria-hidden>
        <b>Index</b>
        <span>
          <WT red="Red sandalwood edition" white="White sandalwood edition" />
        </span>
        <span>{pageName(pathname)}</span>
      </p>
      <span className="x5-bandRule" aria-hidden />
      <div className="x5-controlsRow">
        <nav className="x5-navLinks" aria-label="Shop and account">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="x5-navLink" aria-current={pathname === n.href ? "page" : undefined}>
              {n.label ?? <AccountLabel />}
            </Link>
          ))}
        </nav>
        <div ref={woodsRef} className="x5-woods" role="group" aria-label="Wood">
          {WOODS.map((w, i) => (
            <span key={w.key} className="contents">
              {i === 1 && (
                <span aria-hidden className="x5-slash">
                  /
                </span>
              )}
              <button
                type="button"
                data-w={w.key}
                className="x5-woodBtn"
                aria-pressed={wood === w.key}
                aria-label={`${w.label} sandalwood`}
                onClick={() => wood !== w.key && change(w.key)}
              >
                {w.label}
              </button>
            </span>
          ))}
          <span aria-hidden className="x5-underline" />
        </div>
        <button type="button" className="x5-bagBtn" aria-expanded={open} aria-controls="idx-slip" onClick={() => slipFlag.set(!open)}>
          Bag&nbsp;(
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={count}
              className="x5-bagN"
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            >
              {count}
            </motion.span>
          </AnimatePresence>
          )
        </button>
      </div>
    </div>
  );
}
