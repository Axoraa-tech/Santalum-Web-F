import { Photo } from "../../Photo";
import { PHOTOS } from "@/lib/photos";
import { WoodDisc } from "../Logo";
import { W } from "../W";

const STEPS = [
  ["Select", "Chosen for grain and soundness"],
  ["Shape", "Cut, carved or turned by hand"],
  ["Finish", "Oiled and polished, never lacquered"],
  ["Inspect", "Checked, then given its number"],
  ["Present", "Packed to be kept"],
];

/** How a piece is made, and the record that travels with it. */
export function Provenance() {
  return (
    <section id="provenance" className="scroll-mt-24 px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="font-display text-[clamp(2.6rem,5.2vw,5.2rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
              Know what you hold
            </h2>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
              For a material with a complicated history, trust starts with where it came from. If there is evidence, we
              show it. If there isn&rsquo;t, we don&rsquo;t invent it.
            </p>
            <div className="relative mt-12 aspect-[4/5] max-w-md overflow-hidden rounded-t-full rounded-b-[2.5rem]">
              <Photo p={PHOTOS.carving} sizes="(min-width: 1024px) 34vw, 100vw" />
            </div>
          </div>

          <div className="lg:col-span-6 lg:col-start-7 lg:pt-6">
            <Record />
            <p className="mt-4 text-[14px] text-ink-3">An example. Every piece ships with its own record and a care card.</p>

            <ol className="mt-16 grid gap-y-8 sm:grid-cols-5 sm:gap-x-4">
              {STEPS.map(([h, p], i) => (
                <li key={h} className="relative">
                  <span className="relative z-10 grid size-10 place-items-center rounded-full border border-hair bg-paper font-display text-[16px] tabular-nums">
                    {i + 1}
                  </span>
                  {i < STEPS.length - 1 && <span aria-hidden className="absolute left-10 top-5 hidden h-px w-[calc(100%-1.5rem)] bg-hair sm:block" />}
                  <p className="mt-4 text-[15px] font-medium">{h}</p>
                  <p className="mt-1 text-[14px] leading-snug text-ink-2">{p}</p>
                </li>
              ))}
            </ol>

            <div id="care" className="mt-16 grid gap-8 border-t border-hair pt-8 sm:grid-cols-3">
              {[
                ["Delivery", "Complimentary across India. Packed by hand and dispatched within 3 to 5 working days."],
                ["Returns", "Unused pieces within 14 days, in their original packaging. Numbered editions are final."],
                ["Care", "Keep dry and out of direct sun. A drop of natural oil once a season."],
              ].map(([h, p]) => (
                <div key={h}>
                  <p className="text-[15px] font-medium">{h}</p>
                  <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{p}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A batch record, drawn like the paper that ships in the box. */
function Record() {
  const rows = (wood: "red" | "white"): [string, string][] =>
    wood === "red"
      ? [
          ["Piece", "Japa mala, 108 beads"],
          ["Wood", "Pterocarpus santalinus, heartwood"],
          ["Origin", "Andhra Pradesh, licensed depot stock"],
          ["Batch", "R-26-0412"],
          ["Turned by", "S. Rao"],
          ["Finished", "14 November 2026"],
        ]
      : [
          ["Piece", "Heartwood oil, 5 ml"],
          ["Wood", "Santalum album, heartwood"],
          ["Origin", "Karnataka, government auction lot"],
          ["Batch", "W-26-0187"],
          ["Distilled by", "M. Gowda"],
          ["Sealed", "9 November 2026"],
        ];
  const card = (wood: "red" | "white") => (
    <div className="relative overflow-hidden rounded-[2rem] bg-paper-2 p-7 md:p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[13px] text-ink-3">Santalum Maison</p>
          <p className="mt-1 font-display text-[30px] leading-none tracking-[-0.02em]">Batch record</p>
        </div>
        <div className="relative grid size-20 shrink-0 place-items-center rounded-full border border-accent/40">
          <WoodDisc className="size-14" />
          <span className="absolute -bottom-2 rounded-full bg-paper-2 px-2 text-[11px] tabular-nums text-accent">
            {wood === "red" ? "No. 0412" : "No. 0187"}
          </span>
        </div>
      </div>
      <dl className="mt-8 border-t border-dashed border-ink/15">
        {rows(wood).map(([k, v]) => (
          <div key={k} className="grid grid-cols-[7.5rem_1fr] gap-4 border-b border-dashed border-ink/15 py-3 text-[15px]">
            <dt className="text-ink-3">{k}</dt>
            <dd className={k === "Wood" ? "font-display italic" : "tabular-nums"}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
  return <W red={card("red")} white={card("white")} />;
}
