"use client";

import { useState, type FormEvent } from "react";
import { STATES, validate, type Address } from "@/lib/shop/account";
import { Field } from "./bits";

export type AddressDraft = Omit<Address, "id" | "isDefault">;
type Key = "label" | "name" | "phone" | "line1" | "line2" | "city" | "state" | "pin";

const EMPTY: AddressDraft = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

/** An Indian delivery address, checked with the shared rules. */
export function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  saveOption = false,
  defaultOption = false,
  initialDefault = false,
}: {
  initial?: Partial<AddressDraft>;
  submitLabel: string;
  onSubmit: (a: AddressDraft, opts: { save: boolean; isDefault: boolean }) => void;
  onCancel?: () => void;
  saveOption?: boolean;
  defaultOption?: boolean;
  initialDefault?: boolean;
}) {
  const [v, setV] = useState<AddressDraft>({ ...EMPTY, ...initial });
  const [save, setSave] = useState(true);
  const [isDefault, setIsDefault] = useState(initialDefault);
  const [err, setErr] = useState<Partial<Record<Key, string>>>({});
  const set = (k: Key) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Partial<Record<Key, string>> = {};
    const n = validate.name(v.name);
    if (n) next.name = n;
    const p = validate.phone(v.phone);
    if (p) next.phone = p;
    if (v.line1.trim().length < 3) next.line1 = "Please enter the house and street.";
    if (v.city.trim().length < 2) next.city = "Please enter the city or town.";
    if (!v.state) next.state = "Please choose the state or union territory.";
    const pin = validate.pin(v.pin);
    if (pin) next.pin = pin;
    setErr(next);
    if (Object.keys(next).length) return;
    onSubmit(
      { ...v, label: v.label.trim() || "Home", name: v.name.trim(), line1: v.line1.trim(), line2: v.line2?.trim() || undefined, city: v.city.trim(), pin: v.pin.trim() },
      { save, isDefault },
    );
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Delivery address" className="grid gap-4 sm:grid-cols-6">
      <Field label="Name for this address" error={err.label} className="sm:col-span-2" hint="Home, Office, Amma's house">
        {(a) => <input {...a} name="label" autoComplete="off" value={v.label} onChange={set("label")} className="s3-input" />}
      </Field>
      <Field label="Full name" error={err.name} className="sm:col-span-4">
        {(a) => <input {...a} name="name" autoComplete="name" value={v.name} onChange={set("name")} className="s3-input" />}
      </Field>
      <Field label="Mobile number" error={err.phone} className="sm:col-span-3">
        {(a) => <input {...a} name="tel" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} className="s3-input" />}
      </Field>
      <Field label="PIN code" error={err.pin} className="sm:col-span-3">
        {(a) => (
          <input
            {...a}
            name="postal-code"
            inputMode="numeric"
            maxLength={6}
            autoComplete="postal-code"
            value={v.pin}
            onChange={set("pin")}
            className="s3-input"
          />
        )}
      </Field>
      <Field label="House, building, street" error={err.line1} className="sm:col-span-6">
        {(a) => <input {...a} name="street-address" autoComplete="address-line1" value={v.line1} onChange={set("line1")} className="s3-input" />}
      </Field>
      <Field label="Area, landmark (optional)" className="sm:col-span-6">
        {(a) => <input {...a} name="address-line2" autoComplete="address-line2" value={v.line2 ?? ""} onChange={set("line2")} className="s3-input" />}
      </Field>
      <Field label="City or town" error={err.city} className="sm:col-span-3">
        {(a) => <input {...a} name="city" autoComplete="address-level2" value={v.city} onChange={set("city")} className="s3-input" />}
      </Field>
      <Field label="State or union territory" error={err.state} className="sm:col-span-3">
        {(a) => (
          <select {...a} name="state" autoComplete="address-level1" value={v.state} onChange={set("state")} className="s3-input">
            <option value="" disabled>
              Choose one
            </option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        )}
      </Field>
      {(saveOption || defaultOption) && (
        <div className="grid gap-3 sm:col-span-6">
          {saveOption && (
            <label className="s3-check">
              <input type="checkbox" checked={save} onChange={(e) => setSave(e.target.checked)} />
              <span>Save this address to my account</span>
            </label>
          )}
          {defaultOption && (
            <label className="s3-check">
              <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
              <span>Make this my default address</span>
            </label>
          )}
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 sm:col-span-6">
        <button type="submit" className="s3-btn s3-btn-dark">
          <span className="s3-bead s3-btn-bead" aria-hidden />
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="s3-btn s3-btn-line" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** One address, written as on an envelope. */
export function AddressLines({ a, masked = false }: { a: AddressDraft; masked?: boolean }) {
  return (
    <span className="block text-[16px] leading-[1.55]">
      <span className="block">{a.name}</span>
      {masked ? (
        <span className="block text-(--muted)">Street address hidden for privacy</span>
      ) : (
        <>
          <span className="block">{a.line1}</span>
          {a.line2 && <span className="block">{a.line2}</span>}
        </>
      )}
      <span className="block">
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span className="block text-(--muted)">{a.phone}</span>}
    </span>
  );
}
