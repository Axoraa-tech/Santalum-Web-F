"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { WT } from "@/components/maison/W";
import { getFamily, WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import { EASE, sectionNo } from "./content";
import { AddLine } from "./Entry";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

const CUFF = getFamily("vault-cuff")!;
const NUMBERS = Array.from({ length: 21 }, (_, i) => i + 1);

/** The 2011 Vault: No. 1 to No. 21 set as a typographic grid, with one feature photograph. */
export function Vault() {
  const wood = useWood();
  const [no, setNo] = useState<number | null>(null);

  return (
    <section id="vault" className="x5-section" aria-labelledby="vault-title">
      <Head
        id="vault-title"
        n={sectionNo("vault")}
        title={
          <>
            The 2011
            <br />
            Vault
          </>
        }
        meta="Figure 14"
        dek={<p>Twenty-one numbered cuffs, turned from aged heartwood sourced in 2011. An edition of 21, each entered in the registry.</p>}
      />

      <div className="x5-vault">
        <figure className="x5-vaultFig">
          <div className="x5-vaultFrame">
            <WPhoto red={{ p: PHOTOS.turned, tone: "red" }} white={{ p: PHOTOS.turned }} sizes="(min-width: 768px) 34vw, 90vw" />
          </div>
          <figcaption className="x5-caption">
            <b>Fig. 14</b>
            Turned from aged <WT red="red" white="white" /> heartwood. Each cuff is numbered.
          </figcaption>
        </figure>

        <div className="x5-vaultBody">
          <p className="x5-vaultLead">
            {CUFF.story[0]} {CUFF.story[1]}
          </p>

          <div className="x5-vaultGrid" role="group" aria-label="Choose a number from 1 to 21">
            {NUMBERS.map((n) => (
              <button key={n} type="button" className="x5-vaultCell" aria-pressed={no === n} onClick={() => setNo(no === n ? null : n)}>
                <span className="x5-vaultNo">No.</span>
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
                {no ? (
                  <>
                    <b>No. {no} of 21</b>, in {WOOD_NAMES[wood].common.toLowerCase()}. Made to your measurement, with its registry
                    certificate and a sealed vial of heartwood oil. We confirm the number with you before the cuff is made.
                  </>
                ) : (
                  <>Choose a number. Made to your measurement, with its registry certificate and a sealed vial of heartwood oil.</>
                )}
              </motion.p>
            </AnimatePresence>
            <div className="x5-vaultActions">
              <AddLine
                family={CUFF}
                wood={wood}
                custom={no ? `Vault No. ${no}` : undefined}
                label={no ? `Add No. ${no} to bag` : "Add a cuff to bag"}
              />
              <Link href="/d/05/p/vault-cuff" className="x5-textLink">
                Read the full entry
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
