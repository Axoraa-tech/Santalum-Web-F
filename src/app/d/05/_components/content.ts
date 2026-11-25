import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, formatINR, priceRange, productsFor, type Product, type Tone, type Wood } from "@/lib/shop/products";

/**
 * Copy and data for design 05, "Index": a Swiss editorial catalogue.
 * The two woods are two editions of the catalogue. Every line the landing page shows exists in a red
 * and a white version; components render both and CSS (html[data-wood]) shows the current one.
 */

export type Duo<T = string> = { red: T; white: T };
export type IndexItem = { id: string; label: string | Duo };
export type Shot = { p: PhotoRef; tone?: Tone };

export const WOODS: Wood[] = ["red", "white"];
export const other = (w: Wood): Wood => (w === "red" ? "white" : "red");

export const EASE = [0.22, 1, 0.36, 1] as const;

/* ---------------- catalogue numbers and counts ---------------- */

/** The entry number of a piece within its own wood's catalogue, 1-based. */
export const catNo = (p: Product) => productsFor(p.wood).indexOf(p) + 1;
export const countIn = (w: Wood) => productsFor(w).length;
export function rangeIn(w: Wood) {
  const [lo, hi] = priceRange(w);
  return `${formatINR(lo)} to ${formatINR(hi)}`;
}
export const categoriesIn = (w: Wood) =>
  CATEGORIES[w].map((c) => ({ ...c, n: productsFor(w).filter((p) => p.category === c.id).length }));

/** Which wood a category id belongs to (category ids never overlap). */
export function woodOfCategory(id: string | null): Wood | null {
  if (!id) return null;
  if (CATEGORIES.red.some((c) => c.id === id)) return "red";
  if (CATEGORIES.white.some((c) => c.id === id)) return "white";
  return null;
}

export const WOOD_WORD: Duo = { red: "red", white: "white" };

/* ---------------- the landing page index ---------------- */

export const HOME_SECTIONS: IndexItem[] = [
  { id: "cover", label: { red: "Dense red", white: "Pale gold" } },
  { id: "specimens", label: { red: "The red specimen", white: "The white specimen" } },
  { id: "essay", label: { red: "Colour and weight", white: "Scent and oil" } },
  { id: "catalogue", label: { red: "Selected in red", white: "Selected in white" } },
  { id: "making", label: { red: "At the lathe", white: "Still and bench" } },
  { id: "provenance", label: { red: "Batch record", white: "Lot record" } },
  { id: "vault", label: { red: "The 2011 Vault", white: "The 2011 Reserve" } },
  { id: "gifting", label: { red: "Gifts in red", white: "Gifts in white" } },
  { id: "circle", label: "Santalum Circle" },
  { id: "colophon", label: "Colophon" },
];

export const sectionNo = (id: string) => HOME_SECTIONS.findIndex((s) => s.id === id) + 1;

/* ---------------- 2  Specimen ---------------- */

export type SpecRow = { label: string; found?: string; worked?: string; span?: string; note?: boolean };
export type Specimen = {
  figA: Shot & { caption: string };
  figB: Shot & { caption: string };
  rows: SpecRow[];
  footnote: string;
  dek: string;
};

