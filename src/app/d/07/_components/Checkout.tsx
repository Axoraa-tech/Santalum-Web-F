"use client";

import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { getUser, saveAddress, signOut, useUser, type Address, type User } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { useWood } from "@/lib/wood";
import { AddressFields, addressLine, AreaField, AuthPanel, Check, Deal, PREVIEW_LINE, readAddress, Submit, type AddressInput } from "./forms";
import { IconArrow, IconCheck } from "./Icons";
import { LinePhoto, shotOf, ShotPhoto } from "./shots";
import { ACCOUNT, EASE, HOME, productHref, sheet, SHOP, starters, TRACK } from "./store";

const STEPS = ["Account", "Address", "Delivery and payment", "Review"] as const;
const COD_LIMIT = 10000;

/**
 * Checkout as a stack of step cards. Each step you finish folds down and joins the stack above the next one.
 * Signing in is required to place an order. Preview only: payments are not connected.
 */
export function Checkout() {
  const hydrated = useHydrated();
  return (
    <main className="px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      {hydrated ? (
        <Body />
      ) : (
        <>
          <Header title="Checkout" />
          <div className="mt-3 h-[60svh] rounded-[28px] bg-(--s7-surface)/60 md:rounded-[40px] lg:rounded-[48px]" />
        </>
      )}
    </main>
  );
}

function Header({ title }: { title: string }) {
  return (
    <header className="rounded-[28px] bg-(--s7-sand) px-5 pb-7 pt-5 md:rounded-[40px] md:px-8 md:pb-9 md:pt-7 lg:rounded-[48px] lg:px-10">
      <Link href={SHOP} className="inline-flex items-center gap-2 text-[14px] text-(--s7-muted) transition hover:text-(--s7-ink)">
        <IconArrow dir="left" width={16} height={16} />
        Back to the shop
      </Link>
      <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <h1 className="d1 text-[clamp(3.6rem,10vw,9rem)]">{title}</h1>
        <p className="inline-flex max-w-md items-center gap-3 self-start rounded-full bg-(--s7-surface) px-4 py-2.5 text-[14px] md:self-auto">
          <span className="size-2 shrink-0 rounded-full bg-(--s7-accent)" aria-hidden />
          Preview: payments are not connected yet.
        </p>
      </div>
    </header>
  );
}

