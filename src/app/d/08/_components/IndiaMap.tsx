"use client";

import { useId } from "react";
import { useWood } from "@/lib/wood";
import {
  CITIES,
  EASTERN_GHATS_PATH,
  GRATICULE,
  KM,
  LAND_PATH,
  LANKA_PATH,
  MAP_H,
  MAP_W,
  PIN,
  WESTERN_GHATS_PATH,
  proj,
} from "../_lib/geo";
import { s } from "./styles";

const INK = "#1f1d1a";
const MUTED = "#77736b";
const HEX = { red: "#9b3520", white: "#b8894a" };

/** A teardrop pin with its tip at (0,0). */
function MapPin({ x, y, color, on, scale = 1 }: { x: number; y: number; color: string; on: boolean; scale?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {on && <circle r="13" fill={color} opacity="0.35" className={s.pulse} />}
      <ellipse cx="0" cy="1" rx="7" ry="2.4" fill={INK} opacity="0.25" />
      <path
        d="M0 0C-2.5-8-15-17.5-15-30.5a15 15 0 1 1 30 0C15-17.5 2.5-8 0 0z"
        fill={on ? color : "#fbfaf7"}
        stroke={color}
        strokeWidth="2.4"
      />
      <circle cx="0" cy="-30.5" r="5.5" fill={on ? "#fbfaf7" : color} />
    </g>
  );
}

/**
 * Southern India, simplified. `labels` shows the pin captions (the board puts its own cards beside the map).
 * Text is SVG so it stays sharp at any zoom.
 */
