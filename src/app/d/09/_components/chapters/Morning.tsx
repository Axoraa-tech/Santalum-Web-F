"use client";

import { W } from "@/components/maison/W";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Layer } from "../Scene";

function Coasters({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="coaster-pair"
      wood={wood}
      shape="arch"
      side="right"
      className="lg:h-full"
      photoClass="w-[46vw] aspect-[3/4] sm:w-[34vw] lg:w-auto lg:h-full"
      sizes="(min-width: 1024px) 24vw, 46vw"
    />
  );
}
function KeyFob({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="key-fob"
      wood={wood}
      shape="circle"
      side="right"
      photoClass="size-[40vw] sm:size-[28vw] lg:size-[min(25svh,15vw)]"
      sizes="(min-width: 1024px) 15vw, 40vw"
    />
  );
}
function Incense({ wood }: { wood: Wood }) {
  return (
    <PieceTag
      slug="incense-holder"
      wood={wood}
      shape="pebble"
      side="left"
      className="lg:h-full"
      photoClass="w-[46vw] aspect-[4/5] sm:w-[32vw] lg:w-auto lg:h-full"
      sizes="(min-width: 1024px) 22vw, 46vw"
    />
  );
}

/** 08:20. The desk: three small things that are touched every day. */
export function Morning() {
  return (
    <Chapter id="morning" len="200vh" label="Morning: the desk">
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col px-5 py-16 sm:px-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
          <Layer speed={0.08} className="lg:col-span-6">
            <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>08:20</p>
            <Lines
              lines={["Morning,", "at the desk"]}
              className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6.2vw,10.5svh)]`}
            />
          </Layer>
          <Layer speed={0.12} className="lg:col-span-5 lg:col-start-8 lg:pb-2">
            <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)]">
              Keys, a cup, one stick of incense. The things you touch most often are worth making well. The key fob is cut from
              offcuts of larger work; the two coasters are turned from one length, so they share the same grain.
            </p>
          </Layer>
        </div>

        <div className="relative mt-14 flex flex-col gap-14 lg:mt-[min(2.5rem,4svh)] lg:block lg:flex-1">
          <span aria-hidden className="absolute inset-x-0 bottom-[3%] hidden h-px bg-[var(--hair)] lg:block" />
          <Layer speed={0.22} className="lg:absolute lg:left-0 lg:top-[3%] lg:h-[92%]">
            <W red={<Coasters wood="red" />} white={<Coasters wood="white" />} />
          </Layer>
          <Layer speed={0.55} className="self-end lg:absolute lg:left-[39%] lg:top-[1%]">
            <W red={<KeyFob wood="red" />} white={<KeyFob wood="white" />} />
          </Layer>
          <Layer speed={0.34} className="self-end lg:absolute lg:right-0 lg:top-[12%] lg:h-[84%]">
            <W red={<Incense wood="red" />} white={<Incense wood="white" />} />
          </Layer>
        </div>
      </div>
    </Chapter>
  );
}
