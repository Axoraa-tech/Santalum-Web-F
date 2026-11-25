import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { CATEGORIES, featured, formatINR, getProduct, priceRange, productsFor, type CategoryId, type Product, type Shot } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";

/* ---------- helpers ---------- */

export function cx(...xs: (string | false | null | undefined)[]) {
  return xs.filter(Boolean).join(" ");
}

export const other = (w: Wood): Wood => (w === "red" ? "white" : "red");

export const WOOD_SHORT: Record<Wood, string> = { red: "Red sandalwood", white: "White sandalwood" };

/** Which wood a shop category belongs to (the two woods have no categories in common). */
export function woodOfCategory(c: string | undefined | null): Wood | undefined {
  if (!c) return undefined;
  if (CATEGORIES.red.some((x) => x.id === c)) return "red";
  if (CATEGORIES.white.some((x) => x.id === c)) return "white";
  return undefined;
}

export function isCategory(c: string | undefined | null): c is CategoryId {
  return !!woodOfCategory(c);
}

export const shopHref = (c?: CategoryId) => (c ? `/d/06/shop?c=${c}` : "/d/06/shop");

/**
 * The photographs this board shows for a piece. A few white pieces borrow a red photograph and pale
 * it with a filter, which still reads as red wood; here they show only photographs of pale wood.
 */
const OWN_SHOTS: Record<string, Shot[]> = {
  "w-scented-pendant": [{ photo: PHOTOS.whiteBeads }, { photo: PHOTOS.beadsSand }],
};
export function shotsOf(p: Product): Shot[] {
  if (OWN_SHOTS[p.slug]) return OWN_SHOTS[p.slug];
  const own = p.shots.filter((x) => x.tone !== "pale");
  return own.length ? own : p.shots;
}
/** The first photograph of a piece, by slug (order lines keep only a photo id). */
export function photoFor(slug: string, fallbackId: string, alt: string): Shot {
  const p = getProduct(slug);
  return p ? shotsOf(p)[0] : { photo: { id: fallbackId, alt } };
}
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A wood's grain, drawn (not photographed), for panels that need to read as one wood at a glance. */
export const GRAIN: Record<Wood, string> = {
  red: "repeating-linear-gradient(101deg, #5e1a0c 0 2px, #9b3520 2px 9px, #b4492b 9px 11px, #8a2c18 11px 17px, #a63d22 17px 22px)",
  white: "repeating-linear-gradient(101deg, #c9a56e 0 1.5px, #ecd7ae 1.5px 9px, #d9bb87 9px 11px, #f3e4c4 11px 17px, #e4c999 17px 22px)",
};

/** "From ₹1,200 to ₹98,000" for a wood's whole shop. */
export function rangeLine(wood: Wood) {
  const [lo, hi] = priceRange(wood);
  return `${formatINR(lo)} to ${formatINR(hi)}`;
}

/* ---------- the making steps, per wood ---------- */

export type Step = { name: string; line: string; long: string; shot: Shot };

const make = (wood: Wood, rest: { line: string; more: string; shot: Shot }[]): Step[] =>
  CONTENT[wood].making.map((m, i) => ({ name: m.title, line: rest[i].line, long: `${m.text} ${rest[i].more}`, shot: rest[i].shot }));

