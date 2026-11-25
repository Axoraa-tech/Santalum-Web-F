/**
 * The seeded reviews in the shared data are written per wood, so an incense stick could show a note
 * about the carved fan. Design 09 keeps each seeded review's rating, author, date and votes and gives
 * it words written for that kind of piece. Each set follows the seed's rating order
 * (5, 5, 4, 5, 5, 4, 5, 3, 5), so the stars, the counts and the averages do not change.
 */
type Words = { t: string; b: string };

const RED_SOLID: Words[] = [
  { t: "Heavier than it looks", b: "The weight was the first surprise. The colour is deeper in person than in the photographs, and the batch card was a nice touch." },
  { t: "Colour keeps deepening", b: "Three months in and it has gone from brick to almost wine where my hand holds it. Exactly what they said would happen." },
  { t: "Beautiful, slow delivery", b: "The piece is lovely and the finish is very smooth. It took five working days to Pune, one more than promised." },
  { t: "Bought it as a gift", b: "Gave it to my father. He read the provenance record before he even looked at the piece, which says a lot." },
  { t: "No lacquer, as promised", b: "You can feel the grain. No shiny coating, no smell of varnish. It feels like wood, not like a product." },
  { t: "Packaging is excellent", b: "Linen pouch, a card and the record. I would have liked a slightly firmer box, but the piece arrived perfect." },
  { t: "Better than the market ones", b: "I have bought red sandalwood from temple shops for years. This is denser and the colour is even all the way through." },
  { t: "Smaller than I imagined", b: "Well made and honest. Check the dimensions carefully; it is smaller in the hand than the photographs suggested to me." },
  { t: "The record matters", b: "Batch number, lot origin, who finished it. I have not seen another seller in India do this for red sandalwood." },
];

const RED_BEADS: Words[] = [
  { t: "The thumb never catches", b: "The beads are even enough that I lose my place far less than with my old mala." },
  { t: "Darker every month", b: "Three months of daily use and the beads have gone from brick to almost wine where my fingers rest." },
  { t: "Lovely, the knot is tight", b: "Beautifully turned beads. The knotting was tight at first and eased after a week of use." },
  { t: "Dense in the hand", b: "You feel each bead. The market malas are light and hollow next to this." },
  { t: "Came with its record", b: "The batch card names the lot and who finished the beads. I keep it in the pouch with the strand." },
  { t: "Beautiful, the pouch is snug", b: "The beads are perfect. The linen pouch is a little small once the strand is wound in." },
  { t: "Bought one for my mother", b: "She uses it every morning now and says the beads stay cool in the hand even in May." },
  { t: "Smaller beads than I pictured", b: "Well made and honest, but check the bead size; I had pictured something larger in the hand." },
  { t: "No lacquer, no smell", b: "Just the wood, finished with oil and wax. It feels like something that will last decades." },
];

const RED_POWDER: Words[] = [
  { t: "The colour is true", b: "A deep brick red, not the dyed orange sold at the market. You can see it is the heartwood." },
  { t: "Exactly as described", b: "The lot and origin are on the label, and the material matches the photographs." },
  { t: "Good, the packing could reseal", b: "The material is excellent. Once opened the pack does not close well, so I moved it to a jar." },
  { t: "As it was used at home", b: "We use it the old way, with a little water before the bath and the puja. It is right." },
  { t: "The record matters", b: "Batch number and lot origin on the card. I have not seen another seller do this for red sandalwood." },
  { t: "Lovely, slow delivery", b: "Exactly what I wanted. It took five working days to reach Pune, one more than promised." },
  { t: "Ordered a second", b: "The first lasted us months. I ordered again for my sister." },
  { t: "Less than I pictured", b: "Good, honest material, but check the weight before ordering; it is less than I had imagined." },
  { t: "Not the market kind", b: "I have bought raktachandan from temple shops for years. This is deeper in colour and has no filler." },
];

