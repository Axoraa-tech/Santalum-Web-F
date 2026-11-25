"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { signOut, useUser, type Address } from "@/lib/shop/account";
import { DELIVERY, bagSummary, useBag, type DeliveryId } from "@/lib/shop/bag";
import { PAYMENTS, applyCoupon, formatDate, placeOrder, trackingFor, type CouponResult, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { NOTES } from "../_lib/copy";
import { locate } from "../_lib/places";
import { BagRow } from "./Bag";
import { AddressLegend, AuthLegend, Key } from "./Legend";
import { RouteKey, RouteMap } from "./RouteMap";
import { s } from "./styles";

function OptPin() {
  return (
    <svg viewBox="0 0 24 32" className={`${s.optPin} mt-0.5 h-6 w-[18px]`} aria-hidden>
      <path d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z" stroke="var(--a-accent)" strokeWidth="1.8" />
    </svg>
  );
}

/** One stop on the route to an order: numbered, joined to the next by the dashed line. */
function Stop({ n, title, done, locked, children }: { n: number; title: string; done?: boolean; locked?: boolean; children: ReactNode }) {
  return (
    <section aria-label={title} className={`relative border bg-(--a-card) p-5 pt-6 md:p-7 ${locked ? "border-dashed border-(--a-line-2) opacity-60" : "border-(--a-line-2) shadow-[0_24px_50px_-40px_rgba(31,29,26,0.6)]"}`}>
      <span className={`absolute -left-4 -top-4 grid size-9 place-items-center rounded-full text-[15px] font-semibold ${done ? "bg-(--a-ink) text-(--a-paper)" : "bg-(--a-accent) text-(--a-card)"}`} aria-hidden>
        {done ? "✓" : n}
      </span>
      <h2 className={`${s.serif} text-[26px] leading-none`}>{title}</h2>
      <div className="mt-5">{locked ? <p className="text-[15px] text-(--a-muted)">Sign in first; this stop opens after the account.</p> : children}</div>
    </section>
  );
}

function Confirmation({ order }: { order: Order }) {
  const t = trackingFor(order, order.placedAt);
  const to = locate(order.address.city, order.address.state);
  return (
    <section aria-live="polite" className="mt-10 grid gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-start">
      <div className="border border-(--a-ink) bg-(--a-card) p-6 md:p-9">
        <p className="text-[14px] text-(--a-muted)">Order number</p>
        <p className="mt-1 text-[28px] font-semibold tracking-[0.06em] tabular-nums">{order.id}</p>
        <p className={`${s.serif} mt-5 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight`}>Thank you, {order.name.split(" ")[0]}. Your order is placed.</p>
        <ul className="mt-5 divide-y divide-(--a-line) border-y border-(--a-line) text-[16px]">
          {order.lines.map((l) => (
            <li key={`${l.slug}-${l.option ?? ""}`} className="flex justify-between gap-4 py-2">
              <span>
                {l.name}
                {l.optionLabel ? `, ${l.optionLabel}` : ""} <span className="text-(--a-muted)">× {l.qty}</span>
              </span>
              <span className="tabular-nums">{formatINR(l.unitPrice * l.qty)}</span>
            </li>
          ))}
        </ul>
        {order.discount ? (
          <p className="mt-2 flex justify-between text-[16px] text-(--a-accent-deep)">
            <span>Code {order.coupon}</span>
            <span className="tabular-nums">−{formatINR(order.discount)}</span>
          </p>
        ) : null}
        <p className="mt-3 flex justify-between text-[18px] font-semibold">
          <span>Total</span>
          <span className="tabular-nums">{formatINR(order.total)}</span>
        </p>
        <p className="mt-4 text-[16px] leading-relaxed text-(--a-ink-2)">
          Expected between {formatDate(t.estimate.from)} and {formatDate(t.estimate.to)}, to {order.address.city}, {order.address.pin}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={`/d/08/track?o=${order.id}`} className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
            Track this order
          </Link>
          <Link href="/d/08/account" className={`${s.btn} ${s.btnLine} h-12 px-6 text-[15px]`}>
            Your orders
          </Link>
        </div>
        <p className="mt-5 text-[14px] text-(--a-muted)">Payments are not connected yet, so no money was taken.</p>
      </div>
      <figure className="border border-(--a-ink) bg-(--a-card) p-1">
        <div className="border border-(--a-line-2)">
          <RouteMap to={to} woods={order.lines.map((l) => l.wood)} progress={0} id={`route-${order.id}`} className="block h-auto w-full" />
        </div>
        <figcaption className="px-2 pb-2 pt-2.5">
          <span className="block text-[14px] text-(--a-muted)">The route it will take, from the workshop to {to.name}. The parcel leaves the pin once it is packed.</span>
          <RouteKey woods={order.lines.map((l) => l.wood)} to={to.at} className="mt-2 border-t border-dashed border-(--a-line-2) pt-2" />
        </figcaption>
      </figure>
    </section>
  );
}

export function Checkout() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const id = useId();
  const [addrId, setAddrId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [once, setOnce] = useState<Address | null>(null);
  const [code, setCode] = useState("");
  const [promo, setPromo] = useState<CouponResult | null>(null);

  const sum = bagSummary(lines, delivery);
  const addresses = user?.addresses ?? [];
  const address = (addrId === "once" ? once : null) ?? addresses.find((a) => a.id === addrId) ?? addresses.find((a) => a.isDefault) ?? addresses[0] ?? once ?? undefined;
  // re-check the code against the current bag, so a smaller bag drops a code it no longer meets
  const live = promo?.ok ? applyCoupon(promo.code, sum.subtotal) : null;
  const discount = live?.ok ? live.discount : 0;
  const total = sum.total - discount;
  const codOk = total < 10000;
  const pay = payment === "cod" && !codOk ? "upi" : payment;

  const place = () => {
    if (!address) return setError("Add a delivery address first.");
    const { id: _id, isDefault: _d, ...addr } = address;
    void _id;
    void _d;
    const r = placeOrder({ lines, address: addr, delivery, payment: pay, giftNote: gift.trim() || undefined, coupon: live?.ok ? live.code : undefined });
    if (!r.ok) return setError(r.error);
    setError(null);
    setPlaced(r.order);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`${s.paper} min-h-svh pt-24 md:pt-28`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
        <h1 className={`${s.serif} border-b border-(--a-ink) pb-5 text-[clamp(2.6rem,6vw,4.6rem)] leading-none tracking-[-0.02em]`}>{placed ? "Order placed" : "Checkout"}</h1>

        {!hydrated ? (
          <div className={`${s.wait} mt-10 h-[420px]`} aria-busy="true" />
        ) : placed ? (
          <Confirmation order={placed} />
        ) : sum.count === 0 ? (
          <section className="mt-10 grid gap-6 border border-dashed border-(--a-line-2) bg-(--a-card) p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
            <div>
              <p className={`${s.serif} text-[clamp(1.8rem,3vw,2.4rem)]`}>Your bag is empty.</p>
              <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-(--a-ink-2)">Nothing is pinned yet. Choose a piece in the shop or on the board and it will wait here.</p>
            </div>
            <Link href="/d/08/shop" className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
              Open the shop
            </Link>
          </section>
        ) : (
          <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
            <div className="relative grid gap-10 pl-4">
              <span className={`${s.vroute} absolute bottom-8 left-0 top-6 w-[3px]`} aria-hidden />
              <Stop n={1} title="Account" done={!!user}>
                {user ? (
                  <p className="text-[16px]">
                    Signed in as <span className="font-semibold">{user.name}</span>. Not you?{" "}
                    <button type="button" onClick={signOut} className={s.link}>
                      Sign out
                    </button>
                  </p>
                ) : (
                  <>
                    <p className="mb-4 text-[16px] text-(--a-ink-2)">Sign in or create an account to place the order, so you can track its route later.</p>
                    <AuthLegend title="Who is the order for" />
                  </>
                )}
              </Stop>

              <Stop n={2} title="Address" locked={!user} done={!!address && !adding}>
                {addresses.length > 0 && !adding ? (
                  <div className="grid gap-3">
                    <div role="radiogroup" aria-label="Delivery address" className="grid gap-3">
                      {addresses.map((a) => (
                        <label key={a.id} className={s.opt}>
                          <input type="radio" name={`${id}-addr`} checked={address?.id === a.id} onChange={() => setAddrId(a.id)} />
                          <OptPin />
                          <span className="text-[15px] leading-snug">
                            <span className="font-semibold">{a.label || a.name}</span>
                            <span className="block text-(--a-ink-2)">
                              {a.name}, {a.line1}
                              {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
                            </span>
                          </span>
                        </label>
                      ))}
                    </div>
                    <button type="button" onClick={() => setAdding(true)} className={`${s.link} justify-self-start text-[15px]`}>
                      Add a new address
                    </button>
                  </div>
                ) : (
                  <AddressLegend
                    offerSave
                    prefill={user ? { name: user.name, phone: user.phone } : undefined}
                    submitLabel="Use this address"
                    onDone={(a, saved) => {
                      if (!saved) setOnce(a);
                      setAddrId(a.id);
                      setAdding(false);
                    }}
                    onCancel={addresses.length ? () => setAdding(false) : undefined}
                  />
                )}
              </Stop>

              <Stop n={3} title="Delivery and payment" locked={!user}>
                <div role="radiogroup" aria-label="Delivery" className="grid gap-3 sm:grid-cols-2">
                  {Object.values(DELIVERY).map((d) => (
                    <label key={d.id} className={s.opt}>
                      <input type="radio" name={`${id}-del`} checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                      <OptPin />
                      <span className="text-[15px] leading-snug">
                        <span className="font-semibold">{d.price ? formatINR(d.price) : "Free"}</span>
                        <span className="block text-(--a-ink-2)">{d.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <div role="radiogroup" aria-label="Payment" className="mt-5 grid gap-3 sm:grid-cols-2">
                  {PAYMENTS.map((p) => (
                    <label key={p.id} className={s.opt}>
                      <input type="radio" name={`${id}-pay`} checked={pay === p.id} disabled={p.id === "cod" && !codOk} onChange={() => setPayment(p.id)} />
                      <OptPin />
                      <span className="text-[15px] leading-snug">
                        <span className="font-semibold">{p.label}</span>
                        <span className="block text-(--a-ink-2)">{p.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-[14px] text-(--a-muted)">Payments are not connected yet, so no money is taken.</p>
                <div className="mt-5">
                  <Key label="Gift note (optional)" id={`${id}-gift`} hint={`${gift.length} of 300 characters`}>
                    <textarea id={`${id}-gift`} rows={3} maxLength={300} value={gift} onChange={(e) => setGift(e.target.value)} className={`${s.field} resize-y`} placeholder="Written by hand on a card; no prices inside." />
                  </Key>
                </div>
              </Stop>
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby={`${id}-sum`}>
              <div className="relative border border-(--a-ink) bg-(--a-card) p-5 md:p-7">
                <span className="absolute -left-4 -top-4 grid size-9 place-items-center rounded-full bg-(--a-accent) text-[15px] font-semibold text-(--a-card)" aria-hidden>
                  4
                </span>
                <div className="flex items-baseline justify-between">
                  <h2 id={`${id}-sum`} className={`${s.serif} text-[26px]`}>
                    Review and place
                  </h2>
                  <span className="text-[14px] text-(--a-muted)">
                    {sum.count} {sum.count === 1 ? "piece" : "pieces"}
                  </span>
                </div>
                <ul className="mt-2 divide-y divide-(--a-line)">
                  {sum.items.map((it) => (
                    <BagRow key={it.key} it={it} />
                  ))}
                </ul>
                <dl className="mt-2 border-t border-(--a-line-2) pt-3 text-[15px]">
                  <div className="flex justify-between py-1">
                    <dt className="text-(--a-muted)">Subtotal</dt>
                    <dd className="tabular-nums">{formatINR(sum.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-(--a-muted)">Delivery</dt>
                    <dd className="tabular-nums">{sum.shipping ? formatINR(sum.shipping) : "Free"}</dd>
                  </div>
                  {discount > 0 && live?.ok && (
                    <div className="flex justify-between py-1 text-(--a-accent-deep)">
                      <dt>Code {live.code}</dt>
                      <dd className="tabular-nums">−{formatINR(discount)}</dd>
                    </div>
                  )}
                  {address && (
                    <div className="flex justify-between gap-4 py-1">
                      <dt className="text-(--a-muted)">To</dt>
                      <dd className="text-right">
                        {address.city}, {address.pin}
                      </dd>
                    </div>
                  )}
                  <div className="mt-2 flex justify-between border-t border-(--a-line) pt-3 text-[18px] font-semibold">
                    <dt>Total</dt>
                    <dd className="tabular-nums">{formatINR(total)}</dd>
                  </div>
                </dl>
                <form
                  className="mt-4 border-t border-dashed border-(--a-line-2) pt-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPromo(code.trim() ? applyCoupon(code, sum.subtotal) : null);
                  }}
                >
                  <label htmlFor={`${id}-code`} className="flex items-center gap-2 text-[15px] text-(--a-ink-2)">
                    <span className="h-px w-4 bg-(--a-ink)" aria-hidden />
                    <span className="size-1.5 rounded-full bg-(--a-accent)" aria-hidden />
                    A code from the Circle
                  </label>
                  <div className="mt-1.5 flex gap-2">
                    <input id={`${id}-code`} value={code} onChange={(e) => setCode(e.target.value)} autoCapitalize="characters" aria-describedby={`${id}-code-m`} className={`${s.field} uppercase`} />
                    <button type="submit" className={`${s.btn} ${s.btnLine} h-12 shrink-0 px-4 text-[15px]`}>
                      Apply
                    </button>
                  </div>
                  <p id={`${id}-code-m`} role="status" className={`mt-1.5 text-[14px] ${promo && !promo.ok ? "italic text-[#b3261e]" : live && !live.ok ? "italic text-[#b3261e]" : "text-(--a-muted)"}`}>
                    {promo && !promo.ok ? promo.error : live && !live.ok ? live.error : live?.ok ? `${live.label}.` : "Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15."}
                  </p>
                </form>
                <button type="button" onClick={place} disabled={!user || !address} className={`${s.btn} ${s.btnInk} mt-6 min-h-12 w-full text-[16px] font-medium`}>
                  {!user ? "Sign in to place the order" : !address ? "Add an address to continue" : `Place order, ${formatINR(total)}`}
                </button>
                {error && (
                  <p role="alert" className="mt-3 text-[14px] text-[#b3261e]">
                    {error}
                  </p>
                )}
                <p className="mt-3 text-center text-[13px] leading-snug text-(--a-muted)">{NOTES.delivery}</p>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
