"use client";

import { animate, useMotionValue, useMotionValueEvent, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { Photo } from "@/components/Photo";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, priceRange, productsFor } from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { IconArrow } from "../Icons";
import { SHOP, WOODS } from "../store";

const SPEC: Record<Wood, { title: string; text: string; line: string; facts: string[] }> = {
  red: {
    title: "A different tree",
    text: "Red sandalwood shares a name with the sandalwood of perfume and very little else. Drag the line to white and the whole house changes with it: the colours, the words and the pieces.",
    line: "Dense, deep red and almost without scent. The colour is the point, and it darkens with handling.",
    facts: ["Grows in", "Colour", "Scent", "In the hand", "Used for"],
  },
  white: {
    title: "The temple wood",
    text: "White sandalwood is the one in the temple, the attar bottle and the Mysuru fan. Drag the line to red and the whole house changes with it: the colours, the words and the pieces.",
    line: "Pale gold and fragrant. The scent sits in the oil of the heartwood and stays for years.",
    facts: ["Grows in", "Colour", "Scent", "Oil", "Used for"],
  },
};

const REST: Record<Wood, number> = { red: 0.64, white: 0.36 };
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const currentWood = (): Wood => (document.documentElement.dataset.wood === "white" ? "white" : "red");

/**
 * Card 2: a before/after wipe between the two woods. Past the middle, the whole house switches wood.
 * The line's position lives in a CSS variable, so a reload in white shows it on the white side before hydration.
 */
