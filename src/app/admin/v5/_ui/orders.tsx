"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { use, useMemo, useRef, useState, type PointerEvent as RPE } from "react";
import { getProduct } from "@/lib/shop/products";
import { DAY, GST_BY_CATEGORY, startOfDay } from "../../_data/mock";
import { fmtDate, fmtDateTime, fmtShort, fmtTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords, STATUS, timeAgo } from "../../_data/format";
import { NEXT_STAGE, orderActions, useNow, useOrder, useOrders, useProducts, useSettings } from "../../_data/store";
import type { AdminOrder, AdminStatus } from "../../_data/types";
import { I } from "./icons";
import { BASE, Card, Chip, Empty, Field, Head, Money, Search, Seg, Sheet, StatusChip, Thumb, WoodDot, say, waLink } from "./kit";

const SHORT: Partial<Record<AdminStatus, string>> = { new: "Confirm", confirmed: "Packed", packed: "Shipped", shipped: "Delivered" };
type Filter = "todo" | "shipping" | "done" | "returns" | "all";
const IN: Record<Filter, AdminStatus[] | null> = {
  todo: ["new", "confirmed", "packed"],
  shipping: ["shipped"],
  done: ["delivered"],
  returns: ["return-requested", "returned", "cancelled"],
  all: null,
};
const W = 184;

