"use client";

import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Photo } from "@/components/Photo";
import { useWood } from "@/lib/wood";
import { s } from "./cls";
import { cx, RECORDS, STEPS, STORIES, WOOD_SHORT, type StoryId } from "./data";
import { Fade } from "./ProductBento";
import { views } from "./store";
import { IconArrow } from "./ui";

/** Long-form view a story tile grows into. */
export function StoryView({ id, from, img = false }: { id: StoryId; from?: string; img?: boolean }) {
  const st = STORIES[id];
  const wood = useWood();
  const ph = st.photo[wood];
  const ph2 = st.photo2[wood];
  const router = useRouter();

  const cta = () => {
    const c = st.cta;
    if (!c) return;
    if (c.slug) {
      views.open({ kind: "product", slug: c.slug, from: `solo-${c.slug}`, img: false });
    } else if (c.section) {
      const target = c.section;
      views.close();
      window.setTimeout(() => {
        const el = document.getElementById(target);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        else router.push(`/d/06#${target}`);
      }, 420);
    }
  };

  return (
    <article className={cx(s.bento, s.story, "p-2 sm:p-3")}>
      <Fade area="hd" on className={cx(s.tile, s.r20, "flex min-h-[320px] flex-col justify-end p-6 pt-20 sm:p-10")}>
        <h2 className={cx(s.display, "max-w-[12ch] text-[clamp(44px,9cqw,104px)]")}>{st.title}</h2>
        <p className={cx(s.muted, "mt-6 max-w-[48ch] text-[19px] leading-[1.45]")}>{st.lede}</p>
      </Fade>

      <div style={{ gridArea: "ph" }} className={cx(s.tile, s.t2, s.r20, "min-h-[320px] sm:min-h-[400px]")}>
        <motion.div
          layoutId={from ? `${from}-img` : undefined}
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: 20 }}
          initial={img ? false : { opacity: 0 }}
          animate={{ opacity: 1, transition: { duration: 0.5 } }}
        >
          <Photo p={ph.photo} tone={ph.tone} priority sizes="(min-width:1024px) 42vw, 100vw" />
        </motion.div>
      </div>

      <Fade area="bd" on delay={0.18} className={cx(s.tile, s.r20, "p-6 sm:p-10")}>
        {st.steps ? (
          <ol className="grid gap-2 sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <li key={step.name} className={cx(s.inner, "p-5", i === 4 && "sm:col-span-2")}>
                <p className={cx(s.mono, s.muted, "text-[11px]")}>Step {i + 1} of 5</p>
                <p className="mt-1 text-[24px] font-medium tracking-[-0.03em]">{step.name}</p>
                <p className="mt-2 text-[15px] leading-[1.55] text-[#2b2b29]">{step.long}</p>
              </li>
            ))}
          </ol>
        ) : (
          <div className="max-w-[62ch] space-y-5 text-[18px] leading-[1.6] text-[#2b2b29]">
            {st.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}
        {st.record && <ExampleRecord />}
      </Fade>

      <Fade area="as" on delay={0.22} className={cx(s.tile, s.tint, s.r20, "p-6 sm:p-8")}>
        <dl className="divide-y divide-black/[0.08]">
          {st.facts(wood).map((f) => (
            <div key={f.label} className="flex items-baseline justify-between gap-4 py-3">
              <dt className={cx(s.mono, "text-[11px] opacity-70")}>{f.label}</dt>
              <dd className="text-right text-[15px] font-medium">{f.value}</dd>
            </div>
          ))}
        </dl>
      </Fade>

      <Fade area="qt" on delay={0.26} className={cx(s.tile, s.dark, s.r20, "flex min-h-[220px] items-end p-6 sm:p-10")}>
        <p className="max-w-[22ch] text-[clamp(28px,5cqw,52px)] font-medium leading-[1.05] tracking-[-0.04em]">{st.quote}</p>
      </Fade>

      <Fade area="p2" on delay={0.28} className={cx(s.tile, s.t2, s.r20, "min-h-[280px]")}>
        <Photo p={ph2.photo} tone={ph2.tone} sizes="(min-width:1024px) 42vw, 100vw" />
      </Fade>

      <Fade area="cta" on delay={0.3} className={cx(s.tile, s.r20, "flex flex-col gap-6 p-6 pb-24 sm:p-8")}>
        {st.enquiry && <Enquiry />}
        {st.cta && (
          <button type="button" className={cx(s.btn, s.btnLg, "self-start")} onClick={cta}>
            {st.cta.label} <IconArrow size={16} />
          </button>
        )}
      </Fade>
    </article>
  );
}

function ExampleRecord() {
  const r = RECORDS[0];
  const rows = [
    ["Piece", r.piece],
    ["Wood", WOOD_SHORT[r.wood]],
    ["Origin", r.origin],
    ["Batch", r.batch],
    ["Artisan", r.artisan],
    ["Finished", r.finished],
  ];
  return (
    <div className={cx(s.inner, "mt-8 max-w-[560px] p-5")}>
      <div className="flex items-center justify-between">
        <p className="text-[16px] font-medium">Batch record</p>
        <span className={cx(s.mono, "rounded-full bg-accent-soft px-2.5 py-1 text-[10.5px]")}>Example, not a real batch</span>
      </div>
      <dl className="mt-3 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className={cx(s.mono, s.muted, "text-[11px] leading-[22px]")}>{k}</dt>
            <dd className={cx(k === "Batch" && s.mono, "text-[15px] leading-[22px]")}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Enquiry() {
  const [sent, setSent] = useState(false);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };
  if (sent)
    return (
      <div className={cx(s.inner, "p-5")} role="status">
        <p className="text-[18px] font-medium">Thank you. We have your enquiry.</p>
        <p className={cx(s.muted, "mt-1 text-[14px]")}>Preview: enquiries are not sent anywhere yet.</p>
      </div>
    );
  return (
    <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
      <p className="text-[20px] font-medium tracking-[-0.025em] sm:col-span-2">Corporate gifting enquiry</p>
      <div>
        <label className={s.label} htmlFor="b6-enq-co">
          Company
        </label>
        <input id="b6-enq-co" name="company" required className={s.field} autoComplete="organization" />
      </div>
      <div>
        <label className={s.label} htmlFor="b6-enq-mail">
          Work email
        </label>
        <input id="b6-enq-mail" name="email" type="email" required className={s.field} autoComplete="email" />
      </div>
      <div>
        <label className={s.label} htmlFor="b6-enq-n">
          Number of pieces
        </label>
        <input id="b6-enq-n" name="pieces" type="number" min={5} max={2000} required className={s.field} inputMode="numeric" />
      </div>
      <div>
        <label className={s.label} htmlFor="b6-enq-date">
          Needed by
        </label>
        <input id="b6-enq-date" name="date" type="date" required className={s.field} />
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" className={s.btn}>
          Send enquiry
        </button>
        <p className={cx(s.muted, "text-[13px]")}>Preview: enquiries are not connected yet.</p>
      </div>
    </form>
  );
}
