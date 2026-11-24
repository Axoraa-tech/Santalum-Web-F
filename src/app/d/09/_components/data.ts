import { FAMILIES } from "@/lib/catalog";
import type { Wood } from "@/lib/wood-boot";

/**
 * Design 09, Dawn: the home page is one day. Each chapter has a start time (minutes after midnight),
 * a sky colour, a horizon colour and a sun colour. Scroll position is mapped onto this clock.
 */
export type ChapterKey = "dawn" | "morning" | "noon" | "afternoon" | "golden" | "dusk" | "evening";

export type DayChapter = {
  key: ChapterKey;
  name: string;
  theme: string;
  min: number;
  sky: string;
  horizon: string;
  sun: string;
};

export const CHAPTERS: DayChapter[] = [
  { key: "dawn", name: "Dawn", theme: "First light and the tilak", min: 370, sky: "#F6E7DA", horizon: "#F2CDB6", sun: "#F2A98B" },
  { key: "morning", name: "Morning", theme: "The desk", min: 500, sky: "#F3F1EA", horizon: "#ECE5D5", sun: "#F4C79A" },
  { key: "noon", name: "Noon", theme: "The material", min: 720, sky: "#F7F7F3", horizon: "#EFEEE6", sun: "#F6DFAE" },
  { key: "afternoon", name: "Afternoon", theme: "The hand", min: 870, sky: "#F6F0E4", horizon: "#F0E3CB", sun: "#F3CF96" },
  { key: "golden", name: "Golden hour", theme: "Gifting", min: 1025, sky: "#F5E8D2", horizon: "#EFD5AC", sun: "#ECAE63" },
  { key: "dusk", name: "Dusk", theme: "The lamp", min: 1100, sky: "#EFE1DC", horizon: "#E6C9C3", sun: "#E2948A" },
  { key: "evening", name: "Evening", theme: "The record", min: 1145, sky: "#E9E6EC", horizon: "#DCD7E2", sun: "#DCA2A5" },
];

export const DAY_START = 370; // 06:10
export const DAY_END = 1180; // 19:40

/** Interpolation stops for the sky, shared by the home page and the calm pages. */
export const T = [...CHAPTERS.map((c) => c.min), DAY_END];
export const SKY = [...CHAPTERS.map((c) => c.sky), "#E9E6EC"];
export const HORIZON = [...CHAPTERS.map((c) => c.horizon), "#D9D4E0"];
export const SUN = [...CHAPTERS.map((c) => c.sun), "#DCA2A5"];

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

/** Where each piece sits in the day, and how it is used at that hour. */
export type Hour = { chapter: ChapterKey; min: number; use: string | Record<Wood, string>; care: string };

