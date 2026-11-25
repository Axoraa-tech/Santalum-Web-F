"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, formatINR, timeAgo } from "../../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useNow, useOrders } from "../../_data/store";
import { BASE, Chips, Empty, Head, Icon, initialsOf, Pinned, Stage, toneOf, Woods, say } from "./kit";

type Sort = "recent" | "ltv" | "orders" | "name";

export function Customers() {
  const rows = useCustomers();
  const now = useNow();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [limit, setLimit] = useState(36);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = rows.filter((c) => !s || `${c.name} ${c.email} ${c.phone} ${c.city}`.toLowerCase().includes(s));
    const by: Record<Sort, (a: (typeof list)[0], b: (typeof list)[0]) => number> = {
      recent: (a, b) => (b.lastOrderAt ?? 0) - (a.lastOrderAt ?? 0),
      ltv: (a, b) => b.ltv - a.ltv,
      orders: (a, b) => b.orders - a.orders,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...list].sort(by[sort]);
  }, [rows, q, sort]);

  return (
    <div className="a4-page a4-page-wide">
      <Head kicker="People" title="Customers" sub={`${rows.length} people have an account or an order.`} />
      <div className="a4-toolbar">
        <input type="search" className="a4-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email, phone or city" aria-label="Search customers" />
        <Chips
          label="Sort"
          value={sort}
          onChange={setSort}
          items={[
            { id: "recent", label: "Last order" },
            { id: "ltv", label: "Spent" },
            { id: "orders", label: "Orders" },
            { id: "name", label: "Name" },
          ]}
        />
      </div>
      {shown.length === 0 ? (
        <Empty>No one matches.</Empty>
      ) : (
        <ul className="a4-cards">
          {shown.slice(0, limit).map((c) => (
            <li key={c.id}>
              <Link href={`${BASE}/customers/${c.id}`} className="a4-paper a4-ccard">
                <span className="a4-avatar a4-avatar-lg">{initialsOf(c.name)}</span>
                <span className="a4-ccard-body">
                  <span className="a4-strong">{c.name}</span>
                  <span className="a4-muted">
                    {c.city || "No city"}
                    {c.tags.length > 0 && ` · ${c.tags.join(", ")}`}
                  </span>
                  <span className="a4-ccard-figs">
                    <span>
                      {c.orders} {c.orders === 1 ? "order" : "orders"}
                    </span>
                    <span className="a4-strong">{formatINR(c.ltv)}</span>
                    <span className="a4-muted">{c.lastOrderAt ? timeAgo(c.lastOrderAt, now) : "No orders"}</span>
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      {shown.length > limit && (
        <button type="button" className="a4-btn a4-more-btn" onClick={() => setLimit((n) => n + 36)}>
          Show more ({shown.length - limit} left)
        </button>
      )}
    </div>
  );
}

export function CustomerSheet({ params }: { params: Promise<{ id: string }> }) {
  const { id: raw } = use(params);
  const id = decodeURIComponent(raw);
  const c = useCustomers().find((x) => x.id === id);
  const all = useOrders();
  const orders = useMemo(() => all.filter((o) => o.customerId === id), [all, id]);
  const notes = useCustomerNotes(id);
  const now = useNow();
  const [note, setNote] = useState("");

  if (!c)
    return (
      <div className="a4-page">
        <Head kicker={<Link href={`${BASE}/customers`}>Customers</Link>} title="Customer not found" />
        <Empty>No customer with the id {id}.</Empty>
      </div>
    );

  return (
    <div className="a4-page">
      <Head
        kicker={
          <Link href={`${BASE}/customers`} className="a4-back">
            <Icon name="back" size={14} /> Customers
          </Link>
        }
        title={c.name}
        sub={`${c.city ? `${c.city}, ${c.state} · ` : ""}customer since ${fmtDate(c.createdAt)}`}
      />
      <dl className="a4-figs a4-figs-row">
        <div className="a4-paper">
          <dt>Orders</dt>
          <dd>{c.orders}</dd>
        </div>
        <div className="a4-paper">
          <dt>Spent</dt>
          <dd>{formatINR(c.ltv)}</dd>
        </div>
        <div className="a4-paper">
          <dt>Average order</dt>
          <dd>{formatINR(c.aov)}</dd>
        </div>
        <div className="a4-paper">
          <dt>Last order</dt>
          <dd>{c.lastOrderAt ? fmtDate(c.lastOrderAt) : "None"}</dd>
        </div>
      </dl>

      <div className="a4-detail">
        <div className="a4-detail-main">
          <section className="a4-paper a4-pad" aria-labelledby="c-orders">
            <h2 id="c-orders" className="a4-h2">
              Orders
            </h2>
            {orders.length === 0 ? (
              <p className="a4-empty">No orders yet.</p>
            ) : (
              <ul className="a4-queue">
                {orders.map((o) => (
                  <li key={o.id}>
                    <Pinned photoId={o.lines[0].photoId} tone={toneOf(o.lines[0].slug)} size="sm" pin={false} alt="" />
                    <div className="a4-queue-body">
                      <Link href={`${BASE}/orders/${o.id}`} className="a4-strong">
                        {o.id}
                      </Link>
                      <span className="a4-muted">
                        {fmtDate(o.placedAt)} · {o.lines.map((l) => l.name).join(", ")}
                      </span>
                      <span className="a4-row-tags">
                        <Stage status={o.status} />
                        <Woods woods={o.woods} />
                      </span>
                    </div>
                    <span className="a4-strong a4-num">{formatINR(o.total)}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="a4-paper a4-pad" aria-labelledby="c-notes">
            <h2 id="c-notes" className="a4-h2">
              Notes
            </h2>
            <form
              className="a4-noteform"
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                addCustomerNote(id, note.trim());
                setNote("");
                say("Note added");
              }}
            >
              <input aria-label="Add a note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prefers a call before delivery" />
              <button type="submit" className="a4-btn a4-btn-sm" disabled={!note.trim()}>
                Add
              </button>
            </form>
            {notes.length === 0 ? (
              <p className="a4-empty">No notes.</p>
            ) : (
              <ul className="a4-notes">
                {notes.map((n, i) => (
                  <li key={i}>
                    <p>{n.body}</p>
                    <span className="a4-muted">
                      {n.by} · {timeAgo(n.at, now)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        <aside className="a4-detail-side">
          <section className="a4-paper a4-pad" aria-labelledby="c-contact">
            <h2 id="c-contact" className="a4-h2">
              Contact
            </h2>
            <p className="a4-break">
              <a href={`mailto:${c.email}`}>{c.email}</a>
            </p>
            <p>{c.phone}</p>
            <p className="a4-muted">{c.newsletter ? "Reads the newsletter" : "Not on the newsletter"}</p>
            {c.addresses.map((a) => (
              <div key={a.id}>
                <p className="a4-label">
                  {a.label || "Address"}
                  {a.isDefault && " · default"}
                </p>
                <address className="a4-address">
                  {a.name}
                  <br />
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
              </div>
            ))}
          </section>
          {c.wishlist.length > 0 && (
            <section className="a4-paper a4-pad" aria-labelledby="c-wish">
              <h2 id="c-wish" className="a4-h2">
                Saved pieces
              </h2>
              <ul className="a4-wish">
                {c.wishlist.map((slug) => {
                  const p = getProduct(slug);
                  if (!p) return null;
                  return (
                    <li key={slug}>
                      <Pinned photoId={p.shots[0].photo.id} tone={p.shots[0].tone} size="xs" pin={false} alt="" />
                      <Link href={`${BASE}/products/${slug}`}>{p.name}</Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
