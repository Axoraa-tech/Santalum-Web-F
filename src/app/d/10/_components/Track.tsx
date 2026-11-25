"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, STAGES, trackingFor, useNow, useOrder, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR } from "@/lib/shop/products";
import k from "../k";
import { Field, Stretch } from "./bits";
import { AddressLines, Submit } from "./forms";
import { splitName } from "./lib";

/** Reads ?o= inside Suspense. Keyed by it, so a new order number starts a fresh lookup. */
export function TrackRoute() {
  const o = useSearchParams().get("o");
  return <Track o={o} key={o ?? ""} />;
}

type Found = { order: Order; pub: boolean } | "none" | null;

/**
 * Track your order. The lookup is two large fields; the result sets the current stage huge,
 * and the six stages below condense around it: done in ink, the current one wide, the rest hairline.
 */
export function Track({ o }: { o: string | null }) {
  const user = useUser();
  const mine = useOrders();
  const own = useOrder(o);
  const now = useNow();
  const [found, setFound] = useState<Found>(null);
  const [id, setId] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [errs, setErrs] = useState<{ id?: string; contact?: string }>({});
  const formRef = useRef<HTMLDivElement>(null);

  const result = found && found !== "none" ? found : own && found === null ? { order: own, pub: false } : null;

  const lookup = (orderId: string, who: string) => {
    const e = {
      id: orderId.trim() ? undefined : "Please enter the order number. It starts with SM-.",
      contact: who.trim() ? undefined : "Please enter the email or mobile number on the order.",
    };
    setErrs(e);
    if (e.id || e.contact) return;
    const hit = findOrder(orderId, who);
    setFound(hit ? { order: hit, pub: hit.userId !== user?.id } : "none");
    window.scrollTo({ top: 0 });
  };
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    lookup(id, contact);
  };
  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    lookup(EXAMPLE.id, EXAMPLE.email);
  };
  const reset = () => {
    setFound(null);
    if (o) window.history.replaceState(null, "", "/d/10/track");
  };

  if (result) return <Result order={result.order} pub={result.pub} onReset={reset} />;

  return (
    <div className={`${k.gut} pb-20 pt-24 md:pt-32`}>
      <p className={`${k.mono} text-[var(--k10-grey)]`}>From the workshop to your door, in six stages</p>
      <Stretch text="Track your order" cap={0.28} className="mt-3" />

      <div className="mt-10 grid grid-cols-1 gap-14 border-t border-[var(--k10-ink)] pt-8 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <div ref={formRef} className="min-w-0 lg:col-span-7">
          {found === "none" && (
            <div role="status" className="mb-10">
              <p className={`${k.disp} whitespace-normal text-[length:clamp(52px,8vw,130px)] leading-[0.82] text-[var(--k10-grey)] [font-variation-settings:'wdth'_50,'wght'_260]`}>
                No order by that number
              </p>
              <p className={`${k.monoL} mt-5 max-w-[58ch]`}>
                Check the number (it starts with SM-) and use the email or mobile given at checkout. In this preview, orders live in the browser they were
                placed in, so an order from another device will not show here.
              </p>
            </div>
          )}
          <form onSubmit={submit} noValidate className="grid gap-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <Field
                label="Order number"
                name="order"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder="SM-2611-0412"
                value={id}
                onChange={(e) => setId(e.target.value)}
                error={errs.id}
              />
              <Field label="Email or mobile on the order" name="contact" autoComplete="email" spellCheck={false} value={contact} onChange={(e) => setContact(e.target.value)} error={errs.contact} />
            </div>
            <Submit>Track</Submit>
          </form>
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <button type="button" onClick={example} data-ghost className={k.mini}>
              Try the example order
            </button>
            <p className={`${k.mono} text-[var(--k10-grey)]`}>
              {EXAMPLE.id}, with {EXAMPLE.email}
            </p>
          </div>
        </div>

        <aside className="lg:col-span-4 lg:col-start-9">
          {user ? (
            <>
              <p className={`${k.mono} text-[var(--k10-grey)]`}>Your recent orders, {user.name.split(/\s+/)[0]}</p>
              {mine.length ? (
                <ul className="mt-3 border-t border-[var(--k10-ink)]">
                  {mine.slice(0, 5).map((m) => {
                    const off = m.status === "cancelled";
                    const state = off ? "Cancelled" : m.status === "return-requested" ? "Return requested" : STAGES[trackingFor(m, now ?? m.placedAt).current].label;
                    return (
                      <li key={m.id} className={`${k.row} border-b border-[var(--k10-line)]`} style={{ ["--hw" as string]: 96 }}>
                        <button
                          type="button"
                          onClick={() => setFound({ order: m, pub: false })}
                          aria-label={`${m.id}, ${state}, placed ${formatDate(m.placedAt)}`}
                          className="flex w-full items-baseline justify-between gap-4 py-2 text-left"
                        >
                          <span className={`${k.rowName} text-[length:clamp(30px,3vw,46px)] tabular-nums ${off ? "text-[var(--k10-grey)] line-through decoration-[2px]" : ""}`}>{m.id}</span>
                          <span className={`${k.mono} shrink-0 text-right`}>
                            <span className={`block ${off ? "text-[var(--k10-grey)]" : "text-[var(--k10-accent)]"}`}>{state}</span>
                            <span className="block text-[var(--k10-grey)]">{formatDate(m.placedAt)}</span>
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className={`${k.monoL} mt-3`}>
                  No orders yet. When you place one, it appears here and in{" "}
                  <Link href="/d/10/account" className={`${k.link} underline`}>
                    your account
                  </Link>
                  .
                </p>
              )}
            </>
          ) : (
            <>
              <p className={`${k.disp} whitespace-normal text-[length:clamp(28px,2.8vw,44px)] leading-[0.95] [font-variation-settings:'wdth'_78,'wght'_700]`}>
                Signed in, your orders are listed here and need no lookup.
              </p>
              <Link href="/d/10/account" className={`${k.mini} mt-5`}>
                Sign in
              </Link>
            </>
          )}
          {/* a legend for every order, not the progress of the one above it */}
          <p className={`${k.mono} mt-12 text-[var(--k10-grey)]`}>How any order moves, in six stages</p>
          <dl className="mt-3">
            {STAGES.map((s, i) => (
              <div key={s.key} className="grid grid-cols-[1.6rem_minmax(0,1fr)] gap-3 border-t border-[var(--k10-line)] py-2">
                <dt className={`${k.mono} text-[var(--k10-grey)] tabular-nums`}>{i + 1}</dt>
                <dd className={k.mono}>
                  <span className="text-[var(--k10-ink)]">{s.label}.</span> <span className="text-[var(--k10-grey)]">{s.detail}</span>
                </dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

function Result({ order, pub, onReset }: { order: Order; pub: boolean; onReset: () => void }) {
  const now = useNow();
  const t = trackingFor(order, now ?? order.placedAt);
  const cur = STAGES[t.current];
  const status = order.status === "cancelled" ? "Cancelled" : order.status === "return-requested" ? "Return requested" : null;
  const shipped = t.current >= 3;
  const count = order.lines.reduce((n, l) => n + l.qty, 0);
  return (
    <div className={`${k.gut} pb-20 pt-24 md:pt-32`}>
      <h1 className="sr-only">
        Order {order.id}: {cur.label}
      </h1>
      <div className={`${k.mono} flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[var(--k10-grey)]`}>
        <span>
          Order {order.id}, placed {formatDate(order.placedAt, true)}
          {order.userId === "example" ? ". The example order" : ""}
        </span>
        <button type="button" onClick={onReset} className={`${k.link} text-[var(--k10-ink)]`}>
          Track another order
        </button>
      </div>
      <Stretch key={status ?? cur.key} as="p" text={status ?? cur.label} cap={0.32} className="mt-3" tone={status ? "text-[var(--k10-grey)]" : "text-[var(--k10-accent)]"} />
      <p className={`${k.monoL} mt-4 flex items-center gap-3`}>
        {!t.delivered && !status && <span className={k.pulse} aria-hidden />}
        <span aria-live="polite">
          {order.status === "cancelled"
            ? "This order was cancelled before it shipped. Nothing was charged."
            : order.status === "return-requested"
              ? `A return is requested${order.returnReason ? `: ${order.returnReason}` : ""}. The Maison will write with a pickup date.`
              : cur.detail}
        </span>
      </p>

      <div className="mt-10 grid grid-cols-1 gap-12 border-t border-[var(--k10-ink)] pt-6 md:mt-14 lg:grid-cols-12 lg:gap-10">
        <ol aria-label="Stages" className="min-w-0 lg:col-span-7">
          {t.stages.map((s, i) => {
            const state = s.current ? "current" : s.done ? "done" : "todo";
            return (
              <li key={s.key} aria-current={s.current ? "step" : undefined} className="grid grid-cols-[1.8rem_minmax(0,1fr)_auto] items-baseline gap-x-3 border-b border-[var(--k10-line)] py-1.5 md:grid-cols-[2.4rem_minmax(0,1fr)_auto]">
                <span className={`${k.mono} tabular-nums text-[var(--k10-grey)]`}>{i + 1}</span>
                <span data-state={state === "todo" ? undefined : state} className={`${k.stage} whitespace-normal text-[length:clamp(28px,4vw,64px)]`}>
                  {s.label}
                </span>
                <span className={`${k.mono} text-right tabular-nums ${s.done ? "" : "text-[var(--k10-grey)]"}`}>
                  {s.done ? formatDate(s.at, true) : "To come"}
                </span>
              </li>
            );
          })}
        </ol>

        <dl className="grid grid-cols-1 content-start gap-y-6 sm:grid-cols-2 sm:gap-x-8 lg:col-span-5 lg:grid-cols-1">
          <div>
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>{t.delivered ? "Delivered" : "Expected"}</dt>
            <dd className={`${k.disp} mt-1 whitespace-normal text-[length:clamp(30px,3vw,48px)] leading-[0.95] [font-variation-settings:'wdth'_72,'wght'_760]`}>
              {t.delivered ? formatDate(t.stages[5].at, true) : `${formatDate(t.estimate.from)} to ${formatDate(t.estimate.to)}`}
            </dd>
            <dd className={`${k.mono} mt-1 text-[var(--k10-grey)]`}>{order.delivery === "express" ? "Express, 1–2 working days" : "Standard, 3–5 working days"}</dd>
          </div>
          <div>
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>Courier</dt>
            <dd className={`${k.monoL} mt-1`}>
              {shipped ? (
                <>
                  {order.courier.name}
                  <br />
                  AWB <span className="tabular-nums">{order.courier.awb}</span>
                </>
              ) : (
                `${order.courier.name}. The AWB number appears once the parcel ships.`
              )}
            </dd>
          </div>
          <div>
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>Delivering to</dt>
            <dd className={`${k.monoL} mt-1`}>
              <AddressLines a={order.address} masked={pub} />
            </dd>
          </div>
          <div>
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>
              {count} {count === 1 ? "piece" : "pieces"}, {formatINR(order.total)}
              {order.discount ? <span className="text-[var(--k10-accent)]">, {order.coupon} saved {formatINR(order.discount)}</span> : null}
            </dt>
            <dd className="mt-1">
              <ul>
                {order.lines.map((l) => (
                  <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`} className="flex items-baseline justify-between gap-4 border-t border-[var(--k10-line)] py-1.5">
                    <Link href={`/d/10/p/${l.slug}`} className={`${k.monoL} ${k.link} min-w-0 truncate`}>
                      {splitName(l.name).head}
                    </Link>
                    <span className={`${k.mono} shrink-0 text-[var(--k10-grey)]`}>
                      {[CONTENT[l.wood].short, l.optionLabel, `× ${l.qty}`].filter(Boolean).join(", ")}
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
          <div className="sm:col-span-2 lg:col-span-1">
            <dt className={`${k.mono} text-[var(--k10-grey)]`}>Help</dt>
            <dd className={`${k.monoL} mt-1`}>
              Something not right? Write to us with the order number, <span className="whitespace-nowrap">{order.id}</span>, and the Maison will look into it. The stages
              here move on a short demonstration clock in this preview.
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
