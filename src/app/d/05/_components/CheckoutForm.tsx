"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { signOut, useUser } from "@/lib/shop/account";
import { bagItems, bagSummary, DELIVERY, useBag, type DeliveryId } from "@/lib/shop/bag";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, useOrders, type CouponResult, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { SlipLines } from "./BagSlip";
import { EASE, PREVIEW_LINE } from "./content";
import { AddressForm, AddressLines, AuthPanel, type AddressDraft } from "./Forms";
import { setAppliedCode, slipFlag, useAppliedCode } from "./store";

const COD_LIMIT = 10000;
const FIRST_ORDER_CODE = "WELCOME10";
const SAY = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"];

function Step({ id, n, title, locked, lockNote, done, children }: { id: string; n: number; title: string; locked?: boolean; lockNote?: string; done?: boolean; children: ReactNode }) {
  return (
    <section id={id} className="x5c-set" data-locked={locked || undefined} data-done={done || undefined} aria-labelledby={`${id}-h`}>
      <h2 id={`${id}-h`} className="x5c-legend">
        <span className="x5c-legendN">{n}</span>
        {title}
        {done && <span className="x5c-legendDone">Done</span>}
      </h2>
      {locked && <p className="x5c-lockNote">{lockNote}</p>}
      <div className="x5c-setBody" inert={locked || undefined}>
        {children}
      </div>
    </section>
  );
}

