import type { Review } from "@/lib/shop/reviews";
import { getProduct, type Product } from "@/lib/shop/products";

/**
 * The seeded reviews are drawn from one pool per wood, so an attar can be handed a line about wedding trays
 * or a carved fan. Here every seeded review is checked against what the piece is; one that cannot be about it
 * keeps its author, date, stars and votes, and takes a line written for that kind of piece instead.
 * Stars are never changed, so the counts and averages on cards, the strand and the product page still agree.
 */

type Kind =
  | "worn" // red beads and jewellery
  | "object" // red turned objects and gifting
  | "powder" // red powder, chips, ubtan, tilak
  | "oil" // white oil and attar
  | "burn" // white incense, dhoop, candle, chips
  | "paste" // white chandan stone and powder
  | "skin" // white face pack and soap
  | "bead" // white beads and malas
  | "carving" // white carvings
  | "gift"; // white gifting sets

function kindOf(p: Product): Kind {
  if (p.wood === "red") {
    if (p.category === "powder") return "powder";
    if (p.category === "beads" || p.category === "jewellery") return "worn";
    return "object";
  }
  if (p.slug === "w-boxed-oil") return "oil";
  if (p.slug === "w-chandan-stone" || p.slug === "w-chandan-powder") return "paste";
  switch (p.category) {
    case "oil":
      return "oil";
    case "incense":
      return "burn";
    case "skin":
      return "skin";
    case "w-beads":
      return "bead";
    case "carvings":
      return "carving";
    default:
      return "gift";
  }
}

const RED_SOLID: Kind[] = ["worn", "object"];
const ALL_WHITE: Kind[] = ["oil", "burn", "paste", "skin", "bead", "carving", "gift"];

/** Which kinds of piece each seeded line (by its title) can honestly be about. */
const FITS: Record<string, Kind[] | ((p: Product) => boolean)> = {
  // red
  "Heavier than it looks": RED_SOLID,
  "Colour keeps deepening": ["worn"],
  "Beautiful, slow delivery": RED_SOLID,
  "Bought it as a gift": RED_SOLID,
  "No lacquer, as promised": RED_SOLID,
  "Packaging is excellent": RED_SOLID,
  "Better than the market ones": RED_SOLID,
  "Good, but smaller than I imagined": RED_SOLID,
  "The record matters": ["worn", "object", "powder"],
  // white
  "The fragrance is real": ALL_WHITE,
  "Like my grandmother's house": ["burn", "carving", "gift", "bead", "skin", "paste"],
  "Small bottle, lasts long": ["oil"],
  "Used it for the puja": ["paste"],
  "Honest labelling": ["oil", "burn", "paste", "skin", "gift"],
  "Lovely, wish there was a refill": ["oil"],
  "Gifted at a wedding": (p) => p.slug === "w-wedding-tray",
  "Scent is subtle": ALL_WHITE,
  "Carving is exquisite": (p) => p.slug === "w-mysuru-fan",
};

type Line = { r: Review["rating"]; t: string; b: string };

