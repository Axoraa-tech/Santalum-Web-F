"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { Field, Submit } from "./forms";
import { IconCheck } from "./Icons";
import { LinePhoto } from "./shots";
import { ACCOUNT, EASE, SHOP } from "./store";

type Found = { order: Order; isPublic: boolean };

/** Track your order: a lookup card, then the six stages as a stack of cards, the current one on top. */
export function TrackStack() {
  return (
    <main className="px-2 pt-2 md:px-3 md:pt-3 lg:px-[14px] lg:pt-[14px]">
      <Suspense fallback={<div className="h-[70svh] rounded-[28px] bg-(--s7-sage) md:rounded-[40px] lg:rounded-[48px]" />}>
        <Tracker />
      </Suspense>
    </main>
  );
}

function Tracker() {
  const hydrated = useHydrated();
  const o = useSearchParams().get("o");
  const user = useUser();
  const mine = useOrders();
  const [found, setFound] = useState<Found | "missing" | null>(null);
  const [id, setId] = useState("");
  const [contact, setContact] = useState("");
  const [errs, setErrs] = useState<{ id?: string; contact?: string }>({});

  const own = hydrated && o ? mine.find((x) => x.id === o.trim().toUpperCase()) : undefined;
  const shown: Found | "missing" | null = found ?? (own ? { order: own, isPublic: false } : null);

  const look = (oid: string, c: string) => {
    const next: typeof errs = {};
    if (!oid.trim()) next.id = "Please enter the order number.";
    if (!c.trim()) next.contact = "Please enter the email or mobile on the order.";
    setErrs(next);
    if (next.id || next.contact) return;
    const hit = findOrder(oid, c);
    const isMine = !!hit && mine.some((m) => m.id === hit.id);
    setFound(hit ? { order: hit, isPublic: !isMine } : "missing");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    look(id, contact);
  };
  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    look(EXAMPLE.id, EXAMPLE.email);
  };

  return (
    <div className="grid gap-3 lg:grid-cols-12 lg:gap-[14px]">
      <section className="self-start rounded-[28px] bg-(--s7-sage) px-5 pb-7 pt-6 md:rounded-[40px] md:px-8 lg:sticky lg:top-[14px] lg:col-span-5 lg:rounded-[48px] lg:px-10 lg:pt-8">
        <h1 className="d1 text-[clamp(3.4rem,8vw,7rem)]">Track your order</h1>
        <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-(--s7-body)">
          The order number is on your confirmation. Add the email or mobile number on the order and the stages appear as a stack of cards.
        </p>
        <form onSubmit={submit} noValidate className="mt-6 grid gap-4 rounded-[24px] bg-(--s7-surface) p-4 md:p-5">
          <Field label="Order number" name="order" value={id} onChange={(e) => setId(e.target.value)} placeholder="SM-2611-0412" autoComplete="off" error={errs.id} className="[&_input]:uppercase" />
          <Field label="Email or mobile on the order" name="contact" value={contact} onChange={(e) => setContact(e.target.value)} autoComplete="email" error={errs.contact} />
          <div className="flex flex-wrap items-center gap-3">
            <Submit>Find the order</Submit>
            <button type="button" onClick={example} className="h-12 rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-page) active:scale-[0.98]">
              Try the example order
            </button>
          </div>
        </form>
        {hydrated && user && mine.length > 0 && (
          <div className="mt-5">
            <p className="text-[14px] text-(--s7-muted)">Your recent orders</p>
            <ul className="mt-2 grid gap-1.5">
              {mine.slice(0, 4).map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => setFound({ order: m, isPublic: false })}
                    className="flex w-full items-center justify-between gap-3 rounded-[18px] bg-(--s7-surface)/70 px-4 py-3 text-left transition hover:bg-(--s7-surface)"
                  >
                    <span className="num font-medium">{m.id}</span>
                    <span className="num text-[14px] text-(--s7-muted)">
                      {formatDate(m.placedAt)}, {formatINR(m.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section aria-live="polite" className="lg:col-span-7">
        {shown === "missing" ? (
          <div className="rounded-[28px] bg-(--s7-surface) px-5 py-10 md:rounded-[40px] md:px-10 md:py-14 lg:rounded-[48px]">
            <p className="d2 text-[clamp(2.4rem,5vw,4.4rem)]">No order with those details</p>
            <p className="mt-3 max-w-[48ch] text-[16px] leading-relaxed text-(--s7-muted)">
              Check the number on your confirmation (it starts with SM) and use the same email or mobile you ordered with. Orders placed in another
              browser cannot be seen here during the preview.
            </p>
            <button type="button" onClick={() => setFound(null)} className="mt-6 h-12 rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 hover:bg-(--s7-page)">
              Try again
            </button>
          </div>
        ) : shown ? (
          <Result key={shown.order.id} found={shown} />
        ) : (
          <Waiting />
        )}
      </section>
    </div>
  );
}

function Waiting() {
  return (
    <div aria-hidden className="relative h-[420px] md:h-[560px]">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="absolute inset-x-0 rounded-[28px] bg-(--s7-surface) shadow-[0_-18px_40px_-30px_rgba(27,23,18,0.45)] md:rounded-[40px]"
          style={{ top: i * 56, height: 200, transform: `scale(${0.88 + i * 0.024})`, opacity: 0.35 + i * 0.12 }}
        />
      ))}
      <p className="absolute inset-x-0 bottom-10 px-8 text-center text-[16px] text-(--s7-muted)">Six cards, from order placed to delivered, wait here.</p>
    </div>
  );
}

