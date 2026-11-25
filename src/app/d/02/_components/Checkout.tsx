"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { saveAddress, signOut, useUser, type Address } from "@/lib/shop/account";
import { DELIVERY, bagSummary, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { COUPONS, PAYMENTS, applyCoupon, formatDate, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { featured, formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import { AddressForm, type AddressDraft } from "./AddressForm";
import { AuthPanel } from "./AuthForms";
import { ACCOUNT, EASE, PREVIEW_ACCOUNTS, PREVIEW_PAYMENTS, SHOP, WOOD_LABEL, splitName, trackHref } from "./copy";
import { ProductDisc } from "./ProductDisc";
import { StageRing } from "./StageDial";
import { s } from "./cls";
import { CheckIcon, CloseIcon, Loader, PillLink, RadioDot } from "./ui";

const STEPS = ["Account", "Address", "Delivery", "Review"] as const;
const draftOf = (a: Address): AddressDraft => ({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin });

/** Circular step markers joined by arcs. The current step's ring draws itself. */
function Markers({ step, done, go, locked }: { step: number; done: number; go: (i: number) => void; locked: boolean }) {
  const C = 2 * Math.PI * 25;
  return (
    <ol className="flex items-start" aria-label="Checkout steps">
      {STEPS.map((label, i) => {
        const isDone = i < done && !(locked && i > 0);
        const on = i === step;
        const reachable = i <= done && !(locked && i > 0);
        return (
          <li key={label} className="flex items-start">
            <button type="button" disabled={!reachable} onClick={() => go(i)} aria-current={on ? "step" : undefined} className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed">
              <span className="relative grid size-[58px] place-items-center">
                <svg viewBox="0 0 58 58" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="29" cy="29" r="25" fill={isDone && !on ? "var(--o-ink)" : "var(--o-card)"} stroke="var(--o-line)" strokeWidth="1.5" />
                  <circle cx="29" cy="29" r="25" fill="none" stroke="var(--m-accent)" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={on ? 0 : C} style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }} />
                </svg>
                <span className={`relative text-[15px] font-bold tabular-nums ${isDone && !on ? "text-white" : "text-[var(--o-ink)]"}`}>{isDone && !on ? <CheckIcon className="size-5" /> : i + 1}</span>
              </span>
              <span className={`text-[13px] font-semibold ${on ? "text-[var(--o-ink)]" : "text-[var(--o-muted)]"} group-enabled:group-hover:text-[var(--o-ink)]`}>{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <svg viewBox="0 0 60 24" className="mx-1 mt-2 w-[clamp(18px,6vw,64px)]" aria-hidden>
                <path d="M2 22 Q30 -6 58 22" fill="none" stroke={i < done ? "var(--o-ink)" : "var(--o-line)"} strokeWidth="1.5" strokeDasharray={i < done ? "0" : "3 4"} />
              </svg>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function Line({ it }: { it: { name: string; wood: "red" | "white"; option?: string; qty: number; total: number; photo: BagItem["product"]["shots"][number] } }) {
  return (
    <li className="flex items-center gap-4 py-3">
      <span className="relative size-14 shrink-0">
        <span className="absolute inset-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
          <Photo p={it.photo.photo} tone={it.photo.tone} sizes="56px" />
        </span>
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--o-ink)] text-[11px] font-bold text-white ring-2 ring-[var(--o-card)]">{it.qty}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={`${s.syne} block text-[15px] font-bold leading-tight`}>{splitName(it.name)[0]}</span>
        <span className="block text-[13px] text-[var(--o-muted)]">
          {WOOD_LABEL[it.wood]}
          {it.option ? `, ${it.option}` : ""}
        </span>
      </span>
      <span className="text-[14px] font-semibold tabular-nums">{formatINR(it.total)}</span>
    </li>
  );
}

const itemLine = (i: BagItem) => ({ name: i.product.name, wood: i.product.wood, option: i.optionValue?.label, qty: i.qty, total: i.total, photo: i.product.shots[0] });

function Confirmation({ order }: { order: Order }) {
  const reduced = !!useReducedMotion();
  const est = trackingFor(order, order.placedAt).estimate;
  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
        <motion.div className="relative grid size-[180px] place-items-center" initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8, ease: EASE }}>
          <span className={`absolute inset-0 rounded-full ${s.seal}`} />
          <span className="relative grid size-[96px] place-items-center rounded-full bg-[var(--o-card)] text-[var(--o-ink)] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]">
            <CheckIcon className="size-10" />
          </span>
        </motion.div>
        <h1 className={`${s.display} mt-10 text-[clamp(2.8rem,6vw,5rem)]`}>Thank you, {order.name.split(" ")[0]}.</h1>
        <p className="mt-5 text-[17px] leading-relaxed text-[var(--o-ink-2)]">
          Order <span className="font-semibold tabular-nums text-[var(--o-ink)]">{order.id}</span> is placed. It should reach {order.address.city} between {formatDate(est.from)} and {formatDate(est.to)}.
        </p>
        <div className="mt-8 flex items-center gap-4 rounded-full border border-[var(--o-line)] p-2 pr-6 text-left">
          <StageRing current={0} />
          <span className="text-[15px] leading-snug">
            <span className="block font-semibold">Order placed</span>
            <span className="block text-[var(--o-muted)]">{formatDate(order.placedAt, true)}</span>
          </span>
        </div>
        <ul className="mt-10 w-full max-w-[460px] divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] text-left">
          {order.lines.map((l) => {
            const photo = { photo: { id: l.photoId, alt: l.name } };
            return <Line key={l.slug + (l.option ?? "") + (l.note ?? "")} it={{ name: l.name, wood: l.wood, option: l.optionLabel, qty: l.qty, total: l.unitPrice * l.qty, photo }} />;
          })}
        </ul>
        <p className="mt-4 text-[15px]">
          Total <span className="font-semibold tabular-nums">{formatINR(order.total)}</span>
          {order.coupon && (
            <span className="text-[var(--m-accent)]">
              {" "}
              ({order.coupon} saved {formatINR(order.discount ?? 0)})
            </span>
          )}
        </p>
        <p className="mt-3 rounded-full bg-[var(--o-stone)] px-5 py-2 text-[14px] text-[var(--o-ink-2)]">{PREVIEW_PAYMENTS}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <PillLink href={trackHref(order.id)}>Track this order</PillLink>
          <Link href={ACCOUNT} className="inline-flex h-14 items-center rounded-full border border-[var(--o-ink)] px-7 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
            Your orders
          </Link>
        </div>
      </div>
    </section>
  );
}

function EmptyBag() {
  const wood = useWood();
  return (
    <section className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1000px] text-center">
        <h1 className={`${s.display} text-[clamp(2.8rem,6vw,5rem)]`}>Your bag is empty.</h1>
        <p className="mt-5 text-[17px] text-[var(--o-ink-2)]">Add a piece and come back. Three from the ring to begin with:</p>
        <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 sm:gap-x-10">
          {featured(wood, 3).map((p) => (
            <li key={p.slug}>
              <ProductDisc product={p} sizes="(min-width: 640px) 28vw, 44vw" headingLevel={2} />
            </li>
          ))}
        </ul>
        <PillLink href={SHOP} className="mt-14">
          Go to the shop
        </PillLink>
      </div>
    </section>
  );
}

export function Checkout() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const reduced = !!useReducedMotion();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(0);
  const [addrId, setAddrId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressDraft | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const sum = bagSummary(lines, delivery);
  const promo = coupon ? applyCoupon(coupon, sum.subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const total = sum.total - discount;

  if (!hydrated) return <Loader label="Opening your bag" />;
  if (placed) return <Confirmation order={placed} />;
  if (!sum.count) return <EmptyBag />;

  const cur = user ? step : 0;
  const addresses = user?.addresses ?? [];
  const selected = addresses.find((a) => a.id === addrId) ?? addresses.find((a) => a.isDefault) ?? addresses[0];
  const address = draft ?? (selected ? draftOf(selected) : null);
  const codBlocked = total >= 10000;
  const payOk = !(payment === "cod" && codBlocked);

  const go = (i: number) => {
    setStep(i);
    setDone((d) => Math.max(d, i));
    setError(null);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const place = () => {
    if (!address) return go(1);
    const r = placeOrder({ lines, address, delivery, payment, giftNote: gift.trim() || undefined, coupon: promo && promo.ok ? promo.code : undefined });
    if (!r.ok) return setError(r.error);
    setPlaced(r.order);
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  const next = (label: string, onClick: () => void, disabled = false) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="group mt-8 flex h-14 w-full items-center justify-between gap-6 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99] disabled:opacity-40 sm:w-auto"
    >
      {label}
      <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)]">
        <CheckIcon className="size-4" />
      </span>
    </button>
  );

  const card = "flex w-full items-center gap-4 rounded-[28px] border p-4 text-left transition-colors";

  return (
    <section className="px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h1 className={`${s.display} text-[clamp(3rem,6vw,5.4rem)]`}>Checkout</h1>
          <div className={`mt-10 overflow-x-auto pb-2 ${s.noBar}`}>
            <Markers step={cur} done={user ? done : 0} go={go} locked={!user} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={cur}
              className="mt-10"
              initial={reduced ? { opacity: 0 } : { opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? { opacity: 0 } : { opacity: 0, x: -30 }}
              transition={{ duration: 0.35, ease: EASE }}
            >
              {cur === 0 && (
                <>
                  <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>{user ? "Your account" : "Sign in to place your order"}</h2>
                  {user ? (
                    <>
                      <p className="mt-4 text-[16px] text-[var(--o-ink-2)]">
                        Signed in as <span className="font-semibold text-[var(--o-ink)]">{user.name}</span>. Not you?{" "}
                        <button type="button" onClick={() => signOut()} className="font-semibold underline underline-offset-4 hover:text-[var(--m-accent)]">
                          Sign out
                        </button>
                      </p>
                      {next("Continue to the address", () => go(1))}
                    </>
                  ) : (
                    <>
                      <p className="mb-6 mt-2 text-[16px] text-[var(--o-ink-2)]">Your orders and their tracking live in your account. {PREVIEW_ACCOUNTS}</p>
                      <AuthPanel onDone={() => go(1)} initial="up" />
                    </>
                  )}
                </>
              )}

              {cur === 1 && (
                <>
                  <h2 className={`${s.syne} mb-6 text-[24px] font-bold tracking-[-0.02em]`}>Where should it go?</h2>
                  {addresses.length > 0 && !adding ? (
                    <>
                      <div role="radiogroup" aria-label="Saved addresses" className="space-y-3">
                        {addresses.map((a) => {
                          const on = !draft && selected?.id === a.id;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              onClick={() => {
                                setAddrId(a.id);
                                setDraft(null);
                              }}
                              className={`${card} ${on ? "border-[var(--o-ink)] bg-[var(--o-card)]" : "border-[var(--o-line)] hover:border-[var(--o-ink)]"}`}
                            >
                              <RadioDot on={on} />
                              <span className="min-w-0 text-[15px] leading-snug">
                                <span className="block font-semibold">
                                  {a.label}
                                  {a.isDefault ? ", default" : ""}
                                </span>
                                <span className="block text-[var(--o-ink-2)]">
                                  {a.name}, {a.line1}
                                  {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                        {draft && (
                          <div className={`${card} border-[var(--o-ink)] bg-[var(--o-card)]`}>
                            <RadioDot on />
                            <span className="text-[15px]">
                              {draft.name}, {draft.line1}, {draft.city} {draft.pin} (this order only)
                            </span>
                          </div>
                        )}
                      </div>
                      <button type="button" onClick={() => setAdding(true)} className="mt-4 h-12 rounded-full border border-[var(--o-line)] px-5 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]">
                        Add a new address
                      </button>
                      <div>{next("Continue to delivery and payment", () => go(2), !address)}</div>
                    </>
                  ) : (
                    <AddressForm
                      initial={{ name: user?.name, phone: user?.phone }}
                      submitLabel="Use this address"
                      saveOption
                      onCancel={addresses.length ? () => setAdding(false) : undefined}
                      onSubmit={(a, o) => {
                        if (o.save) {
                          const saved = saveAddress({ ...a, isDefault: addresses.length === 0 });
                          setAddrId(saved.id);
                          setDraft(null);
                        } else setDraft(a);
                        setAdding(false);
                        go(2);
                      }}
                    />
                  )}
                </>
              )}

              {cur === 2 && (
                <>
                  <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>Delivery and payment</h2>
                  <fieldset className="mt-6">
                    <legend className="mb-3 text-[14px] font-semibold">Delivery</legend>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {Object.values(DELIVERY).map((d) => {
                        const on = delivery === d.id;
                        return (
                          <label key={d.id} className={`${card} cursor-pointer has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--m-accent)] ${on ? "border-[var(--o-ink)] bg-[var(--o-card)]" : "border-[var(--o-line)] hover:border-[var(--o-ink)]"}`}>
                            <input type="radio" name="o2-delivery" className="sr-only" checked={on} onChange={() => setDelivery(d.id)} />
                            <RadioDot on={on} />
                            <span className="text-[15px] leading-snug">
                              <span className="block font-semibold">{d.price ? formatINR(d.price) : "Free"}</span>
                              <span className="block text-[var(--o-ink-2)]">{d.label}</span>
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>
                  <fieldset className="mt-8">
                    <legend className="mb-3 text-[14px] font-semibold">Payment</legend>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {PAYMENTS.map((p) => {
                        const blocked = p.id === "cod" && codBlocked;
                        const on = payment === p.id && !blocked;
                        return (
                          <label
                            key={p.id}
                            className={`flex aspect-square cursor-pointer flex-col items-center justify-center rounded-full border p-3 text-center transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-[var(--m-accent)] ${
                              blocked ? "cursor-not-allowed opacity-45" : on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] bg-[var(--o-card)] hover:border-[var(--o-ink)]"
                            }`}
                          >
                            <input type="radio" name="o2-payment" className="sr-only" disabled={blocked} checked={on} onChange={() => setPayment(p.id)} />
                            <span className={`${s.syne} text-[15px] font-bold leading-tight`}>{p.label}</span>
                            <span className={`mt-1 text-[12px] leading-tight ${on ? "text-white/75" : "text-[var(--o-muted)]"}`}>{p.note}</span>
                          </label>
                        );
                      })}
                    </div>
                    {codBlocked && <p className="mt-3 text-[14px] text-[var(--o-muted)]">Pay on delivery is open for orders under ₹10,000.</p>}
                    <p className="mt-4 rounded-[22px] bg-[var(--o-stone)] px-5 py-3 text-[14px] text-[var(--o-ink-2)]">{PREVIEW_PAYMENTS}</p>
                  </fieldset>
                  <div className="mt-8">
                    <label htmlFor="o2-gift" className="mb-1.5 block text-[14px] font-semibold">
                      Gift note (optional)
                    </label>
                    <textarea id="o2-gift" aria-describedby="o2-gift-hint" className={s.field} rows={3} maxLength={200} value={gift} onChange={(e) => setGift(e.target.value)} placeholder="Your words, on a card inside the box" />
                    <p id="o2-gift-hint" className="mt-1.5 pl-5 text-[13px] text-[var(--o-muted)]">
                      {gift.length} of 200 characters
                    </p>
                  </div>
                  {next("Review the order", () => go(3), !payOk)}
                </>
              )}

              {cur === 3 && address && (
                <>
                  <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>Check and place the order</h2>
                  <dl className="mt-6 divide-y divide-[var(--o-line)] rounded-[28px] border border-[var(--o-line)] bg-[var(--o-card)] px-6">
                    {[
                      ["Deliver to", `${address.name}, +91 ${address.phone}. ${address.line1}${address.line2 ? `, ${address.line2}` : ""}, ${address.city}, ${address.state} ${address.pin}`],
                      ["Delivery", DELIVERY[delivery].label],
                      ["Payment", PAYMENTS.find((p) => p.id === payment)?.label ?? ""],
                      ["Gift note", gift.trim() || "None"],
                      ...(promo && promo.ok ? [["Code", `${promo.code}: ${promo.label}`]] : []),
                    ].map(([k, v]) => (
                      <div key={k} className="flex flex-col gap-1 py-4 text-[15px] sm:flex-row sm:justify-between sm:gap-6">
                        <dt className="shrink-0 text-[var(--o-muted)]">{k}</dt>
                        <dd className="sm:text-right">{v}</dd>
                      </div>
                    ))}
                  </dl>
                  {error && (
                    <p role="alert" className="mt-4 rounded-[22px] bg-[#f6dfdb] px-5 py-3 text-[14px] font-medium text-[#7d1d15]">
                      {error}
                    </p>
                  )}
                  {next(`Place order, ${formatINR(total)}`, place)}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[36px] bg-[var(--o-card)] p-6 shadow-[0_30px_80px_-40px_rgb(25_23_20/0.35)] md:p-8 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between">
              <h2 className={`${s.syne} text-[22px] font-bold`}>Your order</h2>
              <p className="text-[14px] text-[var(--o-muted)]">
                {sum.count} {sum.count === 1 ? "piece" : "pieces"}
              </p>
            </div>
            <ul className="mt-3 divide-y divide-[var(--o-line)]">
              {sum.items.map((i) => (
                <Line key={i.key} it={itemLine(i)} />
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-[var(--o-line)] pt-4 text-[15px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(sum.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--o-ink-2)]">
                <span>Delivery</span>
                <span className="tabular-nums">{sum.shipping ? formatINR(sum.shipping) : "Free"}</span>
              </div>
              {discount > 0 && promo && promo.ok && (
                <div className="flex justify-between font-semibold text-[var(--m-accent)]">
                  <span>{promo.code}</span>
                  <span className="tabular-nums">−{formatINR(discount)}</span>
                </div>
              )}
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-semibold">Total</span>
                <span className={`${s.syne} text-[28px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(total)}</span>
              </div>
            </div>

            {/* a code, in a ring-shaped field */}
            <div className="mt-6 border-t border-[var(--o-line)] pt-5">
              {promo && promo.ok ? (
                <div className="flex items-center gap-3 rounded-full bg-[var(--m-accent-soft)] p-1.5 pr-2">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--m-accent)] text-white">
                    <CheckIcon className="size-4" />
                  </span>
                  <span className="min-w-0 flex-1 text-[14px] leading-tight">
                    <span className={`${s.syne} block font-bold`}>{promo.code}</span>
                    <span className="block text-[var(--o-ink-2)]">{promo.label}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Remove the code ${promo.code}`}
                    onClick={() => {
                      setCoupon(null);
                      setCode("");
                    }}
                    className="grid size-9 place-items-center rounded-full transition-colors hover:bg-[var(--o-card)]"
                  >
                    <CloseIcon className="size-4" />
                  </button>
                </div>
              ) : (
                <form
                  noValidate
                  onSubmit={(e) => {
                    e.preventDefault();
                    const r = applyCoupon(code, sum.subtotal);
                    if (!r.ok) return setCodeErr(r.error);
                    setCodeErr(null);
                    setCoupon(r.code);
                  }}
                >
                  <label htmlFor="o2-code" className="mb-1.5 block text-[14px] font-semibold">
                    A code from the Circle
                  </label>
                  <div className="flex items-center gap-1 rounded-full border border-[var(--o-line)] bg-white p-1 focus-within:border-[var(--o-ink)]">
                    <input
                      id="o2-code"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      aria-invalid={!!codeErr || (!!promo && !promo.ok)}
                      aria-describedby="o2-code-note"
                      autoCapitalize="characters"
                      className="h-11 min-w-0 flex-1 bg-transparent px-4 uppercase tracking-[0.04em] outline-none placeholder:normal-case placeholder:tracking-normal placeholder:text-[var(--o-muted)]"
                      placeholder="Enter a code"
                    />
                    <button type="submit" className="h-11 shrink-0 rounded-full bg-[var(--o-ink)] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-black active:scale-95">
                      Apply
                    </button>
                  </div>
                  <p id="o2-code-note" className={`mt-1.5 pl-4 text-[13px] ${codeErr || (promo && !promo.ok) ? "font-medium text-[#a3241b]" : "text-[var(--o-muted)]"}`}>
                    {codeErr ?? (promo && !promo.ok ? promo.error : `Preview codes: ${Object.keys(COUPONS).join(", ")}.`)}
                  </p>
                </form>
              )}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
