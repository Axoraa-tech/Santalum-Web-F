"use client";

import { AnimatePresence, motion, useAnimate } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, island, onFlight, useBag, useIslandOpen, type Flight, type Line } from "@/lib/cart";
import { Photo } from "../Photo";
import { Pill } from "./Pill";

const SPRING = { type: "spring", stiffness: 320, damping: 32 } as const;

/**
 * The bag lives in a floating island at the bottom of the screen. It appears once something is
 * in it, catches the thumbnail that flies in from "Add to bag", and opens in place into the full bag.
 */
export function BagIsland() {
  const lines = useBag();
  const open = useIslandOpen();
  const pathname = usePathname();
  const { count, subtotal } = bagTotals(lines);
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
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && island.close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const onCheckout = pathname.startsWith("/maison/checkout");
  const show = (count > 0 || open) && !onCheckout;

  return (
    <>
      <AnimatePresence>
        {open && !onCheckout && (
          <motion.div
            key="veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => island.close()}
            className="fixed inset-0 z-40 bg-ink/15 backdrop-blur-[3px]"
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
              className={`pointer-events-auto overflow-hidden border border-hair bg-paper/90 text-ink shadow-[0_24px_70px_-20px_rgb(23_19_15/0.45)] backdrop-blur-2xl ${
                open ? "w-full max-w-[460px]" : "w-auto"
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
                      <OpenBag lines={lines} count={count} subtotal={subtotal} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1, transition: { delay: 0.1 } }}
                      exit={{ opacity: 0, transition: { duration: 0.1 } }}
                      className="flex items-center gap-4 py-2 pl-2 pr-2"
                    >
                      <button type="button" onClick={() => island.open()} className="flex items-center gap-3 pr-1 text-left">
                        <Thumbs lines={lines} />
                        <span className="leading-tight">
                          <span className="block text-[14px] font-medium">
                            {count} {count === 1 ? "piece" : "pieces"}
                          </span>
                          <span className="block text-[13px] tabular-nums text-ink-2">{formatINR(subtotal)}</span>
                        </span>
                      </button>
                      <Link
                        href="/maison/checkout"
                        className="grid h-11 place-items-center rounded-full bg-ink px-5 text-[14px] font-medium text-paper transition-colors hover:bg-accent"
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

function Thumbs({ lines }: { lines: Line[] }) {
  return (
    <span className="flex -space-x-3">
      {lines.slice(0, 3).map((l) => {
        const s = getVariant(l.slug, l.wood)!.shots[0];
        return (
          <span key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="relative size-10 overflow-hidden rounded-full ring-2 ring-paper">
            <Photo p={s.photo} tone={s.tone} sizes="48px" />
          </span>
        );
      })}
    </span>
  );
}

function OpenBag({ lines, count, subtotal }: { lines: Line[]; count: number; subtotal: number }) {
  return (
    <div className="p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <p className="font-display text-[28px] leading-none tracking-[-0.02em]">
          Your bag <span className="text-[16px] text-ink-3 tabular-nums">{count}</span>
        </p>
        <button
          type="button"
          onClick={() => island.close()}
          aria-label="Close bag"
          className="grid size-10 place-items-center rounded-full border border-hair text-[20px] leading-none hover:border-ink/25"
        >
          ×
        </button>
      </div>

      {lines.length === 0 ? (
        <div className="py-10">
          <p className="text-[16px] leading-relaxed text-ink-2">
            Nothing here yet. Most people begin with something small: a key fob, a bracelet, a jar of powder.
          </p>
          <Pill href="/maison/shop" onClick={() => island.close()} className="mt-6">
            See the collection
          </Pill>
        </div>
      ) : (
        <>
          <ul data-lenis-prevent className="-mx-2 mt-5 max-h-[46svh] space-y-1 overflow-y-auto px-2">
            {lines.map((l) => (
              <BagLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
            ))}
          </ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-hair pt-4">
            <span className="text-[15px] text-ink-2">Subtotal</span>
            <span className="font-display text-[26px] tabular-nums tracking-[-0.02em]">{formatINR(subtotal)}</span>
          </div>
          <p className="mt-1 text-[13px] text-ink-3">Delivery across India is complimentary</p>
          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
            <Pill href="/maison/checkout" onClick={() => island.close()} size="lg" className="w-full">
              Checkout
            </Pill>
            <button
              type="button"
              onClick={() => island.close()}
              className="h-14 rounded-full border border-hair px-5 text-[15px] text-ink-2 transition-colors hover:text-ink"
            >
              Keep looking
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function BagLine({ line }: { line: Line }) {
  const f = getFamily(line.slug)!;
  const v = getVariant(line.slug, line.wood)!;
  const s = v.shots[0];
  return (
    <motion.li layout className="flex items-center gap-4 rounded-3xl p-2 transition-colors hover:bg-paper-2">
      <Link href={`/maison/shop/${line.slug}`} onClick={() => island.close()} className="relative size-16 shrink-0 overflow-hidden rounded-full">
        <Photo p={s.photo} tone={s.tone} sizes="72px" />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-medium">{f.name}</p>
        <p className="truncate text-[13px] text-ink-3">{line.custom ?? WOOD_NAMES[line.wood].common}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="flex items-center rounded-full border border-hair">
            <button type="button" aria-label="One fewer" onClick={() => bag.setQty(line, line.qty - 1)} className="grid size-8 place-items-center text-ink-2 hover:text-ink">
              −
            </button>
            <span className="w-5 text-center text-[13px] tabular-nums">{line.qty}</span>
            <button type="button" aria-label="One more" onClick={() => bag.setQty(line, line.qty + 1)} className="grid size-8 place-items-center text-ink-2 hover:text-ink">
              +
            </button>
          </span>
          <button type="button" onClick={() => bag.setQty(line, 0)} className="text-[13px] text-ink-3 hover:text-ink">
            Remove
          </button>
        </div>
      </div>
      <span className="self-start pt-1 text-[14px] tabular-nums">{formatINR(v.price * line.qty)}</span>
    </motion.li>
  );
}
