"use client";

import { useEffect, useRef, type PointerEvent as RPointerEvent } from "react";
import { useWood } from "@/lib/wood";

/**
 * A live 2D wood grain. Grain lines run roughly parallel with a shared slow undulation;
 * the pointer is a knot the lines part around, like grain around a branch.
 */

type RGB = [number, number, number];
type Pal = { bg0: RGB; bg1: RGB; dark: RGB; light: RGB };

const RED: Pal = { bg0: [118, 34, 18], bg1: [150, 54, 31], dark: [70, 16, 7], light: [190, 84, 50] };
const WHITE: Pal = { bg0: [224, 194, 142], bg1: [240, 217, 174], dark: [164, 118, 62], light: [250, 233, 200] };

function mulberry32(a: number) {
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LINES = (() => {
  const r = mulberry32(2011);
  return Array.from({ length: 78 }, () => ({
    amp: 0.5 + r() * 2.6,
    f: 0.008 + r() * 0.03,
    ph: r() * Math.PI * 2,
    w: 0.45 + r() * 1.9,
    shade: r(),
    a: 0.3 + r() * 0.55,
    sp: 0.4 + r() * 0.9,
  }));
})();

const PORES = (() => {
  const r = mulberry32(21);
  return Array.from({ length: 160 }, () => ({ x: r(), y: r(), l: 1.5 + r() * 5, a: 0.08 + r() * 0.22 }));
})();

const mixC = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const rgba = (c: RGB, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

export function GrainCanvas({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const woodRef = useRef<"red" | "white">("red");
  const ptr = useRef({ x: 0.64, y: 0.4, on: false });
  const wood = useWood();

  useEffect(() => {
    woodRef.current = wood;
  }, [wood]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let w = 0;
    let h = 0;
    const resize = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, r.width);
      h = Math.max(1, r.height);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(c);
    resize();

    let mix = woodRef.current === "white" ? 1 : 0;
    let kx = ptr.current.x;
    let ky = ptr.current.y;
    let ks = 0.5;
    let raf = 0;
    let visible = true;
    let t0 = performance.now();
    let clock = 0;

    const draw = (now: number) => {
      const dt = Math.min(now - t0, 50);
      t0 = now;
      if (!reduce) clock += dt;
      const p = ptr.current;
      mix += ((woodRef.current === "white" ? 1 : 0) - mix) * 0.05;
      kx += (p.x - kx) * 0.07;
      ky += (p.y - ky) * 0.07;
      ks += ((p.on ? 1 : 0.5) - ks) * 0.05;

      const pal = {
        bg0: mixC(RED.bg0, WHITE.bg0, mix),
        bg1: mixC(RED.bg1, WHITE.bg1, mix),
        dark: mixC(RED.dark, WHITE.dark, mix),
        light: mixC(RED.light, WHITE.light, mix),
      };

      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, rgba(pal.bg0));
      g.addColorStop(1, rgba(pal.bg1));
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      const cx = kx * w;
      const cy = ky * h;
      const sigma = Math.min(w, h) * 0.17;
      const K = sigma * 0.95 * ks;
      const n = LINES.length;
      const spacing = (h * 1.3) / n;
      const t = clock;

      for (let i = 0; i < n; i++) {
        const L = LINES[i];
        const y0 = -h * 0.15 + i * spacing;
        ctx.strokeStyle = rgba(mixC(pal.dark, pal.light, L.shade), L.a);
        ctx.lineWidth = L.w;
        ctx.beginPath();
        for (let x = -8; x <= w + 8; x += 6) {
          const warp = 11 * Math.sin(x * 0.0085 + t * 0.00016 + i * 0.045) + 5 * Math.sin(x * 0.022 - t * 0.0001 + 1.7);
          let y = y0 + warp + L.amp * Math.sin(x * L.f + L.ph + t * 0.00035 * L.sp);
          const dx = x - cx;
          const dy = y - cy;
          const e = Math.exp(-(dx * dx * 0.55 + dy * dy) / (2 * sigma * sigma));
          y += K * e * Math.tanh(dy / 5);
          if (x === -8) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // the knot itself: a few tight rings
      for (let r = 1; r <= 6; r++) {
        ctx.beginPath();
        ctx.ellipse(cx, cy, r * sigma * 0.095 * 1.7, r * sigma * 0.095, 0, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(pal.dark, (0.32 - r * 0.035) * ks);
        ctx.lineWidth = 1.1;
        ctx.stroke();
      }
      ctx.beginPath();
      ctx.ellipse(cx, cy, sigma * 0.12, sigma * 0.07, 0, 0, Math.PI * 2);
      ctx.fillStyle = rgba(pal.dark, 0.45 * ks);
      ctx.fill();

      // pores: short dashes along the grain
      for (const q of PORES) {
        const x = q.x * w;
        const y = q.y * h + 11 * Math.sin(x * 0.0085 + t * 0.00016);
        ctx.fillStyle = rgba(pal.dark, q.a);
        ctx.fillRect(x, y, q.l, 0.9);
      }

      if (visible && !document.hidden) raf = requestAnimationFrame(draw);
      else raf = 0;
    };

    const start = () => {
      if (!raf) {
        t0 = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
    });
    io.observe(c);
    const onVis = () => {
      if (!document.hidden && visible) start();
    };
    document.addEventListener("visibilitychange", onVis);
    start();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  const move = (e: RPointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    ptr.current = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, on: true };
  };
  const leave = () => {
    ptr.current = { x: 0.64, y: 0.4, on: false };
  };

  return (
    <canvas
      ref={canvasRef}
      onPointerMove={move}
      onPointerDown={move}
      onPointerLeave={leave}
      onPointerCancel={leave}
      aria-hidden
      className={`absolute inset-0 h-full w-full touch-pan-y ${className}`}
    />
  );
}
