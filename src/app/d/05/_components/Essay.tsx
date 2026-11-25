"use client";

import { motion, useScroll, type MotionStyle } from "motion/react";
import Link from "next/link";
import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import { WT } from "@/components/maison/W";
import { useWood } from "@/lib/wood";
import { ESSAY, ESSAY_MINUTES, ESSAY_PARAS, ESSAY_STANDFIRST, sectionNo, type EssayNote } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

/** Words that go from light to ink as the reader scrolls through them. `[n]` marks a sidenote. */
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

/** One paragraph, both woods: the same scroll progress drives whichever text is showing. */
function Para({ red, white }: { red: string; white: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.88", "end 0.52"] });
  return (
    <motion.p ref={ref} className="x5-para" style={{ "--p": scrollYProgress } as unknown as MotionStyle}>
      <WT red={<Words text={red} />} white={<Words text={white} />} />
    </motion.p>
  );
}

function Quote({ red, white }: { red: { text: string; cite: string }; white: { text: string; cite: string } }) {
  const ref = useRef<HTMLQuoteElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.85", "end 0.45"] });
  return (
    <figure className="x5-pull">
      <motion.blockquote ref={ref} className="x5-pullText" style={{ "--p": scrollYProgress } as unknown as MotionStyle}>
        <span className="x5-pullMark" aria-hidden>
          “
        </span>
        <WT red={<Words text={red.text} />} white={<Words text={white.text} />} />
      </motion.blockquote>
      <figcaption className="x5-pullCite">
        <WT red={red.cite} white={white.cite} />
      </figcaption>
    </figure>
  );
}

function Sidenote({ note }: { note: EssayNote }) {
  return (
    <aside className="x5-sidenote" aria-label={`Note ${note.n}`}>
      <span className="x5-sideN">{note.n}</span>
      <div className="x5-sideFrame">
        <WPhoto red={note.red} white={note.white} sizes="(min-width: 768px) 16vw, 30vw" />
      </div>
      <p className="x5-caption">
        <b>Fig. {note.fig}</b>
        <span>
          <WT red={note.red.caption} white={note.white.caption} />
        </span>
      </p>
    </aside>
  );
}

/** Long-form essay on the current wood: scroll-driven reading, pull quotes, margin notes with photographs. */
export function Essay() {
  const wood = useWood();
  // The other wood's text has a different length: ask the scroll trackers to measure again.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event("scroll")));
    return () => cancelAnimationFrame(id);
  }, [wood]);

  return (
    <section id="essay" className="x5-section" aria-labelledby="essay-title">
      <Head
        id="essay-title"
        n={sectionNo("essay")}
        title={
          <WT
            red={
              <>
                Colour and
                <br />
                weight
              </>
            }
            white={
              <>
                Scent and
                <br />
                oil
              </>
            }
          />
        }
        meta="Figures 4 to 7"
        dek={
          <p>
            <WT
              red={`An essay on the red heartwood in ${ESSAY_PARAS} paragraphs, about ${ESSAY_MINUTES.red} minutes. Words darken as you read.`}
              white={`An essay on the white heartwood in ${ESSAY_PARAS} paragraphs, about ${ESSAY_MINUTES.white} minutes. Words darken as you read.`}
            />
          </p>
        }
      />
      <div className="x5-essay">
        <p className="x5-standfirst">
          <WT red={ESSAY_STANDFIRST.red} white={ESSAY_STANDFIRST.white} />
        </p>
        {ESSAY.map((b, i) =>
          b.kind === "quote" ? (
            <Quote key={i} red={b.red} white={b.white} />
          ) : (
            <div key={i} className="x5-essayRow">
              <Para red={b.red} white={b.white} />
              {b.note && <Sidenote note={b.note} />}
            </div>
          ),
        )}
        <p className="x5-signoff">
          <WT
            red={<>Santalum Maison, the red edition, November 2026. Read on: eight pieces from the lathe follow.</>}
            white={<>Santalum Maison, the white edition, November 2026. Read on: eight pieces from the still and the bench follow.</>}
          />{" "}
          <Link href="/d/05/shop" className="x5-inlineLink">
            Or open the whole <WT red="red" white="white" /> catalogue.
          </Link>
        </p>
      </div>
    </section>
  );
}
