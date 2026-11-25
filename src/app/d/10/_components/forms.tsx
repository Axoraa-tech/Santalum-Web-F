"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import k from "../k";
import { Check, Field, SelectField, TabBar } from "./bits";

export const PREVIEW_ACCOUNTS = "Preview: accounts and orders are saved in this browser until our store opens.";

type Errs = Partial<Record<string, string | null>>;
const clean = (e: Errs) => Object.fromEntries(Object.entries(e).filter(([, v]) => v)) as Record<string, string>;

/** The submit button for these forms: the big ink pill, with a quiet pending state. */
export function Submit({ children, pending, note }: { children: ReactNode; pending?: boolean; note?: ReactNode }) {
  return (
    <button type="submit" disabled={pending} aria-busy={pending || undefined} className={`${k.btn} w-full`}>
      <span className={k.btnLabel}>{pending ? "One moment" : children}</span>
      {note && <span className={`${k.mono} opacity-70`}>{note}</span>}
    </button>
  );
}

/**
 * Sign in or create an account, inline. Two words as tabs; the chosen one is set wide.
 * Used by the checkout's first step and by the signed-out account page.
 */
export function AuthPanel({ idBase, initial = "in", onDone, big = true }: { idBase: string; initial?: "in" | "up"; onDone?: () => void; big?: boolean }) {
  const [tab, setTab] = useState<"in" | "up">(initial);
  return (
    <div>
      <TabBar
        idBase={idBase}
        label="Sign in or create an account"
        items={[
          { id: "in", label: "Sign in" },
          { id: "up", label: "Create account" },
        ]}
        value={tab}
        onChange={setTab}
        size={big ? "text-[length:clamp(36px,5.6vw,92px)]" : "text-[length:clamp(30px,3.6vw,56px)]"}
      />
      <div id={`${idBase}-panel`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab}`} className="mt-8">
        {tab === "in" ? <SignInForm onDone={onDone} onSwitch={() => setTab("up")} /> : <SignUpForm onDone={onDone} />}
      </div>
    </div>
  );
}

function SignInForm({ onDone, onSwitch }: { onDone?: () => void; onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const local = clean({ email: validate.email(email), password: password ? null : "Please enter your password." });
    setErrs(local);
    if (Object.keys(local).length) return;
    setPending(true);
    const r = await signIn({ email, password });
    setPending(false);
    if (!r.ok) {
      setErrs({ form: r.error });
      return;
    }
    onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <Field label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errs.email} required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errs.password}
        required
        note="Forgot your password? Password reset arrives when our store opens; write to us meanwhile and we will help."
      />
      {errs.form && (
        <p role="alert" className={k.err}>
          {errs.form}{" "}
          <button type="button" onClick={onSwitch} className={`${k.link} underline`}>
            Create an account instead
          </button>
        </p>
      )}
      <Submit pending={pending}>Sign in</Submit>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone?: () => void }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [news, setNews] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const set = (key: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [key]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const local = clean({ name: validate.name(v.name), email: validate.email(v.email), phone: validate.phone(v.phone), password: validate.password(v.password) });
    setErrs(local);
    if (Object.keys(local).length) return;
    setPending(true);
    const r = await signUp({ ...v, newsletter: news });
    setPending(false);
    if (!r.ok) {
      setErrs(r.field ? { [r.field]: r.error } : { form: r.error });
      return;
    }
    onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <Field label="Your name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errs.name} required />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" autoComplete="email" value={v.email} onChange={set("email")} error={errs.email} required />
        <Field label="Mobile" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" value={v.phone} onChange={set("phone")} error={errs.phone} required />
      </div>
      <Field label="Password, 8 characters or more" name="password" type="password" autoComplete="new-password" value={v.password} onChange={set("password")} error={errs.password} required />
      <Check
        checked={news}
        onChange={(e) => setNews(e.target.checked)}
        label="Write to me from the Santalum Circle"
        note="When a new batch is finished or distilled. A letter, not a programme."
      />
      {errs.form && (
        <p role="alert" className={k.err}>
          {errs.form}
        </p>
      )}
      <p className={`${k.mono} text-[var(--k10-grey)]`}>{PREVIEW_ACCOUNTS}</p>
      <Submit pending={pending}>Create account</Submit>
    </form>
  );
}

export type AddressDraft = Omit<Address, "id" | "isDefault">;
export const EMPTY_ADDRESS: AddressDraft = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

export function checkAddress(a: AddressDraft) {
  return clean({
    name: validate.name(a.name),
    phone: validate.phone(a.phone),
    line1: a.line1.trim().length >= 3 ? null : "Please enter the house and street.",
    city: a.city.trim().length >= 2 ? null : "Please enter the city or town.",
    state: a.state ? null : "Please choose the state or union territory.",
    pin: validate.pin(a.pin),
  });
}

/** An Indian delivery address in large type. `extra` sits above the buttons (e.g. "Save this address"). */
export function AddressForm({
  initial = EMPTY_ADDRESS,
  submitLabel,
  onSubmit,
  onCancel,
  extra,
}: {
  initial?: AddressDraft;
  submitLabel: string;
  onSubmit: (a: AddressDraft) => void;
  onCancel?: () => void;
  extra?: ReactNode;
}) {
  const [a, setA] = useState<AddressDraft>(initial);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const set = (key: keyof AddressDraft) => (e: { target: { value: string } }) => setA((s) => ({ ...s, [key]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const found = checkAddress(a);
    setErrs(found);
    if (Object.keys(found).length) {
      const first = Object.keys(found)[0];
      (e.currentTarget.elements.namedItem(first) as HTMLElement | null)?.focus();
      return;
    }
    onSubmit({ ...a, name: a.name.trim(), line1: a.line1.trim(), line2: a.line2?.trim() || undefined, city: a.city.trim(), pin: a.pin.trim() });
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-8">
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" value={a.name} onChange={set("name")} error={errs.name} required />
        <Field label="Mobile, for the courier" name="phone" type="tel" inputMode="tel" autoComplete="tel" value={a.phone} onChange={set("phone")} error={errs.phone} required />
      </div>
      <Field label="House, building, street" name="line1" autoComplete="address-line1" value={a.line1} onChange={set("line1")} error={errs.line1} required />
      <Field label="Area, landmark (optional)" name="line2" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} />
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
        <Field label="City or town" name="city" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errs.city} required />
        <Field
          label="PIN code"
          name="pin"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={6}
          value={a.pin}
          onChange={set("pin")}
          error={errs.pin}
          required
        />
      </div>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[2fr_1fr]">
        <SelectField label="State or union territory" name="state" autoComplete="address-level1" value={a.state} onChange={set("state")} error={errs.state} required>
          <option value="" disabled>
            Choose
          </option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <Field label="Call it" name="label" autoComplete="off" value={a.label} onChange={set("label")} placeholder="Home" />
      </div>
      {extra}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="sm:flex-1">
          <Submit>{submitLabel}</Submit>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${k.mono} ${k.link} self-start sm:self-center`}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** One address, set in mono, for summaries and lists. `masked` hides the street for public tracking. */
export function AddressLines({ a, masked = false }: { a: AddressDraft; masked?: boolean }) {
  return (
    <span className="block">
      {!masked && <span className="block">{a.name}</span>}
      {masked ? (
        <span className="block text-[var(--k10-grey)]">Street hidden on public tracking</span>
      ) : (
        <span className="block">
          {a.line1}
          {a.line2 ? `, ${a.line2}` : ""}
        </span>
      )}
      <span className="block">
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span className="block text-[var(--k10-grey)]">{a.phone}</span>}
    </span>
  );
}
