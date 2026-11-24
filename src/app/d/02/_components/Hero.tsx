"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import dynamic from "next/dynamic";
import { Component, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR, type Family } from "@/lib/catalog";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { DetailCard } from "./DetailCard";
import { EASE, LEVEL_LINE, firstShot, splitName } from "./copy";
import type { RingItem, RingState } from "./RingScene";
import { clamp } from "./store";
import { ArrowIcon, Swatch } from "./ui";
import { s } from "./cls";

const RingScene = dynamic(() => import("./RingScene"), { ssr: false });

/** Scroll distance (px) that turns the ring by one disc while the hero is pinned. */
const stepPx = () => clamp(window.innerHeight * 0.12, 90, 130);
const STEP_CSS = "clamp(90px, 12vh, 130px)";

class CanvasBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Short names sit on one line; longer ones break into two balanced lines. Size follows the longest line. */
function layoutName(text: string) {
  const words = text.split(" ");
  if (text.length <= 12 || words.length < 2) return [words];
  let best = 1;
  let bestMax = Infinity;
  for (let i = 1; i < words.length; i++) {
    const m = Math.max(words.slice(0, i).join(" ").length, words.slice(i).join(" ").length);
    if (m < bestMax) {
      bestMax = m;
      best = i;
    }
  }
  return [words.slice(0, best), words.slice(best)];
}

function NameLine({ text, sub, reduced }: { text: string; sub?: string; reduced: boolean }) {
  const lines = layoutName(text);
  const longest = Math.max(...lines.map((l) => l.join(" ").length));
  const longestWord = Math.max(...text.split(" ").map((w) => w.length));
  const fsD = `min(${lines.length > 1 ? 7.4 : 10.6}vw, ${(84 / (longest * 0.86)).toFixed(2)}vw, ${lines.length > 1 ? 9 : 12}rem, ${lines.length > 1 ? 13 : 19}svh)`;
  const fsM = `min(17vw, ${(90 / (longestWord * 0.86)).toFixed(2)}vw)`;
  const flat = lines.flat();
  const starts = flat.map((_, i) => flat.slice(0, i).join("").length);
  const lineStart = lines.map((_, li) => lines.slice(0, li).flat().length);
  return (
    <motion.div className="flex flex-col items-center [grid-area:1/1]" initial="in" animate="show" exit="out">
      <p
        className={`${s.display} text-center text-[length:var(--fs-m)] text-[var(--o-ink)] md:text-[length:var(--fs-d)]`}
        style={{ "--fs-d": fsD, "--fs-m": fsM } as React.CSSProperties}
      >
        {lines.map((line, li) => (
          <span key={li} className="flex flex-wrap justify-center gap-x-[0.2em]">
            {line.map((w, wj) => {
              const k = lineStart[li] + wj;
              return (
                <span key={k} className="-mb-[0.12em] inline-flex overflow-hidden pb-[0.12em]">
                  {[...w].map((ch, ci) => (
                    <motion.span
                      key={ci}
                      className="inline-block"
                      variants={
                        reduced
                          ? { in: { opacity: 0 }, show: { opacity: 1 }, out: { opacity: 0 } }
                          : {
                              in: { y: "108%" },
                              show: { y: "0%", transition: { duration: 0.7, ease: EASE, delay: (starts[k] + ci) * 0.022 } },
                              out: { y: "-108%", transition: { duration: 0.38, ease: EASE, delay: (starts[k] + ci) * 0.01 } },
                            }
                      }
                    >
                      {ch}
                    </motion.span>
                  ))}
                </span>
              );
            })}
          </span>
        ))}
      </p>
      {sub && (
        <motion.p
          className={`${s.syne} mt-3 rounded-full bg-[var(--o-bg)]/80 px-3 text-[clamp(1rem,1.5vw,1.3rem)] font-semibold text-[var(--o-ink-2)]`}
          variants={{ in: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0, transition: { delay: 0.25 } }, out: { opacity: 0 } }}
        >
          {sub}
        </motion.p>
      )}
    </motion.div>
  );
}

function Fallback({ family, wood }: { family: Family; wood: Wood }) {
  const shot = firstShot(family, wood);
  return (
    <div className="absolute left-1/2 top-[66%] aspect-square w-[min(34vh,62vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[6px] border-[#b9563b] bg-[var(--o-floor)] shadow-[0_40px_60px_-30px_rgb(40_20_10/0.5)]">
      <Photo p={shot.photo} tone={shot.tone} sizes="40vh" priority />
    </div>
  );
}

