"use client";

import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { s } from "./cls";

const RED = CONTENT.red.provenance;
const WHITE = CONTENT.white.provenance;
/** Both woods keep five lines in their record; the labels differ (a red batch, a white lot). */
const ROWS = RED.record.map((r, i) => ({ red: r, white: WHITE.record[i] }));
const RING = {
  red: "Santalum Maison   red sandalwood   batch record   example   ".repeat(2),
  white: "Santalum Maison   white sandalwood   lot record   example   ".repeat(2),
};

/** The example batch record, laid out around a wood seal. The seal tilts towards the pointer. */
export function Provenance() {
  const reduced = !!useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const ringRot = useTransform(scrollYProgress, [0, 1], [-50, 70]);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduced || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 18);
    rx.set(-py * 18);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  const n = ROWS.length;

  return (
    <section id="provenance" ref={ref} className="relative overflow-hidden bg-[var(--o-stone)] px-5 py-24 md:px-10 md:py-32">
      <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-12 lg:items-center lg:gap-8">
        <div className="lg:col-span-4">
          <h2 className={`${s.display} text-[clamp(3rem,5vw,5.6rem)]`}>
            <WT red="Know what you hold." white="Know what is in the bottle." />
          </h2>
          <p className="mt-6 max-w-[400px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">
            <WT red={RED.text} white={WHITE.text} />
          </p>
          <p className={`${s.syne} mt-8 max-w-[380px] border-l-2 border-[var(--m-accent)] pl-5 text-[20px] font-semibold leading-snug tracking-[-0.02em]`}>
            <WT
              red="Vault cuffs are also entered in the registry, by number."
              white="Reserve vials are numbered by hand and entered in the registry."
            />
          </p>
          <p className="mt-8 text-[13px] text-[var(--o-muted)]">
            <WT red="The batch record shown here is an example." white="The lot record shown here is an example." />
          </p>
        </div>

        <div className="relative lg:col-span-8">
          <div className="relative mx-auto w-full max-w-[880px] lg:h-[600px]">
            {/* the seal */}
            <div
              className="relative mx-auto aspect-square w-[min(84vw,460px)] [perspective:1000px] lg:absolute lg:left-0 lg:top-1/2 lg:mx-0 lg:w-[420px] lg:-translate-y-1/2"
              onPointerMove={onMove}
              onPointerLeave={onLeave}
            >
              <motion.div className="absolute inset-0" style={{ rotateX: srx, rotateY: sry }}>
                <div className={`absolute inset-0 rounded-full ${s.seal}`} />
                <motion.svg viewBox="0 0 400 400" className="absolute inset-0 size-full" style={{ rotate: reduced ? 0 : ringRot }} aria-hidden>
                  <defs>
                    <path id="o2-seal-ring" d="M200,200 m-180,0 a180,180 0 1,1 360,0 a180,180 0 1,1 -360,0" />
                  </defs>
                  <text className={`${s.syne} ${s.onlyRed}`} fontSize="13" fontWeight="700" fill="rgb(25 23 20 / 0.78)" dominantBaseline="central">
                    <textPath href="#o2-seal-ring" textLength="1125" lengthAdjust="spacing">
                      {RING.red}
                    </textPath>
                  </text>
                  <text className={`${s.syne} ${s.onlyWhite}`} fontSize="13" fontWeight="700" fill="rgb(25 23 20 / 0.78)" dominantBaseline="central">
                    <textPath href="#o2-seal-ring" textLength="1125" lengthAdjust="spacing">
                      {RING.white}
                    </textPath>
                  </text>
                </motion.svg>
                <div className="absolute inset-[25%] grid place-items-center rounded-full bg-[var(--o-card)] text-center shadow-[0_20px_40px_-20px_rgb(0_0_0/0.5)]">
                  <div>
                    <p className="text-[11px] font-semibold text-[var(--o-muted)] md:text-[12px]">
                      <WT red="Example batch" white="Example lot" />
                    </p>
                    <p className={`${s.display} mt-1 whitespace-nowrap text-[clamp(1.1rem,5vw,1.6rem)] tracking-[-0.05em]`}>
                      <WT red={RED.record[0].value} white={WHITE.record[0].value} />
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--o-muted)] md:text-[12px]">
                      <WT red="Red sandalwood" white="White sandalwood" />
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* record rows following the curve of the seal (stacked on smaller screens) */}
            <dl className="mt-10 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] lg:hidden">
              {ROWS.map((r, i) => (
                <div key={i} className="flex justify-between gap-6 py-3">
                  <dt className="text-[13px] text-[var(--o-muted)]">
                    <W red={r.red.label} white={r.white.label} />
                  </dt>
                  <dd className={`${s.syne} text-right text-[16px] font-bold`}>
                    <W red={r.red.value} white={r.white.value} />
                  </dd>
                </div>
              ))}
            </dl>
            <dl className="hidden lg:block">
              {ROWS.map((r, i) => {
                const deg = -52 + (i * 104) / (n - 1);
                const a = (deg * Math.PI) / 180;
                const R = 210;
                const cx = 210;
                const cy = 300;
                const x0 = Math.round(cx + Math.cos(a) * (R + 10));
                const y0 = Math.round(cy + Math.sin(a) * (R + 10));
                const x1 = Math.round(cx + Math.cos(a) * (R + 58));
                const y1 = Math.round(cy + Math.sin(a) * (R + 58));
                return (
                  <div key={i}>
                    <svg className="pointer-events-none absolute left-0 top-0 overflow-visible" width="1" height="1" aria-hidden>
                      <line x1={x0} y1={y0} x2={x1} y2={y1} stroke="var(--o-ink)" strokeWidth="1" />
                      <circle cx={x0} cy={y0} r="3" fill="var(--m-accent)" />
                    </svg>
                    <div className="absolute flex -translate-y-1/2 items-baseline gap-4" style={{ left: x1 + 14, top: y1 }}>
                      <dt className="w-[84px] shrink-0 text-[13px] text-[var(--o-muted)]">
                        <W red={r.red.label} white={r.white.label} />
                      </dt>
                      <dd className={`${s.syne} whitespace-nowrap text-[clamp(1rem,1.3vw,1.2rem)] font-bold tracking-[-0.02em]`}>
                        <W red={r.red.value} white={r.white.value} />
                      </dd>
                    </div>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
