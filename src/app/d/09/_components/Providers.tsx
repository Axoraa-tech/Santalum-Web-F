"use client";

import Lenis from "lenis";
import { MotionConfig } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BodyBackground } from "@/components/BodyBackground";
import { useWood } from "@/lib/wood";
import { TINT } from "./data";
import { setLenis, settleWood } from "./store";

/** Smooth, weighted scrolling (off for reduced motion), motion defaults, and the page tint of the current wood for overscroll. */
export function Providers({ children }: { children: ReactNode }) {
  const wood = useWood();
  const path = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const l = new Lenis({ autoRaf: true, lerp: 0.08, anchors: true });
    setLenis(l);
    return () => {
      l.destroy();
      setLenis(null);
    };
  }, []);
  // a wood change that waited for a new page (a piece's counterpart) lands once that page is in
  useEffect(() => {
    settleWood();
  }, [path]);
  return (
    <MotionConfig reducedMotion="user">
      <BodyBackground color={TINT[wood]} />
      {children}
    </MotionConfig>
  );
}
