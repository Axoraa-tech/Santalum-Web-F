"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { DELIVERY } from "@/lib/shop/bag";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords, STATUS } from "../../_data/format";
import { GST_BY_CATEGORY } from "../../_data/mock";
import { NEXT_STAGE, orderActions, useOrders, useSettings } from "../../_data/store";
import type { AdminOrder, Settings } from "../../_data/types";
import { BASE, Empty, F, Fig, folios, Head, note, PAY_STAMP, Section, Stamp, StatusStamp, WoodMark } from "./kit";

const COURIERS = ["Blue Dart", "Delhivery", "DTDC", "India Post Speed Post"];

export function OrderEntry({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const orders = useOrders();
  const o = orders.find((x) => x.id === decodeURIComponent(id));
  const fo = useMemo(() => folios(orders), [orders]);
  if (!o)
    return (
      <div>
        <Head kicker="Order book" title="No such entry" />
        <Empty>
          Order {decodeURIComponent(id)} is not in this book. <Link href={`${BASE}/orders`} className="a2-link">Back to the orders</Link>
        </Empty>
      </div>
    );
  return <Entry o={o} folio={fo.get(o.id) ?? 0} />;
}

function Entry({ o, folio }: { o: AdminOrder; folio: number }) {
  const settings = useSettings();
  const next = NEXT_STAGE[o.status];
  const pay = PAY_STAMP[o.paymentState];
  const canCancel = o.status === "new" || o.status === "confirmed" || o.status === "packed";
  const canRefund = o.paymentState !== "cod-pending" && o.refunded < o.total && o.status !== "new";

  return (
    <div className="a2-entry">
      <Head
        kicker={
          <>
            <Link href={`${BASE}/orders`} className="a2-link">Order book</Link> · folio <span className="a2-folio">{folio}</span> · {o.id}
          </>
        }
        title={o.name}
        aside={
          <div className="a2-stamps">
            <StatusStamp o={o} size="lg" />
            <Stamp word={pay.word} ink={pay.ink} seed={o.id + "p"} size="md" />
          </div>
        }
      >
        <p className="a2-lede">
          Entered {fmtDateTime(o.placedAt)} · {o.address.city}, {o.address.state}
          {o.source === "preview" ? " · placed on the shop in this browser" : ""}
        </p>
      </Head>

      <div className="a2-spread">
        <div>
          <Section title="Particulars">
            <div className="a2-ledger a2-lines" role="table" aria-label="Pieces">
              <div className="a2-lrow a2-lhead" role="row">
                <span role="columnheader">Piece</span>
                <span role="columnheader" className="a2-r">Qty</span>
                <span role="columnheader" className="a2-r">Rate</span>
                <span role="columnheader" className="a2-r">Dr.</span>
                <span role="columnheader" className="a2-r">Cr.</span>
              </div>
              {o.lines.map((l, i) => (
                <div key={i} className="a2-lrow" role="row">
                  <span className="a2-part" role="cell">
                    <Link href={`${BASE}/products/${l.slug}`}>{l.name}</Link>
                    <small>
                      <WoodMark wood={l.wood} />
                      {l.optionLabel ? ` · ${l.optionLabel}` : ""}
                      {l.note ? ` · “${l.note}”` : ""}
                    </small>
                  </span>
                  <span className="a2-r a2-fig" role="cell">{l.qty}</span>
                  <span className="a2-r" role="cell"><Fig n={l.unitPrice} /></span>
                  <span className="a2-r" role="cell"><Fig n={l.qty * l.unitPrice} /></span>
                  <span className="a2-r" role="cell" />
                </div>
              ))}
              <Row label="Delivery" dr={o.shipping} hint={DELIVERY[o.delivery]?.label} />
              {o.discount ? <Row label={`Coupon ${o.coupon ?? ""}`} cr={o.discount} /> : null}
              <div className="a2-lrow a2-ltotal" role="row">
                <span>Order total</span>
                <span />
                <span />
                <span className="a2-r"><span className="a2-fig a2-dbl">{formatINR(o.total)}</span></span>
                <span />
              </div>
              {o.refunded ? <Row label="Refunded" cr={o.refunded} /> : null}
              {o.refunded ? (
                <div className="a2-lrow a2-ltotal" role="row">
                  <span>Kept, after refunds</span>
                  <span />
                  <span />
                  <span className="a2-r"><span className="a2-fig a2-dbl">{formatINR(o.total - o.refunded)}</span></span>
                  <span />
                </div>
              ) : null}
            </div>
          </Section>

          <Section title="Next in the book">
            <div className="a2-acts">
              {next ? (
                <button
                  type="button"
                  className="a2-btn"
                  data-kind="ink"
                  onClick={() => {
                    orderActions.advance(o);
                    note(`Stamped ${STATUS[next.to].label.toLowerCase()}`);
                  }}
                >
                  {next.label}
                </button>
              ) : (
                <p className="a2-dim">Nothing further for this entry{o.status === "delivered" ? ": delivered." : "."}</p>
              )}
              {o.status === "return-requested" ? (
                <button
                  type="button"
                  className="a2-btn"
                  onClick={() => {
                    orderActions.approveReturn(o);
                    note("Return approved");
                  }}
                >
                  Approve return
                </button>
              ) : null}
              {o.returnReason ? <p className="a2-margin-q">Return reason: “{o.returnReason}”</p> : null}
              {o.cancelReason ? <p className="a2-margin-q">Void: {o.cancelReason}</p> : null}
            </div>
            {o.status === "confirmed" || o.status === "packed" ? <AwbForm o={o} /> : null}
            <div className="a2-subforms">
              {canCancel ? <CancelForm o={o} /> : null}
              {canRefund ? <RefundForm o={o} /> : null}
            </div>
          </Section>

          <Section title="Entries against this folio">
            <ol className="a2-time">
              {[...o.timeline].reverse().map((e, i) => (
                <li key={i} data-kind={e.kind}>
                  <span className="a2-time-at">{fmtDateTime(e.at)}</span>
                  <span>
                    {e.text}
                    {e.by ? <small> — {e.by}</small> : null}
                  </span>
                </li>
              ))}
            </ol>
            <NoteForm o={o} />
          </Section>
        </div>

        <aside className="a2-margin-notes">
          <Section title="Account">
            <p className="a2-addr">
              <Link href={`${BASE}/customers/${o.customerId}`} className="a2-link">{o.name}</Link>
              <br />
              {o.email}
              <br />
              {o.phone}
            </p>
          </Section>
          <Section title="Deliver to">
            <p className="a2-addr">
              {o.address.name}
              <br />
              {o.address.line1}
              {o.address.line2 ? <>, {o.address.line2}</> : null}
              <br />
              {o.address.city}, {o.address.state} {o.address.pin}
            </p>
            {o.courier ? (
              <p className="a2-dim">
                {o.courier.name}, AWB <span className="a2-fig">{o.courier.awb}</span>
              </p>
            ) : null}
          </Section>
          <Section title="Payment">
            <p className="a2-addr">
              {PAYMENT_LABEL[o.payment]} · {PAYMENT_STATE[o.paymentState]}
              <br />
              <span className="a2-dim">{o.paymentRef}</span>
            </p>
          </Section>
          {o.giftNote ? (
            <Section title="Gift note">
              <p className="a2-margin-q">“{o.giftNote}”</p>
            </Section>
          ) : null}
        </aside>
      </div>

      <Section
        title="Invoice, carbon copy"
        aside={
          <button type="button" className="a2-btn" onClick={() => window.print()}>
            Print invoice
          </button>
        }
      >
        <CarbonSlip o={o} folio={folio} s={settings} />
      </Section>
    </div>
  );
}

function Row({ label, dr, cr, hint }: { label: string; dr?: number; cr?: number; hint?: string }) {
  return (
    <div className="a2-lrow" role="row">
      <span className="a2-part" role="cell">
        {label}
        {hint ? <small>{hint}</small> : null}
      </span>
      <span role="cell" />
      <span role="cell" />
      <span className="a2-r" role="cell">{dr !== undefined ? <Fig n={dr} blank /> : null}</span>
      <span className="a2-r" role="cell">{cr !== undefined ? <Fig n={cr} cr /> : null}</span>
    </div>
  );
}

function AwbForm({ o }: { o: AdminOrder }) {
  const [name, setName] = useState(o.courier?.name ?? COURIERS[0]);
  const [awb, setAwb] = useState(o.courier?.awb ?? "");
  return (
    <form
      className="a2-inline"
      onSubmit={(e) => {
        e.preventDefault();
        if (!awb.trim()) return;
        orderActions.setAwb(o, { name, awb: awb.trim() }, o.status === "packed");
        note(o.status === "packed" ? "AWB written, stamped dispatched" : "AWB written");
      }}
    >
      <F label="Courier">
        <select value={name} onChange={(e) => setName(e.target.value)}>
          {COURIERS.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </F>
      <F label="Air waybill no.">
        <input value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="e.g. 7730 2291 0044" />
      </F>
      <button type="submit" className="a2-btn" disabled={!awb.trim()}>
        {o.status === "packed" ? "Write AWB and dispatch" : "Write AWB"}
      </button>
    </form>
  );
}

function CancelForm({ o }: { o: AdminOrder }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  if (!open)
    return (
      <button type="button" className="a2-link a2-red" onClick={() => setOpen(true)}>
        Void this order…
      </button>
    );
  return (
    <form
      className="a2-inline"
      onSubmit={(e) => {
        e.preventDefault();
        orderActions.cancel(o, reason.trim() || "No reason given");
        note("Entry voided");
        setOpen(false);
      }}
    >
      <F label="Reason for voiding" wide>
        <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Customer changed the delivery city" autoFocus />
      </F>
      <button type="submit" className="a2-btn" data-kind="red">
        Stamp void
      </button>
      <button type="button" className="a2-link" onClick={() => setOpen(false)}>
        keep it
      </button>
    </form>
  );
}

function RefundForm({ o }: { o: AdminOrder }) {
  const left = o.total - o.refunded;
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState(String(left));
  const [why, setWhy] = useState("");
  const n = Math.round(Number(amt));
  const ok = n > 0 && n <= left;
  if (!open)
    return (
      <button type="button" className="a2-link" onClick={() => setOpen(true)}>
        Refund…
      </button>
    );
  return (
    <form
      className="a2-inline"
      onSubmit={(e) => {
        e.preventDefault();
        if (!ok) return;
        orderActions.refund(o, n, why.trim());
        note(`Refunded ${formatINR(n)}`);
        setOpen(false);
      }}
    >
      <F label={`Amount (up to ${formatINR(left)})`}>
        <input inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d]/g, ""))} />
      </F>
      <F label="Note" wide>
        <input value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Box dented in transit" />
      </F>
      <button type="submit" className="a2-btn" data-kind="red" disabled={!ok}>
        Refund {ok ? formatINR(n) : ""}
      </button>
      <button type="button" className="a2-link" onClick={() => setOpen(false)}>
        cancel
      </button>
    </form>
  );
}

