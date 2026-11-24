"use client";

import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { IconArrow } from "./Icons";
import { EASE, HOME, sheet, STATES } from "./store";

type Contact = { name: string; email: string; phone: string };
type Delivery = { line1: string; line2: string; city: string; state: string; pin: string; note: string };
type Gift = { gift: boolean; wrap: boolean; message: string; hidePrices: boolean };
type Placed = { number: string; email: string; city: string; lines: Line[]; total: number };

const STEPS = ["Contact", "Delivery", "Gift", "Review"] as const;
const WRAP = 350;
const noop = () => () => {};

/**
 * Checkout as a stack of step cards. Each step you finish folds down and joins the stack above the next one.
 * Preview only: payments are not connected.
 */
export function Checkout() {
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [contact, setContact] = useState<Contact | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [gift, setGift] = useState<Gift>({ gift: false, wrap: false, message: "", hidePrices: true });
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = subtotal + (gift.gift && gift.wrap ? WRAP : 0);

  const top = () => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });

  const place = () => {
    setPlaced({
      number: `SM7-${Date.now().toString(36).toUpperCase().slice(-6)}`,
      email: contact?.email ?? "",
      city: delivery?.city ?? "",
      lines,
      total,
    });
    bag.clear();
    top();
  };

  if (!hydrated) return <main className="min-h-svh" />;

  return (
    <main className="px-2 pb-[150px] pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pb-[110px] lg:pt-[14px]">
      <header className="rounded-[28px] bg-[#EFE9E0] px-5 pb-7 pt-5 md:rounded-[40px] md:px-8 md:pb-9 md:pt-7 lg:rounded-[48px] lg:px-10">
        <Link
          href={HOME}
          className="inline-flex items-center gap-2 text-[14px] text-[#77706A] transition hover:text-[#1B1712]"
        >
          <IconArrow dir="left" width={16} height={16} />
          Back to the deck
        </Link>
        <div className="mt-6 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h1 className="d1 text-[clamp(3.6rem,10vw,9rem)]">{placed ? "Thank you" : "Checkout"}</h1>
          <p className="inline-flex max-w-md items-center gap-3 self-start rounded-full bg-white px-4 py-2.5 text-[14px] md:self-auto">
            <span className="size-2 shrink-0 rounded-full bg-[var(--m-accent)]" aria-hidden />
            Preview: payments are not connected yet.
          </p>
        </div>
      </header>

      {placed ? (
        <Confirmation order={placed} />
      ) : count === 0 ? (
        <div className="mt-3 rounded-[28px] bg-white px-5 py-12 md:rounded-[40px] md:px-10 lg:rounded-[48px]">
          <p className="d2 text-[clamp(2.4rem,5vw,4.4rem)]">Your bag is empty</p>
          <p className="mt-3 max-w-md text-[16px] text-[#77706A]">Add a piece from the deck and come back here to finish.</p>
          <Link
            href={`${HOME}#pieces`}
            className="mt-6 inline-flex h-12 items-center rounded-full bg-[#1B1712] px-6 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)]"
          >
            See the pieces
          </Link>
        </div>
      ) : (
        <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
          <section aria-label="Checkout steps" className="lg:col-span-7">
            <LayoutGroup>
              <ol className="relative">
                {STEPS.map((name, i) => {
                  const state = i < step ? "done" : i === step ? "current" : "next";
                  const depth = state === "done" ? step - i : state === "next" ? i - step : 0;
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
                          ? "bg-white shadow-[0_30px_60px_-40px_rgba(27,23,18,0.6)]"
                          : state === "done"
                            ? "-mb-5 bg-[#E4E8E0]"
                            : "-mt-9 bg-[#E9E5DC]"
                      }`}
                    >
                      {state === "done" && (
                        <DoneRow
                          n={i + 1}
                          name={name}
                          summary={summaryFor(i, contact, delivery, gift)}
                          onEdit={() => setStep(i)}
                        />
                      )}
                      {state === "next" && (
                        <div className="flex items-center justify-between px-6 pb-3 pt-12 text-[14px] text-[#77706A] md:px-8">
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
                          className="px-5 pb-6 pt-6 md:px-8 md:pb-8 md:pt-7"
                        >
                          <p className="num text-[13px] text-[#77706A]">
                            Step {i + 1} of {STEPS.length}
                          </p>
                          <h2 className="d1 mt-1 text-[clamp(2.8rem,5vw,4.6rem)]">{name}</h2>
                          <div className="mt-6">
                            {i === 0 && (
                              <ContactForm
                                value={contact}
                                onDone={(c) => {
                                  setContact(c);
                                  setStep(1);
                                }}
                              />
                            )}
                            {i === 1 && (
                              <DeliveryForm
                                value={delivery}
                                onDone={(d) => {
                                  setDelivery(d);
                                  setStep(2);
                                }}
                              />
                            )}
                            {i === 2 && (
                              <GiftForm
                                value={gift}
                                onDone={(g) => {
                                  setGift(g);
                                  setStep(3);
                                }}
                              />
                            )}
                            {i === 3 && contact && delivery && (
                              <Review contact={contact} delivery={delivery} gift={gift} total={total} onPlace={place} />
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

          <Summary lines={lines} subtotal={subtotal} wrap={gift.gift && gift.wrap} total={total} />
        </div>
      )}
    </main>
  );
}

function summaryFor(i: number, c: Contact | null, d: Delivery | null, g: Gift) {
  if (i === 0 && c) return `${c.name}, ${c.email}, ${c.phone}`;
  if (i === 1 && d) return `${d.line1}, ${d.city}, ${d.state} ${d.pin}`;
  if (i === 2) {
    if (!g.gift) return "Not a gift";
    const bits = ["A gift", g.wrap ? "linen wrap" : "", g.message ? "with a note" : "", g.hidePrices ? "no prices on the slip" : ""];
    return bits.filter(Boolean).join(", ");
  }
  return "";
}

function DoneRow({ n, name, summary, onEdit }: { n: number; name: string; summary: string; onEdit: () => void }) {
  return (
    <div className="flex items-center gap-4 px-5 pb-9 pt-5 md:px-8">
      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#1B1712] text-white" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[14px] font-medium">
          <span className="num mr-2 text-[#77706A]">{n}</span>
          {name}
        </p>
        <p className="truncate text-[14px] text-[#3d3731]">{summary}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${name.toLowerCase()}`}
        className="rounded-full px-3.5 py-2 text-[13.5px] font-medium ring-1 ring-[#1B1712]/15 transition hover:bg-white active:scale-95"
      >
        Edit
      </button>
    </div>
  );
}

function Field({ label, hint, className = "", ...rest }: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`grid gap-1.5 ${className}`}>
      <span className="text-[14px] font-medium">
        {label}
        {!rest.required && <span className="font-normal text-[#77706A]"> (optional)</span>}
      </span>
      <input className="s7-input" {...rest} />
      {hint && <span className="text-[12.5px] text-[#77706A]">{hint}</span>}
    </label>
  );
}

