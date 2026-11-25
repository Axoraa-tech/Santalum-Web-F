"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { fmtDate, fmtDateTime, formatINR, timeAgo } from "../../_data/format";
import { addCustomerNote, useCustomerNotes, useCustomers, useNow, useOrders, type CustomerRow } from "../../_data/store";
import { BASE, Btn, Filter, Head, Seg, Split, StatusLed, say, useListKeys, useNarrow, Woods, keyBlocked } from "./kit";
import { downloadText } from "../../_components/ui";

type Sort = "recent" | "ltv" | "orders";

export function CustomersList() {
  return <CustomersSplit id={null} />;
}
export function CustomerRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <CustomersSplit key={id} id={decodeURIComponent(id)} />;
}

function CustomersSplit({ id }: { id: string | null }) {
  const customers = useCustomers();
  const router = useRouter();
  const narrow = useNarrow();
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<Sort>("recent");
  const [selId, setSelId] = useState<string | null>(id);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const f = customers.filter((c) => !n || `${c.name} ${c.email} ${c.phone} ${c.city} ${c.tags.join(" ")}`.toLowerCase().includes(n));
    return f.sort((a, b) => (sort === "ltv" ? b.ltv - a.ltv : sort === "orders" ? b.orders - a.orders : (b.lastOrderAt ?? b.createdAt) - (a.lastOrderAt ?? a.createdAt)));
  }, [customers, q, sort]);
  const idx = list.findIndex((c) => c.id === selId);
  const cursor = idx < 0 ? 0 : idx;
  const sel = customers.find((c) => c.id === selId) ?? (narrow ? undefined : list[0]);

  const select = (c: CustomerRow, push: boolean) => {
    setSelId(c.id);
    const href = `${BASE}/customers/${c.id}`;
    if (push && narrow) router.push(href);
    else window.history.replaceState(null, "", href);
  };
  const ref = useListKeys(list.length, { cursor, setCursor: (i) => select(list[i], false), onOpen: (i) => select(list[i], true) });

  const exportCsv = () => {
    const rows = [["name", "email", "phone", "city", "orders", "ltv", "last order"], ...list.map((c) => [c.name, c.email, c.phone, c.city, String(c.orders), String(c.ltv), c.lastOrderAt ? fmtDate(c.lastOrderAt) : ""])];
    downloadText("santalum-customers.csv", rows.map((r) => r.map((x) => `"${x.replace(/"/g, '""')}"`).join(",")).join("\n"));
  };

  return (
    <Split
      focus={id ? "detail" : "list"}
      list={
        <div className="a3-listpane" ref={ref}>
          <div className="a3-listhead">
            <Filter value={q} onChange={setQ} placeholder="filter name, email, city, tag" />
            <div className="a3-listmeta">
              <Seg value={sort} onChange={setSort} label="Sort" items={[{ id: "recent", label: "recent" }, { id: "ltv", label: "ltv" }, { id: "orders", label: "orders" }]} />
              <button type="button" className="a3-link" onClick={exportCsv}>
                csv ↓
              </button>
            </div>
          </div>
          <ul className="a3-rows" role="listbox" aria-label="Customers">
            {list.map((c, i) => (
              <li key={c.id} role="option" aria-selected={sel?.id === c.id} data-a3-row={i} data-cur={i === cursor && (!!selId || !narrow) ? true : undefined} onClick={() => select(c, true)}>
                <span className="a3-row-name">
                  {c.name}
                  {c.source === "preview" && <span className="a3-tag">shop</span>}
                </span>
                <span className="a3-dim a3-row-city">{c.city}</span>
                <span className="a3-mono a3-dim r">{c.orders}×</span>
                <span className="a3-mono r">{formatINR(c.ltv)}</span>
              </li>
            ))}
            {list.length === 0 && <li className="a3-dim a3-empty">no customers match</li>}
          </ul>
        </div>
      }
      detail={sel ? <CustomerDetail key={sel.id} c={sel} /> : <div className="a3-empty a3-dim">{id ? `no customer ${id}` : "select a customer (j/k)"}</div>}
    />
  );
}

