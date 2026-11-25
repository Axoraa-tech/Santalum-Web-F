import { STAGES } from "@/lib/shop/orders";

/**
 * An order drawn as a slice of wood: the pith is the moment it was placed, and every stage
 * adds a growth ring outwards until the bark, when it is delivered. Done rings take the wood's
 * colour; the current one breathes; the rings still to come are pencilled in.
 */

const N = STAGES.length;
const CX = 100;
const CY = 100;

/** A slightly wavy ring, the same every render (no randomness). */
function ringPath(r: number, i: number) {
  const pts: string[] = [];
  const steps = 72;
  for (let k = 0; k <= steps; k++) {
    const a = (k / steps) * Math.PI * 2;
    const rr = r * (1 + 0.022 * Math.sin(3 * a + i * 1.7) + 0.014 * Math.sin(5 * a + i * 0.9) + 0.008 * Math.sin(9 * a + i));
    pts.push(`${(CX + rr * Math.cos(a)).toFixed(2)} ${(CY + rr * Math.sin(a) * 0.97).toFixed(2)}`);
  }
  return `M${pts.join("L")}Z`;
}

const RADII = STAGES.map((_, i) => 19 + i * 13.4);
const PATHS = RADII.map((r, i) => ringPath(r, i));
const BARK = ringPath(RADII[N - 1] + 9, N);

export function GrowthRings({ current, className = "", live = true }: { current: number; className?: string; live?: boolean }) {
  return (
    <svg viewBox="0 0 200 200" className={className} role="img" aria-label={`${STAGES[current].label}: stage ${current + 1} of ${N}`}>
      <path d={BARK} style={{ fill: "var(--mz-surface-2)" }} />
      {/* filled bands, outer first so the inner ones sit on top */}
      {[...PATHS].reverse().map((d, ri) => {
        const i = N - 1 - ri;
        const done = i <= current;
        return (
          <path
            key={`band-${i}`}
            d={d}
            style={{
              fill: done ? (i % 2 ? "var(--mz-accent-soft)" : "color-mix(in oklab, var(--mz-accent-soft) 70%, var(--mz-accent))") : i % 2 ? "var(--mz-surface)" : "var(--mz-bg)",
              transition: "fill 0.9s var(--ease-out-soft)",
            }}
          />
        );
      })}
      {PATHS.map((d, i) => {
        const done = i <= current;
        const now = i === current;
        return (
          <path
            key={`ring-${i}`}
            d={d}
            fill="none"
            className={now && live ? "mz-ring-now" : undefined}
            style={{
              stroke: done ? "var(--mz-accent)" : "var(--mz-ink)",
              strokeOpacity: done ? 1 : 0.22,
              strokeWidth: now ? 3.2 : done ? 1.8 : 0.8,
              strokeDasharray: done ? undefined : "1.5 3.5",
              strokeLinecap: "round",
              transition: "stroke 0.9s var(--ease-out-soft), stroke-width 0.9s var(--ease-out-soft)",
            }}
          />
        );
      })}
      <circle cx={CX} cy={CY} r={7} style={{ fill: "var(--mz-accent-deep)" }} />
    </svg>
  );
}
