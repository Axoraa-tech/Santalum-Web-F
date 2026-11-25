"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { saveAddress, signOut, useUser, type User } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import k from "../k";
import { Check, Stretch, Thumb } from "./bits";
import { AddressForm, AddressLines, AuthPanel, PREVIEW_ACCOUNTS, Submit, type AddressDraft } from "./forms";
import { scrollToTop, splitName } from "./lib";

type StepId = 1 | 2 | 3 | 4;
const TITLES: Record<StepId, string> = { 1: "Account", 2: "Address", 3: "Delivery and payment", 4: "Review and place" };
const COD_LIMIT = 10000;

/**
 * Checkout in four steps, set as type: the open step's title is stretched wide, finished steps condense
 * to one line with a summary, the ones to come wait as hairlines. Signing in is required to place an order.
 */
export function Checkout() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [placed, setPlaced] = useState<Order | null>(null);

  if (!hydrated) {
    return (
      <div className={`${k.gut} min-h-[80svh] pb-16 pt-24 md:pt-32`}>
        <Stretch text="Checkout" cap={0.3} />
        <p className={`${k.mono} mt-6 text-[var(--k10-grey)]`}>Opening your bag</p>
      </div>
    );
  }
  if (placed) return <Confirmation order={placed} />;
  if (!bagSummary(lines).count) return <Empty />;
  return <Flow user={user} onPlaced={setPlaced} key={user?.id ?? "guest"} />;
}

function Empty() {
  const wood = useWood();
  return (
    <div className={`${k.gut} flex min-h-[78svh] flex-col justify-center pb-16 pt-28`}>
      <Stretch text="Bag empty" cap={0.3} />
      <p className={`${k.monoL} mt-6 max-w-[52ch]`}>
        {wood === "red"
          ? "Nothing to check out yet. The shop holds 26 pieces turned from red heartwood: malas, objects, powder, gifting and jewellery."
          : "Nothing to check out yet. The shop holds 26 pieces in white sandalwood: oil, attar, incense, chandan and Mysuru carving."}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <Link href="/d/10/shop" className={k.btn}>
          <span className={k.btnLabel}>Go to the shop</span>
        </Link>
        <Link href="/d/10/track" className={`${k.mono} ${k.link}`}>
          Track an order instead
        </Link>
      </div>
    </div>
  );
}

