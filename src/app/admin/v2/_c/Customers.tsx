"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, fmtShort, formatINR } from "../../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useOrders } from "../../_data/store";
import { BASE, Choice, Empty, F, Fig, folios, Head, note, Pages, Section, StatusStamp, WoodMark } from "./kit";

type Sort = "recent" | "ltv" | "orders" | "name";
const PER = 25;

/** The customer index: one line per account, as in the back pages of a ledger. */
export function CustomerIndex() {
  const customers = useCustomers();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [page, setPage] = useState(0);
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    const l = customers.filter((c) => !t || c.name.toLowerCase().includes(t) || c.email.includes(t) || c.phone.includes(t) || c.city.toLowerCase().includes(t));
    const by: Record<Sort, (a: (typeof l)[number], b: (typeof l)[number]) => number> = {
      recent: (a, b) => (b.lastOrderAt ?? b.createdAt) - (a.lastOrderAt ?? a.createdAt),
      ltv: (a, b) => b.ltv - a.ltv,
      orders: (a, b) => b.orders - a.orders,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return [...l].sort(by[sort]);
  }, [customers, q, sort]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const pg = Math.min(page, pages - 1);
  const rows = list.slice(pg * PER, pg * PER + PER);

  return (
    <div>
      <Head kicker="Accounts" title="Customers">
        <p className="a2-lede">
          {customers.length} accounts · {customers.filter((c) => c.orders > 1).length} have ordered more than once
        </p>
      </Head>
      <div className="a2-tools">
        <div className="a2-tools-row">
          <Choice
            label="Order by"
            value={sort}
            onChange={(v) => {
              setSort(v);
              setPage(0);
            }}
            items={[
              { id: "recent", label: "Latest" },
              { id: "ltv", label: "Most spent" },
              { id: "orders", label: "Most orders" },
              { id: "name", label: "A–Z" },
            ]}
          />
          <input
            type="search"
            className="a2-search"
            data-a2-search
            placeholder="Find by name, email, phone or city  ( / )"
            aria-label="Find a customer"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>
      {rows.length === 0 ? (
        <Empty>No accounts match.</Empty>
      ) : (
        <div className="a2-ledger a2-cbook" role="table" aria-label="Customers">
          <div className="a2-lrow a2-lhead" role="row">
            <span role="columnheader">Name</span>
            <span role="columnheader">Town</span>
            <span role="columnheader" className="a2-r">Orders</span>
            <span role="columnheader" className="a2-r">Spent</span>
            <span role="columnheader" className="a2-r">Last</span>
          </div>
          {rows.map((c) => (
            <Link key={c.id} href={`${BASE}/customers/${c.id}`} className="a2-lrow" role="row">
              <span className="a2-part" role="cell">
                {c.name}
                <small>{c.email}</small>
              </span>
              <span className="a2-dim" role="cell">{c.city}</span>
              <span className="a2-r a2-fig" role="cell">{c.orders}</span>
              <span className="a2-r" role="cell"><Fig n={c.ltv} blank /></span>
              <span className="a2-r a2-dim" role="cell">{c.lastOrderAt ? fmtShort(c.lastOrderAt) : "—"}</span>
            </Link>
          ))}
        </div>
      )}
      <Pages page={pg} pages={pages} onPage={setPage} />
    </div>
  );
}

