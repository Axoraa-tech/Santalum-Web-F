"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { DELIVERY } from "@/lib/shop/bag";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, fmtNum, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords } from "../../_data/format";
import { DAY, GST_BY_CATEGORY } from "../../_data/mock";
import { NEXT_STAGE, orderActions, useNow, useOrder, useProducts, useSettings } from "../../_data/store";
import type { AdminOrder, EventKind, Settings } from "../../_data/types";
import { a6FontVars } from "../_ui/fonts";
import { BASE, Check, Empty, Field, Head, say, Status, Thumb, WoodMark } from "../_ui/kit";

const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "India Post", "Shiprocket"];
type Panel = null | "awb" | "cancel" | "refund" | "return";

export function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const o = useOrder(decodeURIComponent(id));
  if (!o)
    return (
      <>
        <Head no="02" title="Order not found" back={{ href: `${BASE}/orders`, label: "Orders" }} />
        <Empty>There is no order {decodeURIComponent(id)} in this browser&rsquo;s preview data.</Empty>
      </>
    );
  return <Spread o={o} />;
}

function Spread({ o }: { o: AdminOrder }) {
  const now = useNow();
  const [panel, setPanel] = useState<Panel>(null);
  const [invoice, setInvoice] = useState(false);
  const next = NEXT_STAGE[o.status];
  const pieces = o.lines.reduce((s, l) => s + l.qty, 0);
  const canCancel = o.status === "new" || o.status === "confirmed" || o.status === "packed";
  const canRefund = o.payment !== "cod" || o.paymentState === "cod-collected";
  const owed = o.total - o.refunded;
  const age = Math.max(0, Math.floor((now - o.placedAt) / DAY));

  function advance() {
    if (!next) return;
    if (next.to === "shipped" && !o.courier) return setPanel("awb");
    orderActions.advance(o);
    say(`${o.id}: ${next.label.toLowerCase()} done`);
  }

  return (
    <>
      <Head
        no="02"
        back={{ href: `${BASE}/orders`, label: "Orders" }}
        title={<span className="a6-num">{o.id}</span>}
        lede={
          <>
            Placed {fmtDateTime(o.placedAt)} by {o.name}. <Status status={o.status} />
          </>
        }
      />

      <div className="a6-actions a6-noprint">
        {next && (
          <button type="button" className="a6-btn" data-primary onClick={advance}>
            {next.label} →
          </button>
        )}
        {o.status === "return-requested" && (
          <button type="button" className="a6-btn" data-primary onClick={() => setPanel("return")}>
            Decide the return
          </button>
        )}
        {(o.status === "packed" || o.status === "confirmed" || o.status === "shipped") && (
          <button type="button" className="a6-btn" aria-expanded={panel === "awb"} onClick={() => setPanel(panel === "awb" ? null : "awb")}>
            {o.courier ? "Edit AWB" : "Add AWB"}
          </button>
        )}
        {canRefund && owed > 0 && o.status !== "new" && (
          <button type="button" className="a6-btn" aria-expanded={panel === "refund"} onClick={() => setPanel(panel === "refund" ? null : "refund")}>
            Refund
          </button>
        )}
        <button type="button" className="a6-btn" onClick={() => setInvoice(true)}>
          Tax invoice
        </button>
        {canCancel && (
          <button type="button" className="a6-btn" data-danger aria-expanded={panel === "cancel"} onClick={() => setPanel(panel === "cancel" ? null : "cancel")}>
            Cancel order
          </button>
        )}
      </div>
      {panel && <ActionPanel key={panel} panel={panel} o={o} close={() => setPanel(null)} />}

      <div className="a6-spread a6-grid">
        <aside className="a6-margin" aria-label="Figures">
          <div className="a6-mfig" data-accent>
            <span>Total</span>
            <strong>{formatINR(o.total)}</strong>
          </div>
          <div className="a6-mfig">
            <span>Pieces</span>
            <strong>{pieces}</strong>
          </div>
          <div className="a6-mfig">
            <span>Days open</span>
            <strong>{age}</strong>
          </div>
          {o.refunded > 0 && (
            <div className="a6-mfig" data-accent>
              <span>Refunded</span>
              <strong>{formatINR(o.refunded)}</strong>
            </div>
          )}
        </aside>

        <section className="a6-page-l">
          <h2 className="a6-h2">
            <span className="a6-block-no">A</span>Pieces
          </h2>
          <ul className="a6-lines">
            {o.lines.map((l, i) => (
              <li key={i}>
                <Thumb photoId={l.photoId} slug={l.slug} size={56} />
                <div>
                  <Link href={`${BASE}/products/${l.slug}`} className="a6-rowlink">
                    {l.name}
                  </Link>
                  <div className="a6-muted">
                    <WoodMark wood={l.wood} />
                    {l.optionLabel && ` · ${l.optionLabel}`} · {l.qty} × {formatINR(l.unitPrice)}
                  </div>
                  {l.note && <div className="a6-muted">Note: {l.note}</div>}
                </div>
                <span className="a6-num">{formatINR(l.qty * l.unitPrice)}</span>
              </li>
            ))}
          </ul>
          <dl className="a6-ledger">
            <div>
              <dt>Subtotal</dt>
              <dd>{formatINR(o.subtotal)}</dd>
            </div>
            {o.discount > 0 && (
              <div>
                <dt>Discount{o.coupon && ` (${o.coupon})`}</dt>
                <dd>−{formatINR(o.discount)}</dd>
              </div>
            )}
            <div>
              <dt>{DELIVERY[o.delivery].label}</dt>
              <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
            </div>
            <div data-total>
              <dt>Total, GST included</dt>
              <dd>{formatINR(o.total)}</dd>
            </div>
            {o.refunded > 0 && (
              <div>
                <dt>Refunded</dt>
                <dd>−{formatINR(o.refunded)}</dd>
              </div>
            )}
          </dl>

          <h2 className="a6-h2">
            <span className="a6-block-no">B</span>Payment
          </h2>
          <dl className="a6-facts">
            <div>
              <dt>Method</dt>
              <dd>{PAYMENT_LABEL[o.payment]}</dd>
            </div>
            <div>
              <dt>State</dt>
              <dd>{PAYMENT_STATE[o.paymentState]}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd className="a6-num">{o.paymentRef}</dd>
            </div>
          </dl>
        </section>

        <section className="a6-page-r">
          <h2 className="a6-h2">
            <span className="a6-block-no">C</span>Customer and delivery
          </h2>
          <dl className="a6-facts">
            <div>
              <dt>Customer</dt>
              <dd>
                <Link href={`${BASE}/customers/${o.customerId}`} className="a6-rowlink">
                  {o.name}
                </Link>
                <br />
                {o.email}
                <br />
                <span className="a6-num">{o.phone}</span>
              </dd>
            </div>
            <div>
              <dt>Ship to</dt>
              <dd>
                {o.address.name}
                <br />
                {o.address.line1}
                {o.address.line2 && `, ${o.address.line2}`}
                <br />
                {o.address.city}, {o.address.state} <span className="a6-num">{o.address.pin}</span>
              </dd>
            </div>
            <div>
              <dt>Courier</dt>
              <dd>{o.courier ? <span className="a6-num">{o.courier.name}, AWB {o.courier.awb}</span> : <span className="a6-muted">Not booked</span>}</dd>
            </div>
            {o.giftNote && (
              <div>
                <dt>Gift note</dt>
                <dd className="a6-quote">&ldquo;{o.giftNote}&rdquo;</dd>
              </div>
            )}
            {o.returnReason && (
              <div>
                <dt>Return reason</dt>
                <dd className="a6-quote">&ldquo;{o.returnReason}&rdquo;</dd>
              </div>
            )}
            {o.cancelReason && (
              <div>
                <dt>Cancelled</dt>
                <dd>{o.cancelReason}</dd>
              </div>
            )}
          </dl>

          <h2 className="a6-h2">
            <span className="a6-block-no">D</span>Timeline
          </h2>
          <Timeline o={o} />
        </section>
      </div>

      {invoice && <InvoiceSheet o={o} close={() => setInvoice(false)} />}
    </>
  );
}

