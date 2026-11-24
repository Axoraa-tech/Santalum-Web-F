"use client";

import Link from "next/link";
import { useId, useState, useSyncExternalStore, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, getVariant, WOOD_NAMES } from "@/lib/catalog";
import { bag, bagTotals, useBag, type Line } from "@/lib/cart";
import { r } from "./cls";
import { accession, STATES } from "./store";

const GIFT_WRAP = 350;

type Placed = {
  no: string;
  name: string;
  email: string;
  place: string;
  lines: Line[];
  total: number;
  gift: boolean;
  wrap: boolean;
};

const noop = () => () => {};
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

/** Checkout styled as an acquisition register. Payments are not connected: placing the entry only confirms it. */
export function Register() {
  const hydrated = useHydrated();
  const lines = useBag();
  const { count, subtotal } = bagTotals(lines);
  const [gift, setGift] = useState(false);
  const [wrap, setWrap] = useState(true);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const formId = useId();
  const wrapCost = gift && wrap ? GIFT_WRAP : 0;
  const total = subtotal + wrapCost;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (k: string) => String(d.get(k) ?? "").trim();
    setPlaced({
      no: `SM-A-26-${String(Math.floor(1000 + Math.random() * 9000))}`,
      name: get("name"),
      email: get("email"),
      place: `${get("city")}, ${get("state")} ${get("pin")}`,
      lines,
      total,
      gift,
      wrap: gift && wrap,
    });
    bag.clear();
    window.scrollTo({ top: 0 });
  };

  return (
    <div className={r.reg}>
      <header className={r.head}>
        <div>
          <h1 className={r.title}>
            Acquisition <i>register</i>
          </h1>
          <p className={r.lede}>
            {placed
              ? "Your entry has been written in the register."
              : "One entry for the objects in your ledger: who acquires them, where they go, and whether they travel as a gift."}
          </p>
        </div>
        <p className={r.notice} role="note">
          <b>Preview: payments are not connected yet.</b>
          Entering this register charges nothing and sends nothing. It shows how the order will be taken.
        </p>
      </header>

      {placed ? (
        <Confirmation p={placed} />
      ) : !hydrated ? (
        <div className="min-h-[60svh]" aria-hidden="true" />
      ) : lines.length === 0 ? (
        <div className={r.done}>
          <div>
            <p className={r.asideTitle}>The ledger is empty.</p>
            <p className="mt-2 text-[15px] text-[var(--mute)]">
              Nothing has been acquired on this visit yet. The collection hangs in room 4; every wall label has a View
              link.
            </p>
            <Link href="/d/04#collection" className={`${r.btnLine} mt-6`}>
              Walk to the collection
            </Link>
          </div>
        </div>
      ) : (
        <div className={r.grid}>
          <form id={formId} className={r.book} onSubmit={submit}>
            <Part no="1" name="The acquirer">
              <Field label="Full name" name="name" autoComplete="name" placeholder="As it should appear on the parcel" required />
              <Field label="Email" name="email" type="email" autoComplete="email" placeholder="name@example.com" required />
              <Field
                label="Mobile"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                pattern="(\+91)?[6-9][0-9]{9}"
                placeholder="10-digit number"
                required
                hint="For the courier only."
              />
            </Part>

            <Part no="2" name="Delivery in India">
              <Field label="Address" name="line1" autoComplete="address-line1" placeholder="House, street" required />
              <Field label="Address, line 2" name="line2" autoComplete="address-line2" placeholder="Area, landmark (optional)" />
              <div className={r.two}>
                <Field label="City" name="city" autoComplete="address-level2" required />
                <Field
                  label="PIN code"
                  name="pin"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  pattern="[1-9][0-9]{5}"
                  maxLength={6}
                  placeholder="560001"
                  required
                />
              </div>
              <StateSelect />
            </Part>

            <Part no="3" name="Gift">
              <label className={r.check}>
                <input type="checkbox" name="gift" checked={gift} onChange={(e) => setGift(e.target.checked)} />
                <span>
                  Send this as a gift
                  <small>Prices stay out of the parcel. Your card is written by hand.</small>
                </span>
              </label>
              {gift && (
                <>
                  <Field label="Recipient" name="recipient" autoComplete="off" placeholder="Name on the card (optional)" />
                  <Area label="Card message" name="message" />
                  <label className={r.check}>
                    <input type="checkbox" name="wrap" checked={wrap} onChange={(e) => setWrap(e.target.checked)} />
                    <span>
                      Linen gift wrap, {formatINR(GIFT_WRAP)}
                      <small>Wrapped in linen and tied by hand.</small>
                    </span>
                  </label>
                </>
              )}
            </Part>
          </form>

          <aside className={r.aside} aria-label="Objects entered">
            <div className={r.asideHead}>
              <h2 className={r.asideTitle}>Objects entered</h2>
              <span className="text-[13px] text-[var(--mute)]">
                {count} {count === 1 ? "object" : "objects"}
              </span>
            </div>
            <ol className={r.entries}>
              {lines.map((l, i) => {
                const f = getFamily(l.slug);
                const v = getVariant(l.slug, l.wood);
                if (!f || !v) return null;
                return (
                  <li key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className={r.entry}>
                    <span className={r.entryNo}>{i + 1}</span>
                    <span className={r.thumb}>
                      <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="56px" />
                    </span>
                    <span className="min-w-0">
                      <span className={`${r.entryName} block`}>{f.name}</span>
                      <span className={`${r.entryMeta} block`}>
                        {WOOD_NAMES[l.wood].common}, quantity {l.qty}
                      </span>
                      <span className={`${r.entryMeta} block`}>Accession {accession(f.slug, l.wood)}</span>
                      {l.custom && <span className={`${r.entryMeta} block`}>Made to order: {l.custom}</span>}
                    </span>
                    <span className={r.amount}>{formatINR(v.price * l.qty)}</span>
                  </li>
                );
              })}
            </ol>
            <dl className={r.sums}>
              <div>
                <dt>Subtotal</dt>
                <dd>{formatINR(subtotal)}</dd>
              </div>
              {wrapCost > 0 && (
                <div>
                  <dt>Linen gift wrap</dt>
                  <dd>{formatINR(wrapCost)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery across India</dt>
                <dd>Complimentary</dd>
              </div>
              <div className={r.total}>
                <dt>Total</dt>
                <dd>{formatINR(total)}</dd>
              </div>
            </dl>
            <button type="submit" form={formId} className={r.submit}>
              Enter in the register
            </button>
            <p className={r.fine}>Preview: payments are not connected yet. No card or UPI details are asked for.</p>
            <p className="mt-4">
              <Link href="/d/04#collection" className={r.link}>
                Back to the collection
              </Link>
            </p>
          </aside>
        </div>
      )}

      <footer className={r.foot}>
        <span>Santalum Maison. Red and white sandalwood from India.</span>
        <span>Delivery across India is complimentary. Unused pieces can be returned within 14 days.</span>
        <span>© 2026</span>
      </footer>
    </div>
  );
}

function Part({ no, name, children }: { no: string; name: string; children: ReactNode }) {
  return (
    <fieldset className={r.part}>
      <legend className={r.legend}>
        <span className={r.partNo} aria-hidden="true">
          {no}
        </span>
        <span className={r.partName}>{name}</span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  hint,
  ...input
}: { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={r.row}>
      <label htmlFor={id}>{label}</label>
      <div>
        <input id={id} {...input} />
        {hint && <p className={r.hint}>{hint}</p>}
      </div>
    </div>
  );
}

function Area({ label, name }: { label: string; name: string }) {
  const id = useId();
  return (
    <div className={r.row}>
      <label htmlFor={id}>{label}</label>
      <textarea id={id} name={name} maxLength={240} placeholder="A few lines, written by hand on the card" />
    </div>
  );
}

function StateSelect() {
  const id = useId();
  return (
    <div className={r.row}>
      <label htmlFor={id}>State</label>
      <select id={id} name="state" required defaultValue="">
        <option value="" disabled>
          Choose a state or union territory
        </option>
        {STATES.map((st) => (
          <option key={st}>{st}</option>
        ))}
      </select>
    </div>
  );
}

function Confirmation({ p }: { p: Placed }) {
  return (
    <div className={r.done}>
      <div>
        <p className="text-[15px] text-[var(--mute)]">Entry number</p>
        <p className={r.doneNo}>{p.no}</p>
        <p className="mt-5 max-w-[34em] text-[16px]">
          Thank you, {p.name.split(" ")[0] || "and welcome"}. The objects below are entered against your name. A
          confirmation would be sent to {p.email}.
        </p>
        <p className="mt-3 max-w-[34em] text-[14px] text-[var(--mute)]">
          Preview only. No payment was taken and nothing was sent.
        </p>
        <Link href="/d/04" className={`${r.btnLine} mt-6`}>
          Return to the corridor
        </Link>
      </div>
      <div className={r.card}>
        <dl>
          <div>
            <dt>Deliver to</dt>
            <dd>{p.place}</dd>
          </div>
          <div>
            <dt>Objects</dt>
            <dd>
              {p.lines.map((l) => {
                const f = getFamily(l.slug);
                return (
                  <span key={`${l.slug}-${l.wood}-${l.custom ?? ""}`} className="block">
                    {f?.name}, {WOOD_NAMES[l.wood].common.toLowerCase()}
                    {l.qty > 1 ? `, ${l.qty}` : ""}
                    {l.custom ? `. Made to order: ${l.custom}` : ""}
                  </span>
                );
              })}
            </dd>
          </div>
          <div>
            <dt>As a gift</dt>
            <dd>{p.gift ? (p.wrap ? "Yes, in linen wrap" : "Yes") : "No"}</dd>
          </div>
          <div>
            <dt>Total</dt>
            <dd>{formatINR(p.total)}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
