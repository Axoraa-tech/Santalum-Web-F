"use client";

import { motion, useScroll, useTransform, type MotionStyle, type MotionValue } from "motion/react";
import { useRef, type CSSProperties } from "react";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { MAKING_DEK, MAKING_PHOTOS, sectionNo } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

const RED = CONTENT.red.making;
const WHITE = CONTENT.white.making;
const N = RED.length;

function StepText({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const a = i / N;
  const b = (i + 1) / N;
  const fill = useTransform(progress, [a, b], [0, 1]);
  const lit = useTransform(progress, [a - 0.02, a + 0.06], [0, 1], { clamp: true });
  return (
    <li className="x5-step" style={{ "--k": i } as CSSProperties}>
      <span className="x5-stepRule" aria-hidden>
        <motion.span className="x5-stepFill" style={{ scaleX: fill }} />
      </span>
      <motion.span className="x5-stepN" style={{ "--lit": lit } as unknown as MotionStyle} aria-hidden>
        {i + 1}
      </motion.span>
      <h3 className="x5-stepName">
        <WT red={RED[i].title} white={WHITE[i].title} />
      </h3>
      <p className="x5-stepText">
        <WT red={RED[i].text} white={WHITE[i].text} />
      </p>
    </li>
  );
}

function StepPhoto({ i, progress }: { i: number; progress: MotionValue<number> }) {
  const a = i / N;
  const opacity = useTransform(progress, [a - 0.04, a + 0.06], [0.38, 1]);
  const scale = useTransform(progress, [a - 0.04, a + 0.2], [1.12, 1]);
  const red = MAKING_PHOTOS.red[i];
  const white = MAKING_PHOTOS.white[i];
  return (
    <figure className="x5-bandFig">
      <motion.div className="x5-bandFrame" style={{ opacity }}>
        <motion.div className="x5-bandImg" style={{ scale }}>
          <WPhoto red={red} white={white} sizes="(min-width: 768px) 18vw, 60vw" />
        </motion.div>
      </motion.div>
      <figcaption className="x5-caption">
        <b>Fig. {8 + i}</b>
        <span>
          <WT red={red.caption} white={white.caption} />
        </span>
      </figcaption>
    </figure>
  );
}

/** Five steps of the current wood set as a typographic sequence down the grid, lit in turn as the page scrolls. */
export function Making() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.75", "end 0.55"] });

  return (
    <section id="making" className="x5-section" aria-labelledby="making-title">
      <Head
        id="making-title"
        n={sectionNo("making")}
        title={
          <WT
            red={
              <>
                At the
                <br />
                lathe
              </>
            }
            white={
              <>
                Still and
                <br />
                bench
              </>
            }
          />
        }
        meta="Figures 8 to 12"
        dek={
          <p>
            <WT red={MAKING_DEK.red} white={MAKING_DEK.white} />
          </p>
        }
      />
      <div ref={ref}>
        <ol className="x5-steps">
          {RED.map((s, i) => (
            <StepText key={s.title} i={i} progress={scrollYProgress} />
          ))}
        </ol>
        <div className="x5-band">
          {RED.map((s, i) => (
            <StepPhoto key={s.title} i={i} progress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
