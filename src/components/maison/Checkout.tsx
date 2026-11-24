"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { Photo } from "../Photo";
import { WoodDisc } from "./Logo";
import { Pill } from "./Pill";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

const GIFT_WRAP = 350;
const EASE = [0.22, 1, 0.36, 1] as const;

type Placed = { number: string; email: string; city: string; lines: Line[]; total: number; gift: boolean };

/**
 * Checkout preview. Payments are NOT connected: placing an order only shows the confirmation.
 * Wire to the backend and Razorpay before launch.
 */
export function Checkout() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = subtotal + (gift ? GIFT_WRAP : 0);

  if (placed) return <Confirmation order={placed} />;

  if (count === 0) {
    return (
      <div className="mx-auto flex min-h-[80svh] max-w-[1500px] flex-col items-start justify-center px-5 pt-24 md:px-10">
        <h1 className="font-display text-[clamp(3rem,7vw,6rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Your bag is empty</h1>
        <Pill href="/maison/shop" size="lg" className="mt-10">
          See the collection
        </Pill>
      </div>
    );
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPlaced({
      number: `SM-${Date.now().toString(36).toUpperCase().slice(-6)}`,
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
    <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 md:px-10 md:pt-36">
      <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Almost yours</h1>
      <p className="mt-6 inline-flex items-center gap-3 rounded-full bg-accent-soft px-4 py-2 text-[14px] text-ink">
        <span className="size-2 shrink-0 rounded-full bg-accent" />
        Preview: payments are not connected yet. Nothing is charged and nothing is sent.
      </p>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <form onSubmit={submit} className="lg:col-span-7">
          <ol className="relative ml-4 space-y-14 border-l border-hair pl-8 md:ml-5 md:pl-12">
            <Step n={1} title="Contact">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Email" name="email" type="email" autoComplete="email" required />
                <Field label="Phone (WhatsApp)" name="phone" type="tel" autoComplete="tel" pattern="[0-9+ ]{10,15}" required />
              </div>
            </Step>

            <Step n={2} title="Delivery">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Full name" name="name" autoComplete="name" required className="sm:col-span-2" />
                <Field label="House, street" name="address1" autoComplete="address-line1" required className="sm:col-span-2" />
                <Field label="Landmark (optional)" name="address2" autoComplete="address-line2" className="sm:col-span-2" />
                <Field label="City" name="city" autoComplete="address-level2" required />
                <Field label="PIN code" name="pin" autoComplete="postal-code" inputMode="numeric" pattern="[1-9][0-9]{5}" required />
                <label className="relative block sm:col-span-2">
                  <select
                    name="state"
                    required
                    defaultValue=""
                    autoComplete="address-level1"
                    className="h-16 w-full appearance-none rounded-2xl bg-paper-2 px-5 pt-5 text-[16px] outline-none ring-1 ring-transparent transition-shadow focus:ring-ink/25"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute left-5 top-3 text-[12px] text-ink-3">State</span>
                  <svg className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-ink-3" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                    <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </label>
              </div>
            </Step>

            <Step n={3} title="Presentation">
              <button
                type="button"
                role="switch"
                aria-checked={gift}
                onClick={() => setGift((g) => !g)}
                className="flex w-full items-center gap-5 rounded-[1.75rem] bg-paper-2 p-5 text-left"
              >
                <span className={`relative h-8 w-14 shrink-0 rounded-full transition-colors duration-300 ${gift ? "bg-accent" : "bg-paper-3"}`}>
                  <motion.span
                    className="absolute left-1 top-1 size-6 rounded-full bg-paper shadow"
                    animate={{ x: gift ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </span>
                <span>
                  <span className="block text-[16px] font-medium">Gift presentation, {formatINR(GIFT_WRAP)}</span>
                  <span className="mt-1 block text-[14px] text-ink-2">Handmade paper, a wax seal and a handwritten card. Prices are never inside.</span>
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
                    <label className="relative mt-3 block">
                      <textarea
                        name="message"
                        rows={3}
                        maxLength={240}
                        className="w-full resize-none rounded-2xl bg-paper-2 px-5 pb-4 pt-8 text-[16px] outline-none ring-1 ring-transparent focus:ring-ink/25"
                      />
                      <span className="pointer-events-none absolute left-5 top-3 text-[12px] text-ink-3">Message for the card</span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </Step>

            <Step n={4} title="Payment">
              <div className="rounded-[1.75rem] border border-dashed border-ink/15 p-5 text-[15px] leading-relaxed text-ink-2">
                UPI, cards and netbanking through Razorpay will appear here once the payment gateway is connected.
              </div>
            </Step>
          </ol>

          <div className="mt-12 md:ml-5">
            <Pill type="submit" size="lg" className="w-full justify-between! sm:w-auto sm:min-w-[22rem]">
              <span>Place order</span>
              <span className="tabular-nums opacity-80">{formatINR(total)}</span>
            </Pill>
          </div>
        </form>

        <aside className="lg:col-span-5">
          <div className="rounded-[2.25rem] bg-paper-2 p-6 md:p-8 lg:sticky lg:top-28">
            <p className="font-display text-[28px] leading-none tracking-[-0.02em]">
              Your bag <span className="text-[16px] tabular-nums text-ink-3">{count}</span>
            </p>
            <ul className="mt-6 space-y-4">
              {lines.map((l) => (
                <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
              ))}
            </ul>
            <dl className="mt-6 space-y-2 border-t border-hair pt-5 text-[15px]">
              <Row k="Subtotal" v={formatINR(subtotal)} />
              {gift && <Row k="Gift presentation" v={formatINR(GIFT_WRAP)} />}
              <Row k="Delivery" v="Complimentary" />
              <div className="flex items-baseline justify-between pt-3">
                <dt className="text-[15px]">Total</dt>
                <dd className="font-display text-[32px] tabular-nums tracking-[-0.02em]">{formatINR(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <li className="relative">
      <span className="absolute -left-[3.15rem] top-0 grid size-9 place-items-center rounded-full border border-hair bg-paper font-display text-[15px] tabular-nums md:-left-[4.15rem]">
        {n}
      </span>
      <h2 className="mb-5 font-display text-[30px] leading-none tracking-[-0.02em]">{title}</h2>
      {children}
    </li>
  );
}

function Field({ label, className = "", ...input }: { label: string; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`relative block ${className}`}>
      <input
        {...input}
        placeholder=" "
        className="peer h-16 w-full rounded-2xl bg-paper-2 px-5 pt-5 text-[16px] outline-none ring-1 ring-transparent transition-shadow focus:ring-ink/25"
      />
      <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[15px] text-ink-3 transition-all duration-200 peer-focus:top-4 peer-focus:text-[12px] peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-[12px]">
        {label}
      </span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-ink-2">{k}</dt>
      <dd className="tabular-nums">{v}</dd>
    </div>
  );
}

function SummaryLine({ line }: { line: Line }) {
  const f = getFamily(line.slug)!;
  const v = getVariant(line.slug, line.wood)!;
  return (
    <li className="flex items-center gap-4">
      <span className="relative size-14 shrink-0">
        <span className="absolute inset-0 overflow-hidden rounded-full">
          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="64px" />
        </span>
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-ink text-[11px] tabular-nums text-paper">{line.qty}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-medium">{f.name}</span>
        <span className="block truncate text-[13px] text-ink-3">{line.custom ?? WOOD_NAMES[line.wood].common}</span>
      </span>
      <span className="text-[15px] tabular-nums">{formatINR(v.price * line.qty)}</span>
    </li>
  );
}

function Confirmation({ order }: { order: Placed }) {
  return (
    <div className="mx-auto grid max-w-[1500px] gap-14 px-5 pb-10 pt-32 md:px-10 md:pt-40 lg:grid-cols-12">
      <div className="lg:col-span-6">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE }}
          className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]"
        >
          Thank you. It&rsquo;s being prepared by hand.
        </motion.h1>
        <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
          A confirmation goes to {order.email || "your email"}. Each piece is inspected, numbered and packed with its batch
          record{order.gift ? " and your handwritten card" : ""} before it leaves for {order.city || "you"}.
        </p>
        <p className="mt-6 text-[14px] text-ink-3">Preview only. No payment was taken.</p>
        <Pill href="/maison" variant="line" size="lg" className="mt-10">
          Back to the Maison
        </Pill>
      </div>
      <div className="lg:col-span-5 lg:col-start-8">
        <div className="rounded-[2.25rem] bg-paper-2 p-7 md:p-9">
          <div className="flex items-center justify-between">
            <p className="font-display text-[28px] leading-none tracking-[-0.02em]">Order {order.number}</p>
            <WoodDisc className="size-12" />
          </div>
          <ul className="mt-7 space-y-4 border-t border-dashed border-ink/15 pt-6">
            {order.lines.map((l) => (
              <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
            ))}
          </ul>
          <div className="mt-6 flex items-baseline justify-between border-t border-dashed border-ink/15 pt-5">
            <span className="text-[15px]">Total</span>
            <span className="font-display text-[32px] tabular-nums">{formatINR(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
