import { getProduct, PRODUCTS, type Wood } from "./products";

/**
 * Seeded reviews and questions (server-safe, deterministic: no Date.now / Math.random).
 * Placeholder customer voices until real reviews exist. Client-added reviews live in reviews.ts.
 */

export type Reply = { id: string; author: string; body: string; at: number; fromMaison?: boolean };
export type Review = {
  id: string;
  slug: string;
  author: string;
  city: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
  at: number;
  verified: boolean;
  helpful: number;
  replies: Reply[];
};
export type Question = { id: string; slug: string; author: string; body: string; at: number; answers: Reply[] };

const NAMES = ["Ananya R.", "Vikram S.", "Meera K.", "Arjun P.", "Kavya N.", "Rohan D.", "Ishita M.", "Siddharth G.", "Lakshmi V.", "Karthik B.", "Nandini J.", "Aditya T.", "Priya H.", "Rahul C.", "Divya A.", "Harish L."];
const CITIES = ["Bengaluru", "Mysuru", "Chennai", "Mumbai", "Pune", "Hyderabad", "Delhi", "Kochi", "Kolkata", "Ahmedabad", "Jaipur", "Goa"];

const TEMPLATES: Record<Wood, { r: Review["rating"]; t: string; b: string }[]> = {
  red: [
    { r: 5, t: "Heavier than it looks", b: "The weight was the first surprise. The colour is deeper in person than in the photos, and the batch card was a nice touch." },
    { r: 5, t: "Colour keeps deepening", b: "Three months in and it has gone from brick to almost wine where my hand holds it. Exactly what they said would happen." },
    { r: 4, t: "Beautiful, slow delivery", b: "The piece is lovely and the finish is very smooth. Took five working days to Pune, one more than promised." },
    { r: 5, t: "Bought it as a gift", b: "Gave it to my father. He read the provenance record before he even looked at the piece, which says a lot." },
    { r: 5, t: "No lacquer, as promised", b: "You can feel the grain. No shiny coating, no smell of varnish. It feels like wood, not like a product." },
    { r: 4, t: "Packaging is excellent", b: "Linen pouch, a card and the record. I would have liked a slightly firmer box, but the piece arrived perfect." },
    { r: 5, t: "Better than the market ones", b: "I have bought red sandalwood from temple shops for years. This is denser and the colour is even all the way through." },
    { r: 3, t: "Good, but smaller than I imagined", b: "Well made and honest. Check the dimensions carefully, it is smaller in the hand than the photos suggested to me." },
    { r: 5, t: "The record matters", b: "Batch number, lot origin, who finished it. I have not seen another seller in India do this for red sandalwood." },
  ],
  white: [
    { r: 5, t: "The fragrance is real", b: "You can tell this is heartwood. The scent is soft and stays for hours, nothing like the sharp synthetic ones." },
    { r: 5, t: "Like my grandmother's house", b: "Opened the box and the room smelled the way Mysuru homes used to. Very happy." },
    { r: 4, t: "Small bottle, lasts long", b: "Expensive for the size, but one drop really is enough. I am two months in and have barely used a third." },
    { r: 5, t: "Used it for the puja", b: "Ground fresh paste for the first time in years. Pale gold, cool and the fragrance filled the room." },
    { r: 5, t: "Honest labelling", b: "They print the lot and say exactly what is inside. After so many fake sandalwood products, that alone earns five stars." },
    { r: 4, t: "Lovely, wish there was a refill", b: "The bottle is beautiful and the oil is excellent. A refill option would make it perfect." },
    { r: 5, t: "Gifted at a wedding", b: "We ordered trays for our daughter's wedding. Every guest asked where they were from." },
    { r: 3, t: "Scent is subtle", b: "Good quality, but if you are used to strong perfumes this will feel very quiet. That is probably the point." },
    { r: 5, t: "Carving is exquisite", b: "The fan is pierced so finely you can see light through every leaf, and it still smells of sandalwood when it opens." },
  ],
};

