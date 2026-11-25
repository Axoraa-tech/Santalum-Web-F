"use client";

import { AnimatePresence, motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { WT } from "@/components/maison/W";
import { signOut, useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "./cls";
import { BagLayer } from "./BagLayer";
import { cx } from "./data";
import { Expansion } from "./Expansion";
import { Palette } from "./Palette";
import { bagUI, menu, palette, useAdded, useBagUI, useIsMac, useMenu, usePalette, useView } from "./store";
import { IconBag, IconClose, IconGrid, IconOut, IconSearch, IconTrack, IconUser, Kbd, Mark, Swatch, trapTab } from "./ui";

const SPRING = { type: "spring", visualDuration: 0.55, bounce: 0.12 } as const;

function typing(t: EventTarget | null) {
  const el = t as HTMLElement | null;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT" || el.isContentEditable);
}

/** Client chrome for design 06: wordmark, nav, command bar, account, bag, wood switch, expansions. */
export function Shell({ children }: { children: ReactNode }) {
  const view = useView();
  const bagOpen = useBagUI().open;
  const menuOpen = useMenu();
  const wood = useWood();
  const locked = !!view || bagOpen || menuOpen;

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
        menu.close(false);
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
      <BodyBackground color={wood === "white" ? "#f2ede1" : "#f0e6e1"} />
      <TopBar />
      {children}
      <BagLayer />
      <Expansion />
      <Palette />
      <MenuSheet />
    </MotionConfig>
  );
}

const PILL = "shadow-[0_1px_2px_rgba(40,20,10,0.06),0_12px_30px_-16px_rgba(40,20,10,0.3)]";
const FOCUS = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

function TopBar() {
  const mac = useIsMac();
  const open = usePalette();
  const pathname = usePathname();
  return (
    <>
    {/* a ledge of canvas behind the pills: tiles slide under it instead of between the pills */}
    <div aria-hidden className="b6-ledge pointer-events-none fixed inset-x-0 top-0 z-[119] h-[70px]" />
    <header className="pointer-events-none fixed inset-x-0 top-3 z-[120] flex items-center gap-1.5 px-3 sm:gap-2">
      <Link
        href="/d/06"
        aria-label="Santalum Maison, home"
        className={cx(PILL, FOCUS, "pointer-events-auto flex h-11 shrink-0 items-center gap-2 rounded-full bg-[var(--b-tile)] px-3 transition-transform hover:-translate-y-px active:scale-[0.97] sm:pr-4")}
      >
        <Mark />
        <span className="hidden text-[16px] font-semibold tracking-[-0.035em] sm:inline">Santalum</span>
        <span className={cx(s.mono, s.muted, "hidden text-[11px] xl:inline")}>Maison</span>
      </Link>

      <nav aria-label="Main" className={cx(PILL, "pointer-events-auto hidden h-11 shrink-0 items-center rounded-full bg-[var(--b-tile)] p-1 sm:flex")}>
        <NavLink href="/d/06/shop" on={pathname.startsWith("/d/06/shop") || pathname.startsWith("/d/06/p/")}>
          Shop
        </NavLink>
        <NavLink href="/d/06/track" on={pathname.startsWith("/d/06/track")}>
          <span className="lg:hidden">Track</span>
          <span className="hidden lg:inline">Track order</span>
        </NavLink>
      </nav>

      <MenuPill />

      <div className="flex min-w-0 flex-1 justify-center">
        {!open && (
          <motion.button
            layoutId="cmd"
            type="button"
            onClick={() => palette.open()}
            aria-haspopup="dialog"
            aria-keyshortcuts="Control+K Meta+K"
            style={{ borderRadius: 22 }}
            className={cx(
              PILL,
              FOCUS,
              "pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center gap-3 bg-[var(--b-tile)] text-[var(--b-muted)] transition-colors hover:text-[var(--b-ink)] xl:w-full xl:max-w-[440px] xl:justify-start xl:px-4",
            )}
          >
            <IconSearch />
            <span className="hidden truncate text-[14px] xl:inline">
              <WT red="Search red sandalwood, or jump" white="Search white sandalwood, or jump" />
            </span>
            <span className="sr-only xl:hidden">Search</span>
            <span className="ml-auto hidden xl:inline-flex">
              <Kbd>{mac ? "⌘K" : "Ctrl K"}</Kbd>
            </span>
          </motion.button>
        )}
      </div>

      <AccountPill />
      <BagPill />
      <WoodPill className={cx(PILL, "pointer-events-auto shrink-0")} />
    </header>
    </>
  );
}

function NavLink({ href, on, children }: { href: string; on: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={on ? "page" : undefined}
      className={cx(
        FOCUS,
        "relative flex h-9 items-center rounded-full px-3.5 text-[14px] font-medium transition-colors active:scale-[0.97]",
        on ? "text-white" : "hover:bg-[var(--b-tile2)]",
      )}
    >
      {on && <motion.span layoutId="b6-navpill" className="absolute inset-0 rounded-full bg-[var(--b-ink)]" />}
      <span className="relative">{children}</span>
    </Link>
  );
}

function AccountPill() {
  const hydrated = useHydrated();
  const user = useUser();
  const pathname = usePathname();
  const first = hydrated && user ? user.name.split(" ")[0] : null;
  const on = pathname.startsWith("/d/06/account");
  return (
    <Link
      href="/d/06/account"
      aria-current={on ? "page" : undefined}
      aria-label={first ? `Your account, ${first}` : "Sign in"}
      className={cx(
        PILL,
        FOCUS,
        "pointer-events-auto hidden h-11 shrink-0 items-center gap-2 rounded-full p-1 pr-1 transition-colors active:scale-[0.97] sm:flex lg:pr-4",
        on ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile)] hover:bg-[var(--b-tile2)]",
      )}
    >
      <span className={cx("grid size-9 place-items-center rounded-full text-[14px] font-semibold", first ? "bg-accent-soft text-[var(--b-ink)]" : on ? "bg-white/10" : "bg-[var(--b-tile2)]")}>
        {first ? first[0].toUpperCase() : <IconUser size={17} />}
      </span>
      <span className="hidden max-w-[9ch] truncate text-[14px] font-medium lg:inline">{first ?? "Sign in"}</span>
    </Link>
  );
}

