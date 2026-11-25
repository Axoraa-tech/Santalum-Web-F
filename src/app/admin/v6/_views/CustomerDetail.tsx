"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR } from "../../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useOrders } from "../../_data/store";
import { BASE, Empty, Head, say, Status, Woods } from "../_ui/kit";

export function CustomerDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const customers = useCustomers();
  const all = useOrders();
  const c = customers.find((x) => x.id === decodeURIComponent(id));
  const orders = useMemo(() => all.filter((o) => o.customerId === c?.id), [all, c]);
  const notes = useCustomerNotes(c?.id ?? "");
  const [note, setNote] = useState("");
  if (!c)
    return (
      <>
        <Head no="05" title="Customer not found" back={{ href: `${BASE}/customers`, label: "Customers" }} />
        <Empty>There is no customer with this id in the preview data.</Empty>
      </>
    );
  const woods = [...new Set(orders.flatMap((o) => o.woods))];

  return (
    <>
      <Head no="05" back={{ href: `${BASE}/customers`, label: "Customers" }} title={c.name} lede={`${c.city}${c.state ? `, ${c.state}` : ""}. Customer since ${fmtDate(c.createdAt)}.`} />
      <div className="a6-spread a6-grid">
        <aside className="a6-margin" aria-label="Figures">
          <div className="a6-mfig" data-accent>
            <span>Lifetime</span>
            <strong>{formatINR(c.ltv)}</strong>
          </div>
          <div className="a6-mfig">
            <span>Orders</span>
            <strong>{c.orders}</strong>
          </div>
          <div className="a6-mfig">
            <span>Average</span>
            <strong>{formatINR(c.aov)}</strong>
          </div>
        </aside>
        <section className="a6-page-l">
          <h2 className="a6-h2">
            <span className="a6-block-no">A</span>Orders
          </h2>
          {orders.length ? (
            <table className="a6-table">
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`${BASE}/orders/${o.id}`} className="a6-rowlink a6-num">
                        {o.id}
                      </Link>
                      <div className="a6-muted">{fmtDate(o.placedAt)}</div>
                    </td>
                    <td className="a6-hide-sm">
                      <Woods woods={o.woods} />
                    </td>
                    <td>
                      <Status status={o.status} />
                    </td>
                    <td className="a6-r a6-num">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="a6-muted">No orders yet.</p>
          )}
          <h2 className="a6-h2">
            <span className="a6-block-no">B</span>Wishlist
          </h2>
          {c.wishlist.length ? (
            <ul className="a6-list">
              {c.wishlist.map((s) => (
                <li key={s}>
                  <Link href={`${BASE}/products/${s}`} className="a6-rowlink">
                    {getProduct(s)?.name ?? s}
                  </Link>
                  <span className="a6-num">{getProduct(s) ? formatINR(getProduct(s)!.price) : ""}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="a6-muted">Nothing saved.</p>
          )}
        </section>
        <section className="a6-page-r">
          <h2 className="a6-h2">
            <span className="a6-block-no">C</span>Contact
          </h2>
          <dl className="a6-facts">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${c.email}`} className="a6-rowlink">
                  {c.email}
                </a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd className="a6-num">{c.phone}</dd>
            </div>
            <div>
              <dt>Circle</dt>
              <dd>{c.newsletter ? "Receives the Santalum Circle letter" : "Not subscribed"}</dd>
            </div>
            {woods.length > 0 && (
              <div>
                <dt>Buys</dt>
                <dd>
                  <Woods woods={woods} />
                </dd>
              </div>
            )}
            {c.addresses.map((a) => (
              <div key={a.id}>
                <dt>{a.label || "Address"}</dt>
                <dd>
                  {a.line1}
                  {a.line2 && `, ${a.line2}`}
                  <br />
                  {a.city}, {a.state} <span className="a6-num">{a.pin}</span>
                  {a.isDefault && <span className="a6-muted"> · default</span>}
                </dd>
              </div>
            ))}
          </dl>
          <h2 className="a6-h2">
            <span className="a6-block-no">D</span>Notes for the team
          </h2>
          <form
            className="a6-inline-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              addCustomerNote(c.id, note.trim());
              setNote("");
              say("Note saved");
            }}
          >
            <label htmlFor="a6-cnote" className="a6-sr">
              Note
            </label>
            <input id="a6-cnote" className="a6-input" placeholder="Prefers express; gifts for Deepavali" value={note} onChange={(e) => setNote(e.target.value)} />
            <button type="submit" className="a6-btn" disabled={!note.trim()}>
              Add
            </button>
          </form>
          <ol className="a6-timeline">
            {notes.map((n, i) => (
              <li key={i}>
                <span className="a6-num a6-muted">{fmtDateTime(n.at)}</span>
                <span className="a6-tl-kind">{n.by}</span>
                <span>{n.body}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </>
  );
}
