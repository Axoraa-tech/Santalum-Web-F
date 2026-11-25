"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { fmtNum, fmtTime, formatINR, inrCompact, pct } from "../../_data/format";
import { DAY, startOfDay, stockKey } from "../../_data/mock";
import { stockState, useMock, useNow, useOrders, useProducts, useReviews, useStock } from "../../_data/store";
import type { AdminOrder } from "../../_data/types";
import { BASE, Box, Head, Led, Spark, StatusLed, useListKeys, Woods } from "./kit";

const live = (o: AdminOrder) => o.status !== "cancelled";

export function Dashboard() {
  const now = useNow();
  const orders = useOrders();
  const mock = useMock();
  const stock = useStock();
  const products = useProducts();
  const { reviews, questions } = useReviews();
  const router = useRouter();

  const d = useMemo(() => {
    const today = startOfDay(now);
    const days = 30;
    const byDay = Array.from({ length: days }, (_, i) => ({ day: today - (days - 1 - i) * DAY, red: 0, white: 0, n: 0 }));
    for (const o of orders) {
      if (!live(o)) continue;
      const idx = Math.floor((o.placedAt - byDay[0].day) / DAY);
      if (idx < 0 || idx >= days) continue;
      byDay[idx].n++;
      for (const l of o.lines) byDay[idx][l.wood] += l.unitPrice * l.qty;
    }
    const rev = byDay.map((x) => x.red + x.white);
    const sum = (a: number[]) => a.reduce((s, v) => s + v, 0);
    const traffic = mock.traffic.slice(-30).map((t) => t.sessions);
    const orders30 = sum(byDay.map((x) => x.n));
    const rev30 = sum(rev);
    const prevWin = orders.filter((o) => live(o) && o.placedAt >= today - 59 * DAY && o.placedAt < today - 29 * DAY);
    const prevRev = prevWin.reduce((s, o) => s + o.total, 0);
    const queue = orders.filter((o) => ["new", "confirmed", "packed", "return-requested"].includes(o.status)).sort((a, b) => a.placedAt - b.placedAt);
    const skus = products.flatMap((p) => p.options.map((o) => ({ p, o, k: stockKey(p.slug, o.id) })));
    const states = skus.map((s) => stockState(stock.levels[s.k] ?? s.o.stock, stock.thresholds[s.k] ?? 5));
    const top = new Map<string, { name: string; wood: "red" | "white"; rev: number; qty: number }>();
    for (const o of orders) {
      if (!live(o) || o.placedAt < today - 29 * DAY) continue;
      for (const l of o.lines) {
        const t = top.get(l.slug) ?? { name: l.name, wood: l.wood, rev: 0, qty: 0 };
        t.rev += l.unitPrice * l.qty;
        t.qty += l.qty;
        top.set(l.slug, t);
      }
    }
    return {
      byDay,
      rev,
      traffic,
      revToday: rev[days - 1],
      nToday: byDay[days - 1].n,
      rev30,
      orders30,
      revDelta: prevRev ? rev30 / prevRev - 1 : null,
      aov: orders30 ? Math.round(rev30 / orders30) : 0,
      conv: sum(traffic) ? orders30 / sum(traffic) : 0,
      red30: sum(byDay.map((x) => x.red)),
      white30: sum(byDay.map((x) => x.white)),
      queue,
      low: states.filter((s) => s === "low").length,
      out: states.filter((s) => s === "out").length,
      top: [...top.entries()].sort((a, b) => b[1].rev - a[1].rev).slice(0, 8),
    };
  }, [now, orders, mock, stock, products]);

  const log = useMemo(() => {
    const lines: { at: number; tag: string; ref: string; href?: string; text: string; by?: string }[] = [];
    for (const o of orders) for (const e of o.timeline) if (e.at > now - 7 * DAY) lines.push({ at: e.at, tag: e.kind, ref: o.id, href: `${BASE}/orders/${o.id}`, text: e.text, by: e.by });
    for (const s of stock.log) lines.push({ at: s.at, tag: "stock", ref: s.key.split("::")[0], text: `${s.delta > 0 ? "+" : ""}${s.delta} · ${s.reason}`, by: s.by });
    for (const r of reviews) if (r.state === "pending") lines.push({ at: r.at, tag: "review", ref: `${r.rating}★`, href: `${BASE}/reviews`, text: `${r.author}: ${r.title}` });
    for (const q of questions) if (!q.answer) lines.push({ at: q.at, tag: "ask", ref: q.slug, href: `${BASE}/reviews`, text: q.body });
    return lines.sort((a, b) => b.at - a.at).slice(0, 80);
  }, [orders, stock.log, reviews, questions, now]);

  const [cursor, setCursor] = useState(0);
  const qref = useListKeys(Math.min(d.queue.length, 14), { cursor, setCursor, onOpen: (i) => router.push(`${BASE}/orders/${d.queue[i].id}`) });

  const pending = reviews.filter((r) => r.state === "pending").length;
  const openQ = questions.filter((x) => !x.answer).length;
  const toShip = d.queue.filter((o) => o.status !== "return-requested");

  return (
    <div className="a3-page">
      <Head path="~/" title="console" meta={`${fmtNum(orders.length)} orders on file · last 30 days unless noted`} />

      <div className="a3-tickers">
        <Ticker label="rev.today" value={formatINR(d.revToday)} spark={d.rev.slice(-14)} sub={`${d.nToday} orders`} />
        <Ticker label="rev.30d" value={inrCompact(d.rev30)} spark={d.rev} sub={d.revDelta === null ? "no prior" : `${d.revDelta >= 0 ? "▲" : "▼"} ${pct(Math.abs(d.revDelta))} vs prior`} tone={d.revDelta !== null && d.revDelta < 0 ? "red" : "green"} />
        <Ticker label="orders.30d" value={fmtNum(d.orders30)} spark={d.byDay.map((x) => x.n)} sub={`aov ${formatINR(d.aov)}`} />
        <Ticker label="sessions.30d" value={fmtNum(d.traffic.reduce((s, v) => s + v, 0))} spark={d.traffic} sub={`conv ${pct(d.conv, 2)}`} />
        <Ticker label="to.ship" value={String(toShip.length)} sub={`${toShip.filter((o) => o.status === "new").length} new · ${toShip.filter((o) => o.status === "packed").length} packed`} led={toShip.length ? "amber" : "green"} href={`${BASE}/orders`} />
        <Ticker label="stock.alerts" value={`${d.out}/${d.low}`} sub="out / low skus" led={d.out ? "red" : d.low ? "amber" : "green"} href={`${BASE}/inventory`} />
        <Ticker label="moderation" value={`${pending}/${openQ}`} sub="reviews / questions" led={pending + openQ ? "amber" : "green"} href={`${BASE}/reviews`} />
      </div>

      <div className="a3-dash">
        <div className="a3-dash-main">
          <Box title="revenue by wood · 30d" meta={<WoodSplit red={d.red30} white={d.white30} />}>
            <Bars days={d.byDay} />
          </Box>
          <Box title={`queue · ${d.queue.length}`} meta="oldest first · j/k ↵" flush>
            <div ref={qref}>
              <table className="a3-t">
                <thead>
                  <tr>
                    <th>st</th>
                    <th>order</th>
                    <th className="a3-hide-sm">customer</th>
                    <th>wood</th>
                    <th className="r">total</th>
                    <th className="r a3-hide-sm">age</th>
                  </tr>
                </thead>
                <tbody>
                  {d.queue.slice(0, 14).map((o, i) => (
                    <tr key={o.id} data-a3-row={i} data-cur={i === cursor || undefined} onClick={() => router.push(`${BASE}/orders/${o.id}`)}>
                      <td>
                        <StatusLed s={o.status} />
                      </td>
                      <td className="a3-mono">
                        <Link href={`${BASE}/orders/${o.id}`}>{o.id}</Link>
                      </td>
                      <td className="a3-hide-sm">{o.name}</td>
                      <td>
                        <Woods ws={o.woods} />
                      </td>
                      <td className="r a3-mono">{formatINR(o.total)}</td>
                      <td className="r a3-mono a3-dim a3-hide-sm">{age(now - o.placedAt)}</td>
                    </tr>
                  ))}
                  {d.queue.length === 0 && (
                    <tr>
                      <td colSpan={6} className="a3-dim">
                        queue empty
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Box>
          <Box title="top pieces · 30d" flush>
            <table className="a3-t">
              <tbody>
                {d.top.map(([slug, t], i) => (
                  <tr key={slug}>
                    <td className="a3-dim a3-mono">{String(i + 1).padStart(2, "0")}</td>
                    <td>
                      <Link href={`${BASE}/products/${slug}`}>{t.name}</Link>
                    </td>
                    <td>
                      <Woods ws={[t.wood]} />
                    </td>
                    <td className="r a3-mono a3-dim">{t.qty}×</td>
                    <td className="r a3-mono">{formatINR(t.rev)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>
        </div>
        <Box
          title={
            <>
              <Led tone="green" pulse /> tail -f events
            </>
          }
          meta={`${log.length} lines · 7d`}
          flush
        >
          <ol className="a3-log">
            {log.map((l, i) => (
              <li key={i}>
                <time className="a3-dim">{now - l.at < DAY ? fmtTime(l.at) : new Date(l.at).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}</time>
                <span className="a3-log-tag" data-t={l.tag}>
                  {l.tag}
                </span>
                {l.href ? (
                  <Link href={l.href} className="a3-log-ref">
                    {l.ref}
                  </Link>
                ) : (
                  <span className="a3-log-ref">{l.ref}</span>
                )}
                <span className="a3-log-text">
                  {l.text}
                  {l.by && <span className="a3-dim"> ({l.by})</span>}
                </span>
              </li>
            ))}
          </ol>
        </Box>
      </div>
    </div>
  );
}

function age(ms: number) {
  const h = Math.floor(ms / 3_600_000);
  return h < 24 ? `${h}h` : `${Math.floor(h / 24)}d${h % 24 ? ` ${h % 24}h` : ""}`;
}

function Ticker({ label, value, sub, spark, tone = "amber", led, href }: { label: string; value: string; sub: string; spark?: number[]; tone?: string; led?: string; href?: string }) {
  const body = (
    <>
      <span className="a3-tk-l">
        {led && <Led tone={led} pulse={led !== "green"} />}
        {label}
      </span>
      <span className="a3-tk-v">{value}</span>
      <span className="a3-tk-s">{sub}</span>
      {spark && <Spark values={spark} w={112} h={24} tone={tone} />}
    </>
  );
  return href ? (
    <Link href={href} className="a3-tk">
      {body}
    </Link>
  ) : (
    <div className="a3-tk">{body}</div>
  );
}

function WoodSplit({ red, white }: { red: number; white: number }) {
  const t = red + white || 1;
  return (
    <span className="a3-wsplit">
      <span data-w="red">red {inrCompact(red)} · {pct(red / t, 0)}</span>
      <span data-w="white">white {inrCompact(white)} · {pct(white / t, 0)}</span>
    </span>
  );
}

function Bars({ days }: { days: { day: number; red: number; white: number }[] }) {
  const max = Math.max(...days.map((d) => d.red + d.white), 1);
  const W = 600;
  const H = 120;
  const bw = W / days.length;
  return (
    <svg className="a3-bars" viewBox={`0 0 ${W} ${H + 14}`} preserveAspectRatio="none" role="img" aria-label="Daily revenue for 30 days, red and white sandalwood stacked">
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1="0" x2={W} y1={H - g * H} y2={H - g * H} className="a3-grid" />
      ))}
      {days.map((d, i) => {
        const hr = (d.red / max) * H;
        const hw = (d.white / max) * H;
        return (
          <g key={d.day}>
            <title>{`${new Date(d.day).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}: red ${formatINR(d.red)}, white ${formatINR(d.white)}`}</title>
            <rect x={i * bw + 1} width={bw - 2} y={H - hr} height={hr} fill="#9b3520" />
            <rect x={i * bw + 1} width={bw - 2} y={H - hr - hw} height={hw} fill="#a07330" />
          </g>
        );
      })}
      <text x="0" y={H + 12} className="a3-axis">
        -30d
      </text>
      <text x={W} y={H + 12} textAnchor="end" className="a3-axis">
        today
      </text>
    </svg>
  );
}