function Continue({ children = "Continue" }: { children?: ReactNode }) {
  return (
    <button
      type="submit"
      className="group mt-2 inline-flex h-12 items-center gap-3 justify-self-start rounded-full bg-[#1B1712] pl-6 pr-2 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
        <IconArrow width={16} height={16} />
      </span>
    </button>
  );
}

const str = (d: FormData, k: string) => String(d.get(k) ?? "").trim();

function ContactForm({ value, onDone }: { value: Contact | null; onDone: (c: Contact) => void }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    onDone({ name: str(d, "name"), email: str(d, "email"), phone: str(d, "phone") });
  };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Full name" name="name" autoComplete="name" required defaultValue={value?.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={value?.email} />
        <Field
          label="Phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          pattern="[0-9+ ]{10,15}"
          required
          hint="For the courier. WhatsApp is fine."
          defaultValue={value?.phone}
        />
      </div>
      <Continue>Continue to delivery</Continue>
    </form>
  );
}

function DeliveryForm({ value, onDone }: { value: Delivery | null; onDone: (d: Delivery) => void }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    onDone({
      line1: str(d, "line1"),
      line2: str(d, "line2"),
      city: str(d, "city"),
      state: str(d, "state"),
      pin: str(d, "pin"),
      note: str(d, "note"),
    });
  };
  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="House, street" name="line1" autoComplete="address-line1" required defaultValue={value?.line1} />
      <Field label="Area, landmark" name="line2" autoComplete="address-line2" defaultValue={value?.line2} />
      <div className="grid gap-4 sm:grid-cols-[1.2fr_1.2fr_0.9fr]">
        <Field label="City" name="city" autoComplete="address-level2" required defaultValue={value?.city} />
        <label className="grid gap-1.5">
          <span className="text-[14px] font-medium">State</span>
          <select name="state" required defaultValue={value?.state ?? ""} autoComplete="address-level1" className="s7-input appearance-none">
            <option value="" disabled>
              Choose a state
            </option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <Field
          label="PIN code"
          name="pin"
          inputMode="numeric"
          autoComplete="postal-code"
          pattern="[1-9][0-9]{5}"
          maxLength={6}
          required
          title="Six digits, not starting with 0"
          defaultValue={value?.pin}
        />
      </div>
      <Field label="A note for the courier" name="note" defaultValue={value?.note} />
      <p className="text-[13.5px] text-[#77706A]">Delivery is complimentary across India. Pieces are packed by hand.</p>
      <Continue>Continue to gift</Continue>
    </form>
  );
}

