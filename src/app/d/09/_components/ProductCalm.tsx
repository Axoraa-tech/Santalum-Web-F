"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getProduct, priceOf, productsFor, type Product } from "@/lib/shop/products";
import { setWoodQuietly, useWood } from "@/lib/wood";
import s from "../styles";
import { AddToTray, EditionLamps, Keep, OptionPicker, Qty } from "./Buy";
import { PROVENANCE_LINE, byHour, chapterBy, hhmm, hourOf } from "./data";
import { HeldSky } from "./Held";
import { Reviews, useFittedReviews } from "./Reviews";
import { Cut, Layer, Scene } from "./Scene";
import { StarRow } from "./Stars";
import { setWoodRoute } from "./store";

/**
 * A piece on its own page: calm, with the sky held at the hour the piece belongs to in its wood's day.
 * The page belongs to the piece's wood: the site follows it on arrival, and flipping the toggle
 * here goes to the same piece in the other wood (or to the shop if there is none).
 */
export function ProductCalm({ slug }: { slug: string }) {
  const p = getProduct(slug)!;
  const hour = hourOf(slug);
  useFollowWood(p);
  return (
    <>
      <HeldSky min={hour.min} />
      <div className={`${s.swap} relative mx-auto max-w-[1500px] px-5 pt-28 sm:px-8 lg:px-10 lg:pt-32`}>
        <nav aria-label="Back" className="flex flex-wrap gap-x-6 gap-y-2">
          <Link href={`/d/09/shop?c=${p.category}`} className={s.link}>
            {categoryOf(p).label}
          </Link>
          <Link href={`/d/09#ch-${hour.chapter}`} className={s.link}>
            Back to {chapterBy(hour.chapter).name.toLowerCase()}
          </Link>
        </nav>
        <Body key={p.slug} p={p} />
      </div>
    </>
  );
}

function useFollowWood(p: Product) {
  const wood = useWood();
  const router = useRouter();
  useEffect(() => {
    setWoodQuietly(p.wood);
  }, [p.wood]);
  // the toggle here does not recolour this piece: it goes to the piece in the other wood, or to that wood's shop
  useEffect(() => {
    setWoodRoute((next) => (next === p.wood ? null : p.counterpart ? `/d/09/p/${p.counterpart}` : "/d/09/shop"));
    return () => setWoodRoute(null);
  }, [p.wood, p.counterpart]);
  // a change of wood from anywhere else (another tab) takes the visitor across too
  useEffect(() => {
    // `wood` can be a render behind setWoodQuietly; only a change that is really on the page counts
    const live = document.documentElement.dataset.wood === "white" ? "white" : "red";
    if (wood !== live || wood === p.wood) return;
    router.push(p.counterpart ? `/d/09/p/${p.counterpart}` : "/d/09/shop");
  }, [wood, p.wood, p.counterpart, router]);
}