function Result({ found }: { found: Found }) {
  const { order: o, isPublic } = found;
  const now = useNow() ?? o.placedAt;
  const t = trackingFor(o, now);
  const stopped = o.status === "cancelled";
  const a = o.address;
  const street = isPublic ? `${a.line1.slice(0, 3)}${"•".repeat(8)}` : [a.line1, a.line2].filter(Boolean).join(", ");

  return (
    <div className="grid gap-3">
      <div className="rounded-[28px] bg-(--s7-surface) px-5 pb-6 pt-6 md:rounded-[40px] md:px-8">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[14px] text-(--s7-muted)">
              {o.userId === "example" ? "The example order" : "Order"}, placed {formatDate(o.placedAt, true)}
            </p>
            <p className="d1 num mt-1 text-[clamp(2.8rem,6vw,5rem)]">{o.id}</p>
          </div>
          {o.status ? (
            <span className="rounded-full bg-(--s7-ink)/10 px-3.5 py-1.5 text-[14px] font-medium">{stopped ? "Cancelled" : "Return requested"}</span>
          ) : (
            <p className="text-right">
              <span className="block text-[13px] text-(--s7-muted)">{t.delivered ? "Delivered" : "Expected at your door"}</span>
              <span className="d3 text-[22px]">{t.delivered ? formatDate(t.stages[5].at, true) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}</span>
            </p>
          )}
        </div>
      </div>

      {/* the stages: done ones folded into a pile, the current one open, the rest waiting below */}
      <ol className="relative">
        {t.stages.map((s, i) => {
          const state = stopped ? (i === 0 ? "done" : "next") : s.done && !s.current ? "done" : s.current ? "current" : "next";
          return (
            <motion.li
              key={s.key}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.06, ease: EASE }}
              style={{ zIndex: state === "current" ? 20 : state === "done" ? 10 + i : 10 - i }}
              className={`relative rounded-[24px] md:rounded-[32px] ${
                state === "current"
                  ? "bg-(--s7-accent-soft) px-5 py-6 shadow-[0_24px_50px_-30px_rgba(27,23,18,0.55)] md:px-8 md:py-8"
                  : state === "done"
                    ? "-mb-3 bg-(--s7-clay) px-5 pb-6 pt-4 shadow-[0_-12px_30px_-26px_rgba(27,23,18,0.5)] md:px-8"
                    : "-mt-4 bg-(--s7-stone) px-5 pb-4 pt-8 opacity-80 md:px-8"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  aria-hidden
                  className={`grid shrink-0 place-items-center rounded-full ${
                    state === "current" ? "s7-live size-4 bg-(--s7-accent)" : state === "done" ? "size-7 bg-(--s7-ink) text-(--s7-page)" : "size-7 ring-1 ring-(--s7-ink)/25"
                  }`}
                >
                  {state === "done" && <IconCheck width={13} height={13} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={state === "current" ? "d1 text-[clamp(2.6rem,5vw,4.2rem)]" : "text-[16px] font-medium"}>{s.label}</p>
                  {state === "current" && <p className="mt-2 max-w-[46ch] text-[16px] leading-relaxed text-(--s7-body)">{s.detail}</p>}
                </div>
                <span className="num shrink-0 text-[13.5px] text-(--s7-muted)">{state === "next" ? "To come" : formatDate(s.at, true)}</span>
              </div>
            </motion.li>
          );
        })}
      </ol>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <dl className="grid content-start gap-3 rounded-[24px] bg-(--s7-surface) p-5 text-[15px] md:rounded-[32px] md:p-6">
          <div>
            <dt className="text-[13px] text-(--s7-muted)">Courier</dt>
            <dd>{t.current >= 3 ? `${o.courier.name}, AWB ${o.courier.awb}` : `${o.courier.name}. The AWB is issued when it ships.`}</dd>
          </div>
          <div>
            <dt className="text-[13px] text-(--s7-muted)">Going to</dt>
            <dd>
              {a.name}
              <br />
              {street}
              <br />
              {a.city}, {a.state} <span className="num">{a.pin}</span>
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-(--s7-muted)">Help</dt>
            <dd className="text-(--s7-body)">Questions about this order? Write to the workshop with the order number and we answer within a working day.</dd>
          </div>
        </dl>
        <div className="rounded-[24px] bg-(--s7-clay) p-5 md:rounded-[32px] md:p-6">
          <p className="text-[13px] text-(--s7-muted)">In the parcel</p>
          <ul className="mt-2 grid gap-2">
            {o.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-center gap-3 text-[15px]">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-[14px]">
                  <LinePhoto line={l} sizes="48px" />
                </span>
                <span className="min-w-0 flex-1">
                  {l.name}
                  <span className="block text-[13px] text-(--s7-muted)">
                    {CONTENT[l.wood].name}
                    {l.optionLabel ? `, ${l.optionLabel}` : ""}
                  </span>
                </span>
                <span className="num">&times; {l.qty}</span>
              </li>
            ))}
          </ul>
          <p className="num mt-3 flex items-baseline justify-between border-t border-(--s7-ink)/10 pt-3">
            <span className="text-(--s7-muted)">Total{o.discount ? `, after ${o.coupon}` : ""}</span>
            <span className="d2 text-[30px]">{formatINR(o.total)}</span>
          </p>
          {!isPublic && (
            <Link href={ACCOUNT} className="mt-3 inline-block text-[14.5px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4">
              Cancel or return from your account
            </Link>
          )}
          {isPublic && o.userId === "example" && (
            <Link href={SHOP} className="mt-3 inline-block text-[14.5px] font-medium underline decoration-(--s7-ink)/25 underline-offset-4">
              Start a real order in the shop
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
