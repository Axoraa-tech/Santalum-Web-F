"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useRef, type ReactNode, type RefObject } from "react";
import { WT } from "@/components/maison/W";
import { useUser } from "@/lib/shop/account";
import { bag, bagSummary, DELIVERY, useBag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { c } from "./cls";
import { Pic, platesOf } from "./plates";
import {
  accession,
  closeLedger,
  closePlan,
  goToRoom,
  isNumbered,
  openLedger,
  openPlan,
  ROOMS,
  useActiveRoom,
  useLedgerOpen,
  usePlanOpen,
} from "./store";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Fixed chrome of the corridor: left strip with the room list, the nav, lighting and acquisitions, two sheets. */
export function Chrome() {
  return (
    <>
      <Strip />
      <Bar />
      <Plan />
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

/** Where the visitor is, outside the corridor. */
function placeOf(pathname: string): { red: string; white: string } | null {
  if (pathname.startsWith("/d/04/shop")) return { red: "The red shop", white: "The white shop" };
  if (pathname.startsWith("/d/04/account")) return { red: "Membership desk", white: "Membership desk" };
  if (pathname.startsWith("/d/04/track")) return { red: "Shipping register", white: "Shipping register" };
  if (pathname.startsWith("/d/04/checkout")) return { red: "The register", white: "The register" };
  return null;
}

function Strip() {
  const active = useActiveRoom();
  const pathname = usePathname();
  const walk = useWalk();
  const wood = useWood();
  const onProduct = pathname.startsWith("/d/04/p/");
  const current = active >= 0 ? active : onProduct ? 3 : -1;
  const place = placeOf(pathname);

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
          const numbered = isNumbered(r);
          return (
            <li key={r.id}>
              <button
                type="button"
                className={c.roomBtn}
                data-exit={numbered ? undefined : ""}
                aria-current={i === current}
                aria-label={numbered ? `Room ${r.n}, ${r[wood]}` : r[wood]}
                onClick={() => walk(r.id)}
              >
                {r.n}
                <span className={c.flyout} aria-hidden="true">
                  {numbered && <b>Room {r.n}</b>}
                  <WT red={r.red} white={r.white} />
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className={c.here} aria-hidden="true">
        {current >= 0 ? <WT red={ROOMS[current].red} white={ROOMS[current].white} /> : place ? <WT {...place} /> : null}
      </p>
      <p className={c.wordmark}>
        Santalum <i>Maison</i>
      </p>
    </nav>
  );
}

/** The lighting switch. On a product page the piece belongs to one wood, so switching walks to its counterpart. */
function useLight() {
  const pathname = usePathname();
  const router = useRouter();
  return (w: Wood) => {
    const m = pathname.match(/^\/d\/04\/p\/([^/?#]+)/);
    const p = m ? getProduct(decodeURIComponent(m[1])) : undefined;
    if (p && p.wood !== w) {
      switchWood(w);
      router.push(p.counterpart ? `/d/04/p/${p.counterpart}` : "/d/04/shop");
      return;
    }
    switchWood(w);
  };
}

function Lighting() {
  const wood = useWood();
  const light = useLight();
  return (
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
            if (wood !== w) light(w);
          }}
        >
          <span className={`${c.swatch} ${w === "red" ? "ring-red" : "ring-white"}`} aria-hidden="true" />
          <span className={c.lightName}>{w === "red" ? "Red room" : "White room"}</span>
        </button>
      ))}
    </div>
  );
}

function useSession() {
  const hydrated = useHydrated();
  const user = useUser();
  const lines = useBag();
  const count = hydrated ? bagSummary(lines).count : 0;
  const first = hydrated && user ? user.name.split(" ")[0] : null;
  return { count, first };
}

function Bar() {
  const pathname = usePathname();
  const { count, first } = useSession();
  const here = (p: string) => (pathname.startsWith(p) ? "page" : undefined);

  return (
    <div className={c.bar}>
      <Link href="/d/04" className={c.barMark} aria-label="Santalum Maison, home">
        <span className={c.barMono} aria-hidden="true">
          S
        </span>
        <span className={c.barWord}>
          Santalum <i>Maison</i>
        </span>
      </Link>
      <nav className={c.navLinks} aria-label="Shop and account">
        <Link href="/d/04/shop" className={c.navLink} aria-current={here("/d/04/shop")}>
          Shop
        </Link>
        <Link href="/d/04/track" className={c.navLink} aria-current={here("/d/04/track")}>
          Track order
        </Link>
        <Link href="/d/04/account" className={c.navLink} aria-current={here("/d/04/account")}>
          {first ? (
            <>
              <span className={c.member} aria-hidden="true" />
              {first}
            </>
          ) : (
            "Sign in"
          )}
        </Link>
      </nav>
      <Lighting />
      <button type="button" className={c.planBtn} onClick={openPlan} aria-haspopup="dialog">
        Plan
      </button>
      <button type="button" className={c.acq} onClick={openLedger} aria-haspopup="dialog" aria-label={`Acquisitions, ${count} ${count === 1 ? "piece" : "pieces"}`}>
        <span className={c.acqWord}>Acquisitions</span>
        <span className={c.acqShort} aria-hidden="true">
          Bag
        </span>
        <span key={count} className={`${c.count} ${count ? c.bump : ""}`}>
          ({count})
        </span>
      </button>
    </div>
  );
}

/* ---------------- sheets ---------------- */
function useSheet(open: boolean, close: () => void, headRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    if (!open) return;
    const back = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => headRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
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
  }, [open, close, headRef]);
}

