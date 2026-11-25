import type { Question, Review } from "@/lib/shop/reviews";
import type { Product } from "@/lib/shop/products";

/**
 * The seeded letters are drawn from one pool per wood, so a carved fan could be sent a letter about a small
 * bottle of oil. Here each piece is given a kind, each seeded letter says which kinds it can be about, and a
 * letter that does not fit is replaced by one written for that kind, with the same number of stars (so the
 * averages and counts elsewhere stay true). Readers' own letters are never touched.
 */

type Kind = "wood" | "material" | "oil" | "burn" | "brass" | "paste" | "soap" | "beads" | "carving" | "fan" | "tray";

const BY_SLUG: Record<string, Kind> = {
  "r-heartwood-powder": "material",
  "r-ubtan": "material",
  "r-heartwood-chips": "material",
  "r-tilak-set": "material",
  "w-boxed-oil": "oil",
  "w-incense-sticks": "burn",
  "w-dhoop-cones": "burn",
  "w-heartwood-chips": "burn",
  "w-candle": "burn",
  "w-incense-holder": "brass",
  "w-chandan-stone": "paste",
  "w-chandan-powder": "paste",
  "w-face-pack": "paste",
  "w-morning-ritual": "paste",
  "w-sandalwood-soap": "soap",
  "w-mysuru-fan": "fan",
  "w-wedding-tray": "tray",
};
const BY_CATEGORY: Partial<Record<Product["category"], Kind>> = { oil: "oil", "w-beads": "beads", carvings: "carving" };

export function kindOf(p: Product): Kind {
  return BY_SLUG[p.slug] ?? BY_CATEGORY[p.category] ?? (p.wood === "red" ? "wood" : "carving");
}

/** Seeded letter titles and the kinds of piece each one can honestly be about. */
const FITS: Record<string, Kind[]> = {
  // red
  "Heavier than it looks": ["wood"],
  "Colour keeps deepening": ["wood"],
  "Beautiful, slow delivery": ["wood"],
  "Bought it as a gift": ["wood"],
  "No lacquer, as promised": ["wood"],
  "Packaging is excellent": ["wood"],
  "Better than the market ones": ["wood"],
  "Good, but smaller than I imagined": ["wood"],
  "The record matters": ["wood", "material"],
  // white
  "The fragrance is real": ["oil", "burn", "paste", "soap", "beads", "carving", "fan", "tray"],
  "Like my grandmother's house": ["oil", "burn", "paste", "soap", "beads", "carving", "fan", "tray"],
  "Small bottle, lasts long": ["oil"],
  "Used it for the puja": ["paste"],
  "Honest labelling": ["oil", "burn", "paste", "soap", "tray"],
  "Lovely, wish there was a refill": ["oil"],
  "Gifted at a wedding": ["tray"],
  "Scent is subtle": ["oil", "burn", "paste", "soap", "tray"],
  "Carving is exquisite": ["fan"],
};

type Letter = { t: string; b: string };
type Pool = Partial<Record<Review["rating"], Letter[]>>;

