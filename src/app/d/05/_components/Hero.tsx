"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { WT } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { familiesIn } from "./content";
import { WPhoto } from "./WPhoto";

const N_RED = familiesIn("red").length;
const N_WHITE = familiesIn("white").length;

/** The cover: "Two woods" set huge across the grid, a tall photograph in a column span, colophon details on the grid. */
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
          Objects, jewellery and gifting in sandalwood
        </p>
        <p className="x5-hm2">
          <span>Edition</span>
          <br />
          <WT red="Red sandalwood" white="White sandalwood" />
        </p>
        <p className="x5-hm3">
          <span>Forests</span>
          <br />
          Eastern Ghats; southern India
        </p>
        <p className="x5-hm4">
          <span>Issue</span>
          <br />
          November 2026
        </p>
      </div>

      <h1 id="cover-title" className="x5-heroTitle">
        <motion.span className="x5-heroLineWrap" style={{ x: typeX }}>
          <span className="x5-heroLine">Two</span>
        </motion.span>
        <span className="x5-heroLineWrap">
          <span className="x5-heroLine x5-heroLine2">
            woods<span className="x5-heroStop">.</span>
          </span>
        </span>
      </h1>

      <dl className="x5-heroNames">
        <div className="x5-nameRed">
          <dt>Red sandalwood</dt>
          <dd>
            <i>Pterocarpus santalinus</i>
          </dd>
          <dd className="x5-deva" lang="sa">
            रक्तचन्दन
          </dd>
          <dd>Dense, deep red, almost no scent.</dd>
        </div>
        <div className="x5-nameWhite">
          <dt>White sandalwood</dt>
          <dd>
            <i>Santalum album</i>
          </dd>
          <dd className="x5-deva" lang="sa">
            श्वेतचन्दन
          </dd>
          <dd>Pale gold, fragrant in the heartwood.</dd>
        </div>
      </dl>

      {/* The one orchestrated load moment runs in CSS, so it plays on first paint, before hydration. */}
      <figure className="x5-heroFigure">
        <div className="x5-heroFrame">
          <motion.div className="x5-heroParallax" style={{ y: photoY }}>
            <WPhoto red={{ p: PHOTOS.redGrain }} white={{ p: PHOTOS.whiteLog }} priority sizes="(min-width: 768px) 26vw, 80vw" />
          </motion.div>
        </div>
        <figcaption className="x5-caption">
          <b>Fig. 1</b>
          <WT red="Red heartwood, close. Eastern Ghats." white="A cut log: heartwood within, pale sapwood around it." />
        </figcaption>
      </figure>

      <p className="x5-heroLead">
        Red sandalwood is dense, deep red and almost without scent. White sandalwood is pale gold and carries its fragrance in the
        heartwood. This catalogue sets the two side by side: what each wood is, the pieces made from it, and the record that goes
        with every one.
      </p>

      <nav className="x5-heroLinks" aria-label="Start reading">
        <a href="#essay">Begin with the essay</a>
        <a href="#catalogue">
          Go to the catalogue, <WT red={`${N_RED} pieces in red`} white={`${N_WHITE} pieces in white`} />
        </a>
      </nav>
    </section>
  );
}