const WHITE_OIL: Words[] = [
  { t: "The fragrance is real", b: "Soft, creamy and it stays for hours. Nothing like the sharp synthetic sandalwood I have bought before." },
  { t: "Lasts the whole day", b: "Put on after the bath, I can still smell it in the evening." },
  { t: "Lovely, wish there was a refill", b: "The bottle is beautiful and the oil is excellent. A refill would make it perfect." },
  { t: "Honest labelling", b: "The lot, the distillation date and the test report. After so many fake sandalwood oils, that alone earns five stars." },
  { t: "Like my grandmother's house", b: "Opened the box and the room smelled the way Mysuru homes used to." },
  { t: "Wonderful, slow to arrive", b: "The oil is everything I hoped. Delivery to Kolkata took six working days." },
  { t: "Warms on the skin", b: "It opens up after a few minutes on the skin, softer and sweeter. People ask what I am wearing." },
  { t: "Quieter than I expected", b: "Good quality, but if you are used to strong perfume this will feel very quiet. That is probably the point." },
  { t: "Worth the price", b: "Expensive, and worth it. Real heartwood oil is rare, and this is the real thing." },
];

const WHITE_SMOKE: Words[] = [
  { t: "Smells of the wood, not of perfume", b: "Soft and sweet, like a sandalwood box when it is opened. No sharp synthetic note." },
  { t: "An even, clean burn", b: "It burns evenly to the end, and the room still smells of sandalwood the next morning." },
  { t: "Lovely, a little mild", b: "Beautiful fragrance. In our large front room I light two to fill it." },
  { t: "Our evening puja", b: "Lit at the lamp every evening now. The fragrance is calm, not heavy." },
  { t: "Honest about what is inside", b: "They list plainly what it is made of. After so many fake ones, that matters." },
  { t: "Good, the box could close better", b: "The fragrance is excellent. The box does not shut well once opened, so I keep them in a tin." },
  { t: "No headache", b: "Cheap incense gives me a headache. This does not, even with the windows closed in the rains." },
  { t: "Subtle", b: "Good quality, but if you like strong incense this will feel very quiet. That is probably the point." },
  { t: "Like a temple at dusk", b: "It reminds me of the temples in Mysuru in the evening. I have ordered more." },
];

const WHITE_PASTE: Words[] = [
  { t: "Pale gold and cool", b: "The paste comes up pale gold and cool on the forehead, with the fragrance of real heartwood." },
  { t: "Used it for the puja", b: "Made fresh paste for the first time in years. The fragrance filled the room." },
  { t: "Lovely, the card could say more", b: "The result is beautiful, but the card could say more about how much water to use." },
  { t: "Like my grandmother's house", b: "The fragrance took me straight back to the way Mysuru homes used to smell." },
  { t: "Honest labelling", b: "They print the lot and say exactly what is inside. After so many fake chandan products, that alone earns five stars." },
  { t: "Cool and soothing", b: "Exactly as it should be in the summer heat. I wish there were a larger size." },
  { t: "The real thing", b: "You can tell it is heartwood from the first breath. The fragrance stays on the skin for hours." },
  { t: "Subtle fragrance", b: "Good quality, but the fragrance is quieter than the perfumed chandan I grew up with." },
  { t: "Bought one for my mother", b: "She says it is the chandan of her childhood. That says everything." },
];

const WHITE_CARVED: Words[] = [
  { t: "Smells of sandalwood every time", b: "Every time I pick it up the scent comes off the wood. Months later it is still there." },
  { t: "Fine Mysuru work", b: "The finish is so fine you see the grain in every curve. You can tell one pair of hands made it slowly." },
  { t: "Beautiful, smaller than I pictured", b: "Lovely work. It is a little smaller in the hand than the photographs suggested." },
  { t: "Wakes when it is warmed", b: "Held in the hand for a minute, the fragrance rises. It is quiet the rest of the time." },
  { t: "Honest about the wood", b: "Heartwood only, and they say so on the card with the lot. It shows in the scent." },
  { t: "Lovely, slow to arrive", b: "Exactly as described. It took six working days to reach Delhi." },
  { t: "A gift that was understood", b: "Gave it to my aunt in Mysuru, who knows sandalwood. She approved, which is rare." },
  { t: "Scent is subtle", b: "Well made, but the fragrance is gentler than I expected. Warming it in the hand helps." },
  { t: "Packed with care", b: "Wrapped in cloth, in a box that itself smells of the wood. It arrived perfect." },
];