function Sheet({ open, onClose, titleId, children }: { open: boolean; onClose: () => void; titleId: string; children: ReactNode }) {
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
            onClick={onClose}
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
            <div className={c.sheetIn}>{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Phones: the floor plan. The rooms of the walk, then the shop, tracking and the membership desk. */
function Plan() {
  const open = usePlanOpen();
  const pathname = usePathname();
  const walk = useWalk();
  const headRef = useRef<HTMLHeadingElement>(null);
  const titleId = useId();
  const { first } = useSession();
  useSheet(open, closePlan, headRef);
  useEffect(() => {
    closePlan();
  }, [pathname]);

  return (
    <Sheet open={open} onClose={closePlan} titleId={titleId}>
      <div className={c.sheetHead}>
        <div>
          <h2 id={titleId} ref={headRef} tabIndex={-1} className={c.sheetTitle}>
            Floor plan
          </h2>
          <p className={c.sheetSub}>
            <WT red="Nine rooms lit for red sandalwood, and the way out to the shop." white="Nine rooms lit for white sandalwood, and the way out to the shop." />
          </p>
        </div>
        <button type="button" className={c.textBtn} onClick={closePlan}>
          Close
        </button>
      </div>
      <div className={c.planGrid}>
        <ul className={c.planMain}>
          <li>
            <Link href="/d/04/shop" onClick={closePlan}>
              <b>Shop</b>
              <WT red={`All ${productsFor("red").length} red sandalwood pieces`} white={`All ${productsFor("white").length} white sandalwood pieces`} />
            </Link>
          </li>
          <li>
            <Link href="/d/04/track" onClick={closePlan}>
              <b>Track order</b>
              <span>The shipping register</span>
            </Link>
          </li>
          <li>
            <Link href="/d/04/account" onClick={closePlan}>
              <b>{first ? `${first}, your account` : "Sign in"}</b>
              <span>The membership desk</span>
            </Link>
          </li>
          <li>
            <button type="button" onClick={openLedger}>
              <b>Acquisitions</b>
              <span>Your bag, and the register</span>
            </button>
          </li>
        </ul>
        <ol className={c.planRooms}>
          {ROOMS.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => {
                  closePlan();
                  walk(r.id);
                }}
              >
                <span>{r.n}</span>
                <WT red={r.red} white={r.white} />
              </button>
            </li>
          ))}
        </ol>
      </div>
    </Sheet>
  );
}