export const STEPS: Record<Wood, Step[]> = {
  red: make("red", [
    { line: "Colour, weight and the run of the grain.", more: "The darkest, densest wood goes to beads and bangles; lighter billets become boxes and coasters.", shot: { photo: PHOTOS.redChip } },
    { line: "Lathe for beads and bangles, bench for figures.", more: "The wood is hard enough to dull an edge quickly, so tools are honed through the day.", shot: { photo: PHOTOS.turned, tone: "red" } },
    { line: "Oil and beeswax. No lacquer, no stain.", more: "Left open like this, the wood keeps darkening with use.", shot: { photo: PHOTOS.redGrain } },
    { line: "A second pair of hands, then a number.", more: "A piece that fails is turned again into something smaller, or milled to powder.", shot: { photo: PHOTOS.braceletDark } },
    { line: "Boxed with its batch record.", more: "The record names the lot, where it came from and who finished the piece.", shot: { photo: PHOTOS.boxRed } },
  ]),
  white: make("white", [
    { line: "Heartwood only. Sapwood has no scent.", more: "The sapwood is what cheap powder is made from. We do not sell it.", shot: { photo: PHOTOS.whiteLog } },
    { line: "Rested until the oil settles.", more: "A carving cut too early can split as it dries.", shot: { photo: PHOTOS.shavingsPale } },
    { line: "Chips to the still, blocks to the carver.", more: "Distillation is slow, over days. The carving is done in Mysuru with chisels and a fine saw.", shot: { photo: PHOTOS.fanCarved } },
    { line: "Every oil batch is tested.", more: "Carvings are checked for cracks and for scent before they are boxed.", shot: { photo: PHOTOS.oilVials } },
    { line: "Amber glass, the lot on the label.", more: "Oils leave in amber glass; carvings in a box of the same wood.", shot: { photo: PHOTOS.oil } },
  ]),
};

/* ---------- example batch records (clearly labelled as examples) ---------- */

export type BatchRecord = {
  piece: string;
  slug: string;
  wood: Wood;
  batch: string;
  origin: string;
  /** "Finished", "Distilled", "Carved"... */
  verb: string;
  date: string;
  by: string;
};

export const RECORDS: Record<Wood, BatchRecord[]> = {
  red: [
    { piece: "Japa Mala, 108 beads", slug: "r-japa-mala-108", wood: "red", batch: "R-26-0412", origin: "Eastern Ghats, Andhra Pradesh", verb: "Finished", date: "18 Nov 2026", by: "K.R." },
    { piece: "Key Fob", slug: "r-key-fob", wood: "red", batch: "R-26-0409", origin: "Eastern Ghats, Andhra Pradesh", verb: "Finished", date: "9 Nov 2026", by: "A.V." },
    { piece: "Grain Pendant", slug: "r-grain-pendant", wood: "red", batch: "R-26-0415", origin: "Seshachalam, Andhra Pradesh", verb: "Carved", date: "22 Nov 2026", by: "K.R." },
    { piece: "Coasters, pair", slug: "r-coasters", wood: "red", batch: "R-26-0407", origin: "Eastern Ghats, Andhra Pradesh", verb: "Turned", date: "6 Nov 2026", by: "A.V." },
    { piece: "Vault Cuff No. 14", slug: "r-vault-cuff", wood: "red", batch: "R-11-0014", origin: "Lot sourced in 2011", verb: "Turned", date: "20 Nov 2026", by: "S.M." },
  ],
  white: [
    { piece: "Heartwood Oil, 5 ml", slug: "w-heartwood-oil", wood: "white", batch: "W-26-0188", origin: "Karnataka", verb: "Distilled", date: "Sep 2026", by: "Report on file" },
    { piece: "Chandan Attar", slug: "w-chandan-attar", wood: "white", batch: "W-26-0191", origin: "Karnataka", verb: "Distilled", date: "Oct 2026", by: "Report on file" },
    { piece: "Mysuru Carved Fan", slug: "w-mysuru-fan", wood: "white", batch: "W-26-0176", origin: "Mysuru, Karnataka", verb: "Carved", date: "30 Oct 2026", by: "P.N." },
    { piece: "Incense Sticks", slug: "w-incense-sticks", wood: "white", batch: "W-26-0203", origin: "Mysuru, Karnataka", verb: "Rolled", date: "12 Nov 2026", by: "S.M." },
    { piece: "Chandan Powder", slug: "w-chandan-powder", wood: "white", batch: "W-26-0194", origin: "Karnataka", verb: "Milled", date: "5 Nov 2026", by: "R.K." },
  ],
};

export const BATCH_WORD: Record<Wood, string> = { red: "Batch", white: "Lot" };

