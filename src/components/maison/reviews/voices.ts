import type { Product } from "@/lib/shop/products";
import type { Question, Review } from "@/lib/shop/reviews";

/**
 * The seeded reviews in the shared catalogue come from one pool per wood, so a mala could be
 * praised for its trays and a fan asked about face powder. Here each kind of piece speaks for
 * itself. The seeded ratings, authors, dates and votes are kept exactly (so every star count on
 * the site still agrees); only the words are swapped for ones that fit the piece.
 * Placeholder customer voices until real reviews exist.
 */

type Voice = { r: 5 | 4 | 3; t: string; b: string };
type QA = { q: string; a: string };
type VoiceSet = { voices: Voice[]; qa: QA[] };

/* Each set has six five-star, two four-star and one three-star voice: the most a seeded product draws. */
const SETS: Record<string, VoiceSet> = {
  /* ---------------- red sandalwood ---------------- */
  "r-strand": {
    voices: [
      { r: 5, t: "The colour keeps deepening", b: "Three months of daily use and the beads have gone from brick to almost wine where my fingers move. Exactly what the card said would happen." },
      { r: 5, t: "Knots are tight and even", b: "Every knot sits the same distance from the bead. My old mala slipped and gaped; this one runs through the fingers without a catch." },
      { r: 5, t: "Heavier than it looks", b: "The weight was the first surprise. It sits in the palm like something that matters, and the beads are dense all the way through." },
      { r: 5, t: "Better than the temple-shop ones", b: "I have bought red sandalwood beads near temples for years. These are even in colour, with no dye coming off on the hands." },
      { r: 5, t: "No lacquer, as promised", b: "You can feel the grain on every bead. No shine, no varnish smell. It feels like wood, not like a product." },
      { r: 5, t: "The batch record matters", b: "Lot number, origin and the initials of the person who strung it. I have not seen another seller in India do this for red sandalwood." },
      { r: 4, t: "Lovely, the pouch could be firmer", b: "The beads are perfect. The linen pouch is soft, but I wanted something sturdier for travel, so I keep it in a tin." },
      { r: 4, t: "Beautiful, delivery took a day longer", b: "The strand is lovely and the finish very smooth. It took five working days to Pune, one more than promised." },
      { r: 3, t: "Check the bead size", b: "Well made and honest, but I should have chosen a larger bead. Read the sizes carefully if you have big hands." },
    ],
    qa: [
      { q: "Will the colour come off on my hands or clothes?", a: "No. The beads are turned from solid heartwood and finished with a little natural oil, never dyed, so nothing rubs off." },
      { q: "Can I wear it in the shower?", a: "Better not. Water dulls the surface and can loosen the knots over time. Take it off to bathe and wipe it dry if it gets wet." },
      { q: "Is it legal to buy red sandalwood?", a: "Yes, from documented lots. Its trade is controlled under CITES Appendix II, and every strand we sell carries its paperwork." },
    ],
  },
  "r-object": {
    voices: [
      { r: 5, t: "Heavier than it looks", b: "The weight was the first surprise. The colour is deeper in person than in the photographs, and the batch card was a nice touch." },
      { r: 5, t: "Darkens where it is handled", b: "Two months in and it has gone from brick to a deep wine where my hand meets it. It gets better with use." },
      { r: 5, t: "Bought it for my father", b: "He read the provenance record before he even looked at the piece, which says a lot. It is on his desk now." },
      { r: 5, t: "No lacquer, as promised", b: "You can feel the grain. No shiny coating, no smell of varnish. The turning is clean and the edges are soft." },
      { r: 5, t: "Better than the market ones", b: "I have bought red sandalwood from shops for years. This is denser and the colour is even all the way through." },
      { r: 5, t: "The record matters", b: "Batch number, lot origin, who finished it. I have not seen another seller in India do this for red sandalwood." },
      { r: 4, t: "Packaging is good", b: "Linen wrap, a card and the record. I would have liked a slightly firmer box, but the piece arrived perfect." },
      { r: 4, t: "Beautiful, slow delivery", b: "The piece is lovely and the finish is very smooth. Took five working days to Pune, one more than promised." },
      { r: 3, t: "Smaller than I imagined", b: "Well made and honest. Check the dimensions, it is smaller in the hand than the photographs suggested to me." },
    ],
    qa: [
      { q: "Does red sandalwood have a fragrance?", a: "Almost none. Red sandalwood is valued for its colour and density; the fragrant sandalwood is white sandalwood, Santalum album." },
      { q: "Will the colour fade in sunlight?", a: "It slowly darkens rather than fades, but keep it out of strong direct sun so the colour stays even." },
      { q: "How do I look after it?", a: "Wipe it with a soft dry cloth. Once a season, rub in a drop of natural oil and leave it overnight. No polish, no water." },
    ],
  },
  "r-powder": {
    voices: [
      { r: 5, t: "The colour is true", b: "Mixed with a little water it turns a deep, clean red. No orange dye, no chalkiness. This is what raktachandan should look like." },
      { r: 5, t: "Fine and even", b: "Sieved well. No splinters, no grit, and it takes water evenly. I have bought coarse, gritty batches elsewhere." },
      { r: 5, t: "Used it for the puja", b: "Made fresh paste for the first time in years. The colour held on the forehead all morning." },
      { r: 5, t: "Honest labelling", b: "The lot is printed on the jar and the ingredients are listed plainly. After so much coloured sawdust in the market, that earns five stars." },
      { r: 5, t: "Like my grandmother made it", b: "She used to grind red sandalwood for my skin when I was small. This brought that back, the colour and the earthy smell." },
      { r: 5, t: "Packed with care", b: "Sealed jar, a paper sleeve and the record. Not a speck had escaped on the way to Chennai." },
      { r: 4, t: "Good, wish the jar were bigger", b: "Excellent quality. I go through it faster than I expected, so a larger size would be welcome." },
      { r: 4, t: "Lovely, needs patience", b: "It takes a few minutes to bring to a smooth paste. Worth it, but not something to rush in the morning." },
      { r: 3, t: "Read the use notes first", b: "Good material. I tried it neat on my face and it was a little drying; mixed with milk as the card suggests, it is fine." },
    ],
    qa: [
      { q: "Can I use it on my skin?", a: "Traditionally, yes, as a paste with water, milk or rose water. We list everything that is in the jar; please patch test first." },
      { q: "Will it stain?", a: "It can colour cloth and stone, as raktachandan always has. Use an old cloth and rinse bowls soon after." },
      { q: "Is this made from offcuts?", a: "Yes, from heartwood offcuts of our own turning, so nothing is wasted. It is the same documented lot as the pieces." },
    ],
  },
  "r-gift": {
    voices: [
      { r: 5, t: "The record made the gift", b: "My uncle read the batch record before he opened the box. It turned a present into a story he now tells everyone." },
      { r: 5, t: "Our corporate gift this year", b: "We sent forty to clients. Every box arrived perfect, and three of them wrote to ask where they were from." },
      { r: 5, t: "The box itself is a keeper", b: "Dovetailed, lined in raw cotton, closes with a soft click. Nobody will throw this one away." },
      { r: 5, t: "Heavier than it looks", b: "The weight surprised everyone who held it. The red is deeper in person than in the photographs." },
      { r: 5, t: "Gift note done properly", b: "Handwritten, on a good card, and no price anywhere in the box, exactly as promised." },
      { r: 5, t: "For my parents' anniversary", b: "Forty years married. They put it on the shelf where the wedding photograph sits, which is the best review I can give." },
      { r: 4, t: "Lovely, order early", b: "Beautiful in every way. It took a day longer than I hoped for a birthday, so give it a week." },
      { r: 4, t: "Wish there were more box sizes", b: "The piece and the wrapping are excellent. I would have liked a smaller box option for a single item." },
      { r: 3, t: "Beautiful but expensive", b: "Very well made and the record is a lovely touch. Still, it is a lot for a gift, so think about who it is for." },
    ],
    qa: [
      { q: "Can you leave the price out?", a: "Always. Prices are never inside the box, and the gift note is handwritten on a card." },
      { q: "Do you do larger corporate orders?", a: "Yes. Write to us with the number and the date, and we will hold a single lot so every box matches." },
      { q: "Can the gift be sent straight to someone else?", a: "Yes. Put their address at checkout and add a gift note; the invoice is sent only to you." },
    ],
  },
  "r-jewel": {
    voices: [
      { r: 5, t: "I wear it every day", b: "It has darkened a little where it touches the skin, which I love. The grain changes with the light." },
      { r: 5, t: "The silver work is excellent", b: "Clean setting, no glue showing, and the silver has a proper weight. This is jewellery, not a craft piece." },
      { r: 5, t: "People ask about it", b: "At least once a week someone asks what it is. I end up telling them about the batch record." },
      { r: 5, t: "Comfortable to wear", b: "Smooth everywhere it touches, no sharp edges. I forget I have it on until someone notices it." },
      { r: 5, t: "Grain is one of a kind", b: "Mine has a dark streak that runs right across it. Nobody else will have the same piece, which is the point." },
      { r: 5, t: "Arrived beautifully", b: "In a linen pouch with a polishing cloth and its record. It felt like opening something that had been made for me." },
      { r: 4, t: "Check the size carefully", b: "Beautiful piece. I had to think about sizing more than I expected, so measure before you order." },
      { r: 4, t: "Lovely, mind the water", b: "I wore it swimming once and it lost a little shine. Fine again after a drop of oil, but now I take it off." },
      { r: 3, t: "Smaller than the photographs", b: "Well made and honest. It is more delicate in person than the photographs suggested to me." },
    ],
    qa: [
      { q: "Can I wear it in water?", a: "Take it off to bathe or swim. Water dulls the wood; if it does get wet, dry it and rub in a drop of natural oil." },
      { q: "Is the silver hallmarked?", a: "Yes. Every silver part is sterling and carries its hallmark." },
      { q: "Will the wood change colour?", a: "Slowly, yes. Red sandalwood darkens where it is worn and handled, which most people come to love." },
    ],
  },

  /* ---------------- white sandalwood ---------------- */
  "w-oil": {
    voices: [
      { r: 5, t: "The fragrance is real", b: "You can tell this is heartwood. Soft, creamy and it stays for hours, nothing like the sharp synthetic ones." },
      { r: 5, t: "Like a Mysuru home", b: "Opened the box and the room smelled the way my grandmother's house used to. Very happy." },
      { r: 5, t: "Honest labelling", b: "The lot is printed on the bottle and the batch test report is in the box. After so many fake sandalwood oils, that alone earns five stars." },
      { r: 5, t: "It changes on the skin", b: "Woody at first, then milky and sweet after an hour. It is still there when I go to bed." },
      { r: 5, t: "Lasts and lasts", b: "Two months of daily use and I have barely made a dent. A little goes a very long way." },
      { r: 5, t: "Gentle on the skin", b: "I react to most perfumes. This has caused nothing at all, and my husband keeps borrowing it." },
      { r: 4, t: "Wish there was a refill", b: "The bottle is beautiful and the oil excellent. A refill option would make it perfect." },
      { r: 4, t: "Worth it, but not cheap", b: "Expensive for the size, but you are paying for real heartwood, and you can smell it." },
      { r: 3, t: "Scent is subtle", b: "Good quality, but if you are used to strong perfumes this will feel very quiet. That is probably the point." },
    ],
    qa: [
      { q: "Is this pure sandalwood oil?", a: "The heartwood oil, the reserve and the attar's base are pure Santalum album oil. The body oil is sandalwood in cold-pressed sesame. Every bottle lists what is inside." },
      { q: "How long does the oil keep?", a: "A decade or more if kept closed, cool and out of the sun. Like wine, good sandalwood oil softens with age." },
      { q: "Can I put it straight on the skin?", a: "A drop on the pulse points is the traditional way. If your skin is sensitive, mix it with a little carrier oil and patch test first." },
    ],
  },
  "w-burn": {
    voices: [
      { r: 5, t: "Smells like real sandalwood", b: "Soft and woody, not the sharp perfume of market incense. The room still smells of it the next morning." },
      { r: 5, t: "Part of my morning puja now", b: "Lit before the lamp every day for a month. Clean, calm, and no headache, which I always got from the cheap ones." },
      { r: 5, t: "Honest labelling", b: "The lot is on the box and every ingredient is listed. No charcoal dust, no synthetic fragrance, as promised." },
      { r: 5, t: "Like a temple in Mysuru", b: "My mother lit it and said it smelled like the Chamundi Hills of her childhood. That is the review." },
      { r: 5, t: "Burns slowly and evenly", b: "It lasts much longer than I expected and never flares. Worth the price for that alone." },
      { r: 5, t: "Gentle in a small flat", b: "Our flat is small and most incense is too much. This fills the room softly without taking it over." },
      { r: 4, t: "Lovely, wish the box were bigger", b: "Excellent quality. I am already on my second box, so a larger pack would be welcome." },
      { r: 4, t: "Good, packaging could be sturdier", b: "The fragrance is beautiful. The outer box arrived a little crushed, though nothing inside was broken." },
      { r: 3, t: "Quieter than I am used to", b: "Good quality, but if you like strong incense this will feel very light. That is probably the point." },
    ],
    qa: [
      { q: "Is there charcoal or synthetic fragrance in it?", a: "No. It is sandalwood powder, natural binders and, in the candle, heartwood oil in coconut wax. Every ingredient is listed on the box." },
      { q: "Is the smoke harsh?", a: "It is soft and low. Burn it in a ventilated room, as with any incense, and keep it away from curtains." },
      { q: "How should I store it?", a: "Closed, dry and away from sun so the fragrance stays in. Kept that way it lasts for years." },
    ],
  },
  "w-paste": {
    voices: [
      { r: 5, t: "Fresh paste, finally", b: "Ground fresh chandan for the first time in years. Pale gold, cool on the forehead, and the fragrance filled the room." },
      { r: 5, t: "The stone is perfect", b: "Heavy granite with the right roughness. The stick grinds smoothly and the paste comes out fine in a minute." },
      { r: 5, t: "Like my grandmother's", b: "She had a stone exactly like this. Grinding the stick in the morning has brought back the whole ritual." },
      { r: 5, t: "The stick is real heartwood", b: "You smell it the moment you start grinding. No sapwood, no dyed wood, as the lot card says." },
      { r: 5, t: "Will last for years", b: "A few strokes a day barely wears the stick. This set will outlive me." },
      { r: 5, t: "Honest and well packed", b: "The lot is on the card and the stone came wrapped so well that not a corner was chipped." },
      { r: 4, t: "Takes a little practice", b: "The first few days my paste was too watery. A few drops at a time is the trick. Lovely now." },
      { r: 4, t: "Heavier than expected", b: "The stone is beautiful but heavy, so it lives on the shelf by the lamp. Not one to carry around." },
      { r: 3, t: "Smaller stick than I imagined", b: "Good quality and honest. The stick is shorter than the photograph made me think, so check the size." },
    ],
    qa: [
      { q: "How much water do I use?", a: "A few drops at a time. Grind in slow circles and add a drop more only when the paste begins to dry." },
      { q: "How do I clean the stone?", a: "Rinse it with plain water and let it dry in the air. No soap, which stays in the grain of the granite." },
      { q: "Can the paste go on the face?", a: "Traditionally, yes, a little on the forehead or as a cooling paste. Please patch test first if your skin is sensitive." },
    ],
  },
  "w-holder": {
    voices: [
      { r: 5, t: "Heavy and steady", b: "Solid brass with real weight. It never tips over, even with a tall stick in it." },
      { r: 5, t: "Catches every bit of ash", b: "Nothing on the shelf afterwards. I wipe it once a week and that is all." },
      { r: 5, t: "Looks right beside the lamp", b: "The brass matches our old lamp. It looks as if it has always been in the puja room." },
      { r: 5, t: "Well finished", b: "Clean casting, no rough edges, and the base is felted so it does not scratch the wood." },
      { r: 5, t: "Bought it with the incense", b: "The sticks sit at exactly the right angle. Worth getting the two together." },
      { r: 5, t: "Takes cones too", b: "I use it for dhoop cones as well, which it holds perfectly in the centre." },
      { r: 4, t: "Polish it now and then", b: "Beautiful, but brass darkens. A little tamarind once a month brings it back." },
      { r: 4, t: "Smaller than I pictured", b: "Very well made. It is more compact than I imagined, which suits a small shelf." },
      { r: 3, t: "Good, a little plain", b: "Honest and solid. I hoped for a little more decoration, but it does its job perfectly." },
    ],
    qa: [
      { q: "Does it take every kind of incense?", a: "It holds standard bamboo sticks upright and has a flat centre for cones." },
      { q: "How do I clean the brass?", a: "Wipe the ash with a dry cloth. Once a month, tamarind or lemon with a little salt brings back the shine; rinse and dry." },
      { q: "Is it made of sandalwood?", a: "No, it is cast brass, made to sit beside the lamp. The sandalwood is in the incense you burn on it." },
    ],
  },
  "w-skin": {
    voices: [
      { r: 5, t: "Gentle on sensitive skin", b: "I react to most products. This has caused nothing at all, and my skin feels calm after." },
      { r: 5, t: "Smells of real sandalwood", b: "Soft and woody, not perfumed. The fragrance stays faintly on the skin for an hour or two." },
      { r: 5, t: "Honest labelling", b: "Every ingredient is on the label and there are very few of them. That alone earns five stars." },
      { r: 5, t: "Like my grandmother's routine", b: "She used chandan every week. Using this brought the whole ritual and the smell of her house back." },
      { r: 5, t: "Pale gold, as it should be", b: "The colour of real white heartwood, not the bleached white of the cheap ones. You can tell the difference." },
      { r: 5, t: "A little goes a long way", b: "A month in and I have used very little. Better value than it first looks." },
      { r: 4, t: "Lovely, wish it came larger", b: "Excellent quality. I would buy a larger size if there were one." },
      { r: 4, t: "Good, read the notes", b: "Works beautifully once I followed the card. My first try, done my own way, was not as good." },
      { r: 3, t: "Subtle fragrance", b: "Good quality, but if you expect a strong perfume this will feel very quiet. That is probably the point." },
    ],
    qa: [
      { q: "Can I use it on my face?", a: "Yes, it is made for the face and body. We list every ingredient; please patch test first if your skin is sensitive." },
      { q: "Is anything added for fragrance?", a: "No. The scent comes from the sandalwood heartwood itself. Nothing synthetic is added." },
      { q: "How long does it keep?", a: "Kept closed, dry and out of the sun, at least a year. The date of the lot is on the label." },
    ],
  },
  "w-strand": {
    voices: [
      { r: 5, t: "The scent rises as it warms", b: "Cold in the box, then after a few minutes in the hand the sandalwood comes up. It still does it every morning." },
      { r: 5, t: "Pale and even", b: "The beads are the colour of real white heartwood, with fine grain. No bleaching, no dye." },
      { r: 5, t: "Knots are tight and even", b: "Every knot sits the same distance from the bead. It runs smoothly through the fingers without a catch." },
      { r: 5, t: "Better than the temple-shop ones", b: "Most sandalwood beads I have bought smelled of perfume for a week and then of nothing. These smell of wood, months later." },
      { r: 5, t: "Honest labelling", b: "The lot is on the card and it says plainly that the beads are heartwood. After so many fakes, that matters." },
      { r: 5, t: "Calming to hold", b: "I keep it by my bed. The faint scent alone is enough to slow me down at night." },
      { r: 4, t: "Lovely, the pouch could be firmer", b: "The beads are perfect. The linen pouch is soft; I keep it in a closed box to hold the scent." },
      { r: 4, t: "Scent is gentle", b: "Beautiful beads. I expected a stronger fragrance, but warmed in the hand it is just right." },
      { r: 3, t: "Check the bead size", b: "Well made and honest, but smaller beads than I wanted. Read the sizes carefully." },
    ],
    qa: [
      { q: "Will the fragrance fade?", a: "Slowly, over years. Keep the beads in a closed box when you are not using them, and warm them in the hand to wake the scent." },
      { q: "Are the beads heartwood or sapwood?", a: "Heartwood only. Sapwood has no fragrance, so we never use it." },
      { q: "Can I wear it in the shower?", a: "Better not. Water dulls the scent and can loosen the knots. Take it off to bathe." },
    ],
  },
  "w-carving": {
    voices: [
      { r: 5, t: "Carving is exquisite", b: "The detail is finer than in the photographs. You can see the marks of the hand tools if you look closely, which I love." },
      { r: 5, t: "It still smells of sandalwood", b: "Months later, warm it in the hand and the fragrance comes back. Our cupboard smells of it too." },
      { r: 5, t: "Mysuru work, as it should be", b: "My father was from Mysuru. He held it, turned it over and said this is the real thing." },
      { r: 5, t: "Honest labelling", b: "The lot is on the card and the carver is named. That alone earns five stars." },
      { r: 5, t: "Pale gold and unvarnished", b: "No lacquer, so the grain and the scent come through. It has warmed in colour slightly since it arrived." },
      { r: 5, t: "Arrived perfectly", b: "Wrapped so carefully that not a single fine edge was damaged on the way to Delhi." },
      { r: 4, t: "Beautiful, delivery took longer", b: "The piece is lovely. It took a day longer than promised to reach Kolkata." },
      { r: 4, t: "Handle it gently", b: "Exquisite, but delicate. It lives on a shelf now rather than in daily use." },
      { r: 3, t: "Smaller than I imagined", b: "Well made and honest. Check the dimensions, it is smaller in the hand than the photographs suggested to me." },
    ],
    qa: [
      { q: "Will the fragrance last?", a: "For years. Warm the piece in the hand to wake it, and keep it away from heat and sun so the oil stays in the wood." },
      { q: "Is it carved by hand?", a: "Yes, by a single carver in the Mysuru tradition. The carver's name is on the card in the box." },
      { q: "How do I clean it?", a: "A soft dry brush for the carving and a dry cloth for the surface. No water, no polish." },
    ],
  },
  "w-gift": {
    voices: [
      { r: 5, t: "Every guest asked about it", b: "We gave it at a family wedding and everyone asked where it was from. The fragrance filled the hall." },
      { r: 5, t: "Beautifully put together", b: "Everything sits in its own place, wrapped in linen. Opening it felt like a small ceremony." },
      { r: 5, t: "The fragrance is real", b: "You can tell it is heartwood. Soft and lasting, nothing like the synthetic gift sets in the malls." },
      { r: 5, t: "Gift note done properly", b: "Handwritten on a good card, and no price anywhere in the box, exactly as promised." },
      { r: 5, t: "For my mother's sixtieth", b: "She uses every piece of it each morning. The best present I have given in years." },
      { r: 5, t: "Honest labelling", b: "Each item carries its lot. Our clients noticed, which is why we will order again." },
      { r: 4, t: "Order early", b: "Lovely in every way. It took a day longer than I hoped, so give it a week before the occasion." },
      { r: 4, t: "Wish there were more sizes", b: "Beautiful set. A smaller version would be perfect for return gifts." },
      { r: 3, t: "Beautiful but expensive", b: "Very well made, and the fragrance is real. Still, it is a lot for a gift, so think about who it is for." },
    ],
    qa: [
      { q: "Can you leave the price out?", a: "Always. Prices are never inside the box, and the gift note is handwritten on a card." },
      { q: "Do you take larger orders for weddings?", a: "Yes. Write to us with the number and the date, and we will hold one lot so every set matches." },
      { q: "Can it be sent straight to someone else?", a: "Yes. Put their address at checkout and add a gift note; the invoice is sent only to you." },
    ],
  },
};

