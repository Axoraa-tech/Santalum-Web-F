import { seededRating } from "@/lib/shop/reviews-data";

const STAR = "M12 2.6l2.8 6 6.5.7-4.9 4.4 1.4 6.4L12 16.8 6.2 20.1l1.4-6.4L2.7 9.3l6.5-.7L12 2.6z";

function Row({ filled, size }: { filled: boolean; size: number }) {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} viewBox="0 0 24 24" width={size} height={size} className="shrink-0" aria-hidden>
          <path d={STAR} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 1.6} strokeLinejoin="round" />
        </svg>
      ))}
    </>
  );
}

/** Five stars, filled to the value (fractions too): an outline row with a clipped filled row on top. */
export function Stars({ value, size = 14, label }: { value: number; size?: number; label?: string }) {
  return (
    <span className="relative inline-flex shrink-0 align-middle" role="img" aria-label={label ?? `${value.toFixed(1)} out of 5 stars`}>
      <span className="flex gap-[1px] text-[var(--o-line)]">
        <Row filled={false} size={size} />
      </span>
      <span className="absolute inset-y-0 left-0 flex gap-[1px] overflow-hidden text-[var(--m-accent)]" style={{ width: `${Math.max(0, Math.min(1, value / 5)) * 100}%` }}>
        <Row filled size={size} />
      </span>
    </span>
  );
}

/** The seeded rating for cards and lists: stars, average and count. Server-safe. */
export function RatingLine({ slug, size = 12, className = "" }: { slug: string; size?: number; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`inline-flex items-center gap-1.5 text-[13px] tabular-nums text-[var(--o-muted)] ${className}`}>
      <Stars value={r.avg} size={size} />
      <span>
        <span className="font-semibold text-[var(--o-ink)]">{r.avg.toFixed(1)}</span> ({r.count})
      </span>
    </span>
  );
}
