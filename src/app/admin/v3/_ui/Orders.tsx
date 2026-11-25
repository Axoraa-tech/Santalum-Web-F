"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { getProduct } from "@/lib/shop/products";
import { fmtDate, fmtDateTime, formatINR, PAYMENT_LABEL, PAYMENT_STATE, rupeesInWords, timeAgo } from "../../_data/format";
import { GST_BY_CATEGORY } from "../../_data/mock";
import { NEXT_STAGE, orderActions, photoById, useNow, useOrders, useProducts, useSettings } from "../../_data/store";
import type { AdminOrder, AdminStatus, Settings } from "../../_data/types";
import { BASE, Btn, Filter, Head, Seg, Split, StatusLed, say, useListKeys, useNarrow, Woods, keyBlocked } from "./kit";

type Tab = "open" | "all" | "new" | "packed" | "shipped" | "delivered" | "returns" | "cancelled";
const TABS: { id: Tab; label: string; m: (s: AdminStatus) => boolean }[] = [
  { id: "open", label: "open", m: (s) => s === "new" || s === "confirmed" || s === "packed" },
  { id: "all", label: "all", m: () => true },
  { id: "new", label: "new", m: (s) => s === "new" },
  { id: "packed", label: "packed", m: (s) => s === "packed" },
  { id: "shipped", label: "shipped", m: (s) => s === "shipped" },
  { id: "delivered", label: "done", m: (s) => s === "delivered" },
  { id: "returns", label: "returns", m: (s) => s === "return-requested" || s === "returned" },
  { id: "cancelled", label: "void", m: (s) => s === "cancelled" },
];

export function OrdersList() {
  return <OrdersSplit id={null} />;
}
export function OrderRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrdersSplit key={id} id={decodeURIComponent(id)} />;
}

function OrdersSplit({ id }: { id: string | null }) {
  const orders = useOrders();
  const now = useNow();
  const router = useRouter();
  const narrow = useNarrow();
  const [tab, setTab] = useState<Tab>(id ? "all" : "open");
  const [q, setQ] = useState("");
  const [wood, setWood] = useState<"all" | "red" | "white">("all");
  const [selId, setSelId] = useState<string | null>(id);

  const list = useMemo(() => {
    const t = TABS.find((x) => x.id === tab)!;
    const n = q.trim().toLowerCase();
    return orders.filter(
      (o) =>
        t.m(o.status) &&
        (wood === "all" || o.woods.includes(wood)) &&
        (!n || `${o.id} ${o.name} ${o.email} ${o.phone} ${o.address.city} ${o.courier?.awb ?? ""}`.toLowerCase().includes(n)),
    );
  }, [orders, tab, q, wood]);

  const idx = list.findIndex((o) => o.id === selId);
  const cursor = idx < 0 ? 0 : idx;
  const sel = orders.find((o) => o.id === selId) ?? (narrow ? undefined : list[0]);

  const select = (o: AdminOrder, push: boolean) => {
    setSelId(o.id);
    const href = `${BASE}/orders/${o.id}`;
    if (push && narrow) router.push(href);
    else window.history.replaceState(null, "", href);
  };

  const ref = useListKeys(list.length, {
    cursor,
    setCursor: (i) => select(list[i], false),
    onOpen: (i) => select(list[i], true),
    extra: (key) => {
      const w = ({ "1": "all", "2": "red", "3": "white" } as const)[key as "1" | "2" | "3"];
      if (w) setWood(w);
      return !!w;
    },
  });

  const counts = useMemo(() => Object.fromEntries(TABS.map((t) => [t.id, orders.filter((o) => t.m(o.status)).length])), [orders]);

  return (
    <Split
      focus={id ? "detail" : "list"}
      list={
        <div className="a3-listpane" ref={ref}>
          <div className="a3-listhead">
            <Filter value={q} onChange={setQ} placeholder="filter id, name, phone, awb" />
            <Seg value={tab} onChange={setTab} label="Status" items={TABS.map((t) => ({ id: t.id, label: t.label, n: counts[t.id] }))} />
            <div className="a3-listmeta">
              <Seg value={wood} onChange={setWood} label="Wood" items={[{ id: "all", label: "1 both" }, { id: "red", label: "2 red" }, { id: "white", label: "3 white" }]} />
              <span className="a3-dim">{list.length} rows</span>
            </div>
          </div>
          <ul className="a3-rows" role="listbox" aria-label="Orders">
            {list.map((o, i) => (
              <li
                key={o.id}
                role="option"
                aria-selected={sel?.id === o.id}
                data-a3-row={i}
                data-cur={i === cursor && (!!selId || !narrow) ? true : undefined}
                onClick={() => select(o, true)}
              >
                <StatusLed s={o.status} text={false} />
                <span className="a3-mono a3-row-id">{o.id}</span>
                <span className="a3-row-name">{o.name}</span>
                <Woods ws={o.woods} />
                <span className="a3-mono r">{formatINR(o.total)}</span>
                <span className="a3-mono a3-dim a3-row-age">{timeAgo(o.placedAt, now).replace(" ago", "")}</span>
              </li>
            ))}
            {list.length === 0 && <li className="a3-dim a3-empty">no orders match</li>}
          </ul>
        </div>
      }
      detail={sel ? <OrderDetail key={sel.id} o={sel} /> : <div className="a3-empty a3-dim">{id ? `no order ${id}` : "select an order (j/k)"}</div>}
    />
  );
}

