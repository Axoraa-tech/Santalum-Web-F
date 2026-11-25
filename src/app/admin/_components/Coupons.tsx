"use client";

import { useMemo, useState } from "react";
import { fmtDate, formatINR, isoDay } from "../_data/format";
import { DAY } from "../_data/mock";
import { couponState, deleteCoupon, saveCoupon, useCoupons, useNow, useOrders } from "../_data/store";
import type { AdminCoupon } from "../_data/types";
import { Icon } from "./icons";
import { Empty, Field, Modal, PageHead, Seg, Switch, toast } from "./ui";

const STATE = {
  active: { label: "Active", tone: "good" },
  off: { label: "Off", tone: "muted" },
  expired: { label: "Expired", tone: "cancelled" },
  "used-up": { label: "Used up", tone: "warn" },
} as const;

export const discountText = (c: Pick<AdminCoupon, "kind" | "value">) => (c.kind === "pct" ? `${c.value}% off` : `${formatINR(c.value)} off`);
const expiryDate = (s: string) => new Date(s + "T12:00:00").getTime();

export function CouponsView() {
  const now = useNow();
  const coupons = useCoupons();
  const orders = useOrders();
  const [editing, setEditing] = useState<AdminCoupon | "new" | null>(null);

  const usage = useMemo(() => {
    const m = new Map<string, { used: number; discount: number; revenue: number }>();
    for (const o of orders) {
      if (!o.coupon || o.status === "cancelled") continue;
      const u = m.get(o.coupon) ?? { used: 0, discount: 0, revenue: 0 };
      u.used++;
      u.discount += o.discount;
      u.revenue += o.total;
      m.set(o.coupon, u);
    }
    return m;
  }, [orders]);
  const recent = orders.filter((o) => o.coupon && o.status !== "cancelled" && o.placedAt >= now - 30 * DAY);
  const given = recent.reduce((s, o) => s + o.discount, 0);

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Coupons" }]}
        title="Coupons"
        sub="Codes customers type at checkout. Percentage or flat, with an optional minimum, usage limit and end date."
        actions={
          <button type="button" className="adm-btn" data-variant="primary" onClick={() => setEditing("new")}>
            <Icon name="plus" />
            New coupon
          </button>
        }
      />

      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))", marginBottom: 16 }}>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Live codes</div>
          <div className="adm-kpi-value">{coupons.filter((c) => couponState(c, usage.get(c.code)?.used ?? 0, now) === "active").length}</div>
          <div className="adm-kpi-foot">of {coupons.length} codes</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Orders with a code</div>
          <div className="adm-kpi-value">{recent.length}</div>
          <div className="adm-kpi-foot">last 30 days</div>
        </div>
        <div className="adm-kpi">
          <div className="adm-kpi-label">Discount given</div>
          <div className="adm-kpi-value">{formatINR(given)}</div>
          <div className="adm-kpi-foot">last 30 days</div>
        </div>
      </div>

      <section className="adm-panel">
        {coupons.length ? (
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th className="num">Minimum</th>
                  <th>Used</th>
                  <th>Ends</th>
                  <th>Status</th>
                  <th>On</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => {
                  const u = usage.get(c.code);
                  const used = u?.used ?? 0;
                  const st = couponState(c, used, now);
                  return (
                    <tr key={c.code}>
                      <td style={{ maxWidth: 320 }}>
                        <button type="button" onClick={() => setEditing(c)} style={{ border: 0, background: "none", padding: 0, textAlign: "left" }}>
                          <span className="adm-tag" data-tone="ink" style={{ fontSize: 12, letterSpacing: "0.04em", height: 22 }}>
                            {c.code}
                          </span>
                        </button>
                        <div className="adm-cell-sub" style={{ marginTop: 4 }}>
                          {c.label}
                        </div>
                      </td>
                      <td style={{ fontWeight: 500 }}>{discountText(c)}</td>
                      <td className="num adm-ink2">{c.min ? formatINR(c.min) : "None"}</td>
                      <td style={{ minWidth: 140 }}>
                        <div className="num" style={{ fontSize: 13 }}>
                          {used}
                          {c.limit ? <span className="adm-muted"> / {c.limit}</span> : <span className="adm-muted"> · no limit</span>}
                        </div>
                        {c.limit ? (
                          <div className="adm-meter" data-tone={used >= c.limit ? "out" : used / c.limit > 0.8 ? "low" : undefined} style={{ marginTop: 5, width: 110 }}>
                            <span style={{ width: `${Math.min(100, (used / c.limit) * 100)}%` }} />
                          </div>
                        ) : null}
                        {u && <div className="adm-cell-sub">{formatINR(u.discount)} given</div>}
                      </td>
                      <td className="adm-ink2">{c.expires ? fmtDate(expiryDate(c.expires)) : "No end date"}</td>
                      <td>
                        <span className="adm-pill" data-tone={STATE[st].tone}>
                          {STATE[st].label}
                        </span>
                      </td>
                      <td>
                        <label className="adm-switch">
                          <input
                            type="checkbox"
                            role="switch"
                            checked={c.active}
                            aria-label={`${c.code} on`}
                            onChange={(e) => {
                              saveCoupon({ ...c, active: e.target.checked }, c.code);
                              toast(`${c.code} turned ${e.target.checked ? "on" : "off"}`);
                            }}
                          />
                        </label>
                      </td>
                      <td className="r">
                        <button type="button" className="adm-btn" data-size="sm" onClick={() => setEditing(c)}>
                          <Icon name="edit" />
                          Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="coupons" title="No coupons" action={<button type="button" className="adm-btn" onClick={() => setEditing("new")}>Create the first one</button>} />
        )}
      </section>
      <p className="adm-hint" style={{ marginTop: 12 }}>
        Preview: checkout on the shop still accepts the three launch codes built into the site. Codes made here are used once the backend reads them.
      </p>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "New coupon" : `Edit ${editing ? (editing as AdminCoupon).code : ""}`} description="Customers type the code at checkout.">
        {editing && <CouponForm key={editing === "new" ? "new" : editing.code} initial={editing === "new" ? null : editing} taken={coupons.map((c) => c.code)} now={now} onClose={() => setEditing(null)} />}
      </Modal>
    </div>
  );
}

