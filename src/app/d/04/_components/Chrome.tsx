"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag } from "@/lib/cart";
import { switchWood, useWood } from "@/lib/wood";
import { c } from "./cls";
import { accession, closeLedger, goToRoom, openLedger, ROOMS, useActiveRoom, useLedgerOpen } from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fixed chrome of the corridor: left strip with the room list, lighting + acquisitions, the ledger sheet. */
export function Chrome() {
  return (
    <>
      <Strip />
      <Bar />
      <Ledger />
    </>
  );
}

function useWalk() {
  const router = useRouter();
  return (id: string) => {
    if (!goToRoom(id)) router.push(`/d/04#${id}`);
  };
}

function Strip() {
  const active = useActiveRoom();
  const pathname = usePathname();
  const walk = useWalk();
  const onProduct = pathname.startsWith("/d/04/p/");
  const onRegister = pathname.startsWith("/d/04/checkout");
  const current = active >= 0 ? active : onProduct ? 3 : -1;

  return (
    <nav className={c.strip} aria-label="Rooms">
      <Link
        href="/d/04"
        className={c.mono}
        aria-label="Santalum Maison, back to the entrance"
        onClick={(e) => {
          if (goToRoom("entrance")) e.preventDefault();
        }}
      >
        S
      </Link>
      <ol className={c.rooms}>
        {ROOMS.map((r, i) => {
          const numbered = /^\d+$/.test(r.n);
          return (
            <li key={r.id}>
              <button
                type="button"
                className={c.roomBtn}
                data-exit={numbered ? undefined : ""}
                aria-current={i === current}
                aria-label={numbered ? `Room ${r.n}, ${r.name}` : r.name}
                onClick={() => walk(r.id)}
              >
                {r.n}
                <span className={c.flyout} aria-hidden="true">
                  {numbered && <b>Room {r.n}</b>}
                  {r.name}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className={c.here} aria-hidden="true">
        {current >= 0 ? ROOMS[current].name : onRegister ? "The register" : ""}
      </p>
      <p className={c.wordmark}>
        Santalum <i>Maison</i>
      </p>
    </nav>
  );
}

function Bar() {
  const lines = useBag();
  const { count } = bagTotals(lines);
  const wood = useWood();

  return (
    <div className={c.bar}>
      <Link href="/d/04" className={c.barMark}>
        Santalum <i>Maison</i>
      </Link>
      <div className={c.lighting} role="group" aria-label="Gallery lighting, choose the wood">
        {(["red", "white"] as const).map((w) => (
          <button
            key={w}
            type="button"
            className={c.light}
            data-tone={w}
            aria-pressed={wood === w}
            aria-label={w === "red" ? "Red room: red sandalwood" : "White room: white sandalwood"}
            onClick={() => {
              if (wood !== w) switchWood(w);
            }}
          >
            <span className={`${c.swatch} ${w === "red" ? "ring-red" : "ring-white"}`} aria-hidden="true" />
            <span className={c.lightName}>{w === "red" ? "Red room" : "White room"}</span>
          </button>
        ))}
      </div>
      <button type="button" className={c.acq} onClick={openLedger} aria-haspopup="dialog">
        Acquisitions
        <span key={count} className={`${c.count} ${count ? c.bump : ""}`}>
          ({count})
        </span>
      </button>
    </div>
  );
}

function Ledger() {
  const open = useLedgerOpen();
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const headRef = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname();
  const walk = useWalk();
  const titleId = useId();

  // close when the page changes underneath
  useEffect(() => {
    closeLedger();
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => headRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLedger();
    };
    window.addEventListener("keydown", onKey);
    const html = document.documentElement;
    const prev = html.style.overflow;
    html.style.overflow = "hidden";
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      html.style.overflow = prev;
      back?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="scrim"
            className={c.scrim}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeLedger}
          />
          <motion.div
            key="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className={c.sheet}
            initial={{ y: "-104%" }}
            animate={{ y: 0 }}
            exit={{ y: "-104%" }}
            transition={{ duration: 0.75, ease: EASE }}
            data-lenis-prevent=""
          >
            <div className={c.sheetIn}>
              <div className={c.sheetHead}>
                <div>
                  <h2 id={titleId} ref={headRef} tabIndex={-1} className={c.sheetTitle}>
                    Acquisitions
                  </h2>
                  <p className={c.sheetSub}>
                    {count
                      ? `${count} ${count === 1 ? "object" : "objects"} entered in the ledger of this visit`
                      : "The ledger of this visit"}
                  </p>
                </div>
                <button type="button" className={c.textBtn} onClick={closeLedger}>
                  Close
                </button>
              </div>

              {lines.length === 0 ? (
                <div className={c.empty}>
                  <p>Nothing acquired yet.</p>
                  <p className={c.sheetSub}>The collection hangs in room 4. Every wall label has a View link.</p>
                  <button
                    type="button"
                    className={c.btnLine}
                    onClick={() => {
                      closeLedger();
                      walk("collection");
                    }}
                  >
                    Walk to room 4
                  </button>
                </div>
              ) : (
                <>
                  <table className={c.ledgerTable}>
                    <thead>
                      <tr>
                        <th scope="col">No.</th>
                        <th scope="col">Object</th>
                        <th scope="col" className="hidden sm:table-cell">
                          Wood
                        </th>
                        <th scope="col">Quantity</th>
                        <th scope="col" className={c.num}>
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l, i) => {
                        const f = getFamily(l.slug);
                        const v = getVariant(l.slug, l.wood);
                        if (!f || !v) return null;
                        const shot = v.shots[0];
                        return (
                          <tr key={`${l.slug}-${l.wood}-${l.custom ?? ""}`}>
                            <td className={c.entryNo}>{i + 1}</td>
                            <td>
                              <div className="flex items-center gap-3">
                                <span className={c.thumb}>
                                  <Photo p={shot.photo} tone={shot.tone} sizes="48px" />
                                </span>
                                <span className="grid min-w-0">
                                  <Link href={`/d/04/p/${f.slug}`} className={c.objName} onClick={closeLedger}>
                                    {f.name}
                                  </Link>
                                  <span className={c.objMeta}>
                                    <span className="sm:hidden">{WOOD_NAMES[l.wood].common}. </span>
                                    Accession {accession(f.slug, l.wood)}
                                  </span>
                                  {l.custom && <span className={c.objMeta}>Made to order: {l.custom}</span>}
                                </span>
                              </div>
                            </td>
                            <td className="hidden sm:table-cell">{WOOD_NAMES[l.wood].common}</td>
                            <td>
                              <span className={c.qty}>
                                <button
                                  type="button"
                                  aria-label={`One fewer ${f.name}`}
                                  onClick={() => bag.setQty(l, l.qty - 1)}
                                >
                                  −
                                </button>
                                <span aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
                                <button
                                  type="button"
                                  aria-label={`One more ${f.name}`}
                                  onClick={() => bag.setQty(l, l.qty + 1)}
                                >
                                  +
                                </button>
                              </span>
                            </td>
                            <td className={c.num}>{formatINR(v.price * l.qty)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <dl className={c.totals}>
                    <div>
                      <dt>Subtotal</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                    <div>
                      <dt>Delivery across India</dt>
                      <dd>Complimentary</dd>
                    </div>
                    <div className={c.grand}>
                      <dt>Total</dt>
                      <dd>{formatINR(subtotal)}</dd>
                    </div>
                  </dl>
                  <div className={c.sheetActions}>
                    <button type="button" className={c.btnLine} onClick={closeLedger}>
                      Keep walking
                    </button>
                    <Link href="/d/04/checkout" className={c.btnInk} onClick={closeLedger}>
                      Go to the register
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