export const SPECIMEN: Record<Wood, Specimen> = {
  red: {
    dek: "One wood, seen twice: as it comes from the lot, and as it leaves the lathe. What changes, and what does not.",
    figA: { p: PHOTOS.redChip, caption: "A raw piece of red sandalwood, as it comes from the lot." },
    figB: { p: PHOTOS.beadStrandsDark, caption: "The same heartwood turned into beads, oiled and strung." },
    rows: [
      { label: "Botanical name", span: "Pterocarpus santalinus, of the pea family. It shares a name with sandalwood, not a tree." },
      { label: "Colour", found: "Brick red at the edge, darkening to near black at the core", worked: "Deepens under oil, and darkens again where the skin touches it" },
      { label: "Scent", found: "Almost none", worked: "None. We do not scent it" },
      { label: "In the hand", found: "Dense, cool and fine-grained", worked: "Heavier than it looks; a pen needs no weight inside it" },
      { label: "Grows in", span: "The dry, rocky hills of the southern Eastern Ghats, mainly around Seshachalam in Andhra Pradesh", note: true },
      { label: "Used for", found: "Ritual paste, carving, a natural red dye", worked: "Beads, turned objects, boxes and jewellery" },
    ],
    footnote:
      "Red sandalwood is listed in CITES Appendix II and its trade in India is controlled. Every piece we sell comes from documented lots, and we show the paperwork.",
  },
  white: {
    dek: "One wood, seen twice: as the log is opened, and as the oil leaves the still. Where the fragrance is, and where it is not.",
    figA: { p: PHOTOS.whiteLog, caption: "A cut log: pale gold heartwood within, white sapwood around it." },
    figB: { p: PHOTOS.oilHands, caption: "Oil from the heartwood, a drop in the palm." },
    rows: [
      { label: "Botanical name", span: "Santalum album, of the sandalwood family. The sandalwood of temples, weddings and perfume." },
      { label: "Colour", found: "Pale gold heartwood inside white sapwood", worked: "Polishes to a soft gold; the sapwood is set aside" },
      { label: "Scent", found: "Warm and soft, strongest at the core", worked: "Rises when the wood is warmed, cut or ground" },
      { label: "Oil", found: "Forms in the heartwood after fifteen years of growth or more", worked: "Steam-distilled slowly from chips; every batch tested" },
      { label: "Grows in", span: "The dry forests of Karnataka, Tamil Nadu and Kerala. Mysuru is the centre of its craft", note: true },
      { label: "Used for", found: "Oil, attar, chandan paste, incense, temple carving", worked: "Oils, incense, powders, beads and Mysuru carving" },
    ],
    footnote:
      "White sandalwood in India is grown and sold under state forest rules. We buy only from documented lots and print the lot number on every label.",
  },
};

/* ---------------- 3  Essay ---------------- */

export type EssayNote = { n: number; fig: number; red: Shot & { caption: string }; white: Shot & { caption: string } };
export type EssayBlock =
  | { kind: "p"; red: string; white: string; note?: EssayNote }
  | { kind: "quote"; red: { text: string; cite: string }; white: { text: string; cite: string } };

export const ESSAY_TITLE: Duo = { red: "Colour and weight", white: "Scent and oil" };

export const ESSAY_STANDFIRST: Duo = {
  red: "Red sandalwood is chosen for what it is not. It has almost no scent and carries no oil. It is chosen for its colour and its weight, and for how both change in the hand.",
  white: "White sandalwood is chosen for what it holds: an oil that forms in the heartwood over many years and gives the wood its fragrance. An account of the wood, from the forest to the still.",
};

