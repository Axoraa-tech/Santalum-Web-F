"use client";

import { useState, type ReactNode } from "react";
import { resetAdminData, saveSettings, useSettings } from "../../_data/store";
import type { Settings, Staff, StaffRole } from "../../_data/types";
import { Check, Choice, F, Head, note, Section } from "./kit";

type Leaf = "store" | "shipping" | "payments" | "staff" | "notifications";

/** The book's front matter: who keeps it, the firm's particulars, and the house rules. */
export function SettingsBook() {
  const s = useSettings();
  const [leaf, setLeaf] = useState<Leaf>("store");
  return (
    <div>
      <Head kicker="Front matter" title="Settings" />
      <div className="a2-tools">
        <Choice
          label="Section"
          value={leaf}
          onChange={setLeaf}
          items={[
            { id: "store", label: "The firm" },
            { id: "shipping", label: "Delivery" },
            { id: "payments", label: "Payments" },
            { id: "staff", label: "Keepers" },
            { id: "notifications", label: "Letters" },
          ]}
        />
      </div>
      {leaf === "store" ? <Form k="store" init={s.store} render={(v, set) => <StoreFields v={v} set={set} />} /> : null}
      {leaf === "shipping" ? <Form k="shipping" init={s.shipping} render={(v, set) => <ShippingFields v={v} set={set} />} /> : null}
      {leaf === "payments" ? <Form k="payments" init={s.payments} render={(v, set) => <PaymentFields v={v} set={set} />} /> : null}
      {leaf === "staff" ? <Form k="staff" init={s.staff} render={(v, set) => <StaffFields v={v} set={set} />} /> : null}
      {leaf === "notifications" ? <Form k="notifications" init={s.notifications} render={(v, set) => <NotifyFields v={v} set={set} />} /> : null}
      <Section title="Preview data" className="a2-boxed">
        <p className="a2-dim">Everything changed here is kept in this browser only. Clearing it returns the book to the sample entries; you stay signed in.</p>
        <button
          type="button"
          className="a2-link a2-red"
          onClick={() => {
            if (window.confirm("Clear every change made in this preview? This cannot be undone.")) resetAdminData();
          }}
        >
          clear preview changes
        </button>
      </Section>
    </div>
  );
}

function Form<K extends keyof Settings>({ k, init, render }: { k: K; init: Settings[K]; render: (v: Settings[K], set: (v: Settings[K]) => void) => ReactNode }) {
  const [v, setV] = useState(init);
  const dirty = JSON.stringify(v) !== JSON.stringify(init);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveSettings(k, v);
        note("Settings saved");
      }}
    >
      <div className="a2-formgrid">{render(v, setV)}</div>
      <div className="a2-savebar">
        <button type="submit" className="a2-btn" data-kind="ink" disabled={!dirty}>
          {dirty ? "Save" : "Saved"}
        </button>
        {dirty ? (
          <button type="button" className="a2-link" onClick={() => setV(init)}>
            undo changes
          </button>
        ) : null}
      </div>
    </form>
  );
}

type P<T> = { v: T; set: (v: T) => void };
const txt = <T extends object, K extends keyof T>(v: T, set: (v: T) => void, key: K) => ({ value: String(v[key] ?? ""), onChange: (e: { target: { value: string } }) => set({ ...v, [key]: e.target.value }) });
const numf = <T extends object, K extends keyof T>(v: T, set: (v: T) => void, key: K) => ({ inputMode: "numeric" as const, value: String(v[key] ?? ""), onChange: (e: { target: { value: string } }) => set({ ...v, [key]: Number(e.target.value.replace(/\D/g, "")) }) });

