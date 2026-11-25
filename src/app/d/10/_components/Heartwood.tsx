"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, type CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { fitSize, onFonts, unsplash } from "./lib";

/** Red is about colour, white about scent: the masked word and everything around it follows. */
const WORD: Record<Wood, string> = { red: "Heartwood", white: "Fragrance" };

/** The wood's word, edge to edge, with its photograph showing through the letters and panning as you scroll. */
export function Heartwood() {
  const wood = useWood();
  const secRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const wordRef = useRef<HTMLHeadingElement>(null);
  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start end", "end start"] });
  const bgPos = useTransform(scrollYProgress, [0, 1], ["18% 0%", "82% 100%"]);
  const photoY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  useEffect(() => {
    const box = boxRef.current;
    const word = wordRef.current;
    if (!box || !word) return;
    const fit = () => {
      word.style.fontSize = `${fitSize(WORD[wood], box.clientWidth, 128, 900)}px`;
    };
    const off = onFonts(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => {
      off();
      ro.disconnect();
    };
  }, [wood]);

  const vars = {
    "--img-red": `url(${unsplash(PHOTOS.redGrain.id, 2000)})`,
    "--img-white": `url(${unsplash(PHOTOS.whiteLog.id, 2000)})`,
  } as CSSProperties;

  return (
    <section id="heartwood" ref={secRef} aria-labelledby="k10-heartwood" className="relative scroll-mt-12 pb-[7vw] pt-[6vw]">
      <div className={`${k.gut} grid grid-cols-1 gap-4 md:grid-cols-12`}>
        <p className={`${k.disp} text-[length:clamp(26px,2.6vw,40px)] leading-[0.9] [font-variation-settings:'wdth'_62,'wght'_720] md:col-span-4`}>
          <WT red="The colour is the heartwood" white="The scent is the heartwood" />
        </p>
        <p className={`${k.monoL} md:col-span-5 md:col-start-8`}>
          <WT
            red={
              <>
                <span className="italic">santalin, n.</span> The red pigment in the heartwood of Pterocarpus santalinus. It is why the wood
                dyes cloth, and why it darkens toward black at the core.
              </>
            }
            white={
              <>
                <span className="italic">heartwood oil, n.</span> The fragrant oil of Santalum album. It forms only in the heartwood, after
                fifteen years or more; the pale sapwood around it has none.
              </>
            }
          />
        </p>
      </div>

      <div className={`${k.gut} mt-[3vw]`}>
        <div ref={boxRef} style={vars}>
          <motion.h2
            id="k10-heartwood"
            ref={wordRef}
            style={{ backgroundPosition: bgPos }}
            className={`${k.disp} ${k.mask} w-max text-[17vw] leading-[1] [font-variation-settings:'wdth'_128,'wght'_900]`}
          >
            <WT red={WORD.red} white={WORD.white} />
          </motion.h2>
        </div>
      </div>

      <div className={`${k.gut} mt-[4vw] grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8`}>
        <div className="md:col-span-8">
          <p className={`${k.disp} whitespace-normal text-[length:clamp(30px,3.6vw,58px)] leading-[0.98] [font-variation-settings:'wdth'_84,'wght'_560]`}>
            <WT
              red="Every piece begins as a reading. The artisan studies the grain before the first cut. The wood decides what it will become. The hand follows."
              white="A young tree has almost no scent. The oil gathers in the heartwood over fifteen years and more, so we wait for the wood that has it, and work only that."
            />
          </p>
          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-[var(--k10-line)] pt-5 sm:grid-cols-2 md:mt-14">
            <W
              red={
                <>
                  <p className={k.monoL}>
                    In red sandalwood the heartwood is the colour: brick red, dense and fine-grained, and in old wood nearly black at the
                    centre. It has almost no scent, and a small piece is heavy in the hand.
                  </p>
                  <p className={`${k.monoL} text-[var(--k10-grey)]`}>
                    Only the heartwood is turned. Offcuts from beads and bowls become key fobs, and the rest is milled into powder for tilak
                    and natural dye.
                  </p>
                </>
              }
              white={
                <>
                  <p className={k.monoL}>
                    In white sandalwood the heartwood is the scent. The oil is held there, not in the sapwood, which is why only heartwood
                    goes to the still and to the carver.
                  </p>
                  <p className={`${k.monoL} text-[var(--k10-grey)]`}>
                    Chips go to slow steam distillation. The best blocks go to the Mysuru carvers, and the fine dust is ground into chandan.
                  </p>
                </>
              }
            />
          </div>
        </div>
        <figure className="md:col-span-3 md:col-start-10">
          <div className="relative aspect-[3/4] overflow-hidden rounded-b-[28px] rounded-t-[999px] bg-[var(--k10-stone)]">
            <motion.div style={{ y: photoY }} className="absolute inset-[-10%_0]">
              <W
                red={<Photo p={PHOTOS.chipsRed} sizes="(min-width: 768px) 25vw, 100vw" />}
                white={<Photo p={PHOTOS.whiteLog} sizes="(min-width: 768px) 25vw, 100vw" />}
              />
            </motion.div>
          </div>
          <figcaption className={`${k.mono} mt-3 text-[var(--k10-grey)]`}>
            <WT red="Heartwood chips: brick red, darker toward the core." white="A cut log: the pale gold heartwood inside the sapwood." />
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
