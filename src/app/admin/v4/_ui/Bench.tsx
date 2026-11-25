"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { Wood } from "@/lib/shop/products";
import { fmtLong, formatINR, inrCompact, timeAgo } from "../../_data/format";
import { DAY, startOfDay, stockKey } from "../../_data/mock";
import { NEXT_STAGE, orderActions, stockState, useNow, useOrders, useProducts, useReviews, useSession, useStock } from "../../_data/store";
import type { AdminOrder } from "../../_data/types";
import { BASE, Head, Pinned, Stage, toneOf, Woods, say } from "./kit";

type Task = { key: string; n: number; label: string; line: string; href: string; photos: { id: string; slug: string }[]; urgent?: boolean };

const photosOf = (orders: AdminOrder[]) => orders.slice(0, 4).map((o) => ({ id: o.lines[0].photoId, slug: o.lines[0].slug }));

export function Bench() {
  const now = useNow();
  const session = useSession();
  const orders = useOrders();
  const { reviews, questions } = useReviews();
  const products = useProducts();
  const stock = useStock();

  const data = useMemo(() => {
    const by = (s: AdminOrder["status"]) => orders.filter((o) => o.status === s).sort((a, b) => a.placedAt - b.placedAt);
    const fresh = by("new");
    const confirmed = by("confirmed");
    const packed = by("packed");
    const returns = by("return-requested");
    const low = products.flatMap((p) =>
      p.options
        .filter((o) => stockState(o.stock, stock.thresholds[stockKey(p.slug, o.id)] ?? 5) !== "in")
        .map((o) => ({ p, o })),
    );
    const pending = reviews.filter((r) => r.state === "pending");
    const open = questions.filter((q) => !q.answer);

    const tasks: Task[] = [
      { key: "confirm", n: fresh.length, label: "to confirm", line: "Match each piece to its batch record.", href: `${BASE}/orders`, photos: photosOf(fresh), urgent: fresh.some((o) => now - o.placedAt > DAY) },
      { key: "pack", n: confirmed.length, label: "to pack", line: "Linen, the card and the provenance record.", href: `${BASE}/orders`, photos: photosOf(confirmed) },
      { key: "ship", n: packed.length, label: "to hand over", line: "Add the AWB and hand to the courier.", href: `${BASE}/orders`, photos: photosOf(packed) },
      { key: "returns", n: returns.length, label: returns.length === 1 ? "return to decide" : "returns to decide", line: "Read the reason, then approve or call.", href: `${BASE}/orders?view=list`, photos: photosOf(returns), urgent: returns.length > 0 },
      { key: "stock", n: low.length, label: "shelves running low", line: "Options at or under their reorder line.", href: `${BASE}/inventory`, photos: low.slice(0, 4).map(({ p }) => ({ id: p.photos[0]?.id ?? "", slug: p.slug })).filter((x) => x.id) },
      { key: "reviews", n: pending.length + open.length, label: "notes from customers", line: `${pending.length} reviews to approve, ${open.length} questions to answer.`, href: `${BASE}/reviews`, photos: [] },
    ];

    const today = startOfDay(now);
    const todays = orders.filter((o) => o.placedAt >= today && o.status !== "cancelled");
    const week = orders.filter((o) => o.placedAt >= today - 6 * DAY && o.status !== "cancelled");
    const byWood: Record<Wood, number> = { red: 0, white: 0 };
    for (const o of week) for (const l of o.lines) byWood[l.wood] += l.unitPrice * l.qty;
    const waiting = [...fresh, ...confirmed].sort((a, b) => a.placedAt - b.placedAt).slice(0, 6);
    return { tasks, todays, week, byWood, waiting };
  }, [orders, products, stock, reviews, questions, now]);

  const weekTotal = data.byWood.red + data.byWood.white || 1;
  const first = session?.name.split(" ")[0] ?? "";

  return (
    <div className="a4-page">
      <Head kicker={fmtLong(now)} title="The bench" sub={`${first ? first + ", here" : "Here"} is what needs hands today.`} />

      <section aria-labelledby="a4-tasks" className="a4-bench">
        <h2 id="a4-tasks" className="a4-sr">Tasks</h2>
        {data.tasks.map((t) => (
          <Link key={t.key} href={t.href} className="a4-paper a4-task" data-urgent={t.urgent || undefined} data-zero={t.n === 0 || undefined}>
            <span className="a4-task-n">{t.n}</span>
            <span className="a4-task-label">{t.label}</span>
            <span className="a4-task-line">{t.n === 0 ? "Nothing waiting." : t.line}</span>
            {t.photos.length > 0 && (
              <span className="a4-task-pins">
                {t.photos.map((p, i) => (
                  <Pinned key={i} photoId={p.id} tone={toneOf(p.slug)} size="xs" pin={false} alt="" />
                ))}
              </span>
            )}
          </Link>
        ))}
      </section>

      <div className="a4-split">
        <section className="a4-paper a4-pad" aria-labelledby="a4-waiting">
          <h2 id="a4-waiting" className="a4-h2">
            Waiting longest
          </h2>
          <p className="a4-sub">New and confirmed orders, oldest first. Move them on from here.</p>
          {data.waiting.length === 0 ? (
            <p className="a4-empty">The bench is clear.</p>
          ) : (
            <ul className="a4-queue">
              {data.waiting.map((o) => {
                const next = NEXT_STAGE[o.status];
                return (
                  <li key={o.id}>
                    <Pinned photoId={o.lines[0].photoId} tone={toneOf(o.lines[0].slug)} size="sm" pin={false} alt="" />
                    <div className="a4-queue-body">
                      <Link href={`${BASE}/orders/${o.id}`} className="a4-strong">
                        {o.name}
                      </Link>
                      <span className="a4-muted">
                        {o.id} · {o.lines.length} {o.lines.length === 1 ? "piece" : "pieces"} · {timeAgo(o.placedAt, now)}
                      </span>
                      <span className="a4-row-tags">
                        <Stage status={o.status} />
                        <Woods woods={o.woods} />
                      </span>
                    </div>
                    {next && (
                      <button
                        type="button"
                        className="a4-btn a4-btn-sm"
                        onClick={() => {
                          orderActions.advance(o);
                          say(`${o.id}: ${next.label.toLowerCase()}`);
                        }}
                      >
                        {next.label}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="a4-paper a4-pad" aria-labelledby="a4-takings">
          <h2 id="a4-takings" className="a4-h2">
            Takings
          </h2>
          <dl className="a4-figs">
            <div>
              <dt>Today</dt>
              <dd>{formatINR(data.todays.reduce((s, o) => s + o.total, 0))}</dd>
              <span className="a4-muted">{data.todays.length} orders</span>
            </div>
            <div>
              <dt>Last 7 days</dt>
              <dd>{inrCompact(data.week.reduce((s, o) => s + o.total, 0))}</dd>
              <span className="a4-muted">{data.week.length} orders</span>
            </div>
          </dl>
          <p className="a4-label">By wood, last 7 days</p>
          <div className="a4-woodbar" role="img" aria-label={`Red ${formatINR(data.byWood.red)}, white ${formatINR(data.byWood.white)}`}>
            <span data-wood="red" style={{ width: `${(data.byWood.red / weekTotal) * 100}%` }} />
            <span data-wood="white" style={{ width: `${(data.byWood.white / weekTotal) * 100}%` }} />
          </div>
          <ul className="a4-legend">
            <li data-wood="red">
              Red sandalwood <b>{formatINR(data.byWood.red)}</b>
            </li>
            <li data-wood="white">
              White sandalwood <b>{formatINR(data.byWood.white)}</b>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
