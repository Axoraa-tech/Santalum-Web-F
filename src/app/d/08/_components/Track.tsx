"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { EXAMPLE, findOrder, formatDate, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { NOTES } from "../_lib/copy";
import { locate } from "../_lib/places";
import { KeyInput, LegendBox } from "./Legend";
import { RouteKey, RouteMap } from "./RouteMap";
import { s } from "./styles";

const PROGRESS = [0, 0, 0.04, 0.42, 0.84, 1];

/** The order on the map: the route, the six stops, and what is travelling. */
export function OrderRoute({ order, now, masked, compact = false }: { order: Order; now: number; masked: boolean; compact?: boolean }) {
  const t = trackingFor(order, now);
  const to = locate(order.address.city, order.address.state);
  const halted = order.status === "cancelled";
  const a = order.address;
  const woods = order.lines.map((l) => l.wood);
  return (
    <div className={`grid gap-8 ${compact ? "" : "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]"}`}>
      <div>
        <figure className="border border-(--a-ink) bg-(--a-card) p-1">
          <div className="border border-(--a-line-2)">
            <RouteMap to={to} woods={woods} progress={halted ? 0 : PROGRESS[t.current]} id={`tr-${order.id}${compact ? "-c" : ""}`} className="block h-auto w-full" />
          </div>
          <figcaption className="px-2 py-2">
            <span className="flex flex-wrap items-baseline justify-between gap-2 text-[14px] text-(--a-muted)">
              <span>
                From the workshop to {a.city}, {a.pin}
              </span>
              {!halted && <span>{t.delivered ? `Delivered ${formatDate(t.stages[5].at, true)}` : `Expected ${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}</span>}
            </span>
            {!compact && <RouteKey woods={woods} to={to.at} className="mt-2 border-t border-dashed border-(--a-line-2) pt-2" />}
          </figcaption>
        </figure>
        {!compact && (
          <dl className="mt-6 grid gap-x-8 gap-y-3 text-[15px] sm:grid-cols-2">
            <div className="flex justify-between gap-4 border-b border-(--a-line) pb-2">
              <dt className="text-(--a-muted)">Courier</dt>
              <dd>{t.current >= 3 ? order.courier.name : "Assigned when it ships"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-(--a-line) pb-2">
              <dt className="text-(--a-muted)">AWB</dt>
              <dd className="tabular-nums">{t.current >= 3 ? order.courier.awb : "Not yet"}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-(--a-line) pb-2 sm:col-span-2">
              <dt className="text-(--a-muted)">Delivering to</dt>
              <dd className="text-right">{masked ? `${a.city}, ${a.state} ${a.pin}` : `${a.name}, ${a.line1}${a.line2 ? `, ${a.line2}` : ""}, ${a.city}, ${a.state} ${a.pin}`}</dd>
            </div>
          </dl>
        )}
        {!compact && (
          <ul className="mt-6 grid gap-3">
            {order.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-center gap-3">
                <span className="relative size-14 shrink-0 overflow-hidden bg-(--a-paper-2)">
                  <Photo p={{ id: l.photoId, alt: l.name }} sizes="112px" />
                </span>
                <span className="flex-1 text-[15px]">
                  <Link href={`/d/08/p/${l.slug}`} className={s.link}>
                    {l.name}
                  </Link>
                  <span className="block text-(--a-muted)">
                    {l.optionLabel ? `${l.optionLabel}, ` : ""}× {l.qty}
                  </span>
                </span>
                <span className="text-[15px] tabular-nums">{formatINR(l.unitPrice * l.qty)}</span>
              </li>
            ))}
            {order.discount ? (
              <li className="flex justify-between text-[15px] text-(--a-accent-deep)">
                <span>Code {order.coupon}</span>
                <span className="tabular-nums">−{formatINR(order.discount)}</span>
              </li>
            ) : null}
            <li className="flex justify-between border-t border-(--a-line-2) pt-2 text-[16px] font-semibold">
              <span>Total</span>
              <span className="tabular-nums">{formatINR(order.total)}</span>
            </li>
          </ul>
        )}
      </div>

      <ol className="relative grid content-start gap-5 pl-10" aria-label="Tracking stages">
        <span className={`${s.vrouteMute} absolute bottom-3 left-[13px] top-3 w-[2px]`} aria-hidden />
        <span className={`${s.vroute} absolute left-[13px] top-3 w-[3px] transition-[height] duration-700`} style={{ height: halted ? 0 : `calc(${(t.current / 5) * 100}% - 24px)` }} aria-hidden />
        {t.stages.map((st) => (
          <li key={st.key} className="relative" aria-current={st.current && !halted ? "step" : undefined}>
            <span
              className={`absolute -left-10 top-0.5 grid size-7 place-items-center rounded-full border-2 ${
                halted ? "border-(--a-line-2) bg-(--a-card)" : st.current ? "border-(--a-accent) bg-(--a-accent)" : st.done ? "border-(--a-ink) bg-(--a-ink)" : "border-dashed border-(--a-line-2) bg-(--a-card)"
              }`}
              aria-hidden
            >
              {st.current && !halted && <span className={`${s.pulse} absolute inset-0 rounded-full bg-(--a-accent)`} />}
              {st.done && !halted && <span className="relative size-2 rounded-full bg-(--a-card)" />}
            </span>
            <p className={`${s.serif} text-[19px] leading-tight ${st.done && !halted ? "" : "text-(--a-muted)"}`}>{st.label}</p>
            <p className="text-[15px] leading-snug text-(--a-ink-2)">{st.detail}</p>
            <p className="mt-0.5 text-[14px] tabular-nums text-(--a-muted)">{halted ? "" : st.done ? formatDate(st.at, true) : "To come"}</p>
          </li>
        ))}
        {order.status && (
          <li className="border border-(--a-accent) bg-(--a-card) p-3 text-[15px]">
            <p className="font-semibold text-(--a-accent-deep)">{order.status === "cancelled" ? "Cancelled" : "Return requested"}</p>
            <p className="text-(--a-ink-2)">{order.status === "cancelled" ? "Nothing will ship. No money was taken in this preview." : "We will write about collection. The parcel stays where it is until then."}</p>
          </li>
        )}
      </ol>
    </div>
  );
}

function Tracker() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const now = useNow();
  const o = params.get("o");
  const [id, setId] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [found, setFound] = useState<{ order: Order; masked: boolean } | null | "none">(null);
  const own = hydrated && o ? mine.find((x) => x.id === o.trim().toUpperCase()) : undefined;
  const shown = found && found !== "none" ? found : own ? { order: own, masked: false } : null;

  function lookup(e?: FormEvent, ex?: boolean) {
    e?.preventDefault();
    const key = ex ? EXAMPLE.id : id;
    const c = ex ? EXAMPLE.email : contact;
    if (ex) {
      setId(EXAMPLE.id);
      setContact(EXAMPLE.email);
    }
    const ownHit = mine.find((x) => x.id === key.trim().toUpperCase());
    if (ownHit) return setFound({ order: ownHit, masked: false });
    const hit = findOrder(key, c);
    setFound(hit ? { order: hit, masked: true } : "none");
  }

  return (
    <div className="mx-auto w-full max-w-[1320px] px-4 md:px-8">
      <header className="grid gap-4 border-b border-(--a-ink) pb-6 md:grid-cols-[1fr_minmax(0,460px)] md:items-end">
        <h1 className={`${s.serif} text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.95] tracking-[-0.02em]`}>Track your order</h1>
        <p className="text-[16px] leading-relaxed text-(--a-ink-2)">Every order is a route on the map, from the workshop to your door. Enter the order number and the email or phone on it.</p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[340px_1fr] lg:gap-12">
        <div className="grid content-start gap-6">
          <LegendBox title="Find the route" aside="Lookup">
            <form onSubmit={lookup} noValidate className="grid gap-4">
              <KeyInput label="Order number" value={id} onChange={(e) => setId(e.target.value)} placeholder="SM-2611-0412" autoCapitalize="characters" />
              <KeyInput label="Email or phone on the order" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" />
              <button type="submit" className={`${s.btn} ${s.btnInk} h-12 text-[15px] font-medium`}>
                Show the route
              </button>
              <button type="button" onClick={() => lookup(undefined, true)} className={`${s.btn} ${s.btnLine} h-11 text-[15px]`}>
                Try the example order
              </button>
            </form>
          </LegendBox>
          {hydrated && user && mine.length > 0 && (
            <LegendBox title="Your recent orders" aside={`${mine.length}`}>
              <ul className="grid gap-1">
                {mine.slice(0, 5).map((x) => (
                  <li key={x.id}>
                    <button
                      type="button"
                      onClick={() => (setId(x.id), setFound({ order: x, masked: false }))}
                      className="flex w-full items-baseline justify-between gap-3 rounded-[8px] px-2 py-2 text-left text-[15px] hover:bg-(--a-paper-2)"
                    >
                      <span className="font-medium tabular-nums">{x.id}</span>
                      <span className="text-(--a-muted)">{x.address.city}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </LegendBox>
          )}
          <p className="text-[14px] leading-relaxed text-(--a-muted)">{NOTES.help}</p>
        </div>

        <section aria-live="polite" aria-label="Route">
          {shown && now ? (
            <>
              <p className="mb-4 flex flex-wrap items-baseline gap-x-4 text-[16px]">
                <span className={`${s.serif} text-[26px]`}>{shown.order.id}</span>
                <span className="text-(--a-muted)">Placed {formatDate(shown.order.placedAt, true)}</span>
              </p>
              <OrderRoute order={shown.order} now={now} masked={shown.masked} />
            </>
          ) : found === "none" ? (
            <div className="grid gap-6 border border-dashed border-(--a-line-2) bg-(--a-card) p-8 sm:grid-cols-[140px_1fr]">
              <svg viewBox="0 0 140 110" className="w-[140px]" aria-hidden>
                <path d="M14 90 C40 20 90 100 126 22" fill="none" stroke="var(--a-line-2)" strokeWidth="2" strokeDasharray="4 6" />
                <circle cx="14" cy="90" r="6" fill="var(--a-accent)" />
                <circle cx="126" cy="22" r="8" fill="none" stroke="var(--a-ink)" strokeWidth="2" strokeDasharray="3 3" />
              </svg>
              <div>
                <p className={`${s.serif} text-[24px] leading-tight`}>No route on the map for that number.</p>
                <p className="mt-2 text-[16px] leading-relaxed text-(--a-ink-2)">Check the order number in your confirmation, and use the email or phone you placed it with. Orders in this preview live in the browser they were placed in.</p>
              </div>
            </div>
          ) : (
            <div className="grid min-h-[320px] place-items-center border border-dashed border-(--a-line-2) bg-(--a-card)/60 p-8 text-center">
              <p className="max-w-[420px] text-[16px] leading-relaxed text-(--a-ink-2)">The route appears here: the workshop pin, your city, and the parcel somewhere between them.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export function Track() {
  return (
    <Suspense fallback={<div className="min-h-[70svh]" />}>
      <Tracker />
    </Suspense>
  );
}
