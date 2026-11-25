"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { saveAddress, signOut, useUser, type Address } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type DeliveryId } from "@/lib/shop/bag";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type CouponResult, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { AddressForm, AddressLines, type AddressDraft } from "../account/AddressForm";
import { AuthPanel, PreviewNote } from "../account/AuthPanel";
import { RadioCard, Switch, TextArea } from "../forms/Field";
import { WoodDisc } from "../Logo";
import { OrderItems, rowsFromBag, rowsFromOrder } from "../orders/OrderItems";
import { Pill } from "../Pill";
import { CheckIcon, CloseIcon } from "../shop/Icons";
import { WT } from "../W";

type Step = "account" | "address" | "delivery" | "review";
const ORDER: Step[] = ["account", "address", "delivery", "review"];
const TITLES: Record<Step, string> = { account: "Account", address: "Address", delivery: "Delivery and payment", review: "Review and place" };
const EASE = [0.22, 1, 0.36, 1] as const;
const COD_LIMIT = 10000;

/**
 * When a step closes and the next opens, the closing one collapses above the reader. Hold the new
 * step's heading just under the header for the length of that collapse, so the reader arrives at
 * the top of the step instead of in the middle of it.
 */
function followStep(get: () => HTMLElement | null) {
  const OFFSET = 112;
  const start = performance.now();
  let raf = 0;
  const tick = (t: number) => {
    const el = get();
    if (el) {
      const top = el.getBoundingClientRect().top;
      if (top < OFFSET - 2) window.scrollTo({ top: window.scrollY + top - OFFSET, behavior: "auto" });
      else if (t - start > 600 && top > window.innerHeight * 0.65) {
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        window.scrollTo({ top: window.scrollY + top - OFFSET, behavior: reduce ? "auto" : "smooth" });
        return;
      }
    }
    if (t - start < 700) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

const strip = (a: Address | AddressDraft): AddressDraft => ({
  label: a.label,
  name: a.name,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2,
  city: a.city,
  state: a.state,
  pin: a.pin,
});

/**
 * Checkout on the Maison's step rail. Placing an order needs an account, so the first step
 * signs you in or creates one inline. Payments are a preview: nothing is charged.
 */
export function CheckoutView() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [placed, setPlaced] = useState<Order | null>(null);
  const [step, setStep] = useState<Step>("address");
  const [choice, setChoice] = useState<string | null>(null); // a saved address id, "draft", or "new"
  const [draft, setDraft] = useState<AddressDraft | null>(null);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState(false);
  const [giftNote, setGiftNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const stepEls = useRef<Partial<Record<Step, HTMLLIElement | null>>>({});
  const shownStep = useRef<Step | null>(null);
  const openStep: Step = !user ? "account" : step;

  useEffect(() => {
    const was = shownStep.current;
    shownStep.current = openStep;
    if (!was || was === openStep) return;
    return followStep(() => stepEls.current[openStep] ?? null);
  }, [openStep]);

  const sum = bagSummary(lines, delivery);
  const promo = applied ? applyCoupon(applied, sum.subtotal) : null;
  const discount = promo?.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const coupon: CouponBox = {
    code,
    setCode,
    promo,
    error: couponError,
    apply: () => {
      const res = applyCoupon(code, sum.subtotal);
      if (!res.ok) return setCouponError(res.error);
      setCouponError(null);
      setApplied(res.code);
      setCode("");
    },
    remove: () => {
      setApplied(null);
      setCouponError(null);
    },
  };

  if (!hydrated) return <Shell aside={<div className="h-80 rounded-[2.25rem] bg-(--mz-surface)" />}>{<div className="h-96" />}</Shell>;
  if (placed && sum.count === 0) return <Confirmation order={placed} />;
  if (sum.count === 0) return <EmptyBag />;

  const current = openStep;
  const at = ORDER.indexOf(current);
  const saved = user?.addresses ?? [];
  const chosen = choice ?? (draft ? "draft" : (saved.find((a) => a.isDefault) ?? saved[0])?.id ?? "new");
  const address: AddressDraft | null = chosen === "draft" ? draft : chosen === "new" ? null : (() => {
    const a = saved.find((x) => x.id === chosen);
    return a ? strip(a) : null;
  })();
  const codBlocked = total >= COD_LIMIT;
  const pay = PAYMENTS.find((x) => x.id === payment)!;

  const go = (s: Step) => {
    setError(null);
    setStep(s);
  };

  const onAddress = (a: AddressDraft, { save }: { save: boolean }) => {
    if (save) {
      const savedAddr = saveAddress({ ...a, isDefault: saved.length === 0 });
      setChoice(savedAddr.id);
    } else {
      setDraft(a);
      setChoice("draft");
    }
    go("delivery");
  };

  const toReview = () => {
    if (payment === "cod" && codBlocked) return setError(`Pay on delivery is for orders under ${formatINR(COD_LIMIT)}. Please choose another way to pay.`);
    go("review");
  };

  const place = () => {
    if (!address) return go("address");
    const r = placeOrder({ lines, address, delivery, payment, giftNote: gift && giftNote.trim() ? giftNote.trim() : undefined, coupon: promo?.ok ? promo.code : undefined });
    if (!r.ok) return setError(r.error);
    setPlaced(r.order);
    setStep("address");
    setGift(false);
    setGiftNote("");
    setApplied(null);
    window.scrollTo({ top: 0 });
  };

  const summary: Record<Step, ReactNode> = {
    account: user ? (
      <>
        Signed in as {user.name}. <span className="text-(--mz-ink-3) [overflow-wrap:anywhere]">{user.email}</span>
      </>
    ) : null,
    address: address ? `${address.name}, ${address.city} ${address.pin}` : null,
    delivery: `${DELIVERY[delivery].label}, ${pay.label}${gift && giftNote.trim() ? ", with a gift note" : ""}`,
    review: null,
  };

  return (
    <Shell aside={<Summary sum={sum} delivery={delivery} coupon={coupon} total={total} />}>
      <ol className="relative ml-4 space-y-12 border-l border-(--mz-line) pl-8 md:ml-5 md:pl-12">
        {ORDER.map((s, i) => {
          const done = i < at;
          const open = i === at;
          return (
            <li
              key={s}
              ref={(el) => {
                stepEls.current[s] = el;
              }}
              className="relative"
            >
              <span
                className={`absolute -left-[3.15rem] top-0 grid size-9 place-items-center rounded-full border font-display text-[15px] tabular-nums transition-colors duration-500 md:-left-[4.15rem] ${
                  done ? "border-(--mz-accent) bg-(--mz-accent) text-(--mz-bg)" : open ? "border-(--mz-ink) bg-(--mz-ink) text-(--mz-bg)" : "border-(--mz-line) bg-(--mz-bg) text-(--mz-ink-3)"
                }`}
              >
                {done ? <CheckIcon /> : i + 1}
              </span>
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h2 className={`font-display text-[30px] leading-none tracking-[-0.02em] ${!done && !open ? "text-(--mz-ink-3)" : ""}`}>{TITLES[s]}</h2>
                {done && s !== "account" && (
                  <button
                    type="button"
                    onClick={() => go(s)}
                    className="rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
                  >
                    Change
                  </button>
                )}
              </div>
              {done && summary[s] && (
                <p className="mt-3 text-[15px] text-(--mz-ink-2)">
                  {summary[s]}
                  {s === "account" && (
                    <>
                      {" "}
                      Not you?{" "}
                      <button type="button" onClick={() => signOut()} className="rounded-sm text-(--mz-ink) underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-(--mz-accent)">
                        Sign out
                      </button>
                    </>
                  )}
                </p>
              )}
              <AnimatePresence initial={false}>
                {open && (
                  <motion.div
                    key={s}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.55, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6">
                      {s === "account" && (
                        <div className="max-w-xl">
                          <p className="mb-6 text-[16px] leading-relaxed text-(--mz-ink-2)">
                            Sign in to place your order. Your account keeps the order, its tracking and your addresses together.
                          </p>
                          <AuthPanel initial="signup" />
                        </div>
                      )}

                      {s === "address" && user && (
                        <div className="space-y-3">
                          {(saved.length > 0 || draft) && (
                            <div role="radiogroup" aria-label="Deliver to" className="grid gap-3 sm:grid-cols-2">
                              {saved.map((a) => (
                                <RadioCard key={a.id} name="address" value={a.id} checked={chosen === a.id} onChange={setChoice}>
                                  <span className="mb-1 flex items-center gap-2 text-[13px] text-(--mz-ink-3)">
                                    {a.label}
                                    {a.isDefault && <span className="rounded-full bg-(--mz-accent-soft) px-2 py-0.5 text-[12px] text-(--mz-accent-deep)">Default</span>}
                                  </span>
                                  <AddressLines a={a} className="text-[14px]" />
                                </RadioCard>
                              ))}
                              {draft && (
                                <RadioCard name="address" value="draft" checked={chosen === "draft"} onChange={setChoice}>
                                  <span className="mb-1 block text-[13px] text-(--mz-ink-3)">For this order only</span>
                                  <AddressLines a={draft} className="text-[14px]" />
                                </RadioCard>
                              )}
                              <RadioCard name="address" value="new" checked={chosen === "new"} onChange={setChoice}>
                                <span className="block text-[15px]">A new address</span>
                                <span className="mt-1 block text-[13px] text-(--mz-ink-3)">Anywhere in India</span>
                              </RadioCard>
                            </div>
                          )}
                          {chosen === "new" || (saved.length === 0 && !draft) ? (
                            <div className={saved.length || draft ? "rounded-[2rem] border border-(--mz-line) p-5 md:p-7" : ""}>
                              <AddressForm initial={{ name: user.name, phone: user.phone }} submitLabel="Deliver here" saveOption onSubmit={onAddress} />
                            </div>
                          ) : (
                            <div className="pt-3">
                              <Pill size="lg" onClick={() => go("delivery")} disabled={!address}>
                                Deliver here
                              </Pill>
                            </div>
                          )}
                        </div>
                      )}

                      {s === "delivery" && (
                        <div className="space-y-8">
                          <fieldset>
                            <legend className="mb-3 text-[14px] font-medium">Delivery</legend>
                            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                              {(Object.keys(DELIVERY) as DeliveryId[]).map((id) => (
                                <RadioCard key={id} name="delivery" value={id} checked={delivery === id} onChange={(v) => setDelivery(v as DeliveryId)} aside={DELIVERY[id].price ? formatINR(DELIVERY[id].price) : "Free"}>
                                  {DELIVERY[id].label}
                                  <span className="mt-1 block text-[13px] text-(--mz-ink-3)">{id === "express" ? "Insured, signed for" : "Insured, packed by hand"}</span>
                                </RadioCard>
                              ))}
                            </div>
                          </fieldset>
                          <fieldset>
                            <legend className="mb-3 text-[14px] font-medium">Payment</legend>
                            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2">
                              {PAYMENTS.map((m) => {
                                const off = m.id === "cod" && codBlocked;
                                return (
                                  <RadioCard key={m.id} name="payment" value={m.id} checked={payment === m.id} onChange={(v) => setPayment(v as PaymentId)} disabled={off}>
                                    {m.label}
                                    <span className="mt-1 block text-[13px] text-(--mz-ink-3)">{off ? `Only for orders under ${formatINR(COD_LIMIT)}` : m.note}</span>
                                  </RadioCard>
                                );
                              })}
                            </div>
                            <p className="mt-4 flex items-start gap-2.5 rounded-2xl bg-(--mz-accent-soft) px-5 py-3.5 text-[14px] leading-snug text-(--mz-accent-deep)">
                              <WoodDisc className="mt-px size-4 shrink-0" />
                              Payments are not connected yet, so no money is taken.
                            </p>
                            <PreviewNote className="mt-3 px-1" />
                          </fieldset>
                          <div>
                            <Switch on={gift} onChange={setGift} label="Add a gift note" sub="Handwritten on a card. Prices are never inside the box." />
                            <AnimatePresence initial={false}>
                              {gift && (
                                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden">
                                  <TextArea label="Your note, up to 240 characters" rows={3} maxLength={240} value={giftNote} onChange={(e) => setGiftNote(e.target.value)} className="mt-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          {error && (
                            <p role="alert" className="text-[14px] text-(--mz-accent-deep)">
                              {error}
                            </p>
                          )}
                          <Pill size="lg" onClick={toReview}>
                            Review the order
                          </Pill>
                        </div>
                      )}

                      {s === "review" && address && (
                        <div className="space-y-8">
                          <div className="grid gap-6 rounded-[2rem] bg-(--mz-surface) p-6 sm:grid-cols-2 md:p-8">
                            <div>
                              <p className="mb-2 text-[13px] text-(--mz-ink-3)">Deliver to</p>
                              <AddressLines a={address} className="text-[15px]" />
                            </div>
                            <div className="space-y-4 text-[15px]">
                              <div>
                                <p className="mb-1 text-[13px] text-(--mz-ink-3)">Delivery</p>
                                <p>{DELIVERY[delivery].label}</p>
                              </div>
                              <div>
                                <p className="mb-1 text-[13px] text-(--mz-ink-3)">Payment</p>
                                <p>{pay.label}, not charged in this preview</p>
                              </div>
                              {gift && giftNote.trim() && (
                                <div>
                                  <p className="mb-1 text-[13px] text-(--mz-ink-3)">Gift note</p>
                                  <p className="italic text-(--mz-ink-2)">{giftNote.trim()}</p>
                                </div>
                              )}
                            </div>
                          </div>
                          {error && (
                            <p role="alert" className="text-[14px] text-(--mz-accent-deep)">
                              {error}
                            </p>
                          )}
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                            <Pill size="lg" onClick={place} className="justify-between! sm:min-w-[22rem]">
                              <span>Place order</span>
                              <span className="tabular-nums opacity-80">{formatINR(total)}</span>
                            </Pill>
                            <p className="text-[13px] leading-snug text-(--mz-ink-3)">No money is taken. The order is saved to your account in this browser.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>
    </Shell>
  );
}

function Shell({ children, aside }: { children: ReactNode; aside: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 md:px-10 md:pt-36">
      <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">
        <WT red="Almost yours" white="Almost on its way" />
      </h1>
      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <div className="lg:col-span-7">{children}</div>
        <aside className="lg:col-span-5">{aside}</aside>
      </div>
    </div>
  );
}

type CouponBox = { code: string; setCode: (v: string) => void; promo: CouponResult | null; error: string | null; apply: () => void; remove: () => void };

function Summary({ sum, delivery, coupon, total }: { sum: ReturnType<typeof bagSummary>; delivery: DeliveryId; coupon: CouponBox; total: number }) {
  const ok = coupon.promo?.ok ? coupon.promo : null;
  return (
    <div className="rounded-[2.25rem] bg-(--mz-surface) p-6 md:p-8 lg:sticky lg:top-28">
      <p className="font-display text-[28px] leading-none tracking-[-0.02em]">
        Your bag <span className="text-[16px] tabular-nums text-(--mz-ink-3)">{sum.count}</span>
      </p>
      <OrderItems rows={rowsFromBag(sum.items)} className="mt-6" />
      <dl className="mt-6 space-y-2 border-t border-(--mz-line) pt-5 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-(--mz-ink-2)">Subtotal</dt>
          <dd className="tabular-nums">{formatINR(sum.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-(--mz-ink-2)">{delivery === "express" ? "Express delivery" : "Delivery"}</dt>
          <dd className="tabular-nums">{sum.shipping ? formatINR(sum.shipping) : "Free"}</dd>
        </div>
        {ok && (
          <div className="flex justify-between gap-4 text-(--mz-accent-deep)">
            <dt>
              Code {ok.code} <span className="block text-[13px] opacity-75">{ok.label}</span>
            </dt>
            <dd className="tabular-nums">−{formatINR(ok.discount)}</dd>
          </div>
        )}
        <div className="flex items-baseline justify-between pt-3">
          <dt>Total</dt>
          <dd className="font-display text-[32px] tabular-nums tracking-[-0.02em]">{formatINR(total)}</dd>
        </div>
      </dl>
      <div className="mt-6 border-t border-(--mz-line) pt-5">
        {ok ? (
          <p className="flex items-center justify-between gap-3 rounded-full bg-(--mz-bg) py-2 pl-5 pr-2 text-[14px]">
            <span className="flex items-center gap-2">
              <CheckIcon className="text-(--mz-accent)" /> {ok.code} applied, you save {formatINR(ok.discount)}
            </span>
            <button
              type="button"
              onClick={coupon.remove}
              aria-label={`Remove code ${ok.code}`}
              className="grid size-9 place-items-center rounded-full text-(--mz-ink-2) hover:bg-(--mz-surface-2) focus-visible:outline-2 focus-visible:outline-(--mz-accent)"
            >
              <CloseIcon />
            </button>
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              coupon.apply();
            }}
            noValidate
          >
            <div className="flex h-14 items-center rounded-full bg-(--mz-bg) pl-5 pr-1.5 ring-1 ring-transparent transition-shadow focus-within:ring-2 focus-within:ring-(--mz-accent)">
              <label htmlFor="mz-coupon" className="sr-only">
                Coupon code
              </label>
              <input
                id="mz-coupon"
                value={coupon.code}
                onChange={(e) => coupon.setCode(e.target.value)}
                placeholder="Coupon code"
                autoComplete="off"
                autoCapitalize="characters"
                aria-invalid={coupon.error ? true : undefined}
                aria-describedby={coupon.error ? "mz-coupon-err" : "mz-coupon-hint"}
                className="h-full min-w-0 flex-1 bg-transparent text-[16px] uppercase outline-none placeholder:normal-case placeholder:text-(--mz-ink-3)"
              />
              <Pill type="submit" size="sm" disabled={!coupon.code.trim()}>
                Apply
              </Pill>
            </div>
            {coupon.error ? (
              <p id="mz-coupon-err" role="alert" className="mt-2 px-5 text-[13px] text-(--mz-accent-deep)">
                {coupon.error}
              </p>
            ) : (
              <p id="mz-coupon-hint" className="mt-2 px-5 text-[13px] text-(--mz-ink-3)">
                Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15.
              </p>
            )}
          </form>
        )}
        {coupon.promo && !coupon.promo.ok && (
          <p role="alert" className="mt-2 px-5 text-[13px] text-(--mz-accent-deep)">
            {coupon.promo.error} The code is set aside until the bag qualifies.
          </p>
        )}
      </div>
      <Link href="/maison/shop" className="mt-4 inline-block rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)">
        Add something else
      </Link>
    </div>
  );
}

function EmptyBag() {
  return (
    <div className="mx-auto grid min-h-[80svh] max-w-[1500px] items-center gap-12 px-5 pt-28 md:px-10 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <h1 className="font-display text-[clamp(3rem,7vw,6rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Your bag is empty</h1>
        <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
          <WT
            red="Most people begin small: a key fob that darkens with handling, a wrist mala, a jar of raktachandan."
            white="Most people begin small: a tube of Mysuru incense, a pulse roller of heartwood oil, a chandan stone."
          />
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Pill href="/maison/shop" size="lg">
            <WT red="Shop red sandalwood" white="Shop white sandalwood" />
          </Pill>
          <Pill href="/maison/track" variant="line" size="lg">
            Track an order
          </Pill>
        </div>
      </div>
      <div className="relative mx-auto aspect-square w-full max-w-md lg:col-span-5 lg:col-start-8">
        <WoodDisc className="size-full opacity-90" />
        <span className="absolute inset-[30%] rounded-full bg-(--mz-bg) shadow-[inset_0_0_0_1px_var(--mz-line)]" />
      </div>
    </div>
  );
}

function Confirmation({ order }: { order: Order }) {
  const est = trackingFor(order, order.placedAt).estimate;
  const first = order.name.split(/\s+/)[0];
  return (
    <div className="mx-auto grid max-w-[1500px] gap-14 px-5 pb-10 pt-32 md:px-10 md:pt-40 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]"
        >
          Thank you, {first}. It is with the workshop.
        </motion.h1>
        <p className="mt-8 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
          Each piece is checked against its record, wrapped and boxed before it leaves for {order.address.city}. Expected between {formatDate(est.from)} and {formatDate(est.to)}.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Pill href={`/maison/track?o=${order.id}`} size="lg">
            Track this order
          </Pill>
          <Pill href="/maison/account" variant="line" size="lg">
            Your orders
          </Pill>
        </div>
        <p className="mt-8 text-[14px] text-(--mz-ink-3)">Preview: no payment was taken, and the order is saved in this browser.</p>
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <div className="rounded-[2.25rem] bg-(--mz-surface) p-7 md:p-9">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[13px] text-(--mz-ink-3)">Order number</p>
              <p className="mt-1 font-display text-[30px] leading-none tracking-[-0.01em] tabular-nums">{order.id}</p>
            </div>
            <WoodDisc className="size-12 shrink-0" />
          </div>
          <OrderItems rows={rowsFromOrder(order.lines)} className="mt-7 border-t border-dashed border-(--mz-ink)/15 pt-6" />
          <dl className="mt-6 space-y-2 border-t border-dashed border-(--mz-ink)/15 pt-5 text-[15px]">
            <div className="flex justify-between">
              <dt className="text-(--mz-ink-2)">Delivery</dt>
              <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
            </div>
            {order.discount ? (
              <div className="flex justify-between text-(--mz-accent-deep)">
                <dt>Code {order.coupon}</dt>
                <dd className="tabular-nums">−{formatINR(order.discount)}</dd>
              </div>
            ) : null}
            <div className="flex items-baseline justify-between pt-2">
              <dt>Total</dt>
              <dd className="font-display text-[32px] tabular-nums">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
