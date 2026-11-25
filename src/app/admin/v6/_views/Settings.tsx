"use client";

import { useState, type ReactNode } from "react";
import { resetAdminData, saveSettings, useSettings } from "../../_data/store";
import type { Settings as S, Staff, StaffRole } from "../../_data/types";
import { Check, Field, Head, say } from "../_ui/kit";

function useSection<K extends keyof S>(key: K) {
  const all = useSettings();
  const [d, setD] = useState<S[K]>(all[key]);
  const [dirty, setDirty] = useState(false);
  const set = (p: Partial<S[K]>) => {
    setD((x) => ({ ...(x as object), ...p }) as S[K]);
    setDirty(true);
  };
  const save = (label: string) => {
    saveSettings(key, d);
    setDirty(false);
    say(`${label} saved`);
  };
  return { d, set, setD, dirty, setDirty, save };
}

function Section({ no, title, lede, dirty, onSave, children }: { no: string; title: string; lede: string; dirty: boolean; onSave: () => void; children: ReactNode }) {
  return (
    <form
      className="a6-settings a6-grid"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <div className="a6-settings-head">
        <span className="a6-head-no a6-head-no-sm">{no}</span>
        <h2 className="a6-h2">{title}</h2>
        <p className="a6-muted">{lede}</p>
        <button type="submit" className="a6-btn" data-primary={dirty || undefined} disabled={!dirty}>
          {dirty ? "Save" : "Saved"}
        </button>
      </div>
      <div className="a6-settings-body a6-form-grid">{children}</div>
    </form>
  );
}

const num = (v: string) => Number(v.replace(/[^\d.]/g, "")) || 0;

export function Settings() {
  return (
    <>
      <Head no="09" title="Settings" lede="The Maison's details, delivery, payments, staff and who hears about what. Each section saves on its own." />
      <Store />
      <Shipping />
      <Payments />
      <StaffSection />
      <Notifications />
      <section className="a6-settings a6-grid">
        <div className="a6-settings-head">
          <span className="a6-head-no a6-head-no-sm">9.6</span>
          <h2 className="a6-h2">Preview data</h2>
          <p className="a6-muted">Clears every change made in this browser&rsquo;s admin preview. Sign-in is kept.</p>
        </div>
        <div className="a6-settings-body">
          <button
            type="button"
            className="a6-btn"
            data-danger
            onClick={() => {
              if (window.confirm("Clear all admin preview changes in this browser? This cannot be undone.")) resetAdminData();
            }}
          >
            Reset preview data
          </button>
        </div>
      </section>
    </>
  );
}

function Store() {
  const { d, set, dirty, save } = useSection("store");
  const text = (k: keyof typeof d, label: string, no: string, cls = "") => (
    <Field no={no} label={label}>
      {(id) => <input id={id} className={`a6-input ${cls}`} value={String(d[k])} onChange={(e) => set({ [k]: e.target.value } as Partial<typeof d>)} />}
    </Field>
  );
  return (
    <Section no="9.1" title="Store and tax" lede="Printed on every invoice." dirty={dirty} onSave={() => save("Store details")}>
      {text("name", "Trading name", "01")}
      {text("legalName", "Legal name", "02")}
      {text("gstin", "GSTIN", "03", "a6-num")}
      {text("pan", "PAN", "04", "a6-num")}
      {text("email", "Email", "05")}
      {text("phone", "Phone", "06", "a6-num")}
      {text("address", "Address", "07")}
      {text("city", "City", "08")}
      {text("state", "State", "09")}
      {text("pin", "PIN", "10", "a6-num")}
      {text("invoicePrefix", "Invoice prefix", "11", "a6-num")}
      <Field no="12" label="Default GST rate, %">
        {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.gstRate} onChange={(e) => set({ gstRate: num(e.target.value) })} />}
      </Field>
      <Check checked={d.pricesIncludeGst} onChange={(v) => set({ pricesIncludeGst: v })}>
        Shop prices include GST
      </Check>
    </Section>
  );
}

function Shipping() {
  const { d, set, dirty, save } = useSection("shipping");
  return (
    <Section no="9.2" title="Delivery" lede="What customers pay and when parcels leave the studio." dirty={dirty} onSave={() => save("Delivery")}>
      <Field no="01" label="Express delivery, ₹">
        {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.expressPrice} onChange={(e) => set({ expressPrice: num(e.target.value) })} />}
      </Field>
      <Field no="02" label="Days to dispatch">
        {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.processingDays} onChange={(e) => set({ processingDays: num(e.target.value) })} />}
      </Field>
      <Field no="03" label="Pay on delivery up to, ₹">
        {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.codLimit} onChange={(e) => set({ codLimit: num(e.target.value) })} />}
      </Field>
      <Field no="04" label="Pay on delivery fee, ₹">
        {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={d.codFee} onChange={(e) => set({ codFee: num(e.target.value) })} />}
      </Field>
      <Check checked={d.standardFree} onChange={(v) => set({ standardFree: v })}>
        Standard delivery is free across India
      </Check>
      <Check checked={d.insured} onChange={(v) => set({ insured: v })}>
        Insure every parcel in transit
      </Check>
    </Section>
  );
}

