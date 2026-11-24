"use client";

import { useState, type CSSProperties } from "react";
import { switchWood, useWood } from "@/lib/wood";
import { s } from "../cls";
import { cx } from "../data";

/**
 * India as a dot grid. The outline is an approximate polygon (lon, lat) sampled on a
 * 0.78° grid. Eastern Ghats in red (red sandalwood), Karnataka in white (white sandalwood).
 */

type P = [number, number];

const INDIA: P[] = [
  [72.5, 36.2], [73.6, 36.9], [74.7, 37.1], [75.8, 36.8], [76.8, 35.9], [77.8, 35.6], [78.7, 35.6], [79.6, 35.4], [80.2, 35.1],
  [79.9, 34.2], [79.4, 33.0], [78.9, 32.4], [79.3, 31.4], [80.3, 30.5], [81.0, 30.2], [80.1, 28.8], [81.2, 28.4], [82.5, 27.6],
  [83.3, 27.4], [84.2, 27.4], [85.0, 26.8], [86.5, 26.5], [88.0, 26.4], [88.2, 27.2], [88.9, 27.3], [89.6, 26.8], [91.0, 26.8],
  [92.0, 26.9], [91.7, 27.8], [92.6, 27.9], [93.8, 28.8], [95.4, 29.3], [96.6, 28.9], [97.4, 28.2], [96.6, 27.4], [95.4, 26.7],
  [94.8, 25.6], [94.4, 24.6], [94.0, 23.6], [93.4, 22.4], [92.7, 21.9], [92.4, 23.0], [91.9, 23.6], [91.6, 24.3], [92.3, 24.9],
  [91.4, 25.2], [90.0, 25.3], [89.8, 25.9], [89.0, 25.6], [88.5, 25.2], [88.9, 24.4], [88.6, 23.6], [88.9, 22.8], [89.0, 21.8],
  [88.2, 21.6], [87.4, 21.6], [86.9, 21.0], [86.5, 20.2], [85.2, 19.5], [84.6, 18.9], [84.0, 18.2], [83.0, 17.6], [82.3, 16.8],
  [81.6, 16.3], [81.0, 15.8], [80.4, 15.2], [80.2, 14.0], [80.3, 13.1], [79.9, 12.0], [79.8, 11.2], [79.4, 10.3], [78.9, 9.4],
  [78.2, 8.9], [77.6, 8.1], [77.1, 8.3], [76.6, 8.9], [76.3, 9.6], [75.9, 10.8], [75.6, 11.6], [75.0, 12.6], [74.7, 13.5],
  [74.3, 14.5], [73.8, 15.6], [73.4, 16.6], [73.0, 17.8], [72.8, 19.2], [72.8, 20.5], [72.7, 21.3], [72.4, 22.0], [71.6, 21.0],
  [70.8, 20.7], [70.0, 21.2], [69.0, 22.3], [68.5, 23.0], [68.2, 23.6], [69.2, 24.3], [70.1, 24.4], [70.6, 25.0], [70.3, 25.8],
  [69.6, 26.6], [70.2, 27.6], [71.0, 27.9], [71.9, 28.0], [72.8, 29.0], [73.4, 29.9], [74.0, 30.4], [74.6, 31.0], [74.9, 32.1],
  [74.5, 32.8], [73.7, 33.2], [73.3, 34.0], [72.6, 34.8], [72.4, 35.5],
];
const ANDAMAN: P[] = [[92.4, 13.9], [93.2, 13.9], [93.2, 11.6], [92.9, 10.4], [92.3, 10.4], [92.2, 12.3]];
const NICOBAR: P[] = [[93.3, 9.4], [94.0, 9.4], [94.0, 6.8], [93.4, 6.8]];
const GHATS: P[] = [
  [78.6, 12.5], [79.6, 12.7], [80.2, 14.2], [81.0, 15.8], [82.6, 17.2], [84.0, 18.4], [85.6, 19.9], [86.4, 21.4],
  [85.4, 21.9], [84.0, 20.8], [82.4, 19.2], [80.8, 17.6], [79.4, 16.2], [78.6, 14.8], [78.2, 13.4],
];
const KARNATAKA: P[] = [
  [74.1, 15.0], [74.4, 16.2], [75.2, 16.8], [75.6, 17.6], [76.4, 18.4], [77.4, 18.4], [77.6, 17.5], [77.4, 16.4], [76.9, 15.8],
  [77.0, 15.0], [77.5, 14.4], [78.2, 13.7], [78.5, 13.0], [77.9, 12.6], [77.6, 12.1], [76.9, 11.6], [76.2, 11.8], [75.6, 12.3],
  [75.1, 12.7], [74.8, 13.5], [74.5, 14.3],
];

