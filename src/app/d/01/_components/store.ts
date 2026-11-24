import { useSyncExternalStore } from "react";
import type { CategoryKey } from "@/lib/catalog";

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
/** Category filter of the parts list; the story's "Shop this" buttons set it. */
export const filterStore = createStore<CategoryKey | "all">("all");

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
