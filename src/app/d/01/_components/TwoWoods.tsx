"use client";

import { useRouter } from "next/navigation";
import { Photo } from "@/components/Photo";
import { W } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, priceRange, productsFor } from "@/lib/shop/products";
import { switchWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { DimH, DimV } from "./Dim";

const TURNS: Record<Wood, string> = {
  red: "Cuts clean and holds a crisp edge, so beads can be small and rims thin. The dust stains the hands red.",
  white: "Turns soft and even; the scent rises from the shavings as the tool cuts, and stays on the hands.",
};

/** The two woods as side-by-side spec sheets, each photo framed by dimension lines. */
export function TwoWoods() {
  return (
    <section id="woods" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-12 md:items-end">
        <W
          red={
            <>
              <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em] md:col-span-7`}>
                Two woods,
                <br />
                one lathe
              </h2>
              <p className="max-w-[32rem] text-[16px] leading-[1.6] text-(--ink-2) md:col-span-5 md:pb-2 md:text-[17px]">
                Both are called sandalwood. They are different trees. The one on the lathe now is red: dense, deep in colour and
                almost without scent, from the dry hills of the Eastern Ghats, and listed in CITES Appendix II.
              </p>
            </>
          }
          white={
            <>
              <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em] md:col-span-7`}>
                Two woods,
                <br />
                one fragrance
              </h2>
              <p className="max-w-[32rem] text-[16px] leading-[1.6] text-(--ink-2) md:col-span-5 md:pb-2 md:text-[17px]">
                Both are called sandalwood, but only one carries the scent. The one on the lathe now is white: the sandalwood of
                temples, weddings and perfume, carved and distilled in Mysuru, with its oil in the heartwood.
              </p>
            </>
          }
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-[1400px] gap-6 md:mt-20 lg:grid-cols-2 lg:gap-8">
        <SpecSheet wood="red" />
        <SpecSheet wood="white" />
      </div>
    </section>
  );
}

function SpecSheet({ wood }: { wood: Wood }) {
  const router = useRouter();
  const c = CONTENT[wood];
  const [from] = priceRange(wood);
  const count = productsFor(wood).length;
  const label = wood === "red" ? "Sheet A" : "Sheet B";
  const rows: [string, string][] = [
    ["Sanskrit", c.sanskrit],
    ["Kannada", c.kannada],
    ...c.facts.filter((f) => f.label !== "Species" && f.label !== "Family").map((f) => [f.label, f.value] as [string, string]),
  ];
  const stamp = <span className={`${s.mono} ${s.stamp} rotate-[-4deg] rounded-[3px] px-2 py-1 text-[11px] font-medium`}>In use</span>;
  const use = (
    <button type="button" onClick={() => switchWood(wood)} className={`${s.btnLine} h-9! px-3.5! text-[13px]!`}>
      Use this wood
    </button>
  );

  return (
    <article data-for={wood} className={`${s.woodsheet} relative border bg-(--sheet)`} aria-label={`${c.name}, ${c.latin}`}>
      {/* Title strip */}
      <header className="flex items-stretch border-b border-(--hair-2)">
        <div className="flex-1 px-5 py-4 md:px-7 md:py-5">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>{label}</p>
          <h3 className={`${s.x110} mt-1 text-[clamp(1.5rem,2.4vw,2.1rem)] font-[600] leading-none tracking-[-0.015em]`}>
            <em className="italic">{c.latin}</em>
          </h3>
          <p className="mt-1.5 text-[14px] text-(--ink-2)">
            {c.name}, {c.localName}
          </p>
        </div>
        <div className="flex items-center border-l border-(--hair-2) px-4 md:px-5">
          <W red={wood === "red" ? stamp : use} white={wood === "white" ? stamp : use} />
        </div>
      </header>

      {/* Drawing: photo with dimensions */}
      <div className="relative px-10 pb-12 pt-14 md:px-16 md:pb-14 md:pt-16">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-(--paper-2)">
            <Photo p={c.hero.photo} sizes="(min-width:1024px) 40vw, 90vw" className="transition-transform duration-[1.2s] hover:scale-[1.04]" />
          </div>
          <DimH label="120" className="-top-8 left-0 right-0" bg="var(--sheet)" />
          <DimV label="90" className="-right-8 bottom-0 top-0" bg="var(--sheet)" />
          {/* Detail circle, called out from the corner */}
          <div className="absolute -bottom-8 -left-6 size-[34%] md:-left-10">
            <div className="relative size-full overflow-hidden rounded-full border-[3px] border-(--sheet) bg-(--paper-2) shadow-[0_0_0_1px_var(--ink)]">
              <Photo p={c.hero.photoAlt} sizes="200px" />
            </div>
            <span className={`${s.mono} absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] text-(--ink-2)`}>
              Detail {wood === "red" ? "A2" : "B2"}
            </span>
          </div>
          <span className={`${s.mono} absolute -bottom-6 right-0 text-[10.5px] text-(--steel)`}>
            Fig. {wood === "red" ? "A1" : "B1"}, photograph, not to scale
          </span>
        </div>
      </div>

      {/* Spec table */}
      <dl className="border-t border-(--hair-2)">
        {rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8.5rem_1fr] border-b border-(--hair) px-5 py-2.5 md:grid-cols-[10rem_1fr] md:px-7">
            <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>{k}</dt>
            <dd className="text-[15px] leading-6">{v}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[8.5rem_1fr] border-b border-(--hair) px-5 py-2.5 md:grid-cols-[10rem_1fr] md:px-7">
          <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>On the lathe</dt>
          <dd className="text-[15px] leading-6">{TURNS[wood]}</dd>
        </div>
      </dl>
      <footer className={`${s.mono} grid grid-cols-[1fr_1fr] text-[12px] sm:grid-cols-[1fr_1fr_auto]`}>
        <div className="border-r border-(--hair-2) px-5 py-4 md:px-7">
          <span className="block text-[10.5px] text-(--steel)">Pieces made</span>
          <span className="mt-1 block text-[20px] tabular-nums text-(--ink)">{count}</span>
        </div>
        <div className="px-5 py-4 sm:border-r sm:border-(--hair-2) md:px-7">
          <span className="block text-[10.5px] text-(--steel)">From</span>
          <span className="mt-1 block text-[20px] tabular-nums text-(--ink)">{formatINR(from)}</span>
        </div>
        <button
          type="button"
          onClick={() => {
            switchWood(wood);
            router.push("/d/01/shop");
          }}
          className="col-span-2 flex items-center justify-between gap-4 border-t border-(--hair-2) px-5 py-4 text-left text-[12.5px] transition-colors hover:bg-(--wash) active:bg-(--wash-2) sm:col-span-1 sm:border-t-0 md:px-7"
        >
          <span>
            Open {label.toLowerCase()}
            <span className="block text-[10.5px] text-(--steel)">in the catalogue</span>
          </span>
          <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden className="shrink-0">
            <path d="M0 5 H26 M21 1 L26 5 L21 9" fill="none" stroke="currentColor" strokeWidth="1.2" />
          </svg>
        </button>
      </footer>
    </article>
  );
}
