import { seededRating } from "@/lib/shop/reviews-data";
import s from "../styles";

const STAR = "M10 1.6l2.47 5.3 5.8.68-4.29 3.96 1.14 5.73L10 14.4l-5.12 2.87 1.14-5.73L1.73 7.58l5.8-.68z";

/** Five thin stars, filled to the rating like light rising in a window. Decorative; pair it with text. */
export function StarRow({ value, size = 14, className = "" }: { value: number; size?: number; className?: string }) {
  return (
    <span aria-hidden className={`inline-flex items-center gap-[2px] ${className}`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <svg viewBox="0 0 20 20" width={size} height={size} className="absolute inset-0">
              <path d={STAR} fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" opacity="0.45" />
            </svg>
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg viewBox="0 0 20 20" width={size} height={size}>
                  <path d={STAR} style={{ fill: "var(--m-accent)" }} stroke="none" />
                </svg>
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/** One star for the picker. */
export function Star({ on, size = 26 }: { on: boolean; size?: number }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} aria-hidden>
      <path d={STAR} style={{ fill: on ? "var(--m-accent)" : "transparent", stroke: on ? "var(--m-accent)" : "currentColor" }} strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  );
}

/** Stars and the review count for cards (seeded reviews, so the server and client agree). */
export function CardRating({ slug, className = "" }: { slug: string; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] text-[var(--muted)] ${className}`}>
      <StarRow value={r.avg} size={13} className="text-[var(--ink)]" />
      <span className={s.tab}>
        {r.avg.toFixed(1)}
        <span className="sr-only"> out of 5,</span> ({r.count}
        <span className="sr-only"> reviews</span>)
      </span>
    </span>
  );
}
