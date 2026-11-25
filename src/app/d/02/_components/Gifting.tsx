import Link from "next/link";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { PHOTOS, type PhotoRef } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { getProduct, priceLabel, productsFor, type Product, type Wood } from "@/lib/shop/products";
import { productHref, shopHref, splitName } from "./copy";
import { s } from "./cls";
import { ArrowIcon } from "./ui";

/** Gift picks sit on an orbit around the top of the arch. Angles in degrees, 180 = left, 0 = right. */
const DEGS = [163, 122, 58, 17];

const GIFTS: Record<
  Wood,
  { picks: string[]; photo: PhotoRef; caption: string; points: { title: string; text: string }[]; category: string; cta: string }
> = {
  red: {
    picks: ["r-presentation-box", "r-mala-box", "r-desk-set", "r-heirloom-casket"],
    photo: PHOTOS.giftLinen,
    caption: "Hinged, dovetailed, lined in raw cotton",
    points: [
      { title: "A written card", text: "Add your words at checkout, up to 200 characters, on a card inside the box." },
      { title: "Desk sets for teams", text: "Pen, coasters and key fob in one box, from ten sets. Ask us about engraving." },
      { title: "The heirloom casket", text: "Carved by one hand over five weeks. Nine are made a year, each numbered." },
    ],
    category: "gifting",
    cta: "All red sandalwood gifts",
  },
  white: {
    picks: ["w-morning-ritual", "w-boxed-oil", "w-wedding-tray", "w-mysuru-fan"],
    photo: PHOTOS.diyaHands,
    caption: "For weddings, housewarmings and the puja",
    points: [
      { title: "A written card", text: "Add your words at checkout, up to 200 characters, on a card inside the box." },
      { title: "Wedding trays", text: "Attar, chandan, a wrist mala and a lamp on a turned tray, from ten trays." },
      { title: "The Morning Ritual", text: "Stone, stick, five millilitres of oil and cotton wicks, in one linen-wrapped box." },
    ],
    category: "w-gifting",
    cta: "All white sandalwood gifts",
  },
};

function Pick({ p }: { p: Product }) {
  return (
    <Link href={productHref(p.slug)} className="group flex w-[150px] flex-col items-center text-center">
      <span className="relative block size-[104px] overflow-hidden rounded-full border-[5px] border-white bg-[var(--o-floor)] shadow-[0_18px_40px_-18px_rgb(25_23_20/0.55)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1.5 group-hover:scale-105">
        <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="104px" />
      </span>
      <span className={`${s.syne} mt-2 text-[15px] font-bold leading-tight tracking-[-0.02em] group-hover:underline`}>{splitName(p.name)[0]}</span>
      <span className="text-[13px] tabular-nums text-[var(--o-muted)]">{priceLabel(p)}</span>
    </Link>
  );
}

function Gift({ wood }: { wood: Wood }) {
  const g = GIFTS[wood];
  const c = CONTENT[wood];
  const picks = g.picks.map((slug) => getProduct(slug)!);
  const count = productsFor(wood).filter((p) => p.category === g.category).length;
  return (
    <div className="mx-auto grid max-w-[1440px] items-end gap-14 lg:grid-cols-12 lg:gap-10">
      <div className="relative lg:col-span-7">
        <div className="@container relative mx-auto w-[min(100%,440px)] pt-0 lg:mt-[150px] xl:w-[460px]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-full bg-[var(--o-floor)]">
            <Photo p={g.photo} sizes="(min-width: 1024px) 460px, 90vw" />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgb(25_23_20/0.55)] to-transparent p-6 pt-20 text-white">
              <p className={`${s.syne} text-[18px] font-bold leading-tight`}>{g.caption}</p>
            </div>
          </div>
          {/* the orbit line that follows the arch */}
          <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="pointer-events-none absolute left-[-22cqw] top-[-22cqw] hidden h-[72cqw] w-[144cqw] lg:block" aria-hidden>
            <path d="M1,50 A49,49 0 0 1 99,50" fill="none" stroke="var(--o-line)" strokeWidth="0.25" vectorEffect="non-scaling-stroke" strokeDasharray="3 5" />
          </svg>
          {picks.map((p, i) => {
            const a = (DEGS[i] * Math.PI) / 180;
            const cos = Math.cos(a).toFixed(4);
            const sin = Math.sin(a).toFixed(4);
            return (
              <div
                key={p.slug}
                className="absolute z-10 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
                style={{ left: `calc(50cqw + ${cos} * 72cqw)`, top: `calc(50cqw - ${sin} * 72cqw)` }}
              >
                <Pick p={p} />
              </div>
            );
          })}
        </div>
        {/* picks in a row on smaller screens */}
        <div className="mt-10 grid grid-cols-2 justify-items-center gap-y-8 sm:grid-cols-4 lg:hidden">
          {picks.map((p) => (
            <Pick key={p.slug} p={p} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-5 lg:pb-6">
        <h2 className={`${s.display} text-[clamp(2.2rem,4.6vw,5rem)]`}>{c.gifting.title}</h2>
        <p className="mt-6 max-w-[460px] text-[17px] leading-relaxed text-[var(--o-ink-2)]">{c.gifting.text}</p>
        <ul className="mt-8 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)] text-[15px]">
          {g.points.map((pt) => (
            <li key={pt.title} className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-4">
              <span className={`${s.syne} shrink-0 font-bold sm:w-[170px]`}>{pt.title}</span>
              <span className="text-[var(--o-ink-2)]">{pt.text}</span>
            </li>
          ))}
        </ul>
        <Link
          href={shopHref(g.category)}
          className="group mt-8 inline-flex h-14 items-center gap-3 rounded-full bg-[var(--o-ink)] pl-7 pr-2 text-[15px] font-semibold text-white transition-colors hover:bg-black active:scale-[0.98]"
        >
          {g.cta}, {count} pieces
          <span className="grid size-10 place-items-center rounded-full bg-[var(--m-accent)] transition-transform duration-300 group-hover:rotate-[-45deg]">
            <ArrowIcon />
          </span>
        </Link>
      </div>
    </div>
  );
}

/** Gifting: an arch-shaped photograph with the wood's gift pieces orbiting its curve. */
export function Gifting() {
  return (
    <section id="gifting" className="relative overflow-hidden bg-[var(--o-stone)] px-5 pb-24 pt-24 md:px-10 md:pb-32 md:pt-36">
      <W red={<Gift wood="red" />} white={<Gift wood="white" />} />
    </section>
  );
}