function GiftForm({ value, onDone }: { value: Gift; onDone: (g: Gift) => void }) {
  const [g, setG] = useState<Gift>(value);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onDone(g);
  };
  const check = (on: boolean, set: (v: boolean) => void, label: ReactNode, sub?: string) => (
    <label className="flex cursor-pointer items-start gap-3 rounded-[20px] bg-[#F8F6F2] p-4 ring-1 ring-[#1B1712]/8 transition hover:ring-[#1B1712]/25 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[var(--m-accent)]">
      <input type="checkbox" checked={on} onChange={(e) => set(e.target.checked)} className="mt-1 size-5 shrink-0 accent-[#1B1712]" />
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {sub && <span className="mt-0.5 block text-[13.5px] text-[#77706A]">{sub}</span>}
      </span>
    </label>
  );
  return (
    <form onSubmit={submit} className="grid gap-3">
      {check(g.gift, (v) => setG({ ...g, gift: v }), "This is a gift", "It leaves in its presentation box with the record and care card.")}
      <AnimatePresence initial={false}>
        {g.gift && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="grid gap-3 overflow-hidden"
          >
            {check(
              g.wrap,
              (v) => setG({ ...g, wrap: v }),
              <>
                Wrap it in linen <span className="num font-normal text-[#77706A]">(+{formatINR(WRAP)})</span>
              </>,
              "Hand-tied in raw linen, ready to give.",
            )}
            {check(g.hidePrices, (v) => setG({ ...g, hidePrices: v }), "Keep prices off the packing slip")}
            <label className="grid gap-1.5">
              <span className="text-[14px] font-medium">
                Gift note <span className="font-normal text-[#77706A]">(optional)</span>
              </span>
              <textarea
                value={g.message}
                onChange={(e) => setG({ ...g, message: e.target.value })}
                maxLength={240}
                rows={3}
                className="s7-input resize-none"
                placeholder="Written by hand on a card. For corporate orders, add the number of pieces and the date."
              />
              <span className="num text-right text-[12.5px] text-[#77706A]">{240 - g.message.length} left</span>
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <Continue>Review the order</Continue>
    </form>
  );
}

function Review({
  contact,
  delivery,
  gift,
  total,
  onPlace,
}: {
  contact: Contact;
  delivery: Delivery;
  gift: Gift;
  total: number;
  onPlace: () => void;
}) {
  return (
    <div className="grid gap-5">
      <dl className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[20px] bg-[#F8F6F2] p-4">
          <dt className="text-[13px] text-[#77706A]">Send to</dt>
          <dd className="mt-1 text-[15px] leading-snug">
            {contact.name}
            <br />
            {delivery.line1}
            {delivery.line2 && (
              <>
                <br />
                {delivery.line2}
              </>
            )}
            <br />
            {delivery.city}, {delivery.state} {delivery.pin}
          </dd>
        </div>
        <div className="rounded-[20px] bg-[#F8F6F2] p-4">
          <dt className="text-[13px] text-[#77706A]">Contact</dt>
          <dd className="mt-1 text-[15px] leading-snug">
            {contact.email}
            <br />
            {contact.phone}
          </dd>
          {gift.gift && (
            <>
              <dt className="mt-3 text-[13px] text-[#77706A]">Gift note</dt>
              <dd className="mt-1 text-[15px] leading-snug">{gift.message || "No note"}</dd>
            </>
          )}
        </div>
      </dl>
      <p className="flex items-start gap-3 rounded-[20px] bg-[var(--m-accent-soft)] p-4 text-[14.5px]">
        <span className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--m-accent)]" aria-hidden />
        Preview: payments are not connected yet. Placing the order shows the confirmation; nothing is charged and nothing is sent.
      </p>
      <button
        type="button"
        onClick={onPlace}
        className="inline-flex h-14 items-center justify-between gap-6 rounded-full bg-[#1B1712] pl-7 pr-6 text-[16px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98] sm:self-start"
      >
        Place the order
        <span className="num text-white/75">{formatINR(total)}</span>
      </button>
    </div>
  );
}

