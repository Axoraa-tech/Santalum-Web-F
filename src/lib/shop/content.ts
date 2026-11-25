import { PHOTOS, type PhotoRef } from "../photos";
import type { Wood } from "../wood-boot";

/**
 * Everything that changes when the visitor switches wood, apart from the products:
 * names, copy for every section, facts, making steps, the edition, journal titles and colours.
 * Designs set this copy in their own layout; they should not fall back to wood-neutral text.
 */

export type WoodContent = {
  wood: Wood;
  name: string; // "Red sandalwood"
  short: string; // "Red"
  latin: string;
  sanskrit: string;
  kannada: string;
  localName: string; // what people call it at home
  eyebrow: string;
  hero: { title: string; sub: string; cta: string; photo: PhotoRef; photoAlt: PhotoRef };
  /** Two short paragraphs introducing the wood. */
  intro: string[];
  /** One sentence, the difference in a line. */
  oneLine: string;
  facts: { label: string; value: string }[];
  origin: { region: string; text: string; photo: PhotoRef };
  making: { title: string; text: string }[];
  provenance: { title: string; text: string; record: { label: string; value: string }[] };
  edition: { name: string; size: number; text: string; productSlug: string };
  gifting: { title: string; text: string };
  circle: { title: string; text: string };
  care: string;
  regulation: string;
  journal: { title: string; dek: string }[];
  closing: string;
  /** Suggested colours. Designs may tune these, but the two woods must read as different palettes. */
  palette: { accent: string; accentDeep: string; accentSoft: string; tint: string; ink: string; muted: string };
};

