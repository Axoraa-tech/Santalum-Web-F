"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useRef, useState, type FormEvent, type ReactNode } from "react";
import { signIn, signUp, validate, type User } from "@/lib/shop/account";
import { EASE, PREVIEW_ACCOUNTS } from "./copy";
import { s } from "./cls";
import { ArrowIcon, CheckIcon, Field, Toggle } from "./ui";

/* ------------------------------------------------------------------
   Orbit's sign-in: dial steps. One question at a time; a small dial
   beside it turns from station to station as each answer is given.
   ------------------------------------------------------------------ */

/** The dial: stations around a ring, the path behind the current one filled in. Done stations take you back. */
export function StepDial({ labels, current, onPick, size = 168 }: { labels: string[]; current: number; onPick?: (i: number) => void; size?: number }) {
  const n = labels.length;
  const R = 70;
  const at = (i: number) => (n === 1 ? 0 : (i * 360) / n);
  const pos = (deg: number) => [90 + R * Math.sin((deg * Math.PI) / 180), 90 - R * Math.cos((deg * Math.PI) / 180)];
  const C = 2 * Math.PI * R;
  const frac = n === 1 ? 1 : current / n + 0.0001;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 180 180" className="absolute inset-0 size-full" aria-hidden>
        <circle cx="90" cy="90" r="86" fill="var(--o-card)" stroke="var(--o-line)" />
        <circle cx="90" cy="90" r={R} fill="none" stroke="var(--o-line)" strokeWidth="2" strokeDasharray="2 5" />
        <circle
          cx="90"
          cy="90"
          r={R}
          fill="none"
          stroke="var(--m-accent)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      {labels.map((l, i) => {
        const [x, y] = pos(at(i));
        const done = i < current;
        const on = i === current;
        return (
          <button
            key={l}
            type="button"
            disabled={!done || !onPick}
            onClick={() => onPick?.(i)}
            aria-label={done ? `Back to ${l}` : `${l}${on ? ", current step" : ""}`}
            className={`absolute grid size-[26px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full text-[12px] font-bold tabular-nums transition-[background-color,transform] duration-500 enabled:hover:scale-110 ${
              on ? "bg-[var(--m-accent)] text-white" : done ? "bg-[var(--o-ink)] text-white" : "border border-[var(--o-line)] bg-[var(--o-card)] text-[var(--o-muted)]"
            }`}
            style={{ left: `${(x / 180) * 100}%`, top: `${(y / 180) * 100}%` }}
          >
            {done ? <CheckIcon className="size-3" /> : i + 1}
          </button>
        );
      })}
      <div className="pointer-events-none absolute inset-[24%] grid place-items-center text-center">
        <div>
          <p className="text-[11px] tabular-nums text-[var(--o-muted)]">
            {current + 1} of {n}
          </p>
          <p className={`${s.syne} text-[14px] font-bold leading-tight`}>{labels[current]}</p>
        </div>
      </div>
    </div>
  );
}

function Next({ busy, last, children }: { busy?: boolean; last?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="group flex h-14 flex-1 items-center justify-between gap-5 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99] disabled:opacity-60 sm:flex-none"
    >
      {busy ? "One moment" : children}
      <span className={`grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 ${last ? "" : "group-hover:rotate-90"}`}>
        {last ? <CheckIcon className="size-4" /> : <ArrowIcon />}
      </span>
    </button>
  );
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} aria-label="Previous step" className="grid size-14 shrink-0 place-items-center rounded-full border border-[var(--o-line)] transition-colors hover:border-[var(--o-ink)] active:scale-95">
      <ArrowIcon dir="left" />
    </button>
  );
}

function PasswordInput({ id, describedBy, invalid, value, onChange, autoComplete, inputRef }: { id: string; describedBy?: string; invalid: boolean; value: string; onChange: (v: string) => void; autoComplete: string; inputRef?: React.Ref<HTMLInputElement> }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input ref={inputRef} id={id} type={show ? "text" : "password"} autoComplete={autoComplete} aria-describedby={describedBy} aria-invalid={invalid} value={value} onChange={(e) => onChange(e.target.value)} className={`${s.field} pr-20`} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 h-10 -translate-y-1/2 rounded-full px-3.5 text-[13px] font-semibold text-[var(--o-muted)] transition-colors hover:bg-[var(--o-floor)] hover:text-[var(--o-ink)]"
      >
        {show ? "Hide" : "Show"}
        <span className="sr-only"> password</span>
      </button>
    </div>
  );
}

