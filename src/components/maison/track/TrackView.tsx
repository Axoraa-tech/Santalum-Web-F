"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { EXAMPLE, findOrder, formatDate, STAGES, trackingFor, useNow, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { AddressLines } from "../account/AddressForm";
import { Field } from "../forms/Field";
import { OrderItems, rowsFromOrder } from "../orders/OrderItems";
import { Pill } from "../Pill";
import { CheckIcon } from "../shop/Icons";
import { WT } from "../W";
import { GrowthRings } from "./GrowthRings";

const EASE = [0.22, 1, 0.36, 1] as const;
const SHIPPED = STAGES.findIndex((s) => s.key === "shipped");

type Found = { order: Order; masked: boolean };

/** Reads ?o= (inside Suspense) and resets the tracker when it changes. */
export function TrackView() {
  const o = useSearchParams().get("o")?.trim().toUpperCase() || null;
  return <Tracker key={o ?? ""} o={o} />;
}

export function TrackFallback() {
  return (
    <div className="mx-auto min-h-[80svh] max-w-[1500px] px-5 pt-28 md:px-10 md:pt-36" aria-busy="true">
      <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Track your order</h1>
    </div>
  );
}

function Tracker({ o }: { o: string | null }) {
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const [num, setNum] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ num?: string | null; contact?: string | null }>({});
  const [picked, setPicked] = useState<Found | "none" | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // ?o= that names the visitor's own order shows straight away.
  const own = o ? mine.find((x) => x.id === o) : undefined;
  const found: Found | "none" | null = picked ?? (own ? { order: own, masked: false } : null);

  const reveal = (f: Found | "none") => {
    setPicked(f);
    requestAnimationFrame(() => {
      if (window.innerWidth < 1024) resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const lookup = (id: string, who: string) => {
    const key = id.trim().toUpperCase();
    const ownHit = mine.find((x) => x.id === key);
    if (ownHit) return reveal({ order: ownHit, masked: false });
    const hit = findOrder(key, who);
    reveal(hit ? { order: hit, masked: hit.userId !== user?.id } : "none");
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const isOwn = mine.some((x) => x.id === num.trim().toUpperCase());
    const next = {
      num: /^SM-\d{4}-\d{4}$/i.test(num.trim()) ? null : "Order numbers look like SM-2611-0412.",
      contact: isOwn || contact.trim().length >= 6 ? null : "Please enter the email or mobile number on the order.",
    };
    setErrors(next);
    if (next.num || next.contact) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    lookup(num, contact);
  };

  const tryExample = () => {
    setNum(EXAMPLE.id);
    setContact(EXAMPLE.email);
    setErrors({});
    lookup(EXAMPLE.id, EXAMPLE.email);
  };

  return (
    <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-28 md:px-10 md:pt-36">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h1 className="font-display text-[clamp(3rem,7vw,6.5rem)] font-[350] leading-[0.92] tracking-[-0.035em]">Track your order</h1>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
            <WT
              red="Every red sandalwood piece is checked against its batch record before it leaves. Follow it from the workshop to your door, one ring at a time."
              white="Every bottle and carving is checked against its lot before it leaves. Follow it from the workshop to your door, one ring at a time."
            />
          </p>

          <form onSubmit={submit} noValidate className="mt-10 space-y-3 rounded-[2.25rem] bg-(--mz-surface) p-4 md:p-6">
            <Field label="Order number" name="order" autoComplete="off" autoCapitalize="characters" value={num} onChange={(e) => setNum(e.target.value)} error={errors.num} className="[&_input]:bg-(--mz-bg)" />
            <Field
              label="Email or mobile on the order"
              name="email"
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              error={errors.contact}
              className="[&_input]:bg-(--mz-bg)"
            />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Pill type="submit" size="lg" className="min-w-[10rem]">
                Track
              </Pill>
              <Pill variant="line" size="lg" onClick={tryExample}>
                Try the example order
              </Pill>
            </div>
          </form>

          {hydrated && user && mine.length > 0 && (
            <div className="mt-10">
              <p className="text-[14px] text-(--mz-ink-3)">Your recent orders</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {mine.slice(0, 6).map((x) => {
                  const on = found && found !== "none" && found.order.id === x.id;
                  return (
                    <li key={x.id}>
                      <button
                        type="button"
                        aria-pressed={!!on}
                        onClick={() => {
                          setNum(x.id);
                          reveal({ order: x, masked: false });
                        }}
                        className={`rounded-full px-4 py-2.5 text-[14px] tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent) ${
                          on ? "bg-(--mz-ink) text-(--mz-bg)" : "bg-(--mz-surface) text-(--mz-ink-2) hover:text-(--mz-ink)"
                        }`}
                      >
                        {x.id}
                        <span className="ml-2 opacity-60">{formatDate(x.placedAt)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {hydrated && !user && (
            <p className="mt-8 max-w-md text-[14px] leading-relaxed text-(--mz-ink-3)">
              Signed in, your orders are listed here and open without the email.{" "}
              <Link href="/maison/account" className="rounded-sm text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-(--mz-accent)">
                Sign in
              </Link>
            </p>
          )}
        </div>

        <div ref={resultRef} className="scroll-mt-24 lg:col-span-7">
          <AnimatePresence mode="wait" initial={false}>
            {found === "none" ? (
              <motion.div key="none" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <NotFound onExample={tryExample} />
              </motion.div>
            ) : found ? (
              <motion.div key={found.order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <Result order={found.order} masked={found.masked} />
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Idle />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function Idle() {
  return (
    <div className="grid items-center gap-10 rounded-[2.5rem] bg-(--mz-surface) p-6 md:grid-cols-[auto_1fr] md:p-10">
      <GrowthRings current={2} live={false} className="mx-auto size-56 opacity-80 md:size-64" />
      <ol className="space-y-3 text-[15px]">
        {STAGES.map((s, i) => (
          <li key={s.key} className="grid grid-cols-[1.75rem_1fr] gap-3">
            <span className="font-display tabular-nums text-(--mz-ink-3)">{i + 1}</span>
            <span>
              <span className="block text-(--mz-ink)">{s.label}</span>
              <span className="block text-[14px] leading-snug text-(--mz-ink-3)">{s.detail}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function NotFound({ onExample }: { onExample: () => void }) {
  return (
    <div className="grid items-center gap-10 rounded-[2.5rem] border border-dashed border-(--mz-ink)/15 p-6 md:grid-cols-[auto_1fr] md:p-10">
      <span className="relative mx-auto block size-40">
        <span className="absolute inset-0 rounded-full border border-dashed border-(--mz-ink)/25" />
        <span className="absolute inset-[18%] rounded-full border border-dashed border-(--mz-ink)/20" />
        <span className="absolute inset-[36%] rounded-full border border-dashed border-(--mz-ink)/15" />
        <span className="absolute inset-[47%] rounded-full bg-(--mz-ink)/25" />
      </span>
      <div>
        <h2 className="font-display text-[34px] leading-[1] tracking-[-0.02em]">No order by that number</h2>
        <p className="mt-4 max-w-md text-[16px] leading-relaxed text-(--mz-ink-2)">
          Check the number on your confirmation, and use the same email or mobile number you gave at checkout. Orders placed in another browser are not visible in this preview.
        </p>
        <Pill variant="line" onClick={onExample} className="mt-6">
          Try the example order
        </Pill>
      </div>
    </div>
  );
}

function Result({ order, masked }: { order: Order; masked: boolean }) {
  const now = useNow(5_000);
  const t = trackingFor(order, now ?? order.placedAt);
  const stage = t.stages[t.current];
  const shipped = t.current >= SHIPPED;
  const example = order.id === EXAMPLE.id;
  return (
    <div className="rounded-[2.5rem] bg-(--mz-surface) p-5 md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[14px] text-(--mz-ink-3)">
            Order <span className="tabular-nums text-(--mz-ink-2)">{order.id}</span>
            {example ? ", the example" : ""}, placed {formatDate(order.placedAt, true)}
          </p>
          <h2 className="mt-2 font-display text-[clamp(2.4rem,4.4vw,3.8rem)] font-[350] leading-[0.95] tracking-[-0.03em] text-(--mz-accent)" aria-live="polite">
            {order.status === "cancelled" ? "Cancelled" : order.status === "return-requested" ? "Return requested" : stage.label}
          </h2>
          <p className="mt-2 max-w-md text-[16px] leading-relaxed text-(--mz-ink-2)">
            {order.status === "cancelled"
              ? "This order was cancelled before it shipped."
              : order.status === "return-requested"
                ? "The workshop will write within a working day to arrange a collection."
                : stage.detail}
          </p>
        </div>
        <p className="flex items-center gap-2 rounded-full bg-(--mz-bg) px-3.5 py-1.5 text-[13px] text-(--mz-ink-2)">
          <span className="mz-ring-now size-2 rounded-full bg-(--mz-accent)" />
          Updates as it moves
        </p>
      </div>

      <div className="mt-10 grid items-start gap-10 md:grid-cols-[minmax(0,17rem)_1fr]">
        <figure>
          <GrowthRings current={t.current} className="mx-auto w-full max-w-[17rem]" />
          <figcaption className="mt-3 text-center text-[13px] text-(--mz-ink-3)">Each ring is a stage. The bark is your door.</figcaption>
        </figure>
        <ol className="relative space-y-5">
          {t.stages.map((s, i) => (
            <li key={s.key} className="grid grid-cols-[2rem_1fr] gap-3">
              <span
                className={`mt-0.5 grid size-7 place-items-center rounded-full border text-[12px] transition-colors duration-700 ${
                  s.current ? "border-(--mz-accent) bg-(--mz-accent) text-(--mz-bg)" : s.done ? "border-(--mz-accent)/40 bg-(--mz-accent-soft) text-(--mz-accent-deep)" : "border-dashed border-(--mz-ink)/25 text-(--mz-ink-3)"
                }`}
              >
                {s.done && !s.current ? <CheckIcon /> : i + 1}
              </span>
              <span>
                <span className="flex flex-wrap items-baseline justify-between gap-x-4">
                  <span className={`text-[16px] ${s.done ? "text-(--mz-ink)" : "text-(--mz-ink-3)"}`}>{s.label}</span>
                  <span className="text-[13px] tabular-nums text-(--mz-ink-3)">{s.done ? formatDate(s.at, true) : "Still to come"}</span>
                </span>
                {(s.done || i === t.current + 1) && <span className="mt-0.5 block text-[14px] leading-snug text-(--mz-ink-2)">{s.detail}</span>}
              </span>
            </li>
          ))}
        </ol>
      </div>

      <dl className="mt-10 grid gap-6 border-t border-dashed border-(--mz-ink)/15 pt-8 sm:grid-cols-3">
        <div>
          <dt className="text-[13px] text-(--mz-ink-3)">{t.delivered ? "Delivered" : "Expected"}</dt>
          <dd className="mt-1 text-[16px]">{t.delivered ? formatDate(stage.at, true) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}</dd>
        </div>
        <div>
          <dt className="text-[13px] text-(--mz-ink-3)">Courier</dt>
          <dd className="mt-1 text-[16px]">
            {shipped ? (
              <>
                {order.courier.name}
                <span className="block text-[14px] tabular-nums text-(--mz-ink-2)">AWB {order.courier.awb}</span>
              </>
            ) : (
              <>
                {order.courier.name}
                <span className="block text-[14px] text-(--mz-ink-2)">AWB issued when it ships</span>
              </>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-[13px] text-(--mz-ink-3)">Deliver to</dt>
          <dd className="mt-1">
            <AddressLines a={order.address} masked={masked} className="text-[15px]" />
          </dd>
        </div>
      </dl>

      <div className="mt-10 border-t border-dashed border-(--mz-ink)/15 pt-8">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <p className="text-[13px] text-(--mz-ink-3)">In this order</p>
          <p className="text-right font-display text-[22px] tabular-nums">
            {formatINR(order.total)}
            {order.discount ? <span className="block font-ui text-[13px] text-(--mz-accent-deep)">{order.coupon} saved {formatINR(order.discount)}</span> : null}
          </p>
        </div>
        <OrderItems rows={rowsFromOrder(order.lines)} />
      </div>

      <p className="mt-10 rounded-2xl bg-(--mz-bg) px-5 py-4 text-[14px] leading-relaxed text-(--mz-ink-2)">
        Need help with this order? Reply to your order email quoting {order.id}, and the workshop will answer within one working day.
        {masked ? " The street address is hidden here because this lookup is public." : ""}
      </p>
    </div>
  );
}
