"use client";

import { motion, useMotionValue, useTransform } from "motion/react";
import { useId } from "react";
import s from "../styles";
import { DAY_END, DAY_START, EASE, hhmm } from "./data";
import { useScene } from "./Scene";
import { Moon, useSkyColours } from "./Sky";

/**
 * The sun of one scene on the home page (wide screens). Each scene keeps its own sun, set in that
 * scene's open sky: on the horizon under the opening words at dawn, over the shoulder of a window
 * (an arch) through the day, and sinking into the horizon at dusk. Because it belongs to the scene,
 * it scrolls away with it and never stands behind a line of text. While the scene holds, the sun
 * drifts a little along its path.
 *
 * `className` places the sun's centre inside the nearest positioned box. With `clip`, that box is
 * the horizon: whatever lies below its edge is hidden.
 */
export function SceneSun({
  at,
  className,
  drift = [0, 0],
  clip = false,
  rise = false,
}: {
  /** The minute of the day the scene stands at, for the sun's colour. */
  at: number;
  className: string;
  /** How far the sun travels while the scene holds, in px: [right, down]. */
  drift?: [number, number];
  clip?: boolean;
  /** Rise into place once, on page load. */
  rise?: boolean;
}) {
  const minutes = useMotionValue(at);
  const red = useSkyColours(minutes, "red");
  const white = useSkyColours(minutes, "white");
  const ctx = useScene();
  const still = useMotionValue(0);
  const pin = ctx?.pin ?? still;
  const amp = ctx?.amp ?? 0;
  const x = useTransform(pin, [0, 1], [0, drift[0] * amp]);
  const y = useTransform(pin, [0, 1], [0, drift[1] * amp]);

  const sun = (
    <div className={`absolute ${className}`}>
      <motion.div style={{ x, y }}>
        <motion.div
          initial={rise ? { y: "38vh" } : false}
          animate={{ y: 0 }}
          transition={{ duration: 2.8, ease: EASE, delay: 0.1 }}
          className="relative -translate-x-1/2 -translate-y-1/2"
        >
          <div className="absolute left-1/2 top-1/2 size-[clamp(200px,26vw,420px)] -translate-x-1/2 -translate-y-1/2 opacity-45">
            <motion.div className="absolute inset-0 rounded-full" style={{ backgroundImage: red.glow }} />
            <motion.div className={`absolute inset-0 rounded-full ${s.skyWhite}`} style={{ backgroundImage: white.glow }} />
          </div>
          <div className="relative size-[clamp(64px,8vw,132px)] opacity-90">
            <motion.div className="absolute inset-0 rounded-full" style={{ backgroundImage: red.sunFill }} />
            <motion.div className={`absolute inset-0 rounded-full ${s.skyWhite}`} style={{ backgroundImage: white.sunFill }} />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  return clip ? (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] hidden overflow-hidden lg:block">
      {sun}
    </div>
  ) : (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-[1] hidden lg:block">
      {sun}
    </div>
  );
}

/* ---------- phones and tablets: the hour, with the sun on a small horizon beside it ---------- */

const LW = 132;
const BASE = 21;
const LIFT = 16;
const SUNSET = 1150;

function lineAt(f: number) {
  return { x: 6 + (LW - 12) * f, y: BASE - LIFT * Math.sin(Math.PI * f) };
}

function pathTo(f: number, n = 28) {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = lineAt((f * i) / n);
    pts.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

/**
 * A chapter's hour. On screens without the scene suns, a short horizon follows the time with the
 * sun standing on it at that hour's place in the day: low at the left at dawn, highest just after
 * noon, on the line at dusk, and the moon once it has set. The path already travelled is drawn in.
 */
export function Hour({ min, className = "" }: { min: number; className?: string }) {
  const clipId = `d09-hour${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const f = Math.min(1, Math.max(0, (min - DAY_START) / (DAY_END - DAY_START)));
  const sun = lineAt(f);
  const night = min >= SUNSET;
  return (
    <p className={`flex items-center gap-4 ${className}`}>
      <span className={`${s.num} text-[21px] tracking-[0.04em] text-[var(--muted)] lg:text-[25px]`}>{hhmm(min)}</span>
      <svg width={LW} height="26" viewBox={`0 0 ${LW} 26`} aria-hidden className="overflow-visible lg:hidden">
        <line x1="0" y1={BASE} x2={LW} y2={BASE} stroke="rgb(42 36 32 / 0.22)" strokeWidth="1" />
        <path d={pathTo(1)} fill="none" stroke="rgb(42 36 32 / 0.2)" strokeWidth="1" strokeDasharray="1.5 4" strokeLinecap="round" />
        {night ? (
          <>
            <path d={pathTo(1)} fill="none" style={{ stroke: "var(--m-accent)" }} strokeWidth="1.4" strokeLinecap="round" opacity="0.55" />
            <g transform={`translate(${LW - 30} -6)`}>
              <Moon size={18} />
            </g>
          </>
        ) : (
          <>
            {f > 0 && <path d={pathTo(f)} fill="none" style={{ stroke: "var(--m-accent)" }} strokeWidth="1.4" strokeLinecap="round" />}
            {/* below the horizon the disc is hidden, so at dawn and dusk the sun sits half on the line */}
            <clipPath id={clipId}>
              <rect x="-10" y="-10" width={LW + 20} height={BASE + 10} />
            </clipPath>
            <g clipPath={`url(#${clipId})`}>
              <circle cx={sun.x} cy={sun.y} r="11" style={{ fill: "var(--m-accent)" }} opacity="0.14" />
              <circle cx={sun.x} cy={sun.y} r="5.5" style={{ fill: "var(--m-accent)" }} />
            </g>
          </>
        )}
      </svg>
    </p>
  );
}
