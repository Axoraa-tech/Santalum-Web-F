"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { W, WT } from "@/components/maison/W";
import { useUser } from "@/lib/shop/account";
import { bagSummary, useBag } from "@/lib/shop/bag";
import { CATEGORIES, getProduct, productsFor, type Wood } from "@/lib/shop/products";
import { setWoodQuietly, switchWood, useWood } from "@/lib/wood";
import { HOME, SHOP, productHref, useHydrated, useMedia } from "./bits";
import { glideTo, ui, useUI } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Go to a section of the home page: glide when already there, navigate otherwise. */
export function useSectionLink() {
  const pathname = usePathname();
  const router = useRouter();
  return (hash: string) => (e: MouseEvent) => {
    if (pathname !== HOME) {
      ui.closeMenu();
      ui.closeBag();
      return; // let the Link navigate to /d/03#hash
    }
    e.preventDefault();
    ui.closeMenu();
    ui.closeBag();
    // wait for the page to unlock before gliding
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const el = document.getElementById(hash);
        if (el) glideTo(el.getBoundingClientRect().top + window.scrollY - (hash === "strand" ? 0 : 24));
        else router.push(`${HOME}#${hash}`);
      }),
    );
  };
}

/**
 * Flip the wood. A product page belongs to its wood, so flipping there moves to the same piece
 * in the other wood if we make one, otherwise to the shop. On the shop, a category of the old wood is dropped.
 */
export function useFlipWood() {
  const pathname = usePathname();
  const router = useRouter();
  return (next: Wood) => {
    const now = document.documentElement.dataset.wood === "white" ? "white" : "red";
    if (next === now) return;
    const m = pathname.match(/^\/d\/03\/p\/([^/]+)/);
    const p = m ? getProduct(decodeURIComponent(m[1])) : null;
    if (p && p.wood !== next) {
      // this piece belongs to the other wood: take it off the page before the colours change,
      // so it never shows in the new wood's palette, then go to its counterpart or the shop
      document.documentElement.classList.add("s3-leaving");
      setWoodQuietly(next);
      router.push(p.counterpart ? productHref(p.counterpart) : SHOP);
      // the new page brings it back (effect in Nav); this is only a safety net if the navigation never lands
      window.setTimeout(() => document.documentElement.classList.remove("s3-leaving"), 20000);
      return;
    }
    switchWood(next);
    if (pathname === SHOP && window.location.search.includes("c=")) window.history.replaceState(null, "", SHOP);
  };
}

function useFirstName() {
  const hydrated = useHydrated();
  const user = useUser();
  return hydrated && user ? user.name.split(" ")[0] : null;
}

export function Nav() {
  const s = useUI();
  const pathname = usePathname();
  const first = useFirstName();
  const head = useRef<HTMLElement>(null);

  // once the page moves under the bar, the bar shows its thread
  useEffect(() => {
    const el = head.current;
    if (!el) return;
    let on = false;
    const check = () => {
      const next = window.scrollY > 6;
      if (next !== on) {
        on = next;
        el.dataset.scrolled = String(next);
      }
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);

  // a page that was taken off for a wood change comes back once the new page is in
  useEffect(() => {
    document.documentElement.classList.remove("s3-leaving");
  }, [pathname]);

  const links = [
    { href: SHOP, label: "Shop", match: (p: string) => p.startsWith(SHOP) || p.startsWith("/d/03/p/") },
    { href: "/d/03/track", label: "Track order", match: (p: string) => p.startsWith("/d/03/track") },
    { href: "/d/03/account", label: first ?? "Sign in", match: (p: string) => p.startsWith("/d/03/account") },
  ];
  return (
    <>
      <header ref={head} className="s3-head fixed inset-x-0 top-0 z-[60] flex h-[72px] items-center justify-between gap-3 px-4 md:h-[84px] md:px-8">
        <Link href={HOME} className="s3-serif flex items-baseline gap-2 text-[21px] leading-none tracking-[-0.01em] transition-opacity hover:opacity-70 md:text-[25px]">
          Santalum
          <span className="hidden text-[0.72em] text-(--muted) sm:inline">Maison</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-2">
          <nav aria-label="Shop and account" className="mr-2 hidden items-center lg:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="s3-navlink" aria-current={l.match(pathname) ? "page" : undefined}>
                {l.label}
              </Link>
            ))}
          </nav>
          <WoodBeads />
          <BagButton open={s.bag} pulse={s.added} />
          <button
            type="button"
            onClick={ui.openMenu}
            aria-expanded={s.menu}
            aria-controls="s3-menu"
            className="group flex h-11 items-center gap-2.5 rounded-full px-3 text-[15px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10"
          >
            <span className="relative block h-[10px] w-[22px]" aria-hidden>
              <span className="absolute inset-x-0 top-0 h-px bg-(--ink) transition-transform duration-500 group-hover:translate-x-1" />
              <span className="absolute inset-x-0 bottom-0 h-px bg-(--ink)" />
              <span className="s3-bead absolute -top-[3.5px] left-[3px] h-2 w-2 transition-transform duration-500 group-hover:translate-x-3" />
            </span>
            Menu
          </button>
        </div>
      </header>
      <Menu open={s.menu} />
    </>
  );
}

