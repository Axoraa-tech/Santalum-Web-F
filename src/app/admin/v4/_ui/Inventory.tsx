"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { timeAgo } from "../../_data/format";
import { stockKey } from "../../_data/mock";
import { adjustStock, setThreshold, stockState, useNow, useProducts, useStock, type ProductRow, type StockState } from "../../_data/store";
import { BASE, Chips, Empty, Head, Pinned, WoodTag, say } from "./kit";

type Filter = "all" | "low" | "out";
type Slot = { key: string; label: string; level: number; threshold: number; state: StockState };

export function Inventory() {
  const products = useProducts();
  const stock = useStock();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [q, setQ] = useState("");

  const shelves = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products
      .filter((p) => p.status !== "archived" && (wood === "all" || p.wood === wood) && (!s || p.name.toLowerCase().includes(s)))
      .map((p) => {
        const slots: Slot[] = p.options.map((o) => {
          const key = stockKey(p.slug, o.id);
          const level = stock.levels[key] ?? o.stock;
          const threshold = stock.thresholds[key] ?? 5;
          return { key, label: o.label, level, threshold, state: stockState(level, threshold) };
        });
        return { p, slots };
      })
      .filter(({ slots }) => filter === "all" || slots.some((x) => (filter === "out" ? x.state === "out" : x.state !== "in")));
  }, [products, stock, filter, wood, q]);

  const all = products.flatMap((p) => p.options.map((o) => stockState(stock.levels[stockKey(p.slug, o.id)] ?? o.stock, stock.thresholds[stockKey(p.slug, o.id)] ?? 5)));
  const names = useMemo(() => new Map(products.flatMap((p) => p.options.map((o) => [stockKey(p.slug, o.id), `${p.name}${p.options.length > 1 ? `, ${o.label}` : ""}`]))), [products]);

  return (
    <div className="a4-page a4-page-wide">
      <Head kicker="The store room" title="Stock shelves" sub={`${all.filter((s) => s === "low").length} running low, ${all.filter((s) => s === "out").length} empty. The dashed line on each jar is its reorder level.`} />
      <div className="a4-toolbar">
        <input type="search" className="a4-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a piece" aria-label="Search stock" />
        <Chips
          label="Show"
          value={filter}
          onChange={setFilter}
          items={[
            { id: "all", label: "Every shelf" },
            { id: "low", label: "Low or empty" },
            { id: "out", label: "Empty" },
          ]}
        />
        <Chips
          label="Wood"
          value={wood}
          onChange={setWood}
          items={[
            { id: "all", label: "Both" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
          ]}
        />
      </div>

      {shelves.length === 0 ? (
        <Empty>Every shelf is stocked above its reorder level.</Empty>
      ) : (
        <ul className="a4-shelves">
          {shelves.map(({ p, slots }) => (
            <li key={p.slug} className="a4-shelf">
              <Shelf p={p} slots={slots} />
            </li>
          ))}
        </ul>
      )}

      <section className="a4-paper a4-pad a4-log" aria-labelledby="a4-log">
        <h2 id="a4-log" className="a4-h2">
          Stock book
        </h2>
        {stock.log.length === 0 ? (
          <p className="a4-empty">No adjustments yet in this browser.</p>
        ) : (
          <ul>
            {stock.log.slice(0, 15).map((l, i) => (
              <li key={i}>
                <span className="a4-strong" data-neg={l.delta < 0 || undefined}>
                  {l.delta > 0 ? `+${l.delta}` : l.delta}
                </span>
                <span>{names.get(l.key) ?? l.key}</span>
                <span className="a4-muted">
                  {l.reason} · {l.by} · {timeAgo(l.at, now)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Shelf({ p, slots }: { p: ProductRow; slots: Slot[] }) {
  return (
    <>
      <div className="a4-shelf-label">
        {p.photos[0] && <Pinned photoId={p.photos[0].id} tone={p.photos[0].tone} size="sm" />}
        <div>
          <Link href={`${BASE}/products/${p.slug}`} className="a4-strong">
            {p.name}
          </Link>
          <WoodTag wood={p.wood} short />
        </div>
      </div>
      <ul className="a4-jars">
        {slots.map((s) => (
          <li key={s.key}>
            <Jar slot={s} />
          </li>
        ))}
      </ul>
    </>
  );
}

function Jar({ slot }: { slot: Slot }) {
  const [count, setCount] = useState("");
  const cap = Math.max(slot.threshold * 4, 20, slot.level);
  const fill = Math.min(100, (slot.level / cap) * 100);
  const line = (slot.threshold / cap) * 100;
  const set = () => {
    const n = Number(count);
    if (count === "" || !Number.isFinite(n) || n < 0) return;
    const delta = Math.round(n) - slot.level;
    if (delta) adjustStock(slot.key, delta, "Counted on the shelf");
    setCount("");
    say(`${slot.label}: ${Math.round(n)} on the shelf`);
  };
  return (
    <div className="a4-jar" data-s={slot.state}>
      <div className="a4-jar-glass" role="meter" aria-valuemin={0} aria-valuemax={cap} aria-valuenow={slot.level} aria-label={`${slot.label}: ${slot.level} in stock, reorder at ${slot.threshold}`}>
        <span className="a4-jar-fill" style={{ height: `${fill}%` }} />
        <span className="a4-jar-line" style={{ bottom: `${line}%` }} />
        <span className="a4-jar-n">{slot.level}</span>
      </div>
      <span className="a4-jar-label">{slot.label}</span>
      <span className="a4-inline a4-jar-step">
        <button type="button" className="a4-icon-btn" aria-label={`One less ${slot.label}`} disabled={slot.level === 0} onClick={() => adjustStock(slot.key, -1, "Taken off the shelf")}>
          −
        </button>
        <button type="button" className="a4-icon-btn" aria-label={`One more ${slot.label}`} onClick={() => adjustStock(slot.key, 1, "Added to the shelf")}>
          +
        </button>
      </span>
      <form
        className="a4-jar-form"
        onSubmit={(e) => {
          e.preventDefault();
          set();
        }}
      >
        <input aria-label={`Count for ${slot.label}`} inputMode="numeric" placeholder="Count" value={count} onChange={(e) => setCount(e.target.value.replace(/\D/g, ""))} />
      </form>
      <label className="a4-jar-th">
        Reorder at
        <input inputMode="numeric" value={slot.threshold} onChange={(e) => setThreshold(slot.key, Number(e.target.value.replace(/\D/g, "")) || 0)} />
      </label>
    </div>
  );
}
