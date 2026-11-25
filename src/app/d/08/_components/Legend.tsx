"use client";

import { useId, useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { STATES, saveAddress, signIn, signUp, validate, type Address } from "@/lib/shop/account";
import { NOTES } from "../_lib/copy";
import { PinGlyph } from "./Pins";
import { s } from "./styles";

/**
 * Atlas forms are map legends: a ruled box, each field a key on the legend, errors pencilled
 * in the margin. Sign-in, sign-up and addresses all use them.
 */

export function LegendBox({ title, aside, children, className = "" }: { title: string; aside?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <div className={`relative border border-(--a-ink) bg-(--a-card) p-1 ${className}`}>
      <div className="border border-(--a-line-2) p-4 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b-2 border-(--a-ink) pb-2">
          <p className={`${s.serif} text-[24px] leading-[1.05]`}>{title}</p>
          {aside && <span className="shrink-0 text-[14px] text-(--a-muted)">{aside}</span>}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

/** One key of the legend: a short rule and dot, the label, the field, and its pencilled error. */
export function Key({ label, error, hint, children, id }: { label: string; error?: string | null; hint?: string; children: ReactNode; id: string }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="flex items-center gap-2 text-[15px] text-(--a-ink-2)">
        <span className="h-px w-4 bg-(--a-ink)" aria-hidden />
        <span className="size-1.5 rounded-full bg-(--a-accent)" aria-hidden />
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-e`} className="text-[14px] italic text-[#b3261e]">
          {error}
        </p>
      ) : hint ? (
        <p className="text-[13.5px] text-(--a-muted)">{hint}</p>
      ) : null}
    </div>
  );
}

export function KeyInput({ label, error, hint, ...input }: { label: string; error?: string | null; hint?: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <Key label={label} error={error} hint={hint} id={id}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-e` : undefined} className={s.field} {...input} />
    </Key>
  );
}

type Field = "name" | "email" | "phone" | "password";

/** Sign in or create an account, as two keys of one legend. `narrow` stacks the two keys for a slim column. */
export function AuthLegend({ title = "Sign in to the Maison", start = "in", narrow = false }: { title?: string; start?: "in" | "up"; narrow?: boolean }) {
  const [mode, setMode] = useState<"in" | "up">(start);
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", newsletter: false });
  const [errs, setErrs] = useState<Partial<Record<Field, string>>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((p) => ({ ...p, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const fe = (k: Field) => errs[k] ?? null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    // every empty or wrong key is pencilled in at once, not one per try
    const fields: Field[] = mode === "in" ? ["email"] : ["name", "email", "phone", "password"];
    const found: Partial<Record<Field, string>> = {};
    for (const k of fields) {
      const m = validate[k](f[k]);
      if (m) found[k] = m;
    }
    if (mode === "in" && !f.password) found.password = "Please enter your password.";
    setErrs(found);
    setGeneral(null);
    if (Object.keys(found).length) return;
    setBusy(true);
    const r = mode === "in" ? await signIn({ email: f.email, password: f.password }) : await signUp(f);
    setBusy(false);
    if (r.ok) return;
    if (r.field) setErrs({ [r.field]: r.error });
    else setGeneral(r.error);
  }

  return (
    <LegendBox title={title} aside={narrow ? undefined : mode === "in" ? "Returning" : "New here"}>
      <div role="tablist" aria-label="Account" className={`grid gap-2 ${narrow ? "grid-cols-1" : "grid-cols-2"}`}>
        {(["in", "up"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => (setMode(m), setErrs({}), setGeneral(null))}
            className={`flex items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left text-[15px] transition-colors ${mode === m ? "border-(--a-ink) bg-(--a-paper)" : "border-(--a-line-2) hover:border-(--a-ink)"}`}
          >
            <PinGlyph color="var(--a-accent)" filled={mode === m} className="h-6 w-[18px] shrink-0" />
            <span>
              <span className="block font-medium">{m === "in" ? "Sign in" : "Create an account"}</span>
              <span className="block text-[13px] text-(--a-muted)">{m === "in" ? "You have been here" : "Orders, tracking, wishlist"}</span>
            </span>
          </button>
        ))}
      </div>
      <form onSubmit={submit} noValidate className="mt-5 grid gap-4" role="tabpanel">
        {mode === "up" && <KeyInput label="Full name" autoComplete="name" value={f.name} onChange={set("name")} error={fe("name")} />}
        <KeyInput label="Email" type="email" autoComplete="email" value={f.email} onChange={set("email")} error={fe("email")} />
        {mode === "up" && <KeyInput label="Mobile number" type="tel" autoComplete="tel" inputMode="tel" value={f.phone} onChange={set("phone")} error={fe("phone")} hint="Ten digits, for delivery updates" />}
        <KeyInput
          label="Password"
          type="password"
          autoComplete={mode === "in" ? "current-password" : "new-password"}
          value={f.password}
          onChange={set("password")}
          error={fe("password")}
          hint={mode === "up" ? "At least 8 characters" : undefined}
        />
        {mode === "up" && (
          <label className="flex items-start gap-3 text-[15px]">
            <input type="checkbox" checked={f.newsletter} onChange={set("newsletter")} className={`${s.check} mt-0.5 size-5`} />
            <span>Letters from the Santalum Circle, now and then</span>
          </label>
        )}
        {general && (
          <p role="alert" className="text-[14px] italic text-[#b3261e]">
            {general}
          </p>
        )}
        <button type="submit" disabled={busy} className={`${s.btn} ${s.btnInk} h-12 text-[16px] font-medium`}>
          {busy ? "One moment" : mode === "in" ? "Sign in" : "Create the account"}
        </button>
        {mode === "in" ? (
          <p className="text-[14px] text-(--a-muted)">Forgot password? Password reset arrives when our store opens; write to us meanwhile.</p>
        ) : (
          <p className="text-[14px] text-(--a-muted)">{NOTES.preview}</p>
        )}
      </form>
    </LegendBox>
  );
}

const EMPTY = { label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pin: "" };

/** An address, entered as the keys of a legend. Saved to the account unless the visitor says not to. */
export function AddressLegend({
  initial,
  prefill,
  onDone,
  onCancel,
  submitLabel = "Save address",
  offerSave = false,
}: {
  initial?: Address;
  /** Name and mobile already known from the account, so they are not typed twice. */
  prefill?: { name?: string; phone?: string };
  onDone: (a: Address, saved: boolean) => void;
  onCancel?: () => void;
  submitLabel?: string;
  offerSave?: boolean;
}) {
  const [a, setA] = useState({ ...EMPTY, ...prefill, ...initial });
  const [keep, setKeep] = useState(true);
  const [errs, setErrs] = useState<Record<string, string>>({});
  const sid = useId();
  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setA((p) => ({ ...p, [k]: e.target.value }));
  function submit(e: FormEvent) {
    e.preventDefault();
    const x: Record<string, string> = {};
    const n = validate.name(a.name);
    const p = validate.phone(a.phone);
    const pin = validate.pin(a.pin);
    if (n) x.name = n;
    if (p) x.phone = p;
    if (pin) x.pin = pin;
    if (!a.line1.trim()) x.line1 = "Please enter the house and street.";
    if (!a.city.trim()) x.city = "Please enter the city or town.";
    if (!a.state) x.state = "Please choose the state.";
    setErrs(x);
    if (Object.keys(x).length) return;
    const clean = { ...a, line2: a.line2 || undefined, isDefault: initial?.isDefault };
    if (!offerSave || keep) onDone(saveAddress(clean), true);
    else onDone({ ...clean, id: "once" } as Address, false);
  }
  return (
    <form onSubmit={submit} noValidate className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <KeyInput label="Full name" autoComplete="name" value={a.name} onChange={set("name")} error={errs.name} />
        <KeyInput label="Mobile number" type="tel" autoComplete="tel" value={a.phone} onChange={set("phone")} error={errs.phone} />
      </div>
      <KeyInput label="House, street" autoComplete="address-line1" value={a.line1} onChange={set("line1")} error={errs.line1} />
      <KeyInput label="Area, landmark (optional)" autoComplete="address-line2" value={a.line2} onChange={set("line2")} />
      <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
        <KeyInput label="City or town" autoComplete="address-level2" value={a.city} onChange={set("city")} error={errs.city} />
        <KeyInput label="PIN code" inputMode="numeric" maxLength={6} autoComplete="postal-code" value={a.pin} onChange={set("pin")} error={errs.pin} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_0.8fr]">
        <Key label="State or union territory" id={sid} error={errs.state}>
          <select id={sid} value={a.state} onChange={set("state")} autoComplete="address-level1" aria-invalid={!!errs.state} aria-describedby={errs.state ? `${sid}-e` : undefined} className={s.field}>
            <option value="">Choose</option>
            {STATES.map((st) => (
              <option key={st}>{st}</option>
            ))}
          </select>
        </Key>
        <KeyInput label="Label" value={a.label} onChange={set("label")} placeholder="Home, Office" />
      </div>
      {offerSave && (
        <label className="flex items-center gap-3 text-[15px]">
          <input type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} className={`${s.check} size-5`} />
          Save this address to my account
        </label>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={`${s.btn} ${s.btnInk} h-12 px-6 text-[15px] font-medium`}>
          {submitLabel}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={`${s.link} text-[15px]`}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
