"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import type { Wood } from "@/lib/shop/products";
import { fmtDateTime, formatINR, PAYMENT_STATE, STATUS, timeAgo } from "../../_data/format";
import { NEXT_STAGE, orderActions, useNow, useOrders } from "../../_data/store";
import type { AdminOrder, AdminStatus } from "../../_data/types";
import { BASE, Chips, Empty, Head, Icon, Pinned, Stage, toneOf, Woods, say } from "./kit";

const COLUMNS: { id: AdminStatus; label: string; note: string }[] = [
  { id: "new", label: "New", note: "Placed, not yet checked" },
  { id: "confirmed", label: "Confirmed", note: "Matched to batch records" },
  { id: "packed", label: "Packed", note: "In linen, waiting for the courier" },
  { id: "shipped", label: "Shipped", note: "With the courier" },
  { id: "delivered", label: "Delivered", note: "Last 14 days" },
];
const OFF_BOARD: AdminStatus[] = ["return-requested", "cancelled", "returned"];

type WoodFilter = "all" | Wood;

export function Orders() {
  const params = useSearchParams();
  const router = useRouter();
  const view = params.get("view") === "list" ? "list" : "board";
  const orders = useOrders();
  const [wood, setWood] = useState<WoodFilter>("all");
  const [q, setQ] = useState("");

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders.filter((o) => (wood === "all" || o.woods.includes(wood)) && (!s || `${o.id} ${o.name} ${o.email} ${o.phone} ${o.address.city}`.toLowerCase().includes(s)));
  }, [orders, wood, q]);

  return (
    <div className="a4-page a4-page-wide">
      <Head kicker="Fulfilment" title={view === "board" ? "Order board" : "All orders"} sub={view === "board" ? "Drag a card to the next column, or use its button. One stage at a time." : `${shown.length} orders, newest first.`}>
        <div className="a4-seg" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "board"} onClick={() => router.replace(`${BASE}/orders`)}>
            <Icon name="board" size={16} /> Board
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => router.replace(`${BASE}/orders?view=list`)}>
            <Icon name="list" size={16} /> List
          </button>
        </div>
      </Head>
      <div className="a4-toolbar">
        <input type="search" className="a4-search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order, name, phone or city" aria-label="Search orders" />
        <Chips
          label="Wood"
          value={wood}
          onChange={setWood}
          items={[
            { id: "all", label: "Both woods" },
            { id: "red", label: "Red" },
            { id: "white", label: "White" },
          ]}
        />
      </div>
      {view === "board" ? <Board orders={shown} /> : <OrderList orders={shown} />}
    </div>
  );
}

/* ---------- board ---------- */
type Lift = { o: AdminOrder; x: number; y: number; ox: number; oy: number; w: number; moved: boolean; over: string | null };

function colAt(x: number, y: number) {
  const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-col]");
  return el?.dataset.col ?? null;
}