/** Two beads on a short thread. The chosen wood is pushed up against the knot, as when counting a mala. */
function WoodBeads() {
  const wood = useWood();
  const flip = useFlipWood();
  return (
    <div role="group" aria-label="Choose the wood" className="flex items-center gap-2 pr-1">
      <div className="s3-wt">
        <span className="s3-wt-knot" aria-hidden />
        <button type="button" className="s3-wt-b" data-w="red" aria-pressed={wood === "red"} aria-label="Red sandalwood" onClick={() => flip("red")}>
          <span className="s3-bead" data-w="red" />
        </button>
        <button type="button" className="s3-wt-b" data-w="white" aria-pressed={wood === "white"} aria-label="White sandalwood" onClick={() => flip("white")}>
          <span className="s3-bead" data-w="white" />
        </button>
      </div>
      <span className="hidden w-[3.2rem] text-[14px] text-(--muted) md:inline" aria-hidden>
        <WT red="Red" white="White" />
      </span>
    </div>
  );
}

/** The bag: a hanging loop of thread with one bead for each piece in it. */
function BagButton({ open, pulse }: { open: boolean; pulse: number }) {
  const hydrated = useHydrated();
  const lines = useBag();
  const count = hydrated ? bagSummary(lines).count : 0;
  const [scope, animate] = useAnimate();
  const first = useRef(pulse);
  useEffect(() => {
    if (pulse === first.current || !scope.current) return;
    animate(scope.current, { y: [0, 5, -2, 0], scaleY: [1, 1.14, 0.96, 1] }, { duration: 0.7, ease: EASE });
  }, [pulse, animate, scope]);
  const shown = Math.min(count, 9);
  const beads = Array.from({ length: shown }, (_, i) => {
    const t = (i + 1) / (shown + 1);
    const a = Math.PI * t;
    return { x: 16 - 12.5 * Math.cos(a), y: 3 + 15 * Math.sin(a) };
  });
  return (
    <button
      type="button"
      onClick={ui.toggleBag}
      aria-expanded={open}
      aria-controls="s3-bag"
      aria-label={count ? `Bag, ${count} ${count === 1 ? "piece" : "pieces"}` : "Bag, empty"}
      className="s3-bagbtn flex h-11 items-center gap-2 rounded-full px-3 text-[15px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10"
    >
      <svg ref={scope} width="32" height="22" viewBox="0 0 32 22" aria-hidden style={{ transformOrigin: "50% 0" }}>
        <path d="M3.5 3 C 3.5 26, 28.5 26, 28.5 3" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        <circle cx="3.5" cy="3" r="1.6" fill="#8f6c3c" />
        <circle cx="28.5" cy="3" r="1.6" fill="#8f6c3c" />
        {beads.map((b, i) => (
          <circle key={i} cx={b.x} cy={b.y} r="3.3" fill="var(--s3-bead)" stroke="rgb(0 0 0 / 0.18)" strokeWidth="0.6" />
        ))}
      </svg>
      <span className="hidden sm:inline">Bag</span>
      {count > 0 && <span className="min-w-[1ch] text-[14px] tabular-nums text-(--muted)">{count}</span>}
    </button>
  );
}

type Item = { key: string; label: ReactNode; href?: string; hash?: string; bag?: boolean };

