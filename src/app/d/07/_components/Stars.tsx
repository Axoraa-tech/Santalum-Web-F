import { seededRating } from "@/lib/shop/reviews-data";

export const STAR = "M12 3.2l2.6 5.6 6.1.7-4.5 4.2 1.2 6-5.4-3.1-5.4 3.1 1.2-6-4.5-4.2 6.1-.7z";

/** Five stars, filled to the rating (fractions clip the last star). */
export function Stars({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[2px] ${className}`} role="img" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <svg key={i} width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
            <path d={STAR} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" opacity="0.45" />
            {fill > 0 && (
              <path d={STAR} fill="currentColor" style={{ clipPath: `inset(0 ${(1 - fill) * 100}% 0 0)` }} />
            )}
          </svg>
        );
      })}
    </span>
  );
}

/** Stars and a review count from the seeded reviews (server-safe, so cards render it on the first paint). */
export function RatingLine({ slug, className = "" }: { slug: string; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`num inline-flex items-center gap-1.5 text-[13px] text-(--s7-muted) ${className}`}>
      <Stars value={r.avg} size={13} className="text-(--s7-accent)" />
      <span>
        {r.avg.toFixed(1)} <span className="opacity-80">({r.count})</span>
      </span>
    </span>
  );
}
