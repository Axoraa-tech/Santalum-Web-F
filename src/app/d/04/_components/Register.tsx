"use client";

import Link from "next/link";
import { useId, useState, type ReactNode } from "react";
import { WT } from "@/components/maison/W";
import { saveAddress, signOut, useUser, type Address } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR, productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { r } from "./cls";
import { Pic, picOf } from "./plates";
import { AddressForm, AddressLines, PREVIEW_NOTE, SignInForm, SignUpForm, type AddressInput } from "./forms";
import { accession, openLedger } from "./store";
import { cx, OrderNo } from "./ui";

const COD_LIMIT = 10000;
const strip = (a: Address): AddressInput => ({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin });

/** Checkout as the museum's acquisition register: four parts, filled in order, one entry at the end. */
export function Register() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [step, setStep] = useState<2 | 3 | 4>(2);
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [authTab, setAuthTab] = useState<"in" | "up">("up");
  const giftId = useId();
  const codeId = useId();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState("");
  const [codeErr, setCodeErr] = useState("");

  const sum = bagSummary(lines, delivery);
  // the code is re-checked against the bag every time, so a smaller bag can lose it
  const promo = applied ? applyCoupon(applied, sum.subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const codBlocked = total >= COD_LIMIT;
  const apply = () => {
    if (!code.trim()) return setCodeErr("Enter a code first.");
    const res = applyCoupon(code, sum.subtotal);
    if (!res.ok) {
      setCodeErr(res.error);
      return;
    }
    setApplied(res.code);
    setCodeErr("");
    setCode("");
  };
  const active = !user ? 1 : step;
  const saved = user?.addresses ?? [];
  const chosen = picked ?? saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? "new";

  const place = () => {
    if (!address) return;
    const res = placeOrder({ lines, address, delivery, payment, giftNote: gift.trim() || undefined, coupon: promo?.ok ? promo.code : undefined });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError("");
    setPlaced(res.order);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={r.reg}>
      <header className={r.head}>
        <div>
          <h1 className={r.title}>
            Acquisition <i>register</i>
          </h1>
          <p className={r.lede}>
            {placed
              ? "Your order is written in the register."
              : "One entry for the pieces in your ledger: who acquires them, where they go, how they travel and how they are paid for."}
          </p>
        </div>
        <p className={r.notice} role="note">
          <b>Payments are not connected yet.</b>
          Placing the order here takes no money. It shows how the order will be taken, and it can be tracked.
        </p>
      </header>

      {placed ? (
        <Confirmation order={placed} />
      ) : !hydrated ? (
        <div className="min-h-[60svh]" aria-hidden="true" />
      ) : sum.count === 0 ? (
        <div className={r.emptyReg}>
          <div className={r.emptyBook} aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <p className={r.asideTitle}>The ledger is empty.</p>
            <p className={r.emptyText}>
              <WT
                red={`Nothing has been acquired on this visit yet. The red shop holds all ${productsFor("red").length} pieces, each with its batch record.`}
                white={`Nothing has been acquired on this visit yet. The white shop holds all ${productsFor("white").length} pieces, each with its lot.`}
              />
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/d/04/shop" className={r.submitSm}>
                Visit the shop
              </Link>
              <Link href="/d/04#collection" className={r.btnLine}>
                Walk to the gallery
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className={r.grid}>
          <div className={r.book}>
            {/* 1. Account */}
            <Part no="1" name="The member" state={active === 1 ? "open" : "done"}>
              {user ? (
                <p className={r.summary}>
                  Signed in as <b>{user.name}</b>. Not you?{" "}
                  <button
                    type="button"
                    className={r.link}
                    onClick={() => {
                      signOut();
                      setStep(2);
                      setAddress(null);
                      setPicked(null);
                    }}
                  >
                    Sign out
                  </button>
                </p>
              ) : (
                <>
                  <p className={r.partLede}>
                    An order needs a member, so it can be tracked and found again. Sign in, or create an account here; your
                    bag stays as it is.
                  </p>
                  <div className={r.tabs} role="tablist" aria-label="Sign in or create an account">
                    <button type="button" role="tab" aria-selected={authTab === "up"} onClick={() => setAuthTab("up")}>
                      New here
                    </button>
                    <button type="button" role="tab" aria-selected={authTab === "in"} onClick={() => setAuthTab("in")}>
                      I have an account
                    </button>
                  </div>
                  <div role="tabpanel">
                    {authTab === "up" ? <SignUpForm submitLabel="Create my account and continue" /> : <SignInForm submitLabel="Sign in and continue" />}
                  </div>
                </>
              )}
            </Part>

            {/* 2. Address */}
            <Part no="2" name="Delivery in India" state={active < 2 ? "locked" : active === 2 ? "open" : "done"}>
              {active < 2 ? (
                <p className={r.locked}>Opens once you are signed in.</p>
              ) : active > 2 && address ? (
                <div className={r.summaryRow}>
                  <AddressLines a={address} />
                  <button type="button" className={r.link} onClick={() => setStep(2)}>
                    Change
                  </button>
                </div>
              ) : (
                <>
                  {saved.length > 0 && (
                    <fieldset className={r.choices}>
                      <legend className="sr-only">Choose a saved address</legend>
                      {saved.map((a) => (
                        <label key={a.id} className={r.choice}>
                          <input type="radio" name="addr" checked={chosen === a.id} onChange={() => setPicked(a.id)} />
                          <span>
                            <b>
                              {a.label}
                              {a.isDefault ? <em>Default</em> : null}
                            </b>
                            <AddressLines a={strip(a)} />
                          </span>
                        </label>
                      ))}
                      <label className={r.choice}>
                        <input type="radio" name="addr" checked={chosen === "new"} onChange={() => setPicked("new")} />
                        <span>
                          <b>A new address</b>
                        </span>
                      </label>
                    </fieldset>
                  )}
                  {chosen === "new" ? (
                    <AddressForm
                      key={user?.id}
                      initial={{ name: user?.name ?? "", phone: user?.phone ?? "" }}
                      submitLabel="Deliver here"
                      offerSave
                      onSubmit={(a, o) => {
                        if (o.save) {
                          const s = saveAddress({ ...a, isDefault: saved.length === 0 });
                          setPicked(s.id);
                        }
                        setAddress(a);
                        setStep(3);
                      }}
                    />
                  ) : (
                    <div className={r.formActions}>
                      <button
                        type="button"
                        className={r.submitSm}
                        onClick={() => {
                          const a = saved.find((x) => x.id === chosen);
                          if (!a) return;
                          setAddress(strip(a));
                          setStep(3);
                        }}
                      >
                        Deliver here
                      </button>
                    </div>
                  )}
                </>
              )}
            </Part>

            {/* 3. Delivery and payment */}
            <Part no="3" name="Delivery and payment" state={active < 3 ? "locked" : active === 3 ? "open" : "done"}>
              {active < 3 ? (
                <p className={r.locked}>Opens once the address is entered.</p>
              ) : active > 3 ? (
                <div className={r.summaryRow}>
                  <span>
                    {DELIVERY[delivery].label}
                    {DELIVERY[delivery].price ? `, ${formatINR(DELIVERY[delivery].price)}` : ", free"}. {PAYMENTS.find((p) => p.id === payment)?.label}.
                    {gift.trim() && <span className="block text-[var(--mute)]">With a gift note.</span>}
                  </span>
                  <button type="button" className={r.link} onClick={() => setStep(3)}>
                    Change
                  </button>
                </div>
              ) : (
                <>
                  <fieldset className={r.choices}>
                    <legend className={r.choicesLegend}>How it travels</legend>
                    {(Object.keys(DELIVERY) as DeliveryId[]).map((id) => (
                      <label key={id} className={r.choice}>
                        <input
                          type="radio"
                          name="delivery"
                          checked={delivery === id}
                          onChange={() => {
                            setDelivery(id);
                            if (payment === "cod" && bagSummary(lines, id).total - discount >= COD_LIMIT) setPayment("upi");
                          }}
                        />
                        <span>
                          <b>
                            {DELIVERY[id].label}
                            <em>{DELIVERY[id].price ? formatINR(DELIVERY[id].price) : "Free"}</em>
                          </b>
                          <small>{id === "standard" ? "Insured, signed for, wrapped in linen." : "The same packing, on the next flight out."}</small>
                        </span>
                      </label>
                    ))}
                  </fieldset>
                  <fieldset className={r.choices}>
                    <legend className={r.choicesLegend}>How it is paid for</legend>
                    {PAYMENTS.map((p) => {
                      const off = p.id === "cod" && codBlocked;
                      return (
                        <label key={p.id} className={r.choice} data-off={off ? "" : undefined}>
                          <input type="radio" name="payment" disabled={off} checked={payment === p.id} onChange={() => setPayment(p.id)} />
                          <span>
                            <b>{p.label}</b>
                            <small>{off ? `Only for orders under ${formatINR(COD_LIMIT)}.` : p.note}</small>
                          </span>
                        </label>
                      );
                    })}
                    <p className={r.payNote}>Payments are not connected yet, so no money is taken.</p>
                    <p className={r.fine}>{PREVIEW_NOTE}</p>
                  </fieldset>
                  <div className={cx(r.row, r.giftRow)}>
                    <label htmlFor={giftId}>Gift note</label>
                    <span className={r.giftCard}>
                      <textarea
                        id={giftId}
                        value={gift}
                        rows={3}
                        maxLength={240}
                        placeholder="Optional. A few words for the card."
                        aria-describedby={`${giftId}-n`}
                        onChange={(e) => setGift(e.target.value)}
                      />
                      <span id={`${giftId}-n`} className={r.giftCount}>
                        Copied by hand onto a card; no prices go in the parcel. {gift.length} of 240 letters.
                      </span>
                    </span>
                  </div>
                  <div className={r.formActions}>
                    <button type="button" className={r.submitSm} onClick={() => setStep(4)}>
                      Continue to the review
                    </button>
                  </div>
                </>
              )}
            </Part>

            {/* 4. Review */}
            <Part no="4" name="Review and place" state={active < 4 ? "locked" : "open"}>
              {active < 4 ? (
                <p className={r.locked}>The last page: read it through, then place the order.</p>
              ) : (
                <>
                  <dl className={r.review}>
                    <div>
                      <dt>Member</dt>
                      <dd>
                        {user?.name}, {user?.email}
                      </dd>
                    </div>
                    <div>
                      <dt>Deliver to</dt>
                      <dd>{address && <AddressLines a={address} />}</dd>
                    </div>
                    <div>
                      <dt>Travels</dt>
                      <dd>{DELIVERY[delivery].label}</dd>
                    </div>
                    <div>
                      <dt>Paid by</dt>
                      <dd>{PAYMENTS.find((p) => p.id === payment)?.label}, not charged in this preview</dd>
                    </div>
                    {gift.trim() && (
                      <div>
                        <dt>Gift note</dt>
                        <dd className="italic">{gift.trim()}</dd>
                      </div>
                    )}
                    {discount > 0 && promo?.ok && (
                      <div>
                        <dt>Code {promo.code}</dt>
                        <dd>{promo.label}, less {formatINR(discount)}</dd>
                      </div>
                    )}
                    <div className={r.reviewTotal}>
                      <dt>Total</dt>
                      <dd>{formatINR(total)}</dd>
                    </div>
                  </dl>
                  {error && (
                    <p className={r.formErr} role="alert">
                      {error}
                    </p>
                  )}
                  <button type="button" className={r.submit} onClick={place}>
                    Place the order, {formatINR(total)}
                  </button>
                  <p className={r.fine}>Payments are not connected yet, so no money is taken. {PREVIEW_NOTE}</p>
                </>
              )}
            </Part>
          </div>

          <aside className={r.aside} aria-label="Pieces entered">
            <div className={r.asideHead}>
              <h2 className={r.asideTitle}>Pieces entered</h2>
              <span className="text-[13px] text-[var(--mute)]">
                {sum.count} {sum.count === 1 ? "piece" : "pieces"}
              </span>
            </div>
            <ol className={r.entries}>
              {sum.items.map((l, i) => {
                const p = l.product;
                return (
                  <li key={l.key} className={r.entry}>
                    <span className={r.entryNo}>{i + 1}</span>
                    <span className={r.thumb}>
                      <Pic {...picOf(p)} sizes="56px" />
                    </span>
                    <span className="min-w-0">
                      <span className={`${r.entryName} block`}>{p.name}</span>
                      <span className={`${r.entryMeta} block`}>
                        {CONTENT[p.wood].name}
                        {l.optionValue ? `, ${l.optionValue.label}` : ""}, quantity {l.qty}
                      </span>
                      <span className={`${r.entryMeta} block`}>Accession {accession(p)}</span>
                    </span>
                    <span className={r.amount}>{formatINR(l.total)}</span>
                  </li>
                );
              })}
            </ol>
            <dl className={r.sums}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatINR(sum.subtotal)}</dd>
              </div>
              <div>
                <dt>{delivery === "express" ? "Express delivery" : "Delivery across India"}</dt>
                <dd>{sum.shipping ? formatINR(sum.shipping) : "Free"}</dd>
              </div>
              {discount > 0 && promo?.ok && (
                <div className={r.discount}>
                  <dt>
                    Code {promo.code}
                    <button type="button" className={r.link} onClick={() => setApplied("")}>
                      Remove
                    </button>
                  </dt>
                  <dd>−{formatINR(discount)}</dd>
                </div>
              )}
              <div className={r.total}>
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
            <div className={r.coupon}>
              <label htmlFor={codeId}>A code from the Circle</label>
              <div className={r.couponRow}>
                <input
                  id={codeId}
                  value={code}
                  autoComplete="off"
                  spellCheck={false}
                  placeholder="WELCOME10"
                  aria-invalid={codeErr ? true : undefined}
                  aria-describedby={`${codeId}-h${codeErr ? ` ${codeId}-e` : ""}`}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      apply();
                    }
                  }}
                />
                <button type="button" onClick={apply}>
                  Apply
                </button>
              </div>
              {codeErr && (
                <p id={`${codeId}-e`} className={r.err} role="alert">
                  {codeErr}
                </p>
              )}
              {promo && !promo.ok && (
                <p className={r.err} role="alert">
                  {applied}: {promo.error}
                </p>
              )}
              {promo?.ok && <p className={r.couponOk}>{promo.label}. Entered against this order.</p>}
              <p id={`${codeId}-h`} className={r.fine}>
                Preview codes: WELCOME10, CIRCLE500 (bags of ₹5,000 or more), HEARTWOOD15 (₹15,000 or more).
              </p>
            </div>
            <p className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
              <button type="button" className={r.link} onClick={openLedger}>
                Change quantities
              </button>
              <Link href="/d/04/shop" className={r.link}>
                Back to the shop
              </Link>
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Part({ no, name, state, children }: { no: string; name: string; state: "open" | "done" | "locked"; children: ReactNode }) {
  return (
    <section className={r.part} data-state={state} aria-label={`${no}. ${name}`}>
      <h2 className={r.legend}>
        <span className={r.partNo} aria-hidden="true">
          {no}
        </span>
        <span className={r.partName}>{name}</span>
        {state === "done" && <span className={r.tick}>Entered</span>}
      </h2>
      {children}
    </section>
  );
}

