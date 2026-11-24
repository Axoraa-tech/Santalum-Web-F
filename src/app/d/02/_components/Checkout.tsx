"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { FAMILIES, formatINR, getFamily, getVariant } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { EASE, HOME, STATES, WOOD_LABEL, productHref, splitName } from "./copy";
import { s } from "./cls";
import { AddButton, ArrowIcon, CheckIcon } from "./ui";

const STEPS = ["Contact", "Delivery", "Gift", "Review"] as const;

/** A short reference for the confirmation screen (preview only; no order is sent anywhere). */
function orderRef() {
  return `SM-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

type Form = {
  name: string;
  email: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  pin: string;
  gift: boolean;
  message: string;
  hidePrices: boolean;
};

const EMPTY: Form = { name: "", email: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "", gift: false, message: "", hidePrices: false };

/** Circular step markers joined by arcs. The current step's ring draws itself. */
function Markers({ step, done, go }: { step: number; done: number; go: (i: number) => void }) {
  const C = 2 * Math.PI * 25;
  return (
    <ol className="flex items-start" aria-label="Checkout steps">
      {STEPS.map((label, i) => {
        const isDone = i < done;
        const on = i === step;
        const reachable = i <= done;
        return (
          <li key={label} className="flex items-start">
            <button
              type="button"
              disabled={!reachable}
              onClick={() => go(i)}
              aria-current={on ? "step" : undefined}
              className="group flex flex-col items-center gap-2 disabled:cursor-not-allowed"
            >
              <span className="relative grid size-[58px] place-items-center">
                <svg viewBox="0 0 58 58" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="29" cy="29" r="25" fill={isDone ? "var(--o-ink)" : "#fff"} stroke="var(--o-line)" strokeWidth="1.5" />
                  <circle
                    cx="29"
                    cy="29"
                    r="25"
                    fill="none"
                    stroke="var(--m-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeDasharray={C}
                    strokeDashoffset={on ? 0 : C}
                    style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}
                  />
                </svg>
                <span className={`relative text-[15px] font-bold tabular-nums ${isDone ? "text-white" : "text-[var(--o-ink)]"}`}>
                  {isDone ? <CheckIcon className="size-5" /> : i + 1}
                </span>
              </span>
              <span className={`text-[13px] font-semibold ${on ? "text-[var(--o-ink)]" : "text-[var(--o-muted)]"} group-enabled:group-hover:text-[var(--o-ink)]`}>{label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <svg viewBox="0 0 60 24" className="mx-1 mt-2 w-[clamp(22px,6vw,64px)]" aria-hidden>
                <path d="M2 22 Q30 -6 58 22" fill="none" stroke={i < done ? "var(--o-ink)" : "var(--o-line)"} strokeWidth="1.5" strokeDasharray={i < done ? "0" : "3 4"} />
              </svg>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function SummaryLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  return (
    <li className="flex items-center gap-4 py-3">
      <span className="relative size-14 shrink-0">
        <span className="absolute inset-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
          <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="56px" />
        </span>
        <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-[var(--o-ink)] text-[11px] font-bold text-white ring-2 ring-white">{line.qty}</span>
      </span>
      <span className="min-w-0 flex-1">
        <span className={`${s.syne} block text-[15px] font-bold leading-tight`}>{splitName(f.name)[0]}</span>
        <span className="block text-[13px] text-[var(--o-muted)]">{WOOD_LABEL[line.wood]}</span>
        {line.custom && <span className="block text-[13px] text-[var(--o-ink-2)]">{line.custom}</span>}
      </span>
      <span className="text-[14px] font-semibold tabular-nums">{formatINR(v.price * line.qty)}</span>
    </li>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[14px] font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1.5 block text-[12px] text-[var(--o-muted)]">{hint}</span>}
    </label>
  );
}

export function Checkout() {
  const lines = useBag();
  const wood = useWood();
  const reduced = !!useReducedMotion();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(0);
  const [f, setF] = useState<Form>(EMPTY);
  const [placed, setPlaced] = useState<{ ref: string; lines: Line[]; total: number; name: string; email: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { count, subtotal } = bagTotals(lines);
  const set = <K extends keyof Form>(k: K, v: Form[K]) => setF((o) => ({ ...o, [k]: v }));

  const next = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.reportValidity()) return;
    if (step < STEPS.length - 1) {
      setDone((d) => Math.max(d, step + 1));
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    const ref = orderRef();
    setPlaced({ ref, lines, total: subtotal, name: f.name.split(" ")[0] || f.name, email: f.email });
    bag.clear();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  if (placed) {
    return (
      <section className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <div className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <motion.div
            className="relative grid size-[180px] place-items-center"
            initial={reduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <span className={`absolute inset-0 rounded-full ${wood === "red" ? s.woodRed : s.woodWhite}`} />
            <span className="relative grid size-[96px] place-items-center rounded-full bg-[var(--o-card)] text-[var(--o-ink)] shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)]">
              <CheckIcon className="size-10" />
            </span>
          </motion.div>
          <h1 className={`${s.display} mt-10 text-[clamp(2.8rem,6vw,5rem)]`}>Thank you, {placed.name}.</h1>
          <p className="mt-5 text-[17px] leading-relaxed text-[var(--o-ink-2)]">
            Order <span className="font-semibold tabular-nums text-[var(--o-ink)]">{placed.ref}</span> is noted. We will write to {placed.email} to confirm delivery.
          </p>
          <p className="mt-3 rounded-full bg-[var(--o-stone)] px-5 py-2 text-[14px] text-[var(--o-ink-2)]">Preview: payments are not connected yet, so nothing was charged.</p>
          <ul className="mt-10 w-full max-w-[460px] divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] text-left">
            {placed.lines.map((l) => (
              <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
            ))}
          </ul>
          <p className="mt-4 text-[15px]">
            Total <span className="font-semibold tabular-nums">{formatINR(placed.total)}</span>
          </p>
          <Link href={HOME} className="group mt-10 inline-flex h-14 items-center gap-3 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white hover:bg-black">
            Back to the ring
            <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)]">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </section>
    );
  }

  if (count === 0) {
    const picks = FAMILIES.filter((x) => x.variants[wood]).slice(0, 3);
    return (
      <section className="px-5 pb-24 pt-32 md:px-10 md:pt-40">
        <div className="mx-auto max-w-[900px] text-center">
          <h1 className={`${s.display} text-[clamp(2.8rem,6vw,5rem)]`}>Your bag is empty.</h1>
          <p className="mt-5 text-[17px] text-[var(--o-ink-2)]">Add a piece and come back. A few places to start:</p>
          <ul className="mt-12 grid gap-8 sm:grid-cols-3">
            {picks.map((x) => {
              const v = x.variants[wood]!;
              return (
                <li key={x.slug} className="flex flex-col items-center">
                  <Link href={productHref(x.slug)} className="relative block size-[150px] overflow-hidden rounded-full bg-[var(--o-floor)] transition-transform hover:scale-105">
                    <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="150px" />
                  </Link>
                  <p className={`${s.syne} mt-3 text-[17px] font-bold`}>{splitName(x.name)[0]}</p>
                  <p className="text-[14px] tabular-nums text-[var(--o-muted)]">{formatINR(v.price)}</p>
                  <AddButton family={x} label="Add" className="mt-3 !h-11 !px-5 !text-[13px]" />
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section className="px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <div className="mx-auto grid max-w-[1280px] gap-12 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-7">
          <h1 className={`${s.display} text-[clamp(3rem,6vw,5.4rem)]`}>Checkout</h1>
          <p className="mt-4 rounded-full border border-[var(--m-accent)] px-5 py-2.5 text-[14px] text-[var(--o-ink)] sm:inline-block">
            Preview: payments are not connected yet.
          </p>
          <div className="mt-10 overflow-x-auto pb-2">
            <Markers step={step} done={done} go={setStep} />
          </div>

          <form ref={formRef} onSubmit={next} className="mt-10" noValidate={false}>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={reduced ? { opacity: 0 } : { opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -30 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="space-y-5"
              >
                {step === 0 && (
                  <>
                    <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>How do we reach you?</h2>
                    <Field label="Full name">
                      <input className={s.field} required autoComplete="name" value={f.name} onChange={(e) => set("name", e.target.value)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field label="Email">
                        <input className={s.field} type="email" required autoComplete="email" value={f.email} onChange={(e) => set("email", e.target.value)} />
                      </Field>
                      <Field label="Mobile number" hint="Ten digits, for delivery updates">
                        <div className="relative">
                          <span className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--o-muted)]">+91</span>
                          <input
                            className={`${s.field} pl-14`}
                            type="tel"
                            inputMode="numeric"
                            required
                            pattern="[6-9][0-9]{9}"
                            maxLength={10}
                            autoComplete="tel-national"
                            value={f.phone}
                            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                          />
                        </div>
                      </Field>
                    </div>
                  </>
                )}

                {step === 1 && (
                  <>
                    <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>Where should it go?</h2>
                    <Field label="House, building and street">
                      <input className={s.field} required autoComplete="address-line1" value={f.line1} onChange={(e) => set("line1", e.target.value)} />
                    </Field>
                    <Field label="Area or landmark (optional)">
                      <input className={s.field} autoComplete="address-line2" value={f.line2} onChange={(e) => set("line2", e.target.value)} />
                    </Field>
                    <div className="grid gap-5 sm:grid-cols-3">
                      <Field label="City">
                        <input className={s.field} required autoComplete="address-level2" value={f.city} onChange={(e) => set("city", e.target.value)} />
                      </Field>
                      <Field label="State">
                        <select className={s.field} required autoComplete="address-level1" value={f.state} onChange={(e) => set("state", e.target.value)}>
                          <option value="" disabled>
                            Choose
                          </option>
                          {STATES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="PIN code" hint="Six digits">
                        <input
                          className={s.field}
                          required
                          inputMode="numeric"
                          pattern="[1-9][0-9]{5}"
                          maxLength={6}
                          autoComplete="postal-code"
                          value={f.pin}
                          onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))}
                        />
                      </Field>
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
                    <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>Is it a gift?</h2>
                    <label className="flex cursor-pointer items-center gap-4 rounded-full border border-[var(--o-line)] bg-white p-2 pr-6 transition-colors hover:border-[var(--o-ink)] has-[:focus-visible]:border-[var(--o-ink)]">
                      <input type="checkbox" className="peer sr-only" checked={f.gift} onChange={(e) => set("gift", e.target.checked)} />
                      <span className="relative h-9 w-16 shrink-0 rounded-full bg-[var(--o-floor)] transition-colors peer-checked:bg-[var(--o-ink)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--m-accent)]">
                        <span className={`absolute top-1 size-7 rounded-full bg-white shadow transition-[left] duration-300 ${f.gift ? "left-8" : "left-1"}`} />
                      </span>
                      <span className="text-[15px] font-semibold">Yes, this is a gift</span>
                    </label>
                    {f.gift && (
                      <>
                        <Field label="Card message" hint={`${f.message.length} of 200 characters`}>
                          <textarea className={s.field} rows={4} maxLength={200} value={f.message} onChange={(e) => set("message", e.target.value)} placeholder="Your words, printed on a card inside" />
                        </Field>
                        <label className="flex cursor-pointer items-center gap-3 text-[15px]">
                          <input type="checkbox" className="size-5 accent-[var(--o-ink)]" checked={f.hidePrices} onChange={(e) => set("hidePrices", e.target.checked)} />
                          Leave prices off the packing slip
                        </label>
                      </>
                    )}
                    {!f.gift && <p className="text-[15px] text-[var(--o-muted)]">Every piece is wrapped the same way, gift or not.</p>}
                  </>
                )}

                {step === 3 && (
                  <>
                    <h2 className={`${s.syne} text-[24px] font-bold tracking-[-0.02em]`}>Check and place the order</h2>
                    <dl className="divide-y divide-[var(--o-line)] rounded-[28px] border border-[var(--o-line)] bg-white px-6">
                      <div className="flex justify-between gap-6 py-4 text-[15px]">
                        <dt className="text-[var(--o-muted)]">Contact</dt>
                        <dd className="text-right">
                          {f.name}
                          <br />
                          {f.email}, +91 {f.phone}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-6 py-4 text-[15px]">
                        <dt className="text-[var(--o-muted)]">Delivery</dt>
                        <dd className="text-right">
                          {f.line1}
                          {f.line2 && (
                            <>
                              <br />
                              {f.line2}
                            </>
                          )}
                          <br />
                          {f.city}, {f.state} {f.pin}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-6 py-4 text-[15px]">
                        <dt className="text-[var(--o-muted)]">Gift</dt>
                        <dd className="text-right">{f.gift ? `Yes${f.hidePrices ? ", no prices on the slip" : ""}${f.message ? `. Card: "${f.message}"` : ""}` : "No"}</dd>
                      </div>
                    </dl>
                    <p className="rounded-[22px] bg-[var(--o-stone)] px-5 py-4 text-[14px] leading-relaxed text-[var(--o-ink-2)]">
                      Preview: payments are not connected yet. Placing the order here only shows the confirmation; nothing is charged.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center gap-3">
              {step > 0 && (
                <button type="button" onClick={() => setStep(step - 1)} className="h-14 rounded-full border border-[var(--o-line)] px-6 text-[15px] font-semibold transition-colors hover:border-[var(--o-ink)]">
                  Back
                </button>
              )}
              <button type="submit" className="group flex h-14 flex-1 items-center justify-between rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99] sm:flex-none sm:gap-6">
                {step === STEPS.length - 1 ? `Place order, ${formatINR(subtotal)}` : `Continue to ${STEPS[step + 1].toLowerCase()}`}
                <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              </button>
            </div>
          </form>
        </div>

        <aside className="lg:col-span-5">
          <div className="rounded-[36px] bg-white p-6 shadow-[0_30px_80px_-40px_rgb(25_23_20/0.35)] md:p-8 lg:sticky lg:top-28">
            <div className="flex items-baseline justify-between">
              <h2 className={`${s.syne} text-[22px] font-bold`}>Your order</h2>
              <p className="text-[14px] text-[var(--o-muted)]">
                {count} {count === 1 ? "piece" : "pieces"}
              </p>
            </div>
            <ul className="mt-3 divide-y divide-[var(--o-line)]">
              {lines.map((l) => (
                <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
              ))}
            </ul>
            <div className="mt-3 space-y-2 border-t border-[var(--o-line)] pt-4 text-[15px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="tabular-nums">{formatINR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--o-muted)]">
                <span>Delivery</span>
                <span>Confirmed by email</span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-semibold">Total</span>
                <span className={`${s.syne} text-[28px] font-bold tabular-nums tracking-[-0.03em]`}>{formatINR(subtotal)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
