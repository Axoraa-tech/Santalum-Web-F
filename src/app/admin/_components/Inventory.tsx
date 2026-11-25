"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { fmtNum, formatINR, inrCompact, timeAgo } from "../_data/format";
import { skuOf, stockKey } from "../_data/mock";
import { adjustStock, setThreshold, stockState, useNow, useOrders, useProducts, useStock, type StockState } from "../_data/store";
import { Icon } from "./icons";
import { Empty, Field, Modal, PageHead, Pager, Panel, SearchField, Seg, Thumb, toast, WoodLabel } from "./ui";

type Row = { key: string; slug: string; name: string; wood: Wood; option: string; sku: string; price: number; level: number; threshold: number; reserved: number; state: StockState; photo?: { id: string; tone?: "red" | "pale" } };
const TONE = { in: "good", low: "warn", out: "bad" } as const;
const LABEL = { in: "In stock", low: "Low", out: "Out" } as const;
const REASONS = ["Restock from the workshop", "Count correction", "Returned to stock", "Damaged or failed inspection", "Used for photography or samples"];
const PER = 30;

export function InventoryView() {
  const params = useSearchParams();
  const now = useNow();
  const products = useProducts();
  const stock = useStock();
  const orders = useOrders();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [state, setState] = useState<"all" | StockState | "attention">(params.get("stock") === "low" ? "attention" : "all");
  const [page, setPage] = useState(1);
  const [adjust, setAdjust] = useState<Row | null>(null);

  const rows = useMemo(() => {
    const reserved = new Map<string, number>();
    for (const o of orders) {
      if (o.status !== "new" && o.status !== "confirmed" && o.status !== "packed") continue;
      for (const l of o.lines) {
        const k = stockKey(l.slug, l.option ?? "standard");
        reserved.set(k, (reserved.get(k) ?? 0) + l.qty);
      }
    }
    const out: Row[] = [];
    for (const p of products) {
      if (p.status === "archived") continue;
      for (const o of p.options) {
        const key = stockKey(p.slug, o.id);
        const level = stock.levels[key] ?? o.stock;
        const threshold = stock.thresholds[key] ?? 5;
        out.push({ key, slug: p.slug, name: p.name, wood: p.wood, option: o.label, sku: skuOf(p.slug, o.id), price: o.price, level, threshold, reserved: reserved.get(key) ?? 0, state: stockState(level, threshold), photo: p.photos[0] });
      }
    }
    return out;
  }, [products, stock, orders]);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return rows
      .filter(
        (r) =>
          (wood === "all" || r.wood === wood) &&
          (state === "all" || (state === "attention" ? r.state !== "in" : r.state === state)) &&
          (!n || r.name.toLowerCase().includes(n) || r.sku.toLowerCase().includes(n) || r.slug.includes(n)),
      )
      .sort((a, b) => (state === "attention" ? a.level - b.level : 0));
  }, [rows, q, wood, state]);

  const totals = useMemo(
    () => ({
      skus: rows.length,
      units: rows.reduce((s, r) => s + r.level, 0),
      value: rows.reduce((s, r) => s + r.level * r.price, 0),
      low: rows.filter((r) => r.state === "low").length,
      out: rows.filter((r) => r.state === "out").length,
      reserved: rows.reduce((s, r) => s + r.reserved, 0),
    }),
    [rows],
  );
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const shown = list.slice((cur - 1) * PER, cur * PER);
  const byKey = new Map(rows.map((r) => [r.key, r]));

  return (
    <div className="adm-page">
      <PageHead crumbs={[{ label: "Admin", href: "/admin" }, { label: "Inventory" }]} title="Inventory" sub="Stock per option. Orders not yet shipped hold their pieces as reserved." />

      <div className="adm-kpis" style={{ marginBottom: 16 }}>
        {[
          { label: "Options tracked", value: fmtNum(totals.skus), note: "across active products" },
          { label: "Pieces on hand", value: fmtNum(totals.units), note: `${totals.reserved} reserved for open orders` },
          { label: "Stock at retail", value: inrCompact(totals.value), note: "on-hand pieces at shop prices" },
          { label: "Low stock", value: String(totals.low), note: "at or below reorder level", go: "low" as const },
          { label: "Out of stock", value: String(totals.out), note: "not available to order", go: "out" as const },
        ].map((t) => (
          <button
            key={t.label}
            type="button"
            className="adm-kpi"
            aria-pressed={t.go ? state === t.go : undefined}
            style={{ textAlign: "left", border: 0, cursor: t.go ? "pointer" : "default" }}
            onClick={() => t.go && (setState(state === t.go ? "all" : t.go), setPage(1))}
            disabled={!t.go}
          >
            <div className="adm-kpi-label">{t.label}</div>
            <div className="adm-kpi-value" style={{ color: t.go === "out" && totals.out ? "var(--a-red-deep)" : undefined }}>
              {t.value}
            </div>
            <div className="adm-kpi-foot">{t.note}</div>
          </button>
        ))}
      </div>

      <section className="adm-panel">
        <div className="adm-toolbar">
          <SearchField
            label="Search stock"
            placeholder="Product or SKU"
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
          <Seg label="Wood" value={wood} onChange={(w) => { setWood(w); setPage(1); }} items={[{ id: "all", label: "Both woods" }, { id: "red", label: "Red" }, { id: "white", label: "White" }]} />
          <Seg
            label="Stock level"
            value={state}
            onChange={(s) => {
              setState(s);
              setPage(1);
            }}
            items={[
              { id: "all", label: "All" },
              { id: "attention", label: "Needs restock" },
              { id: "low", label: "Low" },
              { id: "out", label: "Out" },
            ]}
          />
        </div>
        {shown.length ? (
          <div className="adm-tablewrap">
            <table className="adm-table" data-dense="true">
              <thead>
                <tr>
                  <th>Product and option</th>
                  <th>SKU</th>
                  <th className="num">On hand</th>
                  <th className="num">Reserved</th>
                  <th className="num">Available</th>
                  <th>Reorder at</th>
                  <th>Status</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {shown.map((r) => (
                  <tr key={r.key}>
                    <td style={{ maxWidth: 320 }}>
                      <div className="adm-cell-main">
                        {r.photo && <Thumb photoId={r.photo.id} tone={r.photo.tone} size="sm" />}
                        <div>
                          <Link href={`/admin/products/${r.slug}`} className="adm-rowlink adm-cell-title" style={{ display: "block" }}>
                            {r.name}
                          </Link>
                          <div className="adm-cell-sub" style={{ display: "flex", gap: 8 }}>
                            <WoodLabel wood={r.wood} />
                            <span>{r.option === "Standard" ? "One size" : r.option}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="tnum adm-ink2 nowrap" style={{ fontSize: 12.5 }}>
                      {r.sku}
                    </td>
                    <td className="num">
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10 }}>
                        <span className="adm-meter" data-tone={r.state === "in" ? undefined : r.state} style={{ width: 54 }} aria-hidden>
                          <span style={{ width: `${Math.min(100, (r.level / Math.max(r.threshold * 4, 1)) * 100)}%` }} />
                        </span>
                        <span style={{ fontWeight: 500, minWidth: 22 }}>{r.level}</span>
                      </div>
                    </td>
                    <td className="num adm-ink2">{r.reserved || "–"}</td>
                    <td className="num">{Math.max(0, r.level - r.reserved)}</td>
                    <td>
                      <input
                        className="adm-input num"
                        data-size="sm"
                        style={{ width: 64 }}
                        inputMode="numeric"
                        aria-label={`Reorder level for ${r.name}, ${r.option}`}
                        defaultValue={r.threshold}
                        key={r.threshold}
                        onBlur={(e) => {
                          const n = Number(e.target.value.replace(/\D/g, ""));
                          if (Number.isFinite(n) && n !== r.threshold) {
                            setThreshold(r.key, n);
                            toast(`Reorder level for ${r.sku} set to ${n}`);
                          }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                      />
                    </td>
                    <td>
                      <span className="adm-pill" data-tone={TONE[r.state]}>
                        {LABEL[r.state]}
                      </span>
                    </td>
                    <td className="r">
                      <button type="button" className="adm-btn" data-size="sm" onClick={() => setAdjust(r)}>
                        Adjust
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="inventory" title="Nothing here" action={<button type="button" className="adm-btn" onClick={() => { setQ(""); setState("all"); setWood("all"); }}>Show all stock</button>}>
            {state === "out" ? "Nothing is out of stock." : "No options match the search."}
          </Empty>
        )}
        <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} noun="options" />
      </section>

      <div style={{ marginTop: 16 }} />
      <Panel title="Recent adjustments" meta="Every change to stock, newest first" bodyClass="" id="inv-log">
        {stock.log.length ? (
          <div className="adm-tablewrap" style={{ marginTop: 12 }}>
            <table className="adm-table" data-dense="true">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Option</th>
                  <th className="num">Change</th>
                  <th>Reason</th>
                  <th>By</th>
                </tr>
              </thead>
              <tbody>
                {stock.log.slice(0, 12).map((l, i) => {
                  const r = byKey.get(l.key);
                  return (
                    <tr key={i}>
                      <td className="adm-ink2">{timeAgo(l.at, now)}</td>
                      <td>
                        {r ? `${r.name}${r.option !== "Standard" ? `, ${r.option}` : ""}` : l.key}
                        <div className="adm-cell-sub">{r?.sku}</div>
                      </td>
                      <td className="num" style={{ color: l.delta < 0 ? "var(--a-bad)" : "var(--a-good)", fontWeight: 500 }}>
                        {l.delta > 0 ? "+" : ""}
                        {l.delta}
                      </td>
                      <td>{l.reason}</td>
                      <td className="adm-ink2">{l.by}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="note" title="No adjustments yet">
            Changes made with Adjust, or in the product editor, are listed here.
          </Empty>
        )}
      </Panel>

      <Modal open={!!adjust} onClose={() => setAdjust(null)} title="Adjust stock" description={adjust ? `${adjust.name}${adjust.option !== "Standard" ? `, ${adjust.option}` : ""} · ${adjust.sku}` : undefined}>
        {adjust && <AdjustForm r={adjust} onClose={() => setAdjust(null)} />}
      </Modal>
    </div>
  );
}

function AdjustForm({ r, onClose }: { r: Row; onClose: () => void }) {
  const [mode, setMode] = useState<"add" | "remove" | "set">("add");
  const [qty, setQty] = useState("");
  const [reason, setReason] = useState(REASONS[0]);
  const n = Number(qty) || 0;
  const next = mode === "add" ? r.level + n : mode === "remove" ? Math.max(0, r.level - n) : n;
  const delta = next - r.level;
  return (
    <form
      style={{ display: "grid", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (!delta) return onClose();
        adjustStock(r.key, delta, reason);
        toast(`${r.sku}: ${r.level} → ${next}`);
        onClose();
      }}
    >
      <Seg
        label="Adjustment"
        value={mode}
        onChange={(m) => {
          setMode(m);
          setReason(m === "remove" ? REASONS[3] : m === "set" ? REASONS[1] : REASONS[0]);
        }}
        items={[
          { id: "add", label: "Add" },
          { id: "remove", label: "Remove" },
          { id: "set", label: "Set count" },
        ]}
      />
      <div className="adm-form-grid">
        <Field label={mode === "set" ? "Counted on the shelf" : "Pieces"}>
          {(id) => <input id={id} className="adm-input num" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value.replace(/\D/g, ""))} autoFocus placeholder="0" />}
        </Field>
        <Field label="Reason">
          {(id) => (
            <select id={id} className="adm-select" value={reason} onChange={(e) => setReason(e.target.value)}>
              {REASONS.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </Field>
      </div>
      <div className="adm-panel" style={{ padding: "12px 14px", background: "var(--a-surface-2)", boxShadow: "none", display: "flex", alignItems: "center", gap: 14 }}>
        <span className="num" style={{ fontSize: 22, fontWeight: 560 }}>
          {r.level}
        </span>
        <Icon name="arrowRight" width={16} height={16} />
        <span className="num" style={{ fontSize: 22, fontWeight: 560 }}>
          {next}
        </span>
        <span className="adm-muted" style={{ marginLeft: "auto", fontSize: 13 }}>
          {delta ? `${delta > 0 ? "+" : ""}${delta} · worth ${formatINR(Math.abs(delta) * r.price)}` : "No change"}
        </span>
      </div>
      <div className="adm-modal-foot" style={{ padding: "6px 0 12px" }}>
        <button type="button" className="adm-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="adm-btn" data-variant="primary" disabled={!delta}>
          Save adjustment
        </button>
      </div>
    </form>
  );
}
