import { useSyncExternalStore } from "react";

/**
 * Canvas or List. "auto" means the visitor has not chosen: CSS shows the canvas on wide screens
 * and the list on phones, so the server render is right on both without a flash.
 */
export type Mode = "auto" | "canvas" | "list";

const KEY = "a8-view";
const listeners = new Set<() => void>();
let mode: Mode = "auto";
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const v = sessionStorage.getItem(KEY);
    if (v === "canvas" || v === "list") mode = v;
  } catch {}
}

export function setMode(next: Mode) {
  load();
  mode = next;
  try {
    sessionStorage.setItem(KEY, next);
  } catch {}
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useMode(): Mode {
  return useSyncExternalStore(
    subscribe,
    () => {
      load();
      return mode;
    },
    () => "auto",
  );
}

/** matchMedia as a hook; false on the server. */
export function useMedia(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener("change", cb);
      return () => m.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const PHONE = "(max-width: 767px)";

/** The view actually showing. */
export function useEffectiveMode(): "canvas" | "list" {
  const m = useMode();
  const phone = useMedia(PHONE);
  if (m === "auto") return phone ? "list" : "canvas";
  return m;
}
