"use client";

import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useMemo } from "react";
import type { Wood } from "@/lib/wood";
import { SHEET, SHEET_K, SHEET_KX_, sheet, type LonLat, type Pt } from "../_lib/geo";
import { SOURCES, WORKSHOP, citiesNear } from "../_lib/places";
import { s } from "./styles";

const ASPECT = 1.45;

type Dest = { name: string; at: LonLat; approx: boolean };
type Box = [number, number, number, number];

const hit = (a: Box, b: Box) => a[0] < b[2] && a[2] > b[0] && a[1] < b[3] && a[3] > b[1];
/** A label's rough width: about 0.56em a glyph for the sans, a little more for the serif. */
const textW = (t: string, size: number, k = 0.56) => t.length * size * k;
const far = (a: LonLat, b: LonLat, deg: number) => Math.hypot(a[0] - b[0], a[1] - b[1]) > deg;

/** The first leg of each wood in the order: from where it grows to the workshop. Skipped when it would sit on another pin. */
export function sourcesFor(woods: Wood[], to: LonLat) {
  return [...new Set(woods)].map((w) => ({ wood: w, ...SOURCES[w] })).filter((src) => far(src.at, to, 0.6) && far(src.at, WORKSHOP.at, 0.3));
}

/** Frame the route: every point plus a margin, never smaller than a few degrees, at a fixed aspect. */
function frame(pts: LonLat[]) {
  const lon0 = Math.min(...pts.map((p) => p[0]));
  const lon1 = Math.max(...pts.map((p) => p[0]));
  const lat0 = Math.min(...pts.map((p) => p[1]));
  const lat1 = Math.max(...pts.map((p) => p[1]));
  let w = Math.max((lon1 - lon0) * SHEET_KX_ * 1.5, 6 * SHEET_KX_);
  let h = Math.max((lat1 - lat0) * SHEET_K * 1.5, 4 * SHEET_K);
  if (w / h > ASPECT) h = w / ASPECT;
  else w = h * ASPECT;
  const [cx, cy] = sheet([(lon0 + lon1) / 2, (lat0 + lat1) / 2]);
  // a little more room at the foot, where the longitude margin sits
  return { x: cx - w / 2, y: cy - h / 2 + h * 0.025, w, h };
}

/** A gentle arc from the workshop to the door, with an arc-length table so the parcel moves evenly. */
function arc(A: Pt, B: Pt) {
  const dx = B[0] - A[0];
  const dy = B[1] - A[1];
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(0.22 * len, 220);
  const C: Pt = [(A[0] + B[0]) / 2 + (dy / len) * bend, (A[1] + B[1]) / 2 - (dx / len) * bend];
  const at = (t: number): Pt => [
    (1 - t) * (1 - t) * A[0] + 2 * (1 - t) * t * C[0] + t * t * B[0],
    (1 - t) * (1 - t) * A[1] + 2 * (1 - t) * t * C[1] + t * t * B[1],
  ];
  const N = 64;
  const acc = [0];
  let prev = at(0);
  for (let i = 1; i <= N; i++) {
    const p = at(i / N);
    acc.push(acc[i - 1] + Math.hypot(p[0] - prev[0], p[1] - prev[1]));
    prev = p;
  }
  const total = acc[N] || 1;
  const byLength = (f: number): Pt => {
    const target = Math.max(0, Math.min(1, f)) * total;
    let i = 1;
    while (i < N && acc[i] < target) i++;
    const seg = acc[i] - acc[i - 1] || 1;
    const t = (i - 1 + (target - acc[i - 1]) / seg) / N;
    return at(t);
  };
  return { d: `M${A[0].toFixed(1)} ${A[1].toFixed(1)} Q${C[0].toFixed(1)} ${C[1].toFixed(1)} ${B[0].toFixed(1)} ${B[1].toFixed(1)}`, byLength, short: len < 12 };
}

/**
 * The order's route, drawn on the subcontinent sheet: from where each wood grows to the workshop,
 * then from the workshop to the delivery city. `progress` runs 0 (at the workshop) to 1 (delivered).
 * Labels are placed so they never sit on each other, on the graticule, or off the sheet.
 */
