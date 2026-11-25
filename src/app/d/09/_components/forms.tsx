"use client";

import { motion } from "motion/react";
import { useId, useRef, useState, type FormEvent, type InputHTMLAttributes, type KeyboardEvent, type ReactNode, type SelectHTMLAttributes } from "react";
import { saveAddress, signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import s from "../styles";

/* ---------- fields: an underline, a small label, an error tied to the input ---------- */

export function Field({
  label,
  error,
  hint,
  className = "",
  ...rest
}: { label: string; error?: string | null; hint?: ReactNode; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`${s.field} ${className}`} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id} className={s.fieldLabel}>
        {label}
      </label>
      <input id={id} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...rest} />
      {hint && !error && (
        <span id={hintId} className="mt-1.5 block text-[13px] leading-snug text-[var(--muted)]">
          {hint}
        </span>
      )}
      {error && (
        <span id={errId} className={s.error}>
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
  ...rest
}: { label: string; error?: string | null; className?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div className={`${s.field} ${className}`} data-invalid={error ? "true" : undefined}>
      <label htmlFor={id} className={s.fieldLabel}>
        {label}
      </label>
      <div className="relative">
        <select id={id} aria-invalid={error ? true : undefined} aria-describedby={error ? errId : undefined} {...rest}>
          {children}
        </select>
        <svg className="pointer-events-none absolute bottom-3.5 right-1 text-[var(--muted)]" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      {error && (
        <span id={errId} className={s.error}>
          {error}
        </span>
      )}
    </div>
  );
}

/** The quiet note required on forms that save to this browser. */
export function PreviewNote({ children }: { children?: ReactNode }) {
  return (
    <p className="flex items-start gap-2.5 text-[13px] leading-[1.55] text-[var(--muted)]">
      <span aria-hidden className="mt-[0.45rem] size-1.5 shrink-0 rounded-full bg-[var(--m-accent)]" />
      <span>{children ?? "Preview: accounts and orders are saved in this browser until our store opens."}</span>
    </p>
  );
}

