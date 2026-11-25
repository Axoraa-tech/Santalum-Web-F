"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect, useId } from "react";
import { STAGES } from "@/lib/shop/orders";
import s from "../styles";
import { EASE } from "./data";

/**
 * Six stages placed on the sun's path, from the morning the order is placed to the evening it arrives.
 * The sun travels to the current stage; the path behind it is drawn solid, the path ahead dashed.
 */
const W = 1000;
const H = 300;
const CX = 500;
const RX = 470;
const BASE = 262;
const RY = 214;

export const STAGE_X = Array.from({ length: 6 }, (_, i) => (W * (i + 0.5)) / 6);

function yAt(x: number) {
  const u = Math.max(-1, Math.min(1, (x - CX) / RX));
  return BASE - RY * Math.sqrt(1 - u * u);
}

function pathBetween(x0: number, x1: number, n = 48) {
  const pts: string[] = [];
  for (let i = 0; i <= n; i++) {
    const x = x0 + ((x1 - x0) * i) / n;
    pts.push(`${x.toFixed(1)},${yAt(x).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
}

const FULL = pathBetween(CX - RX, CX + RX, 80);

/** Short names under the dots, so the six points read as stages and not as decoration. */
const SHORT = ["Placed", "Confirmed", "Packed", "Shipped", "Out for delivery", "Delivered"];

export function SunArc({
  current,
  className = "",
  compact = false,
  labelled = false,
}: {
  current: number;
  className?: string;
  compact?: boolean;
  /** Name the stages under the arc (in full on wide arcs; first, current and last on compact ones). */
  labelled?: boolean;
}) {
  const id = `d09arc${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const x = useMotionValue(STAGE_X[0]);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(x, STAGE_X[current], { duration: reduce ? 0 : 1.8, ease: EASE, delay: reduce ? 0 : 0.2 });
    return () => c.stop();
  }, [current, x]);
  const done = useTransform(x, (v) => pathBetween(STAGE_X[0], v));
  const cy = useTransform(x, (v) => yAt(v));

  return (
    <div className={className}>
    <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" aria-hidden>
      <defs>
        <radialGradient id={`${id}-sun`} cx="40%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#fff8ee" />
          <stop offset="100%" style={{ stopColor: "var(--m-accent)" }} />
        </radialGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0%" style={{ stopColor: "var(--m-accent)", stopOpacity: 0.28 }} />
          <stop offset="100%" style={{ stopColor: "var(--m-accent)", stopOpacity: 0 }} />
        </radialGradient>
      </defs>
      {/* horizon */}
      <line x1="0" y1={BASE} x2={W} y2={BASE} stroke="rgb(42 36 32 / 0.16)" strokeWidth="1.2" />
      {/* the path ahead, then the path behind the sun */}
      <path d={FULL} fill="none" stroke="rgb(42 36 32 / 0.22)" strokeWidth={compact ? 3 : 1.6} strokeDasharray={compact ? "2 10" : "2 8"} strokeLinecap="round" />
      <motion.path d={done} fill="none" style={{ stroke: "var(--m-accent)" }} strokeWidth={compact ? 6 : 2.4} strokeLinecap="round" />
      {STAGE_X.map((sx, i) => {
        const on = i <= current;
        return (
          <g key={i}>
            <line x1={sx} y1={yAt(sx) + 12} x2={sx} y2={BASE} stroke="rgb(42 36 32 / 0.12)" strokeWidth="1" strokeDasharray="2 5" />
            <circle
              cx={sx}
              cy={yAt(sx)}
              r={compact ? 14 : 8}
              style={{ fill: on ? "var(--m-accent)" : "var(--paper)", stroke: on ? "var(--m-accent)" : "rgb(42 36 32 / 0.35)" }}
              strokeWidth={compact ? 3 : 1.4}
            />
          </g>
        );
      })}
      <motion.circle cx={x} cy={cy} r={compact ? 120 : 90} fill={`url(#${id}-glow)`} />
      <motion.circle cx={x} cy={cy} r={compact ? 34 : 26} fill={`url(#${id}-sun)`} />
    </svg>
      {labelled && !compact && (
        <ol aria-label="Stages" className="mt-1.5 grid grid-cols-6 gap-1.5">
          {SHORT.map((l, i) => (
            <li
              key={l}
              aria-current={i === current ? "step" : undefined}
              className={`text-center text-[12px] leading-[1.25] ${i === current ? "text-[var(--m-accent)]" : i < current ? "text-[var(--ink)]" : "text-[var(--muted)]"}`}
            >
              {l}
            </li>
          ))}
        </ol>
      )}
      {labelled && compact && (
        <p className="mt-2 grid grid-cols-[1fr_auto_1fr] items-baseline gap-2 text-[11px] leading-none text-[var(--muted)]">
          <span>{SHORT[0]}</span>
          <span className="text-[var(--ink)]">
            Stage <span className={s.num}>{current + 1}</span> of <span className={s.num}>{STAGES.length}</span>
          </span>
          <span className="text-right">{SHORT[SHORT.length - 1]}</span>
        </p>
      )}
    </div>
  );
}
