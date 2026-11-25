"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { useUser } from "@/lib/shop/account";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import { setMode, useEffectiveMode } from "../_lib/view";
import { Bag } from "./Bag";
import { Mark } from "./Mark";
import { PinGlyph, WoodPins } from "./Pins";
import { s } from "./styles";

export { Mark };

/** Overscroll and short pages show the wood's own paper. */
export function AtlasBody() {
  const wood = useWood();
  return <BodyBackground color={wood === "white" ? "#f8f4e9" : "#f6f0ec"} />;
}

function ViewToggle({ home }: { home: boolean }) {
  const router = useRouter();
  const mode = useEffectiveMode();
  const choose = (m: "canvas" | "list") => {
    setMode(m);
    if (!home) router.push("/d/08");
    else window.scrollTo({ top: 0 });
  };
  return (
    <div role="group" aria-label="View" className={`${s.chip} relative flex h-11 shrink-0 items-center rounded-full p-1`}>
      {(["canvas", "list"] as const).map((m) => {
        const on = home ? mode === m : false;
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            onClick={() => choose(m)}
            className={`relative flex h-9 items-center gap-1.5 rounded-full px-2.5 text-[14px] font-medium transition-colors duration-300 lg:px-3.5 ${
              on ? "text-(--a-paper)" : "text-(--a-ink-2) hover:text-(--a-ink)"
            }`}
          >
            {on && <motion.span layoutId="a8-view-pill" className="absolute inset-0 rounded-full bg-(--a-ink)" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className="relative">
              {m === "canvas" ? (
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
                  <circle cx="5.5" cy="6" r="1.4" fill="currentColor" />
                  <circle cx="10.5" cy="10" r="1.4" fill="currentColor" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
                  <path d="M3.5 1.8h6l3 3v9.4h-9z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
                  <path d="M9.3 1.8v3.2h3.2" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
                  <path d="M5.6 8.2h4.8M5.6 10.8h4.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              )}
            </span>
            <span className="relative hidden lg:inline">{m === "canvas" ? "Canvas" : "List"}</span>
            <span className="sr-only lg:hidden">{m === "canvas" ? "Canvas view" : "List view"}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Symbols for the phone legend: each destination keyed like a feature on the map. */
function LegendSym({ k }: { k: "shop" | "track" | "account" }) {
  if (k === "shop") return <PinGlyph color="var(--a-accent)" className="h-6 w-[18px]" />;
  if (k === "track")
    return (
      <svg viewBox="0 0 28 10" className="h-2.5 w-7" aria-hidden>
        <path d="M2 5h24" stroke="var(--a-accent)" strokeWidth="2.5" strokeDasharray="5 4" />
      </svg>
    );
  return <span className="block size-3.5 rounded-full border-2 border-(--a-accent) bg-(--a-card)" aria-hidden />;
}

export function TopBar() {
  const pathname = usePathname();
  const mode = useEffectiveMode();
  const home = pathname === "/d/08";
  const user = useUser();
  const hydrated = useHydrated();
  // The phone menu belongs to the page and view it was opened on: a new route or view closes it.
  const here = `${pathname}|${mode}`;
  const [menuAt, setMenuAt] = useState<string | null>(null);
  const menu = menuAt === here;
  const closeMenu = () => setMenuAt(null);
  const menuWrap = useRef<HTMLDivElement>(null);
  const menuBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!menu) return;
    const onDown = (e: PointerEvent) => {
      if (menuWrap.current && !menuWrap.current.contains(e.target as Node)) setMenuAt(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuAt(null);
        menuBtn.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);
  const account = hydrated && user ? user.name.split(" ")[0] : "Sign in";
  const links = [
    { href: "/d/08/shop", label: "Shop", sym: "shop" as const, note: "Every piece of this wood" },
    { href: "/d/08/track", label: "Track order", sym: "track" as const, note: "The route to your door" },
    { href: "/d/08/account", label: account, sym: "account" as const, note: hydrated && user ? "Orders, wishlist, addresses" : "Or create an account" },
  ];
  const isOn = (href: string) => pathname.startsWith(href) || (href === "/d/08/shop" && pathname.startsWith("/d/08/p/"));
  const desktopNav = links.map((l) => {
    const on = isOn(l.href);
    return (
      <Link
        key={l.href}
        href={l.href}
        aria-current={on ? "page" : undefined}
        className={`relative flex h-9 max-w-[10rem] items-center rounded-full px-3 text-[14px] font-medium transition-colors hover:bg-(--a-ink)/[0.05] ${on ? "text-(--a-ink)" : "text-(--a-ink-2)"}`}
      >
        <span className="truncate">{l.label}</span>
        {on && <span className="absolute inset-x-3 bottom-1 h-[2px] rounded-full bg-(--a-accent)" aria-hidden />}
      </Link>
    );
  });
  const legendRow = (key: string, sym: ReactNode, label: string, note: string, on: boolean, href: string) => (
    <li key={key}>
      <Link
        href={href}
        onClick={closeMenu}
        aria-current={on ? "page" : undefined}
        className="grid grid-cols-[2rem_1fr] items-center gap-x-3 border-b border-dashed border-(--a-line-2) px-1 py-2.5 hover:bg-(--a-paper-2)"
      >
        <span className="grid place-items-center">{sym}</span>
        <span className="min-w-0">
          <span className="flex items-baseline justify-between gap-2">
            <span className={`${s.serif} truncate text-[19px] leading-tight`}>{label}</span>
            {on && <span className="shrink-0 text-[12px] font-semibold text-(--a-accent-deep)">You are here</span>}
          </span>
          <span className="block text-[13px] leading-snug text-(--a-muted)">{note}</span>
        </span>
      </Link>
    </li>
  );
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-[120] flex items-start justify-between gap-2 px-3 pt-3 md:px-4 md:pt-4">
      {/* the sheet's top margin: board and page text fade out under the chips instead of showing between them */}
      <span aria-hidden className="absolute inset-x-0 top-0 -z-10 h-24 bg-[linear-gradient(to_bottom,var(--a-paper)_45%,transparent)]" />
      <div className="pointer-events-auto flex items-center gap-2">
        <Link href="/d/08" aria-label="Santalum Maison, the board" className={`${s.chip} flex h-11 shrink-0 items-center gap-2 rounded-full px-2.5 text-(--a-ink) hover:border-(--a-ink) xl:pr-4`}>
          <Mark className="size-7" />
          <span className={`${s.serif} hidden text-[18px] leading-none xl:inline`}>
            Santalum <span className="text-(--a-muted)">Maison</span>
          </span>
        </Link>
        <div className={home ? "" : "hidden md:block"}>
          <ViewToggle home={home} />
        </div>
      </div>
      <div className="pointer-events-auto flex shrink-0 items-center gap-2">
        <nav aria-label="Shop and account" className={`${s.chip} hidden h-11 items-center gap-0.5 rounded-full px-1.5 md:flex`}>
          {desktopNav}
        </nav>
        <WoodPins compact />
        <Bag />
        <div ref={menuWrap} className="relative md:hidden">
          <button
            ref={menuBtn}
            type="button"
            aria-expanded={menu}
            aria-controls="a8-phone-legend"
            aria-label={menu ? "Close the menu" : "Menu"}
            onClick={() => setMenuAt(menu ? null : here)}
            className={`${s.chip} ${s.btn} size-11 ${menu ? "!border-(--a-ink)" : ""}`}
          >
            <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden>
              <path d={menu ? "M5 5l10 10M15 5L5 15" : "M3.5 6.5h13M3.5 10h13M3.5 13.5h8"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          {menu && (
            <motion.nav
              id="a8-phone-legend"
              aria-label="Site"
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 top-[calc(100%+10px)] w-[min(calc(100vw-24px),320px)] border border-(--a-ink) bg-(--a-card) p-1 shadow-[0_30px_70px_-30px_rgba(31,29,26,0.55)]"
            >
              <div className="border border-(--a-line-2) px-3 pb-2 pt-3">
                <p className="flex items-baseline justify-between gap-3 border-b-2 border-(--a-ink) pb-1.5">
                  <span className={`${s.serif} text-[22px] leading-none`}>Legend</span>
                  <span className="text-[13px] text-(--a-muted)">Where to go</span>
                </p>
                <ul className="mt-1 [&>li:last-child>a]:border-b-0">{links.map((l) => legendRow(l.href, <LegendSym k={l.sym} />, l.label, l.note, isOn(l.href), l.href))}</ul>
                {!home && (
                  <p className="mt-1 border-t border-(--a-line-2) pt-2 text-[14px]">
                    <Link href="/d/08" onClick={closeMenu} className={s.link}>
                      Back to the board
                    </Link>
                  </p>
                )}
              </div>
            </motion.nav>
          )}
        </div>
      </div>
    </header>
  );
}
