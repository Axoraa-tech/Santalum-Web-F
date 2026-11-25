"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatINR, isoDay, timeAgo } from "../_data/format";
import { DAY } from "../_data/mock";
import { useCustomers, useNow, type CustomerRow } from "../_data/store";
import { Icon } from "./icons";
import { downloadText, Empty, initials, PageHead, Pager, SearchField, Seg, toast } from "./ui";

type Segment = "all" | "repeat" | "new" | "none" | "circle" | "corporate";
type Sort = "ltv" | "orders" | "recent" | "joined" | "name";
const PER = 25;

export function customerTags(c: CustomerRow) {
  const t = [...c.tags];
  if (c.orders >= 3) t.unshift("Repeat");
  if (c.ltv >= 50000) t.unshift("High value");
  return t;
}

export function CustomersView() {
  const now = useNow();
  const router = useRouter();
  const customers = useCustomers();
  const [q, setQ] = useState("");
  const [seg, setSeg] = useState<Segment>("all");
  const [sort, setSort] = useState<Sort>("ltv");
  const [page, setPage] = useState(1);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const digits = n.replace(/\D/g, "");
    const match = (c: CustomerRow) =>
      seg === "all" ||
      (seg === "repeat" && c.orders >= 2) ||
      (seg === "new" && c.createdAt >= now - 30 * DAY) ||
      (seg === "none" && c.orders === 0) ||
      (seg === "circle" && c.tags.includes("Circle")) ||
      (seg === "corporate" && c.tags.includes("Corporate"));
    const cmp: Record<Sort, (a: CustomerRow, b: CustomerRow) => number> = {
      ltv: (a, b) => b.ltv - a.ltv,
      orders: (a, b) => b.orders - a.orders || b.ltv - a.ltv,
      recent: (a, b) => (b.lastOrderAt ?? 0) - (a.lastOrderAt ?? 0),
      joined: (a, b) => b.createdAt - a.createdAt,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return customers
      .filter((c) => match(c) && (!n || c.name.toLowerCase().includes(n) || c.email.includes(n) || c.city.toLowerCase().includes(n) || (digits.length >= 4 && c.phone.includes(digits))))
      .sort(cmp[sort]);
  }, [customers, q, seg, sort, now]);

  const pages = Math.max(1, Math.ceil(list.length / PER));
  const cur = Math.min(page, pages);
  const rows = list.slice((cur - 1) * PER, cur * PER);
  const buyers = customers.filter((c) => c.orders > 0).length;
  const repeat = customers.filter((c) => c.orders >= 2).length;

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers" }]}
        title="Customers"
        sub={`${customers.length} accounts · ${buyers} have ordered · ${Math.round((repeat / Math.max(1, buyers)) * 100)}% came back for a second order`}
        actions={
          <button
            type="button"
            className="adm-btn"
            onClick={() => {
              const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
              const head = ["Name", "Email", "Phone", "City", "State", "Orders", "Lifetime value", "Joined", "Tags"];
              downloadText(
                `santalum-customers-${isoDay(now)}.csv`,
                [head.join(","), ...list.map((c) => [c.name, c.email, c.phone, c.city, c.state, c.orders, c.ltv, isoDay(c.createdAt), c.tags.join(" ")].map(esc).join(","))].join("\n"),
              );
              toast(`Exported ${list.length} customers`);
            }}
          >
            <Icon name="download" />
            Export
          </button>
        }
      />

      <section className="adm-panel">
        <div className="adm-toolbar">
          <SearchField
            label="Search customers"
            placeholder="Name, email, phone or city"
            value={q}
            onChange={(v) => {
              setQ(v);
              setPage(1);
            }}
          />
          <Seg
            label="Segment"
            value={seg}
            onChange={(s) => {
              setSeg(s);
              setPage(1);
            }}
            items={[
              { id: "all", label: "All" },
              { id: "repeat", label: "Repeat" },
              { id: "new", label: "Joined this month" },
              { id: "none", label: "No orders" },
              { id: "circle", label: "Circle" },
              { id: "corporate", label: "Corporate" },
            ]}
          />
          <select className="adm-select" data-size="sm" style={{ width: "auto", marginLeft: "auto" }} aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="ltv">Lifetime value</option>
            <option value="orders">Most orders</option>
            <option value="recent">Latest order</option>
            <option value="joined">Newest accounts</option>
            <option value="name">Name</option>
          </select>
        </div>
        {rows.length ? (
          <div className="adm-tablewrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Location</th>
                  <th className="num">Orders</th>
                  <th className="num">Lifetime value</th>
                  <th className="num">Average order</th>
                  <th>Last order</th>
                  <th>Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} style={{ cursor: "pointer" }} onClick={(e) => !(e.target as HTMLElement).closest("a") && router.push(`/admin/customers/${c.id}`)}>
                    <td style={{ maxWidth: 300 }}>
                      <div className="adm-cell-main">
                        <span className="adm-avatar" style={{ background: c.tags.includes("Corporate") ? "var(--a-gold)" : undefined }}>
                          {initials(c.name)}
                        </span>
                        <div>
                          <Link href={`/admin/customers/${c.id}`} className="adm-rowlink adm-cell-title" style={{ display: "block" }}>
                            {c.name}
                          </Link>
                          <div className="adm-cell-sub">{c.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="adm-ink2">
                      {c.city || "–"}
                      {c.state && <div className="adm-cell-sub">{c.state}</div>}
                    </td>
                    <td className="num">{c.orders}</td>
                    <td className="num" style={{ fontWeight: 500 }}>
                      {formatINR(c.ltv)}
                    </td>
                    <td className="num adm-ink2">{c.orders ? formatINR(c.aov) : "–"}</td>
                    <td className="adm-ink2">{c.lastOrderAt ? timeAgo(c.lastOrderAt, now) : <span className="adm-muted">Never</span>}</td>
                    <td>
                      <span style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                        {c.source === "preview" && (
                          <span className="adm-tag" data-tone="gold">
                            Shop account
                          </span>
                        )}
                        {customerTags(c).map((t) => (
                          <span key={t} className="adm-tag" data-tone={t === "High value" ? "ink" : undefined}>
                            {t}
                          </span>
                        ))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon="customers" title="No customers match">
            Try another segment, or search by phone number.
          </Empty>
        )}
        <Pager page={cur} pages={pages} total={list.length} per={PER} onPage={setPage} noun="customers" />
      </section>
    </div>
  );
}