/** Checkout set as an editorial form on the grid: account, address, delivery and payment, review. */
export function CheckoutForm() {
  const hydrated = useHydrated();
  const user = useUser();
  const lines = useBag();
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [addrChoice, setAddrChoice] = useState<string | null>(null);
  const [oneOff, setOneOff] = useState<AddressDraft | null>(null);
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [code, setCode] = useState("");
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const applied = useAppliedCode();
  const past = useOrders().filter((o) => o.status !== "cancelled").length;

  if (placed) return <Confirmation order={placed} />;

  const sum = bagSummary(lines, delivery);
  const saved = user?.addresses ?? [];
  const fallbackId = saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? "new";
  const choice = addrChoice ?? fallbackId;
  const chosen: AddressDraft | null = choice === "oneoff" ? oneOff : (saved.find((a) => a.id === choice) ?? null);
  // A code is checked against this bag and this file: the first-order code is for a first order only.
  const check = (c: string): CouponResult => {
    const r = applyCoupon(c, sum.subtotal);
    if (r.ok && r.code === FIRST_ORDER_CODE && past > 0)
      return { ok: false, error: `${FIRST_ORDER_CODE} is for a first order, and your file already holds ${SAY[past] ?? past} ${past === 1 ? "order" : "orders"}.` };
    return r;
  };
  const promo = applied ? check(applied) : null;
  const discount = promo?.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const codOk = total < COD_LIMIT;
  const payBlocked = payment === "cod" && !codOk;
  const signedIn = hydrated && !!user;
  const ready = signedIn && !!chosen && !payBlocked && sum.count > 0;

  const place = () => {
    if (!chosen) return;
    // the order keeps the address as written, without the file's own id
    const { label, name, phone, line1, line2, city, state, pin } = chosen;
    const r = placeOrder({ lines, address: { label, name, phone, line1, line2, city, state, pin }, delivery, payment, giftNote: gift.trim() || undefined, coupon: promo?.ok ? promo.code : undefined });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setAppliedCode(null);
    setPlaced(r.order);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const head = (
    <header id="checkout" className="x5c-head">
      <p className="x5c-kicker">
        <span>Order form</span>
        <span>{hydrated && sum.count ? `${sum.count} ${sum.count === 1 ? "piece" : "pieces"}, ${formatINR(total)}` : ""}</span>
      </p>
      <h1 className="x5c-title">Checkout</h1>
    </header>
  );

  if (hydrated && sum.count === 0)
    return (
      <div className="x5c-wrap">
        {head}
        <div className="x5c-empty">
          <p>The order slip is empty. Every entry in the catalogue has an Add or a Choose beside it; whatever you add will be waiting here.</p>
          <Link href="/d/05/shop" className="x5c-emptyLink">
            Open the catalogue
          </Link>
          <Link href="/d/05/track" className="x5c-emptyLink">
            Track an earlier order
          </Link>
        </div>
      </div>
    );

  return (
    <div className="x5c-wrap">
      {head}

      <aside id="order" className="x5c-summary" aria-label="Your order">
        <div className="x5c-summaryInner">
          <p className="x5c-summaryHead">
            <span>Your order</span>
            <button type="button" className="x5-textBtn" onClick={() => slipFlag.set(true)}>
              Edit on the slip
            </button>
          </p>
          {hydrated && <SlipLines items={sum.items} />}
          <dl className="x5-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(sum.subtotal)}</dd>
            </div>
            <div>
              <dt>{delivery === "express" ? "Express delivery" : "Delivery in India"}</dt>
              <dd>{sum.shipping ? formatINR(sum.shipping) : "Free"}</dd>
            </div>
            {promo?.ok && (
              <div className="x5c-discount">
                <dt>Code {promo.code}</dt>
                <dd>−{formatINR(promo.discount)}</dd>
              </div>
            )}
            <div className="x5-totalRow">
              <dt>Total</dt>
              <dd>{formatINR(total)}</dd>
            </div>
          </dl>
          <form
            className="x5c-code"
            data-applied={promo?.ok || undefined}
            onSubmit={(e) => {
              e.preventDefault();
              if (!code.trim()) return setCodeErr("Type the code first.");
              const r = check(code);
              if (!r.ok) return setCodeErr(r.error);
              setCodeErr(null);
              setCode("");
              setAppliedCode(r.code);
            }}
          >
            <label htmlFor="co-code" className="x5c-label">
              A code from a letter or a card
            </label>
            <div className="x5c-codeRow">
              {/* once a code is set it is printed into the field, not typed over: Remove first, then another */}
              <input
                id="co-code"
                name="coupon"
                autoComplete="off"
                className="x5c-input x5c-codeInput"
                value={applied ?? code}
                readOnly={!!applied}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  setCodeErr(null);
                }}
                aria-invalid={codeErr || (promo && !promo.ok) ? true : undefined}
                aria-describedby="co-code-note"
              />
              {applied ? (
                <button
                  type="button"
                  className="x5-textBtn"
                  onClick={() => {
                    setAppliedCode(null);
                    setCode("");
                    setCodeErr(null);
                  }}
                >
                  Remove
                </button>
              ) : (
                <button type="submit" className="x5-addSmall">
                  Apply
                </button>
              )}
            </div>
            {(() => {
              const err = codeErr ?? (promo && !promo.ok ? promo.error : null);
              return (
                <p id="co-code-note" className={err ? "x5c-error" : "x5c-hint"} role={err ? "alert" : undefined}>
                  {err ?? (promo?.ok ? `${promo.label}. Applied; remove it to use another.` : "Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15. One code an order.")}
                </p>
              );
            })()}
          </form>
        </div>
      </aside>

      <div className="x5c-form">
        <Step id="account" n={1} title="Account" done={signedIn}>
          {!hydrated ? (
            <p className="x5c-review">Checking whether you are signed in.</p>
          ) : user ? (
            <p className="x5c-signed">
              Signed in as <b>{user.name}</b>, {user.email}. Not you?{" "}
              <button type="button" className="x5-textLink" onClick={() => signOut()}>
                Sign out
              </button>
            </p>
          ) : (
            <>
              <p className="x5c-review">An order needs an account, so you can track it and find it again. Sign in, or open one in a minute.</p>
              <AuthPanel idBase="co-auth" />
            </>
          )}
        </Step>

        <Step id="address" n={2} title="Delivery address" locked={!signedIn} lockNote="Sign in above first; the address goes into your file." done={signedIn && !!chosen && choice !== "new"}>
          {saved.length > 0 && (
            <div className="x5c-radios" role="radiogroup" aria-label="Saved addresses">
              {saved.map((a) => (
                <label key={a.id} className="x5c-radio">
                  <input type="radio" name="co-address" checked={choice === a.id} onChange={() => setAddrChoice(a.id)} />
                  <span className="x5c-radioBody">
                    <span className="x5c-radioHead">
                      {a.label}
                      {a.isDefault && <i>Default</i>}
                    </span>
                    <AddressLines a={a} />
                  </span>
                </label>
              ))}
              {oneOff && (
                <label className="x5c-radio">
                  <input type="radio" name="co-address" checked={choice === "oneoff"} onChange={() => setAddrChoice("oneoff")} />
                  <span className="x5c-radioBody">
                    <span className="x5c-radioHead">{oneOff.label}, this order only</span>
                    <AddressLines a={oneOff} />
                  </span>
                </label>
              )}
              <label className="x5c-radio">
                <input type="radio" name="co-address" checked={choice === "new"} onChange={() => setAddrChoice("new")} />
                <span className="x5c-radioBody">
                  <span className="x5c-radioHead">A new address</span>
                </span>
              </label>
            </div>
          )}
          {saved.length === 0 && oneOff && choice === "oneoff" && (
            <div className="x5c-chosen">
              <AddressLines a={oneOff} />
              <button type="button" className="x5-textBtn" onClick={() => setAddrChoice("new")}>
                Change
              </button>
            </div>
          )}
          {choice === "new" && (
            <AddressForm
              idBase="co-addr"
              submitLabel="Use this address"
              offerSave
              onDone={(a) => {
                if (a.id) setAddrChoice(a.id);
                else {
                  setOneOff(a);
                  setAddrChoice("oneoff");
                }
              }}
            />
          )}
        </Step>

        <Step id="payment" n={3} title="Delivery and payment" locked={!signedIn} lockNote="Sign in above first.">
          <div className="x5c-radios" role="radiogroup" aria-label="Delivery">
            {(Object.keys(DELIVERY) as DeliveryId[]).map((k) => (
              <label key={k} className="x5c-radio x5c-radioRow">
                <input type="radio" name="co-delivery" checked={delivery === k} onChange={() => setDelivery(k)} />
                <span className="x5c-radioBody">
                  <span className="x5c-radioHead">{DELIVERY[k].label}</span>
                </span>
                <span className="x5c-radioPrice">{DELIVERY[k].price ? formatINR(DELIVERY[k].price) : "Free"}</span>
              </label>
            ))}
          </div>

          <p className="x5c-subhead">Payment</p>
          <div className="x5c-radios x5c-radiosPay" role="radiogroup" aria-label="Payment">
            {PAYMENTS.map((p) => {
              const off = p.id === "cod" && !codOk;
              return (
                <label key={p.id} className="x5c-radio x5c-radioRow" data-off={off || undefined}>
                  <input type="radio" name="co-payment" checked={payment === p.id} disabled={off} onChange={() => setPayment(p.id)} />
                  <span className="x5c-radioBody">
                    <span className="x5c-radioHead">{p.label}</span>
                    <span className="x5c-radioNote">{off ? `Orders under ${formatINR(COD_LIMIT)} only` : p.note}</span>
                  </span>
                </label>
              );
            })}
          </div>
          {payBlocked && (
            <p className="x5c-formError" role="alert">
              Pay on delivery is for orders under {formatINR(COD_LIMIT)}. Please choose another way to pay.
            </p>
          )}
          <p className="x5c-notice" role="note">
            <b>Payments are not connected yet, so no money is taken.</b> {PREVIEW_LINE}
          </p>

          <div className="x5c-giftInner">
            <label htmlFor="co-gift" className="x5c-label">
              A note for the card <span>(optional)</span>
            </label>
            <textarea
              id="co-gift"
              name="gift-note"
              className="x5c-input x5c-textarea"
              rows={3}
              maxLength={240}
              value={gift}
              onChange={(e) => setGift(e.target.value)}
              aria-describedby="co-gift-hint"
            />
            <span id="co-gift-hint" className="x5c-hint">
              {240 - gift.length} characters left. When there is a card, we leave the prices off the slip.
            </span>
          </div>
        </Step>

        <Step id="review" n={4} title="Review and place" locked={!signedIn} lockNote="Sign in above first.">
          <dl className="x5c-reviewDl">
            <div>
              <dt>Deliver to</dt>
              <dd>{chosen ? <AddressLines a={chosen} /> : <span className="x5c-missing">Choose or add an address in step 2.</span>}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{DELIVERY[delivery].label}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{PAYMENTS.find((p) => p.id === payment)?.label}, not charged in this preview</dd>
            </div>
            {promo?.ok && (
              <div>
                <dt>Code</dt>
                <dd>
                  {promo.code}, less {formatINR(promo.discount)}
                </dd>
              </div>
            )}
            {gift.trim() && (
              <div>
                <dt>Card</dt>
                <dd>“{gift.trim()}”</dd>
              </div>
            )}
          </dl>
          {error && (
            <p className="x5c-formError" role="alert">
              {error}
            </p>
          )}
          <button type="button" className="x5c-place" disabled={!ready} onClick={place}>
            <span>Place the order</span>
            <span>{formatINR(total)}</span>
          </button>
          <p className="x5c-fine">Every piece leaves the workshop with its record. You can follow the order in the dispatch log.</p>
        </Step>
      </div>
    </div>
  );
}

