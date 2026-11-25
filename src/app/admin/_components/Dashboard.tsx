"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CATEGORIES } from "@/lib/shop/products";
import { fmtLong, fmtNum, formatINR, pct, timeAgo } from "../_data/format";
import { DAY, startOfDay, stockKey } from "../_data/mock";
import { useMock, useNow, useOrders, useProducts, useReviews, useSession, useStock, stockState } from "../_data/store";
import type { AdminOrder } from "../_data/types";
import { CategoryBars, RevenueChart, SplitBar, Tally, WOOD_COLOR } from "./charts";
import { Icon } from "./icons";
import { Delta, Empty, PageHead, Panel, Seg, Stars, StatusPill, Thumb, Woods } from "./ui";

type Win = { from: number; to: number };
const live = (o: AdminOrder) => o.status !== "cancelled";
const isReturn = (o: AdminOrder) => o.status === "return-requested" || o.status === "returned";

export function Dashboard() {
  const now = useNow();
  const mock = useMock();
  const orders = useOrders();
  const products = useProducts();
  const stock = useStock();
  const { reviews } = useReviews();
  const session = useSession();
  const [range, setRange] = useState<"30" | "90">("30");

  const today = startOfDay(now);

  const kpis = useMemo(() => {
    const cur: Win = { from: today - 29 * DAY, to: today + DAY };
    const prev: Win = { from: cur.from - 30 * DAY, to: cur.from };
    const calc = (w: Win) => {
      const os = orders.filter((o) => o.placedAt >= w.from && o.placedAt < w.to);
      const ok = os.filter(live);
      const revenue = ok.reduce((s, o) => s + o.total - o.refunded, 0);
      const sessions = mock.traffic.filter((t) => t.day >= w.from && t.day < w.to).reduce((s, t) => s + t.sessions, 0);
      return { revenue, orders: ok.length, aov: ok.length ? revenue / ok.length : 0, conversion: sessions ? ok.length / sessions : 0, returns: ok.length ? os.filter(isReturn).length / ok.length : 0, sessions };
    };
    const a = calc(cur);
    const b = calc(prev);
    const change = (x: number, y: number) => (y ? ((x - y) / y) * 100 : null);
    // ten 3-day buckets across the current window, for the sparklines
    const buckets = Array.from({ length: 10 }, (_, i) => calc({ from: cur.from + i * 3 * DAY, to: cur.from + (i + 1) * 3 * DAY }));
    return { a, b, change, buckets };
  }, [orders, mock, today]);

  const days = Number(range);
  const view = useMemo(() => {
    const from = today - (days - 1) * DAY;
    const inRange = orders.filter((o) => o.placedAt >= from && live(o));
    const series = Array.from({ length: days }, (_, i) => ({ day: from + i * DAY, revenue: 0, orders: 0 }));
    const wood = { red: { revenue: 0, units: 0, orders: new Set<string>() }, white: { revenue: 0, units: 0, orders: new Set<string>() } };
    const cats = new Map<string, { revenue: number; units: number }>();
    const prods = new Map<string, { slug: string; name: string; photoId: string; wood: "red" | "white"; units: number; revenue: number }>();
    for (const o of inRange) {
      const idx = Math.floor((startOfDay(o.placedAt) - from) / DAY);
      if (series[idx]) {
        series[idx].revenue += o.total - o.refunded;
        series[idx].orders++;
      }
      for (const l of o.lines) {
        const amt = l.qty * l.unitPrice;
        wood[l.wood].revenue += amt;
        wood[l.wood].units += l.qty;
        wood[l.wood].orders.add(o.id);
        const cat = products.find((p) => p.slug === l.slug)?.category;
        if (cat) {
          const c = cats.get(cat) ?? { revenue: 0, units: 0 };
          c.revenue += amt;
          c.units += l.qty;
          cats.set(cat, c);
        }
        const p = prods.get(l.slug) ?? { slug: l.slug, name: l.name, photoId: l.photoId, wood: l.wood, units: 0, revenue: 0 };
        p.units += l.qty;
        p.revenue += amt;
        prods.set(l.slug, p);
      }
    }
    const catRows = (["red", "white"] as const)
      .flatMap((w) => CATEGORIES[w].map((c) => ({ id: c.id, label: c.label, wood: w, revenue: cats.get(c.id)?.revenue ?? 0, units: cats.get(c.id)?.units ?? 0 })))
      .sort((x, y) => y.revenue - x.revenue);
    const ranked = [...prods.values()].sort((x, y) => y.revenue - x.revenue);
    const top = ranked.slice(0, 6);
    const best = { red: ranked.find((p) => p.wood === "red")?.name.split(",")[0], white: ranked.find((p) => p.wood === "white")?.name.split(",")[0] };
    const both = inRange.filter((o) => o.woods.length === 2).length;
    const revenue = series.reduce((s, d) => s + d.revenue, 0);
    return { series, wood, catRows, top, best, both, revenue, count: inRange.length };
  }, [orders, products, days, today]);

  const lowStock = useMemo(() => {
    const rows: { slug: string; name: string; wood: "red" | "white"; option: string; level: number; threshold: number; photoId?: string }[] = [];
    for (const p of products) {
      if (p.status === "archived") continue;
      for (const o of p.options) {
        const k = stockKey(p.slug, o.id);
        const level = stock.levels[k] ?? o.stock;
        const th = stock.thresholds[k] ?? 5;
        if (stockState(level, th) !== "in") rows.push({ slug: p.slug, name: p.name, wood: p.wood, option: o.label, level, threshold: th, photoId: p.photos[0]?.id });
      }
    }
    return rows.sort((a, b) => a.level - b.level);
  }, [products, stock]);

  const needReply = useMemo(() => reviews.filter((r) => r.state !== "hidden" && !r.reply).slice(0, 4), [reviews]);
  const todo = {
    confirm: orders.filter((o) => o.status === "new").length,
    ship: orders.filter((o) => o.status === "packed").length,
    returns: orders.filter((o) => o.status === "return-requested").length,
    reviews: reviews.filter((r) => r.state === "pending").length,
  };
  const hour = new Date(now).getHours();
  const greet = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const first = session?.name.split(" ")[0];

  const { a, b, change, buckets } = kpis;
  const tiles = [
    { label: "Revenue", value: formatINR(a.revenue), delta: change(a.revenue, b.revenue), up: true, spark: buckets.map((x) => x.revenue), note: "after refunds" },
    { label: "Orders", value: fmtNum(a.orders), delta: change(a.orders, b.orders), up: true, spark: buckets.map((x) => x.orders), note: "cancelled left out" },
    { label: "Average order", value: formatINR(Math.round(a.aov)), delta: change(a.aov, b.aov), up: true, spark: buckets.map((x) => x.aov), note: "per order" },
    { label: "Conversion", value: pct(a.conversion, 2), delta: change(a.conversion, b.conversion), up: true, spark: buckets.map((x) => x.conversion), note: `of ${fmtNum(a.sessions)} visits` },
    { label: "Returns", value: pct(a.returns), delta: change(a.returns, b.returns), up: false, spark: buckets.map((x) => x.returns), note: "of orders placed" },
  ];

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin" }, { label: "Overview" }]}
        title={`${greet}${first ? `, ${first}` : ""}`}
        sub={
          <span style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
            <span>{fmtLong(now)}</span>
            {todo.confirm > 0 && (
              <Link className="adm-link" href="/admin/orders?status=new">
                {todo.confirm} {todo.confirm === 1 ? "order" : "orders"} to confirm
              </Link>
            )}
            {todo.ship > 0 && (
              <Link className="adm-link" href="/admin/orders?status=packed">
                {todo.ship} packed, waiting for AWB
              </Link>
            )}
            {todo.returns > 0 && (
              <Link className="adm-link" href="/admin/orders?status=returns">
                {todo.returns} {todo.returns === 1 ? "return" : "returns"} to review
              </Link>
            )}
            {todo.reviews > 0 && (
              <Link className="adm-link" href="/admin/reviews">
                {todo.reviews} reviews to moderate
              </Link>
            )}
          </span>
        }
        actions={
          <>
            <Link href="/admin/products/new" className="adm-btn">
              <Icon name="plus" />
              New product
            </Link>
            <Link href="/admin/orders" className="adm-btn" data-variant="primary">
              Open orders
            </Link>
          </>
        }
      />

      <section aria-labelledby="kpi-h">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <h2 className="adm-h3" id="kpi-h">
            Last 30 days
          </h2>
          <span className="adm-muted" style={{ fontSize: 12.5 }}>
            Changes compared with the 30 days before
          </span>
        </div>
        <div className="adm-kpis">
          {tiles.map((t) => (
            <div key={t.label} className="adm-kpi">
              <div className="adm-kpi-label">
                <span>{t.label}</span>
              </div>
              <div className="adm-kpi-row">
                <div className="adm-kpi-value">{t.value}</div>
                <Tally values={t.spark} />
              </div>
              <div className="adm-kpi-foot">
                <Delta value={t.delta} upIsGood={t.up} />
                <span>{t.note}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, margin: "26px 0 12px" }}>
        <Seg
          label="Range for the charts below"
          value={range}
          onChange={setRange}
          items={[
            { id: "30", label: "Last 30 days" },
            { id: "90", label: "Last 90 days" },
          ]}
        />
        <span className="adm-muted" style={{ fontSize: 13 }}>
          {fmtNum(view.count)} orders, {formatINR(view.revenue)} after refunds
        </span>
      </div>

      <div className="adm-grid adm-cols-3-1" style={{ alignItems: "stretch" }}>
        <Panel title="Revenue" meta="Per day, after refunds. Cancelled orders excluded." id="p-revenue">
          <RevenueChart data={view.series} height={276} />
          <details className="adm-datatable" style={{ marginTop: 10 }}>
            <summary>
              <Icon name="list" width={14} height={14} />
              Show as a table
            </summary>
            <div className="adm-tablewrap">
              <table className="adm-table" data-dense="true">
                <thead>
                  <tr>
                    <th>Day</th>
                    <th className="num">Orders</th>
                    <th className="num">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {[...view.series].reverse().map((d) => (
                    <tr key={d.day}>
                      <td>{new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short" }).format(d.day)}</td>
                      <td className="num">{d.orders}</td>
                      <td className="num">{formatINR(d.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </Panel>

        <Panel title="Red and white" meta="Share of sales by wood" id="p-split">
          <SplitBar
            parts={[
              { key: "red", label: "Red sandalwood", value: view.wood.red.revenue, sub: `${fmtNum(view.wood.red.units)} pieces · ${view.wood.red.orders.size} orders` },
              { key: "white", label: "White sandalwood", value: view.wood.white.revenue, sub: `${fmtNum(view.wood.white.units)} pieces · ${view.wood.white.orders.size} orders` },
            ]}
          />
          <div className="adm-divider" style={{ margin: "18px 0 6px" }} />
          <dl className="adm-dl" style={{ gridTemplateColumns: "minmax(0,1fr) auto", fontSize: 13 }}>
            <dt>Average red piece</dt>
            <dd className="num">{view.wood.red.units ? formatINR(Math.round(view.wood.red.revenue / view.wood.red.units)) : "–"}</dd>
            <dt>Average white piece</dt>
            <dd className="num">{view.wood.white.units ? formatINR(Math.round(view.wood.white.revenue / view.wood.white.units)) : "–"}</dd>
            <dt>Orders with both woods</dt>
            <dd className="num">
              {view.both} of {view.count}
            </dd>
            <dt>Best red</dt>
            <dd style={{ textAlign: "right" }}>{view.best.red ?? "–"}</dd>
            <dt>Best white</dt>
            <dd style={{ textAlign: "right" }}>{view.best.white ?? "–"}</dd>
          </dl>
        </Panel>
      </div>

      <div className="adm-grid adm-cols-even" style={{ marginTop: 16 }}>
        <Panel
          title="Sales by category"
          meta="Both woods, in the range"
          id="p-cat"
        >
          <CategoryBars rows={view.catRows} />
        </Panel>

        <Panel title="Top pieces" meta="By sales in the range" bodyClass="" id="p-top">
          {view.top.length ? (
            <ol className="adm-list" style={{ marginTop: 8 }}>
              {view.top.map((p, i) => (
                <li key={p.slug} style={{ padding: "9px 18px" }}>
                  <Link href={`/admin/products/${p.slug}`} className="adm-list-link">
                    <span className="adm-muted num" style={{ width: 14, fontSize: 12.5 }}>
                      {i + 1}
                    </span>
                    <Thumb photoId={p.photoId} slug={p.slug} />
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="adm-cell-title" style={{ display: "block" }}>
                        {p.name}
                      </span>
                      <span className="adm-cell-sub" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Woods woods={[p.wood]} />
                        {p.wood === "red" ? "Red" : "White"} · {p.units} sold
                      </span>
                    </span>
                    <span className="adm-meter adm-hide-sm" style={{ width: 80 }} aria-hidden>
                      <span style={{ width: `${(p.revenue / view.top[0].revenue) * 100}%`, background: WOOD_COLOR[p.wood] }} />
                    </span>
                    <span className="num" style={{ fontWeight: 500, minWidth: 84, textAlign: "right" }}>
                      {formatINR(p.revenue)}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <Empty title="No sales yet" />
          )}
        </Panel>
      </div>

      <div className="adm-grid adm-cols-3-1" style={{ marginTop: 16 }}>
        <Panel
          title="Recent orders"
          bodyClass=""
          id="p-recent"
          action={
            <Link href="/admin/orders" className="adm-btn" data-size="sm">
              All orders
            </Link>
          }
        >
          <div className="adm-tablewrap" style={{ marginTop: 10 }}>
            <table className="adm-table" data-stack="recent">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Wood</th>
                  <th>Status</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 7).map((o) => (
                  <tr key={o.id}>
                    <td className="c-order nowrap">
                      <Link href={`/admin/orders/${o.id}`} className="adm-rowlink num">
                        {o.id}
                      </Link>
                      <div className="adm-cell-sub">{timeAgo(o.placedAt, now)}</div>
                    </td>
                    <td className="c-cust">
                      <div className="adm-cell-title">{o.name}</div>
                      <div className="adm-cell-sub">{o.address.city}</div>
                    </td>
                    <td className="c-wood">
                      <Woods woods={o.woods} />
                    </td>
                    <td className="c-status c-end">
                      <StatusPill status={o.status} />
                    </td>
                    <td className="num c-total c-end">{formatINR(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Low stock"
          meta={`${lowStock.length} options at or below reorder level`}
          bodyClass=""
          id="p-low"
          action={
            <Link href="/admin/inventory?stock=low" className="adm-btn" data-size="sm">
              Restock
            </Link>
          }
        >
          {lowStock.length ? (
            <ul className="adm-list" style={{ marginTop: 8 }}>
              {lowStock.slice(0, 7).map((r) => (
                <li key={r.slug + r.option} style={{ padding: "8px 18px" }}>
                  <Link href={`/admin/inventory?q=${encodeURIComponent(r.name)}`} className="adm-list-link">
                    {r.photoId && <Thumb photoId={r.photoId} slug={r.slug} size="sm" />}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="adm-cell-title" style={{ display: "block" }}>
                        {r.name}
                      </span>
                      <span className="adm-cell-sub" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <Woods woods={[r.wood]} />
                        {r.wood === "red" ? "Red" : "White"} · {r.option === "Standard" ? "One size" : r.option} · reorder at {r.threshold}
                      </span>
                    </span>
                    <span className="adm-pill" data-tone={r.level === 0 ? "bad" : "warn"}>
                      {r.level === 0 ? "Out" : `${r.level} left`}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Empty icon="check" title="Everything is stocked" />
          )}
        </Panel>
      </div>

      <section style={{ marginTop: 26 }} aria-labelledby="p-reviews">
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
          <div>
            <h2 className="adm-h2" id="p-reviews">
              Reviews to answer
            </h2>
            <p className="adm-muted" style={{ margin: "2px 0 0", fontSize: 12.5 }}>
              No reply from the Maison yet, newest first
            </p>
          </div>
          <Link href="/admin/reviews" className="adm-btn" data-size="sm">
            All reviews
          </Link>
        </div>
        {needReply.length ? (
          <div className="adm-cards-4">
            {needReply.map((r) => {
              const p = products.find((x) => x.slug === r.slug);
              return (
                <article key={r.id} className="adm-panel" style={{ padding: "14px 16px", display: "grid", gap: 6, alignContent: "start" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <Stars value={r.rating} label={false} />
                    {r.state === "pending" && (
                      <span className="adm-tag" data-tone="gold">
                        Pending
                      </span>
                    )}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>{r.title}</div>
                  <p className="adm-ink2" style={{ margin: 0, fontSize: 13, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {r.body}
                  </p>
                  <div className="adm-cell-sub">
                    {r.author} · {timeAgo(r.at, now)}
                    {p && ` · ${p.name}`}
                  </div>
                  <Link href={`/admin/reviews?reply=${r.id}`} className="adm-btn" data-size="sm" style={{ justifySelf: "start", marginTop: 4 }}>
                    <Icon name="reply" />
                    Reply as the Maison
                  </Link>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="adm-panel">
            <Empty icon="check" title="All caught up" />
          </div>
        )}
      </section>
    </div>
  );
}
