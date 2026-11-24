"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { FAMILIES, formatINR, getFamily, getVariant } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { s } from "../_components/cls";
import { cx, STATES, WOOD_SHORT } from "../_components/data";
import { PieceTile } from "../_components/PieceTile";
import { IconCheck, IconMinus, IconOpen } from "../_components/ui";

type Placed = { ref: string; name: string; email: string; city: string; state: string; pin: string; lines: Line[]; subtotal: number; gift: boolean; note: boolean };

/** A preview order reference; called only from the submit handler. */
function orderRef() {
  return `SM-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.floor(Math.random() * 90) + 10}`;
}

function Tile({ title, children, className, n }: { title: string; children: ReactNode; className?: string; n?: number }) {
  return (
    <section className={cx(s.tile, "p-5 sm:p-7", className)} aria-label={title}>
      <div className="mb-5 flex items-center gap-3">
        {n && <span className={cx(s.mono, "grid size-8 place-items-center rounded-full bg-[#141414] text-[12px] text-white")}>{n}</span>}
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Field({ id, label, className, children }: { id: string; label: string; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function CheckoutBento() {
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [msg, setMsg] = useState("");
  const [placed, setPlaced] = useState<Placed | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const get = (k: string) => String(fd.get(k) ?? "").trim();
    setPlaced({
      ref: orderRef(),
      name: get("name"),
      email: get("email"),
      city: get("city"),
      state: get("state"),
      pin: get("pin"),
      lines: lines.map((l) => ({ ...l })),
      subtotal,
      gift,
      note: gift && msg.trim().length > 0,
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  if (placed) return <Confirmation p={placed} />;
  if (count === 0) return <Empty />;

  return (
    <div className={s.checkout}>
      <div className={cx(s.tile, "flex min-h-[180px] flex-col justify-end p-6 sm:p-8 lg:col-span-8")}>
        <h1 className={cx(s.display, "text-[clamp(48px,10cqw,104px)]")}>Checkout</h1>
        <p className={cx(s.muted, "mt-3 text-[16px]")}>
          {count} {count === 1 ? "piece" : "pieces"}, {formatINR(subtotal)}. Delivered within India.
        </p>
      </div>
      <div className={cx(s.tile, s.tint, "flex flex-col justify-between gap-4 p-6 lg:col-span-4")} role="note">
        <p className={cx(s.monoWide, "text-[28px] leading-none")}>Preview</p>
        <p className="text-[15px] leading-[1.45]">Preview: payments are not connected yet. Placing an order here shows the confirmation step and clears your bag. Nothing is charged.</p>
      </div>

      <form id="b6-checkout" onSubmit={submit} className="flex flex-col gap-3 lg:col-span-7">
        <Tile title="Contact" n={1}>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="b6-name" label="Full name" className="sm:col-span-2">
              <input id="b6-name" name="name" required autoComplete="name" className={s.field} />
            </Field>
            <Field id="b6-email" label="Email">
              <input id="b6-email" name="email" type="email" required autoComplete="email" className={s.field} />
            </Field>
            <Field id="b6-phone" label="Mobile number">
              <input
                id="b6-phone"
                name="phone"
                type="tel"
                required
                inputMode="numeric"
                autoComplete="tel-national"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                title="A 10-digit Indian mobile number"
                className={cx(s.field, s.mono)}
              />
            </Field>
          </div>
        </Tile>

        <Tile title="Delivery" n={2}>
          <div className="grid gap-3 sm:grid-cols-6">
            <Field id="b6-a1" label="House, building, street" className="sm:col-span-6">
              <input id="b6-a1" name="address1" required autoComplete="address-line1" className={s.field} />
            </Field>
            <Field id="b6-a2" label="Area, landmark (optional)" className="sm:col-span-6">
              <input id="b6-a2" name="address2" autoComplete="address-line2" className={s.field} />
            </Field>
            <Field id="b6-city" label="City" className="sm:col-span-3">
              <input id="b6-city" name="city" required autoComplete="address-level2" className={s.field} />
            </Field>
            <Field id="b6-pin" label="PIN code" className="sm:col-span-3">
              <input
                id="b6-pin"
                name="pin"
                required
                inputMode="numeric"
                autoComplete="postal-code"
                pattern="[1-9][0-9]{5}"
                maxLength={6}
                title="A 6-digit PIN code"
                className={cx(s.field, s.mono)}
              />
            </Field>
            <Field id="b6-state" label="State or union territory" className="sm:col-span-6">
              <select id="b6-state" name="state" required defaultValue="" autoComplete="address-level1" className={s.field}>
                <option value="" disabled>
                  Choose one
                </option>
                {STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Tile>

        <Tile title="Gift" n={3} className={gift ? s.tint : ""}>
          <button
            type="button"
            role="switch"
            aria-checked={gift}
            onClick={() => setGift((g) => !g)}
            className="flex w-full items-center justify-between gap-4 rounded-[18px] bg-[#f6f4f0] p-4 text-left transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <span>
              <span className="block text-[16px] font-medium">This is a gift</span>
              <span className={cx(s.muted, "block text-[13.5px]")}>Add a written message and leave prices off the packing slip.</span>
            </span>
            <span className={cx("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300", gift ? "bg-[#141414]" : "bg-[#d9d6cf]")} aria-hidden>
              <motion.span layout className={cx("absolute top-1 size-5 rounded-full bg-white", gift ? "right-1" : "left-1")} />
            </span>
          </button>
          <AnimatePresence initial={false}>
            {gift && (
              <motion.div
                key="gift"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className="pt-4">
                  <Field id="b6-msg" label="Message for the card">
                    <textarea
                      id="b6-msg"
                      name="message"
                      rows={3}
                      maxLength={200}
                      value={msg}
                      onChange={(e) => setMsg(e.target.value)}
                      className={cx(s.field, s.fieldWhite)}
                    />
                  </Field>
                  <p className={cx(s.mono, s.muted, "mt-1 text-right text-[10.5px]")}>{200 - msg.length} characters left</p>
                  <label className="mt-2 flex cursor-pointer items-center gap-3 text-[14px]">
                    <input type="checkbox" name="noPrices" defaultChecked className="size-4 accent-[#141414]" />
                    Leave prices off the packing slip
                  </label>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </Tile>
      </form>

      <aside className="lg:sticky lg:top-[72px] lg:col-span-5" aria-label="Order summary">
        <div className={cx(s.tile, "p-5 sm:p-7")}>
          <h2 className="text-[22px] font-medium tracking-[-0.03em]">Summary</h2>
          <ul className="mt-4 flex flex-col gap-2">
            {lines.map((l) => (
              <SummaryLine key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} l={l} />
            ))}
          </ul>
          <dl className="mt-5 space-y-2 border-t border-black/[0.07] pt-4">
            <div className="flex justify-between text-[15px]">
              <dt>Subtotal</dt>
              <dd className={s.mono}>{formatINR(subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4 text-[15px]">
              <dt>Delivery</dt>
              <dd className={cx(s.muted, "text-right text-[13.5px]")}>Confirmed before payment</dd>
            </div>
            <div className="flex items-baseline justify-between pt-2">
              <dt className="text-[17px] font-medium">Total</dt>
              <dd className={cx(s.monoWide, "text-[26px]")}>{formatINR(subtotal)}</dd>
            </div>
          </dl>
          <button type="submit" form="b6-checkout" className={cx(s.btn, s.btnLg, "mt-5 w-full")}>
            Place order, {formatINR(subtotal)}
          </button>
          <p className={cx(s.muted, "mt-3 text-[13px] leading-[1.45]")}>Preview: payments are not connected yet.</p>
        </div>
      </aside>
    </div>
  );
}

function SummaryLine({ l }: { l: Line }) {
  const f = getFamily(l.slug);
  const v = getVariant(l.slug, l.wood);
  if (!f || !v) return null;
  return (
    <li className="flex gap-3 rounded-[20px] bg-[#f6f4f0] p-2">
      <span className="relative size-[68px] shrink-0 overflow-hidden rounded-[14px]">
        <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="68px" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5 pr-1">
        <div>
          <p className="truncate text-[15px] font-medium leading-tight">{f.name}</p>
          <p className={cx(s.mono, s.muted, "text-[10.5px]")}>{WOOD_SHORT[l.wood]}</p>
          {l.custom && <p className={cx(s.mono, "truncate text-[10.5px]")}>Custom: {l.custom}</p>}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 rounded-full bg-white p-0.5">
            <button type="button" className={cx(s.icon, s.iconSm, s.onWhite)} onClick={() => bag.setQty(l, l.qty - 1)} aria-label={`One fewer ${f.name}`}>
              <IconMinus size={14} />
            </button>
            <span className={cx(s.mono, "w-5 text-center text-[13px]")}>{l.qty}</span>
            <button
              type="button"
              className={cx(s.icon, s.iconSm, s.onWhite)}
              onClick={() => bag.setQty(l, l.qty + 1)}
              disabled={l.qty >= 9}
              aria-label={`One more ${f.name}`}
            >
              <IconOpen size={14} />
            </button>
          </div>
          <span className={cx(s.mono, "text-[13px]")}>{formatINR(v.price * l.qty)}</span>
        </div>
      </div>
    </li>
  );
}

function Confirmation({ p }: { p: Placed }) {
  const first = p.name.split(" ")[0] || "there";
  return (
    <div className={s.checkout}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={cx(s.tile, "flex min-h-[320px] flex-col justify-between gap-8 p-6 sm:p-10 lg:col-span-8")}
        role="status"
      >
        <span className="grid size-14 place-items-center rounded-full bg-[#141414] text-white">
          <IconCheck size={24} />
        </span>
        <div>
          <h1 className={cx(s.display, "text-[clamp(44px,9cqw,96px)]")}>Thank you, {first}.</h1>
          <p className={cx(s.muted, "mt-4 max-w-[48ch] text-[17px] leading-[1.5]")}>
            Your order is noted. In the finished site a confirmation would go to {p.email}. This was a preview: payments are not connected yet and nothing was charged.
          </p>
        </div>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
        className={cx(s.tile, s.tint, "flex flex-col justify-between gap-6 p-6 lg:col-span-4")}
      >
        <div>
          <p className={cx(s.mono, "text-[11px] opacity-70")}>Order reference</p>
          <p className={cx(s.monoWide, "mt-1 text-[30px] leading-none")}>{p.ref}</p>
        </div>
        <p className="text-[15px] leading-[1.5]">
          Delivering to {p.city}, {p.state} {p.pin}.{p.gift ? (p.note ? " Packed as a gift, with your message." : " Packed as a gift.") : ""}
        </p>
      </motion.div>
      <div className={cx(s.tile, "p-5 sm:p-7 lg:col-span-7")}>
        <h2 className="text-[22px] font-medium tracking-[-0.03em]">What you ordered</h2>
        <ul className="mt-4 divide-y divide-black/[0.07]">
          {p.lines.map((l) => {
            const f = getFamily(l.slug);
            const v = getVariant(l.slug, l.wood);
            if (!f || !v) return null;
            return (
              <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-medium">
                    {f.name} <span className={cx(s.mono, s.muted, "text-[11px]")}>x{l.qty}</span>
                  </span>
                  <span className={cx(s.mono, s.muted, "block text-[10.5px]")}>
                    {WOOD_SHORT[l.wood]}
                    {l.custom ? `, custom: ${l.custom}` : ""}
                  </span>
                </span>
                <span className={cx(s.mono, "text-[13px]")}>{formatINR(v.price * l.qty)}</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 flex justify-between border-t border-black/[0.07] pt-4 text-[16px] font-medium">
          Total <span className={s.monoWide}>{formatINR(p.subtotal)}</span>
        </p>
      </div>
      <Link
        href="/d/06"
        className={cx(
          s.tile,
          s.dark,
          "group flex min-h-[200px] flex-col justify-between p-6 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.99] lg:col-span-5",
        )}
      >
        <span className="text-[clamp(28px,7cqw,44px)] font-medium leading-none tracking-[-0.04em]">Back to the house</span>
        <span className="text-[14px] text-white/60 transition-colors group-hover:text-white">Keep looking around</span>
      </Link>
    </div>
  );
}

function Empty() {
  const wood = useWood();
  const picks = FAMILIES.filter((f) => f.level === "Discovery" && f.variants[wood]).slice(0, 2);
  return (
    <div className={s.checkout}>
      <div className={cx(s.tile, "flex min-h-[300px] flex-col justify-between gap-6 p-6 sm:p-10 lg:col-span-6")}>
        <h1 className={cx(s.display, "text-[clamp(40px,9cqw,88px)]")}>Your bag is empty</h1>
        <div>
          <p className={cx(s.muted, "max-w-[40ch] text-[16px] leading-[1.5]")}>Checkout opens when there is something in the bag. Most people begin with something small.</p>
          <Link href="/d/06#collection" className={cx(s.btn, "mt-5")}>
            See the collection
          </Link>
        </div>
      </div>
      {picks.map((f) => (
        <PieceTile key={f.slug} family={f} wood={wood} id={`co-${f.slug}`} className="min-h-[300px] lg:col-span-3" />
      ))}
    </div>
  );
}
