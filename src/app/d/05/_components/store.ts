import { useSyncExternalStore } from "react";

/** Tiny shared on/off stores: the order slip and the grid overlay. Client-only. */
function createFlag() {
  let value = false;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(next: boolean) {
      if (next === value) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
  };
}

type Flag = ReturnType<typeof createFlag>;

export const slipFlag = createFlag();
export const gridFlag = createFlag();

const serverFalse = () => false;

export function useFlag(flag: Flag) {
  return useSyncExternalStore(flag.subscribe, flag.get, serverFalse);
}

/**
 * A wood chosen on a page that has to be left first (a piece with no counterpart in the other wood).
 * The page it lands on takes it before painting, so the old wood's content is never framed in the new wood.
 */
let pendingWood: "red" | "white" | null = null;
export function setPendingWood(w: "red" | "white") {
  pendingWood = w;
}
export function takePendingWood() {
  const w = pendingWood;
  pendingWood = null;
  return w;
}

/**
 * The code applied at checkout, kept for this tab (sessionStorage), so a reload does not drop it silently.
 * A per-reader convenience only: the order itself stores the code it was placed with.
 */
const CODE_KEY = "santalum-x5-code";
const codeListeners = new Set<() => void>();
let codeValue: string | null | undefined;
function readCode(): string | null {
  if (codeValue === undefined) {
    try {
      codeValue = sessionStorage.getItem(CODE_KEY);
    } catch {
      codeValue = null;
    }
  }
  return codeValue;
}
export function setAppliedCode(code: string | null) {
  codeValue = code;
  try {
    if (code) sessionStorage.setItem(CODE_KEY, code);
    else sessionStorage.removeItem(CODE_KEY);
  } catch {
    // storage blocked: the code lasts until the page is left
  }
  codeListeners.forEach((l) => l());
}
function subscribeCode(cb: () => void) {
  codeListeners.add(cb);
  return () => {
    codeListeners.delete(cb);
  };
}
const serverNull = () => null;
export function useAppliedCode() {
  return useSyncExternalStore(subscribeCode, readCode, serverNull);
}
