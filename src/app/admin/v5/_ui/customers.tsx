"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { use, useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { DAY } from "../../_data/mock";
import { fmtDate, timeAgo } from "../../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useNow, useOrders } from "../../_data/store";
import { initials } from "../../_components/ui";
import { I } from "./icons";
import { BASE, Card, Chip, Empty, Head, Money, Search, Seg, Thumb, WoodDot, say, waLink } from "./kit";
import { OrderCard } from "./orders";

type F = "all" | "repeat" | "new" | "circle";

export function CustomersList() {
  const customers = useCustomers();
  const now = useNow();
  const path = usePathname();
  const sel = path.split("/customers/")[1];
  const [f, setF] = useState<F>("all");
  const [sort, setSort] = useState<"recent" | "ltv">("recent");
  const [q, setQ] = useState("");
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return customers
      .filter((c) => (f === "all" ? true : f === "repeat" ? c.orders > 1 : f === "new" ? c.createdAt > now - 30 * DAY : c.newsletter))
      .filter((c) => !t || c.name.toLowerCase().includes(t) || c.email.toLowerCase().includes(t) || c.phone.includes(t) || c.city.toLowerCase().includes(t))
      .sort((a, b) => (sort === "ltv" ? b.ltv - a.ltv : (b.lastOrderAt ?? b.createdAt) - (a.lastOrderAt ?? a.createdAt)));
  }, [customers, f, q, sort, now]);

  return (
    <>
      <Head
        eyebrow={`${customers.length} people`}
        title="Customers"
        action={
          <button type="button" className="a5-pill" onClick={() => setSort(sort === "recent" ? "ltv" : "recent")}>
            {sort === "recent" ? "Recent first" : "Top spend"}
          </button>
        }
      />
      <div className="a5-sticky">
        <Seg
          label="Show"
          value={f}
          onChange={setF}
          items={[
            { id: "all", label: "All" },
            { id: "repeat", label: "Repeat" },
            { id: "new", label: "New" },
            { id: "circle", label: "Circle" },
          ]}
        />
      </div>
      <Search value={q} onChange={setQ} placeholder="Name, phone, email or city" />
      {rows.length === 0 && <Empty title="Nobody matches" />}
      <div className="a5-list">
        {rows.slice(0, 80).map((c) => (
          <Link key={c.id} href={`${BASE}/customers/${c.id}`} scroll={false} className="a5-row" data-sel={c.id === sel ? "" : undefined}>
            <span className="a5-avatar" data-size="m">
              {initials(c.name)}
            </span>
            <span className="a5-row-main">
              {c.name}
              <small>
                {c.city || "No city"} · {c.orders} {c.orders === 1 ? "order" : "orders"}
                {c.lastOrderAt ? ` · ${timeAgo(c.lastOrderAt, now)}` : ""}
              </small>
            </span>
            <Money v={c.ltv} size="s" />
          </Link>
        ))}
      </div>
    </>
  );
}

export function CustomersIdle() {
  const customers = useCustomers();
  const ltv = customers.reduce((s, c) => s + c.ltv, 0);
  const repeat = customers.filter((c) => c.orders > 1).length;
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Everyone who bought</div>
      <Money v={ltv} size="xl" />
      <p className="a5-muted">
        Spent with the Maison, net of refunds. {repeat} of {customers.length} have ordered more than once.
      </p>
      <h2 className="a5-detail-title">Pick a customer to see them here</h2>
    </div>
  );
}

export function CustomerRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CustomerDetail id={decodeURIComponent(id)} />;
}

function CustomerDetail({ id }: { id: string }) {
  const c = useCustomers().find((x) => x.id === id);
  const orders = useOrders();
  const now = useNow();
  const notes = useCustomerNotes(id);
  const [note, setNote] = useState("");
  const mine = useMemo(() => orders.filter((o) => o.customerId === id), [orders, id]);
  if (!c) return <Empty title="No such customer" />;
  const woods = new Set(mine.flatMap((o) => o.woods));
  return (
    <div className="a5-detail">
      <div className="a5-person">
        <span className="a5-avatar" data-size="l">
          {initials(c.name)}
        </span>
        <div>
          <h2 className="a5-detail-title">{c.name}</h2>
          <p className="a5-muted">
            {[c.city, c.state].filter(Boolean).join(", ")} · since {fmtDate(c.createdAt)}
          </p>
          <div className="a5-ocard-tags">
            {[...woods].map((w) => (
              <WoodDot key={w} w={w} label />
            ))}
            {c.tags.map((t) => (
              <Chip key={t}>{t}</Chip>
            ))}
            {c.newsletter && <Chip tone="gold">Letters</Chip>}
          </div>
        </div>
      </div>

      <div className="a5-contact">
        <a href={`tel:${c.phone}`} className="a5-cbtn">
          <I n="phone" />
          Call
        </a>
        <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="a5-cbtn">
          <I n="chat" />
          WhatsApp
        </a>
        <a href={`mailto:${c.email}`} className="a5-cbtn">
          <I n="mail" />
          Email
        </a>
      </div>

      <div className="a5-stats">
        <div>
          <small>Spent</small>
          <Money v={c.ltv} size="l" />
        </div>
        <div>
          <small>Orders</small>
          <span className="a5-money" data-size="l">
            {c.orders}
          </span>
        </div>
        <div>
          <small>Average</small>
          <Money v={c.aov} size="l" />
        </div>
      </div>

      <Card title="Orders" flush>
        {mine.length === 0 ? (
          <Empty title="No orders yet" />
        ) : (
          <div className="a5-stack a5-pad">
            {mine.map((o) => (
              <OrderCard key={o.id} o={o} now={now} />
            ))}
          </div>
        )}
      </Card>

      <div className="a5-two">
        <Card title="Addresses">
          {c.addresses.map((a) => (
            <p key={a.id}>
              <strong>{a.label || "Address"}</strong>
              {a.isDefault && <span className="a5-dim"> · default</span>}
              <br />
              {a.line1}
              {a.line2 ? `, ${a.line2}` : ""}, {a.city} {a.pin}
            </p>
          ))}
          <p className="a5-muted">
            {c.phone}
            <br />
            {c.email}
          </p>
        </Card>
        <Card title="Wishlist">
          {c.wishlist.length === 0 ? (
            <p className="a5-muted">Nothing saved.</p>
          ) : (
            <div className="a5-list a5-list-flat">
              {c.wishlist.map((s) => {
                const p = getProduct(s);
                return p ? (
                  <Link key={s} href={`${BASE}/products/${s}`} className="a5-row">
                    <Thumb id={p.shots[0].photo.id} tone={p.shots[0].tone} size={36} />
                    <span className="a5-row-main">{p.name}</span>
                  </Link>
                ) : null;
              })}
            </div>
          )}
        </Card>
      </div>

      <Card title="Notes for the team">
        <form
          className="a5-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            addCustomerNote(id, note.trim());
            setNote("");
            say("Note saved");
          }}
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Prefers WhatsApp, gifts for Diwali…" aria-label="Note" />
          <button type="submit" className="a5-btn" data-v="soft" disabled={!note.trim()}>
            Save
          </button>
        </form>
        {notes.map((n, i) => (
          <p key={i} className="a5-note">
            {n.body}
            <small>
              {n.by} · {timeAgo(n.at, now)}
            </small>
          </p>
        ))}
      </Card>
    </div>
  );
}