const POOLS: Partial<Record<Kind, Pool>> = {
  material: {
    5: [
      { t: "A true deep red", b: "The colour is a real deep red, not the orange of the market stuff. It stains the fingers a little, which is how my mother said you know raktachandan." },
      { t: "The batch number checks out", b: "The batch on the label matches the record card in the parcel. I have never been able to check that with anything bought loose." },
      { t: "Plain and honest", b: "No perfume added and no colour added. It smells of almost nothing, which is what red sandalwood is meant to do." },
      { t: "Used it for the Sunday puja", b: "Used it at home for the puja. A small amount was enough, and the colour stayed true on the brass plate." },
      { t: "Exactly as described", b: "It came as the page describes it, packed well and clearly labelled. I will order again when this runs out." },
    ],
    4: [
      { t: "Good, packed a little loosely", b: "The material is good and clearly labelled. The pack had shifted a little in the box, but nothing was spilled." },
      { t: "Good, read the notes first", b: "Fine material and plainly labelled. I did not realise red sandalwood has almost no scent; the page does say so." },
    ],
    3: [{ t: "Fine, but no scent", b: "It does what the page says. I expected the fragrance of white sandalwood, which this is not. My mistake rather than theirs." }],
  },
  oil: {
    5: [
      { t: "It lasts the whole day", b: "I wear it in the morning and still notice it in the evening. It softens through the day instead of fading the way perfume does." },
      { t: "The lot number is on the bottle", b: "The lot is printed on the label and the box, and when I asked for the test report they sent it the same day." },
      { t: "Warm, not sweet", b: "Softer and woodier than the sandalwood perfumes I know. There is no sharp top note, just the wood, and it stays close to the skin." },
    ],
  },
  burn: {
    5: [
      { t: "Clean smoke", b: "Very little smoke and no headache, which I cannot say for the market agarbatti. The room still smells of it the next morning." },
      { t: "For the evening lamp", b: "We burn a little every evening with the lamp. It is the first thing guests mention, and it does not fight with the flowers." },
      { t: "Smells of the wood, not of perfume", b: "You can smell the sandalwood itself, not a perfume made to imitate it. The difference was obvious the first time I lit it." },
    ],
    4: [
      { t: "Good, burns a little fast", b: "Lovely scent and very little smoke. It burns a little faster than I expected, so I order two at a time now." },
      { t: "Lovely, the outer box was crushed", b: "The scent is exactly right. The outer box arrived slightly crushed, though everything inside was fine." },
    ],
  },
  brass: {
    5: [
      { t: "Heavy, well cast", b: "Heavier than it looks and properly finished underneath, with no rough edges from the mould. It sits steady beside the lamp." },
      { t: "Holds a stick and a cone", b: "It takes both the sticks and the cones, and the ash stays on the tray instead of the shelf." },
      { t: "Tamarind brings it back", b: "It dulled after a few weeks of daily use. Rubbed with tamarind as the card says, and it came back bright in a minute." },
      { t: "Made by a family foundry", b: "I liked knowing it was cast by a family foundry in Karnataka. It looks like the brass in my grandmother's puja room." },
      { t: "A good pair with the incense", b: "Bought it with the sandalwood sticks. They suit each other, and it is the right size for a small altar." },
    ],
    4: [{ t: "Beautiful, a little small", b: "Well made and properly heavy. It is smaller than I pictured, so check the size before you order." }],
  },
  paste: {
    5: [
      { t: "Cool on the skin", b: "The paste goes on cool and dries pale gold. The fragrance stays on the skin long after it is washed off." },
      { t: "Real chandan at last", b: "This is the chandan I remember from the temple: pale, fine and fragrant. The market powders I had been buying smelled of nothing." },
    ],
    4: [
      { t: "Good, a little goes far", b: "Very good quality. A small amount makes enough paste for a week, so it is better value than it first looks." },
      { t: "Lovely, wish it closed tighter", b: "The chandan itself is excellent. I wish the packing closed a little tighter; I keep it in a steel dabba to hold the fragrance in." },
    ],
  },
  soap: {
    5: [
      { t: "The bathroom smells of it", b: "The whole bathroom smells of sandalwood after a bath, and the bar lasts more than a month on a draining dish." },
      { t: "Gentle on dry skin", b: "My skin is dry in winter and this does not tighten it the way most soaps do. The scent is soft and real." },
    ],
    4: [{ t: "Good, wish it came in threes", b: "Lovely soap, and the paper wrap is a nice touch. I would buy three at once if they sold them that way." }],
  },
  beads: {
    5: [
      { t: "The scent rises as they warm", b: "Cold from the box they smell of very little. After a few minutes in the hand the beads warm and the fragrance comes up, as the page said." },
      { t: "Even, well-knotted beads", b: "Every bead is the same size and the knots are tight and neat. After two months of daily use nothing has loosened." },
      { t: "Pale and smooth", b: "The beads are a soft pale gold and smooth from the start. They have gone a shade warmer in my hand since." },
      { t: "Bought for my mother", b: "Bought for my mother. She uses it every morning and says the fragrance keeps her company." },
    ],
    4: [{ t: "Lovely, lighter than I expected", b: "The fragrance is beautiful. The beads are lighter in the hand than red sandalwood, which I had not expected, but that is the wood." }],
    3: [{ t: "Scent fades between uses", b: "Good beads, well made. The fragrance is faint when they sit in the box and only comes back when I use them. Probably how it should be." }],
  },
  carving: {
    5: [
      { t: "Fine, even work", b: "The cuts are clean and even all the way round, the kind of work you only see in Mysuru now. The photographs undersell it." },
      { t: "It still smells of sandalwood", b: "Months later it still smells of sandalwood whenever I pick it up. Warm it in the hand and the scent comes straight back." },
      { t: "One carver, and it shows", b: "You can see one hand made this: small differences in the work that a machine would never leave, and I like it more for them." },
      { t: "Arrived perfectly packed", b: "Wrapped in cloth inside a fitted box, with the lot record. Nothing was chipped or scratched after the journey." },
    ],
    4: [
      { t: "Beautiful, smaller than I pictured", b: "Fine work and a lovely scent. It is smaller than the photographs suggested to me, so read the size before ordering." },
      { t: "Lovely, a day late", b: "The carving is beautiful and well finished. It took a day longer than promised to arrive, and the studio told me in advance." },
    ],
    3: [{ t: "Scent is faint", b: "Beautiful work, but the scent is fainter than I expected. It comes back when the wood is warm, so I keep it near me rather than on a shelf." }],
  },
  fan: {
    5: [
      { t: "Light comes through every leaf", b: "The piercing is so fine that the light shows through each leaf. It is lighter in the hand than I expected for something so detailed." },
      { t: "It scents the air it moves", b: "Open it and fan for a moment, and the sandalwood rises from the wood. Folded in its box, it keeps the drawer fragrant." },
    ],
    4: [
      { t: "Beautiful, handle it gently", b: "Exquisite carving. The ribs are thin, so I open it slowly and keep it in its box between uses." },
      { t: "Lovely, wish it came with a stand", b: "The fan is beautiful and I would like to show it open. A small stand would make it perfect; for now it lives in its box." },
    ],
    3: [{ t: "Fragrance is quiet", b: "Fine work, truly. The scent is quieter than I imagined and needs the fan to move before you notice it." }],
  },
  tray: {
    4: [{ t: "Beautiful, order early", b: "The trays were beautiful and every guest noticed. Order early: ten trays took the full time they quoted." }],
  },
};

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Seeded letters keep their stars, author, date and replies; only a text that does not fit the piece is rewritten. */
export function fitLetters<R extends Review>(list: R[], p: Product): R[] {
  const kind = kindOf(p);
  const pool = POOLS[kind];
  const used: Partial<Record<Review["rating"], number>> = {};
  const offset = hash(p.slug);
  const seeded = (id: string) => id.startsWith(`${p.slug}-s`) && /^\d+$/.test(id.slice(p.slug.length + 2));
  // walk the seeded letters in a fixed order (their ids), so a letter keeps its text however the column is sorted
  const order = list.filter((r) => seeded(r.id)).sort((a, b) => a.id.localeCompare(b.id, "en", { numeric: true }));
  const swap = new Map<string, Letter>();
  for (const r of order) {
    const fits = FITS[r.title];
    if (!fits || fits.includes(kind)) continue;
    const choices = pool?.[r.rating];
    if (!choices?.length) continue;
    const k = used[r.rating] ?? 0;
    used[r.rating] = k + 1;
    swap.set(r.id, choices[(offset + k) % choices.length]);
  }
  if (!swap.size) return list;
  return list.map((r) => {
    const s = swap.get(r.id);
    return s ? { ...r, title: s.t, body: s.b } : r;
  });
}

