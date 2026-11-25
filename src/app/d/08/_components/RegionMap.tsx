import type { Wood } from "@/lib/wood";
import { REGION } from "../_lib/geo";
import { s } from "./styles";

const INK = "var(--a-ink)";
const MUTED = "var(--a-muted)";

/** A teardrop pin with its tip at (0,0). */
export function MapPin({ x, y, scale = 1, pulse = true }: { x: number; y: number; scale?: number; pulse?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {pulse && <circle r="13" fill="var(--a-accent)" opacity="0.35" className={s.pulse} />}
      <ellipse cx="0" cy="1" rx="7" ry="2.4" fill={INK} opacity="0.25" />
      <path d="M0 0C-2.5-8-15-17.5-15-30.5a15 15 0 1 1 30 0C15-17.5 2.5-8 0 0z" fill="var(--a-accent)" stroke="var(--a-accent-deep)" strokeWidth="1.6" />
      <circle cx="0" cy="-30.5" r="5.5" fill="var(--a-card)" />
    </g>
  );
}

/**
 * The wood's home, as a printed plate: red is drawn on the Eastern Ghats, white on Mysuru and south Karnataka.
 * The hatched area is the tree's range, roughly. Text is SVG so it stays sharp at any zoom.
 */
export function RegionMap({ wood, className = "", id }: { wood: Wood; className?: string; id: string }) {
  const m = REGION[wood];
  const clip = `a8-clip-${id}`;
  const hatch = `a8-hatch-${id}`;
  const fade = `a8-fade-${id}`;
  return (
    <svg
      viewBox={`0 0 ${m.w} ${m.h}`}
      className={className}
      role="img"
      aria-label={
        wood === "red"
          ? "Map of the southern Eastern Ghats in Andhra Pradesh, with a pin on the Seshachalam hills and the range of red sandalwood hatched around it."
          : "Map of south Karnataka with a pin on Mysuru and the range of white sandalwood hatched across the dry forests around it."
      }
    >
      <defs>
        <clipPath id={clip}>
          <rect x="8" y="8" width={m.w - 16} height={m.h - 16} />
        </clipPath>
        <pattern id={hatch} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
          <line x1="0" y1="0" x2="0" y2="12" className={s.hatch} />
        </pattern>
        <radialGradient id={fade} cx="0.5" cy="0.5" r="0.75">
          <stop offset="0.6" stopColor="var(--a-card)" stopOpacity="0" />
          <stop offset="1" stopColor="var(--a-card)" stopOpacity="0.55" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width={m.w} height={m.h} fill="var(--a-card)" />
      {/* neat line with half-degree ticks, like a printed plate */}
      <rect x="0.75" y="0.75" width={m.w - 1.5} height={m.h - 1.5} fill="none" stroke={INK} strokeWidth="1.5" />
      <rect x="8" y="8" width={m.w - 16} height={m.h - 16} fill="none" stroke={INK} strokeOpacity="0.35" strokeWidth="1" />
      {m.ticks.x.map((x, i) => (
        <line key={`tx${i}`} x1={x} x2={x} y1={0} y2={i % 2 ? 5 : 8} stroke={INK} strokeWidth="1" />
      ))}
      {m.ticks.y.map((y, i) => (
        <line key={`ty${i}`} y1={y} y2={y} x1={0} x2={i % 2 ? 5 : 8} stroke={INK} strokeWidth="1" />
      ))}

      <g clipPath={`url(#${clip})`}>
        {m.grat.lats.map((g) => (
          <g key={`lat${g.lat}`}>
            <line x1="8" x2={m.w - 8} y1={g.y} y2={g.y} stroke={INK} strokeOpacity="0.14" strokeDasharray="2 6" />
            <text x={m.w - 18} y={g.y - 7} textAnchor="end" fontSize="16" fill={MUTED} className={s.serif}>
              {g.lat}°N
            </text>
          </g>
        ))}
        {m.grat.lons.map((g) => (
          <g key={`lon${g.lon}`}>
            <line y1="8" y2={m.h - 8} x1={g.x} x2={g.x} stroke={INK} strokeOpacity="0.14" strokeDasharray="2 6" />
            <text x={g.x + 7} y={m.h - 20} fontSize="16" fill={MUTED} className={s.serif}>
              {g.lon}°E
            </text>
          </g>
        ))}

        {/* water lines along the coast, then the land */}
        <path d={m.land} fill="none" stroke={INK} strokeOpacity="0.05" strokeWidth="40" strokeLinejoin="round" />
        <path d={m.land} fill="none" stroke={INK} strokeOpacity="0.06" strokeWidth="22" strokeLinejoin="round" />
        <path d={m.land} fill="none" stroke={INK} strokeOpacity="0.08" strokeWidth="10" strokeLinejoin="round" />
        <path d={m.land} fill="var(--a-land)" stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d={m.lanka} fill="var(--a-land)" stroke={INK} strokeWidth="2" />

        {/* where it grows */}
        <path d={m.range} fill={`url(#${hatch})`} />
        <path d={m.range} fill="var(--a-accent)" fillOpacity="0.06" stroke="var(--a-accent)" strokeWidth="2" strokeDasharray="7 6" />

        {/* hills in hachures; the wood's own range is drawn in its colour */}
        <path d={m.westHills} stroke={m.ridge === "west" ? "var(--a-accent-deep)" : INK} strokeOpacity={m.ridge === "west" ? 0.75 : 0.45} strokeWidth="1.8" strokeLinecap="round" />
        <path d={m.eastHills} stroke={m.ridge === "east" ? "var(--a-accent-deep)" : INK} strokeOpacity={m.ridge === "east" ? 0.75 : 0.45} strokeWidth="1.8" strokeLinecap="round" />

        {m.labels.map((l) => (
          <text
            key={l.text}
            transform={`translate(${l.at[0].toFixed(1)} ${l.at[1].toFixed(1)})${l.rotate ? ` rotate(${l.rotate})` : ""}`}
            textAnchor={l.anchor ?? "start"}
            fontSize={l.size}
            fill={l.kind === "hills" ? "var(--a-accent-deep)" : l.kind === "range" ? INK : MUTED}
            fillOpacity={l.kind === "range" ? 0.75 : 1}
            fontStyle={l.kind === "sea" || l.kind === "range" ? "italic" : "normal"}
            letterSpacing={l.kind === "sea" ? 6 : l.kind === "state" ? 4 : l.kind === "hills" ? 3 : 1}
            className={l.kind === "hills" || l.kind === "state" ? s.serif : undefined}
          >
            {l.text}
          </text>
        ))}

        {m.cities.map((c) => (
          <g key={c.name}>
            <circle cx={c.at[0]} cy={c.at[1]} r="4.5" fill="var(--a-card)" stroke={INK} strokeWidth="1.8" />
            <text x={c.at[0] + c.dx} y={c.at[1] + c.dy} fontSize="17" fill={INK} fillOpacity="0.8" textAnchor={c.anchor ?? "start"}>
              {c.name}
            </text>
          </g>
        ))}

        {/* compass and scale */}
        <g transform={`translate(${m.north[0]} ${m.north[1]})`}>
          <circle r="32" fill="var(--a-card)" stroke={INK} strokeOpacity="0.4" />
          <path d="M0 -27 L7 6 L0 0 L-7 6 Z" fill={INK} />
          <path d="M0 27 L7 -6 L0 0 L-7 -6 Z" fill="none" stroke={INK} strokeWidth="1" />
          <text y="-40" textAnchor="middle" fontSize="17" fill={INK} className={s.serif}>
            N
          </text>
        </g>
        <g transform={`translate(${m.scale.at[0]} ${m.scale.at[1]})`}>
          <rect width={m.scale.len / 2} height="6" fill={INK} />
          <rect x={m.scale.len / 2} width={m.scale.len / 2} height="6" fill="var(--a-card)" stroke={INK} strokeWidth="1.2" />
          <text y="-9" fontSize="14" fill={MUTED}>
            0
          </text>
          <text x={m.scale.len} y="-9" fontSize="14" fill={MUTED} textAnchor="middle">
            {m.scale.km} km
          </text>
        </g>

        <rect x="0" y="0" width={m.w} height={m.h} fill={`url(#${fade})`} pointerEvents="none" />

        {/* the pin */}
        <MapPin x={m.pin[0]} y={m.pin[1]} scale={1.35} />
        <g transform={`translate(${m.pin[0] + 30} ${m.pin[1] - 44})`}>
          <rect x="-8" y="-28" width={m.pinLabel.length * 13.4 + 16} height="58" fill="var(--a-card)" fillOpacity="0.9" />
          <text fontSize="24" fill={INK} className={s.serif}>
            {m.pinLabel}
          </text>
          <text y="22" fontSize="15" fill="var(--a-accent-deep)">
            {m.pinSub}
          </text>
        </g>
      </g>
    </svg>
  );
}
