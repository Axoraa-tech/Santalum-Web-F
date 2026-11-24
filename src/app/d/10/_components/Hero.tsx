"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { FAMILIES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import k from "../k";
import { kinetic } from "./kinetic";
import { clamp, easeInOut, lerp, onFonts, useFinePointer, useReduced } from "./lib";

const WORD = "Sandalwood";

function Letters() {
  return (
    <>
      {WORD.split("").map((c, i) => (
        <span key={i} data-l>
          {c}
        </span>
      ))}
    </>
  );
}

/**
 * Hero: "Sandalwood" set edge to edge. Letters swell toward the pointer; scrolling condenses the whole word
 * (wdth 150 → 50) while a photograph opens out of a pill behind it. The word exists twice, ink on paper and
 * paper on the photo, clipped by the same shape, so it changes colour exactly where the photo passes.
 */
export function Hero() {
  const fine = useFinePointer();
  const reduced = useReduced();
  const wood = useWood();
  const secRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inkRef = useRef<HTMLSpanElement>(null);
  const lightRef = useRef<HTMLSpanElement>(null);
  const wdthRef = useRef<HTMLSpanElement>(null);
  const wghtRef = useRef<HTMLSpanElement>(null);
  const narrow = useMotionValue(0);

  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start start", "end end"] });
  const reveal = useTransform(scrollYProgress, [0, 0.7], [0, 1], { clamp: true });
  const clip = useTransform([reveal, narrow], ([r, n]: number[]) => {
    const e = easeInOut(r);
    const t = n ? 28 : 14;
    const b = n ? 45 : 39;
    const s = n ? 21 : 29;
    return `inset(${lerp(t, 0, e).toFixed(2)}% ${lerp(s, 0, e).toFixed(2)}% ${lerp(b, 0, e).toFixed(2)}% ${lerp(s, 0, e).toFixed(2)}% round ${lerp(360, 0, e).toFixed(1)}px)`;
  });
  const imgScale = useTransform(reveal, [0, 1], [1.35, 1]);
  const captions = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  useEffect(() => {
    const onResize = () => narrow.set(window.innerWidth < 768 ? 1 : 0);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [narrow]);

  useEffect(() => {
    const box = boxRef.current;
    const ink = inkRef.current;
    const light = lightRef.current;
    if (!box || !ink || !light) return;
    const eng = kinetic({
      text: WORD,
      copies: [ink, light],
      target: () => box.clientWidth,
      base: () => {
        const start = window.innerWidth < 768 ? 115 : 150;
        const e = reduced ? 0 : easeInOut(clamp(scrollYProgress.get() / 0.8, 0, 1));
        return { wdth: lerp(start, 50, e), wght: lerp(780, 880, e) };
      },
      pointer: fine && !reduced,
      intro: !reduced,
      amp: 84,
      onFrame: (wd, wg) => {
        if (wdthRef.current) wdthRef.current.textContent = wd.toFixed(1);
        if (wghtRef.current) wghtRef.current.textContent = String(Math.round(wg));
      },
    });
    const offFonts = onFonts(eng.wake);
    const ro = new ResizeObserver(eng.wake);
    ro.observe(box);
    const unsub = scrollYProgress.on("change", eng.wake);
    return () => {
      eng.destroy();
      offFonts();
      ro.disconnect();
      unsub();
    };
  }, [fine, reduced, scrollYProgress]);

  const inWood = FAMILIES.filter((f) => f.variants[wood]).length;
  const wordBox = "absolute inset-x-[var(--k-gut)] bottom-[13svh] md:bottom-[8svh]";

  return (
    <section ref={secRef} aria-labelledby="k10-hero" className={reduced ? "relative h-svh" : "relative h-[230svh] md:h-[260svh]"}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* paper layer */}
        <div className={`${k.gut} absolute inset-x-0 top-[calc(44px+3.5svh)] flex items-start justify-between gap-8`}>
          <div className="max-w-[34ch]">
            <p className={`${k.mono} text-[var(--k-grey)]`}>Santalum Maison, India</p>
            <p className={`${k.monoL} mt-2`}>
              A contemporary Indian house for sandalwood objects, jewellery and gifting. Red and white heartwood, worked by hand and
              documented piece by piece.
            </p>
          </div>
          <div className="hidden flex-col items-end gap-3 md:flex">
            <p className={`${k.disp} text-right text-[length:clamp(30px,3.4vw,54px)] leading-[0.9] [font-variation-settings:'wdth'_62,'wght'_700]`}>
              Objects time
              <br />
              cannot repeat.
            </p>
            <p className={`${k.mono} text-right text-[var(--k-grey)]`}>Every piece numbered and documented.</p>
          </div>
        </div>

        <motion.div style={{ opacity: hint }} className={`${k.gut} absolute inset-x-0 top-[57%] flex items-start justify-between gap-6 md:top-[63%]`}>
          <p className={`${k.mono} tabular-nums`} aria-hidden>
            <span className="text-[var(--k-grey)]">wdth </span>
            <span ref={wdthRef}>150.0</span>
            <br />
            <span className="text-[var(--k-grey)]">wght </span>
            <span ref={wghtRef}>780</span>
            <br />
            <span className="text-[var(--k-grey)]">Scroll, and the word condenses</span>
          </p>
          <p className={`${k.mono} text-right`}>
            {inWood} families in {wood} sandalwood
            <br />
            Two woods, one choice
            <br />
            An edition of 21, from 2011
          </p>
        </motion.div>

        <div className={wordBox} ref={boxRef}>
          <h1 id="k10-hero" className="sr-only">
            Sandalwood, from Santalum Maison
          </h1>
          <span ref={inkRef} aria-hidden className={`${k.heroWord} absolute bottom-0 left-0`}>
            <Letters />
          </span>
        </div>
        <p className={`${k.gut} ${k.mono} absolute inset-x-0 bottom-[6svh] text-right text-[var(--k-grey)] md:bottom-[3svh]`} aria-hidden>
          <span className="hidden sm:inline">Red and white sandalwood, </span>from the heartwood
        </p>

        {/* photo layer: the same word in paper colour, clipped by the opening pill */}
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 z-[2] bg-[var(--k-ink)]" aria-hidden>
          <motion.div style={{ scale: reduced ? 1 : imgScale }} className="absolute inset-0">
            <W red={<Photo p={PHOTOS.redChip} priority sizes="100vw" />} white={<Photo p={PHOTOS.whiteBeads} priority sizes="100vw" />} />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,18,18,0.52),rgba(18,18,18,0.2)_32%,rgba(18,18,18,0.26)_55%,rgba(18,18,18,0.6))]" />
          <motion.div style={{ opacity: captions }} className={`${k.gut} absolute inset-x-0 top-[calc(44px+3.5svh)] flex items-start justify-between gap-8 text-[var(--k-bg)]`}>
            <div className={`${k.monoL} max-w-[36ch]`}>
              <W
                red={<p>Red sandalwood, Pterocarpus santalinus. Deep red, dense and fine-grained, with almost no scent. Eastern Ghats, mainly Andhra Pradesh.</p>}
                white={<p>White sandalwood, Santalum album. Pale gold and fragrant; the oil is held in the heartwood. The dry forests of southern India.</p>}
              />
            </div>
            <p className={`${k.disp} hidden text-right text-[length:clamp(30px,3.4vw,54px)] leading-[0.9] [font-variation-settings:'wdth'_62,'wght'_700] md:block`}>
              Four thousand years
              <br />
              found its way to you.
            </p>
          </motion.div>
          <div className={`${wordBox} text-[var(--k-bg)]`}>
            <span ref={lightRef} className={`${k.heroWord} absolute bottom-0 left-0`}>
              <Letters />
            </span>
          </div>
          <p className={`${k.gut} ${k.mono} absolute inset-x-0 bottom-[6svh] text-right text-[var(--k-bg)] md:bottom-[3svh]`}>
            <span className="hidden sm:inline">Red and white sandalwood, </span>from the heartwood
          </p>
        </motion.div>
      </div>
    </section>
  );
}
