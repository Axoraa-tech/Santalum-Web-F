import { PHOTOS, type PhotoRef } from "../photos";
import type { Wood } from "../wood-boot";

/**
 * The Maison's catalogue. Red and white sandalwood are two different shops: different pieces,
 * categories, prices and photographs. Names, prices and sizes are placeholders inside the
 * client's ₹1K → ₹1 lakh ladder; replace with real SKUs before launch.
 */

export type { Wood };
export type Tone = "red" | "pale";
export type Shot = { photo: PhotoRef; tone?: Tone };

/** CSS filters that warm or pale a placeholder photo to suit a wood. */
export const TONE_FILTER: Record<Tone, string> = {
  red: "saturate(1.08) contrast(1.02)",
  pale: "sepia(0.35) saturate(0.45) brightness(1.55) contrast(0.85)",
};

export type CategoryId =
  // red sandalwood
  | "beads"
  | "objects"
  | "powder"
  | "gifting"
  | "jewellery"
  // white sandalwood
  | "oil"
  | "incense"
  | "skin"
  | "w-beads"
  | "carvings"
  | "w-gifting";

export type Category = { id: CategoryId; label: string; line: string };

export const CATEGORIES: Record<Wood, Category[]> = {
  red: [
    { id: "beads", label: "Beads & Malas", line: "Quiet objects for personal ritual." },
    { id: "objects", label: "Everyday Objects", line: "Keys, coasters, pens and small things for the desk and home." },
    { id: "powder", label: "Powder & Material", line: "Prepared from the heartwood, with clear notes on origin and use." },
    { id: "gifting", label: "Gifting", line: "Considered objects for personal and corporate occasions." },
    { id: "jewellery", label: "Jewellery", line: "Contemporary pieces shaped around the character of the wood." },
  ],
  white: [
    { id: "oil", label: "Oil & Attar", line: "Distilled from aged heartwood. The fragrance is the point." },
    { id: "incense", label: "Incense & Ritual", line: "Sticks, cones, the tilak stone and what goes on the altar." },
    { id: "skin", label: "Powder & Skin", line: "Chandan powder, soap and the face pack, with plain notes on use." },
    { id: "w-beads", label: "Beads & Malas", line: "Pale, fragrant beads that warm in the hand." },
    { id: "carvings", label: "Carvings & Objects", line: "Mysuru carving: fans, figures and turned pieces." },
    { id: "w-gifting", label: "Gifting", line: "Ritual sets, boxed oils and trays for weddings and teams." },
  ],
};

export type OptionValue = { id: string; label: string; price: number };
export type Options = { name: string; values: OptionValue[] };

export type Badge = "New" | "Edition" | "Studio favourite" | "Limited";

export type Product = {
  /** Unique across both woods. Red slugs start with "r-", white with "w-". */
  slug: string;
  wood: Wood;
  name: string;
  category: CategoryId;
  /** Lowest price (the first option when there are options). */
  price: number;
  options?: Options;
  shots: Shot[];
  /** One line for cards. */
  short: string;
  /** Two or three short paragraphs for the product page. */
  story: string[];
  details: { label: string; value: string }[];
  care: string;
  badge?: Badge;
  edition?: { size: number; left: number };
  /** Shown on landing pages. Keep to 6–8 per wood. */
  featured?: boolean;
  /** The closest piece in the other wood, if there is one. */
  counterpart?: string;
};

const P = PHOTOS;
const pale = (photo: PhotoRef): Shot => ({ photo, tone: "pale" });
const s =(photo: PhotoRef): Shot => ({ photo });
const opts = (name: string, values: [string, number][]): Options => ({
  name,
  values: values.map(([label, price]) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, price })),
});

const RED_CARE = "Keep dry and out of direct sun. Wipe with a soft dry cloth; once a season, a drop of natural oil.";
const WHITE_CARE = "Keep closed and away from heat and sun so the fragrance stays in the wood.";

