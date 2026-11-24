"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

/** Santalum Circle sign-up as one pill. Front-end only until the backend exists. */
export function CircleSignup({ className = "" }: { className?: string }) {
  const [done, setDone] = useState(false);
  const id = useId();
  return (
    <form
      className={`relative h-14 w-full max-w-md ${className}`}
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.p
            key="done"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-14 items-center gap-3 rounded-full bg-paper px-5 text-[15px]"
            role="status"
          >
            <span className="grid size-7 place-items-center rounded-full bg-accent text-paper">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                <path d="m5 12.5 4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            You&rsquo;re in. We&rsquo;ll write before the doors open.
          </motion.p>
        ) : (
          <motion.div key="form" exit={{ opacity: 0, y: -8 }} className="flex h-14 items-center rounded-full bg-paper pl-5 pr-1.5 ring-1 ring-hair focus-within:ring-ink/30">
            <label htmlFor={id} className="sr-only">
              Email address
            </label>
            <input
              id={id}
              type="email"
              required
              autoComplete="email"
              placeholder="Your email"
              className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-3"
            />
            <button
              type="submit"
              aria-label="Join the Santalum Circle"
              className="grid size-11 place-items-center rounded-full bg-ink text-paper transition-[background-color,transform] duration-300 hover:bg-accent active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
                <path d="M5 12h13m-5-5 5 5-5 5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