/** Both essays share one shape (paragraph, note, quote...) so the page is laid out once. `[n]` marks a sidenote. */
export const ESSAY: EssayBlock[] = [
  {
    kind: "p",
    red: "In Indian homes the word chandan covers two woods. This edition is about the red one, raktachandan, Pterocarpus santalinus. It is a tree of the pea family and no relation of the sandalwood of perfume. The two share a name because both were ground to paste for the forehead. The red paste is cool, and it stains.",
    white: "In Indian homes the word chandan covers two woods. This edition is about the white one, Santalum album, called srigandha in Kannada: the sandalwood of temples, weddings and perfume. It is pale gold and it is fragrant, and both of those things live in the same place, the heartwood.",
  },
  {
    kind: "p",
    red: "The tree grows only in the dry hills of the southern Eastern Ghats, around Seshachalam in Andhra Pradesh.[1] The ground is rocky and the summers are hot, so it grows slowly. The slower it grows, the deeper the colour of the heartwood: brick at the edge, and a red so dark at the core that an old piece reads as black.",
    white: "Cut a log across and the two woods inside it show at once.[1] The outer sapwood is white and has almost no scent. The heartwood at the centre is gold, and it holds the oil. A young tree has little heartwood; the oil forms only after fifteen years of growth or more, which is why old wood matters.",
    note: {
      n: 1,
      fig: 4,
      red: { p: PHOTOS.redGrain, caption: "The close grain of red heartwood." },
      white: { p: PHOTOS.whiteLog, caption: "Heartwood within, pale sapwood around it." },
    },
  },
  {
    kind: "p",
    red: "That colour is santalin, a pigment held in the wood itself.[2] For centuries it was the dye: chips from the lathe were boiled for a red that coloured cloth, and the chips from our turning floor are still sold for it. Nothing we make is stained or lacquered. What you see is the wood, and it keeps darkening with use.",
    white: "Karnataka is called the land of sandalwood, and Mysuru has been the centre of its craft for centuries.[2] There the oil was distilled, the incense rolled by hand and the fans and figures carved for temples and royal households. The workshops are still there, and the incense and carving in this edition come from them.",
    note: {
      n: 2,
      fig: 5,
      red: { p: PHOTOS.chipsRed, caption: "Heartwood chips from the turning floor." },
      white: { p: PHOTOS.gopuram, caption: "A temple tower through a carved stone doorway." },
    },
  },
  {
    kind: "quote",
    red: { text: "The wood decides what it will become. The hand follows.", cite: "From the workshop brief" },
    white: { text: "The fragrance lives in the heartwood.", cite: "What we print on every label" },
  },
  {
    kind: "p",
    red: "Every piece begins as a reading.[3] Before the first cut, the turner weighs the billet in the hand and looks at the end grain: where the heartwood is densest, where it runs straight and where it turns. A bead for a mala needs the straightest run. A pendant is cut where the figure in the grain will not appear twice. Offcuts become key fobs; the smallest become powder.",
    white: "The oil comes out slowly.[3] Heartwood is chipped and steamed for many hours, and the oil rises with the steam and is drawn off as it cools. Nothing is added and nothing is cut. Each batch is tested, and the report is kept with the lot and printed on the box.",
    note: {
      n: 3,
      fig: 6,
      red: { p: PHOTOS.turned, tone: "red", caption: "Turned pieces after oiling." },
      white: { p: PHOTOS.oilVials, caption: "A dropper above a row of amber vials." },
    },
  },
  {
    kind: "p",
    red: "It is dense enough that a small piece surprises the hand.[4] A writing pen needs no weight inside it; a mala of 108 beads sits heavy around the wrist. Rubbed with natural oil and beeswax, the surface closes and the colour deepens. Handled every day, it darkens again where the skin touches it. That is the wood, not wear.",
    white: "Not every piece of heartwood goes to the still.[4] Some is ground to chandan for the morning tilak and the face pack. Some is mixed with halmaddi resin and rolled onto bamboo for incense. The best blocks go to the carver's bench and come back as a fan that scents the air it moves.",
    note: {
      n: 4,
      fig: 7,
      red: { p: PHOTOS.malaHand, caption: "Beads darken and smooth in the hand over the years." },
      white: { p: PHOTOS.incenseDrying, caption: "Hand-rolled incense drying in rows." },
    },
  },
  {
    kind: "quote",
    red: { text: "Know what you hold.", cite: "The first rule of the batch record" },
    white: { text: "Heartwood, not sapwood.", cite: "The first rule of the lot record" },
  },
  {
    kind: "p",
    red: "Red sandalwood has been cut too hard for too long. It is listed in CITES Appendix II, and its trade in India is controlled. We buy only from documented lots, and every piece carries its batch record: the species, the lot, where it came from, who finished it and when.",
    white: "Cheap sandalwood powder is often sapwood, and smells of nothing. We use heartwood only and say so on every jar and bottle. White sandalwood in India is grown and sold under state forest rules; we buy only from documented lots and print the lot on every label.",
  },
  {
    kind: "p",
    red: "If there is evidence, we show it. If there isn't, we don't invent it. Made with respect for the material, designed for the life around it: that is the whole brief, and the rest of this edition is what it looks like in red.",
    white: "If there is evidence, we show it. If there isn't, we don't invent it. Made with respect for the material, designed for the life around it: that is the whole brief, and the rest of this edition is what it smells like in white.",
  },
];