const BY_CATEGORY: Record<Product["category"], string> = {
  beads: "r-strand",
  objects: "r-object",
  powder: "r-powder",
  gifting: "r-gift",
  jewellery: "r-jewel",
  oil: "w-oil",
  incense: "w-burn",
  skin: "w-skin",
  "w-beads": "w-strand",
  carvings: "w-carving",
  "w-gifting": "w-gift",
};

/** Pieces that differ from the rest of their kind. */
const BY_SLUG: Partial<Record<string, string>> = {
  "w-chandan-stone": "w-paste",
  "w-incense-holder": "w-holder",
  "w-scented-pendant": "w-carving",
};

function setFor(p: Product): VoiceSet {
  return SETS[BY_SLUG[p.slug] ?? BY_CATEGORY[p.category]];
}

/** Seeded ids are `${slug}-s${n}` for reviews and `${slug}-q${n}` for questions; the customer's own start with a letter and a timestamp. */
const seedIndex = (id: string, slug: string, kind: "s" | "q") => (id.startsWith(`${slug}-${kind}`) ? Number(id.slice(slug.length + 2)) : NaN);

/** Rewrite the seeded reviews of one product in its own voice; the customer's own reviews pass through. */
export function voiceReviews<T extends Review>(p: Product, reviews: T[]): T[] {
  const { voices } = setFor(p);
  const used: Record<number, number> = {};
  // walk in a stable order (by seed index) so a review keeps its words whatever the sort
  const index = (id: string) => seedIndex(id, p.slug, "s");
  const seeded = reviews.filter((r) => Number.isInteger(index(r.id))).sort((a, b) => index(a.id) - index(b.id));
  const words = new Map<string, Voice>();
  for (const r of seeded) {
    const k = used[r.rating] ?? 0;
    used[r.rating] = k + 1;
    const pool = voices.filter((v) => v.r === r.rating);
    const v = pool[k % Math.max(1, pool.length)];
    if (v) words.set(r.id, v);
  }
  return reviews.map((r) => {
    const v = words.get(r.id);
    return v ? { ...r, title: v.t, body: v.b } : r;
  });
}

/** Replace the seeded questions with ones about this kind of piece, keeping their ids so local answers stay attached. */
export function voiceQuestions(p: Product, qs: Question[]): Question[] {
  const { qa } = setFor(p);
  return qs.map((q) => {
    const i = seedIndex(q.id, p.slug, "q");
    const x = Number.isInteger(i) ? qa[i] : undefined;
    if (!x) return q;
    return {
      ...q,
      body: x.q,
      answers: q.answers.map((a) => (a.fromMaison && a.id === `${q.id}-a` ? { ...a, body: x.a } : a)),
    };
  });
}