/* ---------- long-form stories that tiles open into ---------- */

export type StoryId = "house" | "red" | "white" | "craft" | "provenance" | "vault" | "gifting";

export type Story = {
  title: string;
  lede: string;
  photo: Shot;
  photo2: Shot;
  body: string[];
  quote: string;
  facts: { label: string; value: string }[];
  /** A product slug to open, a shop link (switching to `wood` first), or a section on the home page. */
  cta?: { label: string; slug?: string; shop?: Wood; section?: string };
  steps?: boolean;
  record?: boolean;
  enquiry?: boolean;
};

const shot = (photo: PhotoRef, tone?: Shot["tone"]): Shot => ({ photo, tone });
const count = (w: Wood) => String(productsFor(w).length);
const editionOf = (w: Wood) => productsFor(w).find((p) => p.slug === CONTENT[w].edition.productSlug)!;

function woodStory(w: Wood): Story {
  const c = CONTENT[w];
  return {
    title: c.name,
    lede: `${c.latin}, ${c.sanskrit}, ${c.kannada}. ${c.oneLine}`,
    photo: w === "red" ? shot(PHOTOS.redGrain) : shot(PHOTOS.whiteLog),
    photo2: w === "red" ? shot(PHOTOS.redChip) : shot(PHOTOS.whitePowder),
    body: [...c.intro, c.origin.text, c.regulation],
    quote: w === "red" ? "Dense, cool and heavy in the hand." : "Warm it in the palm and the scent rises.",
    facts: [...c.facts.slice(0, 6), { label: "Pieces in the shop", value: count(w) }],
    cta: { label: `Shop ${c.name.toLowerCase()}`, shop: w },
  };
}