function CustomerDetail({ c }: { c: CustomerRow }) {
  const now = useNow();
  const orders = useOrders();
  const notes = useCustomerNotes(c.id);
  const mine = useMemo(() => orders.filter((o) => o.customerId === c.id), [orders, c.id]);
  const [note, setNote] = useState("");
  const noteRef = useRef<HTMLInputElement>(null);
  const woods = [...new Set(mine.flatMap((o) => o.woods))];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "n" || keyBlocked(e)) return;
      e.preventDefault();
      noteRef.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <article className="a3-detail">
      <Link href={`${BASE}/customers`} className="a3-back">
        ← customers
      </Link>
      <Head path="~/customers/" title={c.name} meta={c.tags.map((t) => <span key={t} className="a3-tag">{t}</span>)}>
        <a className="a3-btn" data-kind="ghost" href={`mailto:${c.email}`}>
          email
        </a>
      </Head>
      <div className="a3-stats">
        <div>
          <span>orders</span>
          <b>{c.orders}</b>
        </div>
        <div>
          <span>lifetime</span>
          <b>{formatINR(c.ltv)}</b>
        </div>
        <div>
          <span>aov</span>
          <b>{formatINR(c.aov)}</b>
        </div>
        <div>
          <span>last</span>
          <b>{c.lastOrderAt ? timeAgo(c.lastOrderAt, now) : "–"}</b>
        </div>
      </div>
      <div className="a3-kv">
        <div>
          <span>contact</span>
          <span className="a3-mono">
            {c.email} · {c.phone}
          </span>
        </div>
        <div>
          <span>since</span>
          <span>{fmtDate(c.createdAt)}</span>
        </div>
        <div>
          <span>woods</span>
          <span>{woods.length ? <Woods ws={woods} /> : "–"}</span>
        </div>
        <div>
          <span>newsletter</span>
          <span>{c.newsletter ? "subscribed" : "no"}</span>
        </div>
        {c.addresses.map((a) => (
          <div key={a.id}>
            <span>{a.isDefault ? "address *" : "address"}</span>
            <span>
              {a.line1}
              {a.line2 && `, ${a.line2}`}, {a.city}, {a.state} {a.pin}
            </span>
          </div>
        ))}
      </div>

      <h2 className="a3-h2">orders · {mine.length}</h2>
      <table className="a3-t">
        <tbody>
          {mine.map((o) => (
            <tr key={o.id}>
              <td>
                <StatusLed s={o.status} />
              </td>
              <td className="a3-mono">
                <Link href={`${BASE}/orders/${o.id}`}>{o.id}</Link>
              </td>
              <td className="a3-dim a3-hide-sm">{fmtDate(o.placedAt)}</td>
              <td>
                <Woods ws={o.woods} />
              </td>
              <td className="r a3-mono">{formatINR(o.total)}</td>
            </tr>
          ))}
          {mine.length === 0 && (
            <tr>
              <td className="a3-dim">no orders yet</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2 className="a3-h2">notes</h2>
      <form
        className="a3-cmdline"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          addCustomerNote(c.id, note.trim());
          setNote("");
          say("note saved");
        }}
      >
        <span className="a3-cmdline-p">note&gt;</span>
        <input ref={noteRef} aria-label="New note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="press n · prefers gift wrap, call before delivery…" />
        <Btn type="submit" kind="primary" hint="↵">
          add
        </Btn>
      </form>
      <ol className="a3-log">
        {notes.map((n, i) => (
          <li key={i}>
            <time className="a3-dim">{fmtDateTime(n.at)}</time>
            <span className="a3-log-tag" data-t="note">
              note
            </span>
            <span className="a3-log-text">
              {n.body} <span className="a3-dim">({n.by})</span>
            </span>
          </li>
        ))}
      </ol>
    </article>
  );
}