/** Focus the first invalid field after a failed submit. */
function focusFirstError(form: HTMLFormElement | null) {
  requestAnimationFrame(() => form?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

/* ---------- sign in / create account ---------- */

type Mode = "in" | "up";

export function AuthPanel({ initial = "in", onDone, compact = false }: { initial?: Mode; onDone?: () => void; compact?: boolean }) {
  const [mode, setMode] = useState<Mode>(initial);
  const id = useId();
  const tabs = useRef<HTMLDivElement>(null);
  const onKey = (e: KeyboardEvent) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const next: Mode = mode === "in" ? "up" : "in";
    setMode(next);
    tabs.current?.querySelector<HTMLButtonElement>(`[data-mode="${next}"]`)?.focus();
  };
  return (
    <div>
      <div ref={tabs} role="tablist" aria-label="Sign in or create an account" onKeyDown={onKey} className="flex gap-8 border-b border-[var(--hair)]">
        {(
          [
            ["in", "Sign in"],
            ["up", "Create account"],
          ] as const
        ).map(([m, label]) => (
          <button
            key={m}
            type="button"
            role="tab"
            id={`${id}-tab-${m}`}
            data-mode={m}
            aria-selected={mode === m}
            aria-controls={`${id}-panel-${m}`}
            tabIndex={mode === m ? 0 : -1}
            onClick={() => setMode(m)}
            className={s.tabBtn}
          >
            {label}
            {mode === m && (
              <motion.span
                layoutId={`${id}-sun`}
                className="absolute -bottom-[4.5px] left-0 h-[8px] w-[8px] rounded-full bg-[var(--m-accent)]"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`${id}-panel-${mode}`} aria-labelledby={`${id}-tab-${mode}`} className={compact ? "mt-7" : "mt-9"}>
        {mode === "in" ? <SignInForm onDone={onDone} onSwitch={() => setMode("up")} /> : <SignUpForm onDone={onDone} />}
      </div>
    </div>
  );
}

function SignInForm({ onDone, onSwitch }: { onDone?: () => void; onSwitch: () => void }) {
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<{ email?: string | null; password?: string | null; form?: string | null }>({});
  const [forgot, setForgot] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "");
    const password = String(d.get("password") ?? "");
    const next = { email: validate.email(email), password: password ? null : "Please enter your password." };
    if (next.email || next.password) {
      setErr(next);
      focusFirstError(form.current);
      return;
    }
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) {
      setErr({ form: r.error });
      return;
    }
    setErr({});
    onDone?.();
  };

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-7">
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={err.email} required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" error={err.password} required />
      {err.form && (
        <p role="alert" className={`${s.error} -mt-2 text-[14px]`}>
          {err.form}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="submit" disabled={busy} className={s.btn}>
          {busy ? "Signing in" : "Sign in"}
        </button>
        <button type="button" onClick={() => setForgot((f) => !f)} aria-expanded={forgot} className={s.link}>
          Forgot password?
        </button>
      </div>
      {forgot && (
        <p className="-mt-2 max-w-[28rem] text-[15px] leading-[1.6] text-[var(--muted)]">
          Password reset arrives when our store opens; write to us meanwhile and we will help you back in.
        </p>
      )}
      <p className="text-[15px] text-[var(--muted)]">
        New here?{" "}
        <button type="button" onClick={onSwitch} className={s.link}>
          Create an account
        </button>
      </p>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone?: () => void }) {
  const form = useRef<HTMLFormElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<Partial<Record<"name" | "email" | "phone" | "password" | "form", string | null>>>({});

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const input = {
      name: String(d.get("name") ?? ""),
      email: String(d.get("email") ?? ""),
      phone: String(d.get("phone") ?? ""),
      password: String(d.get("password") ?? ""),
      newsletter: d.get("newsletter") === "on",
    };
    const next = {
      name: validate.name(input.name),
      email: validate.email(input.email),
      phone: validate.phone(input.phone),
      password: validate.password(input.password),
    };
    if (Object.values(next).some(Boolean)) {
      setErr(next);
      focusFirstError(form.current);
      return;
    }
    setBusy(true);
    const r = await signUp(input);
    setBusy(false);
    if (!r.ok) {
      setErr(r.field ? { [r.field]: r.error } : { form: r.error });
      focusFirstError(form.current);
      return;
    }
    setErr({});
    onDone?.();
  };

  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-7 sm:grid-cols-2 sm:gap-x-8">
      <Field label="Full name" name="name" autoComplete="name" error={err.name} required className="sm:col-span-2" />
      <Field label="Email" name="email" type="email" autoComplete="email" inputMode="email" error={err.email} required />
      <Field label="Mobile" name="phone" type="tel" autoComplete="tel" inputMode="tel" error={err.phone} required hint="For delivery updates" />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        error={err.password}
        required
        hint="At least 8 characters"
        className="sm:col-span-2"
      />
      <label className={`${s.check} sm:col-span-2`}>
        <input type="checkbox" name="newsletter" />
        <span>Send me letters from the Santalum Circle, only when there is something to say.</span>
      </label>
      {err.form && (
        <p role="alert" className={`${s.error} text-[14px] sm:col-span-2`}>
          {err.form}
        </p>
      )}
      <div className="grid gap-4 sm:col-span-2">
        <div>
          <button type="submit" disabled={busy} className={s.btn}>
            {busy ? "Creating your account" : "Create account"}
          </button>
        </div>
        <PreviewNote />
      </div>
    </form>
  );
}

/* ---------- an Indian delivery address ---------- */

type AddrErrors = Partial<Record<"name" | "phone" | "line1" | "city" | "state" | "pin", string | null>>;

export function AddressForm({
  initial,
  defaultName = "",
  defaultPhone = "",
  submitLabel = "Save address",
  offerSave = false,
  onSaved,
  onCancel,
}: {
  initial?: Address;
  defaultName?: string;
  defaultPhone?: string;
  submitLabel?: string;
  /** Checkout: offer "Save this address"; when unticked the address is used once. */
  offerSave?: boolean;
  onSaved: (a: Omit<Address, "id"> & { id?: string }, saved: Address | null) => void;
  onCancel?: () => void;
}) {
  const form = useRef<HTMLFormElement>(null);
  const [err, setErr] = useState<AddrErrors>({});
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (k: string) => String(d.get(k) ?? "").trim();
    const a = {
      id: initial?.id,
      label: get("label") || "Home",
      name: get("name"),
      phone: get("phone"),
      line1: get("line1"),
      line2: get("line2") || undefined,
      city: get("city"),
      state: get("state"),
      pin: get("pin"),
      isDefault: d.get("isDefault") === "on" || initial?.isDefault,
    };
    const next: AddrErrors = {
      name: validate.name(a.name),
      phone: validate.phone(a.phone),
      line1: a.line1.length >= 4 ? null : "Please enter the house and street.",
      city: a.city.length >= 2 ? null : "Please enter the city.",
      state: a.state ? null : "Please choose the state.",
      pin: validate.pin(a.pin),
    };
    if (Object.values(next).some(Boolean)) {
      setErr(next);
      focusFirstError(form.current);
      return;
    }
    setErr({});
    const keep = !offerSave || d.get("save") === "on";
    onSaved(a, keep ? saveAddress(a) : null);
  };
  return (
    <form ref={form} onSubmit={submit} noValidate className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
      <Field label="Full name" name="name" autoComplete="name" defaultValue={initial?.name ?? defaultName} error={err.name} required />
      <Field label="Mobile" name="phone" type="tel" autoComplete="tel" inputMode="tel" defaultValue={initial?.phone ?? defaultPhone} error={err.phone} required />
      <Field
        label="House, building and street"
        name="line1"
        autoComplete="street-address"
        defaultValue={initial?.line1}
        error={err.line1}
        required
        className="sm:col-span-2"
      />
      <Field label="Area or landmark (optional)" name="line2" autoComplete="address-line2" defaultValue={initial?.line2} className="sm:col-span-2" />
      <Field label="City" name="city" autoComplete="address-level2" defaultValue={initial?.city} error={err.city} required />
      <Field
        label="PIN code"
        name="pin"
        autoComplete="postal-code"
        inputMode="numeric"
        maxLength={6}
        defaultValue={initial?.pin}
        error={err.pin}
        required
      />
      <SelectField label="State or union territory" name="state" autoComplete="address-level1" defaultValue={initial?.state ?? ""} error={err.state} required>
        <option value="" disabled>
          Choose
        </option>
        {STATES.map((st) => (
          <option key={st} value={st}>
            {st}
          </option>
        ))}
      </SelectField>
      <Field label="Call it" name="label" autoComplete="off" defaultValue={initial?.label ?? "Home"} hint="Home, Office, Parents" />
      <div className="flex flex-col gap-3 sm:col-span-2">
        {offerSave && (
          <label className={s.check}>
            <input type="checkbox" name="save" defaultChecked />
            <span>Save this address to my account</span>
          </label>
        )}
        {!offerSave && !initial?.isDefault && (
          <label className={s.check}>
            <input type="checkbox" name="isDefault" />
            <span>Make this my default address</span>
          </label>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 sm:col-span-2">
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

/** One address as a few plain lines. */
export function AddressLines({ a, masked = false }: { a: Omit<Address, "id" | "isDefault">; masked?: boolean }) {
  return (
    <span className="block text-[15px] leading-[1.6]">
      <span className="block">{a.name}</span>
      {masked ? (
        <span className="block text-[var(--muted)]">Street line hidden for privacy</span>
      ) : (
        <>
          <span className="block">{a.line1}</span>
          {a.line2 && <span className="block">{a.line2}</span>}
        </>
      )}
      <span className="block">
        {a.city}, {a.state} {a.pin}
      </span>
      {!masked && <span className={`${s.tab} block text-[var(--muted)]`}>{a.phone}</span>}
    </span>
  );
}
