import { useId } from "react";

/** A soft five-point star, the points rounded like the display serif. */
const STAR = "M12 2.6c.4 0 .7.2.9.6l2.3 4.7 5.2.8c.9.1 1.2 1.2.6 1.8l-3.8 3.7.9 5.2c.2.9-.8 1.5-1.5 1.1L12 18l-4.6 2.5c-.8.4-1.7-.2-1.5-1.1l.9-5.2L3 10.5c-.6-.6-.3-1.7.6-1.8l5.2-.8 2.3-4.7c.2-.4.5-.6.9-.6Z";

/**
 * Five stars filled to the rating in the wood's accent; the rest drawn as hairlines.
 * Server-safe (no state), so cards and product headers render it without hydration.
 */
export function Stars({ value, size = 16, className = "", label = true }: { value: number; size?: number; className?: string; label?: boolean }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const pct = Math.max(0, Math.min(5, value)) / 5;
  const w = size * 5 + (size / 6) * 4;
  return (
    <svg
      width={w}
      height={size}
      viewBox={`0 0 ${5 * 24 + 4 * 4} 24`}
      className={`shrink-0 ${className}`}
      role={label ? "img" : undefined}
      aria-label={label ? `${value.toFixed(1)} out of 5` : undefined}
      aria-hidden={label ? undefined : true}
    >
      <defs>
        <clipPath id={`s${id}`}>
          <rect width={pct * (5 * 24 + 4 * 4)} height="24" />
        </clipPath>
      </defs>
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={`o${i}`} d={STAR} transform={`translate(${i * 28} 0)`} fill="none" strokeWidth="1.4" strokeLinejoin="round" style={{ stroke: "var(--mz-accent)", strokeOpacity: 0.45 }} />
      ))}
      <g clipPath={`url(#s${id})`}>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={`f${i}`} d={STAR} transform={`translate(${i * 28} 0)`} strokeWidth="1.4" strokeLinejoin="round" style={{ fill: "var(--mz-accent)", stroke: "var(--mz-accent)" }} />
        ))}
      </g>
    </svg>
  );
}

/** Stars, the average and the count, for cards and the product header. */
export function RatingLine({ avg, count, className = "", size = 14 }: { avg: number; count: number; className?: string; size?: number; dist?: unknown }) {
  if (!count) return null;
  return (
    <span className={`inline-flex items-center gap-2 text-[14px] text-(--mz-ink-2) ${className}`}>
      <Stars value={avg} size={size} />
      <span className="tabular-nums">
        {avg.toFixed(1)} <span className="text-(--mz-ink-3)">({count})</span>
      </span>
    </span>
  );
}

/** One star, for the picker. */
export function OneStar({ on, size = 30 }: { on: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d={STAR}
        strokeWidth="1.3"
        strokeLinejoin="round"
        style={{ fill: on ? "var(--mz-accent)" : "transparent", stroke: "var(--mz-accent)", strokeOpacity: on ? 1 : 0.45, transition: "fill 0.25s, stroke-opacity 0.25s" }}
      />
    </svg>
  );
}