const WHITE_BEADS: Words[] = [
  { t: "The scent rises as you count", b: "As the beads warm in the hand the fragrance comes up. My morning japa feels different now." },
  { t: "Even, smooth beads", b: "The beads are even and the thumb never catches. The knotting is careful." },
  { t: "Lovely, the knot is tight", b: "Beautiful beads. The knotting was tight at first and eased after a week." },
  { t: "Like my grandmother's house", b: "Opened the box and the room smelled the way Mysuru homes used to." },
  { t: "Honest labelling", b: "Heartwood only, with the lot on the card. After so many fake sandalwood malas, that matters." },
  { t: "Beautiful, the pouch is snug", b: "The beads are perfect. The pouch is a little small once the strand is wound in." },
  { t: "Worn every day", b: "It has become part of the day. The scent is faint now, but it comes back when the beads are warm." },
  { t: "Scent is subtle", b: "Good quality, but the fragrance is quieter than I hoped. It is stronger after holding the beads." },
  { t: "A gift for my teacher", b: "Gave it to my yoga teacher. She uses it in every class." },
];

const WHITE_GIFT: Words[] = [
  { t: "Every guest asked", b: "We gave these at a family function. Everyone asked where they came from." },
  { t: "Thoughtfully put together", b: "Each piece is chosen with care, and the card explains how to use it. Nothing feels like filler." },
  { t: "Lovely, order early", b: "Beautiful presentation. It took a week to arrive, so order well ahead of the occasion." },
  { t: "Like my grandmother's house", b: "Opened it and the room smelled the way Mysuru homes used to." },
  { t: "Honest labelling", b: "The lot is printed on every item. After so many fake sandalwood gifts, that alone earns five stars." },
  { t: "Beautiful, wish I could pick the card", b: "Very well made. I would have liked to choose the design of the card for the note." },
  { t: "Still fragrant weeks later", b: "Weeks after the occasion, the room where we kept it still smells of sandalwood." },
  { t: "Good, plain outer packing", b: "The pieces are lovely, but the outer packing was plainer than I expected for a gift." },
  { t: "Felt personal", b: "The handwritten card made it feel personal, not corporate. Exactly what we wanted." },
];

const WHITE_SOAP: Words[] = [
  { t: "Smells of the heartwood", b: "The lather carries a real sandalwood scent, soft and warm, not perfumed." },
  { t: "Gentle on the skin", b: "My skin does not feel tight after washing, even in winter." },
  { t: "Lovely, keep it dry", b: "A beautiful bar, but keep it dry between uses or it softens quickly." },
  { t: "Like my grandmother's house", b: "The bathroom smells the way Mysuru homes used to." },
  { t: "Honest labelling", b: "Every ingredient listed plainly, and the lot of the oil too. That alone earns five stars." },
  { t: "Good, the paper wrap tore", b: "The soap is excellent. The paper wrapping tore in transit, though the bar was fine." },
  { t: "Bought six", b: "After the first bar I ordered six, for us and to give away." },
  { t: "Scent fades on the skin", b: "Good soap, but the fragrance does not stay on the skin for long after the bath." },
  { t: "The old kind", b: "It reminds me of the sandalwood soap of my childhood, before it became perfume." },
];