function CouponForm({ initial, taken, now, onClose }: { initial: AdminCoupon | null; taken: string[]; now: number; onClose: () => void }) {
  const [c, setC] = useState<AdminCoupon>(initial ?? { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true });
  const [tried, setTried] = useState(false);
  const set = <K extends keyof AdminCoupon>(k: K, v: AdminCoupon[K]) => setC((x) => ({ ...x, [k]: v }));
  const errs: Partial<Record<keyof AdminCoupon, string>> = {};
  if (!/^[A-Z0-9]{4,16}$/.test(c.code)) errs.code = "4 to 16 capital letters or digits.";
  else if (c.code !== initial?.code && taken.includes(c.code)) errs.code = "That code already exists.";
  if (c.kind === "pct" && !(c.value >= 1 && c.value <= 90)) errs.value = "Between 1% and 90%.";
  if (c.kind === "flat" && !(c.value >= 50)) errs.value = "At least ₹50.";
  if (c.kind === "flat" && c.min !== null && c.value >= c.min) errs.min = "The minimum must be more than the discount.";
  const ok = Object.keys(errs).length === 0;
  const summary = `${discountText(c)}${c.min ? ` orders of ${formatINR(c.min)} or more` : " any order"}${c.limit ? `, first ${c.limit} uses` : ""}${c.expires ? `, until ${fmtDate(expiryDate(c.expires))}` : ""}.`;
  const show = (k: keyof AdminCoupon) => (tried || (k === "code" && c.code.length > 3) ? errs[k] : undefined);

  return (
    <form
      style={{ display: "grid", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
        if (!ok) return;
        saveCoupon({ ...c, label: c.label.trim() || summary.replace(/\.$/, "") }, initial?.code);
        toast(initial ? `${c.code} saved` : `${c.code} created`);
        onClose();
      }}
    >
      <div className="adm-form-grid">
        <Field label="Code" error={show("code")}>
          {(id) => <input id={id} className="adm-input" style={{ letterSpacing: "0.04em", fontWeight: 500 }} value={c.code} autoFocus={!initial} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} placeholder="e.g. CIRCLE500" aria-invalid={!!show("code")} />}
        </Field>
        <Field label="Type">
          {() => (
            <Seg
              label="Discount type"
              value={c.kind}
              onChange={(k) => setC((x) => ({ ...x, kind: k, value: k === "pct" ? 10 : 500 }))}
              items={[
                { id: "pct", label: "Percentage" },
                { id: "flat", label: "Flat amount" },
              ]}
            />
          )}
        </Field>
        <Field label={c.kind === "pct" ? "Percent off" : "Amount off"} error={show("value")}>
          {(id) => (
            <div className="adm-affix">
              <span>{c.kind === "pct" ? "%" : "₹"}</span>
              <input id={id} className="adm-input num" inputMode="numeric" value={c.value || ""} onChange={(e) => set("value", Number(e.target.value.replace(/\D/g, "")))} aria-invalid={!!show("value")} />
            </div>
          )}
        </Field>
        <Field label="Minimum order" hint="Leave empty for any order." error={show("min")}>
          {(id) => (
            <div className="adm-affix">
              <span>₹</span>
              <input id={id} className="adm-input num" inputMode="numeric" value={c.min ?? ""} onChange={(e) => set("min", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />
            </div>
          )}
        </Field>
        <Field label="Usage limit" hint="Total uses across all customers.">
          {(id) => <input id={id} className="adm-input num" inputMode="numeric" value={c.limit ?? ""} placeholder="No limit" onChange={(e) => set("limit", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} />}
        </Field>
        <Field label="Ends on" hint="Last day the code works.">
          {(id) => <input id={id} className="adm-input" type="date" data-empty={!c.expires} min={isoDay(now)} value={c.expires ?? ""} onChange={(e) => set("expires", e.target.value || null)} />}
        </Field>
        <Field label="Description" className="adm-span-2" hint="Shown to the customer when the code is applied.">
          {(id) => <input id={id} className="adm-input" value={c.label} placeholder={summary.replace(/\.$/, "")} onChange={(e) => set("label", e.target.value)} />}
        </Field>
      </div>
      <Switch checked={c.active} onChange={(v) => set("active", v)} label="Code is on" />
      <div className="adm-panel" style={{ padding: "10px 12px", background: "var(--a-surface-2)", boxShadow: "none", fontSize: 13.5 }}>
        <span className="adm-tag" data-tone="ink" style={{ marginRight: 8 }}>
          {c.code || "CODE"}
        </span>
        {summary}
      </div>
      <div className="adm-modal-foot" style={{ padding: "6px 0 12px" }}>
        {initial && (
          <button
            type="button"
            className="adm-btn"
            data-variant="danger"
            style={{ marginRight: "auto" }}
            onClick={() => {
              deleteCoupon(initial.code);
              toast(`${initial.code} deleted`);
              onClose();
            }}
          >
            <Icon name="trash" />
            Delete
          </button>
        )}
        <button type="button" className="adm-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="adm-btn" data-variant="primary">
          {initial ? "Save coupon" : "Create coupon"}
        </button>
      </div>
    </form>
  );
}
