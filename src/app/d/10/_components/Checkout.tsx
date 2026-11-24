"use client";

import Link from "next/link";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import k from "../k";
import { scrollToTop, splitName } from "./lib";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

/** Called from the submit handler only. */
function orderNumber() {
  return `SK-${Date.now().toString(36).toUpperCase().slice(-6)}`;
}

type Placed = { number: string; email: string; name: string; city: string; lines: Line[]; total: number; gift: boolean };

function Title({ text }: { text: string }) {
  return (
    <h1 aria-label={text} className={`${k.disp} text-[length:min(10.8vw,200px)] leading-[0.8]`}>
      {text.split("").map((c, i) => (
        <span key={i} aria-hidden className={k.titleL} style={{ animationDelay: `${i * 36}ms` }}>
          {c === " " ? " " : c}
        </span>
      ))}
    </h1>
  );
}

/** Checkout with large type fields. Payments are not connected: placing the order shows the confirmation and empties the bag. */
export function Checkout() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);

  if (placed) return <Confirmation order={placed} />;

  if (count === 0) {
    return (
      <div className={`${k.gut} flex min-h-[78svh] flex-col justify-center pb-16 pt-28`}>
        <Title text="Bag empty" />
        <p className={`${k.monoL} mt-6 max-w-[48ch]`}>Nothing to check out yet. The collection is on the home page, in both woods.</p>
        <Link href="/d/10#collection" className={`${k.btn} mt-8 self-start`}>
          <span className={k.btnLabel}>See the collection</span>
        </Link>
      </div>
    );
  }

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    setPlaced({
      number: orderNumber(),
      email: String(d.get("email") ?? ""),
      name: String(d.get("name") ?? ""),
      city: String(d.get("city") ?? ""),
      lines,
      total: subtotal,
      gift,
    });
    bag.clear();
    scrollToTop();
  };

  return (
    <div className="pb-16 pt-24 md:pt-32">
      <div className={k.gut}>
        <Title text="Checkout" />
        <p className={`${k.mono} mt-6 inline-flex items-center gap-3 rounded-full bg-[var(--k-ink)] px-4 py-2 text-[var(--k-bg)]`}>
          <span className="size-2 shrink-0 rounded-full bg-[var(--m-accent)]" />
          Preview: payments are not connected yet. Nothing is charged and nothing is sent.
        </p>
      </div>

      <div className={`${k.gut} mt-12 grid grid-cols-1 gap-14 md:mt-16 lg:grid-cols-12 lg:gap-10`}>
        <form onSubmit={submit} className="min-w-0 space-y-16 lg:col-span-7">
          <Step n={1} title="Contact">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" autoComplete="email" required placeholder="name@example.in" />
              <Field label="Phone (WhatsApp)" name="phone" type="tel" autoComplete="tel" pattern="[0-9+ ]{10,15}" required placeholder="+91" />
            </div>
          </Step>

          <Step n={2} title="Delivery, within India">
            <div className="grid gap-8">
              <Field label="Full name" name="name" autoComplete="name" required />
              <Field label="House, street" name="line1" autoComplete="address-line1" required />
              <Field label="Area, landmark (optional)" name="line2" autoComplete="address-line2" />
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
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
              </div>
              <div>
                <label htmlFor="k10-state" className={`${k.mono} text-[var(--k-grey)]`}>
                  State or union territory
                </label>
                <select id="k10-state" name="state" required defaultValue="" autoComplete="address-level1" className={k.field}>
                  <option value="" disabled>
                    Choose
                  </option>
                  {STATES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </Step>

          <Step n={3} title="Gift">
            <label className="flex cursor-pointer items-start gap-4">
              <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className={`${k.check} mt-1`} />
              <span>
                <span className={`${k.disp} block text-[length:clamp(26px,2.6vw,38px)] leading-none [font-variation-settings:'wdth'_80,'wght'_700]`}>
                  This is a gift
                </span>
                <span className={`${k.mono} mt-1 block text-[var(--k-grey)]`}>Prices are left off the packing slip, and your note goes in with the piece.</span>
              </span>
            </label>
            {gift && (
              <div className="mt-8">
                <label htmlFor="k10-note" className={`${k.mono} text-[var(--k-grey)]`}>
                  Your note, up to 200 characters
                </label>
                <textarea id="k10-note" name="note" maxLength={200} rows={3} className={`${k.field} resize-none`} placeholder="For you, from the heartwood." />
              </div>
            )}
          </Step>

          <Step n={4} title="Payment">
            <p className={`${k.monoL} max-w-[56ch]`}>
              Payments are not connected in this preview. Placing the order shows the confirmation and empties the bag; no card, UPI or
              bank details are asked for or stored.
            </p>
            <button type="submit" className={`${k.btn} mt-8 w-full`}>
              <span className={k.btnLabel}>Place order</span>
              <span className={`${k.mono} opacity-70`}>{formatINR(subtotal)}</span>
            </button>
          </Step>
        </form>

        <aside aria-label="Order summary" className="lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <p className={`${k.mono} text-[var(--k-grey)]`}>
              In the bag, {count} {count === 1 ? "piece" : "pieces"}
            </p>
            <ul className="mt-3 border-t border-[var(--k-ink)]">
              {lines.map((l) => (
                <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
              ))}
            </ul>
            <dl className="mt-4">
              <div className="flex justify-between border-b border-[var(--k-line)] py-2">
                <dt className={`${k.mono} text-[var(--k-grey)]`}>Subtotal</dt>
                <dd className={`${k.monoL} tabular-nums`}>{formatINR(subtotal)}</dd>
              </div>
              <div className="flex justify-between border-b border-[var(--k-line)] py-2">
                <dt className={`${k.mono} text-[var(--k-grey)]`}>Delivery in India</dt>
                <dd className={k.monoL}>Complimentary</dd>
              </div>
              <div className="flex items-end justify-between pt-4">
                <dt className={`${k.mono} pb-2`}>Total</dt>
                <dd className={`${k.disp} text-[length:clamp(52px,6vw,96px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_840]`}>
                  {formatINR(subtotal)}
                </dd>
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
    <fieldset className="grid grid-cols-1 min-w-0 gap-6 border-t border-[var(--k-ink)] pt-5 md:grid-cols-[5rem_minmax(0,1fr)]">
      <legend className="sr-only">{title}</legend>
      <p aria-hidden className={`${k.disp} text-[64px] leading-[0.8] text-[var(--k-grey)] [font-variation-settings:'wdth'_50,'wght'_300]`}>
        {n}
      </p>
      <div>
        <p aria-hidden className={`${k.disp} mb-8 whitespace-normal text-[length:clamp(34px,3.6vw,56px)] leading-[0.9] [font-variation-settings:'wdth'_120,'wght'_820]`}>
          {title}
        </p>
        {children}
      </div>
    </fieldset>
  );
}