const WHITE_CHIPS: Words[] = [
  { t: "The wardrobe smells of sandalwood", b: "A handful tied in cotton, and the clothes smell of sandalwood for weeks." },
  { t: "Real heartwood", b: "Pale gold chips with real fragrance, not sawdust with oil sprayed on." },
  { t: "Good, mind the dust", b: "Lovely chips, but there was some dust at the bottom of the pack." },
  { t: "For the havan", b: "We used them for the havan at our housewarming. The smoke was sweet and clean." },
  { t: "Honest labelling", b: "The lot and origin are printed on the pack. That alone earns five stars." },
  { t: "Fragrant, could be larger", b: "The fragrance is excellent. I expected slightly larger chips." },
  { t: "On the charcoal burner", b: "A few chips on the burner in the evening and the whole house smells of it." },
  { t: "Quiet until warmed", b: "Quiet in the pack. It needs heat or a closed cupboard to come through." },
  { t: "Like my grandmother's house", b: "The cupboard smells the way Mysuru homes used to." },
];

const WHITE_HOLDER: Words[] = [
  { t: "Catches every bit of ash", b: "The ash falls into the dish, not onto the shelf. Simple, and it works." },
  { t: "Heavy and steady", b: "Solid cast brass. It does not tip, even with a long stick." },
  { t: "Lovely, needs a polish", b: "Beautiful piece. Brass darkens, so it needs a polish now and then." },
  { t: "Sits well by the lamp", b: "It sits beside our lamp as if it had always been there." },
  { t: "Well finished", b: "No rough edges from the casting, and it holds every thickness of stick I have tried." },
  { t: "Good, smaller than expected", b: "Well made, but a little smaller than the photographs suggested." },
  { t: "A good gift", b: "Gave it with a box of the sticks at a housewarming. Both were well received." },
  { t: "Fine, but plain", b: "It does the job well. I had hoped for a little more detail in the casting." },
  { t: "Made to last", b: "Brass and simple. It will outlast us." },
];

const BY_SLUG: Record<string, Words[]> = {
  "r-japa-mala-108": RED_BEADS,
  "r-half-mala-54": RED_BEADS,
  "r-wrist-mala-27": RED_BEADS,
  "r-bead-bracelet": RED_BEADS,
  "r-pocket-mala-18": RED_BEADS,
  "r-heartwood-powder": RED_POWDER,
  "r-ubtan": RED_POWDER,
  "r-heartwood-chips": RED_POWDER,
  "r-tilak-set": RED_POWDER,
  "w-heartwood-oil": WHITE_OIL,
  "w-chandan-attar": WHITE_OIL,
  "w-body-oil": WHITE_OIL,
  "w-pulse-roller": WHITE_OIL,
  "w-reserve-oil": WHITE_OIL,
  "w-incense-sticks": WHITE_SMOKE,
  "w-dhoop-cones": WHITE_SMOKE,
  "w-candle": WHITE_SMOKE,
  "w-chandan-stone": WHITE_PASTE,
  "w-chandan-powder": WHITE_PASTE,
  "w-face-pack": WHITE_PASTE,
  "w-mysuru-fan": WHITE_CARVED,
  "w-carved-figure": WHITE_CARVED,
  "w-offering-bowl": WHITE_CARVED,
  "w-key-fob": WHITE_CARVED,
  "w-card-case": WHITE_CARVED,
  "w-scented-pendant": WHITE_CARVED,
  "w-japa-mala-108": WHITE_BEADS,
  "w-bead-bracelet": WHITE_BEADS,
  "w-scented-mala-54": WHITE_BEADS,
  "w-morning-ritual": WHITE_GIFT,
  "w-wedding-tray": WHITE_GIFT,
  "w-boxed-oil": WHITE_GIFT,
  "w-sandalwood-soap": WHITE_SOAP,
  "w-heartwood-chips": WHITE_CHIPS,
  "w-incense-holder": WHITE_HOLDER,
};

/** Same hash as the seed, so each review keeps its place in the set it was drawn from. */
function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Words for one seeded review (id `${slug}-s${i}`), or null for a customer's own review. */
export function fittedWords(slug: string, id: string): Words | null {
  const m = new RegExp(`^${slug.replace(/[^a-z0-9-]/g, "")}-s(\\d+)$`).exec(id);
  if (!m) return null;
  const set = BY_SLUG[slug] ?? (slug.startsWith("r-") ? RED_SOLID : null);
  if (!set) return null;
  return set[(hash(slug) + Number(m[1]) * 7) % set.length];
}
