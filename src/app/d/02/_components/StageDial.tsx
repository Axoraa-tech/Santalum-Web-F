"use client";

import { motion, useReducedMotion } from "motion/react";
import { STAGES, formatDate, trackingFor, type Order, type Tracking } from "@/lib/shop/orders";
import { s } from "./cls";

/* The six delivery stages sit on a dial, like the making steps and the ring: a 300° gauge from placed to delivered. */
const START = -150;
const SWEEP = 300;
const N = STAGES.length;
const angleOf = (i: number) => START + (i * SWEEP) / (N - 1);
const pt = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return [200 + r * Math.sin(a), 200 - r * Math.cos(a)] as const;
};
function arc(from: number, to: number, r: number) {
  const [x1, y1] = pt(from, r);
  const [x2, y2] = pt(to, r);
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}
const TICKS = Array.from({ length: 51 }, (_, i) => START + (i * SWEEP) / 50);

/**
 * The big tracking dial: the needle turns to the current stage, the path behind it fills in.
 * A cancelled order stops the dial: the needle rests on "placed", the stations after it go faint,
 * and the hub says so, instead of the clock running on.
 */
export function StageDial({ tracking, cancelled = false }: { tracking: Tracking; cancelled?: boolean }) {
  const reduced = !!useReducedMotion();
  const cur = cancelled ? 0 : tracking.current;
  const stage = tracking.stages[cur];
  const R = 166;
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px]">
      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" role="img" aria-label={cancelled ? `Cancelled before it shipped. Placed ${formatDate(stage.at, true)}` : `Stage ${cur + 1} of ${N}: ${stage.label}`}>
        <circle cx="200" cy="200" r="196" fill="var(--o-card)" stroke="var(--o-line)" />
        {TICKS.map((d, i) => {
          const [x1, y1] = pt(d, 192);
          const [x2, y2] = pt(d, i % 10 === 0 ? 178 : 184);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--o-line)" strokeWidth={i % 10 === 0 ? 2 : 1} />;
        })}
        <path d={arc(START, START + SWEEP, R)} fill="none" stroke="var(--o-line)" strokeWidth="2" strokeDasharray="3 6" strokeLinecap="round" />
        {cur > 0 && (
          <motion.path
            d={arc(START, angleOf(cur), R)}
            fill="none"
            stroke="var(--m-accent)"
            strokeWidth="5"
            strokeLinecap="round"
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        {STAGES.map((st, i) => {
          const [x, y] = pt(angleOf(i), R);
          const done = i < cur || (cancelled && i === 0);
          const on = i === cur && !cancelled;
          return (
            <g key={st.key} opacity={cancelled && i > 0 ? 0.45 : 1}>
              {on && <circle cx={x} cy={y} r="16" fill="var(--m-accent)" className={s.pulse} style={{ transformBox: "fill-box", transformOrigin: "center" }} />}
              <circle cx={x} cy={y} r="16" fill={on ? "var(--m-accent)" : done ? "var(--o-ink)" : "var(--o-card)"} stroke={on || done ? "none" : "var(--o-line)"} strokeWidth="2" />
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="700" fill={on || done ? "#fff" : "var(--o-muted)"} className={s.syne}>
                {i + 1}
              </text>
            </g>
          );
        })}
      </svg>

      {/* the hand: a full-size layer turning about the centre, carrying a short pointer and its bead.
          It turns inside a round frame, so its square corners never widen the page. */}
      <div aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
        <motion.div
          className="absolute inset-0"
          initial={reduced ? false : { rotate: START }}
          animate={{ rotate: angleOf(cur) }}
          transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 60, damping: 14, mass: 1.2 }}
        >
          <span className={`absolute bottom-[calc(50%+26%)] left-1/2 h-[9%] w-[3px] -translate-x-1/2 rounded-full ${cancelled ? "bg-[var(--o-muted)]" : "bg-[var(--o-ink)]"}`} />
          <span className={`absolute bottom-[calc(50%+34%)] left-1/2 size-2.5 -translate-x-1/2 translate-y-1/2 rounded-full ${cancelled ? "bg-[var(--o-muted)]" : "bg-[var(--m-accent)]"}`} />
        </motion.div>
      </div>

      {/* the hub: a wood disc and the stage, written in the middle of the dial */}
      <div className={`absolute inset-[24%] grid place-items-center rounded-full bg-[var(--o-bg)] p-3 text-center ${cancelled ? "border-2 border-dashed border-[var(--o-line)]" : "border border-[var(--o-line)]"}`}>
        {cancelled ? (
          <div className="flex flex-col items-center">
            <span aria-hidden className="grid size-7 place-items-center rounded-full border-2 border-dashed border-[var(--o-muted)] text-[16px] leading-none text-[var(--o-muted)] md:size-9 md:text-[20px]">
              ×
            </span>
            <p className="mt-2 text-[12px] font-semibold text-[var(--o-muted)] md:text-[13px]">Stopped at stage 1</p>
            <p className={`${s.syne} mt-0.5 text-[clamp(1rem,4.2vw,1.35rem)] font-bold leading-tight tracking-[-0.02em]`}>Cancelled</p>
            <p className="mt-0.5 text-[12px] tabular-nums text-[var(--o-muted)] md:text-[13px]">Placed {formatDate(stage.at, true)}</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <span className={`size-7 rounded-full md:size-9 ${s.onlyRed} ${s.woodRed}`} aria-hidden />
            <span className={`size-7 rounded-full md:size-9 ${s.onlyWhite} ${s.woodWhite}`} aria-hidden />
            <p className="mt-2 text-[12px] font-semibold tabular-nums text-[var(--o-muted)] md:text-[13px]">
              Stage {cur + 1} of {N}
            </p>
            <p className={`${s.syne} mt-0.5 text-[clamp(1rem,4.2vw,1.35rem)] font-bold leading-tight tracking-[-0.02em]`}>{stage.label}</p>
            <p className="mt-0.5 text-[12px] tabular-nums text-[var(--o-muted)] md:text-[13px]">{formatDate(stage.at, true)}</p>
          </div>
        )}
      </div>
    </div>
  );
}

