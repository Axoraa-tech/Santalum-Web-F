"use client";

import { motion } from "motion/react";
import { useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct, type Product } from "@/lib/shop/products";
import { useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { Pill } from "../Pill";
import { addToBag } from "../shop/addToBag";
import { CheckIcon } from "../shop/Icons";
import { WT } from "../W";
import { WoodCanvas, type GrainParams, type Shape } from "../WoodCanvas";

const SHAPES: { key: Shape; name: string; size: string; path: string }[] = [
  { key: 0, name: "Circle", size: "34 mm across", path: "M12 3a9 9 0 1 1 0 18a9 9 0 1 1 0-18Z" },
  { key: 1, name: "Pebble", size: "36 × 31 mm", path: "M12 3.5c5 0 8.5 3 8.5 7.6c0 5.2-4 9.4-9 9.4S3.5 16.8 3.5 12.4C3.5 7.4 7 3.5 12 3.5Z" },
  { key: 2, name: "Arch", size: "38 × 26 mm", path: "M5 21V11a7 7 0 0 1 14 0v10Z" },
  { key: 3, name: "Drop", size: "40 × 28 mm", path: "M12 2.5c3 4.5 7.5 8.3 7.5 12.3a7.5 7.5 0 0 1-15 0C4.5 10.8 9 7 12 2.5Z" },
];

/** The studio carves one piece per wood: a grain pendant in red, a scented pendant in white. */
const PENDANT: Record<Wood, Product> = {
  red: getProduct("r-grain-pendant")!,
  white: getProduct("w-scented-pendant")!,
};

const START: GrainParams = { rings: 58, warp: 0.9, age: 0.3, knotX: -0.55, knotY: 0.6, shape: 1 };

function heartWhere(x: number, y: number) {
  const d = Math.hypot(x, y);
  if (d < 0.3) return "centred";
  const v = y > 0.35 ? "upper" : y < -0.35 ? "lower" : "";
  const h = x > 0.35 ? "right" : x < -0.35 ? "left" : "";
  return `${[v, h].filter(Boolean).join(" ") || "off centre"}${d > 0.75 ? ", near the edge" : ""}`;
}

function pieceNumber(p: GrainParams) {
  const n = Math.round(p.rings * 31 + p.warp * 977 + p.age * 433 + (p.knotX + 1) * 191 + (p.knotY + 1) * 73 + p.shape * 1201);
  return String(1000 + (n % 9000));
}

export function GrainStudio() {
  const wood = useWood();
  const [p, setP] = useState<GrainParams>(START);
  const set = (patch: Partial<GrainParams>) => setP((cur) => ({ ...cur, ...patch }));
  const shape = SHAPES[p.shape];
  const piece = pieceNumber(p);
  const note = `${shape.name}, ${shape.size}; rings ${Math.round(p.rings)}, flow ${p.warp.toFixed(1)}, age ${p.age.toFixed(1)}; heart ${heartWhere(p.knotX, p.knotY)}; studio piece ${piece}`;
  const btn = useRef<HTMLButtonElement>(null);
  const [added, setAdded] = useState(false);
  const add = () => {
    addToBag(btn.current, PENDANT[wood], { note });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  };

  const surprise = () =>
    setP({
      rings: 34 + Math.random() * 76,
      warp: Math.random() * 1.6,
      age: Math.random(),
      knotX: Math.random() * 2 - 1,
      knotY: Math.random() * 2 - 1,
      shape: Math.floor(Math.random() * 4) as Shape,
    });

  return (
    <section id="studio" className="scroll-mt-24 px-3 md:px-4">
      <div className="mx-auto grid max-w-[1560px] gap-10 rounded-[2.5rem] bg-(--mz-surface) p-4 md:rounded-[3.5rem] md:p-6 lg:grid-cols-[1.15fr_1fr] lg:gap-6">
        {/* the piece stays in view, beside whichever control is being set, down to "Add" */}
        <div className="relative aspect-square overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_40%,var(--mz-bg),var(--mz-surface-2))] md:rounded-[2.75rem] lg:sticky lg:top-24 lg:aspect-auto lg:h-[min(calc(100svh-7.5rem),52rem)] lg:self-start">
          <WoodCanvas mode="studio" params={p} label={`A ${shape.name.toLowerCase()} pendant in ${CONTENT[wood].name.toLowerCase()}`} className="absolute inset-0 h-full w-full" />
          <div className="absolute left-5 top-5 rounded-full bg-(--mz-bg)/80 px-3.5 py-1.5 text-[13px] tabular-nums backdrop-blur md:left-7 md:top-7">
            Piece {piece}
          </div>
          <p className="absolute bottom-5 left-5 right-5 text-[13px] text-(--mz-ink-2) md:bottom-7 md:left-7">
            <WT
              red={
                <>
                  {CONTENT.red.name}, <span className="font-display italic">{CONTENT.red.latin}</span>. Almost no scent; the figure is the point.
                </>
              }
              white={
                <>
                  {CONTENT.white.name}, <span className="font-display italic">{CONTENT.white.latin}</span>. It gives its scent as it warms on the skin.
                </>
              }
            />
          </p>
        </div>

        <div className="flex flex-col px-2 pb-4 md:px-6 lg:py-8">
          <h2 className="font-display text-[clamp(2.6rem,4.6vw,4.6rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
            <WT red="Shape the grain" white="Shape a scented pendant" />
          </h2>
          <p className="mt-5 max-w-md text-[16px] leading-relaxed text-(--mz-ink-2)">
            <WT
              red="Choose a shape and set the grain. We match your settings to a real panel of red heartwood, the darker the better, and send photographs before we carve."
              white="Choose a shape and set the grain. We match your settings to a panel of white heartwood chosen for its scent as much as its figure, and send photographs before we carve."
            />
          </p>

          <div className="mt-10 space-y-8">
            <Field label="Shape" value={`${shape.name}, ${shape.size}`}>
              <div className="flex rounded-full bg-(--mz-bg) p-1">
                {SHAPES.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => set({ shape: s.key })}
                    aria-pressed={p.shape === s.key}
                    aria-label={s.name}
                    className="relative grid h-12 flex-1 place-items-center rounded-full"
                  >
                    {p.shape === s.key && (
                      <motion.span
                        layoutId="shape-pill"
                        className="absolute inset-0 rounded-full bg-(--mz-ink)"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                      />
                    )}
                    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="relative">
                      <path
                        d={s.path}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        className={`transition-colors ${p.shape === s.key ? "text-(--mz-bg)" : "text-(--mz-ink-2)"}`}
                      />
                    </svg>
                  </button>
                ))}
              </div>
            </Field>

            <Slider label="Ring spacing" left="Wide" right="Tight" min={34} max={110} step={1} value={p.rings} onChange={(rings) => set({ rings })} />
            <Slider label="Flow" left="Straight" right="Wild" min={0} max={1.6} step={0.01} value={p.warp} onChange={(warp) => set({ warp })} />
            <Slider label="Age" left="Fresh" right="Aged" min={0} max={1} step={0.01} value={p.age} onChange={(age) => set({ age })} />

            <Field label="Where the heart sits" value="Drag the point">
              <HeartPad x={p.knotX} y={p.knotY} onChange={(knotX, knotY) => set({ knotX, knotY })} />
            </Field>
          </div>

          <div className="mt-10 space-y-3 lg:mt-auto lg:pt-10">
            <Pill ref={btn} size="lg" onClick={add} className="w-full justify-between!" aria-label={`Add this ${shape.name.toLowerCase()} pendant to your bag`}>
              <span className="flex items-center gap-2">
                {added ? (
                  <>
                    <CheckIcon /> In your bag
                  </>
                ) : (
                  <WT red="Add this grain pendant" white="Add this scented pendant" />
                )}
              </span>
              <span className="tabular-nums opacity-80">
                <WT red={formatINR(PENDANT.red.price)} white={formatINR(PENDANT.white.price)} />
              </span>
            </Pill>
            <button
              type="button"
              onClick={surprise}
              className="h-12 w-full rounded-full border border-(--mz-line) text-[15px] text-(--mz-ink-2) transition-colors hover:border-(--mz-ink)/25 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
            >
              Surprise me
            </button>
            <p className="px-2 pt-1 text-[13px] leading-snug text-(--mz-ink-3)">
              <WT
                red={`Your settings travel with the order. Silk cord, sterling silver bail, ${PENDANT.red.details[0].value}.`}
                white={`Your settings travel with the order. Silk cord, sterling silver bail, ${PENDANT.white.details[0].value}.`}
              />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ label, value, children }: { label: string; value: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between text-[14px]">
        <span className="font-medium">{label}</span>
        <span className="text-(--mz-ink-3)">{value}</span>
      </div>
      {children}
    </div>
  );
}

