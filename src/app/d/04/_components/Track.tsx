"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useUser } from "@/lib/shop/account";
import { DELIVERY } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { EXAMPLE, findOrder, formatDate, STAGES, trackingFor, useNow, useOrder, useOrders, type Order } from "@/lib/shop/orders";
import { formatINR, getProduct } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { r, t } from "./cls";
import { Pic, picOf } from "./plates";
import { AddressLines, Field } from "./forms";
import { cx, OrderNo } from "./ui";

type Shown = { order: Order; mine: boolean } | { missing: string } | null;

export function TrackFromParams() {
  const o = useSearchParams().get("o");
  return <Tracker key={o ?? ""} initial={o} />;
}

/** Tracking as the museum's shipping register: every piece that leaves the house is entered, room by room. */
export function Tracker({ initial }: { initial: string | null }) {
  const hydrated = useHydrated();
  const user = useUser();
  const mine = useOrders();
  const own = useOrder(initial);
  const [id, setId] = useState(initial ?? "");
  const [contact, setContact] = useState("");
  const [errs, setErrs] = useState<{ id?: string; contact?: string }>({});
  const [shown, setShown] = useState<Shown>(null);
  // ?o= naming the visitor's own order shows it straight away
  const result: Shown = shown ?? (own ? { order: own, mine: true } : null);

  const lookup = (oid: string, who: string) => {
    const key = oid.trim().toUpperCase();
    const ownHit = mine.find((x) => x.id === key);
    if (ownHit) {
      setShown({ order: ownHit, mine: true });
      return;
    }
    const hit = findOrder(key, who);
    setShown(hit ? { order: hit, mine: false } : { missing: key });
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const next: typeof errs = {};
    if (!/^SM-\d{4}-\d{4}$/i.test(id.trim())) next.id = "Order numbers look like SM-2611-0412.";
    if (!mine.some((x) => x.id === id.trim().toUpperCase()) && contact.trim().length < 5)
      next.contact = "Please enter the email or mobile number on the order.";
    setErrs(next);
    if (next.id || next.contact) {
      const el = e.currentTarget.elements.namedItem(next.id ? "order" : "contact");
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    lookup(id, contact);
  };

  const example = () => {
    setId(EXAMPLE.id);
    setContact(EXAMPLE.email);
    setErrs({});
    lookup(EXAMPLE.id, EXAMPLE.email);
  };

  return (
    <div className={t.reg}>
      <header className={t.head}>
        <h1 className={t.title}>
          Shipping <i>register</i>
        </h1>
        <p className={t.lede}>
          Every piece that leaves the house is entered here: where it is, who carries it, and when it should arrive. Look up an
          order with its number and the email or mobile number it was placed with.
        </p>
      </header>

      <div className={t.top}>
        <form className={cx(r.form, t.form)} onSubmit={submit} noValidate>
          <Field
            label="Order number"
            name="order"
            autoComplete="off"
            placeholder="SM-2611-0412"
            value={id}
            onChange={(e) => setId(e.target.value)}
            error={errs.id}
          />
          <Field
            label="Email or mobile"
            name="contact"
            autoComplete="email"
            inputMode="email"
            placeholder="As on the order"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            error={errs.contact}
          />
          <div className={r.formActions}>
            <button type="submit" className={r.submitSm}>
              Find the order
            </button>
            <button type="button" className={t.example} onClick={example}>
              Try the example order
            </button>
          </div>
          <p className={r.fine}>
            The example is a real-looking order that always answers: {EXAMPLE.id}, {EXAMPLE.email}. Preview: orders are saved in this
            browser until our store opens.
          </p>
        </form>

        {hydrated && user && mine.length > 0 && (
          <div className={t.mine}>
            <p className={t.mineTitle}>Your recent orders</p>
            <ul>
              {mine.slice(0, 5).map((o) => (
                <li key={o.id}>
                  <button type="button" aria-pressed={result !== null && "order" in result && result.order.id === o.id} onClick={() => setShown({ order: o, mine: true })}>
                    <span>{o.id}</span>
                    <span>{formatDate(o.placedAt)}</span>
                    <span>{formatINR(o.total)}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div aria-live="polite">
        {result && "order" in result ? <Shipment key={result.order.id} order={result.order} mine={result.mine} /> : null}
        {result && "missing" in result ? <NotFound id={result.missing} onExample={example} /> : null}
      </div>
    </div>
  );
}

function Shipment({ order, mine }: { order: Order; mine: boolean }) {
  const now = useNow();
  const tr = trackingFor(order, now ?? order.placedAt);
  const cur = tr.stages[tr.current];
  const shipped = tr.current >= STAGES.findIndex((s) => s.key === "shipped");
  return (
    <section className={t.result} aria-label={`Order ${order.id}`}>
      <div className={t.resultHead}>
        <div>
          <p className={t.small}>Order</p>
          <p className={t.orderNo}>
            <OrderNo id={order.id} />
          </p>
          <p className={t.small}>Placed {formatDate(order.placedAt, true)}</p>
        </div>
        <div className={t.now}>
          <p className={t.small}>Now</p>
          <p className={t.nowStage} data-status={order.status}>
            <span className={t.live} aria-hidden="true" />
            {order.status === "cancelled" ? "Cancelled" : order.status === "return-requested" ? "Return requested" : cur.label}
          </p>
          <p className={t.nowDetail}>
            {order.status === "cancelled"
              ? "Cancelled at the member's request. Nothing will ship and no money was taken."
              : order.status === "return-requested"
                ? `A return is entered${order.returnReason ? `: ${order.returnReason}` : ""}. The courier will collect.`
                : cur.detail}
          </p>
        </div>
        <div>
          <p className={t.small}>{tr.delivered ? "Delivered" : "Expected"}</p>
          <p className={t.window}>
            {tr.delivered ? formatDate(tr.stages[tr.stages.length - 1].at) : `${formatDate(tr.estimate.from)} to ${formatDate(tr.estimate.to)}`}
          </p>
          <p className={t.small}>{DELIVERY[order.delivery].label}</p>
        </div>
      </div>

      <ol className={t.line} aria-label="Where the order is" data-status={order.status}>
        {tr.stages.map((st, i) => (
          <li key={st.key} className={t.stop} data-state={st.current ? "current" : st.done ? "done" : "todo"}>
            <span className={t.door} aria-hidden="true">
              <span className={t.doorN}>{i + 1}</span>
            </span>
            <div className={t.stopText}>
              <p className={t.stopName}>
                {st.label}
                {st.current && <span className="sr-only"> (current)</span>}
              </p>
              <p className={t.stopTime}>{st.done ? formatDate(st.at, true) : "To come"}</p>
              <p className={t.stopDetail}>{st.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={t.meta}>
        <div>
          <h3 className={t.h3}>The pieces</h3>
          <ul className={t.items}>
            {order.lines.map((l) => {
              const p = getProduct(l.slug);
              return (
                <li key={`${l.slug}-${l.option ?? ""}-${l.note ?? ""}`}>
                  <span className={t.itemPhoto}>
                    {p && <Pic {...picOf(p)} sizes="56px" />}
                  </span>
                  <span>
                    <Link href={`/d/04/p/${l.slug}`} className={t.itemName}>
                      {l.name}
                    </Link>
                    <span className={t.small}>
                      {CONTENT[l.wood].name}
                      {l.optionLabel ? `, ${l.optionLabel}` : ""}
                      {l.qty > 1 ? `, ${l.qty}` : ""}
                    </span>
                  </span>
                  <span className={t.itemPrice}>{formatINR(l.unitPrice * l.qty)}</span>
                </li>
              );
            })}
          </ul>
          {order.discount ? (
            <p className={t.small}>
              Code {order.coupon}, less {formatINR(order.discount)}
            </p>
          ) : null}
          <p className={t.total}>
            <span>Total</span>
            {formatINR(order.total)}
          </p>
        </div>
        <div className={t.facts}>
          <div>
            <h3 className={t.h3}>Courier</h3>
            {shipped ? (
              <p>
                {order.courier.name}
                <span className={t.awb}>AWB {order.courier.awb}</span>
              </p>
            ) : (
              <p className={t.small}>The courier and the AWB number are entered when the parcel ships.</p>
            )}
          </div>
          <div>
            <h3 className={t.h3}>Deliver to</h3>
            <AddressLines a={order.address} masked={!mine} />
          </div>
          <div>
            <h3 className={t.h3}>Help</h3>
            <p className={t.small}>
              Write to us with the order number, {order.id}, and the workshop will answer. Once it ships, the AWB also works on the
              courier&apos;s own site.
            </p>
          </div>
          {mine && (
            <Link href="/d/04/account#orders" className="c4-link">
              All your orders
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function NotFound({ id, onExample }: { id: string; onExample: () => void }) {
  return (
    <section className={t.missing} aria-label="No order found">
      {/* an empty case under its lamp: the mount is there, the label card says nothing is held */}
      <div className={t.plinth} aria-hidden="true">
        <span className={t.lamp} />
        <span className={t.case}>
          <span className={t.mount} />
          <span className={t.caseCard}>
            No. <i>—</i>
          </span>
        </span>
        <span className={t.block} />
      </div>
      <div>
        <p className={t.missingTitle}>No entry under {id || "that number"}</p>
        <p className={t.missingText}>
          The register has nothing under that number with that email or mobile. Check the number on your confirmation; it begins
          SM- and has two groups of four digits. Use the email or mobile the order was placed with.
        </p>
        <button type="button" className="c4-btnLine" onClick={onExample}>
          Try the example order
        </button>
      </div>
    </section>
  );
}

/** Before the URL is read: the empty register. */
export function TrackFallback() {
  return <Tracker initial={null} />;
}
