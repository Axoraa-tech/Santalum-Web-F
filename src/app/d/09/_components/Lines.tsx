"use client";

import { motion, useInView } from "motion/react";
import { useRef, type ReactNode } from "react";
import s from "../styles";
import { EASE } from "./data";

/** A heading that rises into view line by line, each line behind its own mask. */
export function Lines({
  lines,
  as: Tag = "h2",
  className = "",
  delay = 0,
  id,
}: {
  lines: ReactNode[];
  as?: "h1" | "h2" | "h3";
  className?: string;
  delay?: number;
  id?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  return (
    <div ref={ref}>
      <Tag id={id} className={className}>
        {lines.map((line, i) => (
          <span key={i} className={s.line}>
            <motion.span
              className={s.lineIn}
              initial={{ y: "112%" }}
              animate={inView ? { y: "0%" } : undefined}
              transition={{ duration: 1.15, ease: EASE, delay: delay + i * 0.11 }}
            >
              {line}
            </motion.span>
          </span>
        ))}
      </Tag>
    </div>
  );
}
