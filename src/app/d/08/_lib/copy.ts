import { PHOTOS, type PhotoRef } from "@/lib/photos";
import type { CategoryId } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";

/**
 * The Atlas's own words, written twice: red is weight, colour, the Eastern Ghats, the lathe and the record;
 * white is fragrance, oil, temples, Mysuru carving and the still. Shared facts come from CONTENT in lib/shop.
 */
export type AtlasCopy = {
  place: string; // "Eastern Ghats"
  placeSub: string; // "Andhra Pradesh"
  titleLines: [string, string];
  plateRight: string;
  hint: string;
  regionLead: string;
  originTitle: string;
  originSub: string;
  regTitle: string;
  use: { title: string; text: string; a: { photo: PhotoRef; caption: string }; b: { photo: PhotoRef; caption: string } };
  other: { lead: string; line: string; go: string; photo: PhotoRef };
  collection: { title: string; text: string };
  shop: { title: string; text: string };
  makingQuote: { title: string; text: string };
  makingSub: string;
  makingPhoto: { photo: PhotoRef; caption: string };
  stepPhotos: PhotoRef[];
  gift: { photo: PhotoRef; slug: string; label: string; cat: CategoryId; all: string };
  legendPin: string;
  legendRange: string;
  footerPlace: string;
  tour: Record<string, { title: string; caption: string }>;
};

