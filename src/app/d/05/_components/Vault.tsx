"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { W, WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, type Wood } from "@/lib/shop/products";
import { EASE, EDITION, sectionNo } from "./content";
import { AddLine, MarkButton } from "./Entry";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

function EditionBody({ wood }: { wood: Wood }) {
  const copy = EDITION[wood];
  const product = getProduct(CONTENT[wood].edition.productSlug)!;
  const size = product.edition?.size ?? CONTENT[wood].edition.size;
  const left = product.edition?.left ?? size;
  const numbers = Array.from({ length: size }, (_, i) => i + 1);
  const [no, setNo] = useState<number | null>(null);

  return (
    <div className="x5-vaultBody">
      <p className="x5-vaultLead">{product.story.join(" ")}</p>

      <p className="x5-vaultCount">
        <b>
          {left} of {size}
        </b>{" "}
        still to be placed. {wood === "red" ? "When a number is returned, the Circle hears first." : "When a vial is placed, its number closes in the registry."}
      </p>

      <div className={`x5-vaultGrid ${size > 21 ? "x5-vaultGrid50" : ""}`} role="group" aria-label={`Choose a number from 1 to ${size}`}>
        {numbers.map((n) => (
          <button key={n} type="button" className="x5-vaultCell" aria-pressed={no === n} onClick={() => setNo(no === n ? null : n)}>
            <span className="x5-vaultNo">{copy.unit}</span>
            <span className="x5-vaultNum">{n}</span>
          </button>
        ))}
      </div>

      <div className="x5-vaultOrder">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={no ?? 0}
            className="x5-vaultLine"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            {no ? copy.chosen(no, size) : copy.prompt}
          </motion.p>
        </AnimatePresence>
        <div className="x5-vaultActions">
          <AddLine
            product={product}
            note={no ? `${copy.unit === "No." ? "Cuff" : "Vial"} No. ${no} of ${size}` : undefined}
            label={no ? `Add No. ${no} to bag` : wood === "red" ? "Add a cuff to bag" : "Add a vial to bag"}
          />
          <MarkButton slug={product.slug} name={product.name} />
          <Link href={`/d/05/p/${product.slug}`} className="x5-textLink">
            Read the full entry
          </Link>
        </div>
      </div>
    </div>
  );
}

/** The current wood's numbered edition: the 2011 Vault cuffs in red, the 2011 Reserve oil in white. */
export function Vault() {
  return (
    <section id="vault" className="x5-section" aria-labelledby="vault-title">
      <Head
        id="vault-title"
        n={sectionNo("vault")}
        title={
          <>
            The 2011
            <br />
            <WT red="Vault" white="Reserve" />
          </>
        }
        meta="Figure 14"
        dek={
          <p>
            <WT red={EDITION.red.dek} white={EDITION.white.dek} />
          </p>
        }
      />

      <div className="x5-vault">
        <figure className="x5-vaultFig">
          <div className="x5-vaultFrame">
            <WPhoto red={EDITION.red.photo} white={EDITION.white.photo} sizes="(min-width: 768px) 34vw, 90vw" />
          </div>
          <figcaption className="x5-caption">
            <b>Fig. 14</b>
            <span>
              <WT red={EDITION.red.caption} white={EDITION.white.caption} />
            </span>
          </figcaption>
        </figure>
        <W red={<EditionBody wood="red" />} white={<EditionBody wood="white" />} />
      </div>
    </section>
  );
}
