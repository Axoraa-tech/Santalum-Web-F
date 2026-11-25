"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import { s } from "./cx";

/** One quiet line wherever an account or an order is created. */
export const PREVIEW = "Preview: accounts and orders are saved in this browser until our store opens.";

/** A ruled work-order field: mono label above, the error tied to the input. */
export function Field({ label, error, className = "", id, ...input }: { label: string; error?: string | null; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  const eid = `${fid}-err`;
  return (
    <div className={className}>
      <label className={s.field} htmlFor={fid} data-error={error ? "" : undefined}>
        <input id={fid} {...input} placeholder=" " aria-invalid={error ? true : undefined} aria-describedby={error ? eid : undefined} />
        <span>{label}</span>
      </label>
      {error && (
        <span id={eid} className={s.err}>
          {error}
        </span>
      )}
    </div>
  );
}

export function SelectField({
  label,
  error,
  className = "",
  children,
  ...select
}: { label: string; error?: string | null; className?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const fid = useId();
  const eid = `${fid}-err`;
  return (
    <div className={className}>
      <label className={s.field} htmlFor={fid} data-error={error ? "" : undefined}>
        <select id={fid} {...select} aria-invalid={error ? true : undefined} aria-describedby={error ? eid : undefined}>
          {children}
        </select>
        <span>{label}</span>
        <svg aria-hidden className="pointer-events-none absolute bottom-3 right-1 text-(--steel)" width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4 L6 8 L10 4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </label>
      {error && (
        <span id={eid} className={s.err}>
          {error}
        </span>
      )}
    </div>
  );
}

/** A square checkbox drawn like a box on an inspection sheet. */
export function Tick({ checked, onChange, children, name }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; name?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 text-[15px] leading-[1.45]">
      <input type="checkbox" name={name} checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden
        className="mt-0.5 grid size-[18px] shrink-0 place-items-center border border-(--ink) bg-(--sheet) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--accent)"
      >
        {checked && (
          <svg viewBox="0 0 18 18" className="size-4 text-(--accent)">
            <path d="M3.5 9.5 L7.5 13.5 L15 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        )}
      </span>
      <span>{children}</span>
    </label>
  );
}

function FormError({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className={`${s.mono} mt-4 border-l-2 border-(--bad) bg-[color-mix(in_srgb,var(--bad)_7%,transparent)] px-3 py-2 text-[12.5px] text-(--bad)`}>
      {children}
    </p>
  );
}

export function ForgotNote() {
  return <p className="mt-4 text-[14px] leading-[1.5] text-(--steel)">Forgot password? Password reset arrives when our store opens; write to us meanwhile and we will help.</p>;
}

export function SignInForm({ onDone, submitLabel = "Sign in" }: { onDone?: () => void; submitLabel?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{ email?: string | null; password?: string | null; form?: string }>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next = { email: validate.email(email), password: password ? null : "Please enter your password." };
    setErr(next);
    if (next.email || next.password) return;
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) setErr({ form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-5">
        <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={err.email} required />
        <Field label="Password" name="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={err.password} required />
      </div>
      {err.form && <FormError>{err.form}</FormError>}
      <button type="submit" disabled={busy} className={`${s.btn} mt-7`}>
        {busy ? "Checking" : submitLabel}
      </button>
    </form>
  );
}

export function SignUpForm({ onDone, submitLabel = "Create account" }: { onDone?: () => void; submitLabel?: string }) {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [err, setErr] = useState<Partial<Record<keyof typeof f, string | null>> & { form?: string }>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next = { name: validate.name(f.name), email: validate.email(f.email), phone: validate.phone(f.phone), password: validate.password(f.password) };
    setErr(next);
    if (Object.values(next).some(Boolean)) return;
    setBusy(true);
    const r = await signUp({ ...f, newsletter });
    setBusy(false);
    if (!r.ok) setErr(r.field ? { [r.field]: r.error } : { form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" value={f.name} onChange={set("name")} error={err.name} className="sm:col-span-2" required />
        <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" value={f.email} onChange={set("email")} error={err.email} required />
        <Field label="Mobile" name="tel" type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={set("phone")} error={err.phone} required />
        <Field
          label="Password, 8 characters or more"
          name="new-password"
          type="password"
          autoComplete="new-password"
          value={f.password}
          onChange={set("password")}
          error={err.password}
          className="sm:col-span-2"
          required
        />
      </div>
      <div className="mt-5">
        <Tick checked={newsletter} onChange={setNewsletter}>
          Letters from the Santalum Circle, a few a year
        </Tick>
      </div>
      {err.form && <FormError>{err.form}</FormError>}
      <button type="submit" disabled={busy} className={`${s.btn} mt-7`}>
        {busy ? "Opening the file" : submitLabel}
      </button>
      <p className={`${s.mono} mt-4 text-[11.5px] leading-[1.5] text-(--steel)`}>{PREVIEW}</p>
    </form>
  );
}

/** Sign in or create an account, as two tabs of one card. */
export function AuthTabs({ onDone }: { onDone?: () => void }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const ids = useId();
  return (
    <div>
      <div role="tablist" aria-label="Account" className="flex gap-1 border-b border-(--ink)">
        {(
          [
            ["in", "Sign in"],
            ["up", "Create an account"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            role="tab"
            id={`${ids}-${k}`}
            aria-selected={tab === k}
            aria-controls={`${ids}-${k}-panel`}
            onClick={() => setTab(k)}
            className={`-mb-px rounded-t-[6px] border border-b-0 px-4 py-2.5 text-[14.5px] transition-colors ${
              tab === k ? "border-(--ink) bg-(--sheet) text-(--ink)" : "border-transparent text-(--ink-2) hover:text-(--ink)"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${ids}-${tab}-panel`} aria-labelledby={`${ids}-${tab}`} className="pt-6">
        {tab === "in" ? (
          <>
            <SignInForm onDone={onDone} submitLabel="Sign in and continue" />
            <ForgotNote />
          </>
        ) : (
          <SignUpForm onDone={onDone} submitLabel="Create account and continue" />
        )}
      </div>
    </div>
  );
}

export type AddressDraft = Omit<Address, "id">;

const EMPTY: AddressDraft = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

/** Indian delivery address, validated with the shared rules. */
export function AddressForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel,
  saveOption,
  defaultOption,
}: {
  initial?: Partial<AddressDraft>;
  onSubmit: (a: AddressDraft, save: boolean) => void;
  onCancel?: () => void;
  submitLabel: string;
  /** Checkout: offer "Save this address". */
  saveOption?: boolean;
  /** Account: offer "Use as default". */
  defaultOption?: boolean;
}) {
  const [a, setA] = useState<AddressDraft>({ ...EMPTY, ...initial });
  const [save, setSave] = useState(true);
  const [err, setErr] = useState<Partial<Record<keyof AddressDraft, string | null>>>({});
  const set = (k: keyof AddressDraft) => (e: { target: { value: string } }) => setA((x) => ({ ...x, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = {
      name: validate.name(a.name),
      phone: validate.phone(a.phone),
      line1: a.line1.trim().length >= 4 ? null : "Please enter the house and street.",
      city: a.city.trim().length >= 2 ? null : "Please enter the city.",
      state: a.state ? null : "Please choose the state.",
      pin: validate.pin(a.pin),
    };
    setErr(next);
    if (Object.values(next).some(Boolean)) return;
    onSubmit({ ...a, name: a.name.trim(), line1: a.line1.trim(), line2: a.line2?.trim() || undefined, city: a.city.trim(), pin: a.pin.trim() }, save);
  };

  return (
    <form onSubmit={submit} noValidate>
      <fieldset>
        <legend className={`${s.mono} text-[11px] text-(--steel)`}>Label</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Home", "Office", "Other"].map((l) => (
            <button key={l} type="button" aria-pressed={a.label === l} onClick={() => setA((x) => ({ ...x, label: l }))} className={s.chip}>
              {l}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Field label="Full name" name="name" autoComplete="name" value={a.name} onChange={set("name")} error={err.name} required />
        <Field label="Mobile" name="tel" type="tel" autoComplete="tel" inputMode="tel" value={a.phone} onChange={set("phone")} error={err.phone} required />
        <Field
          label="House, street"
          name="address-line1"
          autoComplete="address-line1"
          value={a.line1}
          onChange={set("line1")}
          error={err.line1}
          className="sm:col-span-2"
          required
        />
        <Field label="Area, landmark (optional)" name="address-line2" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} className="sm:col-span-2" />
        <Field label="City" name="city" autoComplete="address-level2" value={a.city} onChange={set("city")} error={err.city} required />
        <Field
          label="PIN code"
          name="postal-code"
          autoComplete="postal-code"
          inputMode="numeric"
          maxLength={6}
          value={a.pin}
          onChange={set("pin")}
          error={err.pin}
          required
        />
        <SelectField label="State" name="state" autoComplete="address-level1" value={a.state} onChange={set("state")} error={err.state} className="sm:col-span-2" required>
          <option value="" disabled>
            Select a state or union territory
          </option>
          {STATES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </SelectField>
      </div>
      {(saveOption || defaultOption) && (
        <div className="mt-5">
          {saveOption ? (
            <Tick checked={save} onChange={setSave}>
              Save this address to my account
            </Tick>
          ) : (
            <Tick checked={!!a.isDefault} onChange={(v) => setA((x) => ({ ...x, isDefault: v }))}>
              Use as my default address
            </Tick>
          )}
        </div>
      )}
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button type="submit" className={s.btn}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={s.link}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

/** An address as it reads on a shipping label. */
export function AddressLines({ a, masked = false }: { a: Omit<Address, "id" | "isDefault">; masked?: boolean }) {
  return (
    <address className="not-italic text-[15px] leading-[1.55]">
      <span className="block font-[540]">{a.name}</span>
      {masked ? (
        <span className="block text-(--ink-2)">
          {a.line1.slice(0, 3)}
          {"•".repeat(Math.min(12, Math.max(4, a.line1.length - 3)))}
        </span>
      ) : (
        <>
          <span className="block text-(--ink-2)">{a.line1}</span>
          {a.line2 && <span className="block text-(--ink-2)">{a.line2}</span>}
        </>
      )}
      <span className="block text-(--ink-2)">
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span className={`${s.mono} mt-1 block text-[12px] text-(--steel)`}>{a.phone}</span>}
    </address>
  );
}
