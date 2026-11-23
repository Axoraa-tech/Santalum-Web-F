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
  whiteRitual: { id: "photo-1590487590297-bb9d0b2e75e0", alt: "White sandalwood pieces in a brass bowl beside a bottle of oil" },
  whiteBeads: { id: "photo-1634867458242-5ce026e688aa", alt: "Pale wooden prayer beads" },
  // ritual and place
  temple: { id: "photo-1767945335419-901f7d4c3b8e", alt: "Carved stone pillars along a Hoysala temple corridor" },
  diyaHands: { id: "photo-1605292356183-a77d0a9c9d1d", alt: "Two hands holding a lit clay diya" },
  malaHand: { id: "photo-1742219335029-951834824ed2", alt: "An old hand holding a string of prayer beads" },
  carving: { id: "photo-1615243639681-1208d685758a", alt: "A carver's hands working a block of wood with a chisel" },
  smoke: { id: "photo-1770217535691-76d80a83f909", alt: "Incense smoke against black" },
} satisfies Record<string, PhotoRef>;
