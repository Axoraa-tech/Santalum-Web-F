"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { saveAddress, signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import { PREVIEW_LINE } from "./content";

/** A field set on the grid: small grey label, a serif value on one rule, and its error tied by aria-describedby. */
export function Field({
  label,
  hint,
  error,
  wide,
  optional,
  ...rest
}: { label: string; hint?: string; error?: string | null; wide?: boolean; optional?: boolean } & InputHTMLAttributes<HTMLInputElement>) {
  const uid = useId();
  const id = rest.id ?? `${uid}-f`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errId = error ? `${id}-err` : undefined;
  return (
    <div className={`x5c-field ${wide ? "x5c-wide" : ""}`}>
      <label htmlFor={id} className="x5c-label">
        {label}
        {optional && <span> (optional)</span>}
      </label>
      <input
        id={id}
        className="x5c-input"
        aria-invalid={error ? true : undefined}
        aria-describedby={[errId, hintId].filter(Boolean).join(" ") || undefined}
        {...rest}
      />
      {error ? (
        <span id={errId} className="x5c-error" role="alert">
          {error}
        </span>
      ) : (
        hint && (
          <span id={hintId} className="x5c-hint">
            {hint}
          </span>
        )
      )}
    </div>
  );
}

export function Check({ children, ...rest }: { children: ReactNode } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="x5c-check">
      <input type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  );
}

type Errors = Partial<Record<string, string | null>>;

/** Focus the first field that has an error, after the error text has rendered. */
function focusFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

export function SignInForm({ onDone, idBase }: { onDone?: () => void; idBase: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errors = { email: validate.email(email), password: password ? null : "Please enter your password." };
    setErrors(next);
    if (next.email || next.password) return focusFirstError(form);
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) {
      setErrors({ form: r.error });
      return;
    }
    onDone?.();
  };

  return (
    <form className="x5c-auth" onSubmit={submit} noValidate>
      <div className="x5c-fields x5c-fields1">
        <Field
          id={`${idBase}-email`}
          label="Email"
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          wide
        />
        <Field
          id={`${idBase}-password`}
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          wide
        />
      </div>
      {errors.form && (
        <p className="x5c-formError" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="x5c-place x5c-placeSmall" disabled={busy}>
        <span>{busy ? "Signing in" : "Sign in"}</span>
        <span>Your file</span>
      </button>
      <p className="x5c-fine">Forgot password? Password reset arrives when our store opens; write to us meanwhile and we will help.</p>
    </form>
  );
}

export function SignUpForm({ onDone, idBase }: { onDone?: () => void; idBase: string }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errors = {
      name: validate.name(v.name),
      email: validate.email(v.email),
      phone: validate.phone(v.phone),
      password: validate.password(v.password),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return focusFirstError(form);
    setBusy(true);
    const r = await signUp({ ...v, newsletter });
    setBusy(false);
    if (!r.ok) {
      setErrors(r.field ? { [r.field]: r.error } : { form: r.error });
      if (r.field) focusFirstError(form);
      return;
    }
    onDone?.();
  };

  return (
    <form className="x5c-auth" onSubmit={submit} noValidate>
      <div className="x5c-fields">
        <Field id={`${idBase}-name`} label="Full name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} wide />
        <Field id={`${idBase}-email`} label="Email" type="email" name="email" autoComplete="email" value={v.email} onChange={set("email")} error={errors.email} />
        <Field
          id={`${idBase}-phone`}
          label="Mobile"
          type="tel"
          name="tel"
          autoComplete="tel"
          inputMode="tel"
          value={v.phone}
          onChange={set("phone")}
          error={errors.phone}
          hint="Ten digits, for the courier"
        />
        <Field
          id={`${idBase}-password`}
          label="Password"
          type="password"
          name="new-password"
          autoComplete="new-password"
          value={v.password}
          onChange={set("password")}
          error={errors.password}
          hint="At least 8 characters"
          wide
        />
      </div>
      <Check checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)}>
        Send me the Santalum Circle letter, a few times a year.
      </Check>
      {errors.form && (
        <p className="x5c-formError" role="alert">
          {errors.form}
        </p>
      )}
      <button type="submit" className="x5c-place x5c-placeSmall" disabled={busy}>
        <span>{busy ? "Opening your file" : "Create an account"}</span>
        <span>Free</span>
      </button>
      <p className="x5c-fine">{PREVIEW_LINE}</p>
    </form>
  );
}

/** A reader's slip: the library call slip the Index uses for every sign-in, perforated at the top and numbered. */
export function ReaderSlip({ form, title, children }: { form: string; title: string; children: ReactNode }) {
  return (
    <div className="x5c-rslip">
      <span className="x5-perf" aria-hidden />
      <div className="x5c-rslipHead">
        <span className="x5c-rslipBrand">Santalum Maison</span>
        <span className="x5c-rslipForm">{form}</span>
        <span className="x5c-rslipTitle">{title}</span>
      </div>
      {children}
    </div>
  );
}

