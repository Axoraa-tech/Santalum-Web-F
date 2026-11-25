"use client";

import { motion } from "motion/react";
import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { saveAddress, signIn, signUp, STATES, validate, type Address } from "@/lib/shop/account";
import { s } from "./cls";
import { cx } from "./data";
import { IconArrow, IconUser } from "./ui";

/** A labelled field in the bento's form language; the error is tied to the input. */
export function Field({ label, error, className, ...input }: { label: string; error?: string | null; className?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={className}>
      <label htmlFor={id} className={s.label}>
        {label}
      </label>
      <input id={id} className={cx(s.field, input.type === "tel" || input.inputMode === "numeric" ? s.mono : "")} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} {...input} />
      {error && (
        <p id={`${id}-e`} className="mt-1.5 text-[13px] text-[#a8322a]">
          {error}
        </p>
      )}
    </div>
  );
}

export function Check({ label, checked, onChange }: { label: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-[15px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-[18px] shrink-0 accent-[var(--b-ink)]" />
      {label}
    </label>
  );
}

/**
 * Sign in and create account as two tiles. The one you are using grows; the other folds to a
 * narrow tile you can tap to swap. The same pair sits on /account and in checkout. Compact, the
 * pair sits inside another tile and goes side by side once that tile is wide enough.
 */
export function AuthTiles({ compact = false, start = "in" }: { compact?: boolean; start?: "in" | "up" }) {
  const [mode, setMode] = useState<"in" | "up">(start);
  return (
    <div className={cx("flex flex-col gap-3", compact ? "@min-[660px]:flex-row" : "lg:flex-row")}>
      <AuthTile on={mode === "in"} title="Sign in" line="Welcome back. Your orders and wishlist are waiting." onOpen={() => setMode("in")} compact={compact}>
        <SignInForm />
      </AuthTile>
      <AuthTile on={mode === "up"} title="Create an account" line="Track orders, keep a wishlist, save addresses." onOpen={() => setMode("up")} compact={compact}>
        <SignUpForm />
      </AuthTile>
    </div>
  );
}

function AuthTile({ on, title, line, onOpen, compact, children }: { on: boolean; title: string; line: string; onOpen: () => void; compact: boolean; children: ReactNode }) {
  return (
    <motion.div
      layout
      style={{ borderRadius: 24, flexGrow: on ? 2.4 : 1 }}
      className={cx(
        "relative min-w-0 overflow-hidden",
        compact ? "@min-[660px]:basis-0" : "lg:basis-0",
        // compact tiles sit on a white or tinted tile: they are tile2, and their fields are white wells
        compact ? "b6-wells bg-[var(--b-tile2)]" : on ? "bg-[var(--b-tile)]" : "bg-accent-soft",
      )}
    >
      {on ? (
        <motion.div layout="position" className="p-5 sm:p-6" initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.12 } }}>
          <h2 className="text-[clamp(24px,3vw,32px)] font-medium leading-none tracking-[-0.035em]">{title}</h2>
          <p className={cx(s.muted, "mt-2 text-[15px]")}>{line}</p>
          <div className="mt-5">{children}</div>
        </motion.div>
      ) : (
        <button type="button" onClick={onOpen} className="group flex h-full min-h-[96px] w-full flex-col justify-between gap-4 p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent sm:p-6">
          <span className="grid size-10 place-items-center rounded-full bg-[var(--b-tile)]">
            <IconUser size={18} />
          </span>
          <span>
            <span className="flex items-center justify-between gap-3 text-[22px] font-medium leading-none tracking-[-0.03em]">
              {title}
              <IconArrow size={18} className="transition-transform duration-500 group-hover:translate-x-1" />
            </span>
            <span className={cx(s.muted, "mt-2 block text-[14px]")}>{line}</span>
          </span>
        </button>
      )}
    </motion.div>
  );
}

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) setErr(r.error);
  };
  return (
    <form onSubmit={submit} className="grid gap-3" noValidate>
      <Field label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Field label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={err} required />
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button type="submit" className={s.btn} disabled={busy}>
          {busy ? "Signing in" : "Sign in"}
        </button>
        <button type="button" onClick={() => setForgot((f) => !f)} aria-expanded={forgot} className="rounded text-[14px] text-[var(--b-muted)] underline decoration-[var(--b-line)] underline-offset-4 hover:text-[var(--b-ink)] focus-visible:outline-2 focus-visible:outline-accent">
          Forgot password?
        </button>
      </div>
      {forgot && <p className={cx(s.inner, "p-3 text-[14px]")}>Password reset arrives when our store opens; write to us meanwhile.</p>}
    </form>
  );
}

function SignUpForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [news, setNews] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.value }));
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    (["name", "email", "phone", "password"] as const).forEach((k) => {
      const m = validate[k](f[k]);
      if (m) next[k] = m;
    });
    setErrs(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const r = await signUp({ ...f, newsletter: news });
    setBusy(false);
    if (!r.ok) setErrs({ [r.field ?? "email"]: r.error });
  };
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2" noValidate>
      <Field className="sm:col-span-2" label="Full name" autoComplete="name" value={f.name} onChange={set("name")} error={errs.name} />
      <Field label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={errs.email} />
      <Field label="Mobile" type="tel" inputMode="numeric" autoComplete="tel" value={f.phone} onChange={set("phone")} error={errs.phone} />
      <Field className="sm:col-span-2" label="Password, 8 characters or more" type="password" autoComplete="new-password" value={f.password} onChange={set("password")} error={errs.password} />
      <div className="sm:col-span-2">
        <Check label="Letters from the Santalum Circle, a few a year" checked={news} onChange={setNews} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" className={s.btn} disabled={busy}>
          {busy ? "Creating" : "Create account"}
        </button>
        <p className={cx(s.muted, "text-[13px]")}>Preview: accounts and orders are saved in this browser until our store opens.</p>
      </div>
    </form>
  );
}

const EMPTY = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "Karnataka", pin: "", isDefault: false };

/** Address form. With `offerSave`, the customer can use the address once without keeping it. */
export function AddressTile({
  initial,
  onDone,
  onCancel,
  offerSave = false,
  submitLabel = "Save address",
}: {
  initial?: Address;
  onDone: (a: Address) => void;
  onCancel?: () => void;
  offerSave?: boolean;
  submitLabel?: string;
}) {
  const [a, setA] = useState({ ...EMPTY, ...initial });
  const [keep, setKeep] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const stateId = useId();
  const set = (k: keyof typeof a) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA((p) => ({ ...p, [k]: e.target.value }));
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    const n = validate.name(a.name);
    if (n) next.name = n;
    const ph = validate.phone(a.phone);
    if (ph) next.phone = ph;
    if (a.line1.trim().length < 4) next.line1 = "Please enter the house and street.";
    if (a.city.trim().length < 2) next.city = "Please enter the city.";
    const pin = validate.pin(a.pin);
    if (pin) next.pin = pin;
    setErrs(next);
    if (Object.keys(next).length) return;
    onDone(!offerSave || keep ? saveAddress(a) : { ...a, id: "once" });
  };
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-6" noValidate>
      <div className="flex gap-1.5 sm:col-span-6" role="radiogroup" aria-label="Address label">
        {["Home", "Office", "Other"].map((l) => (
          <button key={l} type="button" role="radio" aria-checked={a.label === l} onClick={() => setA((p) => ({ ...p, label: l }))} className={cx(s.chip, s.chipSm)}>
            {l}
          </button>
        ))}
      </div>
      <Field className="sm:col-span-3" label="Full name" autoComplete="name" value={a.name} onChange={set("name")} error={errs.name} />
      <Field className="sm:col-span-3" label="Mobile" type="tel" inputMode="numeric" autoComplete="tel" value={a.phone} onChange={set("phone")} error={errs.phone} />
      <Field className="sm:col-span-6" label="House, building, street" autoComplete="street-address" value={a.line1} onChange={set("line1")} error={errs.line1} />
      <Field className="sm:col-span-6" label="Area, landmark (optional)" autoComplete="address-line2" value={a.line2 ?? ""} onChange={set("line2")} />
      <Field className="sm:col-span-2" label="City" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errs.city} />
      <div className="sm:col-span-2">
        <label htmlFor={stateId} className={s.label}>
          State
        </label>
        <select id={stateId} value={a.state} onChange={set("state")} autoComplete="address-level1" className={s.field}>
          {STATES.map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
      </div>
      <Field className="sm:col-span-2" label="PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={a.pin} onChange={set("pin")} error={errs.pin} />
      <div className="flex flex-wrap items-center gap-4 sm:col-span-6">
        {offerSave && <Check label="Save this address" checked={keep} onChange={setKeep} />}
        <Check label="Use as default" checked={a.isDefault} onChange={(v) => setA((p) => ({ ...p, isDefault: v }))} />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-6">
        <button type="submit" className={s.btn}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={s.ghost} onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