function Ledger() {
  const open = useLedgerOpen();
  const lines = useBag();
  const { items, count, subtotal } = bagSummary(lines);
  const headRef = useRef<HTMLHeadingElement>(null);
  const pathname = usePathname();
  const walk = useWalk();
  const titleId = useId();
  useSheet(open, closeLedger, headRef);
  useEffect(() => {
    closeLedger();
  }, [pathname]);

  return (
    <Sheet open={open} onClose={closeLedger} titleId={titleId}>
      <div className={c.sheetHead}>
        <div>
          <h2 id={titleId} ref={headRef} tabIndex={-1} className={c.sheetTitle}>
            Acquisitions
          </h2>
          <p className={c.sheetSub}>
            {count ? `${count} ${count === 1 ? "piece" : "pieces"} entered in the ledger of this visit` : "The ledger of this visit"}
          </p>
        </div>
        <button type="button" className={c.textBtn} onClick={closeLedger}>
          Close
        </button>
      </div>

      {items.length === 0 ? (
        <div className={c.empty}>
          <p>Nothing acquired yet.</p>
          <p className={c.sheetSub}>
            <WT
              red={`The red shop holds all ${productsFor("red").length} pieces in red sandalwood. The gallery in room 4 hangs eight of them.`}
              white={`The white shop holds all ${productsFor("white").length} pieces in white sandalwood. The gallery in room 4 hangs eight of them.`}
            />
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link href="/d/04/shop" className={c.btnInk} onClick={closeLedger}>
              Visit the shop
            </Link>
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
        </div>
      ) : (
        <>
          <table className={c.ledgerTable}>
            <thead>
              <tr>
                <th scope="col">No.</th>
                <th scope="col">Piece</th>
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
              {items.map((l, i) => {
                const p = l.product;
                const shot = platesOf(p)[0];
                return (
                  <tr key={l.key}>
                    <td className={c.entryNo}>{i + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className={c.thumb}>
                          <Pic p={shot.photo} tone={shot.tone} crop={shot.crop} sizes="48px" />
                        </span>
                        <span className="grid min-w-0">
                          <Link href={`/d/04/p/${p.slug}`} className={c.objName} onClick={closeLedger}>
                            {p.name}
                          </Link>
                          {l.optionValue && (
                            <span className={c.objMeta}>
                              {p.options?.name}: {l.optionValue.label}
                            </span>
                          )}
                          <span className={c.objMeta}>
                            <span className="sm:hidden">{CONTENT[p.wood].name}. </span>
                            Accession {accession(p)}
                          </span>
                          {l.note && <span className={c.objMeta}>Note: {l.note}</span>}
                          <button type="button" className={c.removeBtn} onClick={() => bag.remove(l.key)}>
                            Remove
                          </button>
                        </span>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell">{CONTENT[p.wood].name}</td>
                    <td>
                      <span className={c.qty}>
                        <button type="button" aria-label={`One fewer ${p.name}`} onClick={() => bag.setQty(l.key, l.qty - 1)}>
                          −
                        </button>
                        <span aria-label={`Quantity ${l.qty}`}>{l.qty}</span>
                        <button
                          type="button"
                          aria-label={`One more ${p.name}`}
                          disabled={l.qty >= 9}
                          onClick={() => bag.setQty(l.key, l.qty + 1)}
                        >
                          +
                        </button>
                      </span>
                    </td>
                    <td className={c.num}>{formatINR(l.total)}</td>
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
              <dd>Free</dd>
            </div>
            <div className={c.grand}>
              <dt>Total</dt>
              <dd>{formatINR(subtotal)}</dd>
            </div>
          </dl>
          <p className={c.sheetNote}>
            Standard delivery is free, 3 to 5 working days. Express, 1 to 2 days, is {formatINR(DELIVERY.express.price)} at the
            register.
          </p>
          <div className={c.sheetActions}>
            <button type="button" className={c.btnLine} onClick={closeLedger}>
              Keep walking
            </button>
            {!pathname.startsWith("/d/04/shop") && (
              <Link href="/d/04/shop" className={c.btnLine} onClick={closeLedger}>
                Visit the shop
              </Link>
            )}
            <Link href="/d/04/checkout" className={c.btnInk} onClick={closeLedger}>
              Go to the register
            </Link>
          </div>
        </>
      )}
    </Sheet>
  );
}
