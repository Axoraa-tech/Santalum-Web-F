"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/** Respect prefers-reduced-motion for every motion animation in this design. */
export function MotionPrefs({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
