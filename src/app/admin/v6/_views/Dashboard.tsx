"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { fmtDateTime, fmtNum, fmtShort, formatINR, inrCompact, pct } from "../../_data/format";
import { DAY, startOfDay } from "../../_data/mock";
import { useMock, useNow, useOrders, useProducts, useReviews } from "../../_data/store";
import type { AdminOrder } from "../../_data/types";
import { BASE, Block, Delta, Fig, Head, LineChart, RED, Split, Status, Tabs, WHITE, WoodMark, Woods } from "../_ui/kit";

type Period = "7" | "30" | "90";
const live = (o: AdminOrder) => o.status !== "cancelled";
const net = (o: AdminOrder) => o.total - o.refunded;

export function Dashboard() {
  const now = useNow();
  const orders = useOrders();
  const products = useProducts();
  const { reviews, questions } = useReviews();
  const mock = useMock();
  const [period, setPeriod] = useState<Period>("30");
  const days = Number(period);

  const r = useMemo(() => {
    const today = startOfDay(now);
    const from = today - (days - 1) * DAY;
    const prevFrom = from - days * DAY;
    const cur = orders.filter((o) => o.placedAt >= from && live(o));
    const prev = orders.filter((o) => o.placedAt >= prevFrom && o.placedAt < from && live(o));
    const sum = (l: AdminOrder[]) => l.reduce((s, o) => s + net(o), 0);
    const sessions = (a: number, b: number) => mock.traffic.filter((t) => t.day >= a && t.day < b).reduce((s, t) => s + t.sessions, 0);
    const sCur = sessions(from, today + DAY);
    const sPrev = sessions(prevFrom, from);

    const total = Array(days).fill(0) as number[];
    const red = Array(days).fill(0) as number[];
    const white = Array(days).fill(0) as number[];
    const byProduct = new Map<string, { slug: string; name: string; wood: "red" | "white"; units: number; value: number }>();
    for (const o of cur) {
      const i = Math.min(days - 1, Math.floor((startOfDay(o.placedAt) - from) / DAY));
      total[i] += net(o);
      for (const l of o.lines) {
        const v = l.unitPrice * l.qty;
        (l.wood === "red" ? red : white)[i] += v;
        const x = byProduct.get(l.slug) ?? { slug: l.slug, name: l.name, wood: l.wood, units: 0, value: 0 };
        x.units += l.qty;
        x.value += v;
        byProduct.set(l.slug, x);
      }
    }
    const xLabels = [0, 0.25, 0.5, 0.75, 1].map((f) => fmtShort(from + Math.round(f * (days - 1)) * DAY));
    const redSum = red.reduce((a, b) => a + b, 0);
    const whiteSum = white.reduce((a, b) => a + b, 0);
    return {
      revenue: sum(cur),
      prevRevenue: sum(prev),
      count: cur.length,
      prevCount: prev.length,
      aov: cur.length ? sum(cur) / cur.length : 0,
      prevAov: prev.length ? sum(prev) / prev.length : 0,
      conv: sCur ? cur.length / sCur : 0,
      prevConv: sPrev ? prev.length / sPrev : 0,
      sessions: sCur,
      total,
      red,
      white,
      redSum,
      whiteSum,
      redOrders: cur.filter((o) => o.woods.includes("red")).length,
      whiteOrders: cur.filter((o) => o.woods.includes("white")).length,
      xLabels,
      top: [...byProduct.values()].sort((a, b) => b.value - a.value).slice(0, 6),
    };
  }, [orders, mock, now, days]);

  const todo = [
    { n: orders.filter((o) => o.status === "new").length, label: "orders to confirm", href: `${BASE}/orders?status=new` },
    { n: orders.filter((o) => o.status === "confirmed").length, label: "orders to pack", href: `${BASE}/orders?status=confirmed` },
    { n: orders.filter((o) => o.status === "packed").length, label: "parcels to hand to the courier", href: `${BASE}/orders?status=packed` },
    { n: orders.filter((o) => o.status === "return-requested").length, label: "returns to decide", href: `${BASE}/orders?status=return-requested` },
    { n: reviews.filter((x) => x.state === "pending").length, label: "reviews to moderate", href: `${BASE}/reviews` },
    { n: questions.filter((q) => !q.answer).length, label: "questions to answer", href: `${BASE}/reviews?tab=questions` },
    { n: products.filter((p) => p.status === "active" && p.stock !== "in").length, label: "products low or out of stock", href: `${BASE}/inventory?show=low` },
  ];
  const lowStock = products.filter((p) => p.status === "active" && p.stock !== "in").slice(0, 5);
  const recent = orders.slice(0, 6);

  return (
    <>
      <Head
        no="01"
        title="Overview"
        lede={`The shop in figures for the last ${days} days, compared with the ${days} days before. Net of refunds; cancelled orders are left out.`}
        actions={<Tabs label="Period" value={period} onChange={setPeriod} items={[{ id: "7", label: "7 days" }, { id: "30", label: "30 days" }, { id: "90", label: "90 days" }]} />}
      />

      <div className="a6-grid a6-kpis">
        <Fig accent label="Net revenue" value={inrCompact(r.revenue)} sub={<Delta now={r.revenue} prev={r.prevRevenue} />} />
        <Fig label="Orders" value={fmtNum(r.count)} sub={<Delta now={r.count} prev={r.prevCount} />} />
        <Fig label="Average order" value={inrCompact(r.aov)} sub={<Delta now={r.aov} prev={r.prevAov} />} />
        <Fig label="Conversion" value={pct(r.conv)} sub={<>{fmtNum(r.sessions)} sessions · <Delta now={r.conv} prev={r.prevConv} /></>} />
      </div>

      <div className="a6-grid">
        <Block label="Revenue by day" no="1.1" className="a6-span-8">
          <LineChart
            format={inrCompact}
            xLabels={r.xLabels}
            series={[
              { label: "All orders", color: "#1c1410", values: r.total, dash: true },
              { label: "Red sandalwood", color: RED, values: r.red },
              { label: "White sandalwood", color: WHITE, values: r.white },
            ]}
          />
        </Block>
        <Block label="By wood" no="1.2" className="a6-span-4">
          <Split parts={[{ label: "Red", value: r.redSum, color: RED }, { label: "White", value: r.whiteSum, color: WHITE }]} />
          <dl className="a6-woodfig">
            <div>
              <dt>
                <WoodMark wood="red" />
              </dt>
              <dd className="a6-figure" style={{ color: RED }}>
                {inrCompact(r.redSum)}
              </dd>
              <dd className="a6-muted">
                {pct(r.redSum / (r.redSum + r.whiteSum || 1), 0)} of goods · {r.redOrders} orders
              </dd>
            </div>
            <div>
              <dt>
                <WoodMark wood="white" />
              </dt>
              <dd className="a6-figure" style={{ color: WHITE }}>
                {inrCompact(r.whiteSum)}
              </dd>
              <dd className="a6-muted">
                {pct(r.whiteSum / (r.redSum + r.whiteSum || 1), 0)} of goods · {r.whiteOrders} orders
              </dd>
            </div>
          </dl>
        </Block>
      </div>

      <div className="a6-grid">
        <Block label="To act on today" no="1.3" className="a6-span-4">
          <ol className="a6-todo">
            {todo.map((t) => (
              <li key={t.label} data-zero={t.n === 0 || undefined}>
                <Link href={t.href}>
                  <span className="a6-figure">{t.n}</span>
                  <span>{t.label}</span>
                  <span aria-hidden>→</span>
                </Link>
              </li>
            ))}
          </ol>
        </Block>
        <Block label="Best sellers" no="1.4" className="a6-span-8" aside={<span className="a6-muted">by goods value, {days} days</span>}>
          <table className="a6-table">
            <thead>
              <tr>
                <th className="a6-col-n">No.</th>
                <th>Product</th>
                <th className="a6-hide-sm">Wood</th>
                <th className="a6-r">Units</th>
                <th className="a6-r">Value</th>
              </tr>
            </thead>
            <tbody>
              {r.top.map((p, i) => (
                <tr key={p.slug}>
                  <td className="a6-col-n a6-num">{String(i + 1).padStart(2, "0")}</td>
                  <td>
                    <Link className="a6-rowlink" href={`${BASE}/products/${p.slug}`}>
                      {p.name}
                    </Link>
                  </td>
                  <td className="a6-hide-sm">
                    <WoodMark wood={p.wood} />
                  </td>
                  <td className="a6-r a6-num">{p.units}</td>
                  <td className="a6-r a6-num">{formatINR(p.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Block>
      </div>

      <div className="a6-grid">
        <Block label="Latest orders" no="1.5" className="a6-span-8" aside={<Link href={`${BASE}/orders`} className="a6-link">All orders →</Link>}>
          <table className="a6-table">
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link className="a6-rowlink a6-num" href={`${BASE}/orders/${o.id}`}>
                      {o.id}
                    </Link>
                    <div className="a6-muted">{fmtDateTime(o.placedAt)}</div>
                  </td>
                  <td className="a6-hide-sm">
                    {o.name}
                    <div className="a6-muted">{o.address.city}</div>
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
        </Block>
        <Block label="Stock to reorder" no="1.6" className="a6-span-4" aside={<Link href={`${BASE}/inventory?show=low`} className="a6-link">Inventory →</Link>}>
          {lowStock.length ? (
            <ul className="a6-list">
              {lowStock.map((p) => (
                <li key={p.slug}>
                  <Link href={`${BASE}/products/${p.slug}`} className="a6-rowlink">
                    {p.name}
                  </Link>
                  <span className="a6-num" data-bad={p.stock === "out" || undefined}>
                    {p.stock === "out" ? "Out" : `${p.stockTotal} left`}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="a6-muted">Every active product is above its reorder level.</p>
          )}
        </Block>
      </div>
    </>
  );
}
