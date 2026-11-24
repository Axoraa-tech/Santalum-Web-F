"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, type MouseEvent } from "react";
import { FAMILIES, formatINR } from "@/lib/catalog";
import { bagTotals, useBag } from "@/lib/cart";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { useMedia } from "./bits";
import { glideTo, ui, useUI } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;
const HOME = "/d/03";

/** Go to a section of the home page: glide when already there, navigate otherwise. */
export function useSectionLink() {
  const pathname = usePathname();
  const router = useRouter();
  return (hash: string) => (e: MouseEvent) => {
    if (pathname !== HOME) return; // let the Link navigate to /d/03#hash
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

export function Nav() {
  const wood = useWood();
  const s = useUI();
  return (
    <>
      <header className="s3-head fixed inset-x-0 top-0 z-[60] flex h-[72px] items-center justify-between gap-3 px-4 md:h-[84px] md:px-8">
        <Link href={HOME} className="s3-serif flex items-baseline gap-2 text-[21px] leading-none tracking-[-0.01em] transition-opacity hover:opacity-70 md:text-[25px]">
          Santalum
          <span className="hidden text-[0.72em] text-(--muted) sm:inline">Maison</span>
        </Link>
        <div className="flex items-center gap-1 md:gap-3">
          <WoodBeads wood={wood} />
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
function WoodBeads({ wood }: { wood: Wood }) {
  return (
    <div role="group" aria-label="Choose the wood" className="flex items-center gap-2 pr-1">
      <div className="s3-wt">
        <span className="s3-wt-knot" aria-hidden />
        <button
          type="button"
          className="s3-wt-b"
          aria-pressed={wood === "red"}
          aria-label="Red sandalwood"
          onClick={() => wood !== "red" && switchWood("red")}
          style={{ left: 0, transform: wood === "red" ? "translateX(10px)" : "translateX(-6px)" }}
        >
          <span className="s3-bead" data-w="red" />
        </button>
        <button
          type="button"
          className="s3-wt-b"
          aria-pressed={wood === "white"}
          aria-label="White sandalwood"
          onClick={() => wood !== "white" && switchWood("white")}
          style={{ right: 0, transform: wood === "white" ? "translateX(-10px)" : "translateX(6px)" }}
        >
          <span className="s3-bead" data-w="white" />
        </button>
      </div>
      <span className="hidden w-[3.2rem] text-[14px] text-(--muted) md:inline" aria-live="polite">
        {wood === "red" ? "Red" : "White"}
      </span>
    </div>
  );
}

/** The bag: a hanging loop of thread with one bead for each piece in it. */
function BagButton({ open, pulse }: { open: boolean; pulse: number }) {
  const lines = useBag();
  const { count } = bagTotals(lines);
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
      {count > 9 && <span className="text-[13px] text-(--muted)">{count}</span>}
    </button>
  );
}

const LINKS: { hash: string; label: string }[] = [
  { hash: "strand", label: "The strand" },
  { hash: "woods", label: "Two woods" },
  { hash: "making", label: "Making" },
  { hash: "provenance", label: "Provenance" },
  { hash: "vault", label: "The 2011 Vault" },
  { hash: "gifting", label: "Gifting" },
  { hash: "circle", label: "Santalum Circle" },
];

/** Full-screen menu: the links are strung along one long thread. */
function Menu({ open }: { open: boolean }) {
  const wood = useWood();
  const wide = useMedia("(min-width: 900px)");
  const go = useSectionLink();
  const close = useRef<HTMLButtonElement>(null);
  const items = [...LINKS.map((l) => ({ ...l, kind: "section" as const })), { hash: "bag", label: "Your bag", kind: "bag" as const }];

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
    if (wide) return { x: 9 + Math.sin(t * Math.PI * 1.15) * 9, y: 10 + t * 78 };
    return { x: 9 + Math.sin(t * Math.PI) * 5, y: 10 + t * 80 };
  };
  const pts = [{ x: pos(0, items.length).x - 2, y: -2 }, ...items.map((_, i) => pos(i, items.length)), { x: pos(items.length - 1, items.length).x + 3, y: 102 }];
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i - 1] ?? pts[i];
    const b = pts[i];
    const c = pts[i + 1];
    const e = pts[i + 2] ?? c;
    d += ` C ${(b.x + (c.x - a.x) / 6).toFixed(2)} ${(b.y + (c.y - a.y) / 6).toFixed(2)} ${(c.x - (e.x - b.x) / 6).toFixed(2)} ${(c.y - (e.y - b.y) / 6).toFixed(2)} ${c.x.toFixed(2)} ${c.y.toFixed(2)}`;
  }
  const at = pts.slice(1, -1);
  const available = FAMILIES.filter((f) => f.variants[wood]);

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
          <div className="relative h-[540px] md:h-[calc(100svh-84px)] md:min-h-[620px]">
            <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
              <motion.path
                d={d}
                fill="none"
                stroke="var(--thread)"
                strokeWidth="1.25"
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.15 }}
              />
            </svg>
            <ul>
              {items.map((it, i) => (
                <motion.li
                  key={it.hash}
                  className="s3-menu-item"
                  style={{ left: `${at[i].x}%`, top: `${at[i].y}%` }}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, ease: EASE, delay: 0.25 + i * 0.05 }}
                >
                  <span className="s3-bead" aria-hidden />
                  {it.kind === "bag" ? (
                    <button type="button" onClick={ui.openBag}>
                      {it.label}
                    </button>
                  ) : (
                    <Link href={`${HOME}#${it.hash}`} onClick={go(it.hash)}>
                      {it.label}
                    </Link>
                  )}
                </motion.li>
              ))}
            </ul>
          </div>
            {/* every piece, strung small */}
            <div className="px-6 pb-28 md:absolute md:right-10 md:top-1/2 md:w-[min(420px,36vw)] md:-translate-y-1/2 md:p-0">
              <p className="s3-serif text-[22px]">Every piece in {wood} sandalwood</p>
              <ul className="mt-4 border-l border-(--thread) pl-5">
                {available.map((f) => (
                  <li key={f.slug} className="relative">
                    <span className="s3-knot absolute -left-[25px] top-1/2 -translate-y-1/2" aria-hidden />
                    <button
                      type="button"
                      onClick={() => ui.openProduct(f.slug)}
                      className="flex w-full items-baseline justify-between gap-4 py-[5px] text-left text-[15px] transition-colors hover:text-(--m-accent)"
                    >
                      <span>{f.name}</span>
                      <span className="text-[13px] text-(--muted)">{formatINR(f.variants[wood]!.price)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
