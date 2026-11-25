"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { fmtDate, fmtTime, formatINR, fromIsoDay, isoDay, PAYMENT_LABEL, PAYMENT_STATE, STATUS, timeAgo } from "../_data/format";
import { DAY, startOfDay } from "../_data/mock";
import { NEXT_STAGE, orderActions, useNow, useOrders } from "../_data/store";
import type { AdminOrder, AdminStatus } from "../_data/types";
import { Icon } from "./icons";
import { downloadText, Empty, PageHead, Pager, SearchField, Seg, StatusPill, Thumb, toast, Woods } from "./ui";

type TabId = "all" | "new" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled" | "returns";
const TABS: { id: TabId; label: string; match: (s: AdminStatus) => boolean }[] = [
  { id: "all", label: "All", match: () => true },
  { id: "new", label: "New", match: (s) => s === "new" },
  { id: "confirmed", label: "Confirmed", match: (s) => s === "confirmed" },
  { id: "packed", label: "Packed", match: (s) => s === "packed" },
  { id: "shipped", label: "Shipped", match: (s) => s === "shipped" },
  { id: "delivered", label: "Delivered", match: (s) => s === "delivered" },
  { id: "cancelled", label: "Cancelled", match: (s) => s === "cancelled" },
  { id: "returns", label: "Returns", match: (s) => s === "return-requested" || s === "returned" },
];
type RangeId = "any" | "today" | "7" | "30" | "90" | "custom";
type WoodF = "all" | "red" | "white" | "both";
type SortKey = "date" | "total";
const PER = 20;