function NoteForm({ o }: { o: AdminOrder }) {
  const [body, setBody] = useState("");
  return (
    <form
      className="a2-inline"
      onSubmit={(e) => {
        e.preventDefault();
        if (!body.trim()) return;
        orderActions.note(o, body.trim());
        setBody("");
        note("Note written");
      }}
    >
      <F label="Write a note against this folio" wide>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Customer asked for a call before delivery" />
      </F>
      <button type="submit" className="a2-btn" disabled={!body.trim()}>
        Write
      </button>
    </form>
  );
}

/** The tax invoice as a carbon copy: blue carbon ink on thin duplicate paper, perforated at the top. */
function CarbonSlip({ o, folio, s }: { o: AdminOrder; folio: number; s: Settings }) {
  const st = s.store;
  const intra = o.address.state.trim().toLowerCase() === st.state.trim().toLowerCase();
  const rows = o.lines.map((l) => {
    const cat = getProduct(l.slug)?.category;
    const g = cat ? GST_BY_CATEGORY[cat] : { hsn: l.wood === "red" ? st.hsnRed : st.hsnWhite, rate: st.gstRate, label: "" };
    const gross = l.qty * l.unitPrice;
    const taxable = st.pricesIncludeGst ? gross / (1 + g.rate / 100) : gross;
    return { l, g, gross, taxable, tax: taxable * (g.rate / 100) };
  });
  const taxable = rows.reduce((a, r) => a + r.taxable, 0);
  const tax = rows.reduce((a, r) => a + r.tax, 0);
  const r2 = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <article className="a2-carbon" aria-label="Tax invoice">
      <div className="a2-carbon-top">
        <div>
          <p className="a2-carbon-name">{st.legalName}</p>
          <p>
            {st.address}, {st.city}, {st.state} {st.pin}
            <br />
            GSTIN {st.gstin} · {st.email} · {st.phone}
          </p>
        </div>
        <div className="a2-carbon-no">
          <p className="a2-carbon-kind">Tax invoice</p>
          <p>
            No. {st.invoicePrefix}
            {String(folio).padStart(4, "0")}
            <br />
            Date {fmtDate(o.placedAt)}
            <br />
            Order {o.id}
          </p>
        </div>
      </div>
      <div className="a2-carbon-to">
        <span>Billed to</span>
        <p>
          {o.address.name}, {o.address.line1}
          {o.address.line2 ? `, ${o.address.line2}` : ""}, {o.address.city}, {o.address.state} {o.address.pin} · {o.phone}
        </p>
      </div>
      <table className="a2-carbon-t">
        <thead>
          <tr>
            <th>Description</th>
            <th>HSN</th>
            <th className="a2-r">Qty</th>
            <th className="a2-r">Taxable</th>
            <th className="a2-r">GST</th>
            <th className="a2-r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>
                {r.l.name}
                {r.l.optionLabel ? `, ${r.l.optionLabel}` : ""}
              </td>
              <td>{r.g.hsn}</td>
              <td className="a2-r">{r.l.qty}</td>
              <td className="a2-r">{r2(r.taxable)}</td>
              <td className="a2-r">{r.g.rate}%</td>
              <td className="a2-r">{r2(r.gross)}</td>
            </tr>
          ))}
          {o.shipping ? (
            <tr>
              <td>Delivery</td>
              <td>9968</td>
              <td />
              <td />
              <td />
              <td className="a2-r">{r2(o.shipping)}</td>
            </tr>
          ) : null}
          {o.discount ? (
            <tr>
              <td>Less coupon {o.coupon}</td>
              <td />
              <td />
              <td />
              <td />
              <td className="a2-r">−{r2(o.discount)}</td>
            </tr>
          ) : null}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>{intra ? `CGST ${r2(tax / 2)} + SGST ${r2(tax / 2)}` : `IGST ${r2(tax)}`} on taxable {r2(taxable)}</td>
            <td colSpan={2} className="a2-r">
              Total
            </td>
            <td className="a2-r">
              <span className="a2-dbl">₹{r2(o.total)}</span>
            </td>
          </tr>
        </tfoot>
      </table>
      <p className="a2-carbon-words">{rupeesInWords(o.total)}.</p>
      <div className="a2-carbon-foot">
        <p>
          Paid by {PAYMENT_LABEL[o.payment]}. {st.pricesIncludeGst ? "Prices include GST." : ""}
        </p>
        <p className="a2-carbon-sign">for {st.name}</p>
      </div>
      <span className="a2-carbon-dup" aria-hidden>
        Duplicate
      </span>
    </article>
  );
}