const words = (s: string) => s.split(" ").length;
export const ESSAY_MINUTES: Duo<number> = {
  red: Math.max(1, Math.round(ESSAY.reduce((n, b) => n + (b.kind === "p" ? words(b.red) : words(b.red.text)), words(ESSAY_STANDFIRST.red)) / 220)),
  white: Math.max(1, Math.round(ESSAY.reduce((n, b) => n + (b.kind === "p" ? words(b.white) : words(b.white.text)), words(ESSAY_STANDFIRST.white)) / 220)),
};
export const ESSAY_PARAS = ESSAY.filter((b) => b.kind === "p").length;

/* ---------------- 5  Making (steps come from CONTENT[wood].making) ---------------- */

export const MAKING_TITLE: Duo = { red: "At the lathe", white: "Still and bench" };
export const MAKING_DEK: Duo = {
  red: "Every piece begins as a reading. The turner studies the grain before the first cut. The wood decides what it will become. The hand follows.",
  white: "The heartwood is read before anything is made of it. Some goes to the still, some to the carver's bench, and every lot keeps its number from the forest to the label.",
};
export const MAKING_PHOTOS: Record<Wood, (Shot & { caption: string })[]> = {
  red: [
    { p: PHOTOS.redChip, caption: "A billet, read before the first cut." },
    { p: PHOTOS.turned, tone: "red", caption: "Turned on the lathe." },
    { p: PHOTOS.braceletClose, caption: "Oil and beeswax, no lacquer." },
    { p: PHOTOS.beadStrandsDark, caption: "Checked by a second pair of hands." },
    { p: PHOTOS.boxRed, caption: "Boxed with its batch record." },
  ],
  white: [
    { p: PHOTOS.whiteLog, caption: "Heartwood only; the sapwood is set aside." },
    { p: PHOTOS.chipsPale, caption: "Seasoned heartwood, chipped for the still." },
    { p: PHOTOS.oilDrop, caption: "Oil drawn off as it cools." },
    { p: PHOTOS.oilVials, caption: "A sample from every batch, tested." },
    { p: PHOTOS.oil, caption: "Amber glass, the lot on the label." },
  ],
};

/* ---------------- 6  Provenance ---------------- */

export type RecordField = { label: string; value: string; note: string };
export type Record6 = { title: string; kind: string; ref: string; dek: string; photo: Shot; fields: RecordField[]; foot: string; notesFoot: string };

