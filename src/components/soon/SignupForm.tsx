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

export function SignupForm() {
  const id = useId();
  const [value, setValue] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  if (state === "done") {
    return (
      <p role="status" className="text-[17px] leading-relaxed text-pale/80">
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
      <label htmlFor={id} className="mb-3 block text-[13px] tracking-[0.18em] text-pale/70 uppercase">
        Be the first to know
      </label>
      <div className="flex items-end gap-4 border-b border-dust/40 transition-colors focus-within:border-dust">
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
          className="min-w-0 flex-1 bg-transparent py-2.5 text-[17px] text-linen outline-none placeholder:text-pale/40"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="shrink-0 pb-2.5 font-serif text-xl italic text-dust transition-colors hover:text-linen disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Notify me"}
        </button>
      </div>
      <p id={`${id}-err`} role="alert" className="mt-2 min-h-5 text-sm text-[#e0a07a]">
        {error}
      </p>
    </form>
  );
}