const QUESTIONS: Record<Wood, { q: string; a: string }[]> = {
  red: [
    { q: "Does red sandalwood have a fragrance?", a: "Almost none. Red sandalwood is valued for its colour and density; the fragrant sandalwood is white sandalwood, Santalum album." },
    { q: "Will the colour fade in sunlight?", a: "It slowly darkens rather than fades, but keep it out of strong direct sun to keep the colour even." },
    { q: "Is it legal to buy red sandalwood?", a: "Yes, from documented lots. Its international trade is controlled under CITES Appendix II, and every piece we sell carries its paperwork." },
  ],
  white: [
    { q: "Is this heartwood or sapwood?", a: "Heartwood only. Sapwood has no fragrance, so we never use it in oil, powder or carving." },
    { q: "How long does the fragrance last?", a: "In carved pieces, for years; warm them in the hand to wake it. Oil keeps for a decade or more if kept closed and cool." },
    { q: "Can I use the powder on my face?", a: "Traditionally, yes, mixed with rose water. We list every ingredient; please patch test first." },
  ],
};

/** Small deterministic hash so the same product always gets the same seeded reviews. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}
const BASE = Date.UTC(2026, 0, 6); // seeded reviews fall between Jan and Nov 2026
const DAY = 86_400_000;

const cache = new Map<string, Review[]>();

export function seededReviews(slug: string): Review[] {
  const hit = cache.get(slug);
  if (hit) return hit;
  const p = getProduct(slug);
  if (!p) return [];
  const h = hash(slug);
  const n = 3 + (h % 6); // 3–8 reviews
  const pool = TEMPLATES[p.wood];
  const out: Review[] = [];
  for (let i = 0; i < n; i++) {
    const k = hash(slug + i);
    const t = pool[(h + i * 7) % pool.length];
    out.push({
      id: `${slug}-s${i}`,
      slug,
      author: NAMES[k % NAMES.length],
      city: CITIES[(k >>> 4) % CITIES.length],
      rating: t.r,
      title: t.t,
      body: t.b,
      at: BASE + ((k >>> 8) % 300) * DAY,
      verified: (k & 3) !== 0,
      helpful: (k >>> 12) % 24,
      replies:
        t.r <= 4 && i % 2 === 0
          ? [{ id: `${slug}-s${i}-m`, author: "Santalum Maison", fromMaison: true, body: "Thank you for writing. We read every note and pass this one to the workshop.", at: BASE + (((k >>> 8) % 300) + 2) * DAY }]
          : [],
    });
  }
  out.sort((a, b) => b.at - a.at);
  cache.set(slug, out);
  return out;
}

export function seededQuestions(slug: string): Question[] {
  const p = getProduct(slug);
  if (!p) return [];
  return QUESTIONS[p.wood].map((x, i) => ({
    id: `${slug}-q${i}`,
    slug,
    author: NAMES[(hash(slug) + i * 3) % NAMES.length],
    body: x.q,
    at: BASE + (40 + i * 30) * DAY,
    answers: [{ id: `${slug}-q${i}-a`, author: "Santalum Maison", fromMaison: true, body: x.a, at: BASE + (41 + i * 30) * DAY }],
  }));
}

export type RatingSummary = { avg: number; count: number; dist: [number, number, number, number, number] };

export function summarize(reviews: Review[]): RatingSummary {
  const dist: RatingSummary["dist"] = [0, 0, 0, 0, 0];
  for (const r of reviews) dist[r.rating - 1]++;
  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  return { avg: Math.round(avg * 10) / 10, count, dist };
}

/** Server-safe rating for cards and lists (seeded reviews only). */
export function seededRating(slug: string): RatingSummary {
  return summarize(seededReviews(slug));
}

/** All seeded reviews across the catalogue, for the admin panel. */
export function allSeededReviews(): Review[] {
  return PRODUCTS.flatMap((p) => seededReviews(p.slug));
}
