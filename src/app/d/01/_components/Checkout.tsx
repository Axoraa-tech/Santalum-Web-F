"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { s } from "./cx";
import { EASE, GIFT_WRAP, partNo, STATES } from "./data";
import { orderNumber } from "./WorkOrder";

type Placed = { number: string; date: string; email: string; city: string; lines: Line[]; total: number; gift: boolean };

/** Checkout as a work-order form. Payments are not connected: placing the order shows the confirmation only. */
export function Checkout() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = subtotal + (gift ? GIFT_WRAP : 0);

  if (placed) return <Released order={placed} />;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const now = new Date();
    setPlaced({
      number: `${orderNumber(lines)}-${now.getTime().toString(36).toUpperCase().slice(-4)}`,
      date: now.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
      email: String(data.get("email") ?? ""),
      city: String(data.get("city") ?? ""),
      lines,
      total,
      gift,
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto max-w-[1400px]">
        {/* Title block */}
        <div className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto_auto_auto]">
          <div className="px-5 py-5 md:px-7">
            <h1 className={`${s.x125} text-[clamp(2.2rem,5vw,4.4rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>Work order</h1>
            <p className="mt-2 text-[15px] text-(--ink-2)">Fill it in once. The workshop reads it exactly as you write it.</p>
          </div>
          <TitleCell k="Order no." v={count ? orderNumber(lines) : "—"} />
          <TitleCell k="Items" v={String(count)} />
          <TitleCell k="Sheet" v="1 of 1" />
        </div>

        <p
          role="note"
          className={`${s.mono} mt-4 flex items-start gap-3 border border-dashed border-(--m-accent) bg-(--m-accent-soft) px-4 py-3 text-[12.5px] leading-relaxed text-(--ink)`}
        >
          <span className="mt-1 size-2 shrink-0 rounded-full bg-(--m-accent)" />
          Preview: payments are not connected yet. Nothing is charged and nothing is sent.
        </p>

        {count === 0 ? (
          <div className="py-20">
            <p className={`${s.x110} text-[clamp(1.8rem,3vw,2.6rem)] font-[600] leading-tight`}>No items on this work order.</p>
            <p className="mt-3 max-w-md text-[15px] text-(--ink-2)">Add pieces from the parts list, then come back here.</p>
            <Link href="/d/01#parts" className={`${s.btn} mt-8`}>
              Open the parts list
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-10 grid gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="space-y-14 lg:col-span-7">
              <Block n={1} title="Contact">
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Email" name="email" type="email" autoComplete="email" required />
                  <Field label="Phone (WhatsApp)" name="phone" type="tel" autoComplete="tel" inputMode="tel" pattern="[0-9+ ]{10,15}" required />
                </div>
              </Block>

              <Block n={2} title="Deliver to">
                <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
                  <Field label="Full name" name="name" autoComplete="name" required className="sm:col-span-2" />
                  <Field label="House, street" name="address1" autoComplete="address-line1" required className="sm:col-span-2" />
                  <Field label="Landmark (optional)" name="address2" autoComplete="address-line2" className="sm:col-span-2" />
                  <Field label="City" name="city" autoComplete="address-level2" required />
                  <Field label="PIN code" name="pin" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} required title="Six digits, not starting with 0" />
                  <label className={`${s.field} sm:col-span-2`}>
                    <select name="state" required defaultValue="" autoComplete="address-level1">
                      <option value="" disabled>
                        Select a state or union territory
                      </option>
                      {STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <span>State</span>
                    <svg aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-(--steel)" width="12" height="12" viewBox="0 0 12 12">
                      <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </label>
                </div>
              </Block>

              <Block n={3} title="Presentation">
                <label className="flex cursor-pointer items-start gap-4 border border-(--hair-2) bg-(--sheet) p-4 transition-colors hover:border-(--ink)">
                  <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="peer sr-only" />
                  <span
                    aria-hidden
                    className="mt-0.5 grid size-5 shrink-0 place-items-center border border-(--ink) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--m-accent)"
                  >
                    {gift && (
                      <svg viewBox="0 0 18 18" className="size-4 text-(--m-accent)">
                        <path d="M3.5 9.5 L7.5 13.5 L15 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                  <span>
                    <span className="block text-[15.5px]">Gift presentation, {formatINR(GIFT_WRAP)}</span>
                    <span className="mt-1 block text-[14px] text-(--ink-2)">
                      Handmade paper and a handwritten card. Prices are never inside.
                    </span>
                  </span>
                </label>
                <AnimatePresence initial={false}>
                  {gift && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <label className={`${s.field} mt-5 block`}>
                        <textarea name="message" rows={3} maxLength={240} placeholder=" " />
                        <span>Message for the card</span>
                      </label>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Block>

              <Block n={4} title="Notes for the workshop">
                <label className={s.field}>
                  <textarea name="notes" rows={2} maxLength={300} placeholder=" " />
                  <span>Wrist or cuff size, other notes (optional)</span>
                </label>
              </Block>

              <Block n={5} title="Payment">
                <p className="border border-dashed border-(--hair-2) p-4 text-[14.5px] leading-relaxed text-(--ink-2)">
                  UPI, cards and netbanking will appear here once payments are connected.
                </p>
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
                  {lines.map((l) => (
                    <BomLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                  ))}
                </ul>
                <dl className={`${s.mono} border-t border-(--ink) px-5 pt-3 text-[12.5px]`}>
                  <Row k="Subtotal" v={formatINR(subtotal)} />
                  {gift && <Row k="Gift presentation" v={formatINR(GIFT_WRAP)} />}
                  <Row k="Delivery in India" v="Complimentary" />
                  <div className="mt-2 flex items-baseline justify-between border-t border-dashed border-(--hair-2) py-4">
                    <dt>Total</dt>
                    <dd className={`${s.x110} font-[family-name:var(--f01-archivo)] text-[30px] font-[600] tabular-nums`}>{formatINR(total)}</dd>
                  </div>
                </dl>
                <div className="border-t border-(--hair-2) p-5">
                  <button type="submit" className={`${s.btn} w-full justify-between`}>
                    <span className="flex-1 text-left">Place order</span>
                    <span className="tabular-nums opacity-80">{formatINR(total)}</span>
                  </button>
                  <p className="mt-3 text-[12.5px] text-(--steel)">Preview only. No payment is taken.</p>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </div>
  );
}

function TitleCell({ k, v }: { k: string; v: string }) {
  return (
    <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] md:block md:border-l md:border-t-0 md:px-6 md:py-5`}>
      <span className="block text-[10.5px] text-(--steel)">{k}</span>
      <span className="block tabular-nums md:mt-2 md:text-[15px]">{v}</span>
    </div>
  );
}