export const HOURS: Record<string, Hour> = {
  "heartwood-powder": {
    chapter: "dawn",
    min: 380,
    use: {
      red: "At first light, a pinch of powder and a few drops of water are worked together in the palm with the ring finger, into a brick-red paste for the tilak.",
      white: "At first light, a pinch of powder with a little water or rose water becomes a pale, fragrant paste for the forehead.",
    },
    care: "Keep the jar closed, dry and out of sunlight, and use a dry spoon. Patch-test before use on skin.",
  },
  "heartwood-oil": {
    chapter: "dawn",
    min: 405,
    use: "A drop on the fingertip at first light, touched to the wrist or stirred into the paste for the tilak.",
    care: "Store upright and sealed, away from heat and light. Patch-test before use on skin.",
  },
  "key-fob": {
    chapter: "morning",
    min: 510,
    use: "The first thing in the hand when you leave the house, and the last thing put down when you come back.",
    care: "Let it be handled; that is what darkens and smooths it. Keep it dry, and rub in a drop of natural oil now and then.",
  },
  "coaster-pair": {
    chapter: "morning",
    min: 540,
    use: "Under the morning cup, end grain up, so the rings of the tree sit under your tea.",
    care: "Wipe dry after use. Re-oil once a season.",
  },
  "incense-holder": {
    chapter: "morning",
    min: 580,
    use: "One stick lit at the desk before the work starts. The ash falls into the groove, not onto the table.",
    care: "Tip the ash out after each use and wipe the groove with a dry cloth.",
  },
  "grain-pendant": {
    chapter: "noon",
    min: 740,
    use: "Worn through the middle of the day, when the light is flat and the grain shows most clearly.",
    care: "Take it off before washing or swimming. Wipe after wear and keep it in its box.",
  },
  "japa-mala": {
    chapter: "afternoon",
    min: 900,
    use: "Counted in the quiet of the afternoon, one bead to each repetition, one hundred and eight to a round.",
    care: "Keep it away from water and perfume, and store it in its pouch. Handling polishes the beads.",
  },
  "bead-bracelet": {
    chapter: "afternoon",
    min: 940,
    use: "Put on in the morning and left on. By the afternoon it has taken the warmth of the wrist.",
    care: "Take it off to bathe or swim, and keep perfume away from the beads.",
  },
  "presentation-box": {
    chapter: "golden",
    min: 1035,
    use: "Filled and closed in the last good light of the day, ready to be given before the lamps are lit.",
    care: "Keep it dry and out of direct sun. Wipe with a soft, dry cloth.",
  },
  cufflinks: {
    chapter: "golden",
    min: 1070,
    use: "Fastened for the evening. The two faces come from one piece of wood, so they match.",
    care: "Wipe the wood and the silver after wear and keep them in their box.",
  },
  "vault-cuff": {
    chapter: "dusk",
    min: 1120,
    use: "Put on at dusk, when the lamp is lit. One of twenty-one, entered in the registry with its number.",
    care: "Take it off before washing. Wipe after wear and keep it in its box with its certificate.",
  },
};

export function hourOf(slug: string): Hour {
  return HOURS[slug] ?? { chapter: "evening", min: 1150, use: "", care: "" };
}

export function ritualLine(slug: string, wood: Wood) {
  const u = hourOf(slug).use;
  return typeof u === "string" ? u : u[wood];
}

/** Every family in the order of the day. */
export const BY_HOUR = [...FAMILIES].sort((a, b) => hourOf(a.slug).min - hourOf(b.slug).min);

export const RECORD: Record<Wood, { label: string; value: string }[]> = {
  red: [
    { label: "Piece", value: "Japa Mala, 108 beads" },
    { label: "Wood", value: "Red sandalwood, Pterocarpus santalinus" },
    { label: "Origin", value: "Eastern Ghats, Andhra Pradesh" },
    { label: "Batch", value: "R-26-0412" },
    { label: "Artisan", value: "K. R." },
    { label: "Finished", value: "14 November 2026" },
  ],
  white: [
    { label: "Piece", value: "Japa Mala, 108 beads" },
    { label: "Wood", value: "White sandalwood, Santalum album" },
    { label: "Origin", value: "Karnataka, southern India" },
    { label: "Batch", value: "W-26-0187" },
    { label: "Artisan", value: "S. M." },
    { label: "Finished", value: "21 November 2026" },
  ],
};

export const STEPS = [
  { name: "Select", text: "The artisan reads the grain and chooses the piece. The wood decides what it will become." },
  { name: "Shape", text: "Cut, turned or carved by hand, following the grain rather than working against it." },
  { name: "Finish", text: "Sanded in stages, then rubbed with natural oil and wax." },
  { name: "Inspect", text: "Checked for size, finish and grain, and entered against its batch." },
  { name: "Present", text: "Wrapped in cotton or linen and boxed with its record." },
];

/** Catalogue detail strings use middle dots; this design reads them as plain lists. */
export function plain(s: string) {
  return s.replaceAll(" · ", ", ");
}

export const EASE = [0.22, 1, 0.36, 1] as const;
