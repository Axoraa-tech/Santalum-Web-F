"use client";

import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { useRef, useState, type FormEvent } from "react";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { s } from "./cx";
import { EASE } from "./data";

const HOLES = 24;
const r3 = (n: number) => Math.round(n * 1000) / 1000;

/** The Santalum Circle (the Maison's letters), drawn as a lathe index plate that turns with the page. */
export function Circle() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const rotate = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  const [sent, setSent] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setSent(String(data.get("email") ?? ""));
  };

  return (
    <section ref={ref} id="circle" className="relative scroll-mt-14 overflow-hidden border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-28 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] items-center gap-14 lg:grid-cols-12">
        <div className="relative mx-auto aspect-square w-[min(88vw,520px)] lg:col-span-5">
          <motion.svg style={{ rotate }} viewBox="0 0 200 200" className="absolute inset-0 size-full text-(--ink)" aria-hidden>
            <circle cx="100" cy="100" r="98" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="0.4" strokeDasharray="1.5 2" opacity="0.6" />
            {Array.from({ length: HOLES }, (_, i) => {
              const a = (i / HOLES) * Math.PI * 2 - Math.PI / 2;
              return (
                <g key={i}>
                  <circle
                    cx={r3(100 + Math.cos(a) * 86)}
                    cy={r3(100 + Math.sin(a) * 86)}
                    r={i === 0 ? 3.6 : 2.6}
                    fill={i === 0 ? "var(--m-accent)" : "var(--paper)"}
                    stroke="currentColor"
                    strokeWidth="0.6"
                  />
                  <line
                    x1={r3(100 + Math.cos(a) * 93)}
                    y1={r3(100 + Math.sin(a) * 93)}
                    x2={r3(100 + Math.cos(a) * 98)}
                    y2={r3(100 + Math.sin(a) * 98)}
                    stroke="currentColor"
                    strokeWidth="0.6"
                  />
                </g>
              );
            })}
            <circle cx="100" cy="100" r="56" fill="none" stroke="currentColor" strokeWidth="0.6" />
            <path d="M0 100 H200 M100 0 V200" stroke="currentColor" strokeWidth="0.4" strokeDasharray="6 2 1 2" opacity="0.5" />
          </motion.svg>
          <div className="absolute inset-[31%] grid place-items-center rounded-full bg-(--paper) text-center shadow-[0_0_0_1px_var(--hair-2)]">
            <p className={`${s.x125} text-[clamp(1.1rem,2.2vw,1.6rem)] font-[620] leading-[0.95] tracking-[-0.01em]`}>
              Santalum
              <br />
              Circle
            </p>
          </div>
          <p className={`${s.mono} absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] text-(--steel)`}>
            <WT red={`Index plate, ${HOLES} divisions`} white={`Brass index plate, ${HOLES} divisions`} />
          </p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <W
            red={
              <>
                <h2 className={`${s.x125} text-[clamp(2.4rem,5vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>
                  Letters from
                  <br />
                  the turning floor
                </h2>
                <p className="mt-6 max-w-[32rem] text-[16px] leading-[1.6] text-(--ink-2) md:text-[17px]">
                  {CONTENT.red.circle.text} A few letters a year, with care notes for what you already hold.
                </p>
              </>
            }
            white={
              <>
                <h2 className={`${s.x125} text-[clamp(2.4rem,5vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>
                  Letters from
                  <br />
                  the still
                </h2>
                <p className="mt-6 max-w-[32rem] text-[16px] leading-[1.6] text-(--ink-2) md:text-[17px]">
                  {CONTENT.white.circle.text} A few letters a year, never more.
                </p>
              </>
            }
          />

          <AnimatePresence mode="wait" initial={false}>
            {sent === null ? (
              <motion.form
                key="form"
                onSubmit={submit}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="mt-10 max-w-[32rem]"
              >
                <label className={s.field}>
                  <input name="email" type="email" required autoComplete="email" placeholder=" " />
                  <span>Email</span>
                </label>
                <fieldset className="mt-6">
                  <legend className={`${s.mono} text-[11.5px] text-(--steel)`}>Write to me about</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["Red sandalwood", "White sandalwood", "Both woods"].map((w, i) => (
                      <label key={w} className="cursor-pointer">
                        <input type="radio" name="interest" value={w} defaultChecked={i === 2} className="peer sr-only" />
                        <span
                          className={`${s.mono} inline-flex h-9 items-center rounded-full border border-(--hair-2) px-4 text-[12px] transition-colors hover:border-(--ink) peer-checked:border-(--ink) peer-checked:bg-(--ink) peer-checked:text-(--paper) peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-(--m-accent)`}
                        >
                          {w}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="mt-8 flex flex-wrap items-center gap-5">
                  <button type="submit" className={s.btn}>
                    Join the Circle
                  </button>
                  <span className="text-[14px] text-(--steel)">
                    <WT red="Preview: nothing is sent yet." white="Preview: no letters go out yet." />
                  </span>
                </div>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-10 max-w-[32rem] border-t border-(--ink) pt-5"
                role="status"
              >
                <p className="text-[20px] leading-snug">You are in the Circle.</p>
                <p className="mt-2 text-[15px] text-(--ink-2)">
                  The next letter goes to <span className={s.mono}>{sent}</span>. This is a preview, so nothing has been sent.
                </p>
                <button type="button" onClick={() => setSent(null)} className={`${s.link} mt-5`}>
                  Use another address
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