const RED: Product[] = [
  // ---------- Beads & Malas ----------
  {
    slug: "r-japa-mala-108",
    wood: "red",
    name: "Japa Mala, 108 beads",
    category: "beads",
    price: 4800,
    options: opts("Bead size", [["6 mm", 4800], ["8 mm", 5600], ["10 mm", 6900]]),
    shots: [s(P.malaHand), s(P.beadStrandsDark), s(P.beadStrands)],
    short: "Deep red beads, hand-knotted on cotton, with a guru bead.",
    story: [
      "One hundred and eight beads turned from a single batch of heartwood, so the colour runs true from the first bead to the last.",
      "Each bead is knotted on unbleached cotton. The guru bead is left a little larger so the fingers find it without looking.",
    ],
    details: [
      { label: "Beads", value: "108 + 1 guru bead" },
      { label: "Cord", value: "Hand-knotted cotton, silk tassel" },
      { label: "Finish", value: "Natural oil, no lacquer" },
      { label: "Comes in", value: "Linen pouch with its batch record" },
    ],
    care: RED_CARE,
    badge: "Studio favourite",
    featured: true,
    counterpart: "w-japa-mala-108",
  },
  {
    slug: "r-half-mala-54",
    wood: "red",
    name: "Half Mala, 54 beads",
    category: "beads",
    price: 3900,
    shots: [s(P.beadStrands), s(P.beadStrandsDark)],
    short: "Half a round, for shorter practice and for travel.",
    story: [
      "Fifty-four beads, the traditional half round, with a guru bead and a short silk tassel.",
      "Light enough to carry in a pocket and long enough to wear twice around the wrist.",
    ],
    details: [
      { label: "Beads", value: "54 + 1 guru bead, 8 mm" },
      { label: "Cord", value: "Hand-knotted cotton" },
      { label: "Finish", value: "Natural oil" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-wrist-mala-27",
    wood: "red",
    name: "Wrist Mala, 27 beads",
    category: "beads",
    price: 2500,
    shots: [s(P.braceletDark), s(P.braceletClose)],
    short: "A quarter mala that sits on the wrist.",
    story: [
      "Twenty-seven beads on a stretch cord, a quarter of the full round.",
      "The beads darken where the skin touches them. That is the wood, not wear.",
    ],
    details: [
      { label: "Beads", value: "27, 8 mm" },
      { label: "Cord", value: "Elastic cotton core" },
      { label: "Fits", value: "Wrists 15–18 cm" },
    ],
    care: RED_CARE,
    featured: true,
  },
  {
    slug: "r-bead-bracelet",
    wood: "red",
    name: "Bead Bracelet",
    category: "beads",
    price: 2500,
    options: opts("Bead size", [["8 mm", 2500], ["10 mm", 2900], ["12 mm", 3400]]),
    shots: [s(P.braceletClose), s(P.braceletDark)],
    short: "Single round of beads with one brass spacer.",
    story: [
      "A single round of turned beads with a brass spacer, for every day rather than for practice.",
      "Choose the bead size; we string it to your wrist at checkout if you leave a note.",
    ],
    details: [
      { label: "Beads", value: "Turned heartwood" },
      { label: "Spacer", value: "Solid brass" },
      { label: "Fits", value: "Wrists 15–18 cm, or to your note" },
    ],
    care: RED_CARE,
    counterpart: "w-bead-bracelet",
  },
  {
    slug: "r-pocket-mala-18",
    wood: "red",
    name: "Pocket Mala, 18 beads",
    category: "beads",
    price: 1800,
    shots: [s(P.beadStrandsDark), s(P.redGrain)],
    short: "Eighteen beads and a brass ring, for the pocket or the car.",
    story: ["Eighteen beads on a short knotted cord with a brass ring. The smallest mala we make."],
    details: [
      { label: "Beads", value: "18, 8 mm" },
      { label: "Ring", value: "Solid brass" },
    ],
    care: RED_CARE,
    badge: "New",
  },
  // ---------- Everyday Objects ----------
  {
    slug: "r-key-fob",
    wood: "red",
    name: "Key Fob",
    category: "objects",
    price: 1200,
    shots: [s(P.keyTag), s(P.carvedTag)],
    short: "A small block of heartwood on a brass ring.",
    story: [
      "Cut from offcuts of larger work, shaped by hand and finished with natural oil.",
      "It darkens and smooths with handling. After a year it will look like yours.",
    ],
    details: [
      { label: "Size", value: "Approx. 55 × 28 × 8 mm" },
      { label: "Fittings", value: "Solid brass split ring" },
      { label: "Finish", value: "Hand-rubbed natural oil" },
    ],
    care: RED_CARE,
    featured: true,
    counterpart: "w-key-fob",
  },
  {
    slug: "r-coasters",
    wood: "red",
    name: "Coasters",
    category: "objects",
    price: 1800,
    options: opts("Set", [["Pair", 1800], ["Set of four", 3200], ["Six with holder", 5400]]),
    shots: [s(P.coasterSet), s(P.woodRounds)],
    short: "End-grain rounds that show the growth rings.",
    story: [
      "Cut across the grain so every ring of the tree shows, then sealed underneath so a cold glass leaves no mark.",
      "No two sets match. That is how you know they were cut, not moulded.",
    ],
    details: [
      { label: "Size", value: "95 mm across, 9 mm thick" },
      { label: "Underside", value: "Natural cork" },
    ],
    care: RED_CARE,
    featured: true,
  },
  {
    slug: "r-incense-holder",
    wood: "red",
    name: "Incense Holder",
    category: "objects",
    price: 2200,
    shots: [s(P.incenseDark), s(P.incenseBox)],
    short: "A long tray that catches the ash.",
    story: ["A long, shallow tray turned from one piece, with a brass pin that holds a stick at the right angle."],
    details: [
      { label: "Length", value: "260 mm" },
      { label: "Pin", value: "Solid brass" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-writing-pen",
    wood: "red",
    name: "Writing Pen",
    category: "objects",
    price: 3800,
    options: opts("Refill", [["Rollerball", 3800], ["Fountain, medium nib", 5200]]),
    shots: [s(P.penBrass), s(P.penBox)],
    short: "Turned barrel, brass fittings, weighted to write.",
    story: [
      "The barrel is turned from a single billet so the grain runs from cap to tip.",
      "It is heavier than it looks. Red sandalwood is one of the densest woods in India.",
    ],
    details: [
      { label: "Length", value: "140 mm capped" },
      { label: "Fittings", value: "Brass" },
      { label: "Refills", value: "Standard international" },
    ],
    care: RED_CARE,
    badge: "New",
  },
  {
    slug: "r-massage-roller",
    wood: "red",
    name: "Massage Roller",
    category: "objects",
    price: 2400,
    shots: [s(P.massageTools)],
    short: "A turned roller for the palm, the neck and the shoulders.",
    story: ["Turned smooth and left unvarnished so it stays cool against the skin."],
    details: [
      { label: "Length", value: "150 mm" },
      { label: "Finish", value: "Unvarnished, polished" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-turned-bowl",
    wood: "red",
    name: "Turned Bowl",
    category: "objects",
    price: 6800,
    options: opts("Size", [["Small, 12 cm", 6800], ["Large, 18 cm", 11500]]),
    shots: [s(P.bowlsSlice), s(P.platesBowls)],
    short: "For keys, rings, or nothing at all.",
    story: ["Turned from a single block and left thick at the base so it sits low and heavy."],
    details: [
      { label: "Made", value: "Turned, one piece" },
      { label: "Use", value: "Dry things only" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-chess-set",
    wood: "red",
    name: "Chess Set",
    category: "objects",
    price: 42000,
    shots: [s(P.chessBoard), s(P.chessPlay)],
    short: "Red sandalwood against pale boxwood, with a folding board.",
    story: [
      "Thirty-two pieces turned and carved by hand: red sandalwood for one side, boxwood for the other.",
      "The board folds into a box that holds the pieces in felt-lined slots.",
    ],
    details: [
      { label: "King", value: "85 mm" },
      { label: "Board", value: "45 cm square, folding" },
      { label: "Made to order", value: "Six to eight weeks" },
    ],
    care: RED_CARE,
    badge: "Limited",
  },
  // ---------- Powder & Material ----------
  {
    slug: "r-heartwood-powder",
    wood: "red",
    name: "Heartwood Powder",
    category: "powder",
    price: 1600,
    options: opts("Weight", [["50 g", 1600], ["100 g", 2800], ["250 g", 5900]]),
    shots: [s(P.redPowder), s(P.whiteRitual)],
    short: "Raktachandan, milled from offcuts and sieved twice.",
    story: [
      "Offcuts from our own work, milled and sieved twice. Nothing is added.",
      "Packed in amber glass, never plastic. The jar is worth keeping.",
    ],
    details: [
      { label: "Contains", value: "Pterocarpus santalinus heartwood, nothing else" },
      { label: "Jar", value: "Amber glass, brass lid" },
      { label: "Batch", value: "Printed on the label" },
    ],
    care: "Keep the lid closed and the jar dry.",
    featured: true,
    counterpart: "w-chandan-powder",
  },
  {
    slug: "r-ubtan",
    wood: "red",
    name: "Raktachandan Ubtan",
    category: "powder",
    price: 2200,
    shots: [s(P.offeringTall), s(P.redPowder)],
    short: "Red sandalwood with chickpea flour and turmeric, as it has been made at home.",
    story: [
      "The old household blend: red sandalwood, chickpea flour and a little turmeric. Mix with water or milk.",
      "We list every ingredient and its share on the jar. Patch test first.",
    ],
    details: [
      { label: "Blend", value: "Red sandalwood 40%, chickpea flour 50%, turmeric 10%" },
      { label: "Jar", value: "Stoneware, 100 g" },
    ],
    care: "Keep dry. Use within 12 months of opening.",
  },
  {
    slug: "r-heartwood-chips",
    wood: "red",
    name: "Heartwood Chips",
    category: "powder",
    price: 1500,
    options: opts("Weight", [["100 g", 1500], ["250 g", 3200]]),
    shots: [s(P.chipsRed), s(P.redChip)],
    short: "Chips from the turning floor, for ritual and for dye.",
    story: ["The chips that fly off the lathe, gathered and sorted by size. Used in ritual fires and as a natural red dye."],
    details: [{ label: "Contains", value: "Heartwood chips, unsorted colour" }],
    care: "Keep dry.",
  },
  {
    slug: "r-tilak-set",
    wood: "red",
    name: "Tilak Stone and Stick",
    category: "powder",
    price: 2600,
    shots: [s(P.redChip), s(P.offeringTall)],
    short: "A granite stone and a red sandalwood stick for fresh paste.",
    story: ["Rub the stick on the wet stone in small circles. The paste is red, cool and ready in a minute."],
    details: [
      { label: "Stone", value: "Granite, 12 cm" },
      { label: "Stick", value: "Red sandalwood, 10 cm" },
    ],
    care: "Rinse the stone and let it dry before closing the box.",
    counterpart: "w-chandan-stone",
  },
  // ---------- Gifting ----------
  {
    slug: "r-presentation-box",
    wood: "red",
    name: "Presentation Box",
    category: "gifting",
    price: 5500,
    shots: [s(P.boxRed), s(P.boxCarved)],
    short: "Hinged, dovetailed, lined in raw cotton, with a drawer for the record.",
    story: [
      "The box is the gift as much as what goes in it.",
      "Choose it empty, or ask us at checkout to fill it with pieces from the shop.",
    ],
    details: [
      { label: "Size", value: "160 × 110 × 60 mm" },
      { label: "Hinge", value: "Brass" },
      { label: "Lining", value: "Raw cotton" },
    ],
    care: RED_CARE,
    featured: true,
  },
  {
    slug: "r-mala-box",
    wood: "red",
    name: "The Mala Box",
    category: "gifting",
    price: 9800,
    shots: [s(P.giftLinen), s(P.malaHand)],
    short: "The 108-bead mala in a turned box, wrapped in linen.",
    story: ["Our japa mala in a turned red sandalwood box, wrapped in linen with a handwritten card."],
    details: [
      { label: "Includes", value: "Japa mala 8 mm, turned box, card" },
      { label: "Wrap", value: "Linen and cotton tape" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-desk-set",
    wood: "red",
    name: "Desk Set",
    category: "gifting",
    price: 8400,
    shots: [s(P.penBox), s(P.coasterSet)],
    short: "Pen, coaster pair and key fob in one box. Our corporate favourite.",
    story: ["Three everyday pieces in one box, with room for a company card. Quantities from ten; ask us for engraving."],
    details: [
      { label: "Includes", value: "Writing pen, coaster pair, key fob" },
      { label: "From", value: "10 sets for corporate orders" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-heirloom-casket",
    wood: "red",
    name: "Heirloom Casket",
    category: "gifting",
    price: 98000,
    shots: [s(P.boxCarved), s(P.carving)],
    short: "Carved by one hand over five weeks. Nine are made a year.",
    story: [
      "A jewellery casket carved from a single block of aged heartwood by one carver over five weeks.",
      "Nine are made a year. Each is numbered, signed underneath and entered in the registry.",
    ],
    details: [
      { label: "Size", value: "260 × 180 × 120 mm" },
      { label: "Edition", value: "9 a year, numbered" },
      { label: "Made to order", value: "Five to six weeks" },
    ],
    care: RED_CARE,
    badge: "Edition",
    edition: { size: 9, left: 4 },
  },
  // ---------- Jewellery ----------
  {
    slug: "r-grain-pendant",
    wood: "red",
    name: "Grain Pendant",
    category: "jewellery",
    price: 9800,
    shots: [s(P.carvedTag), s(P.redGrain)],
    short: "A carved disc that follows the grain, on a silk cord.",
    story: ["Each pendant is cut where the grain is most alive, so no two carry the same figure."],
    details: [
      { label: "Size", value: "32 mm" },
      { label: "Cord", value: "Silk, adjustable" },
      { label: "Bail", value: "Sterling silver" },
    ],
    care: RED_CARE,
    featured: true,
    counterpart: "w-scented-pendant",
  },
  {
    slug: "r-cufflinks",
    wood: "red",
    name: "Cufflinks",
    category: "jewellery",
    price: 8500,
    shots: [s(P.cufflinks)],
    short: "Red heartwood set in sterling silver.",
    story: ["Two small faces of heartwood, matched from the same cut, set in sterling silver."],
    details: [
      { label: "Metal", value: "Sterling silver" },
      { label: "Face", value: "16 mm" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-turned-bangle",
    wood: "red",
    name: "Turned Bangle",
    category: "jewellery",
    price: 7500,
    options: opts("Size", [["2-4", 7500], ["2-6", 7500], ["2-8", 7500]]),
    shots: [s(P.bangles)],
    short: "Turned from one ring of wood, no joins.",
    story: ["Turned from a single ring of heartwood so there is no join to catch. Smooth inside, a soft edge outside."],
    details: [
      { label: "Width", value: "14 mm" },
      { label: "Sizes", value: "Indian 2-4 to 2-8" },
    ],
    care: RED_CARE,
  },
  {
    slug: "r-signet-ring",
    wood: "red",
    name: "Signet Ring",
    category: "jewellery",
    price: 12500,
    options: opts("Size", [["14", 12500], ["16", 12500], ["18", 12500], ["20", 12500]]),
    shots: [s(P.ringsTray)],
    short: "Silver signet with a red sandalwood inlay.",
    story: ["A sterling silver signet with a face of red heartwood, inlaid and sealed."],
    details: [
      { label: "Metal", value: "Sterling silver" },
      { label: "Sizes", value: "Indian 14–20" },
    ],
    care: RED_CARE,
    badge: "New",
  },
  {
    slug: "r-vault-cuff",
    wood: "red",
    name: "The 2011 Vault Cuff",
    category: "jewellery",
    price: 19500,
    shots: [s(P.turned), s(P.redGrain)],
    short: "Edition of 21, from heartwood sourced in 2011.",
    story: [
      "Twenty-one cuffs turned from aged heartwood sourced in 2011. The wood has waited since then for the right hands.",
      "Each cuff is numbered and entered in our registry with its harvest origin, the artisan's name and the date it left our hands.",
    ],
    details: [
      { label: "Edition", value: "21, numbered" },
      { label: "Comes with", value: "Registry certificate" },
    ],
    care: RED_CARE,
    badge: "Edition",
    edition: { size: 21, left: 7 },
    featured: true,
  },
  {
    slug: "r-carved-ganesha",
    wood: "red",
    name: "Carved Ganesha",
    category: "objects",
    price: 14000,
    options: opts("Height", [["8 cm", 14000], ["12 cm", 22000]]),
    shots: [s(P.ganesha), s(P.carvedDeity)],
    short: "Carved by hand in Karnataka. Unpainted, so the wood shows.",
    story: ["Carved by hand in the Mysuru tradition, then left unpainted so the red of the heartwood is the only colour."],
    details: [
      { label: "Carved in", value: "Karnataka" },
      { label: "Base", value: "Felt" },
    ],
    care: RED_CARE,
  },
];

const WHITE: Product[] = [
  // ---------- Oil & Attar ----------
  {
    slug: "w-heartwood-oil",
    wood: "white",
    name: "Heartwood Oil",
    category: "oil",
    price: 5800,
    options: opts("Volume", [["5 ml", 5800], ["10 ml", 10500], ["30 ml", 28000]]),
    shots: [s(P.oil), s(P.oilHands), s(P.oilDuo)],
    short: "Steam-distilled from aged heartwood. One drop is enough.",
    story: [
      "Distilled slowly from heartwood that has aged at least fifteen years. Nothing is added and nothing is cut.",
      "Each batch is tested and the report travels with the bottle.",
    ],
    details: [
      { label: "Contains", value: "Santalum album heartwood oil, 100%" },
      { label: "Bottle", value: "Amber glass, glass dropper" },
      { label: "Batch", value: "Report printed on the box" },
    ],
    care: WHITE_CARE,
    badge: "Studio favourite",
    featured: true,
  },
  {
    slug: "w-chandan-attar",
    wood: "white",
    name: "Chandan Attar",
    category: "oil",
    price: 4200,
    options: opts("Volume", [["6 ml", 4200], ["12 ml", 7800]]),
    shots: [s(P.attar), s(P.attarSilk)],
    short: "Distilled into sandalwood oil the old Kannauj way. No alcohol.",
    story: [
      "Made by hydro-distillation into a sandalwood base, as attar has been made for centuries. No alcohol, no carrier.",
      "Touch it to the wrist and the inside of the collar. It lasts the day.",
    ],
    details: [
      { label: "Base", value: "Sandalwood oil" },
      { label: "Alcohol", value: "None" },
    ],
    care: WHITE_CARE,
    featured: true,
  },
  {
    slug: "w-body-oil",
    wood: "white",
    name: "Body Oil",
    category: "oil",
    price: 3400,
    options: opts("Volume", [["100 ml", 3400], ["200 ml", 5900]]),
    shots: [s(P.oilStand), s(P.oilDropper)],
    short: "Sandalwood in cold-pressed sesame, for after the bath.",
    story: ["Heartwood oil at two per cent in cold-pressed sesame, the base Indian homes have always used for oil baths."],
    details: [
      { label: "Contains", value: "Sesame oil, sandalwood oil 2%" },
      { label: "Bottle", value: "Amber glass, pump" },
    ],
    care: WHITE_CARE,
  },
  {
    slug: "w-pulse-roller",
    wood: "white",
    name: "Pulse Roller",
    category: "oil",
    price: 2400,
    shots: [s(P.oilVials), s(P.oilDrop)],
    short: "Eight millilitres in a steel roller, for the bag.",
    story: ["Heartwood oil diluted in fractionated coconut, in a steel-ball roller that fits a pocket."],
    details: [{ label: "Volume", value: "8 ml" }],
    care: WHITE_CARE,
    badge: "New",
  },
  {
    slug: "w-reserve-oil",
    wood: "white",
    name: "The 2011 Reserve Oil",
    category: "oil",
    price: 24000,
    shots: [s(P.oilVials), s(P.whiteLog)],
    short: "Fifty vials from a 2011 harvest. Numbered.",
    story: [
      "Fifty vials distilled from one lot of heartwood harvested in 2011 and aged since.",
      "Each vial is numbered by hand and entered in the registry with its lot and date.",
    ],
    details: [
      { label: "Edition", value: "50, numbered" },
      { label: "Volume", value: "3 ml" },
    ],
    care: WHITE_CARE,
    badge: "Edition",
    edition: { size: 50, left: 12 },
    featured: true,
  },
  // ---------- Incense & Ritual ----------
  {
    slug: "w-incense-sticks",
    wood: "white",
    name: "Incense Sticks",
    category: "incense",
    price: 1200,
    options: opts("Count", [["40 sticks", 1200], ["100 sticks", 2600]]),
    shots: [s(P.incenseLotus), s(P.incenseDrying)],
    short: "Hand-rolled on bamboo with sandalwood powder and halmaddi.",
    story: [
      "Rolled by hand in Mysuru with sandalwood powder, halmaddi resin and charcoal on a thin bamboo core.",
      "About forty minutes a stick. No synthetic perfume.",
    ],
    details: [
      { label: "Burn", value: "About 40 minutes" },
      { label: "Rolled in", value: "Mysuru" },
    ],
    care: "Keep the tube closed.",
    featured: true,
  },
  {
    slug: "w-dhoop-cones",
    wood: "white",
    name: "Dhoop Cones",
    category: "incense",
    price: 1400,
    shots: [s(P.dhoopCone), s(P.smoke)],
    short: "Twenty-four cones, no bamboo, a heavier smoke.",
    story: ["Pressed cones of sandalwood powder and resin, without the bamboo core. The smoke is thicker and the scent stays in the room."],
    details: [{ label: "Count", value: "24 cones, with a brass dish" }],
    care: "Keep the tin closed.",
  },
  {
    slug: "w-chandan-stone",
    wood: "white",
    name: "Chandan Stone and Stick",
    category: "incense",
    price: 3200,
    shots: [s(P.whiteRitual), s(P.whiteLog)],
    short: "A granite sandhanam kal and a heartwood stick, for fresh paste.",
    story: [
      "Rub the stick on the wet stone in slow circles. The paste comes up pale gold and fragrant.",
      "The stick lasts a year of daily tilak.",
    ],
    details: [
      { label: "Stone", value: "Granite, 14 cm" },
      { label: "Stick", value: "White sandalwood heartwood, 10 cm" },
    ],
    care: "Rinse the stone and let it dry before closing the box.",
    featured: true,
    counterpart: "r-tilak-set",
  },
  {
    slug: "w-heartwood-chips",
    wood: "white",
    name: "Heartwood Chips",
    category: "incense",
    price: 2200,
    options: opts("Weight", [["100 g", 2200], ["250 g", 4900]]),
    shots: [s(P.chipsPale), s(P.shavingsPale)],
    short: "For the havan, the charcoal burner and the wardrobe.",
    story: ["Heartwood chips with their oil still in them. Burn on charcoal, or tie a handful in cotton for the wardrobe."],
    details: [{ label: "Contains", value: "Santalum album heartwood chips" }],
    care: "Keep in the tin.",
  },
  {
    slug: "w-candle",
    wood: "white",
    name: "Sandalwood Candle",
    category: "incense",
    price: 2900,
    shots: [s(P.candleLit), s(P.candleJar)],
    short: "Coconut wax and heartwood oil in amber glass. About fifty hours.",
    story: ["Poured by hand with coconut and soy wax and our own heartwood oil. The glass is meant to be kept."],
    details: [
      { label: "Burn", value: "About 50 hours" },
      { label: "Wax", value: "Coconut and soy" },
    ],
    care: "Trim the wick to 5 mm before each burn.",
    badge: "New",
  },
  {
    slug: "w-incense-holder",
    wood: "white",
    name: "Brass Incense Holder",
    category: "incense",
    price: 2600,
    shots: [s(P.incenseGanesha), s(P.incenseLotus)],
    short: "Cast brass, made to sit beside the lamp.",
    story: ["Cast in brass by a family foundry in Karnataka. It holds a stick or a cone."],
    details: [{ label: "Metal", value: "Cast brass" }],
    care: "Polish with tamarind once in a while.",
  },
  // ---------- Powder & Skin ----------
  {
    slug: "w-chandan-powder",
    wood: "white",
    name: "Chandan Powder",
    category: "skin",
    price: 3900,
    options: opts("Weight", [["50 g", 3900], ["100 g", 7200]]),
    shots: [s(P.whitePowder), s(P.whiteRitual)],
    short: "Pale gold heartwood powder. Nothing added.",
    story: [
      "Ground from heartwood, so it carries the fragrance. Sapwood powder is cheaper and has none; we do not use it.",
      "For tilak, for the face pack, for the puja.",
    ],
    details: [
      { label: "Contains", value: "Santalum album heartwood, nothing else" },
      { label: "Jar", value: "Amber glass" },
    ],
    care: "Keep the lid closed so the fragrance stays.",
    featured: true,
    counterpart: "r-heartwood-powder",
  },
  {
    slug: "w-sandalwood-soap",
    wood: "white",
    name: "Sandalwood Soap",
    category: "skin",
    price: 1500,
    options: opts("Pack", [["Three bars", 1500], ["Six bars", 2800]]),
    shots: [s(P.soapTied), s(P.soapBars)],
    short: "Cold-process bars with heartwood oil. Wrapped in paper.",
    story: ["Cold-process soap made with coconut and castor oils and our heartwood oil, cured for six weeks."],
    details: [
      { label: "Bar", value: "100 g" },
      { label: "Cure", value: "Six weeks" },
    ],
    care: "Keep on a draining dish between uses.",
  },
  {
    slug: "w-face-pack",
    wood: "white",
    name: "Chandan Face Pack",
    category: "skin",
    price: 2800,
    shots: [s(P.apothecary), s(P.whitePowder)],
    short: "Sandalwood, multani mitti and rose petal. Mix with rose water.",
    story: [
      "White sandalwood powder with fuller's earth and dried rose petal, as it has been mixed at home.",
      "Every ingredient and its share is on the jar. Patch test first.",
    ],
    details: [
      { label: "Blend", value: "Sandalwood 40%, multani mitti 50%, rose 10%" },
      { label: "Jar", value: "Amber glass, 100 g" },
    ],
    care: "Keep dry. Use within 12 months of opening.",
  },
  // ---------- Beads & Malas ----------
  {
    slug: "w-japa-mala-108",
    wood: "white",
    name: "Japa Mala, 108 beads",
    category: "w-beads",
    price: 6800,
    options: opts("Bead size", [["6 mm", 6800], ["8 mm", 7800]]),
    shots: [s(P.beadsPale), s(P.whiteBeads)],
    short: "Pale, fragrant beads. The scent rises as they warm.",
    story: [
      "One hundred and eight beads of white heartwood. They smell of sandalwood for years, more so in the hand.",
      "Knotted on cotton with a guru bead and a silk tassel.",
    ],
    details: [
      { label: "Beads", value: "108 + 1 guru bead" },
      { label: "Cord", value: "Hand-knotted cotton, silk tassel" },
    ],
    care: WHITE_CARE,
    featured: true,
    counterpart: "r-japa-mala-108",
  },
  {
    slug: "w-bead-bracelet",
    wood: "white",
    name: "Bead Bracelet",
    category: "w-beads",
    price: 3400,
    options: opts("Bead size", [["8 mm", 3400], ["10 mm", 3900]]),
    shots: [s(P.braceletPale), s(P.beadsPale)],
    short: "A single round of scented beads.",
    story: ["A single round of white heartwood beads on a stretch cord. Warm it between the palms and it gives its scent."],
    details: [{ label: "Fits", value: "Wrists 15–18 cm" }],
    care: WHITE_CARE,
    counterpart: "r-bead-bracelet",
  },
  {
    slug: "w-scented-mala-54",
    wood: "white",
    name: "Half Mala, 54 beads",
    category: "w-beads",
    price: 5200,
    shots: [s(P.beadsSand), s(P.whiteBeads)],
    short: "Half a round of fragrant beads, for travel.",
    story: ["Fifty-four white heartwood beads with a guru bead, light enough for the pocket."],
    details: [{ label: "Beads", value: "54 + 1 guru bead, 8 mm" }],
    care: WHITE_CARE,
  },
  // ---------- Carvings & Objects ----------
  {
    slug: "w-mysuru-fan",
    wood: "white",
    name: "Mysuru Carved Fan",
    category: "carvings",
    price: 6500,
    shots: [s(P.fanCarved), s(P.fanAntique)],
    short: "Pierced by hand, leaf by leaf. It scents the air it moves.",
    story: [
      "A folding fan of thin white sandalwood leaves, each pierced by hand with a fine saw.",
      "Every time it opens it moves a little of the scent into the room.",
    ],
    details: [
      { label: "Leaves", value: "22, pierced by hand" },
      { label: "Length", value: "23 cm" },
      { label: "Made in", value: "Mysuru" },
    ],
    care: WHITE_CARE,
    badge: "Studio favourite",
    featured: true,
  },
  {
    slug: "w-carved-figure",
    wood: "white",
    name: "Carved Saraswati",
    category: "carvings",
    price: 18000,
    options: opts("Height", [["10 cm", 18000], ["15 cm", 32000]]),
    shots: [s(P.carvedDeity), s(P.carving)],
    short: "Carved in the Mysuru tradition by a single carver.",
    story: ["A seated Saraswati with her veena, carved by one hand from a single block of white heartwood."],
    details: [
      { label: "Carved in", value: "Mysuru" },
      { label: "Made to order", value: "Four weeks" },
    ],
    care: WHITE_CARE,
    badge: "Limited",
  },
  {
    slug: "w-offering-bowl",
    wood: "white",
    name: "Offering Bowl",
    category: "carvings",
    price: 4800,
    shots: [s(P.bowlHand), s(P.platesBowls)],
    short: "A small turned bowl for flowers, rice or paste.",
    story: ["Turned thin and light, for the altar or the dressing table."],
    details: [{ label: "Size", value: "10 cm across" }],
    care: WHITE_CARE,
  },
  {
    slug: "w-key-fob",
    wood: "white",
    name: "Scented Key Fob",
    category: "carvings",
    price: 1500,
    shots: [pale(P.keyTag), s(P.whiteLog)],
    short: "Keys that smell faintly of sandalwood.",
    story: ["A small block of white heartwood on a brass ring. It keeps its scent for years and warms in the pocket."],
    details: [
      { label: "Size", value: "Approx. 55 × 28 × 8 mm" },
      { label: "Fittings", value: "Solid brass" },
    ],
    care: WHITE_CARE,
    counterpart: "r-key-fob",
  },
  {
    slug: "w-card-case",
    wood: "white",
    name: "Card Case",
    category: "carvings",
    price: 4200,
    shots: [s(P.boxes), pale(P.boxCarved)],
    short: "Visiting cards that come out smelling of sandalwood.",
    story: ["A slim case with a carved lid, made to hold twenty cards."],
    details: [{ label: "Holds", value: "20 cards" }],
    care: WHITE_CARE,
  },
  // ---------- Gifting ----------
  {
    slug: "w-morning-ritual",
    wood: "white",
    name: "The Morning Ritual",
    category: "w-gifting",
    price: 9900,
    shots: [s(P.giftLinen), s(P.whiteRitual)],
    short: "Chandan stone and stick, 5 ml of heartwood oil, a lamp wick tin.",
    story: ["Everything for the first ten minutes of the day, in one linen-wrapped box."],
    details: [{ label: "Includes", value: "Stone and stick, heartwood oil 5 ml, cotton wicks" }],
    care: WHITE_CARE,
    featured: true,
  },
  {
    slug: "w-boxed-oil",
    wood: "white",
    name: "Oil in a Turned Box",
    category: "w-gifting",
    price: 12500,
    shots: [pale(P.boxCarved), s(P.oil)],
    short: "10 ml of heartwood oil in a white sandalwood box.",
    story: ["The box is turned from the same heartwood the oil came from. When the oil is gone, the box still smells of it."],
    details: [{ label: "Includes", value: "Heartwood oil 10 ml, turned box" }],
    care: WHITE_CARE,
  },
  {
    slug: "w-wedding-tray",
    wood: "white",
    name: "Wedding Tray",
    category: "w-gifting",
    price: 15000,
    shots: [s(P.diyaHands), s(P.boxes)],
    short: "Attar, chandan, a mala and a lamp on a turned tray. From 10 trays.",
    story: ["For the families and the guests. We pack each tray by hand and can add names to the card."],
    details: [
      { label: "Includes", value: "Attar 6 ml, chandan 50 g, wrist mala, brass lamp" },
      { label: "From", value: "10 trays" },
    ],
    care: WHITE_CARE,
  },
  {
    slug: "w-scented-pendant",
    wood: "white",
    name: "Scented Pendant",
    category: "carvings",
    price: 8200,
    shots: [pale(P.carvedTag), s(P.whiteBeads)],
    short: "A carved disc of white heartwood on silk. You notice it when you move.",
    story: ["A small carved disc of white heartwood on a silk cord. The scent comes and goes as you move."],
    details: [
      { label: "Size", value: "28 mm" },
      { label: "Bail", value: "Sterling silver" },
    ],
    care: WHITE_CARE,
    counterpart: "r-grain-pendant",
  },
];

export const PRODUCTS: Product[] = [...RED, ...WHITE];

export function productsFor(wood: Wood): Product[] {
  return wood === "red" ? RED : WHITE;
}

export function getProduct(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

/** The featured pieces for a landing page, in catalogue order. */
export function featured(wood: Wood, max = 8): Product[] {
  return productsFor(wood).filter((p) => p.featured).slice(0, max);
}

export function categoryOf(p: Product): Category {
  return CATEGORIES[p.wood].find((c) => c.id === p.category)!;
}

export function getOption(p: Product, optionId?: string): OptionValue | undefined {
  if (!p.options) return undefined;
  return p.options.values.find((v) => v.id === optionId) ?? p.options.values[0];
}

export function priceOf(p: Product, optionId?: string): number {
  return getOption(p, optionId)?.price ?? p.price;
}

/** "₹4,800" or "From ₹4,800" when there are options with different prices. */
export function priceLabel(p: Product): string {
  const varies = p.options && new Set(p.options.values.map((v) => v.price)).size > 1;
  return (varies ? "From " : "") + formatINR(p.price);
}

export function formatINR(n: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export function priceRange(wood: Wood): [number, number] {
  const ps = productsFor(wood).map((p) => p.price);
  return [Math.min(...ps), Math.max(...ps)];
}

/* ---------- shop query: the same filtering and sorting in every design ---------- */

export type SortKey = "featured" | "price-asc" | "price-desc" | "new" | "name";
export const SORTS: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "new", label: "New" },
  { key: "price-asc", label: "Price, low to high" },
  { key: "price-desc", label: "Price, high to low" },
  { key: "name", label: "Name" },
];

export const PRICE_BANDS: { id: string; label: string; min: number; max: number }[] = [
  { id: "u3", label: "Under ₹3,000", min: 0, max: 2999 },
  { id: "3-10", label: "₹3,000 – ₹10,000", min: 3000, max: 10000 },
  { id: "10-25", label: "₹10,000 – ₹25,000", min: 10001, max: 25000 },
  { id: "25p", label: "Above ₹25,000", min: 25001, max: Infinity },
];

export type ShopQuery = { category?: CategoryId | "all"; q?: string; sort?: SortKey; band?: string; editionsOnly?: boolean };

export function queryProducts(wood: Wood, query: ShopQuery): Product[] {
  const { category = "all", q = "", sort = "featured", band, editionsOnly } = query;
  const needle = q.trim().toLowerCase();
  const b = PRICE_BANDS.find((x) => x.id === band);
  const list = productsFor(wood).filter(
    (p) =>
      (category === "all" || p.category === category) &&
      (!b || (p.price >= b.min && p.price <= b.max)) &&
      (!editionsOnly || p.badge === "Edition" || p.badge === "Limited") &&
      (!needle || `${p.name} ${p.short} ${categoryOf(p).label}`.toLowerCase().includes(needle)),
  );
  const order = productsFor(wood);
  const rank = (p: Product) => (p.featured ? 0 : 1) * 1000 + order.indexOf(p);
  switch (sort) {
    case "price-asc":
      return [...list].sort((a, b2) => a.price - b2.price);
    case "price-desc":
      return [...list].sort((a, b2) => b2.price - a.price);
    case "new":
      return [...list].sort((a, b2) => Number(b2.badge === "New") - Number(a.badge === "New") || rank(a) - rank(b2));
    case "name":
      return [...list].sort((a, b2) => a.name.localeCompare(b2.name));
    default:
      return [...list].sort((a, b2) => rank(a) - rank(b2));
  }
}
