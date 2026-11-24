"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { sectionNo, STEPS, type Step } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

const N = STEPS.length;

function StepText({ step, i, progress }: { step: Step; i: number; progress: MotionValue<number> }) {
  const a = i / N;
  const b = (i + 1) / N;
  const fill = useTransform(progress, [a, b], [0, 1]);
  const color = useTransform(progress, [a - 0.02, a + 0.06], ["#c9c8c2", "#111111"]);
  return (
    <li className="x5-step" style={{ "--k": i } as CSSProperties}>
      <span className="x5-stepRule" aria-hidden>
        <motion.span className="x5-stepFill" style={{ scaleX: fill }} />
      </span>
      <motion.span className="x5-stepN" style={{ color }} aria-hidden>
        {i + 1}
      </motion.span>
      <h3 className="x5-stepName">{step.name}</h3>
      <p className="x5-stepText">{step.text}</p>
    </li>
  );
}

function StepPhoto({ step, i, progress }: { step: Step; i: number; progress: MotionValue<number> }) {
  const a = i / N;
  const opacity = useTransform(progress, [a - 0.04, a + 0.06], [0.38, 1]);
  const scale = useTransform(progress, [a - 0.04, a + 0.2], [1.12, 1]);
  return (
    <figure className="x5-bandFig">
      <motion.div className="x5-bandFrame" style={{ opacity }}>
        <motion.div className="x5-bandImg" style={{ scale }}>
          <WPhoto red={step.photo.red} white={step.photo.white} sizes="(min-width: 768px) 18vw, 60vw" />
        </motion.div>
      </motion.div>
      <figcaption className="x5-caption">
        <b>Fig. {8 + i}</b>
        {step.caption}
      </figcaption>
    </figure>
  );
}

/** Five steps set as a typographic sequence that steps down the grid, lit in turn as the page scrolls. */
export function Making() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });

  return (
    <section id="making" className="x5-section" aria-labelledby="making-title">
      <Head
        id="making-title"
        n={sectionNo("making")}
        title="Making"
        meta="Figures 8 to 12"
        dek={
          <p>
            Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become.
            The hand follows.
          </p>
        }
      />
      <div ref={ref}>
        <ol className="x5-steps">
          {STEPS.map((s, i) => (
            <StepText key={s.name} step={s} i={i} progress={scrollYProgress} />
          ))}
        </ol>
        <div className="x5-band">
          {STEPS.map((s, i) => (
            <StepPhoto key={s.name} step={s} i={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