export function IndiaMap({ className = "", labels = true }: { className?: string; labels?: boolean }) {
  const wood = useWood();
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const clip = `a8-clip-${uid}`;
  const fade = `a8-fade-${uid}`;
  const mask = `a8-mask-${uid}`;
  const sea = proj(84.6, 13.2);
  const scale0 = proj(83.2, 7.6);
  const scaleLen = 200 * KM;
  const north = proj(86.6, 8.6);

  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className={className} role="img" aria-label="Map of southern India with pins at the Eastern Ghats in Andhra Pradesh, for red sandalwood, and at Mysuru in Karnataka, for white sandalwood.">
      <defs>
        <clipPath id={clip}>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} />
        </clipPath>
        <linearGradient id={fade} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={mask}>
          <rect x="0" y="0" width={MAP_W} height={MAP_H} fill={`url(#${fade})`} />
        </mask>
      </defs>

      {/* neat line with degree ticks, like a printed plate */}
      <rect x="0.75" y="0.75" width={MAP_W - 1.5} height={MAP_H - 1.5} fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x="8" y="8" width={MAP_W - 16} height={MAP_H - 16} fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      {Array.from({ length: 17 }, (_, i) => {
        const x = proj(72 + i, 10)[0];
        return <line key={`tx${i}`} x1={x} x2={x} y1={0} y2={i % 5 === 3 ? 8 : 5} stroke={INK} strokeWidth="1" />;
      })}
      {Array.from({ length: 17 }, (_, i) => {
        const y = proj(80, 22 - i)[1];
        return <line key={`ty${i}`} y1={y} y2={y} x1={0} x2={i % 5 === 2 ? 8 : 5} stroke={INK} strokeWidth="1" />;
      })}

      <g clipPath={`url(#${clip})`}>
        {/* graticule */}
        {GRATICULE.lats.map((g) => (
          <g key={`lat${g.lat}`}>
            <line x1="8" x2={MAP_W - 8} y1={g.y} y2={g.y} stroke={INK} strokeOpacity="0.14" strokeDasharray="2 6" />
            <text x={MAP_W - 16} y={g.y - 6} textAnchor="end" fontSize="15" fill={MUTED} className={s.serif}>
              {g.lat}°N
            </text>
          </g>
        ))}
        {GRATICULE.lons.map((g) => (
          <g key={`lon${g.lon}`}>
            <line y1="8" y2={MAP_H - 8} x1={g.x} x2={g.x} stroke={INK} strokeOpacity="0.14" strokeDasharray="2 6" />
            <text x={g.x + 6} y={MAP_H - 18} fontSize="15" fill={MUTED} className={s.serif}>
              {g.lon}°E
            </text>
          </g>
        ))}

        {/* water lines along the coast, then the land */}
        <g mask={`url(#${mask})`}>
          <path d={LAND_PATH} fill="none" stroke={INK} strokeOpacity="0.05" strokeWidth="34" strokeLinejoin="round" />
          <path d={LAND_PATH} fill="none" stroke={INK} strokeOpacity="0.06" strokeWidth="20" strokeLinejoin="round" />
          <path d={LAND_PATH} fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="9" strokeLinejoin="round" />
          <path d={LAND_PATH} fill="#ebe5d6" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        </g>
        <path d={LANKA_PATH} fill="none" stroke={INK} strokeOpacity="0.06" strokeWidth="16" />
        <path d={LANKA_PATH} fill="#ebe5d6" stroke={INK} strokeWidth="2" />

        {/* hills, drawn in hachures */}
        <path d={WESTERN_GHATS_PATH} stroke={INK} strokeOpacity="0.55" strokeWidth="1.6" strokeLinecap="round" />
        <path d={EASTERN_GHATS_PATH} stroke={HEX.red} strokeOpacity={wood === "red" ? 0.9 : 0.45} strokeWidth="1.8" strokeLinecap="round" />

        <text transform={`translate(${proj(74.45, 17.8).join(" ")}) rotate(76)`} fontSize="17" fill={INK} fillOpacity="0.7" letterSpacing="3" className={s.serif}>
          Western Ghats
        </text>
        <text transform={`translate(${proj(81.4, 18.55).join(" ")}) rotate(37)`} fontSize="17" fill={HEX.red} letterSpacing="3" className={s.serif}>
          Eastern Ghats
        </text>

        {/* seas */}
        <text transform={`translate(${proj(72.5, 15.6).join(" ")}) rotate(-90)`} fontSize="20" fill={MUTED} fontStyle="italic" letterSpacing="5">
          Arabian Sea
        </text>
        <text x={sea[0]} y={sea[1]} fontSize="24" fill={MUTED} fontStyle="italic" letterSpacing="6" textAnchor="middle">
          Bay of Bengal
        </text>
        <text x={proj(75.2, 6.4)[0]} y={proj(75.2, 6.4)[1]} fontSize="18" fill={MUTED} fontStyle="italic" letterSpacing="5">
          Indian Ocean
        </text>
        <text x={proj(80.8, 7.3)[0]} y={proj(80.8, 7.3)[1]} fontSize="13" fill={MUTED} textAnchor="middle">
          Sri Lanka
        </text>

        {/* cities */}
        {CITIES.map((c) => (
          <g key={c.name}>
            <circle cx={c.at[0]} cy={c.at[1]} r="4" fill="#fbfaf7" stroke={INK} strokeWidth="1.6" />
            <text x={c.at[0] + c.dx} y={c.at[1] + c.dy} fontSize="15" fill={INK} fillOpacity="0.75">
              {c.name}
            </text>
          </g>
        ))}

        {/* compass and scale */}
        <g transform={`translate(${north[0]} ${north[1]})`}>
          <circle r="30" fill="none" stroke={INK} strokeOpacity="0.4" />
          <path d="M0 -26 L7 6 L0 0 L-7 6 Z" fill={INK} />
          <path d="M0 26 L7 -6 L0 0 L-7 -6 Z" fill="none" stroke={INK} strokeWidth="1" />
          <text y="-36" textAnchor="middle" fontSize="16" fill={INK} className={s.serif}>
            N
          </text>
        </g>
        <g transform={`translate(${scale0[0]} ${scale0[1]})`}>
          <rect width={scaleLen / 2} height="6" fill={INK} />
          <rect x={scaleLen / 2} width={scaleLen / 2} height="6" fill="none" stroke={INK} strokeWidth="1.2" />
          <text y="-8" fontSize="13" fill={MUTED}>
            0
          </text>
          <text x={scaleLen} y="-8" fontSize="13" fill={MUTED} textAnchor="middle">
            200 km
          </text>
        </g>

        {/* the two pins */}
        <MapPin x={PIN.white[0]} y={PIN.white[1]} color={HEX.white} on={wood === "white"} />
        <MapPin x={PIN.red[0]} y={PIN.red[1]} color={HEX.red} on={wood === "red"} />
        {labels && (
          <>
            <text x={PIN.red[0] + 20} y={PIN.red[1] - 30} fontSize="19" fill={INK} className={s.serif}>
              Eastern Ghats
            </text>
            <text x={PIN.red[0] + 20} y={PIN.red[1] - 10} fontSize="14" fill={MUTED}>
              Red sandalwood
            </text>
            <text x={PIN.white[0] - 22} y={PIN.white[1] - 30} fontSize="19" fill={INK} textAnchor="end" className={s.serif}>
              Mysuru
            </text>
            <text x={PIN.white[0] - 22} y={PIN.white[1] - 10} fontSize="14" fill={MUTED} textAnchor="end">
              White sandalwood
            </text>
          </>
        )}
      </g>
    </svg>
  );
}
