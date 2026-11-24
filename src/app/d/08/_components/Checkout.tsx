"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useId, useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { WOOD_NAMES, formatINR, getFamily, getVariant } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { PHOTOS } from "@/lib/photos";
import { setMode } from "../_lib/view";
import { PinGlyph, WOOD_HEX } from "./Pins";
import { s } from "./styles";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id: string }) {
  return (
    <div>
      <label htmlFor={id} className="block text-[14px] text-(--a-ink-2)">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[12px] text-(--a-muted)">{hint}</p>}
    </div>
  );
}

function Stop({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <fieldset className="relative border border-(--a-line-2) bg-(--a-card) p-5 pt-6 shadow-[0_24px_50px_-40px_rgba(31,29,26,0.6)] md:p-7">
      <span className="absolute -left-4 -top-4 grid size-9 place-items-center rounded-full bg-(--m-accent) text-[15px] font-semibold text-white" aria-hidden>
        {n}
      </span>
      <legend className="sr-only">{title}</legend>
      <p className={`${s.serif} text-[26px] leading-none`} aria-hidden>
        {title}
      </p>
      <div className="mt-5 grid gap-4">{children}</div>
    </fieldset>
  );
}

function SummaryLine({ line }: { line: Line }) {
  const f = getFamily(line.slug);
  const v = getVariant(line.slug, line.wood);
  if (!f || !v) return null;
  return (
    <li className="flex gap-3 py-3">
      <div className="relative h-[76px] w-[60px] shrink-0 overflow-hidden bg-(--a-paper-2)">
        <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="120px" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-medium leading-tight">{f.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-(--a-muted)">
          <PinGlyph color={WOOD_HEX[line.wood]} className="h-3.5 w-2.5" />
          {WOOD_NAMES[line.wood].common}
        </p>
        {line.custom && <p className="mt-0.5 text-[12px] text-(--a-ink-2)">{line.custom}</p>}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-full border border-(--a-line-2)">
            <button type="button" aria-label={`One fewer ${f.name}`} onClick={() => bag.setQty(line, line.qty - 1)} className="grid size-7 place-items-center rounded-full hover:bg-black/5 active:bg-black/10">
              −
            </button>
            <span className="w-6 text-center text-[13px] tabular-nums">{line.qty}</span>
            <button type="button" aria-label={`One more ${f.name}`} onClick={() => bag.setQty(line, line.qty + 1)} className="grid size-7 place-items-center rounded-full hover:bg-black/5 active:bg-black/10">
              +
            </button>
          </div>
          <span className="text-[14px] tabular-nums">{formatINR(v.price * line.qty)}</span>
        </div>
      </div>
    </li>
  );
}

/** A short reference for the confirmation (called from the submit handler only). */
function orderRef() {
  return `SM-${Date.now().toString(36).slice(-6).toUpperCase()}`;
}

type Placed = { ref: string; name: string; city: string; state: string; count: number; total: number; gift: boolean };

