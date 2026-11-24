"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { isReduced, setLenis } from "./lib";

/** Lenis smoothing, so the scroll-driven type axes move without stepping. Off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (isReduced()) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.11 });
    setLenis(l);
    return () => {
      setLenis(null);
      l.destroy();
    };
  }, []);
  return null;
}
