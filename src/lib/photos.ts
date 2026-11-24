/**
 * Placeholder photography from Unsplash (free licence, images.unsplash.com only — no Unsplash+).
 * Replace with the Maison's own photography before launch.
 */
export type PhotoRef = { id: string; alt: string };

export const PHOTOS = {
  // red sandalwood
  redChip: { id: "photo-1691744749343-edab1346765a", alt: "A raw piece of red sandalwood on stone" },
  redGrain: { id: "photo-1779714650753-c1fbc2ed6c71", alt: "The close grain of deep red heartwood" },
  redPowder: { id: "photo-1608554208766-8198d5536b46", alt: "Red sandalwood powder" },
  // white sandalwood
  whiteLog: { id: "photo-1702001145743-094b0b7ead51", alt: "A cut sandalwood log showing heartwood and pale sapwood" },
  whitePowder: { id: "photo-1595414902678-862fe51c9f27", alt: "Pale sandalwood powder" },
  whiteRitual: { id: "photo-1660030140251-f48a668e5b0a", alt: "A pale offering and a red powder in clay bowls on dark stone" },
  whiteBeads: { id: "photo-1634867458242-5ce026e688aa", alt: "Pale wooden prayer beads" },
  woodSmoke: { id: "photo-1542214999-026997ec6cb5", alt: "Fragrant smoke rising over a piece of wood" },
  // ritual and place
  temple: { id: "photo-1767945335419-901f7d4c3b8e", alt: "Carved stone pillars along a Hoysala temple corridor" },
  gopuram: { id: "photo-1665003815164-8f5bc853ef44", alt: "A temple tower seen through a carved stone doorway" },
  diyaHands: { id: "photo-1605292356183-a77d0a9c9d1d", alt: "Two hands holding a lit clay diya" },
  malaHand: { id: "photo-1742219335029-951834824ed2", alt: "An old hand holding a string of prayer beads" },
  carving: { id: "photo-1615243639681-1208d685758a", alt: "A carver's hands working a block of wood with a chisel" },
  smoke: { id: "photo-1770217535691-76d80a83f909", alt: "Incense smoke against black" },
  // objects (placeholders for product photography)
  keyTag: { id: "photo-1654166769323-94a7e714d7c2", alt: "A wooden key tag on stone" },
  carvedTag: { id: "photo-1794253713525-3953e1a29a7b", alt: "A carved red wood pendant on a cord" },
  coasterSet: { id: "photo-1784901391087-cf971397acdc", alt: "A stack of wooden coasters in a holder" },
  woodRounds: { id: "photo-1641514668935-86c738d0df20", alt: "Turned wooden rounds and coasters" },
  braceletDark: { id: "photo-1634833132196-fcbb1594e665", alt: "Dark wooden bead bracelets on a slice of wood" },
  braceletClose: { id: "photo-1637632461020-f7eebc322b89", alt: "A wooden bead bracelet, close" },
  braceletPale: { id: "photo-1639622448464-d428c84a38c3", alt: "A pale wooden bead bracelet" },
  beadsPale: { id: "photo-1629890370025-0ee51ee24eb5", alt: "Pale wooden beads" },
  beadStrands: { id: "photo-1772455659345-4e8745e9397c", alt: "Hanging strands of wooden beads" },
  beadStrandsDark: { id: "photo-1772380406733-60b0dbb2961c", alt: "Strands of dark wooden beads" },
  oil: { id: "photo-1608571702600-5a5419d31475", alt: "An amber glass bottle of oil" },
  oilDuo: { id: "photo-1550160770-2b76e59c5dcc", alt: "Two small amber vials" },
  attar: { id: "photo-1695049999693-bf4f95cfae6e", alt: "Two small glass bottles of attar" },
  boxCarved: { id: "photo-1672664003230-106aa4f534c7", alt: "A hand-carved wooden box" },
  boxRed: { id: "photo-1631561381314-588b8a5f1070", alt: "A small red wooden box" },
  giftLinen: { id: "photo-1610377507996-dcd4f0cfc125", alt: "A gift wrapped in linen with a ribbon, in a wooden tray" },
  boxes: { id: "photo-1589736154764-90eed6817036", alt: "Wooden boxes and a turned bowl" },
  cufflinks: { id: "photo-1761110518837-689557b142bf", alt: "Cufflinks in a wooden box" },
  turned: { id: "photo-1641592542223-7e579c8a9320", alt: "Hand-turned wooden objects" },
  incenseDark: { id: "photo-1627769916425-74c2344a3439", alt: "An incense stick resting on a wooden holder" },
  incenseBox: { id: "photo-1627827886264-4483d7a0704c", alt: "A carved wooden incense box with smoke" },
} satisfies Record<string, PhotoRef>;