export function Checkout() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const id = useId();
  const f = (k: string) => `${id}-${k}`;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setPlaced({
      ref: orderRef(),
      name: String(data.get("name") ?? ""),
      city: String(data.get("city") ?? ""),
      state: String(data.get("state") ?? ""),
      count,
      total: subtotal,
      gift,
    });
    bag.clear();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`${s.paper} min-h-svh pb-32 pt-24 md:pt-28`}>
      <div className="mx-auto w-full max-w-[1200px] px-4 md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-(--a-ink) pb-5">
          <h1 className={`${s.serif} text-[clamp(2.6rem,6vw,4.6rem)] leading-none tracking-[-0.02em]`}>{placed ? "Order noted" : "Checkout"}</h1>
          <p role="note" className="flex items-center gap-2 rounded-full border border-(--m-accent) bg-(--a-card) px-4 py-2 text-[14px]">
            <span className="size-2 rounded-full bg-(--m-accent)" aria-hidden />
            Preview: payments are not connected yet
          </p>
        </div>

        <AnimatePresence mode="wait">
          {placed ? (
            <motion.section
              key="done"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 grid gap-8 md:grid-cols-[1.1fr_0.9fr]"
              aria-live="polite"
            >
              <div className="border border-(--a-ink) bg-(--a-card) p-6 md:p-9">
                <p className="text-[14px] text-(--a-muted)">Reference</p>
                <p className="mt-1 text-[28px] font-semibold tracking-[0.06em] tabular-nums">{placed.ref}</p>
                <p className={`${s.serif} mt-6 text-[clamp(1.6rem,3vw,2.2rem)] leading-tight`}>
                  Thank you{placed.name ? `, ${placed.name.split(" ")[0]}` : ""}. Your order of {placed.count} {placed.count === 1 ? "piece" : "pieces"} is noted.
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-(--a-ink-2)">
                  It would travel to {placed.city}, {placed.state}
                  {placed.gift ? ", wrapped as a gift" : ""}. Total {formatINR(placed.total)}.
                </p>
                <p className="mt-6 border-l-2 border-(--m-accent) pl-4 text-[14px] leading-relaxed text-(--a-ink-2)">
                  Preview: payments are not connected yet. No payment was taken and nothing will be sent.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/d/08" onClick={() => setMode("canvas")} className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
                    Back to the board
                  </Link>
                  <Link href="/d/08" onClick={() => setMode("list")} className={`${s.btn} ${s.btnLine} h-12 px-6 text-[15px]`}>
                    Read it as a list
                  </Link>
                </div>
              </div>
              <div className="relative min-h-[280px] overflow-hidden">
                <Photo p={PHOTOS.giftLinen} sizes="(min-width: 768px) 45vw, 100vw" />
              </div>
            </motion.section>
          ) : lines.length === 0 ? (
            <motion.section key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 border border-dashed border-(--a-line-2) bg-(--a-card) p-8 md:p-12">
              <p className={`${s.serif} text-[clamp(1.8rem,3vw,2.4rem)]`}>Your bag is empty.</p>
              <p className="mt-3 max-w-[520px] text-[16px] leading-relaxed text-(--a-ink-2)">Open any piece on the board, choose the wood, and add it. It will be waiting here.</p>
              <Link href="/d/08" className={`${s.btn} ${s.btnInk} mt-6 h-12 px-6 text-[15px] font-medium`}>
                Back to the board
              </Link>
            </motion.section>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14">
              <div className="relative grid gap-10 pl-4">
                <span className={`${s.vroute} absolute bottom-8 left-0 top-6 w-[3px]`} aria-hidden />
                <Stop n={1} title="Contact">
                  <Field id={f("name")} label="Full name">
                    <input id={f("name")} name="name" required autoComplete="name" className={s.field} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field id={f("email")} label="Email">
                      <input id={f("email")} name="email" type="email" required autoComplete="email" className={s.field} />
                    </Field>
                    <Field id={f("phone")} label="Mobile number" hint="Ten digits, for delivery updates">
                      <input id={f("phone")} name="phone" type="tel" required inputMode="numeric" pattern="[0-9]{10}" maxLength={10} autoComplete="tel-national" className={s.field} />
                    </Field>
                  </div>
                </Stop>

                <Stop n={2} title="Delivery address">
                  <Field id={f("line1")} label="House, street">
                    <input id={f("line1")} name="line1" required autoComplete="address-line1" className={s.field} />
                  </Field>
                  <Field id={f("line2")} label="Area, landmark (optional)">
                    <input id={f("line2")} name="line2" autoComplete="address-line2" className={s.field} />
                  </Field>
                  <div className="grid gap-4 sm:grid-cols-[1fr_0.7fr]">
                    <Field id={f("city")} label="City or town">
                      <input id={f("city")} name="city" required autoComplete="address-level2" className={s.field} />
                    </Field>
                    <Field id={f("pin")} label="PIN code" hint="Six digits">
                      <input id={f("pin")} name="pin" required inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} autoComplete="postal-code" className={s.field} />
                    </Field>
                  </div>
                  <Field id={f("state")} label="State or union territory">
                    <div className="relative">
                      <select id={f("state")} name="state" required defaultValue="" autoComplete="address-level1" className={`${s.field} appearance-none pr-10`}>
                        <option value="" disabled>
                          Choose
                        </option>
                        {STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                      <svg viewBox="0 0 12 8" className="pointer-events-none absolute right-4 top-1/2 h-2 w-3 -translate-y-1/2" aria-hidden>
                        <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.4" />
                      </svg>
                    </div>
                  </Field>
                </Stop>

                <Stop n={3} title="Gift">
                  <label className="flex cursor-pointer items-start gap-3 text-[15px]">
                    <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} className="mt-0.5 size-5 accent-(--m-accent)" />
                    <span>
                      This is a gift
                      <span className="block text-[13px] text-(--a-muted)">Wrapped, with your note on a card and no prices inside.</span>
                    </span>
                  </label>
                  <AnimatePresence initial={false}>
                    {gift && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <div className="grid gap-4 pt-1">
                          <Field id={f("to")} label="Recipient's name">
                            <input id={f("to")} name="to" className={s.field} />
                          </Field>
                          <Field id={f("note")} label="Card note" hint="For corporate gifts, add the number of pieces and the date you need them.">
                            <textarea id={f("note")} name="note" rows={3} maxLength={300} className={`${s.field} resize-y`} />
                          </Field>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Stop>
              </div>

              <aside className="lg:sticky lg:top-24 lg:self-start" aria-labelledby={f("sum")}>
                <div className="border border-(--a-ink) bg-(--a-card) p-5 md:p-7">
                  <div className="flex items-baseline justify-between">
                    <h2 id={f("sum")} className={`${s.serif} text-[26px]`}>
                      Your bag
                    </h2>
                    <span className="text-[13px] text-(--a-muted)">
                      {count} {count === 1 ? "piece" : "pieces"}
                    </span>
                  </div>
                  <ul className="mt-2 divide-y divide-(--a-line)">
                    {lines.map((l) => (
                      <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} line={l} />
                    ))}
                  </ul>
                  <dl className="mt-2 border-t border-(--a-line-2) pt-3 text-[15px]">
                    <div className="flex justify-between py-1">
                      <dt className="text-(--a-muted)">Subtotal</dt>
                      <dd className="tabular-nums">{formatINR(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between py-1">
                      <dt className="text-(--a-muted)">Delivery</dt>
                      <dd>Shown before payment</dd>
                    </div>
                    <div className="mt-2 flex justify-between border-t border-(--a-line) pt-3 text-[18px] font-semibold">
                      <dt>Total</dt>
                      <dd className="tabular-nums">{formatINR(subtotal)}</dd>
                    </div>
                  </dl>
                  <button type="submit" className={`${s.btn} ${s.btnInk} mt-6 h-13 min-h-12 w-full text-[16px] font-medium`}>
                    Place order
                  </button>
                  <p className="mt-3 text-center text-[13px] leading-snug text-(--a-muted)">Preview: payments are not connected yet. Placing the order takes no payment.</p>
                </div>
              </aside>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
