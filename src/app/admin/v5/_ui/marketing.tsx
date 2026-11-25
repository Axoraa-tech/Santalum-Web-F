"use client";

import { useMemo, useState } from "react";
import { Photo } from "@/components/Photo";
import { getProduct, type Wood } from "@/lib/shop/products";
import { fmtDate, formatINR } from "../../_data/format";
import { contentDefaults, couponState, deleteCoupon, photoById, resetContent, saveContent, saveCoupon, useContent, useContentEdited, useCoupons, useNow, useOrders, useProducts } from "../../_data/store";
import type { AdminCoupon, ContentDraft } from "../../_data/types";
import { I } from "./icons";
import { Card, Chip, Field, Head, Money, Seg, Toggle, WoodDot, say } from "./kit";
import { BackToMore } from "./inventory";
import { Split } from "./shell";

/* ---------- coupons ---------- */
const STATE_LABEL = { active: "Live", off: "Off", expired: "Expired", "used-up": "Used up" } as const;
const BLANK: AdminCoupon = { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true };

export function Coupons() {
  const coupons = useCoupons();
  const orders = useOrders();
  const now = useNow();
  const [sel, setSel] = useState<string | null>(null);
  const usage = useMemo(() => {
    const m = new Map<string, { n: number; off: number; sales: number }>();
    for (const o of orders) {
      if (!o.coupon || o.status === "cancelled") continue;
      const x = m.get(o.coupon) ?? { n: 0, off: 0, sales: 0 };
      x.n++;
      x.off += o.discount;
      x.sales += o.total;
      m.set(o.coupon, x);
    }
    return m;
  }, [orders]);
  const cur = sel === "+new" ? BLANK : coupons.find((c) => c.code === sel);

  const list = (
    <>
      <Head
        eyebrow={`${coupons.filter((c) => couponState(c, usage.get(c.code)?.n ?? 0, now) === "active").length} live`}
        title="Coupons"
        back={<BackToMore />}
        action={
          <button type="button" className="a5-fab" aria-label="New coupon" onClick={() => setSel("+new")}>
            <I n="plus" size={22} />
          </button>
        }
      />
      <div className="a5-stack">
        {coupons.map((c) => {
          const u = usage.get(c.code);
          const st = couponState(c, u?.n ?? 0, now);
          return (
            <button key={c.code} type="button" className="a5-coupon" data-state={st} data-sel={sel === c.code ? "" : undefined} onClick={() => setSel(c.code)}>
              <span className="a5-ocard-top">
                <strong className="a5-code">{c.code}</strong>
                <Chip tone={st === "active" ? "green" : st === "off" ? undefined : "red"}>{STATE_LABEL[st]}</Chip>
              </span>
              <span className="a5-coupon-value">{c.kind === "pct" ? `${c.value}%` : formatINR(c.value)} off</span>
              <small className="a5-dim">{c.label}</small>
              <span className="a5-ocard-meta">
                Used {u?.n ?? 0}
                {c.limit ? ` of ${c.limit}` : ""} · {formatINR(u?.off ?? 0)} given · {c.expires ? `ends ${fmtDate(new Date(c.expires + "T12:00:00").getTime())}` : "no end date"}
              </span>
            </button>
          );
        })}
      </div>
    </>
  );

  return (
    <Split
      list={list}
      open={!!cur}
      onClose={() => setSel(null)}
      detail={cur && <CouponForm key={sel} c={cur} isNew={sel === "+new"} codes={coupons.map((c) => c.code)} sales={usage.get(cur.code)?.sales ?? 0} onDone={(code) => setSel(code)} />}
      idle={
        <div className="a5-detail">
          <div className="a5-eyebrow">Coupons</div>
          <Money v={[...usage.values()].reduce((s, x) => s + x.off, 0)} size="xl" />
          <p className="a5-muted">Given away in discounts across {[...usage.values()].reduce((s, x) => s + x.n, 0)} orders. Pick a coupon to change it.</p>
        </div>
      }
    />
  );
}