/* ---------- swipe card ---------- */
export function OrderCard({ o, now, selected }: { o: AdminOrder; now: number; selected?: boolean }) {
  const [open, setOpen] = useState(false);
  const [dx, setDx] = useState<number | null>(null);
  const drag = useRef<{ x0: number; y0: number; base: number; on: boolean } | null>(null);
  const swallow = useRef(false);
  const next = NEXT_STAGE[o.status];

  const down = (e: RPE) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    drag.current = { x0: e.clientX, y0: e.clientY, base: open ? -W : 0, on: false };
  };
  const move = (e: RPE<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const mx = e.clientX - d.x0;
    const my = e.clientY - d.y0;
    if (!d.on) {
      if (Math.abs(mx) > 8 && Math.abs(mx) > Math.abs(my)) {
        d.on = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      } else if (Math.abs(my) > 8) drag.current = null;
      return;
    }
    setDx(Math.max(-W - 24, Math.min(0, d.base + mx)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    if (!d?.on) return;
    swallow.current = true;
    const x = dx ?? d.base;
    setOpen(x < -W / 2);
    setDx(null);
  };
  const advance = () => {
    orderActions.advance(o);
    say(`${o.id} marked ${STATUS[next!.to].label.toLowerCase()}`);
    setOpen(false);
  };
  const x = dx ?? (open ? -W : 0);

  return (
    <div className="a5-swipe" data-open={open ? "" : undefined} data-sel={selected ? "" : undefined}>
      <div className="a5-swipe-acts" aria-hidden={!open}>
        {next ? (
          <button type="button" className="a5-act" data-k="go" tabIndex={open ? 0 : -1} onClick={advance}>
            <I n="check" size={20} />
            {SHORT[o.status]}
          </button>
        ) : (
          <span className="a5-act" data-k="none">
            {STATUS[o.status].label}
          </span>
        )}
        <a className="a5-act" data-k="call" href={`tel:${o.phone}`} tabIndex={open ? 0 : -1}>
          <I n="phone" size={20} />
          Call
        </a>
      </div>
      <div className="a5-ocard" style={{ transform: `translateX(${x}px)` }} data-drag={dx != null ? "" : undefined} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <Link
          href={`${BASE}/orders/${o.id}`}
          scroll={false}
          className="a5-ocard-link"
          draggable={false}
          onClickCapture={(e) => {
            if (swallow.current || open) {
              e.preventDefault();
              if (open && !swallow.current) setOpen(false);
            }
            swallow.current = false;
          }}
        >
          <span className="a5-ocard-top">
            <strong>{o.name}</strong>
            <Money v={o.total} size="m" />
          </span>
          <span className="a5-ocard-meta">
            {o.id} · {timeAgo(o.placedAt, now)} · {o.lines.reduce((s, l) => s + l.qty, 0)} pcs
          </span>
          <span className="a5-ocard-tags">
            <StatusChip s={o.status} />
            {o.woods.map((w) => (
              <WoodDot key={w} w={w} label />
            ))}
            {o.paymentState === "cod-pending" && <Chip tone="gold">COD {o.status === "shipped" ? "to collect" : ""}</Chip>}
            {o.giftNote && <Chip>Gift</Chip>}
          </span>
        </Link>
        <button type="button" className="a5-ocard-more" aria-label={open ? "Hide actions" : "Show actions"} aria-expanded={open} onClick={() => setOpen(!open)}>
          <I n="more" size={18} />
        </button>
      </div>
    </div>
  );
}

/* ---------- list ---------- */
export function OrdersList() {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const now = useNow();
  const orders = useOrders();
  const f = (params.get("s") as Filter) || "todo";
  const stage = params.get("stage") ?? "";
  const [q, setQ] = useState("");
  const [wood, setWood] = useState<"both" | "red" | "white">("both");
  const [shown, setShown] = useState(40);
  const sel = path.split("/orders/")[1];

  const setParam = (s: Filter, st = "") => router.replace(`${BASE}/orders${path.includes("/orders/") ? "/" + sel : ""}?s=${s}${st ? `&stage=${st}` : ""}`, { scroll: false });

  const counts = useMemo(() => {
    const c = {} as Record<Filter, number>;
    for (const k of Object.keys(IN) as Filter[]) c[k] = IN[k] ? orders.filter((o) => IN[k]!.includes(o.status)).length : orders.length;
    return c;
  }, [orders]);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (!IN[f] || IN[f]!.includes(o.status)) &&
        (!stage || f !== "todo" || o.status === stage) &&
        (wood === "both" || o.woods.includes(wood)) &&
        (!t || o.id.toLowerCase().includes(t) || o.name.toLowerCase().includes(t) || o.phone.includes(t) || o.email.toLowerCase().includes(t)),
    );
  }, [orders, f, stage, wood, q]);

  const groups = useMemo(() => {
    const d0 = startOfDay(now);
    const out: { label: string; items: AdminOrder[]; sum: number }[] = [];
    for (const o of rows.slice(0, shown)) {
      const d = startOfDay(o.placedAt);
      const label = d === d0 ? "Today" : d === d0 - DAY ? "Yesterday" : fmtShort(o.placedAt);
      const g = out[out.length - 1];
      if (g && g.label === label) {
        g.items.push(o);
        g.sum += o.total;
      } else out.push({ label, items: [o], sum: o.total });
    }
    return out;
  }, [rows, shown, now]);

  return (
    <>
      <Head eyebrow={`${counts.todo} to work on`} title="Orders" />
      <div className="a5-sticky">
        <Seg
          label="Show"
          value={f}
          onChange={(v) => setParam(v)}
          items={[
            { id: "todo", label: "To do", count: counts.todo },
            { id: "shipping", label: "Sent" },
            { id: "done", label: "Done" },
            { id: "returns", label: "Returns", count: orders.filter((o) => o.status === "return-requested").length },
            { id: "all", label: "All" },
          ]}
        />
        <div className="a5-chips">
          {f === "todo" &&
            (["", "new", "confirmed", "packed"] as const).map((s) => (
              <button key={s} type="button" className="a5-pill" aria-pressed={stage === s} onClick={() => setParam("todo", s)}>
                {s ? STATUS[s].label : "Any stage"}
              </button>
            ))}
          {(["both", "red", "white"] as const).map((w) => (
            <button key={w} type="button" className="a5-pill" aria-pressed={wood === w} onClick={() => setWood(w)} data-w={w}>
              {w === "both" ? "Both woods" : w === "red" ? "Red" : "White"}
            </button>
          ))}
        </div>
      </div>
      <Search value={q} onChange={setQ} placeholder="Order, name, phone or email" />
      {rows.length === 0 && <Empty title="Nothing here">No orders match. Clear the search or pick another filter.</Empty>}
      {groups.map((g) => (
        <section key={g.label} className="a5-day">
          <h2 className="a5-day-head">
            <span>{g.label}</span>
            <Money v={g.sum} size="s" />
          </h2>
          <div className="a5-stack">
            {g.items.map((o) => (
              <OrderCard key={o.id} o={o} now={now} selected={o.id === sel} />
            ))}
          </div>
        </section>
      ))}
      {rows.length > shown && (
        <button type="button" className="a5-btn" data-v="soft" onClick={() => setShown(shown + 40)}>
          Show {Math.min(40, rows.length - shown)} more of {rows.length - shown}
        </button>
      )}
    </>
  );
}

