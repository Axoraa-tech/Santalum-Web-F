import Link from "next/link";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { formatINR, getFamily } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import type { Wood } from "@/lib/wood-boot";
import { productHref, splitName } from "./copy";
import { s } from "./cls";
import { ArrowIcon } from "./ui";

/** Gift picks sit on an orbit around the top of the arch. Angles in degrees, 180 = left, 0 = right. */
const PICKS: { slug: string; deg: number }[] = [
  { slug: "presentation-box", deg: 163 },
  { slug: "japa-mala", deg: 122 },
  { slug: "heartwood-powder", deg: 58 },
  { slug: "cufflinks", deg: 17 },
];

function Pick({ slug, wood }: { slug: string; wood: Wood }) {
  const f = getFamily(slug)!;
  const real = slug === "heartwood-powder" && wood === "white" ? getFamily("heartwood-oil")! : f;
  const v = real.variants[wood]!;
  return (
    <Link href={productHref(real.slug)} className="group flex w-[150px] flex-col items-center text-center">
      <span className="relative block size-[104px] overflow-hidden rounded-full border-[5px] border-white bg-[var(--o-floor)] shadow-[0_18px_40px_-18px_rgb(25_23_20/0.55)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-105">
        <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="104px" />
      </span>
      <span className={`${s.syne} mt-2 text-[15px] font-bold leading-tight tracking-[-0.02em] group-hover:underline`}>{splitName(real.name)[0]}</span>
      <span className="text-[13px] tabular-nums text-[var(--o-muted)]">{formatINR(v.price)}</span>
    </Link>
  );
}

/** Gifting: an arch-shaped photograph with the gift picks orbiting its curve. */
export function Gifting() {
  return (
    <section id="gifting" className="relative overflow-hidden bg-[var(--o-stone)] px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-36">
      <div className="mx-auto grid max-w-[1440px] items-end gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="relative lg:col-span-7">
          <div className="@container relative mx-auto w-[min(100%,440px)] pt-0 lg:mt-[150px] xl:w-[460px]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-[var(--o-floor)]">
              <Photo p={PHOTOS.giftLinen} sizes="(min-width: 1024px) 460px, 90vw" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(25_23_20/0.55)] to-transparent p-6 pt-20 text-white">
                <p className={`${s.syne} text-[18px] font-bold leading-tight`}>Wrapped in linen, kept for years</p>
              </div>
            </div>
            {/* the orbit line that follows the arch */}
            <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="pointer-events-none absolute left-[-22cqw] top-[-22cqw] hidden h-[72cqw] w-[144cqw] lg:block" aria-hidden>
              <path d="M1,50 A49,49 0 0 1 99,50" fill="none" stroke="var(--o-line)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" strokeDasharray="3 5" />
            </svg>
            {PICKS.map((p) => {
              const a = (p.deg * Math.PI) / 180;
              const cos = Math.cos(a).toFixed(4);
              const sin = Math.sin(a).toFixed(4);
              return (
                <div
                  key={p.slug}
                  className="absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
                  style={{ left: `calc(50cqw + ${cos} * 72cqw)`, top: `calc(50cqw - ${sin} * 72cqw)` }}
                >
                  <W red={<Pick slug={p.slug} wood="red" />} white={<Pick slug={p.slug} wood="white" />} />
                </div>
              );
            })}
          </div>
          {/* picks in a row on smaller screens */}
          <div className="mt-10 grid grid-cols-2 justify-items-center gap-y-8 sm:grid-cols-4 lg:hidden">
            {PICKS.map((p) => (
              <W key={p.slug} red={<Pick slug={p.slug} wood="red" />} white={<Pick slug={p.slug} wood="white" />} />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 lg:pb-6">
          <h2 className={`${s.display} text-[clamp(2.2rem,4.6vw,5rem)]`}>Give something that remains.</h2>
          <p className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">
            Sandalwood is kept for years, so we pack it to be kept too: raw cotton or linen, a sandalwood box for malas and jewellery, and the batch record in with the piece.
          </p>
          <ul className="mt-8 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] text-[15px]">
            <li className="flex gap-4 py-4">
              <span className={`${s.syne} w-[150px] shrink-0 font-bold`}>A written card</span>
              <span className="text-[var(--o-ink-2)]">Add your words at checkout, up to 200 characters.</span>
            </li>
            <li className="flex gap-4 py-4">
              <span className={`${s.syne} w-[150px] shrink-0 font-bold`}>No prices inside</span>
              <span className="text-[var(--o-ink-2)]">Ask for the packing slip without prices.</span>
            </li>
            <li className="flex gap-4 py-4">
              <span className={`${s.syne} w-[150px] shrink-0 font-bold`}>Company and wedding orders</span>
              <span className="text-[var(--o-ink-2)]">Tell us how many pieces and the date. We reply with options and prices.</span>
            </li>
          </ul>
          <Link
            href={productHref("presentation-box")}
            className="group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.98]"
          >
            See the presentation box
            <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:rotate-[-45deg]">
              <ArrowIcon />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
