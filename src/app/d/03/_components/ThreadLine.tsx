"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

type Pt = [number, number];

/** Tangent along one axis that never overshoots: flat at turning points (monotone cubic). */
function slope(prev: number, next: number) {
  if (prev * next <= 0) return 0;
  const m = (prev + next) / 2;
  const cap = 3 * Math.min(Math.abs(prev), Math.abs(next));
  return Math.sign(m) * Math.min(Math.abs(m), cap);
}

/** Smooth path through points: a corner between a run and a drop rounds off instead of looping. */
function through(pts: Pt[]) {
  if (pts.length < 2) return "";
  const tan = pts.map((p, i): Pt => {
    const a = pts[i - 1] ?? p;
    const b = pts[i + 1] ?? p;
    const pd: Pt = [p[0] - a[0], p[1] - a[1]];
    const nd: Pt = [b[0] - p[0], b[1] - p[1]];
    if (i === 0) return [nd[0] * 0.5, nd[1] * 0.5];
    if (i === pts.length - 1) return [pd[0] * 0.5, pd[1] * 0.5];
    return [slope(pd[0], nd[0]), slope(pd[1], nd[1])];
  });
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const c1: Pt = [p1[0] + tan[i][0] / 3, p1[1] + tan[i][1] / 3];
    const c2: Pt = [p2[0] - tan[i + 1][0] / 3, p2[1] - tan[i + 1][1] / 3];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

/**
 * One brass thread running down the page through every element marked `data-knot`
 * (wood pendants, the knotted record, the Vault beads…). It draws itself as you scroll,
 * with a bead at the tip, so reading the page is following the thread.
 */
export function ThreadLine({ children }: { children: ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const tip = useRef<SVGCircleElement>(null);
  const [geo, setGeo] = useState({ d: "", w: 0, h: 0 });

  // measure the knots
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let raf = 0;
    const measure = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const pts = [...el.querySelectorAll<HTMLElement>("[data-knot]")]
          .filter((k) => k.offsetParent !== null)
          .map((k): Pt => {
            const b = k.getBoundingClientRect();
            return [b.left + b.width / 2 - r.left, b.top + b.height / 2 - r.top];
          });
        setGeo({ d: through(pts), w: r.width, h: r.height });
      });
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure).catch(() => {});
    window.addEventListener("load", measure);
    const late = window.setTimeout(measure, 1500);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("load", measure);
      window.clearTimeout(late);
    };
  }, []);

  // draw it with the scroll
  useLayoutEffect(() => {
    const p = path.current;
    const el = wrap.current;
    if (!p || !el || !geo.d) return;
    const total = p.getTotalLength();
    const N = 360;
    const ys: number[] = [];
    for (let i = 0; i <= N; i++) ys.push(p.getPointAtLength((total * i) / N).y);
    p.style.strokeDasharray = `${total}`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      const top = el.getBoundingClientRect().top;
      const target = window.innerHeight * 0.62 - top;
      let i = 0;
      while (i < N && ys[i + 1] <= target) i++;
      const len = reduced ? total : (total * i) / N;
      p.style.strokeDashoffset = `${total - len}`;
      const pt = p.getPointAtLength(len);
      tip.current?.setAttribute("cx", pt.x.toFixed(1));
      tip.current?.setAttribute("cy", pt.y.toFixed(1));
      tip.current?.setAttribute("opacity", len > 2 && len < total - 2 ? "1" : "0");
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [geo]);

  return (
    <div ref={wrap} className="relative">
      <svg className="pointer-events-none absolute left-0 top-0 z-0" width={geo.w} height={geo.h} aria-hidden>
        <path d={geo.d} fill="none" stroke="#e3d6c1" strokeWidth="1.25" />
        <path ref={path} d={geo.d} fill="none" stroke="var(--thread)" strokeWidth="1.5" />
        <circle ref={tip} r="6" fill="var(--s3-bead)" opacity="0" />
      </svg>
      {children}
    </div>
  );
}