/** Desktop panel before an order is picked: the pipeline, in big numbers. */
export function OrdersIdle() {
  const orders = useOrders();
  const stages: AdminStatus[] = ["new", "confirmed", "packed", "shipped"];
  const value = (s: AdminStatus) => orders.filter((o) => o.status === s).reduce((t, o) => t + o.total, 0);
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Pipeline</div>
      <h2 className="a5-detail-title">Pick an order to open it here</h2>
      <div className="a5-pipe">
        {stages.map((s) => (
          <Link key={s} href={`${BASE}/orders?s=${s === "shipped" ? "shipping" : "todo"}${s === "shipped" ? "" : `&stage=${s}`}`} className="a5-pipe-step">
            <span className="a5-tile-n">{orders.filter((o) => o.status === s).length}</span>
            <span className="a5-tile-l">{STATUS[s].label}</span>
            <Money v={value(s)} size="s" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/* ---------- detail ---------- */
type SheetId = null | "awb" | "cancel" | "refund" | "invoice" | "contact";

export function OrderDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderDetail id={decodeURIComponent(id)} />;
}

function OrderDetail({ id }: { id: string }) {
  const o = useOrder(id);
  const now = useNow();
  const [sheet, setSheet] = useState<SheetId>(null);
  const [note, setNote] = useState("");
  if (!o) return <Empty title="No such order">{id} is not in this browser&apos;s data.</Empty>;
  const next = NEXT_STAGE[o.status];
  const canCancel = o.status === "new" || o.status === "confirmed" || o.status === "packed";
  const canRefund = o.paymentState !== "cod-pending" && o.refunded < o.total && (o.status === "cancelled" || o.status === "returned" || o.status === "return-requested" || o.status === "delivered");
  const close = () => setSheet(null);

  return (
    <div className="a5-detail">
      <div className="a5-detail-top">
        <div>
          <div className="a5-eyebrow">
            {o.id} · {fmtDateTime(o.placedAt)}
          </div>
          <Money v={o.total} size="xl" />
        </div>
        <StatusChip s={o.status} />
      </div>
      <p className="a5-muted">
        {o.name} · {PAYMENT_LABEL[o.payment]} · {PAYMENT_STATE[o.paymentState]}
        {o.refunded > 0 && <> · refunded {formatINR(o.refunded)}</>}
      </p>

      <div className="a5-actions">
        {next && (
          <button
            type="button"
            className="a5-btn"
            data-v="primary"
            onClick={() => {
              if (next.to === "shipped" && !o.courier) return setSheet("awb");
              orderActions.advance(o);
              say(`${o.id}: ${STATUS[next.to].label}`);
            }}
          >
            {next.label}
            <I n="arrow" size={18} />
          </button>
        )}
        {o.status === "return-requested" && (
          <button
            type="button"
            className="a5-btn"
            data-v="primary"
            onClick={() => {
              orderActions.approveReturn(o);
              say("Return approved");
            }}
          >
            Approve return
          </button>
        )}
        <div className="a5-actions-row">
          <button type="button" className="a5-btn" data-v="soft" onClick={() => setSheet("contact")}>
            <I n="phone" size={18} />
            Contact
          </button>
          {(o.status === "confirmed" || o.status === "packed" || o.status === "shipped") && (
            <button type="button" className="a5-btn" data-v="soft" onClick={() => setSheet("awb")}>
              <I n="truck" size={18} />
              {o.courier ? "AWB" : "Add AWB"}
            </button>
          )}
          <button type="button" className="a5-btn" data-v="soft" onClick={() => setSheet("invoice")}>
            <I n="print" size={18} />
            Invoice
          </button>
          {canRefund && (
            <button type="button" className="a5-btn" data-v="soft" onClick={() => setSheet("refund")}>
              Refund
            </button>
          )}
          {canCancel && (
            <button type="button" className="a5-btn" data-v="danger" onClick={() => setSheet("cancel")}>
              Cancel
            </button>
          )}
        </div>
      </div>

      {o.returnReason && o.status === "return-requested" && (
        <div className="a5-callout">
          <strong>Return asked</strong>“{o.returnReason}”
        </div>
      )}
      {o.giftNote && (
        <div className="a5-callout" data-t="gift">
          <strong>Gift note to print</strong>“{o.giftNote}”
        </div>
      )}

      <Card title={`${o.lines.length} ${o.lines.length === 1 ? "piece" : "pieces"}`} flush>
        <div className="a5-list a5-list-flat">
          {o.lines.map((l, i) => (
            <Link key={i} href={`${BASE}/products/${l.slug}`} className="a5-row">
              <Thumb id={l.photoId} wood={l.wood} size={52} />
              <span className="a5-row-main">
                {l.name}
                <small>
                  <WoodDot w={l.wood} /> {l.optionLabel ? `${l.optionLabel} · ` : ""}
                  {l.qty} × {formatINR(l.unitPrice)}
                </small>
              </span>
              <Money v={l.qty * l.unitPrice} size="s" />
            </Link>
          ))}
        </div>
        <dl className="a5-sum">
          <div>
            <dt>Subtotal</dt>
            <dd>{formatINR(o.subtotal)}</dd>
          </div>
          {o.discount > 0 && (
            <div>
              <dt>Discount {o.coupon && <Chip>{o.coupon}</Chip>}</dt>
              <dd>−{formatINR(o.discount)}</dd>
            </div>
          )}
          <div>
            <dt>{o.delivery === "express" ? "Express shipping" : "Shipping"}</dt>
            <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
          </div>
          <div data-total="">
            <dt>Total</dt>
            <dd>
              <Money v={o.total} size="l" />
            </dd>
          </div>
        </dl>
      </Card>

      <div className="a5-two">
        <Card title="Customer">
          <Link href={`${BASE}/customers/${o.customerId}`} className="a5-link">
            {o.name} <I n="chevron" size={16} />
          </Link>
          <p className="a5-muted">
            {o.phone}
            <br />
            {o.email}
          </p>
        </Card>
        <Card title="Ship to">
          <p>
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
          </p>
          {o.courier && (
            <p className="a5-muted">
              {o.courier.name} · AWB {o.courier.awb}
            </p>
          )}
        </Card>
      </div>

      <Card title="Timeline">
        <ol className="a5-time">
          {[...o.timeline].reverse().map((e, i) => (
            <li key={i} data-k={e.kind}>
              <span className="a5-time-dot" aria-hidden />
              <div>
                <strong>{e.text}</strong>
                <small>
                  {timeAgo(e.at, now)} · {fmtDate(e.at)}, {fmtTime(e.at)}
                  {e.by && ` · ${e.by}`}
                </small>
              </div>
            </li>
          ))}
        </ol>
        <form
          className="a5-inline"
          onSubmit={(e) => {
            e.preventDefault();
            if (!note.trim()) return;
            orderActions.note(o, note.trim());
            setNote("");
            say("Note added");
          }}
        >
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the team" aria-label="Note" />
          <button type="submit" className="a5-btn" data-v="soft" disabled={!note.trim()}>
            Add
          </button>
        </form>
      </Card>

      <ContactSheet open={sheet === "contact"} onClose={close} name={o.name} phone={o.phone} email={o.email} subject={`Your Santalum order ${o.id}`} />
      <AwbSheet open={sheet === "awb"} onClose={close} o={o} />
      <CancelSheet open={sheet === "cancel"} onClose={close} o={o} />
      <RefundSheet open={sheet === "refund"} onClose={close} o={o} />
      <InvoiceSheet open={sheet === "invoice"} onClose={close} o={o} />
    </div>
  );
}

export function ContactSheet({ open, onClose, name, phone, email, subject }: { open: boolean; onClose: () => void; name: string; phone: string; email: string; subject?: string }) {
  return (
    <Sheet open={open} onClose={onClose} title={`Contact ${name.split(" ")[0]}`}>
      <div className="a5-list">
        <a className="a5-row" href={`tel:${phone}`}>
          <span className="a5-row-ic">
            <I n="phone" size={20} />
          </span>
          <span className="a5-row-main">
            Call
            <small>{phone}</small>
          </span>
        </a>
        <a className="a5-row" href={waLink(phone)} target="_blank" rel="noreferrer">
          <span className="a5-row-ic">
            <I n="chat" size={20} />
          </span>
          <span className="a5-row-main">
            WhatsApp
            <small>{phone}</small>
          </span>
        </a>
        <a className="a5-row" href={`mailto:${email}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`}>
          <span className="a5-row-ic">
            <I n="mail" size={20} />
          </span>
          <span className="a5-row-main">
            Email
            <small>{email}</small>
          </span>
        </a>
      </div>
    </Sheet>
  );
}

const COURIERS = ["Blue Dart", "Delhivery", "DTDC", "India Post Speed Post", "Shiprocket"];
function AwbSheet({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  const [name, setName] = useState(o.courier?.name ?? COURIERS[0]);
  const [awb, setAwb] = useState(o.courier?.awb ?? "");
  const canShip = o.status === "confirmed" || o.status === "packed";
  const [ship, setShip] = useState(canShip);
  const ok = /^[A-Za-z0-9-]{6,}$/.test(awb.trim());
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Courier and AWB"
      foot={
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!ok}
          onClick={() => {
            orderActions.setAwb(o, { name, awb: awb.trim().toUpperCase() }, canShip && ship);
            say(canShip && ship ? "Shipped with AWB" : "AWB saved");
            onClose();
          }}
        >
          {canShip && ship ? "Save and mark shipped" : "Save AWB"}
        </button>
      }
    >
      <Field label="Courier">
        {(id) => (
          <select id={id} value={name} onChange={(e) => setName(e.target.value)}>
            {COURIERS.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        )}
      </Field>
      <Field label="AWB number" hint="Letters and numbers, at least 6." error={awb && !ok ? "That does not look like an AWB number." : null}>
        {(id) => <input id={id} value={awb} onChange={(e) => setAwb(e.target.value)} inputMode="text" autoCapitalize="characters" autoFocus />}
      </Field>
      {canShip && (
        <label className="a5-check">
          <input type="checkbox" checked={ship} onChange={(e) => setShip(e.target.checked)} />
          Mark shipped now
        </label>
      )}
    </Sheet>
  );
}

const CANCEL_REASONS = ["Customer asked to cancel", "Out of stock", "Payment not received", "Address not serviceable", "Suspected fraud"];
function CancelSheet({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  const [r, setR] = useState(CANCEL_REASONS[0]);
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={`Cancel ${o.id}?`}
      foot={
        <button
          type="button"
          className="a5-btn"
          data-v="danger-solid"
          onClick={() => {
            orderActions.cancel(o, r);
            say("Order cancelled");
            onClose();
          }}
        >
          Cancel the order
        </button>
      }
    >
      <p className="a5-muted">The customer is told by email. {o.paymentState === "paid" ? "Refund the payment from this order afterwards." : "Nothing was paid, so there is nothing to refund."}</p>
      <div className="a5-radios" role="radiogroup" aria-label="Reason">
        {CANCEL_REASONS.map((x) => (
          <button key={x} type="button" role="radio" aria-checked={r === x} onClick={() => setR(x)}>
            {x}
          </button>
        ))}
      </div>
    </Sheet>
  );
}

function RefundSheet({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  const left = o.total - o.refunded;
  const [amt, setAmt] = useState(String(left));
  const [note, setNote] = useState("");
  const n = Math.round(Number(amt));
  const ok = n > 0 && n <= left;
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Refund"
      foot={
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!ok}
          onClick={() => {
            orderActions.refund(o, n, note.trim());
            say(`Refunded ${formatINR(n)}`);
            onClose();
          }}
        >
          Refund {ok ? formatINR(n) : ""}
        </button>
      }
    >
      <div className="a5-amount">
        <span className="a5-rs">₹</span>
        <input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" aria-label="Amount in rupees" autoFocus />
      </div>
      <p className="a5-muted" style={{ textAlign: "center" }}>
        Up to {formatINR(left)}, back to the original {PAYMENT_LABEL[o.payment]} payment.
      </p>
      <Field label="Note (optional)">{(id) => <input id={id} value={note} onChange={(e) => setNote(e.target.value)} />}</Field>
    </Sheet>
  );
}

/* ---------- invoice ---------- */
function InvoiceSheet({ open, onClose, o }: { open: boolean; onClose: () => void; o: AdminOrder }) {
  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Tax invoice"
      print
      wide
      foot={
        <button type="button" className="a5-btn" data-v="primary" onClick={() => window.print()}>
          <I n="print" size={18} />
          Print or save as PDF
        </button>
      }
    >
      {open && <Invoice o={o} />}
    </Sheet>
  );
}

function Invoice({ o }: { o: AdminOrder }) {
  const s = useSettings();
  const products = useProducts();
  const st = s.store;
  const intra = o.address.state.trim().toLowerCase() === st.state.trim().toLowerCase();
  const rows = o.lines.map((l) => {
    const cat = (products.find((p) => p.slug === l.slug)?.category ?? getProduct(l.slug)?.category) as keyof typeof GST_BY_CATEGORY | undefined;
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
  const tax = rows.reduce((a, r) => a + r.tax, 0);
  const taxable = rows.reduce((a, r) => a + r.taxable, 0);
  const r2 = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="a5-invoice">
      <div className="a5-inv-top">
        <div>
          <strong className="a5-inv-name">{st.name}</strong>
          <p>
            {st.legalName}
            <br />
            {st.address}, {st.city}, {st.state} {st.pin}
            <br />
            GSTIN {st.gstin} · PAN {st.pan}
          </p>
        </div>
        <div className="a5-inv-no">
          <small>Invoice</small>
          <strong>
            {st.invoicePrefix}
            {o.id.replace(/^SM-/, "")}
          </strong>
          <small>{fmtDate(o.placedAt)}</small>
        </div>
      </div>
      <div className="a5-inv-grid">
        <div>
          <small>Billed to</small>
          <p>
            {o.name}
            <br />
            {o.email}
            <br />
            {o.phone}
          </p>
        </div>
        <div>
          <small>Shipped to</small>
          <p>
            {o.address.line1}
            {o.address.line2 ? `, ${o.address.line2}` : ""}
            <br />
            {o.address.city}, {o.address.state} {o.address.pin}
          </p>
        </div>
        <div>
          <small>Place of supply</small>
          <p>
            {o.address.state}
            <br />
            {intra ? "Intra-state: CGST + SGST" : "Inter-state: IGST"}
          </p>
        </div>
      </div>
      <div className="a5-inv-scroll">
        <table className="a5-inv-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>HSN</th>
              <th>Qty</th>
              <th>Taxable</th>
              <th>GST</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.hsn}</td>
                <td>{r.qty}</td>
                <td>{r2(r.taxable)}</td>
                <td>
                  {r2(r.tax)}
                  <small> @{r.rate}%</small>
                </td>
                <td>{r2(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <dl className="a5-sum">
        <div>
          <dt>Taxable value</dt>
          <dd>₹{r2(taxable)}</dd>
        </div>
        {intra ? (
          <>
            <div>
              <dt>CGST</dt>
              <dd>₹{r2(tax / 2)}</dd>
            </div>
            <div>
              <dt>SGST</dt>
              <dd>₹{r2(tax / 2)}</dd>
            </div>
          </>
        ) : (
          <div>
            <dt>IGST</dt>
            <dd>₹{r2(tax)}</dd>
          </div>
        )}
        <div data-total="">
          <dt>Total</dt>
          <dd>₹{r2(o.total)}</dd>
        </div>
      </dl>
      <p className="a5-inv-words">{rupeesInWords(o.total)}</p>
      <p className="a5-inv-fine">
        Paid by {PAYMENT_LABEL[o.payment]} ({o.paymentRef}). Prices include GST. HSN codes and rates are placeholders until the accountant confirms them. Computer-generated invoice; no signature needed.
      </p>
    </div>
  );
}