function Body() {
  const user = useUser();
  const lines = useBag();
  const reduce = useReducedMotion();
  const [step, setStep] = useState<number>(() => (getUser() ? 1 : 0));
  const [address, setAddress] = useState<AddressInput | null>(null);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [placed, setPlaced] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const sum = bagSummary(lines, delivery);
  const promo = code ? applyCoupon(code, sum.subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const at = user ? step : 0;

  const top = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  const place = () => {
    if (!address) {
      setStep(1);
      return;
    }
    const r = placeOrder({ lines, address, delivery, payment, giftNote: gift.trim() || undefined, coupon: promo && promo.ok ? promo.code : undefined });
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setError(null);
    setPlaced(r.order);
    top();
  };

  if (placed) {
    return (
      <>
        <Header title="Thank you" />
        <Confirmation order={placed} />
      </>
    );
  }

  if (sum.count === 0) {
    return (
      <>
        <Header title="Checkout" />
        <Empty />
      </>
    );
  }

  const summaries: ReactNode[] = [
    user ? (
      <>
        Signed in as <span className="font-medium">{user.name}</span>. Not you?{" "}
        <button
          type="button"
          onClick={() => {
            signOut();
            setStep(0);
          }}
          className="font-medium underline decoration-(--s7-ink)/30 underline-offset-4 transition hover:decoration-(--s7-ink)"
        >
          Sign out
        </button>
      </>
    ) : null,
    address ? `${address.name}, ${addressLine(address)}` : null,
    `${delivery === "express" ? "Express" : "Standard"}, ${DELIVERY[delivery].price ? formatINR(DELIVERY[delivery].price) : "free"}. ${PAYMENTS.find((x) => x.id === payment)?.label}${gift.trim() ? ", with a gift note" : ""}.`,
    null,
  ];

  return (
    <>
      <Header title="Checkout" />
      <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
        <section aria-label="Checkout steps" className="lg:col-span-7">
          <LayoutGroup>
            <ol className="relative">
              {STEPS.map((name, i) => {
                const state = i < at ? "done" : i === at ? "current" : "next";
                const depth = state === "done" ? at - i : state === "next" ? i - at : 0;
                return (
                  <motion.li
                    key={name}
                    layout={!reduce}
                    transition={{ type: "spring", stiffness: 260, damping: 32 }}
                    style={{
                      zIndex: state === "current" ? 50 : state === "done" ? 10 + i : 40 - i,
                      originY: state === "next" ? 0 : 1,
                    }}
                    animate={{ scale: state === "current" ? 1 : 1 - Math.min(depth, 3) * 0.025 }}
                    className={`relative rounded-[28px] md:rounded-[36px] ${
                      state === "current"
                        ? "s7-on-surface bg-(--s7-surface) shadow-[0_30px_60px_-40px_rgba(27,23,18,0.6)]"
                        : state === "done"
                          ? "-mb-5 bg-(--s7-sage)"
                          : "-mt-9 bg-(--s7-stone)"
                    }`}
                  >
                    {state === "done" && <DoneRow n={i + 1} name={name} summary={summaries[i]} onEdit={i === 0 ? undefined : () => setStep(i)} />}
                    {state === "next" && (
                      <div className="flex items-center justify-between px-6 pb-3 pt-12 text-[14px] text-(--s7-muted) md:px-8">
                        <span>
                          <span className="num mr-2">{i + 1}</span>
                          {name}
                        </span>
                      </div>
                    )}
                    {state === "current" && (
                      <motion.div
                        key={`body-${name}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.1, ease: EASE }}
                        className="px-4 pb-6 pt-6 md:px-8 md:pb-8 md:pt-7"
                      >
                        <p className="num px-1 text-[13px] text-(--s7-muted)">
                          Step {i + 1} of {STEPS.length}
                        </p>
                        <h2 className="d1 mt-1 px-1 text-[clamp(2.8rem,5vw,4.6rem)]">{name}</h2>
                        <div className="mt-6">
                          {i === 0 && (
                            <>
                              <p className="mb-5 max-w-[52ch] px-1 text-[16px] leading-relaxed text-(--s7-body)">
                                Sign in or create an account to place the order. It keeps your addresses, and lets you follow the order from the
                                workshop to your door.
                              </p>
                              <AuthPanel tint="var(--s7-page)" onDone={() => setStep(1)} />
                            </>
                          )}
                          {i === 1 && user && (
                            <AddressStep
                              user={user}
                              value={address}
                              onDone={(a) => {
                                setAddress(a);
                                setStep(2);
                              }}
                            />
                          )}
                          {i === 2 && (
                            <PayStep
                              delivery={delivery}
                              payment={payment}
                              gift={gift}
                              subtotal={sum.subtotal - discount}
                              onDelivery={setDelivery}
                              onPayment={setPayment}
                              onGift={setGift}
                              onDone={() => setStep(3)}
                            />
                          )}
                          {i === 3 && address && user && (
                            <Review user={user} address={address} delivery={delivery} payment={payment} gift={gift} total={total} error={error} onPlace={place} />
                          )}
                        </div>
                      </motion.div>
                    )}
                  </motion.li>
                );
              })}
            </ol>
          </LayoutGroup>
        </section>

        <Summary
          items={sum.items}
          subtotal={sum.subtotal}
          shipping={sum.shipping}
          delivery={delivery}
          total={total}
          promo={promo}
          onCode={setCode}
        />
      </div>
    </>
  );
}

function DoneRow({ n, name, summary, onEdit }: { n: number; name: string; summary: ReactNode; onEdit?: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 pb-9 pt-5 md:px-8">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-(--s7-ink) text-(--s7-page)" aria-hidden>
        <IconCheck width={14} height={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">
          <span className="num mr-2 text-(--s7-muted)">{n}</span>
          {name}
        </p>
        <p className="text-[14.5px] leading-snug text-(--s7-body) [overflow-wrap:anywhere]">{summary}</p>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Change ${name.toLowerCase()}`}
          className="shrink-0 rounded-full px-3.5 py-2 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/15 transition hover:bg-(--s7-surface) active:scale-95"
        >
          Change
        </button>
      )}
    </div>
  );
}

/* ---------- step 2: address ---------- */

function AddressStep({ user, value, onDone }: { user: User; value: AddressInput | null; onDone: (a: AddressInput) => void }) {
  const saved = user.addresses;
  const initial = saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? "new";
  const [choice, setChoice] = useState<string>(value ? "new" : initial);
  const [errors, setErrors] = useState<Parameters<typeof AddressFields>[0]["errors"]>({});
  const [keep, setKeep] = useState(true);
  const fresh = choice === "new";

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fresh) {
      const a = saved.find((x) => x.id === choice) as Address;
      onDone({ label: a.label, name: a.name, phone: a.phone, line1: a.line1, line2: a.line2, city: a.city, state: a.state, pin: a.pin });
      return;
    }
    const { value: v, errors: errs } = readAddress(e.currentTarget);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    if (keep) saveAddress({ ...v, isDefault: saved.length === 0 });
    onDone(v);
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      {saved.length > 0 && (
        <fieldset className="grid gap-2.5 pt-1.5 sm:grid-cols-2">
          <legend className="mb-2 px-1 text-[14px] text-(--s7-muted)">Send it to</legend>
          {saved.map((a, i) => (
            <Deal key={a.id} name="addr" n={i + 1} checked={choice === a.id} onChange={() => setChoice(a.id)}>
              <span className="flex items-center gap-2 text-[15px] font-medium">
                {a.label}
                {a.isDefault && <span className="rounded-full bg-(--s7-accent-soft) px-2 py-0.5 text-[12px] text-(--s7-accent-deep)">Default</span>}
              </span>
              <span className="s7-deal-sub">
                {a.name}, {addressLine(a)}
              </span>
            </Deal>
          ))}
          <Deal name="addr" n={saved.length + 1} checked={fresh} onChange={() => setChoice("new")}>
            <span className="text-[15px] font-medium">A new address</span>
            <span className="s7-deal-sub">Write it on a fresh card below.</span>
          </Deal>
        </fieldset>
      )}
      {fresh && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: EASE }} className="grid gap-4">
          <AddressFields value={value ?? { name: user.name, phone: user.phone }} errors={errors} />
          <Check checked={keep} onChange={setKeep} label="Save this address" sub="It will be in your account for next time." />
        </motion.div>
      )}
      <Submit>Continue to delivery</Submit>
    </form>
  );
}

