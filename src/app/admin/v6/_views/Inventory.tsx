"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Fragment, useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { downloadText } from "../../_components/ui";
import { fmtDateTime } from "../../_data/format";
import { skuOf, stockKey } from "../../_data/mock";
import { adjustStock, setThreshold, stockState, useProducts, useStock, type StockState } from "../../_data/store";
import { BASE, Block, Empty, Fig, Head, say, Search, Tabs, WoodMark } from "../_ui/kit";

const REASONS = ["Received from the workshop", "Stock count correction", "Damaged in the studio", "Set aside for the pop-up", "Customer return restocked"];

export function Inventory() {
  const products = useProducts();
  const stock = useStock();
  const params = useSearchParams();
  const [show, setShow] = useState<"all" | StockState>(params.get("show") === "low" ? "low" : "all");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<string | null>(null);

  const rows = useMemo(
    () =>
      products
        .filter((p) => p.status !== "archived")
        .flatMap((p) =>
          p.options.map((o) => {
            const key = stockKey(p.slug, o.id);
            const threshold = stock.thresholds[key] ?? 5;
            return { key, slug: p.slug, name: p.name, wood: p.wood, option: o.label, sku: skuOf(p.slug, o.id), level: o.stock, threshold, state: stockState(o.stock, threshold) };
          }),
        ),
    [products, stock],
  );
  const list = rows.filter(
    (r) => (show === "all" || r.state === show || (show === "low" && r.state === "out")) && (wood === "all" || r.wood === wood) && (!q.trim() || `${r.name} ${r.sku}`.toLowerCase().includes(q.trim().toLowerCase())),
  );
  const out = rows.filter((r) => r.state === "out").length;
  const low = rows.filter((r) => r.state === "low").length;
  const units = rows.reduce((s, r) => s + r.level, 0);
  const nameOf = (key: string) => rows.find((r) => r.key === key);

  return (
    <>
      <Head
        no="04"
        title="Inventory"
        lede="Every saleable piece by SKU. Adjust a count with a reason; each change is written to the log below."
        actions={
          <button type="button" className="a6-btn" onClick={() => downloadText("santalum-stock.csv", ["SKU,Product,Option,Wood,Level,Reorder at", ...rows.map((r) => `${r.sku},"${r.name}","${r.option}",${r.wood},${r.level},${r.threshold}`)].join("\n"))}>
            Export CSV
          </button>
        }
      />
      <div className="a6-grid a6-kpis">
        <Fig size="lg" label="Units on hand" value={units} />
        <Fig size="lg" label="SKUs" value={rows.length} />
        <Fig size="lg" accent label="Out of stock" value={out} />
        <Fig size="lg" label="At or below reorder level" value={low} />
      </div>
      <div className="a6-filters">
        <div className="a6-filters-row">
          <Tabs label="Show" value={show} onChange={setShow} items={[{ id: "all", label: "All" }, { id: "low", label: "Low and out", count: low + out }, { id: "out", label: "Out", count: out }]} />
          <Tabs label="Wood" value={wood} onChange={setWood} items={[{ id: "all", label: "Both woods" }, { id: "red", label: "Red" }, { id: "white", label: "White" }]} />
          <Search label="Search product or SKU" value={q} onChange={setQ} />
        </div>
      </div>

      {list.length ? (
        <table className="a6-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product</th>
              <th className="a6-hide-sm">Wood</th>
              <th className="a6-r">On hand</th>
              <th className="a6-r a6-hide-sm">Reorder at</th>
              <th className="a6-r">
                <span className="a6-sr">Adjust</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {list.map((r) => (
              <Fragment key={r.key}>
                <tr data-open={open === r.key || undefined}>
                  <td className="a6-num a6-muted">{r.sku}</td>
                  <td>
                    <Link href={`${BASE}/products/${r.slug}`} className="a6-rowlink">
                      {r.name}
                    </Link>
                    {r.option !== "Standard" && <div className="a6-muted">{r.option}</div>}
                  </td>
                  <td className="a6-hide-sm">
                    <WoodMark wood={r.wood} />
                  </td>
                  <td className="a6-r">
                    <span className="a6-figure a6-figure-sm" data-bad={r.state === "out" || undefined} data-warn={r.state === "low" || undefined}>
                      {r.level}
                    </span>
                  </td>
                  <td className="a6-r a6-hide-sm">
                    <input
                      className="a6-input a6-num a6-r a6-input-xs"
                      inputMode="numeric"
                      aria-label={`Reorder level for ${r.sku}`}
                      defaultValue={r.threshold}
                      onBlur={(e) => {
                        const n = Number(e.target.value.replace(/\D/g, ""));
                        if (n !== r.threshold) {
                          setThreshold(r.key, n);
                          say(`${r.sku} reorders at ${n}`);
                        }
                      }}
                    />
                  </td>
                  <td className="a6-r">
                    <button type="button" className="a6-link" aria-expanded={open === r.key} onClick={() => setOpen(open === r.key ? null : r.key)}>
                      {open === r.key ? "Close" : "Adjust"}
                    </button>
                  </td>
                </tr>
                {open === r.key && (
                  <tr className="a6-subrow">
                    <td colSpan={6}>
                      <AdjustForm sku={r.sku} k={r.key} level={r.level} done={() => setOpen(null)} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>Nothing matches. Every SKU is above its reorder level.</Empty>
      )}

      <Block label="Adjustment log" no="4.1">
        {stock.log.length ? (
          <table className="a6-table">
            <tbody>
              {stock.log.slice(0, 25).map((l, i) => (
                <tr key={i}>
                  <td className="a6-num a6-muted">{fmtDateTime(l.at)}</td>
                  <td>
                    {nameOf(l.key)?.name ?? l.key}
                    <div className="a6-muted">{l.reason}</div>
                  </td>
                  <td className="a6-hide-sm a6-muted">{l.by}</td>
                  <td className="a6-r a6-num" data-bad={l.delta < 0 || undefined}>
                    {l.delta > 0 ? "+" : "−"}
                    {Math.abs(l.delta)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="a6-muted">No adjustments yet in this browser.</p>
        )}
      </Block>
    </>
  );
}

function AdjustForm({ sku, k, level, done }: { sku: string; k: string; level: number; done: () => void }) {
  const [delta, setDelta] = useState("");
  const [sign, setSign] = useState<1 | -1>(1);
  const [reason, setReason] = useState(REASONS[0]);
  const n = Number(delta) * sign;
  return (
    <form
      className="a6-adjust"
      onSubmit={(e) => {
        e.preventDefault();
        if (!Number(delta)) return;
        adjustStock(k, n, reason);
        say(`${sku}: ${n > 0 ? "+" : ""}${n}, now ${Math.max(0, level + n)}`);
        done();
      }}
    >
      <div className="a6-tabs" role="group" aria-label="Direction">
        <button type="button" aria-pressed={sign === 1} onClick={() => setSign(1)}>
          Add
        </button>
        <button type="button" aria-pressed={sign === -1} onClick={() => setSign(-1)}>
          Remove
        </button>
      </div>
      <input className="a6-input a6-num a6-input-xs" inputMode="numeric" aria-label="Units" placeholder="0" value={delta} onChange={(e) => setDelta(e.target.value.replace(/\D/g, ""))} autoFocus />
      <select className="a6-input" aria-label="Reason" value={reason} onChange={(e) => setReason(e.target.value)}>
        {REASONS.map((r) => (
          <option key={r}>{r}</option>
        ))}
      </select>
      <span className="a6-muted a6-num">
        {level} → {Math.max(0, level + n)}
      </span>
      <button type="submit" className="a6-btn" data-primary disabled={!Number(delta)}>
        Apply
      </button>
    </form>
  );
}
