"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { downloadText } from "../../_components/ui";
import { fmtDate, fmtTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, STATUS } from "../../_data/format";
import { useOrders } from "../../_data/store";
import type { AdminStatus } from "../../_data/types";
import { BASE, Empty, Head, Pager, Search, Status, Tabs, Woods } from "../_ui/kit";

type Filter = "all" | AdminStatus;
const FILTERS: Filter[] = ["all", "new", "confirmed", "packed", "shipped", "delivered", "return-requested", "returned", "cancelled"];
const PER = 25;

export function Orders() {
  const orders = useOrders();
  const params = useSearchParams();
  const initial = params.get("status") as Filter | null;
  const [status, setStatus] = useState<Filter>(initial && FILTERS.includes(initial) ? initial : "all");
  const [wood, setWood] = useState<"all" | Wood>("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (status === "all" || o.status === status) &&
        (wood === "all" || o.woods.includes(wood)) &&
        (!t || [o.id, o.name, o.email, o.phone, o.address.city, o.courier?.awb ?? ""].some((s) => s.toLowerCase().includes(t))),
    );
  }, [orders, status, wood, q]);
  const pages = Math.ceil(list.length / PER);
  const p = Math.min(page, Math.max(0, pages - 1));
  const rows = list.slice(p * PER, p * PER + PER);
  const value = list.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total - o.refunded, 0);

  function exportCsv() {
    const head = ["Order", "Placed", "Customer", "Email", "City", "Woods", "Status", "Payment", "Total"];
    const body = list.map((o) => [o.id, new Date(o.placedAt).toISOString(), o.name, o.email, o.address.city, o.woods.join("+"), STATUS[o.status].label, PAYMENT_STATE[o.paymentState], o.total]);
    downloadText("santalum-orders.csv", [head, ...body].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n"));
  }

  const reset = () => setPage(0);
  return (
    <>
      <Head
        no="02"
        title="Orders"
        lede={
          <>
            <span className="a6-num">{list.length}</span> orders in this view, worth <span className="a6-num">{formatINR(value)}</span> net.
          </>
        }
        actions={
          <button type="button" className="a6-btn" onClick={exportCsv}>
            Export CSV
          </button>
        }
      />
      <div className="a6-filters">
        <Tabs
          label="Status"
          value={status}
          onChange={(v) => {
            setStatus(v);
            reset();
          }}
          items={FILTERS.map((f) => ({ id: f, label: f === "all" ? "All" : STATUS[f].label, count: counts[f] ?? 0 }))}
        />
        <div className="a6-filters-row">
          <Tabs
            label="Wood"
            value={wood}
            onChange={(v) => {
              setWood(v);
              reset();
            }}
            items={[{ id: "all", label: "Both woods" }, { id: "red", label: "Red" }, { id: "white", label: "White" }]}
          />
          <Search
            label="Search order, name, city, AWB"
            value={q}
            onChange={(v) => {
              setQ(v);
              reset();
            }}
          />
        </div>
      </div>

      {rows.length ? (
        <table className="a6-table a6-orders">
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th className="a6-hide-md">Pieces</th>
              <th className="a6-hide-md">Wood</th>
              <th>Status</th>
              <th className="a6-hide-sm">Payment</th>
              <th className="a6-r">Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => (
              <tr key={o.id}>
                <td>
                  <Link className="a6-rowlink a6-num" href={`${BASE}/orders/${o.id}`}>
                    {o.id}
                  </Link>
                  <div className="a6-muted a6-num">
                    {fmtDate(o.placedAt)}
                    <span className="a6-hide-sm">, {fmtTime(o.placedAt)}</span>
                  </div>
                </td>
                <td>
                  {o.name}
                  <div className="a6-muted">{o.address.city}</div>
                </td>
                <td className="a6-hide-md a6-num">{o.lines.reduce((s, l) => s + l.qty, 0)}</td>
                <td className="a6-hide-md">
                  <Woods woods={o.woods} />
                </td>
                <td>
                  <Status status={o.status} />
                </td>
                <td className="a6-hide-sm">
                  {PAYMENT_LABEL[o.payment]}
                  <div className="a6-muted">{PAYMENT_STATE[o.paymentState]}</div>
                </td>
                <td className="a6-r a6-num a6-strong">{formatINR(o.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No orders match. Clear the search or choose another status.</Empty>
      )}
      <Pager page={p} pages={pages} total={list.length} onPage={setPage} noun="orders" />
    </>
  );
}
