"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { EXAMPLE, findOrder, formatDate, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { useHydrated } from "@/lib/shop/store";
import { s } from "./cx";
import { Field } from "./forms";
import { JobCard, MiniRail } from "./JobCard";

/** Track your order: pull a job card by its number, or open one of your own. */
export function Track() {
  return (
    <div className="px-4 pb-10 pt-[84px] md:px-8 md:pt-[104px]">
      <div className="mx-auto max-w-[1400px]">
        <header className="grid border border-(--ink) bg-(--sheet) md:grid-cols-[1fr_auto]">
          <div className="px-5 py-5 md:px-7 md:py-6">
            <h1 className={`${s.x125} text-[clamp(2.4rem,5.6vw,5rem)] font-[600] leading-[0.9] tracking-[-0.03em]`}>Job card</h1>
            <p className="mt-3 max-w-[38rem] text-[16px] leading-[1.55] text-(--ink-2)">
              Every order travels the workshop as a job card through six stations, from placed to delivered. Pull yours by its number.
            </p>
          </div>
          <div className={`${s.mono} flex items-center gap-4 border-t border-(--hair-2) px-5 py-3 text-[11.5px] text-(--steel) md:border-l md:border-t-0 md:px-7`}>
            Placed, confirmed, packed, shipped, out, delivered
          </div>
        </header>
        <Suspense fallback={<div className="min-h-[50svh]" />}>
          <Tracker />
        </Suspense>
      </div>
    </div>
  );
}

function Tracker() {
  const hydrated = useHydrated();
  const params = useSearchParams();
  const o = params.get("o");
  const user = useUser();
  const mine = useOrders();
  const nowLive = useNow();
  const own = o ? mine.find((x) => x.id === o.trim().toUpperCase()) : undefined;
  const [id, setId] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [err, setErr] = useState<{ id?: string | null; contact?: string | null }>({});
  const [result, setResult] = useState<{ order: Order; isPublic: boolean } | "missing" | null>(null);
  const shown = result ?? (own ? { order: own, isPublic: false } : null);

  const look = (oid: string, c: string) => {
    const next = {
      id: /^SM-\d{4}-\d{4}$/i.test(oid.trim()) ? null : "Order numbers look like SM-2611-0412.",
      contact: c.trim() ? null : "Enter the email or mobile number on the order.",
    };
    setErr(next);
    if (next.id || next.contact) return;
    const hit = findOrder(oid, c);
    setResult(hit ? { order: hit, isPublic: !(user && hit.userId === user.id) } : "missing");
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    look(id, contact);
  };

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-12">
      <div className="lg:col-span-4">
        <form onSubmit={submit} noValidate className={`${s.sheet} ${s.corners} border border-(--hair-2) p-5 md:p-6`}>
          <p className={`${s.mono} text-[11px] text-(--steel)`}>Pull a card</p>
          <div className="mt-4 grid gap-5">
            <Field label="Order number" name="order" autoComplete="off" autoCapitalize="characters" value={id} onChange={(e) => setId(e.target.value)} error={err.id} />
            <Field label="Email or mobile on the order" name="email" autoComplete="email" value={contact} onChange={(e) => setContact(e.target.value)} error={err.contact} />
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button type="submit" className={s.btn}>
              Find the job card
            </button>
            <button
              type="button"
              className={s.link}
              onClick={() => {
                setId(EXAMPLE.id);
                setContact(EXAMPLE.email);
                look(EXAMPLE.id, EXAMPLE.email);
              }}
            >
              Try the example order
            </button>
          </div>
        </form>

        {hydrated && user && mine.length > 0 && (
          <div className="mt-8">
            <p className={`${s.mono} border-b border-(--ink) pb-2 text-[11px] text-(--steel)`}>Your recent orders</p>
            <ul>
              {mine.slice(0, 5).map((x) => (
                <li key={x.id}>
                  <button
                    type="button"
                    onClick={() => setResult({ order: x, isPublic: false })}
                    aria-pressed={shown !== "missing" && shown?.order.id === x.id}
                    className="grid w-full gap-1.5 border-b border-(--hair) px-1 py-3 text-left transition-colors hover:bg-(--wash) aria-pressed:bg-(--wash-2)"
                  >
                    <span className="flex items-baseline justify-between gap-3">
                      <span className={`${s.mono} text-[13px] tabular-nums`}>{x.id}</span>
                      <span className={`${s.mono} text-[11px] text-(--steel)`}>{formatDate(x.placedAt)}</span>
                    </span>
                    <MiniRail o={x} now={nowLive ?? x.placedAt} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="min-w-0 lg:col-span-8">
        {shown === "missing" ? (
          <div className="grid gap-6 border border-dashed border-(--ink) bg-(--sheet) px-6 py-12 md:grid-cols-[160px_1fr] md:items-center md:px-10">
            <svg viewBox="0 0 160 110" className="mx-auto w-36 text-(--ink)" aria-hidden>
              <path d="M14 10 H124 L146 32 V100 H14 Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeDasharray="5 3" />
              <path d="M124 10 V32 H146" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M30 48 H110 M30 62 H96 M30 76 H80" stroke="currentColor" strokeWidth="1" opacity="0.4" />
            </svg>
            <div>
              <p className={`${s.x110} text-[24px] font-[600] leading-tight`}>No job card under that number.</p>
              <p className="mt-2 max-w-[34rem] text-[16px] leading-[1.6] text-(--ink-2)">
                Check the number on your confirmation, SM- then four and four digits, and use the email or mobile you ordered with. Orders placed in another browser
                will not show in this preview.
              </p>
            </div>
          </div>
        ) : shown ? (
          <JobCard key={shown.order.id} order={shown.order} isPublic={shown.isPublic} />
        ) : (
          <div className={`${s.sheet} grid min-h-[22rem] place-items-center border border-dashed border-(--hair-2) px-6 py-12 text-center`}>
            <div>
              <div aria-hidden className="mx-auto flex w-fit items-center">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="flex items-center">
                    {i > 0 && <span className="h-px w-8 bg-(--hair-2) sm:w-12" />}
                    <span className="size-4 rounded-full border border-dashed border-(--ink-2)" />
                  </span>
                ))}
              </div>
              <p className={`${s.x110} mt-6 text-[22px] font-[600]`}>The job card shows here.</p>
              <p className="mt-2 text-[16px] text-(--ink-2)">Enter the order number, or try the example order.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
