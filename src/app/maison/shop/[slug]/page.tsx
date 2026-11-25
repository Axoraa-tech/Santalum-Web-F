import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Photo } from "@/components/Photo";
import { WoodDisc } from "@/components/maison/Logo";
import { ProductCard } from "@/components/maison/shop/ProductCard";
import { firstShot } from "@/components/maison/shop/shots";
import { Accordion, FollowWood, ProductBuy, ProductGallery } from "@/components/maison/shop/ProductParts";
import { CONTENT } from "@/lib/shop/content";
import { RatingLine } from "@/components/maison/reviews/Stars";
import { ProductReviews } from "@/components/maison/reviews/ProductReviews";
import { seededRating } from "@/lib/shop/reviews-data";
import { categoryOf, featured, getProduct, priceLabel, productsFor, PRODUCTS, type Product } from "@/lib/shop/products";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/maison/shop/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: `${p.name}, ${CONTENT[p.wood].name.toLowerCase()}`, description: p.short } : {};
}

/** The URL decides the product, so the page body sits behind Suspense (keeps navigation instant). */
export default function ProductPage({ params }: PageProps<"/maison/shop/[slug]">) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <ProductBody params={params} />
    </Suspense>
  );
}

const PROVENANCE: Record<Product["wood"], string> = {
  red: "Arrives with its batch record: species, lot, origin, the initials of the hand that finished it and the date.",
  white: "Arrives with its lot number on the label, and for oils the batch test report in the box.",
};

/** Three from the same wood: the same kind first, then the featured pieces. */
function pairsFor(p: Product) {
  const same = productsFor(p.wood).filter((x) => x.slug !== p.slug && x.category === p.category);
  const rest = featured(p.wood, 12).filter((x) => x.slug !== p.slug && x.category !== p.category);
  return [...same, ...rest].slice(0, 3);
}

