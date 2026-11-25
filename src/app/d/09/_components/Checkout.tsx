"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { signOut, useUser, type Address } from "@/lib/shop/account";
import { bag, bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import s from "../styles";
import { AddressForm, AddressLines, AuthPanel, Field, PreviewNote } from "./forms";
import { HeldSky } from "./Held";
import { SunArc } from "./SunArc";

type Addr = Omit<Address, "id" | "isDefault">;
const strip = (a: Address): Addr => ({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin });

/** Checkout, held at 19:25 under the evening sky. Signing in is required to place an order. */
export function CheckoutDawn() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [placed, setPlaced] = useState<Order | null>(null);
  const [addrId, setAddrId] = useState<string | null>(null);
  const [oneOff, setOneOff] = useState<Addr | null>(null);
  const [adding, setAdding] = useState(false);
  const [addrDone, setAddrDone] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [payDone, setPayDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [codeErr, setCodeErr] = useState<string | null>(null);

  const sum = bagSummary(hydrated ? lines : [], delivery);
  const promo = applied ? applyCoupon(applied, sum.subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const tryCode = () => {
    const r = applyCoupon(code, sum.subtotal);
    if (r.ok) {
      setApplied(r.code);
      setCodeErr(null);
    } else setCodeErr(r.error);
  };
  const saved = user?.addresses ?? [];
  const chosen = saved.find((a) => a.id === addrId) ?? saved.find((a) => a.isDefault) ?? saved[0];
  const address: Addr | null = oneOff ?? (chosen ? strip(chosen) : null);
  const codBlocked = total >= 10000;
  const pay = payment === "cod" && codBlocked ? "upi" : payment;

  const signedIn = hydrated && !!user;
  const step = !signedIn ? 1 : !addrDone || !address ? 2 : !payDone ? 3 : 4;
  const state = (n: number) => (n < step ? "done" : n === step ? "open" : "locked");

  const place = () => {
    if (!address) return;
    const r = placeOrder({ lines, address, delivery, payment: pay, giftNote: gift.trim() || undefined, coupon: promo && promo.ok ? promo.code : undefined });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setPlaced(r.order);
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <HeldSky min={1165} />
      <div className={`${s.swap} relative mx-auto max-w-[1500px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-32`}>
        {placed ? (
          <Confirmation order={placed} />
        ) : hydrated && sum.count === 0 ? (
          <div className="flex min-h-[60svh] flex-col justify-center">
            <h1 className={`${s.display} text-[clamp(3rem,10vw,7rem)] leading-[0.92]`}>The tray is empty</h1>
            <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.7] text-[var(--muted)]">
              Walk through the day or the shop and open any piece; whatever you add will wait here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/d/09/shop" className={s.btn}>
                Go to the shop
              </Link>
              <Link href="/d/09" className={s.ghost}>
                Back to dawn
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className={`${s.display} text-[clamp(3rem,10vw,7rem)] leading-[0.92]`}>Checkout</h1>
            <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
              <ol className="grid gap-12 lg:col-span-7">
                <Step n={1} title="Account" state={state(1)}>
                  {signedIn && user ? (
                    <p className="text-[16px] leading-[1.6]">
                      Signed in as {user.name}.{" "}
                      <span className="text-[var(--muted)]">Not you?</span>{" "}
                      <button type="button" onClick={signOut} className={s.link}>
                        Sign out
                      </button>
                    </p>
                  ) : (
                    <div className="grid gap-5">
                      <p className="max-w-[34rem] text-[16px] leading-[1.65] text-[var(--muted)]">
                        Sign in, or create an account. The order waits on the tray, and you can follow the sun across it once it is placed.
                      </p>
                      <AuthPanel compact />
                    </div>
                  )}
                </Step>

                <Step n={2} title="Delivery address" state={state(2)}>
                  {signedIn && user && (step > 2 && address ? (
                    <Summary onChange={() => setAddrDone(false)}>
                      <AddressLines a={address} />
                    </Summary>
                  ) : adding || saved.length === 0 ? (
                    <AddressForm
                      offerSave
                      defaultName={user.name}
                      defaultPhone={user.phone}
                      submitLabel="Deliver here"
                      onCancel={saved.length ? () => setAdding(false) : undefined}
                      onSaved={(a, keep) => {
                        setAdding(false);
                        if (keep) {
                          setAddrId(keep.id);
                          setOneOff(null);
                        } else setOneOff(strip({ ...a, id: "once" }));
                        setAddrDone(true);
                      }}
                    />
                  ) : (
                    <div className="grid gap-3">
                      <div role="radiogroup" aria-label="Saved addresses" className="grid gap-3 sm:grid-cols-2">
                        {saved.map((a) => (
                          <label key={a.id} className={s.option}>
                            <input
                              type="radio"
                              name="addr"
                              checked={!oneOff && chosen?.id === a.id}
                              onChange={() => {
                                setAddrId(a.id);
                                setOneOff(null);
                              }}
                            />
                            <span aria-hidden className={s.optionMark} />
                            <span className="min-w-0">
                              <span className="block text-[13px] text-[var(--muted)]">
                                {a.label}
                                {a.isDefault ? ", default" : ""}
                              </span>
                              <AddressLines a={a} />
                            </span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <button type="button" onClick={() => setAddrDone(true)} className={s.btn}>
                          Deliver here
                        </button>
                        <button type="button" onClick={() => setAdding(true)} className={s.link}>
                          Add a new address
                        </button>
                      </div>
                    </div>
                  ))}
                </Step>

                <Step n={3} title="Delivery and payment" state={state(3)}>
                  {step > 3 ? (
                    <Summary onChange={() => setPayDone(false)}>
                      <span className="block text-[15px] leading-[1.6]">
                        {DELIVERY[delivery].label}, {PAYMENTS.find((p) => p.id === pay)?.label}
                        {gift.trim() && <span className="block text-[var(--muted)]">Gift note: {gift.trim()}</span>}
                      </span>
                    </Summary>
                  ) : step === 3 ? (
                    <div className="grid gap-8">
                      <fieldset>
                        <legend className="text-[13px] text-[var(--muted)]">Delivery</legend>
                        <div className="mt-4 grid grid-cols-2 gap-3">
                          {Object.values(DELIVERY).map((d) => (
                            <label key={d.id} className={`${s.option} ${s.optionArch}`}>
                              <input type="radio" name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                              <span aria-hidden className={s.optionMark} />
                              <span className="text-[15px] leading-snug">
                                <span className={`${s.display} block text-[22px] leading-none`}>{d.id === "express" ? "Express" : "Standard"}</span>
                                <span className="mt-1.5 block text-[var(--muted)]">{d.id === "express" ? "1–2 working days" : "3–5 working days"}</span>
                                <span className={`${s.num} mt-0.5 block`}>{d.price ? formatINR(d.price) : "Free"}</span>
                              </span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <fieldset>
                        <legend className="text-[13px] text-[var(--muted)]">Payment</legend>
                        <div className="mt-4 grid grid-cols-2 gap-3 xl:grid-cols-4">
                          {PAYMENTS.map((p) => {
                            const off = p.id === "cod" && codBlocked;
                            return (
                              <label key={p.id} className={`${s.option} ${s.optionArch}`}>
                                <input type="radio" name="payment" disabled={off} checked={pay === p.id} onChange={() => setPayment(p.id)} />
                                <span aria-hidden className={s.optionMark} />
                                <span className="text-[15px] leading-snug">
                                  <span className={`${s.display} block text-[22px] leading-none`}>{p.label}</span>
                                  <span className="mt-1.5 block text-[var(--muted)]">{off ? "Only for orders under ₹10,000" : p.note}</span>
                                </span>
                              </label>
                            );
                          })}
                        </div>
                        <div className="mt-4">
                          <PreviewNote>Payments are not connected yet, so no money is taken. Preview: accounts and orders are saved in this browser until our store opens.</PreviewNote>
                        </div>
                      </fieldset>
                      <div className={s.field}>
                        <label htmlFor="d09-gift" className={s.fieldLabel}>
                          A card for the tray (optional)
                        </label>
                        <textarea
                          id="d09-gift"
                          rows={3}
                          maxLength={240}
                          value={gift}
                          onChange={(e) => setGift(e.target.value)}
                          placeholder="Written by hand on the card that travels with the pieces"
                        />
                      </div>
                      <div>
                        <button type="button" onClick={() => setPayDone(true)} className={s.btn}>
                          Review the order
                        </button>
                      </div>
                    </div>
                  ) : null}
                </Step>

                <Step n={4} title="Review and place" state={state(4)}>
                  {step === 4 && (
                    <div className="grid gap-5">
                      <p className="max-w-[34rem] text-[16px] leading-[1.65] text-[var(--muted)]">
                        {sum.count} {sum.count === 1 ? "piece" : "pieces"}, delivered {delivery === "express" ? "by express" : "free"} to {address?.city}. Each
                        leaves with its batch record or lot.
                      </p>
                      {error && (
                        <p role="alert" className={s.error}>
                          {error}
                        </p>
                      )}
                      <button type="button" onClick={place} className={`${s.btn} w-full justify-between sm:w-auto sm:min-w-[22rem]`}>
                        <span>Place order</span>
                        <span className={`${s.tab} opacity-75`}>{formatINR(total)}</span>
                      </button>
                    </div>
                  )}
                </Step>
              </ol>

              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <div className={`${s.slip} px-6 pb-7 pt-7 sm:px-8`}>
                    <p className={`${s.display} text-[32px] leading-none`}>
                      On the tray{" "}
                      <span className={`${s.tab} text-[15px] text-[var(--muted)]`} style={{ fontFamily: "var(--font-mulish)" }}>
                        {sum.count} {sum.count === 1 ? "piece" : "pieces"}
                      </span>
                    </p>
                    <ul className="mt-6">
                      {sum.items.map((it) => (
                        <SummaryLine key={it.key} item={it} />
                      ))}
                    </ul>
                    <dl className="mt-4 space-y-2 border-t border-[var(--hair)] pt-4 text-[15px]">
                      <Row k="Subtotal" v={formatINR(sum.subtotal)} />
                      <Row k="Delivery" v={sum.shipping ? formatINR(sum.shipping) : "Free"} />
                      {promo && promo.ok && <Row k={`${promo.code}, ${promo.label}`} v={`− ${formatINR(discount)}`} />}
                      <div className="flex items-baseline justify-between pt-2">
                        <dt>Total</dt>
                        <dd className={`${s.num} text-[32px] leading-none`}>{formatINR(total)}</dd>
                      </div>
                    </dl>
                    <div className="mt-6 border-t border-dotted border-[rgb(42_36_32/0.22)] pt-5">
                      {applied && promo ? (
                        <div className="flex items-baseline justify-between gap-4 text-[15px]">
                          <p>
                            {promo.ok ? (
                              <>
                                Code <span className={s.tab}>{promo.code}</span> applied
                              </>
                            ) : (
                              <span className={s.error}>{promo.error}</span>
                            )}
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setApplied(null);
                              setCode("");
                            }}
                            className={s.link}
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            tryCode();
                          }}
                          noValidate
                          className="flex items-end gap-4"
                        >
                          <Field
                            label="A code, if you have one"
                            name="coupon"
                            autoComplete="off"
                            autoCapitalize="characters"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            error={codeErr}
                            className="flex-1"
                          />
                          <button type="submit" disabled={!code.trim()} className={`${s.ghost} mb-1 min-h-[2.75rem] shrink-0 px-5 text-[14px]`}>
                            Apply
                          </button>
                        </form>
                      )}
                      <p className="mt-3 text-[13px] leading-[1.55] text-[var(--muted)]">
                        Preview codes: <span className={s.tab}>WELCOME10</span>, <span className={s.tab}>CIRCLE500</span>, <span className={s.tab}>HEARTWOOD15</span>.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Step({ n, title, state, children }: { n: number; title: string; state: "done" | "open" | "locked"; children: ReactNode }) {
  return (
    <li className={s.step} data-state={state} aria-current={state === "open" ? "step" : undefined}>
      <span aria-hidden className={`${s.stepDot} ${s.tab}`}>
        {state === "done" ? "✓" : n}
      </span>
      <h2 className={`${s.display} text-[30px] leading-none lg:text-[34px]`}>{title}</h2>
      <div className="mt-6">{state === "locked" ? <p className="text-[15px] text-[var(--muted)]">After the step before.</p> : children}</div>
    </li>
  );
}

function Summary({ children, onChange }: { children: ReactNode; onChange: () => void }) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div className="min-w-0">{children}</div>
      <button type="button" onClick={onChange} className={`${s.link} shrink-0`}>
        Change
      </button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-[var(--muted)]">{k}</dt>
      <dd className={s.tab}>{v}</dd>
    </div>
  );
}

function SummaryLine({ item }: { item: BagItem }) {
  const p = item.product;
  return (
    <li className="flex items-center gap-4 border-b border-dotted border-[rgb(42_36_32/0.2)] py-3 last:border-b-0">
      <span className={`${s.mask} ${s.circle} size-14 shrink-0`}>
        <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`${s.display} block truncate text-[19px] leading-tight`}>{p.name}</span>
        <span className="block text-[13px] text-[var(--muted)]">
          {CONTENT[p.wood].name}
          {item.optionValue ? `, ${item.optionValue.label}` : ""}, quantity {item.qty}
        </span>
        {item.note && <span className="block truncate text-[13px] text-[var(--muted)]">Note: {item.note}</span>}
      </span>
      <span className="flex flex-col items-end gap-1">
        <span className={`${s.tab} text-[14px]`}>{formatINR(item.total)}</span>
        <button type="button" onClick={() => bag.remove(item.key)} className="text-[12px] text-[var(--muted)] underline-offset-2 hover:underline">
          Remove
        </button>
      </span>
    </li>
  );
}

function Confirmation({ order }: { order: Order }) {
  const est = trackingFor(order, order.placedAt).estimate;
  return (
    <div className="grid gap-12 pt-4 lg:grid-cols-12 lg:items-center lg:pt-10">
      <div className="lg:col-span-7">
        <p className={`${s.tab} text-[15px] text-[var(--muted)]`}>Order {order.id}</p>
        <h1 className={`${s.display} mt-3 text-[clamp(3rem,9vw,6.5rem)] leading-[0.92]`}>Thank you, {order.name.split(" ")[0]}.</h1>
        <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-[var(--muted)]">
          Your order is placed. Expected between {formatDate(est.from)} and {formatDate(est.to)}, to {order.address.city}. No money was taken: payments are not
          connected yet.
        </p>
        <SunArc current={0} labelled className="mt-8 max-w-[34rem]" />
        <div className="mt-8 flex flex-wrap gap-4">
          <Link href={`/d/09/track?o=${order.id}`} className={s.btn}>
            Track this order
          </Link>
          <Link href="/d/09/account" className={s.ghost}>
            Your orders
          </Link>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className={`${s.slip} px-6 pb-7 pt-7 sm:px-8`}>
          <p className="text-[13px] text-[var(--muted)]">What was on the tray</p>
          <ul className="mt-3">
            {order.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-baseline justify-between gap-4 border-b border-dotted border-[rgb(42_36_32/0.2)] py-3 last:border-b-0">
                <span className="min-w-0">
                  <span className={`${s.display} block text-[19px] leading-tight`}>{l.name}</span>
                  <span className="block text-[13px] text-[var(--muted)]">
                    {CONTENT[l.wood].name}
                    {l.optionLabel ? `, ${l.optionLabel}` : ""}, quantity {l.qty}
                  </span>
                </span>
                <span className={`${s.tab} text-[14px]`}>{formatINR(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          {order.coupon && order.discount ? (
            <p className="mt-4 flex items-baseline justify-between text-[15px] text-[var(--muted)]">
              <span>Code {order.coupon}</span>
              <span className={s.tab}>− {formatINR(order.discount)}</span>
            </p>
          ) : null}
          <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hair)] pt-4">
            <span className="text-[15px]">Total</span>
            <span className={`${s.num} text-[30px] leading-none`}>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
