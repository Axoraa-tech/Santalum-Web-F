"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type CSSProperties, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { EXAMPLE, findOrder, formatDate, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cls";
import { cx, photoFor } from "./data";
import { Field } from "./forms";
import { IconArrow, IconCheck } from "./ui";

/** /d/06/track: a lookup tile, then the order as a board of six stage tiles. */
export function TrackBento() {
  return (
    <Suspense fallback={<div className={cx(s.tile, "min-h-[60svh]")} />}>
      <Tracker />
    </Suspense>
  );
}

type Found = { order: Order; open: boolean } | "missing" | null;

function Tracker() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const [id, setId] = useState(params.get("o") ?? "");
  const [contact, setContact] = useState("");
  const [found, setFound] = useState<Found>(null);
  const fromUrl = hydrated ? mine.find((o) => o.id === (params.get("o") ?? "").trim().toUpperCase()) : undefined;
  const shown: Found = found ?? (fromUrl ? { order: fromUrl, open: false } : null);

  const look = (oid: string, c: string) => {
    const o = findOrder(oid, c);
    setFound(o ? { order: o, open: o.userId !== user?.id } : "missing");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    look(id, contact);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-6 lg:grid-cols-12">
        <div className={cx(s.tile, "flex flex-col justify-between gap-6 p-6 sm:col-span-6 sm:p-8 lg:col-span-5")}>
          <h1 className={cx(s.display, "text-[clamp(44px,8cqw,80px)]")}>Track your order</h1>
          <p className={cx(s.muted, "max-w-[40ch] text-[16px] leading-[1.5]")}>The order number is in your confirmation. Use the email or mobile number you ordered with.</p>
        </div>
        <form onSubmit={submit} className={cx(s.tile, s.tint, "b6-wells flex flex-col gap-3 p-5 sm:col-span-4 sm:p-6 lg:col-span-4")} noValidate>
          <p className="text-[18px] font-medium tracking-[-0.02em]">Look it up</p>
          <Field label="Order number" value={id} onChange={(e) => setId(e.target.value)} placeholder="SM-2611-0000" autoComplete="off" spellCheck={false} className="[&_input]:font-[family-name:var(--font-martian)] [&_input]:uppercase" />
          <Field label="Email or mobile" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" />
          <button type="submit" className={cx(s.btn, "mt-auto")}>
            Track
          </button>
        </form>
        {/* the example order: a parcel already on its way, one tap to open */}
        <button
          type="button"
          onClick={() => {
            setId(EXAMPLE.id);
            setContact(EXAMPLE.email);
            look(EXAMPLE.id, EXAMPLE.email);
          }}
          className={cx(
            s.tile,
            s.dark,
            "group flex min-h-[240px] flex-col justify-between gap-6 p-5 text-left transition-transform active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent sm:col-span-2 sm:p-6 lg:col-span-3",
          )}
        >
          <span className="flex items-start justify-between gap-3">
            <span className={cx(s.mono, "text-[11px] text-white/55")}>No order to hand?</span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--b-tile)] text-[var(--b-ink)] transition-transform duration-500 group-hover:translate-x-1">
              <IconArrow size={16} />
            </span>
          </span>
          <span>
            <span className={cx(s.monoWide, "block text-[clamp(20px,11cqw,30px)] leading-none")}>{EXAMPLE.id}</span>
            <span className="mt-3 block text-[15px] leading-[1.45] text-white/70">Open the example order, already shipped, and watch the rest of its stages fill in.</span>
          </span>
        </button>
      </div>

      {hydrated && user && mine.length > 0 && (
        <div className={cx(s.tile, "flex flex-wrap items-center gap-2 p-3 pl-5")}>
          <p className={cx(s.mono, s.muted, "mr-2 text-[11px]")}>Your recent orders</p>
          {mine.slice(0, 5).map((o) => (
            <button key={o.id} type="button" aria-pressed={shown !== "missing" && shown?.order.id === o.id} className={cx(s.chip, s.chipSm, s.mono)} onClick={() => setFound({ order: o, open: false })}>
              {o.id}
            </button>
          ))}
        </div>
      )}

      {shown === "missing" ? (
        <div className={cx(s.tile, "grid gap-4 p-6 sm:grid-cols-2 sm:p-8")} role="status">
          <h2 className={cx(s.display, "text-[clamp(32px,6cqw,56px)]")}>No order by that number</h2>
          <p className={cx(s.muted, "self-end text-[16px] leading-[1.5]")}>
            Check the number and the email or mobile on the order. If it still does not show, write to us and we will find it by hand.
          </p>
        </div>
      ) : shown ? (
        <Result o={shown.order} open={shown.open} />
      ) : (
        <Waiting />
      )}
    </div>
  );
}

