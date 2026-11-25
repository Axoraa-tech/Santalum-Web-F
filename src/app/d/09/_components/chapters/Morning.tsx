"use client";

import { W } from "@/components/maison/W";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { Hour, SceneSun } from "../SceneSun";
import { PieceTag } from "../PieceTag";
import { Chapter, Layer } from "../Scene";

/** The two mornings. Red: the desk. White: the bath, oil and attar. */
const MORNING = {
  red: {
    lines: ["Morning,", "at the desk"],
    body: "A pen, a cup, the keys. The things you touch most often are worth making well. The pen is turned from one billet so the grain runs from cap to tip, and it is heavier than it looks: red sandalwood is one of the densest woods in India.",
    pieces: ["r-coasters", "r-key-fob", "r-writing-pen"],
  },
  white: {
    lines: ["Morning,", "and a drop of oil"],
    body: "After the bath, one drop of heartwood oil at the wrist and the collar. The scent is in oil that forms in the heartwood only after fifteen years or more, so a little lasts the whole day.",
    pieces: ["w-heartwood-oil", "w-chandan-attar", "w-sandalwood-soap"],
  },
} as const;

function Words({ wood }: { wood: Wood }) {
  const d = MORNING[wood];
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-8">
      <Layer speed={0.08} className="lg:col-span-6">
        <Hour min={500} />
        <Lines lines={[...d.lines]} className={`${s.display} mt-1 text-[clamp(3rem,13vw,4.6rem)] leading-[0.92] lg:text-[min(6.2vw,10.5svh)]`} />
      </Layer>
      <Layer speed={0.12} className="lg:col-span-5 lg:col-start-8 lg:pb-2">
        <p className="max-w-[32rem] text-[17px] leading-[1.7] text-[var(--muted)]">{d.body}</p>
      </Layer>
    </div>
  );
}

function Pieces({ wood }: { wood: Wood }) {
  const [a, b, c] = MORNING[wood].pieces;
  return (
    <>
      <Layer speed={0.22} className="lg:absolute lg:left-0 lg:top-[3%] lg:h-[92%]">
        <PieceTag
          slug={a}
          shape="arch"
          side="right"
          className="lg:h-full"
          photoClass="w-[46vw] aspect-[3/4] sm:w-[34vw] lg:w-auto lg:h-full"
          sizes="(min-width: 1024px) 24vw, 46vw"
        />
      </Layer>
      <Layer speed={0.55} className="self-end lg:absolute lg:left-[39%] lg:top-[1%]">
        <PieceTag slug={b} shape="circle" side="right" photoClass="size-[40vw] sm:size-[28vw] lg:size-[min(25svh,15vw)]" sizes="(min-width: 1024px) 15vw, 40vw" />
      </Layer>
      <Layer speed={0.34} className="self-end lg:absolute lg:right-0 lg:top-[12%] lg:h-[84%]">
        <PieceTag
          slug={c}
          shape="pebble"
          side="left"
          className="lg:h-full"
          photoClass="w-[46vw] aspect-[4/5] sm:w-[32vw] lg:w-auto lg:h-full"
          sizes="(min-width: 1024px) 22vw, 46vw"
        />
      </Layer>
    </>
  );
}

/** 08:20. Three small things that are touched every morning, different in each wood. */
export function Morning() {
  return (
    <Chapter id="morning" len="200vh" label="Morning">
      <div className="relative mx-auto flex h-full max-w-[1600px] flex-col px-5 py-16 sm:px-8 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <W red={<Words wood="red" />} white={<Words wood="white" />} />

        <div className="relative mt-14 flex flex-col gap-14 lg:mt-[min(2.5rem,4svh)] lg:block lg:flex-1">
          {/* climbing, in the open sky between the arch and the round piece */}
          <SceneSun at={540} className="left-[31%] top-[25%]" drift={[24, -22]} />
          <span aria-hidden className="absolute inset-x-0 bottom-[3%] hidden h-px bg-[var(--hair)] lg:block" />
          <W red={<Pieces wood="red" />} white={<Pieces wood="white" />} />
        </div>
      </div>
    </Chapter>
  );
}
