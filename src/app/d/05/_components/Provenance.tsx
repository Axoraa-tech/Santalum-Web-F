"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { WT } from "@/components/maison/W";
import { RECORD, sectionNo } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

const R = RECORD.red;
const Wh = RECORD.white;

/** The example record of the current wood as a facsimile; footnote markers reveal their notes on hover, focus or tap. */
export function Provenance() {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="provenance" className="x5-section" aria-labelledby="provenance-title">
      <Head
        id="provenance-title"
        n={sectionNo("provenance")}
        title={
          <WT
            red={
              <>
                Batch
                <br />
                record
              </>
            }
            white={
              <>
                Lot
                <br />
                record
              </>
            }
          />
        }
        meta="Figure 13"
        dek={
          <p>
            <WT red={R.dek} white={Wh.dek} />
          </p>
        }
      />

      <div className="x5-prov">
        <div className="x5-docWrap">
          <figure className="x5-docPhoto">
            <div className="x5-docPhotoFrame">
              <WPhoto red={R.photo} white={Wh.photo} sizes="180px" />
            </div>
            <figcaption className="x5-caption">
              <b>Fig. 13</b>
              <WT red="The mala on the record." white="The oil on the record." />
            </figcaption>
          </figure>

          <article className="x5-doc" aria-label="Example record">
            <header className="x5-docHead">
              <p className="x5-docBrand">Santalum Maison</p>
              <p className="x5-docKind">
                <WT red={R.kind} white={Wh.kind} />
              </p>
              <p className="x5-docRef">
                <WT red={R.ref} white={Wh.ref} />
              </p>
            </header>
            <span className="x5-stamp" aria-label="This is an example record">
              Example
            </span>
            <dl className="x5-docFields">
              {R.fields.map((f, i) => {
                const n = i + 1;
                const wf = Wh.fields[i];
                return (
                  <div key={n} className="x5-docRow" data-on={active === n || undefined}>
                    <dt>
                      <WT red={f.label} white={wf.label} />
                      <button
                        type="button"
                        className="x5-fn"
                        aria-label={`Note ${n}`}
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
                      <WT red={f.value} white={wf.value} />
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
                            <b>{n}</b> <WT red={f.note} white={wf.note} />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </dd>
                  </div>
                );
              })}
            </dl>
            <footer className="x5-docFoot">
              <p>
                <WT red={R.foot} white={Wh.foot} />
              </p>
              <p>An example, to show the format. The real record travels with each piece.</p>
            </footer>
          </article>
        </div>

        <div className="x5-notes">
          <p className="x5-notesHead">
            <WT red="Notes to the batch record" white="Notes to the lot record" />
          </p>
          <ol className="x5-notesList">
            {R.fields.map((f, i) => {
              const n = i + 1;
              const wf = Wh.fields[i];
              return (
                <li
                  key={n}
                  id={`prov-note-${n}`}
                  className="x5-noteItem"
                  data-on={active === n || undefined}
                  data-dim={(active !== null && active !== n) || undefined}
                  onPointerEnter={() => setActive(n)}
                  onPointerLeave={(e) => e.pointerType === "mouse" && setActive(null)}
                >
                  <span className="x5-noteN">{n}</span>
                  <span className="x5-noteBody">
                    <b>
                      <WT red={f.label} white={wf.label} />.
                    </b>{" "}
                    <WT red={f.note} white={wf.note} />
                  </span>
                  {active === n && <motion.span layoutId="idx-note-bar" className="x5-noteBar" transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                </li>
              );
            })}
          </ol>
          <p className="x5-notesFoot">
            <WT red={R.notesFoot} white={Wh.notesFoot} />
          </p>
        </div>
      </div>
    </section>
  );
}
