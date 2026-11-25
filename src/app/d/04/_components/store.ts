import { useSyncExternalStore } from "react";
import { bag } from "@/lib/shop/bag";

export * from "./rooms";

/**
 * Design 04 "Corridor": shared client state between the fixed chrome (left strip, minimap, ledger)
 * and the horizontal corridor on the home page. Client only (it reaches the bag).
 */

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
const plan = makeStore(false);

export const setActiveRoom = activeRoom.set;
export function useActiveRoom() {
  return useSyncExternalStore(activeRoom.subscribe, activeRoom.get, () => -1);
}

export const ledgerStore = ledger;
export const openLedger = () => {
  plan.set(false);
  ledger.set(true);
};
export const closeLedger = () => ledger.set(false);
export function useLedgerOpen() {
  return useSyncExternalStore(ledger.subscribe, ledger.get, () => false);
}

/** The floor plan: the phone menu with the rooms, the shop, tracking and the membership desk. */
export const planStore = plan;
export const openPlan = () => {
  ledger.set(false);
  plan.set(true);
};
export const closePlan = () => plan.set(false);
export function usePlanOpen() {
  return useSyncExternalStore(plan.subscribe, plan.get, () => false);
}

/** Add a piece to the bag and show the ledger. */
export function acquire(slug: string, opts: { option?: string; qty?: number } = {}) {
  bag.add(slug, opts);
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

/* ---------- stepping over to something on the wall (an opened drawer's card) ---------- */
type Reveal = (el: HTMLElement) => void;
let revealHandler: Reveal | null = null;
export function registerReveal(fn: Reveal | null) {
  revealHandler = fn;
}
export function revealOnWall(el: HTMLElement | null) {
  if (el && revealHandler) revealHandler(el);
}