export function RouteMap({ to, progress, id, woods = [], className = "" }: { to: Dest; progress: number; id: string; woods?: Wood[]; className?: string }) {
  const reduce = useReducedMotion();
  const A = sheet(WORKSHOP.at);
  const B = sheet(to.at);
  const sources = sourcesFor(woods, to.at);
  const f = frame([WORKSHOP.at, to.at, ...sources.map((x) => x.at)]);
  const route = useMemo(() => arc(sheet(WORKSHOP.at), sheet(to.at)), [to.at]);
  const u = f.w / 100;

  const t = useMotionValue(0);
  useEffect(() => {
    const c = animate(t, progress, reduce ? { duration: 0 } : { duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 });
    return () => c.stop();
  }, [progress, reduce, t]);
  const px = useTransform(t, (v) => route.byLength(v)[0]);
  const py = useTransform(t, (v) => route.byLength(v)[1]);

  /* ---- the graticule ---- */
  const lonSpan = f.w / SHEET_KX_;
  const step = lonSpan > 24 ? 5 : lonSpan > 10 ? 2 : 1;
  const lonA = 65 + f.x / SHEET_KX_;
  const latTop = 40 - f.y / SHEET_K;
  const lats: number[] = [];
  for (let l = Math.ceil((latTop - f.h / SHEET_K) / step) * step; l <= latTop; l += step) lats.push(l);
  const lons: number[] = [];
  for (let l = Math.ceil(lonA / step) * step; l <= lonA + lonSpan; l += step) lons.push(l);

  /* ---- label placement: pins first, then the graticule, then the landmark cities ---- */
  const band = u * 4.8; // the longitude margin along the foot of the sheet
  const inner: Box = [f.x + u * 0.8, f.y + u * 0.8, f.x + f.w - u * 0.8, f.y + f.h - band - u * 0.4];
  const inside = (b: Box) => b[0] >= inner[0] && b[1] >= inner[1] && b[2] <= inner[2] && b[3] <= inner[3];
  const taken: Box[] = [];
  const free = (b: Box) => inside(b) && !taken.some((x) => hit(x, b));

  // destination: a ring and dot, its name to the side away from the workshop if it fits
  const destSub = to.approx ? "Delivery, state capital" : "Delivery";
  const destW = Math.max(textW(to.name, u * 3.6, 0.6), textW(destSub, u * 2.3));
  const destBox = (right: boolean): Box => (right ? [B[0] + u * 2.4, B[1] - u * 3.2, B[0] + u * 2.4 + destW, B[1] + u * 4.4] : [B[0] - u * 2.4 - destW, B[1] - u * 3.2, B[0] - u * 2.4, B[1] + u * 4.4]);
  const destPref = B[0] >= A[0];
  const destRight = inside(destBox(destPref)) ? destPref : inside(destBox(!destPref)) ? !destPref : destBox(true)[2] - inner[2] < inner[0] - destBox(false)[0];
  taken.push([B[0] - u * 1.9, B[1] - u * 1.9, B[0] + u * 1.9, B[1] + u * 1.9], destBox(destRight));

  // workshop: a filled pin (drawn at u/6.5 of its 45-unit height), its name away from the route
  const pinK = u / 6.5;
  taken.push([A[0] - 15 * pinK, A[1] - 46 * pinK, A[0] + 15 * pinK, A[1] + 3 * pinK]);
  const wsW = Math.max(textW(WORKSHOP.name, 19 * pinK, 0.6), textW(WORKSHOP.region, 14 * pinK));
  const wsBox = (right: boolean): Box => (right ? [A[0] + 22 * pinK, A[1] - 52 * pinK, A[0] + 22 * pinK + wsW, A[1] - 14 * pinK] : [A[0] - 22 * pinK - wsW, A[1] - 52 * pinK, A[0] - 22 * pinK, A[1] - 14 * pinK]);
  const wsPref = !destPref;
  const wsRight = free(wsBox(wsPref)) ? wsPref : free(wsBox(!wsPref)) ? !wsPref : wsPref;
  taken.push(wsBox(wsRight));

  // where the wood grows: a hollow pin, smaller, with a dotted leg to the workshop
  const srcK = u / 9;
  const placedSources = sources.map((src) => {
    const P = sheet(src.at);
    taken.push([P[0] - 15 * srcK, P[1] - 46 * srcK, P[0] + 15 * srcK, P[1] + 3 * srcK]);
    const w = Math.max(textW(src.name, u * 2.6, 0.6), textW(src.note, u * 1.9));
    const boxAt = (side: "r" | "l" | "u"): Box =>
      side === "r"
        ? [P[0] + 20 * srcK, P[1] - 44 * srcK, P[0] + 20 * srcK + w, P[1] - 44 * srcK + u * 5]
        : side === "l"
          ? [P[0] - 20 * srcK - w, P[1] - 44 * srcK, P[0] - 20 * srcK, P[1] - 44 * srcK + u * 5]
          : [P[0] - w / 2, P[1] - 50 * srcK - u * 5, P[0] + w / 2, P[1] - 50 * srcK];
    const order: ("r" | "l" | "u")[] = P[0] >= A[0] ? ["r", "u", "l"] : ["l", "u", "r"];
    const side = order.find((o) => free(boxAt(o))) ?? null;
    if (side) taken.push(boxAt(side));
    return { ...src, P, side, box: side ? boxAt(side) : null };
  });

  // latitude labels down the right edge, each with a paper halo so the coast never cuts them
  const latLabels = lats
    .map((l) => {
      const y = sheet([80, l])[1] - u * 0.6;
      const x = f.x + f.w - u * 1.2;
      const box: Box = [x - textW(`${l}°N`, u * 2.4, 0.62), y - u * 2.2, x, y + u * 0.5];
      return { l, x, y, box };
    })
    .filter((m) => free(m.box));
  latLabels.forEach((m) => taken.push(m.box));
  // longitude labels sit in the foot margin, centred on their meridian, never cut by the frame
  const lonLabels = lons.map((l) => ({ l, x: sheet([l, 20])[0] })).filter((m) => m.x - u * 3.2 > f.x && m.x + u * 3.2 < f.x + f.w);

  const skip = [to.name, "Bengaluru", ...sources.map((x) => x.name)];
  const cities = citiesNear({ lon0: lonA, lon1: lonA + lonSpan, lat0: latTop - f.h / SHEET_K, lat1: latTop }, skip, 9)
    .map((c) => {
      const [x, y] = sheet(c.at);
      return { name: c.name, x, y, box: [x - u * 0.8, y - u * 2.1, x + u * 1.3 + textW(c.name, u * 2.5), y + u * 1.1] as Box };
    })
    .filter((c) => {
      const ok = Math.hypot(c.x - B[0], c.y - B[1]) > 6 * u && Math.hypot(c.x - A[0], c.y - A[1]) > 6 * u && free(c.box);
      if (ok) taken.push(c.box);
      return ok;
    })
    .slice(0, 6);

  const fd = SHEET.fade;
  const halo = { paintOrder: "stroke" as const, stroke: "var(--a-card)", strokeWidth: u * 0.9, strokeLinejoin: "round" as const };

  return (
    <svg viewBox={`${f.x.toFixed(1)} ${f.y.toFixed(1)} ${f.w.toFixed(1)} ${f.h.toFixed(1)}`} className={className} role="img" aria-label={`Route map from the workshop in ${WORKSHOP.region} to ${to.name}.`}>
      <defs>
        <linearGradient id={`${id}-n`} gradientUnits="userSpaceOnUse" x1="0" y1={fd.n1} x2="0" y2={fd.n0}>
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${id}-we`} gradientUnits="userSpaceOnUse" x1={fd.w0} y1="0" x2={fd.e1} y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset={((fd.w1 - fd.w0) / (fd.e1 - fd.w0)).toFixed(3)} stopColor="#fff" stopOpacity="1" />
          <stop offset={((fd.e0 - fd.w0) / (fd.e1 - fd.w0)).toFixed(3)} stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`${id}-mn`} maskUnits="userSpaceOnUse" x="-500" y="-500" width="4000" height="4000">
          <rect x="-500" y="-500" width="4000" height="4000" fill={`url(#${id}-n)`} />
        </mask>
        <mask id={`${id}-mwe`} maskUnits="userSpaceOnUse" x="-500" y="-500" width="4000" height="4000">
          <rect x="-500" y="-500" width="4000" height="4000" fill={`url(#${id}-we)`} />
        </mask>
      </defs>

      <rect x={f.x} y={f.y} width={f.w} height={f.h} fill="var(--a-card)" />
      {lats.map((l) => {
        const y = sheet([80, l])[1];
        return <line key={`la${l}`} x1={f.x} x2={f.x + f.w} y1={y} y2={y} stroke="var(--a-ink)" strokeOpacity="0.13" strokeWidth={u * 0.12} strokeDasharray={`${u * 0.25} ${u * 0.7}`} />;
      })}
      {lons.map((l) => {
        const x = sheet([l, 20])[0];
        return <line key={`lo${l}`} y1={f.y} y2={f.y + f.h} x1={x} x2={x} stroke="var(--a-ink)" strokeOpacity="0.13" strokeWidth={u * 0.12} strokeDasharray={`${u * 0.25} ${u * 0.7}`} />;
      })}

      <g mask={`url(#${id}-mwe)`}>
        <g mask={`url(#${id}-mn)`}>
          <path d={SHEET.land} fill="none" stroke="var(--a-ink)" strokeOpacity="0.06" strokeWidth={u * 2.6} strokeLinejoin="round" />
          <path d={SHEET.land} fill="none" stroke="var(--a-ink)" strokeOpacity="0.07" strokeWidth={u * 1.2} strokeLinejoin="round" />
          <path d={SHEET.land} fill="var(--a-land)" stroke="var(--a-ink)" strokeWidth={u * 0.22} strokeLinejoin="round" />
        </g>
      </g>
      <path d={SHEET.lanka} fill="var(--a-land)" stroke="var(--a-ink)" strokeWidth={u * 0.22} />
      <path d={SHEET.andaman} fill="none" stroke="var(--a-ink)" strokeOpacity="0.6" strokeWidth={u * 0.5} strokeLinecap="round" />
      <path d={SHEET.westHills} stroke="var(--a-ink)" strokeOpacity="0.35" strokeWidth={u * 0.16} strokeLinecap="round" />
      <path d={SHEET.eastHills} stroke="var(--a-ink)" strokeOpacity="0.35" strokeWidth={u * 0.16} strokeLinecap="round" />
      {SHEET.seas.map((sea) => (
        <text key={sea.text} x={sea.at[0]} y={sea.at[1]} fontSize={u * 3} fill="var(--a-muted)" fontStyle="italic" letterSpacing={u * 0.5} textAnchor="middle">
          {sea.text}
        </text>
      ))}

      {/* landmark cities */}
      {cities.map((c) => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r={u * 0.55} fill="var(--a-card)" stroke="var(--a-ink)" strokeOpacity="0.6" strokeWidth={u * 0.2} />
          <text x={c.x + u * 1.3} y={c.y + u * 0.9} fontSize={u * 2.5} fill="var(--a-ink)" fillOpacity="0.62" {...halo}>
            {c.name}
          </text>
        </g>
      ))}
      {latLabels.map((m) => (
        <text key={`lt${m.l}`} x={m.x} y={m.y} textAnchor="end" fontSize={u * 2.4} fill="var(--a-muted)" className={s.serif} {...halo}>
          {m.l}°N
        </text>
      ))}

      {/* the first legs: dotted, from where each wood grows to the workshop */}
      {placedSources.map((src) => (
        <path
          key={`leg-${src.wood}`}
          d={`M${src.P[0].toFixed(1)} ${src.P[1].toFixed(1)} L${A[0].toFixed(1)} ${A[1].toFixed(1)}`}
          fill="none"
          stroke="var(--a-accent)"
          strokeOpacity="0.75"
          strokeWidth={u * 0.42}
          strokeDasharray={`0 ${u * 1.1}`}
          strokeLinecap="round"
        />
      ))}

      {/* the route: all of it dashed, the travelled part solid */}
      <path d={route.d} fill="none" stroke="var(--a-ink)" strokeOpacity="0.35" strokeWidth={u * 0.35} strokeDasharray={`${u * 0.4} ${u * 1.1}`} strokeLinecap="round" />
      <motion.path d={route.d} fill="none" stroke="var(--a-accent)" strokeWidth={u * 0.6} strokeLinecap="round" style={{ pathLength: t }} />

      {/* where the wood grows */}
      {placedSources.map((src) => (
        <g key={`src-${src.wood}`}>
          <g transform={`translate(${src.P[0]} ${src.P[1]}) scale(${srcK})`}>
            <path d="M0 0C-2.5-8-15-17.5-15-30.5a15 15 0 1 1 30 0C15-17.5 2.5-8 0 0z" fill="var(--a-card)" stroke="var(--a-accent)" strokeWidth="3" />
            <circle cx="0" cy="-30.5" r="5.5" fill="var(--a-accent)" />
          </g>
          {src.box && (
            <g transform={`translate(${src.side === "l" ? src.box[2] : src.side === "u" ? (src.box[0] + src.box[2]) / 2 : src.box[0]} ${src.box[1] + u * 2.3})`}>
              <text fontSize={u * 2.6} fill="var(--a-ink)" textAnchor={src.side === "l" ? "end" : src.side === "u" ? "middle" : "start"} className={s.serif} {...halo}>
                {src.name}
              </text>
              <text y={u * 2.5} fontSize={u * 1.9} fill="var(--a-muted)" textAnchor={src.side === "l" ? "end" : src.side === "u" ? "middle" : "start"} {...halo}>
                {src.note}
              </text>
            </g>
          )}
        </g>
      ))}

      {/* destination */}
      <g transform={`translate(${B[0]} ${B[1]})`}>
        <circle r={u * 1.6} fill="none" stroke="var(--a-ink)" strokeWidth={u * 0.25} />
        <circle r={u * 0.55} fill="var(--a-ink)" />
        <g transform={`translate(${destRight ? u * 2.4 : -u * 2.4} ${u * 0.2})`}>
          <text fontSize={u * 3.6} fill="var(--a-ink)" textAnchor={destRight ? "start" : "end"} className={s.serif} {...halo}>
            {to.name}
          </text>
          <text y={u * 3.2} fontSize={u * 2.3} fill="var(--a-muted)" textAnchor={destRight ? "start" : "end"} {...halo}>
            {destSub}
          </text>
        </g>
      </g>

      {/* the workshop */}
      <g transform={`translate(${A[0]} ${A[1]}) scale(${pinK})`}>
        <ellipse cx="0" cy="1" rx="7" ry="2.4" fill="var(--a-ink)" opacity="0.25" />
        <path d="M0 0C-2.5-8-15-17.5-15-30.5a15 15 0 1 1 30 0C15-17.5 2.5-8 0 0z" fill="var(--a-accent)" stroke="var(--a-accent-deep)" strokeWidth="1.6" />
        <circle cx="0" cy="-30.5" r="5.5" fill="var(--a-card)" />
        <g transform={`translate(${wsRight ? 22 : -22} -36)`}>
          <text fontSize="19" fill="var(--a-ink)" textAnchor={wsRight ? "start" : "end"} className={s.serif} paintOrder="stroke" stroke="var(--a-card)" strokeWidth="5.5" strokeLinejoin="round">
            {WORKSHOP.name}
          </text>
          <text y="18" fontSize="14" fill="var(--a-muted)" textAnchor={wsRight ? "start" : "end"} paintOrder="stroke" stroke="var(--a-card)" strokeWidth="5.5" strokeLinejoin="round">
            {WORKSHOP.region}
          </text>
        </g>
      </g>

      {/* the parcel */}
      <motion.g style={{ x: px, y: py }}>
        <circle r={u * 2.4} fill="var(--a-accent)" opacity="0.18" className={progress < 1 ? s.pulse : undefined} />
        <rect x={-u * 1.15} y={-u * 1.15} width={u * 2.3} height={u * 2.3} rx={u * 0.3} fill="var(--a-card)" stroke="var(--a-ink)" strokeWidth={u * 0.25} />
        <path d={`M${-u * 1.15} 0 H${u * 1.15} M0 ${-u * 1.15} V${u * 1.15}`} stroke="var(--a-accent)" strokeWidth={u * 0.22} />
      </motion.g>

      {/* the foot margin with the longitudes, ruled off like the edge of a sheet */}
      <rect x={f.x} y={f.y + f.h - band} width={f.w} height={band} fill="var(--a-card)" />
      <line x1={f.x} x2={f.x + f.w} y1={f.y + f.h - band} y2={f.y + f.h - band} stroke="var(--a-ink)" strokeOpacity="0.55" strokeWidth={u * 0.16} />
      {lons.map((l) => {
        const x = sheet([l, 20])[0];
        return <line key={`tk${l}`} x1={x} x2={x} y1={f.y + f.h - band} y2={f.y + f.h - band + u * 0.9} stroke="var(--a-ink)" strokeOpacity="0.55" strokeWidth={u * 0.16} />;
      })}
      {lonLabels.map((m) => (
        <text key={`lg${m.l}`} x={m.x} y={f.y + f.h - u * 1.25} textAnchor="middle" fontSize={u * 2.4} fill="var(--a-muted)" className={s.serif}>
          {m.l}°E
        </text>
      ))}
    </svg>
  );
}

