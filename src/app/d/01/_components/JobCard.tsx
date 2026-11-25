"use client";

import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatDate, trackingFor, useNow, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { s } from "./cx";
import { linePhoto } from "./data";
import { AddressLines } from "./forms";

/** Status of an order in workshop words, for stamps. */
export function statusStamp(o: Order) {
  if (o.status === "cancelled") return "Cancelled";
  if (o.status === "return-requested") return "Return requested";
  return null;
}

/** Six stations as a compact rail, for lists of orders. */
export function MiniRail({ o, now }: { o: Order; now: number }) {
  const t = trackingFor(o, now);
  const stopped = !!o.status;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center" aria-hidden>
        {t.stages.map((st, i) => (
          <span key={st.key} className="flex items-center">
            {i > 0 && <span className={`h-px w-4 sm:w-6 ${st.done && !stopped ? "bg-(--ink)" : "bg-(--hair-2)"}`} />}
            <span
              className={`size-2.5 rounded-full border ${
                stopped ? "border-(--hair-2)" : st.current ? "border-(--accent) bg-(--accent)" : st.done ? "border-(--ink) bg-(--ink)" : "border-(--hair-2)"
              }`}
            />
          </span>
        ))}
      </div>
      <span className={`${s.mono} text-[11.5px] ${stopped ? "text-(--steel)" : "text-(--ink)"}`}>{statusStamp(o) ?? t.stages[t.current].label}</span>
    </div>
  );
}

