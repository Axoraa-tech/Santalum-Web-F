"use client";

import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR, WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { s } from "./cx";
import { DimH, DimV } from "./Dim";

type Sheet = { wood: Wood; label: string; fig: string; photo: PhotoRef; detail: PhotoRef; rows: [string, string][]; turns: string };

const SHEETS: Sheet[] = [
  {
    wood: "red",
    label: "Sheet A",
    fig: "Fig. A1",
    photo: PHOTOS.redGrain,
    detail: PHOTOS.redChip,
    turns: "Cuts clean and holds a crisp edge, so beads can be small and rims thin.",
    rows: [
      ["Sanskrit", WOOD_NAMES.red.sa],
      ["Grows in", "Eastern Ghats, mainly Andhra Pradesh"],
      ["Colour", "Deep red, darkening toward black"],
      ["Grain", "Dense and fine"],
      ["Scent", "Almost none"],
      ["Oil", "None"],
      ["Trade", "Regulated internationally, CITES Appendix II"],
    ],
  },
  {
    wood: "white",
    label: "Sheet B",
    fig: "Fig. B1",
    photo: PHOTOS.whiteLog,
    detail: PHOTOS.whitePowder,
    turns: "Pale and fragrant; the scent rises from the shavings as it is turned.",
    rows: [
      ["Sanskrit", WOOD_NAMES.white.sa],
      ["Grows in", "Dry forests of southern India"],
      ["Craft centre", "Mysuru, Karnataka"],
      ["Colour", "Pale gold"],
      ["Grain", "Fine and even"],
      ["Scent", "Fragrant"],
      ["Oil", "In the heartwood"],
    ],
  },
];

function stats(wood: Wood) {
  const made = FAMILIES.filter((f) => f.variants[wood]);
  const from = Math.min(...made.map((f) => f.variants[wood]!.price));
  return { count: made.length, from };
}

/** The two woods as side-by-side spec sheets, each photo framed by dimension lines. */
export function TwoWoods() {
  const wood = useWood();
  return (
    <section id="woods" className="relative scroll-mt-14 border-t border-(--hair) px-4 pb-24 pt-20 md:px-8 md:pb-32 md:pt-28">
      <div className="mx-auto grid max-w-[1400px] gap-8 md:grid-cols-12 md:items-end">
        <h2 className={`${s.x125} text-[clamp(2.6rem,6.2vw,6.4rem)] font-[600] leading-[0.88] tracking-[-0.03em] md:col-span-7`}>
          Two woods,
          <br />
          one lathe
        </h2>
        <p className="max-w-[32rem] text-[16px] leading-[1.6] text-(--ink-2) md:col-span-5 md:pb-2 md:text-[17px]">
          Both are called sandalwood. They are different trees with different hearts. Red sandalwood is dense and nearly
          scentless; white sandalwood is fragrant, and the oil sits in its heartwood. Each piece is made in one or both.
        </p>
      </div>

      <div className="mx-auto mt-14 grid max-w-[1400px] gap-6 md:mt-20 lg:grid-cols-2 lg:gap-8">
        {SHEETS.map((sh) => (
          <SpecSheet key={sh.wood} sheet={sh} active={wood === sh.wood} />
        ))}
      </div>
    </section>
  );
}

function SpecSheet({ sheet, active }: { sheet: Sheet; active: boolean }) {
  const name = WOOD_NAMES[sheet.wood];
  const st = stats(sheet.wood);
  return (
    <article
      className={`relative border bg-(--sheet) transition-[border-color,box-shadow] duration-500 ${
        active ? "border-(--ink) shadow-[0_30px_60px_-40px_rgb(26_27_29/0.5)]" : "border-(--hair-2)"
      }`}
      aria-label={`${name.common}, ${name.latin}`}
    >
      {/* Title strip */}
      <header className="flex items-stretch border-b border-(--hair-2)">
        <div className="flex-1 px-5 py-4 md:px-7 md:py-5">
          <p className={`${s.mono} text-[11px] text-(--steel)`}>{sheet.label}</p>
          <h3 className={`${s.x110} mt-1 text-[clamp(1.5rem,2.4vw,2.1rem)] font-[600] leading-none tracking-[-0.015em]`}>
            <em className="italic">{name.latin}</em>
          </h3>
          <p className="mt-1.5 text-[14px] text-(--ink-2)">{name.common}</p>
        </div>
        <div className="flex items-center border-l border-(--hair-2) px-4 md:px-5">
          {active ? (
            <span className={`${s.mono} ${s.stamp} rotate-[-4deg] rounded-[3px] px-2 py-1 text-[11px] font-medium`}>In use</span>
          ) : (
            <button type="button" onClick={() => switchWood(sheet.wood)} className={`${s.btnLine} h-9! px-3.5! text-[13px]!`}>
              Use this wood
            </button>
          )}
        </div>
      </header>

      {/* Drawing: photo with dimensions */}
      <div className="relative px-10 pb-12 pt-14 md:px-16 md:pb-14 md:pt-16">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden bg-(--paper-2)">
            <Photo p={sheet.photo} sizes="(min-width:1024px) 40vw, 90vw" className="transition-transform duration-[1.2s] hover:scale-[1.04]" />
          </div>
          <DimH label="120" className="-top-8 left-0 right-0" bg="var(--sheet)" />
          <DimV label="90" className="-right-8 bottom-0 top-0" bg="var(--sheet)" />
          {/* Detail circle, called out from the corner */}
          <div className="absolute -bottom-8 -left-6 size-[34%] md:-left-10">
            <div className="relative size-full overflow-hidden rounded-full border-[3px] border-(--sheet) bg-(--paper-2) shadow-[0_0_0_1px_var(--ink)]">
              <Photo p={sheet.detail} sizes="200px" />
            </div>
            <span className={`${s.mono} absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10.5px] text-(--ink-2)`}>
              Detail {sheet.wood === "red" ? "A2" : "B2"}
            </span>
          </div>
          <span className={`${s.mono} absolute -bottom-6 right-0 text-[10.5px] text-(--steel)`}>
            {sheet.fig}, photograph, not to scale
          </span>
        </div>
      </div>

      {/* Spec table */}
      <dl className="border-t border-(--hair-2)">
        {sheet.rows.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[8.5rem_1fr] border-b border-(--hair) px-5 py-2.5 md:grid-cols-[10rem_1fr] md:px-7">
            <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>{k}</dt>
            <dd className="text-[15px] leading-6">{v}</dd>
          </div>
        ))}
        <div className="grid grid-cols-[8.5rem_1fr] border-b border-(--hair) px-5 py-2.5 md:grid-cols-[10rem_1fr] md:px-7">
          <dt className={`${s.mono} text-[11.5px] leading-6 text-(--steel)`}>On the lathe</dt>
          <dd className="text-[15px] leading-6">{sheet.turns}</dd>
        </div>
      </dl>
      <footer className={`${s.mono} grid grid-cols-2 text-[12px]`}>
        <div className="border-r border-(--hair-2) px-5 py-4 md:px-7">
          <span className="block text-[10.5px] text-(--steel)">Pieces made</span>
          <span className="mt-1 block text-[20px] tabular-nums text-(--ink)">
            {st.count} of {FAMILIES.length}
          </span>
        </div>
        <div className="px-5 py-4 md:px-7">
          <span className="block text-[10.5px] text-(--steel)">From</span>
          <span className="mt-1 block text-[20px] tabular-nums text-(--ink)">{formatINR(st.from)}</span>
        </div>
      </footer>
    </article>
  );
}