export function CustomerLeaf({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const cid = decodeURIComponent(id);
  const customers = useCustomers();
  const orders = useOrders();
  const notes = useCustomerNotes(cid);
  const fo = useMemo(() => folios(orders), [orders]);
  const [body, setBody] = useState("");
  const c = customers.find((x) => x.id === cid);
  if (!c)
    return (
      <div>
        <Head kicker="Accounts" title="No such account" />
        <Empty>
          <Link href={`${BASE}/customers`} className="a2-link">Back to the customers</Link>
        </Empty>
      </div>
    );
  const theirs = orders.filter((o) => o.customerId === c.id);
  const woods = { red: 0, white: 0 };
  for (const o of theirs) if (o.status !== "cancelled") for (const l of o.lines) woods[l.wood] += l.qty * l.unitPrice;

  return (
    <div>
      <Head
        kicker={
          <>
            <Link href={`${BASE}/customers`} className="a2-link">Accounts</Link> · since {fmtDate(c.createdAt)}
          </>
        }
        title={c.name}
        aside={
          <p className="a2-takings-big">
            <span className="a2-f-l">Spent in all</span>
            <span className="a2-fig a2-dbl">{formatINR(c.ltv)}</span>
          </p>
        }
      >
        <p className="a2-lede">
          {c.email} · {c.phone}
          {c.tags.length ? ` · ${c.tags.join(", ")}` : ""}
          {c.newsletter ? " · takes the letter" : ""}
        </p>
      </Head>
      <div className="a2-spread">
        <div>
          <Section title={`Folios in this account (${theirs.length})`}>
            {theirs.length === 0 ? (
              <Empty>No orders yet.</Empty>
            ) : (
              <div className="a2-ledger a2-cacc" role="table" aria-label="Orders">
                {theirs.map((o) => (
                  <Link key={o.id} href={`${BASE}/orders/${o.id}`} className="a2-lrow" role="row" data-void={o.status === "cancelled" || undefined}>
                    <span className="a2-folio" role="cell">{fo.get(o.id)}</span>
                    <span className="a2-dim" role="cell">{fmtShort(o.placedAt)}</span>
                    <span className="a2-part" role="cell">
                      {o.lines.map((l) => l.name.split(",")[0]).join("; ")}
                      <small>{o.woods.map((w) => <WoodMark key={w} wood={w} />)}</small>
                    </span>
                    <span role="cell" className="a2-mark"><StatusStamp o={o} size="sm" /></span>
                    <span className="a2-r" role="cell"><Fig n={o.status === "cancelled" ? 0 : o.total} blank /></span>
                  </Link>
                ))}
                <div className="a2-lrow a2-ltotal" role="row">
                  <span />
                  <span />
                  <span>
                    <WoodMark wood="red" /> {formatINR(woods.red)} · <WoodMark wood="white" /> {formatINR(woods.white)}
                  </span>
                  <span />
                  <span className="a2-r"><span className="a2-fig a2-dbl">{formatINR(c.ltv)}</span></span>
                </div>
              </div>
            )}
          </Section>
          <Section title="Notes on this account">
            <form
              className="a2-inline"
              onSubmit={(e) => {
                e.preventDefault();
                if (!body.trim()) return;
                addCustomerNote(c.id, body.trim());
                setBody("");
                note("Note written");
              }}
            >
              <F label="Write a note" wide>
                <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Prefers a call before delivery" />
              </F>
              <button type="submit" className="a2-btn" disabled={!body.trim()}>
                Write
              </button>
            </form>
            {notes.length ? (
              <ol className="a2-time">
                {notes.map((n, i) => (
                  <li key={i}>
                    <span className="a2-time-at">{fmtDateTime(n.at)}</span>
                    <span>
                      {n.body}
                      <small> — {n.by}</small>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
          </Section>
        </div>
        <aside className="a2-margin-notes">
          <Section title="Addresses">
            {c.addresses.map((a) => (
              <p key={a.id} className="a2-addr">
                <span className="a2-f-l">
                  {a.label || "Address"}
                  {a.isDefault ? ", default" : ""}
                </span>
                <br />
                {a.name}, {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
                <br />
                {a.city}, {a.state} {a.pin}
              </p>
            ))}
          </Section>
          <Section title="Figures">
            <dl className="a2-bf">
              <dt>Orders</dt>
              <dd className="a2-fig">{c.orders}</dd>
              <dt>Average order</dt>
              <dd><Fig n={c.aov} /></dd>
              <dt>First order</dt>
              <dd>{c.firstOrderAt ? fmtShort(c.firstOrderAt) : "—"}</dd>
            </dl>
          </Section>
          {c.wishlist.length ? (
            <Section title="Wishlist">
              <ul className="a2-plain">
                {c.wishlist.map((s) => (
                  <li key={s}>
                    <Link href={`${BASE}/products/${s}`}>{getProduct(s)?.name ?? s}</Link>
                  </li>
                ))}
              </ul>
            </Section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
