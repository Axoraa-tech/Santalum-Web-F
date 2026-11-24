"use client";

import { useMotionValue } from "motion/react";
import Link from "next/link";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily, WOOD_NAMES, type Family } from "@/lib/catalog";
import type { Wood } from "@/lib/wood";
import s from "../styles";
import { AddOrSwitch, WoodChoice } from "./Buy";
import { BY_HOUR, chapterBy, hhmm, hourOf, plain, ritualLine } from "./data";
import { PieceTag } from "./PieceTag";
import { Cut, Layer, Scene } from "./Scene";
import { Sky } from "./Sky";
import { Sundial } from "./Sundial";

/**
 * A piece on its own page: calm, with the sky held at the hour the piece belongs to.
 * Rendered once per wood so the right photographs and prices show before hydration.
 */
export function ProductCalm({ slug }: { slug: string }) {
  const hour = hourOf(slug);
  const minutes = useMotionValue(hour.min);
  const ch = chapterBy(hour.chapter);
  return (
    <>
      <Sky minutes={minutes} />
      <Sundial minutes={minutes} mode="link" />
      <div className="relative mx-auto max-w-[1500px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-32">
        <Link href={`/d/09#ch-${ch.key}`} className={s.link}>
          Back to {ch.name.toLowerCase()}
        </Link>
        <W red={<Body slug={slug} wood="red" />} white={<Body slug={slug} wood="white" />} />
      </div>
    </>
  );
}