function Field({ label, name, ...rest }: { label: string; name: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = `k10-${name}`;
  return (
    <div>
      <label htmlFor={id} className={`${k.mono} text-[var(--k-grey)]`}>
        {label}
      </label>
      <input id={id} name={name} className={k.field} {...rest} />
    </div>
  );
}

function SummaryLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  return (
    <li className="grid grid-cols-[1fr_auto] items-end gap-4 border-b border-[var(--k-line)] py-3">
      <div className="min-w-0">
        <p className={`${k.disp} truncate text-[length:clamp(28px,3vw,44px)] leading-[0.9] [font-variation-settings:'wdth'_58,'wght'_800]`}>
          {splitName(f.name).head}
        </p>
        <p className={`${k.mono} mt-1 text-[var(--k-grey)]`}>
          {WOOD_NAMES[line.wood].common}, quantity {line.qty}
        </p>
        {line.custom && <p className={`${k.mono} mt-1`}>Your note: {line.custom}</p>}
      </div>
      <p className={`${k.monoL} tabular-nums`}>{formatINR(v.price * line.qty)}</p>
    </li>
  );
}

function Confirmation({ order }: { order: Placed }) {
  const first = order.name.trim().split(/\s+/)[0];
  return (
    <div className={`${k.gut} pb-20 pt-28 md:pt-36`}>
      <Title text="Thank you" />
      <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(30px,3.2vw,50px)] leading-[0.95] [font-variation-settings:'wdth'_80,'wght'_640]`}>
            {first ? `${first}, your` : "Your"} order {order.number} is noted{order.city ? ` for delivery to ${order.city}` : ""}.
          </p>
          <p className={`${k.monoL} mt-6 max-w-[52ch]`}>
            Preview: payments are not connected yet, so nothing was charged and no email was sent to {order.email}. In the live shop, each
            piece would leave with its batch record{order.gift ? ", without prices on the slip, and with your note" : ""}.
          </p>
          <Link href="/d/10" className={`${k.btn} mt-8`}>
            <span className={k.btnLabel}>Back to the Maison</span>
          </Link>
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <p className={`${k.mono} text-[var(--k-grey)]`}>Order {order.number}</p>
          <ul className="mt-3 border-t border-[var(--k-ink)]">
            {order.lines.map((l) => (
              <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
            ))}
          </ul>
          <p className={`${k.disp} mt-4 text-right text-[length:clamp(44px,5vw,80px)] tabular-nums [font-variation-settings:'wdth'_62,'wght'_840]`}>
            {formatINR(order.total)}
          </p>
        </div>
      </div>
    </div>
  );
}
