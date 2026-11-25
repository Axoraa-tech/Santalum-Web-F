import { useSyncExternalStore } from "react";
import type { Wood } from "@/lib/wood";

/**
 * Live story state. The 3D scene reads it every frame, so writing it never re-renders React.
 * p: scroll progress through the story (0–1). px/py: pointer, -1..1.
 */
export const story = { p: 0, px: 0, py: 0 };

type Listener = () => void;

function createStore<T>(initial: T) {
  let value = initial;
  const listeners = new Set<Listener>();
  return {
    get: () => value,
    set(next: T) {
      if (Object.is(next, value)) return;
      value = next;
      listeners.forEach((l) => l());
    },
    subscribe(l: Listener) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}

type Store<T> = ReturnType<typeof createStore<T>>;

/** Current story chapter (0–5), or -1 when the story is off screen. */
export const chapterStore = createStore<number>(-1);
/** The work-order sheet (bag). */
export const sheetStore = createStore<boolean>(false);
/**
 * Set while a product page is open: the page belongs to one wood, so flipping the switch there
 * moves to the same piece in the other wood (or to the catalogue when there is none).
 */
export const productRoute = createStore<{ wood: Wood; counterpart?: string } | null>(null);

/**
 * A sheet change in progress: the wood switch (or a link) is taking the visitor from a piece in one
 * wood to a page in the other. A new sheet is laid over the drawing until the other wood's page is up,
 * so a piece is never seen in the other wood's colours.
 */
export const sheetChangeStore = createStore<{ to: Wood; href: string; piece?: string } | null>(null);

export function useStore<T>(s: Store<T>, server: T) {
  return useSyncExternalStore(s.subscribe, s.get, () => server);
}

let opener: HTMLElement | null = null;

export const sheet = {
  open() {
    if (!sheetStore.get()) opener = document.activeElement as HTMLElement | null;
    sheetStore.set(true);
  },
  close() {
    sheetStore.set(false);
    opener?.focus?.();
    opener = null;
  },
};

const mediaSubs = new Map<string, (cb: Listener) => () => void>();

function subscribeMedia(query: string) {
  let sub = mediaSubs.get(query);
  if (!sub) {
    sub = (cb: Listener) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    };
    mediaSubs.set(query, sub);
  }
  return sub;
}

/** Media query as a hook, without setting state in an effect. */
export function useMedia(query: string, server = false) {
  return useSyncExternalStore(
    subscribeMedia(query),
    () => window.matchMedia(query).matches,
    () => server,
  );
}

/** Scroll to a section of the home page, honouring reduced motion. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}
