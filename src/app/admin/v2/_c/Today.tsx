"use client";

import Link from "next/link";
import { useMemo } from "react";
import { fmtLong, fmtTime, formatINR } from "../../_data/format";
import { DAY, startOfDay } from "../../_data/mock";
import { useNow, useOrders, useProducts, useReviews } from "../../_data/store";
import type { AdminOrder } from "../../_data/types";
import { BASE, Empty, Fig, folios, Head, Section, WoodMark } from "./kit";

const live = (o: AdminOrder) => o.status !== "cancelled";
/** A void entry is credited back in full; otherwise only what was refunded. */
const credit = (o: AdminOrder) => (o.status === "cancelled" ? Math.max(o.refunded, o.total) : o.refunded);
function woodSplit(list: AdminOrder[]) {
  const s = { red: 0, white: 0 };
  for (const o of list) if (live(o)) for (const l of o.lines) s[l.wood] += l.qty * l.unitPrice;
  return s;
}

/** Today's page: the day's takings as ledger entries, with what waits on the workshop in the margin. */
export function Today() {
  const now = useNow();
  const orders = useOrders();
  const products = useProducts();
  const { reviews, questions } = useReviews();
  const fo = useMemo(() => folios(orders), [orders]);
  const today = startOfDay(now);

  const d = useMemo(() => {
    const todays = orders.filter((o) => o.placedAt >= today).sort((a, b) => a.placedAt - b.placedAt);
    const refunds = orders.filter((o) => o.timeline.some((e) => e.kind === "refund" && e.at >= today));
    const dr = todays.reduce((s, o) => s + o.total, 0);
    const cr = todays.reduce((s, o) => s + credit(o), 0) + refunds.filter((o) => o.placedAt < today).reduce((s, o) => s + o.refunded, 0);
    const yest = orders.filter((o) => live(o) && o.placedAt >= today - DAY && o.placedAt < today);
    const monthStart = new Date(new Date(now).getFullYear(), new Date(now).getMonth(), 1).getTime();
    const month = orders.filter((o) => live(o) && o.placedAt >= monthStart);
    const week = Array.from({ length: 7 }, (_, i) => {
      const from = today - (6 - i) * DAY;
      const list = orders.filter((o) => o.placedAt >= from && o.placedAt < from + DAY);
      const w = woodSplit(list);
      return { from, ...w, total: w.red + w.white, n: list.filter(live).length };
    });
    return {
      todays,
      refunds,
      dr,
      cr,
      split: woodSplit(todays),
      yest: yest.reduce((s, o) => s + o.total - o.refunded, 0),
      month: month.reduce((s, o) => s + o.total - o.refunded, 0),
      monthN: month.length,
      week,
    };
  }, [orders, today, now]);

  const waiting = [
    { n: orders.filter((o) => o.status === "new").length, label: "to confirm", href: `${BASE}/orders?s=new` },
    { n: orders.filter((o) => o.status === "confirmed").length, label: "to pack", href: `${BASE}/orders?s=confirmed` },
    { n: orders.filter((o) => o.status === "packed").length, label: "to dispatch", href: `${BASE}/orders?s=packed` },
    { n: orders.filter((o) => o.status === "return-requested").length, label: "returns asked", href: `${BASE}/orders?s=return-requested` },
    { n: reviews.filter((r) => r.state === "pending").length, label: "reviews to read", href: `${BASE}/reviews` },
    { n: questions.filter((q) => !q.answer).length, label: "questions unanswered", href: `${BASE}/reviews?t=questions` },
    { n: products.filter((p) => p.status !== "archived" && p.stock !== "in").length, label: "pieces low or out", href: `${BASE}/inventory?f=low` },
  ];
  const max = Math.max(1, ...d.week.map((w) => w.total));
  const dayNo = Math.floor((today - new Date(new Date(now).getFullYear(), 0, 1).getTime()) / DAY) + 1;

  return (
    <div className="a2-today">
      <Head kicker={`Today's page · folio ${dayNo}`} title={fmtLong(now)} aside={<p className="a2-takings-big"><span className="a2-f-l">Day&apos;s takings</span><span className="a2-fig a2-dbl">{formatINR(d.dr - d.cr)}</span></p>} />

      <div className="a2-spread">
        <Section title="Entries today" aside={<Link className="a2-link" href={`${BASE}/orders`}>whole order book</Link>}>
          {d.todays.length === 0 ? (
            <Empty>No entries yet today. The first order will be written here.</Empty>
          ) : (
            <div className="a2-ledger a2-tbook" role="table" aria-label="Today's entries">
              <div className="a2-lrow a2-lhead" role="row">
                <span role="columnheader">Fo.</span>
                <span role="columnheader">Time</span>
                <span role="columnheader">Particulars</span>
                <span role="columnheader" className="a2-r">Dr.</span>
                <span role="columnheader" className="a2-r">Cr.</span>
              </div>
              {d.todays.map((o) => (
                <Link key={o.id} href={`${BASE}/orders/${o.id}`} className="a2-lrow" role="row" data-void={o.status === "cancelled" || undefined}>
                  <span className="a2-folio">{fo.get(o.id)}</span>
                  <span className="a2-dim">{fmtTime(o.placedAt)}</span>
                  <span className="a2-part">
                    {o.name}
                    <small>
                      {o.lines.length} {o.lines.length === 1 ? "piece" : "pieces"} · {o.woods.map((w) => <WoodMark key={w} wood={w} />)}
                    </small>
                  </span>
                  <span className="a2-r"><Fig n={o.total} /></span>
                  <span className="a2-r"><Fig n={credit(o)} cr blank /></span>
                </Link>
              ))}
              {d.refunds
                .filter((o) => o.placedAt < today)
                .map((o) => (
                  <Link key={"r" + o.id} href={`${BASE}/orders/${o.id}`} className="a2-lrow" role="row">
                    <span className="a2-folio">{fo.get(o.id)}</span>
                    <span className="a2-dim">refund</span>
                    <span className="a2-part">{o.name}</span>
                    <span className="a2-r"><Fig n={0} blank /></span>
                    <span className="a2-r"><Fig n={o.refunded} cr /></span>
                  </Link>
                ))}
              <div className="a2-lrow a2-ltotal" role="row">
                <span />
                <span />
                <span>Totals</span>
                <span className="a2-r"><span className="a2-fig a2-sgl">{formatINR(d.dr)}</span></span>
                <span className="a2-r"><span className="a2-fig a2-sgl a2-cr">{formatINR(d.cr)}</span></span>
              </div>
              <div className="a2-lrow a2-ltotal" role="row">
                <span />
                <span />
                <span>Balance, in hand</span>
                <span className="a2-r"><span className="a2-fig a2-dbl">{formatINR(d.dr - d.cr)}</span></span>
                <span />
              </div>
            </div>
          )}
          <p className="a2-split">
            <WoodMark wood="red" /> <Fig n={d.split.red} />
            <span className="a2-sep">·</span>
            <WoodMark wood="white" /> <Fig n={d.split.white} />
          </p>
        </Section>

        <aside className="a2-margin-notes">
          <Section title="Waiting on the workshop">
            <ul className="a2-todo">
              {waiting.map((w) => (
                <li key={w.label} data-zero={w.n === 0 || undefined}>
                  <Link href={w.href}>
                    <b className="a2-fig">{w.n}</b> {w.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Section>
          <Section title="Brought forward">
            <dl className="a2-bf">
              <dt>Yesterday</dt>
              <dd><Fig n={d.yest} /></dd>
              <dt>This month, {d.monthN} orders</dt>
              <dd><span className="a2-fig a2-dbl">{formatINR(d.month)}</span></dd>
            </dl>
          </Section>
          
        </aside>
      </div>

      <Section title="The week, by wood">
        <div className="a2-week" role="table" aria-label="Takings for the last seven days">
          {d.week.map((w, i) => (
            <div key={w.from} className="a2-week-row" role="row" data-today={i === 6 || undefined}>
              <span role="cell" className="a2-week-day">{new Date(w.from).toLocaleDateString("en-IN", { weekday: "short", day: "numeric" })}</span>
              <span role="cell" className="a2-week-bar" aria-hidden>
                <i data-wood="red" style={{ width: `${(w.red / max) * 100}%` }} />
                <i data-wood="white" style={{ width: `${(w.white / max) * 100}%` }} />
              </span>
              <span role="cell" className="a2-r a2-dim a2-hide-sm">{w.n} orders</span>
              <span role="cell" className="a2-r"><Fig n={w.total} /></span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