function BagPill() {
  const hydrated = useHydrated();
  const lines = useBag();
  const count = hydrated ? bagSummary(lines).count : 0;
  const bump = useAdded();
  const ui = useBagUI();
  if (ui.open && ui.from === "bag-top") return <span className="block h-11 w-11 shrink-0 sm:w-[74px]" aria-hidden />;
  return (
    <motion.button
      layoutId="bag-top"
      type="button"
      onClick={() => bagUI.open("bag-top")}
      aria-label={`Open bag, ${count} ${count === 1 ? "piece" : "pieces"}`}
      style={{ borderRadius: 22 }}
      className={cx(
        PILL,
        FOCUS,
        "pointer-events-auto relative flex h-11 w-11 shrink-0 items-center justify-center bg-[var(--b-tile)] transition-colors hover:bg-[var(--b-tile2)] sm:w-auto sm:justify-start sm:gap-1.5 sm:pl-3 sm:pr-1.5",
      )}
    >
      <IconBag size={18} />
      <motion.span
        key={bump}
        initial={{ scale: bump ? 1.6 : 1 }}
        animate={{ scale: 1 }}
        className={cx(
          s.mono,
          "absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] ring-2 ring-[var(--b-canvas)] sm:static sm:h-8 sm:min-w-8 sm:px-2 sm:text-[12px] sm:ring-0",
          count ? "bg-[var(--b-ink)] text-white" : "bg-[var(--b-tile2)] max-sm:hidden",
        )}
      >
        {count}
      </motion.span>
    </motion.button>
  );
}

/* ---------- phone: one pill that grows into a tile of links ---------- */

function MenuPill() {
  const open = useMenu();
  return (
    <div className="pointer-events-auto shrink-0 sm:hidden">
      {!open && (
        <motion.button
          layoutId="nav-menu"
          type="button"
          onClick={() => menu.open()}
          aria-haspopup="dialog"
          aria-label="Menu"
          style={{ borderRadius: 22 }}
          className={cx(PILL, FOCUS, "flex h-11 items-center gap-2 bg-[var(--b-tile)] px-3.5 text-[14px] font-medium")}
        >
          <IconGrid size={16} />
          Menu
        </motion.button>
      )}
    </div>
  );
}

function MenuSheet() {
  const open = useMenu();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="menu-scrim"
          className="fixed inset-0 z-[175] bg-[var(--b-canvas)]/80 sm:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => menu.close()}
          aria-hidden
        />
      )}
      {open && <MenuPanel key="menu-panel" />}
    </AnimatePresence>
  );
}

