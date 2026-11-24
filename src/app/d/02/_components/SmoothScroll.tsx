"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "./store";

/** Smooth wheel scrolling (it also makes the pinned ring turn smoothly). Off for reduced motion. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.1 });
    setLenis(l);
    return () => {
      setLenis(null);
      l.destroy();
    };
  }, []);
  return null;
}