export const COPY: Record<Wood, AtlasCopy> = {
  red: {
    place: "Eastern Ghats",
    placeSub: "Andhra Pradesh",
    titleLines: ["Objects time", "cannot repeat."],
    plateRight: "Red sandalwood from the Eastern Ghats",
    hint: "Drag to move. Scroll or pinch to zoom. Arrow keys work too.",
    regionLead:
      "It has almost no scent. What it has is colour, a red that deepens toward black at the core, and a density that makes a small piece feel heavy in the hand.",
    originTitle: "Seshachalam hills",
    originSub: "Eastern Ghats, Andhra Pradesh",
    regTitle: "CITES Appendix II",
    use: {
      title: "The colour in the wood",
      text: "Santalin, the pigment in the heartwood, is why the wood is red and why it has long been used as a dye. On the lathe it turns cleanly and takes a polish without lacquer. Milled, it becomes the red powder of ritual.",
      a: { photo: PHOTOS.offeringTall, caption: "Raktachandan in a clay bowl, beside pale chandan" },
      b: { photo: PHOTOS.chipsRed, caption: "Chips from the lathe, kept for ritual and dye" },
    },
    other: {
      lead: "Also in the house: white sandalwood",
      line: "Pale gold, fragrant, and the oil sits in the heartwood. Its board centres on Mysuru.",
      go: "Turn the board to Mysuru",
      photo: PHOTOS.whiteLog,
    },
    collection: {
      title: "From the lathe and the bench",
      text: "Eight pieces from the red sandalwood shop: malas, small things for the desk, powder, a box and two pieces to wear.",
    },
    shop: { title: "The red sandalwood shop", text: "Every piece leaves with its batch record." },
    makingQuote: {
      title: "Every piece begins as a reading.",
      text: "The turner studies the billet before the first cut: colour, weight, the run of the grain. The wood decides what it will become. The hand follows.",
    },
    makingSub: "Five steps, from the billet to the box. Follow the line.",
    makingPhoto: { photo: PHOTOS.turned, caption: "Turned on the lathe, finished by hand" },
    stepPhotos: [PHOTOS.chipsRed, PHOTOS.bowlsSlice, PHOTOS.beadStrandsDark, PHOTOS.malaHand, PHOTOS.boxRed],
    gift: { photo: PHOTOS.boxCarved, slug: "r-presentation-box", label: "See the presentation box", cat: "gifting", all: "All red sandalwood gifts" },
    legendPin: "Where the wood grows",
    legendRange: "Its range, roughly: the dry hills of the southern Eastern Ghats",
    footerPlace: "13.85° N, 79.15° E. Seshachalam hills, Andhra Pradesh",
    tour: {
      start: { title: "The board", caption: "Red sandalwood from the hills of the Eastern Ghats, laid out on one board. Drag, zoom, or follow the tour." },
      place: { title: "Seshachalam hills", caption: "The tree grows slowly in dry, rocky hills in Andhra Pradesh. The slower it grows, the deeper the red." },
      wood: { title: "Red sandalwood", caption: "Pterocarpus santalinus. Dense and fine-grained, with almost no scent." },
      use: { title: "The colour in the wood", caption: "Santalin makes the red: a dye, a ritual powder, and a polish that needs no lacquer." },
      collection: { title: "From the lathe and the bench", caption: "Eight pieces from the shop. Open any of them to look closer." },
      shop: { title: "The shop", caption: "All 26 red sandalwood pieces, by category." },
      making: { title: "The making", caption: "Select, turn, finish, inspect, record. Follow the line from billet to box." },
      provenance: { title: "Know what you hold", caption: "Every piece leaves with a batch record like this one." },
      edition: { title: "The 2011 Vault", caption: "Twenty-one numbered cuffs from heartwood sourced in 2011." },
      gifting: { title: "A gift with weight", caption: "Boxes, desk sets and the heirloom casket, and letters from the Circle." },
    },
  },
  white: {
    place: "Mysuru",
    placeSub: "Karnataka",
    titleLines: ["The fragrance lives", "in the heartwood."],
    plateRight: "White sandalwood from Mysuru",
    hint: "Drag to move. Scroll or pinch to zoom. Arrow keys work too.",
    regionLead:
      "Its scent sits in the oil of the heartwood, which only forms after many years of growth, so a young tree has almost none. This is the sandalwood of temples, weddings and perfume.",
    originTitle: "Mysuru",
    originSub: "Karnataka",
    regTitle: "State forest rules",
    use: {
      title: "Where the scent goes",
      text: "Into oil and attar, into the paste on a forehead at the temple, into incense rolled by hand in Mysuru, and into carving that keeps its scent for years. The scent is the reason for all of it.",
      a: { photo: PHOTOS.gopuram, caption: "A temple tower through a carved doorway" },
      b: { photo: PHOTOS.incenseDrying, caption: "Incense rolled by hand, drying in rows" },
    },
    other: {
      lead: "Also in the house: red sandalwood",
      line: "Dense, deep red and almost without scent. Its board centres on the Eastern Ghats.",
      go: "Turn the board to the Eastern Ghats",
      photo: PHOTOS.redGrain,
    },
    collection: {
      title: "From the still and the bench",
      text: "Eight pieces from the white sandalwood shop: oil and attar, incense and the chandan stone, powder, a mala and a Mysuru fan.",
    },
    shop: { title: "The white sandalwood shop", text: "Every bottle, jar and box carries its lot." },
    makingQuote: {
      title: "Only the heartwood is used.",
      text: "The pale sapwood has no scent and is set aside. The heartwood rests until the oil settles, then goes to the still or to the carver.",
    },
    makingSub: "Five steps, from the heartwood to the sealed bottle. Follow the line.",
    makingPhoto: { photo: PHOTOS.carving, caption: "The best blocks go to the carver" },
    stepPhotos: [PHOTOS.shavingsPale, PHOTOS.chipsPale, PHOTOS.oilDrop, PHOTOS.oilVials, PHOTOS.oil],
    gift: { photo: PHOTOS.giftLinen, slug: "w-morning-ritual", label: "See the Morning Ritual", cat: "w-gifting", all: "All white sandalwood gifts" },
    legendPin: "Where the craft is centred",
    legendRange: "Its range, roughly: the dry forests of south Karnataka and its neighbours",
    footerPlace: "12.30° N, 76.64° E. Mysuru, Karnataka",
    tour: {
      start: { title: "The board", caption: "White sandalwood from Mysuru and the dry forests around it, laid out on one board. Drag, zoom, or follow the tour." },
      place: { title: "Mysuru, Karnataka", caption: "Karnataka is called the land of sandalwood. In Mysuru it is still distilled, rolled into incense and carved." },
      wood: { title: "White sandalwood", caption: "Santalum album. Pale gold and fragrant. The oil is in the heartwood." },
      use: { title: "Where the scent goes", caption: "Oil and attar, temple paste, incense and carving." },
      collection: { title: "From the still and the bench", caption: "Eight pieces from the shop. Open any of them to look closer." },
      shop: { title: "The shop", caption: "All 26 white sandalwood pieces, by category." },
      making: { title: "The making", caption: "Select, season, distil or carve, test, seal. Follow the line from heartwood to bottle." },
      provenance: { title: "Know what you hold", caption: "Every bottle, jar and carving carries its lot, like this one." },
      edition: { title: "The 2011 Reserve", caption: "Fifty numbered vials of oil from a 2011 harvest." },
      gifting: { title: "A gift that fills the room", caption: "Ritual sets, boxed oil and wedding trays, and letters from the Circle." },
    },
  },
};

/** Short shop-wide notes, used by the footer, the product page and checkout. */
export const NOTES = {
  delivery: "Free delivery across India, 3–5 working days. Express ₹350.",
  returns: "If a piece is not right, write to us within seven days of delivery and we will arrange the return. Numbered editions are final.",
  help: "Help with an order: write to us with the order number and the AWB. Our care desk opens with the store; until then this tracker is a preview and no parcel is moving.",
  preview: "Preview: accounts and orders are saved in this browser until our store opens.",
};
