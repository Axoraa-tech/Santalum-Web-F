import type { CSSProperties } from "react";
import { seededRating } from "@/lib/shop/reviews-data";

/** Five star-shaped beads on a short brass thread, each filled to its share of the average. */
export function Stars({ avg, size = 12 }: { avg: number; size?: number }) {
  return (
    <span className="s3-rate" style={{ "--bs": `${size}px` } as CSSProperties} role="img" aria-label={`Rated ${avg.toFixed(1)} out of 5`}>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className="s3-star">
          <span style={{ width: `${Math.round(Math.min(1, Math.max(0, avg - i)) * 100)}%` }} />
        </span>
      ))}
    </span>
  );
}

/** Stars and a review count for cards (seeded, so the server and client agree). */
export function RatingLine({ slug, className = "" }: { slug: string; className?: string }) {
  const r = seededRating(slug);
  if (!r.count) return null;
  return (
    <span className={`inline-flex items-center gap-2 text-[13px] text-(--muted) ${className}`}>
      <Stars avg={r.avg} size={11} />
      <span className="tabular-nums">
        {r.avg.toFixed(1)} ({r.count})
      </span>
    </span>
  );
}

const DATE = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });
/** A date that reads the same on the server and in the browser. */
export const reviewDate = (ms: number) => DATE.format(ms);
