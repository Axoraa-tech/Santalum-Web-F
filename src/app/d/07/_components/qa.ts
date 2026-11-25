import type { CategoryId } from "@/lib/shop/products";

/**
 * Questions and the house's answers, written for each kind of piece. The shared seed asks the same three
 * questions on every page of a wood (powder questions on an oil page); this design answers about the piece shown.
 * Entries replace the seeded questions by position, so answers customers add to those questions stay attached.
 */
export const QA: Record<CategoryId, { q: string; a: string }[]> = {
  // red sandalwood
  beads: [
    { q: "Will the beads stain my skin or clothes?", a: "No. The beads are finished with natural oil, not dye, so the colour stays in the wood. Keep them off wet skin for the first week while the finish settles." },
    { q: "What are they strung on?", a: "Hand-knotted cotton on the malas and an elastic cotton core on the wrist pieces; the listing names it. After years of daily use, write to us and the workshop restrings it." },
    { q: "Does red sandalwood have a fragrance?", a: "Almost none. Red sandalwood is chosen for its colour and weight. The fragrant wood is white sandalwood, Santalum album." },
  ],
  objects: [
    { q: "Is it lacquered?", a: "No. The finish is hand-rubbed natural oil, so you can feel the grain. Once a season, a drop of oil on a soft cloth keeps the sheen." },
    { q: "Will the colour change over time?", a: "It deepens. Red sandalwood darkens from brick towards wine where it is handled and where light falls on it." },
    { q: "Why does mine look different from the photograph?", a: "Every piece is cut from its own billet, so the figure of the grain is never the same twice. Colour and size match the listing." },
  ],
  powder: [
    { q: "Is it pure heartwood?", a: "Yes. Red sandalwood heartwood only, with nothing added. The batch on the pack matches the record in the box." },
    { q: "How is it used?", a: "Powder and ubtan are mixed to a paste with rose water or milk; the tilak stick is rubbed on its wet stone. Patch test anything that goes on the skin." },
    { q: "How long does it keep?", a: "Two years or more while sealed. Once open, keep it dry and closed, away from the sun." },
  ],
  gifting: [
    { q: "Can you add a message or a company card?", a: "Yes. Write it in the gift note at checkout. It goes on a hand-written card, and prices never appear on the packing slip." },
    { q: "Can I order ten or more for a team?", a: "Yes. Put the number and the date you need them by in the gift note and we write back before anything is packed." },
    { q: "What is inside the box with the piece?", a: "The piece in linen, its batch record and a care card. The record number matches the one on the box." },
  ],
  jewellery: [
    { q: "Can I wear it every day?", a: "Yes, and it improves with wear: the grain warms and darkens. Take it off to bathe or swim, and keep perfume off the wood." },
    { q: "Is it heavy to wear?", a: "Red sandalwood is dense, so a piece feels heavier than it looks, but not enough to tire the wrist or neck." },
    { q: "Are the metal parts real silver?", a: "Where a piece has metal it is sterling silver, and the listing says so. Pieces without metal are wood alone." },
  ],
  // white sandalwood
  oil: [
    { q: "Is this pure sandalwood oil or a blend?", a: "The heartwood oil and the Reserve are pure Santalum album oil. The attar, body oil and roller are made on a base, and the page lists every part. Each batch is tested." },
    { q: "Can I put it straight on the skin?", a: "One drop on the wrist is how most people use it. For larger areas, mix a few drops into a plain carrier such as sesame or almond oil." },
    { q: "How long does an opened bottle keep?", a: "Years. Sandalwood oil rounds out as it ages. Keep it closed, upright and away from heat and sun." },
  ],
  incense: [
    { q: "Is the fragrance natural?", a: "Yes. Everything here is scented by sandalwood heartwood itself, not by synthetic fragrance oil. The brass holder is the one piece with no scent of its own." },
    { q: "Is it safe to burn indoors?", a: "Yes, on a heat-safe holder away from curtains, with a window open in a small room. Heartwood gives a thin, steady line of smoke." },
    { q: "How should I store it?", a: "Closed, dry and out of the sun, so the scent stays in the wood. Sticks and cones keep for a year or more." },
  ],
  skin: [
    { q: "Can I use it on sensitive skin?", a: "Most people can, but patch test on the inner arm first. Every ingredient is listed on the page and on the pack." },
    { q: "How do I use it?", a: "Powder and face pack: a teaspoon with rose water or milk, left on until it feels cool, then rinsed. The soap is used like any bar; let it dry between uses." },
    { q: "Is anything added for colour or scent?", a: "No. The colour is the pale heartwood and the scent is sandalwood. Where a pack has other ingredients, the label names them." },
  ],
  "w-beads": [
    { q: "Will the beads keep their fragrance?", a: "For years. Warm them in your hands to wake the scent, and keep them in their pouch when not worn." },
    { q: "Can I wear them in water?", a: "No. Water dulls the scent and can swell the wood. Take them off to bathe or swim." },
    { q: "Are the beads all heartwood?", a: "Yes. Sapwood has no scent, so it is never used for beads." },
  ],
  carvings: [
    { q: "Who carves these pieces?", a: "Carvers in Mysuru who work in white sandalwood. Every carving is finished by hand, so no two are exactly alike." },
    { q: "How long does a carving keep its scent?", a: "For many years. Warm it in the hand to bring the fragrance back, and keep it out of strong sun and away from heat." },
    { q: "How do I clean it?", a: "With a soft, dry brush. Never water or polish: both close the pores of the wood and shut the scent in." },
  ],
  "w-gifting": [
    { q: "Can you add names or a message?", a: "Yes. Write them in the gift note at checkout and we put them on hand-written cards." },
    { q: "Can I order trays for a wedding?", a: "Yes, from ten. Put the number and the date in the gift note and we write back before anything is packed." },
    { q: "How is it packed?", a: "By hand, in linen or a turned box, sealed and insured to its full value. Prices stay off the packing slip." },
  ],
};
