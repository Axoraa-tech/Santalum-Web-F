"use client";

import { useEffect, useState } from "react";
import { Lotus } from "./Lotus";

const COUNT = 108;
const C = 400;
const R = 330;
const GAP = 0.075; // radians left open each side of the guru bead

const BEADS = Array.from({ length: COUNT }, (_, i) => {
  const start = Math.PI / 2 + GAP;
  const span = Math.PI * 2 - GAP * 2;
  const a = start + (span * (i + 0.5)) / COUNT;
  return [Math.round((C + Math.cos(a) * R) * 10) / 10, Math.round((C + Math.sin(a) * R) * 10) / 10];
});

/** 108 beads counted one at a time, as in japa. Static (all counted) when reduced motion is on. */
export function MalaRing({ className = "" }: { className?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const id = window.setTimeout(() => setCount(COUNT), 0);
      return () => window.clearTimeout(id);
    }
    let n = 0;
    const id = window.setInterval(() => {
      n = n >= COUNT + 12 ? 0 : n + 1; // short rest at the guru bead, then begin again
      setCount(Math.min(n, COUNT));
    }, 150);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className={`relative aspect-square ${className}`}>
      <svg viewBox="0 0 800 860" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
        <defs>
          <radialGradient id="beadOff" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#8b5e3c" />
            <stop offset="1" stopColor="#3b2219" />
          </radialGradient>
          <radialGradient id="beadOn" cx="35%" cy="30%" r="75%">
            <stop offset="0" stopColor="#f0d2a0" />
            <stop offset="0.5" stopColor="#c4975a" />
            <stop offset="1" stopColor="#7a4e2a" />
          </radialGradient>
        </defs>
        <circle cx={C} cy={C} r={R} fill="none" stroke="#b08d57" strokeWidth="0.6" opacity="0.35" />
        {BEADS.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={i === count - 1 ? 9.4 : 8.4}
            fill={i < count ? "url(#beadOn)" : "url(#beadOff)"}
            style={{ transition: "r 0.3s ease" }}
          />
        ))}
        {/* guru (meru) bead and tassel */}
        <circle cx={C} cy={C + R + 4} r="15" fill="url(#beadOff)" stroke="#b08d57" strokeWidth="0.8" />
        <path d={`M${C} ${C + R + 19}v14`} stroke="#b08d57" strokeWidth="1.4" />
        <circle cx={C} cy={C + R + 36} r="5" fill="#b08d57" />
        {Array.from({ length: 11 }, (_, i) => (
          <path
            key={i}
            d={`M${C} ${C + R + 40}q${(i - 5) * 2.2} 24 ${(i - 5) * 3.4} 50`}
            stroke="#c4975a"
            strokeWidth="0.9"
            fill="none"
            opacity="0.8"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center" style={{ paddingBottom: "7%" }}>
        <Lotus className="h-7 w-12 text-dust" />
        <p className="mt-6 font-serif text-6xl font-light tabular-nums text-linen md:text-7xl">
          {String(count).padStart(3, "0")}
        </p>
        <p className="mt-2 text-xs tracking-[0.34em] text-pale/50">OF 108</p>
      </div>
    </div>
  );
}
