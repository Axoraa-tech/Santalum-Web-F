"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords, STATUS } from "../../_data/format";
import { GST_BY_CATEGORY } from "../../_data/mock";
import { NEXT_STAGE, orderActions, useOrder, useSettings } from "../../_data/store";
import type { AdminOrder, AdminStatus, EventKind, Settings } from "../../_data/types";
import { BASE, Empty, Field, Head, Icon, Pinned, Stage, toneOf, Woods, say } from "./kit";

const TRACK: AdminStatus[] = ["new", "confirmed", "packed", "shipped", "delivered"];
const COURIERS = ["Blue Dart", "Delhivery", "DTDC", "India Post Speed Post"];
const KIND: Record<EventKind, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "return-requested": "Return asked",
  returned: "Returned",
  refund: "Refund",
  awb: "AWB",
  note: "Note",
};

export function OrderSheet({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const o = useOrder(decodeURIComponent(id));
  const [invoice, setInvoice] = useState(false);
  if (!o)
    return (
      <div className="a4-page">
        <Head kicker={<Link href={`${BASE}/orders`}>Order board</Link>} title="Order not found" />
        <Empty>No order {id} on the board. It may have been placed in another browser.</Empty>
      </div>
    );

  const stepIdx = TRACK.indexOf(o.status);
  const pieces = o.lines.reduce((s, l) => s + l.qty, 0);

  return (
    <div className="a4-page">
      <Head
        kicker={
          <Link href={`${BASE}/orders`} className="a4-back">
            <Icon name="back" size={14} /> Order board
          </Link>
        }
        title={
          <>
            {o.id} <span className="a4-h1-soft">for {o.name}</span>
          </>
        }
        sub={`Placed ${fmtDateTime(o.placedAt)} · ${pieces} ${pieces === 1 ? "piece" : "pieces"} · ${formatINR(o.total)}`}
      >
        <button type="button" className="a4-btn" onClick={() => setInvoice(true)}>
          <Icon name="print" size={16} /> Invoice
        </button>
      </Head>

      <ol className="a4-track" aria-label="Fulfilment stage">
        {TRACK.map((s, i) => (
          <li key={s} data-done={(stepIdx >= 0 && i < stepIdx) || undefined} data-now={i === stepIdx || undefined}>
            <span>{STATUS[s].label}</span>
          </li>
        ))}
      </ol>
      {stepIdx < 0 && (
        <p className="a4-offnote">
          <Stage status={o.status} /> {o.cancelReason ?? o.returnReason ?? ""}
        </p>
      )}

      <div className="a4-detail">
        <div className="a4-detail-main">
          <section className="a4-paper a4-pad" aria-labelledby="a4-pieces">
            <h2 id="a4-pieces" className="a4-h2">
              On the bench
            </h2>
            <ul className="a4-lines">
              {o.lines.map((l, i) => (
                <li key={i}>
                  <Pinned photoId={l.photoId} tone={toneOf(l.slug)} size="md" pin={i % 2 === 0} alt={l.name} />
                  <div>
                    <Link href={`${BASE}/products/${l.slug}`} className="a4-strong">
                      {l.name}
                    </Link>
                    <span className="a4-muted a4-block">
                      {l.optionLabel ?? "Standard"} · {l.wood === "red" ? "Red" : "White"} sandalwood
                    </span>
                    {l.note && <span className="a4-muted a4-block">Note: {l.note}</span>}
                  </div>
                  <span className="a4-num">
                    {l.qty} × {formatINR(l.unitPrice)}
                  </span>
                </li>
              ))}
            </ul>
            <dl className="a4-sum">
              <div>
                <dt>Subtotal</dt>
                <dd>{formatINR(o.subtotal)}</dd>
              </div>
              {o.discount > 0 && (
                <div>
                  <dt>Discount {o.coupon && `(${o.coupon})`}</dt>
                  <dd>−{formatINR(o.discount)}</dd>
                </div>
              )}
              <div>
                <dt>Shipping, {o.delivery}</dt>
                <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
              </div>
              <div className="a4-sum-total">
                <dt>Total</dt>
                <dd>{formatINR(o.total)}</dd>
              </div>
              {o.refunded > 0 && (
                <div>
                  <dt>Refunded</dt>
                  <dd>−{formatINR(o.refunded)}</dd>
                </div>
              )}
            </dl>
            {o.giftNote && (
              <blockquote className="a4-giftnote">
                <span className="a4-label">Gift note to write</span>
                {o.giftNote}
              </blockquote>
            )}
          </section>

          <section className="a4-paper a4-pad" aria-labelledby="a4-timeline">
            <h2 id="a4-timeline" className="a4-h2">
              Timeline
            </h2>
            <ol className="a4-timeline">
              {[...o.timeline].reverse().map((e, i) => (
                <li key={i} data-k={e.kind}>
                  <span className="a4-tl-kind">{KIND[e.kind]}</span>
                  <span>{e.text}</span>
                  <span className="a4-muted">
                    {fmtDateTime(e.at)}
                    {e.by && ` · ${e.by}`}
                  </span>
                </li>
              ))}
            </ol>
            <NoteForm o={o} />
          </section>
        </div>

        <aside className="a4-detail-side">
          <Actions o={o} />
          <section className="a4-paper a4-pad" aria-labelledby="a4-cust">
            <h2 id="a4-cust" className="a4-h2">
              Customer
            </h2>
            <p>
              <Link href={`${BASE}/customers/${o.customerId}`} className="a4-strong">
                {o.name}
              </Link>
            </p>
            <p className="a4-muted a4-break">{o.email}</p>
            <p className="a4-muted">{o.phone}</p>
            <p className="a4-label">Ship to</p>
            <address className="a4-address">
              {o.address.name}
              <br />
              {o.address.line1}
              {o.address.line2 && (
                <>
                  <br />
                  {o.address.line2}
                </>
              )}
              <br />
              {o.address.city}, {o.address.state} {o.address.pin}
            </address>
            <p className="a4-label">Payment</p>
            <p>
              {PAYMENT_LABEL[o.payment] ?? o.payment} · {PAYMENT_STATE[o.paymentState]}
            </p>
            <p className="a4-muted a4-break">{o.paymentRef}</p>
            {o.courier && (
              <>
                <p className="a4-label">Courier</p>
                <p>
                  {o.courier.name} · {o.courier.awb}
                </p>
              </>
            )}
            <p className="a4-label">Woods</p>
            <Woods woods={o.woods} />
          </section>
        </aside>
      </div>

      {invoice && <Invoice o={o} onClose={() => setInvoice(false)} />}
    </div>
  );
}

function Actions({ o }: { o: AdminOrder }) {
  const next = NEXT_STAGE[o.status];
  const [courier, setCourier] = useState(o.courier?.name ?? COURIERS[0]);
  const [awb, setAwb] = useState(o.courier?.awb ?? "");
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [refundNote, setRefundNote] = useState("");
  const canCancel = ["new", "confirmed", "packed"].includes(o.status);
  const refundable = o.total - o.refunded;
  const canRefund = refundable > 0 && o.paymentState !== "cod-pending" && ["cancelled", "returned", "delivered", "return-requested"].includes(o.status);

  return (
    <section className="a4-paper a4-pad a4-actions" aria-labelledby="a4-act">
      <h2 id="a4-act" className="a4-h2">
        Next step
      </h2>
      {next ? (
        <>
          <p className="a4-sub">{next.text}.</p>
          {o.status === "packed" && (
            <form
              className="a4-awb"
              onSubmit={(e) => {
                e.preventDefault();
                if (!awb.trim()) return;
                orderActions.setAwb(o, { name: courier, awb: awb.trim() }, true);
                say(`${o.id} handed to ${courier}`);
              }}
            >
              <Field label="Courier">
                {(id) => (
                  <select id={id} value={courier} onChange={(e) => setCourier(e.target.value)}>
                    {COURIERS.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="AWB number">{(id) => <input id={id} value={awb} onChange={(e) => setAwb(e.target.value)} inputMode="numeric" />}</Field>
              <button type="submit" className="a4-btn a4-btn-ink" disabled={!awb.trim()}>
                Save AWB and ship
              </button>
            </form>
          )}
          {o.status !== "packed" && (
            <button
              type="button"
              className="a4-btn a4-btn-ink a4-btn-block"
              onClick={() => {
                orderActions.advance(o);
                say(`${o.id}: ${next.label.toLowerCase()}`);
              }}
            >
              {next.label}
            </button>
          )}
        </>
      ) : (
        <p className="a4-sub">
          This order is <Stage status={o.status} />.
        </p>
      )}

      {o.status === "return-requested" && (
        <div className="a4-subblock">
          <p className="a4-label">Return reason</p>
          <q>{o.returnReason}</q>
          <button
            type="button"
            className="a4-btn a4-btn-ink a4-btn-block"
            onClick={() => {
              orderActions.approveReturn(o);
              say("Return approved, pickup arranged");
            }}
          >
            Approve return
          </button>
        </div>
      )}

      {canRefund && (
        <form
          className="a4-subblock"
          onSubmit={(e) => {
            e.preventDefault();
            const n = Math.round(Number(amount));
            if (!n || n <= 0 || n > refundable) return;
            orderActions.refund(o, n, refundNote.trim());
            setAmount("");
            setRefundNote("");
            say(`Refunded ${formatINR(n)}`);
          }}
        >
          <p className="a4-label">Refund, up to {formatINR(refundable)}</p>
          <div className="a4-inline">
            <input aria-label="Amount in rupees" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} placeholder={String(refundable)} />
            <button type="button" className="a4-btn a4-btn-sm" onClick={() => setAmount(String(refundable))}>
              Full
            </button>
          </div>
          <input aria-label="Refund note" value={refundNote} onChange={(e) => setRefundNote(e.target.value)} placeholder="Note (optional)" />
          <button type="submit" className="a4-btn" disabled={!Number(amount) || Number(amount) > refundable}>
            Refund
          </button>
        </form>
      )}

      {canCancel &&
        (cancelling ? (
          <form
            className="a4-subblock"
            onSubmit={(e) => {
              e.preventDefault();
              if (!reason.trim()) return;
              orderActions.cancel(o, reason.trim());
              setCancelling(false);
              say(`${o.id} cancelled`);
            }}
          >
            <Field label="Why is it cancelled?">{(id) => <input id={id} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Customer asked by phone" autoFocus />}</Field>
            <div className="a4-inline">
              <button type="submit" className="a4-btn a4-btn-red" disabled={!reason.trim()}>
                Cancel order
              </button>
              <button type="button" className="a4-btn a4-btn-ghost" onClick={() => setCancelling(false)}>
                Keep it
              </button>
            </div>
          </form>
        ) : (
          <button type="button" className="a4-link-btn" onClick={() => setCancelling(true)}>
            Cancel this order
          </button>
        ))}
    </section>
  );
}

function NoteForm({ o }: { o: AdminOrder }) {
  const [body, setBody] = useState("");
  return (
    <form
      className="a4-noteform"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        orderActions.note(o, body.trim());
        setBody("");
        say("Note pinned to the order");
      }}
    >
      <input aria-label="Add a note" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Pin a note for the team" />
      <button type="submit" className="a4-btn a4-btn-sm" disabled={!body.trim()}>
        Add note
      </button>
    </form>
  );
}

/* ---------- invoice ---------- */
function taxLines(o: AdminOrder, s: Settings["store"]) {
  const inState = o.address.state.trim().toLowerCase() === s.state.trim().toLowerCase();
  return o.lines.map((l) => {
    const cat = getProduct(l.slug)?.category;
    const gst = cat ? GST_BY_CATEGORY[cat] : { hsn: l.wood === "red" ? s.hsnRed : s.hsnWhite, rate: s.gstRate, label: "" };
    const gross = l.unitPrice * l.qty;
    const taxable = s.pricesIncludeGst ? gross / (1 + gst.rate / 100) : gross;
    const tax = s.pricesIncludeGst ? gross - taxable : (gross * gst.rate) / 100;
    return { l, hsn: gst.hsn, rate: gst.rate, taxable, tax, inState, total: taxable + tax };
  });
}

function Invoice({ o, onClose }: { o: AdminOrder; onClose: () => void }) {
  const { store } = useSettings();
  const rows = taxLines(o, store);
  const inState = rows[0]?.inState ?? true;
  const taxable = rows.reduce((s, r) => s + r.taxable, 0);
  const tax = rows.reduce((s, r) => s + r.tax, 0);
  const r2 = (n: number) => formatINR(Math.round(n * 100) / 100);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.documentElement.dataset.a4Print = "";
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.a4Print;
    };
  }, [onClose]);

  return (
    <div className="a4-invoice-wrap" role="dialog" aria-modal="true" aria-label={`Tax invoice for ${o.id}`}>
      <div className="a4-invoice-bar a4-noprint">
        <button type="button" className="a4-btn a4-btn-ink" onClick={() => window.print()}>
          <Icon name="print" size={16} /> Print
        </button>
        <button type="button" className="a4-btn" onClick={onClose}>
          <Icon name="close" size={16} /> Close
        </button>
      </div>
      <article className="a4-invoice">
        <header className="a4-inv-head">
          <div>
            <p className="a4-inv-brand">{store.name}</p>
            <p>{store.legalName}</p>
            <p>
              {store.address}, {store.city}, {store.state} {store.pin}
            </p>
            <p>
              GSTIN {store.gstin} · PAN {store.pan}
            </p>
          </div>
          <div className="a4-inv-meta">
            <p className="a4-inv-title">Tax invoice</p>
            <p>
              No. {store.invoicePrefix}
              {o.id}
            </p>
            <p>Date {fmtDate(o.placedAt)}</p>
            <p>Order {o.id}</p>
          </div>
        </header>
        <div className="a4-inv-parties">
          <div>
            <p className="a4-label">Billed and shipped to</p>
            <p>{o.address.name}</p>
            <p>{o.address.line1}</p>
            {o.address.line2 && <p>{o.address.line2}</p>}
            <p>
              {o.address.city}, {o.address.state} {o.address.pin}
            </p>
            <p>{o.phone}</p>
          </div>
          <div>
            <p className="a4-label">Place of supply</p>
            <p>{o.address.state}</p>
            <p className="a4-label">Payment</p>
            <p>
              {PAYMENT_LABEL[o.payment] ?? o.payment}, {PAYMENT_STATE[o.paymentState].toLowerCase()}
            </p>
          </div>
        </div>
        <table className="a4-inv-table">
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">HSN</th>
              <th scope="col">Qty</th>
              <th scope="col">Taxable</th>
              <th scope="col">{inState ? "CGST + SGST" : "IGST"}</th>
              <th scope="col">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  {r.l.name}
                  {r.l.optionLabel && <span className="a4-block">{r.l.optionLabel}</span>}
                </td>
                <td>{r.hsn}</td>
                <td>{r.l.qty}</td>
                <td>{r2(r.taxable)}</td>
                <td>
                  {r2(r.tax)}
                  <span className="a4-block">{inState ? `${r.rate / 2}% + ${r.rate / 2}%` : `${r.rate}%`}</span>
                </td>
                <td>{r2(r.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="a4-sum a4-inv-sum">
          <div>
            <dt>Taxable value</dt>
            <dd>{r2(taxable)}</dd>
          </div>
          <div>
            <dt>{inState ? "CGST + SGST" : "IGST"}</dt>
            <dd>{r2(tax)}</dd>
          </div>
          {o.discount > 0 && (
            <div>
              <dt>Discount</dt>
              <dd>−{formatINR(o.discount)}</dd>
            </div>
          )}
          <div>
            <dt>Shipping</dt>
            <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
          </div>
          <div className="a4-sum-total">
            <dt>Total</dt>
            <dd>{formatINR(o.total)}</dd>
          </div>
        </dl>
        <p className="a4-inv-words">{rupeesInWords(o.total)}</p>
        <p className="a4-inv-foot">Prices include GST. Each piece travels with its batch record. This is a computer-generated invoice.</p>
      </article>
    </div>
  );
}
