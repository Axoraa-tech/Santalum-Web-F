"use client";

import { useId, useState } from "react";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Early-access sign-up. Client-side validation only; submit is a stub until
 * the e-commerce backend exists (replace `submitEmail`).
 */
async function submitEmail(email: string) {
  await new Promise((r) => setTimeout(r, 600));
  return { ok: true as const, email };
}

const TONES = {
  dark: {
    label: "text-pale/70",
    line: "border-dust/40 focus-within:border-dust",
    input: "text-linen placeholder:text-pale/40",
    button: "text-dust hover:text-linen",
    done: "text-pale/80",
    error: "text-[#e0a07a]",
  },
  light: {
    label: "text-walnut/75",
    line: "border-walnut/30 focus-within:border-rakta/70",
    input: "text-night placeholder:text-walnut/45",
    button: "text-rakta hover:text-night",
    done: "text-walnut",
    error: "text-rakta",
  },
};

export function SignupForm({ tone = "dark" }: { tone?: keyof typeof TONES }) {
  const c = TONES[tone];
  const id = useId();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return (
      <p role="status" className={`text-[17px] leading-relaxed ${c.done}`}>
        Thank you. You will be among the first to know when our doors open.
      </p>
    );
  }

  return (
    <form
      noValidate
      className="w-full max-w-md"
      onSubmit={async (e) => {
        e.preventDefault();
        const email = value.trim();
        if (!EMAIL.test(email)) {
          setError("Please enter a valid email address.");
          return;
        }
        setError("");
        setState("sending");
        await submitEmail(email);
        setState("done");
      }}
    >
      <label htmlFor={id} className={`mb-2 block text-[11px] tracking-[0.3em] uppercase ${c.label}`}>
        Be the first to know
      </label>
      <div className={`flex items-end gap-4 border-b transition-colors ${c.line}`}>
        <input
          id={id}
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="Your email address"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError("");
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`min-w-0 flex-1 bg-transparent py-2.5 text-[17px] outline-none ${c.input}`}
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className={`shrink-0 pb-2.5 font-serif text-xl italic transition-colors disabled:opacity-60 ${c.button}`}
        >
          {state === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>
      <p id={`${id}-err`} role="alert" className={`mt-1 min-h-5 text-sm ${c.error}`}>
        {error}
      </p>
    </form>
  );
}