function Alert({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="rounded-[22px] bg-[#f6dfdb] px-5 py-3 text-[14px] font-medium text-[#7d1d15]">
      {children}
    </p>
  );
}

/** The step's body slides in like the next station coming round. */
function Stage({ k, children }: { k: number; children: ReactNode }) {
  const reduced = !!useReducedMotion();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={k} initial={reduced ? { opacity: 0 } : { opacity: 0, rotate: 4, x: 24 }} animate={{ opacity: 1, rotate: 0, x: 0 }} exit={reduced ? { opacity: 0 } : { opacity: 0, rotate: -4, x: -24 }} transition={{ duration: 0.35, ease: EASE }} style={{ transformOrigin: "-40% 50%" }} className="space-y-5">
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const focusSoon = (el: { current: HTMLElement | null }) => window.setTimeout(() => el.current?.focus(), 380);

export function SignInForm({ onDone, compact = false }: { onDone?: (u: User) => void; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<{ email?: string | null; password?: string | null; form?: string | null }>({});
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const m = validate.email(email);
      setErr({ email: m });
      if (m) return emailRef.current?.focus();
      setStep(1);
      focusSoon(passRef);
      return;
    }
    if (!password) {
      setErr({ password: "Please enter your password." });
      return passRef.current?.focus();
    }
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) {
      setErr({ form: r.error });
      return passRef.current?.focus();
    }
    onDone?.(r.user);
  };

  return (
    <form onSubmit={submit} noValidate className={`grid items-start gap-6 ${compact ? "sm:grid-cols-[140px_1fr]" : "sm:grid-cols-[168px_1fr]"}`}>
      <div className="mx-auto sm:mx-0">
        <StepDial labels={["Email", "Password"]} current={step} onPick={setStep} size={compact ? 140 : 168} />
      </div>
      <div className="min-w-0">
        <Stage k={step}>
          {step === 0 ? (
            <Field label="Your email" error={err.email}>
              {(a) => <input ref={emailRef} id={a.id} type="email" autoComplete="email" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={email} onChange={(e) => setEmail(e.target.value)} className={s.field} />}
            </Field>
          ) : (
            <>
              <p className="text-[14px] text-[var(--o-muted)]">
                Signing in as <span className="font-semibold text-[var(--o-ink)]">{email}</span>
              </p>
              <Field label="Password" error={err.password}>
                {(a) => <PasswordInput id={a.id} describedBy={a.describedBy} invalid={a.invalid} value={password} onChange={setPassword} autoComplete="current-password" inputRef={passRef} />}
              </Field>
              {err.form && <Alert>{err.form}</Alert>}
            </>
          )}
        </Stage>
        <div className="mt-5 flex items-center gap-3">
          {step > 0 && <Back onClick={() => setStep(0)} />}
          <Next busy={busy} last={step === 1}>
            {step === 0 ? "Next" : "Sign in"}
          </Next>
        </div>
        <div className="mt-4">
          <button type="button" aria-expanded={forgot} onClick={() => setForgot((v) => !v)} className="text-[14px] font-semibold text-[var(--o-ink-2)] underline underline-offset-4 hover:text-[var(--o-ink)]">
            Forgot password?
          </button>
          {forgot && <p className="mt-2 text-[14px] leading-relaxed text-[var(--o-muted)]">Password reset arrives when our store opens; write to us meanwhile and we will help you back in.</p>}
        </div>
      </div>
    </form>
  );
}

const UP_STEPS = ["Name", "Contact", "Password"];

