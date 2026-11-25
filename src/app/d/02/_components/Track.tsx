"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { EXAMPLE, STAGES, findOrder, formatDate, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { EASE, WOOD_LABEL, splitName } from "./copy";
import { OrderSeal, StageDial } from "./StageDial";
import { Station } from "./Station";
import { s } from "./cls";
import { ArrowIcon, CheckIcon } from "./ui";

type Found = { order: Order; own: boolean };

/** Before a lookup: the six stations, waiting, so the page is never an empty box. */
function Idle() {
  return (
    <div className="grid items-center gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="relative mx-auto aspect-square w-full max-w-[380px]">
        {/* the turning ring sits in a round frame, so its square box never widens the page */}
        <div aria-hidden className="absolute inset-0 overflow-hidden rounded-full">
        <svg viewBox="0 0 400 400" className={`absolute inset-0 size-full ${s.spinSlow}`}>
          <circle cx="200" cy="200" r="166" fill="none" stroke="var(--o-line)" strokeWidth="2" strokeDasharray="3 7" />
          {STAGES.map((st, i) => {
            const a = ((-150 + i * 60) * Math.PI) / 180;
            return <circle key={st.key} cx={200 + 166 * Math.sin(a)} cy={200 - 166 * Math.cos(a)} r="14" fill="var(--o-card)" stroke="var(--o-line)" strokeWidth="2" />;
          })}
        </svg>
        </div>
        <div className="absolute inset-[26%] grid place-items-center rounded-full border border-[var(--o-line)] bg-[var(--o-card)] p-4 text-center">
          <p className="text-[14px] leading-snug text-[var(--o-muted)]">Your order&apos;s six stages appear on this dial</p>
        </div>
      </div>
      <ol className="space-y-3">
        {STAGES.map((st, i) => (
          <li key={st.key} className="flex gap-3">
            <span className="grid size-7 shrink-0 place-items-center rounded-full border border-[var(--o-line)] text-[12px] font-bold text-[var(--o-muted)]">{i + 1}</span>
            <span>
              <span className={`${s.syne} block text-[15px] font-bold`}>{st.label}</span>
              <span className="block text-[14px] leading-snug text-[var(--o-muted)]">{st.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Result({ found, now }: { found: Found; now: number }) {
  const { order, own } = found;
  const t = trackingFor(order, now);
  const a = order.address;
  const cancelled = order.status === "cancelled";
  const shipped = !cancelled && t.current >= 3;
  return (
    <div className="@container">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className={`${s.display} whitespace-nowrap text-[length:min(3.2rem,8.2cqi)] tabular-nums`}>{order.id}</h2>
        <p className="text-[14px] text-[var(--o-muted)]">Placed {formatDate(order.placedAt, true)}</p>
      </div>
      {order.status && (
        <p className="mt-4 rounded-full bg-[var(--m-accent-soft)] px-5 py-3 text-[15px] font-semibold">
          {order.status === "cancelled" ? "This order was cancelled before it shipped." : "A return has been requested. We will write with the courier pickup."}
        </p>
      )}
      <div className="mt-8 grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StageDial tracking={t} cancelled={cancelled} />
        {cancelled ? (
          <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:border-l before:border-dashed before:border-[var(--o-line)]">
            <li className="relative flex gap-3">
              <span className="relative grid size-7 shrink-0 place-items-center rounded-full bg-[var(--o-ink)] text-white">
                <CheckIcon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className={`${s.syne} block text-[16px] font-bold`}>{t.stages[0].label}</span>
                <span className="block text-[14px] leading-snug text-[var(--o-ink-2)]">{t.stages[0].detail}</span>
                <span className="block text-[13px] tabular-nums text-[var(--o-muted)]">{formatDate(t.stages[0].at, true)}</span>
              </span>
            </li>
            <li className="relative flex gap-3">
              <span aria-hidden className="relative grid size-7 shrink-0 place-items-center rounded-full border-2 border-dashed border-[var(--o-muted)] bg-[var(--o-bg)] text-[15px] leading-none text-[var(--o-muted)]">
                ×
              </span>
              <span className="min-w-0">
                <span className={`${s.syne} block text-[16px] font-bold`}>Cancelled</span>
                <span className="block text-[14px] leading-snug text-[var(--o-ink-2)]">Stopped before it shipped. Nothing left the workshop, and the pieces went back to the shelf.</span>
              </span>
            </li>
          </ol>
        ) : (
        <ol className="relative space-y-4 before:absolute before:bottom-3 before:left-[13px] before:top-3 before:w-px before:bg-[var(--o-line)]">
          {t.stages.map((st, i) => (
            <li key={st.key} className="relative flex gap-3">
              <span className="relative grid size-7 shrink-0 place-items-center">
                {st.current && !order.status && <span aria-hidden className={`absolute inset-0 rounded-full bg-[var(--m-accent)] ${s.pulse}`} />}
                <span
                  className={`relative grid size-7 place-items-center rounded-full text-[12px] font-bold ${
                    st.current ? "bg-[var(--m-accent)] text-white" : st.done ? "bg-[var(--o-ink)] text-white" : "border border-[var(--o-line)] bg-[var(--o-bg)] text-[var(--o-muted)]"
                  }`}
                >
                  {st.done && !st.current ? <CheckIcon className="size-3.5" /> : i + 1}
                </span>
              </span>
              <span className="min-w-0">
                <span className={`${s.syne} block text-[16px] font-bold ${st.done ? "" : "text-[var(--o-muted)]"}`}>{st.label}</span>
                <span className="block text-[14px] leading-snug text-[var(--o-ink-2)]">{st.done ? st.detail : "Not yet"}</span>
                {st.done && <span className="block text-[13px] tabular-nums text-[var(--o-muted)]">{formatDate(st.at, true)}</span>}
              </span>
            </li>
          ))}
        </ol>
        )}
      </div>

      <dl className="mt-10 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[28px] bg-[var(--o-stone)] p-5">
          <dt className="text-[13px] text-[var(--o-muted)]">{cancelled ? "Status" : t.delivered ? "Delivered" : "Expected"}</dt>
          <dd className={`${s.syne} mt-1 text-[18px] font-bold`}>
            {cancelled ? "Cancelled, nothing was sent" : t.delivered ? formatDate(t.stages[5].at, true) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}
          </dd>
        </div>
        <div className="rounded-[28px] bg-[var(--o-stone)] p-5">
          <dt className="text-[13px] text-[var(--o-muted)]">Courier</dt>
          <dd className={`${s.syne} mt-1 text-[18px] font-bold`}>{cancelled ? "None, it never shipped" : shipped ? `${order.courier.name}, AWB ${order.courier.awb}` : "Assigned when the parcel ships"}</dd>
        </div>
        <div className="rounded-[28px] bg-[var(--o-stone)] p-5">
          <dt className="text-[13px] text-[var(--o-muted)]">{cancelled ? "Was going to" : "Delivering to"}</dt>
          <dd className="mt-1 text-[15px] leading-relaxed">
            {own ? (
              <>
                {a.name}, {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.pin}
              </>
            ) : (
              <>
                <span className="text-[var(--o-muted)]">Street hidden for privacy.</span> {a.city}, {a.state} {a.pin}
              </>
            )}
          </dd>
        </div>
        <div className="rounded-[28px] bg-[var(--o-stone)] p-5">
          <dt className="text-[13px] text-[var(--o-muted)]">Total</dt>
          <dd className={`${s.syne} mt-1 text-[18px] font-bold tabular-nums`}>
            {formatINR(order.total)}
            {order.coupon && <span className="ml-2 text-[13px] font-semibold text-[var(--m-accent)]">{order.coupon} applied</span>}
          </dd>
        </div>
      </dl>

      <ul className="mt-6 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
        {order.lines.map((l, i) => (
          <li key={l.slug + i} className="flex items-center gap-4 py-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[var(--o-floor)]">
              <Photo p={{ id: l.photoId, alt: l.name }} sizes="48px" />
            </span>
            <span className="min-w-0 flex-1">
              <span className={`${s.syne} block text-[15px] font-bold`}>{splitName(l.name)[0]}</span>
              <span className="block text-[13px] text-[var(--o-muted)]">
                {WOOD_LABEL[l.wood]}
                {l.optionLabel ? `, ${l.optionLabel}` : ""}
                {l.qty > 1 ? `, ${l.qty} pieces` : ""}
              </span>
            </span>
            <span className="text-[14px] font-semibold tabular-nums">{formatINR(l.unitPrice * l.qty)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[15px] leading-relaxed text-[var(--o-ink-2)]">
        {cancelled
          ? "This order stays here for your records. Write to us with the order number if you have a question about it."
          : `Something not right? Write to us with the order number${shipped ? " and the AWB" : ""}, and we will take it up with ${shipped ? "the courier" : "the workshop"}.`}
      </p>
    </div>
  );
}

/** Track your order: the lookup on the left, the six stages on a dial on the right. */
export function Track() {
  const params = useSearchParams();
  const o = params.get("o");
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const now = useNow();
  const reduced = !!useReducedMotion();
  const [id, setId] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState<{ id?: string | null; contact?: string | null }>({});
  const [found, setFound] = useState<Found | "none" | null>(null);

  // ?o= naming the visitor's own order shows it straight away
  const ownFromUrl = hydrated && o ? mine.find((x) => x.id === o.trim().toUpperCase()) : undefined;
  const live = (f: Found): Found => (f.own ? { ...f, order: mine.find((x) => x.id === f.order.id) ?? f.order } : f);
  const shown: Found | "none" | null = found ? (found === "none" ? "none" : live(found)) : ownFromUrl ? { order: ownFromUrl, own: true } : null;

  const lookup = (oid: string, c: string) => {
    const own = user ? mine.find((x) => x.id === oid.trim().toUpperCase()) : undefined;
    if (own) return setFound({ order: own, own: true });
    const hit = findOrder(oid, c);
    setFound(hit ? { order: hit, own: false } : "none");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next = { id: id.trim() ? null : "Please enter the order number.", contact: contact.trim() || (user && mine.some((x) => x.id === id.trim().toUpperCase())) ? null : "Please enter the email or phone on the order." };
    setErr(next);
    if (next.id || next.contact) return;
    lookup(id, contact);
  };
  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    setErr({});
    lookup(EXAMPLE.id, EXAMPLE.email);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <h1 className={`${s.display} text-[clamp(3rem,7vw,6rem)]`}>Track your order</h1>
        <p className="mt-5 max-w-[440px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">The order number starts with SM. Use the email or phone you gave at checkout.</p>
        {/* the lookup: two stations whose rings close as each answer takes shape */}
        <form onSubmit={submit} noValidate className="mt-8 space-y-3 rounded-[40px] border border-[var(--o-line)] bg-[var(--o-card)] p-4 md:p-6">
          <Station label="Order number" glyph="SM" done={/^SM-\d{4}-\d{4}$/i.test(id.trim())} error={err.id}>
            {(a) => <input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} value={id} onChange={(e) => setId(e.target.value)} placeholder="SM-0000-0000" autoCapitalize="characters" className={`${s.stIn} uppercase tabular-nums tracking-[0.04em]`} />}
          </Station>
          <Station label="Email or phone on the order" glyph="@" done={/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact.trim()) || /^\d{10}$/.test(contact.replace(/\D/g, ""))} error={err.contact}>
            {(a) => <input id={a.id} aria-describedby={a.describedBy} aria-invalid={a.invalid} value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" className={s.stIn} />}
          </Station>
          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" className="group flex h-14 flex-1 items-center justify-between gap-4 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.99]">
              Find the order
              <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform group-hover:rotate-90">
                <ArrowIcon />
              </span>
            </button>
            <button type="button" onClick={example} className="h-14 rounded-full border border-[var(--o-ink)] px-6 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
              Try the example order
            </button>
          </div>
        </form>

        {hydrated && user && mine.length > 0 && (
          <div className="mt-8">
            <p className={`${s.syne} text-[16px] font-bold`}>Your recent orders</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {mine.slice(0, 6).map((x) => (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setId(x.id);
                      setContact(x.email);
                      setErr({});
                      setFound({ order: x, own: true });
                    }}
                    className="flex items-center gap-2 rounded-full border border-[var(--o-line)] bg-[var(--o-card)] py-1 pl-1 pr-4 text-[14px] font-semibold tabular-nums transition-colors hover:border-[var(--o-ink)]"
                  >
                    <OrderSeal order={x} now={now} size={40} />
                    <span className="text-left leading-tight">
                      <span className="block">{x.id}</span>
                      {x.status && <span className="block text-[12px] font-medium text-[var(--o-muted)]">{x.status === "cancelled" ? "Cancelled" : "Return requested"}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="lg:col-span-7" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={shown === null ? "idle" : shown === "none" ? "none" : shown.order.id + shown.order.placedAt}
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {shown === null && <Idle />}
            {shown === "none" && (
              <div className="flex flex-col items-center gap-8 py-6 text-center md:flex-row md:text-left">
                <div className="grid size-[240px] shrink-0 place-items-center rounded-full border-2 border-dashed border-[var(--o-line)] p-8">
                  <p className={`${s.display} text-[30px]`}>Not on the dial</p>
                </div>
                <div>
                  <p className="max-w-[380px] text-[16px] leading-relaxed text-[var(--o-ink-2)]">
                    We could not find that order. Check the number (it starts with SM-) and use the email or phone you gave at checkout.
                  </p>
                  <button type="button" onClick={example} className="mt-5 h-12 rounded-full border border-[var(--o-ink)] px-6 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
                    Try the example order
                  </button>
                </div>
              </div>
            )}
            {shown && shown !== "none" && now !== null && <Result found={shown} now={now} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
