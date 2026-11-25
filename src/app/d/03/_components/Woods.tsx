"use client";

import { motion, useScroll, useSpring, useTransform, useVelocity, type MotionValue } from "motion/react";
import Link from "next/link";
import { W, WT } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, priceRange, productsFor } from "@/lib/shop/products";
import { switchWood, type Wood } from "@/lib/wood";
import { useMedia } from "./bits";

/** the facts each pendant lists */
const FACT_KEYS = ["Colour", "Scent", "In the hand", "Oil", "Grows in", "Used for"];

/** Two woods, two pendants on one thread. They swing a little when you scroll fast. */
export function Woods() {
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
            <WT
              red={
                <>
                  Two heartwoods.
                  <br />
                  This one is red.
                </>
              }
              white={
                <>
                  Two heartwoods.
                  <br />
                  This one carries the scent.
                </>
              }
            />
          </h2>
          <div className="bg-(--linen) md:col-span-5 md:col-start-8">
            <p className="s3-lede">
              <WT red={CONTENT.red.intro[0]} white={CONTENT.white.intro[0]} />
            </p>
            <p className="mt-3 text-[15px] leading-[1.6] text-(--muted)">
              <WT
                red="The two beads at the top of the page switch the whole house to white sandalwood: other pieces, other making, another edition."
                white="The two beads at the top of the page switch the whole house back to red sandalwood: other pieces, other making, another edition."
              />
            </p>
          </div>
        </div>

        <div className="relative mt-16 grid gap-y-20 md:mt-24 md:grid-cols-2 md:gap-x-16">
          <span data-knot className="absolute left-[-40px] top-0 hidden h-px w-px md:block" aria-hidden />
          <Pendant wood="red" rot={rotRed} drop={56} size="md:w-[88%]" />
          <Pendant wood="white" rot={rotWhite} drop={230} size="md:ml-auto md:w-[76%]" />
          <span data-knot className="absolute right-[-40px] top-0 hidden h-px w-px md:block" aria-hidden />
        </div>
      </div>
    </section>
  );
}

function Pendant({ wood, rot, drop, size }: { wood: Wood; rot: MotionValue<number>; drop: number; size: string }) {
  const c = CONTENT[wood];
  const [min, max] = priceRange(wood);
  const count = productsFor(wood).length;
  const facts = FACT_KEYS.map((k) => c.facts.find((f) => f.label === k)).filter((f): f is { label: string; value: string } => Boolean(f)).slice(0, 5);
  const here = (
    <p className="flex items-center gap-3 text-[15px]">
      <span className="s3-bead h-3.5 w-3.5" data-w={wood} aria-hidden />
      The house is showing {c.name.toLowerCase()}.
      <Link href="/d/03/shop" className="s3-link">
        Shop it
      </Link>
    </p>
  );
  const go = (
    <button type="button" className="s3-btn s3-btn-line" onClick={() => switchWood(wood)}>
      <span className="s3-bead s3-btn-bead" data-w={wood} aria-hidden />
      Show everything in {c.name.toLowerCase()}
    </button>
  );
  return (
    <div className={`s3-pend relative ${size}`} data-w={wood}>
      {/* the pendant hangs from a knot on the page thread */}
      <span data-knot className="s3-knot absolute left-1/2 top-0 z-[2] -translate-x-1/2 -translate-y-1/2" aria-hidden />
      <motion.div style={{ rotate: rot, transformOrigin: "50% 0%" }} className="relative z-[1]">
        <div className="s3-hang-thread" style={{ height: drop }} aria-hidden />
        <span className="s3-cap" aria-hidden />
        <div className="relative mx-auto -mt-px aspect-square w-full max-w-[560px]">
          <div className="s3-pend-ring absolute -inset-3 rounded-full border md:-inset-4" aria-hidden />
          <div className="s3-pend-photo relative h-full w-full overflow-hidden rounded-full bg-(--warm)">
            <Photo p={c.hero.photo} sizes="(min-width: 768px) 40vw, 90vw" />
          </div>
          <span lang="sa" className="absolute -bottom-3 right-[6%] rounded-full bg-(--linen) px-4 py-1.5 text-[clamp(1.1rem,1.8vw,1.6rem)] md:-bottom-4">
            {c.sanskrit}
          </span>
        </div>
      </motion.div>

      <div className="relative z-[1] mx-auto mt-12 max-w-[560px] bg-(--linen) md:mt-14">
        <h3 className="s3-serif text-[clamp(2rem,3.3vw,3.1rem)] leading-none">{c.name}</h3>
        <p className="mt-2 text-[16px] text-(--muted)">
          <i>{c.latin}</i>, <span lang="kn">{c.kannada}</span>
        </p>
        <p className="mt-4 text-[16px] leading-[1.6] text-(--ink)/80">{c.oneLine}</p>
        <dl className="mt-6 border-t border-(--line)">
          {facts.map((s) => (
            <div key={s.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-(--line) py-3 text-[15px]">
              <dt className="text-(--muted)">{s.label}</dt>
              <dd>{s.value}</dd>
            </div>
          ))}
          <div className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-(--line) py-3 text-[15px]">
            <dt className="text-(--muted)">In the shop</dt>
            <dd>
              {count} pieces, {formatINR(min)} to {formatINR(max)}
            </dd>
          </div>
        </dl>
        <div className="mt-6">{wood === "red" ? <W red={here} white={go} /> : <W red={go} white={here} />}</div>
      </div>
    </div>
  );
}
