"use client";

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { fmtShort, formatINR, inrCompact, fmtDate } from "../_data/format";

/* Chart colours: validated pair (dataviz validator, light surface #fffdf9). Text never wears them. */
export const WOOD_COLOR = { red: "#9b3520", white: "#b98a3e" } as const;

function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [w, setW] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setW(Math.round(e.contentRect.width)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

function niceMax(v: number) {
  if (v <= 0) return 1000;
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * p >= v) return m * p;
  return 10 * p;
}

/* ---------- revenue over time: one series, crosshair + tooltip, arrow keys ---------- */
export type DayPoint = { day: number; revenue: number; orders: number };

export function RevenueChart({ data, height = 248 }: { data: DayPoint[]; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const pad = { l: 52, r: 14, t: 14, b: 28 };
  const iw = Math.max(0, width - pad.l - pad.r);
  const ih = height - pad.t - pad.b;
  const max = niceMax(Math.max(...data.map((d) => d.revenue)) * 1.08);
  const x = (i: number) => pad.l + (data.length <= 1 ? iw / 2 : (i / (data.length - 1)) * iw);
  const y = (v: number) => pad.t + ih - (v / max) * ih;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  // Day labels count back from the last day. Pick the smallest step that leaves ~72px between labels,
  // so "20 Nov" and "25 Nov" never collide on a phone.
  const gap = data.length > 1 ? iw / (data.length - 1) : iw;
  const every = [1, 2, 3, 5, 7, 10, 14, 15, 30].find((s) => s * gap >= 72) ?? 30;

  const line = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.revenue).toFixed(1)}`).join("");
  const area = `${line}L${x(data.length - 1).toFixed(1)},${pad.t + ih}L${x(0).toFixed(1)},${pad.t + ih}Z`;

  const onMove = (e: PointerEvent<SVGRectElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const fx = (e.clientX - r.left) / r.width;
    setActive(Math.max(0, Math.min(data.length - 1, Math.round(fx * (data.length - 1)))));
  };
  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      setActive((a) => {
        const cur = a ?? data.length - 1;
        return Math.max(0, Math.min(data.length - 1, cur + (e.key === "ArrowRight" ? 1 : -1)));
      });
    }
    if (e.key === "Home") setActive(0);
    if (e.key === "End") setActive(data.length - 1);
  };
  const a = active !== null ? data[active] : null;
  const total = data.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="adm-chart" ref={ref} style={{ height }}>
      {width > 0 && (
        <svg
          width={width}
          height={height}
          role="img"
          tabIndex={0}
          aria-label={`Daily revenue, ${fmtShort(data[0].day)} to ${fmtShort(data[data.length - 1].day)}: ${formatINR(total)} in total. Use the arrow keys to read each day.`}
          onKeyDown={onKey}
          onFocus={() => setActive((v) => v ?? data.length - 1)}
          onBlur={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={width - pad.r} y1={y(t)} y2={y(t)} stroke="rgb(23 19 15 / 0.08)" strokeWidth={1} />
              <text className="tick" x={pad.l - 10} y={y(t) + 4} textAnchor="end">
                {t === 0 ? "0" : inrCompact(t)}
              </text>
            </g>
          ))}
          {data.map((d, i) =>
            (data.length - 1 - i) % every === 0 && (i === data.length - 1 || x(data.length - 1) - x(i) >= 64) ? (
              <text key={d.day} className="tick" x={x(i)} y={height - 8} textAnchor={i === data.length - 1 ? "end" : "middle"}>
                {fmtShort(d.day)}
              </text>
            ) : null,
          )}
          <path d={area} fill={WOOD_COLOR.red} fillOpacity={0.09} />
          <path d={line} fill="none" stroke={WOOD_COLOR.red} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {active === null && <circle cx={x(data.length - 1)} cy={y(data[data.length - 1].revenue)} r={4} fill={WOOD_COLOR.red} stroke="#fffdf9" strokeWidth={2} />}
          {a && active !== null && (
            <g pointerEvents="none">
              <line x1={x(active)} x2={x(active)} y1={pad.t} y2={pad.t + ih} stroke="rgb(23 19 15 / 0.35)" strokeWidth={1} />
              <circle cx={x(active)} cy={y(a.revenue)} r={5} fill={WOOD_COLOR.red} stroke="#fffdf9" strokeWidth={2} />
            </g>
          )}
          <rect x={pad.l} y={pad.t} width={iw} height={ih} fill="transparent" onPointerMove={onMove} onPointerLeave={() => setActive(null)} />
        </svg>
      )}
      {a && active !== null && (
        <div className="adm-tip" style={{ left: Math.min(Math.max(x(active) - 70, 0), width - 160), top: Math.max(0, y(a.revenue) - 86) }}>
          <span>{fmtDate(a.day)}</span>
          <strong>{formatINR(a.revenue)}</strong>
          <div className="adm-tip-row">
            <i style={{ background: WOOD_COLOR.red }} />
            <span>
              {a.orders} {a.orders === 1 ? "order" : "orders"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- batch tally for the figures strip: one stroke per three-day batch, the latest in red ---------- */
export function Tally({ values }: { values: number[] }) {
  const max = Math.max(...values, 0);
  return (
    <span className="adm-tally" aria-hidden>
      {values.map((v, i) => (
        <i key={i} style={{ height: `${max > 0 ? Math.max(8, (v / max) * 100) : 8}%` }} />
      ))}
    </span>
  );
}

/* ---------- one whole split into red and white (tall segmented bar) ---------- */
export function SplitBar({ parts }: { parts: { key: "red" | "white"; label: string; value: number; sub: string }[] }) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div>
      <div className="adm-split" role="img" aria-label={parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)}%`).join(", ")}>
        {parts.map((p) =>
          p.value > 0 ? (
            <div key={p.key} style={{ flex: p.value, background: WOOD_COLOR[p.key] }} title={`${p.label}: ${formatINR(p.value)} (${Math.round((p.value / total) * 100)}%)`}>
              {p.value / total > 0.12 ? `${Math.round((p.value / total) * 100)}%` : ""}
            </div>
          ) : null,
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
        {parts.map((p) => (
          <div key={p.key}>
            <div className="adm-legend">
              <span>
                <i style={{ background: WOOD_COLOR[p.key] }} />
                {p.label}
              </span>
            </div>
            <div style={{ fontSize: 18, fontWeight: 560, marginTop: 4, letterSpacing: "-0.01em" }}>{formatINR(p.value)}</div>
            <div className="adm-muted" style={{ fontSize: 12.5 }}>
              {p.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- horizontal bars: sales by category, one group per wood on a shared scale ----------
   Both woods have a "Gifting" and a "Beads & Malas", so each row sits under its wood's heading. */
export function CategoryBars({ rows }: { rows: { id: string; label: string; wood: "red" | "white"; revenue: number; units: number }[] }) {
  const max = Math.max(...rows.map((r) => r.revenue), 1);
  const total = rows.reduce((s, r) => s + r.revenue, 0) || 1;
  const [hover, setHover] = useState<string | null>(null);
  const groups = (["red", "white"] as const).map((w) => ({ wood: w, rows: rows.filter((r) => r.wood === w), sum: rows.filter((r) => r.wood === w).reduce((s, r) => s + r.revenue, 0) }));
  return (
    <div style={{ position: "relative" }}>
      {groups.map((g) => (
        <div key={g.wood} className="adm-hbar-group" role="group" aria-label={`${g.wood === "red" ? "Red" : "White"} sandalwood`}>
          <div className="adm-hbar-head">
            <i className={g.wood === "red" ? "ring-red" : "ring-white"} aria-hidden />
            {g.wood === "red" ? "Red sandalwood" : "White sandalwood"}
            <span className="adm-muted num" style={{ order: 2, fontVariantCaps: "normal", letterSpacing: 0, fontWeight: 500, fontSize: 12 }}>
              {inrCompact(g.sum)}
            </span>
          </div>
          {g.rows.map((r) => {
            const key = `${r.wood}-${r.id}`;
            return (
              <div
                key={key}
                className="adm-hbar"
                tabIndex={0}
                aria-label={`${r.label}, ${r.wood} sandalwood: ${formatINR(r.revenue)}, ${r.units} units`}
                onPointerEnter={() => setHover(key)}
                onPointerLeave={() => setHover(null)}
                onFocus={() => setHover(key)}
                onBlur={() => setHover(null)}
              >
                <span className="adm-hbar-label">{r.label}</span>
                <span className="adm-hbar-track">
                  <span style={{ width: `${Math.max(1.5, (r.revenue / max) * 100)}%`, background: WOOD_COLOR[r.wood] }} />
                </span>
                <span className="adm-hbar-value">{r.revenue ? inrCompact(r.revenue) : "–"}</span>
                {hover === key && (
                  <div className="adm-tip" style={{ left: "38%", bottom: "calc(100% + 2px)" }}>
                    <span>
                      {r.label}, {r.wood}
                    </span>
                    <strong>{formatINR(r.revenue)}</strong>
                    <div className="adm-tip-row">
                      <i style={{ background: WOOD_COLOR[r.wood] }} />
                      <span>
                        {r.units} units · {Math.round((r.revenue / total) * 100)}% of sales
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
