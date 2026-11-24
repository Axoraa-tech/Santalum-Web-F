"use client";

import { animate, motion, useMotionValue, useTransform, type MotionValue } from "motion/react";
import { useEffect } from "react";
import { DAY_END, DAY_START, EASE, HORIZON, SKY, SUN, T } from "./data";

/** The sun's path across the top of the screen, in viewport percent (also drawn as a faint arc). */
function sunPos(v: number) {
  return { x: 6 + 88 * v, y: 13 + 20 * (2 * v - 1) ** 2 };
}
const ARC = (() => {
  const pts: string[] = [];
  for (let i = 0; i <= 60; i++) {
    const p = sunPos(i / 60);
    pts.push(`${p.x.toFixed(2)},${p.y.toFixed(2)}`);
  }
  return `M${pts.join(" L")}`;
})();

/**
 * The fixed sky behind every page of the design: its colour, a warmer horizon, the sun on its arc
 * (with a faint glow) and, after sunset, a thin moon. `minutes` is the time of day.
 */
export function Sky({ minutes, intro = false }: { minutes: MotionValue<number>; intro?: boolean }) {
  const sky = useTransform(minutes, T, SKY);
  const horizon = useTransform(minutes, T, HORIZON);
  const horizonBg = useTransform(horizon, (c) => `linear-gradient(to top, ${c} 0%, transparent 100%)`);
  const topFade = useTransform(sky, (c) => `linear-gradient(to bottom, ${c} 0%, ${c} 38%, transparent 100%)`);
  const sun = useTransform(minutes, T, SUN);
  const sunFill = useTransform(sun, (c) => `radial-gradient(circle at 40% 36%, #fff8ee 0%, ${c} 62%)`);
  const glow = useTransform(sun, (c) => `radial-gradient(circle, ${c} 0%, transparent 64%)`);

  // one page-load moment: the sun rises into place
  const rise = useMotionValue(intro ? 1 : 0);
  useEffect(() => {
    if (!intro) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      rise.set(0);
      return;
    }
    const c = animate(rise, 0, { duration: 2.8, ease: EASE, delay: 0.1 });
    return () => c.stop();
  }, [intro, rise]);

  const frac = useTransform(minutes, (m) => Math.min(1, Math.max(0, (m - DAY_START) / (DAY_END - DAY_START))));
  const x = useTransform(frac, (v) => `${sunPos(v).x.toFixed(3)}vw`);
  const y = useTransform([frac, minutes, rise], ([v, m, r]: number[]) => {
    const set = m > 1138 ? ((m - 1138) / 42) * 34 : 0;
    return `${(sunPos(v).y + set + r * 40).toFixed(3)}vh`;
  });
  const sunOpacity = useTransform(minutes, [1136, 1174], [1, 0]);
  const moon = useTransform(minutes, [1140, 1178], [0, 1]);

  return (
    <div aria-hidden>
      <motion.div className="pointer-events-none fixed inset-0 -z-10" style={{ backgroundColor: sky }} />
      <motion.div className="pointer-events-none fixed inset-x-0 bottom-0 -z-10 h-[60svh]" style={{ backgroundImage: horizonBg }} />
      <motion.svg
        className="pointer-events-none fixed inset-0 -z-10 hidden h-svh w-screen lg:block"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ opacity: sunOpacity }}
      >
        <path d={ARC} fill="none" stroke="rgb(42 36 32 / 0.11)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </motion.svg>

      <motion.div className="pointer-events-none fixed left-[9vw] top-[15vh] -z-10" style={{ opacity: moon }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <defs>
            <mask id="d09-moon-mask">
              <rect width="44" height="44" fill="white" />
              <circle cx="30" cy="16" r="16" fill="black" />
            </mask>
          </defs>
          <circle cx="22" cy="22" r="17" fill="#fdfcff" stroke="rgb(42 36 32 / 0.08)" mask="url(#d09-moon-mask)" />
        </svg>
      </motion.div>

      <motion.div className="pointer-events-none fixed left-0 top-0 -z-10" style={{ x, y, opacity: sunOpacity }}>
        <div className="relative -translate-x-1/2 -translate-y-1/2">
          <motion.div
            className="absolute left-1/2 top-1/2 size-[clamp(240px,28vw,460px)] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-55"
            style={{ backgroundImage: glow }}
          />
          <motion.div className="relative size-[clamp(62px,7vw,118px)] rounded-full" style={{ backgroundImage: sunFill }} />
        </div>
      </motion.div>

      <motion.div className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-[84px] opacity-95" style={{ backgroundImage: topFade }} />
    </div>
  );
}
