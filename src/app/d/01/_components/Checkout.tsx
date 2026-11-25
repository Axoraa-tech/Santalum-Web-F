"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { saveAddress, signOut, useUser } from "@/lib/shop/account";
import { bagSummary, DELIVERY, useBag, type BagItem, type DeliveryId } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { applyCoupon, formatDate, PAYMENTS, placeOrder, trackingFor, type Order, type PaymentId } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { EASE, linePhoto, partNo, shotsOf } from "./data";
import { AddressForm, AddressLines, AuthTabs, type AddressDraft } from "./forms";
import { DraftOrderNo } from "./WorkOrder";

type Station = 1 | 2 | 3 | 4;

/** Checkout as a work order with four stations. Signing in is required before the order can be released. */
export function Checkout() {
  const hydrated = useHydrated();
  const user = useUser();
  const lines = useBag();
  const [station, setStation] = useState<Station>(2);
  const [addrId, setAddrId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AddressDraft | null>(null);
  const [adding, setAdding] = useState(false);
  const [delivery, setDelivery] = useState<DeliveryId>("standard");
  const [payment, setPayment] = useState<PaymentId>("upi");
  const [gift, setGift] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [placed, setPlaced] = useState<Order | null>(null);
  const [code, setCode] = useState<string | null>(null);

  const sum = bagSummary(lines, delivery);
  const promo = code ? applyCoupon(code, sum.subtotal) : null;
  const discount = promo?.ok ? promo.discount : 0;
  const total = sum.total - discount;
  const codOk = total < 10000;

  if (!hydrated) return <Frame count={0} body={<p className={`${s.mono} py-16 text-[12px] text-(--steel)`}>Reading the work order</p>} />;
  if (placed) return <Released order={placed} />;
  if (sum.count === 0) {
    return (
      <Frame
        count={0}
        body={
          <div className="grid gap-8 border border-dashed border-(--hair-2) bg-(--sheet) px-6 py-14 md:grid-cols-[1fr_auto] md:items-end md:px-10">
            <div>
              <p className={`${s.x110} text-[clamp(1.8rem,3vw,2.6rem)] font-[600] leading-tight`}>No pieces on this work order.</p>
              <p className="mt-3 max-w-md text-[16px] leading-[1.6] text-(--ink-2)">
                <WT red="Add parts from the red catalogue, then come back to release the order." white="Add pieces from the white catalogue, then come back to release the order." />
              </p>
            </div>
            <Link href="/d/01/shop" className={s.btn}>
              <WT red="Open the parts catalogue" white="Open the lot catalogue" />
            </Link>
          </div>
        }
      />
    );
  }

  const open: Station = user ? station : 1;
  const saved = user?.addresses ?? [];
  const chosen = saved.find((a) => a.id === addrId) ?? saved.find((a) => a.isDefault) ?? saved[0];
  const address: AddressDraft | null = draft ?? (chosen ? { ...chosen } : null);
  const showForm = adding || saved.length === 0;

  const place = () => {
    if (!address) return setStation(2);
    if (payment === "cod" && !codOk) return setError("Pay on delivery is available for orders under ₹10,000. Choose another payment.");
    const addr = { label: address.label, name: address.name, phone: address.phone, line1: address.line1, line2: address.line2, city: address.city, state: address.state, pin: address.pin };
    const r = placeOrder({ lines, address: addr, delivery, payment, giftNote: gift.trim() || undefined, coupon: promo?.ok ? promo.code : undefined });
    if (!r.ok) return setError(r.error);
    setPlaced(r.order);
    window.scrollTo({ top: 0 });
  };

  return (
    <Frame
      count={sum.count}
      body={
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="space-y-4 lg:col-span-7">
            <Block n={1} title="Account" open={open === 1} done={!!user}
              summary={
                user && (
                  <p className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-[15px]">
                    <span>
                      Signed in as <strong className="font-[600]">{user.name}</strong>
                    </span>
                    <span className="text-(--ink-2)">
                      Not you?{" "}
                      <button type="button" onClick={() => signOut()} className={`${s.link} text-(--ink)`}>
                        Sign out
                      </button>
                    </span>
                  </p>
                )
              }
            >
              <p className="mb-6 max-w-[34rem] text-[16px] leading-[1.6] text-(--ink-2)">
                Sign in to release the order, so you can track it and find it again in your account.
              </p>
              <AuthTabs onDone={() => setStation(2)} />
            </Block>

            <Block n={2} title="Deliver to" open={open === 2} done={!!user && open > 2 && !!address} locked={!user}
              onEdit={() => setStation(2)}
              summary={address && <AddressLines a={address} />}
            >
              {saved.length > 0 && !adding && (
                <div role="radiogroup" aria-label="Saved addresses" className="grid gap-3 sm:grid-cols-2">
                  {saved.map((a) => {
                    const on = !draft && chosen?.id === a.id;
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
                        className={`relative border p-4 text-left transition-colors hover:border-(--ink) ${on ? "border-(--ink) bg-(--sheet)" : "border-(--hair-2)"}`}
                      >
                        <span className={`${s.mono} mb-2 flex items-center justify-between text-[11px] text-(--steel)`}>
                          {a.label}
                          {a.isDefault && <span>Default</span>}
                        </span>
                        <AddressLines a={a} />
                        {on && <span aria-hidden className="absolute right-3 top-3 size-2.5 rounded-full bg-(--accent)" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {showForm ? (
                <div className={saved.length ? "mt-6 border-t border-(--hair-2) pt-6" : ""}>
                  <AddressForm
                    initial={{ name: user?.name ?? "", phone: user?.phone ?? "" }}
                    submitLabel="Use this address"
                    saveOption
                    onCancel={saved.length ? () => setAdding(false) : undefined}
                    onSubmit={(a, save) => {
                      if (save) {
                        const s2 = saveAddress({ ...a, isDefault: saved.length === 0 });
                        setAddrId(s2.id);
                        setDraft(null);
                      } else setDraft(a);
                      setAdding(false);
                      setStation(3);
                    }}
                  />
                </div>
              ) : (
                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <button type="button" className={s.btn} onClick={() => setStation(3)} disabled={!address}>
                    Deliver here
                  </button>
                  <button type="button" className={s.link} onClick={() => setAdding(true)}>
                    Add a new address
                  </button>
                </div>
              )}
            </Block>

            <Block n={3} title="Delivery and payment" open={open === 3} done={!!user && open > 3} locked={!user || !address}
              onEdit={() => setStation(3)}
              summary={
                <p className={`${s.mono} text-[12.5px] text-(--ink-2)`}>
                  {DELIVERY[delivery].label}, {PAYMENTS.find((p) => p.id === payment)?.label}
                  {gift.trim() ? ", with a gift note" : ""}
                </p>
              }
            >
              <fieldset>
                <legend className={`${s.mono} text-[11px] text-(--steel)`}>Delivery</legend>
                <div className="mt-2 border-t border-(--ink)">
                  {(Object.values(DELIVERY) as (typeof DELIVERY)[DeliveryId][]).map((d) => (
                    <Choice key={d.id} name="delivery" checked={delivery === d.id} onChange={() => setDelivery(d.id)} label={d.label} right={d.price ? formatINR(d.price) : "Free"} />
                  ))}
                </div>
              </fieldset>
              <fieldset className="mt-8">
                <legend className={`${s.mono} text-[11px] text-(--steel)`}>Payment</legend>
                <div className="mt-2 border-t border-(--ink)">
                  {PAYMENTS.map((p) => (
                    <Choice
                      key={p.id}
                      name="payment"
                      checked={payment === p.id}
                      disabled={p.id === "cod" && !codOk}
                      onChange={() => {
                        setPayment(p.id);
                        setError(null);
                      }}
                      label={p.label}
                      right={p.id === "cod" && !codOk ? "Under ₹10,000 only" : p.note}
                    />
                  ))}
                </div>
                <p className={`${s.mono} mt-3 flex items-start gap-2 text-[12px] leading-[1.5] text-(--ink-2)`}>
                  <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-(--accent)" />
                  Payments are not connected yet, so no money is taken. Preview: accounts and orders are saved in this browser until our store opens.
                </p>
              </fieldset>
              <label className={`${s.field} mt-8`}>
                <textarea rows={2} maxLength={240} value={gift} onChange={(e) => setGift(e.target.value)} placeholder=" " />
                <span>Gift note or workshop note (optional)</span>
              </label>
              <button type="button" className={`${s.btn} mt-7`} onClick={() => setStation(4)}>
                Review the order
              </button>
            </Block>

            <Block n={4} title="Review and release" open={open === 4} locked={!user || !address}>
              <dl className="grid gap-4 text-[15px] sm:grid-cols-2">
                <div>
                  <dt className={`${s.mono} text-[11px] text-(--steel)`}>Deliver to</dt>
                  <dd className="mt-1">{address && <AddressLines a={address} />}</dd>
                </div>
                <div>
                  <dt className={`${s.mono} text-[11px] text-(--steel)`}>Delivery and payment</dt>
                  <dd className="mt-1">
                    {DELIVERY[delivery].label}
                    <br />
                    {PAYMENTS.find((p) => p.id === payment)?.label}
                    {gift.trim() && <span className="mt-1 block text-(--ink-2)">Note: {gift.trim()}</span>}
                  </dd>
                </div>
              </dl>
              {error && (
                <p role="alert" className={`${s.mono} mt-5 border-l-2 border-(--bad) px-3 py-2 text-[12.5px] text-(--bad)`}>
                  {error}
                </p>
              )}
              <button type="button" className={`${s.btn} mt-7 w-full justify-between sm:w-auto`} onClick={place}>
                <span>Place order</span>
                <span className="tabular-nums opacity-80">{formatINR(total)}</span>
              </button>
              <p className="mt-3 text-[14px] text-(--steel)">No money is taken in this preview.</p>
            </Block>
          </div>

          {/* Bill of materials */}
          <aside className="lg:col-span-5">
            <div className="border border-(--ink) bg-(--sheet) lg:sticky lg:top-[76px]">
              <div className={`${s.mono} grid grid-cols-[1fr_3rem_6rem] gap-2 border-b border-(--ink) px-5 py-2.5 text-[10.5px] text-(--steel)`}>
                <span>Item</span>
                <span className="text-center">Qty</span>
                <span className="text-right">Amount</span>
              </div>
              <ul>
                {sum.items.map((it) => (
                  <BomLine key={it.key} item={it} />
                ))}
              </ul>
              <dl className={`${s.mono} border-t border-(--ink) px-5 pt-3 text-[12.5px]`}>
                <Row k="Subtotal" v={formatINR(sum.subtotal)} />
                <Row k={delivery === "express" ? "Express delivery" : "Delivery in India"} v={sum.shipping ? formatINR(sum.shipping) : "Free"} />
                {promo?.ok && (
                  <div className="flex justify-between py-1 text-(--accent)">
                    <dt>Code {promo.code}</dt>
                    <dd className="tabular-nums">−{formatINR(promo.discount)}</dd>
                  </div>
                )}
                <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-(--hair-2) py-4">
                  <dt>Total</dt>
                  <dd className={`${s.x110} font-[family-name:var(--f01-archivo)] text-[30px] font-[600] tabular-nums`}>{formatINR(total)}</dd>
                </div>
              </dl>
              <Coupon code={code} promo={promo} onApply={setCode} />
            </div>
          </aside>
        </div>
      }
    />
  );
}

function Frame({ count, body }: { count: number; body: ReactNode }) {
  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto_auto_auto]">
          <div className="px-5 py-5 md:px-7">
            <h1 className={`${s.x125} text-[clamp(2.2rem,5vw,4.4rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>Work order</h1>
            <p className="mt-2 text-[16px] text-(--ink-2)">Four stations: account, address, delivery and payment, release.</p>
          </div>
          <TitleCell k={count ? "Order no., on release" : "Order no."} v={count ? <DraftOrderNo /> : "None yet"} />
          <TitleCell k="Pieces" v={String(count)} />
          <TitleCell k="Sheet" v="1 of 1" />
        </div>
        <div className="mt-10">{body}</div>
      </div>
    </div>
  );
}

function TitleCell({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] md:block md:border-l md:border-t-0 md:px-6 md:py-5`}>
      <span className="block text-[10.5px] text-(--steel)">{k}</span>
      <span className="block tabular-nums md:mt-2 md:text-[15px]">{v}</span>
    </div>
  );
}

function Block({
  n,
  title,
  open,
  done = false,
  locked = false,
  summary,
  onEdit,
  children,
}: {
  n: number;
  title: string;
  open: boolean;
  done?: boolean;
  locked?: boolean;
  summary?: ReactNode;
  onEdit?: () => void;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={`l01-st-${n}`} className={`border-t border-(--ink) pt-5 ${locked && !open ? "opacity-55" : ""}`}>
      <div className="grid gap-5 md:grid-cols-[3.5rem_1fr]">
        <span
          aria-hidden
          className={`${s.mono} grid size-9 place-items-center rounded-full border text-[13px] tabular-nums ${done && !open ? "border-(--accent) bg-(--accent) text-(--paper)" : "border-(--ink)"}`}
        >
          {done && !open ? "✓" : n}
        </span>
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-4">
            <h2 id={`l01-st-${n}`} className={`${s.x110} text-[24px] font-[600] leading-none tracking-[-0.01em]`}>
              {title}
            </h2>
            {!open && done && onEdit && (
              <button type="button" onClick={onEdit} className={s.link}>
                Change
              </button>
            )}
          </div>
          {open ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }} className="mt-5 pb-6">
              {children}
            </motion.div>
          ) : (
            summary && done && <div className="mt-3 pb-4">{summary}</div>
          )}
          {!open && locked && <p className={`${s.mono} mt-2 pb-3 text-[11.5px] text-(--steel)`}>Opens after the station above</p>}
        </div>
      </div>
    </section>
  );
}

function Choice({ name, checked, onChange, label, right, disabled = false }: { name: string; checked: boolean; onChange: () => void; label: string; right: string; disabled?: boolean }) {
  return (
    <label
      className={`grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-(--hair-2) px-1 py-3 transition-colors ${
        disabled ? "cursor-not-allowed opacity-45" : "cursor-pointer hover:bg-(--wash)"
      } ${checked ? "bg-(--wash)" : ""}`}
    >
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="peer sr-only" />
      <span className="grid size-5 place-items-center rounded-full border border-(--hair-2) peer-checked:border-(--ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)">
        {checked && <span className="size-2.5 rounded-full bg-(--accent)" />}
      </span>
      <span className="text-[15px]">{label}</span>
      <span className={`${s.mono} text-right text-[12px] text-(--steel)`}>{right}</span>
    </label>
  );
}

/** The discount code, as a small punched ticket at the foot of the bill. */
function Coupon({ code, promo, onApply }: { code: string | null; promo: ReturnType<typeof applyCoupon> | null; onApply: (c: string | null) => void }) {
  const [value, setValue] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const apply = (e: FormEvent) => {
    e.preventDefault();
    const v = value.trim().toUpperCase();
    if (!v) return setErr("Enter a code first.");
    onApply(v);
    setErr(null);
  };
  const bad = code && promo && !promo.ok ? promo.error : err;
  return (
    <div className="border-t border-(--hair-2) px-5 py-4">
      {promo?.ok ? (
        <div className="flex items-center justify-between gap-3">
          <p className={`${s.mono} text-[12px]`}>
            <span className={`${s.stamp} mr-2 inline-block rotate-[-3deg] rounded-[3px] px-1.5 py-0.5 font-medium`}>{promo.code}</span>
            {promo.label}
          </p>
          <button type="button" onClick={() => {
              onApply(null);
              setValue("");
            }} className={s.link}>
            Remove
          </button>
        </div>
      ) : (
        <form onSubmit={apply} className="grid grid-cols-[1fr_auto] items-end gap-3" noValidate>
          <label className={s.field} data-error={bad ? "" : undefined}>
            <input value={value} onChange={(e) => setValue(e.target.value)} placeholder=" " autoComplete="off" autoCapitalize="characters" aria-describedby={bad ? "l01-coupon-err" : "l01-coupon-hint"} />
            <span>Discount code</span>
          </label>
          <button type="submit" className={`${s.btnLine} h-10!`}>
            Apply
          </button>
          {bad && (
            <span id="l01-coupon-err" role="alert" className={`${s.err} col-span-2`}>
              {bad}
            </span>
          )}
        </form>
      )}
      <p id="l01-coupon-hint" className={`${s.mono} mt-3 text-[11px] leading-[1.5] text-(--steel)`}>
        Preview codes: WELCOME10, CIRCLE500, HEARTWOOD15
      </p>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between py-1">
      <dt className="text-(--ink-2)">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}

function BomLine({ item }: { item: BagItem }) {
  const p = item.product;
  return (
    <li className="grid grid-cols-[1fr_3rem_6rem] items-center gap-2 border-b border-(--hair) px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
          <Photo p={shotsOf(p)[0].photo} tone={shotsOf(p)[0].tone} sizes="44px" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-[520]">{p.name}</p>
          <p className={`${s.mono} truncate text-[10.5px] text-(--steel)`}>
            {partNo(p.slug)} {item.optionValue ? `${item.optionValue.label}, ` : ""}
            {CONTENT[p.wood].latin}
          </p>
        </div>
      </div>
      <span className={`${s.mono} text-center text-[12.5px] tabular-nums`}>{item.qty}</span>
      <span className={`${s.mono} text-right text-[12.5px] tabular-nums`}>{formatINR(item.total)}</span>
    </li>
  );
}

function Released({ order }: { order: Order }) {
  const est = trackingFor(order, order.placedAt).estimate;
  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto grid max-w-[1400px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <motion.p
            initial={{ scale: 1.6, opacity: 0, rotate: -14 }}
            animate={{ scale: 1, opacity: 0.9, rotate: -8 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`${s.stamp} ${s.mono} inline-block rounded-[4px] px-3 py-1.5 text-[14px] font-medium`}
          >
            Released to the workshop
          </motion.p>
          <h1 className={`${s.x125} mt-8 max-w-[13ch] text-[clamp(2.4rem,5.2vw,4.6rem)] font-[600] leading-[1.04] tracking-[-0.03em]`}>Thank you. It goes on the bench next.</h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-(--ink-2)">
            Order <span className={`${s.mono} text-(--ink)`}>{order.id}</span> is with the workshop. Each piece is checked against its record and packed before it
            leaves for {order.address.city}.
          </p>
          <p className="mt-4 text-[16px]">
            Estimated delivery: <strong className="font-[600]">{formatDate(est.from)}</strong> to <strong className="font-[600]">{formatDate(est.to)}</strong>
          </p>
          <p className={`${s.mono} mt-4 text-[12px] text-(--steel)`}>Preview only. No payment was taken and nothing was sent.</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href={`/d/01/track?o=${order.id}`} className={s.btn}>
              Track this order
            </Link>
            <Link href="/d/01/account" className={s.btnLine}>
              Your orders
            </Link>
          </div>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="border border-(--ink) bg-(--sheet)">
            <div className={`${s.mono} grid grid-cols-2 border-b border-(--ink) text-[12px]`}>
              <div className="border-r border-(--hair-2) px-5 py-4">
                <span className="block text-[10.5px] text-(--steel)">Order no.</span>
                <span className="mt-1 block tabular-nums">{order.id}</span>
              </div>
              <div className="px-5 py-4">
                <span className="block text-[10.5px] text-(--steel)">Released</span>
                <span className="mt-1 block">{formatDate(order.placedAt, true)}</span>
              </div>
            </div>
            <ul>
              {order.lines.map((l) => (
                <li key={`${l.slug}-${l.option ?? ""}`} className="grid grid-cols-[1fr_3rem_6rem] items-center gap-2 border-b border-(--hair) px-5 py-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                      <Photo p={linePhoto(l)} sizes="44px" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[14.5px] font-[520]">{l.name}</p>
                      <p className={`${s.mono} truncate text-[10.5px] text-(--steel)`}>
                        {l.optionLabel ? `${l.optionLabel}, ` : ""}
                        {CONTENT[l.wood].latin}
                      </p>
                    </div>
                  </div>
                  <span className={`${s.mono} text-center text-[12.5px] tabular-nums`}>{l.qty}</span>
                  <span className={`${s.mono} text-right text-[12.5px] tabular-nums`}>{formatINR(l.unitPrice * l.qty)}</span>
                </li>
              ))}
            </ul>
            {order.coupon && (
              <div className={`${s.mono} flex justify-between px-5 pt-4 text-[12.5px] text-(--accent)`}>
                <span>Code {order.coupon}</span>
                <span className="tabular-nums">−{formatINR(order.discount ?? 0)}</span>
              </div>
            )}
            <div className="flex items-baseline justify-between px-5 py-4">
              <span className={`${s.mono} text-[12.5px]`}>Total</span>
              <span className={`${s.x110} text-[28px] font-[600] tabular-nums`}>{formatINR(order.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
