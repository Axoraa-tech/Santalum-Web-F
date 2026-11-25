"use client";

import Link from "next/link";
import { use, useState } from "react";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords, STATUS } from "../_data/format";
import { GST_BY_CATEGORY } from "../_data/mock";
import { NEXT_STAGE, orderActions, useCoupons, useCustomers, useOrder, useProducts, useSettings } from "../_data/store";
import type { AdminOrder, EventKind, Settings } from "../_data/types";
import { Icon, type IconName } from "./icons";
import { Empty, Field, initials, Modal, PageHead, Panel, StatusPill, Thumb, toast, WoodLabel } from "./ui";

const FLOW = ["new", "confirmed", "packed", "shipped", "delivered"] as const;
const COURIERS = ["Delhivery", "Blue Dart", "DTDC", "India Post", "Shiprocket"];
type ModalId = null | "awb" | "cancel" | "refund" | "return" | "invoice";

export function OrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = useOrder(decodeURIComponent(id).toUpperCase());
  if (!order)
    return (
      <div className="adm-page">
        <PageHead crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: id }]} title="Order not found" />
        <div className="adm-panel">
          <Empty icon="orders" title={`No order ${id}`} action={<Link href="/admin/orders" className="adm-btn">Back to orders</Link>}>
            It may have been placed in another browser. Preview orders live in the browser they were placed in.
          </Empty>
        </div>
      </div>
    );
  return <OrderBody o={order} />;
}

