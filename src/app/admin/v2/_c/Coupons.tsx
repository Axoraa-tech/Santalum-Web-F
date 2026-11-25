"use client";

import { useState } from "react";
import { formatINR } from "../../_data/format";
import { couponState, deleteCoupon, saveCoupon, useCoupons, useNow, useOrders } from "../../_data/store";
import type { AdminCoupon } from "../../_data/types";
import { Check, Choice, F, Fig, Head, note, Section, Stamp } from "./kit";

const BLANK: AdminCoupon = { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true };
const STATE_WORD = { active: "", off: "Off", expired: "Expired", "used-up": "Used up" } as const;

/** Coupons as a register: code, terms, uses so far and what they gave away. */
export function CouponBook() {
  const coupons = useCoupons();
  const orders = useOrders();
  const now = useNow();
  const [edit, setEdit] = useState<{ c: AdminCoupon; original?: string } | null>(null);
  const usage = (code: string) => {
    const l = orders.filter((o) => o.coupon === code && o.status !== "cancelled");
    return { n: l.length, given: l.reduce((s, o) => s + o.discount, 0) };
  };
  return (
    <div>
      <Head
        kicker="Register"
        title="Coupons"
        aside={
          <button type="button" className="a2-btn" data-kind="ink" onClick={() => setEdit({ c: BLANK })}>
            New coupon
          </button>
        }
      />
      {edit ? <CouponForm key={edit.original ?? "new"} init={edit.c} original={edit.original} taken={coupons.map((c) => c.code)} onDone={() => setEdit(null)} /> : null}
      <div className="a2-ledger a2-kbook" role="table" aria-label="Coupons">
        <div className="a2-lrow a2-lhead" role="row">
          <span role="columnheader">Code</span>
          <span role="columnheader">Terms</span>
          <span role="columnheader" className="a2-r">Used</span>
          <span role="columnheader" className="a2-r">Given</span>
          <span role="columnheader">
            <span className="a2-sr">Actions</span>
          </span>
        </div>
        {coupons.map((c) => {
          const u = usage(c.code);
          const st = couponState(c, u.n, now);
          return (
            <div key={c.code} className="a2-lrow" role="row" data-void={st !== "active" || undefined}>
              <span className="a2-code" role="cell">
                {c.code}
                {st !== "active" ? <Stamp word={STATE_WORD[st]} ink="red" seed={c.code} size="sm" /> : null}
              </span>
              <span className="a2-part" role="cell">
                {c.label}
                <small>
                  {c.kind === "pct" ? `${c.value}% off` : `${formatINR(c.value)} off`}
                  {c.min ? ` · over ${formatINR(c.min)}` : ""}
                  {c.limit ? ` · ${c.limit} uses` : ""}
                  {c.expires ? ` · until ${c.expires}` : ""}
                </small>
              </span>
              <span className="a2-r a2-fig" role="cell">{u.n}</span>
              <span className="a2-r" role="cell"><Fig n={u.given} cr blank /></span>
              <span className="a2-act" role="cell">
                <button type="button" className="a2-link" onClick={() => setEdit({ c, original: c.code })}>
                  amend
                </button>
                <button
                  type="button"
                  className="a2-link"
                  onClick={() => {
                    saveCoupon({ ...c, active: !c.active }, c.code);
                    note(c.active ? `${c.code} switched off` : `${c.code} switched on`);
                  }}
                >
                  {c.active ? "switch off" : "switch on"}
                </button>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CouponForm({ init, original, taken, onDone }: { init: AdminCoupon; original?: string; taken: string[]; onDone: () => void }) {
  const [c, setC] = useState(init);
  const set = <K extends keyof AdminCoupon>(k: K, v: AdminCoupon[K]) => setC((x) => ({ ...x, [k]: v }));
  const code = c.code.trim().toUpperCase();
  const err = !code ? "Write a code." : !/^[A-Z0-9]+$/.test(code) ? "Letters and figures only." : code !== original && taken.includes(code) ? "That code is already in the register." : !(c.value > 0) ? "The value must be above 0." : c.kind === "pct" && c.value > 90 ? "No more than 90%." : null;
  const num = (s: string) => (s.trim() ? Math.max(0, Number(s.replace(/\D/g, ""))) : null);
  return (
    <Section title={original ? `Amend ${original}` : "A new coupon"} className="a2-boxed">
      <form
        className="a2-formgrid"
        onSubmit={(e) => {
          e.preventDefault();
          if (err) return;
          saveCoupon({ ...c, code, label: c.label.trim() || (c.kind === "pct" ? `${c.value}% off` : `${formatINR(c.value)} off`) }, original);
          note(original ? "Coupon amended" : "Coupon entered");
          onDone();
        }}
      >
        <F label="Code">
          <input value={c.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="DIWALI12" autoFocus />
        </F>
        <F group label="Kind">
          <Choice label="Kind" value={c.kind} onChange={(v) => set("kind", v)} items={[{ id: "pct", label: "Percent" }, { id: "flat", label: "Rupees" }]} />
        </F>
        <F label={c.kind === "pct" ? "Percent off" : "Rupees off"}>
          <input inputMode="numeric" value={c.value || ""} onChange={(e) => set("value", Number(e.target.value.replace(/\D/g, "")))} />
        </F>
        <F label="Minimum order ₹">
          <input inputMode="numeric" value={c.min ?? ""} onChange={(e) => set("min", num(e.target.value))} placeholder="none" />
        </F>
        <F label="Uses allowed">
          <input inputMode="numeric" value={c.limit ?? ""} onChange={(e) => set("limit", num(e.target.value))} placeholder="no limit" />
        </F>
        <F label="Good until">
          <input type="date" value={c.expires ?? ""} onChange={(e) => set("expires", e.target.value || null)} />
        </F>
        <F label="Shown to customers as" wide>
          <input value={c.label} onChange={(e) => set("label", e.target.value)} placeholder="12% off orders of ₹8,000 or more" />
        </F>
        <Check checked={c.active} onChange={(v) => set("active", v)}>
          Switched on
        </Check>
        {err ? <p className="a2-err">{err}</p> : null}
        <div className="a2-acts">
          <button type="submit" className="a2-btn" data-kind="ink" disabled={!!err}>
            {original ? "Save" : "Enter in the register"}
          </button>
          <button type="button" className="a2-link" onClick={onDone}>
            cancel
          </button>
          {original ? (
            <button
              type="button"
              className="a2-link a2-red"
              onClick={() => {
                if (!window.confirm(`Strike ${original} from the register?`)) return;
                deleteCoupon(original);
                note(`${original} struck out`);
                onDone();
              }}
            >
              strike out
            </button>
          ) : null}
        </div>
      </form>
    </Section>
  );
}
