"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes } from "react";
import { formatINR } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { SlipLines } from "./BagSlip";
import { EASE, STATES } from "./content";
import { slipFlag } from "./store";

type Placed = { ref: string; name: string; email: string; city: string; lines: Line[]; total: number; gift: boolean; hidePrices: boolean };

const noop = () => () => {};

/** A preview order reference. Only ever called from the submit handler. */
function orderRef() {
  return `IX-${Math.floor(10000 + Math.random() * 89999)}`;
}
const useHydrated = () =>
  useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );

function Field({ label, hint, wide, ...rest }: { label: string; hint?: string; wide?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const id = `co-${rest.name}`;
  return (
    <div className={`x5c-field ${wide ? "x5c-wide" : ""}`}>
      <label htmlFor={id} className="x5c-label">
        {label}
        {!rest.required && <span> (optional)</span>}
      </label>
      <input id={id} className="x5c-input" {...rest} />
      {hint && <span className="x5c-hint">{hint}</span>}
    </div>
  );
}

/** Checkout set as an editorial form on the grid. Payments are not connected: placing the order shows a confirmation. */
export function CheckoutForm() {
  const hydrated = useHydrated();
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  if (placed) return <Confirmation order={placed} />;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPlaced({
      ref: orderRef(),
      name: String(data.get("name") ?? "").trim(),
      email: String(data.get("email") ?? ""),
      city: String(data.get("city") ?? ""),
      lines,
      total: subtotal,
      gift,
      hidePrices: data.get("hidePrices") === "on",
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="x5c-wrap">
      <header id="checkout" className="x5c-head">
        <p className="x5c-kicker">
          <span>Order form</span>
          <span>
            {hydrated ? `${count} ${count === 1 ? "piece" : "pieces"}, ${formatINR(subtotal)}` : ""}
          </span>
        </p>
        <h1 className="x5c-title">Checkout</h1>
        <p className="x5c-notice" role="note">
          <b>Preview: payments are not connected yet.</b> Placing an order here shows a confirmation; nothing is charged and nothing
          is sent.
        </p>
      </header>

      {hydrated && count === 0 ? (
        <div className="x5c-empty">
          <p>The order slip is empty. Open a row of the catalogue and add a piece; it will be waiting here.</p>
          <Link href="/d/05#catalogue" className="x5c-emptyLink">
            Open the catalogue
          </Link>
        </div>
      ) : (
        <>
          <aside id="order" className="x5c-summary" aria-label="Your order">
            <div className="x5c-summaryInner">
              <p className="x5c-summaryHead">
                <span>Your order</span>
                <button type="button" className="x5-textBtn" onClick={() => slipFlag.set(true)}>
                  Edit on the slip
                </button>
              </p>
              {hydrated && <SlipLines lines={lines} />}
              <dl className="x5-totals">
                <div>
                  <dt>Subtotal</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
                <div>
                  <dt>Delivery in India</dt>
                  <dd>To be confirmed</dd>
                </div>
                {gift && (
                  <div>
                    <dt>Gift</dt>
                    <dd>Message card included</dd>
                  </div>
                )}
                <div className="x5-totalRow">
                  <dt>Total</dt>
                  <dd>{formatINR(subtotal)}</dd>
                </div>
              </dl>
            </div>
          </aside>

          <form className="x5c-form" onSubmit={submit}>
            <fieldset id="contact" className="x5c-set">
              <legend className="x5c-legend">
                <span className="x5c-legendN">1</span>Contact
              </legend>
              <div className="x5c-fields">
                <Field label="Full name" name="name" autoComplete="name" required wide />
                <Field label="Email" name="email" type="email" autoComplete="email" required />
                <Field
                  label="Mobile"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  pattern="(\+91)? ?[6-9][0-9]{9}"
                  title="A ten-digit Indian mobile number"
                  hint="Ten digits, for the courier"
                  required
                />
              </div>
            </fieldset>

            <fieldset id="delivery" className="x5c-set">
              <legend className="x5c-legend">
                <span className="x5c-legendN">2</span>Delivery in India
              </legend>
              <div className="x5c-fields">
                <Field label="Address" name="address1" autoComplete="address-line1" required wide />
                <Field label="Area or landmark" name="address2" autoComplete="address-line2" wide />
                <Field label="City" name="city" autoComplete="address-level2" required />
                <Field
                  label="PIN code"
                  name="pin"
                  autoComplete="postal-code"
                  inputMode="numeric"
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  title="A six-digit PIN code"
                  required
                />
                <div className={`x5c-field x5c-wide`}>
                  <label htmlFor="co-state" className="x5c-label">
                    State or union territory
                  </label>
                  <select id="co-state" name="state" className={`x5c-input x5c-select`} required defaultValue="">
                    <option value="" disabled>
                      Choose one
                    </option>
                    {STATES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </fieldset>

            <fieldset id="gift" className="x5c-set">
              <legend className="x5c-legend">
                <span className="x5c-legendN">3</span>Gift
              </legend>
              <label className="x5c-check">
                <input type="checkbox" name="gift" checked={gift} onChange={(e) => setGift(e.target.checked)} />
                <span>This is a gift. Add a card with my message.</span>
              </label>
              <AnimatePresence initial={false}>
                {gift && (
                  <motion.div
                    className="x5c-giftMore"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE }}
                  >
                    <div className="x5c-giftInner">
                      <label htmlFor="co-message" className="x5c-label">
                        Message for the card
                      </label>
                      <textarea id="co-message" name="message" className={`x5c-input x5c-textarea`} rows={3} maxLength={240} />
                      <label className="x5c-check">
                        <input type="checkbox" name="hidePrices" />
                        <span>Leave the prices off the slip.</span>
                      </label>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </fieldset>

            <fieldset id="review" className="x5c-set">
              <legend className="x5c-legend">
                <span className="x5c-legendN">4</span>Review and place
              </legend>
              <p className="x5c-review">
                You are placing a preview order for {count} {count === 1 ? "piece" : "pieces"}, {formatINR(subtotal)} before delivery.
                In the finished site, payment would follow on the next step.
              </p>
              <button type="submit" className="x5c-place" disabled={!hydrated || count === 0}>
                <span>Place preview order</span>
                <span>{formatINR(subtotal)}</span>
              </button>
              <p className="x5c-fine">Preview: payments are not connected yet.</p>
            </fieldset>
          </form>
        </>
      )}
    </div>
  );
}

function Confirmation({ order }: { order: Placed }) {
  const first = order.name.split(" ")[0] || "and welcome";
  return (
    <motion.div
      className="x5c-wrap"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: EASE }}
    >
      <header id="checkout" className="x5c-head">
        <p className="x5c-kicker">
          <span>Order noted</span>
          <span>{order.ref}</span>
        </p>
        <h1 className="x5c-title">Thank you, {first}.</h1>
        <p className="x5c-notice" role="note">
          <b>Preview: payments are not connected yet.</b> Nothing has been charged. In the finished site a confirmation would go to{" "}
          {order.email}, and the pieces would be sent to {order.city}.
        </p>
      </header>
      <div className="x5c-done">
        <div className="x5c-doneSlip">
          <p className="x5c-summaryHead">
            <span>Preview order {order.ref}</span>
          </p>
          <SlipLines lines={order.lines} />
          <dl className="x5-totals">
            <div className="x5-totalRow">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
          {order.gift && <p className="x5c-fine">Sent as a gift, with your card{order.hidePrices ? " and no prices on the slip" : ""}.</p>}
        </div>
        <div className="x5c-doneNext">
          <p>Each piece will leave the workshop with its batch record. The bag has been cleared.</p>
          <Link href="/d/05" className="x5c-emptyLink">
            Back to the index
          </Link>
          <Link href="/d/05#circle" className="x5c-emptyLink">
            Join the Santalum Circle
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
