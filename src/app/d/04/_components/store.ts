import { useSyncExternalStore } from "react";
import { FAMILIES, type Family } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import type { Wood } from "@/lib/wood";

/**
 * Design 04 "Corridor": shared client state between the fixed chrome (left strip, minimap, ledger)
 * and the horizontal corridor on the home page.
 */

/** Wide, not-portrait, motion allowed: the museum is walked sideways. Everything else stacks as a guide. */
export const H_QUERY =
  "(min-width: 900px) and (min-height: 560px) and (min-aspect-ratio: 5/4) and (prefers-reduced-motion: no-preference)";

export type Room = { id: string; n: string; name: string };

export const ROOMS: Room[] = [
  { id: "entrance", n: "1", name: "Entrance" },
  { id: "wall-text", n: "2", name: "Wall text" },
  { id: "two-woods", n: "3", name: "The two woods" },
  { id: "collection", n: "4", name: "The collection" },
  { id: "making", n: "5", name: "Making" },
  { id: "provenance", n: "6", name: "Provenance archive" },
  { id: "vault", n: "7", name: "The 2011 Vault" },
  { id: "gifting", n: "8", name: "Gifting" },
  { id: "exit", n: "Exit", name: "Exit" },
];

/* ---------- tiny external stores ---------- */
function makeStore<T>(initial: T) {
  let value = initial;
  const ls = new Set<() => void>();
  return {
    get: () => value,
    set(v: T) {
      if (Object.is(v, value)) return;
      value = v;
      ls.forEach((l) => l());
    },
    subscribe(cb: () => void) {
      ls.add(cb);
      return () => {
        ls.delete(cb);
      };
    },
  };
}

const activeRoom = makeStore(-1);
const ledger = makeStore(false);

export const setActiveRoom = activeRoom.set;
export function useActiveRoom() {
  return useSyncExternalStore(activeRoom.subscribe, activeRoom.get, () => -1);
}

export const ledgerStore = ledger;
export const openLedger = () => ledger.set(true);
export const closeLedger = () => ledger.set(false);
export function useLedgerOpen() {
  return useSyncExternalStore(ledger.subscribe, ledger.get, () => false);
}

/** Add a piece to the ledger and show the ledger. */
export function acquire(slug: string, wood: Wood) {
  bag.add(slug, wood);
  openLedger();
}

/* ---------- walking to a room: the corridor registers how ---------- */
type GoTo = (id: string, immediate?: boolean) => void;
let goToHandler: GoTo | null = null;
export function registerGoTo(fn: GoTo | null) {
  goToHandler = fn;
}
/** Returns false when no corridor is mounted (caller should navigate to the home page instead). */
export function goToRoom(id: string) {
  if (!goToHandler) return false;
  goToHandler(id);
  return true;
}

/* ---------- catalogue helpers ---------- */
const ORDER = ["objects", "beads", "powder", "gifting", "jewellery"] as const;

export function familiesIn(wood: Wood): Family[] {
  return ORDER.flatMap((c) => FAMILIES.filter((f) => f.category === c && f.variants[wood]));
}

/** Museum-style accession number for a piece in a wood, e.g. SM.2026.104. */
export function accession(slug: string, wood: Wood) {
  const i = FAMILIES.findIndex((f) => f.slug === slug);
  return `SM.2026.${wood === "red" ? 1 : 2}${String(i + 1).padStart(2, "0")}`;
}

export const CARE: Record<Family["category"], string> = {
  objects:
    "Keep dry and out of direct sun. Wipe with a soft cloth. A drop of natural oil once a season keeps the surface alive.",
  beads:
    "Take the beads off before bathing or swimming and keep them in their pouch. The oil of the hand deepens the colour over time; that is intended.",
  powder:
    "Keep the jar closed, away from damp and direct sun. Use a dry spoon. Patch-test before use on skin.",
  gifting: "Dust with a soft dry cloth. Keep away from damp. The box changes with handling; that is intended.",
  jewellery:
    "Keep away from perfume and water. Wipe the wood with a soft dry cloth; polish silver separately, without touching the wood.",
};

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];
