"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type CSSProperties, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useUser } from "@/lib/shop/account";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, PAYMENTS, STAGES, trackingFor, useNow, useOrder, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { AddressLines, Field } from "./Forms";

type Shown = { order: Order; isPublic: boolean } | "missing" | null;

/** Track an order: a lookup set as a short form, and the result as a numbered dispatch log. */
export function TrackLog() {
  const router = useRouter();
  const o = useSearchParams().get("o");
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const own = useOrder(o);
  const [id, setId] = useState(o ?? "");
  const [contact, setContact] = useState("");
  const [errors, setErrors] = useState<{ id?: string; contact?: string }>({});
  const [looked, setLooked] = useState<Shown>(null);

  const shown: Shown = looked ?? (own ? { order: own, isPublic: false } : null);

  const lookup = (orderId: string, who: string) => {
    const found = findOrder(orderId, who);
    if (!found) return setLooked("missing");
    setLooked({ order: found, isPublic: !(user && found.userId === user.id) });
    requestAnimationFrame(() => document.getElementById("log")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const next = {
      id: /^SM-\d{4}-\d{4}$/i.test(id.trim()) ? undefined : "Order numbers look like SM-2611-0412.",
      contact: contact.trim().length >= 5 ? undefined : "Please enter the email or mobile number on the order.",
    };
    setErrors(next);
    if (next.id || next.contact) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    lookup(id, contact);
  };

  const tryExample = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    setErrors({});
    lookup(EXAMPLE.id, EXAMPLE.email);
  };

  const pickOwn = (orderId: string) => {
    setLooked(null);
    setId(orderId);
    router.replace(`/d/05/track?o=${orderId}`, { scroll: false });
    requestAnimationFrame(() => document.getElementById("log")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  return (
    <div className="x5t-wrap">
      <header id="lookup" className="x5c-head">
        <p className="x5c-kicker">
          <span>Dispatch log</span>
          <span>Six stages, logged as they happen</span>
        </p>
        <h1 className="x5c-title">Track an order</h1>
      </header>

      <div className="x5t-lookup">
        <form className="x5t-form" onSubmit={submit} noValidate>
          <p className="x5t-formLead">Give the order number from your confirmation and the email or mobile number on the order.</p>
          <div className="x5c-fields">
            <Field
              id="t-id"
              label="Order number"
              name="order"
              autoComplete="off"
              placeholder="SM-0000-0000"
              value={id}
              onChange={(e) => setId(e.target.value.toUpperCase())}
              error={errors.id}
            />
            <Field
              id="t-contact"
              label="Email or mobile on the order"
              name="email"
              autoComplete="email"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              error={errors.contact}
            />
          </div>
          <div className="x5c-formActions">
            <button type="submit" className="x5c-place x5c-placeSmall">
              <span>Open the log</span>
              <span>{/^SM-\d{4}-\d{4}$/.test(id.trim()) ? id.trim() : "Six stages"}</span>
            </button>
            <button type="button" className="x5-textLink" onClick={tryExample}>
              Try the example order
            </button>
          </div>
          <p className="x5c-fine">
            The example, {EXAMPLE.id} with {EXAMPLE.email}, always answers, so the log can be seen working before anything is bought.
          </p>
        </form>

        <aside className="x5t-mine" aria-label="Your recent orders">
          <p className="x5t-mineHead">Your recent orders</p>
          {!hydrated ? (
            <p className="x5t-mineNote">Reading your file.</p>
          ) : !user ? (
            <p className="x5t-mineNote">
              Signed in, your orders are listed here to open in one press.{" "}
              <Link href="/d/05/account" className="x5-inlineLink">
                Sign in
              </Link>
            </p>
          ) : mine.length === 0 ? (
            <p className="x5t-mineNote">
              No orders in your file yet.{" "}
              <Link href="/d/05/shop" className="x5-inlineLink">
                Open the catalogue
              </Link>
            </p>
          ) : (
            <ol className="x5t-mineList">
              {mine.slice(0, 5).map((m) => (
                <li key={m.id}>
                  <button type="button" className="x5t-mineBtn" aria-pressed={shown !== "missing" && shown?.order.id === m.id} onClick={() => pickOwn(m.id)}>
                    <b>{m.id}</b>
                    <span>
                      {formatDate(m.placedAt)}, {formatINR(m.total)}
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          )}
        </aside>
      </div>

      {shown === "missing" ? (
        <section id="log" className="x5t-missing" aria-live="polite">
          <p className="x5t-missingLine">No order answers to {id.trim() || "that number"} with that email or mobile.</p>
          <p className="x5t-mineNote">
            Check the number on your confirmation; it begins SM- and has eight figures. The email or mobile must be the one given at checkout. Or try the example order to
            see the log.
          </p>
          <button type="button" className="x5-textLink" onClick={tryExample}>
            Try the example order
          </button>
        </section>
      ) : shown ? (
        <Log key={shown.order.id + shown.order.placedAt} order={shown.order} isPublic={shown.isPublic} />
      ) : null}
    </div>
  );
}

function Log({ order, isPublic }: { order: Order; isPublic: boolean }) {
  const now = useNow();
  const t = now ? trackingFor(order, now) : null;
  const est = trackingFor(order, order.placedAt).estimate;
  const progress = t ? t.current / (STAGES.length - 1) : 0;

  return (
    <>
      <section id="log" className="x5t-log" aria-labelledby="log-h">
        <div className="x5t-logHead">
          <p className="x5c-kicker">
            <span>{order.id === EXAMPLE.id ? "The example order" : isPublic ? "Order" : "Your order"}</span>
            <span>Placed {formatDate(order.placedAt, true)}</span>
          </p>
          <h2 id="log-h" className="x5t-id">
            {order.id}
          </h2>
          <div className="x5a-meta">
            <p>
              <span>Now</span>
              <br />
              {order.status === "cancelled" ? "Cancelled" : order.status === "return-requested" ? "Return requested" : t ? t.stages[t.current].label : "Reading the log"}
            </p>
            <p>
              <span>Expected</span>
              <br />
              {formatDate(est.from)} to {formatDate(est.to)}
            </p>
            <p>
              <span>Courier</span>
              <br />
              {t && t.current >= 3 ? order.courier.name : `${order.courier.name}, once shipped`}
            </p>
            <p>
              <span>AWB</span>
              <br />
              {t && t.current >= 3 ? order.courier.awb : "Issued when shipped"}
            </p>
          </div>
        </div>

        {order.status && (
          <p className="x5t-status" role="note">
            {order.status === "cancelled"
              ? "This order was cancelled before it shipped. The log stops here; nothing further will be dispatched."
              : `A return has been asked for${order.returnReason ? `: “${order.returnReason}”` : ""}. The studio writes within a working day with a pickup date.`}
          </p>
        )}
        <div className="x5t-rule" aria-hidden data-status={order.status}>
          <span style={{ "--p": progress } as CSSProperties} />
        </div>

        <ol className="x5t-stages" aria-label="Dispatch stages" data-status={order.status}>
          {STAGES.map((s, i) => {
            const st = t?.stages[i];
            const state = !st ? "pending" : st.current ? "current" : st.done ? "done" : "pending";
            return (
              <li key={s.key} className="x5t-stage" data-state={state} aria-current={state === "current" ? "step" : undefined}>
                <span className="x5t-n" aria-hidden>
                  {i + 1}
                </span>
                <span className="x5t-label">{s.label}</span>
                <span className="x5t-time">
                  {st ? (
                    state === "pending" ? (
                      <>Expected about {formatDate(st.at, true)}</>
                    ) : (
                      formatDate(st.at, true)
                    )
                  ) : (
                    " "
                  )}
                </span>
                <span className="x5t-detail">{s.detail}</span>
                <span className="x5t-state">{state === "current" ? (t?.delivered ? "Complete" : "Now") : state === "done" ? "Logged" : "To come"}</span>
              </li>
            );
          })}
        </ol>
        <p className="x5c-fine">Preview: the log runs on a short demonstration clock, a few minutes a stage, so it can be watched moving. It refreshes on its own.</p>
      </section>

      <section id="items" className="x5t-items" aria-label="Items and address">
        <div className="x5t-itemsList">
          <p className="x5t-mineHead">In the parcel</p>
          <ol className="x5-lines">
            {order.lines.map((l, i) => {
              const p = getProduct(l.slug);
              return (
                <li key={`${l.slug}-${i}`} className="x5-line x5t-line">
                  <span className="x5-lineN">{i + 1}</span>
                  <span className="x5-lineName">
                    {p ? (
                      <Link href={`/d/05/p/${l.slug}`} className="x5-lineLink">
                        {l.name}
                      </Link>
                    ) : (
                      l.name
                    )}
                  </span>
                  <span className="x5-linePrice">{formatINR(l.unitPrice * l.qty)}</span>
                  <span className="x5-lineMeta">
                    {CONTENT[l.wood].name}
                    {l.optionLabel ? `, ${l.optionLabel}` : ""}
                    {l.qty > 1 ? `, ${l.qty} at ${formatINR(l.unitPrice)}` : ""}
                  </span>
                  {p && (
                    <span className="x5t-thumb" aria-hidden>
                      <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="56px" />
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
          <dl className="x5-totals">
            <div>
              <dt>{DELIVERY[order.delivery].label}</dt>
              <dd>{order.shipping ? formatINR(order.shipping) : "Free"}</dd>
            </div>
            {order.coupon && order.discount ? (
              <div>
                <dt>Code {order.coupon}</dt>
                <dd>−{formatINR(order.discount)}</dd>
              </div>
            ) : null}
            <div>
              <dt>Payment</dt>
              <dd>{PAYMENTS.find((p) => p.id === order.payment)?.label}</dd>
            </div>
            <div className="x5-totalRow">
              <dt>Total</dt>
              <dd>{formatINR(order.total)}</dd>
            </div>
          </dl>
        </div>
        <div className="x5t-where">
          <p className="x5t-mineHead">Delivering to</p>
          <AddressLines a={order.address} masked={isPublic} />
          {isPublic && <p className="x5c-fine">Looked up by number, so the street line stays hidden. Signed in, you see the whole address.</p>}
          <p className="x5t-mineHead x5t-help">Help with this order</p>
          <p className="x5t-mineNote">
            Write to the studio quoting {order.id}; a person reads every letter and answers within a working day. Our contact details arrive with the store.
          </p>
        </div>
      </section>
    </>
  );
}
