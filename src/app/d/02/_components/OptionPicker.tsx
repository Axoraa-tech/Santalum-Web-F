"use client";

import { useId } from "react";
import { formatINR, type Product } from "@/lib/shop/products";
import { s } from "./cls";

/**
 * Sizes, weights and volumes as round chips. Each chip carries a small disc that grows with the option,
 * so a 10 mm bead reads larger than a 6 mm one before you read the label. Native radios underneath.
 */
export function OptionPicker({ product, value, onChange, compact = false }: { product: Product; value: string; onChange: (id: string) => void; compact?: boolean }) {
  const name = useId();
  if (!product.options) return null;
  const vals = product.options.values;
  const varies = new Set(vals.map((v) => v.price)).size > 1;
  return (
    <fieldset>
      <legend className="mb-3 text-[14px] font-semibold">{product.options.name}</legend>
      <div className="flex flex-wrap gap-2">
        {vals.map((v, i) => {
          const on = v.id === value;
          const d = 10 + (i / Math.max(1, vals.length - 1)) * 12;
          return (
            <label
              key={v.id}
              className={`relative flex cursor-pointer items-center gap-2.5 rounded-full border py-1.5 pl-1.5 transition-colors duration-300 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--m-accent)] ${
                compact ? "pr-3.5" : "pr-4"
              } ${on ? "border-[var(--o-ink)] bg-[var(--o-ink)] text-white" : "border-[var(--o-line)] bg-[var(--o-card)] hover:border-[var(--o-ink)]"}`}
            >
              <input type="radio" name={name} value={v.id} checked={on} onChange={() => onChange(v.id)} className="sr-only" />
              <span aria-hidden className={`grid size-9 place-items-center rounded-full ${on ? "bg-white/15" : "bg-[var(--o-floor)]"}`}>
                <span className={`rounded-full ${on ? "bg-[var(--m-accent)]" : "bg-[var(--o-muted)]/50"}`} style={{ width: d, height: d }} />
              </span>
              <span className="leading-tight">
                <span className={`${s.syne} block text-[14px] font-bold`}>{v.label}</span>
                {varies && <span className={`block text-[12px] tabular-nums ${on ? "text-white/70" : "text-[var(--o-muted)]"}`}>{formatINR(v.price)}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
