import { useSyncExternalStore } from "react";

/**
 * A small localStorage-backed store for client state (bag, accounts, orders, wishlist).
 * Reads are lazy so server rendering never touches localStorage; the server snapshot is `fallback`.
 * Changes in another tab arrive through the storage event.
 */
export function createStore<T>(key: string, fallback: T, revive: (raw: unknown) => T = (r) => r as T) {
  let value = fallback;
  let loaded = false;
  const listeners = new Set<() => void>();

  function load() {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const raw = localStorage.getItem(key);
      if (raw) value = revive(JSON.parse(raw));
    } catch {
      value = fallback;
    }
  }

  function get(): T {
    load();
    return value;
  }

  function set(next: T | ((prev: T) => T)) {
    load();
    value = typeof next === "function" ? (next as (p: T) => T)(value) : next;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // storage full or blocked: keep the value for this tab only
    }
    listeners.forEach((l) => l());
  }

  function subscribe(cb: () => void) {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      loaded = false;
      value = fallback;
      load();
      cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  }

  function use(): T {
    return useSyncExternalStore(subscribe, get, () => fallback);
  }

  return { get, set, subscribe, use };
}

/** True after hydration. Use it to avoid rendering client-only state (session, bag count) on the server pass. */
export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
const noopSubscribe = () => () => {};
