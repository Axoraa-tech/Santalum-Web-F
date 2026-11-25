import { Photo } from "../../Photo";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood-boot";
import { WoodDisc } from "../Logo";
import { W, WT } from "../W";

const HEAD: Record<Wood, { lead: string; caption: string; stepsTitle: string }> = {
  red: {
    lead: "A red sandalwood piece is judged by its colour and its weight, and both can be imitated with stain and resin. So the record comes with it.",
    caption: "Where the tree grows slowest, the red runs deepest.",
    stepsTitle: "From billet to box, in five hands",
  },
  white: {
    lead: "White sandalwood is judged by its scent, and cheap sapwood and synthetic oil are often sold under its name. So the lot comes with it.",
    caption: "Karnataka has carved and distilled it for centuries.",
    stepsTitle: "From heartwood to bottle, in five steps",
  },
};

/** Where it grows, how a piece is made, and the record that travels with it. Both woods, rendered on the server. */
export function Provenance() {
  return (
    <section id="provenance" className="scroll-mt-24 px-5 pb-16 pt-28 md:px-10 md:pb-20 md:pt-40">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[clamp(2.6rem,5.2vw,5.2rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
              <WT red={CONTENT.red.provenance.title} white={CONTENT.white.provenance.title} />
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">
              <WT red={HEAD.red.lead} white={HEAD.white.lead} />
            </p>
            <W red={<Origin wood="red" />} white={<Origin wood="white" />} />
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <W red={<Record wood="red" />} white={<Record wood="white" />} />
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-(--mz-ink-3)">
              <WT red={CONTENT.red.provenance.text} white={CONTENT.white.provenance.text} />
            </p>

            <h3 className="mt-16 font-display text-[28px] leading-none tracking-[-0.02em]">
              <WT red={HEAD.red.stepsTitle} white={HEAD.white.stepsTitle} />
            </h3>
            <W red={<Steps wood="red" />} white={<Steps wood="white" />} />

            <div className="mt-14 flex items-start gap-4 rounded-[2rem] border border-(--mz-line) p-6">
              <WoodDisc className="mt-0.5 size-9 shrink-0" />
              <p className="text-[15px] leading-relaxed text-(--mz-ink-2)">
                <WT red={CONTENT.red.regulation} white={CONTENT.white.regulation} />
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Origin({ wood }: { wood: Wood }) {
  const o = CONTENT[wood].origin;
  return (
    <figure className="mt-12 max-w-md">
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2.5rem] bg-(--mz-surface)">
        <Photo p={o.photo} sizes="(min-width: 1024px) 34vw, 100vw" />
      </div>
      <figcaption className="mt-5">
        <span className="block font-display text-[22px] leading-tight tracking-[-0.01em]">{o.region}</span>
        <span className="mt-2 block text-[15px] leading-relaxed text-(--mz-ink-2)">{o.text}</span>
        <span className="mt-2 block text-[14px] italic text-(--mz-ink-3)">{HEAD[wood].caption}</span>
      </figcaption>
    </figure>
  );
}

function Steps({ wood }: { wood: Wood }) {
  const steps = CONTENT[wood].making;
  return (
    <ol className="mt-8 grid gap-y-8 sm:grid-cols-5 sm:gap-x-4">
      {steps.map((s, i) => (
        <li key={s.title} className="relative">
          <span className="relative z-10 grid size-10 place-items-center rounded-full border border-(--mz-line) bg-(--mz-bg) font-display text-[16px] tabular-nums">{i + 1}</span>
          {i < steps.length - 1 && <span aria-hidden className="absolute left-10 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-(--mz-line) sm:block" />}
          <p className="mt-4 text-[15px] font-medium">{s.title}</p>
          <p className="mt-1 text-[14px] leading-snug text-(--mz-ink-2)">{s.text}</p>
        </li>
      ))}
    </ol>
  );
}

/** A batch record, drawn like the paper that ships in the box. Labelled as an example. */
function Record({ wood }: { wood: Wood }) {
  const c = CONTENT[wood];
  const no = c.provenance.record[0].value.split("-").pop();
  return (
    <div className="relative overflow-hidden rounded-[2rem] bg-(--mz-surface) p-7 md:p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[13px] text-(--mz-ink-3)">Santalum Maison, an example</p>
          <p className="mt-1 font-display text-[30px] leading-none tracking-[-0.02em]">{wood === "red" ? "Batch record" : "Lot record"}</p>
        </div>
        <div className="relative grid size-20 shrink-0 place-items-center rounded-full border border-(--mz-accent)/40">
          <WoodDisc className="size-14" />
          <span className="absolute -bottom-2 rounded-full bg-(--mz-surface) px-2 text-[11px] tabular-nums text-(--mz-accent)">No. {no}</span>
        </div>
      </div>
      <dl className="mt-8 border-t border-dashed border-(--mz-ink)/15">
        {c.provenance.record.map((r) => (
          <div key={r.label} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-dashed border-(--mz-ink)/15 py-3 text-[15px]">
            <dt className="text-(--mz-ink-3)">{r.label}</dt>
            <dd className={r.label === "Species" ? "font-display italic" : "tabular-nums"}>{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
