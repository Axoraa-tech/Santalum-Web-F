"use client";

import { animate, useMotionValue } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, trackingFor, useNow, useOrder, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import s from "../styles";
import { EASE, STAGE_MIN } from "./data";
import { AddressLines, Field } from "./forms";
import { HeldSky } from "./Held";
import { SunArc } from "./SunArc";

type Shown = { order: Order; masked: boolean };

/** Reads `?o=`; if it names the signed-in visitor's own order, it shows straight away. */
export function TrackFromUrl() {
  const o = useSearchParams().get("o");
  return <TrackView initialId={o} />;
}

/** Track an order: a lookup, your recent orders, and the result as the sun moving across six stages. */
export function TrackView({ initialId = null }: { initialId?: string | null }) {
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const own = useOrder(initialId);
  const [picked, setPicked] = useState<Shown | "missing" | null>(null);
  const shown: Shown | "missing" | null = picked ?? (own ? { order: own, masked: false } : null);
  const now = useNow();
  const t = shown && shown !== "missing" && now ? trackingFor(shown.order, now) : null;

  // the page's sky follows the order: placed at dawn, delivered at nightfall
  const minutes = useMotionValue(420);
  const target = t ? STAGE_MIN[t.current] : 420;
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const c = animate(minutes, target, { duration: reduce ? 0 : 2.2, ease: EASE });
    return () => c.stop();
  }, [target, minutes]);

  const result = useRef<HTMLDivElement>(null);
  const show = (next: Shown | "missing") => {
    setPicked(next);
    requestAnimationFrame(() => result.current?.focus({ preventScroll: false }));
  };

  return (
    <>
      <HeldSky min={420} minutes={minutes} />
      <div className={`${s.swap} grid gap-14 lg:grid-cols-12 lg:gap-10`}>
        <div className="lg:col-span-4">
          <Lookup
            onFound={(o) => show({ order: o, masked: !(user && o.userId === user.id) })}
            onMissing={() => show("missing")}
          />
          {hydrated && user && mine.length > 0 && (
            <section aria-labelledby="d09-yours" className="mt-14">
              <h2 id="d09-yours" className={`${s.display} text-[28px] leading-none`}>
                Your recent orders
              </h2>
              <ul className="mt-5 border-t border-[var(--hair)]">
                {mine.slice(0, 5).map((o) => {
                  const on = shown && shown !== "missing" && shown.order.id === o.id;
                  return (
                    <li key={o.id} className="border-b border-[var(--hair)]">
                      <button
                        type="button"
                        aria-pressed={!!on}
                        onClick={() => show({ order: o, masked: false })}
                        className={`flex w-full items-baseline justify-between gap-4 px-1 py-3.5 text-left transition-colors hover:text-[var(--m-accent)] ${
                          on ? "text-[var(--m-accent)]" : ""
                        }`}
                      >
                        <span>
                          <span className={`${s.tab} block text-[16px]`}>{o.id}</span>
                          <span className="block text-[13px] text-[var(--muted)]">
                            {formatDate(o.placedAt)}, {o.lines.reduce((n, l) => n + l.qty, 0)} pieces
                          </span>
                        </span>
                        <span className={`${s.tab} text-[14px]`}>{formatINR(o.total)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </div>

        <div ref={result} tabIndex={-1} className="outline-none lg:col-span-8" aria-live="polite">
          {shown === "missing" ? (
            <NotFound />
          ) : shown ? (
            t ? (
              <Result order={shown.order} masked={shown.masked} current={t.current} t={t} />
            ) : (
              <div className="min-h-[24rem]" />
            )
          ) : (
            <Waiting />
          )}
        </div>
      </div>
    </>
  );
}

function Lookup({ onFound, onMissing }: { onFound: (o: Order) => void; onMissing: () => void }) {
  const form = useRef<HTMLFormElement>(null);
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState<{ id?: string | null; contact?: string | null }>({});

  const look = (oid: string, c: string) => {
    const next = {
      id: oid.trim() ? null : "Please enter the order number.",
      contact: c.trim() ? null : "Please enter the email or phone on the order.",
    };
    setErr(next);
    if (next.id || next.contact) {
      requestAnimationFrame(() => form.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const o = findOrder(oid, c);
    if (o) onFound(o);
    else onMissing();
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    look(id, contact);
  };
  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    look(EXAMPLE.id, EXAMPLE.email);
  };

  return (
    <form ref={form} onSubmit={submit} noValidate aria-label="Find an order" className="grid gap-7">
      <Field
        label="Order number"
        name="order"
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="SM-0000-0000"
        value={id}
        onChange={(e) => setId(e.target.value)}
        error={err.id}
      />
      <Field
        label="Email or phone on the order"
        name="contact"
        autoComplete="email"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        error={err.contact}
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
        <button type="submit" className={s.btn}>
          Track
        </button>
        <button type="button" onClick={example} className={s.link}>
          Try the example order
        </button>
      </div>
    </form>
  );
}

function Waiting() {
  return (
    <div className="relative">
      <SunArc current={0} className="opacity-60" />
      <p className={`${s.display} mt-6 text-[clamp(2rem,4.4vw,3.2rem)] leading-[1.02]`}>Six stages, one day</p>
      <p className="mt-4 max-w-[34rem] text-[16px] leading-[1.7] text-[var(--muted)]">
        Every order is placed at dawn and arrives at nightfall on this page: confirmed against its batch record, packed in linen, handed to the courier and
        brought to your door. Enter the number from your confirmation, or try the example.
      </p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="flex min-h-[24rem] flex-col items-start justify-center">
      <svg width="52" height="52" viewBox="0 0 44 44" aria-hidden>
        <defs>
          <mask id="d09-track-moon">
            <rect width="44" height="44" fill="white" />
            <circle cx="30" cy="16" r="16" fill="black" />
          </mask>
        </defs>
        <circle cx="22" cy="22" r="17" style={{ fill: "var(--paper)" }} stroke="rgb(42 36 32 / 0.25)" mask="url(#d09-track-moon)" />
      </svg>
      <h2 className={`${s.display} mt-6 text-[clamp(2.4rem,5vw,3.6rem)] leading-none`}>No order at this hour</h2>
      <p className="mt-4 max-w-[32rem] text-[16px] leading-[1.7] text-[var(--muted)]">
        We could not find an order with that number and contact. The number is on your confirmation and starts with SM-; use the email or the mobile number
        you ordered with.
      </p>
      <p className="mt-3 max-w-[32rem] text-[15px] leading-[1.65] text-[var(--muted)]">
        Orders placed in this preview are saved in the browser they were placed from.
      </p>
    </div>
  );
}

function Result({ order, masked, current, t }: { order: Order; masked: boolean; current: number; t: ReturnType<typeof trackingFor> }) {
  const stage = t.stages[current];
  const count = order.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <article aria-labelledby="d09-track-h">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p className={`${s.tab} text-[15px] text-[var(--muted)]`}>
          Order {order.id}, placed {formatDate(order.placedAt, true)}
        </p>
        {order.userId === "example" && <p className="text-[13px] text-[var(--m-accent)]">The example order</p>}
      </div>
      <h2 id="d09-track-h" className={`${s.display} mt-2 text-[clamp(2.8rem,7vw,5.2rem)] leading-[0.92]`}>
        {order.status === "cancelled" ? "Cancelled" : order.status === "return-requested" ? "Return requested" : stage.label}
      </h2>
      <p className="mt-3 max-w-[36rem] text-[17px] leading-[1.65] text-[var(--muted)]">
        {order.status === "cancelled"
          ? "This order was cancelled before it shipped. Nothing was charged in the preview."
          : order.status === "return-requested"
            ? "We have your return request and will write with a pickup date."
            : stage.detail}
      </p>

      <div className="mt-8">
        <SunArc current={current} />
        {/* the six stages under the arc on wide screens, one under each point */}
        <ol className="mt-2 hidden grid-cols-6 gap-3 md:grid">
          {t.stages.map((st, i) => (
            <li key={st.key} aria-current={st.current ? "step" : undefined} className="text-center">
              <p className={`${s.display} text-[19px] leading-tight ${st.done ? "" : "text-[var(--muted)]"}`}>{st.label}</p>
              <p className={`${s.tab} mt-1 text-[12px] ${st.current ? "text-[var(--m-accent)]" : "text-[var(--muted)]"}`}>
                {st.done ? formatDate(st.at, true) : i === current + 1 ? "Next" : "To come"}
              </p>
            </li>
          ))}
        </ol>
        {/* phones: the same six stages down a line */}
        <ol className="mt-6 border-l border-[var(--hair)] pl-5 md:hidden">
          {t.stages.map((st, i) => (
            <li key={st.key} aria-current={st.current ? "step" : undefined} className="relative py-2.5">
              <span
                aria-hidden
                className={`absolute -left-[26px] top-[0.95rem] size-[11px] rounded-full border ${
                  st.done ? "border-[var(--m-accent)] bg-[var(--m-accent)]" : "border-[rgb(42_36_32/0.35)] bg-[var(--paper)]"
                } ${st.current ? "ring-4 ring-[var(--m-accent-soft)]" : ""}`}
              />
              <p className={`${s.display} text-[21px] leading-tight ${st.done ? "" : "text-[var(--muted)]"}`}>{st.label}</p>
              <p className={`${s.tab} text-[13px] ${st.current ? "text-[var(--m-accent)]" : "text-[var(--muted)]"}`}>
                {st.done ? formatDate(st.at, true) : i === current + 1 ? "Next" : "To come"}
              </p>
            </li>
          ))}
        </ol>
      </div>

      <dl className="mt-12 grid gap-x-10 gap-y-8 border-t border-[var(--hair)] pt-8 sm:grid-cols-2">
        <div>
          <dt className="text-[13px] text-[var(--muted)]">{t.delivered ? "Delivered" : "Estimated delivery"}</dt>
          <dd className={`${s.display} mt-1 text-[26px] leading-tight`}>
            {t.delivered ? formatDate(t.stages[5].at, true) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}
          </dd>
          <dd className="mt-1 text-[14px] text-[var(--muted)]">{order.delivery === "express" ? "Express, 1–2 working days" : "Standard, 3–5 working days"}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-[var(--muted)]">Courier</dt>
          {current >= 3 ? (
            <dd className="mt-1 text-[16px] leading-[1.6]">
              {order.courier.name}
              <span className="block text-[14px] text-[var(--muted)]">
                AWB <span className={s.tab}>{order.courier.awb}</span>
              </span>
            </dd>
          ) : (
            <dd className="mt-1 text-[16px] leading-[1.6]">
              {order.courier.name}
              <span className="block text-[14px] text-[var(--muted)]">The AWB number appears once the order ships.</span>
            </dd>
          )}
        </div>
        <div>
          <dt className="text-[13px] text-[var(--muted)]">Delivering to</dt>
          <dd className="mt-1">
            <AddressLines a={order.address} masked={masked} />
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-[var(--muted)]">
            {count} {count === 1 ? "piece" : "pieces"}, {formatINR(order.total)}
            {order.coupon && order.discount ? `, after ${order.coupon} (− ${formatINR(order.discount)})` : ""}
          </dt>
          <dd className="mt-2">
            <ul className="grid gap-3">
              {order.lines.map((l) => {
                const p = getProduct(l.slug);
                return (
                  <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-center gap-3">
                    {p && (
                      <span className={`${s.mask} ${s.circle} size-11 shrink-0`}>
                        <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="44px" />
                      </span>
                    )}
                    <span className="min-w-0 text-[15px] leading-snug">
                      <span className="block">{l.name}</span>
                      <span className="block text-[13px] text-[var(--muted)]">
                        {CONTENT[l.wood].name}
                        {l.optionLabel ? `, ${l.optionLabel}` : ""}, {l.qty} × {formatINR(l.unitPrice)}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </dd>
        </div>
      </dl>

      <p className="mt-10 flex items-start gap-3 rounded-[1.6rem] bg-[color-mix(in_srgb,var(--m-accent-soft)_70%,transparent)] px-5 py-4 text-[15px] leading-[1.6]">
        <span aria-hidden className="mt-[0.5rem] size-2 shrink-0 rounded-full bg-[var(--m-accent)]" />
        <span>
          Questions about this order? Reply to your order email with the number <span className={s.tab}>{order.id}</span>, and the workshop answers within a
          working day. In this preview the stages move on a short demonstration clock.
        </span>
      </p>
      {!masked && order.userId !== "example" && (
        <p className="mt-6">
          <Link href="/d/09/account" className={s.link}>
            All your orders
          </Link>
        </p>
      )}
    </article>
  );
}