const KIND_LABEL: Record<EventKind, string> = {
  placed: "Placed",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  "return-requested": "Return",
  returned: "Returned",
  refund: "Refund",
  awb: "AWB",
  note: "Note",
};

function Timeline({ o }: { o: AdminOrder }) {
  const [note, setNote] = useState("");
  const events = [...o.timeline].reverse();
  return (
    <>
      <form
        className="a6-inline-form"
        onSubmit={(e) => {
          e.preventDefault();
          if (!note.trim()) return;
          orderActions.note(o, note.trim());
          setNote("");
          say("Note added to the timeline");
        }}
      >
        <label className="a6-sr" htmlFor="a6-note">
          Add a note
        </label>
        <input id="a6-note" className="a6-input" placeholder="Add a note for the team" value={note} onChange={(e) => setNote(e.target.value)} />
        <button type="submit" className="a6-btn" disabled={!note.trim()}>
          Add
        </button>
      </form>
      <ol className="a6-timeline">
        {events.map((e, i) => (
          <li key={i} data-kind={e.kind}>
            <span className="a6-num a6-muted">{fmtDateTime(e.at)}</span>
            <span className="a6-tl-kind">{KIND_LABEL[e.kind]}</span>
            <span>
              {e.text}
              {e.by && <span className="a6-muted"> · {e.by}</span>}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

/* ---------- inline action panels ---------- */
function ActionPanel({ panel, o, close }: { panel: Exclude<Panel, null>; o: AdminOrder; close: () => void }) {
  const [courier, setCourier] = useState(o.courier?.name ?? (o.delivery === "express" ? "Blue Dart" : "Delhivery"));
  const [awb, setAwb] = useState(o.courier?.awb ?? "");
  const [ship, setShip] = useState(o.status === "packed" || o.status === "confirmed");
  const [reason, setReason] = useState("");
  const owed = o.total - o.refunded;
  const [amount, setAmount] = useState(String(owed));
  const [err, setErr] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (panel === "awb") {
      if (!/^[A-Za-z0-9-]{6,}$/.test(awb.trim())) return setErr("An AWB is at least six letters or digits.");
      orderActions.setAwb(o, { name: courier, awb: awb.trim() }, ship && o.status !== "shipped");
      say(ship && o.status !== "shipped" ? `${o.id} shipped with ${courier}` : "AWB saved");
    } else if (panel === "cancel") {
      if (!reason.trim()) return setErr("Give a reason; it goes on the timeline and to the customer.");
      orderActions.cancel(o, reason.trim());
      if (o.payment !== "cod" && owed > 0) orderActions.refund(o, owed, "cancelled order");
      say(`${o.id} cancelled`);
    } else if (panel === "refund") {
      const n = Math.round(Number(amount));
      if (!n || n < 1 || n > owed) return setErr(`Enter an amount between ₹1 and ${formatINR(owed)}.`);
      orderActions.refund(o, n, reason.trim());
      say(`${formatINR(n)} refunded`);
    }
    close();
  }

  const title = { awb: o.courier ? "Edit the AWB" : "Book the courier", cancel: "Cancel this order", refund: "Refund to the original method", return: "Return requested" }[panel];
  return (
    <form className="a6-panel a6-noprint" onSubmit={submit}>
      <h2 className="a6-h2">{title}</h2>
      {panel === "awb" && (
        <div className="a6-form-row">
          <Field label="Courier">
            {(id) => (
              <select id={id} className="a6-input" value={courier} onChange={(e) => setCourier(e.target.value)}>
                {COURIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="AWB number" error={err}>
            {(id) => <input id={id} className="a6-input a6-num" value={awb} onChange={(e) => setAwb(e.target.value)} autoFocus />}
          </Field>
          {o.status !== "shipped" && (
            <Check checked={ship} onChange={setShip}>
              Mark shipped now
            </Check>
          )}
        </div>
      )}
      {panel === "cancel" && (
        <Field label="Reason" error={err} hint={o.payment !== "cod" && owed > 0 ? `${formatINR(owed)} is refunded to the customer's ${PAYMENT_LABEL[o.payment]}.` : "Nothing was charged, so nothing is refunded."} wide>
          {(id) => <input id={id} className="a6-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="For example: customer changed the delivery city" autoFocus />}
        </Field>
      )}
      {panel === "refund" && (
        <div className="a6-form-row">
          <Field label="Amount, ₹" error={err} hint={`Up to ${formatINR(owed)}`}>
            {(id) => <input id={id} className="a6-input a6-num" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} />}
          </Field>
          <Field label="Note (optional)">
            {(id) => <input id={id} className="a6-input" value={reason} onChange={(e) => setReason(e.target.value)} />}
          </Field>
        </div>
      )}
      {panel === "return" && (
        <p className="a6-lede">
          &ldquo;{o.returnReason || "No reason given"}&rdquo; Approve to book the pickup; refund once the piece arrives and passes inspection.
        </p>
      )}
      <div className="a6-actions">
        {panel === "return" ? (
          <button
            type="button"
            className="a6-btn"
            data-primary
            onClick={() => {
              orderActions.approveReturn(o);
              say("Return approved, pickup arranged");
              close();
            }}
          >
            Approve return
          </button>
        ) : (
          <button type="submit" className="a6-btn" data-primary data-danger={panel === "cancel" || undefined}>
            {panel === "awb" ? "Save AWB" : panel === "cancel" ? "Cancel the order" : "Refund"}
          </button>
        )}
        <button type="button" className="a6-link" onClick={close}>
          Close
        </button>
      </div>
    </form>
  );
}

/* ---------- invoice: a separate printed sheet ---------- */
function InvoiceSheet({ o, close }: { o: AdminOrder; close: () => void }) {
  const settings = useSettings();
  const products = useProducts();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [close]);
  return createPortal(
    <div className={`a6-sheet ${a6FontVars}`} role="dialog" aria-modal="true" aria-label="Tax invoice">
      <div className="a6-sheet-bar a6-noprint">
        <span>Tax invoice · {o.id}</span>
        <button type="button" className="a6-btn" data-primary onClick={() => window.print()}>
          Print or save PDF
        </button>
        <button type="button" className="a6-btn" onClick={close} autoFocus>
          Close
        </button>
      </div>
      <Invoice o={o} s={settings} categoryOf={(slug) => products.find((p) => p.slug === slug)?.category ?? getProduct(slug)?.category} />
    </div>,
    document.body,
  );
}

function Invoice({ o, s, categoryOf }: { o: AdminOrder; s: Settings; categoryOf: (slug: string) => string | undefined }) {
  const st = s.store;
  const intra = o.address.state.trim().toLowerCase() === st.state.trim().toLowerCase();
  const rows = o.lines.map((l) => {
    const cat = categoryOf(l.slug) as keyof typeof GST_BY_CATEGORY | undefined;
    const g = (cat && GST_BY_CATEGORY[cat]) || { hsn: l.wood === "red" ? st.hsnRed : st.hsnWhite, rate: st.gstRate };
    const gross = l.unitPrice * l.qty;
    const value = gross - (o.subtotal ? (o.discount * gross) / o.subtotal : 0);
    const taxable = value / (1 + g.rate / 100);
    return { name: `${l.name}${l.optionLabel ? `, ${l.optionLabel}` : ""}`, hsn: g.hsn, rate: g.rate, qty: l.qty, taxable, tax: value - taxable, value };
  });
  if (o.shipping) {
    const taxable = o.shipping / 1.18;
    rows.push({ name: "Express shipping", hsn: "996812", rate: 18, qty: 1, taxable, tax: o.shipping - taxable, value: o.shipping });
  }
  const tTax = rows.reduce((a, r) => a + r.tax, 0);
  const tTaxable = rows.reduce((a, r) => a + r.taxable, 0);
  const r2 = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <article className="a6-invoice">
      <header className="a6-inv-head">
        <div>
          <div className="a6-inv-name">{st.name}</div>
          <p>
            {st.legalName}
            <br />
            {st.address}, {st.city}, {st.state} {st.pin}
            <br />
            GSTIN {st.gstin} · PAN {st.pan}
          </p>
        </div>
        <div className="a6-inv-no">
          <span>Tax invoice</span>
          <strong>
            {st.invoicePrefix}
            {o.id.replace(/^SM-/, "")}
          </strong>
          <p>
            Dated {fmtDate(o.placedAt)}
            <br />
            Order {o.id}
          </p>
        </div>
      </header>
      <div className="a6-inv-parties">
        <div>
          <span>Billed to</span>
          <p>
            {o.name}
            <br />
            {o.email}
            <br />
            {o.phone}
          </p>
        </div>
        <div>
          <span>Shipped to</span>
          <p>
            {o.address.line1}
            {o.address.line2 && `, ${o.address.line2}`}
            <br />
            {o.address.city}, {o.address.state} {o.address.pin}
          </p>
        </div>
        <div>
          <span>Place of supply</span>
          <p>
            {o.address.state} ({intra ? "CGST + SGST" : "IGST"})
            <br />
            Paid by {PAYMENT_LABEL[o.payment]}
          </p>
        </div>
      </div>
      <div className="a6-inv-scroll">
        <table className="a6-inv-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>HSN/SAC</th>
              <th className="a6-r">Qty</th>
              <th className="a6-r">Taxable</th>
              {intra ? (
                <>
                  <th className="a6-r">CGST</th>
                  <th className="a6-r">SGST</th>
                </>
              ) : (
                <th className="a6-r">IGST</th>
              )}
              <th className="a6-r">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.hsn}</td>
                <td className="a6-r">{r.qty}</td>
                <td className="a6-r">{r2(r.taxable)}</td>
                {intra ? (
                  <>
                    <td className="a6-r">
                      {r2(r.tax / 2)} <small>{r.rate / 2}%</small>
                    </td>
                    <td className="a6-r">
                      {r2(r.tax / 2)} <small>{r.rate / 2}%</small>
                    </td>
                  </>
                ) : (
                  <td className="a6-r">
                    {r2(r.tax)} <small>{r.rate}%</small>
                  </td>
                )}
                <td className="a6-r">{r2(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="a6-ledger a6-inv-totals">
        <div>
          <dt>Taxable value</dt>
          <dd>₹{r2(tTaxable)}</dd>
        </div>
        {intra ? (
          <>
            <div>
              <dt>CGST</dt>
              <dd>₹{r2(tTax / 2)}</dd>
            </div>
            <div>
              <dt>SGST</dt>
              <dd>₹{r2(tTax / 2)}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>IGST</dt>
            <dd>₹{r2(tTax)}</dd>
          </div>
        )}
        <div data-total>
          <dt>Total</dt>
          <dd>₹{r2(o.total)}</dd>
        </div>
      </dl>
      <p className="a6-inv-words">
        {rupeesInWords(o.total)}.{o.discount > 0 && ` Discount of ₹${fmtNum(o.discount)}${o.coupon ? ` (${o.coupon})` : ""} is spread across the lines.`}
      </p>
      <p className="a6-inv-foot">HSN codes and rates are placeholders until the Maison&rsquo;s accountant confirms them. Computer-generated invoice; no signature needed.</p>
    </article>
  );
}
