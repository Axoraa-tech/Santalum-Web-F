"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { CONTENT } from "@/lib/shop/content";
import { WT } from "@/components/maison/W";
import k from "../k";
import { EASE, fv, measure, onFonts, wdthFor } from "./lib";

const WGHT = 820;

/**
 * Santalum Circle sign-up. The email field is the full width of the page and set huge; as the address
 * gets longer the letters condense (wdth 150 → 50) so it always stays on one line, then the size gives way.
 */
export function Circle() {
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState<string | null>(null);

  const fit = useCallback(() => {
    const el = inputRef.current;
    const box = boxRef.current;
    if (!el || !box) return;
    const vw = window.innerWidth;
    const base = vw < 768 ? vw * 0.15 : Math.min(vw * 0.115, 200);
    const text = el.value || el.placeholder;
    const avail = box.clientWidth - 6;
    const wd = wdthFor(text, avail, base, WGHT);
    let size = base;
    if (wd <= 50) {
      const w50 = measure(text, 50, WGHT, base);
      if (w50 > avail) size = (base * avail) / w50;
    }
    el.style.fontSize = `${size.toFixed(2)}px`;
    el.style.fontVariationSettings = fv(wd, WGHT);
  }, []);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || done) return;
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [fit, done]);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDone(String(new FormData(e.currentTarget).get("email") ?? ""));
  };

  return (
    <section id="circle" aria-labelledby="k10-circle" className="relative scroll-mt-12 border-t border-[var(--k10-line)] pb-[6vw] pt-10 md:pt-14">
      <div className={`${k.gut} grid grid-cols-1 gap-6 md:grid-cols-12 md:items-end`}>
        <h2 id="k10-circle" className={`${k.disp} whitespace-normal text-[13.5vw] leading-[0.82] [font-variation-settings:'wdth'_118,'wght'_860] md:whitespace-nowrap md:text-[length:clamp(40px,5vw,88px)] md:col-span-7`}>
          Santalum Circle
        </h2>
        <p className={`${k.monoL} md:col-span-4 md:col-start-9`}>
          <WT red={CONTENT.red.circle.text} white={CONTENT.white.circle.text} /> Leave whenever you like.
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {done === null ? (
          <motion.form
            key="form"
            onSubmit={submit}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: EASE }}
            className={`${k.gut} mt-10 md:mt-14`}
          >
            <label htmlFor="k10-circle-email" className={`${k.mono} text-[var(--k10-grey)]`}>
              <WT red="Your email, for word of the next red batch" white="Your email, for word of the next distillation" />
            </label>
            <div ref={boxRef} className="mt-3 border-b-2 border-[var(--k10-ink)] pb-2 transition-colors focus-within:border-[var(--k10-accent)]">
              <input
                ref={inputRef}
                id="k10-circle-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                spellCheck={false}
                placeholder="name@example.in"
                onInput={fit}
                className={`${k.giant} transition-[font-variation-settings,font-size] duration-300`}
                style={{ fontVariationSettings: fv(150, WGHT) }}
              />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-6">
              <p className={`${k.mono} max-w-[48ch] text-[var(--k10-grey)]`}>
                The Circle is a letter, not a programme: no points, no tiers. Preview: sign-ups are not connected yet.
              </p>
              <button type="submit" className={`${k.btn} w-full sm:w-auto sm:min-w-[320px]`}>
                <span className={k.btnLabel}>Join the Circle</span>
              </button>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="done"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className={`${k.gut} mt-10 md:mt-14`}
          >
            <p className={`${k.disp} text-[length:clamp(72px,13vw,230px)] leading-[0.8]`}>
              {"Thank you".split("").map((c, i) => (
                <span key={i} className={k.titleL} style={{ animationDelay: `${i * 40}ms` }}>
                  {c === " " ? " " : c}
                </span>
              ))}
            </p>
            <p className={`${k.monoL} mt-6 max-w-[60ch]`}>
              We would write to <span className="break-all">{done}</span>. Preview: sign-ups are not connected yet, so the address was not
              stored.
            </p>
            <button type="button" onClick={() => setDone(null)} className={`${k.mono} ${k.link} mt-4`}>
              Use another address
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