export function Woods() {
  const wood = useWood();
  const reduce = useReducedMotion();
  const x = useMotionValue(REST.red);
  const [pct, setPct] = useState<number | null>(null);
  const area = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const mounted = useRef(false);

  useMotionValueEvent(x, "change", (v) => {
    area.current?.style.setProperty("--w", String(v));
    setPct(Math.round(v * 100));
  });

  // First mount: put the line on the current wood's side. Later: the wood changed elsewhere, move the line there.
  useEffect(() => {
    if (dragging.current) return;
    if (!mounted.current) {
      mounted.current = true;
      x.jump(REST[wood]);
      area.current?.style.setProperty("--w", String(REST[wood]));
      return;
    }
    const side: Wood = x.get() >= 0.5 ? "red" : "white";
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

  const now = pct ?? Math.round(REST[wood] * 100);
  const readout = (n: number) => (
    <>
      <span>{n}% red</span>
      <span className="relative h-1.5 w-12 overflow-hidden rounded-full bg-white/25 md:w-20">
        <span className="absolute inset-y-0 left-0 rounded-full bg-white" style={{ width: `${n}%` }} />
      </span>
      <span className="rounded-full bg-white/15 px-2 py-0.5">{100 - n}% white</span>
    </>
  );

  return (
    <div className="grid min-h-[inherit] gap-6 p-3 pb-[150px] md:p-4 md:pb-[150px] lg:grid-cols-12 lg:gap-8 lg:p-4 lg:pb-[84px]">
      {/* the wipe */}
      <div
        ref={area}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        className="s7-wipe s7-grab relative h-[58svh] touch-pan-y overflow-hidden rounded-[22px] md:h-[62svh] md:rounded-[30px] lg:col-span-7 lg:h-auto lg:rounded-[36px]"
      >
        <div className="absolute inset-0">
          <Photo p={PHOTOS.whiteLog} sizes="(min-width: 1024px) 56vw, 100vw" />
        </div>
        <div className="absolute inset-0" style={{ clipPath: "inset(0 calc((1 - var(--w)) * 100%) 0 0)" }}>
          <Photo p={PHOTOS.redGrain} sizes="(min-width: 1024px) 56vw, 100vw" />
        </div>

        {WOODS.map((w) => (
          <span
            key={w}
            className={`absolute top-4 rounded-[16px] px-3.5 py-2 text-[13px] font-medium leading-tight transition-colors duration-300 ${
              w === "red" ? "left-4" : "right-4 text-right"
            } ${w === "red" ? "s7-lab-red" : "s7-lab-white"}`}
          >
            {CONTENT[w].name}
            <span className="block text-[12px] font-normal opacity-70">{CONTENT[w].localName}</span>
          </span>
        ))}

        <div className="absolute inset-y-0 w-0" style={{ left: "calc(var(--w) * 100%)" } as CSSProperties}>
          <span aria-hidden className="absolute inset-y-0 left-[-1px] w-[2px] bg-white/90 shadow-[0_0_0_1px_rgba(27,23,18,0.08)]" />
          <div
            role="slider"
            tabIndex={0}
            aria-label="Compare red and white sandalwood"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={now}
            aria-valuetext={`${now}% red sandalwood, ${100 - now}% white sandalwood`}
            onKeyDown={onKey}
            className="absolute left-0 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-[#1B1712] shadow-[0_12px_30px_-10px_rgba(27,23,18,0.55)] transition-transform duration-300 hover:scale-105 active:scale-95"
          >
            <span className="flex items-center gap-0.5">
              <IconArrow dir="left" width={16} height={16} />
              <IconArrow width={16} height={16} />
            </span>
          </div>
        </div>

        <div className="num absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2.5 whitespace-nowrap rounded-full bg-[#1B1712]/80 py-2 pl-4 pr-2 text-[13px] text-white md:gap-3">
          {pct === null ? <WT red={readout(64)} white={readout(36)} /> : readout(pct)}
        </div>
      </div>

      {/* live specs: both woods sit in one grid cell, CSS shows the current one */}
      <div className="flex flex-col px-2 md:px-4 lg:col-span-5 lg:px-0 lg:pr-6 lg:pt-5">
        <div className="s7-cell">
          {WOODS.map((w) => (
            <div key={w} className={w === "red" ? "s7-on-red" : "s7-on-white"}>
              <h2 className="d1 text-[clamp(3.4rem,min(6.4vw,11vh),6.8rem)]">{SPEC[w].title}</h2>
              <p className="mt-4 max-w-[44ch] text-[16px] leading-relaxed text-(--s7-muted)">{SPEC[w].text}</p>
            </div>
          ))}
        </div>
        <div className="s7-cell mt-8 lg:mt-auto lg:pt-6">
          {WOODS.map((w) => (
            <Spec key={w} wood={w} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Spec({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const [lo, hi] = priceRange(wood);
  const n = productsFor(wood).length;
  const rows: [string, string][] = [
    ...SPEC[wood].facts.map((label) => [label, c.facts.find((f) => f.label === label)?.value ?? ""] as [string, string]),
    ["In the shop", `${n} pieces, ${formatINR(lo)} to ${formatINR(hi)}`],
  ];
  return (
    <div className={wood === "red" ? "s7-on-red" : "s7-on-white"}>
      <p className="d2 text-[clamp(2.4rem,min(4.2vw,7vh),4.4rem)]">{c.name}</p>
      <p className="mt-2 text-[15px]">
        <i>{c.latin}</i>
        <span className="ml-3 text-(--s7-muted)" lang="sa">
          {c.sanskrit}
        </span>
        <span className="ml-2 text-(--s7-muted)" lang="kn">
          {c.kannada}
        </span>
      </p>
      <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed">{SPEC[wood].line}</p>
      <dl className="mt-5 border-t border-(--s7-ink)/12 text-[14.5px]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[112px_1fr] gap-3 border-b border-(--s7-ink)/12 py-2.5">
            <dt className="text-(--s7-muted)">{k}</dt>
            <dd>{v}</dd>
          </div>
        ))}
      </dl>
      <Link
        href={SHOP}
        className="group mt-6 inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-ink) pl-5 pr-2 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.98]"
      >
        Shop all {n} in {wood}
        <span className="grid size-8 place-items-center rounded-full bg-white/15 transition group-hover:translate-x-0.5">
          <IconArrow width={16} height={16} />
        </span>
      </Link>
    </div>
  );
}
