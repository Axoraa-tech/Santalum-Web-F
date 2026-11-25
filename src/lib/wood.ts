import { useSyncExternalStore } from "react";
import { flushSync } from "react-dom";
import { WOOD_KEY, type Wood } from "./wood-boot";

/**
 * Which sandalwood the Maison website is showing. The value lives on <html data-wood>,
 * so CSS can swap content and ease the accent colour before React hydrates (no flash),
 * and the URL never changes. Client-only helpers.
 */
export type { Wood };

const listeners = new Set<() => void>();

function read(): Wood {
  return document.documentElement.dataset.wood === "white" ? "white" : "red";
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function apply(wood: Wood) {
  document.documentElement.dataset.wood = wood;
  try {
    localStorage.setItem(WOOD_KEY, wood);
  } catch {
    // storage blocked: the choice just won't be remembered
  }
  listeners.forEach((l) => l());
}

/** For client-side navigation into the Maison, where the inline boot script ran on another page. */
export function syncWoodFromStorage() {
  let stored: Wood = "red";
  try {
    if (localStorage.getItem(WOOD_KEY) === "white") stored = "white";
  } catch {}
  if (read() !== stored || !document.documentElement.dataset.wood) apply(stored);
}

/**
 * Set the wood without the crossfade. For a product page opened directly: the page belongs to
 * one wood, so the site follows it (call from an effect, not during render).
 */
export function setWoodQuietly(next: Wood) {
  if (read() !== next || !document.documentElement.dataset.wood) apply(next);
}

export function useWood(): Wood {
  return useSyncExternalStore(subscribe, read, () => "red");
}

/**
 * Switch woods. The page stays white: photographs and copy cross-dissolve,
 * the accent colour eases, and the live wood renders re-colour themselves.
 */
export function switchWood(next: Wood) {
  const root = document.documentElement;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (typeof document.startViewTransition !== "function" || reduce) {
    apply(next);
    return;
  }
  root.classList.add("wood-vt");
  const t = document.startViewTransition(() => {
    flushSync(() => apply(next));
  });
  t.finished.finally(() => root.classList.remove("wood-vt"));
}
