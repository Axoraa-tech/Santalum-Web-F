"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { setLenis } from "./store";

/** Soft wheel scrolling so the deck turns smoothly. Off for reduced motion. */
export function Smooth() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.085, wheelMultiplier: 0.95 });
    setLenis(l);
    return () => {
      setLenis(null);
      l.destroy();
    };
  }, []);
  return null;
}
