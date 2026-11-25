"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import { r } from "./cls";
import { cx } from "./ui";

/**
 * Forms in the register-book language: ruled rows, a label in the margin, the entry written on the line.
 * Errors sit under the line, tied to the field with aria-describedby.
 */

export const PREVIEW_NOTE = "Preview: accounts and orders are saved in this browser until our store opens.";

type FieldProps = { label: string; error?: string | null; hint?: string } & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, error, hint, className, ...input }: FieldProps) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx(r.row, className)} data-invalid={error ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      <div>
        <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...input} />
        {hint && (
          <p id={hintId} className={r.hint}>
            {hint}
          </p>
        )}
        {error && (
          <p id={errId} className={r.err}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function SelectField({
  label,
  error,
  children,
  ...select
}: { label: string; error?: string | null; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={r.row} data-invalid={error ? "" : undefined}>
      <label htmlFor={id}>{label}</label>
      <div>
        <select id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? errId : undefined} {...select}>
          {children}
        </select>
        {error && (
          <p id={errId} className={r.err}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export function Check({
  label,
  note,
  checked,
  onChange,
  name,
}: {
  label: ReactNode;
  note?: ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  name?: string;
}) {
  return (
    <label className={r.check}>
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        {label}
        {note && <small>{note}</small>}
      </span>
    </label>
  );
}

/** Focus the first field that failed, so keyboard and screen-reader users land on it. */
function focusFirst(form: HTMLFormElement, names: string[]) {
  for (const n of names) {
    const el = form.elements.namedItem(n);
    if (el instanceof HTMLElement) {
      el.focus();
      return;
    }
  }
}

type Errs = Partial<Record<string, string>>;

/* ---------------- sign in ---------------- */
export function SignInForm({ onDone, submitLabel = "Sign in" }: { onDone?: () => void; submitLabel?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errs, setErrs] = useState<Errs>({});
  const [general, setGeneral] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const formErr = useId();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errs = {};
    const em = validate.email(email);
    if (em) next.email = em;
    if (!password) next.password = "Please enter your password.";
    setErrs(next);
    setGeneral("");
    if (Object.keys(next).length) {
      focusFirst(form, Object.keys(next));
      return;
    }
    setBusy(true);
    const res = await signIn({ email, password });
    setBusy(false);
    if (!res.ok) {
      setGeneral(res.error);
      focusFirst(form, ["email"]);
      return;
    }
    onDone?.();
  };

  return (
    <form className={r.form} onSubmit={submit} noValidate aria-describedby={general ? formErr : undefined}>
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errs.email}
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errs.password}
      />
      {general && (
        <p id={formErr} className={r.formErr} role="alert">
          {general}
        </p>
      )}
      <div className={r.formActions}>
        <button type="submit" className={r.submitSm} disabled={busy}>
          {busy ? "Checking" : submitLabel}
        </button>
        <button type="button" className={r.link} aria-expanded={forgot} onClick={() => setForgot((f) => !f)}>
          Forgot password?
        </button>
      </div>
      {forgot && (
        <p className={r.fine} role="note">
          Password reset arrives when our store opens; write to us meanwhile and we will help you back in.
        </p>
      )}
    </form>
  );
}

/* ---------------- create an account ---------------- */
export function SignUpForm({ onDone, submitLabel = "Create my account" }: { onDone?: () => void; submitLabel?: string }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errs = {};
    (["name", "email", "phone", "password"] as const).forEach((k) => {
      const err = validate[k](v[k]);
      if (err) next[k] = err;
    });
    setErrs(next);
    if (Object.keys(next).length) {
      focusFirst(form, Object.keys(next));
      return;
    }
    setBusy(true);
    const res = await signUp({ ...v, newsletter });
    setBusy(false);
    if (!res.ok) {
      setErrs({ [res.field ?? "email"]: res.error });
      focusFirst(form, [res.field ?? "email"]);
      return;
    }
    onDone?.();
  };

  return (
    <form className={r.form} onSubmit={submit} noValidate>
      <Field label="Full name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errs.name} />
      <Field
        label="Email"
        name="email"
        type="email"
        inputMode="email"
        autoComplete="email"
        value={v.email}
        onChange={set("email")}
        error={errs.email}
      />
      <Field
        label="Mobile"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="10-digit number"
        value={v.phone}
        onChange={set("phone")}
        error={errs.phone}
        hint="For the courier, and nothing else."
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        value={v.password}
        onChange={set("password")}
        error={errs.password}
        hint="At least 8 characters."
      />
      <Check
        label="Letters from the Santalum Circle"
        note="New batches, notes from the workshop, first word on the 2011 editions. A few a year."
        checked={newsletter}
        onChange={setNewsletter}
      />
      <div className={r.formActions}>
        <button type="submit" className={r.submitSm} disabled={busy}>
          {busy ? "Writing it in" : submitLabel}
        </button>
      </div>
      <p className={r.fine}>{PREVIEW_NOTE}</p>
    </form>
  );
}

/* ---------------- an address ---------------- */
export type AddressInput = Omit<Address, "id" | "isDefault">;
const EMPTY: AddressInput = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

export function AddressForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  offerSave = false,
  offerDefault = false,
}: {
  initial?: Partial<AddressInput> & { isDefault?: boolean };
  submitLabel: string;
  onSubmit: (a: AddressInput, opts: { save: boolean; isDefault: boolean }) => void;
  onCancel?: () => void;
  offerSave?: boolean;
  offerDefault?: boolean;
}) {
  const [v, setV] = useState<AddressInput>({ ...EMPTY, ...initial });
  const [save, setSave] = useState(true);
  const [isDefault, setIsDefault] = useState(!!initial?.isDefault);
  const [errs, setErrs] = useState<Errs>({});
  const set = (k: keyof AddressInput) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));
  const labels = ["Home", "Office", "Family"];
  const callId = useId();

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errs = {};
    const n = validate.name(v.name);
    if (n) next.name = n;
    const ph = validate.phone(v.phone);
    if (ph) next.phone = ph;
    if (v.line1.trim().length < 4) next.line1 = "Please enter the house and street.";
    if (v.city.trim().length < 2) next.city = "Please enter the city or town.";
    if (!v.state) next.state = "Please choose a state or union territory.";
    const pin = validate.pin(v.pin);
    if (pin) next.pin = pin;
    setErrs(next);
    if (Object.keys(next).length) {
      focusFirst(form, ["name", "phone", "line1", "city", "state", "pin"].filter((k) => next[k]));
      return;
    }
    onSubmit({ ...v, name: v.name.trim(), city: v.city.trim(), pin: v.pin.trim(), line1: v.line1.trim(), line2: v.line2?.trim() || undefined }, { save, isDefault });
  };

  return (
    <form className={r.form} onSubmit={submit} noValidate>
      <div className={r.row}>
        <span className={r.rowLabel} id={callId}>
          Call it
        </span>
        <div className={r.chips} role="radiogroup" aria-labelledby={callId}>
          {labels.map((l) => (
            <label key={l} className={r.chip}>
              <input type="radio" name="label" value={l} checked={v.label === l} onChange={set("label")} />
              <span>{l}</span>
            </label>
          ))}
        </div>
      </div>
      <Field label="Full name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errs.name} />
      <Field
        label="Mobile"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="10-digit number"
        value={v.phone}
        onChange={set("phone")}
        error={errs.phone}
      />
      <Field
        label="House and street"
        name="line1"
        autoComplete="address-line1"
        value={v.line1}
        onChange={set("line1")}
        error={errs.line1}
      />
      <Field
        label="Area, landmark"
        name="line2"
        autoComplete="address-line2"
        placeholder="Optional"
        value={v.line2 ?? ""}
        onChange={set("line2")}
      />
      <div className={r.two}>
        <Field label="City" name="city" autoComplete="address-level2" value={v.city} onChange={set("city")} error={errs.city} />
        <Field
          label="PIN code"
          name="pin"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={6}
          placeholder="560001"
          value={v.pin}
          onChange={set("pin")}
          error={errs.pin}
        />
      </div>
      <SelectField label="State" name="state" autoComplete="address-level1" value={v.state} onChange={set("state")} error={errs.state}>
        <option value="" disabled>
          Choose a state or union territory
        </option>
        {STATES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </SelectField>
      {offerSave && <Check label="Save this address" note="To your account, for the next order." checked={save} onChange={setSave} />}
      {offerDefault && <Check label="Make this my default address" checked={isDefault} onChange={setIsDefault} />}
      <div className={r.formActions}>
        <button type="submit" className={r.submitSm}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={r.link} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** One address, as it would be written on a parcel. */
export function AddressLines({ a, masked = false }: { a: AddressInput; masked?: boolean }) {
  return (
    <span className={r.addr}>
      {!masked && <span>{a.name}</span>}
      {!masked && <span>{a.line1}</span>}
      {!masked && a.line2 && <span>{a.line2}</span>}
      {masked && <span className={r.masked}>Street withheld on public lookups</span>}
      <span>
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span>{a.phone}</span>}
    </span>
  );
}
