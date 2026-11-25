import { seededRating } from "@/lib/shop/reviews-data";
import { s } from "./cx";

const STAR = "M6 0.8 L7.55 4.1 L11.1 4.5 L8.45 6.9 L9.2 10.5 L6 8.7 L2.8 10.5 L3.55 6.9 L0.9 4.5 L4.45 4.1 Z";

function Row({ size, fill }: { size: number; fill: boolean }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 12 12" className="shrink-0" aria-hidden>
          <path d={STAR} fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" />
        </svg>
      ))}
    </>
  );
}

/** Five stars, filled to the value (to a tenth), in the wood's accent. */
export function Stars({ value, size = 12, className = "" }: { value: number; size?: number; className?: string }) {
  const gap = 2;
  const pct = Math.max(0, Math.min(1, value / 5));
  const width = pct * (size * 5 + gap * 4);
  return (
    <span role="img" aria-label={`${value.toFixed(1)} out of 5 stars`} className={`relative inline-flex shrink-0 align-middle ${className}`}>
      <span className="flex text-(--hair-2)" style={{ gap }}>
        <Row size={size} fill={false} />
      </span>
      <span className="absolute inset-y-0 left-0 flex overflow-hidden text-(--accent)" style={{ gap, width }}>
        <Row size={size} fill />
      </span>
    </span>
  );
}

/** Stars, the average and the review count for cards and rows (seeded, so the same on server and client). */
export function RatingLine({ slug, className = "" }: { slug: string; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`${s.mono} inline-flex items-center gap-2 text-[11.5px] text-(--ink-2) ${className}`}>
      <Stars value={r.avg} size={11} />
      <span className="tabular-nums">
        {r.avg.toFixed(1)} <span className="text-(--steel)">({r.count})</span>
      </span>
    </span>
  );
}