function Confirmation({ order }: { order: Order }) {
  const est = trackingFor(order, order.placedAt).estimate;
  return (
    <div className={r.done}>
      <div>
        <p className="text-[15px] text-[var(--mute)]">Order number</p>
        <p className={r.doneNo}>
          <OrderNo id={order.id} />
        </p>
        <p className="mt-5 max-w-[34em] text-[17px]">
          Thank you, {order.name.split(" ")[0]}. The pieces below are entered against your name, and the workshop has the
          order.
        </p>
        <p className={cx(r.estimate, "mt-5")}>
          <span>Expected</span>
          {formatDate(est.from)} to {formatDate(est.to)}
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link href={`/d/04/track?o=${order.id}`} className={r.submitSm}>
            Track this order
          </Link>
          <Link href="/d/04/account" className={r.btnLine}>
            Your orders
          </Link>
        </div>
        <p className="mt-4 max-w-[34em] text-[14px] text-[var(--mute)]">Payments are not connected yet, so no money was taken. {PREVIEW_NOTE}</p>
      </div>
      <div className={r.card}>
        <dl>
          <div>
            <dt>Pieces</dt>
            <dd>
              {order.lines.map((l) => (
                <span key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="block">
                  {l.name}
                  {l.optionLabel ? `, ${l.optionLabel}` : ""}
                  {l.qty > 1 ? `, ${l.qty}` : ""}
                </span>
              ))}
            </dd>
          </div>
          <div>
            <dt>Deliver to</dt>
            <dd>
              <AddressLines a={order.address} />
            </dd>
          </div>
          <div>
            <dt>Travels</dt>
            <dd>{DELIVERY[order.delivery].label}</dd>
          </div>
          {order.giftNote && (
            <div>
              <dt>Gift note</dt>
              <dd className="italic">{order.giftNote}</dd>
            </div>
          )}
          {order.discount ? (
            <div>
              <dt>Code {order.coupon}</dt>
              <dd>Less {formatINR(order.discount)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Total</dt>
            <dd className={r.cardTotal}>{formatINR(order.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