function Board({ orders }: { orders: AdminOrder[] }) {
  const now = useNow();
  const lift = useRef<Lift | null>(null);
  const [drag, setDrag] = useState<Lift | null>(null);

  const cols = useMemo(() => {
    const m = new Map<AdminStatus, AdminOrder[]>();
    for (const c of COLUMNS) m.set(c.id, []);
    for (const o of orders) {
      if (o.status === "delivered" && now - o.placedAt > 14 * 86_400_000) continue;
      m.get(o.status)?.push(o);
    }
    for (const [k, list] of m) list.sort((a, b) => (k === "delivered" ? b.placedAt - a.placedAt : a.placedAt - b.placedAt));
    return m;
  }, [orders, now]);
  const off = useMemo(() => orders.filter((o) => OFF_BOARD.includes(o.status)).slice(0, 12), [orders]);

  const move = (o: AdminOrder, to: string | null) => {
    if (!to || to === o.status) return;
    const next = NEXT_STAGE[o.status];
    if (next && next.to === to) {
      orderActions.advance(o);
      say(`${o.id} moved to ${STATUS[next.to].label}`);
    } else {
      say("Cards move one stage at a time");
    }
  };

  const onDown = (e: RPointerEvent<HTMLElement>, o: AdminOrder) => {
    if (e.button !== 0 || !NEXT_STAGE[o.status]) return;
    const t = e.target as HTMLElement;
    if (t.closest("a, button, input")) return;
    if (e.pointerType !== "mouse" && !t.closest(".a4-grip")) return;
    const r = e.currentTarget.getBoundingClientRect();
    lift.current = { o, x: e.clientX, y: e.clientY, ox: e.clientX - r.left, oy: e.clientY - r.top, w: r.width, moved: false, over: null };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e: RPointerEvent<HTMLElement>) => {
    const l = lift.current;
    if (!l) return;
    if (!l.moved && Math.hypot(e.clientX - l.x, e.clientY - l.y) < 6) return;
    e.preventDefault();
    l.moved = true;
    l.over = colAt(e.clientX, e.clientY);
    setDrag({ ...l, x: e.clientX, y: e.clientY });
  };
  const onUp = (e: RPointerEvent<HTMLElement>) => {
    const l = lift.current;
    lift.current = null;
    setDrag(null);
    if (l?.moved) move(l.o, colAt(e.clientX, e.clientY));
  };
  const onCancel = () => {
    lift.current = null;
    setDrag(null);
  };

  const target = drag ? NEXT_STAGE[drag.o.status]?.to : undefined;

  return (
    <>
      <div className="a4-board" data-dragging={drag ? "" : undefined}>
        {COLUMNS.map((c) => {
          const list = cols.get(c.id) ?? [];
          return (
            <section key={c.id} className="a4-col" data-col={c.id} data-target={target === c.id || undefined} data-over={drag?.over === c.id || undefined} aria-label={`${c.label}, ${list.length}`}>
              <header className="a4-col-head">
                <h2>{c.label}</h2>
                <span className="a4-col-n">{list.length}</span>
                <p>{c.note}</p>
              </header>
              <ul className="a4-col-cards">
                {list.map((o) => (
                  <li key={o.id}>
                    <Card o={o} now={now} lifted={drag?.o.id === o.id} onDown={onDown} onMove={onMove} onUp={onUp} onCancel={onCancel} onAdvance={() => move(o, NEXT_STAGE[o.status]?.to ?? null)} />
                  </li>
                ))}
                {list.length === 0 && <li className="a4-col-empty">Nothing here</li>}
              </ul>
            </section>
          );
        })}
      </div>

      {off.length > 0 && (
        <section className="a4-offboard" aria-labelledby="a4-off">
          <h2 id="a4-off" className="a4-h2">
            Off the board
          </h2>
          <p className="a4-sub">Returns waiting for a decision, and recent cancellations.</p>
          <ul className="a4-offboard-list">
            {off.map((o) => (
              <li key={o.id} className="a4-paper a4-off-card">
                <Link href={`${BASE}/orders/${o.id}`} className="a4-strong">
                  {o.id}
                </Link>
                <span>{o.name}</span>
                <Stage status={o.status} />
                {o.status === "return-requested" && (
                  <>
                    {o.returnReason && <q className="a4-muted">{o.returnReason}</q>}
                    <button
                      type="button"
                      className="a4-btn a4-btn-sm"
                      onClick={() => {
                        orderActions.approveReturn(o);
                        say(`Return approved for ${o.id}`);
                      }}
                    >
                      Approve return
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {drag?.moved && (
        <div className="a4-ghost" style={{ width: drag.w, transform: `translate(${drag.x - drag.ox}px, ${drag.y - drag.oy}px) rotate(-2deg)` }} aria-hidden="true">
          <CardFace o={drag.o} now={now} />
        </div>
      )}
    </>
  );
}

type CardProps = {
  o: AdminOrder;
  now: number;
  lifted: boolean;
  onDown: (e: RPointerEvent<HTMLElement>, o: AdminOrder) => void;
  onMove: (e: RPointerEvent<HTMLElement>) => void;
  onUp: (e: RPointerEvent<HTMLElement>) => void;
  onCancel: () => void;
  onAdvance: () => void;
};

function Card({ o, now, lifted, onDown, onMove, onUp, onCancel, onAdvance }: CardProps) {
  const next = NEXT_STAGE[o.status];
  return (
    <article
      className="a4-paper a4-card"
      data-lifted={lifted || undefined}
      data-movable={next ? "" : undefined}
      onPointerDown={(e) => onDown(e, o)}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onCancel}
    >
      <CardFace o={o} now={now} />
      {next && (
        <div className="a4-card-foot">
          <span className="a4-grip" aria-hidden="true" title="Drag to the next column">
            <Icon name="grip" size={16} />
          </span>
          <button type="button" className="a4-btn a4-btn-sm" onClick={onAdvance}>
            {next.label}
            <Icon name="arrow" size={14} />
          </button>
        </div>
      )}
    </article>
  );
}

function CardFace({ o, now }: { o: AdminOrder; now: number }) {
  const pieces = o.lines.reduce((s, l) => s + l.qty, 0);
  const aged = (o.status === "new" || o.status === "confirmed") && now - o.placedAt > 86_400_000;
  return (
    <>
      <div className="a4-card-photos">
        {o.lines.slice(0, 3).map((l, i) => (
          <Pinned key={i} photoId={l.photoId} tone={toneOf(l.slug)} size="sm" pin={i === 0} alt={l.name} />
        ))}
        {o.lines.length > 3 && <span className="a4-more">+{o.lines.length - 3}</span>}
      </div>
      <div className="a4-card-top">
        <Link href={`${BASE}/orders/${o.id}`} className="a4-card-id" draggable={false}>
          {o.id}
        </Link>
        <span className="a4-muted" data-aged={aged || undefined}>
          {timeAgo(o.placedAt, now)}
        </span>
      </div>
      <p className="a4-card-name">{o.name}</p>
      <p className="a4-muted a4-card-meta">
        {o.address.city} · {pieces} {pieces === 1 ? "piece" : "pieces"} · {o.delivery === "express" ? "Express" : "Standard"}
      </p>
      <div className="a4-card-row">
        <Woods woods={o.woods} />
        <span className="a4-card-total">{formatINR(o.total)}</span>
      </div>
      {(o.payment === "cod" || o.giftNote) && (
        <p className="a4-card-flags">
          {o.payment === "cod" && <span>{PAYMENT_STATE[o.paymentState]}</span>}
          {o.giftNote && <span>Gift note</span>}
        </p>
      )}
    </>
  );
}

/* ---------- list ---------- */
type StatusFilter = "all" | AdminStatus;
function OrderList({ orders }: { orders: AdminOrder[] }) {
  const [status, setStatus] = useState<StatusFilter>("all");
  const [limit, setLimit] = useState(40);
  const rows = status === "all" ? orders : orders.filter((o) => o.status === status);
  const counts = (s: AdminStatus) => orders.filter((o) => o.status === s).length;

  return (
    <>
      <Chips
        label="Status"
        value={status}
        onChange={(v) => {
          setStatus(v);
          setLimit(40);
        }}
        items={[{ id: "all" as StatusFilter, label: "All", count: orders.length }, ...(Object.keys(STATUS) as AdminStatus[]).map((s) => ({ id: s as StatusFilter, label: STATUS[s].label, count: counts(s) }))]}
      />
      {rows.length === 0 ? (
        <Empty>No orders match.</Empty>
      ) : (
        <div className="a4-paper a4-list">
          <table className="a4-table">
            <thead>
              <tr>
                <th scope="col">Order</th>
                <th scope="col">Placed</th>
                <th scope="col">Customer</th>
                <th scope="col">Pieces</th>
                <th scope="col">Wood</th>
                <th scope="col">Stage</th>
                <th scope="col">Payment</th>
                <th scope="col" className="a4-num">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, limit).map((o) => (
                <tr key={o.id}>
                  <td data-l="Order">
                    <Link href={`${BASE}/orders/${o.id}`} className="a4-strong">
                      {o.id}
                    </Link>
                  </td>
                  <td data-l="Placed" className="a4-muted">
                    {fmtDateTime(o.placedAt)}
                  </td>
                  <td data-l="Customer">
                    {o.name}
                    <span className="a4-muted a4-block">{o.address.city}</span>
                  </td>
                  <td data-l="Pieces">
                    <span className="a4-list-photos">
                      {o.lines.slice(0, 3).map((l, i) => (
                        <Pinned key={i} photoId={l.photoId} tone={toneOf(l.slug)} size="xs" pin={false} alt="" />
                      ))}
                    </span>
                  </td>
                  <td data-l="Wood">
                    <Woods woods={o.woods} />
                  </td>
                  <td data-l="Stage">
                    <Stage status={o.status} />
                  </td>
                  <td data-l="Payment" className="a4-muted">
                    {PAYMENT_STATE[o.paymentState]}
                  </td>
                  <td data-l="Total" className="a4-num a4-strong">
                    {formatINR(o.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {rows.length > limit && (
        <button type="button" className="a4-btn a4-more-btn" onClick={() => setLimit((n) => n + 40)}>
          Show 40 more of {rows.length - limit}
        </button>
      )}
    </>
  );
}