/** A small six-segment ring for order lists: filled up to the current stage. */
export function StageRing({ current, size = 56 }: { current: number; size?: number }) {
  const r = 24;
  const segs = Array.from({ length: N }, (_, i) => {
    const a0 = -90 + i * 60 + 5;
    const a1 = a0 + 50;
    const p = (a: number) => [28 + r * Math.cos((a * Math.PI) / 180), 28 + r * Math.sin((a * Math.PI) / 180)];
    const [x1, y1] = p(a0);
    const [x2, y2] = p(a1);
    return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
  });
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg viewBox="0 0 56 56" className="absolute inset-0 size-full" aria-hidden>
        {segs.map((d, i) => (
          <path key={i} d={d} fill="none" strokeLinecap="round" strokeWidth="4" stroke={i <= current ? "var(--m-accent)" : "var(--o-line)"} />
        ))}
      </svg>
      <span className={`${s.syne} text-[13px] font-bold tabular-nums`}>
        {current + 1}
        <span className="text-[var(--o-muted)]">/{N}</span>
      </span>
    </span>
  );
}

/**
 * The small seal for an order in a list: its six-segment ring while it travels, a dashed cross once
 * cancelled, a dashed return mark once a return is asked for. Never a live ring for a stopped order.
 */
export function OrderSeal({ order, now, size = 56 }: { order: Order; now: number | null; size?: number }) {
  if (order.status) {
    const cancelled = order.status === "cancelled";
    return (
      <span
        role="img"
        aria-label={cancelled ? "Cancelled" : "Return requested"}
        className={`grid shrink-0 place-items-center rounded-full border-2 border-dashed ${cancelled ? "border-[var(--o-line)] text-[var(--o-muted)]" : "border-[var(--m-accent)] text-[var(--m-accent)]"}`}
        style={{ width: size, height: size }}
      >
        <span aria-hidden className="leading-none" style={{ fontSize: Math.round(size * 0.38) }}>
          {cancelled ? "×" : "↺"}
        </span>
      </span>
    );
  }
  return <StageRing current={now ? trackingFor(order, now).current : 0} size={size} />;
}
