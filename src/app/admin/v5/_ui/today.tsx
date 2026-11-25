"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { DAY, startOfDay } from "../../_data/mock";
import { fmtLong, fmtShort } from "../../_data/format";
import { useNow, useOrders, useProducts, useSession } from "../../_data/store";
import type { AdminOrder } from "../../_data/types";
import { I } from "./icons";
import { BASE, Card, Head, Money, Thumb, WoodDot } from "./kit";
import { OrderCard } from "./orders";
import { Split, useCounts } from "./shell";

const live = (o: AdminOrder) => o.status !== "cancelled";
const net = (o: AdminOrder) => o.total - o.refunded;

/** Sales by day and wood, for the last n days. Line values carry the wood; shipping and discounts are spread by share. */
function byDay(orders: AdminOrder[], now: number, days: number) {
  const today = startOfDay(now);
  const rows = Array.from({ length: days }, (_, i) => ({ day: today - (days - 1 - i) * DAY, red: 0, white: 0 }));
  for (const o of orders) {
    if (!live(o)) continue;
    const i = Math.floor((startOfDay(o.placedAt) - rows[0].day) / DAY + 0.5);
    if (i < 0 || i >= days) continue;
    const gross = o.lines.reduce((s, l) => s + l.unitPrice * l.qty, 0) || 1;
    for (const l of o.lines) rows[i][l.wood] += (net(o) * l.unitPrice * l.qty) / gross;
  }
  return rows;
}

export function Today() {
  const now = useNow();
  const orders = useOrders();
  const session = useSession();
  const c = useCounts();
  const [open, setOpen] = useState(false);

  const t = useMemo(() => {
    const d0 = startOfDay(now);
    const today = orders.filter((o) => live(o) && o.placedAt >= d0);
    const yday = orders.filter((o) => live(o) && o.placedAt >= d0 - DAY && o.placedAt < now - DAY);
    const week = orders.filter((o) => live(o) && o.placedAt >= d0 - 6 * DAY);
    return {
      today: today.reduce((s, o) => s + net(o), 0),
      todayN: today.length,
      ydaySameTime: yday.reduce((s, o) => s + net(o), 0),
      week: week.reduce((s, o) => s + net(o), 0),
      weekN: week.length,
      confirm: orders.filter((o) => o.status === "new").length,
      pack: orders.filter((o) => o.status === "confirmed").length,
      ship: orders.filter((o) => o.status === "packed").length,
      cod: orders.filter((o) => o.paymentState === "cod-pending" && o.status === "shipped").reduce((s, o) => s + o.total, 0),
      queue: orders.filter((o) => o.status === "new" || o.status === "confirmed" || o.status === "packed").slice(0, 4),
    };
  }, [orders, now]);
  const spark = useMemo(() => byDay(orders, now, 14), [orders, now]);
  const first = session?.name.split(" ")[0];

  const list = (
    <>
      <Head eyebrow={fmtLong(now)} title="Today" action={<span className="a5-avatar" title={session?.email}>{first?.[0]}</span>} />

      <button type="button" className="a5-hero" onClick={() => setOpen(true)} aria-label="Open the sales report">
        <span className="a5-hero-label">Sales so far today</span>
        <Money v={t.today} size="xl" />
        <span className="a5-hero-sub">
          {t.todayN} {t.todayN === 1 ? "order" : "orders"} · {t.ydaySameTime ? `yesterday by now ` : "nothing by this time yesterday"}
          {t.ydaySameTime ? <Money v={t.ydaySameTime} size="s" /> : null}
        </span>
        <Bars rows={spark} h={56} />
        <span className="a5-hero-foot">
          Last 7 days <Money v={t.week} size="s" /> <I n="chevron" size={16} />
        </span>
      </button>

      <div className="a5-tiles">
        <Tile href={`${BASE}/orders?s=todo&stage=new`} n={t.confirm} label="To confirm" hot={t.confirm > 0} />
        <Tile href={`${BASE}/orders?s=todo&stage=confirmed`} n={t.pack} label="To pack" />
        <Tile href={`${BASE}/orders?s=todo&stage=packed`} n={t.ship} label="To hand over" />
        <Tile href={`${BASE}/orders?s=returns`} n={c.returns} label="Returns asked" hot={c.returns > 0} />
      </div>

      {t.queue.length > 0 && (
        <section className="a5-group">
          <div className="a5-group-head">
            <h2>Up next</h2>
            <Link href={`${BASE}/orders?s=todo`}>All</Link>
          </div>
          <p className="a5-hint">Swipe a card left to move it on, or to call.</p>
          <div className="a5-stack">
            {t.queue.map((o) => (
              <OrderCard key={o.id} o={o} now={now} />
            ))}
          </div>
        </section>
      )}

      <section className="a5-group">
        <div className="a5-group-head">
          <h2>Waiting on you</h2>
        </div>
        <div className="a5-list">
          <Row href={`${BASE}/inventory`} icon="stock" label="Low or out of stock" n={c.stock} />
          <Row href={`${BASE}/reviews`} icon="star" label="Reviews to read" n={c.reviews} />
          <Row href={`${BASE}/reviews?tab=questions`} icon="chat" label="Questions to answer" n={c.questions} />
          {t.cod > 0 && <Row href={`${BASE}/orders?s=shipping`} icon="truck" label="Cash to collect on the road" money={t.cod} />}
        </div>
      </section>
    </>
  );

  return <Split list={list} open={open} onClose={() => setOpen(false)} detail={<Report />} idle={<Report />} />;
}