export const RECORD: Record<Wood, Record6> = {
  red: {
    title: "Batch record",
    kind: "Batch record",
    ref: "R-26-0412",
    dek: "Know what you hold. If there is evidence, we show it. If there isn't, we don't invent it.",
    photo: { p: PHOTOS.beadStrandsDark },
    fields: [
      { label: "Piece", value: "Japa Mala, 108 beads", note: "The piece as it is listed in this catalogue, so the record and the object can be matched." },
      { label: "Wood", value: "Pterocarpus santalinus (red sandalwood)", note: "The botanical name, because both woods are sold as chandan. On a red piece it removes any doubt." },
      { label: "Lot origin", value: "Eastern Ghats, Andhra Pradesh", note: "Where the lot came from, as far as the supplier's documents and CITES paperwork show it. We go no further than the paperwork." },
      { label: "Batch", value: "R-26-0412", note: "R for red, then the year and the batch. A mala is turned from one batch, so the colour runs true from bead to bead." },
      { label: "Finished by", value: "K. R.", note: "The initials of the turner who finished the piece, as the workshop entered them." },
      { label: "Date", value: "18 November 2026", note: "The day the piece passed its second inspection and left the workshop." },
    ],
    foot: "Entered by the workshop when the piece left the lathe.",
    notesFoot:
      "Every jar of red powder carries its batch number. Every Vault cuff is entered in the registry with its number, its origin, the turner's name and the date it left our hands.",
  },
  white: {
    title: "Lot record",
    kind: "Lot record",
    ref: "W-26-0188",
    dek: "Know what is in the bottle. If there is evidence, we show it; for an oil, that means the test report.",
    photo: { p: PHOTOS.oil },
    fields: [
      { label: "Piece", value: "Heartwood Oil, 10 ml", note: "The bottle, jar or carving as it is listed in this catalogue." },
      { label: "Wood", value: "Santalum album (white sandalwood)", note: "The botanical name. Santalum album is the sandalwood of perfume, and the label says so plainly." },
      { label: "Lot origin", value: "Karnataka", note: "Where the heartwood was grown, as far as the state forest documents show it." },
      { label: "Lot", value: "W-26-0188", note: "W for white, then the year and the lot. The same number is printed on the label and on the box." },
      { label: "Distilled", value: "September 2026", note: "The month the oil came off the still. A carving carries the month it left the bench instead." },
      { label: "Report", value: "Batch test on file", note: "The test report for the batch is kept with the lot. Ask and we send it." },
    ],
    foot: "Entered by the distillery when the batch was bottled.",
    notesFoot:
      "Every bottle and jar carries its lot. Every Reserve vial is numbered by hand and entered in the registry with its lot and the month it was distilled.",
  },
};

/* ---------------- 7  The edition ---------------- */

export type EditionCopy = { title: string; titleBr: [string, string]; dek: string; unit: string; photo: Shot; caption: string; prompt: string; chosen: (n: number, size: number) => string };
export const EDITION: Record<Wood, EditionCopy> = {
  red: {
    title: "The 2011 Vault",
    titleBr: ["The 2011", "Vault"],
    dek: "Twenty-one numbered cuffs, turned from aged heartwood sourced in 2011. An edition of 21, each entered in the registry.",
    unit: "No.",
    photo: { p: PHOTOS.turned, tone: "red" },
    caption: "Turned from aged red heartwood. Each cuff is numbered.",
    prompt: "Choose a number. Each cuff is made to your measurement and leaves with its registry certificate.",
    chosen: (n, size) => `Cuff No. ${n} of ${size}, in red sandalwood. Made to your measurement, with its registry certificate. We confirm the number with you before it is turned.`,
  },
  white: {
    title: "The 2011 Reserve",
    titleBr: ["The 2011", "Reserve"],
    dek: "Fifty vials of oil distilled from one lot of heartwood harvested in 2011 and aged since. Each vial is numbered by hand.",
    unit: "Vial",
    photo: { p: PHOTOS.oilVials },
    caption: "Reserve vials, three millilitres each, numbered by hand.",
    prompt: "Choose a vial. Each is numbered by hand and entered in the registry with its lot and the month it was distilled.",
    chosen: (n, size) => `Vial No. ${n} of ${size}, three millilitres of 2011 heartwood oil. Entered in the registry under your name. We confirm the number with you before it is sealed.`,
  },
};

/* ---------------- 8  Gifting ---------------- */