function Block({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="grid gap-5 md:grid-cols-[3.5rem_1fr]">
      <legend className="sr-only">{title}</legend>
      <span aria-hidden className={`${s.mono} grid size-9 place-items-center rounded-full border border-(--ink) text-[13px] tabular-nums`}>
        {n}
      </span>
      <div>
        <p aria-hidden className={`${s.x110} mb-5 text-[24px] font-[600] leading-none tracking-[-0.01em]`}>
          {title}
        </p>
        {children}
      </div>
    </fieldset>
  );
}

function Field({ label, className = "", ...input }: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`${s.field} ${className}`}>
      <input {...input} placeholder=" " />
      <span>{label}</span>
    </label>
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

function BomLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  return (
    <li className="grid grid-cols-[1fr_3rem_6rem] items-center gap-2 border-b border-(--hair) px-5 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="44px" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-[14.5px] font-[520]">{f.name}</p>
          <p className={`${s.mono} truncate text-[10.5px] text-(--steel)`}>
            {partNo(f.slug)} {WOOD_NAMES[line.wood].latin}
          </p>
          {line.custom && <p className={`${s.mono} truncate text-[10.5px] text-(--ink-2)`}>{line.custom}</p>}
        </div>
      </div>
      <span className={`${s.mono} text-center text-[12.5px] tabular-nums`}>{line.qty}</span>
      <span className={`${s.mono} text-right text-[12.5px] tabular-nums`}>{formatINR(v.price * line.qty)}</span>
    </li>
  );
}

function Released({ order }: { order: Placed }) {
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
          <h1 className={`${s.x125} mt-8 text-[clamp(2.4rem,5.6vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>
            Thank you. It goes on the bench next.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-(--ink-2)">
            A confirmation would go to {order.email || "your email"}. Each piece is inspected, given its batch record
            {order.gift ? ", wrapped with your card" : ""} and packed before it leaves for {order.city || "you"}.
          </p>
          <p className={`${s.mono} mt-5 text-[12px] text-(--steel)`}>Preview only. No payment was taken and nothing was sent.</p>
          <Link href="/d/01" className={`${s.btnLine} mt-9`}>
            Back to the lathe
          </Link>
        </div>
        <div className="lg:col-span-5 lg:col-start-8">
          <div className="border border-(--ink) bg-(--sheet)">
            <div className={`${s.mono} grid grid-cols-2 border-b border-(--ink) text-[12px]`}>
              <div className="border-r border-(--hair-2) px-5 py-4">
                <span className="block text-[10.5px] text-(--steel)">Order no.</span>
                <span className="mt-1 block tabular-nums">{order.number}</span>
              </div>
              <div className="px-5 py-4">
                <span className="block text-[10.5px] text-(--steel)">Released</span>
                <span className="mt-1 block">{order.date}</span>
              </div>
            </div>
            <ul>
              {order.lines.map((l) => (
                <BomLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
              ))}
            </ul>
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