function StoreFields({ v, set }: P<Settings["store"]>) {
  return (
    <>
      <F label="Trading name"><input {...txt(v, set, "name")} /></F>
      <F label="Legal name" wide><input {...txt(v, set, "legalName")} /></F>
      <F label="GSTIN"><input {...txt(v, set, "gstin")} /></F>
      <F label="PAN"><input {...txt(v, set, "pan")} /></F>
      <F label="Email"><input type="email" {...txt(v, set, "email")} /></F>
      <F label="Phone"><input {...txt(v, set, "phone")} /></F>
      <F label="Address" wide><input {...txt(v, set, "address")} /></F>
      <F label="City"><input {...txt(v, set, "city")} /></F>
      <F label="State"><input {...txt(v, set, "state")} /></F>
      <F label="PIN"><input inputMode="numeric" {...txt(v, set, "pin")} /></F>
      <F label="Invoice prefix"><input {...txt(v, set, "invoicePrefix")} /></F>
      <F label="Default GST %"><input {...numf(v, set, "gstRate")} /></F>
      <F label="HSN, red"><input {...txt(v, set, "hsnRed")} /></F>
      <F label="HSN, white"><input {...txt(v, set, "hsnWhite")} /></F>
      <Check checked={v.pricesIncludeGst} onChange={(b) => set({ ...v, pricesIncludeGst: b })}>Shop prices include GST</Check>
    </>
  );
}
function ShippingFields({ v, set }: P<Settings["shipping"]>) {
  return (
    <>
      <Check checked={v.standardFree} onChange={(b) => set({ ...v, standardFree: b })}>Standard delivery is free</Check>
      <F label="Standard ₹"><input {...numf(v, set, "standardPrice")} disabled={v.standardFree} /></F>
      <F label="Express ₹"><input {...numf(v, set, "expressPrice")} /></F>
      <F label="Cash on delivery up to ₹"><input {...numf(v, set, "codLimit")} /></F>
      <F label="Cash on delivery fee ₹"><input {...numf(v, set, "codFee")} /></F>
      <F label="Days to pack"><input {...numf(v, set, "processingDays")} /></F>
      <Check checked={v.insured} onChange={(b) => set({ ...v, insured: b })}>Insure every parcel</Check>
    </>
  );
}
function PaymentFields({ v, set }: P<Settings["payments"]>) {
  return (
    <>
      <F group label="Razorpay mode">
        <Choice label="Mode" value={v.mode} onChange={(m) => set({ ...v, mode: m })} items={[{ id: "test", label: "Test" }, { id: "live", label: "Live" }]} />
      </F>
      <F label="Key id" hint="The public key only. The secret stays on the server."><input {...txt(v, set, "keyId")} placeholder="rzp_test_…" /></F>
      <Check checked={v.upi} onChange={(b) => set({ ...v, upi: b })}>UPI</Check>
      <Check checked={v.card} onChange={(b) => set({ ...v, card: b })}>Cards</Check>
      <Check checked={v.netbanking} onChange={(b) => set({ ...v, netbanking: b })}>Net banking</Check>
      <Check checked={v.cod} onChange={(b) => set({ ...v, cod: b })}>Pay on delivery</Check>
    </>
  );
}
const ROLES: StaffRole[] = ["Owner", "Manager", "Fulfilment", "Support"];
function StaffFields({ v, set }: P<Staff[]>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Fulfilment");
  return (
    <div className="a2-wide">
      <div className="a2-ledger a2-staff" role="table" aria-label="Keepers">
        {v.map((s) => (
          <div key={s.id} className="a2-lrow" role="row">
            <span className="a2-part" role="cell">
              {s.name}
              <small>{s.email}</small>
            </span>
            <select aria-label={`Role of ${s.name}`} value={s.role} onChange={(e) => set(v.map((x) => (x.id === s.id ? { ...x, role: e.target.value as StaffRole } : x)))}>
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
            <span className="a2-dim" role="cell">{s.invited ? "invited" : s.lastActive}</span>
            <button type="button" className="a2-link a2-red" onClick={() => set(v.filter((x) => x.id !== s.id))}>
              remove
            </button>
          </div>
        ))}
      </div>
      <div className="a2-inline">
        <F label="Name"><input value={name} onChange={(e) => setName(e.target.value)} /></F>
        <F label="Email"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></F>
        <F label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
            {ROLES.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </F>
        <button
          type="button"
          className="a2-btn"
          disabled={!name.trim() || !/^\S+@\S+\.\S+$/.test(email)}
          onClick={() => {
            set([...v, { id: `s${v.length + 1}-${email}`, name: name.trim(), email: email.trim(), role, lastActive: "Invited", invited: true }]);
            setName("");
            setEmail("");
          }}
        >
          Add keeper
        </button>
      </div>
    </div>
  );
}
function NotifyFields({ v, set }: P<Settings["notifications"]>) {
  return (
    <>
      <Check checked={v.newOrder} onChange={(b) => set({ ...v, newOrder: b })}>A letter for every new order</Check>
      <Check checked={v.lowStock} onChange={(b) => set({ ...v, lowStock: b })}>When a line runs low</Check>
      <Check checked={v.review} onChange={(b) => set({ ...v, review: b })}>When a review arrives</Check>
      <Check checked={v.returnRequest} onChange={(b) => set({ ...v, returnRequest: b })}>When a return is asked</Check>
      <Check checked={v.dailySummary} onChange={(b) => set({ ...v, dailySummary: b })}>The day&apos;s page, each evening</Check>
      <F label="Send to" wide><input {...txt(v, set, "recipients")} /></F>
    </>
  );
}
