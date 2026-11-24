"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState, type Ref } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, type Family } from "@/lib/catalog";
import { useWood, type Wood } from "@/lib/wood";
import { AddToBag, useHydrated, useMedia } from "./bits";
import { glideTo, J, ui } from "./store";
import { PLAIN, beadCount, endAtProgress, journeyKeys, layoutStrand, productProgress, sAtProgress } from "./strand-math";

const Scene = dynamic(() => import("./Scene"), { ssr: false, loading: () => null });

const EASE = [0.22, 1, 0.36, 1] as const;
const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/**
 * The strand: an 800vh pinned journey along a 3D mala. Scroll moves the camera along the cord;
 * product beads hang between the plain ones and a card slides in when one is in focus.
 */
export function Journey() {
  const wood = useWood();
  const hydrated = useHydrated();
  const mobile = useMedia("(max-width: 767px)");
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const families = useMemo(() => FAMILIES.filter((f) => f.variants[wood]), [wood]);
  const layout = useMemo(() => layoutStrand(families.length), [families.length]);
  const keys = useMemo(() => journeyKeys(layout), [layout]);

  const wrap = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const counterPre = useRef<HTMLSpanElement>(null);
  const counter = useRef<HTMLSpanElement>(null);
  const counterOf = useRef<HTMLSpanElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const marker = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLDivElement>(null);
  const threadPath = useRef<SVGPathElement>(null);
  const threadG = useRef<SVGGElement>(null);
  const knot = useRef<SVGGElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const activeRef = useRef(-1);
  const endedRef = useRef(false);
  const visibleRef = useRef(true);
  const [active, setActive] = useState(-1);
  const [ended, setEnded] = useState(false);
  const [running, setRunning] = useState(true);

  // the 3D scene and this loop read the same layout
  useEffect(() => {
    J.layout = layout;
    J.keys = keys;
    J.slugs = families.map((f) => f.slug);
  }, [layout, keys, families]);

  // pause the canvas when the strand is off screen
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting;
      setRunning(e.isIntersecting);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // one loop: scroll → focus along the cord, HUD, card, the thread from medallion to card
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let first = true;
    let threadOn = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const el = wrap.current;
      if (!el || !visibleRef.current) return;
      const r = el.getBoundingClientRect();
      const span = Math.max(1, r.height - window.innerHeight);
      J.p = Math.min(1, Math.max(0, -r.top / span));
      const target = sAtProgress(J.keys, J.p);
      const k = reduced || first ? 1 : 1 - Math.exp(-dt * 4.2);
      first = false;
      J.s += (target - J.s) * k;
      J.end += (endAtProgress(J.p) - J.end) * k;

      const isEnd = J.end > 0.55;
      if (counterPre.current) counterPre.current.textContent = isEnd ? "the" : "bead";
      if (counter.current) counter.current.textContent = isEnd ? "guru" : String(beadCount(J.layout, J.s)).padStart(3, "0");
      if (counterOf.current) counterOf.current.textContent = isEnd ? "bead" : `of ${PLAIN}`;
      if (fill.current) fill.current.style.transform = `scaleY(${J.p.toFixed(4)})`;
      if (marker.current) marker.current.style.transform = `translateY(${(J.p * 100).toFixed(3)}cqh)`;
      if (hero.current) {
        const h = smoothstep(0.004, 0.034, J.p);
        hero.current.style.opacity = String(1 - h);
        hero.current.style.transform = `translate3d(0, ${(-h * 40).toFixed(1)}px, 0)`;
        hero.current.style.visibility = h >= 1 ? "hidden" : "visible";
      }

      let a = -1;
      J.layout.products.forEach((s, i) => {
        if (Math.abs(s - J.s) < 2.6) a = i;
      });
      if (J.end > 0.35) a = -1;
      if (a !== activeRef.current) {
        activeRef.current = a;
        setActive(a);
      }
      if (isEnd !== endedRef.current) {
        endedRef.current = isEnd;
        setEnded(isEnd);
      }

      // a brass thread from the medallion's ring to the card
      const path = threadPath.current;
      const c = card.current;
      if (path) {
        if (J.anchor.on && c && a >= 0) {
          const cr = c.getBoundingClientRect();
          const sr = stage.current?.getBoundingClientRect();
          const ox = sr ? sr.left : 0;
          const oy = sr ? sr.top : 0;
          const ax = J.anchor.x;
          const ay = J.anchor.y;
          const narrow = window.innerWidth < 768;
          const bx = narrow ? cr.left + cr.width / 2 - ox : cr.left - ox;
          const by = narrow ? cr.top - oy : cr.top + Math.min(cr.height * 0.5, cr.width * 0.5 + 40) - oy;
          const inside = ax > -40 && ax < window.innerWidth + 40 && ay > -40 && ay < window.innerHeight + 40;
          if (inside) {
            const mx = (ax + bx) / 2;
            const my = Math.max(ay, by) + (narrow ? 30 : 60);
            path.setAttribute("d", `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`);
            knot.current?.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
          }
          threadOn = inside ? Math.min(1, threadOn + dt * 3) : Math.max(0, threadOn - dt * 6);
        } else {
          threadOn = Math.max(0, threadOn - dt * 6);
        }
        threadG.current?.setAttribute("opacity", threadOn.toFixed(3));
      }
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const jump = (p: number) => {
    const el = wrap.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    glideTo(top + p * (el.offsetHeight - window.innerHeight) + 2);
  };

  const skip = () => {
    const w = document.getElementById("woods");
    if (w) glideTo(w.getBoundingClientRect().top + window.scrollY - 20);
  };

  const f = active >= 0 ? families[active] : null;

  return (
    <section ref={wrap} id="strand" aria-label="The strand: every piece, bead by bead" className="relative h-[800vh]">
      <div ref={stage} className="sticky top-0 h-svh w-full overflow-hidden">
        {/* 3D */}
        <div className="absolute inset-0" aria-hidden>
          {hydrated && <Scene wood={wood} mobile={mobile} reduced={reduced} running={running} />}
        </div>

        {/* thread from the medallion to the card */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <g ref={threadG} opacity="0">
            <path ref={threadPath} d="M0 0" fill="none" stroke="var(--thread)" strokeWidth="1.25" />
            <g ref={knot}>
              <circle r="4.5" fill="#94713f" />
            </g>
          </g>
        </svg>

        {/* name and price under each medallion, placed by the 3D engine */}
        <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
          {FAMILIES.map((fam, i) => {
            const v = fam.variants[wood];
            return (
              <div
                key={fam.slug}
                ref={(node) => {
                  J.labelEls[i] = node;
                }}
                className="s3-tag absolute left-0 top-0"
                style={{ opacity: 0 }}
              >
                <span className="s3-tag-name">{fam.name}</span>
                {v && <span className="s3-tag-price">{formatINR(v.price)}</span>}
              </div>
            );
          })}
        </div>

        {/* opening copy */}
        <div
          ref={hero}
          className="s3-hero-veil pointer-events-none absolute inset-x-0 bottom-0 px-4 pb-[104px] pt-24 md:left-0 md:right-auto md:w-[min(760px,58vw)] md:pb-[112px] md:pl-[max(32px,4.2vw)] md:pr-0"
        >
          <h1 className="s3-serif text-[clamp(3.1rem,7.2vw,7.4rem)] leading-[0.9] tracking-[-0.015em]">
            Objects time
            <br />
            cannot repeat
          </h1>
          <p className="mt-6 max-w-[30rem] text-[16px] leading-[1.6] text-(--ink)/80 md:text-[17px]">
            Red and white sandalwood, turned and carved by hand in India. Scroll along the strand: one hundred and eight beads,
            and every piece we make hangs between them.
          </p>
          <div className="pointer-events-auto mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="flex items-center gap-3 text-[14px] text-(--muted)">
              <span className="s3-cue" aria-hidden>
                <span className="s3-bead" />
              </span>
              Scroll to move along the strand
            </span>
            <button type="button" onClick={skip} className="s3-link text-[14px]">
              Skip to the two woods
            </button>
          </div>
        </div>

        {/* bead counter */}
        <p
          className="pointer-events-none absolute right-12 top-[84px] flex items-baseline gap-2 text-right md:bottom-9 md:right-16 md:top-auto"
          aria-hidden
        >
          <span ref={counterPre} className="text-[13px] text-(--muted)">
            bead
          </span>
          <span ref={counter} className="s3-serif text-[34px] leading-none tabular-nums md:text-[64px]">
            001
          </span>
          <span ref={counterOf} className="text-[13px] text-(--muted)">
            of {PLAIN}
          </span>
        </p>

        {/* progress thread at the right edge; each knot jumps to a piece */}
        <nav aria-label="Pieces on the strand" className="absolute bottom-[150px] right-3 top-[132px] w-6 md:bottom-[140px] md:right-5 md:top-[110px]">
          <div className="s3-rail absolute inset-0 [container-type:size]">
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-(--ink)/15" />
            <div ref={fill} className="absolute left-1/2 top-0 h-full w-px origin-top -translate-x-1/2 scale-y-0 bg-(--thread)" />
            <div ref={marker} className="absolute left-1/2 top-0 h-0 w-0">
              <span className="s3-bead absolute -left-[6px] -top-[6px] h-3 w-3" />
            </div>
            {families.map((fam, i) => {
              const p = productProgress(i, families.length);
              return (
                <button
                  key={fam.slug}
                  type="button"
                  onClick={() => jump(p)}
                  className="s3-rail-knot group absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                  style={{ top: `${p * 100}%` }}
                  aria-label={`Go to ${fam.name}`}
                >
                  <span className="s3-rail-dot" />
                  <span className="s3-rail-tip">{fam.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* the piece in focus */}
        <AnimatePresence mode="wait">
          {f && (
            <PieceCard key={f.slug} ref={card} family={f} wood={wood} index={active} total={families.length} mobile={mobile} />
          )}
        </AnimatePresence>

        {/* the closing line */}
        <AnimatePresence>
          {ended && (
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="absolute inset-x-4 bottom-[88px] text-center md:inset-x-auto md:bottom-auto md:left-[max(32px,5vw)] md:top-1/2 md:max-w-[30rem] md:-translate-y-1/2 md:text-left"
            >
              <p className="s3-serif text-[clamp(1.75rem,3.3vw,3.2rem)] leading-[1.04]">
                A mala has 108 beads and one guru bead. We turn every one by hand.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3 md:justify-start">
                <button type="button" className="s3-btn s3-btn-dark" onClick={() => ui.openProduct("japa-mala")}>
                  <span className="s3-bead s3-btn-bead" aria-hidden />
                  See the japa mala
                </button>
                <button type="button" className="s3-btn s3-btn-line" onClick={skip}>
                  Carry on down
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

function PieceCard({
  ref,
  family: f,
  wood,
  index,
  total,
  mobile,
}: {
  ref: Ref<HTMLDivElement>;
  family: Family;
  wood: Wood;
  index: number;
  total: number;
  mobile: boolean;
}) {
  const v = f.variants[wood]!;
  const shot = v.shots[0];
  const cat = CATEGORIES.find((c) => c.key === f.category)?.label;
  if (mobile) {
    return (
      <motion.div
        ref={ref}
        initial={{ y: "120%" }}
        animate={{ y: 0 }}
        exit={{ y: "120%" }}
        transition={{ type: "spring", stiffness: 260, damping: 30 }}
        className="absolute inset-x-3 bottom-[80px] z-10 rounded-[28px] border border-(--line) bg-(--warm) p-3 shadow-[0_18px_40px_-24px_rgba(34,24,15,0.5)]"
        role="group"
        aria-label={f.name}
      >
        <div className="flex items-center gap-3">
          <div className="relative h-[76px] w-[76px] shrink-0 overflow-hidden rounded-full">
            <Photo p={shot.photo} tone={shot.tone} sizes="76px" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] text-(--muted)">
              {index + 1} of {total} on the strand
            </p>
            <h2 className="s3-serif truncate text-[24px] leading-[1.05]">{f.name}</h2>
            <p className="mt-0.5 text-[15px]">{formatINR(v.price)}</p>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_auto] gap-2">
          <AddToBag slug={f.slug} wood={wood} className="w-full justify-center" />
          <button type="button" className="s3-btn s3-btn-line" onClick={() => ui.openProduct(f.slug)}>
            View
          </button>
        </div>
      </motion.div>
    );
  }
  return (
    <motion.div
      ref={ref}
      initial={{ x: "calc(100% + 120px)" }}
      animate={{ x: 0 }}
      exit={{ x: "calc(100% + 120px)" }}
      transition={{ type: "spring", stiffness: 210, damping: 28 }}
      className="absolute right-[72px] top-1/2 z-10 w-[min(372px,30vw)] -translate-y-1/2 lg:right-[88px]"
      role="group"
      aria-label={f.name}
    >
      <div className="s3-piece">
        <button type="button" className="s3-piece-photo" onClick={() => ui.openProduct(f.slug)} aria-label={`View ${f.name}`}>
          <Photo p={shot.photo} tone={shot.tone} sizes="372px" />
        </button>
        <div className="px-7 pb-7 pt-6">
          <p className="text-[13px] text-(--muted)">
            {cat}, {index + 1} of {total} on the strand
          </p>
          <h2 className="s3-serif mt-2 text-[clamp(1.9rem,2.5vw,2.5rem)] leading-[1]">{f.name}</h2>
          <p className="mt-3 text-[15px] leading-[1.55] text-(--ink)/80">{v.note}</p>
          <div className="mt-5 flex items-baseline justify-between gap-3 border-t border-(--line) pt-4">
            <span className="s3-serif text-[26px] leading-none">{formatINR(v.price)}</span>
            {f.edition && <span className="text-[13px] text-(--muted)">{f.edition}</span>}
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
            <AddToBag slug={f.slug} wood={wood} className="w-full justify-center" />
            <button type="button" className="s3-btn s3-btn-line" onClick={() => ui.openProduct(f.slug)}>
              View
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