export const CONTENT: Record<Wood, WoodContent> = {
  red: {
    wood: "red",
    name: "Red sandalwood",
    short: "Red",
    latin: "Pterocarpus santalinus",
    sanskrit: "रक्तचन्दन",
    kannada: "ರಕ್ತಚಂದನ",
    localName: "Raktachandan",
    eyebrow: "Red sandalwood · India",
    hero: {
      title: "Objects time cannot repeat.",
      sub: "Beads, objects and jewellery turned from the dense red heartwood of Pterocarpus santalinus. Every piece leaves with its batch record.",
      cta: "Shop red sandalwood",
      photo: PHOTOS.redGrain,
      photoAlt: PHOTOS.redChip,
    },
    intro: [
      "Red sandalwood is a different tree from the sandalwood most people know. It has almost no scent. What it has is colour, a red that deepens toward black at the core, and a density that makes a small piece feel heavy in the hand.",
      "It grows only in the dry hills of the southern Eastern Ghats. We work it for what it is: turned, carved and finished by hand, and left without lacquer so the wood keeps changing with use.",
    ],
    oneLine: "Dense, deep red and almost without scent.",
    facts: [
      { label: "Species", value: "Pterocarpus santalinus" },
      { label: "Family", value: "Fabaceae, the pea family" },
      { label: "Grows in", value: "Eastern Ghats, mainly Andhra Pradesh" },
      { label: "Colour", value: "Brick red, darkening to near black" },
      { label: "Scent", value: "Almost none" },
      { label: "In the hand", value: "Dense, cool, fine-grained" },
      { label: "Used for", value: "Beads, carving, natural red dye" },
    ],
    origin: {
      region: "Eastern Ghats, Andhra Pradesh",
      text: "Seshachalam and the hills around it are dry, rocky and hot. The tree grows slowly there, and the slower it grows, the deeper the colour of the heartwood.",
      photo: PHOTOS.temple,
    },
    making: [
      { title: "Select", text: "The billet is read before the first cut: colour, weight and the run of the grain." },
      { title: "Turn", text: "Beads, bowls and bangles go on the lathe; figures go to the carver's bench." },
      { title: "Finish", text: "Finer and finer grits, then natural oil and beeswax. No lacquer, no stain." },
      { title: "Inspect", text: "Checked by a second pair of hands for cracks, colour and fit, then numbered." },
      { title: "Record", text: "Wrapped in linen or boxed, with its batch record and a care card." },
    ],
    provenance: {
      title: "Know what you hold.",
      text: "Every red sandalwood piece carries a batch record: the species, the lot, where it came from, who finished it and when. If there is evidence, we show it. If there isn't, we don't invent it.",
      record: [
        { label: "Batch", value: "R-26-0412" },
        { label: "Species", value: "Pterocarpus santalinus" },
        { label: "Lot origin", value: "Eastern Ghats, Andhra Pradesh" },
        { label: "Finished by", value: "K. R." },
        { label: "Date", value: "18 November 2026" },
      ],
    },
    edition: {
      name: "The 2011 Vault",
      size: 21,
      text: "Twenty-one cuffs turned from heartwood sourced in 2011 and aged since. Each is numbered and entered in our registry.",
      productSlug: "r-vault-cuff",
    },
    gifting: {
      title: "A gift with weight.",
      text: "Red sandalwood gifts are heavy in the hand and keep for a lifetime. Hinged boxes, desk sets for teams, and a heirloom casket made nine times a year.",
    },
    circle: {
      title: "The Santalum Circle",
      text: "Letters from the workshop when a new red sandalwood batch is turned, and first word when a Vault number is returned.",
    },
    care: "Keep dry and out of direct sun. A drop of natural oil once a season.",
    regulation:
      "Red sandalwood is listed in CITES Appendix II and its trade in India is controlled. Every piece we sell comes from documented lots, and we show the paperwork.",
    journal: [
      { title: "What is red sandalwood?", dek: "A guide to Pterocarpus santalinus, and why it is not the sandalwood of perfume." },
      { title: "Reading a billet", dek: "How the turner decides what a piece of heartwood will become." },
      { title: "The colour that dyes", dek: "Santalin, the red in the wood, and four centuries of using it." },
    ],
    closing: "Made with respect for the material. Designed for the life around it.",
    palette: { accent: "#9b3520", accentDeep: "#5e1d10", accentSoft: "#f1dcd4", tint: "#f8f2ef", ink: "#24130e", muted: "#7a5a50" },
  },
  white: {
    wood: "white",
    name: "White sandalwood",
    short: "White",
    latin: "Santalum album",
    sanskrit: "श्वेतचन्दन",
    kannada: "ಶ್ರೀಗಂಧ",
    localName: "Chandan, Srigandha",
    eyebrow: "White sandalwood · Mysuru",
    hero: {
      title: "The fragrance lives in the heartwood.",
      sub: "Oil, attar, chandan and Mysuru carving from Santalum album, the sandalwood of temples and perfume. Every bottle and box carries its lot.",
      cta: "Shop white sandalwood",
      photo: PHOTOS.whiteLog,
      photoAlt: PHOTOS.whitePowder,
    },
    intro: [
      "White sandalwood is the sandalwood of temples, weddings and perfume. Its scent sits in the oil of the heartwood, which only forms after many years of growth, so a young tree has almost none.",
      "Karnataka has carved it and distilled it for centuries; Mysuru is still the centre of that craft. We work with heartwood only, and say plainly what is in every bottle and jar.",
    ],
    oneLine: "Pale gold, fragrant, and the oil sits in the heartwood.",
    facts: [
      { label: "Species", value: "Santalum album" },
      { label: "Family", value: "Santalaceae" },
      { label: "Grows in", value: "Dry forests of Karnataka, Tamil Nadu and Kerala" },
      { label: "Colour", value: "Pale gold heartwood, white sapwood" },
      { label: "Scent", value: "Warm, soft, long-lasting" },
      { label: "Oil", value: "In the heartwood, after 15 years or more" },
      { label: "Used for", value: "Oil, attar, chandan, incense, carving" },
    ],
    origin: {
      region: "Mysuru, Karnataka",
      text: "Karnataka is called the land of sandalwood. In Mysuru the oil was distilled, the incense rolled and the fans and figures carved for royal households, and the workshops are still there.",
      photo: PHOTOS.gopuram,
    },
    making: [
      { title: "Select", text: "Only heartwood is used. The pale sapwood has no scent and is set aside." },
      { title: "Season", text: "Billets rest in a dry room until the oil settles and the wood stops moving." },
      { title: "Distil or carve", text: "Chips go to slow steam distillation; the best blocks go to the carver." },
      { title: "Test", text: "Each batch of oil is tested and the report kept with the lot." },
      { title: "Seal", text: "Bottled in amber glass or boxed in sandalwood, with the lot number on the label." },
    ],
    provenance: {
      title: "Know what you hold.",
      text: "Every white sandalwood bottle, jar and carving carries its lot: where the wood came from, when it was distilled or carved, and the test report for oils. If there is evidence, we show it.",
      record: [
        { label: "Lot", value: "W-26-0188" },
        { label: "Species", value: "Santalum album" },
        { label: "Lot origin", value: "Karnataka" },
        { label: "Distilled", value: "September 2026" },
        { label: "Report", value: "Batch test on file" },
      ],
    },
    edition: {
      name: "The 2011 Reserve",
      size: 50,
      text: "Fifty vials of oil distilled from one lot of heartwood harvested in 2011 and aged since. Each vial is numbered by hand.",
      productSlug: "w-reserve-oil",
    },
    gifting: {
      title: "A gift that fills the room.",
      text: "White sandalwood gifts are given at weddings, housewarmings and pujas. Ritual sets, oil in a turned box, and trays packed by hand for families and teams.",
    },
    circle: {
      title: "The Santalum Circle",
      text: "Letters when a new batch of oil is distilled, notes on ritual and fragrance, and first word on the next Reserve.",
    },
    care: "Keep closed and away from heat so the fragrance stays in the wood.",
    regulation:
      "White sandalwood in India is grown and sold under state forest rules. We buy only from documented lots and print the lot on every label.",
    journal: [
      { title: "Heartwood, not sapwood", dek: "Why cheap sandalwood powder smells of nothing, and how to tell." },
      { title: "A morning with the chandan stone", dek: "Grinding fresh paste, and why the stone matters." },
      { title: "Attar without alcohol", dek: "How Kannauj distillers still make it, and how to wear it." },
    ],
    closing: "Made with respect for the material. Designed for the life around it.",
    palette: { accent: "#a07330", accentDeep: "#6b4a1c", accentSoft: "#efe3cc", tint: "#faf6ee", ink: "#2a2216", muted: "#7d6c52" },
  },
};

export function contentFor(wood: Wood): WoodContent {
  return CONTENT[wood];
}