/** Lines written for each kind of piece, at the star ratings the seeds use. */
const LINES: Record<Kind, Line[]> = {
  worn: [],
  object: [
    { r: 5, t: "Darker every month", b: "It has gone a shade deeper since it arrived, the way the card said it would. Not a crack or a mark on it." },
    { r: 5, t: "Clean work", b: "No tool marks and no filler in the grain. You can see a person made it, and made it carefully." },
  ],
  powder: [
    { r: 5, t: "Colour with nothing added", b: "It colours water a proper deep red. No brick dust, no added dye, and the lot number is printed on the pouch." },
    { r: 5, t: "Our priest approved", b: "The priest at our temple asked where it came from. He said the colour was the real thing." },
    { r: 5, t: "Real raktachandan", b: "I have been sold dyed wood more than once. This is the heartwood itself, deep red all the way through." },
    { r: 5, t: "Clear notes on use", b: "The card says what it is for, how much to use and how to store it. A small thing, but nobody else bothers." },
    { r: 5, t: "Sealed and dated", b: "Arrived in a sealed pouch with the batch number and the date it was packed. It has kept its colour in the jar." },
    { r: 4, t: "Good, plain packing", b: "Exactly what was promised. The pouch is plain, which I prefer, but a jar would be easier to store." },
    { r: 4, t: "Fine, a day slow", b: "The material is excellent. Delivery to Pune took five working days, one longer than the site said." },
    { r: 3, t: "Smaller pack than I expected", b: "Good quality and honestly described, but check the weight before ordering. I went through it faster than I thought." },
  ],
  oil: [
    { r: 5, t: "Warm, not sharp", b: "On the skin it starts soft and grows warmer through the day. No alcohol edge at all, unlike the attars I bought before." },
    { r: 5, t: "Proper Mysore oil", b: "My father used Mysore sandalwood oil for forty years. He smelled this once and asked me to order another." },
    { r: 5, t: "The test report helped", b: "They sent the lot's test report when I asked. After being sold blended oil twice, that is why I ordered." },
    { r: 5, t: "Every morning now", b: "A touch at the wrist in the morning and it is still there in the evening, close to the skin." },
  ],
  burn: [
    { r: 5, t: "Clean smoke", b: "Very little smoke and none of that burnt-perfume smell. The room smells of wood for the rest of the evening." },
    { r: 5, t: "With the evening lamp", b: "We light it with the evening lamp. Gentle enough that nobody minds, even my mother, who dislikes incense." },
    { r: 5, t: "Lasts the whole evening", b: "It burns slowly and evenly, and the fragrance is there from start to finish, not only at the first light." },
    { r: 4, t: "Lovely, small box", b: "Excellent fragrance. I would buy a larger box if they made one." },
    { r: 4, t: "Gentle, a bit too gentle", b: "Beautiful in a small room. In our hall you have to stand close to notice it." },
  ],
  paste: [
    { r: 5, t: "Pale gold paste", b: "With a little water it makes a smooth, pale gold paste that smells of the wood. Cool on the forehead." },
    { r: 5, t: "Like the temple chandan", b: "Smells exactly like the chandan the priest gives at the temple in Mysuru. My children noticed it first." },
    { r: 4, t: "Takes a little practice", b: "Lovely paste once you get the water right. My first few tries came out too thin." },
    { r: 4, t: "Wish there was a bigger size", b: "The chandan is excellent and we use it every day. A larger size would last a household longer." },
  ],
  skin: [
    { r: 5, t: "Gentle on my skin", b: "I have sensitive skin and had no reaction at all. It smells of sandalwood, not of perfume." },
    { r: 5, t: "My mother's routine", b: "My mother used chandan every week when I was young. This is the first one that smells the way hers did." },
    { r: 5, t: "Short ingredient list", b: "Everything in it is written on the label, and the list is short. That is why I chose it." },
    { r: 4, t: "Worth it, not cheap", b: "It is worth the price, but it is not cheap for something I use every day." },
    { r: 4, t: "Good, slow to arrive", b: "The product is lovely. Delivery to Kochi took a week." },
  ],
  bead: [
    { r: 5, t: "Warms in the hand", b: "The beads give off their fragrance as they warm during japa. Weeks later it is still there." },
    { r: 5, t: "Even beads, good knots", b: "Every bead is the same size and there is a knot between each one, so they do not rub. Well strung." },
    { r: 5, t: "Worn to work", b: "I wear it to the office. Colleagues ask what the scent is, and it is only the wood." },
    { r: 5, t: "Bought two", b: "Kept one and gave one to my brother. Both came with the same card and the same lot number." },
    { r: 4, t: "Thread a little stiff", b: "The beads are beautiful. The thread was stiff for the first week, then softened." },
    { r: 4, t: "Paler than the photos", b: "A very pale cream, lighter than it looked on screen. Not a complaint, just good to know." },
  ],
  carving: [
    { r: 5, t: "Fine work", b: "You can see each cut. The detail holds up when you look closely, and the back is finished as carefully as the front." },
    { r: 5, t: "Still fragrant", b: "It has been on the shelf for months and still smells of sandalwood when you pick it up." },
    { r: 5, t: "Knowing the carver", b: "The card that came with it says who carved it in Mysuru, and when. That means a lot to me." },
    { r: 5, t: "Finished by hand", b: "The edges are smooth and the oil finish is even. It feels made, not manufactured." },
    { r: 4, t: "Beautiful, small", b: "Lovely piece, but smaller than I imagined. Check the size before you order." },
    { r: 4, t: "Packed well, slow", b: "Arrived without a scratch in very careful packing, but took six days to Delhi." },
  ],
  gift: [
    { r: 5, t: "Opened like a present should", b: "Everything has its place in the box and the card explains each piece. My sister kept the box afterwards." },
    { r: 5, t: "Ordered a second one", b: "We gave the first one away and ordered another for ourselves." },
    { r: 5, t: "An easy gift for elders", b: "Bought it for my in-laws. They knew exactly what it was and used it the same week." },
    { r: 4, t: "Lovely, plain card", b: "A beautiful set. I wish the gift card had more room for a message." },
    { r: 4, t: "Order early", b: "Arrived well packed, but two days after the date we needed it. Leave yourself time." },
  ],
};

const fits = (title: string, p: Product, kind: Kind) => {
  const f = FITS[title];
  if (!f) return true;
  return typeof f === "function" ? f(p) : f.includes(kind);
};

/** Seeded reviews for this piece, each one about this kind of piece. The customer's own reviews pass through untouched. */
export function fitReviews<T extends Review>(slug: string, reviews: T[]): T[] {
  const p = getProduct(slug);
  if (!p) return reviews;
  const kind = kindOf(p);
  const pool = LINES[kind];
  const used = new Set<string>();
  const seeded = (r: T) => r.id.startsWith(`${slug}-s`);
  return reviews.map((r) => {
    if (!seeded(r) || fits(r.title, p, kind)) return r;
    const line = pool.find((l) => l.r === r.rating && !used.has(l.t)) ?? pool.find((l) => !used.has(l.t) && Math.abs(l.r - r.rating) <= 1);
    if (!line) return r;
    used.add(line.t);
    return { ...r, title: line.t, body: line.b };
  });
}
