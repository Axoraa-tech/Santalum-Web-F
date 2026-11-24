"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { useHydrated } from "./bits";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
const WRAP = 350;
const EASE = [0.22, 1, 0.36, 1] as const;

type Placed = { number: string; name: string; email: string; city: string; state: string; lines: Line[]; total: number; gift: boolean };

/** Checkout, strung like everything else: the form is four knots on one thread, the bag a strand of beads beside it. */
export function Checkout() {
  const hydrated = useHydrated();
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = subtotal + (gift && wrap ? WRAP : 0);

  if (placed) return <Confirmation o={placed} />;

  if (!hydrated) return <div className="min-h-[70svh]" />;

  if (count === 0) {
    return (
      <div className="mx-auto flex min-h-[78svh] max-w-[1360px] flex-col justify-center px-4 pt-24 md:px-10">
        <div className="flex items-center gap-4" aria-hidden>
          <span className="h-px w-24 bg-(--thread)" />
          <span className="s3-knot" />
        </div>
        <h1 className="s3-serif mt-8 text-[clamp(3rem,7vw,6.5rem)] leading-[0.92]">Nothing on the thread yet</h1>
        <p className="mt-5 max-w-[30rem] text-[17px] leading-[1.6] text-(--ink)/75">
          Your bag is empty. Every piece hangs on the strand, each with its own card and an add to bag button.
        </p>
        <Link href="/d/03" className="s3-btn s3-btn-dark mt-8 self-start">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          Back to the strand
        </Link>
      </div>
    );
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setPlaced({
      number: `SM-${Math.floor(100000 + Math.random() * 900000)}`,
      name: String(d.get("name") ?? "").split(" ")[0],
      email: String(d.get("email") ?? ""),
      city: String(d.get("city") ?? ""),
      state: String(d.get("state") ?? ""),
      lines,
      total,
      gift,
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-32 pt-24 md:px-10 md:pt-32">
      <h1 className="s3-serif text-[clamp(2.8rem,6vw,5.6rem)] leading-[0.92]">Checkout</h1>
      <p className="mt-4 flex items-center gap-3 rounded-full border border-(--m-accent)/40 bg-(--warm) px-4 py-2.5 text-[14px] md:inline-flex">
        <span className="h-2 w-2 shrink-0 rounded-full bg-(--m-accent)" aria-hidden />
        Preview: payments are not connected yet. Placing an order here takes no money and sends nothing.
      </p>

      <div className="mt-12 grid gap-14 md:grid-cols-12 md:gap-10">
        <form onSubmit={submit} className="md:col-span-7" aria-label="Checkout">
          <ol className="relative">
            <span className="absolute bottom-10 left-[8.5px] top-4 w-px bg-(--thread)" aria-hidden />
            <Step n={1} title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" className="sm:col-span-2">
                  <input name="name" required autoComplete="name" className="s3-input" />
                </Field>
                <Field label="Email">
                  <input name="email" type="email" required autoComplete="email" className="s3-input" />
                </Field>
                <Field label="Mobile number">
                  <input name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="[0-9+ ]{10,15}" title="10 digits, or with +91" className="s3-input" />
                </Field>
              </div>
            </Step>
            <Step n={2} title="Delivery in India">
              <div className="grid gap-4 sm:grid-cols-6">
                <Field label="House, street" className="sm:col-span-6">
                  <input name="line1" required autoComplete="address-line1" className="s3-input" />
                </Field>
                <Field label="Area, landmark (optional)" className="sm:col-span-6">
                  <input name="line2" autoComplete="address-line2" className="s3-input" />
                </Field>
                <Field label="City" className="sm:col-span-3">
                  <input name="city" required autoComplete="address-level2" className="s3-input" />
                </Field>
                <Field label="PIN code" className="sm:col-span-3">
                  <input
                    name="pin"
                    required
                    inputMode="numeric"
                    autoComplete="postal-code"
                    pattern="[1-9][0-9]{5}"
                    maxLength={6}
                    title="Six digits, not starting with 0"
                    className="s3-input"
                  />
                </Field>
                <Field label="State or union territory" className="sm:col-span-6">
                  <select name="state" required defaultValue="" className="s3-input">
                    <option value="" disabled>
                      Choose one
                    </option>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Step>
            <Step n={3} title="Is it a gift?">
              <label className="flex cursor-pointer items-start gap-3 text-[16px]">
                <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="mt-1 h-5 w-5 accent-(--m-accent)" />
                <span>
                  Yes, it&apos;s a gift
                  <span className="block text-[14px] text-(--muted)">We leave the price out of the parcel.</span>
                </span>
              </label>
              <AnimatePresence initial={false}>
                {gift && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 grid gap-4">
                      <label className="flex cursor-pointer items-start gap-3 text-[16px]">
                        <input type="checkbox" checked={wrap} onChange={(e) => setWrap(e.target.checked)} className="mt-1 h-5 w-5 accent-(--m-accent)" />
                        <span>
                          Wrap it in linen, {formatINR(WRAP)}
                          <span className="block text-[14px] text-(--muted)">Tied with cotton thread.</span>
                        </span>
                      </label>
                      <Field label="A message to go with it (optional)">
                        <textarea name="message" rows={3} maxLength={300} className="s3-input" />
                      </Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Step>
            <Step n={4} title="Place the order" last>
              <p className="max-w-[32rem] text-[15px] leading-[1.6] text-(--ink)/75">
                Payments are not connected in this preview. The button below shows the confirmation and empties your bag; no money is taken.
              </p>
              <button type="submit" className="s3-btn s3-btn-dark mt-5 h-14 px-7 text-[16px]">
                <span className="s3-bead s3-btn-bead" aria-hidden />
                Place order, {formatINR(total)}
              </button>
            </Step>
          </ol>
        </form>

        <aside className="md:col-span-4 md:col-start-9" aria-label="Your bag">
          <div className="rounded-[28px] bg-(--warm) p-6 md:sticky md:top-28 md:p-7">
            <h2 className="s3-serif text-[28px] leading-none">On the thread</h2>
            <ul className="relative mt-6">
              <span className="absolute bottom-8 left-[27px] top-6 w-px bg-(--thread)" aria-hidden />
              {lines.map((l) => (
                <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} l={l} />
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t border-(--line) pt-4 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-(--muted)">Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {gift && wrap && (
                <div className="flex justify-between">
                  <dt className="text-(--muted)">Linen wrap</dt>
                  <dd>{formatINR(WRAP)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-(--muted)">Delivery in India</dt>
                <dd>Included</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-(--line) pt-3">
                <dt>Total</dt>
                <dd className="s3-serif text-[28px] leading-none">{formatINR(total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Step({ n, title, children, last = false }: { n: number; title: string; children: ReactNode; last?: boolean }) {
  return (
    <li className={`relative grid grid-cols-[2.5rem_1fr] ${last ? "" : "pb-12"}`}>
      <span className="s3-knot relative mt-[9px] h-[18px] w-[18px]" aria-hidden />
      <fieldset>
        <legend className="flex items-baseline gap-3">
          <span className="text-[13px] text-(--muted)">{n} of 4</span>
          <span className="s3-serif text-[clamp(1.6rem,2.4vw,2.2rem)] leading-none">{title}</span>
        </legend>
        <div className="mt-5">{children}</div>
      </fieldset>
    </li>
  );
}

function Field({ label, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`s3-field ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function SummaryLine({ l }: { l: Line }) {
  const f = getFamily(l.slug);
  const v = getVariant(l.slug, l.wood);
  if (!f || !v) return null;
  const shot = v.shots[0];
  return (
    <li className="relative flex items-center gap-4 pb-4">
      <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_rgba(176,141,87,0.55)]">
        <Photo p={shot.photo} tone={shot.tone} sizes="56px" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px]">{f.name}</span>
        <span className="block text-[13px] text-(--muted)">
          {WOOD_NAMES[l.wood].common}
          {l.qty > 1 ? `, ${l.qty} pieces` : ""}
        </span>
        {l.custom && <span className="block text-[13px] text-(--muted)">{l.custom}</span>}
      </span>
      <span className="text-[15px] tabular-nums">{formatINR(v.price * l.qty)}</span>
    </li>
  );
}

function Confirmation({ o }: { o: Placed }) {
  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-32 pt-28 md:px-10 md:pt-36">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE }} role="status">
        <p className="text-[14px] text-(--muted)">Order {o.number}</p>
        <h1 className="s3-serif mt-3 text-[clamp(2.8rem,6.5vw,6rem)] leading-[0.92]">
          Thank you{o.name ? `, ${o.name}` : ""}.
          <br />
          It&apos;s on the thread.
        </h1>
        <p className="mt-6 max-w-[34rem] text-[17px] leading-[1.6] text-(--ink)/80">
          We would write to {o.email} when it leaves the workshop for {o.city}, {o.state}. This is a preview: no payment was taken and the
          order was not sent.
        </p>
      </motion.div>
      <div className="relative mt-14 overflow-x-auto pb-10">
        <ul className="relative flex min-w-max items-center gap-8 pt-2">
          <span className="absolute -left-6 -right-6 top-[46px] h-px bg-(--thread)" aria-hidden />
          {o.lines.map((l) => {
            const f = getFamily(l.slug);
            const v = getVariant(l.slug, l.wood);
            if (!f || !v) return null;
            return (
              <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="w-[150px]">
                <span className="relative block h-[88px] w-[88px] overflow-hidden rounded-full border-[3px] border-(--linen) shadow-[0_0_0_1px_rgba(176,141,87,0.55)]">
                  <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="88px" />
                </span>
                <span className="mt-3 block text-[14px]">{f.name}</span>
                <span className="block text-[13px] text-(--muted)">
                  {WOOD_NAMES[l.wood].common}
                  {l.qty > 1 ? `, ${l.qty}` : ""}
                </span>
                {l.custom && <span className="block text-[13px] text-(--muted)">{l.custom}</span>}
              </li>
            );
          })}
        </ul>
      </div>
      <p className="flex items-baseline gap-3">
        <span className="text-[14px] text-(--muted)">Total{o.gift ? ", gift" : ""}</span>
        <span className="s3-serif text-[32px]">{formatINR(o.total)}</span>
      </p>
      <Link href="/d/03" className="s3-btn s3-btn-dark mt-8">
        <span className="s3-bead s3-btn-bead" aria-hidden />
        Back to the strand
      </Link>
    </div>
  );
}
