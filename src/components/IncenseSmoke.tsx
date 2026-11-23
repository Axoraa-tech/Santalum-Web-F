"use client";

import { useEffect, useRef } from "react";

type P = { x: number; y: number; age: number; life: number; size: number; seed: number };

/**
 * A single incense stick in a brass holder, smoke drawn on a canvas.
 * Reduced motion: the smoke is simulated ahead and drawn once, still.
 */
export function IncenseSmoke({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0, h = 0, raf = 0, t = 0;
    const parts: P[] = [];
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // seeded so the still frame is the same every time
    let s = 7;
    const rand = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;

    const geo = () => {
      const narrow = w < 768;
      const baseX = w * (narrow ? 0.74 : 0.66);
      const baseY = h * (narrow ? 0.38 : 0.8);
      const len = Math.min(h * (narrow ? 0.2 : 0.34), 300);
      return { baseX, baseY, tipY: baseY - len, len };
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const step = () => {
      const { baseX, tipY } = geo();
      t += 1;
      for (let i = 0; i < 2; i++) {
        parts.push({ x: baseX + (rand() - 0.5) * 1.5, y: tipY - 2, age: 0, life: 380 + rand() * 260, size: 1.5, seed: rand() * 100 });
      }
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age++;
        const k = p.age / p.life;
        p.y -= 0.55 + k * 0.35;
        p.x += Math.sin(t * 0.012 + p.y * 0.011 + p.seed * 0.02) * (0.15 + k * 1.1) + Math.sin(p.seed + t * 0.004) * 0.08;
        p.size = 1.5 + k * 26;
        if (p.age > p.life || p.y < -40) parts.splice(i, 1);
      }
    };

    const draw = () => {
      const { baseX, baseY, tipY, len } = geo();
      ctx.clearRect(0, 0, w, h);

      // smoke
      for (const p of parts) {
        const k = p.age / p.life;
        const a = (k < 0.08 ? k / 0.08 : 1 - (k - 0.08) / 0.92) * 0.075;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
        g.addColorStop(0, `rgba(232,224,208,${a})`);
        g.addColorStop(1, "rgba(232,224,208,0)");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // stick: bare bamboo below, masala-coated above
      ctx.lineCap = "round";
      ctx.strokeStyle = "#8b5e3c";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY - 6);
      ctx.lineTo(baseX, baseY - len * 0.28);
      ctx.stroke();
      ctx.strokeStyle = "#3b271c";
      ctx.lineWidth = 3.4;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY - len * 0.28);
      ctx.lineTo(baseX, tipY + 3);
      ctx.stroke();
      // ash tip
      ctx.strokeStyle = "#a7a29a";
      ctx.beginPath();
      ctx.moveTo(baseX, tipY + 3);
      ctx.lineTo(baseX, tipY);
      ctx.stroke();

      // ember
      const pulse = still ? 0.8 : 0.65 + Math.sin(t * 0.05) * 0.2;
      const eg = ctx.createRadialGradient(baseX, tipY, 0, baseX, tipY, 14);
      eg.addColorStop(0, `rgba(255,170,90,${pulse})`);
      eg.addColorStop(0.3, `rgba(220,110,50,${pulse * 0.5})`);
      eg.addColorStop(1, "rgba(220,110,50,0)");
      ctx.fillStyle = eg;
      ctx.beginPath();
      ctx.arc(baseX, tipY, 14, 0, Math.PI * 2);
      ctx.fill();

      // brass holder: a small lotus dish
      const hg = ctx.createLinearGradient(0, baseY - 8, 0, baseY + 10);
      hg.addColorStop(0, "#c4975a");
      hg.addColorStop(1, "#6b4a28");
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.ellipse(baseX, baseY, 46, 8, 0, 0, Math.PI);
      ctx.lineTo(baseX - 46, baseY);
      ctx.fill();
      ctx.strokeStyle = "rgba(240,210,160,0.55)";
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(baseX, baseY, 46, 6, 0, Math.PI, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#b08d57";
      ctx.beginPath();
      ctx.ellipse(baseX, baseY - 2, 5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    resize();
    window.addEventListener("resize", resize);

    if (still) {
      for (let i = 0; i < 520; i++) step();
      draw();
    } else {
      for (let i = 0; i < 240; i++) step(); // start with smoke already risen
      const loop = () => {
        step();
        draw();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
