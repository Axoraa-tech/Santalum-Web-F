"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { useMedia } from "./bits";
import { pauseScroll, setScroller, useUI } from "./store";

/** Lenis for the long strand scroll; the page locks while the bag, menu or a piece is open. */
export function SmoothScroll() {
  const s = useUI();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const locked = s.bag || s.menu || s.product !== null;

  useEffect(() => {
    if (reduced) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.1 });
    setScroller({
      scrollTo: (y, o) => l.scrollTo(y, o),
      stop: () => l.stop(),
      start: () => l.start(),
    });
    return () => {
      setScroller(null);
      l.destroy();
    };
  }, [reduced]);

  useEffect(() => {
    if (!locked) return;
    const html = document.documentElement;
    pauseScroll(true);
    html.style.overflow = "hidden";
    html.style.scrollbarGutter = "stable";
    return () => {
      pauseScroll(false);
      html.style.overflow = "";
      html.style.scrollbarGutter = "";
    };
  }, [locked]);

  return null;
}
