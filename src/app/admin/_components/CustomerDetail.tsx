"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR, timeAgo } from "../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useNow, useOrders } from "../_data/store";
import { customerTags } from "./Customers";
import { Icon } from "./icons";
import { Empty, initials, PageHead, Panel, StatusPill, Thumb, toast, Woods } from "./ui";

export function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = use(params);
  const id = decodeURIComponent(raw);
  const now = useNow();
  const customers = useCustomers();
  const allOrders = useOrders();
  const notes = useCustomerNotes(id);
  const [note, setNote] = useState("");
  const c = customers.find((x) => x.id === id);
  const orders = useMemo(() => allOrders.filter((o) => o.customerId === id), [allOrders, id]);

  if (!c)
    return (
      <div className="adm-page">
        <PageHead crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: id }]} title="Customer not found" />
        <div className="adm-panel">
          <Empty icon="customers" title="No such customer" action={<Link href="/admin/customers" className="adm-btn">Back to customers</Link>} />
        </div>
      </div>
    );

  const woodSplit = orders.flatMap((o) => o.lines).reduce((m, l) => ({ ...m, [l.wood]: (m[l.wood] ?? 0) + l.qty * l.unitPrice }), {} as Record<string, number>);
  const favourite = Object.entries(woodSplit).sort((a, b) => b[1] - a[1])[0]?.[0];

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Customers", href: "/admin/customers" }, { label: c.name }]}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>
            <span className="adm-avatar" data-size="lg" aria-hidden>
              {initials(c.name)}
            </span>
            {c.name}
          </span>
        }
        sub={
          <span style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
            <span>
              Customer since {fmtDate(c.createdAt)}
              {c.city && ` · ${c.city}`}
            </span>
            {c.source === "preview" && (
              <span className="adm-tag" data-tone="gold">
                Shop account in this browser
              </span>
            )}
            {customerTags(c).map((t) => (
              <span key={t} className="adm-tag">
                {t}
              </span>
            ))}
          </span>
        }
        actions={
          <>
            <a className="adm-btn" href={`mailto:${c.email}`}>
              <Icon name="mail" />
              Email
            </a>
            <a className="adm-btn" href={`tel:+91${c.phone}`}>
              <Icon name="phone" />
              Call
            </a>
          </>
        }
      />

      <div className="adm-kpis" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 16 }}>
        {[
          { label: "Orders", value: String(c.orders), note: orders.length > c.orders ? `${orders.length - c.orders} cancelled` : "excluding cancelled" },
          { label: "Lifetime value", value: formatINR(c.ltv), note: "after refunds" },
          { label: "Average order", value: c.orders ? formatINR(c.aov) : "–", note: favourite ? `Mostly ${favourite} sandalwood` : "No orders yet" },
          { label: "Last order", value: c.lastOrderAt ? timeAgo(c.lastOrderAt, now) : "Never", note: c.lastOrderAt ? fmtDate(c.lastOrderAt) : "–" },
        ].map((t) => (
          <div key={t.label} className="adm-kpi">
            <div className="adm-kpi-label">{t.label}</div>
            <div className="adm-kpi-value" style={{ fontSize: 23 }}>
              {t.value}
            </div>
            <div className="adm-kpi-foot">{t.note}</div>
          </div>
        ))}
      </div>

      <div className="adm-grid adm-cols-main">
        <div className="adm-stack">
          <Panel title="Orders" meta={`${orders.length} in total`} bodyClass="" id="c-orders">
            {orders.length ? (
              <div className="adm-tablewrap" style={{ marginTop: 10 }}>
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Placed</th>
                      <th>Pieces</th>
                      <th>Status</th>
                      <th className="num">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td className="nowrap">
                          <Link href={`/admin/orders/${o.id}`} className="adm-rowlink num">
                            {o.id}
                          </Link>
                        </td>
                        <td className="adm-ink2 nowrap">{fmtDate(o.placedAt)}</td>
                        <td style={{ width: "100%" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span className="adm-thumbs">
                              {o.lines.slice(0, 3).map((l) => (
                                <Thumb key={l.slug + l.option} photoId={l.photoId} slug={l.slug} size="sm" />
                              ))}
                            </span>
                            {/* width 0: the piece names take what the row has left and never widen the table */}
                            <span className="adm-cell-sub" style={{ flex: "1 1 0", width: 0, minWidth: 60, maxWidth: 260 }}>
                              {o.lines.map((l) => l.name).join(", ")}
                            </span>
                            <Woods woods={o.woods} />
                          </div>
                        </td>
                        <td className="nowrap">
                          <StatusPill status={o.status} />
                        </td>
                        <td className="num nowrap" style={{ fontWeight: 500 }}>
                          {formatINR(o.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <Empty icon="orders" title="No orders yet">
                {c.name.split(" ")[0]} has an account but hasn&apos;t ordered.
              </Empty>
            )}
          </Panel>

          <Panel title="Notes" meta="For the team. The customer never sees these." id="c-notes">
            <form
              style={{ display: "grid", gap: 8 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addCustomerNote(c.id, note.trim());
                setNote("");
                toast("Note saved");
              }}
            >
              <label className="adm-sr" htmlFor="c-note">
                New note
              </label>
              <textarea id="c-note" className="adm-textarea" rows={2} placeholder="e.g. Prefers the 8 mm mala. Gifts for Deepavali every year." value={note} onChange={(e) => setNote(e.target.value)} />
              <div>
                <button type="submit" className="adm-btn" disabled={!note.trim()}>
                  Add note
                </button>
              </div>
            </form>
            {notes.length > 0 && (
              <ul className="adm-list" style={{ marginTop: 14 }}>
                {notes.map((n, i) => (
                  <li key={i} style={{ display: "block", padding: "10px 0" }}>
                    <div style={{ fontSize: 13.5 }}>{n.body}</div>
                    <div className="adm-cell-sub">
                      {n.by} · {fmtDateTime(n.at)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <aside className="adm-stack" aria-label="Customer details">
          <Panel title="Contact" id="c-contact">
            <dl className="adm-dl">
              <dt>Email</dt>
              <dd>
                <a className="adm-link" href={`mailto:${c.email}`}>
                  {c.email}
                </a>
              </dd>
              <dt>Phone</dt>
              <dd className="num">{c.phone}</dd>
              <dt>Newsletter</dt>
              <dd>{c.newsletter ? "Subscribed" : "Not subscribed"}</dd>
              <dt>Customer ID</dt>
              <dd className="num adm-ink2" style={{ fontSize: 12.5 }}>
                {c.id}
              </dd>
            </dl>
          </Panel>
          <Panel title="Addresses" meta={`${c.addresses.length} saved`} id="c-addr">
            {c.addresses.length ? (
              <div style={{ display: "grid", gap: 10 }}>
                {c.addresses.map((a) => (
                  <address key={a.id} style={{ fontStyle: "normal", padding: "10px 12px", borderRadius: 10, background: "var(--a-surface-2)", fontSize: 13.5, lineHeight: 1.5 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                      <strong style={{ fontWeight: 500 }}>{a.label}</strong>
                      {a.isDefault && <span className="adm-tag">Default</span>}
                    </div>
                    {a.line1}
                    {a.line2 && (
                      <>
                        <br />
                        {a.line2}
                      </>
                    )}
                    <br />
                    {a.city}, {a.state} {a.pin}
                  </address>
                ))}
              </div>
            ) : (
              <p className="adm-muted" style={{ margin: 0 }}>
                No saved addresses.
              </p>
            )}
          </Panel>
          {c.wishlist.length > 0 && (
            <Panel title="Wishlist" meta={`${c.wishlist.length} saved on the shop`} id="c-wish">
              <div style={{ display: "grid", gap: 8 }}>
                {c.wishlist.map((slug) => {
                  const p = getProduct(slug);
                  return p ? (
                    <Link key={slug} href={`/admin/products/${slug}`} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <Thumb photoId={p.shots[0].photo.id} tone={p.shots[0].tone} size="sm" />
                      <span className="adm-cell-title">{p.name}</span>
                    </Link>
                  ) : null;
                })}
              </div>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  );
}
