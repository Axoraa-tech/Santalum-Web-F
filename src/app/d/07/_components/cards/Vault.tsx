"use client";

import { motion, useReducedMotion, useTransform, type MotionValue } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES } from "@/lib/catalog";
import { bag } from "@/lib/cart";
import { useWood } from "@/lib/wood";
import { useSlot } from "../Stack";
import { HOME, sheet } from "../store";

const N = 21;
const SPAN = 250; // degrees of the fan
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const pad = (n: number) => String(n).padStart(2, "0");

/** Card 6: twenty-one numbered tokens fan out around the cuff as the card arrives. */
export function Vault() {
  const { arrive } = useSlot();
  const wood = useWood();
  const reduce = useReducedMotion();
  const f = getFamily("vault-cuff")!;
  const v = f.variants[wood]!;
  const [hover, setHover] = useState<number | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [box, setBox] = useState(560);
  const fan = useRef<HTMLDivElement>(null);
  const shown = hover ?? pick;

  useEffect(() => {
    const el = fan.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox(Math.min(e.contentRect.width, e.contentRect.height)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const token = Math.max(30, Math.min(56, box * 0.09));
  const photo = box * 0.54;
  const radius = photo / 2 + token * 0.75 + 14;

  const add = () => {
    bag.add(f.slug, wood, 1, pick ? `Preferred number ${pad(pick)} of ${N}` : undefined);
    sheet.open();
  };

  return (
    <div className="grid min-h-[inherit] gap-6 px-5 pb-[150px] pt-6 md:px-8 md:pt-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[84px] lg:pt-9">
      {/* the fan */}
      <div ref={fan} className="relative order-2 aspect-square w-full lg:order-1 lg:col-span-7 lg:aspect-auto lg:h-full">
        <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2" style={{ width: photo, height: photo }}>
          <div className="relative size-full overflow-hidden rounded-full ring-[8px] ring-[#EFE9E0]">
            <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="(min-width: 1024px) 26vw, 50vw" />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#1B1712]/70 to-transparent" />
            <p className="d1 num absolute inset-x-0 bottom-[12%] text-center text-[clamp(2.6rem,8vw,5.6rem)] text-white">2011</p>
          </div>
        </div>
        <ul aria-label="The 21 numbered cuffs" className="absolute left-1/2 top-[52%] size-0">
          {Array.from({ length: N }, (_, i) => (
            <Token
              key={i}
              i={i}
              arrive={arrive}
              reduce={!!reduce}
              radius={radius}
              size={token}
              on={pick === i + 1}
              onHover={setHover}
              onPick={(n) => setPick((p) => (p === n ? null : n))}
            />
          ))}
        </ul>
      </div>

      {/* the text */}
      <div className="order-1 flex flex-col lg:order-2 lg:col-span-5 lg:justify-between">
        <div>
        <h2 className="d1 text-[clamp(3.4rem,min(8vw,14vh),8rem)]">The 2011 Vault</h2>
        <p className="mt-5 max-w-[46ch] text-[16px] leading-relaxed text-[#3d3731]">
          Twenty-one cuffs turned from heartwood sourced in 2011 and set aside since. Each is numbered, and each number is entered
          in our registry with its origin, the artisan&rsquo;s name and the day it left our hands.
        </p>
        </div>
        <div>

        <div className="mt-6 flex items-end gap-4 border-t border-[#1B1712]/12 pt-5" aria-live="polite">
          <p className="d1 num text-[clamp(4.5rem,min(9vw,15vh),8.5rem)] text-[var(--m-accent)]">{shown ? pad(shown) : "21"}</p>
          <p className="max-w-[24ch] pb-2 text-[14.5px] leading-snug text-[#77706A]">
            {shown
              ? pick === shown
                ? `Your preferred number. We confirm it is still free before anything is charged.`
                : `Number ${shown} of ${N}. Select it to ask for it.`
              : "Cuffs, numbered 1 to 21. Select a number on the ring to ask for it."}
          </p>
        </div>

        <dl className="mt-5 text-[14.5px]">
          {f.details.map((d) => (
            <div key={d.label} className="grid grid-cols-[120px_1fr] gap-3 border-b border-[#1B1712]/12 py-2.5">
              <dt className="text-[#77706A]">{d.label}</dt>
              <dd>{d.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={add}
            className="inline-flex h-12 items-center gap-3 rounded-full bg-[#1B1712] px-5 text-[15px] font-medium text-white transition hover:bg-[var(--m-accent)] active:scale-[0.97]"
          >
            {pick ? `Add No. ${pad(pick)} to the bag` : "Add a Vault cuff"}
            <span className="num text-white/70">{formatINR(v.price)}</span>
          </button>
          <Link
            href={`${HOME}/p/${f.slug}`}
            className="inline-flex h-12 items-center rounded-full px-5 text-[15px] font-medium ring-1 ring-[#1B1712]/20 transition hover:bg-white hover:ring-[#1B1712]/40 active:scale-[0.97]"
          >
            About the cuff
          </Link>
        </div>
        <p className="mt-3 text-[13px] text-[#77706A]">{WOOD_NAMES[wood].common}. {v.note}</p>
        </div>
      </div>
    </div>
  );
}

function Token({
  i,
  arrive,
  reduce,
  radius,
  size,
  on,
  onHover,
  onPick,
}: {
  i: number;
  arrive: MotionValue<number>;
  reduce: boolean;
  radius: number;
  size: number;
  on: boolean;
  onHover: (n: number | null) => void;
  onPick: (n: number) => void;
}) {
  const angle = -SPAN / 2 + (SPAN / (N - 1)) * i;
  const t = useTransform(arrive, (a) => (reduce ? 1 : easeOut(clamp01((a - 0.2 - i * 0.015) / 0.45))));
  const rotate = useTransform(t, (k) => angle * k);
  const counter = useTransform(t, (k) => -angle * k);
  const y = useTransform(t, (k) => -radius * (0.3 + 0.7 * k));
  const opacity = useTransform(t, (k) => Math.min(1, 0.15 + k * 2));
  const n = i + 1;

  return (
    <motion.li className="absolute left-0 top-0 size-0" style={{ rotate, zIndex: on ? 30 : N - i }}>
      <motion.button
        type="button"
        aria-pressed={on}
        aria-label={`Cuff number ${n} of ${N}`}
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
        className={`absolute grid place-items-center rounded-full text-[13px] font-semibold shadow-[0_8px_18px_-10px_rgba(27,23,18,0.6)] transition-colors duration-300 md:text-[15px] ${
          on ? "bg-[var(--m-accent)] text-white" : "bg-[#F8F6F2] text-[#1B1712] ring-1 ring-[#1B1712]/15 hover:bg-white"
        }`}
      >
        <motion.span className="num d3" style={{ rotate: counter }}>
          {pad(n)}
        </motion.span>
      </motion.button>
    </motion.li>
  );
}