/** The job card: the order moving through six stations, live, with the courier and what is on it. */
export function JobCard({ order, isPublic }: { order: Order; isPublic: boolean }) {
  const nowLive = useNow();
  const now = nowLive ?? order.placedAt;
  const t = trackingFor(order, now);
  const stamp = statusStamp(order);
  const stopped = order.status === "cancelled";

  return (
    <article className={`${s.sheet} relative border border-(--ink)`} aria-label={`Job card for order ${order.id}`}>
      {/* Header strip */}
      <div className="grid border-b border-(--ink) sm:grid-cols-[1fr_auto_auto]">
        <div className="px-5 py-4 md:px-7">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>Job card</p>
          <p className={`${s.x125} mt-1 text-[clamp(1.6rem,3vw,2.4rem)] font-[620] leading-none tracking-[-0.02em] tabular-nums`}>{order.id}</p>
        </div>
        <Cell k="Placed" v={formatDate(order.placedAt, true)} />
        <Cell k={order.courier.name} v={`AWB ${order.courier.awb}`} />
      </div>
      {stamp && (
        <span className={`${s.stamp} ${s.mono} absolute right-6 top-24 z-10 rotate-[-8deg] rounded-[4px] bg-(--sheet) px-3 py-1.5 text-[14px] font-medium sm:top-5`}>
          {stamp}
        </span>
      )}

      {/* Stations: the card is punched at each station it has passed; the station working on it has its lamp lit */}
      <div className={`px-5 py-7 md:px-7 md:py-9 ${stopped ? "opacity-50" : ""}`}>
        <p className={`${s.mono} mb-3 flex items-center justify-between text-[11px] text-(--steel)`}>
          <span>Stations</span>
          <span className="tabular-nums">
            {stopped ? "Stopped" : `${t.current + 1} of ${t.stages.length}`}
          </span>
        </p>
        <ol className="grid border-l border-t border-(--hair-2) md:grid-cols-6">
          {t.stages.map((st, i) => (
            <li
              key={st.key}
              aria-current={st.current ? "step" : undefined}
              className={`relative grid grid-cols-[2rem_1fr] gap-3 border-b border-r border-(--hair-2) px-3 py-3.5 md:block md:px-3.5 md:py-4 ${st.current ? "bg-(--sheet)" : ""}`}
            >
              {st.current && <span aria-hidden className="absolute inset-x-0 -top-px h-[2px] bg-(--accent)" />}
              <div className="flex items-center justify-between md:mb-3">
                <span className={`${s.mono} hidden text-[10.5px] tabular-nums text-(--steel) md:inline`}>St. {(i + 1) * 10}</span>
                <Punch state={st.current ? (stopped ? "todo" : "live") : st.done ? "done" : "todo"} />
              </div>
              <div className="min-w-0">
                <p className={`text-[15px] leading-tight ${st.current ? "font-[650]" : st.done ? "" : "text-(--steel)"}`}>
                  <span className={`${s.mono} mr-2 text-[10.5px] font-normal tabular-nums text-(--steel) md:hidden`}>St. {(i + 1) * 10}</span>
                  {st.label}
                </p>
                <p className={`${s.mono} mt-1 text-[11px] text-(--steel)`}>{st.done ? formatDate(st.at, true) : "Waiting"}</p>
                {st.current && <p className="mt-1.5 text-[13.5px] leading-[1.45] text-(--ink-2)">{st.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Facts */}
      <div className="grid border-t border-(--hair-2) md:grid-cols-3">
        <div className="border-b border-(--hair-2) px-5 py-5 md:border-b-0 md:border-r md:px-7">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>{stopped ? "Status" : t.delivered ? "Delivered" : "Estimated delivery"}</p>
          <p className={`${s.x110} mt-2 text-[20px] font-[600] leading-tight`}>
            {stopped ? "Cancelled; nothing will ship" : t.delivered ? formatDate(t.stages[5].at) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}
          </p>
          <p className="mt-1 text-[14px] text-(--ink-2)">{order.delivery === "express" ? "Express, 1–2 working days" : "Standard, 3–5 working days"}</p>
          {order.status === "return-requested" && order.returnReason && <p className="mt-2 text-[14px] text-(--ink-2)">Return reason: {order.returnReason}</p>}
        </div>
        <div className="border-b border-(--hair-2) px-5 py-5 md:border-b-0 md:border-r md:px-7">
          <p className={`${s.mono} mb-2 text-[11px] text-(--steel)`}>Deliver to{isPublic ? ", street hidden" : ""}</p>
          <AddressLines a={order.address} masked={isPublic} />
        </div>
        <div className="px-5 py-5 md:px-7">
          <p className={`${s.mono} mb-2 text-[11px] text-(--steel)`}>On this card</p>
          <ul className="grid gap-2.5">
            {order.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-center gap-3">
                <span className="relative size-10 shrink-0 overflow-hidden rounded-full bg-(--paper-2)">
                  <Photo p={linePhoto(l)} sizes="40px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14.5px]">{l.name}</span>
                  <span className={`${s.mono} block truncate text-[10.5px] text-(--steel)`}>
                    {l.qty} × {l.optionLabel ? `${l.optionLabel}, ` : ""}
                    {CONTENT[l.wood].latin}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <dl className={`${s.mono} mt-3 grid gap-1 border-t border-dashed border-(--hair-2) pt-3 text-[12px]`}>
            {order.coupon && (
              <div className="flex justify-between text-(--accent)">
                <dt>Code {order.coupon}</dt>
                <dd className="tabular-nums">−{formatINR(order.discount ?? 0)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>
      </div>
      <p className={`${s.mono} border-t border-(--hair-2) px-5 py-3 text-[11.5px] leading-[1.5] text-(--steel) md:px-7`}>
        Questions about this job? Write to us with the order number {order.id} and the workshop will look it up.
      </p>
    </article>
  );
}

/** A station mark: a hole punched through the card, the lit lamp of the station working on it, or an open ring. */
function Punch({ state }: { state: "done" | "live" | "todo" }) {
  if (state === "done") return <span aria-hidden className="size-[18px] rounded-full bg-(--paper-3) shadow-[inset_0_2px_4px_rgb(0_0_0/0.42),0_0_0_1px_var(--hair-2),0_1px_0_1px_rgb(255_255_255/0.6)]" />;
  if (state === "live") return <span aria-hidden className={`size-[18px] rounded-full border-2 border-(--sheet) bg-(--accent) shadow-[0_0_0_1px_var(--accent)] ${s.live}`} />;
  return <span aria-hidden className="size-[18px] rounded-full border border-dashed border-(--hair-2)" />;
}

function Cell({ k, v }: { k: string; v: string }) {
  return (
    <div className={`${s.mono} flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-3 text-[12px] sm:block sm:border-l sm:border-t-0 sm:px-6 sm:py-4`}>
      <span className="block text-[10.5px] text-(--steel)">{k}</span>
      <span className="block tabular-nums sm:mt-1.5 sm:text-[13.5px]">{v}</span>
    </div>
  );
}
