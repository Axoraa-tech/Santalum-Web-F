import { s } from "./cx";
import { mulberry32 } from "./data";

/** Twenty-one cuff profiles. Seeded, so server and client draw the same set. */
export const KINDS = ["Dome", "Chamfered flat", "Centre bead", "Cove", "Twin bead", "Ogee", "Knife edge"] as const;
type Cuff = { n: number; w: number; t: number; kind: number };
const rand = mulberry32(2011);
export const CUFFS: Cuff[] = Array.from({ length: 21 }, (_, i) => ({
  n: i + 1,
  w: Math.round(16 + rand() * 10),
  t: Math.round((5 + rand() * 3) * 2) / 2,
  kind: (i * 3) % 7,
}));

const g = (u: number, c: number, w: number) => Math.exp(-(((u - c) / w) ** 2));

/** Wall thickness (mm) across the width of the band, u from 0 to 1: the lathe profile. */
function wall(c: Cuff, u: number) {
  const T = c.t;
  const edge = 0.82 + 0.18 * Math.min(1, Math.min(u, 1 - u) / 0.07);
  switch (c.kind) {
    case 0:
      return T * (0.48 + 0.52 * Math.sin(Math.PI * u));
    case 1:
      return T * Math.min(1, 0.5 + Math.min(u, 1 - u) * 3.4);
    case 2:
      return T * (0.58 + 0.16 * Math.sin(Math.PI * u) + 0.26 * g(u, 0.5, 0.1));
    case 3:
      return T * (1 - 0.4 * Math.sin(Math.PI * u)) * edge;
    case 4:
      return T * (0.56 + 0.44 * Math.max(g(u, 0.27, 0.12), g(u, 0.73, 0.12)));
    case 5:
      return T * (0.45 + 0.55 * Math.sin(Math.PI * Math.pow(u, 0.6)));
    default:
      return T * (0.32 + 0.68 * (1 - Math.pow(Math.abs(2 * u - 1), 1.6)));
  }
}

/** The profile as a closed path, bore line at y = base, in mm. */
function profilePath(c: Cuff, x0: number, base: number, k = 1) {
  const pts: string[] = [];
  const steps = 36;
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    pts.push(`${(x0 + u * c.w * k).toFixed(2)} ${(base - wall(c, u) * k).toFixed(2)}`);
  }
  return `M${x0.toFixed(2)} ${base.toFixed(2)} L${pts.join(" L")} L${(x0 + c.w * k).toFixed(2)} ${base.toFixed(2)} Z`;
}

function Hatch({ id }: { id: string }) {
  return (
    <defs>
      <pattern id={id} width="1.6" height="1.6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <line x1="0" y1="0" x2="0" y2="1.6" stroke="currentColor" strokeWidth="0.25" opacity="0.6" />
      </pattern>
    </defs>
  );
}

/** Small drawing for the rack: every profile at the same scale, with its axis (broken, not to scale). */
export function RackProfile({ c }: { c: Cuff }) {
  const W = 30;
  const x0 = (W - c.w) / 2;
  const base = 13;
  const id = `vh${c.n}`;
  return (
    <svg viewBox={`0 0 ${W} 22`} className="block w-full overflow-visible" aria-hidden>
      <Hatch id={id} />
      <path d={profilePath(c, x0, base)} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <path
        d={`M1 19.5 H${W - 1}`}
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="6 1.5 1 1.5"
        vectorEffect="non-scaling-stroke"
        opacity="0.55"
      />
      <path d={`M${x0 - 1.2} 14.2 l0.8 1 l-1.2 0.9 l0.8 1`} fill="none" stroke="currentColor" strokeWidth="0.7" vectorEffect="non-scaling-stroke" opacity="0.5" />
    </svg>
  );
}

/** Large drawing of the selected profile, dimensioned. */
export function ProfileDetail({ c }: { c: Cuff }) {
  const x0 = 4;
  const base = 14;
  const maxT = Math.max(...Array.from({ length: 41 }, (_, i) => wall(c, i / 40)));
  const top = base - maxT;
  const id = `vd${c.n}`;
  const R = c.w + x0;
  return (
    <svg viewBox={`0 0 ${c.w + 15} 29`} className="block h-full w-full overflow-visible" aria-hidden>
      <Hatch id={id} />
      <path d={profilePath(c, x0, base)} fill={`url(#${id})`} stroke="currentColor" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
      <g className={s.mono} fontSize="1.15" fill="currentColor">
        {/* width */}
        <path d={`M${x0} ${top - 3.2} H${R}`} stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={`M${x0} ${top - 3.2} l1.3 -0.5 v1 Z M${R} ${top - 3.2} l-1.3 -0.5 v1 Z`} fill="currentColor" />
        <path d={`M${x0} ${top - 4.6} V${base - 0.6} M${R} ${top - 4.6} V${base - 0.6}`} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.45" />
        <text x={x0 + c.w / 2} y={top - 4} textAnchor="middle">
          {c.w}
        </text>
        {/* wall */}
        <path d={`M${R + 3} ${top} V${base}`} stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <path d={`M${R + 3} ${top} l-0.5 1.3 h1 Z M${R + 3} ${base} l-0.5 -1.3 h1 Z`} fill="currentColor" />
        <path d={`M${R + 0.6} ${top} H${R + 4.4}`} stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" opacity="0.45" />
        <text x={R + 4.2} y={(top + base) / 2 + 0.6}>
          t {c.t}
        </text>
        {/* bore and axis, broken */}
        <path d={`M${x0 - 3} ${base} H${R + 5}`} stroke="currentColor" strokeWidth="0.7" vectorEffect="non-scaling-stroke" opacity="0.5" />
        <text x={x0 - 3} y={base + 2.6} opacity="0.75">
          Bore, to your measurement
        </text>
        <path d={`M${x0 + 2} ${base + 4} l1 1.2 l-1.6 1 l1 1.2`} fill="none" stroke="currentColor" strokeWidth="0.8" vectorEffect="non-scaling-stroke" opacity="0.6" />
        <path
          d={`M${x0 - 3} ${base + 10} H${R + 5}`}
          stroke="currentColor"
          strokeWidth="0.8"
          strokeDasharray="8 2 1.5 2"
          vectorEffect="non-scaling-stroke"
          opacity="0.7"
        />
        <text x={R + 5} y={base + 12.6} textAnchor="end" opacity="0.75">
          Spindle axis
        </text>
      </g>
    </svg>
  );
}