function Body({ p }: { p: Product }) {
  const [option, setOption] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const c = CONTENT[p.wood];
  const hour = hourOf(p.slug);
  const ch = chapterBy(hour.chapter);
  const shots = p.shots;
  const twin = p.counterpart ? getProduct(p.counterpart) : undefined;
  const day = byHour(p.wood);
  const i = day.findIndex((x) => x.slug === p.slug);
  const earlier = day[i - 1];
  const later = day[i + 1];
  const pairs = pairsFor(p);
  const material = p.wood === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog;

  return (
    <>
      <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:gap-10">
        <Scene className="lg:col-span-6" label="Photographs">
          <div className="relative mx-auto aspect-[5/6] w-full max-w-[34rem] lg:sticky lg:top-28 lg:aspect-auto lg:h-[min(72svh,700px)] lg:max-w-none">
            <Layer speed={0.12} className="absolute left-0 top-0 aspect-[3/4] h-[94%]">
              <Cut photo={shots[0].photo} tone={shots[0].tone} shape="arch" niche priority className="size-full" sizes="(min-width: 1024px) 36vw, 80vw" />
            </Layer>
            <Layer speed={0.45} className="absolute bottom-0 right-0 aspect-square w-[42%]">
              {shots[1] ? (
                <Cut photo={shots[1].photo} tone={shots[1].tone} shape="circle" className="size-full" sizes="(min-width: 1024px) 18vw, 42vw" />
              ) : (
                <Cut photo={material} shape="circle" className="size-full" sizes="(min-width: 1024px) 18vw, 42vw" />
              )}
            </Layer>
            {shots[2] && (
              <Layer speed={0.7} className="absolute right-[6%] top-[6%] aspect-square w-[22%]">
                <Cut photo={shots[2].photo} tone={shots[2].tone} shape="pebble" className="size-full" sizes="140px" drift={0.5} />
              </Layer>
            )}
          </div>
        </Scene>

        <div className="lg:col-span-6 lg:pt-6">
          <p className="text-[14px] text-[var(--muted)]">
            <span className={s.tab}>{hhmm(hour.min)}</span>, {ch.name.toLowerCase()}. {ch.theme[p.wood]}
          </p>
          <h1 className={`${s.display} mt-3 text-[clamp(3rem,9vw,6rem)] leading-[0.92]`}>{p.name}</h1>
          <p className="mt-3 text-[15px] text-[var(--muted)]">
            {c.name}, <i>{c.latin}</i>
          </p>
          <HeadRating slug={p.slug} />
          <p className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className={`${s.num} text-[32px] leading-none`}>{formatINR(priceOf(p, option) * qty)}</span>
            {qty > 1 && <span className={`${s.tab} text-[14px] text-[var(--muted)]`}>{formatINR(priceOf(p, option))} each</span>}
            {p.badge && <span className="text-[14px] text-[var(--m-accent)]">{p.badge}</span>}
          </p>

          {hour.use && (
            <div className="mt-8 border-l-2 border-[var(--m-accent)] pl-5">
              <h2 className="text-[13px] text-[var(--muted)]">In the ritual</h2>
              <p className={`${s.display} mt-1.5 text-[clamp(1.4rem,2.4vw,1.85rem)] leading-[1.25]`}>{hour.use}</p>
            </div>
          )}

          <p className="mt-7 max-w-[36rem] text-[17px] leading-[1.7]">{p.short}</p>

          <EditionLamps p={p} className="mt-7" />

          <div className="mt-8 grid max-w-[36rem] gap-7">
            {p.options && <OptionPicker p={p} value={option} onChange={setOption} />}
            <div className="flex flex-wrap items-center gap-3">
              <Qty value={qty} onChange={setQty} label={`Quantity of ${p.name}`} />
              <AddToTray p={p} option={option} qty={qty} />
              <Keep p={p} />
            </div>
          </div>

          <dl className="mt-8 grid max-w-[36rem] gap-3 text-[15px] leading-[1.6]">
            <div className="flex gap-3">
              <dt className="sr-only">Delivery</dt>
              <span aria-hidden className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-[var(--m-accent)]" />
              <dd>Free delivery across India, 3–5 working days. Express ₹350.</dd>
            </div>
            <div className="flex gap-3">
              <dt className="sr-only">Provenance</dt>
              <span aria-hidden className="mt-[0.55rem] size-1.5 shrink-0 rounded-full bg-[var(--m-accent)]" />
              <dd>{PROVENANCE_LINE[p.wood]}</dd>
            </div>
          </dl>

          {twin && (
            <Link
              href={`/d/09/p/${twin.slug}`}
              className="group mt-8 flex max-w-[36rem] items-center gap-4 rounded-full border border-[var(--hair)] p-1.5 pr-5 transition-colors hover:border-[var(--ink)] active:scale-[0.99]"
            >
              <span className={`${s.mask} ${s.circle} size-12 shrink-0`}>
                <Photo p={twin.shots[0].photo} tone={twin.shots[0].tone} sizes="48px" />
              </span>
              <span className="min-w-0 text-[15px] leading-snug">
                <span className="text-[var(--muted)]">Also in {CONTENT[twin.wood].name.toLowerCase()}: </span>
                <span className="transition-colors group-hover:text-[var(--m-accent)]">{twin.name}</span>
              </span>
            </Link>
          )}

          <div className="mt-12 grid max-w-[38rem] gap-8">
            <div>
              <h2 className={`${s.display} text-[28px] leading-none`}>The piece</h2>
              {p.story.map((para) => (
                <p key={para} className="mt-3 text-[16px] leading-[1.7]">
                  {para}
                </p>
              ))}
            </div>
            <dl className="grid gap-x-8 sm:grid-cols-2">
              {p.details.map((d) => (
                <div key={d.label} className="border-t border-[var(--hair)] py-3">
                  <dt className="text-[13px] text-[var(--muted)]">{d.label}</dt>
                  <dd className="mt-0.5 text-[16px]">{d.value}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h2 className={`${s.display} text-[28px] leading-none`}>Care</h2>
              <p className="mt-3 text-[16px] leading-[1.7]">{p.care}</p>
            </div>
          </div>
        </div>
      </div>

      <Reviews slug={p.slug} name={p.name} />

      {pairs.length > 0 && (
        <section aria-labelledby="d09-pairs" className="mt-28 border-t border-[var(--hair)] pt-10">
          <h2 id="d09-pairs" className={`${s.display} text-[clamp(2.2rem,5vw,3.4rem)] leading-none`}>
            Pairs with
          </h2>
          <div className="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {pairs.map((x, k) => (
              <PairCard key={x.slug} p={x} shape={(["circle", "pebble", "egg"] as const)[k % 3]} />
            ))}
          </div>
        </section>
      )}

      <nav aria-label="Earlier and later in the day" className="mt-24 grid gap-6 border-t border-[var(--hair)] pt-10 sm:grid-cols-2">
        {earlier ? <Neighbour p={earlier} dir="Earlier in the day" /> : <span />}
        {later ? <Neighbour p={later} dir="Later in the day" end /> : <span />}
      </nav>
    </>
  );
}

