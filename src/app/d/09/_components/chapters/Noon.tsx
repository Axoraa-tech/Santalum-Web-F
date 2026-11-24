"use client";

import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer } from "../Scene";

const ROWS: { label: string; red: string; white: string; deva?: boolean; italic?: boolean }[] = [
  { label: "Botanical name", red: "Pterocarpus santalinus", white: "Santalum album", italic: true },
  { label: "In Sanskrit", red: "रक्तचन्दन", white: "श्वेतचन्दन", deva: true },
  { label: "Colour", red: "Deep red, dense and fine-grained", white: "Pale gold" },
  { label: "Scent", red: "Almost none", white: "Fragrant; the oil is held in the heartwood" },
  { label: "Grows in", red: "The Eastern Ghats, mainly Andhra Pradesh", white: "The dry forests of southern India" },
  { label: "Worth knowing", red: "Regulated internationally under CITES Appendix II", white: "Mysuru, in Karnataka, is its traditional craft centre" },
];

function Pendant({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="grain-pendant"
      wood={wood}
      shape="circle"
      side="right"
      photoClass="size-[36vw] sm:size-40 lg:size-[min(17svh,10vw)]"
      sizes="(min-width: 1024px) 10vw, 36vw"
    />
  );
}

/** 12:00. The material: two trees that share a name, as layered cut-outs and a plain comparison. */
export function Noon() {
  return (
    <Chapter id="noon" len="200vh" label="Noon: the two woods">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <div className="flex flex-col lg:col-span-4 lg:justify-between">
          <Layer speed={0.08}>
            <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>12:00</p>
            <Lines
              lines={["Two trees,", "one name"]}
              className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(5.4vw,10.5svh)]`}
            />
            <p className="mt-6 max-w-[27rem] text-[17px] leading-[1.7] text-[var(--muted)]">
              Red sandalwood is not a darker white sandalwood. They are separate species from separate forests, and the light at
              noon, straight overhead, shows the difference plainly.
            </p>
          </Layer>
          <Layer speed={0.28} className="mt-10 lg:mt-0">
            <W red={<Pendant wood="red" />} white={<Pendant wood="white" />} />
          </Layer>
        </div>

        {/* the cut-outs: red heartwood, white heartwood and both powders, at four depths */}
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[30rem] lg:col-span-4 lg:aspect-auto lg:h-full lg:max-w-none">
          <Layer speed={0.14} className="absolute left-0 top-[2%] aspect-[3/4] h-[80%]">
            <Cut photo={PHOTOS.redGrain} shape="arch" niche className="size-full" sizes="(min-width: 1024px) 24vw, 70vw" />
          </Layer>
          <Layer speed={0.42} className="absolute bottom-[4%] right-0 aspect-square w-[54%]">
            <Cut photo={PHOTOS.whiteLog} shape="circle" className="size-full" sizes="(min-width: 1024px) 18vw, 50vw" />
          </Layer>
          <Layer speed={0.66} className="absolute right-[6%] top-0 aspect-square w-[24%]">
            <Cut photo={PHOTOS.redPowder} shape="pebble" className="size-full" sizes="140px" drift={0.5} />
          </Layer>
          <Layer speed={0.82} className="absolute bottom-0 left-[12%] aspect-square w-[22%]">
            <Cut photo={PHOTOS.whitePowder} shape="egg" className="size-full" sizes="140px" drift={0.5} />
          </Layer>
        </div>

        <Layer speed={0.1} className="lg:col-span-4 lg:self-center">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Red and white sandalwood compared</caption>
            <thead>
              <tr>
                <th scope="col" className="w-[26%] pb-3 align-bottom text-[12px] font-normal text-[var(--muted)]">
                  Wood
                </th>
                <th scope="col" className={`${s.colRed} pb-3 pr-3 align-bottom font-normal`}>
                  <span className={`${s.display} block text-[22px] leading-none lg:text-[26px]`}>Red</span>
                  <span className={`${s.markRed} mt-2 block w-10`} />
                </th>
                <th scope="col" className={`${s.colWhite} pb-3 align-bottom font-normal`}>
                  <span className={`${s.display} block text-[22px] leading-none lg:text-[26px]`}>White</span>
                  <span className={`${s.markWhite} mt-2 block w-10`} />
                </th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.label} className="border-t border-[var(--hair)] align-top">
                  <th scope="row" className="py-[min(0.8rem,1.6svh)] pr-3 text-[12px] font-normal leading-snug text-[var(--muted)]">
                    {r.label}
                  </th>
                  {(["red", "white"] as const).map((w) => (
                    <td
                      key={w}
                      className={`${w === "red" ? s.colRed : s.colWhite} py-[min(0.8rem,1.6svh)] pr-3 leading-snug ${
                        r.deva ? `${s.deva} text-[18px]` : "text-[14px] lg:text-[15px]"
                      } ${r.italic ? "italic" : ""}`}
                    >
                      {r[w]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Layer>
      </div>
    </Chapter>
  );
}
