"use client";

import { useMemo, useState } from "react";
import { fmtDate, formatINR, fromIsoDay } from "../../_data/format";
import { couponState, deleteCoupon, saveCoupon, useCoupons, useNow, useOrders } from "../../_data/store";
import type { AdminCoupon } from "../../_data/types";
import { Check, Chips, Empty, Field, Head, Icon, say } from "./kit";

const STATE_LABEL = { active: "Live", off: "Switched off", expired: "Expired", "used-up": "Used up" } as const;
const blank: AdminCoupon = { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true };

export function Coupons() {
  const coupons = useCoupons();
  const orders = useOrders();
  const now = useNow();
  const [editing, setEditing] = useState<{ c: AdminCoupon; original?: string } | null>(null);
  const used = useMemo(() => {
    const m = new Map<string, { n: number; off: number }>();
    for (const o of orders) {
      if (!o.coupon || o.status === "cancelled") continue;
      const x = m.get(o.coupon) ?? { n: 0, off: 0 };
      x.n++;
      x.off += o.discount;
      m.set(o.coupon, x);
    }
    return m;
  }, [orders]);

  return (
    <div className="a4-page">
      <Head kicker="Shop" title="Coupons" sub="Codes customers type at checkout.">
        <button type="button" className="a4-btn a4-btn-ink" onClick={() => setEditing({ c: { ...blank } })}>
          <Icon name="plus" size={16} /> New code
        </button>
      </Head>
      {editing && <CouponForm key={editing.original ?? "new"} initial={editing.c} original={editing.original} taken={coupons.map((c) => c.code)} onDone={() => setEditing(null)} />}
      {coupons.length === 0 ? (
        <Empty>No codes yet.</Empty>
      ) : (
        <ul className="a4-tickets">
          {coupons.map((c) => {
            const u = used.get(c.code) ?? { n: 0, off: 0 };
            const st = couponState(c, u.n, now);
            return (
              <li key={c.code} className="a4-paper a4-ticket" data-state={st}>
                <div className="a4-ticket-stub">
                  <span className="a4-ticket-value">{c.kind === "pct" ? `${c.value}%` : formatINR(c.value)}</span>
                  <span>off</span>
                </div>
                <div className="a4-ticket-body">
                  <p className="a4-ticket-code">{c.code}</p>
                  <p>{c.label}</p>
                  <p className="a4-muted">
                    {c.min ? `On orders over ${formatINR(c.min)}` : "No minimum"} · {c.limit ? `${u.n} of ${c.limit} used` : `${u.n} used`} · {c.expires ? `until ${fmtDate(fromIsoDay(c.expires))}` : "no end date"}
                  </p>
                  <p className="a4-muted">Given away so far: {formatINR(u.off)}</p>
                  <div className="a4-inline">
                    <span className="a4-tag" data-state={st}>
                      {STATE_LABEL[st]}
                    </span>
                    <button type="button" className="a4-btn a4-btn-sm a4-btn-ghost" onClick={() => setEditing({ c: { ...c }, original: c.code })}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="a4-btn a4-btn-sm a4-btn-ghost"
                      onClick={() => {
                        saveCoupon({ ...c, active: !c.active }, c.code);
                        say(c.active ? `${c.code} switched off` : `${c.code} is live`);
                      }}
                    >
                      {c.active ? "Switch off" : "Switch on"}
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CouponForm({ initial, original, taken, onDone }: { initial: AdminCoupon; original?: string; taken: string[]; onDone: () => void }) {
  const [c, setC] = useState(initial);
  const [err, setErr] = useState("");
  const set = <K extends keyof AdminCoupon>(k: K, v: AdminCoupon[K]) => setC((x) => ({ ...x, [k]: v }));
  const num = (s: string) => (s === "" ? null : Number(s.replace(/\D/g, "")));

  return (
    <form
      className="a4-paper a4-pad a4-couponform"
      onSubmit={(e) => {
        e.preventDefault();
        const code = c.code.trim().toUpperCase();
        if (!/^[A-Z0-9-]{3,20}$/.test(code)) return setErr("Codes are 3 to 20 letters, numbers or dashes.");
        if (code !== original && taken.includes(code)) return setErr(`${code} already exists.`);
        if (!(c.value > 0) || (c.kind === "pct" && c.value > 90)) return setErr("Set a discount above zero (and at most 90%).");
        saveCoupon({ ...c, code, label: c.label.trim() || `${c.kind === "pct" ? `${c.value}%` : formatINR(c.value)} off` }, original);
        say(original ? "Code saved" : `${code} created`);
        onDone();
      }}
    >
      <h2 className="a4-h2">{original ? `Edit ${original}` : "New code"}</h2>
      {err && (
        <p className="a4-err" role="alert">
          {err}
        </p>
      )}
      <div className="a4-form">
        <Field label="Code">{(id) => <input id={id} value={c.code} onChange={(e) => set("code", e.target.value.toUpperCase())} placeholder="DIWALI10" />}</Field>
        <Field label="Label">{(id) => <input id={id} value={c.label} onChange={(e) => set("label", e.target.value)} placeholder="Festive, 10% off" />}</Field>
        <Field label="Kind">
          {() => (
            <Chips
              label="Kind"
              value={c.kind}
              onChange={(v) => set("kind", v)}
              items={[
                { id: "pct", label: "Percent" },
                { id: "flat", label: "Rupees" },
              ]}
            />
          )}
        </Field>
        <Field label={c.kind === "pct" ? "Percent off" : "Rupees off"}>{(id) => <input id={id} inputMode="numeric" value={c.value || ""} onChange={(e) => set("value", Number(e.target.value.replace(/\D/g, "")))} />}</Field>
        <Field label="Minimum order, ₹">{(id) => <input id={id} inputMode="numeric" value={c.min ?? ""} onChange={(e) => set("min", num(e.target.value))} placeholder="None" />}</Field>
        <Field label="Use limit">{(id) => <input id={id} inputMode="numeric" value={c.limit ?? ""} onChange={(e) => set("limit", num(e.target.value))} placeholder="Unlimited" />}</Field>
        <Field label="Last day">{(id) => <input id={id} type="date" value={c.expires ?? ""} onChange={(e) => set("expires", e.target.value || null)} />}</Field>
        <Field label="State">
          {() => (
            <Check checked={c.active} onChange={(v) => set("active", v)}>
              Live
            </Check>
          )}
        </Field>
      </div>
      <div className="a4-inline">
        <button type="submit" className="a4-btn a4-btn-ink">
          Save code
        </button>
        <button type="button" className="a4-btn a4-btn-ghost" onClick={onDone}>
          Cancel
        </button>
        {original && (
          <button
            type="button"
            className="a4-btn a4-btn-red"
            onClick={() => {
              deleteCoupon(original);
              say(`${original} deleted`);
              onDone();
            }}
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
