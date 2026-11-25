"use client";

import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { EASE } from "./data";
import { HeldSun, Sky } from "./Sky";
import { Sundial } from "./Sundial";

/**
 * The sky for a calm page (shop, a piece, checkout, account, tracking): held at one hour.
 * If the hour changes, the sun moves there. Pass `minutes` to drive it from outside.
 * The sun of a calm page sits in the open sky at the top right of the page and scrolls away with it.
 */
export function HeldSky({ min, minutes: external }: { min: number; minutes?: MotionValue<number> }) {
  const own = useMotionValue(min);
  const minutes = external ?? own;
  useEffect(() => {
    if (external) return;
    if (Math.abs(own.get() - min) < 0.5) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(own, min, { duration: reduce ? 0 : 1.6, ease: EASE });
    return () => c.stop();
  }, [min, own, external]);
  return (
    <>
      <Sky minutes={minutes} held />
      <HeldSun minutes={minutes} />
      <Sundial minutes={minutes} mode="link" />
    </>
  );
}
