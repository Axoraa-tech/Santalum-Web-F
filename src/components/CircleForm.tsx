"use client";

import { useState } from "react";

/**
 * "Join the Santalum Circle" sign-up (client asked to never call it a loyalty programme).
 * Front-end only for now: nothing is sent anywhere until the backend exists.
 */
export function CircleForm({ tone = "dark", className = "" }: { tone?: "dark" | "light"; className?: string }) {
  const [done, setDone] = useState(false);
  const dark = tone === "dark";

  const text = dark ? "text-linen" : "text-night";
  const muted = dark ? "text-pale/60" : "text-walnut/80";
  const line = dark ? "border-dust/40 focus:border-dust" : "border-walnut/40 focus:border-walnut";
  const placeholder = dark ? "placeholder:text-pale/40" : "placeholder:text-walnut/50";

  if (done) {
    return (
      <p className={`max-w-sm text-[17px] leading-relaxed ${muted} ${className}`} role="status">
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
      <label htmlFor="circle-email" className={`mb-3 block text-sm tracking-[0.12em] ${muted}`}>
        Join the Santalum Circle for private previews
      </label>
      <div className={`flex items-end gap-4 border-b ${line} transition-colors`}>
        <input
          id="circle-email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className={`min-w-0 flex-1 bg-transparent py-2 text-[17px] outline-none ${text} ${placeholder}`}
        />
        <button
          type="submit"
          className={`shrink-0 pb-2 font-serif text-lg italic ${dark ? "text-dust hover:text-linen" : "text-rakta hover:text-night"} transition-colors`}
        >
          Join
        </button>
      </div>
    </form>
  );
}
