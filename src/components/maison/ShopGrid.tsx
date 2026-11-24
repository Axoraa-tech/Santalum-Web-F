"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import { CATEGORIES, FAMILIES, WOOD_NAMES, type CategoryKey } from "@/lib/catalog";
import { useWood } from "@/lib/wood";
import { ProductTile } from "./ProductTile";

/* An uneven rhythm: wide, medium, narrow; then the reverse, each dropped by a different amount. */
const RHYTHM = [
  "md:col-span-5",
  "md:col-span-4 md:mt-28",
  "md:col-span-3 md:mt-10",
  "md:col-span-3 md:mt-16",
  "md:col-span-4",
  "md:col-span-5 md:mt-32",
];

export function ShopGrid() {
  const params = useSearchParams();
  const router = useRouter();
  const wood = useWood();
  const c = params.get("c") as CategoryKey | null;
  const active = CATEGORIES.some((x) => x.key === c) ? c : null;
  const list = FAMILIES.filter((f) => f.variants[wood] && (!active || f.category === active));

  const pick = (key: CategoryKey | null) => router.replace(key ? `/maison/shop?c=${key}` : "/maison/shop", { scroll: false });
  const tabs: { key: CategoryKey | null; label: string }[] = [{ key: null, label: "All" }, ...CATEGORIES.map((x) => ({ key: x.key, label: x.label }))];

  return (
    <>
      <div className="sticky top-[5.25rem] z-20 -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
        <div className="inline-flex rounded-full border border-hair bg-paper/80 p-1 backdrop-blur-xl">
          {tabs.map((t) => {
            const on = active === t.key;
            return (
              <button
                key={t.label}
                type="button"
                onClick={() => pick(t.key)}
                aria-pressed={on}
                className={`relative shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[14px] transition-colors ${on ? "text-paper" : "text-ink-2 hover:text-ink"}`}
              >
                {on && <motion.span layoutId="shop-tab" className="absolute inset-0 rounded-full bg-ink" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} />}
                <span className="relative">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-8 text-[15px] text-ink-3">
        {list.length} {list.length === 1 ? "piece" : "pieces"} in {WOOD_NAMES[wood].common.toLowerCase()}
        {active ? `, ${CATEGORIES.find((x) => x.key === active)!.line.toLowerCase().replace(/\.$/, "")}` : ""}
      </p>

      <motion.div layout className="mt-12 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-12 md:gap-x-8 md:gap-y-24">
        <AnimatePresence mode="popLayout">
          {list.map((f, i) => (
            <motion.div
              key={`${f.slug}-${wood}`}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className={RHYTHM[i % RHYTHM.length]}
            >
              <ProductTile family={f} wood={wood} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  );
}
