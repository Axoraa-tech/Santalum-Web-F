"use client";

import { useState, type ReactNode } from "react";
import { STATES } from "@/lib/shop/account";
import { CATEGORIES } from "@/lib/shop/products";
import { formatINR } from "../_data/format";
import { GST_BY_CATEGORY } from "../_data/mock";
import { resetAdminData, saveSettings, useSession, useSettings } from "../_data/store";
import type { Settings, Staff, StaffRole } from "../_data/types";
import { Icon } from "./icons";
import { Field, initials, Modal, PageHead, Panel, Seg, Switch, Tabs, toast } from "./ui";

type Section = "store" | "shipping" | "payments" | "staff" | "notifications" | "data";

export function SettingsView() {
  const [tab, setTab] = useState<Section>("store");
  const s = useSettings();
  return (
    <div className="adm-page" style={{ maxWidth: 1100 }}>
      <PageHead crumbs={[{ label: "Admin", href: "/admin" }, { label: "Settings" }]} title="Settings" sub="Store details, delivery, payments and who can use the admin." />
      <div style={{ marginBottom: 16 }}>
        <Tabs
          label="Settings sections"
          value={tab}
          onChange={setTab}
          items={[
            { id: "store", label: "Store and GST" },
            { id: "shipping", label: "Shipping" },
            { id: "payments", label: "Payments" },
            { id: "staff", label: "Staff and roles" },
            { id: "notifications", label: "Notifications" },
            { id: "data", label: "Preview data" },
          ]}
        />
      </div>
      {tab === "store" && <StoreForm key={JSON.stringify(s.store)} v={s.store} />}
      {tab === "shipping" && <ShippingForm key={JSON.stringify(s.shipping)} v={s.shipping} />}
      {tab === "payments" && <PaymentsForm key={JSON.stringify(s.payments)} v={s.payments} />}
      {tab === "staff" && <StaffForm staff={s.staff} />}
      {tab === "notifications" && <NotifyForm key={JSON.stringify(s.notifications)} v={s.notifications} />}
      {tab === "data" && <DataPanel />}
    </div>
  );
}

function SaveRow({ dirty, onSave, onReset, children }: { dirty: boolean; onSave: () => void; onReset: () => void; children?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--a-line)" }}>
      <span className="adm-hint" style={{ flex: 1 }}>
        {children ?? (dirty ? "Unsaved changes" : "Saved in this browser for the preview.")}
      </span>
      <button type="button" className="adm-btn" disabled={!dirty} onClick={onReset}>
        Discard
      </button>
      <button type="button" className="adm-btn" data-variant="primary" disabled={!dirty} onClick={onSave}>
        Save
      </button>
    </div>
  );
}

function useForm<T>(v: T) {
  const [d, setD] = useState<T>(v);
  const dirty = JSON.stringify(d) !== JSON.stringify(v);
  const set = <K extends keyof T>(k: K, x: T[K]) => setD((p) => ({ ...p, [k]: x }));
  return { d, set, dirty, reset: () => setD(v) };
}

