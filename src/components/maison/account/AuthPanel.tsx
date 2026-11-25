"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState, type FormEvent } from "react";
import { signIn, signUp, validate } from "@/lib/shop/account";
import { Check, Field, Tabs } from "../forms/Field";
import { WoodDisc } from "../Logo";
import { Pill } from "../Pill";

export type AuthTab = "signin" | "signup";

const EASE = [0.22, 1, 0.36, 1] as const;

/** One quiet line wherever an account or an order is made. */
export function PreviewNote({ className = "" }: { className?: string }) {
  return (
    <p className={`flex items-start gap-2.5 text-[13px] leading-snug text-(--mz-ink-3) ${className}`}>
      <WoodDisc className="mt-px size-3.5 shrink-0" />
      Preview: accounts and orders are saved in this browser until our store opens.
    </p>
  );
}

function focusFirstInvalid(form: HTMLFormElement) {
  requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
}

/** Sign in or create an account, as two tabs of one panel. Used on the account page and inline at checkout. */
export function AuthPanel({ initial = "signin", onDone, className = "" }: { initial?: AuthTab; onDone?: () => void; className?: string }) {
  const [tab, setTab] = useState<AuthTab>(initial);
  const id = useId().replace(/:/g, "");
  return (
    <div className={className}>
      <Tabs
        id={`auth${id}`}
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "signin", label: "Sign in" },
          { value: "signup", label: "Create account" },
        ]}
      />
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={tab}
          role="tabpanel"
          id={`auth${id}-panel-${tab}`}
          aria-labelledby={`auth${id}-tab-${tab}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="pt-6"
        >
          {tab === "signin" ? <SignInForm onDone={onDone} onSwitch={() => setTab("signup")} /> : <SignUpForm onDone={onDone} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SignInForm({ onDone, onSwitch }: { onDone?: () => void; onSwitch: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next = { email: validate.email(email), password: password ? null : "Please enter your password." };
    setErrors(next);
    if (next.email || next.password) return focusFirstInvalid(form);
    setBusy(true);
    const r = await signIn({ email, password });
    setBusy(false);
    if (!r.ok) setErrors({ form: r.error });
    else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <Field label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
      <Field
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={errors.password}
      />
      {errors.form && (
        <p role="alert" className="rounded-2xl bg-(--mz-accent-soft) px-5 py-3 text-[14px] text-(--mz-accent-deep)">
          {errors.form}{" "}
          <button type="button" onClick={onSwitch} className="underline underline-offset-4 hover:no-underline">
            Create an account instead
          </button>
        </p>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-3">
        <Pill type="submit" size="lg" disabled={busy} className="min-w-[11rem]">
          {busy ? "Signing in" : "Sign in"}
        </Pill>
        <button
          type="button"
          aria-expanded={forgot}
          onClick={() => setForgot((f) => !f)}
          className="rounded-full text-[14px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 transition-colors hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
        >
          Forgot password?
        </button>
      </div>
      <AnimatePresence initial={false}>
        {forgot && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="overflow-hidden text-[14px] leading-relaxed text-(--mz-ink-2)"
          >
            <span className="block pt-2">
              Password reset arrives when our store opens. Write to us meanwhile and we will help you back in.
            </span>
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  );
}

function SignUpForm({ onDone }: { onDone?: () => void }) {
  const [v, setV] = useState({ name: "", email: "", phone: "", password: "" });
  const [newsletter, setNewsletter] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof v | "form", string | null>>>({});
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => setV((cur) => ({ ...cur, [k]: e.target.value }));

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next = { name: validate.name(v.name), email: validate.email(v.email), phone: validate.phone(v.phone), password: validate.password(v.password) };
    setErrors(next);
    if (Object.values(next).some(Boolean)) return focusFirstInvalid(form);
    setBusy(true);
    const r = await signUp({ ...v, newsletter });
    setBusy(false);
    if (!r.ok) {
      setErrors(r.field ? { [r.field]: r.error } : { form: r.error });
      focusFirstInvalid(form);
    } else onDone?.();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <Field label="Full name" name="name" autoComplete="name" value={v.name} onChange={set("name")} error={errors.name} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Email" type="email" name="email" autoComplete="email" inputMode="email" value={v.email} onChange={set("email")} error={errors.email} />
        <Field label="Mobile" type="tel" name="tel" autoComplete="tel" inputMode="tel" value={v.phone} onChange={set("phone")} error={errors.phone} />
      </div>
      <Field
        label="Password"
        type="password"
        name="new-password"
        autoComplete="new-password"
        value={v.password}
        onChange={set("password")}
        error={errors.password}
        hint="At least 8 characters."
      />
      <Check checked={newsletter} onChange={setNewsletter} className="px-1 pt-2">
        Letters from the Santalum Circle: new batches, notes from the workshop. A few a year.
      </Check>
      {errors.form && (
        <p role="alert" className="rounded-2xl bg-(--mz-accent-soft) px-5 py-3 text-[14px] text-(--mz-accent-deep)">
          {errors.form}
        </p>
      )}
      <div className="pt-3">
        <Pill type="submit" size="lg" disabled={busy} className="min-w-[13rem]">
          {busy ? "Creating your account" : "Create account"}
        </Pill>
      </div>
      <PreviewNote className="pt-2" />
    </form>
  );
}
