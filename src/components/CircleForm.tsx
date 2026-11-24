"use client";

import { useId, useState } from "react";

/**
 * "Join the Santalum Circle" sign-up (client asked to never call it a loyalty programme).
 * Front-end only for now: nothing is sent anywhere until the backend exists.
 * tone "auto" follows the Maison's current wood colours.
 */
export function CircleForm({
  tone = "dark",
  className = "",
  label = "Join the Santalum Circle for private previews",
}: {
  tone?: "dark" | "light" | "auto";
  className?: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);
  const id = useId();

  const styles = {
    dark: {
      text: "text-linen",
      muted: "text-pale/60",
      line: "border-dust/40 focus-within:border-dust",
      ph: "placeholder:text-pale/40",
      btn: "text-dust hover:text-linen",
    },
    light: {
      text: "text-night",
      muted: "text-walnut/80",
      line: "border-walnut/40 focus-within:border-walnut",
      ph: "placeholder:text-walnut/50",
      btn: "text-rakta hover:text-night",
    },
    auto: {
      text: "text-ink",
      muted: "text-mute",
      line: "border-rule focus-within:border-accent",
      ph: "placeholder:text-mute/70",
      btn: "text-accent hover:text-ink",
    },
  }[tone];

  if (done) {
    return (
      <p className={`max-w-sm text-[17px] leading-relaxed ${styles.muted} ${className}`} role="status">
        Thank you. You will hear from us before the doors open.
      </p>
    );
  }

  return (
    <form
      className={`w-full max-w-sm ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor={id} className={`mb-3 block text-sm tracking-[0.12em] ${styles.muted}`}>
        {label}
      </label>
      <div className={`flex items-end gap-4 border-b ${styles.line} transition-colors`}>
        <input
          id={id}
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className={`min-w-0 flex-1 bg-transparent py-2 text-[17px] outline-none ${styles.text} ${styles.ph}`}
        />
        <button type="submit" className={`shrink-0 pb-2 font-serif text-lg italic transition-colors ${styles.btn}`}>
          Join
        </button>
      </div>
    </form>
  );
}
