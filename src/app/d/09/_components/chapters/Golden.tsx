"use client";

import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer } from "../Scene";
import { openCorporate } from "../store";

function Box({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="presentation-box"
      wood={wood}
      shape="arch"
      side="left"
      className="lg:h-full"
      photoClass="w-[54vw] aspect-[3/4] sm:w-[40vw] lg:w-auto lg:h-full"
      sizes="(min-width: 1024px) 30vw, 54vw"
      labelClass="max-w-[12rem]"
    />
  );
}
function Cufflinks({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="cufflinks"
      wood={wood}
      shape="circle"
      side="below"
      photoClass="size-[44vw] sm:size-48 lg:size-[min(21svh,12vw)]"
      sizes="(min-width: 1024px) 12vw, 44vw"
    />
  );
}

/** 17:05. Golden hour, gifting: the presentation box, cufflinks, and a note on corporate gifting. */
export function Golden() {
  return (
    <Chapter id="golden" len="200vh" label="Golden hour: gifting">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 py-16 sm:px-8 lg:grid-cols-12 lg:gap-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <Layer speed={0.08} className="flex flex-col justify-center lg:col-span-5">
          <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>17:05</p>
          <Lines
            lines={["Give something", "that remains"]}
            className={`${s.display} mt-1 text-[clamp(2.9rem,12.5vw,4.6rem)] leading-[0.94] lg:text-[min(5.2vw,9.6svh)]`}
          />
          <p className="mt-6 max-w-[31rem] text-[17px] leading-[1.7] text-[var(--muted)]">
            The presentation box is dovetailed, finished by hand and lined in raw cotton, with a drawer for the certificate. Give it
            empty, or filled with a mala, powder or oil.
          </p>

          <div className="mt-[min(2.5rem,5svh)] max-w-[31rem] border-t border-[var(--hair)] pt-6">
            <h3 className={`${s.display} text-[28px] leading-none lg:text-[30px]`}>Corporate gifting</h3>
            <p className="mt-3 text-[15px] leading-[1.65] text-[var(--muted)]">
              For a team, a client list or a wedding: tell us the occasion, how many and by when.
            </p>
            <button type="button" onClick={openCorporate} className={`${s.ghost} mt-5`}>
              Ask about corporate gifting
            </button>
          </div>
        </Layer>

        <div className="relative flex flex-col gap-14 lg:col-span-7 lg:block lg:h-full">
          <Layer speed={0.16} className="self-end lg:absolute lg:right-[2%] lg:top-0 lg:h-full">
            <W red={<Box wood="red" />} white={<Box wood="white" />} />
          </Layer>
          <Layer speed={0.7} className="pointer-events-none absolute right-[58%] top-[36%] hidden aspect-square w-[13%] lg:block">
            <W
              red={<Cut photo={PHOTOS.boxRed} shape="pebble" className="size-full" sizes="120px" drift={0.4} />}
              white={<Cut photo={PHOTOS.boxes} shape="pebble" className="size-full" sizes="120px" drift={0.4} />}
            />
          </Layer>
          <Layer speed={0.46} className="lg:absolute lg:left-[1%] lg:top-[3%]">
            <W red={<Cufflinks wood="red" />} white={<Cufflinks wood="white" />} />
          </Layer>
        </div>
      </div>
    </Chapter>
  );
}
