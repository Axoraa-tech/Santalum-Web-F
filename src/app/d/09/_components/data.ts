import { CONTENT } from "@/lib/shop/content";
import { productsFor, type CategoryId, type Product } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood-boot";

/**
 * Design 09, Dawn: the home page is one day, 06:10 to 19:40. The clock is the same in both woods,
 * but the day is not: a red day is the desk, the hand and colour; a white day is the tilak,
 * the lamp, oil and incense. Each chapter has a start time (minutes after midnight), a theme per
 * wood and a sky per wood. Scroll position is mapped onto this clock.
 */
export type ChapterKey = "dawn" | "morning" | "noon" | "afternoon" | "golden" | "dusk" | "evening";

export type DayChapter = { key: ChapterKey; name: string; min: number; theme: Record<Wood, string> };

export const CHAPTERS: DayChapter[] = [
  { key: "dawn", name: "Dawn", min: 370, theme: { red: "Colour at first light", white: "The tilak" } },
  { key: "morning", name: "Morning", min: 500, theme: { red: "The desk", white: "Oil after the bath" } },
  { key: "noon", name: "Noon", min: 720, theme: { red: "Colour and weight", white: "Scent in the heartwood" } },
  { key: "afternoon", name: "Afternoon", min: 870, theme: { red: "The lathe and the hand", white: "The carver and the still" } },
  { key: "golden", name: "Golden hour", min: 1025, theme: { red: "A gift with weight", white: "A gift that fills the room" } },
  { key: "dusk", name: "Dusk", min: 1100, theme: { red: "The 2011 Vault", white: "The lamp and the Reserve" } },
  { key: "evening", name: "Evening", min: 1145, theme: { red: "The record", white: "The lot" } },
];

export const DAY_START = 370; // 06:10
export const DAY_END = 1180; // 19:40

/** Interpolation stops for the sky, shared by the home page and the calm pages. */
export const T = [...CHAPTERS.map((c) => c.min), DAY_END];

/**
 * Two skies. The red day is warmer and rosier, terracotta at the edges of the day;
 * the white day is ivory and pale gold, with a softer sun. Both stay light.
 */
export const SKIES: Record<Wood, { sky: string[]; horizon: string[]; sun: string[] }> = {
  red: {
    sky: ["#F6E1D8", "#F5EDE8", "#F8F3F0", "#F6EBE5", "#F5E2D6", "#F0DCD7", "#ECE2E5", "#E9E1E6"],
    horizon: ["#EFC1AC", "#EDDBCF", "#F0E6DF", "#EFD8CB", "#EEC6AE", "#E5BDB4", "#DCCDD4", "#D8CAD3"],
    sun: ["#E8846A", "#EFAE92", "#F2C8B0", "#EBAF90", "#E2906E", "#D77B6E", "#CE8B90", "#CE8B90"],
  },
  white: {
    sky: ["#F8EDDA", "#F9F4E9", "#FAF7EF", "#F8F1E1", "#F7EAD0", "#F1E6D9", "#ECE9EA", "#EAE7EC"],
    horizon: ["#F2DAB2", "#F2E7CE", "#F3EEDF", "#F1E3C4", "#F0D6A4", "#E6D1BC", "#DEDAE0", "#DAD6E0"],
    sun: ["#EEC083", "#F4D7A0", "#F6E4B6", "#F1CF90", "#EAB561", "#DFA67C", "#D6B399", "#D6B399"],
  },
};

/** The page colour behind everything (overscroll), per wood. */
export const TINT: Record<Wood, string> = { red: "#f4e9e4", white: "#f8f2e4" };

