"use client";

import { useMemo, useState } from "react";
import { formatINR } from "../../_data/format";
import { couponState, deleteCoupon, saveCoupon, useCoupons, useNow, useOrders } from "../../_data/store";
import type { AdminCoupon } from "../../_data/types";
import { Box, Btn, F, Head, Led, say, Toggle, useListKeys } from "./kit";

const TONE = { active: "green", off: "off", expired: "red", "used-up": "amber" } as const;
const BLANK: AdminCoupon = { code: "", label: "", kind: "pct", value: 10, min: null, limit: null, expires: null, active: true };

export function Coupons() {
  const coupons = useCoupons();
  const orders = useOrders();
  const now = useNow();
  const [cursor, setCursor] = useState(0);
  const [edit, setEdit] = useState<{ c: AdminCoupon; original?: string } | null>(null);
  const used = useMemo(() => {
    const m = new Map<string, { n: number; off: number }>();
    for (const o of orders) {
      if (!o.coupon || o.status === "cancelled") continue;
      const x = m.get(o.coupon) ?? { n: 0, off: 0 };
      x.n++;
      x.off += o.discount;
      m.set(o.coupon, x);
    }
    return m;
  }, [orders]);
  const cur = Math.min(cursor, Math.max(0, coupons.length - 1));

  const ref = useListKeys(coupons.length, {
    cursor: cur,
    setCursor,
    onOpen: (i) => setEdit({ c: coupons[i], original: coupons[i].code }),
    extra: (key, i) => {
      if (key === "n") setEdit({ c: BLANK });
      else if (key === "t") {
        saveCoupon({ ...coupons[i], active: !coupons[i].active }, coupons[i].code);
        say(`${coupons[i].code} ${coupons[i].active ? "off" : "on"}`);
      } else return false;
      return true;
    },
  });

  return (
    <div className="a3-page">
      <Head path="~/coupons" title="coupons" meta={`${coupons.length} codes · t toggles the row`}>
        <Btn kind="primary" hint="n" onClick={() => setEdit({ c: BLANK })}>
          new code
        </Btn>
      </Head>
      {edit && <CouponForm key={edit.original ?? "new"} init={edit.c} original={edit.original} taken={coupons.map((c) => c.code)} close={() => setEdit(null)} />}
      <div className="a3-scroll" ref={ref}>
        <table className="a3-t">
          <thead>
            <tr>
              <th>st</th>
              <th>code</th>
              <th className="a3-hide-sm">rule</th>
              <th className="r">used</th>
              <th className="r a3-hide-sm">given</th>
              <th className="r a3-hide-sm">expires</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {coupons.map((c, i) => {
              const u = used.get(c.code) ?? { n: 0, off: 0 };
              const st = couponState(c, u.n, now);
              return (
                <tr key={c.code} data-a3-row={i} data-cur={i === cur || undefined} onClick={() => setCursor(i)}>
                  <td>
                    <span className="a3-st">
                      <Led tone={TONE[st]} />
                      <span className="a3-hide-sm">{st}</span>
                    </span>
                  </td>
                  <td>
                    <span className="a3-mono a3-code">{c.code}</span>
                    <div className="a3-dim a3-small">{c.label}</div>
                  </td>
                  <td className="a3-mono a3-hide-sm">
                    {c.kind === "pct" ? `${c.value}%` : formatINR(c.value)} off{c.min ? ` ≥ ${formatINR(c.min)}` : ""}
                  </td>
                  <td className="r a3-mono">
                    {u.n}
                    {c.limit ? `/${c.limit}` : ""}
                  </td>
                  <td className="r a3-mono a3-dim a3-hide-sm">{formatINR(u.off)}</td>
                  <td className="r a3-mono a3-dim a3-hide-sm">{c.expires ?? "never"}</td>
                  <td className="r a3-nowrap">
                    <button type="button" className="a3-link" onClick={() => setEdit({ c, original: c.code })}>
                      edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CouponForm({ init, original, taken, close }: { init: AdminCoupon; original?: string; taken: string[]; close: () => void }) {
  const [c, setC] = useState(init);
  const [err, setErr] = useState("");
  const set = <K extends keyof AdminCoupon>(k: K, v: AdminCoupon[K]) => setC((x) => ({ ...x, [k]: v }));
  return (
    <Box title={original ? `edit ${original}` : "new code"} meta="esc closes">
      <form
        className="a3-form"
        onKeyDown={(e) => e.key === "Escape" && close()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!/^[A-Z0-9]{3,20}$/.test(c.code)) return setErr("code: 3 to 20 letters or digits");
          if (c.code !== original && taken.includes(c.code)) return setErr(`${c.code} exists`);
          if (!c.value || (c.kind === "pct" && c.value > 90)) return setErr("value must be 1 to 90% or a rupee amount");
          saveCoupon({ ...c, label: c.label.trim() || (c.kind === "pct" ? `${c.value}% off` : `${formatINR(c.value)} off`) }, original);
          say(`${c.code} saved`);
          close();
        }}
      >
        <F label="code">
          <input className="a3-mono" autoFocus value={c.code} onChange={(e) => set("code", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))} />
        </F>
        <F label="label" wide>
          <input value={c.label} onChange={(e) => set("label", e.target.value)} placeholder="shown at checkout" />
        </F>
        <F label="kind">
          <select value={c.kind} onChange={(e) => set("kind", e.target.value as AdminCoupon["kind"])}>
            <option value="pct">percent</option>
            <option value="flat">flat ₹</option>
          </select>
        </F>
        <F label={c.kind === "pct" ? "percent" : "rupees"}>
          <input className="a3-mono" inputMode="numeric" value={c.value || ""} onChange={(e) => set("value", Number(e.target.value.replace(/\D/g, "")))} />
        </F>
        <F label="min order ₹">
          <input className="a3-mono" inputMode="numeric" value={c.min ?? ""} onChange={(e) => set("min", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="none" />
        </F>
        <F label="use limit">
          <input className="a3-mono" inputMode="numeric" value={c.limit ?? ""} onChange={(e) => set("limit", e.target.value ? Number(e.target.value.replace(/\D/g, "")) : null)} placeholder="none" />
        </F>
        <F label="expires">
          <input type="date" value={c.expires ?? ""} onChange={(e) => set("expires", e.target.value || null)} />
        </F>
        <Toggle checked={c.active} onChange={(v) => set("active", v)} label="active" />
        {err && (
          <p className="a3-err" role="alert">
            ! {err}
          </p>
        )}
        <div className="a3-actions">
          <Btn type="submit" kind="primary" hint="↵">
            save
          </Btn>
          <Btn kind="ghost" onClick={close} hint="esc">
            close
          </Btn>
          {original && (
            <Btn
              kind="danger"
              onClick={() => {
                if (!window.confirm(`Delete ${original}? Orders that used it keep it.`)) return;
                deleteCoupon(original);
                say(`${original} deleted`);
                close();
              }}
            >
              delete
            </Btn>
          )}
        </div>
      </form>
    </Box>
  );
}