function CouponForm({ c, isNew, codes, sales, onDone }: { c: AdminCoupon; isNew: boolean; codes: string[]; sales: number; onDone: (code: string | null) => void }) {
  const [d, setD] = useState(c);
  const set = <K extends keyof AdminCoupon>(k: K, v: AdminCoupon[K]) => setD((x) => ({ ...x, [k]: v }));
  const code = d.code.trim().toUpperCase();
  const err = !/^[A-Z0-9]{3,20}$/.test(code) ? "3 to 20 letters or numbers." : code !== c.code && codes.includes(code) ? "That code already exists." : null;
  const valErr = !(d.value > 0) || (d.kind === "pct" && d.value > 90) ? (d.kind === "pct" ? "Between 1 and 90 percent." : "More than zero.") : null;
  const num = (s: string) => (s ? Number(s.replace(/\D/g, "")) : null);
  return (
    <div className="a5-detail" data-form="">
      <div className="a5-eyebrow">{isNew ? "New coupon" : `Brought in ${formatINR(sales)}`}</div>
      <h2 className="a5-detail-title a5-code">{code || "NEWCODE"}</h2>
      <Card>
        <Field label="Code" error={d.code ? err : null}>
          {(id) => <input id={id} value={d.code} onChange={(e) => set("code", e.target.value.toUpperCase())} autoCapitalize="characters" />}
        </Field>
        <Field label="What the customer sees">{(id) => <input id={id} value={d.label} onChange={(e) => set("label", e.target.value)} placeholder="10% off your first order" />}</Field>
        <div className="a5-field">
          <span className="a5-label">Discount</span>
          <Seg
            label="Kind"
            value={d.kind}
            onChange={(k) => set("kind", k)}
            items={[
              { id: "pct", label: "Percent" },
              { id: "flat", label: "Rupees" },
            ]}
          />
        </div>
        <div className="a5-amount">
          {d.kind === "flat" && <span className="a5-rs">₹</span>}
          <input value={d.value || ""} inputMode="numeric" onChange={(e) => set("value", num(e.target.value) ?? 0)} aria-label="Discount value" />
          {d.kind === "pct" && <span className="a5-rs">%</span>}
        </div>
        {valErr && <small className="a5-err">{valErr}</small>}
        <div className="a5-two">
          <Field label="Minimum order (₹)">{(id) => <input id={id} inputMode="numeric" value={d.min ?? ""} onChange={(e) => set("min", num(e.target.value))} placeholder="None" />}</Field>
          <Field label="Use limit">{(id) => <input id={id} inputMode="numeric" value={d.limit ?? ""} onChange={(e) => set("limit", num(e.target.value))} placeholder="No limit" />}</Field>
        </div>
        <Field label="Last day">{(id) => <input id={id} type="date" value={d.expires ?? ""} onChange={(e) => set("expires", e.target.value || null)} />}</Field>
        <Toggle on={d.active} set={(v) => set("active", v)} label="Live on the shop" />
      </Card>
      <div className="a5-savebar">
        {!isNew ? (
          <button
            type="button"
            className="a5-textbtn"
            data-v="danger"
            onClick={() => {
              deleteCoupon(c.code);
              say(`${c.code} deleted`);
              onDone(null);
            }}
          >
            Delete
          </button>
        ) : (
          <span />
        )}
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!!err || !!valErr}
          onClick={() => {
            saveCoupon({ ...d, code, label: d.label.trim() || (d.kind === "pct" ? `${d.value}% off` : `${formatINR(d.value)} off`) }, isNew ? undefined : c.code);
            say(isNew ? `${code} created` : "Saved");
            onDone(code);
          }}
        >
          {isNew ? "Create" : "Save"}
        </button>
      </div>
    </div>
  );
}

