"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { AddressLines } from "./AddressForm";
import { Field, SHOP, useHydrated } from "./bits";
import { StageThread } from "./StageThread";

const EASE = [0.22, 1, 0.36, 1] as const;
type Found = { order: Order; own: boolean } | "missing" | null;

/** Track an order: a lookup slip, the visitor's own orders, and the six beads of the result. */
export function Track() {
  const params = useSearchParams();
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const [id, setId] = useState(params.get("o") ?? "");
  const [contact, setContact] = useState("");
  const [found, setFound] = useState<Found>(null);
  const [err, setErr] = useState<{ id?: string; contact?: string }>({});
  const o = params.get("o");
  // ?o= naming the visitor's own order opens it straight away
  const direct = !found && o ? mine.find((x) => x.id === o.trim().toUpperCase()) : undefined;
  const shown: Found = found ?? (direct ? { order: direct, own: true } : null);

  const look = (e?: FormEvent, forced?: { id: string; contact: string }) => {
    e?.preventDefault();
    const q = forced ?? { id, contact };
    const next: { id?: string; contact?: string } = {};
    if (!q.id.trim()) next.id = "Please enter the order number, for example SM-2611-0412.";
    if (!q.contact.trim()) next.contact = "Please enter the email or mobile number on the order.";
    setErr(next);
    if (next.id || next.contact) return;
    const own = mine.find((x) => x.id === q.id.trim().toUpperCase());
    const hit = own && (own.email === q.contact.trim().toLowerCase() || own.phone.endsWith(q.contact.replace(/\D/g, "").slice(-10))) ? own : findOrder(q.id, q.contact);
    setFound(hit ? { order: hit, own: Boolean(own && hit.userId === own.userId && hit.id === own.id) } : "missing");
  };

  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    look(undefined, { id: EXAMPLE.id, contact: EXAMPLE.email });
  };

  return (
    <div className="mx-auto max-w-[1360px] px-4 pb-28 pt-28 md:px-10 md:pt-36">
      <div className="grid gap-12 md:grid-cols-12 md:gap-10">
        <div className="md:col-span-5">
          <h1 className="s3-serif text-[clamp(3rem,7vw,6.4rem)] leading-[0.9]">
            Follow
            <br />
            the thread
          </h1>
          <p className="mt-5 max-w-[28rem] text-[17px] leading-[1.6] text-(--ink)/75">
            Six beads from the workshop to your door. Enter the order number and the email or mobile number you ordered with.
          </p>
        </div>
        <form onSubmit={look} noValidate aria-label="Find an order" className="relative grid gap-4 rounded-[28px] bg-(--warm) p-6 md:col-span-6 md:col-start-7 md:p-8">
          <span className="s3-knot absolute -top-[5px] left-10" aria-hidden />
          <Field label="Order number" error={err.id}>
            {(a) => <input {...a} name="order" autoComplete="off" spellCheck={false} value={id} onChange={(e) => setId(e.target.value)} placeholder="SM-2611-0412" className="s3-input uppercase" />}
          </Field>
          <Field label="Email or mobile number on the order" error={err.contact}>
            {(a) => <input {...a} name="email" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} className="s3-input" />}
          </Field>
          <div className="flex flex-wrap items-center gap-3">
            <button type="submit" className="s3-btn s3-btn-dark">
              <span className="s3-bead s3-btn-bead" aria-hidden />
              Track the order
            </button>
            <button type="button" className="s3-btn s3-btn-line" onClick={example}>
              Try the example order
            </button>
          </div>
          {hydrated && user && mine.length > 0 && (
            <div className="border-t border-(--line) pt-4">
              <p className="text-[14px] text-(--muted)">Your recent orders</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {mine.slice(0, 4).map((x) => (
                  <li key={x.id}>
                    <button type="button" className="s3-chip tabular-nums" onClick={() => setFound({ order: x, own: true })}>
                      <span className="s3-bead h-2.5 w-2.5" aria-hidden />
                      {x.id}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </form>
      </div>

      <div aria-live="polite">
        {shown === "missing" && <NotFound />}
        {shown && shown !== "missing" && <Result key={shown.order.id + shown.order.placedAt} order={shown.order} own={shown.own} />}
      </div>
    </div>
  );
}

function Result({ order: o, own }: { order: Order; own: boolean }) {
  const now = useNow();
  const t = trackingFor(o, now ?? o.placedAt);
  const stage = t.stages[t.current];
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE }}
      className="mt-20 border-t border-(--thread) pt-10 md:mt-24"
      aria-label={`Order ${o.id}`}
    >
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-[15px] text-(--muted)">
            Order <span className="tabular-nums text-(--ink)">{o.id}</span>, placed {formatDate(o.placedAt, true)}
          </p>
          <h2 className="s3-serif mt-2 text-[clamp(2.2rem,4.6vw,4rem)] leading-[0.95]">
            {o.status === "cancelled" ? "Cancelled" : o.status === "return-requested" ? "Return requested" : stage.label}
          </h2>
          <p className="mt-3 max-w-[34rem] text-[16px] leading-[1.6] text-(--ink)/80">
            {o.status === "cancelled"
              ? "This order was cancelled before it shipped. Nothing will be sent and nothing was charged."
              : o.status === "return-requested"
                ? "We have your return request and will write about the pickup."
                : stage.detail}
          </p>
        </div>
        {!o.status && (
          <p className="text-right">
            <span className="block text-[14px] text-(--muted)">{t.delivered ? "Delivered" : "Expected"}</span>
            <span className="s3-serif block text-[26px] leading-tight">
              {t.delivered ? formatDate(t.stages[5].at) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}
            </span>
          </p>
        )}
      </div>

      <div className="mt-12">
        <StageThread t={t} status={o.status} />
      </div>

      <div className="mt-14 grid gap-10 md:grid-cols-12">
        <div className="md:col-span-6">
          <h3 className="text-[14px] text-(--muted)">On this thread</h3>
          <ul className="mt-3 space-y-4">
            {o.lines.map((l) => (
              <li key={`${l.slug}-${l.option ?? ""}`} className="flex items-center gap-4">
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_rgba(176,141,87,0.55)]">
                  <Photo p={{ id: l.photoId, alt: l.name }} sizes="56px" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[16px]">{l.name}</span>
                  <span className="block text-[14px] text-(--muted)">
                    {CONTENT[l.wood].name}
                    {l.optionLabel ? `, ${l.optionLabel}` : ""}
                    {l.qty > 1 ? `, ${l.qty} pieces` : ""}
                  </span>
                </span>
                <span className="text-[15px] tabular-nums">{formatINR(l.unitPrice * l.qty)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 flex flex-wrap items-baseline gap-3 border-t border-(--line) pt-4">
            <span className="text-[14px] text-(--muted)">Total</span>
            <span className="s3-serif text-[26px]">{formatINR(o.total)}</span>
            {o.coupon && o.discount ? <span className="text-[14px] text-(--m-accent)">{o.coupon}, −{formatINR(o.discount)}</span> : null}
          </p>
        </div>
        <dl className="grid gap-5 sm:grid-cols-2 md:col-span-5 md:col-start-8">
          <div>
            <dt className="text-[14px] text-(--muted)">Delivering to</dt>
            <dd className="mt-1">
              <AddressLines a={o.address} masked={!own} />
            </dd>
          </div>
          <div>
            <dt className="text-[14px] text-(--muted)">Courier</dt>
            <dd className="mt-1 text-[16px] leading-[1.55]">
              {o.courier.name}
              <br />
              <span className="tabular-nums">AWB {o.courier.awb}</span>
              {t.current < 3 && <span className="block text-[14px] text-(--muted)">Live with the courier once shipped</span>}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[14px] text-(--muted)">Need help?</dt>
            <dd className="mt-1 text-[16px] leading-[1.55]">
              Write to us with the number {o.id} and we will answer within a working day.
              {own && (
                <>
                  {" "}
                  <Link href="/d/03/account" className="s3-link">
                    Cancel or return from your account
                  </Link>
                </>
              )}
            </dd>
          </div>
        </dl>
      </div>
    </motion.section>
  );
}

function NotFound() {
  return (
    <section className="mt-20 flex flex-col items-center border-t border-(--thread) pt-14 text-center">
      <svg width="220" height="40" viewBox="0 0 220 40" aria-hidden>
        <path d="M0 20 C 40 20, 60 22, 92 21" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        <path d="M128 23 C 160 24, 180 20, 220 20" fill="none" stroke="var(--thread)" strokeWidth="1.3" />
        <circle cx="92" cy="21" r="4" fill="#8f6c3c" />
        <circle cx="128" cy="23" r="4" fill="#8f6c3c" />
      </svg>
      <h2 className="s3-serif mt-8 text-[clamp(2rem,4vw,3.2rem)] leading-none">We couldn&apos;t find that thread</h2>
      <p className="mt-4 max-w-[30rem] text-[16px] leading-[1.6] text-(--ink)/75">
        Check the number on your confirmation, and use the same email or mobile number you ordered with. Orders in this preview live in the browser they were placed in.
      </p>
      <Link href={SHOP} className="s3-link mt-6 text-[15px]">
        Back to the shop
      </Link>
    </section>
  );
}
