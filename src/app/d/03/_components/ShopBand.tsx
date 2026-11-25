import Link from "next/link";
import { W } from "@/components/maison/W";
import { Photo } from "@/components/Photo";
import { CATEGORIES, productsFor, type Product, type Wood } from "@/lib/shop/products";
import { inWords } from "./words";

const COPY: Record<Wood, { h: [string, string]; p: string; link: string }> = {
  red: {
    h: ["Eight pieces above.", "The shop holds the rest."],
    p: "Beads, turned objects, powder, gifting and jewellery in red sandalwood, each category strung on its own thread. Start with one, or see them all.",
    link: "red sandalwood pieces",
  },
  white: {
    h: ["Eight scents above.", "The shop holds the rest."],
    p: "Oil and attar, incense, chandan for the skin, pale beads, Mysuru carving and ritual gifts, each category strung on its own thread.",
    link: "white sandalwood pieces",
  },
};

/** the piece that stands for a category: a featured one if there is one */
function face(list: Product[]) {
  return list.find((p) => p.featured) ?? list[0];
}

/**
 * Below the strand: the curated eight above, the whole shop here. The categories hang from the page thread
 * (wide screens) or are knotted down it (phones), and each opens the shop on that category.
 */
export function ShopBand() {
  return (
    <section id="shop-strands" aria-labelledby="shop-strands-h" className="relative z-[1] px-4 pb-6 pt-24 md:px-10 md:pt-32">
      <W red={<Band wood="red" />} white={<Band wood="white" />} />
    </section>
  );
}

function Band({ wood }: { wood: Wood }) {
  const all = productsFor(wood);
  const cats = CATEGORIES[wood].map((c) => {
    const list = all.filter((p) => p.category === c.id);
    return { ...c, count: list.length, face: face(list) };
  });
  const c = COPY[wood];
  const n = cats.length;
  // wide screens: categories hang from a sagging stretch of the page thread
  const at = cats.map((_, i) => {
    const t = (i + 0.5) / n;
    const x = 6 + t * 88;
    const sag = 1 - Math.pow((t - 0.5) * 2, 2);
    return { x: Math.round(x * 100) / 100, y: Math.round((6 + sag * 9) * 100) / 100, drop: [34, 92, 58, 110, 46, 80][i % 6] };
  });

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <h2 id={`shop-strands-h${wood === "white" ? "-w" : ""}`} className="s3-h2 bg-(--linen) text-[clamp(2.4rem,5.2vw,5.2rem)] md:col-span-7">
          {c.h[0]}
          <br />
          <span className="text-(--muted)">{c.h[1]}</span>
        </h2>
        <p className="s3-lede bg-(--linen) md:col-span-4 md:col-start-9 md:pb-2">{c.p}</p>
      </div>

      {/* wide: the catenary */}
      <div className="relative mt-14 hidden h-[470px] lg:block">
        {/* the page thread comes in from the right and leaves on the left, towards the two woods */}
        <span data-knot className="absolute h-px w-px" style={{ left: "102%", top: "2%" }} aria-hidden />
        {[...at].reverse().map((a, i) => (
          <span key={i} data-knot className="absolute h-px w-px" style={{ left: `${a.x}%`, top: `${a.y}%` }} aria-hidden />
        ))}
        <span data-knot className="absolute h-px w-px" style={{ left: "-2%", top: "2%" }} aria-hidden />
        <ul>
          {cats.map((cat, i) => (
            <li key={cat.id} className="absolute -translate-x-1/2" style={{ left: `${at[i].x}%`, top: `${at[i].y}%` }}>
              <Link href={`/d/03/shop?c=${cat.id}`} className="s3-charm group w-[168px] xl:w-[196px]">
                <span className="s3-knot relative z-[1] -mt-1" aria-hidden />
                <span className="s3-hang-thread" style={{ height: at[i].drop }} aria-hidden />
                <span className="s3-cap" aria-hidden />
                <span className="relative -mt-px block aspect-square w-[128px] overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_color-mix(in_srgb,var(--thread)_70%,transparent),0_24px_40px_-28px_rgba(34,24,15,0.55)] xl:w-[150px]">
                  <Photo p={cat.face.shots[0].photo} tone={cat.face.shots[0].tone} sizes="150px" className="transition-transform duration-1000 group-hover:scale-105" />
                </span>
                <span className="s3-serif mt-3 text-center text-[21px] leading-[1.1] transition-colors group-hover:text-(--m-accent) xl:text-[23px]">
                  {cat.label}
                </span>
                <span className="mt-1 text-[14px] text-(--muted)">
                  {cat.count} {cat.count === 1 ? "piece" : "pieces"}
                </span>
                <span className="mt-1.5 hidden max-w-[190px] text-center text-[14px] leading-[1.45] text-(--ink)/70 xl:block">{cat.line}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* narrow: knotted down the page thread */}
      <ul className="mt-12 lg:hidden">
        {cats.map((cat) => (
          <li key={cat.id} className="relative border-b border-(--line) last:border-b-0">
            <Link href={`/d/03/shop?c=${cat.id}`} className="group grid grid-cols-[20px_72px_1fr] items-center gap-4 py-4 active:opacity-70">
              <span data-knot className="s3-knot relative z-[1] justify-self-center" aria-hidden />
              <span className="relative block h-[72px] w-[72px] overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_color-mix(in_srgb,var(--thread)_70%,transparent)]">
                <Photo p={cat.face.shots[0].photo} tone={cat.face.shots[0].tone} sizes="72px" />
              </span>
              <span className="min-w-0 bg-(--linen)">
                <span className="s3-serif block text-[22px] leading-[1.1] transition-colors group-hover:text-(--m-accent)">{cat.label}</span>
                <span className="mt-0.5 block text-[15px] leading-[1.45] text-(--ink)/70">
                  {cat.count} {cat.count === 1 ? "piece" : "pieces"}. {cat.line}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <div className="relative z-[1] mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-(--line) bg-(--linen) pt-6 lg:mt-2">
        <Link href="/d/03/shop" className="s3-shoplink">
          All {all.length} {c.link}
          <span className="s3-shoplink-thread" aria-hidden>
            <span className="s3-bead" />
          </span>
        </Link>
        <p className="max-w-[30rem] text-[15px] leading-[1.55] text-(--muted)">
          {wood === "red"
            ? `From ${inWords(all.filter((p) => p.price < 3000).length)} pieces under ₹3,000 to the heirloom casket, nine made a year.`
            : `From hand-rolled incense to the 2011 Reserve, fifty numbered vials.`}
        </p>
      </div>
    </div>
  );
}
