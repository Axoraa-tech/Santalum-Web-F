"use client";

import { motion, useScroll, type MotionStyle } from "motion/react";
import { Fragment, useRef, type CSSProperties } from "react";
import { Photo } from "@/components/Photo";
import { ESSAY, ESSAY_STANDFIRST, ESSAY_WORDS, sectionNo, type EssayNote } from "./content";
import { Head } from "./Head";

const MINUTES = Math.max(1, Math.round(ESSAY_WORDS / 220));

/** Words that go from light grey to ink as the reader scrolls through them. `[n]` marks a sidenote. */
function Words({ text }: { text: string }) {
  const tokens = text.split(" ");
  const n = tokens.length;
  return (
    <>
      {tokens.map((t, i) => {
        const m = t.match(/^(.*?)\[(\d+)\](.*)$/);
        return (
          <Fragment key={i}>
            <span className="x5-word" style={{ "--i": (i / n).toFixed(4) } as CSSProperties}>
              {m ? (
                <>
                  {m[1]}
                  <sup className="x5-noteRef">{m[2]}</sup>
                  {m[3]}
                </>
              ) : (
                t
              )}
            </span>
            {i < n - 1 ? " " : null}
          </Fragment>
        );
      })}
    </>
  );
}

function Para({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.52"] });
  return (
    <motion.p ref={ref} className="x5-para" style={{ "--p": scrollYProgress } as unknown as MotionStyle}>
      <Words text={text} />
    </motion.p>
  );
}

function Quote({ text, cite }: { text: string; cite: string }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  return (
    <figure className="x5-pull">
      <motion.blockquote ref={ref} className="x5-pullText" style={{ "--p": scrollYProgress } as unknown as MotionStyle}>
        <span className="x5-pullMark" aria-hidden>
          “
        </span>
        <Words text={text} />
      </motion.blockquote>
      <figcaption className="x5-pullCite">{cite}</figcaption>
    </figure>
  );
}

function Sidenote({ note }: { note: EssayNote }) {
  return (
    <aside className="x5-sidenote" aria-label={`Note ${note.n}`}>
      <span className="x5-sideN">{note.n}</span>
      <div className="x5-sideFrame">
        <Photo p={note.photo} tone={note.tone} sizes="(min-width: 768px) 16vw, 30vw" />
      </div>
      <p className="x5-caption">
        <b>Fig. {note.fig}</b>
        {note.caption}
      </p>
    </aside>
  );
}

/** Long-form essay about the two woods: scroll-driven reading, pull quotes, margin notes with photographs. */
export function Essay() {
  return (
    <section id="essay" className="x5-section" aria-labelledby="essay-title">
      <Head
        id="essay-title"
        n={sectionNo("essay")}
        title={
          <>
            From the
            <br />
            heartwood
          </>
        }
        meta="Figures 4 to 7"
        dek={
          <p>
            An essay in {ESSAY.filter((b) => b.kind === "p").length} paragraphs, about {MINUTES} minutes. Words darken as you read.
          </p>
        }
      />
      <div className="x5-essay">
        <p className="x5-standfirst">{ESSAY_STANDFIRST}</p>
        {ESSAY.map((b, i) =>
          b.kind === "quote" ? (
            <Quote key={i} text={b.text} cite={b.cite} />
          ) : (
            <div key={i} className="x5-essayRow">
              <Para text={b.text} />
              {b.note && <Sidenote note={b.note} />}
            </div>
          ),
        )}
        <p className="x5-signoff">Santalum Maison, November 2026. Read on: the catalogue follows.</p>
      </div>
    </section>
  );
}