function MenuPanel() {
  const box = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);
  const wood = useWood();
  const user = useUser();
  const lines = useBag();
  const { count } = bagSummary(lines);
  const pathname = usePathname();
  const start = useRef(pathname);

  useEffect(() => {
    const t = window.setTimeout(() => first.current?.focus({ preventScroll: true }), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") menu.close();
      if (e.key === "Tab" && box.current) trapTab(e, box.current);
    };
    const mq = window.matchMedia("(min-width: 640px)");
    const onMq = () => mq.matches && menu.close(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, []);

  // a link was followed: fold the menu away
  useEffect(() => {
    if (pathname !== start.current) menu.close(false);
  }, [pathname]);

  const go = () => menu.close(false);
  const n = productsFor(wood).length;
  const tile = cx(FOCUS, "flex min-h-[112px] flex-col justify-between rounded-[20px] p-4 text-left transition-transform active:scale-[0.98]");

  return (
    <div className="pointer-events-none fixed inset-x-3 top-3 z-[180] sm:hidden">
      <motion.div
        ref={box}
        layoutId="nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        style={{ borderRadius: 28 }}
        className="pointer-events-auto overflow-hidden bg-[var(--b-tile)] shadow-[0_40px_90px_-30px_rgba(40,20,10,0.45)]"
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.08, duration: 0.25 } }}
          exit={{ opacity: 0, transition: { duration: 0.1 } }}
          className="p-2"
        >
          <div className="flex items-center justify-between px-3 pb-2 pt-2">
            <p className="text-[20px] font-medium tracking-[-0.03em]">Santalum</p>
            <button ref={first} type="button" className={s.icon} onClick={() => menu.close()} aria-label="Close menu">
              <IconClose />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/d/06/shop" onClick={go} className={cx(tile, "col-span-2 bg-[var(--b-ink)] text-white")}>
              <span className="text-[30px] font-medium leading-none tracking-[-0.04em]">Shop</span>
              <span className={cx(s.mono, "text-[11px] text-white/60")}>
                {n} {wood === "red" ? "red" : "white"} sandalwood pieces
              </span>
            </Link>
            <Link href="/d/06/track" onClick={go} className={cx(tile, "bg-[var(--b-tile2)]")}>
              <IconTrack size={20} />
              <span className="text-[17px] font-medium">Track order</span>
            </Link>
            <Link href="/d/06/account" onClick={go} className={cx(tile, "bg-[var(--b-tile2)]")}>
              <IconUser size={20} />
              <span className="truncate text-[17px] font-medium">{user ? user.name.split(" ")[0] : "Sign in"}</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                menu.close(false);
                bagUI.open("bag-top");
              }}
              className={cx(tile, "bg-accent-soft")}
            >
              <IconBag size={20} />
              <span className="text-[17px] font-medium">
                Bag <span className={cx(s.mono, "text-[12px]")}>{count}</span>
              </span>
            </button>
            <button type="button" onClick={() => switchWood(wood === "red" ? "white" : "red")} className={cx(tile, "bg-[var(--b-tile2)]")}>
              <Swatch wood={wood === "red" ? "white" : "red"} size={20} />
              <span className="text-[17px] font-medium">Show {wood === "red" ? "white" : "red"}</span>
            </button>
          </div>
          {user && (
            <button
              type="button"
              onClick={() => {
                signOut();
                menu.close(false);
              }}
              className={cx(FOCUS, "mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[16px] text-[15px] text-[var(--b-muted)] hover:bg-[var(--b-tile2)]")}
            >
              <IconOut size={16} /> Sign out
            </button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}

export function WoodPill({ className }: { className?: string }) {
  const wood = useWood();
  const hydrated = useHydrated();
  return (
    <div
      role="radiogroup"
      aria-label="Wood"
      className={cx("flex h-11 items-center gap-0.5 rounded-full bg-[var(--b-tile)] p-1", className)}
      onKeyDown={(e) => {
        if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
          e.preventDefault();
          switchWood(wood === "red" ? "white" : "red");
        }
      }}
    >
      {(["red", "white"] as const).map((w) => {
        const on = hydrated && wood === w;
        return (
          <button
            key={w}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={w === "red" ? "Red sandalwood" : "White sandalwood"}
            tabIndex={!hydrated || on ? 0 : -1}
            onClick={() => wood !== w && switchWood(w)}
            className={cx(
              "b6-wp",
              `b6-wp-${w}`,
              "relative flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] font-medium transition-colors hover:bg-[var(--b-tile2)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent active:scale-[0.96] lg:px-3",
            )}
          >
            {/* before hydration CSS marks the current wood; after, the marker slides */}
            {!hydrated && <span className="b6-wpi absolute inset-0 rounded-full bg-[var(--b-ink)]" />}
            {on && <motion.span layoutId="b6-woodpill" className="absolute inset-0 rounded-full bg-[var(--b-ink)]" />}
            <Swatch wood={w} className="relative" />
            <span className="relative hidden lg:inline">{w === "red" ? "Red" : "White"}</span>
          </button>
        );
      })}
    </div>
  );
}
