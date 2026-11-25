"use client";

import { useState, type FormEvent } from "react";
import { signIn, signUp, validate } from "@/lib/shop/account";
import { Field, PreviewNote } from "./bits";

type Errors = Partial<Record<"name" | "email" | "phone" | "password" | "form", string>>;

/** Sign in with email and password. */
export function SignInForm({ onDone, idPrefix = "si" }: { onDone?: () => void; idPrefix?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    const em = validate.email(email);
    if (em) next.email = em;
    if (!password) next.password = "Please enter your password.";
    setErr(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) setErr({ form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Sign in" className="grid gap-4">
      <Field label="Email" error={err.email}>
        {(a) => (
          <input {...a} name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="s3-input" />
        )}
      </Field>
      <Field label="Password" error={err.password}>
        {(a) => (
          <input
            {...a}
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="s3-input"
          />
        )}
      </Field>
      {err.form && (
        <p role="alert" className="s3-err -mt-1">
          {err.form}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <button type="submit" className="s3-btn s3-btn-dark" disabled={busy}>
          <span className="s3-bead s3-btn-bead" aria-hidden />
          {busy ? "Signing in" : "Sign in"}
        </button>
        <button
          type="button"
          className="s3-link text-[15px]"
          aria-expanded={forgot}
          aria-controls={`${idPrefix}-forgot`}
          onClick={() => setForgot((f) => !f)}
        >
          Forgot password?
        </button>
      </div>
      {forgot && (
        <p id={`${idPrefix}-forgot`} className="text-[15px] leading-[1.55] text-(--muted)">
          Password reset arrives when our store opens; write to us meanwhile and we will help.
        </p>
      )}
    </form>
  );
}

/** Create an account: name, email, mobile, password, and the Circle letters if wanted. */
export function SignUpForm({ onDone }: { onDone?: () => void }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [newsletter, setNewsletter] = useState(false);
  const [err, setErr] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((s) => ({ ...s, [k]: e.target.value }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Errors = {};
    for (const f of ["name", "email", "phone", "password"] as const) {
      const m = validate[f](v[f]);
      if (m) next[f] = m;
    }
    setErr(next);
    if (Object.keys(next).length) return;
    setBusy(true);
    const r = await signUp({ ...v, newsletter });
    setBusy(false);
    if (!r.ok) setErr(r.field ? { [r.field]: r.error } : { form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate aria-label="Create an account" className="grid gap-4 sm:grid-cols-2">
      <Field label="Full name" error={err.name} className="sm:col-span-2">
        {(a) => <input {...a} name="name" autoComplete="name" value={v.name} onChange={set("name")} className="s3-input" />}
      </Field>
      <Field label="Email" error={err.email}>
        {(a) => <input {...a} name="email" type="email" autoComplete="email" value={v.email} onChange={set("email")} className="s3-input" />}
      </Field>
      <Field label="Mobile number" error={err.phone}>
        {(a) => (
          <input {...a} name="tel" type="tel" inputMode="tel" autoComplete="tel" value={v.phone} onChange={set("phone")} className="s3-input" />
        )}
      </Field>
      <Field label="Password" error={err.password} hint="At least 8 characters." className="sm:col-span-2">
        {(a) => (
          <input
            {...a}
            name="new-password"
            type="password"
            autoComplete="new-password"
            value={v.password}
            onChange={set("password")}
            className="s3-input"
          />
        )}
      </Field>
      <label className="s3-check sm:col-span-2">
        <input type="checkbox" checked={newsletter} onChange={(e) => setNewsletter(e.target.checked)} />
        <span>
          Letters from the Santalum Circle
          <span className="block text-[14px] text-(--muted)">A few a year: new batches, and first word on the Vault and the Reserve.</span>
        </span>
      </label>
      {err.form && (
        <p role="alert" className="s3-err sm:col-span-2">
          {err.form}
        </p>
      )}
      <div className="flex flex-col gap-4 sm:col-span-2">
        <button type="submit" className="s3-btn s3-btn-dark self-start" disabled={busy}>
          <span className="s3-bead s3-btn-bead" aria-hidden />
          {busy ? "Creating your account" : "Create account"}
        </button>
        <PreviewNote />
      </div>
    </form>
  );
}

/**
 * Sign in or create an account: two beads on a thread choose the form. On wide screens (when `panes`)
 * both forms sit side by side with a thread between them.
 */
export function AuthChoice({ onDone, panes = false }: { onDone?: () => void; panes?: boolean }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const tabs = (
    <div role="tablist" aria-label="Sign in or create an account" className={`relative flex items-center gap-8 ${panes ? "md:hidden" : ""}`}>
      <span className="absolute left-2 right-2 top-1/2 h-px bg-(--thread)" aria-hidden />
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
          aria-selected={tab === k}
          onClick={() => setTab(k)}
          className="relative flex items-center gap-2.5 bg-(--linen) pr-3 text-[16px] transition-colors aria-selected:text-(--ink) aria-[selected=false]:text-(--muted) hover:text-(--ink)"
        >
          <span
            className={`block rounded-full transition-transform duration-500 ${tab === k ? "s3-bead h-4 w-4" : "h-3 w-3 border border-(--thread) bg-(--linen)"}`}
            aria-hidden
          />
          {label}
        </button>
      ))}
    </div>
  );
  if (panes) {
    return (
      <div>
        {tabs}
        <div className="mt-8 grid gap-12 md:mt-0 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,1.25fr)] md:gap-12 lg:gap-16">
          <section aria-labelledby="pane-in" className={tab === "in" ? "" : "hidden md:block"}>
            <h2 id="pane-in" className="s3-serif text-[34px] leading-none md:text-[40px]">
              Sign in
            </h2>
            <p className="mb-6 mt-3 text-[16px] text-(--ink)/75">Your orders, tracking, addresses and the pieces you saved.</p>
            <SignInForm onDone={onDone} idPrefix="pane" />
          </section>
          <span className="relative hidden bg-(--thread) md:block" aria-hidden>
            <span className="s3-knot absolute left-1/2 top-24 -translate-x-1/2" />
          </span>
          <section aria-labelledby="pane-up" className={tab === "up" ? "" : "hidden md:block"}>
            <h2 id="pane-up" className="s3-serif text-[34px] leading-none md:text-[40px]">
              Create an account
            </h2>
            <p className="mb-6 mt-3 text-[16px] text-(--ink)/75">One account for both woods. You need it to place an order, so we can tell you where it is.</p>
            <SignUpForm onDone={onDone} />
          </section>
        </div>
      </div>
    );
  }
  return (
    <div>
      {tabs}
      <div className="mt-6" role="tabpanel">
        {tab === "in" ? <SignInForm onDone={onDone} /> : <SignUpForm onDone={onDone} />}
      </div>
    </div>
  );
}
