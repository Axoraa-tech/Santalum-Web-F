"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { featured } from "@/lib/shop/products";
import { countIn, ESSAY_TITLE, rangeIn } from "./content";
import { WPhoto } from "./WPhoto";

const R = CONTENT.red;
const Wh = CONTENT.white;
const N_FEAT = { red: featured("red").length, white: featured("white").length };
const SAY = ["", "one", "two", "three", "four", "five", "six", "seven", "eight"];

/** The cover: the edition's two words set huge across the grid, a tall photograph in a column span, colophon details on the grid. */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const photoY = useTransform(scrollYProgress, [0, 1], ["0%", "14%"]);
  const typeX = useTransform(scrollYProgress, [0, 1], ["0%", "-6%"]);

  return (
    <section id="cover" ref={ref} className="x5-hero" aria-labelledby="cover-title">
      <div className="x5-heroMeta">
        <p className="x5-hm1">
          <strong>Santalum Maison</strong>
          <br />
          <WT red="Beads, objects and jewellery turned from red sandalwood" white="Oil, incense, chandan and carving from white sandalwood" />
        </p>
        <p className="x5-hm2">
          <span>Edition</span>
          <br />
          <WT red="Red sandalwood" white="White sandalwood" />
        </p>
        <p className="x5-hm3">
          <span>
            <WT red="Forest" white="Craft centre" />
          </span>
          <br />
          <WT red="Seshachalam hills, Eastern Ghats" white="Mysuru, Karnataka" />
        </p>
        <p className="x5-hm4">
          <span>In this edition</span>
          <br />
          <WT red={`${countIn("red")} pieces, ${rangeIn("red")}`} white={`${countIn("white")} pieces, ${rangeIn("white")}`} />
        </p>
      </div>

      <h1 id="cover-title" className="x5-heroTitle">
        <motion.span className="x5-heroLineWrap" style={{ x: typeX }}>
          <span className="x5-heroLine">
            <WT red="Dense" white="Pale" />
          </span>
        </motion.span>
        <span className="x5-heroLineWrap">
          <span className="x5-heroLine x5-heroLine2">
            <WT red="red" white="gold" />
            <span className="x5-heroStop">.</span>
          </span>
        </span>
      </h1>

      <dl className="x5-heroNames">
        <div className="x5-nameA">
          <dt>
            <WT red={R.name} white={Wh.name} />
          </dt>
          <dd>
            <i>
              <WT red={R.latin} white={Wh.latin} />
            </i>
          </dd>
          <dd className="x5-deva" lang="sa">
            <WT red={R.sanskrit} white={Wh.sanskrit} />
          </dd>
          <dd className="x5-knda" lang="kn">
            <WT red={R.kannada} white={Wh.kannada} />
          </dd>
        </div>
        <div className="x5-nameB">
          <dt>
            At home, <WT red={R.localName} white={Wh.localName} />
          </dt>
          <dd>
            <WT red={R.oneLine} white={Wh.oneLine} />
          </dd>
        </div>
      </dl>

      {/* The one orchestrated load moment runs in CSS, so it plays on first paint, before hydration. */}
      <figure className="x5-heroFigure">
        <div className="x5-heroFrame">
          <motion.div className="x5-heroParallax" style={{ y: photoY }}>
            <WPhoto red={{ p: R.hero.photo }} white={{ p: Wh.hero.photo }} priority sizes="(min-width: 768px) 26vw, 80vw" />
          </motion.div>
        </div>
        <figcaption className="x5-caption">
          <b>Fig. 1</b>
          <WT red="Red heartwood, close. Eastern Ghats." white="A cut log: pale gold heartwood within, white sapwood around it." />
        </figcaption>
      </figure>

      <p className="x5-heroLead">
        <WT
          red="This edition of the catalogue is given to red sandalwood: a dense, deep red heartwood from the dry hills of the Eastern Ghats, with almost no scent. It sets out what the wood is, the pieces turned from it, how they are made, and the batch record that travels with each one."
          white="This edition is given to white sandalwood: the pale gold, fragrant wood of temples, weddings and perfume, distilled and carved in Mysuru for centuries. It sets out where the fragrance lives, the oils, incense and carving made from it, and the lot printed on every label."
        />
      </p>

      <nav className="x5-heroLinks" aria-label="Start reading">
        <a href="#essay">
          Begin with the essay, <WT red={ESSAY_TITLE.red.toLowerCase()} white={ESSAY_TITLE.white.toLowerCase()} />
        </a>
        <a href="#catalogue">
          <WT red={`See the ${SAY[N_FEAT.red]} selected red pieces`} white={`See the ${SAY[N_FEAT.white]} selected white pieces`} />
        </a>
        <Link href="/d/05/shop">
          <WT red={`The full red catalogue, ${countIn("red")} pieces`} white={`The full white catalogue, ${countIn("white")} pieces`} />
        </Link>
      </nav>
    </section>
  );
}
