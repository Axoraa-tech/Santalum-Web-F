"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Weighted, smooth page scrolling (off for people who prefer reduced motion). */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.09, anchors: { offset: -96 } });
    return () => lenis.destroy();
  }, []);
  return null;
}
