"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { EASE, sectionNo } from "./content";

/** The Santalum Circle sign-up, written as one sentence with the field inside it. Front-end only. */
export function Circle() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!e.currentTarget.checkValidity()) return;
    setSent(email.trim());
  };

  return (
    <section id="circle" className={`x5-section x5-circle`} aria-labelledby="circle-title">
      <div className="x5-circleTop">
        <span className="x5-headN">{sectionNo("circle")}</span>
        <h2 id="circle-title" className="x5-circleTitle">
          The Santalum Circle
        </h2>
        <p className="x5-circleAbout">
          Our letter. It comes when there is something new to show: a new piece, a new batch, a note from the workshop. Nothing else.
        </p>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {sent ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <p className="x5-sentence">
              We will write to you at <span className="x5-sentEmail">{sent}</span> when new pieces arrive.
            </p>
            <button
              type="button"
              className="x5-textLink"
              onClick={() => {
                setSent(null);
                setEmail("");
              }}
            >
              Use a different address
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <p className="x5-sentence">
              <label htmlFor="circle-email">Write to me at</label>{" "}
              <span className="x5-inlineField">
                <input
                  id="circle-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="x5-inlineInput"
                />
              </span>{" "}
              when new pieces arrive.
            </p>
            <div className="x5-circleActions">
              <button type="submit" className="x5-addBtn">
                <span>Join the Circle</span>
                <span>Free</span>
              </button>
              <p className="x5-circleFine">One address, no account. Leave whenever you like from any letter.</p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  );
}