function OrderBody({ o }: { o: AdminOrder }) {
  const [modal, setModal] = useState<ModalId>(null);
  const [note, setNote] = useState("");
  const customers = useCustomers();
  const coupons = useCoupons();
  const customer = customers.find((c) => c.id === o.customerId);
  const next = NEXT_STAGE[o.status];
  const pieces = o.lines.reduce((s, l) => s + l.qty, 0);
  const canCancel = o.status === "new" || o.status === "confirmed" || o.status === "packed";
  const prepaid = o.payment !== "cod";
  const refundable = prepaid && o.refunded < o.total && (o.status === "cancelled" || o.status === "returned" || o.status === "delivered" || o.status === "return-requested");
  const stageIdx = FLOW.indexOf(o.status as (typeof FLOW)[number]);
  const reached = stageIdx >= 0 ? stageIdx : o.status === "cancelled" ? FLOW.reduce((r, s, i) => (o.timeline.some((e) => e.kind === s) ? i : r), 0) : 4;
  const coupon = o.coupon ? coupons.find((c) => c.code === o.coupon) : undefined;
  const close = () => setModal(null);

  const primary =
    o.status === "packed" ? (
      <button type="button" className="adm-btn" data-variant="primary" onClick={() => setModal("awb")}>
        <Icon name="truck" />
        Add AWB and ship
      </button>
    ) : o.status === "return-requested" ? (
      <button type="button" className="adm-btn" data-variant="primary" onClick={() => setModal("return")}>
        <Icon name="check" />
        Approve return
      </button>
    ) : next ? (
      <button
        type="button"
        className="adm-btn"
        data-variant="primary"
        onClick={() => {
          orderActions.advance(o);
          toast(`${o.id} marked ${STATUS[next.to].label.toLowerCase()}`);
        }}
      >
        <Icon name="arrowRight" />
        {next.label}
      </button>
    ) : null;

  return (
    <div className="adm-page">
      <PageHead
        crumbs={[{ label: "Admin", href: "/admin" }, { label: "Orders", href: "/admin/orders" }, { label: o.id }]}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span className="num">{o.id}</span>
            <StatusPill status={o.status} />
          </span>
        }
        sub={
          <>
            Placed {fmtDateTime(o.placedAt)} · {pieces} {pieces === 1 ? "piece" : "pieces"} · {o.delivery === "express" ? "Express delivery" : "Standard delivery"}
            {o.source === "preview" && " · placed on the shop in this browser"}
          </>
        }
        actions={
          <>
            <button type="button" className="adm-btn" onClick={() => setModal("invoice")}>
              <Icon name="print" />
              Invoice
            </button>
            {(o.status === "new" || o.status === "confirmed" || o.status === "shipped") && (
              <button type="button" className="adm-btn" onClick={() => setModal("awb")}>
                <Icon name="truck" />
                {o.courier ? "Edit AWB" : "Add AWB"}
              </button>
            )}
            {refundable && (
              <button type="button" className="adm-btn" onClick={() => setModal("refund")}>
                <Icon name="refund" />
                Refund
              </button>
            )}
            {canCancel && (
              <button type="button" className="adm-btn" data-variant="danger" onClick={() => setModal("cancel")}>
                Cancel order
              </button>
            )}
            {primary}
          </>
        }
      />

      <div className="adm-grid adm-cols-main">
        <div className="adm-stack">
          <section className="adm-panel" aria-label="Progress" style={{ padding: "16px 18px" }}>
            <div className="adm-stages">
              {FLOW.map((s, i) => (
                <div key={s} className="adm-stage" data-done={i <= reached} data-current={i === reached && o.status !== "cancelled"}>
                  {STATUS[s].label}
                </div>
              ))}
            </div>
            {(o.status === "cancelled" || o.status === "return-requested" || o.status === "returned") && (
              <p style={{ margin: "12px 0 0", fontSize: 13.5, display: "flex", gap: 8, alignItems: "center" }} className="adm-ink2">
                <Icon name={o.status === "cancelled" ? "ban" : "undo"} width={16} height={16} />
                {o.status === "cancelled" ? `Cancelled${o.cancelReason ? `: ${o.cancelReason}` : ""}` : `Return ${o.status === "returned" ? "approved" : "requested"}${o.returnReason ? `: “${o.returnReason}”` : ""}`}
              </p>
            )}
          </section>

          <Panel title="Pieces" meta={`${o.lines.length} ${o.lines.length === 1 ? "line" : "lines"}`} bodyClass="" id="p-items">
            <div className="adm-tablewrap" style={{ marginTop: 10 }}>
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Piece</th>
                    <th className="num">Qty</th>
                    <th className="num">Price</th>
                    <th className="num">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {o.lines.map((l) => (
                    <tr key={l.slug + (l.option ?? "")}>
                      <td>
                        <div className="adm-cell-main">
                          <Thumb photoId={l.photoId} slug={l.slug} />
                          <div>
                            <Link href={`/admin/products/${l.slug}`} className="adm-rowlink" style={{ whiteSpace: "normal" }}>
                              {l.name}
                            </Link>
                            <div className="adm-cell-sub" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                              <WoodLabel wood={l.wood} />
                              {l.optionLabel && <span>· {l.optionLabel}</span>}
                              {l.note && <span>· “{l.note}”</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="num">{l.qty}</td>
                      <td className="num">{formatINR(l.unitPrice)}</td>
                      <td className="num" style={{ fontWeight: 500 }}>
                        {formatINR(l.unitPrice * l.qty)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: "grid", justifyContent: "end", padding: "12px 18px 16px", borderTop: "1px solid var(--a-line)" }}>
              <dl className="adm-dl num" style={{ gridTemplateColumns: "160px 120px", textAlign: "right" }}>
                <dt>Subtotal</dt>
                <dd>{formatINR(o.subtotal)}</dd>
                {o.discount > 0 && (
                  <>
                    <dt>Discount {o.coupon && <span className="adm-tag">{o.coupon}</span>}</dt>
                    <dd>−{formatINR(o.discount)}</dd>
                  </>
                )}
                <dt>Shipping</dt>
                <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
                <dt style={{ color: "var(--a-ink)", fontWeight: 600 }}>Total</dt>
                <dd style={{ fontWeight: 600 }}>{formatINR(o.total)}</dd>
                {o.refunded > 0 && (
                  <>
                    <dt>Refunded</dt>
                    <dd style={{ color: "var(--a-bad)" }}>−{formatINR(o.refunded)}</dd>
                    <dt>Net</dt>
                    <dd>{formatINR(o.total - o.refunded)}</dd>
                  </>
                )}
              </dl>
              <span className="adm-hint" style={{ textAlign: "right", marginTop: 6 }}>
                Prices include GST
              </span>
            </div>
          </Panel>

          <Panel title="Timeline" meta="Everything that happened to this order" id="p-timeline">
            <ol className="adm-timeline" style={{ marginTop: 4 }}>
              {[...o.timeline].reverse().map((e, i) => (
                <li key={i}>
                  <span className="adm-timeline-dot" data-tone={TONE[e.kind]}>
                    <Icon name={EVENT_ICON[e.kind]} />
                  </span>
                  <div>
                    <div className="adm-timeline-text">{e.text}</div>
                    <div className="adm-timeline-meta">
                      {fmtDateTime(e.at)}
                      {e.by && ` · ${e.by}`}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
            <form
              style={{ display: "flex", gap: 8, marginTop: 16 }}
              onSubmit={(e) => {
                e.preventDefault();
                if (!note.trim()) return;
                orderActions.note(o, note.trim());
                setNote("");
                toast("Note added to the timeline");
              }}
            >
              <label className="adm-sr" htmlFor="order-note">
                Internal note
              </label>
              <input id="order-note" className="adm-input" placeholder="Add an internal note (the customer won't see it)" value={note} onChange={(e) => setNote(e.target.value)} />
              <button type="submit" className="adm-btn" disabled={!note.trim()}>
                Add note
              </button>
            </form>
          </Panel>
        </div>

        <aside className="adm-stack" aria-label="Order details">
          <Panel title="Customer" id="p-cust">
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <span className="adm-avatar" style={{ width: 38, height: 38, fontSize: 13 }}>
                {initials(o.name)}
              </span>
              <div style={{ minWidth: 0 }}>
                {customer ? (
                  <Link href={`/admin/customers/${customer.id}`} className="adm-rowlink">
                    {o.name}
                  </Link>
                ) : (
                  <strong>{o.name}</strong>
                )}
                {customer && (
                  <div className="adm-cell-sub">
                    {customer.orders} {customer.orders === 1 ? "order" : "orders"} · {formatINR(customer.ltv)} lifetime
                  </div>
                )}
              </div>
            </div>
            <div className="adm-divider" />
            <dl className="adm-dl">
              <dt>Email</dt>
              <dd>
                <a className="adm-link" href={`mailto:${o.email}`}>
                  {o.email}
                </a>
              </dd>
              <dt>Phone</dt>
              <dd className="num">{o.phone.replace(/^(\d{5})(\d{5})$/, "$1 $2")}</dd>
            </dl>
          </Panel>

          <Panel
            title="Ship to"
            id="p-addr"
            action={
              <button
                type="button"
                className="adm-btn"
                data-variant="ghost"
                data-size="icon-sm"
                aria-label="Copy address"
                onClick={() => {
                  navigator.clipboard?.writeText(addressText(o)).catch(() => {});
                  toast("Address copied");
                }}
              >
                <Icon name="copy" />
              </button>
            }
          >
            <address style={{ fontStyle: "normal", lineHeight: 1.55 }}>
              <strong style={{ fontWeight: 500 }}>{o.address.name}</strong>
              <br />
              {o.address.line1}
              {o.address.line2 && (
                <>
                  <br />
                  {o.address.line2}
                </>
              )}
              <br />
              {o.address.city}, {o.address.state} <span className="num">{o.address.pin}</span>
            </address>
            <div className="adm-divider" />
            <dl className="adm-dl">
              <dt>Delivery</dt>
              <dd>{o.delivery === "express" ? "Express, 1–2 days" : "Standard, 3–5 days"}</dd>
              <dt>Courier</dt>
              <dd>{o.courier ? o.courier.name : <span className="adm-muted">Not booked</span>}</dd>
              <dt>AWB</dt>
              <dd className="num">{o.courier ? o.courier.awb : <span className="adm-muted">–</span>}</dd>
            </dl>
          </Panel>

          <Panel title="Payment" id="p-pay">
            <dl className="adm-dl">
              <dt>Method</dt>
              <dd>{PAYMENT_LABEL[o.payment]}</dd>
              <dt>Status</dt>
              <dd>
                <span className="adm-pill" data-tone={o.paymentState === "paid" || o.paymentState === "cod-collected" ? "good" : o.paymentState === "cod-pending" ? "warn" : "bad"}>
                  {o.status === "cancelled" && o.paymentState === "cod-pending" ? "Not due" : PAYMENT_STATE[o.paymentState]}
                </span>
              </dd>
              <dt>Reference</dt>
              <dd className="num" style={{ fontSize: 12.5 }}>
                {o.paymentRef}
              </dd>
              {o.refunded > 0 && (
                <>
                  <dt>Refunded</dt>
                  <dd className="num">{formatINR(o.refunded)}</dd>
                </>
              )}
            </dl>
            {prepaid && (
              <p className="adm-hint" style={{ margin: "10px 0 0" }}>
                Razorpay is not connected in the preview. Refunds here are recorded, not sent.
              </p>
            )}
          </Panel>

          {(o.coupon || o.giftNote) && (
            <Panel title={o.coupon ? "Coupon and note" : "Gift note"} id="p-extra">
              {o.coupon && (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="adm-tag" data-tone="ink">
                    {o.coupon}
                  </span>
                  <span style={{ fontSize: 13 }}>
                    {coupon?.label ?? "Code no longer exists"} <span className="adm-muted">· −{formatINR(o.discount)}</span>
                  </span>
                </div>
              )}
              {o.giftNote && (
                <blockquote style={{ margin: o.coupon ? "14px 0 0" : 0, padding: "10px 12px", background: "var(--a-surface-2)", borderRadius: 10, fontFamily: "var(--font-display)", fontSize: 15, fontStyle: "italic" }}>
                  “{o.giftNote}”
                </blockquote>
              )}
            </Panel>
          )}
        </aside>
      </div>

      <AwbModal open={modal === "awb"} onClose={close} o={o} />
      <CancelModal open={modal === "cancel"} onClose={close} o={o} />
      <RefundModal open={modal === "refund"} onClose={close} o={o} />
      <Modal
        open={modal === "return"}
        onClose={close}
        title="Approve this return?"
        description="The courier is booked to collect the piece. Refund once it arrives and passes inspection."
        footer={
          <>
            <button type="button" className="adm-btn" onClick={close}>
              Not now
            </button>
            <button
              type="button"
              className="adm-btn"
              data-variant="primary"
              onClick={() => {
                orderActions.approveReturn(o);
                toast("Return approved, pickup arranged");
                close();
              }}
            >
              Approve return
            </button>
          </>
        }
      >
        <div className="adm-panel" style={{ padding: "12px 14px", background: "var(--a-surface-2)", boxShadow: "none" }}>
          <div className="adm-muted" style={{ fontSize: 12.5 }}>
            Customer&apos;s reason
          </div>
          <div>“{o.returnReason ?? "No reason given"}”</div>
        </div>
      </Modal>
      <InvoiceModal open={modal === "invoice"} onClose={close} o={o} />
    </div>
  );
}

const TONE: Partial<Record<EventKind, string>> = { placed: "done", confirmed: "done", packed: "done", shipped: "done", delivered: "done", cancelled: "bad", "return-requested": "bad", returned: "bad", refund: "bad", note: "note" };
const EVENT_ICON: Record<EventKind, IconName> = {
  placed: "orders",
  confirmed: "check",
  packed: "box",
  shipped: "truck",
  delivered: "check",
  cancelled: "ban",
  "return-requested": "undo",
  returned: "undo",
  refund: "refund",
  awb: "tag",
  note: "note",
};

function addressText(o: AdminOrder) {
  const a = o.address;
  return [a.name, a.line1, a.line2, `${a.city}, ${a.state} ${a.pin}`, a.phone].filter(Boolean).join("\n");
}

/* ---------- AWB ---------- */
function AwbModal({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  return (
    <Modal open={open} onClose={onClose} title={o.courier ? "Edit AWB" : "Add AWB"} description="The customer gets the tracking link by email and SMS once the order ships.">
      {open && <AwbForm o={o} onClose={onClose} />}
    </Modal>
  );
}
function AwbForm({ o, onClose }: { o: AdminOrder; onClose: () => void }) {
  const [courier, setCourier] = useState(o.courier?.name ?? (o.delivery === "express" ? "Blue Dart" : "Delhivery"));
  const [awb, setAwb] = useState(o.courier?.awb ?? "");
  const [ship, setShip] = useState(o.status === "packed" || o.status === "confirmed");
  const [err, setErr] = useState<string | null>(null);
  return (
    <form
      style={{ display: "grid", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        const clean = awb.replace(/\s/g, "");
        if (!/^[A-Z0-9]{8,16}$/i.test(clean)) return setErr("AWB numbers are 8 to 16 letters or digits.");
        orderActions.setAwb(o, { name: courier, awb: clean.toUpperCase() }, ship && o.status !== "shipped");
        toast(ship && o.status !== "shipped" ? `${o.id} shipped with ${courier}` : "AWB saved");
        onClose();
      }}
    >
      <div className="adm-form-grid">
        <Field label="Courier">
          {(id) => (
            <select id={id} className="adm-select" value={courier} onChange={(e) => setCourier(e.target.value)}>
              {COURIERS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          )}
        </Field>
        <Field label="AWB number" error={err}>
          {(id) => <input id={id} className="adm-input num" value={awb} onChange={(e) => setAwb(e.target.value)} placeholder="e.g. 48120039175" aria-invalid={!!err} autoFocus />}
        </Field>
      </div>
      {o.status !== "shipped" && (
        <label className="adm-check">
          <input type="checkbox" checked={ship} onChange={(e) => setShip(e.target.checked)} />
          Mark the order as shipped
        </label>
      )}
      <div className="adm-modal-foot" style={{ padding: "6px 0 12px" }}>
        <button type="button" className="adm-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="adm-btn" data-variant="primary">
          {ship && o.status !== "shipped" ? "Save and ship" : "Save AWB"}
        </button>
      </div>
    </form>
  );
}

/* ---------- cancel ---------- */
const CANCEL = ["Customer asked to cancel", "Out of stock", "Payment not received", "Address not serviceable", "Suspected fraud", "Other"];
function CancelModal({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  const [reason, setReason] = useState(CANCEL[0]);
  const [detail, setDetail] = useState("");
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cancel ${o.id}?`}
      description={o.payment === "cod" ? "Nothing has been collected, so no refund is due." : `The customer paid ${formatINR(o.total)}. Refund it from the order once cancelled.`}
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose}>
            Keep the order
          </button>
          <button
            type="button"
            className="adm-btn"
            data-variant="accent"
            onClick={() => {
              orderActions.cancel(o, detail.trim() ? `${reason}. ${detail.trim()}` : reason);
              toast(`${o.id} cancelled`);
              onClose();
            }}
          >
            Cancel order
          </button>
        </>
      }
    >
      <Field label="Reason">
        {(id) => (
          <select id={id} className="adm-select" value={reason} onChange={(e) => setReason(e.target.value)}>
            {CANCEL.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="Details" hint="Kept on the timeline, not sent to the customer.">
        {(id) => <textarea id={id} className="adm-textarea" value={detail} onChange={(e) => setDetail(e.target.value)} />}
      </Field>
    </Modal>
  );
}

/* ---------- refund ---------- */
function RefundModal({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  return (
    <Modal open={open} onClose={onClose} title="Refund" description={`Paid ${formatINR(o.total)} by ${PAYMENT_LABEL[o.payment]}. Already refunded ${formatINR(o.refunded)}.`}>
      {open && <RefundForm o={o} onClose={onClose} />}
    </Modal>
  );
}
function RefundForm({ o, onClose }: { o: AdminOrder; onClose: () => void }) {
  const left = o.total - o.refunded;
  const [amount, setAmount] = useState(String(left));
  const [why, setWhy] = useState(o.status === "cancelled" ? "Order cancelled" : o.status === "returned" ? "Return received" : "");
  const n = Number(amount);
  const err = !amount || !Number.isFinite(n) || n <= 0 ? "Enter an amount." : n > left ? `At most ${formatINR(left)}.` : null;
  return (
    <form
      style={{ display: "grid", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        if (err) return;
        orderActions.refund(o, Math.round(n), why.trim());
        toast(`Refund of ${formatINR(Math.round(n))} recorded`);
        onClose();
      }}
    >
      <div className="adm-form-grid">
        <Field label="Amount" error={amount ? err : null} hint={`Up to ${formatINR(left)}`}>
          {(id) => (
            <div className="adm-affix">
              <span>₹</span>
              <input id={id} className="adm-input num" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d]/g, ""))} autoFocus />
            </div>
          )}
        </Field>
        <Field label="Reason">{(id) => <input id={id} className="adm-input" value={why} onChange={(e) => setWhy(e.target.value)} />}</Field>
      </div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {o.lines.map((l) => (
          <button key={l.slug + l.option} type="button" className="adm-btn" data-size="sm" onClick={() => setAmount(String(Math.min(left, l.unitPrice * l.qty)))}>
            {l.name.split(",")[0]} · {formatINR(l.unitPrice * l.qty)}
          </button>
        ))}
        <button type="button" className="adm-btn" data-size="sm" onClick={() => setAmount(String(left))}>
          Full · {formatINR(left)}
        </button>
      </div>
      <div className="adm-modal-foot" style={{ padding: "6px 0 12px" }}>
        <button type="button" className="adm-btn" onClick={onClose}>
          Cancel
        </button>
        <button type="submit" className="adm-btn" data-variant="primary" disabled={!!err}>
          Refund {err ? "" : formatINR(Math.round(n))}
        </button>
      </div>
    </form>
  );
}

/* ---------- invoice with GST lines ---------- */
function InvoiceModal({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  const settings = useSettings();
  const products = useProducts();
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      print
      title="Tax invoice"
      description="Printable. Prices include GST; tax is worked back from each line."
      footer={
        <>
          <button type="button" className="adm-btn" onClick={onClose}>
            Close
          </button>
          <button type="button" className="adm-btn" data-variant="primary" onClick={() => window.print()}>
            <Icon name="print" />
            Print or save PDF
          </button>
        </>
      }
    >
      {open && <Invoice o={o} s={settings} categoryOf={(slug) => products.find((p) => p.slug === slug)?.category ?? getProduct(slug)?.category} />}
    </Modal>
  );
}

function Invoice({ o, s, categoryOf }: { o: AdminOrder; s: Settings; categoryOf: (slug: string) => string | undefined }) {
  const st = s.store;
  const intra = o.address.state.trim().toLowerCase() === st.state.trim().toLowerCase();
  const rows = o.lines.map((l) => {
    const cat = categoryOf(l.slug) as keyof typeof GST_BY_CATEGORY | undefined;
    const g = (cat && GST_BY_CATEGORY[cat]) || { hsn: l.wood === "red" ? st.hsnRed : st.hsnWhite, rate: st.gstRate, label: "" };
    const gross = l.unitPrice * l.qty;
    const share = o.subtotal ? (o.discount * gross) / o.subtotal : 0;
    const value = gross - share;
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
    <div className="adm-invoice" style={{ borderRadius: 10, boxShadow: "inset 0 0 0 1px var(--a-line)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h2>{st.name}</h2>
          <div style={{ color: "#5d544b", marginTop: 4 }}>
            {st.legalName}
            <br />
            {st.address}, {st.city}, {st.state} {st.pin}
            <br />
            GSTIN {st.gstin} · PAN {st.pan}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="adm-invoice-label">Tax invoice</div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {st.invoicePrefix}
            {o.id.replace(/^SM-/, "")}
          </div>
          <div style={{ color: "#5d544b" }}>Dated {fmtDate(o.placedAt)}</div>
          <div style={{ color: "#5d544b" }}>Order {o.id}</div>
        </div>
      </div>

      <div className="adm-invoice-grid">
        <div>
          <div className="adm-invoice-label">Billed to</div>
          {o.name}
          <br />
          {o.email}
          <br />
          {o.phone}
        </div>
        <div>
          <div className="adm-invoice-label">Shipped to</div>
          {o.address.line1}
          {o.address.line2 && `, ${o.address.line2}`}
          <br />
          {o.address.city}, {o.address.state} {o.address.pin}
        </div>
        <div>
          <div className="adm-invoice-label">Place of supply</div>
          {o.address.state} {intra ? "(intra-state: CGST + SGST)" : "(inter-state: IGST)"}
          <br />
          Payment: {PAYMENT_LABEL[o.payment]}
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>HSN/SAC</th>
            <th className="r">Qty</th>
            <th className="r">Taxable value</th>
            {intra ? (
              <>
                <th className="r">CGST</th>
                <th className="r">SGST</th>
              </>
            ) : (
              <th className="r">IGST</th>
            )}
            <th className="r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.name}</td>
              <td>{r.hsn}</td>
              <td className="r">{r.qty}</td>
              <td className="r">{r2(r.taxable)}</td>
              {intra ? (
                <>
                  <td className="r">
                    {r2(r.tax / 2)}
                    <div style={{ color: "#8f857a", fontSize: 10.5 }}>{r.rate / 2}%</div>
                  </td>
                  <td className="r">
                    {r2(r.tax / 2)}
                    <div style={{ color: "#8f857a", fontSize: 10.5 }}>{r.rate / 2}%</div>
                  </td>
                </>
              ) : (
                <td className="r">
                  {r2(r.tax)}
                  <div style={{ color: "#8f857a", fontSize: 10.5 }}>{r.rate}%</div>
                </td>
              )}
              <td className="r">{r2(r.value)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="adm-invoice-totals">
        <div>
          <span>Taxable value</span>
          <span>₹{r2(tTaxable)}</span>
        </div>
        {intra ? (
          <>
            <div>
              <span>CGST</span>
              <span>₹{r2(tTax / 2)}</span>
            </div>
            <div>
              <span>SGST</span>
              <span>₹{r2(tTax / 2)}</span>
            </div>
          </>
        ) : (
          <div>
            <span>IGST</span>
            <span>₹{r2(tTax)}</span>
          </div>
        )}
        <div>
          <span>Total</span>
          <span>₹{r2(o.total)}</span>
        </div>
      </div>
      <p style={{ marginTop: 12, color: "#5d544b" }}>
        {rupeesInWords(o.total)}.{o.discount > 0 && ` Discount of ₹${r2(o.discount)}${o.coupon ? ` (${o.coupon})` : ""} is spread across the lines above.`}
      </p>
      <p style={{ marginTop: 18, fontSize: 11, color: "#8f857a" }}>
        HSN codes and rates are placeholders until confirmed by the Maison&apos;s accountant. This is a computer-generated invoice and needs no signature.
      </p>
    </div>
  );
}
