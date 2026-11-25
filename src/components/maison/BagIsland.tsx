"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CONTENT } from "@/lib/shop/content";
import { bag, bagPanel, bagSummary, onFlight, useBag, useBagOpen, type BagItem, type Flight } from "@/lib/shop/bag";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { Photo } from "../Photo";
import { Pill } from "./Pill";
import { firstShot } from "./shop/shots";
import { WT } from "./W";

const SPRING = { type: "spring", stiffness: 320, damping: 32 } as const;

/**
 * The bag lives in a floating island at the bottom of the screen. It appears once something is
 * in it, catches the thumbnail that flies in from "Add to bag", and opens in place into the full bag.
 * A bag can hold red and white pieces together.
 */
export function BagIsland() {
  const hydrated = useHydrated();
  const lines = useBag();
  const open = useBagOpen();
  const pathname = usePathname();
  const { items, count, subtotal } = bagSummary(lines);
  const [flights, setFlights] = useState<(Flight & { tx: number; ty: number })[]>([]);
  const islandRef = useRef<HTMLDivElement>(null);
  const [scope, animate] = useAnimate();

  useEffect(
    () =>
      onFlight((f) => {
        // where the island is (or will appear): measured when the flight starts
        const r = islandRef.current?.getBoundingClientRect();
        const tx = r ? r.left + 34 : window.innerWidth / 2;
        const ty = r ? r.top + r.height / 2 : window.innerHeight - 48;
        setFlights((fs) => [...fs, { ...f, tx, ty }]);
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && bagPanel.close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onCheckout = pathname.startsWith("/maison/checkout");
  const show = hydrated && (count > 0 || open) && !onCheckout;

  return (
    <>
      <AnimatePresence>
        {open && !onCheckout && (
          <motion.div
            key="veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => bagPanel.close()}
            className="fixed inset-0 z-40 bg-(--mz-ink)/15 backdrop-blur-[3px]"
          />
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
        <AnimatePresence>
          {show && (
            <motion.div
              key="island"
              ref={islandRef}
              layout
              initial={{ y: 140, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 140, opacity: 0 }}
              transition={SPRING}
              style={{ borderRadius: open ? 32 : 999 }}
              className={`pointer-events-auto overflow-hidden border border-(--mz-line) bg-(--mz-bg)/90 text-(--mz-ink) shadow-[0_24px_70px_-20px_rgb(23_19_15/0.45)] backdrop-blur-2xl ${
                open ? "w-full max-w-[480px]" : "w-auto"
              }`}
              role={open ? "dialog" : undefined}
              aria-label={open ? "Your bag" : undefined}
            >
              <div ref={scope}>
                <AnimatePresence mode="popLayout" initial={false}>
                  {open ? (
                    <motion.div
                      key="open"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.12 } }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    >
                      <OpenBag items={items} count={count} subtotal={subtotal} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.1 } }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      className="flex items-center gap-4 py-2 pl-2 pr-2"
                    >
                      <button
                        type="button"
                        onClick={() => bagPanel.open()}
                        aria-label={`Open your bag, ${count} ${count === 1 ? "piece" : "pieces"}, ${formatINR(subtotal)}`}
                        className="flex items-center gap-3 rounded-full pr-1 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
                      >
                        <Thumbs items={items} />
                        <span className="leading-tight">
                          <span className="block text-[14px] font-medium">
                            {count} {count === 1 ? "piece" : "pieces"}
                          </span>
                          <span className="block text-[13px] tabular-nums text-(--mz-ink-2)">{formatINR(subtotal)}</span>
                        </span>
                      </button>
                      <Link
                        href="/maison/checkout"
                        className="grid h-11 place-items-center rounded-full bg-(--mz-ink) px-5 text-[14px] font-medium text-(--mz-bg) transition-colors hover:bg-(--mz-accent) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
                      >
                        Checkout
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* thumbnails flying into the island */}
      {flights.map((f) => {
        const to = { x: f.tx, y: f.ty };
        return (
          <motion.div
            key={f.id}
            className="pointer-events-none fixed left-0 top-0 z-[60] overflow-hidden rounded-full shadow-xl"
            style={{ width: f.size, height: f.size }}
            initial={{ x: f.x, y: f.y, scale: 1, opacity: 1 }}
            animate={{
              x: [f.x, (f.x + to.x) / 2, to.x - f.size / 2],
              y: [f.y, Math.min(f.y, to.y) - 140, to.y - f.size / 2],
              scale: [1, 0.9, 0.45],
              opacity: [1, 1, 0.6],
            }}
            transition={{ duration: 0.85, ease: [0.45, 0, 0.2, 1] }}
            onAnimationComplete={() => {
              setFlights((fs) => fs.filter((x) => x.id !== f.id));
              if (scope.current) animate(scope.current, { scale: [1, 1.08, 1] }, { duration: 0.45 });
            }}
          >
            <Photo p={{ id: f.photo, alt: "" }} tone={f.tone} sizes="80px" />
          </motion.div>
        );
      })}
    </>
  );
}

function Thumbs({ items }: { items: BagItem[] }) {
  return (
    <span className="flex -space-x-3">
      {items.slice(0, 3).map((i) => {
        const s = firstShot(i.product);
        return (
          <span key={i.key} className="relative size-10 overflow-hidden rounded-full ring-2 ring-(--mz-bg)">
            <Photo p={s.photo} tone={s.tone} sizes="48px" />
          </span>
        );
      })}
    </span>
  );
}

function OpenBag({ items, count, subtotal }: { items: BagItem[]; count: number; subtotal: number }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[28px] leading-none tracking-[-0.02em]">
          Your bag <span className="text-[16px] tabular-nums text-(--mz-ink-3)">{count}</span>
        </p>
        <button
          type="button"
          onClick={() => bagPanel.close()}
          aria-label="Close bag"
          className="grid size-10 place-items-center rounded-full border border-(--mz-line) text-[20px] leading-none transition-colors hover:border-(--mz-ink)/25 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
        >
          ×
        </button>
      </div>

      {items.length === 0 ? (
        <div className="py-8">
          <p className="text-[16px] leading-relaxed text-(--mz-ink-2)">
            <WT
              red="Nothing here yet. Most people begin with something small: a key fob, a wrist mala, a jar of raktachandan."
              white="Nothing here yet. Most people begin with something small: a tube of incense, a pulse roller, a bar of soap."
            />
          </p>
          <Pill href="/maison/shop" onClick={() => bagPanel.close()} className="mt-6">
            <WT red="Shop red sandalwood" white="Shop white sandalwood" />
          </Pill>
        </div>
      ) : (
        <>
          <ul data-lenis-prevent className="-mx-2 mt-5 max-h-[46svh] space-y-1 overflow-y-auto px-2">
            {items.map((i) => (
              <Line key={i.key} item={i} />
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-(--mz-line) pt-4">
            <span className="text-[15px] text-(--mz-ink-2)">Subtotal</span>
            <span className="font-display text-[26px] tabular-nums tracking-[-0.02em]">{formatINR(subtotal)}</span>
          </div>
          <p className="mt-1 text-[13px] text-(--mz-ink-3)">Free delivery across India, 3–5 working days. Express ₹350.</p>
          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
            <Pill href="/maison/checkout" onClick={() => bagPanel.close()} size="lg" className="w-full">
              Checkout
            </Pill>
            <button
              type="button"
              onClick={() => bagPanel.close()}
              className="h-14 rounded-full border border-(--mz-line) px-5 text-[15px] text-(--mz-ink-2) transition-colors hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
            >
              Keep looking
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Line({ item }: { item: BagItem }) {
  const p = item.product;
  const s = firstShot(p);
  const meta = [item.optionValue?.label, CONTENT[p.wood].name].filter(Boolean).join(", ");
  return (
    <motion.li layout className="flex items-center gap-4 rounded-3xl p-2 transition-colors hover:bg-(--mz-surface)">
      <Link
        href={`/maison/shop/${p.slug}`}
        onClick={() => bagPanel.close()}
        aria-label={p.name}
        className="relative size-16 shrink-0 overflow-hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
      >
        <Photo p={s.photo} tone={s.tone} sizes="72px" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{p.name}</p>
        <p className="truncate text-[13px] text-(--mz-ink-3)">{meta}</p>
        {item.note && <p className="line-clamp-2 text-[12px] leading-snug text-(--mz-ink-2)">{item.note}</p>}
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center rounded-full border border-(--mz-line)">
            <button
              type="button"
              aria-label={`One fewer ${p.name}`}
              onClick={() => bag.setQty(item.key, item.qty - 1)}
              className="grid size-8 place-items-center rounded-full text-(--mz-ink-2) hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
            >
              −
            </button>
            <span className="w-5 text-center text-[13px] tabular-nums" aria-live="polite">
              {item.qty}
            </span>
            <button
              type="button"
              aria-label={`One more ${p.name}`}
              onClick={() => bag.setQty(item.key, item.qty + 1)}
              className="grid size-8 place-items-center rounded-full text-(--mz-ink-2) hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
            >
              +
            </button>
          </span>
          <button type="button" onClick={() => bag.remove(item.key)} className="rounded-full text-[13px] text-(--mz-ink-3) hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)">
            Remove
          </button>
        </div>
      </div>
      <span className="self-start pt-1 text-[14px] tabular-nums">{formatINR(item.total)}</span>
    </motion.li>
  );
}
