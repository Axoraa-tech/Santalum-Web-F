"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { BATCH_WORD, cx, RECORDS, WOOD_SHORT, type BatchRecord } from "./data";
import { views } from "./store";

const COPY: Record<Wood, { lead: string; stat: string; statText: string; rule: [string, string]; hint: string }> = {
  red: {
    lead: "Every red sandalwood piece leaves with a batch record: the species, the lot, where it came from, who finished it and when.",
    stat: "App. II",
    statText: "Red sandalwood is listed in CITES Appendix II and its trade in India is controlled. Every lot we use is documented.",
    rule: ["If there is evidence, we show it.", "If there isn't, we don't invent it."],
    hint: "Piece, origin, who finished it and the date.",
  },
  white: {
    lead: "Every white sandalwood bottle, jar and carving carries its lot: where the wood came from, when it was distilled or carved, and the test report for oils.",
    stat: "15 yrs",
    statText: "The oil only forms in heartwood after fifteen years or more. White sandalwood is grown and sold under state forest rules.",
    rule: ["If an oil has a test report, it travels with the bottle.", "If it doesn't, the label says so."],
    hint: "Piece, origin, and when it was distilled, carved or rolled.",
  },
};

/** Provenance for one wood: the record format, a lookup (example records only) and the evidence rule. */
export function ProvenanceBento({ wood }: { wood: Wood }) {
  const c = COPY[wood];
  const id = `prov-rc-${wood}`;
  return (
    <div className={cx(s.bento, s.prov)}>
      <motion.div layoutId={id} style={{ gridArea: "rc", borderRadius: 28 }} className={s.tile}>
        <div className="grid h-full gap-6 p-6 sm:p-8 @min-[640px]:grid-cols-2">
          <div className="flex flex-col">
            <h2 className={cx(s.display, "max-w-[9ch] text-[clamp(40px,8cqw,76px)]")}>Know what you hold</h2>
            <p className={cx(s.muted, "mt-5 max-w-[38ch] text-[17px] leading-[1.5]")}>{c.lead}</p>
            <div className="mt-auto pt-6">
              <button type="button" className={s.ghost} onClick={() => views.open({ kind: "story", id: "provenance", from: id, img: false })}>
                {wood === "red" ? "How batch records work" : "How lots and reports work"}
              </button>
            </div>
          </div>
          <Record wood={wood} />
        </div>
      </motion.div>

      <div style={{ gridArea: "lk" }} className={cx(s.tile, "p-5 sm:p-6")}>
        <Lookup wood={wood} />
      </div>

      <div style={{ gridArea: "ct" }} className={cx(s.tile, s.tint, "flex min-h-[190px] flex-col p-5 sm:p-6")}>
        <p className={cx(s.monoWide, "text-[clamp(26px,13cqw,46px)] leading-none")}>{c.stat}</p>
        <p className="mt-auto pt-4 text-[14.5px] leading-[1.45]">{c.statText}</p>
      </div>

      <div style={{ gridArea: "ph" }} className={cx(s.tile, s.t2, "min-h-[190px]")}>
        <Photo p={wood === "red" ? PHOTOS.malaHand : PHOTOS.oilDropper} sizes="(min-width:1024px) 25vw, 50vw" />
      </div>

      <div style={{ gridArea: "kn" }} className={cx(s.tile, "flex items-center p-5 sm:px-7")}>
        <p className="text-[clamp(20px,3.6cqw,34px)] font-medium leading-[1.12] tracking-[-0.035em]">
          {c.rule[0]} <span className={s.muted}>{c.rule[1]}</span>
        </p>
      </div>
    </div>
  );
}

/** The example record from the house's own content. */
function Record({ wood }: { wood: Wood }) {
  const rec = CONTENT[wood].provenance.record;
  const [head, ...rows] = rec;
  return (
    <div className={cx(s.inner, "flex flex-col p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cx(s.mono, s.muted, "text-[10.5px]")}>{head.label}</p>
          <p className={cx(s.monoWide, "mt-1 text-[clamp(24px,6cqw,34px)] leading-none text-accent")}>{head.value}</p>
        </div>
        <span className={cx(s.mono, "rounded-full bg-[var(--b-tile)] px-2.5 py-1 text-[10px]")}>Example record</span>
      </div>
      <dl className="mt-5 divide-y divide-[var(--b-line)]">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[96px_minmax(0,1fr)] gap-3 py-2">
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[20px]")}>{r.label}</dt>
            <dd className="text-[14.5px] leading-[20px]">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const ALL = [...RECORDS.red, ...RECORDS.white];

function Lookup({ wood }: { wood: Wood }) {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<{ q: string; r: BatchRecord | null } | null>(null);
  const word = BATCH_WORD[wood];
  const inputId = `b6-batch-${wood}`;

  const find = (val: string) => {
    const k = val.trim().toUpperCase();
    if (!k) return;
    setRes({ q: k, r: ALL.find((x) => x.batch === k) ?? null });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    find(q);
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <p className="text-[20px] font-medium leading-none tracking-[-0.03em]">Look up a {word.toLowerCase()}</p>
      <p className={cx(s.muted, "mt-2 text-[14px] leading-[1.45]")}>Type the number on a record. Only the example records answer here.</p>
      <div className="mt-4 flex gap-2">
        <label htmlFor={inputId} className={s.srOnly}>
          {word} number
        </label>
        <input
          id={inputId}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={RECORDS[wood][0].batch}
          autoComplete="off"
          spellCheck={false}
          className={cx(s.field, s.mono, "min-w-0 uppercase")}
        />
        <button type="submit" className={cx(s.btn, "shrink-0")}>
          Look up
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {RECORDS[wood].slice(0, 3).map((r) => (
          <button
            key={r.batch}
            type="button"
            className={cx(s.chip, s.chipSm, s.mono)}
            onClick={() => {
              setQ(r.batch);
              find(r.batch);
            }}
          >
            {r.batch}
          </button>
        ))}
      </div>
      <div className="mt-auto pt-4" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {!res && (
            <motion.div key="hint" exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className={cx(s.inner, "p-4")}>
              <p className="text-[15px] font-medium">A record answers with</p>
              <p className={cx(s.mono, s.muted, "mt-1 text-[10.5px] leading-[1.6]")}>{COPY[wood].hint}</p>
            </motion.div>
          )}
          {res && (
            <motion.div
              key={res.q}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className={cx(s.inner, "p-4")}
            >
              {res.r ? (
                <>
                  <p className="flex items-center justify-between gap-2 text-[15px] font-medium">
                    {res.r.piece}
                    <span className={cx(s.mono, "shrink-0 rounded-full bg-[var(--b-tile)] px-2 py-0.5 text-[10px]")}>Example</span>
                  </p>
                  <p className={cx(s.mono, s.muted, "mt-1 text-[10.5px] leading-[1.6]")}>
                    {WOOD_SHORT[res.r.wood]}, {res.r.origin}
                    <br />
                    {res.r.verb} {res.r.date}, {res.r.by}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-medium">
                    No record for <span className={s.mono}>{res.q}</span>.
                  </p>
                  <p className={cx(s.muted, "mt-1 text-[13px] leading-[1.45]")}>
                    {COPY[wood].rule[0]} {COPY[wood].rule[1]}
                  </p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