/** Sign in or create an account, as the two sides of one reader's slip. */
export function AuthPanel({ onDone, idBase, start = "in" }: { onDone?: () => void; idBase: string; start?: "in" | "up" }) {
  const [tab, setTab] = useState<"in" | "up">(start);
  return (
    <ReaderSlip form={tab === "in" ? "Form A" : "Form B"} title={tab === "in" ? "Reader's slip, returning reader" : "Reader's slip, new reader"}>
      <div className="x5c-authTabs" role="tablist" aria-label="Account">
        <button type="button" role="tab" id={`${idBase}-tab-in`} aria-selected={tab === "in"} aria-controls={`${idBase}-panel`} className="x5-tab" onClick={() => setTab("in")}>
          A. Sign in
        </button>
        <button type="button" role="tab" id={`${idBase}-tab-up`} aria-selected={tab === "up"} aria-controls={`${idBase}-panel`} className="x5-tab" onClick={() => setTab("up")}>
          B. Open a reader&apos;s file
        </button>
      </div>
      <div id={`${idBase}-panel`} role="tabpanel" aria-labelledby={`${idBase}-tab-${tab}`}>
        {tab === "in" ? <SignInForm key="in" onDone={onDone} idBase={`${idBase}-in`} /> : <SignUpForm key="up" onDone={onDone} idBase={`${idBase}-up`} />}
      </div>
    </ReaderSlip>
  );
}

export type AddressDraft = Omit<Address, "id">;
export const EMPTY_ADDRESS: AddressDraft = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

/**
 * An Indian delivery address. With `offerSave`, the reader decides whether it goes into their file;
 * without it, it is always saved (the account page).
 */
export function AddressForm({
  initial,
  idBase,
  submitLabel,
  offerSave = false,
  onDone,
  onCancel,
}: {
  initial?: Address | AddressDraft;
  idBase: string;
  submitLabel: string;
  offerSave?: boolean;
  onDone: (a: AddressDraft & { id?: string }) => void;
  onCancel?: () => void;
}) {
  const [a, setA] = useState<AddressDraft & { id?: string }>({ ...EMPTY_ADDRESS, ...initial });
  const [keep, setKeep] = useState(true);
  const [errors, setErrors] = useState<Errors>({});
  const set = (k: keyof AddressDraft) => (e: { target: { value: string } }) => setA((x) => ({ ...x, [k]: e.target.value }));

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next: Errors = {
      name: validate.name(a.name),
      phone: validate.phone(a.phone),
      line1: a.line1.trim().length >= 3 ? null : "Please enter the house, street and area.",
      city: a.city.trim().length >= 2 ? null : "Please enter the city or town.",
      state: a.state ? null : "Please choose the state or union territory.",
      pin: validate.pin(a.pin),
    };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return focusFirstError(form);
    const clean: AddressDraft & { id?: string } = {
      ...a,
      label: a.label.trim() || "Home",
      name: a.name.trim(),
      phone: a.phone.replace(/\s/g, ""),
      line1: a.line1.trim(),
      line2: a.line2?.trim() || undefined,
      city: a.city.trim(),
      pin: a.pin.trim(),
    };
    if (!offerSave || keep) onDone(saveAddress(clean));
    else onDone(clean);
  };

  return (
    <form className="x5c-addr" onSubmit={submit} noValidate>
      <div className="x5c-fields">
        <Field id={`${idBase}-label`} label="Call this address" name="address-label" autoComplete="off" value={a.label} onChange={set("label")} hint="Home, office, parents" />
        <Field id={`${idBase}-name`} label="Full name" name="name" autoComplete="name" value={a.name} onChange={set("name")} error={errors.name} />
        <Field
          id={`${idBase}-line1`}
          label="House, street and area"
          name="street-address"
          autoComplete="address-line1"
          value={a.line1}
          onChange={set("line1")}
          error={errors.line1}
          wide
        />
        <Field id={`${idBase}-line2`} label="Landmark" name="address-line2" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} optional wide />
        <Field id={`${idBase}-city`} label="City or town" name="city" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errors.city} />
        <Field
          id={`${idBase}-pin`}
          label="PIN code"
          name="postal-code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={6}
          value={a.pin}
          onChange={set("pin")}
          error={errors.pin}
        />
        <div className="x5c-field">
          <label htmlFor={`${idBase}-state`} className="x5c-label">
            State or union territory
          </label>
          <select
            id={`${idBase}-state`}
            name="state"
            autoComplete="address-level1"
            className="x5c-input x5c-select"
            value={a.state}
            onChange={set("state")}
            aria-invalid={errors.state ? true : undefined}
            aria-describedby={errors.state ? `${idBase}-state-err` : undefined}
          >
            <option value="" disabled>
              Choose one
            </option>
            {STATES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
          {errors.state && (
            <span id={`${idBase}-state-err`} className="x5c-error" role="alert">
              {errors.state}
            </span>
          )}
        </div>
        <Field
          id={`${idBase}-phone`}
          label="Mobile, for the courier"
          type="tel"
          name="tel"
          autoComplete="tel"
          inputMode="tel"
          value={a.phone}
          onChange={set("phone")}
          error={errors.phone}
        />
      </div>
      {offerSave && (
        <Check checked={keep} onChange={(e) => setKeep(e.target.checked)}>
          Save this address to my file.
        </Check>
      )}
      <div className="x5c-formActions">
        <button type="submit" className="x5c-place x5c-placeSmall">
          <span>{submitLabel}</span>
          <span>{a.pin && /^[1-9]\d{5}$/.test(a.pin) ? a.pin : "India"}</span>
        </button>
        {onCancel && (
          <button type="button" className="x5-textBtn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** An address as it is printed on a slip. */
export function AddressLines({ a, masked = false }: { a: AddressDraft; masked?: boolean }) {
  return (
    <span className="x5c-addrLines">
      <b>{a.name}</b>
      <span>{masked ? "Street line withheld for privacy" : [a.line1, a.line2].filter(Boolean).join(", ")}</span>
      <span>
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span>{a.phone}</span>}
    </span>
  );
}