/** The key under a route map, in the board's legend style. */
export function RouteKey({ woods = [], to, className = "" }: { woods?: Wood[]; to: LonLat; className?: string }) {
  const sources = sourcesFor(woods, to);
  return (
    <ul className={`flex flex-wrap gap-x-5 gap-y-2 text-[13.5px] text-(--a-ink-2) ${className}`}>
      <li className="flex items-center gap-2">
        <svg viewBox="0 0 24 32" className="h-5 w-[15px] shrink-0" aria-hidden>
          <path d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z" fill="var(--a-accent)" />
          <circle cx="12" cy="12" r="3.6" fill="var(--a-card)" />
        </svg>
        The workshop, {WORKSHOP.region}
      </li>
      {sources.map((src) => (
        <li key={src.wood} className="flex items-center gap-2">
          <svg viewBox="0 0 24 32" className="h-5 w-[15px] shrink-0" aria-hidden>
            <path d="M12 31C10.6 26.4 2.5 19.6 2.5 12.2a9.5 9.5 0 1 1 19 0c0 7.4-8.1 14.2-9.5 18.8z" fill="var(--a-card)" stroke="var(--a-accent)" strokeWidth="2" />
            <circle cx="12" cy="12" r="3.6" fill="var(--a-accent)" />
          </svg>
          {src.wood === "red" ? "Red" : "White"} sandalwood, {src.name}
        </li>
      ))}
      <li className="flex items-center gap-2">
        <svg viewBox="0 0 28 10" className="h-2.5 w-7 shrink-0" aria-hidden>
          <path d="M2 5h24" stroke="var(--a-ink)" strokeOpacity="0.5" strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" />
        </svg>
        The route to your door
      </li>
      <li className="flex items-center gap-2">
        <svg viewBox="0 0 14 14" className="size-3.5 shrink-0" aria-hidden>
          <rect x="1.5" y="1.5" width="11" height="11" rx="1.5" fill="var(--a-card)" stroke="var(--a-ink)" strokeWidth="1.4" />
          <path d="M1.5 7h11M7 1.5v11" stroke="var(--a-accent)" strokeWidth="1.2" />
        </svg>
        The parcel
      </li>
    </ul>
  );
}
