"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { WT } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { RECORD, RECORD_FIELDS, sectionNo } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

/** The example batch record as a facsimile; footnote markers reveal their notes on hover, focus or tap. */
export function Provenance() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="provenance" className="x5-section" aria-labelledby="provenance-title">
      <Head
        id="provenance-title"
        n={sectionNo("provenance")}
        title="Provenance"
        meta="Figure 13"
        dek={
          <p>
            Know what you hold. If there is evidence, we show it. If there isn&apos;t, we don&apos;t invent it.
          </p>
        }
      />

      <div className="x5-prov">
        <div className="x5-docWrap">
          <figure className="x5-docPhoto">
            <div className="x5-docPhotoFrame">
              <WPhoto red={{ p: PHOTOS.beadStrandsDark }} white={{ p: PHOTOS.whiteBeads }} sizes="180px" />
            </div>
            <figcaption className="x5-caption">
              <b>Fig. 13</b>The piece on the record.
            </figcaption>
          </figure>

          <article className="x5-doc" aria-label="Example batch record">
            <header className="x5-docHead">
              <p className="x5-docBrand">Santalum Maison</p>
              <p className="x5-docKind">Batch record</p>
              <p className="x5-docRef">
                <WT red={RECORD.red.batch} white={RECORD.white.batch} />
              </p>
            </header>
            <span className="x5-stamp" aria-label="This is an example record">
              Example
            </span>
            <dl className="x5-docFields">
              {RECORD_FIELDS.map((f, i) => {
                const n = i + 1;
                return (
                  <div key={f.key} className="x5-docRow" data-on={active === n || undefined}>
                    <dt>
                      {f.label}
                      <button
                        type="button"
                        className="x5-fn"
                        aria-label={`Note ${n} on ${f.label.toLowerCase()}`}
                        aria-describedby={`prov-note-${n}`}
                        aria-pressed={active === n}
                        onPointerEnter={() => setActive(n)}
                        onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                        onFocus={() => setActive(n)}
                        onBlur={() => setActive(null)}
                        onClick={() => setActive((a) => (a === n ? null : n))}
                      >
                        {n}
                      </button>
                    </dt>
                    <dd>
                      <WT red={RECORD.red[f.key]} white={RECORD.white[f.key]} />
                      <AnimatePresence>
                        {active === n && (
                          <motion.span
                            className="x5-fnPop"
                            aria-hidden
                            initial={{ opacity: 0, y: -6, clipPath: "inset(0% 0% 100% 0%)" }}
                            animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0% 0% 0%)" }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                          >
                            <b>{n}</b> {f.note}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <footer className="x5-docFoot">
              <p>Entered by the workshop when the piece left it.</p>
              <p>An example, to show the format. Real records travel with each piece.</p>
            </footer>
          </article>
        </div>

        <div className="x5-notes">
          <p className="x5-notesHead">Notes to the record</p>
          <ol className="x5-notesList">
            {RECORD_FIELDS.map((f, i) => {
              const n = i + 1;
              return (
                <li
                  key={f.key}
                  id={`prov-note-${n}`}
                  className="x5-noteItem"
                  data-on={active === n || undefined}
                  data-dim={(active !== null && active !== n) || undefined}
                  onPointerEnter={() => setActive(n)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                >
                  <span className="x5-noteN">{n}</span>
                  <span className="x5-noteBody">
                    <b>{f.label}.</b> {f.note}
                  </span>
                  {active === n && <motion.span layoutId="idx-note-bar" className="x5-noteBar" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                </li>
              );
            })}
          </ol>
          <p className="x5-notesFoot">
            Every jar of powder carries its batch number. Every Vault cuff is entered in the registry with its number, origin, the
            artisan&apos;s name and the date it left our hands.
          </p>
        </div>
      </div>
    </section>
  );
}