export const GIFT: Record<Wood, { title: string; line: string; photo: Shot; caption: string; text: string[]; bandsHead: string; category: string }> = {
  red: {
    title: "Gifts in red",
    line: "A gift with weight",
    photo: { p: PHOTOS.boxCarved },
    caption: "A hand-carved box, ready to give.",
    text: [
      "A gift in red sandalwood is kept. It is heavy in the hand, it does not fade in a drawer, and it darkens with the person who uses it.",
      "The presentation box is made for that: dovetailed, hinged in brass, lined in raw cotton, with a drawer for the batch record. Choose it empty, or ask us to fill it.",
      "For companies, the desk set is our usual answer: a pen, a pair of coasters and a key fob in one box, from ten sets. Tell us the number and the date, and we say plainly what can be made in time.",
      "For a once-in-a-life occasion there is the heirloom casket, carved by one hand over five weeks. Nine are made a year.",
    ],
    bandsHead: "Red sandalwood gifts, by what you mean to spend",
    category: "gifting",
  },
  white: {
    title: "Gifts in white",
    line: "A gift that fills the room",
    photo: { p: PHOTOS.giftLinen },
    caption: "A gift wrapped in linen, in a wooden tray.",
    text: [
      "White sandalwood is given at weddings, housewarmings and pujas, and it is meant to be used. A gift of it scents the room it is opened in.",
      "The Morning Ritual holds the first ten minutes of the day: the chandan stone and stick, five millilitres of heartwood oil and a tin of cotton wicks, wrapped in linen.",
      "For weddings we pack trays by hand, from ten: attar, chandan, a wrist mala and a brass lamp, with names on the card if you send them.",
      "Oil in a turned box is the quiet one. When the oil is gone, the box still smells of it.",
    ],
    bandsHead: "White sandalwood gifts, by what you mean to spend",
    category: "w-gifting",
  },
};

/* ---------------- 9  Circle ---------------- */

export const CIRCLE: Record<Wood, { when: string; fine: string }> = {
  red: { when: "a new batch is turned", fine: "One address, no account. Letters only when there is a new batch, or a Vault number comes back." },
  white: { when: "a new oil is distilled", fine: "One address, no account. Letters only when there is a new oil, or a note on ritual worth sending." },
};

/* ---------------- shop and product page lines ---------------- */

export const PROVENANCE_LINE: Duo = {
  red: "Leaves with its batch record: species, lot, origin, the turner's initials and the date it was finished.",
  white: "Carries its lot number on the label. For oils, the batch test report is kept with the lot and sent on request.",
};
export const STORY_CLOSE: Duo = {
  red: "Every piece begins as a reading. The wood decides what it will become. The hand follows.",
  white: "The fragrance lives in the heartwood. We use the heartwood only, and say so.",
};
export const DELIVERY_LINE = "Free delivery across India, 3–5 working days. Express ₹350.";
export const RETURNS_LINE =
  "If a piece arrives damaged or is not what you ordered, write to us within seven days of delivery and we put it right. Opened oils and powders, and numbered editions, cannot be returned.";
export const PREVIEW_LINE = "Preview: accounts and orders are saved in this browser until our store opens.";

export const SHOP_DEK: Duo = {
  red: `Every piece we make in red sandalwood, in catalogue order: beads and malas, everyday objects, powder, gifts and jewellery. ${CONTENT.red.oneLine}`,
  white: `Every piece we make in white sandalwood, in catalogue order: oil and attar, incense, chandan, beads, Mysuru carving and gifts. ${CONTENT.white.oneLine}`,
};

/* ---------------- care ---------------- */

const careWords = (s: string) => new Set(s.toLowerCase().match(/[a-z]+/g) ?? []);

/**
 * The care lines for a piece: its own, then the wood's general line unless that says the same thing in other
 * words (most white pieces carry a line that differs from the wood's by "and sun"). Shared words over all words.
 */
export function careLines(p: Product): string[] {
  const own = p.care;
  const general = CONTENT[p.wood].care;
  const a = careWords(own);
  const b = careWords(general);
  const shared = [...a].filter((w) => b.has(w)).length;
  const same = shared / new Set([...a, ...b]).size >= 0.6;
  return same ? [own] : [own, general];
}