function Flow({ user, onPlaced }: { user: User | null; onPlaced: (o: Order) => void }) {
  const lines = useBag();
  const [step, setStep] = useState<StepId>(user ? (user.addresses.length ? 3 : 2) : 1);
  const def = user?.addresses.find((a) => a.isDefault) ?? user?.addresses[0];
  const [addrId, setAddrId] = useState<string | "new">(def?.id ?? "new");
  const [draft, setDraft] = useState<AddressDraft | null>(null);
  const [save, setSave] = useState(true);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const sum = bagSummary(lines, delivery);
  const promo = code ? applyCoupon(code, sum.subtotal) : null;
  const discount = promo?.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const codOk = total < COD_LIMIT;
  const applyCode = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCode(codeInput.trim().toUpperCase());
  };
  const pay = payment === "cod" && !codOk ? "upi" : payment;

  const saved = user?.addresses.find((a) => a.id === addrId);
  const address: AddressDraft | null = saved ?? (addrId === "new" ? draft : null);

  const place = () => {
    if (!address) {
      setStep(2);
      return;
    }
    const { label, name, phone, line1, line2, city, state, pin } = address;
    const r = placeOrder({ lines, address: { label, name, phone, line1, line2, city, state, pin }, delivery, payment: pay, giftNote: gift.trim() || undefined, coupon: promo?.ok ? promo.code : undefined });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onPlaced(r.order);
    scrollToTop();
  };

  const summary: Record<StepId, ReactNode> = {
    1: user ? `${user.name}, ${user.email}` : null,
    2: address ? `${address.name}, ${address.city} ${address.pin}` : null,
    3: `${delivery === "express" ? "Express" : "Standard"}, ${PAYMENTS.find((x) => x.id === pay)?.label}${gift.trim() ? ", with a gift note" : ""}`,
    4: null,
  };
  const can = (s: StepId) => s === 1 || (!!user && (s === 2 || !!address));

  return (
    <div className="pb-16 pt-24 md:pt-32">
      <div className={k.gut}>
        <Stretch text="Checkout" cap={0.3} />
        <p className={`${k.mono} mt-5 text-[var(--k10-grey)]`}>
          {sum.count} {sum.count === 1 ? "piece" : "pieces"}, {formatINR(total)}.{" "}
          {user
            ? `Signed in as ${user.name.trim().split(/\s+/)[0]}: the order goes into your account, and you can follow it from there.`
            : "Sign in or create an account to place the order, so you can follow it afterwards."}
        </p>
      </div>

      <div className={`${k.gut} mt-10 grid grid-cols-1 gap-14 md:mt-14 lg:grid-cols-12 lg:gap-10`}>
        <div className="min-w-0 lg:col-span-7">
          {([1, 2, 3, 4] as StepId[]).map((s) => (
            <Step
              key={s}
              n={s}
              title={TITLES[s]}
              state={s === step ? "current" : s < step && can(s) ? "done" : "todo"}
              summary={s < step ? summary[s] : null}
              onOpen={can(s) && s !== step && s < step ? () => setStep(s) : undefined}
            >
              {s === 1 &&
                (user ? (
                  <div className="space-y-6">
                    <p className={`${k.monoL}`}>
                      Signed in as {user.name}. Not you?{" "}
                      <button type="button" onClick={signOut} className={`${k.link} underline`}>
                        Sign out
                      </button>
                    </p>
                    <button type="button" onClick={() => setStep(user.addresses.length ? 3 : 2)} className={`${k.btn} w-full`}>
                      <span className={k.btnLabel}>Continue to the address</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className={`${k.monoL} mb-8 max-w-[56ch]`}>
                      An account keeps your addresses and lets you follow the order to your door. The bag stays as it is while you sign in.
                    </p>
                    <AuthPanel idBase="k10-co-auth" big={false} />
                  </div>
                ))}

              {s === 2 && user && (
                <div className="space-y-8">
                  {user.addresses.length > 0 && (
                    <fieldset>
                      <legend className={`${k.mono} text-[var(--k10-grey)]`}>Deliver to</legend>
                      <div className="mt-2 border-b border-[var(--k10-line)]">
                        {user.addresses.map((a) => (
                          <label key={a.id} className={`${k.opt} grid-cols-[18px_minmax(0,1fr)] items-start gap-4 py-4`}>
                            <input type="radio" name="k10-co-addr" checked={addrId === a.id} onChange={() => setAddrId(a.id)} />
                            <span className={`${k.optDot} mt-2`} aria-hidden />
                            <span className="min-w-0">
                              <span className={`${k.optName} block text-[length:clamp(28px,2.8vw,42px)]`}>
                                {a.label || "Address"}
                                {a.isDefault ? <span className={`${k.mono} ml-2 align-middle text-[var(--k10-grey)]`}>default</span> : null}
                              </span>
                              <span className={`${k.monoL} mt-1 block`}>
                                <AddressLines a={a} />
                              </span>
                            </span>
                          </label>
                        ))}
                        <label className={`${k.opt} grid-cols-[18px_minmax(0,1fr)] items-center gap-4 py-4`}>
                          <input type="radio" name="k10-co-addr" checked={addrId === "new"} onChange={() => setAddrId("new")} />
                          <span className={k.optDot} aria-hidden />
                          <span className={`${k.optName} text-[length:clamp(28px,2.8vw,42px)]`}>A new address</span>
                        </label>
                      </div>
                    </fieldset>
                  )}
                  {addrId === "new" ? (
                    <AddressForm
                      initial={draft ?? { label: "Home", name: user.name, phone: user.phone, line1: "", line2: "", city: "", state: "", pin: "" }}
                      submitLabel="Use this address"
                      extra={<Check checked={save} onChange={(e) => setSave(e.target.checked)} label="Save this address" note="It will be in your account for next time." />}
                      onSubmit={(a) => {
                        if (save) {
                          const s2 = saveAddress({ ...a, isDefault: user.addresses.length === 0 });
                          setAddrId(s2.id);
                          setDraft(null);
                        } else {
                          setDraft(a);
                        }
                        setStep(3);
                      }}
                    />
                  ) : (
                    <button type="button" onClick={() => setStep(3)} className={`${k.btn} w-full`}>
                      <span className={k.btnLabel}>Deliver here</span>
                    </button>
                  )}
                </div>
              )}

              {s === 3 && (
                <div className="space-y-10">
                  <fieldset>
                    <legend className={`${k.mono} text-[var(--k10-grey)]`}>Delivery</legend>
                    <div className="mt-2 border-b border-[var(--k10-line)]">
                      {Object.values(DELIVERY).map((d) => (
                        <label key={d.id} className={`${k.opt} grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-4 py-3`}>
                          <input type="radio" name="k10-co-del" checked={delivery === d.id} onChange={() => setDelivery(d.id)} />
                          <span className={k.optDot} aria-hidden />
                          <span className="min-w-0">
                            <span className={`${k.optName} block text-[length:clamp(28px,2.8vw,42px)]`}>{d.id === "express" ? "Express" : "Standard"}</span>
                            <span className={`${k.mono} block text-[var(--k10-grey)]`}>{d.label}</span>
                          </span>
                          <span className={`${k.monoL} tabular-nums`}>{d.price ? formatINR(d.price) : "Free"}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <fieldset>
                    <legend className={`${k.mono} text-[var(--k10-grey)]`}>Payment</legend>
                    <p className={`${k.mono} mt-1`}>Payments are not connected yet, so no money is taken.</p>
                    <div className="mt-2 border-b border-[var(--k10-line)]">
                      {PAYMENTS.map((pm) => {
                        const off = pm.id === "cod" && !codOk;
                        return (
                          <label key={pm.id} className={`${k.opt} grid-cols-[18px_minmax(0,1fr)] items-center gap-4 py-3`}>
                            <input type="radio" name="k10-co-pay" checked={pay === pm.id} disabled={off} onChange={() => setPayment(pm.id)} />
                            <span className={k.optDot} aria-hidden />
                            <span className="min-w-0">
                              <span className={`${k.optName} block text-[length:clamp(28px,2.8vw,42px)]`}>{pm.label}</span>
                              <span className={`${k.mono} block text-[var(--k10-grey)]`}>
                                {off ? `Only for orders under ${formatINR(COD_LIMIT)}; this one is ${formatINR(total)}.` : pm.note}
                              </span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <div>
                    <label htmlFor="k10-co-gift" className={`${k.mono} block text-[var(--k10-grey)]`}>
                      A gift note, optional. Prices are left off the slip when there is one.
                    </label>
                    <textarea
                      id="k10-co-gift"
                      maxLength={200}
                      rows={2}
                      value={gift}
                      onChange={(e) => setGift(e.target.value)}
                      placeholder="For you, from the heartwood."
                      className={`${k.field} resize-none !text-[length:clamp(22px,2.2vw,32px)]`}
                    />
                    <p className={`${k.mono} mt-1 text-right text-[var(--k10-grey)] tabular-nums`}>{gift.length} / 200</p>
                  </div>
                  <p className={`${k.mono} text-[var(--k10-grey)]`}>{PREVIEW_ACCOUNTS}</p>
                  <button type="button" onClick={() => setStep(4)} className={`${k.btn} w-full`}>
                    <span className={k.btnLabel}>Review the order</span>
                  </button>
                </div>
              )}

              {s === 4 && address && (
                <div className="space-y-8">
                  <dl className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2">
                    <div>
                      <dt className={`${k.mono} text-[var(--k10-grey)]`}>To</dt>
                      <dd className={`${k.monoL} mt-1`}>
                        <AddressLines a={address} />
                      </dd>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <dt className={`${k.mono} text-[var(--k10-grey)]`}>Delivery</dt>
                        <dd className={`${k.monoL} mt-1`}>{DELIVERY[delivery].label}</dd>
                      </div>
                      <div>
                        <dt className={`${k.mono} text-[var(--k10-grey)]`}>Payment</dt>
                        <dd className={`${k.monoL} mt-1`}>{PAYMENTS.find((x) => x.id === pay)?.label}, not charged in this preview</dd>
                      </div>
                      {gift.trim() && (
                        <div>
                          <dt className={`${k.mono} text-[var(--k10-grey)]`}>Gift note</dt>
                          <dd className={`${k.monoL} mt-1`}>{gift.trim()}</dd>
                        </div>
                      )}
                    </div>
                  </dl>
                  {error && (
                    <p role="alert" className={k.err}>
                      {error}
                    </p>
                  )}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      place();
                    }}
                  >
                    <Submit note={formatINR(total)}>Place the order</Submit>
                  </form>
                </div>
              )}
            </Step>
          ))}
        </div>

        <aside aria-label="Order summary" className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <Summary items={sum.items} subtotal={sum.subtotal} shipping={sum.shipping} total={total} discount={discount} code={promo?.ok ? promo.code : undefined} />
            <form onSubmit={applyCode} noValidate className="mt-8 border-t border-[var(--k10-ink)] pt-4">
              <label htmlFor="k10-co-code" className={`${k.mono} block text-[var(--k10-grey)]`}>
                A code from the Circle
              </label>
              <div className="flex items-end gap-3">
                <input
                  id="k10-co-code"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  placeholder="WELCOME10"
                  aria-invalid={promo && !promo.ok ? true : undefined}
                  aria-describedby="k10-co-code-n"
                  className={`${k.field} min-w-0 flex-1 uppercase tabular-nums`}
                />
                {code && promo?.ok ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCode("");
                      setCodeInput("");
                    }}
                    data-ghost
                    className={k.mini}
                  >
                    Remove
                  </button>
                ) : (
                  <button type="submit" className={k.mini}>
                    Apply
                  </button>
                )}
              </div>
              <p id="k10-co-code-n" className={`${promo && !promo.ok ? k.err : `${k.mono} text-[var(--k10-grey)]`} mt-2`} aria-live="polite">
                {promo ? (promo.ok ? `${promo.code}: ${promo.label}. You save ${formatINR(promo.discount)}.` : promo.error) : "Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15."}
              </p>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

/** A step: the number condensed, the title stretched when open, condensed with a summary when done, hairline when to come. */
function Step({
  n,
  title,
  state,
  summary,
  onOpen,
  children,
}: {
  n: StepId;
  title: string;
  state: "current" | "done" | "todo";
  summary: ReactNode;
  onOpen?: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`k10-co-step-${n}`} aria-current={state === "current" ? "step" : undefined} className="border-t border-[var(--k10-ink)] pb-8 pt-4">
      <div className="grid grid-cols-[2.6rem_minmax(0,1fr)_auto] items-baseline gap-x-3 md:grid-cols-[4.5rem_minmax(0,1fr)_auto]">
        <p aria-hidden className={`${k.disp} text-[44px] leading-[0.8] text-[var(--k10-grey)] [font-variation-settings:'wdth'_50,'wght'_300] md:text-[64px]`}>
          {n}
        </p>
        <h2
          id={`k10-co-step-${n}`}
          data-state={state === "todo" ? undefined : state}
          className={`${k.stage} whitespace-normal text-[length:clamp(30px,4.4vw,72px)]`}
        >
          {title}
        </h2>
        {onOpen && (
          <button type="button" onClick={onOpen} className={`${k.mono} ${k.link}`} aria-label={`Change ${title.toLowerCase()}`}>
            Change
          </button>
        )}
      </div>
      {summary && state === "done" && <p className={`${k.mono} mt-2 pl-[2.6rem] text-[var(--k10-grey)] md:pl-[4.5rem]`}>{summary}</p>}
      {state === "current" && <div className="mt-8 md:pl-[4.5rem]">{children}</div>}
    </section>
  );
}

function Summary({ items, subtotal, shipping, total, discount = 0, code }: { items: BagItem[]; subtotal: number; shipping: number; total: number; discount?: number; code?: string }) {
  return (
    <>
      <p className={`${k.mono} text-[var(--k10-grey)]`}>In the bag</p>
      <ul className="mt-3 border-t border-[var(--k10-ink)]">
        {items.map((it) => (
          <li key={it.key} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-[var(--k10-line)] py-3">
            <Thumb p={it.product} sizes="90px" className="h-[44px] w-[76px]" />
            <div className="min-w-0">
              <p className={`${k.disp} truncate text-[length:clamp(26px,2.6vw,40px)] leading-[0.9] [font-variation-settings:'wdth'_58,'wght'_800]`}>
                {splitName(it.product.name).head}
              </p>
              <p className={`${k.mono} mt-1 text-[var(--k10-grey)]`}>
                {[CONTENT[it.product.wood].short, it.optionValue?.label, `quantity ${it.qty}`].filter(Boolean).join(", ")}
              </p>
            </div>
            <p className={`${k.monoL} tabular-nums`}>{formatINR(it.total)}</p>
          </li>
        ))}
      </ul>
      <dl className="mt-4">
        <div className="flex justify-between border-b border-[var(--k10-line)] py-2">
          <dt className={`${k.mono} text-[var(--k10-grey)]`}>Subtotal</dt>
          <dd className={`${k.monoL} tabular-nums`}>{formatINR(subtotal)}</dd>
        </div>
        <div className="flex justify-between border-b border-[var(--k10-line)] py-2">
          <dt className={`${k.mono} text-[var(--k10-grey)]`}>Delivery in India</dt>
          <dd className={`${k.monoL} tabular-nums`}>{shipping ? formatINR(shipping) : "Free"}</dd>
        </div>
        {discount > 0 && (
          <div className="flex justify-between border-b border-[var(--k10-line)] py-2 text-[var(--k10-accent)]">
            <dt className={k.mono}>Code {code}</dt>
            <dd className={`${k.monoL} tabular-nums`}>−{formatINR(discount)}</dd>
          </div>
        )}
        <div className="flex items-end justify-between pt-4">
          <dt className={`${k.mono} pb-2`}>Total</dt>
          <dd className={`${k.disp} text-[length:clamp(52px,6vw,96px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_840]`}>{formatINR(total)}</dd>
        </div>
      </dl>
    </>
  );
}

function Confirmation({ order }: { order: Order }) {
  const first = order.name.trim().split(/\s+/)[0];
  const t = trackingFor(order, order.placedAt);
  return (
    <div className={`${k.gut} pb-20 pt-24 md:pt-32`}>
      <p className={`${k.mono} text-[var(--k10-grey)]`}>Thank you{first ? `, ${first}` : ""}. The order is placed.</p>
      <Stretch text={order.id} cap={0.3} className="mt-3" tnum />
      <div className="mt-10 grid grid-cols-1 gap-12 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(30px,3.2vw,50px)] leading-[0.95] [font-variation-settings:'wdth'_80,'wght'_640]`}>
            Expected between {formatDate(t.estimate.from)} and {formatDate(t.estimate.to)}, to {order.address.city}.
          </p>
          <p className={`${k.monoL} mt-6 max-w-[54ch]`}>
            {DELIVERY[order.delivery].label}. Paid by {PAYMENTS.find((x) => x.id === order.payment)?.label}: payments are not connected yet, so no money was
            taken. {PREVIEW_ACCOUNTS}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={`/d/10/track?o=${order.id}`} className={`${k.btn} sm:flex-1`}>
              <span className={k.btnLabel}>Track this order</span>
            </Link>
            <Link href="/d/10/account" className={`${k.btn} ${k.ghost} sm:flex-1`}>
              <span className={k.btnLabel}>Your orders</span>
            </Link>
          </div>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <p className={`${k.mono} text-[var(--k10-grey)]`}>Order {order.id}, placed {formatDate(order.placedAt, true)}</p>
          <ul className="mt-3 border-t border-[var(--k10-ink)]">
            {order.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 border-b border-[var(--k10-line)] py-3">
                <div className="min-w-0">
                  <p className={`${k.disp} truncate text-[length:clamp(26px,2.6vw,40px)] leading-[0.9] [font-variation-settings:'wdth'_58,'wght'_800]`}>{splitName(l.name).head}</p>
                  <p className={`${k.mono} mt-1 text-[var(--k10-grey)]`}>{[CONTENT[l.wood].short, l.optionLabel, `quantity ${l.qty}`].filter(Boolean).join(", ")}</p>
                </div>
                <p className={`${k.monoL} tabular-nums`}>{formatINR(l.unitPrice * l.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-end justify-between">
            <p className={`${k.mono} pb-2`}>
              Total{order.shipping ? `, with express ${formatINR(order.shipping)}` : ""}
              {order.discount ? (
                <span className="block text-[var(--k10-accent)]">
                  {order.coupon} saved {formatINR(order.discount)}
                </span>
              ) : null}
            </p>
            <p className={`${k.disp} text-[length:clamp(44px,5vw,80px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_840]`}>{formatINR(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
