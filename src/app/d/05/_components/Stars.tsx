import { seededRating } from "@/lib/shop/reviews-data";

/** Five stars set in type: a faint row with an inked row over it, cut to the average. */
export function Stars({ value, label }: { value: number; label?: string }) {
  return (
    <span className="x5-stars" role="img" aria-label={label ?? `Rated ${value.toFixed(1)} out of 5`}>
      <span aria-hidden>★★★★★</span>
      <span className="x5-starsFill" aria-hidden style={{ width: `${(value / 5) * 100}%` }}>
        ★★★★★
      </span>
    </span>
  );
}

/** The rating line for catalogue rows and plates (the seeded letters, server-safe). */
export function RatingLine({ slug }: { slug: string }) {
  const s = seededRating(slug);
  if (!s.count) return null;
  return (
    <span className="x5-rating">
      <Stars value={s.avg} label={`Rated ${s.avg.toFixed(1)} out of 5 in ${s.count} letters`} />
      <b>{s.avg.toFixed(1)}</b>
      <span>
        {s.count} {s.count === 1 ? "letter" : "letters"}
      </span>
    </span>
  );
}