function Body({ slug, wood }: { slug: string; wood: Wood }) {
  const f = getFamily(slug);
  if (!f) return null;
  const v = f.variants[wood];
  const other: Wood = wood === "red" ? "white" : "red";
  const shown = v ?? f.variants[other];
  if (!shown) return null;
  const hour = hourOf(slug);
  const ch = chapterBy(hour.chapter);
  const shots = shown.shots;
  const same = BY_HOUR.filter((x) => x.slug !== slug && hourOf(x.slug).chapter === hour.chapter);
  const i = BY_HOUR.findIndex((x) => x.slug === slug);
  const earlier = BY_HOUR[i - 1];
  const later = BY_HOUR[i + 1];

  return (
    <>
      <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Scene className="lg:col-span-6" label="Photographs">
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[34rem] lg:sticky lg:top-28 lg:aspect-auto lg:h-[min(72svh,700px)] lg:max-w-none">
            <Layer speed={0.12} className="absolute left-0 top-0 aspect-[3/4] h-[94%]">
              <Cut photo={shots[0].photo} tone={shots[0].tone} shape="arch" niche priority className="size-full" sizes="(min-width: 1024px) 36vw, 80vw" />
            </Layer>
            {shots[1] && (
              <Layer speed={0.45} className="absolute bottom-0 right-0 aspect-square w-[42%]">
                <Cut photo={shots[1].photo} tone={shots[1].tone} shape="circle" className="size-full" sizes="(min-width: 1024px) 18vw, 42vw" />
              </Layer>
            )}
            {shots[2] && (
              <Layer speed={0.7} className="absolute right-[6%] top-[6%] aspect-square w-[22%]">
                <Cut photo={shots[2].photo} tone={shots[2].tone} shape="pebble" className="size-full" sizes="140px" drift={0.5} />
              </Layer>
            )}
          </div>
        </Scene>

        <div className="lg:col-span-6 lg:pt-6">
          <p className="text-[14px] text-[var(--muted)]">
            <span className={s.tab}>{hhmm(hour.min)}</span>, {ch.name.toLowerCase()}. {ch.theme}
          </p>
          <h1 className={`${s.display} mt-3 text-[clamp(3rem,9vw,6rem)] leading-[0.92]`}>{f.name}</h1>
          <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-[19px]">
            <span className={s.tab}>{formatINR(shown.price)}</span>
            <span className="text-[14px] text-[var(--muted)]">{WOOD_NAMES[v ? wood : other].common}</span>
            {f.edition && <span className="text-[14px] text-[var(--muted)]">{f.edition}</span>}
          </p>
          {!v && (
            <p className="mt-4 max-w-[34rem] text-[15px] leading-[1.6] text-[var(--muted)]">
              This piece is made only in {WOOD_NAMES[other].common.toLowerCase()}. {f.story[0]}
            </p>
          )}

          <div className="mt-8 border-l-2 border-[var(--m-accent)] pl-5">
            <h2 className="text-[13px] text-[var(--muted)]">In the ritual</h2>
            <p className={`${s.display} mt-1.5 text-[clamp(1.4rem,2.4vw,1.85rem)] leading-[1.25]`}>{ritualLine(slug, v ? wood : other)}</p>
          </div>

          <p className="mt-7 max-w-[36rem] text-[17px] leading-[1.7]">{f.summary}</p>
          <p className="mt-2 max-w-[36rem] text-[15px] leading-[1.7] text-[var(--muted)]">{shown.note}</p>

          <div className="mt-8 max-w-[36rem]">
            <WoodChoice slug={slug} wood={wood} />
          </div>
          <div className="mt-6">
            <AddOrSwitch slug={slug} wood={wood} />
          </div>

          <dl className="mt-12 grid max-w-[38rem] gap-x-8 sm:grid-cols-2">
            {f.details.map((d) => (
              <div key={d.label} className="border-t border-[var(--hair)] py-3">
                <dt className="text-[12px] text-[var(--muted)]">{d.label}</dt>
                <dd className="mt-0.5 text-[15px]">{plain(d.value)}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-10 grid max-w-[38rem] gap-8 sm:grid-cols-2">
            <div>
              <h2 className={`${s.display} text-[26px] leading-none`}>How it is made</h2>
              {f.story.map((p) => (
                <p key={p} className="mt-3 text-[15px] leading-[1.7]">
                  {p}
                </p>
              ))}
            </div>
            <div>
              <h2 className={`${s.display} text-[26px] leading-none`}>Care</h2>
              <p className="mt-3 text-[15px] leading-[1.7]">{hour.care}</p>
            </div>
          </div>
        </div>
      </div>

      {same.length > 0 && (
        <section aria-label={`More from ${ch.name.toLowerCase()}`} className="mt-28 border-t border-[var(--hair)] pt-10">
          <h2 className={`${s.display} text-[clamp(2.2rem,5vw,3.4rem)] leading-none`}>Also at this hour</h2>
          <div className="mt-10 flex flex-wrap gap-x-14 gap-y-10">
            {same.map((x, k) => (
              <PieceTag
                key={x.slug}
                slug={x.slug}
                wood={wood}
                shape={k % 2 ? "pebble" : "circle"}
                side="right"
                photoClass="size-32 lg:size-36"
              />
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Earlier and later in the day" className="mt-24 grid gap-6 border-t border-[var(--hair)] pt-10 sm:grid-cols-2">
        {earlier ? <Neighbour f={earlier} wood={wood} dir="Earlier in the day" /> : <span />}
        {later ? <Neighbour f={later} wood={wood} dir="Later in the day" end /> : <span />}
      </nav>
    </>
  );
}

function Neighbour({ f, wood, dir, end = false }: { f: Family; wood: Wood; dir: string; end?: boolean }) {
  const v = f.variants[wood] ?? f.variants[wood === "red" ? "white" : "red"];
  if (!v) return null;
  const sh = v.shots[0];
  return (
    <Link
      href={`/d/09/p/${f.slug}`}
      className={`group flex items-center gap-5 rounded-[2rem] p-2 transition-colors hover:bg-[rgb(255_255_255/0.4)] active:scale-[0.99] ${
        end ? "sm:flex-row-reverse sm:text-right" : ""
      }`}
    >
      <span className={`${s.mask} ${s.circle} size-20 shrink-0`}>
        <span className={`${s.zoom} absolute inset-0 group-hover:scale-[1.06]`}>
          <Photo p={sh.photo} tone={sh.tone} sizes="80px" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-[var(--muted)]">
          {dir}, <span className={s.tab}>{hhmm(hourOf(f.slug).min)}</span>
        </span>
        <span className={`${s.display} mt-1 block text-[26px] leading-tight transition-colors group-hover:text-[var(--m-accent)]`}>{f.name}</span>
      </span>
    </Link>
  );
}
