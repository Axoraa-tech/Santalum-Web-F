"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { saveAddress, signOut, useUser } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { AddressForm, AddressLines, type AddressDraft } from "./AddressForm";
import { AuthChoice } from "./AuthForms";
import { Field, PreviewNote, SHOP, useHydrated } from "./bits";

const EASE = [0.22, 1, 0.36, 1] as const;
const COD_LIMIT = 10000;

type Step = 1 | 2 | 3 | 4;

/** Checkout, strung like everything else: four knots on one thread, the bag a strand of beads beside it. */
export function Checkout() {
  const hydrated = useHydrated();
  const lines = useBag();
  const user = useUser();
  const [placed, setPlaced] = useState<Order | null>(null);
  const [step, setStep] = useState<Step>(2);
  const [addrChoice, setAddrChoice] = useState<string | null>(null);
  const [oneOff, setOneOff] = useState<AddressDraft | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [codeErr, setCodeErr] = useState<string | null>(null);
  const id = useId();

  if (placed) return <Confirmation o={placed} />;
  if (!hydrated) return <div className="min-h-[80svh]" aria-hidden />;

  const sum = bagSummary(lines, delivery);
  if (sum.count === 0) return <EmptyBag />;

  // signing out sends the thread back to the first knot
  const open: Step = user ? step : 1;
  const saved = user?.addresses ?? [];
  const chosenId = addrChoice ?? saved.find((a) => a.isDefault)?.id ?? saved[0]?.id ?? null;
  const chosenSaved = saved.find((a) => a.id === chosenId);
  const address: AddressDraft | null = oneOff ?? (chosenSaved ? strip(chosenSaved) : null);
  const promo = coupon ? applyCoupon(coupon, sum.subtotal) : null;
  const discount = promo && promo.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const codBlocked = total >= COD_LIMIT;
  const apply = (e: FormEvent) => {
    e.preventDefault();
    const r = applyCoupon(code, sum.subtotal);
    if (r.ok) {
      setCoupon(r.code);
      setCodeErr(null);
    } else setCodeErr(r.error);
  };
  const pay: PaymentId = payment === "cod" && codBlocked ? "upi" : payment;
  const showForm = adding || (saved.length === 0 && !oneOff);

  const place = () => {
    if (!address) return setStep(2);
    const r = placeOrder({ lines, address, delivery, payment: pay, giftNote: gift.trim() || undefined, coupon: discount ? coupon! : undefined });
    if (!r.ok) return setError(r.error);
    setPlaced(r.order);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-32 pt-24 md:px-10 md:pt-32">
      <h1 className="s3-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.92]">Checkout</h1>
      <p className="mt-3 max-w-[36rem] text-[16px] leading-[1.6] text-(--ink)/75">
        Four knots on one thread. Each one ties when it is done; sign in first, so we can tell you where your order is.
      </p>

      <div className="mt-12 grid gap-14 md:grid-cols-12 md:gap-10">
        <ol className="relative md:col-span-7" aria-label="Checkout steps">
          <span className="absolute bottom-10 left-[8.5px] top-4 w-px bg-(--thread)" aria-hidden />

          <StepKnot n={1} title="Account" state={user ? "done" : "open"}>
            {user ? (
              <p className="text-[16px]">
                Signed in as {user.name}. Not you?{" "}
                <button type="button" className="s3-link" onClick={signOut}>
                  Sign out
                </button>
              </p>
            ) : (
              <>
                <p className="mb-6 text-[16px] leading-[1.6] text-(--ink)/75">
                  An account keeps your orders and their tracking together. Sign in, or create one in a minute.
                </p>
                <AuthChoice />
              </>
            )}
          </StepKnot>

          <StepKnot
            n={2}
            title="Address"
            state={open === 2 ? "open" : open > 2 ? "done" : "locked"}
            onChange={open > 2 ? () => setStep(2) : undefined}
            summary={address ? <AddressLines a={address} /> : null}
          >
            {saved.length > 0 && !adding && (
              <fieldset>
                <legend className="sr-only">Saved addresses</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {saved.map((a) => (
                    <label key={a.id} className="s3-choice">
                      <input
                        type="radio"
                        name={`${id}-addr`}
                        className="sr-only"
                        checked={!oneOff && chosenId === a.id}
                        onChange={() => {
                          setOneOff(null);
                          setAddrChoice(a.id);
                        }}
                      />
                      <span className="s3-choice-dot" aria-hidden />
                      <span className="min-w-0">
                        <span className="s3-serif block text-[20px] leading-tight">
                          {a.label}
                          {a.isDefault && <span className="ml-2 align-middle font-[family-name:var(--font-figtree)] text-[13px] text-(--muted)">default</span>}
                        </span>
                        <span className="mt-1 block">
                          <AddressLines a={a} />
                        </span>
                      </span>
                    </label>
                  ))}
                  {oneOff && (
                    <label className="s3-choice">
                      <input type="radio" name={`${id}-addr`} className="sr-only" checked readOnly />
                      <span className="s3-choice-dot" aria-hidden />
                      <span className="min-w-0">
                        <span className="s3-serif block text-[20px] leading-tight">{oneOff.label}, this order only</span>
                        <span className="mt-1 block">
                          <AddressLines a={oneOff} />
                        </span>
                      </span>
                    </label>
                  )}
                </div>
                <button type="button" className="s3-link mt-5 text-[15px]" onClick={() => setAdding(true)}>
                  Deliver to a new address
                </button>
              </fieldset>
            )}
            {showForm && (
              <AddressForm
                initial={{ name: user?.name ?? "", phone: user?.phone ?? "" }}
                submitLabel="Use this address"
                saveOption
                onCancel={saved.length > 0 ? () => setAdding(false) : undefined}
                onSubmit={(a, o) => {
                  if (o.save) {
                    const s = saveAddress({ ...a, isDefault: saved.length === 0 });
                    setOneOff(null);
                    setAddrChoice(s.id);
                  } else setOneOff(a);
                  setAdding(false);
                  setStep(3);
                }}
              />
            )}
            {!showForm && (
              <button type="button" className="s3-btn s3-btn-dark mt-6" disabled={!address} onClick={() => setStep(3)}>
                <span className="s3-bead s3-btn-bead" aria-hidden />
                Deliver here
              </button>
            )}
          </StepKnot>

          <StepKnot
            n={3}
            title="Delivery and payment"
            state={open === 3 ? "open" : open > 3 ? "done" : "locked"}
            onChange={open > 3 ? () => setStep(3) : undefined}
            summary={
              <span className="block text-[16px] leading-[1.55]">
                {DELIVERY[delivery].label}, {DELIVERY[delivery].price ? formatINR(DELIVERY[delivery].price) : "free"}
                <br />
                {PAYMENTS.find((p) => p.id === pay)?.label}
                {gift.trim() && (
                  <>
                    <br />
                    <span className="text-(--muted)">With a gift note</span>
                  </>
                )}
              </span>
            }
          >
            <fieldset>
              <legend className="text-[14px] text-(--muted)">Delivery</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {(Object.keys(DELIVERY) as DeliveryId[]).map((k) => (
                  <label key={k} className="s3-choice">
                    <input type="radio" name={`${id}-del`} className="sr-only" checked={delivery === k} onChange={() => setDelivery(k)} />
                    <span className="s3-choice-dot" aria-hidden />
                    <span>
                      <span className="block text-[16px]">{DELIVERY[k].label}</span>
                      <span className="mt-0.5 block text-[14px] text-(--muted)">{DELIVERY[k].price ? formatINR(DELIVERY[k].price) : "Free across India"}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="mt-8">
              <legend className="text-[14px] text-(--muted)">Payment</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PAYMENTS.map((p) => {
                  const off = p.id === "cod" && codBlocked;
                  return (
                    <label key={p.id} className="s3-choice">
                      <input type="radio" name={`${id}-pay`} className="sr-only" checked={pay === p.id} disabled={off} onChange={() => setPayment(p.id)} />
                      <span className="s3-choice-dot" aria-hidden />
                      <span>
                        <span className="block text-[16px]">{p.label}</span>
                        <span className="mt-0.5 block text-[14px] text-(--muted)">{off ? `Only for orders under ${formatINR(COD_LIMIT)}` : p.note}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="mt-4 text-[15px] text-(--ink)/80">Payments are not connected yet, so no money is taken.</p>
            </fieldset>
            <div className="mt-8">
              <Field label="A gift note (optional)" hint="It travels with the pieces; the prices do not.">
                {(a) => <textarea {...a} name="gift" rows={3} maxLength={300} value={gift} onChange={(e) => setGift(e.target.value)} className="s3-input" />}
              </Field>
            </div>
            <PreviewNote className="mt-5" />
            <button type="button" className="s3-btn s3-btn-dark mt-6" onClick={() => setStep(4)}>
              <span className="s3-bead s3-btn-bead" aria-hidden />
              Review the order
            </button>
          </StepKnot>

          <StepKnot n={4} title="Review and place" state={open === 4 ? "open" : "locked"} last>
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-[14px] text-(--muted)">Delivering to</p>
                <div className="mt-1">{address && <AddressLines a={address} />}</div>
              </div>
              <div>
                <p className="text-[14px] text-(--muted)">Delivery and payment</p>
                <p className="mt-1 text-[16px] leading-[1.55]">
                  {DELIVERY[delivery].label}
                  <br />
                  {PAYMENTS.find((p) => p.id === pay)?.label}, not charged in this preview
                </p>
                {gift.trim() && <p className="mt-2 text-[15px] italic text-(--ink)/75">&ldquo;{gift.trim()}&rdquo;</p>}
              </div>
            </div>
            {error && (
              <p role="alert" className="s3-err mt-5">
                {error}
              </p>
            )}
            <button type="button" className="s3-btn s3-btn-dark mt-7 h-14 px-7 text-[16px]" onClick={place}>
              <span className="s3-bead s3-btn-bead" aria-hidden />
              Place order, {formatINR(total)}
            </button>
          </StepKnot>
        </ol>

        <aside className="md:col-span-4 md:col-start-9" aria-label="Your bag">
          <div className="rounded-[28px] bg-(--warm) p-6 md:sticky md:top-28 md:p-7">
            <h2 className="s3-serif text-[28px] leading-none">On the thread</h2>
            <ul className="relative mt-6">
              <span className="absolute bottom-8 left-[27px] top-6 w-px bg-(--thread)" aria-hidden />
              {sum.items.map((l) => (
                <SummaryLine key={l.key} l={l} />
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-(--line) pt-4 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-(--muted)">Subtotal</dt>
                <dd>{formatINR(sum.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--muted)">Delivery</dt>
                <dd>{sum.shipping ? formatINR(sum.shipping) : "Free"}</dd>
              </div>
              {discount > 0 && promo?.ok && (
                <div className="flex justify-between gap-3 text-(--m-accent)">
                  <dt>
                    {promo.code}
                    <button type="button" className="ml-2 text-[13px] text-(--muted) underline decoration-(--thread) underline-offset-4 hover:text-(--ink)" onClick={() => setCoupon(null)}>
                      remove
                    </button>
                  </dt>
                  <dd className="tabular-nums">−{formatINR(discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-(--line) pt-3">
                <dt>Total</dt>
                <dd className="s3-serif text-[28px] leading-none">{formatINR(total)}</dd>
              </div>
            </dl>
            {/* a code, knotted onto the thread */}
            <form onSubmit={apply} noValidate className="mt-6 border-t border-(--line) pt-5" aria-label="A code">
              <label htmlFor={`${id}-code`} className="text-[14px] text-(--muted)">
                {coupon && discount ? `${promo && promo.ok ? promo.label : ""}` : "Have a code?"}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id={`${id}-code`}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(codeErr)}
                  aria-describedby={`${id}-code-h${codeErr ? ` ${id}-code-e` : ""}`}
                  className="s3-input min-w-0 flex-1 uppercase tracking-[0.04em]"
                />
                <button type="submit" className="s3-btn s3-btn-line">
                  Apply
                </button>
              </div>
              {codeErr && (
                <p id={`${id}-code-e`} className="s3-err">
                  {codeErr}
                </p>
              )}
              <p id={`${id}-code-h`} className="mt-2 text-[13px] text-(--muted)">
                Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15.
              </p>
            </form>
          </div>
        </aside>
      </div>
    </div>
  );
}

const strip = (a: AddressDraft & { id?: string; isDefault?: boolean }): AddressDraft => ({
  label: a.label,
  name: a.name,
  phone: a.phone,
  line1: a.line1,
  line2: a.line2,
  city: a.city,
  state: a.state,
  pin: a.pin,
});

function StepKnot({
  n,
  title,
  state,
  summary,
  onChange,
  children,
  last = false,
}: {
  n: number;
  title: string;
  state: "open" | "done" | "locked";
  summary?: ReactNode;
  onChange?: () => void;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <li className={`relative grid grid-cols-[2.5rem_1fr] ${last ? "" : "pb-12"}`} aria-current={state === "open" ? "step" : undefined}>
      <span
        className={`relative mt-[9px] block h-[18px] w-[18px] rounded-full ${
          state === "done" ? "s3-bead" : state === "open" ? "s3-knot !h-[18px] !w-[18px]" : "border border-(--thread) bg-(--linen)"
        }`}
        aria-hidden
      />
      <section aria-labelledby={`step-${n}`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 id={`step-${n}`} className="flex items-baseline gap-3">
            <span className="text-[13px] text-(--muted)">{n} of 4</span>
            <span className={`s3-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none ${state === "locked" ? "text-(--muted)" : ""}`}>{title}</span>
          </h2>
          {state === "done" && onChange && (
            <button type="button" className="s3-link text-[15px]" onClick={onChange}>
              Change
            </button>
          )}
        </div>
        {state === "open" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }} className="mt-5">
            {children}
          </motion.div>
        )}
        {state === "done" && (summary || n === 1) && <div className="mt-3 text-(--ink)/85">{n === 1 ? children : summary}</div>}
      </section>
    </li>
  );
}

function SummaryLine({ l }: { l: BagItem }) {
  const shot = l.product.shots[0];
  return (
    <li className="relative flex items-center gap-4 pb-4">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_rgba(176,141,87,0.55)]">
        <Photo p={shot.photo} tone={shot.tone} sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px]">{l.product.name}</span>
        <span className="block text-[13px] text-(--muted)">
          {CONTENT[l.product.wood].short}
          {l.optionValue ? `, ${l.optionValue.label}` : ""}
          {l.qty > 1 ? `, ${l.qty} pieces` : ""}
        </span>
        {l.note && <span className="block text-[13px] text-(--muted)">{l.note}</span>}
      </span>
      <span className="text-[15px] tabular-nums">{formatINR(l.total)}</span>
    </li>
  );
}

function EmptyBag() {
  return (
    <div className="mx-auto flex min-h-[78svh] max-w-[1360px] flex-col justify-center px-4 pt-24 md:px-10">
      <div className="flex items-center gap-4" aria-hidden>
        <span className="h-px w-24 bg-(--thread)" />
        <span className="s3-knot" />
        <span className="h-px w-10 bg-(--thread)" />
      </div>
      <h1 className="s3-serif mt-8 text-[clamp(3rem,7vw,6.5rem)] leading-[0.92]">Nothing on the thread yet</h1>
      <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-(--ink)/75">
        Your bag is empty. The shop has every piece in both woods, strung by category.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={SHOP} className="s3-btn s3-btn-dark">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          Go to the shop
        </Link>
        <Link href="/d/03/track" className="s3-btn s3-btn-line">
          Track an order
        </Link>
      </div>
    </div>
  );
}

function Confirmation({ o }: { o: Order }) {
  const t = trackingFor(o, o.placedAt);
  const first = o.name.split(" ")[0];
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-32 pt-28 md:px-10 md:pt-36">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} role="status">
        <p className="text-[15px] text-(--muted)">
          Order <span className="tabular-nums text-(--ink)">{o.id}</span>
        </p>
        <h1 className="s3-serif mt-3 text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.92]">
          Thank you{first ? `, ${first}` : ""}.
          <br />
          It&apos;s on the thread.
        </h1>
        <p className="mt-6 max-w-[36rem] text-[17px] leading-[1.6] text-(--ink)/80">
          Expected between {formatDate(t.estimate.from)} and {formatDate(t.estimate.to)}, to {o.address.city}, {o.address.state}. This is a preview:
          no payment was taken.
        </p>
      </motion.div>
      <div className="relative mt-14 overflow-x-auto pb-10">
        <ul className="relative flex min-w-max items-start gap-8 pt-2">
          <span className="absolute -left-6 -right-6 top-[46px] h-px bg-(--thread)" aria-hidden />
          {o.lines.map((l) => (
            <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="w-[160px]">
              <span className="relative block h-[88px] w-[88px] overflow-hidden rounded-full border-[3px] border-(--linen) shadow-[0_0_0_1px_rgba(176,141,87,0.55)]">
                <Photo p={{ id: l.photoId, alt: l.name }} sizes="88px" />
              </span>
              <span className="mt-3 block text-[15px]">{l.name}</span>
              <span className="block text-[13px] text-(--muted)">
                {CONTENT[l.wood].short}
                {l.optionLabel ? `, ${l.optionLabel}` : ""}
                {l.qty > 1 ? `, ${l.qty}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <p className="flex flex-wrap items-baseline gap-3">
        <span className="text-[14px] text-(--muted)">Total</span>
        <span className="s3-serif text-[32px]">{formatINR(o.total)}</span>
        {o.coupon && o.discount ? (
          <span className="text-[14px] text-(--m-accent)">
            {o.coupon} saved {formatINR(o.discount)}
          </span>
        ) : null}
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/d/03/track?o=${o.id}`} className="s3-btn s3-btn-dark">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          Track this order
        </Link>
        <Link href="/d/03/account" className="s3-btn s3-btn-line">
          Your orders
        </Link>
      </div>
    </div>
  );
}
