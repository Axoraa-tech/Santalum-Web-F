"use client";

import { useMemo, useState } from "react";
import { fmtDate, formatINR } from "../../_data/format";
import { couponState, deleteCoupon, saveCoupon, useCoupons, useNow, useOrders } from "../../_data/store";
import type { AdminCoupon } from "../../_data/types";
import { Check, Empty, Field, Head, say } from "../_ui/kit";

const STATE_LABEL = { active: "Active", off: "Paused", expired: "Expired", "used-up": "Used up" } as const;
const BLANK: AdminCoupon = { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true };

export function Coupons() {
  const coupons = useCoupons();
  const orders = useOrders();
  const now = useNow();
  const [editing, setEditing] = useState<{ c: AdminCoupon; original?: string } | null>(null);
  const usage = useMemo(() => {
    const m = new Map<string, { n: number; discount: number; revenue: number }>();
    for (const o of orders) {
      if (!o.coupon || o.status === "cancelled") continue;
      const x = m.get(o.coupon) ?? { n: 0, discount: 0, revenue: 0 };
      x.n++;
      x.discount += o.discount;
      x.revenue += o.total;
      m.set(o.coupon, x);
    }
    return m;
  }, [orders]);

  return (
    <>
      <Head
        no="07"
        title="Coupons"
        lede="Codes customers type at checkout. Usage counts orders that were not cancelled."
        actions={
          <button type="button" className="a6-btn" data-primary onClick={() => setEditing({ c: BLANK })}>
            New coupon
          </button>
        }
      />
      {editing && !editing.original && <CouponForm key="new" initial={editing.c} close={() => setEditing(null)} taken={coupons.map((c) => c.code)} />}
      {coupons.length ? (
        <ol className="a6-entries">
          {coupons.map((c) => {
            const u = usage.get(c.code) ?? { n: 0, discount: 0, revenue: 0 };
            const st = couponState(c, u.n, now);
            if (editing?.original === c.code)
              return (
                <li key={c.code} className="a6-entry">
                  <CouponForm initial={c} original={c.code} close={() => setEditing(null)} taken={coupons.map((x) => x.code).filter((x) => x !== c.code)} />
                </li>
              );
            return (
              <li key={c.code} className="a6-entry a6-coupon" data-off={st !== "active" || undefined}>
                <div className="a6-entry-fig">
                  <span className="a6-figure">{c.kind === "pct" ? `${c.value}%` : `₹${c.value}`}</span>
                  <span className="a6-muted">off</span>
                </div>
                <div className="a6-entry-body">
                  <h3 className="a6-h3 a6-num">{c.code}</h3>
                  <p>{c.label}</p>
                  <p className="a6-muted">
                    {STATE_LABEL[st]} · {c.min ? `min ${formatINR(c.min)}` : "no minimum"} · {c.limit ? `${u.n} of ${c.limit} used` : `${u.n} used`} · {c.expires ? `ends ${fmtDate(new Date(c.expires + "T12:00:00").getTime())}` : "no end date"}
                  </p>
                  <p className="a6-muted">
                    {formatINR(u.discount)} given on {formatINR(u.revenue)} of orders
                  </p>
                  <div className="a6-entry-actions">
                    <button type="button" className="a6-link" onClick={() => setEditing({ c, original: c.code })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="a6-link"
                      onClick={() => {
                        saveCoupon({ ...c, active: !c.active }, c.code);
                        say(`${c.code} ${c.active ? "paused" : "active"}`);
                      }}
                    >
                      {c.active ? "Pause" : "Resume"}
                    </button>
                    <button
                      type="button"
                      className="a6-link"
                      data-danger
                      onClick={() => {
                        if (!window.confirm(`Delete ${c.code}? Customers can no longer use it.`)) return;
                        deleteCoupon(c.code);
                        say(`${c.code} deleted`);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      ) : (
        <Empty>No coupons yet.</Empty>
      )}
    </>
  );
}

function CouponForm({ initial, original, close, taken }: { initial: AdminCoupon; original?: string; close: () => void; taken: string[] }) {
  const [c, setC] = useState(initial);
  const [err, setErr] = useState<string | null>(null);
  const set = (p: Partial<AdminCoupon>) => setC((x) => ({ ...x, ...p }));
  return (
    <form
      className="a6-panel"
      onSubmit={(e) => {
        e.preventDefault();
        const code = c.code.trim().toUpperCase();
        if (!/^[A-Z0-9]{4,20}$/.test(code)) return setErr("Use 4 to 20 letters or digits, no spaces.");
        if (taken.includes(code)) return setErr("That code already exists.");
        if (!(c.value > 0) || (c.kind === "pct" && c.value > 90)) return setErr("Enter a value; percentages go up to 90.");
        saveCoupon({ ...c, code, label: c.label.trim() || (c.kind === "pct" ? `${c.value}% off` : `₹${c.value} off`) }, original);
        say(`${code} saved`);
        close();
      }}
    >
      <h2 className="a6-h2">{original ? `Edit ${original}` : "New coupon"}</h2>
      <div className="a6-form-grid">
        <Field no="01" label="Code" error={err}>
          {(id) => <input id={id} className="a6-input a6-num" value={c.code} onChange={(e) => set({ code: e.target.value.toUpperCase() })} autoFocus />}
        </Field>
        <Field no="02" label="Description">
          {(id) => <input id={id} className="a6-input" value={c.label} onChange={(e) => set({ label: e.target.value })} />}
        </Field>
        <Field no="03" label="Discount">
          {(id) => (
            <div className="a6-form-row">
              <select id={id} className="a6-input" value={c.kind} onChange={(e) => set({ kind: e.target.value as AdminCoupon["kind"] })}>
                <option value="pct">Percent</option>
                <option value="flat">Rupees</option>
              </select>
              <input className="a6-input a6-num" inputMode="numeric" aria-label="Value" value={c.value || ""} onChange={(e) => set({ value: Number(e.target.value.replace(/\D/g, "")) })} />
            </div>
          )}
        </Field>
        <Field no="04" label="Minimum order, ₹">
          {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" placeholder="None" value={c.min ?? ""} onChange={(e) => set({ min: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} />}
        </Field>
        <Field no="05" label="Use limit">
          {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" placeholder="Unlimited" value={c.limit ?? ""} onChange={(e) => set({ limit: e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null })} />}
        </Field>
        <Field no="06" label="Ends on">
          {(id) => <input id={id} type="date" className="a6-input a6-num" value={c.expires ?? ""} onChange={(e) => set({ expires: e.target.value || null })} />}
        </Field>
      </div>
      <Check checked={c.active} onChange={(v) => set({ active: v })}>
        Active at checkout
      </Check>
      <div className="a6-actions">
        <button type="submit" className="a6-btn" data-primary>
          Save coupon
        </button>
        <button type="button" className="a6-link" onClick={close}>
          Cancel
        </button>
      </div>
    </form>
  );
}