function Tile({ href, n, label, hot }: { href: string; n: number; label: string; hot?: boolean }) {
  return (
    <Link href={href} className="a5-tile" data-hot={hot ? "" : undefined}>
      <span className="a5-tile-n">{n}</span>
      <span className="a5-tile-l">{label}</span>
    </Link>
  );
}

function Row({ href, icon, label, n, money }: { href: string; icon: "stock" | "star" | "chat" | "truck"; label: string; n?: number; money?: number }) {
  return (
    <Link href={href} className="a5-row">
      <span className="a5-row-ic">
        <I n={icon} size={20} />
      </span>
      <span className="a5-row-main">{label}</span>
      {money != null ? <Money v={money} size="s" /> : <span className="a5-count" data-zero={n ? undefined : ""}>{n}</span>}
      <I n="chevron" size={18} className="a5-dim" />
    </Link>
  );
}

export function Bars({ rows, h = 120, axis }: { rows: { day: number; red: number; white: number }[]; h?: number; axis?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.red + r.white));
  const w = 100 / rows.length;
  return (
    <div className="a5-bars">
      <svg viewBox={`0 0 100 ${h}`} preserveAspectRatio="none" width="100%" height={h} aria-hidden>
        {rows.map((r, i) => {
          const hr = (r.red / max) * (h - 2);
          const hw = (r.white / max) * (h - 2);
          return (
            <g key={r.day}>
              <rect x={i * w + w * 0.18} width={w * 0.64} y={h - hr} height={hr} fill="#9b3520" rx={0.6} />
              <rect x={i * w + w * 0.18} width={w * 0.64} y={h - hr - hw - (hw && hr ? 1 : 0)} height={hw} fill="#a07330" rx={0.6} />
            </g>
          );
        })}
      </svg>
      {axis && (
        <div className="a5-bars-axis">
          <span>{fmtShort(rows[0].day)}</span>
          <span>{fmtShort(rows[rows.length - 1].day)}</span>
        </div>
      )}
    </div>
  );
}

/** The detail behind the sales tile: 30 days by wood, and what sold. */
function Report() {
  const now = useNow();
  const orders = useOrders();
  const products = useProducts();
  const [days, setDays] = useState(30);
  const rows = useMemo(() => byDay(orders, now, days), [orders, now, days]);
  const red = rows.reduce((s, r) => s + r.red, 0);
  const white = rows.reduce((s, r) => s + r.white, 0);
  const from = startOfDay(now) - (days - 1) * DAY;
  const inRange = orders.filter((o) => live(o) && o.placedAt >= from);
  const top = useMemo(() => {
    const m = new Map<string, { slug: string; name: string; wood: AdminOrder["woods"][number]; photo: string; qty: number; value: number }>();
    for (const o of inRange)
      for (const l of o.lines) {
        const x = m.get(l.slug) ?? { slug: l.slug, name: l.name, wood: l.wood, photo: l.photoId, qty: 0, value: 0 };
        x.qty += l.qty;
        x.value += l.qty * l.unitPrice;
        m.set(l.slug, x);
      }
    return [...m.values()].sort((a, b) => b.value - a.value).slice(0, 6);
  }, [inRange]);
  const total = red + white;
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Sales report</div>
      <div className="a5-detail-top">
        <Money v={total} size="xl" />
        <div className="a5-seg-wrap">
          {[7, 30, 90].map((d) => (
            <button key={d} type="button" className="a5-pill" aria-pressed={days === d} onClick={() => setDays(d)}>
              {d} days
            </button>
          ))}
        </div>
      </div>
      <p className="a5-muted">
        {inRange.length} orders, average <Money v={inRange.length ? total / inRange.length : 0} size="s" />. Net of refunds; cancelled orders left out.
      </p>
      <Card>
        <Bars rows={rows} h={160} axis />
        <div className="a5-split-bar" aria-hidden>
          <span style={{ flex: red || 1, background: "#9b3520" }} />
          <span style={{ flex: white || 0, background: "#a07330" }} />
        </div>
        <div className="a5-legend">
          <div>
            <WoodDot w="red" label />
            <Money v={red} size="l" />
            <small>{total ? Math.round((red / total) * 100) : 0}%</small>
          </div>
          <div>
            <WoodDot w="white" label />
            <Money v={white} size="l" />
            <small>{total ? Math.round((white / total) * 100) : 0}%</small>
          </div>
        </div>
      </Card>
      <Card title="What sold" flush>
        <div className="a5-list a5-list-flat">
          {top.map((p) => (
            <Link key={p.slug} href={`${BASE}/products/${p.slug}`} className="a5-row">
              <Thumb id={p.photo} wood={p.wood} size={44} />
              <span className="a5-row-main">
                {p.name}
                <small>
                  {p.qty} sold · {products.find((x) => x.slug === p.slug)?.stockTotal ?? 0} left
                </small>
              </span>
              <Money v={p.value} size="s" />
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