function HeadRating({ slug }: { slug: string }) {
  const { summary } = useFittedReviews(slug);
  if (!summary.count) return null;
  return (
    <a href="#reviews" className="group mt-3 inline-flex items-center gap-2.5 text-[14px]">
      <StarRow value={summary.avg} size={16} className="text-[var(--ink)]" />
      <span className={`${s.tab} transition-colors group-hover:text-[var(--m-accent)]`}>
        {summary.avg.toFixed(1)}
        <span className="sr-only"> out of 5</span>, {summary.count} {summary.count === 1 ? "review" : "reviews"}
      </span>
    </a>
  );
}

/** Three pieces from the same wood: first those used at the same hour, then the same category, then the rest of the day. */
function pairsFor(p: Product): Product[] {
  const all = productsFor(p.wood).filter((x) => x.slug !== p.slug);
  const ch = hourOf(p.slug).chapter;
  const ranked = [
    ...all.filter((x) => hourOf(x.slug).chapter === ch && x.category !== p.category),
    ...all.filter((x) => x.category === p.category),
    ...all.filter((x) => x.featured),
    ...all,
  ];
  return Array.from(new Map(ranked.map((x) => [x.slug, x])).values()).slice(0, 3);
}

function PairCard({ p, shape }: { p: Product; shape: "circle" | "pebble" | "egg" }) {
  return (
    <Link href={`/d/09/p/${p.slug}`} className={`group flex items-end gap-4 ${s.press}`}>
      <span className={`${s.mask} ${s[shape]} size-32 shrink-0 lg:size-36`}>
        <span className={`${s.zoom} absolute inset-0`}>
          <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="144px" />
        </span>
      </span>
      <span className="min-w-0 pb-1">
        <span className={`${s.tab} block text-[12px] text-[var(--muted)]`}>{hhmm(hourOf(p.slug).min)}</span>
        <span className={`${s.display} mt-1 block text-[23px] leading-[1.05] transition-colors group-hover:text-[var(--m-accent)]`}>{p.name}</span>
        <span className={`${s.tab} mt-1 block text-[14px]`}>{formatINR(p.price)}</span>
      </span>
    </Link>
  );
}

function Neighbour({ p, dir, end = false }: { p: Product; dir: string; end?: boolean }) {
  const sh = p.shots[0];
  return (
    <Link
      href={`/d/09/p/${p.slug}`}
      className={`group flex items-center gap-5 rounded-[2rem] p-2 transition-colors hover:bg-[rgb(255_255_255/0.4)] active:scale-[0.99] ${end ? "sm:flex-row-reverse sm:text-right" : ""}`}
    >
      <span className={`${s.mask} ${s.circle} size-20 shrink-0`}>
        <span className={`${s.zoom} absolute inset-0 group-hover:scale-[1.06]`}>
          <Photo p={sh.photo} tone={sh.tone} sizes="80px" />
        </span>
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] text-[var(--muted)]">
          {dir}, <span className={s.tab}>{hhmm(hourOf(p.slug).min)}</span>
        </span>
        <span className={`${s.display} mt-1 block text-[26px] leading-tight transition-colors group-hover:text-[var(--m-accent)]`}>{p.name}</span>
      </span>
    </Link>
  );
}
