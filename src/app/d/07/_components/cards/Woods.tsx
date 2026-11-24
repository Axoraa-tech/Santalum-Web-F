"use client";

import { animate, motion, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react";
import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { EASE, inWood, scrollToCard } from "../store";

const SPECS: Record<Wood, { line: string; rows: [string, string][] }> = {
  red: {
    line: "Dense, deep red and almost without scent. Its colour is the point, and it deepens with handling.",
    rows: [
      ["Grows", "Eastern Ghats, mainly Andhra Pradesh"],
      ["Colour", "Deep red, darkening towards the core"],
      ["Scent", "Almost none"],
      ["Grain", "Dense and fine"],
      ["Trade", "Regulated under CITES Appendix II"],
    ],
  },
  white: {
    line: "Pale gold and fragrant. The scent lives in the oil of the heartwood, and stays for years.",
    rows: [
      ["Grows", "Dry forests of southern India"],
      ["Colour", "Pale gold, darker at the heart"],
      ["Scent", "Warm and lasting, strongest in the heartwood"],
      ["Craft centre", "Mysuru, Karnataka"],
      ["Oil", "Only white sandalwood carries it"],
    ],
  },
};

const REST: Record<Wood, number> = { red: 0.64, white: 0.36 };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const currentWood = (): Wood => (document.documentElement.dataset.wood === "white" ? "white" : "red");

/** Card 2: a before/after wipe between the two woods. Past the middle, the whole house switches wood. */
export function Woods() {
  const wood = useWood();
  const reduce = useReducedMotion();
  const x = useMotionValue(REST.red);
  const [pct, setPct] = useState(64);
  const area = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const mounted = useRef(false);

  useMotionValueEvent(x, "change", (v) => setPct(Math.round(v * 100)));

  // The wood was changed elsewhere (the dock): move the line to that side.
  useEffect(() => {
    if (dragging.current) return;
    const side: Wood = x.get() >= 0.5 ? "red" : "white";
    if (!mounted.current) {
      mounted.current = true;
      if (side !== wood) x.jump(REST[wood]);
      return;
    }
    if (side !== wood) animate(x, REST[wood], reduce ? { duration: 0 } : { type: "spring", stiffness: 140, damping: 22 });
  }, [wood, x, reduce]);

  const setFrom = (v: number) => {
    const next = clamp(v, 0.03, 0.97);
    x.set(next);
    const cur = currentWood();
    if (next > 0.53 && cur !== "red") switchWood("red");
    else if (next < 0.47 && cur !== "white") switchWood("white");
  };
  const fromPointer = (clientX: number) => {
    const el = area.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setFrom((clientX - r.left) / r.width);
  };

  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    fromPointer(e.clientX);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging.current) fromPointer(e.clientX);
  };
  const onUp = () => {
    dragging.current = false;
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 0.15 : 0.05;
    let v = x.get();
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") v -= step;
    else if (e.key === "ArrowRight" || e.key === "ArrowUp") v += step;
    else if (e.key === "Home") v = 0;
    else if (e.key === "End") v = 1;
    else return;
    e.preventDefault();
    setFrom(v);
  };

  const clip = useTransform(x, (v) => `inset(0 ${(1 - v) * 100}% 0 0)`);
  const left = useTransform(x, (v) => `${v * 100}%`);
  const side: Wood = pct >= 50 ? "red" : "white";

  return (
    <div className="grid min-h-[inherit] gap-6 p-3 pb-[150px] md:p-4 md:pb-[150px] lg:grid-cols-12 lg:gap-8 lg:p-4 lg:pb-[84px]">
      {/* the wipe */}
      <div
        ref={area}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="s7-grab relative h-[58svh] touch-pan-y overflow-hidden rounded-[22px] md:h-[62svh] md:rounded-[30px] lg:col-span-7 lg:h-auto lg:rounded-[36px]"
      >
        <div className="absolute inset-0">
          <Photo p={PHOTOS.whiteLog} sizes="(min-width: 1024px) 56vw, 100vw" />
        </div>
        <motion.div className="absolute inset-0" style={{ clipPath: clip }}>
          <Photo p={PHOTOS.redGrain} sizes="(min-width: 1024px) 56vw, 100vw" />
        </motion.div>

        <span
          className={`absolute left-4 top-4 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
            side === "red" ? "bg-white text-[#1B1712]" : "bg-[#1B1712]/55 text-white"
          }`}
        >
          Red sandalwood
        </span>
        <span
          className={`absolute right-4 top-4 rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-300 ${
            side === "white" ? "bg-white text-[#1B1712]" : "bg-[#1B1712]/55 text-white"
          }`}
        >
          White sandalwood
        </span>

        <motion.div className="absolute inset-y-0 w-0" style={{ left }}>
          <span aria-hidden className="absolute inset-y-0 left-[-1px] w-[2px] bg-white/90 shadow-[0_0_0_1px_rgba(27,23,18,0.08)]" />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare red and white sandalwood"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={pct}
            aria-valuetext={`${pct}% red sandalwood, ${100 - pct}% white sandalwood`}
            onKeyDown={onKey}
            className="absolute left-0 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B1712] shadow-[0_12px_30px_-10px_rgba(27,23,18,0.55)] transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-0.5">
              <IconArrow dir="left" width={16} height={16} />
              <IconArrow width={16} height={16} />
            </span>
          </div>
        </motion.div>

        <div className="num absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#1B1712]/80 py-2 pl-4 pr-2 text-[13px] text-white md:gap-3">
          <span>{pct}% red</span>
          <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-white/25 md:w-20">
            <span className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${pct}%` }} />
          </span>
          <span className="rounded-full bg-white/15 px-2 py-0.5">{100 - pct}% white</span>
        </div>
      </div>

      {/* live specs */}
      <div className="flex flex-col px-2 md:px-4 lg:col-span-5 lg:px-0 lg:pr-6 lg:pt-5">
        <h2 className="d1 text-[clamp(3.4rem,min(6.4vw,11vh),6.8rem)]">Two woods</h2>
        <p className="mt-4 max-w-[42ch] text-[16px] leading-relaxed text-[#77706A]">
          Drag the line across the photograph. Past the middle, the whole house changes wood: the photographs, the pieces and
          their prices.
        </p>
        <div className="mt-8 grid lg:mt-auto lg:pt-6">
          {(["red", "white"] as const).map((w) => (
            <Spec key={w} wood={w} on={side === w} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Spec({ wood, on }: { wood: Wood; on: boolean }) {
  const n = WOOD_NAMES[wood];
  const fams = inWood(wood);
  const from = Math.min(...fams.map((f) => f.variants[wood]!.price));
  return (
    <motion.div
      aria-hidden={!on}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 14 }}
      transition={{ duration: 0.5, ease: EASE }}
      className={`[grid-area:1/1] ${on ? "" : "pointer-events-none"}`}
    >
      <p className="d2 text-[clamp(2.4rem,min(4.2vw,7vh),4.4rem)]">{n.common}</p>
      <p className="mt-2 text-[15px]">
        {n.latin}
        <span className="ml-3 text-[#77706A]" lang="sa">
          {n.sa}
        </span>
      </p>
      <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed">{SPECS[wood].line}</p>
      <dl className="mt-5 border-t border-[#1B1712]/12 text-[14.5px]">
        {[...SPECS[wood].rows, ["We make", `${fams.length} pieces, from ${formatINR(from)}`] as [string, string]].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[112px_1fr] gap-3 border-b border-[#1B1712]/12 py-2.5">
            <dt className="text-[#77706A]">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <button
        type="button"
        tabIndex={on ? 0 : -1}
        onClick={() => scrollToCard("pieces")}
        className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-[#1B1712] pl-5 pr-2 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.98]"
      >
        See the {fams.length} pieces in {wood}
        <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
          <IconArrow width={16} height={16} />
        </span>
      </button>
    </motion.div>
  );
}
