"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDateTime } from "../../_data/format";
import { skuOf, stockKey } from "../../_data/mock";
import { adjustStock, setThreshold, stockState, useProducts, useStock } from "../../_data/store";
import { BASE, Box, Filter, Head, Led, Seg, say, useListKeys, Woods } from "./kit";

const REASONS = ["Count correction", "Received from workshop", "Damaged", "Sold at studio", "Gifted / sample"];

export function Inventory() {
  const products = useProducts();
  const stock = useStock();
  const [q, setQ] = useState("");
  const [wood, setWood] = useState<"all" | "red" | "white">("all");
  const [state, setState] = useState<"all" | "low" | "out">("all");
  const [reason, setReason] = useState(REASONS[0]);
  const [cursor, setCursor] = useState(0);

  const all = useMemo(
    () =>
      products.flatMap((p) =>
        p.options.map((o) => {
          const k = stockKey(p.slug, o.id);
          const level = stock.levels[k] ?? o.stock;
          const th = stock.thresholds[k] ?? 5;
          return { k, p, o, level, th, st: stockState(level, th), sku: skuOf(p.slug, o.id) };
        }),
      ),
    [products, stock],
  );
  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return all.filter((r) => (wood === "all" || r.p.wood === wood) && (state === "all" || (state === "low" ? r.st !== "in" : r.st === "out")) && (!n || `${r.sku} ${r.p.name} ${r.o.label}`.toLowerCase().includes(n)));
  }, [all, q, wood, state]);
  const cur = Math.min(cursor, Math.max(0, list.length - 1));

  const adj = (i: number, delta: number) => {
    const r = list[i];
    if (!r) return;
    adjustStock(r.k, delta, reason);
    say(`${r.sku} ${delta > 0 ? "+" : ""}${delta} → ${Math.max(0, r.level + delta)}`);
  };
  const ref = useListKeys(list.length, {
    cursor: cur,
    setCursor,
    extra: (key, i) => {
      if (key === "+" || key === "=") adj(i, 1);
      else if (key === "-") adj(i, -1);
      else {
        const w = ({ "1": "all", "2": "red", "3": "white" } as const)[key as "1" | "2" | "3"];
        if (!w) return false;
        setWood(w);
        setCursor(0);
      }
      return true;
    },
  });

  const max = Math.max(...all.map((r) => r.level), 1);
  const nameOf = (k: string) => {
    const r = all.find((x) => x.k === k);
    return r ? r.sku : k;
  };

  return (
    <div className="a3-page">
      <Head path="~/inventory" title="stock" meta={`${all.length} skus · ${all.filter((r) => r.st === "out").length} out · ${all.filter((r) => r.st === "low").length} low`} />
      <div className="a3-toolbar">
        <Filter value={q} onChange={(v) => (setQ(v), setCursor(0))} placeholder="filter sku, product" />
        <Seg value={wood} onChange={(v) => (setWood(v), setCursor(0))} label="Wood" items={[{ id: "all", label: "1 both" }, { id: "red", label: "2 red" }, { id: "white", label: "3 white" }]} />
        <Seg value={state} onChange={(v) => (setState(v), setCursor(0))} label="State" items={[{ id: "all", label: "all" }, { id: "low", label: "low+out" }, { id: "out", label: "out" }]} />
        <label className="a3-inline">
          <span className="a3-dim">reason</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="a3-dash">
        <div className="a3-scroll" ref={ref}>
          <table className="a3-t">
            <thead>
              <tr>
                <th>st</th>
                <th>sku</th>
                <th>product</th>
                <th className="a3-hide-sm">wood</th>
                <th className="r">on hand</th>
                <th className="r a3-hide-sm">alert at</th>
                <th className="r">adjust</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r, i) => (
                <tr key={r.k} data-a3-row={i} data-cur={i === cur || undefined} onClick={() => setCursor(i)}>
                  <td>
                    <Led tone={r.st === "out" ? "red" : r.st === "low" ? "amber" : "green"} pulse={r.st === "out"} label={r.st} />
                  </td>
                  <td className="a3-mono a3-dim">{r.sku}</td>
                  <td>
                    <Link href={`${BASE}/products/${r.p.slug}`}>{r.p.name}</Link>
                    {r.o.id !== "standard" && <span className="a3-dim"> · {r.o.label}</span>}
                  </td>
                  <td className="a3-hide-sm">
                    <Woods ws={[r.p.wood]} />
                  </td>
                  <td className="r a3-mono">
                    <span className="a3-meter" aria-hidden>
                      <i style={{ width: `${(r.level / max) * 100}%` }} data-st={r.st} />
                    </span>
                    {r.level}
                  </td>
                  <td className="r a3-hide-sm">
                    <input
                      aria-label={`Alert threshold for ${r.sku}`}
                      className="a3-mono a3-num"
                      inputMode="numeric"
                      value={r.th}
                      onChange={(e) => setThreshold(r.k, Number(e.target.value.replace(/\D/g, "")) || 0)}
                    />
                  </td>
                  <td className="r a3-nowrap">
                    <button type="button" className="a3-step" aria-label={`Remove one ${r.sku}`} onClick={() => adj(i, -1)}>
                      −
                    </button>
                    <button type="button" className="a3-step" aria-label={`Add one ${r.sku}`} onClick={() => adj(i, 1)}>
                      +
                    </button>
                    <button type="button" className="a3-step" aria-label={`Add ten ${r.sku}`} onClick={() => adj(i, 10)}>
                      +10
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Box title="adjustment log" meta={`${stock.log.length} entries`} flush>
          <ol className="a3-log">
            {stock.log.length === 0 && <li className="a3-dim">no adjustments yet. use + and − on a row.</li>}
            {stock.log.slice(0, 60).map((l, i) => (
              <li key={i}>
                <time className="a3-dim">{fmtDateTime(l.at)}</time>
                <span className="a3-log-tag" data-t={l.delta > 0 ? "delivered" : "cancelled"}>
                  {l.delta > 0 ? "+" : ""}
                  {l.delta}
                </span>
                <span className="a3-log-ref">{nameOf(l.key)}</span>
                <span className="a3-log-text">
                  {l.reason} <span className="a3-dim">({l.by})</span>
                </span>
              </li>
            ))}
          </ol>
        </Box>
      </div>
    </div>
  );
}
