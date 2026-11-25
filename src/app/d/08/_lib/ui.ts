import { useSyncExternalStore } from "react";
import { bag } from "@/lib/shop/bag";
import { getOption, getProduct } from "@/lib/shop/products";

/** A short note under the bag after something is added: "Pinned to your bag". */
export type Added = { id: number; slug: string; name: string; option?: string; photo: string; tone?: "red" | "pale" };

let current: Added | null = null;
let n = 0;
let timer = 0;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function addToBag(slug: string, opts: { option?: string; qty?: number; note?: string } = {}) {
  const p = getProduct(slug);
  if (!p) return;
  bag.add(slug, opts);
  current = { id: ++n, slug, name: p.name, option: getOption(p, opts.option)?.label, photo: p.shots[0].photo.id, tone: p.shots[0].tone };
  emit();
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    current = null;
    emit();
  }, 3200);
}

export function dismissAdded() {
  window.clearTimeout(timer);
  current = null;
  emit();
}

export function useAdded() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => current,
    () => null,
  );
}
