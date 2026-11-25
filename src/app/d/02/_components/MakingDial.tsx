"use client";

import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { W, WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { EASE, MAKING_LINES } from "./copy";
import { s } from "./cls";
import { scrollToY } from "./store";

/** Each wood has its own five steps (red is turned; white is seasoned, distilled or carved). */
const RED = CONTENT.red.making.map((m, i) => ({ ...m, ...MAKING_LINES.red[i] }));
const WHITE = CONTENT.white.making.map((m, i) => ({ ...m, ...MAKING_LINES.white[i] }));
const N = RED.length;
const STEP_DEG = 360 / N;
const TICKS = Array.from({ length: 120 }, (_, i) => i);

/** Each step dwells at the top of the dial for a while before the dial turns on to the next. */
function dwell(v: number) {
  const i = Math.floor(v);
  const f = v - i;
  const t = Math.min(1, Math.max(0, (f - 0.28) / 0.44));
  return Math.min(N - 1, i + t * t * (3 - 2 * t));
}

/** A dial with the five making steps around it. Scrolling turns it so the current step sits at the top. */
export function MakingDial() {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const raw = useTransform(scrollYProgress, [0.03, 0.95], [0, N - 1], { clamp: true });
  const stepped = useTransform(raw, dwell);
  const smooth = useSpring(stepped, { stiffness: 120, damping: 22, mass: 0.8 });
  const v = reduced ? stepped : smooth;
  const dialRot = useTransform(v, (x) => -x * STEP_DEG);
  const counter = useTransform(v, (x) => x * STEP_DEG);
  const photoScale = useTransform(scrollYProgress, [0, 1], [1.18, 1]);
  const [step, setStep] = useState(0);
  useMotionValueEvent(raw, "change", (x) => setStep(Math.min(N - 1, Math.max(0, Math.round(x)))));

  const goTo = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    scrollToY(top + (0.03 + (i / (N - 1)) * 0.92) * travel + 2);
  };

  return (
    <section id="making" ref={ref} className="relative bg-[var(--o-bg)]" style={{ height: "430svh" }}>
      <div className="sticky top-0 flex h-svh min-h-[640px] flex-col overflow-hidden px-5 pt-24 md:px-10 md:pt-0 lg:flex-row lg:items-center">
        {/* dial */}
        <div className="relative mx-auto aspect-square w-[min(88vw,46svh)] shrink-0 md:w-[min(70vw,56svh)] lg:mx-0 lg:ml-[2vw] lg:w-[min(46vw,82svh,760px)]">
          {/* fixed pointer at twelve o'clock */}
          <div aria-hidden className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
            <div className="h-0 w-0 border-x-[9px] border-t-[14px] border-x-transparent border-t-[var(--m-accent)]" />
          </div>
          <motion.div className="absolute inset-0" style={{ rotate: dialRot }}>
            <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden>
              <circle cx="200" cy="200" r="198" fill="none" stroke="var(--o-line)" />
              <circle cx="200" cy="200" r="150" fill="none" stroke="var(--o-line)" />
              {TICKS.map((i) => {
                const major = i % 24 === 0;
                const mid = i % 6 === 0;
                return (
                  <line
                    key={i}
                    x1="200"
                    y1={major ? 4 : 8}
                    x2="200"
                    y2={major ? 22 : mid ? 17 : 13}
                    stroke={major ? "var(--o-ink)" : "rgb(25 23 20 / 0.35)"}
                    strokeWidth={major ? 2 : 1}
                    transform={`rotate(${i * 3} 200 200)`}
                  />
                );
              })}
            </svg>
            {RED.map((st, i) => {
              const a = (i * STEP_DEG * Math.PI) / 180;
              const r = 38.5;
              const on = i === step;
              return (
                <div key={st.title} className="absolute" style={{ left: `${(50 + Math.sin(a) * r).toFixed(2)}%`, top: `${(50 - Math.cos(a) * r).toFixed(2)}%` }}>
                  <motion.div style={{ rotate: counter }} className="-translate-x-1/2 -translate-y-1/2">
                    <div className={`flex flex-col items-center transition-[opacity,transform] duration-500 ${on ? "scale-110 opacity-100" : "opacity-45"}`}>
                      <span className={`grid size-7 place-items-center rounded-full text-[12px] font-bold tabular-nums transition-colors duration-500 md:size-8 ${on ? "bg-[var(--o-ink)] text-white" : "border border-[var(--o-line)] bg-[var(--o-bg)]"}`}>
                        {i + 1}
                      </span>
                      <span className={`${s.syne} mt-1 whitespace-nowrap rounded-full bg-[var(--o-bg)] px-2 text-[14px] font-bold tracking-[-0.02em] md:text-[18px]`}>
                        <WT red={st.title} white={WHITE[i].title} />
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </motion.div>
          {/* centre: the carver at work */}
          <div className="absolute inset-[26%] overflow-hidden rounded-full bg-[var(--o-floor)] shadow-[0_30px_60px_-30px_rgb(25_23_20/0.6)]">
            <motion.div className="absolute inset-0" style={{ scale: reduced ? 1 : photoScale }}>
              <W red={<Photo p={PHOTOS.carving} sizes="(min-width: 1024px) 30vw, 50vw" />} white={<Photo p={PHOTOS.oilHands} sizes="(min-width: 1024px) 30vw, 50vw" />} />
            </motion.div>
          </div>
        </div>

        {/* the current step */}
        <div className="relative mx-auto mt-6 w-full max-w-[560px] flex-1 lg:ml-[6vw] lg:mt-0 lg:max-w-[600px]">
          <p className="hidden text-[15px] text-[var(--o-muted)] lg:block">
            <WT red="How a red piece is turned" white="How the fragrance is kept" />
          </p>
          <div className="relative mt-2 min-h-[260px] md:min-h-[300px] lg:min-h-[420px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={step}
                className="absolute inset-x-0 top-0"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -40 }}
                transition={{ duration: 0.55, ease: EASE }}
              >
                <p className="text-[14px] font-semibold tabular-nums text-[var(--m-accent)]">
                  Step {step + 1} of {N}
                </p>
                <h2 className={`${s.display} mt-2 text-[clamp(2.8rem,5.4vw,6.4rem)]`}>
                  <WT red={RED[step].title} white={WHITE[step].title} />
                </h2>
                <p className={`${s.syne} mt-4 text-[clamp(1.15rem,1.8vw,1.6rem)] font-semibold leading-snug tracking-[-0.02em]`}>
                  <WT red={RED[step].line} white={WHITE[step].line} />
                </p>
                <div className="mt-5 flex items-start gap-5">
                  <div className="relative hidden size-[92px] shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)] sm:block">
                    <W
                      red={<Photo p={RED[step].photo} tone={RED[step].tone} sizes="92px" />}
                      white={<Photo p={WHITE[step].photo} tone={WHITE[step].tone} sizes="92px" />}
                    />
                  </div>
                  <p className="max-w-[440px] text-[16px] leading-relaxed text-[var(--o-ink-2)]">
                    <WT red={RED[step].text} white={WHITE[step].text} />
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
          <ol className="mt-4 hidden items-start gap-3 lg:flex" aria-label="The five steps">
            {RED.map((st, i) => {
              const on = i === step;
              return (
                <li key={st.title}>
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-current={on ? "step" : undefined}
                    className="group flex w-[84px] flex-col items-center gap-2 text-center"
                  >
                    <span
                      className={`relative block size-[68px] overflow-hidden rounded-full bg-[var(--o-floor)] transition-[box-shadow,transform] duration-500 group-hover:scale-105 ${
                        on ? "shadow-[0_0_0_2px_var(--o-bg),0_0_0_4px_var(--m-accent)]" : "opacity-70 grayscale-[0.4]"
                      }`}
                    >
                      <W red={<Photo p={st.photo} tone={st.tone} sizes="68px" />} white={<Photo p={WHITE[i].photo} tone={WHITE[i].tone} sizes="68px" />} />
                    </span>
                    <span className={`${s.syne} text-[13px] font-bold leading-tight ${on ? "text-[var(--o-ink)]" : "text-[var(--o-muted)]"}`}>
                      {i + 1}. <WT red={st.title} white={WHITE[i].title} />
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
