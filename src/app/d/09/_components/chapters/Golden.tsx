"use client";

import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { Hour, SceneSun } from "../SceneSun";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer } from "../Scene";
import { openCorporate } from "../store";

/** The two golden hours. Red: gifts with weight, desk sets for teams. White: gifts that fill the room, trays for weddings. */
const GOLDEN = {
  red: {
    lines: ["A gift", "with weight"],
    body: CONTENT.red.gifting.text,
    corpTitle: "For teams and clients",
    corpBody: "Desk sets from ten, with room for a company card and engraving if you ask. Tell us the occasion, how many and by when.",
    corpCta: "Ask about corporate gifting",
    pieces: ["r-presentation-box", "r-desk-set"],
    deco: PHOTOS.boxRed,
  },
  white: {
    lines: ["A gift that", "fills the room"],
    body: CONTENT.white.gifting.text,
    corpTitle: "For weddings and families",
    corpBody: "Trays packed by hand from ten, with names on the card. Tell us the occasion, how many and by when.",
    corpCta: "Ask about wedding trays",
    pieces: ["w-morning-ritual", "w-boxed-oil"],
    deco: PHOTOS.boxes,
  },
} as const;

function Words({ wood }: { wood: Wood }) {
  const d = GOLDEN[wood];
  return (
    <>
      <Hour min={1025} />
      <Lines lines={[...d.lines]} className={`${s.display} mt-1 text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.94] lg:text-[min(5.2vw,9.6svh)]`} />
      <p className="mt-6 max-w-[31rem] text-[17px] leading-[1.7] text-[var(--muted)]">{d.body}</p>

      <div className="mt-[min(2.5rem,5svh)] max-w-[31rem] border-t border-[var(--hair)] pt-6">
        <h3 className={`${s.display} text-[28px] leading-none lg:text-[30px]`}>{d.corpTitle}</h3>
        <p className="mt-3 text-[16px] leading-[1.65] text-[var(--muted)]">{d.corpBody}</p>
        <button type="button" onClick={openCorporate} className={`${s.ghost} mt-5`}>
          {d.corpCta}
        </button>
      </div>
    </>
  );
}

function Pieces({ wood }: { wood: Wood }) {
  const [a, b] = GOLDEN[wood].pieces;
  return (
    <>
      <Layer speed={0.16} className="self-end lg:absolute lg:right-[2%] lg:top-0 lg:h-full">
        <PieceTag
          slug={a}
          shape="arch"
          side="left"
          className="lg:h-full"
          photoClass="w-[54vw] aspect-[3/4] sm:w-[40vw] lg:w-auto lg:h-full"
          sizes="(min-width: 1024px) 30vw, 54vw"
          labelClass="max-w-[12rem]"
        />
      </Layer>
      <Layer speed={0.7} className="pointer-events-none absolute right-[58%] top-[36%] hidden aspect-square w-[13%] lg:block">
        <Cut photo={GOLDEN[wood].deco} shape="pebble" className="size-full" sizes="120px" drift={0.4} />
      </Layer>
      <Layer speed={0.46} className="lg:absolute lg:left-[1%] lg:top-[3%]">
        <PieceTag slug={b} shape="circle" side="below" photoClass="size-[44vw] sm:size-48 lg:size-[min(21svh,12vw)]" sizes="(min-width: 1024px) 12vw, 44vw" />
      </Layer>
    </>
  );
}

/** 17:05. Golden hour, gifting: two gifts from this wood, and a note on gifting in quantity. */
export function Golden() {
  return (
    <Chapter id="golden" len="200vh" label="Golden hour: gifting">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <Layer speed={0.08} className="flex flex-col justify-center lg:col-span-5">
          <W red={<Words wood="red" />} white={<Words wood="white" />} />
        </Layer>

        <div className="relative flex flex-col gap-14 lg:col-span-7 lg:block lg:h-full">
          {/* low and warm, in the open sky between the two gifts */}
          <SceneSun at={1045} className="left-[14%] top-[64%]" drift={[22, 18]} />
          <W red={<Pieces wood="red" />} white={<Pieces wood="white" />} />
        </div>
      </div>
    </Chapter>
  );
}
