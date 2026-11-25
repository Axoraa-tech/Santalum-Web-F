"use client";

import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { PHOTOS } from "@/lib/photos";
import { useWood, type Wood } from "@/lib/wood";
import k from "../k";
import { kinetic } from "./kinetic";
import { clamp, easeInOut, lerp, onFonts, useFinePointer, useReduced } from "./lib";

/** The hero word is the wood's own name: the dense red is Raktachandan, the fragrant white is Srigandha. */
const WORD: Record<Wood, string> = { red: "Raktachandan", white: "Srigandha" };

function Letters({ w }: { w: Wood }) {
  return (
    <>
      {WORD[w].split("").map((c, i) => (
        <span key={i} data-l>
          {c}
        </span>
      ))}
    </>
  );
}

const R = CONTENT.red;
const Wh = CONTENT.white;

/**
 * Hero: the wood's name set edge to edge. Letters swell toward the pointer; scrolling condenses the whole word
 * (wdth 150 → 50) while a photograph opens out of a pill behind it. The word exists twice, ink on paper and
 * paper on the photo, clipped by the same shape, so it changes colour exactly where the photo passes.
 * Both woods are rendered; CSS shows the current one, and the engine drives whichever is showing.
 */
export function Hero() {
  const fine = useFinePointer();
  const reduced = useReduced();
  const wood = useWood();
  const secRef = useRef<HTMLElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const inkRed = useRef<HTMLSpanElement>(null);
  const inkWhite = useRef<HTMLSpanElement>(null);
  const lightRed = useRef<HTMLSpanElement>(null);
  const lightWhite = useRef<HTMLSpanElement>(null);
  const wdthRef = useRef<HTMLSpanElement>(null);
  const wghtRef = useRef<HTMLSpanElement>(null);
  const narrow = useMotionValue(0);
  /** The pill's top inset (%): starts below the text blocks wherever they share its columns (phones, tablets). */
  const top = useMotionValue(14);
  const paperRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({ target: secRef, offset: ["start start", "end end"] });
  const reveal = useTransform(scrollYProgress, [0, 0.7], [0, 1], { clamp: true });
  const clip = useTransform([reveal, narrow, top], ([r, n, t]: number[]) => {
    const e = easeInOut(r);
    const b = n ? 45 : 39;
    const s = n ? 21 : 29;
    return `inset(${lerp(t, 0, e).toFixed(2)}% ${lerp(s, 0, e).toFixed(2)}% ${lerp(b, 0, e).toFixed(2)}% ${lerp(s, 0, e).toFixed(2)}% round ${lerp(360, 0, e).toFixed(1)}px)`;
  });
  const imgScale = useTransform(reveal, [0, 1], [1.35, 1]);
  const captions = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const hint = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  useEffect(() => {
    const onResize = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const n = vw < 768;
      narrow.set(n ? 1 : 0);
      const base = n ? 28 : 14;
      const b = n ? 45 : 39;
      const s = n ? 21 : 29;
      const pillL = (vw * s) / 100;
      const pillR = vw - pillL;
      const paper = paperRef.current;
      let need = 0;
      for (const el of [leftRef.current, rightRef.current]) {
        if (!paper || !el || !el.offsetWidth) continue;
        const x0 = paper.offsetLeft + el.offsetLeft;
        const x1 = x0 + el.offsetWidth;
        if (x1 > pillL && x0 < pillR) need = Math.max(need, paper.offsetTop + el.offsetTop + el.offsetHeight + 16);
      }
      top.set(clamp(Math.max(base, (need / vh) * 100), base, 100 - b - 12));
      // the pill shows only once it knows where the text ends (before hydration it could sit over the button on phones)
      pillRef.current?.setAttribute("data-ready", "");
    };
    const off = onFonts(onResize);
    const ro = new ResizeObserver(onResize);
    for (const el of [paperRef.current, leftRef.current, rightRef.current]) if (el) ro.observe(el);
    window.addEventListener("resize", onResize);
    return () => {
      off();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
    };
  }, [narrow, top]);

  useEffect(() => {
    const box = boxRef.current;
    const ink = (wood === "red" ? inkRed : inkWhite).current;
    const light = (wood === "red" ? lightRed : lightWhite).current;
    if (!box || !ink || !light) return;
    const eng = kinetic({
      text: WORD[wood],
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
  }, [fine, reduced, scrollYProgress, wood]);

  const wordBox = "absolute inset-x-[var(--k10-gut)] bottom-[13svh] md:bottom-[8svh]";
  const wordCls = `${k.heroWord} absolute bottom-0 left-0`;

  return (
    <section ref={secRef} aria-labelledby="k10-hero" className={reduced ? "relative h-svh" : "relative h-[230svh] md:h-[260svh]"}>
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* paper layer */}
        <div ref={paperRef} className={`${k.gut} absolute inset-x-0 top-[calc(44px+3.5svh)] flex items-start justify-between gap-8`}>
          <div ref={leftRef} className="max-w-[38ch]">
            <p className={`${k.mono} text-[var(--k10-grey)]`}>
              <WT red={`${R.name}, ${R.origin.region}`} white={`${Wh.name}, ${Wh.origin.region}`} />
            </p>
            <p className={`${k.monoL} mt-2`}>
              <WT red={R.hero.sub} white={Wh.hero.sub} />
            </p>
            <Link href="/d/10/shop" className={`${k.mini} mt-4`}>
              <WT red={R.hero.cta} white={Wh.hero.cta} />
            </Link>
          </div>
          {/* starts below the hanging bag tab (84px) so the ascenders of the first line stay whole */}
          <div ref={rightRef} className="hidden flex-col items-end gap-3 md:flex md:pt-[calc(68px-3.5svh)]">
            <p className={`${k.disp} text-right text-[length:clamp(30px,3.4vw,54px)] leading-[0.9] [font-variation-settings:'wdth'_62,'wght'_700]`}>
              <WT
                red={
                  <>
                    Objects time
                    <br />
                    cannot repeat.
                  </>
                }
                white={
                  <>
                    The fragrance lives
                    <br />
                    in the heartwood.
                  </>
                }
              />
            </p>
            <p className={`${k.mono} text-right text-[var(--k10-grey)]`}>
              <WT red="Every piece leaves with its batch record." white="Every bottle and box carries its lot." />
            </p>
          </div>
        </div>

        <motion.div style={{ opacity: hint }} className={`${k.gut} absolute inset-x-0 top-[57%] flex items-start justify-between gap-6 md:top-[63%]`}>
          <p className={`${k.mono} tabular-nums`} aria-hidden>
            <span className="text-[var(--k10-grey)]">wdth </span>
            <span ref={wdthRef}>150.0</span>
            <br />
            <span className="text-[var(--k10-grey)]">wght </span>
            <span ref={wghtRef}>780</span>
            <br />
            <span className="text-[var(--k10-grey)]">
              <WT red="Scroll, and it turns dense" white="Scroll, and it distils" />
            </span>
          </p>
          <p className={`${k.mono} text-right`}>
            <WT
              red={
                <>
                  {productsFor("red").length} pieces in red sandalwood
                  <br />
                  Turned at the lathe, finished in oil
                  <br />
                  {R.edition.name}, {R.edition.size} cuffs
                </>
              }
              white={
                <>
                  {productsFor("white").length} pieces in white sandalwood
                  <br />
                  Distilled, rolled and carved in Mysuru
                  <br />
                  {Wh.edition.name}, {Wh.edition.size} vials
                </>
              }
            />
          </p>
        </motion.div>

        <div className={wordBox} ref={boxRef}>
          <h1 id="k10-hero" className="sr-only">
            <WT red="Raktachandan, red sandalwood, from Santalum Maison" white="Srigandha, white sandalwood, from Santalum Maison" />
          </h1>
          <W
            red={
              <span ref={inkRed} aria-hidden className={wordCls}>
                <Letters w="red" />
              </span>
            }
            white={
              <span ref={inkWhite} aria-hidden className={wordCls}>
                <Letters w="white" />
              </span>
            }
          />
        </div>
        <p className={`${k.gut} ${k.mono} absolute inset-x-0 bottom-[6svh] text-right text-[var(--k10-grey)] md:bottom-[3svh]`} aria-hidden>
          <WT red={<>{R.latin}, the dense red heartwood</>} white={<>{Wh.latin}, the fragrant heartwood</>} />
        </p>

        {/* photo layer: the same word in paper colour, clipped by the opening pill */}
        <motion.div ref={pillRef} style={{ clipPath: clip }} className={`${k.heroPill} absolute inset-0 z-[2] bg-[var(--k10-ink)]`} aria-hidden>
          <motion.div style={{ scale: reduced ? 1 : imgScale }} className="absolute inset-0">
            <W red={<Photo p={PHOTOS.redChip} priority sizes="100vw" />} white={<Photo p={PHOTOS.whiteLog} priority sizes="100vw" />} />
          </motion.div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(18,18,18,0.52),rgba(18,18,18,0.2)_32%,rgba(18,18,18,0.26)_55%,rgba(18,18,18,0.6))]" />
          <motion.div style={{ opacity: captions }} className={`${k.gut} absolute inset-x-0 top-[calc(44px+3.5svh)] flex items-start justify-between gap-8 text-[var(--k10-bg)]`}>
            <div className={`${k.monoL} max-w-[40ch]`}>
              <W red={<p>{R.intro[0]}</p>} white={<p>{Wh.intro[0]}</p>} />
            </div>
            <p className={`${k.disp} hidden text-right text-[length:clamp(30px,3.4vw,54px)] leading-[0.9] [font-variation-settings:'wdth'_62,'wght'_700] md:block md:pt-[calc(68px-3.5svh)]`}>
              <WT
                red={
                  <>
                    Four thousand years
                    <br />
                    found its way to you.
                  </>
                }
                white={
                  <>
                    The sandalwood of
                    <br />
                    temples and perfume.
                  </>
                }
              />
            </p>
          </motion.div>
          <div className={`${wordBox} text-[var(--k10-bg)]`}>
            <W
              red={
                <span ref={lightRed} className={wordCls}>
                  <Letters w="red" />
                </span>
              }
              white={
                <span ref={lightWhite} className={wordCls}>
                  <Letters w="white" />
                </span>
              }
            />
          </div>
          <p className={`${k.gut} ${k.mono} absolute inset-x-0 bottom-[6svh] text-right text-[var(--k10-bg)] md:bottom-[3svh]`}>
            <WT red={<>{R.latin}, the dense red heartwood</>} white={<>{Wh.latin}, the fragrant heartwood</>} />
          </p>
        </motion.div>
      </div>
    </section>
  );
}
