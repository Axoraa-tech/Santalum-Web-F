"use client";

import { W } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import s from "../../styles";
import { Lines } from "../Lines";
import { PieceTag } from "../PieceTag";
import { Chapter, Cut, Layer } from "../Scene";
import { Smoke } from "../Smoke";

/** 06:10. First light and the tilak: the hero line, heartwood powder and oil. */
export function Dawn() {
  return (
    <Chapter id="dawn" len="190vh" label="Dawn: first light and the tilak">
      <div className="relative mx-auto grid h-full max-w-[1600px] gap-14 px-5 pb-10 pt-28 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-10 lg:pb-[88px] lg:pt-[96px]">
        <Layer speed={0.1} className="relative z-10 flex flex-col justify-center lg:col-span-5">
          <p className={`${s.display} ${s.tab} text-[26px] text-[var(--muted)] lg:text-[30px]`}>06:10</p>
          <Lines
            as="h1"
            lines={["Objects", "time cannot", "repeat"]}
            delay={0.35}
            className={`${s.display} mt-2 text-[clamp(3.5rem,15.5vw,5.6rem)] leading-[0.92] lg:text-[min(7vw,14.5svh)]`}
          />
          <p className="mt-7 max-w-[33rem] text-[17px] leading-[1.7] text-[var(--muted)] lg:mt-[min(2rem,4svh)] lg:text-[18px]">
            Red and white sandalwood from India, made into the small things a day is built around. It begins before sunrise, with a
            pinch of heartwood powder and a little water in the palm.
          </p>
          <p className="mt-8 hidden items-center gap-3 text-[13px] text-[var(--muted)] lg:flex">
            <span aria-hidden className="h-px w-10 bg-[rgb(122_112_103/0.5)]" />
            Scroll, and the day moves on
          </p>
        </Layer>

        <div className="relative grid grid-cols-2 gap-x-4 gap-y-12 lg:col-span-7 lg:block">
          {/* the arch: a temple corridor at first light, smoke rising past it */}
          <Layer speed={0.18} className="relative col-span-2 aspect-[3/4] w-[80%] justify-self-end lg:absolute lg:right-[3%] lg:top-[4%] lg:h-[92%] lg:w-auto">
            <Cut photo={PHOTOS.temple} shape="arch" niche priority className="size-full" sizes="(min-width: 1024px) 32vw, 80vw" />
            <Smoke className="absolute -left-[42%] -top-[34%] bottom-[2%] w-[84%]" originX={0.4} originY={1} />
            <Layer speed={0.32} className="absolute -right-[5%] top-[12%] aspect-square w-[30%] lg:-right-[8%]">
              <W
                red={<Cut photo={PHOTOS.redChip} shape="circle" className="size-full" sizes="160px" drift={0.6} />}
                white={<Cut photo={PHOTOS.whiteLog} shape="circle" className="size-full" sizes="160px" drift={0.6} />}
              />
            </Layer>
          </Layer>

          <Layer speed={0.42} className="relative lg:absolute lg:bottom-0 lg:left-0">
            <W
              red={
                <PieceTag
                  slug="heartwood-powder"
                  wood="red"
                  shape="egg"
                  priority
                  photoClass="w-[40vw] aspect-[4/5] sm:w-48 lg:w-[min(13svh,10vw)]"
                  nameClass="text-[21px] lg:text-[24px]"
                  labelClass="max-w-[15rem] lg:max-w-[11.5rem]"
                />
              }
              white={
                <PieceTag
                  slug="heartwood-powder"
                  wood="white"
                  shape="egg"
                  priority
                  photoClass="w-[40vw] aspect-[4/5] sm:w-48 lg:w-[min(13svh,10vw)]"
                  nameClass="text-[21px] lg:text-[24px]"
                  labelClass="max-w-[15rem] lg:max-w-[11.5rem]"
                />
              }
            />
          </Layer>
          <Layer speed={0.3} className="relative lg:absolute lg:left-0 lg:top-[2%]">
            <W
              red={
                <PieceTag
                  slug="heartwood-oil"
                  wood="red"
                  shape="circle"
                  photoClass="size-[40vw] sm:size-48 lg:size-[min(11svh,9vw)]"
                  nameClass="text-[21px] lg:text-[24px]"
                  labelClass="max-w-[15rem] lg:max-w-[11.5rem]"
                />
              }
              white={
                <PieceTag
                  slug="heartwood-oil"
                  wood="white"
                  shape="circle"
                  photoClass="size-[40vw] sm:size-48 lg:size-[min(11svh,9vw)]"
                  nameClass="text-[21px] lg:text-[24px]"
                  labelClass="max-w-[15rem] lg:max-w-[11.5rem]"
                />
              }
            />
          </Layer>
        </div>
      </div>
    </Chapter>
  );
}
