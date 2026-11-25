"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { saveAddress, signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import { IconArrow, IconCheck } from "./Icons";
import { EASE } from "./store";

export const PREVIEW_LINE = "Preview: accounts and orders are saved in this browser until our store opens.";

/* ---------- fields: index cards with the label on a divider tab (styles in s7.css) ---------- */

type SlipProps = { label: string; hint?: string; error?: string | null; optional?: boolean; className?: string };

function Slip({
  fid,
  label,
  hint,
  error,
  optional,
  className = "",
  children,
}: SlipProps & { fid: string; children: ReactNode }) {
  return (
    <div className={`s7-slip ${className}`} data-invalid={error ? "" : undefined}>
      <div className="s7-slip-body">
        <label htmlFor={fid} className="s7-slip-tab">
          <span className="truncate">{label}</span>
          {optional && <span className="font-normal opacity-70">optional</span>}
        </label>
        <div className="s7-slip-card">{children}</div>
      </div>
      {error ? (
        <span id={`${fid}-err`} className="s7-slip-note s7-err">
          {error}
        </span>
      ) : hint ? (
        <span id={`${fid}-hint`} className="s7-slip-note">
          {hint}
        </span>
      ) : null}
    </div>
  );
}

const describedBy = (fid: string, error?: string | null, hint?: string) => (error ? `${fid}-err` : hint ? `${fid}-hint` : undefined);

type FieldProps = SlipProps & InputHTMLAttributes<HTMLInputElement>;

export function Field({ label, hint, error, optional, className, id, ...rest }: FieldProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Slip fid={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <input id={fid} className="s7-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, error, hint)} {...rest} />
    </Slip>
  );
}

export function AreaField({ label, hint, error, optional, className, id, ...rest }: SlipProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Slip fid={fid} label={label} hint={hint} error={error} optional={optional} className={className}>
      <textarea id={fid} className="s7-input resize-none" aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, error, hint)} {...rest} />
    </Slip>
  );
}

export function SelectField({
  label,
  error,
  className,
  children,
  id,
  ...rest
}: { label: string; error?: string | null; className?: string; children: ReactNode } & SelectHTMLAttributes<HTMLSelectElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Slip fid={fid} label={label} error={error} className={className}>
      <select id={fid} className="s7-input" aria-invalid={error ? true : undefined} aria-describedby={describedBy(fid, error)} {...rest}>
        {children}
      </select>
    </Slip>
  );
}

export function Submit({ children, busy, className = "" }: { children: ReactNode; busy?: boolean; className?: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className={`group inline-flex h-12 items-center gap-3 justify-self-start rounded-full bg-(--s7-ink) pl-6 pr-2 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98] disabled:cursor-wait disabled:opacity-70 ${className}`}
    >
      {children}
      <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
        <IconArrow width={16} height={16} />
      </span>
    </button>
  );
}

/** A yes/no: a small card dropped onto a pile when it is on. */
export function Check({ checked, onChange, label, sub }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode; sub?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-4 rounded-[20px] bg-(--s7-slip) px-4 py-3.5 shadow-[inset_0_0_0_1px_var(--s7-line)] transition hover:shadow-[inset_0_0_0_1px_color-mix(in_oklab,var(--s7-ink)_28%,transparent)]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span className="s7-tick mt-0.5" aria-hidden>
        <span className="s7-tick-under" />
        <span className="s7-tick-top">
          <IconCheck width={14} height={14} strokeWidth={2.4} />
        </span>
      </span>
      <span>
        <span className="block text-[15px] font-medium">{label}</span>
        {sub && <span className="mt-0.5 block text-[14px] leading-snug text-(--s7-muted)">{sub}</span>}
      </span>
    </label>
  );
}

/** One choice of several: a card in a small hand. Its number sits in the corner like a playing card's index. */
export function Deal({
  name,
  n,
  checked,
  onChange,
  disabled,
  children,
}: {
  name: string;
  n: number;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="s7-deal" data-on={checked ? "" : undefined} data-off={disabled ? "" : undefined}>
      <input type="radio" name={name} checked={checked} onChange={onChange} disabled={disabled} className="sr-only" />
      <span className="s7-deal-index" aria-hidden>
        <span>{String(n).padStart(2, "0")}</span>
        <span className="s7-deal-pip" />
      </span>
      {children}
    </label>
  );
}

/* ---------- tabs that look like index cards in a file: the chosen one comes to the front ---------- */

