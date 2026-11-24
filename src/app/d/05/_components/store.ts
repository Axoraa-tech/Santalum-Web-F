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