export function SignUpForm({ onDone, compact = false }: { onDone?: (u: User) => void; compact?: boolean }) {
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "", newsletter: true });
  const [err, setErr] = useState<Partial<Record<"name" | "email" | "phone" | "password" | "form", string | null>>>({});
  const [busy, setBusy] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((o) => ({ ...o, [k]: v }));
  const go = (i: number) => {
    setStep(i);
    focusSoon([nameRef, emailRef, passRef][i]);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (step === 0) {
      const m = validate.name(f.name);
      setErr({ name: m });
      if (m) return nameRef.current?.focus();
      return go(1);
    }
    if (step === 1) {
      const next = { email: validate.email(f.email), phone: validate.phone(f.phone) };
      setErr(next);
      if (next.email) return emailRef.current?.focus();
      if (next.phone) return phoneRef.current?.focus();
      return go(2);
    }
    const pm = validate.password(f.password);
    setErr({ password: pm });
    if (pm) return passRef.current?.focus();
    setBusy(true);
    const r = await signUp(f);
    setBusy(false);
    if (!r.ok) {
      if (r.field) {
        setErr({ [r.field]: r.error });
        setStep(r.field === "name" ? 0 : r.field === "password" ? 2 : 1);
      } else setErr({ form: r.error });
      return;
    }
    onDone?.(r.user);
  };

  return (
    <form onSubmit={submit} noValidate className={`grid items-start gap-6 ${compact ? "sm:grid-cols-[140px_1fr]" : "sm:grid-cols-[168px_1fr]"}`}>
      <div className="mx-auto sm:mx-0">
        <StepDial labels={UP_STEPS} current={step} onPick={setStep} size={compact ? 140 : 168} />
      </div>
      <div className="min-w-0">
        <Stage k={step}>
          {step === 0 && (
            <Field label="What should we call you?" error={err.name} hint="Your full name, as on a delivery">
              {(a) => <input ref={nameRef} id={a.id} autoComplete="name" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={f.name} onChange={(e) => set("name", e.target.value)} className={s.field} />}
            </Field>
          )}
          {step === 1 && (
            <>
              <Field label="Email" error={err.email}>
                {(a) => <input ref={emailRef} id={a.id} type="email" autoComplete="email" aria-describedby={a.describedBy} aria-invalid={a.invalid} value={f.email} onChange={(e) => set("email", e.target.value)} className={s.field} />}
              </Field>
              <Field label="Mobile number" error={err.phone} hint="Ten digits, for delivery updates">
                {(a) => (
                  <div className="relative">
                    <span aria-hidden className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[var(--o-muted)]">
                      +91
                    </span>
                    <input
                      ref={phoneRef}
                      id={a.id}
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      aria-describedby={a.describedBy}
                      aria-invalid={a.invalid}
                      value={f.phone}
                      onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
                      className={`${s.field} pl-14`}
                    />
                  </div>
                )}
              </Field>
            </>
          )}
          {step === 2 && (
            <>
              <Field label="Choose a password" error={err.password} hint="At least 8 characters">
                {(a) => <PasswordInput id={a.id} describedBy={a.describedBy} invalid={a.invalid} value={f.password} onChange={(v) => set("password", v)} autoComplete="new-password" inputRef={passRef} />}
              </Field>
              <Toggle checked={f.newsletter} onChange={(v) => set("newsletter", v)}>
                Send me letters from the Santalum Circle
              </Toggle>
              {err.form && <Alert>{err.form}</Alert>}
            </>
          )}
        </Stage>
        <div className="mt-5 flex items-center gap-3">
          {step > 0 && <Back onClick={() => setStep(step - 1)} />}
          <Next busy={busy} last={step === 2}>
            {step === 2 ? "Create account" : "Next"}
          </Next>
        </div>
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--o-muted)]">{PREVIEW_ACCOUNTS}</p>
      </div>
    </form>
  );
}

/** Sign in or create an account: two halves of one round switch, each a dial of steps. */
export function AuthPanel({ onDone, initial = "in", compact = false }: { onDone?: (u: User) => void; initial?: "in" | "up"; compact?: boolean }) {
  const [tab, setTab] = useState<"in" | "up">(initial);
  const id = useId();
  const tabs = [
    { k: "in" as const, label: "Sign in" },
    { k: "up" as const, label: "Create account" },
  ];
  return (
    <div>
      <div role="tablist" aria-label="Your account" className="inline-flex rounded-full border border-[var(--o-line)] bg-[var(--o-card)] p-1">
        {tabs.map((t) => {
          const on = tab === t.k;
          return (
            <button
              key={t.k}
              type="button"
              role="tab"
              id={`${id}-${t.k}-tab`}
              aria-selected={on}
              aria-controls={`${id}-${t.k}`}
              onClick={() => setTab(t.k)}
              onKeyDown={(e) => {
                if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                  e.preventDefault();
                  const nk = t.k === "in" ? "up" : "in";
                  setTab(nk);
                  document.getElementById(`${id}-${nk}-tab`)?.focus();
                }
              }}
              tabIndex={on ? 0 : -1}
              className={`${s.syne} relative h-11 rounded-full px-5 text-[14px] font-bold transition-colors duration-300 ${on ? "text-white" : "text-[var(--o-ink)] hover:text-[var(--m-accent)]"}`}
            >
              {on && <motion.span layoutId={`${id}-pill`} className="absolute inset-0 rounded-full bg-[var(--o-ink)]" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="relative">{t.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6" role="tabpanel" id={`${id}-${tab}`} aria-labelledby={`${id}-${tab}-tab`}>
        {tab === "in" ? <SignInForm onDone={onDone} compact={compact} /> : <SignUpForm onDone={onDone} compact={compact} />}
      </div>
    </div>
  );
}