export function CardTabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
  tint = "var(--s7-surface)",
  children,
}: {
  tabs: { id: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  tint?: string;
  children: ReactNode;
}) {
  const base = useId();
  return (
    <div>
      <div role="tablist" aria-label={label} className="s7-noscroll relative z-[1] -mb-px flex items-end gap-1 overflow-x-auto px-3 md:px-5">
        {tabs.map((t, i) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel`}
              tabIndex={on ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => {
                const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                if (!d) return;
                e.preventDefault();
                const next = tabs[(i + d + tabs.length) % tabs.length];
                onChange(next.id);
                document.getElementById(`${base}-tab-${next.id}`)?.focus();
              }}
              className={`relative shrink-0 whitespace-nowrap rounded-t-[20px] px-4 text-[14.5px] font-medium transition-[height,background-color,color] duration-300 md:px-6 md:text-[15px] ${
                on ? "h-12 text-(--s7-ink)" : "h-10 bg-(--s7-ink)/[0.06] text-(--s7-muted) hover:h-11 hover:text-(--s7-ink)"
              }`}
              style={on ? { backgroundColor: tint } : undefined}
            >
              {t.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${base}-panel`}
        aria-labelledby={`${base}-tab-${value}`}
        className={`relative rounded-[28px] shadow-[0_24px_60px_-40px_rgba(27,23,18,0.55)] md:rounded-[36px] ${tint === "var(--s7-surface)" ? "s7-on-surface" : "s7-on-page"}`}
        style={{ backgroundColor: tint }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------- sign in / create account ---------- */

export function AuthPanel({ onDone, initial = "signin", tint }: { onDone?: () => void; initial?: "signin" | "signup"; tint?: string }) {
  const [mode, setMode] = useState<"signin" | "signup">(initial);
  return (
    <CardTabs
      label="Your account"
      tint={tint}
      value={mode}
      onChange={setMode}
      tabs={[
        { id: "signin", label: "Sign in" },
        { id: "signup", label: "Create an account" },
      ]}
    >
      <div className="p-5 md:p-8">{mode === "signin" ? <SignInForm onDone={onDone} onSwitch={() => setMode("signup")} /> : <SignUpForm onDone={onDone} onSwitch={() => setMode("signin")} />}</div>
    </CardTabs>
  );
}

type Errs = Partial<Record<"name" | "email" | "phone" | "password" | "form", string>>;

function SignInForm({ onDone, onSwitch }: { onDone?: () => void; onSwitch: () => void }) {
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const email = String(d.get("email") ?? "");
    const password = String(d.get("password") ?? "");
    const next: Errs = {};
    const ee = validate.email(email);
    if (ee) next.email = ee;
    if (!password) next.password = "Please enter your password.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) setErrs({ form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required error={errs.email} />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required error={errs.password} />
      {errs.form && (
        <p role="alert" className="rounded-[16px] bg-[#a3261e]/8 px-4 py-3 text-[14.5px] text-[#a3261e]">
          {errs.form}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Submit busy={busy}>{busy ? "Signing in" : "Sign in"}</Submit>
        <button type="button" onClick={onSwitch} className="text-[14.5px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4 transition hover:decoration-(--s7-ink)">
          New here? Create an account
        </button>
      </div>
      <details className="group rounded-[16px] bg-(--s7-slip) px-4 py-3 text-[14.5px]">
        <summary className="cursor-pointer list-none font-medium transition hover:text-(--s7-accent) [&::-webkit-details-marker]:hidden">Forgot password?</summary>
        <p className="mt-2 leading-relaxed text-(--s7-muted)">Password reset arrives when our store opens; write to us meanwhile and we will help you back in.</p>
      </details>
    </form>
  );
}

function SignUpForm({ onDone, onSwitch }: { onDone?: () => void; onSwitch: () => void }) {
  const [errs, setErrs] = useState<Errs>({});
  const [busy, setBusy] = useState(false);
  const [letters, setLetters] = useState(true);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const input = {
      name: String(d.get("name") ?? ""),
      email: String(d.get("email") ?? ""),
      phone: String(d.get("phone") ?? ""),
      password: String(d.get("password") ?? ""),
    };
    const next: Errs = {};
    for (const f of ["name", "email", "phone", "password"] as const) {
      const err = validate[f](input[f]);
      if (err) next[f] = err;
    }
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const r = await signUp({ ...input, newsletter: letters });
    setBusy(false);
    if (!r.ok) setErrs(r.field ? { [r.field]: r.error } : { form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <Field label="Full name" name="name" autoComplete="name" required error={errs.name} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" autoComplete="email" required error={errs.email} />
        <Field label="Mobile" name="phone" type="tel" inputMode="tel" autoComplete="tel" required hint="For the courier. Ten digits." error={errs.phone} />
      </div>
      <Field label="Password" name="password" type="password" autoComplete="new-password" required hint="At least 8 characters." error={errs.password} />
      <Check checked={letters} onChange={setLetters} label="Letters from the Santalum Circle" sub="A few times a year, when a batch is recorded or an edition number comes back." />
      {errs.form && (
        <p role="alert" className="rounded-[16px] bg-[#a3261e]/8 px-4 py-3 text-[14.5px] text-[#a3261e]">
          {errs.form}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-4">
        <Submit busy={busy}>{busy ? "Creating" : "Create account"}</Submit>
        <button type="button" onClick={onSwitch} className="text-[14.5px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4 transition hover:decoration-(--s7-ink)">
          Have an account? Sign in
        </button>
      </div>
      <p className="text-[13.5px] text-(--s7-muted)">{PREVIEW_LINE}</p>
    </form>
  );
}

/* ---------- address ---------- */

export type AddressInput = Omit<Address, "id" | "isDefault">;
type AddrErrs = Partial<Record<"name" | "phone" | "line1" | "city" | "state" | "pin", string>>;

export function readAddress(form: HTMLFormElement): { value: AddressInput; errors: AddrErrs } {
  const d = new FormData(form);
  const s = (k: string) => String(d.get(k) ?? "").trim();
  const value: AddressInput = {
    label: s("label") || "Home",
    name: s("name"),
    phone: s("phone"),
    line1: s("line1"),
    line2: s("line2") || undefined,
    city: s("city"),
    state: s("state"),
    pin: s("pin"),
  };
  const errors: AddrErrs = {};
  const n = validate.name(value.name);
  if (n) errors.name = n;
  const p = validate.phone(value.phone);
  if (p) errors.phone = p;
  if (value.line1.length < 3) errors.line1 = "Please enter the house and street.";
  if (value.city.length < 2) errors.city = "Please enter the city.";
  if (!value.state) errors.state = "Please choose the state.";
  const pin = validate.pin(value.pin);
  if (pin) errors.pin = pin;
  return { value, errors };
}

/** The address fields. Used inside a parent form (checkout) or on its own with a submit (account). */
export function AddressFields({ value, errors = {} }: { value?: Partial<AddressInput>; errors?: AddrErrs }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-[0.6fr_1fr]">
        <Field label="Label" name="label" placeholder="Home, Office" defaultValue={value?.label} optional autoComplete="off" />
        <Field label="Full name" name="name" autoComplete="name" required defaultValue={value?.name} error={errors.name} />
      </div>
      <Field label="Mobile" name="phone" type="tel" inputMode="tel" autoComplete="tel" required defaultValue={value?.phone} error={errors.phone} hint="The courier calls this number." />
      <Field label="House, street" name="line1" autoComplete="address-line1" required defaultValue={value?.line1} error={errors.line1} />
      <Field label="Area, landmark" name="line2" autoComplete="address-line2" optional defaultValue={value?.line2} />
      <div className="grid gap-4 sm:grid-cols-[1.2fr_1.2fr_0.9fr]">
        <Field label="City" name="city" autoComplete="address-level2" required defaultValue={value?.city} error={errors.city} />
        <SelectField label="State" name="state" required defaultValue={value?.state ?? ""} autoComplete="address-level1" error={errors.state}>
          <option value="" disabled>
            Choose a state
          </option>
          {STATES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </SelectField>
        <Field label="PIN code" name="pin" inputMode="numeric" autoComplete="postal-code" maxLength={6} required defaultValue={value?.pin} error={errors.pin} />
      </div>
    </div>
  );
}

/** Add or edit a saved address (account page). */
export function AddressEditor({ address, onDone, onCancel }: { address?: Address; onDone: () => void; onCancel: () => void }) {
  const [errors, setErrors] = useState<AddrErrs>({});
  const [isDefault, setIsDefault] = useState(!!address?.isDefault);
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { value, errors: errs } = readAddress(e.currentTarget);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    saveAddress({ ...value, id: address?.id, isDefault });
    onDone();
  };
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <AddressFields value={address} errors={errors} />
      <Check checked={isDefault} onChange={setIsDefault} label="Use this address by default" />
      <div className="flex flex-wrap items-center gap-3">
        <Submit>{address ? "Save the address" : "Add the address"}</Submit>
        <button type="button" onClick={onCancel} className="h-12 rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/15 transition hover:bg-(--s7-page)">
          Cancel
        </button>
      </div>
    </form>
  );
}

export const addressLine = (a: Pick<Address, "line1" | "line2" | "city" | "state" | "pin">) =>
  [a.line1, a.line2, a.city, `${a.state} ${a.pin}`].filter(Boolean).join(", ");
