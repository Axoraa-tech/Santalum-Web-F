"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { setLenis } from "./store";

/** Smooth, weighted scrolling (off for reduced motion) and motion defaults for the whole design. */
export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.08, anchors: true });
    setLenis(l);
    return () => {
      l.destroy();
      setLenis(null);
    };
  }, []);
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