export function OrdersView() {
  const params = useSearchParams();
  const router = useRouter();
  const now = useNow();
  const orders = useOrders();
  const initial = (params.get("status") as TabId) || "all";
  const [tab, setTab] = useState<TabId>(TABS.some((t) => t.id === initial) ? initial : "all");
  const [q, setQ] = useState(params.get("q") ?? "");
  const [range, setRange] = useState<RangeId>("any");
  const [from, setFrom] = useState(() => isoDay(now - 29 * DAY));
  const [to, setTo] = useState(() => isoDay(now));
  const [wood, setWood] = useState<WoodF>("all");
  const [payment, setPayment] = useState("any");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const base = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const digits = needle.replace(/\D/g, "");
    const today = startOfDay(now);
    const win: [number, number] | null =
      range === "any"
        ? null
        : range === "today"
          ? [today, today + DAY]
          : range === "custom"
            ? [fromIsoDay(from), fromIsoDay(to, true)]
            : [today - (Number(range) - 1) * DAY, today + DAY];
    return orders.filter(
      (o) =>
        (!win || (o.placedAt >= win[0] && o.placedAt < win[1])) &&
        (wood === "all" || (wood === "both" ? o.woods.length === 2 : o.woods.length === 1 && o.woods[0] === wood)) &&
        (payment === "any" || o.payment === payment) &&
        (!needle ||
          o.id.toLowerCase().includes(needle) ||
          o.name.toLowerCase().includes(needle) ||
          o.email.includes(needle) ||
          o.address.city.toLowerCase().includes(needle) ||
          o.lines.some((l) => l.name.toLowerCase().includes(needle)) ||
          (digits.length >= 4 && (o.phone.includes(digits) || !!o.courier?.awb.includes(digits)))),
    );
  }, [orders, q, range, from, to, wood, payment, now]);

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, base.filter((o) => t.match(o.status)).length])) as Record<TabId, number>, [base]);
  const list = useMemo(() => {
    const m = TABS.find((t) => t.id === tab)!.match;
    return base.filter((o) => m(o.status)).sort((a, b) => (sort.key === "date" ? a.placedAt - b.placedAt : a.total - b.total) * sort.dir);
  }, [base, tab, sort]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PER, cur * PER);
  const allOnPage = rows.length > 0 && rows.every((o) => selected.has(o.id));
  const chosen = orders.filter((o) => selected.has(o.id));
  const advanceable = chosen.filter((o) => NEXT_STAGE[o.status] && o.status !== "packed");
  const filtered = q || range !== "any" || wood !== "all" || payment !== "any";

  const resetPage = () => setPage(1);
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const sortBy = (key: SortKey) => setSort((s) => ({ key, dir: s.key === key ? ((-s.dir) as 1 | -1) : -1 }));
  const ariaSort = (key: SortKey) => (sort.key === key ? (sort.dir === 1 ? "ascending" : "descending") : "none");

  function exportCsv(which: AdminOrder[]) {
    const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const head = ["Order", "Placed", "Customer", "Email", "Phone", "City", "Items", "Subtotal", "Discount", "Shipping", "Total", "Payment", "Payment status", "Status", "Courier", "AWB"];
    const body = which.map((o) =>
      [o.id, new Date(o.placedAt).toISOString(), o.name, o.email, o.phone, o.address.city, o.lines.map((l) => `${l.qty} x ${l.name}${l.optionLabel ? ` (${l.optionLabel})` : ""}`).join("; "), o.subtotal, o.discount, o.shipping, o.total, PAYMENT_LABEL[o.payment], PAYMENT_STATE[o.paymentState], STATUS[o.status].label, o.courier?.name ?? "", o.courier?.awb ?? ""]
        .map(esc)
        .join(","),
    );
    downloadText(`santalum-orders-${isoDay(now)}.csv`, [head.join(","), ...body].join("\n"));
    toast(`Exported ${which.length} ${which.length === 1 ? "order" : "orders"} as CSV`);
  }

  function bulkAdvance() {
    for (const o of advanceable) orderActions.advance(o);
    toast(`${advanceable.length} ${advanceable.length === 1 ? "order" : "orders"} moved to the next stage`);
    setSelected(new Set());
  }

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders" }]}
        title="Orders"
        sub={`${orders.length} orders in the last 90 days, ${counts.new} waiting to be confirmed`}
        actions={
          <button type="button" className="adm-btn" onClick={() => exportCsv(list)} disabled={!list.length}>
            <Icon name="download" />
            Export {list.length === orders.length ? "all" : list.length}
          </button>
        }
      />

      <section className="adm-panel">
        <div>
          <TabsRow
            value={tab}
            counts={counts}
            onChange={(t) => {
              setTab(t);
              resetPage();
              setSelected(new Set());
            }}
          />
        </div>

        <div className="adm-toolbar">
          <SearchField
            label="Search orders"
            placeholder="Order, name, email, phone, AWB, piece"
            value={q}
            onChange={(v) => {
              setQ(v);
              resetPage();
            }}
          />
          <select
            className="adm-select"
            data-size="sm"
            style={{ width: "auto" }}
            aria-label="Date range"
            value={range}
            onChange={(e) => {
              setRange(e.target.value as RangeId);
              resetPage();
            }}
          >
            <option value="any">Any date</option>
            <option value="today">Today</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="custom">Custom range…</option>
          </select>
          {range === "custom" && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input className="adm-input" data-size="sm" type="date" aria-label="From" value={from} max={to} onChange={(e) => e.target.value && setFrom(e.target.value)} style={{ width: 142 }} />
              <span className="adm-muted">to</span>
              <input className="adm-input" data-size="sm" type="date" aria-label="To" value={to} min={from} onChange={(e) => e.target.value && setTo(e.target.value)} style={{ width: 142 }} />
            </span>
          )}
          <Seg
            label="Wood"
            value={wood}
            onChange={(w) => {
              setWood(w);
              resetPage();
            }}
            items={[
              { id: "all", label: "Any wood" },
              {
                id: "red",
                label: (
                  <>
                    <i className="ring-red" style={{ width: 9, height: 9, borderRadius: 9, display: "inline-block" }} />
                    Red
                  </>
                ),
              },
              {
                id: "white",
                label: (
                  <>
                    <i className="ring-white" style={{ width: 9, height: 9, borderRadius: 9, display: "inline-block" }} />
                    White
                  </>
                ),
              },
              { id: "both", label: "Both" },
            ]}
          />
          <select
            className="adm-select"
            data-size="sm"
            style={{ width: "auto" }}
            aria-label="Payment method"
            value={payment}
            onChange={(e) => {
              setPayment(e.target.value);
              resetPage();
            }}
          >
            <option value="any">Any payment</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="netbanking">Net banking</option>
            <option value="cod">Pay on delivery</option>
          </select>
          {filtered && (
            <button
              type="button"
              className="adm-btn"
              data-variant="ghost"
              data-size="sm"
              onClick={() => {
                setQ("");
                setRange("any");
                setWood("all");
                setPayment("any");
                resetPage();
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="adm-bulk" role="region" aria-label="Bulk actions">
            <strong style={{ fontWeight: 500 }}>{selected.size} selected</strong>
            <span style={{ opacity: 0.4 }}>|</span>
            <button type="button" className="adm-btn" data-size="sm" onClick={bulkAdvance} disabled={!advanceable.length}>
              <Icon name="arrowRight" />
              Move to next stage{advanceable.length !== selected.size && advanceable.length ? ` (${advanceable.length})` : ""}
            </button>
            <button type="button" className="adm-btn" data-size="sm" onClick={() => exportCsv(chosen)}>
              <Icon name="download" />
              Export selected
            </button>
            {chosen.some((o) => o.status === "packed") && <span style={{ opacity: 0.7, fontSize: 12.5 }}>Packed orders need an AWB, so they ship one at a time.</span>}
            <button type="button" className="adm-btn" data-size="sm" style={{ marginLeft: "auto" }} onClick={() => setSelected(new Set())}>
              Clear
            </button>
          </div>
        )}

        {rows.length ? (
          <div className="adm-tablewrap">
            <table className="adm-table" data-stack="orders">
              <thead>
                <tr>
                  <th className="w-check">
                    <label className="adm-check">
                      <input
                        type="checkbox"
                        checked={allOnPage}
                        aria-label="Select all orders on this page"
                        onChange={() =>
                          setSelected((s) => {
                            const n = new Set(s);
                            rows.forEach((o) => (allOnPage ? n.delete(o.id) : n.add(o.id)));
                            return n;
                          })
                        }
                      />
                    </label>
                  </th>
                  <th>Order</th>
                  <th aria-sort={ariaSort("date")}>
                    <SortBtn label="Placed" active={sort.key === "date"} dir={sort.dir} onClick={() => sortBy("date")} />
                  </th>
                  <th>Customer</th>
                  <th>Pieces</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th className="num" aria-sort={ariaSort("total")}>
                    <SortBtn label="Total" active={sort.key === "total"} dir={sort.dir} onClick={() => sortBy("total")} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((o) => {
                  const pieces = o.lines.reduce((s, l) => s + l.qty, 0);
                  return (
                    <tr key={o.id} data-selected={selected.has(o.id)} onClick={(e) => !(e.target as HTMLElement).closest("a,input,button,label") && router.push(`/admin/orders/${o.id}`)} style={{ cursor: "pointer" }}>
                      <td className="w-check c-check">
                        <label className="adm-check">
                          <input type="checkbox" checked={selected.has(o.id)} onChange={() => toggle(o.id)} aria-label={`Select ${o.id}`} />
                        </label>
                      </td>
                      <td className="c-order nowrap">
                        <Link href={`/admin/orders/${o.id}`} className="adm-rowlink num">
                          {o.id}
                        </Link>
                        <div className="adm-cell-sub">
                          {o.source === "preview" ? (
                            <span className="adm-tag" data-tone="gold" style={{ height: 18 }}>
                              From the shop
                            </span>
                          ) : (
                            timeAgo(o.placedAt, now)
                          )}
                        </div>
                      </td>
                      <td className="c-placed nowrap">
                        <div className="num">{fmtDate(o.placedAt)}</div>
                        <div className="adm-cell-sub num">{fmtTime(o.placedAt)}</div>
                      </td>
                      <td className="c-cust" style={{ maxWidth: 220 }}>
                        <div className="adm-cell-title">{o.name}</div>
                        <div className="adm-cell-sub">
                          {o.address.city}, {o.address.state}
                        </div>
                      </td>
                      <td className="c-pieces">
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="adm-thumbs">
                            {o.lines.slice(0, 3).map((l) => (
                              <Thumb key={l.slug + l.option} photoId={l.photoId} slug={l.slug} size="sm" />
                            ))}
                          </span>
                          <span>
                            <span className="num">{pieces}</span> <span className="adm-muted">{pieces === 1 ? "piece" : "pieces"}</span>
                            <div>
                              <Woods woods={o.woods} />
                            </div>
                          </span>
                        </div>
                      </td>
                      <td className="c-pay c-end">
                        <div>{PAYMENT_LABEL[o.payment]}</div>
                        <div className="adm-cell-sub">{PAYMENT_STATE[o.paymentState]}</div>
                      </td>
                      <td className="c-status c-end">
                        <StatusPill status={o.status} />
                        {o.delivery === "express" && (
                          <div className="adm-cell-sub" style={{ marginTop: 3 }}>
                            Express
                          </div>
                        )}
                      </td>
                      <td className="num c-total c-end">
                        <div style={{ fontWeight: 500 }}>{formatINR(o.total)}</div>
                        {o.coupon && <div className="adm-cell-sub">{o.coupon}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty
            icon="orders"
            title={orders.length ? "No orders match" : "No orders yet"}
            action={
              filtered ? (
                <button
                  type="button"
                  className="adm-btn"
                  onClick={() => {
                    setQ("");
                    setRange("any");
                    setWood("all");
                    setPayment("any");
                  }}
                >
                  Clear filters
                </button>
              ) : undefined
            }
          >
            {filtered ? "Try a wider date range or clear the filters." : `Nothing in “${TABS.find((t) => t.id === tab)!.label}” right now.`}
          </Empty>
        )}
        <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} />
      </section>
    </div>
  );
}

function TabsRow({ value, counts, onChange }: { value: TabId; counts: Record<TabId, number>; onChange: (t: TabId) => void }) {
  return (
    <div className="adm-tabs" role="tablist" aria-label="Order status">
      {TABS.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} onClick={() => onChange(t.id)}>
          {t.label}
          <span className="adm-tab-count">{counts[t.id]}</span>
        </button>
      ))}
    </div>
  );
}

function SortBtn({ label, active, dir, onClick }: { label: string; active: boolean; dir: 1 | -1; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} style={{ border: 0, background: "none", padding: 0, font: "inherit", color: active ? "var(--a-ink)" : "inherit", display: "inline-flex", alignItems: "center", gap: 4 }}>
      {label}
      <Icon name={active ? (dir === 1 ? "arrowUp" : "arrowDown") : "upDown"} width={12} height={12} />
    </button>
  );
}