/** Before a lookup: the six stage tiles an order moves through, still empty. */
function Waiting() {
  return (
    <section aria-label="How an order moves" className="flex flex-col gap-3">
      <ol className={s.stages}>
        {STAGES.map((st, i) => (
          <li key={st.key} className={cx(s.tile, i === 0 ? "" : s.t2, "flex min-h-[200px] flex-col p-4")}>
            <span className="relative grid size-11 place-items-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0" aria-hidden>
                <circle cx="22" cy="22" r="19.5" fill="none" stroke="var(--b-dim)" strokeWidth="2" strokeDasharray="2 4" />
              </svg>
              <span className={cx(s.mono, "text-[12px]")}>{i + 1}</span>
            </span>
            <span className="mt-auto pt-5 text-[19px] font-medium leading-tight tracking-[-0.025em]">{st.label}</span>
            <span className={cx(s.muted, "mt-1.5 text-[13.5px] leading-[1.4]")}>{st.detail}</span>
          </li>
        ))}
      </ol>
      <p className={cx(s.mono, s.muted, "px-2 text-[11px]")}>Look up an order and these fill in, with a date on each stage it has passed.</p>
    </section>
  );
}

function Result({ o, open }: { o: Order; open: boolean }) {
  const now = useNow(5_000) ?? o.placedAt;
  const t = trackingFor(o, now);
  const cur = t.stages[t.current];
  const stopped = o.status === "cancelled";
  return (
    <div className="flex flex-col gap-3" aria-live="polite">
      <div className="grid gap-3 lg:grid-cols-12">
        <div className={cx(s.tile, s.dark, "flex min-h-[220px] flex-col justify-between gap-6 p-6 sm:p-8 lg:col-span-6")}>
          <p className={cx(s.mono, "text-[12px] text-white/60")}>
            {o.id}, placed {formatDate(o.placedAt, true)}
          </p>
          <div>
            <p className="text-[clamp(36px,6cqw,64px)] font-medium leading-none tracking-[-0.045em]">{stopped ? "Cancelled" : o.status === "return-requested" ? "Return requested" : cur.label}</p>
            <p className="mt-3 max-w-[46ch] text-[16px] leading-[1.5] text-white/70">{stopped ? "This order was cancelled before it shipped. Nothing was charged." : cur.detail}</p>
          </div>
        </div>
        <div className={cx(s.tile, s.tint, "flex flex-col justify-between gap-4 p-6 lg:col-span-3")}>
          <p className={cx(s.mono, "text-[11px] opacity-70")}>Estimated delivery</p>
          <p className="text-[24px] font-medium leading-tight tracking-[-0.03em]">
            {formatDate(t.estimate.from)}
            <br />
            to {formatDate(t.estimate.to)}
          </p>
        </div>
        <div className={cx(s.tile, "flex flex-col justify-between gap-4 p-6 lg:col-span-3")}>
          <p className={cx(s.mono, s.muted, "text-[11px]")}>Courier</p>
          <div>
            <p className="text-[20px] font-medium">{o.courier.name}</p>
            <p className={cx(s.monoWide, "mt-1 text-[17px]")}>{t.current >= 3 ? o.courier.awb : "AWB once shipped"}</p>
          </div>
        </div>
      </div>

      <ol className={s.stages} aria-label="Stages">
        {t.stages.map((st, i) => (
          <li
            key={st.key}
            aria-current={st.current ? "step" : undefined}
            className={cx(s.tile, "flex min-h-[170px] flex-col p-4 transition-colors duration-500", st.current && !stopped ? s.tint : "", !st.done && "opacity-60")}
          >
            <span className="relative grid size-11 place-items-center">
              <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90" aria-hidden>
                <circle cx="22" cy="22" r="19.5" fill="none" stroke="var(--b-line)" strokeWidth="2.5" />
                {st.done && !stopped && (
                  <circle
                    cx="22"
                    cy="22"
                    r="19.5"
                    fill="none"
                    stroke="var(--m-accent)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    pathLength={100}
                    className={st.current ? s.ring : undefined}
                    style={st.current ? ({ "--dur": "1.4s" } as CSSProperties) : { strokeDasharray: 100, strokeDashoffset: 0 }}
                  />
                )}
              </svg>
              {st.done && !st.current ? <IconCheck size={16} /> : <span className={cx(s.mono, "text-[12px]")}>{i + 1}</span>}
            </span>
            <span className="mt-auto pt-5 text-[19px] font-medium leading-tight tracking-[-0.025em]">{st.label}</span>
            <span className={cx(s.mono, s.muted, "mt-1 text-[10.5px]")}>{st.done ? formatDate(st.at, true) : "Expected"}</span>
          </li>
        ))}
      </ol>

      <div className="grid gap-3 lg:grid-cols-12">
        <div className={cx(s.tile, "p-5 sm:p-6 lg:col-span-6")}>
          <h2 className="text-[20px] font-medium tracking-[-0.025em]">In the parcel</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {o.lines.map((l) => (
              <li key={l.slug + (l.option ?? "")} className={cx(s.inner, "flex items-center gap-3 p-2 pr-4")}>
                <span className="relative size-12 shrink-0 overflow-hidden rounded-[12px]">
                  <Photo p={photoFor(l.slug, l.photoId, l.name).photo} tone={photoFor(l.slug, l.photoId, l.name).tone} sizes="48px" />
                </span>
                <span className="min-w-0 flex-1 truncate text-[15px]">
                  {l.name}
                  {l.optionLabel ? `, ${l.optionLabel}` : ""} <span className={cx(s.mono, s.muted, "text-[11px]")}>x{l.qty}</span>
                </span>
                <span className={cx(s.mono, "text-[13px]")}>{formatINR(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between px-1 text-[15px] font-medium">
            Total
            <span className={s.monoWide}>
              {formatINR(o.total)}
              {o.coupon ? ` (${o.coupon})` : ""}
            </span>
          </p>
        </div>
        <div className={cx(s.tile, "flex flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-3")}>
          <p className={cx(s.mono, s.muted, "text-[11px]")}>Delivering to</p>
          <p className="text-[16px] leading-[1.5]">
            {o.address.name}
            <br />
            {open ? "Street withheld for privacy" : o.address.line1}
            <br />
            {o.address.city}, {o.address.pin}
          </p>
        </div>
        <div className={cx(s.tile, s.t2, "flex flex-col justify-between gap-4 p-5 sm:p-6 lg:col-span-3")}>
          <p className="text-[18px] font-medium tracking-[-0.02em]">Need a hand?</p>
          <p className="text-[15px] leading-[1.5]">Write to us with the order number and we will answer within a working day.</p>
          <Link href="/d/06/account" className={cx(s.ghost, s.onWhite, "self-start")}>
            Your orders
          </Link>
        </div>
      </div>
    </div>
  );
}
