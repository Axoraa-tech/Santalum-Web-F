"use client";

import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood";
import s from "../../styles";
import { Lines } from "../Lines";
import { Hour, SceneSun } from "../SceneSun";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer } from "../Scene";
import { Smoke } from "../Smoke";

/** The two dawns. Red: the colour of the heartwood at first light. White: the chandan stone before sunrise. */
const DAWN = {
  red: {
    lines: ["Objects", "time cannot", "repeat"],
    size: "text-[clamp(3.5rem,15.5vw,5.6rem)] lg:text-[min(7vw,14.5svh)]",
    body: "Red sandalwood from the Eastern Ghats, turned into the small things a working day is built around. It begins with colour: at first light the heartwood reads brick red, darkening to near black at the core.",
    cue: "Scroll, and the red day moves from the hills to the Vault",
    pieces: ["r-heartwood-powder", "r-heartwood-chips"],
  },
  white: {
    lines: ["The fragrance", "lives in the", "heartwood"],
    size: "text-[clamp(3.1rem,13.6vw,5.2rem)] lg:text-[min(6.1vw,13svh)]",
    body: "White sandalwood from Karnataka: oil, attar, chandan and Mysuru carving. The day begins before sunrise at the chandan stone, with a little water and a stick of heartwood.",
    cue: "Scroll, and the white day moves from the tilak to the lamp",
    pieces: ["w-chandan-stone", "w-chandan-powder"],
  },
} as const;

function Words({ wood }: { wood: Wood }) {
  const d = DAWN[wood];
  return (
    <>
      <Hour min={370} />
      <Lines as="h1" lines={[...d.lines]} delay={0.35} className={`${s.display} mt-2 leading-[0.92] ${d.size}`} />
      <p className="mt-7 max-w-[33rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:mt-[min(2rem,4svh)] lg:text-[18px]">{d.body}</p>
      <p className="mt-8 hidden items-center gap-3 text-[13px] text-[var(--muted)] lg:flex">
        <span aria-hidden className="h-px w-10 bg-[rgb(122_112_103/0.5)]" />
        {d.cue}
      </p>
    </>
  );
}

const TAG = {
  photoLow: "w-[40vw] aspect-[4/5] sm:w-48 lg:w-[min(13svh,10vw)]",
  photoHigh: "size-[40vw] sm:size-48 lg:size-[min(11svh,9vw)]",
  name: "text-[21px] lg:text-[24px]",
  label: "max-w-[15rem] lg:max-w-[11.5rem]",
};

/** 06:10. First light: the hero line and the first two pieces of the wood's day. */
export function Dawn() {
  return (
    <Chapter id="dawn" len="190vh" label="Dawn: first light">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        {/* first light: the sun on the horizon under the opening words, rising a little as the scene holds */}
        <SceneSun at={385} clip rise className="left-[23%] top-full" drift={[0, -40]} />
        <Layer speed={0.1} className="relative z-10 flex flex-col justify-center lg:col-span-5">
          <W red={<Words wood="red" />} white={<Words wood="white" />} />
        </Layer>

        <div className="relative grid grid-cols-2 gap-x-4 gap-y-12 lg:col-span-7 lg:block">
          {/* the arch: red grain at first light, or a temple corridor with the morning smoke rising past it */}
          <Layer speed={0.18} className="relative col-span-2 aspect-[3/4] w-[80%] justify-self-end lg:absolute lg:right-[3%] lg:top-[4%] lg:h-[92%] lg:w-auto">
            <W
              red={<Cut photo={PHOTOS.redGrain} shape="arch" niche priority className="size-full" sizes="(min-width: 1024px) 32vw, 80vw" />}
              white={
                <>
                  <Cut photo={PHOTOS.temple} shape="arch" niche priority className="size-full" sizes="(min-width: 1024px) 32vw, 80vw" />
                  <Smoke className="absolute -left-[42%] -top-[34%] bottom-[2%] w-[84%]" originX={0.4} originY={1} />
                </>
              }
            />
            <Layer speed={0.32} className="absolute -right-[5%] top-[12%] aspect-square w-[30%] lg:-right-[8%]">
              <W
                red={<Cut photo={PHOTOS.redChip} shape="circle" className="size-full" sizes="160px" drift={0.6} />}
                white={<Cut photo={PHOTOS.whiteLog} shape="circle" className="size-full" sizes="160px" drift={0.6} />}
              />
            </Layer>
          </Layer>

          <Layer speed={0.42} className="relative lg:absolute lg:bottom-0 lg:left-0">
            <W
              red={<PieceTag slug={DAWN.red.pieces[0]} shape="egg" priority photoClass={TAG.photoLow} nameClass={TAG.name} labelClass={TAG.label} />}
              white={<PieceTag slug={DAWN.white.pieces[0]} shape="egg" priority photoClass={TAG.photoLow} nameClass={TAG.name} labelClass={TAG.label} />}
            />
          </Layer>
          <Layer speed={0.3} className="relative lg:absolute lg:left-0 lg:top-[2%]">
            <W
              red={<PieceTag slug={DAWN.red.pieces[1]} shape="circle" photoClass={TAG.photoHigh} nameClass={TAG.name} labelClass={TAG.label} />}
              white={<PieceTag slug={DAWN.white.pieces[1]} shape="circle" photoClass={TAG.photoHigh} nameClass={TAG.name} labelClass={TAG.label} />}
            />
          </Layer>
        </div>
      </div>
    </Chapter>
  );
}