async function ProductBody({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const c = CONTENT[p.wood];
  const cat = categoryOf(p);
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;
  const pairs = pairsFor(p);

  return (
    <>
      <FollowWood wood={p.wood} />
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 pt-28 md:px-10 md:pt-32 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-7">
          <ProductGallery p={p} />
        </div>

        <div className="lg:col-span-5 lg:pt-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-[14px] text-(--mz-ink-3)">
            <Link href="/maison/shop" className="hover:text-(--mz-ink)">
              {c.name}
            </Link>
            <span aria-hidden>/</span>
            <Link href={`/maison/shop?c=${cat.id}`} className="hover:text-(--mz-ink)">
              {cat.label}
            </Link>
          </nav>

          <h1 className="mt-6 font-display text-[clamp(2.8rem,5vw,4.8rem)] font-[350] leading-[0.95] tracking-[-0.03em]">{p.name}</h1>
          <a href="#reviews" className="mt-4 inline-flex rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)">
            <RatingLine {...seededRating(p.slug)} size={16} className="text-[15px] underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink)" />
          </a>
          <p className="mt-4 flex items-center gap-2.5 text-[15px] text-(--mz-ink-2)">
            <span className="relative size-5 shrink-0 overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgb(0_0_0/0.12)]">
              <span className={`absolute inset-0 ${p.wood === "red" ? "ring-red" : "ring-white"}`} />
            </span>
            <span>
              {c.name}, <span className="font-display italic">{c.latin}</span>
            </span>
          </p>

          {(p.badge || p.edition) && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {p.badge && (
                <span className={`rounded-full px-3 py-1 text-[13px] ${p.badge === "Edition" || p.badge === "Limited" ? "bg-(--mz-ink) text-(--mz-bg)" : "bg-(--mz-accent-soft) text-(--mz-accent-deep)"}`}>{p.badge}</span>
              )}
              {p.edition && <EditionCount size={p.edition.size} left={p.edition.left} wood={p.wood} />}
            </div>
          )}

          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-(--mz-ink-2)">{p.short}</p>

          <div className="mt-8">
            <ProductBuy p={p} />
          </div>

          <ul className="mt-6 space-y-2.5 text-[14px] leading-snug text-(--mz-ink-2)">
            <li className="flex items-start gap-2.5">
              <WoodDisc className="mt-px size-4 shrink-0" />
              Free delivery across India, 3–5 working days. Express ₹350.
            </li>
            <li className="flex items-start gap-2.5">
              <WoodDisc className="mt-px size-4 shrink-0" />
              {PROVENANCE[p.wood]}
            </li>
          </ul>

          <div className="mt-12 border-t border-(--mz-line)">
            <Accordion title="The piece" open>
              <div className="space-y-3">
                {p.story.map((s) => (
                  <p key={s}>{s}</p>
                ))}
              </div>
            </Accordion>
            <Accordion title="Details">
              <dl>
                <div className="grid grid-cols-[8rem_1fr] gap-4 py-1.5">
                  <dt className="text-(--mz-ink-3)">Material</dt>
                  <dd>
                    {c.name} heartwood, <span className="font-display italic">{c.latin}</span>
                  </dd>
                </div>
                {p.details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[8rem_1fr] gap-4 py-1.5">
                    <dt className="text-(--mz-ink-3)">{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            </Accordion>
            <Accordion title="Care">
              <p>{p.care}</p>
            </Accordion>
            <Accordion title="Provenance">
              <p>{c.provenance.text}</p>
              <p className="mt-3 text-[14px] text-(--mz-ink-3)">{c.regulation}</p>
            </Accordion>
            <Accordion title="Delivery and returns">
              <p>
                Free delivery across India in 3–5 working days, packed by hand. Express delivery in 1–2 working days for ₹350. Unused pieces can be returned within 14 days in their
                original packaging. Numbered editions are final.
              </p>
            </Accordion>
          </div>

          {counterpart && (
            <Link
              href={`/maison/shop/${counterpart.slug}`}
              className="group mt-10 flex items-center gap-4 rounded-full bg-(--mz-surface) p-2 pr-6 transition-colors hover:bg-(--mz-surface-2) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)"
            >
              <span className="relative size-16 shrink-0 overflow-hidden rounded-full">
                <Photo p={firstShot(counterpart).photo} tone={firstShot(counterpart).tone} sizes="72px" />
              </span>
              <span className="min-w-0 flex-1 leading-snug">
                <span className="block text-[13px] text-(--mz-ink-3)">Also in {CONTENT[counterpart.wood].name.toLowerCase()}</span>
                <span className="block truncate font-display text-[20px]">{counterpart.name}</span>
              </span>
              <span className="shrink-0 text-[14px] tabular-nums text-(--mz-ink-2) max-sm:hidden">{priceLabel(counterpart)}</span>
            </Link>
          )}
        </div>
      </div>

      <ProductReviews p={p} />

      <section className="mx-auto max-w-[1500px] px-5 pt-32 md:px-10" aria-labelledby="pairs">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="pairs" className="font-display text-[clamp(2.2rem,4vw,3.6rem)] font-[350] leading-none tracking-[-0.03em]">
            Pairs with
          </h2>
          <Link
            href={`/maison/shop?c=${cat.id}`}
            className="rounded-full text-[15px] text-(--mz-ink-2) underline decoration-(--mz-line) underline-offset-4 hover:text-(--mz-ink) focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-(--mz-accent)"
          >
            More {cat.label.toLowerCase()}
          </Link>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-8">
          {pairs.map((x, i) => (
            <div key={x.slug} className={i === 1 ? "md:mt-20" : i === 2 ? "max-md:col-span-2 max-md:mx-auto max-md:w-1/2 max-md:min-w-[11rem]" : ""}>
              <ProductCard p={x} sizes="(min-width: 768px) 30vw, 50vw" />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/** "7 of 21 left", with the numbers drawn as small slices. */
function EditionCount({ size, left, wood }: { size: number; left: number; wood: Product["wood"] }) {
  return (
    <span className="flex items-center gap-3">
      <span className="flex flex-wrap gap-[3px]" aria-hidden>
        {Array.from({ length: Math.min(size, 25) }, (_, i) => {
          const per = size > 25 ? size / 25 : 1;
          const gone = (i + 1) * per <= size - left;
          return <span key={i} className={`size-2 rounded-full ${gone ? "bg-(--mz-ink)/15" : wood === "red" ? "ring-red" : "ring-white"}`} />;
        })}
      </span>
      <span className="text-[14px] tabular-nums text-(--mz-ink-2)">
        {left} of {size} left
      </span>
    </span>
  );
}
