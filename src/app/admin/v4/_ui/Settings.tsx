"use client";

import { useState, type ReactNode } from "react";
import { resetAdminData, saveSettings, useSettings } from "../../_data/store";
import type { Settings, StaffRole } from "../../_data/types";
import { Check, Field, Head, initialsOf, say } from "./kit";

type S = Settings;
const ROLES: StaffRole[] = ["Owner", "Manager", "Fulfilment", "Support"];

export function SettingsView() {
  const s = useSettings();
  return (
    <div className="a4-page">
      <Head kicker="Shop" title="Settings" sub="The shop's paperwork: invoices, delivery, payment and the people who use this board." />
      <div className="a4-editor">
        <StoreForm key={JSON.stringify(s.store)} v={s.store} />
        <ShippingForm key={JSON.stringify(s.shipping)} v={s.shipping} />
        <PaymentsForm key={JSON.stringify(s.payments)} v={s.payments} />
        <NotifyForm key={JSON.stringify(s.notifications)} v={s.notifications} />
        <StaffForm key={JSON.stringify(s.staff)} v={s.staff} />
        <section className="a4-paper a4-pad a4-sheet" aria-labelledby="set-reset">
          <h2 id="set-reset" className="a4-h2">
            Preview data
          </h2>
          <p className="a4-sub">Everything changed on this board is kept in this browser. Clearing it puts the sample data back.</p>
          <button
            type="button"
            className="a4-btn a4-btn-red"
            onClick={() => {
              if (window.confirm("Clear every change made in this browser?")) resetAdminData();
            }}
          >
            Clear preview data
          </button>
        </section>
      </div>
    </div>
  );
}