/* ---------- step 3: delivery and payment ---------- */

function PayStep({
  delivery,
  payment,
  gift,
  subtotal,
  onDelivery,
  onPayment,
  onGift,
  onDone,
}: {
  delivery: DeliveryId;
  payment: PaymentId;
  gift: string;
  subtotal: number;
  onDelivery: (d: DeliveryId) => void;
  onPayment: (p: PaymentId) => void;
  onGift: (g: string) => void;
  onDone: () => void;
}) {
  const total = subtotal + DELIVERY[delivery].price;
  const codOk = total < COD_LIMIT;
  const [err, setErr] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (payment === "cod" && !codOk) {
      setErr(`Pay on delivery is available for orders under ${formatINR(COD_LIMIT)}. Please choose another way to pay.`);
      return;
    }
    setErr(null);
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-6">
      <fieldset className="grid gap-2.5 pt-1.5 sm:grid-cols-2">
        <legend className="mb-2 px-1 text-[14px] text-(--s7-muted)">Delivery</legend>
        {(Object.keys(DELIVERY) as DeliveryId[]).map((id, i) => (
          <Deal key={id} name="delivery" n={i + 1} checked={delivery === id} onChange={() => onDelivery(id)}>
            <span className="flex items-baseline justify-between gap-3">
              <span className="d3 text-[22px]">{id === "express" ? "Express" : "Standard"}</span>
              <span className="num text-[15px]">{DELIVERY[id].price ? formatINR(DELIVERY[id].price) : "Free"}</span>
            </span>
            <span className="s7-deal-sub">{id === "express" ? "1–2 working days" : "3–5 working days, across India"}</span>
          </Deal>
        ))}
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-2.5 pt-1.5 lg:grid-cols-4">
        <legend className="mb-2 px-1 text-[14px] text-(--s7-muted)">Payment</legend>
        {PAYMENTS.map((p, i) => {
          const off = p.id === "cod" && !codOk;
          return (
            <Deal key={p.id} name="payment" n={i + 1} checked={payment === p.id} disabled={off} onChange={() => onPayment(p.id)}>
              <span className="d3 mt-auto pt-3 text-[20px] leading-none">{p.label}</span>
              <span className="s7-deal-sub text-[13px]">{off ? `Only under ${formatINR(COD_LIMIT)}` : p.note}</span>
            </Deal>
          );
        })}
      </fieldset>
      <p className="flex items-start gap-3 rounded-[20px] bg-(--s7-accent-soft) p-4 text-[14.5px] leading-snug">
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-(--s7-accent)" aria-hidden />
        <span>
          Payments are not connected yet, so no money is taken. {PREVIEW_LINE}
        </span>
      </p>

      <AreaField
        id="s7-gift"
        label="Gift note"
        optional
        value={gift}
        onChange={(e) => onGift(e.target.value)}
        maxLength={240}
        rows={3}
        hint={`${240 - gift.length} characters left. Written by hand on a card; prices stay off the packing slip.`}
        placeholder="For Amma, with love"
      />
      {err && (
        <p role="alert" className="s7-err rounded-[16px] bg-[#a3261e]/8 px-4 py-3">
          {err}
        </p>
      )}
      <Submit>Review the order</Submit>
    </form>
  );
}