function Payments() {
  const { d, set, dirty, save } = useSection("payments");
  return (
    <Section no="9.3" title="Payments" lede="Razorpay. Keep test mode on until the live keys are issued." dirty={dirty} onSave={() => save("Payments")}>
      <Field no="01" label="Mode">
        {(id) => (
          <select id={id} className="a6-input" value={d.mode} onChange={(e) => set({ mode: e.target.value as "test" | "live" })}>
            <option value="test">Test</option>
            <option value="live">Live</option>
          </select>
        )}
      </Field>
      <Field no="02" label="Key ID" hint="The public key only. The secret stays on the server.">
        {(id) => <input id={id} className="a6-input a6-num" placeholder="rzp_test_…" value={d.keyId} onChange={(e) => set({ keyId: e.target.value })} />}
      </Field>
      <Check checked={d.upi} onChange={(v) => set({ upi: v })}>
        UPI
      </Check>
      <Check checked={d.card} onChange={(v) => set({ card: v })}>
        Cards
      </Check>
      <Check checked={d.netbanking} onChange={(v) => set({ netbanking: v })}>
        Net banking
      </Check>
      <Check checked={d.cod} onChange={(v) => set({ cod: v })}>
        Pay on delivery
      </Check>
    </Section>
  );
}

const ROLES: StaffRole[] = ["Owner", "Manager", "Fulfilment", "Support"];
function StaffSection() {
  const { d, setD, dirty, setDirty, save } = useSection("staff");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<StaffRole>("Support");
  const update = (list: Staff[]) => {
    setD(list);
    setDirty(true);
  };
  return (
    <Section no="9.4" title="Staff" lede="Who can sign in, and what they look after." dirty={dirty} onSave={() => save("Staff")}>
      <table className="a6-table a6-wide">
        <tbody>
          {d.map((s) => (
            <tr key={s.id}>
              <td>
                {s.name}
                <div className="a6-muted">{s.email}</div>
              </td>
              <td>
                <select className="a6-input" aria-label={`Role for ${s.name}`} value={s.role} onChange={(e) => update(d.map((x) => (x.id === s.id ? { ...x, role: e.target.value as StaffRole } : x)))}>
                  {ROLES.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
              </td>
              <td className="a6-hide-sm a6-muted">{s.lastActive}</td>
              <td className="a6-r">
                <button type="button" className="a6-link" data-danger onClick={() => update(d.filter((x) => x.id !== s.id))}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="a6-form-row a6-wide">
        <input className="a6-input" placeholder="Name" aria-label="New staff name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="a6-input" placeholder="Email" aria-label="New staff email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select className="a6-input" aria-label="New staff role" value={role} onChange={(e) => setRole(e.target.value as StaffRole)}>
          {ROLES.map((r) => (
            <option key={r}>{r}</option>
          ))}
        </select>
        <button
          type="button"
          className="a6-btn"
          disabled={!name.trim() || !/^\S+@\S+\.\S+$/.test(email)}
          onClick={() => {
            update([...d, { id: `s${d.length + 1}-${email}`, name: name.trim(), email: email.trim(), role, lastActive: "Invited", invited: true }]);
            setName("");
            setEmail("");
          }}
        >
          Invite
        </button>
      </div>
    </Section>
  );
}

function Notifications() {
  const { d, set, dirty, save } = useSection("notifications");
  return (
    <Section no="9.5" title="Notifications" lede="Emails the team receives." dirty={dirty} onSave={() => save("Notifications")}>
      <Field no="01" label="Send to" hint="Separate several addresses with commas." wide>
        {(id) => <input id={id} className="a6-input" value={d.recipients} onChange={(e) => set({ recipients: e.target.value })} />}
      </Field>
      <Check checked={d.newOrder} onChange={(v) => set({ newOrder: v })}>
        Every new order
      </Check>
      <Check checked={d.lowStock} onChange={(v) => set({ lowStock: v })}>
        Stock at its reorder level
      </Check>
      <Check checked={d.review} onChange={(v) => set({ review: v })}>
        A review waiting for moderation
      </Check>
      <Check checked={d.returnRequest} onChange={(v) => set({ returnRequest: v })}>
        A return request
      </Check>
      <Check checked={d.dailySummary} onChange={(v) => set({ dailySummary: v })}>
        A summary each morning at 8
      </Check>
    </Section>
  );
}
