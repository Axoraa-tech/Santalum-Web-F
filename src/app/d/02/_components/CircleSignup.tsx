"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { EASE } from "./copy";
import { s } from "./cls";
import { ArrowIcon, CheckIcon } from "./ui";

const RINGS = [1, 2, 3, 4, 5, 6, 7];

/** The Santalum Circle: occasional letters. A pill field; on joining, a ring travels out from it. */
export function CircleSignup() {
  const reduced = !!useReducedMotion();
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState<string | null>(null);
  const [pulse, setPulse] = useState(0);

  return (
    <section id="circle" className="relative overflow-hidden bg-[var(--o-bg)] px-5 py-24 md:px-10 md:py-32">
      {/* concentric rings centred on the field */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-[58%] -translate-x-1/2 -translate-y-1/2 md:top-1/2">
        {RINGS.map((r) => (
          <span
            key={r}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--o-line)]"
            style={{ width: r * 190, height: r * 190, opacity: 1 - r * 0.1 }}
          />
        ))}
        <AnimatePresence>
          {pulse > 0 && !reduced && (
            <motion.span
              key={pulse}
              className="absolute left-1/2 top-1/2 size-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--m-accent)]"
              initial={{ scale: 0.6, opacity: 1 }}
              animate={{ scale: 8, opacity: 0 }}
              transition={{ duration: 1.8, ease: EASE }}
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative mx-auto flex max-w-[1100px] flex-col items-center text-center">
        <h2 className={`${s.display} text-[clamp(2.4rem,7vw,7rem)]`}>The Santalum Circle</h2>
        <p className="mt-6 max-w-[560px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">
          <WT red={CONTENT.red.circle.text} white={CONTENT.white.circle.text} />
        </p>

        <div className="mt-10 w-full max-w-[560px]">
          <AnimatePresence mode="wait" initial={false}>
            {joined ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="flex items-center gap-4 rounded-full bg-[var(--o-ink)] p-2 pr-7 text-left text-white"
                role="status"
              >
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-[var(--m-accent)]">
                  <CheckIcon className="size-5" />
                </span>
                <span className="text-[15px] leading-snug">
                  You are in the Circle. The next <WT red="workshop letter" white="letter on fragrance and ritual" /> goes to <span className="font-semibold">{joined}</span>.
                </span>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                exit={{ opacity: 0, scale: 0.98 }}
                onSubmit={(e) => {
                  e.preventDefault();
                  setJoined(email.trim());
                  setPulse((p) => p + 1);
                }}
                className="group flex items-center rounded-full border border-[var(--o-line)] bg-white p-2 shadow-[0_24px_60px_-30px_rgb(25_23_20/0.45)] transition-[border-color,box-shadow] focus-within:border-[var(--o-ink)] focus-within:shadow-[0_0_0_4px_var(--m-accent-soft)]"
              >
                <label htmlFor="o2-circle-email" className="sr-only">
                  Email address
                </label>
                <input
                  id="o2-circle-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 min-w-0 flex-1 bg-transparent px-5 text-[16px] text-[var(--o-ink)] outline-none placeholder:text-[var(--o-muted)]"
                />
                <button
                  type="submit"
                  className={`${s.syne} flex h-12 shrink-0 items-center gap-2 rounded-full bg-[var(--o-ink)] pl-5 pr-1.5 text-[15px] font-bold text-white transition-colors hover:bg-black active:scale-95`}
                >
                  Join
                  <span className="grid size-9 place-items-center rounded-full bg-[var(--m-accent)]">
                    <ArrowIcon className="size-4" />
                  </span>
                </button>
              </motion.form>
            )}
          </AnimatePresence>
          <p className="mt-4 text-[14px] text-[var(--o-muted)]">
            <WT red="A few letters a year, when the lathe has something to show. Leave whenever you like." white="A few letters a year, when the still has something to show. Leave whenever you like." />
          </p>
        </div>
      </div>
    </section>
  );
}
