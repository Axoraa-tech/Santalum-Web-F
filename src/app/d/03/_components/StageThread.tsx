"use client";

import { formatDate, type Order, type Tracking } from "@/lib/shop/orders";

/**
 * The six stages of an order as beads on a thread: brass up to where the order is now, the bead it has
 * reached breathes, the ones to come are open rings. Down the page on phones, across it on wider screens.
 * A cancelled order shows where the thread was cut.
 */
export function StageThread({ t, status }: { t: Tracking; status?: Order["status"] }) {
  const cut = status === "cancelled";
  return (
    <ol className="relative grid md:grid-cols-6">
      {t.stages.map((s, i) => {
        const last = i === t.stages.length - 1;
        const filled = i < t.current && !cut;
        const done = s.done && (!cut || i <= t.current);
        return (
          <li key={s.key} className={`relative grid grid-cols-[36px_1fr] gap-x-4 md:flex md:flex-col md:items-center md:text-center ${last ? "" : "pb-8 md:pb-0"}`}>
            {!last && (
              <span
                aria-hidden
                className={`absolute left-[17px] top-[11px] h-full md:left-1/2 md:w-full ${filled ? "w-[2px] bg-(--thread) md:h-[2px]" : "w-px bg-(--thread)/35 md:h-px"}`}
              />
            )}
            <span className="relative z-[1] flex h-[22px] justify-center">
              <span className="s3-stage-bead" data-done={done} data-now={s.current && !cut} aria-hidden />
            </span>
            <span className="md:mt-4 md:px-2">
              <span className={`block text-[17px] leading-tight ${done ? "text-(--ink)" : "text-(--muted)"} ${s.current && !cut ? "s3-serif text-[21px]" : ""}`}>
                {s.label}
                {s.current && !cut && <span className="sr-only"> (current stage)</span>}
              </span>
              <span className="mt-1 block text-[14px] tabular-nums text-(--muted)">{done ? formatDate(s.at, true) : cut ? "Cancelled" : "To come"}</span>
              {s.current && !cut && <span className="mt-1.5 block text-[15px] leading-[1.5] text-(--ink)/75 md:hidden">{s.detail}</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Six small beads for a list of orders. */
export function StageBeads({ t, status }: { t: Tracking; status?: Order["status"] }) {
  const label = status === "cancelled" ? "Cancelled" : status === "return-requested" ? "Return requested" : t.stages[t.current].label;
  return (
    <span className="inline-flex items-center gap-3">
      <span className="relative inline-flex items-center gap-[9px]" role="img" aria-label={`${label}, stage ${t.current + 1} of 6`}>
        <span className="absolute left-1 right-1 top-1/2 h-px bg-(--thread)/50" aria-hidden />
        {t.stages.map((s) => (
          <span
            key={s.key}
            className={`relative block rounded-full ${s.done && status !== "cancelled" ? "s3-bead h-[11px] w-[11px]" : "h-[9px] w-[9px] border border-(--thread) bg-(--linen)"}`}
          />
        ))}
      </span>
      <span className={`text-[14px] ${status ? "text-(--m-accent)" : "text-(--ink)"}`}>{label}</span>
    </span>
  );
}