/* ---------- storefront content ---------- */
export function Content() {
  const [wood, setWood] = useState<Wood>("red");
  const saved = useContent(wood);
  const edited = useContentEdited(wood);
  const [drafts, setDrafts] = useState<Partial<Record<Wood, ContentDraft>>>({});
  const d = drafts[wood] ?? saved;
  const set = <K extends keyof ContentDraft>(k: K, v: ContentDraft[K]) => setDrafts((x) => ({ ...x, [wood]: { ...d, [k]: v } }));
  const products = useProducts().filter((p) => p.wood === wood && p.status === "active");
  const dirty = !!drafts[wood];
  const [preview, setPreview] = useState(false);

  const list = (
    <>
      <Head eyebrow={edited ? "Edited" : "As launched"} title="Storefront" back={<BackToMore />} />
      <div className="a5-sticky">
        <Seg
          label="Wood"
          value={wood}
          onChange={setWood}
          items={[
            { id: "red", label: <WoodDot w="red" label /> },
            { id: "white", label: <WoodDot w="white" label /> },
          ]}
        />
      </div>
      <Card title="Landing hero">
        <Field label="Headline">{(id) => <textarea id={id} rows={2} value={d.heroTitle} onChange={(e) => set("heroTitle", e.target.value)} />}</Field>
        <Field label="Line under it">{(id) => <textarea id={id} rows={3} value={d.heroSub} onChange={(e) => set("heroSub", e.target.value)} />}</Field>
        <Field label="Button">{(id) => <input id={id} value={d.heroCta} onChange={(e) => set("heroCta", e.target.value)} />}</Field>
      </Card>
      <Card title="The edition">
        <Field label="Name">{(id) => <input id={id} value={d.editionName} onChange={(e) => set("editionName", e.target.value)} />}</Field>
        <div className="a5-two">
          <Field label="Pieces">{(id) => <input id={id} inputMode="numeric" value={d.editionSize} onChange={(e) => set("editionSize", Number(e.target.value.replace(/\D/g, "")))} />}</Field>
          <Field label="Product">
            {(id) => (
              <select id={id} value={d.editionSlug} onChange={(e) => set("editionSlug", e.target.value)}>
                {products.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <Field label="Text">{(id) => <textarea id={id} rows={3} value={d.editionText} onChange={(e) => set("editionText", e.target.value)} />}</Field>
      </Card>
      <Card title={`Featured · ${d.featured.length}`} flush>
        <div className="a5-list a5-list-flat">
          {products.map((p) => (
            <Toggle key={p.slug} on={d.featured.includes(p.slug)} set={(v) => set("featured", v ? [...d.featured, p.slug] : d.featured.filter((s) => s !== p.slug))} label={p.name} />
          ))}
        </div>
      </Card>
      <div className="a5-savebar">
        <button type="button" className="a5-textbtn a5-phone-only" onClick={() => setPreview(true)}>
          Preview
        </button>
        {edited && !dirty && (
          <button
            type="button"
            className="a5-textbtn"
            onClick={() => {
              resetContent(wood);
              say("Back to the launch copy");
            }}
          >
            Reset
          </button>
        )}
        {dirty && (
          <button type="button" className="a5-textbtn" onClick={() => setDrafts((x) => ({ ...x, [wood]: undefined }))}>
            Discard
          </button>
        )}
        <button
          type="button"
          className="a5-btn"
          data-v="primary"
          disabled={!dirty}
          onClick={() => {
            saveContent(wood, d);
            setDrafts((x) => ({ ...x, [wood]: undefined }));
            say("Published to the shop");
          }}
        >
          Publish
        </button>
      </div>
    </>
  );
  return <Split list={list} open={preview} onClose={() => setPreview(false)} detail={<Preview d={d} wood={wood} />} idle={<Preview d={d} wood={wood} />} />;
}

function Preview({ d, wood }: { d: ContentDraft; wood: Wood }) {
  const ed = getProduct(d.editionSlug);
  const def = contentDefaults(wood);
  return (
    <div className="a5-detail">
      <div className="a5-eyebrow">Preview · {wood === "red" ? "red" : "white"} landing</div>
      <div className="a5-prev" data-w={wood}>
        <div className="a5-prev-hero">
          <Photo p={photoById(wood === "red" ? "photo-1779714650753-c1fbc2ed6c71" : "photo-1702001145743-094b0b7ead51")} sizes="600px" />
          <div>
            <h3>{d.heroTitle || def.heroTitle}</h3>
            <p>{d.heroSub}</p>
            <span className="a5-prev-cta">{d.heroCta}</span>
          </div>
        </div>
        <div className="a5-prev-ed">
          <small>
            Edition of {d.editionSize} · {ed?.name}
          </small>
          <strong>{d.editionName}</strong>
          <p>{d.editionText}</p>
        </div>
        <div className="a5-prev-row">
          {d.featured.slice(0, 4).map((s) => {
            const p = getProduct(s);
            return p ? (
              <div key={s}>
                <span className="a5-prev-img">
                  <Photo p={p.shots[0].photo} sizes="140px" tone={p.shots[0].tone} />
                </span>
                <small>{p.name}</small>
              </div>
            ) : null;
          })}
        </div>
      </div>
    </div>
  );
}
