import { useSyncExternalStore } from "react";
import type { StoryId } from "./data";

/** Tiny shared stores for the open tile, the bag panel and the command palette. Client-only. */
function store<T>(init: T) {
  let v = init;
  const ls = new Set<() => void>();
  return {
    get: () => v,
    set(next: T) {
      v = next;
      ls.forEach((l) => l());
    },
    sub(cb: () => void) {
      ls.add(cb);
      return () => {
        ls.delete(cb);
      };
    },
  };
}

/** `from` is the layoutId of the tile the view grows out of; `img` says whether that tile has a `${from}-img` photo. */
export type View =
  | { kind: "product"; slug: string; from: string; img: boolean }
  | { kind: "story"; id: StoryId; from: string; img: boolean };

const viewS = store<View | null>(null);
const bagS = store<{ open: boolean; from: BagFrom }>({ open: false, from: "bag-top" });
const menuS = store(false);
const palS = store(false);
const addedS = store(0);

let returnTo: HTMLElement | null = null;
function remember() {
  const a = document.activeElement;
  returnTo = a instanceof HTMLElement && a !== document.body ? a : null;
}
function restore() {
  const el = returnTo;
  returnTo = null;
  if (el) window.setTimeout(() => el.focus({ preventScroll: true }), 40);
}

export const views = {
  open(v: View) {
    remember();
    viewS.set(v);
  },
  close() {
    if (!viewS.get()) return;
    viewS.set(null);
    restore();
  },
};

export type BagFrom = "bag-hero" | "bag-top";

export const bagUI = {
  open(from: BagFrom = "bag-top") {
    remember();
    bagS.set({ open: true, from });
  },
  close() {
    if (!bagS.get().open) return;
    bagS.set({ ...bagS.get(), open: false });
    restore();
  },
};

export const palette = {
  open() {
    remember();
    palS.set(true);
  },
  close(restoreFocus = true) {
    if (!palS.get()) return;
    palS.set(false);
    if (restoreFocus) restore();
    else returnTo = null;
  },
  toggle() {
    if (palS.get()) palette.close();
    else palette.open();
  },
};

/** The phone menu: a pill in the top bar that grows into a tile of links. */
export const menu = {
  open() {
    remember();
    menuS.set(true);
  },
  close(restoreFocus = true) {
    if (!menuS.get()) return;
    menuS.set(false);
    if (restoreFocus) restore();
    else returnTo = null;
  },
};

export const added = { bump: () => addedS.set(addedS.get() + 1) };

export const useView = () => useSyncExternalStore(viewS.sub, viewS.get, () => null);
export const useBagUI = () => useSyncExternalStore(bagS.sub, bagS.get, bagS.get);
export const useMenu = () => useSyncExternalStore(menuS.sub, menuS.get, () => false);
export const usePalette = () => useSyncExternalStore(palS.sub, palS.get, () => false);
export const useAdded = () => useSyncExternalStore(addedS.sub, addedS.get, () => 0);

/* ---------- media ---------- */

const PHONE = "(max-width: 639px)";
function subPhone(cb: () => void) {
  const m = window.matchMedia(PHONE);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export const useIsPhone = () => useSyncExternalStore(subPhone, () => window.matchMedia(PHONE).matches, () => false);

const noop = () => () => {};
export const useIsMac = () =>
  useSyncExternalStore(noop, () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent), () => false);
