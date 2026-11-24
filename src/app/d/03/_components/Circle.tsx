"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { useWood, type Wood } from "@/lib/wood";
import { useMedia } from "./bits";

const RING = 27; // a quarter mala
const EASE = [0.22, 1, 0.36, 1] as const;
type Pref = Wood | "both";

/** The Santalum Circle: letters from the workshop. A ring of twenty-seven beads turns as you pass. */
export function Circle() {
  const wood = useWood();
  const ref = useRef<HTMLElement>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const turn = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-50, 50]);
  const [pref, setPref] = useState<Pref | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const chosen: Pref = pref ?? wood;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(String(new FormData(e.currentTarget).get("email") ?? ""));
  };

  return (
    <section ref={ref} id="circle" aria-labelledby="circle-h" className="relative z-[1] px-4 pb-24 pt-16 md:px-10 md:pb-28 md:pt-20">
      <div className="mx-auto grid max-w-[1440px] items-center gap-14 md:grid-cols-12 md:gap-10">
        <div className="relative mx-auto aspect-square w-full max-w-[560px] md:col-span-6">
          <span data-knot className="absolute left-1/2 top-[7%] h-px w-px" aria-hidden />
          <motion.svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" style={{ rotate: turn }} aria-hidden>
            <circle cx="200" cy="200" r="172" fill="none" stroke="var(--thread)" strokeWidth="1.2" />
            {Array.from({ length: RING }, (_, i) => {
              const a = (i / RING) * Math.PI * 2 - Math.PI / 2;
              // rounded so server and client agree to the digit
              const x = Math.round((200 + Math.cos(a) * 172) * 100) / 100;
              const y = Math.round((200 + Math.sin(a) * 172) * 100) / 100;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="12.5" fill="var(--s3-bead)" />
                  <circle cx={x - 4} cy={y - 4.5} r="4" fill="#fff" opacity="0.32" />
                </g>
              );
            })}
          </motion.svg>
          <div className="absolute inset-[18%] grid place-items-center text-center">
            <div>
              <h2 id="circle-h" className="s3-serif text-[clamp(2.2rem,4.6vw,4.4rem)] leading-[0.95]">
                The Santalum
                <br />
                Circle
              </h2>
              <p className="mx-auto mt-4 max-w-[15rem] text-[14px] text-(--muted)">Twenty-seven beads, a quarter mala. Letters, not offers.</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <div className="bg-(--linen)">
            <p className="s3-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.15]">
              A letter from the workshop a few times a year: new pieces, the next batches, and when the Vault opens.
            </p>
            <p className="mt-4 text-[16px] leading-[1.7] text-(--ink)/75">No discounts and no daily emails. Leave whenever you like.</p>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            {done ? (
              <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} className="mt-10" role="status">
                <p className="s3-serif text-[30px] leading-tight">You are in the Circle.</p>
                <p className="mt-2 text-[15px] text-(--ink)/80">
                  The first letter goes to {done} with the next batch. This is a preview, so nothing was sent yet.
                </p>
                <button type="button" className="s3-link mt-5 text-[15px]" onClick={() => setDone(null)}>
                  Add another address
                </button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={submit} exit={{ opacity: 0, y: -8 }} className="mt-10">
                <label className="s3-field">
                  <span>Email</span>
                  <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" className="s3-input" />
                </label>
                <fieldset className="mt-6">
                  <legend className="text-[13px] text-(--muted)">Which wood should we write about?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(["red", "white", "both"] as Pref[]).map((p) => (
                      <label
                        key={p}
                        className={`flex h-11 cursor-pointer items-center gap-2.5 rounded-full border px-4 text-[15px] transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--m-accent) ${
                          chosen === p ? "border-(--ink) bg-(--warm)" : "border-(--line) hover:border-(--ink)/40"
                        }`}
                      >
                        <input type="radio" name="wood" value={p} checked={chosen === p} onChange={() => setPref(p)} className="sr-only" />
                        {p === "both" ? (
                          <span className="flex" aria-hidden>
                            <span className="s3-bead h-3.5 w-3.5" data-w="red" />
                            <span className="s3-bead -ml-1 h-3.5 w-3.5" data-w="white" />
                          </span>
                        ) : (
                          <span className="s3-bead h-3.5 w-3.5" data-w={p} aria-hidden />
                        )}
                        {p === "both" ? "Both" : p === "red" ? "Red" : "White"}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <button type="submit" className="s3-btn s3-btn-dark">
                    <span className="s3-bead s3-btn-bead" aria-hidden />
                    Join the Circle
                  </button>
                  <span className="text-[13px] text-(--muted)">Preview: sign-up is not connected yet.</span>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