/* ---------- store and GST ---------- */
function StoreForm({ v }: { v: Settings["store"] }) {
  const { d, set, dirty, reset } = useForm(v);
  const gstErr = d.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(d.gstin) ? "A GSTIN is 15 characters, e.g. 29ABCDE1234F1Z5." : null;
  return (
    <div className="adm-stack">
      <Panel title="Store details" meta="Printed on invoices and order emails" id="st-store">
        <div className="adm-form-grid">
          <Field label="Store name">{(id) => <input id={id} className="adm-input" value={d.name} onChange={(e) => set("name", e.target.value)} />}</Field>
          <Field label="Legal name">{(id) => <input id={id} className="adm-input" value={d.legalName} onChange={(e) => set("legalName", e.target.value)} />}</Field>
          <Field label="GSTIN" error={gstErr}>
            {(id) => <input id={id} className="adm-input num" value={d.gstin} maxLength={15} onChange={(e) => set("gstin", e.target.value.toUpperCase())} aria-invalid={!!gstErr} />}
          </Field>
          <Field label="PAN">{(id) => <input id={id} className="adm-input num" value={d.pan} maxLength={10} onChange={(e) => set("pan", e.target.value.toUpperCase())} />}</Field>
          <Field label="Support email">{(id) => <input id={id} className="adm-input" type="email" value={d.email} onChange={(e) => set("email", e.target.value)} />}</Field>
          <Field label="Support phone">{(id) => <input id={id} className="adm-input" value={d.phone} onChange={(e) => set("phone", e.target.value)} />}</Field>
          <Field label="Registered address" className="adm-span-2">
            {(id) => <input id={id} className="adm-input" value={d.address} onChange={(e) => set("address", e.target.value)} />}
          </Field>
          <Field label="City">{(id) => <input id={id} className="adm-input" value={d.city} onChange={(e) => set("city", e.target.value)} />}</Field>
          <div className="adm-form-grid" style={{ gridTemplateColumns: "minmax(0,1.4fr) minmax(0,1fr)" }}>
            <Field label="State" hint="Decides CGST + SGST or IGST on invoices.">
              {(id) => (
                <select id={id} className="adm-select" value={d.state} onChange={(e) => set("state", e.target.value)}>
                  {STATES.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              )}
            </Field>
            <Field label="PIN">{(id) => <input id={id} className="adm-input num" value={d.pin} maxLength={6} onChange={(e) => set("pin", e.target.value.replace(/\D/g, ""))} />}</Field>
          </div>
        </div>
      </Panel>
      <Panel title="Tax and invoices" id="st-gst">
        <div className="adm-form-grid">
          <Field label="Invoice number prefix" hint={`Next invoice: ${d.invoicePrefix}2611-0412`}>
            {(id) => <input id={id} className="adm-input" value={d.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} />}
          </Field>
          <Field label="Default GST rate" hint="Used for new categories without a rate of their own.">
            {(id) => (
              <select id={id} className="adm-select" value={d.gstRate} onChange={(e) => set("gstRate", Number(e.target.value))}>
                {[0, 3, 5, 12, 18].map((r) => (
                  <option key={r} value={r}>
                    {r}%
                  </option>
                ))}
              </select>
            )}
          </Field>
          <div className="adm-span-2">
            <Switch checked={d.pricesIncludeGst} onChange={(x) => set("pricesIncludeGst", x)} label="Shop prices include GST (tax is worked back on the invoice)" />
          </div>
        </div>
        <div className="adm-tablewrap" style={{ marginTop: 16, borderRadius: 6, boxShadow: "inset 0 0 0 1px var(--a-line)" }}>
          <table className="adm-table" data-dense="true">
            <thead>
              <tr>
                <th style={{ position: "static" }}>Category</th>
                <th style={{ position: "static" }}>HSN</th>
                <th style={{ position: "static" }}>Type</th>
                <th className="num" style={{ position: "static" }}>
                  GST
                </th>
              </tr>
            </thead>
            <tbody>
              {(["red", "white"] as const).flatMap((w) =>
                CATEGORIES[w].map((c) => (
                  <tr key={c.id}>
                    <td>
                      <span className="adm-wood">
                        <i className={w === "red" ? "ring-red" : "ring-white"} />
                        {c.label}
                      </span>
                    </td>
                    <td className="tnum">{GST_BY_CATEGORY[c.id].hsn}</td>
                    <td className="adm-ink2">{GST_BY_CATEGORY[c.id].label}</td>
                    <td className="num">{GST_BY_CATEGORY[c.id].rate}%</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
        <p className="adm-hint" style={{ margin: "10px 0 0" }}>
          HSN codes and rates are placeholders. Confirm them with the Maison&apos;s accountant before the first real invoice.
        </p>
        <SaveRow
          dirty={dirty}
          onReset={reset}
          onSave={() => {
            if (gstErr) return toast("Check the GSTIN");
            saveSettings("store", d);
            toast("Store details saved");
          }}
        />
      </Panel>
    </div>
  );
}

/* ---------- shipping ---------- */
function ShippingForm({ v }: { v: Settings["shipping"] }) {
  const { d, set, dirty, reset } = useForm(v);
  return (
    <Panel title="Shipping" meta="What customers see at checkout" id="st-ship">
      <div className="adm-form-grid">
        <div className="adm-span-2" style={{ display: "grid", gap: 10 }}>
          <Switch checked={d.standardFree} onChange={(x) => set("standardFree", x)} label="Standard delivery is free across India" />
        </div>
        {!d.standardFree && (
          <Field label="Standard delivery price">
            {(id) => (
              <div className="adm-affix">
                <span>₹</span>
                <input id={id} className="adm-input num" value={d.standardPrice || ""} onChange={(e) => set("standardPrice", Number(e.target.value.replace(/\D/g, "")))} />
              </div>
            )}
          </Field>
        )}
        <Field label="Express delivery price" hint="1–2 working days.">
          {(id) => (
            <div className="adm-affix">
              <span>₹</span>
              <input id={id} className="adm-input num" value={d.expressPrice || ""} onChange={(e) => set("expressPrice", Number(e.target.value.replace(/\D/g, "")))} />
            </div>
          )}
        </Field>
        <Field label="Pay on delivery up to" hint="Orders above this must be paid online.">
          {(id) => (
            <div className="adm-affix">
              <span>₹</span>
              <input id={id} className="adm-input num" value={d.codLimit || ""} onChange={(e) => set("codLimit", Number(e.target.value.replace(/\D/g, "")))} />
            </div>
          )}
        </Field>
        <Field label="Pay on delivery fee" hint="0 for none.">
          {(id) => (
            <div className="adm-affix">
              <span>₹</span>
              <input id={id} className="adm-input num" value={String(d.codFee)} onChange={(e) => set("codFee", Number(e.target.value.replace(/\D/g, "")) || 0)} />
            </div>
          )}
        </Field>
        <Field label="Days to pack" hint="Working days before an order ships.">
          {(id) => (
            <select id={id} className="adm-select" value={d.processingDays} onChange={(e) => set("processingDays", Number(e.target.value))}>
              {[1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "day" : "days"}
                </option>
              ))}
            </select>
          )}
        </Field>
        <div className="adm-span-2">
          <Switch checked={d.insured} onChange={(x) => set("insured", x)} label="Insure every shipment to its full value" />
        </div>
      </div>
      <div className="adm-panel" style={{ marginTop: 16, padding: "12px 14px", background: "var(--a-surface-2)", boxShadow: "none", fontSize: 13.5, display: "grid", gap: 4 }}>
        <div className="adm-muted" style={{ fontSize: 12 }}>
          At checkout
        </div>
        <div>Standard, 3–5 working days · {d.standardFree ? "Free" : formatINR(d.standardPrice)}</div>
        <div>Express, 1–2 working days · {formatINR(d.expressPrice)}</div>
        <div>
          Pay on delivery for orders under {formatINR(d.codLimit)}
          {d.codFee ? ` · ${formatINR(d.codFee)} fee` : ""}
        </div>
      </div>
      <SaveRow
        dirty={dirty}
        onReset={reset}
        onSave={() => {
          saveSettings("shipping", d);
          toast("Shipping saved");
        }}
      />
    </Panel>
  );
}

/* ---------- payments ---------- */
function PaymentsForm({ v }: { v: Settings["payments"] }) {
  const { d, set, dirty, reset } = useForm(v);
  return (
    <div className="adm-stack">
      <Panel
        title="Razorpay"
        meta="Cards, UPI and net banking"
        id="st-rzp"
        action={
          <span className="adm-pill" data-tone="warn">
            Not connected
          </span>
        }
      >
        <p className="adm-ink2" style={{ margin: "0 0 14px", fontSize: 13.5, maxWidth: "64ch" }}>
          Payments connect when the backend is in place. The secret key is stored on the server and never in the browser, so it can&apos;t be entered here. Until then, checkout on the shop records orders without taking payment.
        </p>
        <div className="adm-form-grid">
          <Field label="Mode">
            {() => (
              <Seg
                label="Mode"
                value={d.mode}
                onChange={(m) => set("mode", m)}
                items={[
                  { id: "test", label: "Test" },
                  { id: "live", label: "Live" },
                ]}
              />
            )}
          </Field>
          <Field label="Key ID" hint="Filled in by the backend once connected.">
            {(id) => <input id={id} className="adm-input num" value={d.keyId} placeholder="rzp_test_…" disabled />}
          </Field>
          <Field label="Webhook URL" className="adm-span-2" hint="Add this in the Razorpay dashboard once the API is live.">
            {(id) => <input id={id} className="adm-input num" value="https://api.santalum.in/payments/razorpay/webhook" readOnly />}
          </Field>
        </div>
      </Panel>
      <Panel title="Payment methods at checkout" id="st-methods">
        <div style={{ display: "grid", gap: 12 }}>
          <Switch checked={d.upi} onChange={(x) => set("upi", x)} label="UPI" />
          <Switch checked={d.card} onChange={(x) => set("card", x)} label="Credit and debit cards" />
          <Switch checked={d.netbanking} onChange={(x) => set("netbanking", x)} label="Net banking" />
          <Switch checked={d.cod} onChange={(x) => set("cod", x)} label="Pay on delivery (limit set under Shipping)" />
        </div>
        <SaveRow
          dirty={dirty}
          onReset={reset}
          onSave={() => {
            if (!d.upi && !d.card && !d.netbanking && !d.cod) return toast("Keep at least one payment method on");
            saveSettings("payments", d);
            toast("Payment settings saved");
          }}
        />
      </Panel>
    </div>
  );
}

/* ---------- staff ---------- */
const ROLES: { role: StaffRole; can: string }[] = [
  { role: "Owner", can: "Everything, including payments, staff and settings" },
  { role: "Manager", can: "Orders, products, stock, customers, reviews, coupons, content" },
  { role: "Fulfilment", can: "Orders and stock: confirm, pack, ship, returns" },
  { role: "Support", can: "Orders and customers (read), reviews and questions" },
];
function StaffForm({ staff }: { staff: Staff[] }) {
  const session = useSession();
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "Support" as StaffRole });
  const save = (list: Staff[], msg: string) => {
    saveSettings("staff", list);
    toast(msg);
  };
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim());
  return (
    <div className="adm-stack">
      <Panel
        title="Staff"
        meta={`${staff.length + 1} people can sign in`}
        bodyClass=""
        id="st-staff"
        action={
          <button type="button" className="adm-btn" data-size="sm" onClick={() => setInvite(true)}>
            <Icon name="plus" />
            Invite
          </button>
        }
      >
        <div className="adm-tablewrap" style={{ marginTop: 10 }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Last active</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {session && (
                <tr>
                  <td>
                    <div className="adm-cell-main">
                      <span className="adm-avatar">{initials(session.name)}</span>
                      <div>
                        <div className="adm-cell-title">{session.name} (you)</div>
                        <div className="adm-cell-sub">{session.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>Owner</td>
                  <td className="adm-ink2">Now</td>
                  <td />
                </tr>
              )}
              {staff.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-cell-main">
                      <span className="adm-avatar" style={{ background: p.invited ? "var(--a-surface-3)" : "var(--a-ink-2)", color: p.invited ? "var(--a-ink-2)" : undefined }}>
                        {initials(p.name)}
                      </span>
                      <div>
                        <div className="adm-cell-title">{p.name}</div>
                        <div className="adm-cell-sub">{p.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <select
                      className="adm-select"
                      data-size="sm"
                      style={{ width: 140 }}
                      aria-label={`Role for ${p.name}`}
                      value={p.role}
                      onChange={(e) => save(staff.map((x) => (x.id === p.id ? { ...x, role: e.target.value as StaffRole } : x)), `${p.name} is now ${e.target.value}`)}
                    >
                      {ROLES.filter((r) => r.role !== "Owner").map((r) => (
                        <option key={r.role}>{r.role}</option>
                      ))}
                    </select>
                  </td>
                  <td className="adm-ink2">{p.invited ? <span className="adm-tag" data-tone="gold">Invite sent</span> : p.lastActive}</td>
                  <td className="r">
                    <button type="button" className="adm-btn" data-variant="ghost" data-size="sm" onClick={() => save(staff.filter((x) => x.id !== p.id), `${p.name} removed`)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
      <Panel title="What each role can do" bodyClass="" id="st-roles">
        <ul className="adm-list" style={{ marginTop: 8 }}>
          {ROLES.map((r) => (
            <li key={r.role}>
              <strong style={{ fontWeight: 500, width: 100, flexShrink: 0 }}>{r.role}</strong>
              <span className="adm-ink2">{r.can}</span>
            </li>
          ))}
        </ul>
      </Panel>
      <Modal
        open={invite}
        onClose={() => setInvite(false)}
        title="Invite someone"
        description="They get an email to set a password. Preview: no email is sent."
        footer={
          <>
            <button type="button" className="adm-btn" onClick={() => setInvite(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="adm-btn"
              data-variant="primary"
              disabled={!form.name.trim() || !emailOk}
              onClick={() => {
                save([...staff, { id: `s-${form.email.trim().toLowerCase()}`, name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role, lastActive: "Invited", invited: true }], `Invite recorded for ${form.name.trim()}`);
                setForm({ name: "", email: "", role: "Support" });
                setInvite(false);
              }}
            >
              Send invite
            </button>
          </>
        }
      >
        <div className="adm-form-grid">
          <Field label="Name">{(id) => <input id={id} className="adm-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus />}</Field>
          <Field label="Email">{(id) => <input id={id} className="adm-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />}</Field>
          <Field label="Role" className="adm-span-2" hint={ROLES.find((r) => r.role === form.role)?.can}>
            {(id) => (
              <select id={id} className="adm-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as StaffRole })}>
                {ROLES.filter((r) => r.role !== "Owner").map((r) => (
                  <option key={r.role}>{r.role}</option>
                ))}
              </select>
            )}
          </Field>
        </div>
      </Modal>
    </div>
  );
}

/* ---------- notifications ---------- */
function NotifyForm({ v }: { v: Settings["notifications"] }) {
  const { d, set, dirty, reset } = useForm(v);
  return (
    <Panel title="Email notifications" meta="Sent to the team, not to customers" id="st-notify">
      <div style={{ display: "grid", gap: 12 }}>
        <Switch checked={d.newOrder} onChange={(x) => set("newOrder", x)} label="A new order is placed" />
        <Switch checked={d.lowStock} onChange={(x) => set("lowStock", x)} label="An option drops to its reorder level" />
        <Switch checked={d.review} onChange={(x) => set("review", x)} label="A review or question is waiting" />
        <Switch checked={d.returnRequest} onChange={(x) => set("returnRequest", x)} label="A customer asks for a return" />
        <Switch checked={d.dailySummary} onChange={(x) => set("dailySummary", x)} label="A summary every morning at 9" />
      </div>
      <div style={{ marginTop: 16, maxWidth: 420 }}>
        <Field label="Send to" hint="Separate addresses with commas.">
          {(id) => <input id={id} className="adm-input" value={d.recipients} onChange={(e) => set("recipients", e.target.value)} />}
        </Field>
      </div>
      <SaveRow
        dirty={dirty}
        onReset={reset}
        onSave={() => {
          saveSettings("notifications", d);
          toast("Notification settings saved");
        }}
      />
    </Panel>
  );
}

/* ---------- preview data ---------- */
function DataPanel() {
  const [confirm, setConfirm] = useState(false);
  return (
    <Panel title="Preview data" meta="Where the numbers in this admin come from" id="st-data">
      <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 6, fontSize: 13.5 }} className="adm-ink2">
        <li>About 120 sample orders over the last 90 days and 60 sample customers, the same on every load.</li>
        <li>Orders and accounts made on the shop in this browser, merged in and marked “From the shop”.</li>
        <li>The real catalogue, reviews and questions from the site, plus a few sample reviews waiting for moderation.</li>
        <li>Your changes here are kept in this browser only, under santalum-admin-* keys.</li>
      </ul>
      <div style={{ marginTop: 18 }}>
        <button type="button" className="adm-btn" data-variant="danger" onClick={() => setConfirm(true)}>
          <Icon name="undo" />
          Reset my admin changes
        </button>
      </div>
      <Modal
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Reset admin changes?"
        description="Clears order updates, product edits, stock adjustments, replies, coupons, content and settings made in this browser. Shop orders and accounts stay. This cannot be undone."
        footer={
          <>
            <button type="button" className="adm-btn" onClick={() => setConfirm(false)}>
              Keep my changes
            </button>
            <button type="button" className="adm-btn" data-variant="accent" onClick={resetAdminData}>
              Reset
            </button>
          </>
        }
      >
        <p className="adm-ink2" style={{ margin: 0 }}>
          You stay signed in.
        </p>
      </Modal>
    </Panel>
  );
}
