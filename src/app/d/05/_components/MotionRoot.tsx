"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Respects prefers-reduced-motion for every motion component in the design. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