function Sheet<K extends keyof S>({ k, title, value, children, wide }: { k: K; title: string; value: S[K]; children: ReactNode; wide?: boolean }) {
  return (
    <form
      className={`a4-paper a4-pad a4-sheet${wide ? " a4-sheet-wide" : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        saveSettings(k, value);
        say(`${title} saved`);
      }}
    >
      <h2 className="a4-h2">{title}</h2>
      <div className="a4-form">{children}</div>
      <button type="submit" className="a4-btn a4-btn-ink">
        Save
      </button>
    </form>
  );
}

function useDraft<T extends object>(v: T) {
  const [d, setD] = useState(v);
  const set = <K extends keyof T>(k: K, x: T[K]) => setD((o) => ({ ...o, [k]: x }));
  return [d, set] as const;
}
const toN = (s: string) => Number(s.replace(/[^\d]/g, "")) || 0;

function StoreForm({ v }: { v: S["store"] }) {
  const [d, set] = useDraft(v);
  const text = (k: keyof S["store"], label: string, wide = false) => (
    <Field label={label} wide={wide}>
      {(id) => <input id={id} value={String(d[k])} onChange={(e) => set(k, e.target.value as never)} />}
    </Field>
  );
  return (
    <Sheet k="store" title="Shop and invoices" value={d} wide>
      {text("name", "Shop name")}
      {text("legalName", "Legal name")}
      {text("gstin", "GSTIN")}
      {text("pan", "PAN")}
      {text("email", "Email")}
      {text("phone", "Phone")}
      {text("address", "Address", true)}
      {text("city", "City")}
      {text("state", "State")}
      {text("pin", "PIN")}
      {text("invoicePrefix", "Invoice prefix")}
      {text("hsnRed", "HSN, red")}
      {text("hsnWhite", "HSN, white")}
      <Field label="Default GST, %">{(id) => <input id={id} inputMode="numeric" value={d.gstRate} onChange={(e) => set("gstRate", toN(e.target.value))} />}</Field>
      <Check checked={d.pricesIncludeGst} onChange={(x) => set("pricesIncludeGst", x)}>
        Prices include GST
      </Check>
    </Sheet>
  );
}

function ShippingForm({ v }: { v: S["shipping"] }) {
  const [d, set] = useDraft(v);
  return (
    <Sheet k="shipping" title="Delivery" value={d}>
      <Check checked={d.standardFree} onChange={(x) => set("standardFree", x)}>
        Standard delivery is free
      </Check>
      {!d.standardFree && <Field label="Standard, ₹">{(id) => <input id={id} inputMode="numeric" value={d.standardPrice} onChange={(e) => set("standardPrice", toN(e.target.value))} />}</Field>}
      <Field label="Express, ₹">{(id) => <input id={id} inputMode="numeric" value={d.expressPrice} onChange={(e) => set("expressPrice", toN(e.target.value))} />}</Field>
      <Field label="Pay on delivery up to, ₹">{(id) => <input id={id} inputMode="numeric" value={d.codLimit} onChange={(e) => set("codLimit", toN(e.target.value))} />}</Field>
      <Field label="Pay-on-delivery fee, ₹">{(id) => <input id={id} inputMode="numeric" value={d.codFee} onChange={(e) => set("codFee", toN(e.target.value))} />}</Field>
      <Field label="Days on the bench before dispatch">{(id) => <input id={id} inputMode="numeric" value={d.processingDays} onChange={(e) => set("processingDays", toN(e.target.value))} />}</Field>
      <Check checked={d.insured} onChange={(x) => set("insured", x)}>
        Insure every parcel
      </Check>
    </Sheet>
  );
}

function PaymentsForm({ v }: { v: S["payments"] }) {
  const [d, set] = useDraft(v);
  return (
    <Sheet k="payments" title="Payments (Razorpay)" value={d}>
      <Field label="Mode">
        {(id) => (
          <select id={id} value={d.mode} onChange={(e) => set("mode", e.target.value as "test" | "live")}>
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
        )}
      </Field>
      <Field label="Key id" hint="The public key id only. The secret stays on the server.">
        {(id) => <input id={id} value={d.keyId} onChange={(e) => set("keyId", e.target.value)} placeholder="rzp_test_…" />}
      </Field>
      <Check checked={d.upi} onChange={(x) => set("upi", x)}>
        UPI
      </Check>
      <Check checked={d.card} onChange={(x) => set("card", x)}>
        Cards
      </Check>
      <Check checked={d.netbanking} onChange={(x) => set("netbanking", x)}>
        Net banking
      </Check>
      <Check checked={d.cod} onChange={(x) => set("cod", x)}>
        Pay on delivery
      </Check>
    </Sheet>
  );
}

function NotifyForm({ v }: { v: S["notifications"] }) {
  const [d, set] = useDraft(v);
  return (
    <Sheet k="notifications" title="Emails to the atelier" value={d}>
      <Field label="Send to" hint="Comma-separated." wide>
        {(id) => <input id={id} value={d.recipients} onChange={(e) => set("recipients", e.target.value)} />}
      </Field>
      <Check checked={d.newOrder} onChange={(x) => set("newOrder", x)}>
        Each new order
      </Check>
      <Check checked={d.lowStock} onChange={(x) => set("lowStock", x)}>
        Stock at its reorder level
      </Check>
      <Check checked={d.review} onChange={(x) => set("review", x)}>
        A review waiting
      </Check>
      <Check checked={d.returnRequest} onChange={(x) => set("returnRequest", x)}>
        A return request
      </Check>
      <Check checked={d.dailySummary} onChange={(x) => set("dailySummary", x)}>
        Evening summary
      </Check>
    </Sheet>
  );
}

function StaffForm({ v }: { v: S["staff"] }) {
  const [list, setList] = useState(v);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Fulfilment");
  return (
    <section className="a4-paper a4-pad a4-sheet a4-sheet-wide" aria-labelledby="set-staff">
      <h2 id="set-staff" className="a4-h2">
        People on the board
      </h2>
      <ul className="a4-staff">
        {list.map((p) => (
          <li key={p.id}>
            <span className="a4-avatar">{initialsOf(p.name)}</span>
            <span>
              <span className="a4-strong a4-block">{p.name}</span>
              <span className="a4-muted a4-break">{p.email}</span>
            </span>
            <select
              aria-label={`Role for ${p.name}`}
              value={p.role}
              onChange={(e) => {
                const next = list.map((x) => (x.id === p.id ? { ...x, role: e.target.value as StaffRole } : x));
                setList(next);
                saveSettings("staff", next);
                say(`${p.name} is now ${e.target.value}`);
              }}
            >
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <span className="a4-muted">{p.invited ? "Invited" : p.lastActive}</span>
            <button
              type="button"
              className="a4-link-btn"
              disabled={p.role === "Owner"}
              onClick={() => {
                const next = list.filter((x) => x.id !== p.id);
                setList(next);
                saveSettings("staff", next);
                say(`${p.name} removed`);
              }}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <form
        className="a4-inline a4-invite"
        onSubmit={(e) => {
          e.preventDefault();
          const em = email.trim().toLowerCase();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || list.some((x) => x.email === em)) return;
          const name = em
            .split("@")[0]
            .split(/[._-]+/)
            .map((w) => w[0].toUpperCase() + w.slice(1))
            .join(" ");
          const next = [...list, { id: `s${Date.now().toString(36)}`, name, email: em, role, lastActive: "Invited", invited: true }];
          setList(next);
          saveSettings("staff", next);
          setEmail("");
          say(`Invitation noted for ${em}`);
        }}
      >
        <input aria-label="Email to invite" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@santalum.in" />
        <select aria-label="Role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {ROLES.filter((r) => r !== "Owner").map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button type="submit" className="a4-btn">
          Invite
        </button>
      </form>
    </section>
  );
}