type Mode = null | "awb" | "cancel" | "refund" | "note";

function OrderDetail({ o }: { o: AdminOrder }) {
  const now = useNow();
  const [mode, setMode] = useState<Mode>(null);
  const [inv, setInv] = useState(false);
  const next = NEXT_STAGE[o.status];
  const canCancel = o.status === "new" || o.status === "confirmed" || o.status === "packed";
  const canRefund = o.refunded < o.total && (o.paymentState === "paid" || o.paymentState === "part-refunded" || o.paymentState === "cod-collected");
  const live = useRef({ o, next, canCancel, canRefund });
  useEffect(() => {
    live.current = { o, next, canCancel, canRefund };
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (keyBlocked(e)) return;
      const c = live.current;
      if (e.key === "Escape") {
        setMode(null);
        setInv(false);
      } else if (e.key === "a" && c.next) {
        if (c.next.to === "shipped" && !c.o.courier) setMode("awb");
        else {
          orderActions.advance(c.o);
          say(`${c.o.id} → ${c.next.to}`);
        }
      } else if (e.key === "w") setMode("awb");
      else if (e.key === "x" && c.canCancel) setMode("cancel");
      else if (e.key === "r" && c.canRefund) setMode("refund");
      else if (e.key === "n") setMode("note");
      else if (e.key === "v") setInv(true);
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <article className="a3-detail">
      <Link href={`${BASE}/orders`} className="a3-back">
        ← orders
      </Link>
      <Head path={`~/orders/`} title={<span className="a3-mono">{o.id}</span>} meta={<StatusLed s={o.status} />}>
        <span className="a3-dim a3-mono">{fmtDateTime(o.placedAt)} · {timeAgo(o.placedAt, now)}</span>
      </Head>

      <div className="a3-actions">
        {next && (
          <Btn kind="primary" hint="a" onClick={() => (next.to === "shipped" && !o.courier ? setMode("awb") : (orderActions.advance(o), say(`${o.id} → ${next.to}`)))}>
            {next.label.toLowerCase()}
          </Btn>
        )}
        {o.status === "return-requested" && (
          <Btn
            kind="primary"
            onClick={() => {
              orderActions.approveReturn(o);
              say("return approved");
            }}
          >
            approve return
          </Btn>
        )}
        {(o.status === "packed" || o.status === "confirmed" || o.status === "shipped") && (
          <Btn hint="w" onClick={() => setMode("awb")}>
            {o.courier ? "edit awb" : "add awb"}
          </Btn>
        )}
        {canRefund && (
          <Btn hint="r" onClick={() => setMode("refund")}>
            refund
          </Btn>
        )}
        <Btn hint="n" onClick={() => setMode("note")}>
          note
        </Btn>
        <Btn hint="v" onClick={() => setInv(true)}>
          invoice
        </Btn>
        {canCancel && (
          <Btn kind="danger" hint="x" onClick={() => setMode("cancel")}>
            cancel
          </Btn>
        )}
      </div>

      {mode && <ActionForm key={mode} mode={mode} o={o} done={() => setMode(null)} />}

      <div className="a3-kv">
        <div>
          <span>customer</span>
          <Link href={`${BASE}/customers/${o.customerId}`}>{o.name}</Link>
        </div>
        <div>
          <span>contact</span>
          <span className="a3-mono">
            {o.email} · {o.phone}
          </span>
        </div>
        <div>
          <span>ship to</span>
          <span>
            {o.address.line1}
            {o.address.line2 && `, ${o.address.line2}`}, {o.address.city}, {o.address.state} {o.address.pin}
          </span>
        </div>
        <div>
          <span>payment</span>
          <span>
            {PAYMENT_LABEL[o.payment]} · {PAYMENT_STATE[o.paymentState].toLowerCase()} <span className="a3-dim a3-mono">{o.paymentRef}</span>
          </span>
        </div>
        <div>
          <span>delivery</span>
          <span>
            {o.delivery}
            {o.courier && (
              <span className="a3-mono">
                {" "}
                · {o.courier.name} {o.courier.awb}
              </span>
            )}
          </span>
        </div>
        {o.giftNote && (
          <div>
            <span>gift note</span>
            <span className="a3-quote">“{o.giftNote}”</span>
          </div>
        )}
        {(o.returnReason || o.cancelReason) && (
          <div>
            <span>{o.cancelReason ? "cancel reason" : "return reason"}</span>
            <span className="a3-quote">{o.cancelReason ?? o.returnReason}</span>
          </div>
        )}
      </div>

      <table className="a3-t a3-lines">
        <thead>
          <tr>
            <th aria-label="Photo" />
            <th>item</th>
            <th>wood</th>
            <th className="r">qty</th>
            <th className="r">amount</th>
          </tr>
        </thead>
        <tbody>
          {o.lines.map((l, i) => (
            <tr key={i}>
              <td>
                <span className="a3-thumb">
                  <Photo p={photoById(l.photoId)} sizes="40px" tone={l.wood === "white" ? "pale" : undefined} />
                </span>
              </td>
              <td>
                <Link href={`${BASE}/products/${l.slug}`}>{l.name}</Link>
                {l.optionLabel && <span className="a3-dim"> · {l.optionLabel}</span>}
                {l.note && <div className="a3-dim a3-small">{l.note}</div>}
              </td>
              <td>
                <Woods ws={[l.wood]} />
              </td>
              <td className="r a3-mono">{l.qty}</td>
              <td className="r a3-mono">{formatINR(l.unitPrice * l.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}>subtotal</td>
            <td className="r a3-mono">{formatINR(o.subtotal)}</td>
          </tr>
          {o.discount > 0 && (
            <tr>
              <td colSpan={4}>discount {o.coupon && <span className="a3-mono a3-dim">{o.coupon}</span>}</td>
              <td className="r a3-mono">−{formatINR(o.discount)}</td>
            </tr>
          )}
          <tr>
            <td colSpan={4}>shipping</td>
            <td className="r a3-mono">{o.shipping ? formatINR(o.shipping) : "free"}</td>
          </tr>
          <tr className="a3-total">
            <td colSpan={4}>total</td>
            <td className="r a3-mono">{formatINR(o.total)}</td>
          </tr>
          {o.refunded > 0 && (
            <tr>
              <td colSpan={4}>refunded</td>
              <td className="r a3-mono a3-neg">−{formatINR(o.refunded)}</td>
            </tr>
          )}
        </tfoot>
      </table>

      <h2 className="a3-h2">timeline</h2>
      <ol className="a3-log a3-timeline">
        {[...o.timeline].reverse().map((e, i) => (
          <li key={i}>
            <time className="a3-dim">{fmtDateTime(e.at)}</time>
            <span className="a3-log-tag" data-t={e.kind}>
              {e.kind}
            </span>
            <span className="a3-log-text">
              {e.text}
              {e.by && <span className="a3-dim"> ({e.by})</span>}
            </span>
          </li>
        ))}
      </ol>

      {inv && <InvoiceSheet o={o} close={() => setInv(false)} />}
    </article>
  );
}

function ActionForm({ mode, o, done }: { mode: Exclude<Mode, null>; o: AdminOrder; done: () => void }) {
  const [a, setA] = useState(mode === "awb" ? (o.courier?.name ?? "Blue Dart") : mode === "refund" ? String(o.total - o.refunded) : "");
  const [b, setB] = useState(mode === "awb" ? (o.courier?.awb ?? "") : "");
  const [ship, setShip] = useState(o.status === "packed");
  const submit = () => {
    if (mode === "awb") {
      if (!a.trim() || !b.trim()) return say("courier and awb needed");
      orderActions.setAwb(o, { name: a.trim(), awb: b.trim() }, ship && o.status !== "shipped");
      say(`awb ${b.trim()} saved`);
    } else if (mode === "cancel") {
      if (!a.trim()) return say("give a reason");
      orderActions.cancel(o, a.trim());
      say(`${o.id} cancelled`);
    } else if (mode === "refund") {
      const n = Math.round(Number(a));
      if (!n || n < 1 || n > o.total - o.refunded) return say(`amount 1 to ${o.total - o.refunded}`);
      orderActions.refund(o, n, b.trim());
      say(`refunded ${formatINR(n)}`);
    } else {
      if (!a.trim()) return;
      orderActions.note(o, a.trim());
      say("note added");
    }
    done();
  };
  return (
    <form
      className="a3-cmdline"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      onKeyDown={(e) => e.key === "Escape" && done()}
    >
      <span className="a3-cmdline-p">{mode}&gt;</span>
      {mode === "awb" && (
        <>
          <input aria-label="Courier" value={a} onChange={(e) => setA(e.target.value)} autoFocus placeholder="courier" />
          <input aria-label="AWB number" value={b} onChange={(e) => setB(e.target.value)} placeholder="awb number" className="a3-mono" />
          {o.status !== "shipped" && (
            <label className="a3-small">
              <input type="checkbox" checked={ship} onChange={(e) => setShip(e.target.checked)} /> mark shipped
            </label>
          )}
        </>
      )}
      {mode === "cancel" && <input aria-label="Reason" value={a} onChange={(e) => setA(e.target.value)} autoFocus placeholder="reason, shown on the timeline" />}
      {mode === "refund" && (
        <>
          <input aria-label="Amount in rupees" value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ""))} autoFocus inputMode="numeric" className="a3-mono" />
          <input aria-label="Refund note" value={b} onChange={(e) => setB(e.target.value)} placeholder="note (optional)" />
        </>
      )}
      {mode === "note" && <input aria-label="Note" value={a} onChange={(e) => setA(e.target.value)} autoFocus placeholder="internal note" />}
      <Btn type="submit" kind={mode === "cancel" ? "danger" : "primary"} hint="↵">
        {mode === "cancel" ? "cancel order" : "run"}
      </Btn>
      <Btn kind="ghost" onClick={done} hint="esc">
        close
      </Btn>
    </form>
  );
}

/* ---------- printable tax invoice ---------- */
function InvoiceSheet({ o, close }: { o: AdminOrder; close: () => void }) {
  const settings = useSettings();
  const products = useProducts();
  return (
    <div className="a3-inv-wrap" role="dialog" aria-modal="true" aria-label="Tax invoice">
      <div className="a3-inv-bar">
        <span className="a3-mono">invoice · {o.id}</span>
        <Btn kind="primary" onClick={() => window.print()}>
          print / save pdf
        </Btn>
        <Btn kind="ghost" onClick={close} hint="esc">
          close
        </Btn>
      </div>
      <Invoice o={o} s={settings} cat={(slug) => products.find((p) => p.slug === slug)?.category ?? getProduct(slug)?.category} />
    </div>
  );
}

function Invoice({ o, s, cat }: { o: AdminOrder; s: Settings; cat: (slug: string) => string | undefined }) {
  const st = s.store;
  const intra = o.address.state.trim().toLowerCase() === st.state.trim().toLowerCase();
  const rows = o.lines.map((l) => {
    const c = cat(l.slug) as keyof typeof GST_BY_CATEGORY | undefined;
    const g = (c && GST_BY_CATEGORY[c]) || { hsn: l.wood === "red" ? st.hsnRed : st.hsnWhite, rate: st.gstRate };
    const gross = l.unitPrice * l.qty;
    const value = gross - (o.subtotal ? (o.discount * gross) / o.subtotal : 0);
    const taxable = value / (1 + g.rate / 100);
    return { name: `${l.name}${l.optionLabel ? `, ${l.optionLabel}` : ""}`, hsn: g.hsn, rate: g.rate, qty: l.qty, taxable, tax: value - taxable, value };
  });
  if (o.shipping) {
    const taxable = o.shipping / 1.18;
    rows.push({ name: "Express shipping", hsn: "996812", rate: 18, qty: 1, taxable, tax: o.shipping - taxable, value: o.shipping });
  }
  const tTax = rows.reduce((x, r) => x + r.tax, 0);
  const tTaxable = rows.reduce((x, r) => x + r.taxable, 0);
  const r2 = (n: number) => n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return (
    <div className="a3-inv">
      <div className="a3-inv-top">
        <div>
          <h2>{st.name}</h2>
          <p>
            {st.legalName}
            <br />
            {st.address}, {st.city}, {st.state} {st.pin}
            <br />
            GSTIN {st.gstin} · PAN {st.pan}
          </p>
        </div>
        <div className="r">
          <div className="a3-inv-l">Tax invoice</div>
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
      </div>
      <div className="a3-inv-grid">
        <div>
          <div className="a3-inv-l">Billed to</div>
          {o.name}
          <br />
          {o.email}
          <br />
          {o.phone}
        </div>
        <div>
          <div className="a3-inv-l">Shipped to</div>
          {o.address.line1}
          {o.address.line2 && `, ${o.address.line2}`}
          <br />
          {o.address.city}, {o.address.state} {o.address.pin}
        </div>
        <div>
          <div className="a3-inv-l">Place of supply</div>
          {o.address.state} ({intra ? "intra-state: CGST + SGST" : "inter-state: IGST"})
          <br />
          Payment: {PAYMENT_LABEL[o.payment]}
        </div>
      </div>
      <div className="a3-inv-scroll">
        <table>
          <thead>
            <tr>
              <th>Description</th>
              <th>HSN/SAC</th>
              <th className="r">Qty</th>
              <th className="r">Taxable</th>
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
                      {r2(r.tax / 2)} <small>{r.rate / 2}%</small>
                    </td>
                    <td className="r">
                      {r2(r.tax / 2)} <small>{r.rate / 2}%</small>
                    </td>
                  </>
                ) : (
                  <td className="r">
                    {r2(r.tax)} <small>{r.rate}%</small>
                  </td>
                )}
                <td className="r">{r2(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="a3-inv-tot">
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
        <div className="a3-inv-grand">
          <span>Total</span>
          <span>₹{r2(o.total)}</span>
        </div>
      </div>
      <p>
        {rupeesInWords(o.total)}.{o.discount > 0 && ` Discount of ₹${r2(o.discount)}${o.coupon ? ` (${o.coupon})` : ""} is spread across the lines above.`}
      </p>
      <p className="a3-inv-fine">HSN codes and rates are placeholders until confirmed by the Maison&apos;s accountant. Computer-generated invoice; no signature required.</p>
    </div>
  );
}