function Summary({ lines, subtotal, wrap, total }: { lines: Line[]; subtotal: number; wrap: boolean; total: number }) {
  return (
    <aside className="self-start rounded-[28px] bg-[#F1E6DC] p-5 md:rounded-[40px] md:p-8 lg:sticky lg:top-[14px] lg:col-span-5 lg:rounded-[48px] lg:p-9">
      <div className="flex items-end justify-between gap-4">
        <h2 className="d2 text-[34px] md:text-[40px]">In the bag</h2>
        <button
          type="button"
          onClick={() => sheet.open()}
          className="rounded-full px-3.5 py-2 text-[13.5px] font-medium ring-1 ring-[#1B1712]/15 transition hover:bg-white active:scale-95"
        >
          Change
        </button>
      </div>
      <ul className="mt-5 grid gap-2">
        {lines.map((l) => {
          const f = getFamily(l.slug);
          const v = getVariant(l.slug, l.wood);
          if (!f || !v) return null;
          return (
            <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="flex items-center gap-3 rounded-[22px] bg-white/70 p-2 pr-4">
              <div className="relative size-16 shrink-0 overflow-hidden rounded-[16px]">
                <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="64px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="d3 truncate text-[17px]">{f.name}</p>
                <p className="text-[13px] text-[#77706A]">
                  {WOOD_NAMES[l.wood].common} <span className="num">&times; {l.qty}</span>
                </p>
                {l.custom && <p className="text-[13px] text-[var(--m-accent)]">{l.custom}</p>}
              </div>
              <p className="num text-[15px] font-medium">{formatINR(v.price * l.qty)}</p>
            </li>
          );
        })}
      </ul>
      <dl className="num mt-5 grid gap-2 border-t border-[#1B1712]/12 pt-4 text-[15px]">
        <div className="flex justify-between">
          <dt className="text-[#77706A]">Subtotal</dt>
          <dd>{formatINR(subtotal)}</dd>
        </div>
        {wrap && (
          <div className="flex justify-between">
            <dt className="text-[#77706A]">Linen wrap</dt>
            <dd>{formatINR(WRAP)}</dd>
          </div>
        )}
        <div className="flex justify-between">
          <dt className="text-[#77706A]">Delivery in India</dt>
          <dd>Complimentary</dd>
        </div>
        <div className="mt-2 flex items-baseline justify-between border-t border-[#1B1712]/12 pt-3">
          <dt className="font-medium">Total</dt>
          <dd className="d2 text-[34px]">{formatINR(total)}</dd>
        </div>
      </dl>
    </aside>
  );
}

function Confirmation({ order }: { order: Placed }) {
  return (
    <div className="mt-3 grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
      <motion.section
        initial={{ opacity: 0, y: 40, rotate: -1.5 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ type: "spring", stiffness: 140, damping: 20 }}
        className="rounded-[28px] bg-white p-6 md:rounded-[40px] md:p-10 lg:col-span-7 lg:rounded-[48px]"
        role="status"
      >
        <p className="text-[14px] text-[#77706A]">Order received</p>
        <p className="d1 num mt-2 text-[clamp(3rem,7vw,6rem)]">{order.number}</p>
        <p className="mt-5 max-w-[52ch] text-[16.5px] leading-relaxed text-[#3d3731]">
          {order.email ? `A confirmation would go to ${order.email}` : "A confirmation would be sent"}
          {order.city ? `, and the pieces would be packed for ${order.city}.` : "."} This was a preview: no payment was taken and
          nothing will be sent.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href={HOME}
            className="inline-flex h-12 items-center rounded-full bg-[#1B1712] px-6 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)]"
          >
            Back to the deck
          </Link>
        </div>
      </motion.section>
      <aside className="self-start rounded-[28px] bg-[#E4E8E0] p-6 md:rounded-[40px] md:p-8 lg:col-span-5 lg:rounded-[48px]">
        <ul className="grid gap-3">
          {order.lines.map((l) => {
            const f = getFamily(l.slug);
            const v = getVariant(l.slug, l.wood);
            if (!f || !v) return null;
            return (
              <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="flex items-center gap-4 border-b border-[#1B1712]/10 pb-3 text-[15px]">
                <span className="relative size-14 shrink-0 overflow-hidden rounded-[14px]">
                  <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  {f.name} <span className="text-[#77706A]">({WOOD_NAMES[l.wood].common.toLowerCase()})</span>
                  {l.custom && <span className="block text-[13px] text-[var(--m-accent)]">{l.custom}</span>}
                </span>
                <span className="num shrink-0">&times; {l.qty}</span>
              </li>
            );
          })}
        </ul>
        <p className="num mt-4 flex items-baseline justify-between">
          <span className="text-[#77706A]">Total</span>
          <span className="d2 text-[34px]">{formatINR(order.total)}</span>
        </p>
      </aside>
    </div>
  );
}
