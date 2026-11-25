"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { fmtDateTime } from "../../_data/format";
import { skuOf, stockKey } from "../../_data/mock";
import { adjustStock, setThreshold, stockState, useProducts, useStock, type StockState } from "../../_data/store";
import { BASE, Choice, Empty, Head, note, Section, WoodMark } from "./kit";

type Row = { key: string; slug: string; sku: string; name: string; option: string; wood: Wood; level: number; th: number; state: StockState };

/** The stock book: one line per piece and option, with a journal of every adjustment. */
export function StockBook() {
  const params = useSearchParams();
  const products = useProducts();
  const stock = useStock();
  const [f, setF] = useState<"all" | "low" | "out">(params.get("f") === "low" ? "low" : "all");
  const [wood, setWood] = useState<"both" | Wood>("both");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const out: Row[] = [];
    for (const p of products) {
      if (p.status === "archived") continue;
      for (const o of p.options) {
        const key = stockKey(p.slug, o.id);
        const level = stock.levels[key] ?? o.stock;
        const th = stock.thresholds[key] ?? 5;
        out.push({ key, slug: p.slug, sku: skuOf(p.slug, o.id), name: p.name, option: o.label, wood: p.wood, level, th, state: stockState(level, th) });
      }
    }
    return out;
  }, [products, stock]);
  const t = q.trim().toLowerCase();
  const list = rows.filter(
    (r) => (f === "all" || (f === "low" ? r.state !== "in" : r.state === "out")) && (wood === "both" || r.wood === wood) && (!t || r.name.toLowerCase().includes(t) || r.sku.toLowerCase().includes(t)),
  );
  const names = useMemo(() => new Map(rows.map((r) => [r.key, `${r.name}${r.option === "Standard" ? "" : `, ${r.option}`}`])), [rows]);

  return (
    <div>
      <Head kicker="Stock book" title="Stock">
        <p className="a2-lede">
          {rows.reduce((s, r) => s + r.level, 0)} pieces on the shelves · {rows.filter((r) => r.state === "low").length} running low · {rows.filter((r) => r.state === "out").length} out
        </p>
      </Head>
      <div className="a2-tools">
        <div className="a2-tools-row">
          <Choice
            label="Show"
            value={f}
            onChange={setF}
            items={[
              { id: "all", label: "Every line" },
              { id: "low", label: "Low or out", n: rows.filter((r) => r.state !== "in").length },
              { id: "out", label: "Out", n: rows.filter((r) => r.state === "out").length },
            ]}
          />
          <Choice label="Wood" value={wood} onChange={setWood} items={[{ id: "both", label: "Both woods" }, { id: "red", label: <WoodMark wood="red" /> }, { id: "white", label: <WoodMark wood="white" /> }]} />
          <input type="search" className="a2-search" data-a2-search placeholder="Find by piece or SKU  ( / )" aria-label="Find a stock line" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      {list.length === 0 ? (
        <Empty>Nothing on this shelf.</Empty>
      ) : (
        <div className="a2-ledger a2-sbook" role="table" aria-label="Stock lines">
          <div className="a2-lrow a2-lhead" role="row">
            <span role="columnheader">SKU</span>
            <span role="columnheader">Piece</span>
            <span role="columnheader" className="a2-r">In hand</span>
            <span role="columnheader" className="a2-r">Warn at</span>
            <span role="columnheader">Adjust</span>
          </div>
          {list.map((r) => (
            <StockLine key={r.key} r={r} />
          ))}
        </div>
      )}
      <Section title="Stock journal">
        {stock.log.length === 0 ? (
          <Empty>No adjustments written yet.</Empty>
        ) : (
          <ol className="a2-time">
            {stock.log.slice(0, 30).map((e, i) => (
              <li key={i}>
                <span className="a2-time-at">{fmtDateTime(e.at)}</span>
                <span>
                  <span className={`a2-fig${e.delta < 0 ? " a2-cr" : ""}`}>{e.delta > 0 ? `+${e.delta}` : e.delta}</span> {names.get(e.key) ?? e.key} · {e.reason}
                  <small> — {e.by}</small>
                </span>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}

function StockLine({ r }: { r: Row }) {
  const [n, setN] = useState("");
  const [why, setWhy] = useState("Received from the workshop");
  const qty = Number(n);
  return (
    <div className="a2-lrow" role="row" data-stock={r.state}>
      <span className="a2-dim a2-sku" role="cell">{r.sku}</span>
      <Link href={`${BASE}/products/${r.slug}`} className="a2-part" role="cell">
        {r.name}
        <small>
          <WoodMark wood={r.wood} />
          {r.option !== "Standard" ? ` · ${r.option}` : ""}
          {r.state !== "in" ? <b className="a2-stockword" data-stock={r.state}> · {r.state === "out" ? "out" : "low"}</b> : null}
        </small>
      </Link>
      <span className="a2-r a2-fig a2-level" role="cell">{r.level}</span>
      <span className="a2-r" role="cell">
        <input
          className="a2-th a2-fig"
          inputMode="numeric"
          aria-label={`Warn when ${r.name} ${r.option} falls to`}
          defaultValue={r.th}
          onBlur={(e) => {
            const v = Number(e.target.value);
            if (Number.isFinite(v) && v !== r.th) {
              setThreshold(r.key, v);
              note("Warning level changed");
            }
          }}
        />
      </span>
      <form
        className="a2-adj"
        role="cell"
        onSubmit={(e) => {
          e.preventDefault();
          if (!qty) return;
          adjustStock(r.key, qty, why || "Adjusted");
          note(`${qty > 0 ? "+" : ""}${qty} ${r.name}`);
          setN("");
        }}
      >
        <button type="button" className="a2-btn" data-size="sm" aria-label="One out" onClick={() => adjustStock(r.key, -1, "One out, by hand")}>
          −1
        </button>
        <input inputMode="numeric" placeholder="±" aria-label="Quantity in or out" value={n} onChange={(e) => setN(e.target.value.replace(/[^\d-]/g, ""))} />
        <select aria-label="Reason" value={why} onChange={(e) => setWhy(e.target.value)}>
          <option>Received from the workshop</option>
          <option>Counted on the shelf</option>
          <option>Damaged, written off</option>
          <option>Taken for the studio</option>
        </select>
        <button type="submit" className="a2-btn" data-size="sm" disabled={!qty}>
          Enter
        </button>
      </form>
    </div>
  );
}
