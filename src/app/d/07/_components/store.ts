import type Lenis from "lenis";
import { useSyncExternalStore } from "react";
import { CATEGORIES, FAMILIES, type CategoryKey } from "@/lib/catalog";
import type { Wood } from "@/lib/wood";

/* ---------- the bag sheet: open / closed ---------- */
const sheetListeners = new Set<() => void>();
let sheetOpen = false;
const emitSheet = () => sheetListeners.forEach((l) => l());

export const sheet = {
  open() {
    sheetOpen = true;
    emitSheet();
  },
  close() {
    sheetOpen = false;
    emitSheet();
  },
  toggle() {
    sheetOpen = !sheetOpen;
    emitSheet();
  },
};

export function useSheetOpen() {
  return useSyncExternalStore(
    (cb) => {
      sheetListeners.add(cb);
      return () => {
        sheetListeners.delete(cb);
      };
    },
    () => sheetOpen,
    () => false,
  );
}

/* ---------- smooth scrolling ---------- */
let lenis: Lenis | null = null;
export function setLenis(l: Lenis | null) {
  lenis = l;
}
export function getLenis() {
  return lenis;
}

const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function scrollToY(y: number) {
  if (lenis) lenis.scrollTo(y, { duration: reduced() ? 0 : 1.3, immediate: reduced() });
  else window.scrollTo({ top: y, behavior: reduced() ? "auto" : "smooth" });
}

/** Cards are sticky, so we scroll to the plain marker that sits before each one. */
export function scrollToCard(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  scrollToY(el.getBoundingClientRect().top + window.scrollY);
  return true;
}

/* ---------- small shared data ---------- */
export const EASE = [0.22, 1, 0.36, 1] as const;

export const inWood = (wood: Wood) => FAMILIES.filter((f) => f.variants[wood]);

export const catLabel = (key: CategoryKey) => CATEGORIES.find((c) => c.key === key)?.label ?? key;

export const CARE: Record<CategoryKey, string[]> = {
  objects: [
    "Keep dry and out of direct sun.",
    "Wipe with a soft, dry cloth. No water, no cleaners.",
    "A drop of natural oil once a season brings the colour back.",
  ],
  beads: [
    "Take the beads off before bathing or swimming.",
    "Perfume and lotion darken the wood; let them dry before you put the beads on.",
    "Keep them in their pouch, away from heat.",
  ],
  powder: [
    "Keep the jar or vial closed, upright and away from light.",
    "Use a dry spoon; moisture spoils powder.",
    "Patch-test before use on skin.",
  ],
  gifting: [
    "Keep the box away from radiators and direct sun.",
    "Dust with a soft, dry cloth.",
    "A drop of oil on the wood once a season; none on the brass.",
  ],
  jewellery: [
    "Take it off before washing your hands or bathing.",
    "Polish silver with a dry cloth only.",
    "Store each piece in its own box so the wood is not scratched.",
  ],
};

export const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

export const HOME = "/d/07";