function inside(poly: P[], x: number, y: number) {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
}

const LON0 = 68;
const LAT0 = 37.6;
const STEP = 0.78;
const COLS = 39;
const ROWS = 41;

type Region = "g" | "k" | null;
type Dot = { x: number; y: number; r: Region };

const DOTS: Dot[] = (() => {
  const out: Dot[] = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const lon = LON0 + i * STEP;
      const lat = LAT0 - j * STEP;
      if (!inside(INDIA, lon, lat) && !inside(ANDAMAN, lon, lat) && !inside(NICOBAR, lon, lat)) continue;
      const r: Region = inside(KARNATAKA, lon, lat) ? "k" : inside(GHATS, lon, lat) ? "g" : null;
      out.push({ x: i * 10 + 5, y: j * 10 + 5, r });
    }
  }
  return out;
})();

const MYSURU = { x: ((76.64 - LON0) / STEP) * 10 + 5, y: ((LAT0 - 12.3) / STEP) * 10 + 5 };

const RED = "#c9462a";
const WHITE = "#f6f2ea";
const BASE = "#3a3935";

export function IndiaMap() {
  const wood = useWood();
  const [focus, setFocus] = useState<Region>(null);
  const live: Region = wood === "red" ? "g" : "k";

  const fill = (r: Region) => {
    if (!r) return BASE;
    if (focus && focus !== r) return BASE;
    return r === "g" ? RED : WHITE;
  };

  return (
    <div className="flex h-full min-h-[340px] w-full flex-col p-4">
      <p className="text-[17px] font-medium leading-none tracking-[-0.02em] text-white">Where the woods grow</p>
      <div className="relative mt-2 min-h-[200px] flex-1">
        <svg
          viewBox={`0 0 ${COLS * 10} ${ROWS * 10}`}
          className="absolute inset-0 h-full w-full"
          role="img"
          aria-label="Dot map of India. The Eastern Ghats, home of red sandalwood, are marked in red. Karnataka, the traditional centre for white sandalwood, is marked in white, with Mysuru ringed."
        >
          {DOTS.map((d, i) => (
            <circle
              key={i}
              cx={d.x}
              cy={d.y}
              r={d.r ? 3.5 : 2.9}
              fill={fill(d.r)}
              className={cx(s.dot, d.r === live && !focus && s.twinkle)}
              style={d.r === live ? ({ "--d": `${(d.x / 400) * 2.4}s` } as CSSProperties) : undefined}
            />
          ))}
          <circle cx={MYSURU.x} cy={MYSURU.y} r={6} fill="none" stroke={WHITE} strokeWidth={1.4} className={s.pulse} />
          <circle cx={MYSURU.x} cy={MYSURU.y} r={4.2} fill={WHITE} />
        </svg>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {(
          [
            { r: "g", w: "red", name: "Eastern Ghats", note: "Red sandalwood", color: RED },
            { r: "k", w: "white", name: "Karnataka", note: "White sandalwood, Mysuru", color: WHITE },
          ] as const
        ).map((l) => (
          <button
            key={l.r}
            type="button"
            onMouseEnter={() => setFocus(l.r)}
            onMouseLeave={() => setFocus(null)}
            onFocus={() => setFocus(l.r)}
            onBlur={() => setFocus(null)}
            onClick={() => wood !== l.w && switchWood(l.w)}
            aria-pressed={wood === l.w}
            className="group flex items-start gap-2 rounded-[14px] px-2 py-1.5 text-left text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:bg-white/15"
          >
            <span className="mt-[5px] size-2.5 shrink-0 rounded-full" style={{ background: l.color }} aria-hidden />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium leading-tight">{l.name}</span>
              <span className={cx(s.mono, "block text-[10px] leading-tight text-white/55")}>{l.note}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