/** Full-screen menu: the links are strung along one long thread. */
function Menu({ open }: { open: boolean }) {
  const wide = useMedia("(min-width: 900px)");
  const go = useSectionLink();
  const close = useRef<HTMLButtonElement>(null);
  const first = useFirstName();
  // the thread is drawn in the panel's own pixels, so every bead sits exactly on it at any size
  const [box, setBox] = useState({ w: 0, h: 0 });
  const ro = useRef<ResizeObserver | null>(null);
  const panel = useCallback((el: HTMLDivElement | null) => {
    ro.current?.disconnect();
    if (!el) return;
    const read = () => setBox({ w: el.clientWidth, h: el.clientHeight });
    read();
    ro.current = new ResizeObserver(read);
    ro.current.observe(el);
  }, []);
  const items: Item[] = [
    { key: "shop", label: "Shop", href: SHOP },
    { key: "track", label: "Track your order", href: "/d/03/track" },
    { key: "account", label: first ? `${first}, your account` : "Sign in or create an account", href: "/d/03/account" },
    { key: "strand", label: <WT red="The red strand" white="The white strand" />, hash: "strand" },
    { key: "woods", label: "Two woods", hash: "woods" },
    { key: "making", label: "Making", hash: "making" },
    { key: "provenance", label: "Provenance", hash: "provenance" },
    { key: "vault", label: <WT red="The 2011 Vault" white="The 2011 Reserve" />, hash: "vault" },
    { key: "gifting", label: "Gifting", hash: "gifting" },
    { key: "circle", label: "Santalum Circle", hash: "circle" },
    { key: "bag", label: "Your bag", bag: true },
  ];

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") ui.closeMenu();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open]);

  // where each item sits on the thread (percent of the panel): a slow S down the left, labels to the right
  const pos = (i: number, n: number) => {
    const t = i / (n - 1);
    if (wide) return { x: 9 + Math.sin(t * Math.PI * 1.15) * 9, y: 7 + t * 84 };
    return { x: 9 + Math.sin(t * Math.PI) * 5, y: 6 + t * 88 };
  };
  const pts = [{ x: pos(0, items.length).x - 2, y: -2 }, ...items.map((_, i) => pos(i, items.length)), { x: pos(items.length - 1, items.length).x + 3, y: 102 }];
  const px = pts.map((p) => ({ x: (p.x * box.w) / 100, y: (p.y * box.h) / 100 }));
  let d = `M ${px[0].x.toFixed(1)} ${px[0].y.toFixed(1)}`;
  for (let i = 0; i < px.length - 1; i++) {
    const a = px[i - 1] ?? px[i];
    const b = px[i];
    const c = px[i + 1];
    const e = px[i + 2] ?? c;
    d += ` C ${(b.x + (c.x - a.x) / 6).toFixed(2)} ${(b.y + (c.y - a.y) / 6).toFixed(2)} ${(c.x - (e.x - b.x) / 6).toFixed(2)} ${(c.y - (e.y - b.y) / 6).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  const at = pts.slice(1, -1);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="s3-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.75, ease: EASE }}
          className="fixed inset-0 z-[80] overflow-y-auto bg-(--linen)"
          data-lenis-prevent
        >
          <div className="flex h-[72px] items-center justify-between px-4 md:h-[84px] md:px-8">
            <span className="s3-serif text-[21px] md:text-[25px]">Santalum</span>
            <button
              ref={close}
              type="button"
              onClick={ui.closeMenu}
              className="flex h-11 items-center gap-2 rounded-full px-4 text-[15px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10"
            >
              Close
              <span aria-hidden className="relative block h-3 w-3">
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 rotate-45 bg-(--ink)" />
                <span className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 -rotate-45 bg-(--ink)" />
              </span>
            </button>
          </div>
          <div className="relative mx-auto w-full max-w-[1500px]">
            <div ref={panel} className="relative h-[680px] md:h-[calc(100svh-84px)] md:min-h-[720px]">
              {/* the thread draws down through each bead, in the panel's real pixels so it never misses one */}
              {box.w > 0 && (
                <svg className="pointer-events-none absolute inset-0" width={box.w} height={box.h} viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden>
                  <motion.path
                    d={d}
                    fill="none"
                    stroke="var(--thread)"
                    strokeWidth="1.25"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
                  />
                </svg>
              )}
              <ul>
                {items.map((it, i) => (
                  <motion.li
                    key={it.key}
                    className="s3-menu-item"
                    style={{ left: `${at[i].x}%`, top: `${at[i].y}%` }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.25 + i * 0.04 }}
                  >
                    <span className="s3-bead" aria-hidden />
                    {it.bag ? (
                      <button type="button" onClick={ui.openBag}>
                        {it.label}
                      </button>
                    ) : it.href ? (
                      <Link href={it.href} onClick={ui.closeMenu}>
                        {it.label}
                      </Link>
                    ) : (
                      <Link href={`${HOME}#${it.hash}`} onClick={go(it.hash!)}>
                        {it.label}
                      </Link>
                    )}
                  </motion.li>
                ))}
              </ul>
            </div>
            {/* the shop, strand by strand */}
            <div className="px-6 pb-28 md:absolute md:right-10 md:top-1/2 md:w-[min(420px,36vw)] md:-translate-y-1/2 md:p-0">
              <W red={<MenuShop wood="red" />} white={<MenuShop wood="white" />} />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuShop({ wood }: { wood: Wood }) {
  const all = productsFor(wood);
  return (
    <>
      <p className="s3-serif text-[22px]">The {wood} sandalwood shop</p>
      <ul className="mt-4 border-l border-(--thread) pl-5">
        {CATEGORIES[wood].map((c) => (
          <li key={c.id} className="relative">
            <span className="s3-knot absolute -left-[25px] top-1/2 -translate-y-1/2" aria-hidden />
            <Link
              href={`${SHOP}?c=${c.id}`}
              onClick={ui.closeMenu}
              className="flex w-full items-baseline justify-between gap-4 py-[7px] text-left text-[16px] transition-colors hover:text-(--m-accent)"
            >
              <span>{c.label}</span>
              <span className="text-[14px] text-(--muted)">{all.filter((p) => p.category === c.id).length}</span>
            </Link>
          </li>
        ))}
        <li className="relative">
          <span className="s3-knot absolute -left-[25px] top-1/2 -translate-y-1/2" aria-hidden />
          <Link href={SHOP} onClick={ui.closeMenu} className="flex w-full items-baseline justify-between gap-4 py-[7px] text-[16px] transition-colors hover:text-(--m-accent)">
            <span>Everything</span>
            <span className="text-[14px] text-(--muted)">{all.length}</span>
          </Link>
        </li>
      </ul>
    </>
  );
}
