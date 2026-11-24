"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { s } from "./cls";
import { cx, RECORDS, WOOD_SHORT, type BatchRecord } from "./data";
import { views } from "./store";

/** Provenance: the record format, a batch lookup (example records only) and the evidence rule. */
export function ProvenanceBento() {
  return (
    <section id="provenance" aria-label="Provenance" className={cx(s.bento, s.prov, s.section)}>
      <motion.div layoutId="prov-rc" style={{ gridArea: "rc", borderRadius: 28 }} className={s.tile}>
        <div className="grid h-full gap-6 p-6 sm:p-8 @min-[640px]:grid-cols-2">
        <div className="flex flex-col">
          <h2 className={cx(s.display, "max-w-[9ch] text-[clamp(40px,8cqw,76px)]")}>Know what you hold</h2>
          <p className={cx(s.muted, "mt-5 max-w-[36ch] text-[17px] leading-[1.5]")}>
            Every piece leaves with a batch record: what it is, which wood, where the wood came from, who finished it and when.
          </p>
          <div className="mt-auto pt-6">
            <button
              type="button"
              className={s.ghost}
              onClick={() => views.open({ kind: "story", id: "provenance", from: "prov-rc", img: false })}
            >
              How records work
            </button>
          </div>
        </div>
        <Record r={RECORDS[0]} />
        </div>
      </motion.div>

      <div style={{ gridArea: "lk" }} className={cx(s.tile, "p-5 sm:p-6")}>
        <Lookup />
      </div>

      <div style={{ gridArea: "ct" }} className={cx(s.tile, s.tint, "flex min-h-[190px] flex-col p-5 sm:p-6")}>
        <p className={cx(s.monoWide, "text-[clamp(26px,13cqw,46px)] leading-none")}>App. II</p>
        <p className="mt-auto pt-4 text-[14.5px] leading-[1.45]">
          Red sandalwood is regulated internationally under CITES Appendix II. Each record names where the wood came from.
        </p>
      </div>

      <div style={{ gridArea: "ph" }} className={cx(s.tile, s.t2, "min-h-[190px]")}>
        <Photo p={PHOTOS.malaHand} sizes="(min-width:1024px) 25vw, 50vw" />
      </div>

      <div style={{ gridArea: "kn" }} className={cx(s.tile, "flex items-center p-5 sm:px-7")}>
        <p className="text-[clamp(20px,3.6cqw,34px)] font-medium leading-[1.12] tracking-[-0.035em]">
          If there is evidence, we show it. <span className={s.muted}>If there isn&apos;t, we don&apos;t invent it.</span>
        </p>
      </div>
    </section>
  );
}

function Record({ r }: { r: BatchRecord }) {
  const rows: [string, string][] = [
    ["Piece", r.piece],
    ["Wood", WOOD_SHORT[r.wood]],
    ["Origin", r.origin],
    ["Artisan", r.artisan],
    ["Finished", r.finished],
  ];
  return (
    <div className={cx(s.inner, "flex flex-col p-5")}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={cx(s.mono, s.muted, "text-[10.5px]")}>Batch</p>
          <p className={cx(s.monoWide, "mt-1 text-[clamp(24px,6cqw,34px)] leading-none text-accent")}>{r.batch}</p>
        </div>
        <span className={cx(s.mono, "rounded-full bg-white px-2.5 py-1 text-[10px]")}>Example record</span>
      </div>
      <dl className="mt-5 divide-y divide-black/[0.07]">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[88px_minmax(0,1fr)] gap-3 py-2">
            <dt className={cx(s.mono, s.muted, "text-[10.5px] leading-[20px]")}>{k}</dt>
            <dd className="text-[14.5px] leading-[20px]">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Lookup() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<{ q: string; r: BatchRecord | null } | null>(null);

  const find = (val: string) => {
    const k = val.trim().toUpperCase();
    if (!k) return;
    setRes({ q: k, r: RECORDS.find((x) => x.batch === k) ?? null });
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    find(q);
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <p className="text-[20px] font-medium leading-none tracking-[-0.03em]">Look up a batch</p>
      <p className={cx(s.muted, "mt-2 text-[14px] leading-[1.45]")}>Type the number on a record. Only the example records answer here.</p>
      <div className="mt-4 flex gap-2">
        <label htmlFor="b6-batch" className={s.srOnly}>
          Batch number
        </label>
        <input
          id="b6-batch"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="R-26-0412"
          autoComplete="off"
          spellCheck={false}
          className={cx(s.field, s.mono, "min-w-0 uppercase")}
        />
        <button type="submit" className={cx(s.btn, "shrink-0")}>
          Look up
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {RECORDS.slice(0, 3).map((r) => (
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
              <p className={cx(s.mono, s.muted, "mt-1 text-[10.5px] leading-[1.6]")}>Piece, wood, origin, artisan and the date it was finished.</p>
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
                    <span className={cx(s.mono, "shrink-0 rounded-full bg-white px-2 py-0.5 text-[10px]")}>Example</span>
                  </p>
                  <p className={cx(s.mono, s.muted, "mt-1 text-[10.5px] leading-[1.6]")}>
                    {WOOD_SHORT[res.r.wood]}, {res.r.origin}
                    <br />
                    Finished {res.r.finished} by {res.r.artisan}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-[15px] font-medium">
                    No record for <span className={s.mono}>{res.q}</span>.
                  </p>
                  <p className={cx(s.muted, "mt-1 text-[13px] leading-[1.45]")}>If there is evidence, we show it. If there isn&apos;t, we don&apos;t invent it.</p>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
