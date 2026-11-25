"use client";

import { motion, useTransform, type MotionValue } from "motion/react";
import type { Wood } from "@/lib/wood";
import s from "../styles";
import { SKIES, T } from "./data";

/** One wood's colours for the whole sky at the current minute. */
export function useSkyColours(minutes: MotionValue<number>, wood: Wood) {
  const k = SKIES[wood];
  const sky = useTransform(minutes, T, k.sky);
  const horizon = useTransform(minutes, T, k.horizon);
  const horizonBg = useTransform(horizon, (c) => `linear-gradient(to top, ${c} 0%, transparent 100%)`);
  // the band under the header: solid sky where the wordmark and links sit, then a short fade
  const band = useTransform(sky, (c) => `linear-gradient(to bottom, ${c} 0px, ${c} 70px, transparent 100%)`);
  const sun = useTransform(minutes, T, k.sun);
  // a soft disc with a feathered edge: light in the sky, not an object laid over the words
  const sunFill = useTransform(sun, (c) => `radial-gradient(circle at 44% 40%, #fff6ea 0%, ${c} 46%, ${c} 56%, transparent 71%)`);
  const glow = useTransform(sun, (c) => `radial-gradient(circle, ${c} 0%, transparent 64%)`);
  return { sky, horizonBg, band, sunFill, glow };
}

/** The thin moon, drawn the same everywhere. */
export function Moon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" aria-hidden>
      <defs>
        <mask id={`d09-moon-mask-${size}`}>
          <rect width="44" height="44" fill="white" />
          <circle cx="30" cy="16" r="16" fill="black" />
        </mask>
      </defs>
      <circle cx="22" cy="22" r="17" fill="#fdfcff" stroke="rgb(42 36 32 / 0.12)" mask={`url(#d09-moon-mask-${size})`} />
    </svg>
  );
}

/**
 * The fixed sky behind every page of the design: its colour, a warmer horizon and the band under the
 * header. The sun is never fixed to the screen, so it can never stand behind words: on the home page
 * each scene carries its own sun (see SceneSun), and on the calm pages it is drawn at the top of the
 * page (see HeldSun). On the home page (`held` false), after sunset a thin moon comes up inside the
 * header band, where no words pass under it.
 * Both woods' skies are drawn; CSS fades the white day in over the red one, so the right sky
 * shows before hydration and the switch eases.
 */
export function Sky({ minutes, held = false }: { minutes: MotionValue<number>; held?: boolean }) {
  const red = useSkyColours(minutes, "red");
  const white = useSkyColours(minutes, "white");
  const moon = useTransform(minutes, [1140, 1178], [0, 1]);

  return (
    <div aria-hidden data-sky>
      <div className="pointer-events-none fixed inset-0 -z-10">
        <motion.div className="absolute inset-0" style={{ backgroundColor: red.sky }} />
        <motion.div className="absolute inset-x-0 bottom-0 h-[60svh]" style={{ backgroundImage: red.horizonBg }} />
      </div>
      <div className={`pointer-events-none fixed inset-0 -z-10 ${s.skyWhite}`}>
        <motion.div className="absolute inset-0" style={{ backgroundColor: white.sky }} />
        <motion.div className="absolute inset-x-0 bottom-0 h-[60svh]" style={{ backgroundImage: white.horizonBg }} />
      </div>

      {!held && (
        /* the moon rises inside the header band, between the wordmark and the links */
        <motion.div
          className="pointer-events-none fixed left-[calc(44%-17px)] top-[22px] z-[115] lg:left-[38%] lg:top-[16px]"
          style={{ opacity: moon }}
        >
          <Moon size={34} />
        </motion.div>
      )}

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[110] h-[100px]">
        <motion.div className="absolute inset-0" style={{ backgroundImage: red.band }} />
        <motion.div className={`absolute inset-0 ${s.skyWhite}`} style={{ backgroundImage: white.band }} />
      </div>
    </div>
  );
}

/**
 * The sun of a calm page, held at the page's hour: drawn at the top right of the page, in the open sky
 * above the heading's right side, and scrolling away with it. After sunset it is the moon.
 */
export function HeldSun({ minutes }: { minutes: MotionValue<number> }) {
  const red = useSkyColours(minutes, "red");
  const white = useSkyColours(minutes, "white");
  const sunOpacity = useTransform(minutes, [1136, 1174], [1, 0]);
  const moon = useTransform(minutes, [1140, 1178], [0, 1]);
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute right-6 top-[104px] -z-[1] size-9 sm:right-10 lg:right-[max(2.5rem,8vw)] lg:top-[112px] lg:size-[clamp(64px,6.4vw,104px)]"
    >
      <motion.div className="absolute inset-0" style={{ opacity: sunOpacity }}>
        <div className="absolute left-1/2 top-1/2 size-[300%] -translate-x-1/2 -translate-y-1/2 opacity-40">
          <motion.div className="absolute inset-0 rounded-full" style={{ backgroundImage: red.glow }} />
          <motion.div className={`absolute inset-0 rounded-full ${s.skyWhite}`} style={{ backgroundImage: white.glow }} />
        </div>
        <motion.div className="absolute inset-0 rounded-full" style={{ backgroundImage: red.sunFill }} />
        <motion.div className={`absolute inset-0 rounded-full ${s.skyWhite}`} style={{ backgroundImage: white.sunFill }} />
      </motion.div>
      <motion.div className="absolute inset-0 grid place-items-center" style={{ opacity: moon }}>
        <div className="size-[90%] [&>svg]:size-full">
          <Moon />
        </div>
      </motion.div>
    </div>
  );
}