/**
 * A piece's name set inside a sentence after "the": lower case, but places, gods and the 2011 editions keep their
 * capitals ("the Mysuru carved fan"), a leading "The" is dropped (no "the the mala box"), and the bead count goes.
 */
const KEEP_CASE = /^(Mysuru|Ganesha|Saraswati|Raktachandan|Vault|Reserve|\d+)$/;
export function nameInProse(name: string) {
  return name
    .replace(/^The /, "")
    .split(",")[0]
    .split(" ")
    .map((w) => (KEEP_CASE.test(w) ? w : w.toLowerCase()))
    .join(" ");
}

/** The seeded queries, the same way: one about putting powder on the face only belongs on powder. */
export function fitQueries(list: Question[], p: Product): Question[] {
  const kind = kindOf(p);
  return list.map((q) => {
    if (!q.id.startsWith(`${p.slug}-q`)) return q;
    const answer = (body: string) => q.answers.map((a, i) => (i === 0 && a.fromMaison ? { ...a, body } : a));
    if (kind === "brass") {
      if (q.body.startsWith("Is this heartwood"))
        return { ...q, body: "Is the holder itself sandalwood?", answers: answer("No. It is cast brass, made by a family foundry in Karnataka to sit beside the lamp and hold our sticks and cones.") };
      if (q.body.startsWith("How long does the fragrance"))
        return { ...q, body: "Does it take the dhoop cones as well as sticks?", answers: answer("Yes. It holds a stick or a cone, and the ash falls onto the tray.") };
    }
    if (q.body.startsWith("Can I use the powder on my face") && !(p.slug === "w-chandan-powder" || p.slug === "w-face-pack"))
      return { ...q, body: `How should I look after the ${nameInProse(p.name)}?`, answers: answer(`${p.care} That is all it asks.`) };
    return q;
  });
}
