"use client";

import { motion } from "motion/react";
import { useState, type CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, STEPS } from "./data";
import { views } from "./store";
import { Corner } from "./ui";

const COPY: Record<Wood, { title: string; text: string; label: string }> = {
  red: {
    title: "How a piece is turned",
    text: "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
    label: "Read how a red sandalwood piece is turned",
  },
  white: {
    title: "How the oil and the carving are made",
    text: "The scent decides. Only heartwood goes to the still or to the carver, and every batch of oil is tested before it is bottled.",
    label: "Read how white sandalwood oil and carving are made",
  },
};

/**
 * The five making steps of one wood (they differ: red is turned, white is distilled or carved).
 * The current step's ring fills, then the next takes over and the photograph cross-fades.
 * Hovering anywhere on the row pauses it (CSS animation-play-state).
 */
export function CraftBento({ wood }: { wood: Wood }) {
  const [step, setStep] = useState(0);
  const steps = STEPS[wood];
  const id = `craft-ph-${wood}`;
  const open = () => views.open({ kind: "story", id: "craft", from: id, img: true });

  return (
    <div className={cx(s.bento, s.craft, s.pausable)}>
      <motion.div layoutId={id} style={{ gridArea: "ph", borderRadius: 28 }} className={cx(s.tile, s.t2, s.opener, "min-h-[440px]")}>
        <motion.div layoutId={`${id}-img`} className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
          {steps.map((st, i) => {
            const sh = st.shot;
            return (
              <div
                key={st.name}
                className="absolute inset-0 transition-opacity duration-[900ms] ease-[cubic-bezier(.22,1,.36,1)]"
                style={{ opacity: i === step ? 1 : 0 }}
                aria-hidden={i !== step}
              >
                <div
                  className={cx(
                    "absolute inset-0 transition-transform duration-[6s] ease-out motion-reduce:scale-100 motion-reduce:transition-none",
                    i === step ? "scale-[1.07]" : "scale-100",
                  )}
                >
                  <Photo p={sh.photo} tone={sh.tone} sizes="(min-width:1024px) 50vw, 100vw" />
                </div>
              </div>
            );
          })}
        </motion.div>

        <span className={cx(s.mono, "pointer-events-none absolute left-3 top-3 z-[3] rounded-full bg-[var(--b-tile)] px-3 py-1.5 text-[10.5px]")}>
          Step {step + 1} of {steps.length}, {steps[step].name.toLowerCase()}
        </span>
        <Corner icon="expand" />
        <button type="button" className={s.hit} onClick={open} aria-label={COPY[wood].label} />

        <motion.div
          layout="position"
          className="pointer-events-none absolute bottom-2 left-2 z-[3] w-[min(520px,calc(100%-16px))] rounded-[20px] bg-[var(--b-tile)] p-5 sm:p-6"
        >
          <h2 className="text-[clamp(24px,5.2cqw,40px)] font-medium leading-[1] tracking-[-0.04em]">{COPY[wood].title}</h2>
          <p className="mt-3 text-[16px] leading-[1.5] text-[var(--b-ink2)]">{COPY[wood].text}</p>
        </motion.div>
      </motion.div>

      {steps.map((st, i) => {
        const on = i === step;
        return (
          <button
            key={st.name}
            type="button"
            onClick={() => setStep(i)}
            aria-pressed={on}
            aria-label={`Step ${i + 1}, ${st.name}: ${st.line}`}
            style={{ gridArea: `s${i + 1}` }}
            className={cx(
              s.tile,
              on && s.tint,
              "group flex min-h-[170px] flex-col p-4 text-left transition-[background-color] duration-500 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-accent active:scale-[0.99] sm:p-5",
            )}
          >
            <span className="flex w-full items-center justify-between">
              <span className="relative grid size-11 place-items-center">
                <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
                  <circle cx="22" cy="22" r="19.5" fill="none" stroke="var(--b-line)" strokeWidth="2.5" />
                  {on && (
                    <circle
                      key={`${step}-${wood}`}
                      cx="22"
                      cy="22"
                      r="19.5"
                      fill="none"
                      stroke="var(--m-accent)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      pathLength={100}
                      className={s.ring}
                      style={{ "--dur": "5.2s" } as CSSProperties}
                      onAnimationEnd={() => setStep((n) => (n + 1) % steps.length)}
                    />
                  )}
                </svg>
                <span className={cx(s.mono, "relative text-[13px]")}>{i + 1}</span>
              </span>
              <span className={cx(s.mono, "text-[10.5px] transition-opacity duration-300", on ? "opacity-70" : "opacity-0 group-hover:opacity-50")}>
                {on ? "Now" : "Show"}
              </span>
            </span>
            <span className="mt-auto block pt-6 text-[clamp(22px,10cqw,36px)] font-medium leading-none tracking-[-0.04em] transition-transform duration-500 group-hover:translate-x-1">
              {st.name}
            </span>
            <span className={cx(s.muted, "mt-2 block text-[14px] leading-[1.4]")}>{st.line}</span>
          </button>
        );
      })}
    </div>
  );
}
