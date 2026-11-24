"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR, WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { useMedia } from "./bits";

type Spec = { label: string; value: string };

const SPECS: Record<Wood, Spec[]> = {
  red: [
    { label: "Colour", value: "Deep red, darkening to nearly black at the core" },
    { label: "Scent", value: "Almost none" },
    { label: "In the hand", value: "Dense, fine-grained, cool" },
    { label: "Grows", value: "Eastern Ghats, mainly Andhra Pradesh" },
    { label: "Trade", value: "Regulated internationally under CITES Appendix II" },
  ],
  white: [
    { label: "Colour", value: "Pale gold, with a darker heart" },
    { label: "Scent", value: "Warm and lasting; the oil is in the heartwood" },
    { label: "In the hand", value: "Smooth and lighter, fragrant when warm" },
    { label: "Grows", value: "Dry forests of southern India" },
    { label: "Craft centre", value: "Mysuru, Karnataka" },
  ],
};

const PHOTO: Record<Wood, PhotoRef> = { red: PHOTOS.redGrain, white: PHOTOS.whiteLog };

function range(w: Wood) {
  const prices = FAMILIES.flatMap((f) => (f.variants[w] ? [f.variants[w]!.price] : []));
  return { count: prices.length, min: Math.min(...prices), max: Math.max(...prices) };
}

/** Two woods, two pendants on one thread. They swing a little when you scroll fast. */
export function Woods() {
  const wood = useWood();
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const { scrollY } = useScroll();
  const vel = useVelocity(scrollY);
  const swing = useSpring(vel, { stiffness: 50, damping: 9, mass: 1.2 });
  const rotRed = useTransform(swing, [-4000, 4000], reduced ? [0, 0] : [5, -5], { clamp: true });
  const rotWhite = useTransform(swing, [-4000, 4000], reduced ? [0, 0] : [-3.2, 3.2], { clamp: true });

  return (
    <section id="woods" aria-labelledby="woods-h" className="relative z-[1] px-4 pb-24 pt-28 md:px-10 md:pb-36 md:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-6 md:grid-cols-12 md:items-end">
          <h2 id="woods-h" className="s3-h2 bg-(--linen) md:col-span-6">
            Two heartwoods,
            <br />
            one thread
          </h2>
          <div className="bg-(--linen) md:col-span-5 md:col-start-8">
            <p className="s3-lede">
              Red sandalwood is dense and almost scentless. White sandalwood carries the oil and the fragrance. We work both, and we
              always tell you which one you are holding.
            </p>
            <p className="mt-3 text-[14px] text-(--muted)">The two beads at the top of the page switch the whole site between them.</p>
          </div>
        </div>

        <div className="relative mt-16 grid gap-y-20 md:mt-24 md:grid-cols-2 md:gap-x-16">
          <span data-knot className="absolute left-[-40px] top-0 hidden h-px w-px md:block" aria-hidden />
          <Pendant wood="red" current={wood} rot={rotRed} drop={56} size="md:w-[88%]" />
          <Pendant wood="white" current={wood} rot={rotWhite} drop={230} size="md:ml-auto md:w-[76%]" />
          <span data-knot className="absolute right-[-40px] top-0 hidden h-px w-px md:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function Pendant({ wood, current, rot, drop, size }: { wood: Wood; current: Wood; rot: MotionValue<number>; drop: number; size: string }) {
  const n = WOOD_NAMES[wood];
  const on = wood === current;
  const r = range(wood);
  return (
    <div className={`relative ${size}`}>
      {/* the pendant hangs from a knot on the page thread */}
      <span data-knot className="s3-knot absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2" aria-hidden />
      <motion.div style={{ rotate: rot, transformOrigin: "50% 0%" }} className="relative z-[1]">
        <div className="s3-hang-thread" style={{ height: drop }} aria-hidden />
        <span className="s3-cap" aria-hidden />
        <div className="relative mx-auto -mt-px aspect-square w-full max-w-[560px]">
          <div
            className={`absolute -inset-3 rounded-full border transition-[border-color,transform] duration-700 md:-inset-4 ${
              on ? "scale-100 border-(--m-accent)" : "scale-95 border-transparent"
            }`}
            aria-hidden
          />
          <div className="relative h-full w-full overflow-hidden rounded-full bg-(--warm)">
            <Photo p={PHOTO[wood]} sizes="(min-width: 768px) 40vw, 90vw" className={on ? "" : "grayscale-[35%]"} />
          </div>
          <span lang="sa" className="absolute -bottom-3 right-[6%] rounded-full bg-(--linen) px-4 py-1.5 text-[clamp(1.1rem,1.8vw,1.6rem)] md:-bottom-4">
            {n.sa}
          </span>
        </div>
      </motion.div>

      <div className="relative z-[1] mx-auto mt-12 max-w-[560px] bg-(--linen) md:mt-14">
        <h3 className="s3-serif text-[clamp(2rem,3.3vw,3.1rem)] leading-none">{n.common}</h3>
        <p className="mt-2 text-[16px] italic text-(--muted)">{n.latin}</p>
        <dl className="mt-6 border-t border-(--line)">
          {SPECS[wood].map((s) => (
            <div key={s.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-(--line) py-3 text-[15px]">
              <dt className="text-(--muted)">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-(--line) py-3 text-[15px]">
            <dt className="text-(--muted)">On the strand</dt>
            <dd>
              {r.count} pieces, {formatINR(r.min)} to {formatINR(r.max)}
            </dd>
          </div>
        </dl>
        <div className="mt-6">
          {on ? (
            <p className="flex items-center gap-3 text-[15px]">
              <span className="s3-bead h-3.5 w-3.5" data-w={wood} aria-hidden />
              The site is showing {n.common.toLowerCase()}
            </p>
          ) : (
            <button type="button" className="s3-btn s3-btn-line" onClick={() => switchWood(wood)}>
              <span className="s3-bead s3-btn-bead" data-w={wood} aria-hidden />
              Show everything in {n.common.toLowerCase()}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