function Confirmation({ order }: { order: Order }) {
  const first = order.name.split(" ")[0];
  const pieces = order.lines.reduce((n, l) => n + l.qty, 0);
  const est = trackingFor(order, order.placedAt).estimate;
  const items = bagItems(order.lines.map((l, i) => ({ key: `${l.slug}-${i}`, slug: l.slug, option: l.option, qty: l.qty, note: l.note }))).filter((x) => getProduct(x.slug));
  return (
    <motion.div className="x5c-wrap" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }}>
      <header id="thanks" className="x5c-head">
        <p className="x5c-kicker">
          <span>Order placed</span>
          <span>{formatDate(order.placedAt, true)}</span>
        </p>
        <h1 className="x5c-title">Thank you, {first}.</h1>
        <p className="x5c-orderNo">
          <span>Order number</span>
          <b>{order.id}</b>
        </p>
      </header>
      <div className="x5c-done">
        <div id="slip" className="x5c-doneSlip">
          <p className="x5c-summaryHead">
            <span>Order {order.id}</span>
            <span>
              {pieces} {pieces === 1 ? "piece" : "pieces"}
            </span>
          </p>
          <SlipLines items={items} />
          <dl className="x5-totals">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(order.subtotal)}</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
            </div>
            {order.coupon && order.discount ? (
              <div className="x5c-discount">
                <dt>Code {order.coupon}</dt>
                <dd>−{formatINR(order.discount)}</dd>
              </div>
            ) : null}
            <div className="x5-totalRow">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>
        <div id="next" className="x5c-doneNext">
          <p>
            Expected between <b>{formatDate(est.from)}</b> and <b>{formatDate(est.to)}</b>, by {DELIVERY[order.delivery].label.toLowerCase()} to {order.address.city}.
          </p>
          <p className="x5c-fine">
            {PAYMENTS.find((p) => p.id === order.payment)?.label}: payments are not connected yet, so no money was taken. Each piece travels with its {order.lines.some((l) => l.wood === "red") ? "batch record" : "lot record"}{order.lines.some((l) => l.wood === "red") && order.lines.some((l) => l.wood === "white") ? " or lot record" : ""}.
          </p>
          <div className="x5c-doneLinks">
            <Link href={`/d/05/track?o=${order.id}`} className="x5c-place x5c-placeSmall">
              <span>Track this order</span>
              <span>Dispatch log</span>
            </Link>
            <Link href="/d/05/account" className="x5c-emptyLink">
              Your orders
            </Link>
            <Link href="/d/05/shop" className="x5c-emptyLink">
              Back to the catalogue
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
