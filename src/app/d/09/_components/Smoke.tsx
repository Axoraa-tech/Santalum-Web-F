"use client";

import { useEffect, useRef } from "react";

type P = { x0: number; y: number; vy: number; r: number; life: number; max: number; seed: number };

/**
 * A thread of incense smoke on a 2D canvas: three thin strokes that leave the source together and
 * part as they climb, with a faint haze of particles following the same slow curl.
 * Runs only while visible; off for reduced motion.
 */
export function Smoke({
  className = "",
  originX = 0.5,
  originY = 0.95,
  strength = 1,
}: {
  className?: string;
  originX?: number;
  originY?: number;
  strength?: number;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const r = c.getBoundingClientRect();
      w = r.width;
      h = r.height;
      c.width = Math.max(1, Math.round(w * dpr));
      c.height = Math.max(1, Math.round(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(c);

    const ps: P[] = [];
    let raf = 0;
    let running = false;
    let t = 0;
    let last = 0;
    let acc = 0;

    const spawn = () => {
      ps.push({
        x0: originX * w + (Math.random() - 0.5) * 4,
        y: originY * h,
        vy: 34 + Math.random() * 18,
        r: 2 + Math.random() * 2,
        life: 0,
        max: 6 + Math.random() * 4,
        seed: Math.random() * 6.28,
      });
    };

    /** The curl shared by the threads and the haze: small near the source, wider as it rises. */
    const swayAt = (rise: number, phase: number) =>
      Math.sin(rise * 0.02 - t * 1.05 + phase) * (2 + rise * 0.1) +
      Math.sin(rise * 0.052 + t * 0.7 + phase * 1.7) * (1 + rise * 0.04) +
      Math.sin(t * 0.22 + phase) * rise * 0.05;

    const frame = (now: number) => {
      const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      t += dt;
      acc += dt;
      while (acc > 0.06) {
        acc -= 0.06;
        if (ps.length < 160) spawn();
      }
      ctx.clearRect(0, 0, w, h);
      const ox = originX * w;
      const oy = originY * h;

      // the threads: three thin strokes that leave the stick together and part as they climb
      const len = Math.min(oy * 0.92, 560);
      const steps = 56;
      ctx.lineCap = "round";
      for (let s = 0; s < 3; s++) {
        let px = ox;
        let py = oy;
        for (let i = 1; i <= steps; i++) {
          const f = i / steps;
          const rise = f * len;
          const x = ox + swayAt(rise, s * 0.9) * (0.6 + s * 0.25);
          const y = oy - rise;
          const alpha = 0.34 * strength * Math.min(1, f * 6) * (1 - f) ** 1.6 * (s === 0 ? 1 : 0.6);
          ctx.strokeStyle = `rgba(104, 96, 94, ${alpha})`;
          ctx.lineWidth = 0.8 + f * 3.2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(x, y);
          ctx.stroke();
          px = x;
          py = y;
        }
      }

      // the haze around them
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i];
        p.life += dt;
        const k = p.life / p.max;
        if (k >= 1 || p.y < -40) {
          ps.splice(i, 1);
          continue;
        }
        p.y -= p.vy * dt * (1 - k * 0.4);
        p.r += dt * (1 + k * k * 22);
        const rise = oy - p.y;
        const x = p.x0 + swayAt(rise, p.seed * 0.12);
        const a = 0.07 * strength * Math.sin(Math.PI * Math.min(1, k * 1.1)) * (1 - k * 0.5);
        const g = ctx.createRadialGradient(x, p.y, 0, x, p.y, p.r);
        g.addColorStop(0, `rgba(112, 102, 98, ${a})`);
        g.addColorStop(1, "rgba(112, 102, 98, 0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), { rootMargin: "100px" });
    io.observe(c);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
    };
  }, [originX, originY, strength]);

  return (
    <div aria-hidden className={`pointer-events-none ${className}`}>
      <canvas ref={ref} className="absolute inset-0 block size-full" />
    </div>
  );
}
