"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { signOut, useUser, type Address } from "@/lib/shop/account";
import { bag, bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR, productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import { s } from "../_components/cls";
import { cx, photoFor, plural, shotsOf, WOOD_SHORT } from "../_components/data";
import { AddressTile, AuthTiles } from "../_components/forms";
import { PieceTile } from "../_components/PieceTile";
import { IconCheck, IconMinus, IconOpen } from "../_components/ui";

function Step({ n, title, done, children, className }: { n: number; title: string; done?: boolean; children: ReactNode; className?: string }) {
  return (
    <section className={cx(s.tile, "p-5 sm:p-7", className)} aria-label={title}>
      <div className="mb-5 flex items-center gap-3">
        <span className={cx(s.mono, "grid size-8 place-items-center rounded-full text-[12px]", done ? "bg-accent text-white" : "bg-[var(--b-ink)] text-white")}>
          {done ? <IconCheck size={15} /> : n}
        </span>
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

/** Checkout as a bento: four steps on the left, a summary that stays in view. Sign-in is required. */
export function CheckoutBento() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [addrId, setAddrId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [once, setOnce] = useState<Address | null>(null);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [codeErr, setCodeErr] = useState<string | null>(null);

  if (!hydrated) return <div className={cx(s.checkout, "min-h-[70svh]")} aria-busy="true" />;
  if (placed) return <Confirmation o={placed} />;
  const { items, count, subtotal, shipping, total: gross } = bagSummary(lines, delivery);
  if (count === 0) return <Empty />;

  const promo = coupon ? applyCoupon(coupon, subtotal) : null;
  const discount = promo?.ok ? promo.discount : 0;
  const total = gross - discount;
  const addresses = user?.addresses ?? [];
  const chosen: Address | undefined =
    (addrId === "once" ? (once ?? undefined) : undefined) ?? addresses.find((a) => a.id === addrId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const codBlocked = total >= 10000;
  const tryCode = (e: React.FormEvent) => {
    e.preventDefault();
    const r = applyCoupon(code, subtotal);
    if (r.ok) {
      setCoupon(r.code);
      setCodeErr(null);
    } else setCodeErr(r.error);
  };
  const pay = payment === "cod" && codBlocked ? "upi" : payment;
  const ready = !!user && !!chosen && !adding;

  const place = () => {
    if (!chosen) return;
    const { id: _id, isDefault: _d, ...address } = chosen;
    void _id;
    void _d;
    const r = placeOrder({ lines, address, delivery, payment: pay, giftNote: gift.trim() || undefined, coupon: promo?.ok ? promo.code : undefined });
    if (r.ok) {
      setPlaced(r.order);
      window.scrollTo({ top: 0 });
    } else setError(r.error);
  };

  return (
    <div className={s.checkout}>
      <div className={cx(s.tile, "flex min-h-[160px] flex-col justify-end p-6 sm:p-8 lg:col-span-12")}>
        <h1 className={cx(s.display, "text-[clamp(48px,10cqw,104px)]")}>Checkout</h1>
        <p className={cx(s.muted, "mt-3 text-[16px]")}>
          {count} {count === 1 ? "piece" : "pieces"}, {formatINR(subtotal)}. Free delivery across India.
        </p>
      </div>

      <div className="flex flex-col gap-3 lg:col-span-7">
        <Step n={1} title="Account" done={!!user}>
          {user ? (
            <p className="text-[16px]">
              Signed in as <strong className="font-medium">{user.name}</strong> <span className={s.muted}>·</span> Not you?{" "}
              <button type="button" onClick={signOut} className="underline decoration-[var(--b-line)] underline-offset-4 hover:decoration-[var(--b-ink)] focus-visible:outline-2 focus-visible:outline-accent">
                Sign out
              </button>
            </p>
          ) : (
            <div>
              <p className={cx(s.muted, "mb-4 text-[15px]")}>Sign in or create an account to place the order. Your bag stays as it is.</p>
              <AuthTiles compact />
            </div>
          )}
        </Step>

        <Step n={2} title="Address" done={!!chosen && !adding} className={!user ? "opacity-50" : ""}>
          {!user ? (
            <p className={cx(s.muted, "text-[15px]")}>After you sign in.</p>
          ) : adding || (addresses.length === 0 && !once) ? (
            <AddressTile
              offerSave
              submitLabel="Use this address"
              onDone={(a) => {
                if (a.id === "once") setOnce(a);
                setAddrId(a.id);
                setAdding(false);
              }}
              onCancel={addresses.length ? () => setAdding(false) : undefined}
            />
          ) : (
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Delivery address">
              {[...(once ? [once] : []), ...addresses].map((a) => {
                const on = chosen?.id === a.id;
                return (
                  <button key={a.id} type="button" role="radio" aria-checked={on} onClick={() => setAddrId(a.id)} className={cx(s.opt, "min-h-[96px] gap-0.5 p-4")}>
                    <span className="text-[15px] font-medium">{a.label}, {a.name}</span>
                    <span className="text-[13.5px] opacity-75">
                      {a.line1}
                      {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
                    </span>
                  </button>
                );
              })}
              <button type="button" onClick={() => setAdding(true)} className={cx(s.ghost, "h-auto min-h-[96px] rounded-[16px]")}>
                Add a new address
              </button>
            </div>
          )}
        </Step>

        <Step n={3} title="Delivery and payment" className={!ready ? "opacity-50" : ""}>
          <fieldset disabled={!ready} className="flex flex-col gap-5">
            <div className="grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Delivery">
              {(Object.keys(DELIVERY) as DeliveryId[]).map((d) => (
                <button key={d} type="button" role="radio" aria-checked={delivery === d} onClick={() => setDelivery(d)} className={cx(s.opt, "p-4")}>
                  <span className="text-[15px] font-medium">{DELIVERY[d].label}</span>
                  <span className={cx(s.mono, "text-[11px] opacity-75")}>{DELIVERY[d].price ? formatINR(DELIVERY[d].price) : "Free"}</span>
                </button>
              ))}
            </div>
            <div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Payment">
                {PAYMENTS.map((p) => {
                  const off = p.id === "cod" && codBlocked;
                  return (
                    <button key={p.id} type="button" role="radio" aria-checked={pay === p.id} disabled={off} onClick={() => setPayment(p.id)} className={cx(s.opt, "p-3", off && "cursor-not-allowed opacity-40")}>
                      <span className="text-[14.5px] font-medium">{p.label}</span>
                      <span className="text-[12px] opacity-70">{p.note}</span>
                    </button>
                  );
                })}
              </div>
              <p className={cx(s.muted, "mt-2 text-[13.5px]")}>Payments are not connected yet, so no money is taken. Preview: accounts and orders are saved in this browser until our store opens.</p>
            </div>
            <div>
              <label htmlFor="b6-gift" className={s.label}>
                Gift note (optional)
              </label>
              <textarea id="b6-gift" rows={2} maxLength={200} value={gift} onChange={(e) => setGift(e.target.value)} className={s.field} />
            </div>
          </fieldset>
        </Step>
      </div>

      <aside className="lg:sticky lg:top-[72px] lg:col-span-5" aria-label="Review and place">
        <div className={cx(s.tile, "p-5 sm:p-7")}>
          <div className="mb-4 flex items-center gap-3">
            <span className={cx(s.mono, "grid size-8 place-items-center rounded-full bg-[var(--b-ink)] text-[12px] text-white")}>4</span>
            <h2 className="text-[22px] font-medium tracking-[-0.03em]">Review and place</h2>
          </div>
          <ul className="flex flex-col gap-2">
            {items.map((l) => (
              <Line key={l.key} l={l} />
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-[var(--b-line)] pt-4 text-[15px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className={s.mono}>{formatINR(subtotal)}</dd>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-accent">
                <dt>
                  Code <span className={s.mono}>{coupon}</span>
                </dt>
                <dd className={s.mono}>−{formatINR(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Delivery</dt>
              <dd className={s.mono}>{shipping ? formatINR(shipping) : "Free"}</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="text-[17px] font-medium">Total</dt>
              <dd className={cx(s.monoWide, "text-[26px]")}>{formatINR(total)}</dd>
            </div>
          </dl>
          <form onSubmit={tryCode} className="mt-4 flex flex-wrap gap-2">
            <label htmlFor="b6-code" className={s.srOnly}>
              Coupon code
            </label>
            <input
              id="b6-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Coupon code"
              autoComplete="off"
              spellCheck={false}
              className={cx(s.field, s.mono, "min-w-0 flex-1 uppercase")}
              aria-describedby="b6-code-note"
            />
            <button type="submit" className={cx(s.ghost, "shrink-0")}>
              Apply
            </button>
            {coupon && promo?.ok && (
              <button type="button" className={cx(s.chip, s.chipSm)} onClick={() => setCoupon(null)} aria-label={`Remove code ${coupon}`}>
                {coupon}, {promo.label} ×
              </button>
            )}
            <p id="b6-code-note" className={cx("basis-full text-[12.5px]", codeErr ? "text-[#a8322a]" : s.muted)}>
              {codeErr ?? (coupon && promo && !promo.ok ? promo.error : "Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15.")}
            </p>
          </form>
          {chosen && user && <p className={cx(s.muted, "mt-3 text-[13.5px]")}>To {chosen.name}, {chosen.city} {chosen.pin}</p>}
          <button type="button" disabled={!ready} onClick={place} className={cx(s.btn, s.btnLg, "mt-5 w-full")}>
            {!user ? "Sign in to place the order" : !chosen ? "Add an address first" : `Place order, ${formatINR(total)}`}
          </button>
          {error && (
            <p role="alert" className="mt-3 text-[14px] text-[#a8322a]">
              {error}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function Line({ l }: { l: BagItem }) {
  return (
    <li className="flex gap-3 rounded-[20px] bg-[var(--b-tile2)] p-2">
      <span className="relative size-[64px] shrink-0 overflow-hidden rounded-[14px]">
        <Photo p={shotsOf(l.product)[0].photo} tone={shotsOf(l.product)[0].tone} sizes="64px" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-1">
        <div>
          <p className="truncate text-[15px] font-medium leading-tight">{l.product.name}</p>
          <p className={cx(s.mono, s.muted, "truncate text-[10.5px]")}>
            {WOOD_SHORT[l.product.wood]}
            {l.optionValue ? `, ${l.optionValue.label}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-[var(--b-tile)] p-0.5">
            <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l.key, l.qty - 1)} aria-label={`One fewer ${l.product.name}`}>
              <IconMinus size={14} />
            </button>
            <span className={cx(s.mono, "w-5 text-center text-[13px]")}>{l.qty}</span>
            <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l.key, l.qty + 1)} disabled={l.qty >= 9} aria-label={`One more ${l.product.name}`}>
              <IconOpen size={14} />
            </button>
          </div>
          <span className={cx(s.mono, "text-[13px]")}>{formatINR(l.total)}</span>
        </div>
      </div>
    </li>
  );
}

/* the columns a closing tile needs to finish its row (3 across on tablets, 4 on desktop) */
const SPAN_SM: Record<number, string> = { 1: "sm:col-span-1", 2: "sm:col-span-2", 3: "sm:col-span-3" };
const SPAN_LG: Record<number, string> = { 1: "lg:col-span-1", 2: "lg:col-span-2", 3: "lg:col-span-3", 4: "lg:col-span-4" };

function Confirmation({ o }: { o: Order }) {
  const t = trackingFor(o, o.placedAt);
  return (
    <div className={s.checkout}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} role="status" className={cx(s.tile, "flex min-h-[300px] flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-8")}>
        <span className="grid size-14 place-items-center rounded-full bg-[var(--b-ink)] text-white">
          <IconCheck size={24} />
        </span>
        <div>
          <h1 className={cx(s.display, "text-[clamp(44px,9cqw,96px)]")}>Thank you, {o.name.split(" ")[0]}.</h1>
          <p className={cx(s.muted, "mt-4 max-w-[50ch] text-[17px] leading-[1.5]")}>
            Your order is placed. Estimated delivery {formatDate(t.estimate.from)} to {formatDate(t.estimate.to)}, to {o.address.city} {o.address.pin}. Payments are not connected yet, so nothing was charged.
          </p>
        </div>
      </motion.div>
      {/* the right column fills the row: the number on top, the first of the six stages beneath */}
      <div className="flex flex-col gap-3 lg:col-span-4 lg:self-stretch">
        <div className={cx(s.tile, s.tint, "flex flex-col justify-between gap-6 p-6")}>
          <div>
            <p className={cx(s.mono, "text-[11px] opacity-70")}>Order number</p>
            <p className={cx(s.monoWide, "mt-1 text-[30px] leading-none")}>{o.id}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/d/06/track?o=${o.id}`} className={s.btn}>
              Track this order
            </Link>
            <Link href="/d/06/account" className={cx(s.ghost, s.onWhite)}>
              Your orders
            </Link>
          </div>
        </div>
        <div className={cx(s.tile, "flex flex-1 flex-col justify-between gap-4 p-5")}>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[17px] font-medium tracking-[-0.02em]">{t.stages[0].label}</p>
            <p className={cx(s.mono, s.muted, "text-[10.5px]")}>1 of {t.stages.length}</p>
          </div>
          <div className="flex gap-[3px]" aria-hidden>
            {t.stages.map((st, i) => (
              <span key={st.key} className={cx("h-2 flex-1 rounded-full", i === 0 ? "bg-accent" : "bg-[var(--b-dim)]")} />
            ))}
          </div>
          <p className={cx(s.muted, "text-[13.5px] leading-[1.45]")}>{t.stages[1].label} next: {t.stages[1].detail.charAt(0).toLowerCase() + t.stages[1].detail.slice(1)}</p>
        </div>
      </div>

      {/* what is in the parcel, as tiles of their own; the parcel slip closes the last row */}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-12 lg:grid-cols-4" aria-label="In this order">
        {o.lines.map((l, i) => {
          const ph = photoFor(l.slug, l.photoId, l.name);
          return (
            // on a phone an odd piece out takes the full width, so the slip below never sits beside a hole
            <li key={`${l.slug}-${l.option ?? ""}`} className={cx(s.tile, s.t2, "min-h-[220px]", i === 0 && o.lines.length % 2 === 1 && "max-sm:col-span-2")}>
              <Photo p={ph.photo} tone={ph.tone} sizes="(min-width:1024px) 25vw, 50vw" />
              <span className={cx(s.mono, "absolute left-3 top-3 rounded-full bg-[var(--b-tile)] px-2.5 py-1 text-[10.5px]")}>×{l.qty}</span>
              <span className="absolute inset-x-2 bottom-2 rounded-[18px] bg-[var(--b-tile)] px-3.5 py-2.5">
                <span className="block truncate text-[15px] font-medium leading-tight">{l.name}</span>
                <span className={cx(s.mono, s.muted, "mt-0.5 flex justify-between gap-2 text-[11px]")}>
                  <span className="truncate">{l.optionLabel ?? WOOD_SHORT[l.wood]}</span>
                  <span className="shrink-0 text-[var(--b-ink)]">{formatINR(l.unitPrice * l.qty)}</span>
                </span>
              </span>
            </li>
          );
        })}
        {/* the slip takes every column the pieces leave free; wide, it also says where the parcel goes */}
        <li className={cx(s.tile, s.dark, "col-span-2 min-h-[220px]", SPAN_SM[3 - (o.lines.length % 3)], SPAN_LG[4 - (o.lines.length % 4)])}>
          <div className="grid h-full gap-6 p-6 @min-[480px]:grid-cols-2 @min-[480px]:gap-10">
            <div className="hidden flex-col justify-between gap-4 @min-[480px]:flex">
              <p className={cx(s.mono, "text-[11px] text-white/55")}>Going to</p>
              <p className="text-[15px] leading-[1.5] text-white/85">
                {o.address.name}
                <br />
                {o.address.line1}
                {o.address.line2 ? `, ${o.address.line2}` : ""}
                <br />
                {o.address.city}, {o.address.state} {o.address.pin}
              </p>
              <p className={cx(s.mono, "text-[10.5px] leading-[1.6] text-white/55")}>
                {DELIVERY[o.delivery].label}, {PAYMENTS.find((x) => x.id === o.payment)?.label ?? o.payment}
                {o.giftNote ? (
                  <>
                    <br />
                    Gift note: &ldquo;{o.giftNote}&rdquo;
                  </>
                ) : null}
              </p>
            </div>
            <div className="flex flex-col justify-between gap-4">
              <p className={cx(s.mono, "text-[11px] text-white/55")}>{plural(o.lines.reduce((n, l) => n + l.qty, 0), "piece")}</p>
              <dl className="space-y-1.5 text-[14.5px]">
                <div className="flex justify-between gap-3 text-white/70">
                  <dt>Subtotal</dt>
                  <dd className={s.mono}>{formatINR(o.subtotal)}</dd>
                </div>
                {o.coupon && (
                  <div className="flex justify-between gap-3 text-white/70">
                    <dt>
                      Code <span className={s.mono}>{o.coupon}</span>
                    </dt>
                    <dd className={s.mono}>−{formatINR(o.discount ?? 0)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3 text-white/70">
                  <dt>Delivery</dt>
                  <dd className={s.mono}>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-white/15 pt-3">
                  <dt className="text-[16px] font-medium">Total</dt>
                  <dd className={cx(s.monoWide, "text-[24px]")}>{formatINR(o.total)}</dd>
                </div>
              </dl>
            </div>
          </div>
        </li>
      </ul>
    </div>
  );
}

function Empty() {
  const wood = useWood();
  const picks = [...productsFor(wood)].sort((a, b) => a.price - b.price).slice(0, 2);
  return (
    <div className={s.checkout}>
      <div className={cx(s.tile, "flex min-h-[300px] flex-col justify-between gap-6 p-6 sm:p-10 lg:col-span-6")}>
        <h1 className={cx(s.display, "text-[clamp(40px,9cqw,88px)]")}>Your bag is empty</h1>
        <div>
          <p className={cx(s.muted, "max-w-[40ch] text-[16px] leading-[1.5]")}>Checkout opens when there is something in the bag. Most people begin with something small.</p>
          <Link href="/d/06/shop" className={cx(s.btn, "mt-5")}>
            Go to the shop
          </Link>
        </div>
      </div>
      {picks.map((p) => (
        <PieceTile key={p.slug} product={p} id={`co-${p.slug}`} className="min-h-[300px] lg:col-span-3" />
      ))}
    </div>
  );
}