export const STORIES: Record<Wood, Record<StoryId, Story>> = {
  red: {
    house: {
      title: "Objects time cannot repeat",
      lede: "Santalum Maison turns red sandalwood into beads, objects and jewellery. The wood is dense, deep red and almost without scent, and every piece leaves with its batch record.",
      photo: shot(PHOTOS.carving),
      photo2: shot(PHOTOS.malaHand),
      body: [
        CONTENT.red.intro[0],
        CONTENT.red.intro[1],
        "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
        "And we write down what we know. If there is evidence, we show it. If there isn't, we don't invent it.",
      ],
      quote: CONTENT.red.closing,
      facts: [
        { label: "Species", value: CONTENT.red.latin },
        { label: "Grows in", value: "Eastern Ghats, Andhra Pradesh" },
        { label: "Pieces", value: `${count("red")} in the shop` },
        { label: "Prices", value: rangeLine("red") },
        { label: "Making", value: CONTENT.red.making.map((m) => m.title).join(", ") },
      ],
      cta: { label: "Shop red sandalwood", shop: "red" },
    },
    red: woodStory("red"),
    white: woodStory("white"),
    craft: {
      title: "How a piece is turned",
      lede: "Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows.",
      photo: shot(PHOTOS.carving),
      photo2: shot(PHOTOS.turned, "red"),
      body: [],
      steps: true,
      quote: "The wood decides what it will become. The hand follows.",
      facts: CONTENT.red.making.map((m, i) => ({ label: `Step ${i + 1}`, value: m.title })),
      cta: { label: "See what the lathe made", shop: "red" },
    },
    provenance: {
      title: CONTENT.red.provenance.title.replace(/\.$/, ""),
      lede: "If there is evidence, we show it. If there isn't, we don't invent it.",
      photo: shot(PHOTOS.malaHand),
      photo2: shot(PHOTOS.redPowder),
      body: [
        CONTENT.red.provenance.text,
        CONTENT.red.regulation,
        "The record shown here is an example of the format, not a real batch.",
      ],
      record: true,
      quote: "Know what you hold.",
      facts: [
        { label: "Every record has", value: "Species, lot, origin, who finished it, date" },
        { label: "Trade", value: "CITES Appendix II" },
        { label: "Lots", value: "Documented, paperwork shown" },
      ],
      cta: { label: "Look up a batch", section: "provenance" },
    },
    vault: {
      title: CONTENT.red.edition.name,
      lede: CONTENT.red.edition.text,
      photo: shot(PHOTOS.turned, "red"),
      photo2: shot(PHOTOS.boxRed),
      body: [
        "The wood was sourced in 2011 and has rested since. Aged red heartwood turns darker and closer, and takes a polish that young wood cannot.",
        "Each cuff is numbered from one to twenty-one and entered in our registry with its number, the lot it came from, the artisan's name and the date it left our hands.",
        `${editionOf("red").edition!.left} of the ${CONTENT.red.edition.size} are still to be made. When the twenty-first is made, the edition closes.`,
      ],
      quote: "Twenty-one cuffs. Then the edition is closed.",
      facts: [
        { label: "Edition", value: `${CONTENT.red.edition.size}, numbered` },
        { label: "Still to be made", value: String(editionOf("red").edition!.left) },
        { label: "Wood", value: "Red heartwood, sourced 2011" },
        { label: "Price", value: formatINR(editionOf("red").price) },
      ],
      cta: { label: "See the Vault cuff", slug: "r-vault-cuff" },
    },
    gifting: {
      title: CONTENT.red.gifting.title.replace(/\.$/, ""),
      lede: CONTENT.red.gifting.text,
      photo: shot(PHOTOS.giftLinen),
      photo2: shot(PHOTOS.boxCarved),
      body: [
        "The presentation box is the gift as much as what goes in it: dovetailed, lined in raw cotton, with a drawer for the batch record. Choose it empty, or ask us to fill it.",
        "Desk sets of pen, coasters and key fob go to teams from ten sets, with a company card if you want one.",
        "At checkout you can add a written note for the card.",
      ],
      enquiry: true,
      quote: "Give something that remains.",
      facts: [
        { label: "Presentation box", value: formatINR(5500) },
        { label: "Desk set", value: `${formatINR(8400)}, from 10 sets` },
        { label: "Gift note", value: "Added at checkout" },
      ],
      cta: { label: "See the presentation box", slug: "r-presentation-box" },
    },
  },
  white: {
    house: {
      title: "The fragrance lives in the heartwood",
      lede: "Santalum Maison distils, rolls and carves white sandalwood: oil and attar, chandan and incense, and Mysuru carving. Heartwood only, and the lot is on every label.",
      photo: shot(PHOTOS.oilHands),
      photo2: shot(PHOTOS.whiteRitual),
      body: [
        CONTENT.white.intro[0],
        CONTENT.white.intro[1],
        "The scent decides. Only heartwood goes to the still or the carver; the pale sapwood, which smells of nothing, is set aside.",
        "If an oil has a test report, it travels with the bottle. If it doesn't, the label says so.",
      ],
      quote: "Four thousand years found its way to you.",
      facts: [
        { label: "Species", value: CONTENT.white.latin },
        { label: "Craft centre", value: "Mysuru, Karnataka" },
        { label: "Pieces", value: `${count("white")} in the shop` },
        { label: "Prices", value: rangeLine("white") },
        { label: "Making", value: CONTENT.white.making.map((m) => m.title).join(", ") },
      ],
      cta: { label: "Shop white sandalwood", shop: "white" },
    },
    red: woodStory("red"),
    white: woodStory("white"),
    craft: {
      title: "How the oil and the carving are made",
      lede: "The scent decides. Only heartwood goes to the still or to the carver, and every batch of oil is tested before it is bottled.",
      photo: shot(PHOTOS.fanCarved),
      photo2: shot(PHOTOS.oilDrop),
      body: [],
      steps: true,
      quote: "Heartwood, not sapwood.",
      facts: CONTENT.white.making.map((m, i) => ({ label: `Step ${i + 1}`, value: m.title })),
      cta: { label: "See what the still made", shop: "white" },
    },
    provenance: {
      title: CONTENT.white.provenance.title.replace(/\.$/, ""),
      lede: "If an oil has a test report, it travels with the bottle. If it doesn't, the label says so.",
      photo: shot(PHOTOS.oilDropper),
      photo2: shot(PHOTOS.whitePowder),
      body: [
        CONTENT.white.provenance.text,
        CONTENT.white.regulation,
        "The lot shown here is an example of the format, not a real lot.",
      ],
      record: true,
      quote: "The lot is on the label.",
      facts: [
        { label: "Every lot has", value: "Species, origin, date distilled or carved" },
        { label: "Oils", value: "Batch test, report on file" },
        { label: "Rules", value: "State forest rules, documented lots" },
      ],
      cta: { label: "Look up a lot", section: "provenance" },
    },
    vault: {
      title: CONTENT.white.edition.name,
      lede: CONTENT.white.edition.text,
      photo: shot(PHOTOS.oilVials),
      photo2: shot(PHOTOS.whiteLog),
      body: [
        "One lot of heartwood, harvested in 2011 and rested since. As the wood ages the oil grows softer and rounder; that is the reason to wait.",
        "Each 3 ml vial is numbered by hand and entered in the registry with its lot and the date it was distilled.",
        `${editionOf("white").edition!.left} of the ${CONTENT.white.edition.size} vials are left. When they are gone, the Reserve is closed.`,
      ],
      quote: "Fifty vials. Then the Reserve is closed.",
      facts: [
        { label: "Edition", value: `${CONTENT.white.edition.size} vials, numbered` },
        { label: "Left", value: String(editionOf("white").edition!.left) },
        { label: "Volume", value: "3 ml" },
        { label: "Price", value: formatINR(editionOf("white").price) },
      ],
      cta: { label: "See the Reserve oil", slug: "w-reserve-oil" },
    },
    gifting: {
      title: CONTENT.white.gifting.title.replace(/\.$/, ""),
      lede: CONTENT.white.gifting.text,
      photo: shot(PHOTOS.diyaHands),
      photo2: shot(PHOTOS.boxes),
      body: [
        "The Morning Ritual holds a chandan stone and stick, five millilitres of heartwood oil and a tin of cotton wicks, wrapped in linen.",
        "For weddings we pack trays by hand from ten trays: attar, chandan, a wrist mala and a brass lamp, with names on the card.",
        "At checkout you can add a written note for the card.",
      ],
      enquiry: true,
      quote: "A gift that fills the room.",
      facts: [
        { label: "The Morning Ritual", value: formatINR(9900) },
        { label: "Wedding tray", value: `${formatINR(15000)}, from 10 trays` },
        { label: "Gift note", value: "Added at checkout" },
      ],
      cta: { label: "See the Morning Ritual", slug: "w-morning-ritual" },
    },
  },
};

/* ---------- home sections, for the command palette and footer ---------- */

export function sectionsFor(wood: Wood): { id: string; label: string; words: string }[] {
  const r = wood === "red";
  return [
    { id: "woods", label: "The two woods", words: "red white sandalwood compare origin" },
    { id: "collection", label: r ? "The red collection" : "The white collection", words: "featured pieces products" },
    { id: "craft", label: r ? "How a piece is turned" : "How the oil is made", words: r ? "craft lathe select turn finish inspect record" : "craft distil carve select season test seal" },
    { id: "provenance", label: r ? "Batch records" : "Lots and test reports", words: "record batch lot evidence origin cites" },
    { id: "edition", label: CONTENT[wood].edition.name, words: r ? "vault cuff edition 21 collector" : "reserve oil edition 50 vials" },
    { id: `gifting-${wood}`, label: "Gifting", words: "gift corporate box wedding tray" },
    { id: `circle-${wood}`, label: "The Santalum Circle", words: "newsletter letters sign up email" },
  ];
}

/** Featured pieces for the home page (the full catalogue lives in the shop). */
export const homePieces = (wood: Wood) => featured(wood, 8);