/* ---------- step 4: review ---------- */

function Review({
  user,
  address,
  delivery,
  payment,
  gift,
  total,
  error,
  onPlace,
}: {
  user: User;
  address: AddressInput;
  delivery: DeliveryId;
  payment: PaymentId;
  gift: string;
  total: number;
  error: string | null;
  onPlace: () => void;
}) {
  return (
    <div className="grid gap-5">
      <dl className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-[20px] bg-(--s7-page) p-4">
          <dt className="text-[13px] text-(--s7-muted)">Send to</dt>
          <dd className="mt-1 text-[15px] leading-snug">
            {address.name}
            <br />
            {address.line1}
            {address.line2 && (
              <>
                <br />
                {address.line2}
              </>
            )}
            <br />
            {address.city}, {address.state} {address.pin}
            <br />
            <span className="num">{address.phone}</span>
          </dd>
        </div>
        <div className="rounded-[20px] bg-(--s7-page) p-4">
          <dt className="text-[13px] text-(--s7-muted)">Account</dt>
          <dd className="mt-1 text-[15px] leading-snug">{user.email}</dd>
          <dt className="mt-3 text-[13px] text-(--s7-muted)">Delivery and payment</dt>
          <dd className="mt-1 text-[15px] leading-snug">
            {delivery === "express" ? "Express, 1–2 working days" : "Standard, 3–5 working days"}
            <br />
            {PAYMENTS.find((p) => p.id === payment)?.label}
          </dd>
          {gift.trim() && (
            <>
              <dt className="mt-3 text-[13px] text-(--s7-muted)">Gift note</dt>
              <dd className="mt-1 text-[15px] leading-snug">{gift}</dd>
            </>
          )}
        </div>
      </dl>
      <p className="flex items-start gap-3 rounded-[20px] bg-(--s7-accent-soft) p-4 text-[14.5px] leading-snug">
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-(--s7-accent)" aria-hidden />
        Payments are not connected yet, so no money is taken. Placing the order saves it in this browser so you can follow it.
      </p>
      {error && (
        <p role="alert" className="s7-err rounded-[16px] bg-[#a3261e]/8 px-4 py-3">
          {error}
        </p>
      )}
      <button
        type="button"
        onClick={onPlace}
        className="inline-flex h-14 items-center justify-between gap-6 rounded-full bg-(--s7-ink) pl-7 pr-6 text-[16px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98] sm:self-start"
      >
        Place the order
        <span className="num opacity-75">{formatINR(total)}</span>
      </button>
    </div>
  );
}

/* ---------- the bag, beside the steps ---------- */

