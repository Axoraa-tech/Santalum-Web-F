"use client";

import { AnimatePresence, motion, useMotionValue } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import s from "../styles";
import { EASE } from "./data";
import { Field } from "./Sheet";
import { Sky } from "./Sky";
import { Sundial } from "./Sundial";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const GIFT = 350;

type Placed = { number: string; name: string; city: string; lines: Line[]; total: number; gift: boolean };

/** Checkout, held at 19:25 under the evening sky. Payments are not connected: placing an order only confirms the preview. */
export function CheckoutDawn() {
  const minutes = useMotionValue(1165);
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = subtotal + (gift ? GIFT : 0);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPlaced({
      number: `SM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      name: String(data.get("name") ?? "").split(" ")[0],
      city: String(data.get("city") ?? ""),
      lines,
      total,
      gift,
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <>
      <Sky minutes={minutes} />
      <Sundial minutes={minutes} mode="link" />
      <div className="relative mx-auto max-w-[1500px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        {placed ? (
          <Confirmation order={placed} />
        ) : count === 0 ? (
          <div className="flex min-h-[60svh] flex-col justify-center">
            <h1 className={`${s.display} text-[clamp(3rem,10vw,7rem)] leading-[0.92]`}>The tray is empty</h1>
            <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.7] text-[var(--muted)]">
              Walk through the day and open any piece; whatever you add will wait here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/d/09#all-pieces" className={s.btn}>
                See all pieces
              </Link>
              <Link href="/d/09" className={s.ghost}>
                Back to dawn
              </Link>
            </div>
          </div>
        ) : (
          <>
            <h1 className={`${s.display} text-[clamp(3rem,10vw,7rem)] leading-[0.92]`}>Checkout</h1>
            <p className="mt-6 inline-flex items-center gap-3 rounded-full bg-[var(--m-accent-soft)] px-4 py-2 text-[14px] leading-snug">
              <span aria-hidden className="size-2 shrink-0 rounded-full bg-[var(--m-accent)]" />
              Preview: payments are not connected yet. Nothing is charged and nothing is sent.
            </p>

            <div className="mt-14 grid gap-14 lg:grid-cols-12 lg:gap-10">
              <form onSubmit={submit} className="lg:col-span-7">
                <Part n="1" title="Contact">
                  <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                    <Field label="Email" name="email" type="email" autoComplete="email" required />
                    <Field label="Phone (WhatsApp)" name="phone" type="tel" autoComplete="tel" pattern="[0-9+ ]{10,15}" required />
                  </div>
                </Part>

                <Part n="2" title="Delivery in India">
                  <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
                    <Field label="Full name" name="name" autoComplete="name" required className="sm:col-span-2" />
                    <Field label="House and street" name="address1" autoComplete="address-line1" required className="sm:col-span-2" />
                    <Field label="Landmark (optional)" name="address2" autoComplete="address-line2" className="sm:col-span-2" />
                    <Field label="City" name="city" autoComplete="address-level2" required />
                    <Field
                      label="PIN code"
                      name="pin"
                      autoComplete="postal-code"
                      inputMode="numeric"
                      pattern="[1-9][0-9]{5}"
                      maxLength={6}
                      title="Six digits, not starting with 0"
                      required
                    />
                    <label className={`${s.field} sm:col-span-2`}>
                      <span className={s.fieldLabel}>State or union territory</span>
                      <select name="state" required defaultValue="" autoComplete="address-level1">
                        <option value="" disabled>
                          Select
                        </option>
                        {STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <svg className="pointer-events-none absolute bottom-3.5 right-1 text-[var(--muted)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </label>
                  </div>
                </Part>

                <Part n="3" title="As a gift">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gift}
                    onClick={() => setGift((g) => !g)}
                    className="group flex w-full items-center gap-5 text-left"
                  >
                    <span className={`relative h-8 w-14 shrink-0 rounded-full border transition-colors duration-300 ${gift ? "border-[var(--m-accent)] bg-[var(--m-accent)]" : "border-[rgb(42_36_32/0.25)] bg-transparent group-hover:border-[var(--ink)]"}`}>
                      <motion.span
                        className={`absolute left-[3px] top-[3px] size-6 rounded-full ${gift ? "bg-[var(--paper)]" : "bg-[var(--ink)]"}`}
                        animate={{ x: gift ? 24 : 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 32 }}
                      />
                    </span>
                    <span>
                      <span className="block text-[16px]">Gift presentation, {formatINR(GIFT)}</span>
                      <span className="mt-1 block text-[14px] leading-snug text-[var(--muted)]">
                        Handmade paper, a wax seal and a handwritten card. No prices inside.
                      </span>
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {gift && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: EASE }}
                        className="overflow-hidden"
                      >
                        <label className={`${s.field} mt-6`}>
                          <span className={s.fieldLabel}>Message for the card</span>
                          <textarea name="message" rows={3} maxLength={240} />
                        </label>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Part>

                <Part n="4" title="Payment">
                  <p className="max-w-[34rem] text-[15px] leading-[1.7] text-[var(--muted)]">
                    UPI, cards and netbanking will appear here once the payment gateway is connected. Until then, placing the order only
                    shows a confirmation.
                  </p>
                </Part>

                <button type="submit" className={`${s.btn} mt-12 w-full justify-between sm:w-auto sm:min-w-[22rem]`}>
                  <span>Place order</span>
                  <span className={`${s.tab} opacity-75`}>{formatINR(total)}</span>
                </button>
              </form>

              <aside className="lg:col-span-5">
                <div className="lg:sticky lg:top-28">
                  <div className={`${s.slip} px-6 pb-7 pt-7 sm:px-8`}>
                    <p className={`${s.display} text-[32px] leading-none`}>
                      On the tray <span className={`${s.tab} text-[16px] text-[var(--muted)]`}>{count}</span>
                    </p>
                    <ul className="mt-6">
                      {lines.map((l) => (
                        <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                      ))}
                    </ul>
                    <dl className="mt-4 space-y-2 border-t border-[var(--hair)] pt-4 text-[15px]">
                      <Row k="Subtotal" v={formatINR(subtotal)} />
                      {gift && <Row k="Gift presentation" v={formatINR(GIFT)} />}
                      <div className="flex items-baseline justify-between pt-2">
                        <dt>Total</dt>
                        <dd className={`${s.display} ${s.tab} text-[34px] leading-none`}>{formatINR(total)}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </>
  );
}

function Part({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <fieldset className="mt-12 first:mt-0">
      <legend className="flex items-baseline gap-4">
        <span className={`${s.display} ${s.tab} text-[22px] text-[var(--muted)]`}>{n}</span>
        <span className={`${s.display} text-[32px] leading-none`}>{title}</span>
      </legend>
      <div className="mt-7">{children}</div>
    </fieldset>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <dt className="text-[var(--muted)]">{k}</dt>
      <dd className={s.tab}>{v}</dd>
    </div>
  );
}

function SummaryLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  const sh = v.shots[0];
  return (
    <li className="flex items-center gap-4 border-b border-dotted border-[rgb(42_36_32/0.2)] py-3 last:border-b-0">
      <span className={`${s.mask} ${s.circle} size-14 shrink-0`}>
        <Photo p={sh.photo} tone={sh.tone} sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={`${s.display} block truncate text-[19px] leading-tight`}>{f.name}</span>
        <span className="block text-[12px] text-[var(--muted)]">
          {WOOD_NAMES[line.wood].common}, quantity {line.qty}
        </span>
        {line.custom && <span className="block truncate text-[12px] text-[var(--muted)]">Custom: {line.custom}</span>}
      </span>
      <span className={`${s.tab} text-[14px]`}>{formatINR(v.price * line.qty)}</span>
    </li>
  );
}

function Confirmation({ order }: { order: Placed }) {
  return (
    <div className="grid min-h-[70svh] gap-12 lg:grid-cols-12 lg:items-center">
      <div className="lg:col-span-7">
        <p className={`${s.tab} text-[14px] text-[var(--muted)]`}>Order {order.number}</p>
        <h1 className={`${s.display} mt-3 text-[clamp(3rem,9vw,6.5rem)] leading-[0.92]`}>
          Thank you{order.name ? `, ${order.name}` : ""}.
        </h1>
        <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-[var(--muted)]">
          This was a preview, so nothing has been charged and nothing will be sent. When payments are connected, this is where you
          will see your order confirmed{order.city ? ` for delivery to ${order.city}` : ""}
          {order.gift ? ", gift-wrapped with your card" : ""}.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link href="/d/09" className={s.btn}>
            Back to dawn
          </Link>
          <Link href="/d/09#all-pieces" className={s.ghost}>
            See all pieces
          </Link>
        </div>
      </div>
      <div className="lg:col-span-5">
        <div className={`${s.slip} px-6 pb-7 pt-7 sm:px-8`}>
          <p className="text-[13px] text-[var(--muted)]">What was on the tray</p>
          <ul className="mt-3">
            {order.lines.map((l) => (
              <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
            ))}
          </ul>
          <div className="mt-4 flex items-baseline justify-between border-t border-[var(--hair)] pt-4">
            <span className="text-[15px]">Total</span>
            <span className={`${s.display} ${s.tab} text-[32px] leading-none`}>{formatINR(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