function Slider({
  label,
  left,
  right,
  min,
  max,
  step,
  value,
  onChange,
}: {
  label: string;
  left: string;
  right: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (v: number) => void;
}) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between text-[14px]">
        <span className="font-medium">{label}</span>
        <span className="text-(--mz-ink-3)">
          {left} to {right.toLowerCase()}
        </span>
      </div>
      <input
        type="range"
        aria-label={label}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="grain-range w-full"
        style={{ "--fill": `${fill}%` } as CSSProperties}
      />
    </div>
  );
}

/** A round pad: drag the dot to move the pith (the heart of the tree) relative to the pendant. */
function HeartPad({ x, y, onChange }: { x: number; y: number; onChange: (x: number, y: number) => void }) {
  const pad = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 && e.type !== "pointerdown") return;
    const r = pad.current!.getBoundingClientRect();
    let nx = ((e.clientX - r.left) / r.width) * 2 - 1;
    let ny = -(((e.clientY - r.top) / r.height) * 2 - 1);
    const len = Math.hypot(nx, ny);
    if (len > 1) {
      nx /= len;
      ny /= len;
    }
    onChange(nx, ny);
  };
  return (
    <div className="flex items-center gap-5">
      <div
        ref={pad}
        role="slider"
        aria-label="Heart position"
        aria-valuenow={Math.round(x * 100)}
        aria-valuetext={`${Math.round(x * 100)} across, ${Math.round(y * 100)} up`}
        tabIndex={0}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          move(e);
        }}
        onPointerMove={move}
        onKeyDown={(e) => {
          const k = 0.1;
          if (e.key === "ArrowLeft") onChange(Math.max(-1, x - k), y);
          if (e.key === "ArrowRight") onChange(Math.min(1, x + k), y);
          if (e.key === "ArrowUp") onChange(x, Math.min(1, y + k));
          if (e.key === "ArrowDown") onChange(x, Math.max(-1, y - k));
        }}
        className="relative size-28 shrink-0 cursor-grab touch-none rounded-full bg-(--mz-bg) shadow-[inset_0_0_0_1px_var(--mz-line)] outline-none focus-visible:ring-2 focus-visible:ring-(--mz-accent) active:cursor-grabbing"
      >
        {[0.33, 0.66].map((s) => (
          <span key={s} className="absolute rounded-full border border-(--mz-line)" style={{ inset: `${(1 - s) * 50}%` }} />
        ))}
        <span
          className="absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-(--mz-accent) shadow-[0_0_0_5px_var(--mz-accent-soft)] transition-[left,top] duration-75"
          style={{ left: `${50 + x * 42}%`, top: `${50 - y * 42}%` }}
        />
      </div>
      <p className="text-[14px] leading-relaxed text-(--mz-ink-2)">
        Near the edge, the rings sweep across the piece in arcs. In the middle, they circle it.
      </p>
    </div>
  );
}