export function Hero() {
  const wood = useWood();
  const reduced = !!useReducedMotion();
  const list = useMemo(() => FAMILIES.filter((f) => f.variants[wood]), [wood]);
  const items = useMemo<RingItem[]>(
    () =>
      list.map((f) => {
        const shot = f.variants[wood]!.shots[0];
        return { slug: f.slug, photo: shot.photo.id, tone: shot.tone };
      }),
    [list, wood],
  );
  const ringRef = useRef<RingState>({ rot: 0, target: 0, vel: 0, dragging: false, dragged: false, hover: -1, open: false });
  const prevList = useRef(list);
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const drag = useRef({ id: -1, x0: 0, rot0: 0, lastX: 0, lastT: 0, v: 0, active: false });
  const snapTimer = useRef(0);

  const [activeSlug, setActiveSlug] = useState(list[0].slug);
  const [open, setOpen] = useState(false);
  const [running, setRunning] = useState(true);

  const n = list.length;
  const found = list.findIndex((f) => f.slug === activeSlug);
  const idx = found < 0 ? 0 : found;
  const family = list[idx];
  const [name, sub] = splitName(family.name);

  // Switching wood changes which pieces are in the ring; keep the same piece at the front.
  useLayoutEffect(() => {
    const prev = prevList.current;
    if (prev === list) return;
    prevList.current = list;
    const st = ringRef.current;
    const oldFront = ((Math.round(st.rot) % prev.length) + prev.length) % prev.length;
    let ni = list.findIndex((f) => f.slug === prev[oldFront].slug);
    if (ni < 0) ni = Math.min(oldFront, list.length - 1);
    st.rot = ni;
    st.target = ni;
    st.vel = 0;
  }, [list]);

  const onActive = useCallback((slug: string) => setActiveSlug(slug), []);

  const snapSoon = useCallback(() => {
    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => {
      ringRef.current.target = Math.round(ringRef.current.target);
    }, 140);
  }, []);

  const turn = useCallback((by: number) => {
    const st = ringRef.current;
    st.target = Math.round(st.target) + by;
  }, []);

  const openCard = useCallback(() => {
    const st = ringRef.current;
    st.target = Math.round(st.rot);
    st.open = true;
    setOpen(true);
  }, []);

  const closeCard = useCallback(() => {
    ringRef.current.open = false;
    setOpen(false);
    window.setTimeout(() => openBtnRef.current?.focus({ preventScroll: true }), 60);
  }, []);

  // Pause the canvas when the hero is off-screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // While the hero is pinned, page scroll turns the ring (one disc per step), then lets go.
  useEffect(() => {
    let last: number | null = null;
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const sp = clamp(-el.getBoundingClientRect().top / stepPx(), 0, n);
      if (last !== null && sp !== last && !ringRef.current.open && !ringRef.current.dragging) {
        ringRef.current.target += sp - last;
        snapSoon();
      }
      last = sp;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [n, snapSoon]);

  // Sideways wheel / trackpad swipes over the ring turn it too.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) && Math.abs(e.deltaX) > 1.5) {
        e.preventDefault();
        ringRef.current.target += e.deltaX / 220;
        snapSoon();
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [snapSoon]);

  // Arrow keys turn the ring while it is on screen.
  useEffect(() => {
    if (!running || open) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        turn(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        turn(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [running, open, turn]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || open) return;
    drag.current = { id: e.pointerId, x0: e.clientX, rot0: ringRef.current.rot, lastX: e.clientX, lastT: e.timeStamp, v: 0, active: false };
    ringRef.current.dragged = false;
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const per = window.innerWidth < 768 ? 120 : 190;
    if (!d.active && Math.abs(dx) > 6) {
      d.active = true;
      ringRef.current.dragging = true;
      ringRef.current.dragged = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (!d.active) return;
    ringRef.current.rot = d.rot0 - dx / per;
    const dt = (e.timeStamp - d.lastT) / 1000;
    if (dt > 0.001) {
      const inst = -(e.clientX - d.lastX) / per / dt;
      d.v = d.v * 0.65 + inst * 0.35;
      d.lastX = e.clientX;
      d.lastT = e.timeStamp;
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (d.id !== e.pointerId) return;
    d.id = -1;
    if (!d.active) return;
    const st = ringRef.current;
    st.dragging = false;
    st.vel = reduced ? 0 : clamp(d.v, -14, 14);
    st.target = Math.round(st.rot + st.vel * 0.26);
  };

  return (
    <section
      id="ring"
      ref={sectionRef}
      aria-roledescription="carousel"
      aria-label="The collection, as a ring of wooden discs"
      className="relative"
      style={{ height: `calc(100svh + ${n} * ${STEP_CSS})` }}
    >
      <h1 className="sr-only">Santalum Maison: objects, jewellery and gifts in red and white sandalwood</h1>
      <div className="sticky top-0 h-svh min-h-[560px] overflow-hidden">
        <div aria-hidden className={`pointer-events-none absolute inset-0 ${s.floor}`} />

        {/* giant name, behind the ring */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[66%] grid place-items-end justify-items-center px-4 md:bottom-[70.5%]"
          animate={{ opacity: open ? 0 : 1, y: open ? -30 : 0 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <AnimatePresence initial={false}>
            <NameLine key={family.slug} text={name} sub={sub} reduced={reduced} />
          </AnimatePresence>
        </motion.div>

        {/* the ring */}
        <div
          ref={wrapRef}
          className="absolute inset-0 z-10 cursor-grab touch-pan-y select-none active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <CanvasBoundary fallback={<Fallback family={family} wood={wood} />}>
            <RingScene items={items} wood={wood} ringRef={ringRef} onActive={onActive} onOpen={openCard} reduced={reduced} running={running} />
          </CanvasBoundary>
        </div>

        {/* left edge: the house line, set vertically */}
        <motion.p
          className={`${s.syne} pointer-events-none absolute left-6 top-1/2 z-20 hidden origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap text-[14px] font-bold tracking-[-0.01em] text-[var(--o-ink-2)] md:left-10 md:block`}
          animate={{ opacity: open ? 0 : 1 }}
        >
          Objects time cannot repeat
        </motion.p>

        {/* bottom: what the front piece is, what it costs, open it */}
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-20 px-5 pb-[84px] md:px-10 md:pb-8"
          animate={{ opacity: open ? 0 : 1, y: open ? 24 : 0 }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          <div className="flex items-end justify-between gap-4">
            <div className="pointer-events-auto mb-[52px] hidden w-[300px] lg:block">
              <p className="text-[13px] text-[var(--o-muted)]">{LEVEL_LINE[family.level]}</p>
              <p className="mt-1 text-[15px] leading-snug text-[var(--o-ink-2)]">{family.summary}</p>
            </div>

            <div className="pointer-events-auto mx-auto flex items-center gap-2 sm:gap-3 md:gap-4 lg:mx-0">
              <div className="flex items-center gap-1 rounded-full border border-[var(--o-line)] bg-white/80 p-1 backdrop-blur-sm">
                {(["red", "white"] as Wood[]).map((w) => {
                  const v = family.variants[w];
                  const on = w === wood;
                  return (
                    <button
                      key={w}
                      type="button"
                      disabled={!v || on}
                      onClick={() => switchWood(w)}
                      aria-label={v ? `${w === "red" ? "Red" : "White"} sandalwood, ${formatINR(v.price)}` : `Not made in ${w} sandalwood`}
                      className={`flex items-center gap-1.5 rounded-full py-1.5 pl-1.5 pr-3 text-[12px] transition-colors duration-300 sm:gap-2 md:pr-4 md:text-[14px] ${
                        on ? "bg-[var(--o-ink)] text-white" : "text-[var(--o-ink)] enabled:hover:bg-[var(--o-floor)] disabled:opacity-50"
                      }`}
                    >
                      <Swatch wood={w} className="size-5 md:size-6" />
                      <span className="font-semibold">{w === "red" ? "Red" : "White"}</span>
                      <span className="tabular-nums">{v ? formatINR(v.price) : "not made"}</span>
                    </button>
                  );
                })}
              </div>
              <button
                ref={openBtnRef}
                type="button"
                onClick={openCard}
                className={`${s.syne} group relative grid size-[64px] shrink-0 place-items-center rounded-full bg-[var(--o-ink)] text-[16px] font-bold text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.06] active:scale-95 md:size-[96px] md:text-[18px]`}
              >
                <span aria-hidden className="absolute inset-0 rounded-full border border-[var(--m-accent)] opacity-0 transition-[transform,opacity] duration-500 group-hover:scale-[1.22] group-hover:opacity-100" />
                Open
                <span className="sr-only"> {family.name}</span>
              </button>
            </div>

            <div className="pointer-events-auto hidden items-center gap-3 md:flex">
              <button
                type="button"
                onClick={() => turn(-1)}
                aria-label="Previous piece"
                className="grid size-12 place-items-center rounded-full border border-[var(--o-line)] bg-white/70 transition-colors hover:border-[var(--o-ink)] active:scale-95"
              >
                <ArrowIcon dir="left" />
              </button>
              <Counter i={idx} n={n} />
              <button
                type="button"
                onClick={() => turn(1)}
                aria-label="Next piece"
                className="grid size-12 place-items-center rounded-full border border-[var(--o-line)] bg-white/70 transition-colors hover:border-[var(--o-ink)] active:scale-95"
              >
                <ArrowIcon />
              </button>
            </div>
          </div>
          <p className="pointer-events-none mt-3 text-center text-[12px] text-[var(--o-muted)] md:absolute md:bottom-[132px] md:right-10 md:mt-0 md:text-right">
            <span className="md:hidden">Swipe sideways or scroll to turn the ring</span>
            <span className="hidden md:inline">Drag, scroll or use the arrow keys to turn the ring</span>
          </p>
        </motion.div>

        <p className="sr-only" aria-live="polite">
          {family.name}, {idx + 1} of {n}
        </p>
      </div>

      <AnimatePresence>{open && <DetailCard key="card" family={family} onClose={closeCard} reduced={reduced} />}</AnimatePresence>
    </section>
  );
}

function Counter({ i, n }: { i: number; n: number }) {
  const C = 2 * Math.PI * 26;
  return (
    <div className="relative grid size-[64px] place-items-center">
      <svg viewBox="0 0 64 64" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--o-line)" strokeWidth="2" />
        <circle
          cx="32"
          cy="32"
          r="26"
          fill="none"
          stroke="var(--m-accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - (i + 1) / n)}
          style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <span className="text-[13px] font-semibold tabular-nums">
        {String(i + 1).padStart(2, "0")}
        <span className="text-[var(--o-muted)]">/{n}</span>
      </span>
    </div>
  );
}
