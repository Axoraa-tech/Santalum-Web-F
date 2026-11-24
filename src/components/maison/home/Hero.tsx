"use client";

import { motion } from "motion/react";
import { W, WT } from "../W";
import { Pill } from "../Pill";
import { WoodCanvas } from "../WoodCanvas";

const EASE = [0.22, 1, 0.36, 1] as const;

function Lines({ lines, delay = 0 }: { lines: string[]; delay?: number }) {
  return (
    <>
      {lines.map((l, i) => (
        <span key={l} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className="block"
            initial={{ y: "105%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1.1, ease: EASE, delay: delay + 0.12 * i }}
          >
            {l}
          </motion.span>
        </span>
      ))}
    </>
  );
}

/** The one orchestrated entrance on the site: the slice grows from its pith while the headline rises. */
export function Hero() {
  return (
    <section className="relative min-h-[100svh] overflow-hidden px-5 pb-14 pt-28 md:px-10 md:pt-32">
      <div className="mx-auto grid max-w-[1500px] items-end gap-10 lg:min-h-[calc(100svh-10rem)] lg:grid-cols-12">
        <div className="relative z-10 order-2 lg:order-1 lg:col-span-6 lg:pb-8">
          <h1 className="font-display text-[clamp(3.1rem,7.4vw,8.4rem)] font-[350] leading-[0.92] tracking-[-0.035em]">
            <WT
              red={<Lines lines={["Objects time", "cannot repeat"]} />}
              white={<Lines lines={["Four thousand", "years, found", "its way to you"]} />}
            />
          </h1>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: EASE, delay: 0.55 }}
          >
            <p className="mt-8 max-w-md text-[17px] leading-relaxed text-ink-2">
              <WT
                red={<>Beads, objects and jewellery shaped from the deep red heartwood of India&rsquo;s Eastern Ghats.</>}
                white={<>Beads, oils and objects from the fragrant heartwood of southern India&rsquo;s white sandalwood.</>}
              />
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Pill href="/maison/shop" size="lg">
                Shop the collection
              </Pill>
              <Pill href="#studio" variant="line" size="lg">
                Shape your own pendant
              </Pill>
            </div>
          </motion.div>
        </div>

        <div className="relative order-1 -mx-5 lg:order-2 lg:col-span-6 lg:mx-0">
          <WoodCanvas
            mode="hero"
            label="A slice of sandalwood, its growth rings moving under the cursor"
            className="mx-auto aspect-square w-[min(118vw,94svh)] max-w-none lg:-mr-[8vw] lg:w-[min(56vw,96svh)]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.4 }}
            className="absolute bottom-[4%] left-6 lg:left-[6%]"
          >
            <W
              red={
                <>
                  <p lang="sa" className="font-deva text-[22px] leading-none text-accent">रक्तचन्दन</p>
                  <p className="mt-2 font-display text-[15px] italic text-ink-2">Pterocarpus santalinus</p>
                </>
              }
              white={
                <>
                  <p lang="sa" className="font-deva text-[22px] leading-none text-accent">श्वेतचन्दन</p>
                  <p className="mt-2 font-display text-[15px] italic text-ink-2">Santalum album</p>
                </>
              }
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