export function hhmm(m: number) {
  const r = Math.round(m);
  const h = Math.floor(r / 60);
  const mm = r % 60;
  return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

export function chapterAt(m: number) {
  let i = 0;
  for (let k = 0; k < CHAPTERS.length; k++) if (m >= CHAPTERS[k].min - 0.5) i = k;
  return CHAPTERS[i];
}

export function chapterBy(key: ChapterKey) {
  return CHAPTERS.find((c) => c.key === key) ?? CHAPTERS[0];
}

/** Where each piece sits in its wood's day, and how it is used at that hour. */
export type Hour = { chapter: ChapterKey; min: number; use: string };

const h = (chapter: ChapterKey, min: number, use: string): Hour => ({ chapter, min, use });

export const HOURS: Record<string, Hour> = {
  /* ---------- the red day: colour, the desk, the lathe, the Vault ---------- */
  "r-heartwood-powder": h("dawn", 380, "At first light, a pinch of powder and a few drops of water, worked in the palm into a brick-red paste."),
  "r-heartwood-chips": h("dawn", 395, "Steeped overnight and strained at first light, the chips give their red to cotton and wool."),
  "r-tilak-set": h("dawn", 400, "The stick rubbed in small circles on the wet stone until the paste comes up red and cool."),
  "r-ubtan": h("dawn", 420, "Mixed with water or milk before the bath, the old household way, and rinsed off before the day starts."),
  "r-carved-ganesha": h("morning", 502, "On the desk, facing the door, before anything else is opened."),
  "r-key-fob": h("morning", 505, "The first thing in the hand when you leave the house, and the last thing put down when you come back."),
  "r-coasters": h("morning", 530, "Under the first cup at the desk, end grain up, so the rings of the tree sit under your tea."),
  "r-writing-pen": h("morning", 560, "Uncapped for the first letter of the day. The weight of the barrel does half the work."),
  "r-incense-holder": h("morning", 590, "One stick lit before the work starts. The ash falls into the groove, not onto the papers."),
  "r-turned-bowl": h("morning", 610, "On the desk for rings, keys and whatever is emptied from the pockets."),
  "r-massage-roller": h("morning", 680, "Rolled across the palm and the back of the neck between two hours of writing."),
  "r-grain-pendant": h("noon", 735, "Worn through the middle of the day, when the light is flat and the grain shows most clearly."),
  "r-signet-ring": h("noon", 760, "Turned on the finger between meetings. The red face catches the overhead light."),
  "r-turned-bangle": h("noon", 790, "Slipped on at noon. Dense enough to stay cool on the wrist through the heat."),
  "r-japa-mala-108": h("afternoon", 885, "Counted in the quiet of the afternoon, one bead to each repetition, one hundred and eight to a round."),
  "r-half-mala-54": h("afternoon", 905, "Half a round, for the short pause between two pieces of work."),
  "r-wrist-mala-27": h("afternoon", 925, "Put on in the morning and left on. By the afternoon it has taken the warmth of the wrist."),
  "r-bead-bracelet": h("afternoon", 945, "Worn every day rather than for practice. The brass spacer marks where the round begins."),
  "r-pocket-mala-18": h("afternoon", 965, "Kept in the pocket for the drive home: eighteen beads at a traffic light."),
  "r-presentation-box": h("golden", 1030, "Filled and closed in the last good light of the day, ready to be given before the lamps are lit."),
  "r-mala-box": h("golden", 1045, "Wrapped in linen with a handwritten card, for a teacher or a parent."),
  "r-desk-set": h("golden", 1055, "Boxed for a team by the end of the working day, ten sets or a hundred."),
  "r-chess-set": h("golden", 1065, "Set out once the work is done. Red against boxwood, and red moves first."),
  "r-cufflinks": h("golden", 1075, "Fastened for the evening. The two faces come from one cut of wood, so they match."),
  "r-vault-cuff": h("dusk", 1110, "Put on as the light goes. One of twenty-one, entered in the registry with its number."),
  "r-heirloom-casket": h("dusk", 1125, "Opened at dusk to put the day's jewellery away. Nine are made a year."),

  /* ---------- the white day: the tilak, oil, the carver, the lamp ---------- */
  "w-chandan-stone": h("dawn", 375, "Before sunrise, the stick on the wet stone in slow circles until the paste comes up pale gold."),
  "w-chandan-powder": h("dawn", 390, "A pinch with rose water when there is no time for the stone. The same fragrance on the forehead."),
  "w-incense-holder": h("dawn", 405, "The first stick of the morning, set beside the lamp before the house wakes."),
  "w-offering-bowl": h("dawn", 415, "Filled with flowers, rice or fresh paste for the morning puja."),
  "w-sandalwood-soap": h("morning", 500, "The bath comes first. The lather smells of the heartwood."),
  "w-key-fob": h("morning", 508, "Keys that smell faintly of sandalwood when you reach for them at the door."),
  "w-body-oil": h("morning", 515, "On damp skin after the bath, the way oil baths have always been taken at home."),
  "w-heartwood-oil": h("morning", 535, "One drop on the fingertip, touched to the wrist and the hollow of the throat."),
  "w-chandan-attar": h("morning", 555, "Touched to the wrist and inside the collar before leaving the house. It lasts the day."),
  "w-face-pack": h("morning", 580, "On a slow morning, mixed with rose water and left to dry for ten minutes."),
  "w-pulse-roller": h("morning", 610, "In the bag for the middle of the morning, when the first drop has worn off."),
  "w-card-case": h("morning", 660, "Opened at the first meeting. The cards come out smelling of sandalwood."),
  "w-scented-pendant": h("noon", 735, "At noon the heat lifts the scent out of the wood. You notice it when you move."),
  "w-bead-bracelet": h("noon", 760, "Warmed between the palms at midday, it gives its scent."),
  "w-heartwood-chips": h("noon", 790, "A handful tied in cotton and laid in the wardrobe while the house is quiet."),
  "w-japa-mala-108": h("afternoon", 885, "Counted in the afternoon quiet. The beads warm in the hand and the scent rises with them."),
  "w-scented-mala-54": h("afternoon", 905, "Half a round for a short sitting, light enough for the pocket."),
  "w-mysuru-fan": h("afternoon", 930, "Opened in the heat of the afternoon. Every turn of the wrist moves a little scent into the room."),
  "w-carved-figure": h("afternoon", 960, "Set on the shelf where the afternoon light reaches. Carved over four weeks by one hand."),
  "w-morning-ritual": h("golden", 1030, "Given the evening before, so the first ten minutes of someone's day are ready."),
  "w-boxed-oil": h("golden", 1045, "Given at a housewarming. When the oil is gone, the box still smells of it."),
  "w-wedding-tray": h("golden", 1060, "Carried to the families before the evening ceremony, one tray to each house."),
  "w-candle": h("dusk", 1105, "Lit when the lamps are lit. About fifty hours of evenings."),
  "w-incense-sticks": h("dusk", 1112, "One stick lit from the lamp at dusk. About forty minutes of smoke."),
  "w-dhoop-cones": h("dusk", 1125, "A cone for the evening puja. The smoke is heavier and stays in the room."),
  "w-reserve-oil": h("dusk", 1135, "Opened on an evening that deserves it. One of fifty vials from a 2011 harvest."),
};

export function hourOf(slug: string): Hour {
  return HOURS[slug] ?? { chapter: "evening", min: 1150, use: "" };
}

/** A wood's pieces in the order of its day. */
export function byHour(wood: Wood): Product[] {
  return [...productsFor(wood)].sort((a, b) => hourOf(a.slug).min - hourOf(b.slug).min);
}

/** The hour each category opens in its wood's day; the shop lists categories in this order. */
export const CATEGORY_MIN: Record<CategoryId, number> = {
  powder: 380,
  objects: 505,
  jewellery: 735,
  beads: 885,
  gifting: 1030,
  incense: 375,
  skin: 500,
  oil: 535,
  carvings: 735,
  "w-beads": 885,
  "w-gifting": 1030,
};

/** The example record on the home page and the provenance line on product pages. */
export const RECORD: Record<Wood, { piece: string; rows: { label: string; value: string }[]; id: string }> = {
  red: { piece: "Japa Mala, 108 beads", id: CONTENT.red.provenance.record[0].value, rows: CONTENT.red.provenance.record.slice(1) },
  white: { piece: "Heartwood Oil, 10 ml", id: CONTENT.white.provenance.record[0].value, rows: CONTENT.white.provenance.record.slice(1) },
};

export const PROVENANCE_LINE: Record<Wood, string> = {
  red: "Leaves with its batch record: the species, the lot and where it came from, who finished it and when.",
  white: "Carries its lot on the label: where the wood came from, when it was distilled or carved, and the test report for oils.",
};

/** The tracking stages, placed along the sun's path: the order is placed at dawn and arrives at nightfall. */
export const STAGE_MIN = [370, 500, 660, 810, 990, 1160];

/** Numbers as words for headings ("Eight pieces"). */
const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen", "Twenty", "Twenty-one", "Twenty-two", "Twenty-three", "Twenty-four", "Twenty-five", "Twenty-six"];
export function word(n: number) {
  return WORDS[n] ?? String(n);
}

export const EASE = [0.22, 1, 0.36, 1] as const;

export const WOODS: Wood[] = ["red", "white"];
export const other = (w: Wood): Wood => (w === "red" ? "white" : "red");
