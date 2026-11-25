"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { W } from "@/components/maison/W";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import type { Wood } from "@/lib/wood";
import { shotOf, ShotPhoto, type Shot7 } from "../shots";
import { useSlot } from "../Stack";
import { pad2, productHref, sheet } from "../store";

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const COPY: Record<Wood, { unit: string; units: string; add: string; about: string; span: number }> = {
  red: { unit: "Cuff", units: "cuffs", add: "Add a Vault cuff", about: "About the cuff", span: 250 },
  white: { unit: "Vial", units: "vials", add: "Add a Reserve vial", about: "About the Reserve", span: 320 },
};

/**
 * Card 6: the numbered edition of the current wood is dealt out as the card arrives. 21 cuffs fan around the
 * photograph in red; 50 vials drop into a rack of five rows in white.
 */
export function Vault() {
  return <W red={<Fan wood="red" />} white={<Fan wood="white" />} />;
}

function Fan({ wood }: { wood: Wood }) {
  const { arrive } = useSlot();
  const reduce = useReducedMotion();
  const ed = CONTENT[wood].edition;
  const p = getProduct(ed.productSlug)!;
  const k = COPY[wood];
  const N = ed.size;
  const left = p.edition?.left ?? N;
  const [hover, setHover] = useState<number | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [box, setBox] = useState(560);
  const fan = useRef<HTMLDivElement>(null);
  const shown = hover ?? pick;

  useEffect(() => {
    const el = fan.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const b = Math.min(e.contentRect.width, e.contentRect.height);
      if (b > 0) setBox(b);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const token = Math.max(30, Math.min(56, box * 0.09));
  const photo = box * 0.54;
  const radius = photo / 2 + token * 0.75 + 14;
  const choose = (n: number) => setPick((q) => (q === n ? null : n));

  const add = () => {
    bag.add(p.slug, { note: pick ? `Preferred number ${pad2(pick)} of ${N}` : undefined });
    sheet.open();
  };

  return (
    <div className="grid min-h-[inherit] gap-6 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      {/* the fan (red) or the rack (white) */}
      {wood === "white" ? (
        <Rack n={N} unit={k.unit} units={k.units} arrive={arrive} reduce={!!reduce} pick={pick} onHover={setHover} onPick={choose} shot={shotOf(p)} />
      ) : (
        <div ref={fan} className="relative order-2 aspect-square w-full lg:order-1 lg:col-span-7 lg:aspect-auto lg:h-full">
          <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2" style={{ width: photo, height: photo }}>
            <div className="relative size-full overflow-hidden rounded-full ring-[8px] ring-(--s7-sand)">
              <ShotPhoto shot={shotOf(p)} sizes="(min-width: 1024px) 26vw, 50vw" />
              <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1B1712]/70 to-transparent" />
              <p className="d1 num absolute inset-x-0 bottom-[12%] text-center text-[clamp(2.6rem,8vw,5.6rem)] text-white">2011</p>
            </div>
          </div>
          <ul aria-label={`The ${N} numbered ${k.units}`} className="absolute left-1/2 top-[52%] size-0">
            {Array.from({ length: N }, (_, i) => (
              <Token
                key={i}
                i={i}
                n={N}
                span={k.span}
                unit={k.unit}
                arrive={arrive}
                reduce={!!reduce}
                radius={radius}
                size={token}
                on={pick === i + 1}
                onHover={setHover}
                onPick={choose}
              />
            ))}
          </ul>
        </div>
      )}

      {/* the text */}
      <div className="order-1 flex flex-col lg:order-2 lg:col-span-5 lg:justify-between">
        <div>
          <h2 className="d1 text-[clamp(3.4rem,min(8vw,14vh),8rem)]">{ed.name}</h2>
          <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-(--s7-body)">
            {ed.text}{" "}
            {wood === "red"
              ? "The registry entry names the harvest origin, the artisan and the day the cuff left our hands."
              : "The registry entry names the lot, the month it was distilled and the test report."}
          </p>
        </div>
        <div>
          <div className="mt-6 flex items-end gap-4 border-t border-(--s7-ink)/12 pt-5" aria-live="polite">
            <p className="d1 num text-[clamp(4.5rem,min(9vw,15vh),8.5rem)] text-(--s7-accent)">{shown ? pad2(shown) : pad2(left)}</p>
            <p className="max-w-[26ch] pb-2 text-[15px] leading-snug text-(--s7-muted)">
              {shown
                ? pick === shown
                  ? "Your preferred number. We confirm it is still free before anything is charged."
                  : `Number ${shown} of ${N}. Select it to ask for it.`
                : `of ${N} ${k.units} are still to be placed. Select a number ${wood === "white" ? "in the rack" : "on the ring"} to ask for it.`}
            </p>
          </div>

          <dl className="mt-5 text-[14.5px]">
            {p.details.map((d) => (
              <div key={d.label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-(--s7-ink)/12 py-2.5">
                <dt className="text-(--s7-muted)">{d.label}</dt>
                <dd>{d.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={add}
              className="inline-flex h-12 items-center gap-3 rounded-full bg-(--s7-ink) px-5 text-[15px] font-medium text-(--s7-page) transition hover:bg-(--s7-accent) active:scale-[0.97]"
            >
              {pick ? `Add No. ${pad2(pick)} to the bag` : k.add}
              <span className="num opacity-70">{formatINR(p.price)}</span>
            </button>
            <Link
              href={productHref(p.slug)}
              className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-(--s7-ink)/20 transition hover:bg-(--s7-surface) hover:ring-(--s7-ink)/40 active:scale-[0.97]"
            >
              {k.about}
            </Link>
          </div>
          <p className="mt-3 text-[14px] text-(--s7-muted)">
            {CONTENT[wood].name}. {p.short}
          </p>
        </div>
      </div>
    </div>
  );
}

function Token({
  i,
  n: N,
  span,
  unit,
  arrive,
  reduce,
  radius,
  size,
  on,
  onHover,
  onPick,
}: {
  i: number;
  n: number;
  span: number;
  unit: string;
  arrive: MotionValue<number>;
  reduce: boolean;
  radius: number;
  size: number;
  on: boolean;
  onHover: (n: number | null) => void;
  onPick: (n: number) => void;
}) {
  const angle = -span / 2 + (span / (N - 1)) * i;
  const stagger = 0.45 / N;
  const t = useTransform(arrive, (a) => (reduce ? 1 : easeOut(clamp01((a - 0.2 - i * stagger) / 0.45))));
  const rotate = useTransform(t, (k) => angle * k);
  const counter = useTransform(t, (k) => -angle * k);
  const y = useTransform(t, (k) => -radius * (0.3 + 0.7 * k));
  const opacity = useTransform(t, (k) => Math.min(1, 0.15 + k * 2));
  const n = i + 1;

  return (
    <motion.li className="absolute left-0 top-0 size-0" style={{ rotate, zIndex: on ? 60 : N - i }}>
      <motion.button
        type="button"
        aria-pressed={on}
        aria-label={`${unit} number ${n} of ${N}`}
        onPointerEnter={() => onHover(n)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(n)}
        onBlur={() => onHover(null)}
        onClick={() => onPick(n)}
        style={{ y, opacity, width: size, height: size, left: -size / 2, top: -size / 2 }}
        animate={{ scale: on ? 1.2 : 1 }}
        whileHover={{ scale: on ? 1.24 : 1.16 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 22 }}
        className={`absolute grid place-items-center rounded-full font-semibold shadow-[0_8px_18px_-10px_rgba(27,23,18,0.6)] transition-colors duration-300 ${
          "text-[13px] md:text-[15px]"
        } ${on ? "bg-(--s7-accent) text-white" : "bg-(--s7-page) text-(--s7-ink) ring-1 ring-(--s7-ink)/15 hover:bg-(--s7-surface)"}`}
      >
        <motion.span className="num d3" style={{ rotate: counter }}>
          {pad2(n)}
        </motion.span>
      </motion.button>
    </motion.li>
  );
}

/**
 * White: the fifty vials as a rack of five rows. Each vial drops into its slot as the card arrives, oil to the
 * shoulder; the one you choose lifts out of the rack.
 */
function Rack({
  n: N,
  unit,
  units,
  arrive,
  reduce,
  pick,
  onHover,
  onPick,
  shot,
}: {
  n: number;
  unit: string;
  units: string;
  arrive: MotionValue<number>;
  reduce: boolean;
  pick: number | null;
  onHover: (n: number | null) => void;
  onPick: (n: number) => void;
  shot: Shot7;
}) {
  return (
    <div className="order-2 flex flex-col justify-center gap-5 lg:order-1 lg:col-span-7 lg:gap-7 lg:pr-4">
      <div className="relative mx-auto h-[120px] w-full max-w-[560px] overflow-hidden rounded-full ring-[8px] ring-(--s7-sand) md:h-[170px] lg:h-[clamp(130px,22vh,200px)]">
        <ShotPhoto shot={shot} sizes="(min-width: 1024px) 40vw, 90vw" />
        <div aria-hidden className="absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-[#1B1712]/65 to-transparent" />
        <p className="d1 num absolute left-[8%] top-1/2 -translate-y-1/2 text-[clamp(2.8rem,7vw,5.4rem)] text-white">2011</p>
      </div>
      <div className="mx-auto w-full max-w-[560px] rounded-[26px] bg-(--s7-clay) p-2.5 shadow-[inset_0_2px_10px_rgba(27,23,18,0.12)] md:rounded-[30px] md:p-3.5">
        <ul aria-label={`The ${N} numbered ${units}`} className="grid grid-cols-10 gap-x-1.5 gap-y-2 md:gap-x-2 md:gap-y-3">
          {Array.from({ length: N }, (_, i) => (
            <Vial key={i} i={i} n={N} unit={unit} arrive={arrive} reduce={reduce} on={pick === i + 1} onHover={onHover} onPick={onPick} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function Vial({
  i,
  n: N,
  unit,
  arrive,
  reduce,
  on,
  onHover,
  onPick,
}: {
  i: number;
  n: number;
  unit: string;
  arrive: MotionValue<number>;
  reduce: boolean;
  on: boolean;
  onHover: (n: number | null) => void;
  onPick: (n: number) => void;
}) {
  const col = i % 10;
  const row = Math.floor(i / 10);
  const t = useTransform(arrive, (a) => (reduce ? 1 : easeOut(clamp01((a - 0.25 - (row * 0.05 + col * 0.018)) / 0.4))));
  const y = useTransform(t, (k) => -36 * (1 - k));
  const opacity = useTransform(t, (k) => Math.min(1, k * 1.6));
  const n = i + 1;
  return (
    <motion.li style={{ y, opacity }} className="flex justify-center">
      <motion.button
        type="button"
        aria-pressed={on}
        aria-label={`${unit} number ${n} of ${N}`}
        onPointerEnter={() => onHover(n)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(n)}
        onBlur={() => onHover(null)}
        onClick={() => onPick(n)}
        animate={{ y: on ? -8 : 0 }}
        whileHover={{ y: on ? -10 : -4 }}
        whileTap={{ scale: 0.94 }}
        transition={{ type: "spring", stiffness: 420, damping: 24 }}
        className={`relative flex h-[46px] w-full max-w-[40px] flex-col items-center justify-start overflow-hidden rounded-full pt-1.5 shadow-[0_8px_14px_-10px_rgba(27,23,18,0.7)] transition-colors duration-300 md:h-[64px] md:max-w-[44px] md:pt-2 ${
          on ? "bg-(--s7-accent) text-white" : "bg-(--s7-page) text-(--s7-ink) ring-1 ring-(--s7-ink)/12 hover:bg-(--s7-surface)"
        }`}
      >
        <span className="num d3 relative z-[1] text-[12px] font-semibold md:text-[14px]">{pad2(n)}</span>
        <span
          aria-hidden
          className={`absolute inset-x-0 bottom-0 h-[42%] transition-colors duration-300 ${on ? "bg-white/25" : "bg-(--s7-accent-soft)"}`}
        />
      </motion.button>
    </motion.li>
  );
}