function Summary({
  items,
  subtotal,
  shipping,
  delivery,
  total,
  promo,
  onCode,
}: {
  items: BagItem[];
  subtotal: number;
  shipping: number;
  delivery: DeliveryId;
  total: number;
  promo: ReturnType<typeof applyCoupon> | null;
  onCode: (c: string | null) => void;
}) {
  const [draft, setDraft] = useState("");
  return (
    <aside className="self-start rounded-[28px] bg-(--s7-clay) p-5 md:rounded-[40px] md:p-8 lg:sticky lg:top-[14px] lg:col-span-5 lg:rounded-[48px] lg:p-9">
      <div className="flex items-end justify-between gap-4">
        <h2 className="d2 text-[34px] md:text-[40px]">In the bag</h2>
        <button
          type="button"
          onClick={() => sheet.open()}
          className="rounded-full px-3.5 py-2 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/15 transition hover:bg-(--s7-surface) active:scale-95"
        >
          Change
        </button>
      </div>
      <ul className="mt-5 grid gap-2">
        {items.map((i) => (
          <li key={i.key} className="flex items-center gap-3 rounded-[22px] bg-(--s7-surface)/70 p-2 pr-4">
            <Link href={productHref(i.slug)} className="relative size-16 shrink-0 overflow-hidden rounded-[16px]" aria-label={i.product.name}>
              <ShotPhoto shot={shotOf(i.product)} sizes="64px" />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="d3 truncate text-[17px]">{i.product.name}</p>
              <p className="text-[13.5px] text-(--s7-muted)">
                {CONTENT[i.product.wood].short}
                {i.optionValue ? `, ${i.optionValue.label}` : ""} <span className="num">&times; {i.qty}</span>
              </p>
              {i.note && <p className="text-[13px] text-(--s7-accent)">{i.note}</p>}
            </div>
            <p className="num text-[15px] font-medium">{formatINR(i.total)}</p>
          </li>
        ))}
      </ul>
      <dl className="num mt-5 grid gap-2 border-t border-(--s7-ink)/12 pt-4 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-(--s7-muted)">Subtotal</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        {promo && promo.ok && (
          <div className="flex justify-between text-(--s7-accent-deep)">
            <dt>
              {promo.code} <span className="text-(--s7-muted)">{promo.label}</span>
            </dt>
            <dd>&minus;{formatINR(promo.discount)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-(--s7-muted)">{delivery === "express" ? "Express delivery" : "Delivery in India"}</dt>
          <dd>{shipping ? formatINR(shipping) : "Free"}</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-(--s7-ink)/12 pt-3">
          <dt className="font-medium">Total</dt>
          <dd className="d2 text-[34px]">{formatINR(total)}</dd>
        </div>
      </dl>
      {/* the code card: a small ticket tucked under the bag */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onCode(draft.trim() || null);
        }}
        className="mt-5 rounded-[22px] border border-dashed border-(--s7-ink)/25 bg-(--s7-surface)/60 p-4"
      >
        {promo && promo.ok ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-[15px]">
              <span className="num font-medium">{promo.code}</span> applied, you save {formatINR(promo.discount)}.
            </p>
            <button type="button" onClick={() => { onCode(null); setDraft(""); }} className="shrink-0 rounded-full px-3 py-1.5 text-[13.5px] font-medium ring-1 ring-(--s7-ink)/15 hover:bg-(--s7-surface)">
              Remove
            </button>
          </div>
        ) : (
          <>
            <label htmlFor="s7-code" className="text-[14px] font-medium">
              A code from the Circle
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="s7-code"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                autoComplete="off"
                aria-invalid={promo && !promo.ok ? true : undefined}
                aria-describedby="s7-code-hint"
                className="s7-input num h-11 rounded-full! py-0 uppercase"
              />
              <button type="submit" className="h-11 shrink-0 rounded-full bg-(--s7-ink) px-5 text-[14px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-95">
                Apply
              </button>
            </div>
            {promo && !promo.ok && <p className="s7-err mt-2">{promo.error}</p>}
            <p id="s7-code-hint" className="num mt-2 text-[13px] text-(--s7-muted)">
              Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15.
            </p>
          </>
        )}
      </form>
    </aside>
  );
}

/* ---------- empty bag ---------- */

function Empty() {
  const wood = useWood();
  const picks = starters(wood, 3);
  return (
    <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
      <div className="rounded-[28px] bg-(--s7-surface) px-5 py-10 md:rounded-[40px] md:px-10 md:py-12 lg:col-span-7 lg:rounded-[48px]">
        <p className="d2 text-[clamp(2.6rem,5.4vw,4.8rem)]">The bag is empty</p>
        <p className="mt-3 max-w-[46ch] text-[16px] leading-relaxed text-(--s7-muted)">
          Nothing to check out yet. The shop has every piece in {CONTENT[wood].name.toLowerCase()}, with filters for what it is for and what it costs.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href={SHOP}
            className="group inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-ink) pl-6 pr-2 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent)"
          >
            Open the shop
            <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
              <IconArrow width={16} height={16} />
            </span>
          </Link>
          <Link href={TRACK} className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-page)">
            Track an order
          </Link>
        </div>
      </div>
      <ul className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-2 rounded-[28px] bg-(--s7-clay) p-3 md:rounded-[40px] md:p-4 lg:col-span-5 lg:rounded-[48px]">
        <li className="px-3 pb-1 pt-2 text-[14px] text-(--s7-muted)">Small pieces to begin with</li>
        {picks.map((p) => (
          <li key={p.slug}>
            <Link href={productHref(p.slug)} className="group flex items-center gap-3 rounded-[22px] bg-(--s7-surface)/70 p-2 pr-4 transition hover:bg-(--s7-surface)">
              <span className="relative size-16 shrink-0 overflow-hidden rounded-[16px]">
                <ShotPhoto shot={shotOf(p)} sizes="64px" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="d3 block text-[17px]">{p.name}</span>
                <span className="block truncate text-[13.5px] text-(--s7-muted)">{p.short}</span>
              </span>
              <span className="num text-[15px] font-medium">{formatINR(p.price)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------- confirmation, in place ---------- */

function Confirmation({ order }: { order: Order }) {
  const t = trackingFor(order, order.placedAt);
  return (
    <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
      <motion.section
        initial={{ opacity: 0, y: 40, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
        className="rounded-[28px] bg-(--s7-surface) p-6 md:rounded-[40px] md:p-10 lg:col-span-7 lg:rounded-[48px]"
        role="status"
      >
        <p className="text-[14px] text-(--s7-muted)">Order placed, {formatDate(order.placedAt, true)}</p>
        <p className="d1 num mt-2 text-[clamp(3rem,8vw,6.4rem)]">{order.id}</p>
        <dl className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[20px] bg-(--s7-page) p-4">
            <dt className="text-[13px] text-(--s7-muted)">Expected at your door</dt>
            <dd className="d3 mt-1 text-[22px]">
              {formatDate(t.estimate.from)} to {formatDate(t.estimate.to)}
            </dd>
          </div>
          <div className="rounded-[20px] bg-(--s7-page) p-4">
            <dt className="text-[13px] text-(--s7-muted)">Going to</dt>
            <dd className="mt-1 text-[15px] leading-snug">
              {order.address.name}, {order.address.city} {order.address.pin}
            </dd>
          </div>
        </dl>
        <p className="mt-5 max-w-[54ch] text-[16px] leading-relaxed text-(--s7-body)">
          The workshop checks every piece against its record before it is packed. No money was taken: payments are not connected yet. The order is
          saved in this browser so you can follow it.
        </p>
        <div className="mt-7 flex flex-wrap gap-2">
          <Link
            href={`${TRACK}?o=${order.id}`}
            className="group inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-ink) pl-6 pr-2 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent)"
          >
            Track this order
            <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
              <IconArrow width={16} height={16} />
            </span>
          </Link>
          <Link href={ACCOUNT} className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-page)">
            Your orders
          </Link>
          <Link href={HOME} className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium text-(--s7-muted) transition hover:text-(--s7-ink)">
            Back to the deck
          </Link>
        </div>
      </motion.section>
      <aside className="self-start rounded-[28px] bg-(--s7-sage) p-6 md:rounded-[40px] md:p-8 lg:col-span-5 lg:rounded-[48px]">
        <h2 className="d3 text-[20px]">In the parcel</h2>
        <ul className="mt-4 grid gap-3">
          {order.lines.map((l) => (
            <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="flex items-center gap-4 border-b border-(--s7-ink)/10 pb-3 text-[15px]">
              <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
                <LinePhoto line={l} sizes="56px" />
              </span>
              <span className="min-w-0 flex-1">
                {l.name}
                <span className="block text-[13.5px] text-(--s7-muted)">
                  {CONTENT[l.wood].name}
                  {l.optionLabel ? `, ${l.optionLabel}` : ""}
                </span>
                {l.note && <span className="block text-[13px] text-(--s7-accent)">{l.note}</span>}
              </span>
              <span className="num shrink-0">&times; {l.qty}</span>
            </li>
          ))}
        </ul>
        <dl className="num mt-4 grid gap-1.5 text-[15px]">
          <div className="flex justify-between">
            <dt className="text-(--s7-muted)">Delivery</dt>
            <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
          </div>
          {order.discount ? (
            <div className="flex justify-between">
              <dt className="text-(--s7-muted)">Code {order.coupon}</dt>
              <dd>&minus;{formatINR(order.discount)}</dd>
            </div>
          ) : null}
          <div className="flex items-baseline justify-between">
            <dt className="text-(--s7-muted)">Total</dt>
            <dd className="d2 text-[34px]">{formatINR(order.total)}</dd>
          </div>
        </dl>
      </aside>
    </div>
  );
}
