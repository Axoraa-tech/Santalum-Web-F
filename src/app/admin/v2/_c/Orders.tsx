"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { Wood } from "@/lib/shop/products";
import { downloadText } from "../../_components/ui";
import { fmtShort, formatINR, STATUS } from "../../_data/format";
import { NEXT_STAGE, orderActions, useOrders } from "../../_data/store";
import type { AdminOrder, AdminStatus } from "../../_data/types";
import { BASE, Choice, Empty, Fig, folios, Head, note, Pages, StatusStamp, WoodMark } from "./kit";

type Filter = "all" | "new" | "confirmed" | "packed" | "shipped" | "delivered" | "returns" | "void";
const MATCH: Record<Filter, (s: AdminStatus) => boolean> = {
  all: () => true,
  new: (s) => s === "new",
  confirmed: (s) => s === "confirmed",
  packed: (s) => s === "packed",
  shipped: (s) => s === "shipped",
  delivered: (s) => s === "delivered",
  returns: (s) => s === "return-requested" || s === "returned",
  void: (s) => s === "cancelled",
};
const LABEL: Record<Filter, string> = { all: "All", new: "Entered", confirmed: "Confirmed", packed: "Packed", shipped: "Dispatched", delivered: "Delivered", returns: "Returns", void: "Void" };
const SHORT: Partial<Record<AdminStatus, string>> = { new: "Confirm", confirmed: "Pack", packed: "Dispatch", shipped: "Delivered" };
const PER = 20;

function fromParam(s: string | null): Filter {
  if (s === "return-requested") return "returns";
  if (s === "cancelled") return "void";
  return s && s in MATCH ? (s as Filter) : "all";
}

/** The order book: double-entry columns, hand-numbered folios, a carried-forward total at the foot of each page. */
export function OrderBook() {
  const params = useSearchParams();
  const orders = useOrders();
  const fo = useMemo(() => folios(orders), [orders]);
  const [f, setF] = useState<Filter>(() => fromParam(params.get("s")));
  const [wood, setWood] = useState<"both" | Wood>("both");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        MATCH[f](o.status) &&
        (wood === "both" || o.woods.includes(wood)) &&
        (!t || o.id.toLowerCase().includes(t) || o.name.toLowerCase().includes(t) || o.email.includes(t) || o.phone.includes(t) || o.address.city.toLowerCase().includes(t) || String(fo.get(o.id)) === t),
    );
  }, [orders, f, wood, q, fo]);
  const pages = Math.max(1, Math.ceil(list.length / PER));
  const pg = Math.min(page, pages - 1);
  const rows = list.slice(pg * PER, pg * PER + PER);
  const dr = rows.reduce((s, o) => s + (o.status === "cancelled" ? 0 : o.total), 0);
  const cr = rows.reduce((s, o) => s + o.refunded, 0);
  const counts = (k: Filter) => orders.filter((o) => MATCH[k](o.status)).length;

  const exportCsv = () => {
    const head = "folio,order,date,customer,city,woods,status,total,refunded";
    const body = list.map((o) => [fo.get(o.id), o.id, new Date(o.placedAt).toISOString(), `"${o.name}"`, o.address.city, o.woods.join("+"), o.status, o.total, o.refunded].join(","));
    downloadText(`santalum-orders-${list.length}.csv`, [head, ...body].join("\n"));
  };
  const quick = (o: AdminOrder) => {
    const next = NEXT_STAGE[o.status];
    if (!next) return;
    orderActions.advance(o);
    note(`Folio ${fo.get(o.id)}: ${STATUS[next.to].label.toLowerCase()}`);
  };

  return (
    <div>
      <Head
        kicker="Order book"
        title="Orders"
        aside={
          <button type="button" className="a2-btn" onClick={exportCsv}>
            Copy out (CSV)
          </button>
        }
      >
        <p className="a2-lede">
          {orders.length} entries in the book. {counts("new")} to confirm, {counts("confirmed")} to pack, {counts("packed")} to dispatch.
        </p>
      </Head>

      <div className="a2-tools">
        <Choice
          label="Status"
          value={f}
          onChange={(v) => {
            setF(v);
            setPage(0);
          }}
          items={(Object.keys(MATCH) as Filter[]).map((k) => ({ id: k, label: LABEL[k], n: k === "all" ? undefined : counts(k) }))}
        />
        <div className="a2-tools-row">
          <Choice
            label="Wood"
            value={wood}
            onChange={(v) => {
              setWood(v);
              setPage(0);
            }}
            items={[
              { id: "both", label: "Both woods" },
              { id: "red", label: <WoodMark wood="red" /> },
              { id: "white", label: <WoodMark wood="white" /> },
            ]}
          />
          <input
            type="search"
            className="a2-search"
            data-a2-search
            placeholder="Find by name, city, folio or order no.  ( / )"
            aria-label="Find an order"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(0);
            }}
          />
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty>No entries match. Clear the search or choose All.</Empty>
      ) : (
        <div className="a2-ledger a2-obook" role="table" aria-label="Orders">
          <div className="a2-lrow a2-lhead" role="row">
            <span role="columnheader">Fo.</span>
            <span role="columnheader">Date</span>
            <span role="columnheader">Particulars</span>
            <span role="columnheader">Mark</span>
            <span role="columnheader" className="a2-r">Dr.</span>
            <span role="columnheader" className="a2-r">Cr.</span>
            <span role="columnheader">
              <span className="a2-sr">Next step</span>
            </span>
          </div>
          {rows.map((o) => (
            <div key={o.id} className="a2-lrow" role="row" data-void={o.status === "cancelled" || undefined}>
              <span className="a2-folio" role="cell">
                {fo.get(o.id)}
              </span>
              <span className="a2-dim a2-date" role="cell">
                {fmtShort(o.placedAt)}
              </span>
              <Link href={`${BASE}/orders/${o.id}`} className="a2-part" role="cell">
                {o.name}
                <small>
                  {o.id} · {o.address.city} · {o.woods.map((w) => <WoodMark key={w} wood={w} />)}
                </small>
              </Link>
              <span role="cell" className="a2-mark">
                <StatusStamp o={o} size="sm" />
              </span>
              <span className="a2-r a2-dr" role="cell">
                <Fig n={o.status === "cancelled" ? 0 : o.total} blank />
              </span>
              <span className="a2-r a2-crc" role="cell">
                <Fig n={o.refunded} cr blank />
              </span>
              <span role="cell" className="a2-act">
                {SHORT[o.status] ? (
                  <button type="button" className="a2-btn" data-size="sm" onClick={() => quick(o)}>
                    {SHORT[o.status]}
                  </button>
                ) : null}
              </span>
            </div>
          ))}
          <div className="a2-lrow a2-ltotal" role="row">
            <span />
            <span />
            <span>Carried forward, this page</span>
            <span />
            <span className="a2-r">
              <span className="a2-fig a2-dbl">{formatINR(dr)}</span>
            </span>
            <span className="a2-r">
              <span className="a2-fig a2-dbl a2-cr">{formatINR(cr)}</span>
            </span>
            <span />
          </div>
        </div>
      )}
      <Pages page={pg} pages={pages} onPage={setPage} />
    </div>
  );
}
