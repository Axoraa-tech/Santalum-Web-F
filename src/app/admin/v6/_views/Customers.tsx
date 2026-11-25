"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { downloadText } from "../../_components/ui";
import { fmtDate, formatINR } from "../../_data/format";
import { useCustomers } from "../../_data/store";
import { BASE, Empty, Head, Pager, Search, Tabs } from "../_ui/kit";

type Sort = "ltv" | "recent" | "orders" | "name";
const PER = 30;

export function Customers() {
  const customers = useCustomers();
  const [sort, setSort] = useState<Sort>("ltv");
  const [seg, setSeg] = useState<"all" | "repeat" | "none" | "circle">("all");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const l = customers.filter(
      (c) =>
        (seg === "all" || (seg === "repeat" && c.orders > 1) || (seg === "none" && c.orders === 0) || (seg === "circle" && c.newsletter)) &&
        (!t || `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(t)),
    );
    const by: Record<Sort, (a: (typeof l)[0], b: (typeof l)[0]) => number> = {
      ltv: (a, b) => b.ltv - a.ltv,
      recent: (a, b) => (b.lastOrderAt ?? 0) - (a.lastOrderAt ?? 0),
      orders: (a, b) => b.orders - a.orders,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...l].sort(by[sort]);
  }, [customers, sort, seg, q]);
  const pages = Math.ceil(list.length / PER);
  const p = Math.min(page, Math.max(0, pages - 1));
  const repeat = customers.filter((c) => c.orders > 1).length;

  return (
    <>
      <Head
        no="05"
        title="Customers"
        lede={`${customers.length} accounts; ${repeat} have ordered more than once.`}
        actions={
          <button type="button" className="a6-btn" onClick={() => downloadText("santalum-customers.csv", ["Name,Email,Phone,City,Orders,Lifetime value", ...list.map((c) => `"${c.name}",${c.email},${c.phone},"${c.city}",${c.orders},${c.ltv}`)].join("\n"))}>
            Export CSV
          </button>
        }
      />
      <div className="a6-filters">
        <div className="a6-filters-row">
          <Tabs label="Segment" value={seg} onChange={(v) => { setSeg(v); setPage(0); }} items={[{ id: "all", label: "All" }, { id: "repeat", label: "Repeat" }, { id: "none", label: "No orders" }, { id: "circle", label: "Santalum Circle" }]} />
          <Tabs label="Sort" value={sort} onChange={setSort} items={[{ id: "ltv", label: "By value" }, { id: "recent", label: "Recent" }, { id: "orders", label: "Orders" }, { id: "name", label: "A–Z" }]} />
          <Search label="Search name, email, city" value={q} onChange={(v) => { setQ(v); setPage(0); }} />
        </div>
      </div>
      {list.length ? (
        <table className="a6-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th className="a6-hide-sm">City</th>
              <th className="a6-r">Orders</th>
              <th className="a6-r">Lifetime</th>
              <th className="a6-r a6-hide-md">Last order</th>
            </tr>
          </thead>
          <tbody>
            {list.slice(p * PER, p * PER + PER).map((c) => (
              <tr key={c.id}>
                <td>
                  <Link href={`${BASE}/customers/${c.id}`} className="a6-rowlink">
                    {c.name}
                  </Link>
                  <div className="a6-muted">
                    {c.email}
                    {c.tags.length > 0 && ` · ${c.tags.join(", ")}`}
                  </div>
                </td>
                <td className="a6-hide-sm">{c.city}</td>
                <td className="a6-r a6-num">{c.orders}</td>
                <td className="a6-r a6-num a6-strong">{formatINR(c.ltv)}</td>
                <td className="a6-r a6-num a6-hide-md a6-muted">{c.lastOrderAt ? fmtDate(c.lastOrderAt) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <Empty>No customers match.</Empty>
      )}
      <Pager page={p} pages={pages} total={list.length} onPage={setPage} noun="customers" />
    </>
  );
}
