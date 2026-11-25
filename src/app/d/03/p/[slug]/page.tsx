import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, getProduct, PRODUCTS, productsFor, type Product } from "@/lib/shop/products";
import { Medallion } from "../../_components/Medallion";
import { ProductView } from "../../_components/ProductView";
import { Reviews } from "../../_components/Reviews";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: `${p.short} ${CONTENT[p.wood].name}, ${CONTENT[p.wood].latin}.` } : {};
}

/** Three from the same wood: the same category first, then the featured pieces. */
function pairsFor(p: Product) {
  const same = productsFor(p.wood).filter((x) => x.slug !== p.slug && x.category === p.category);
  const rest = productsFor(p.wood).filter((x) => x.slug !== p.slug && x.category !== p.category && x.featured);
  return [...same, ...rest].slice(0, 3);
}

/** A piece on its own page. The URL decides the piece, so the body waits behind Suspense. */
export default function PiecePage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Piece params={params} />
    </Suspense>
  );
}

async function Piece({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = categoryOf(p);
  const pairs = pairsFor(p);
  return (
    <div className="px-4 pb-28 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto max-w-[1360px]">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-3 text-[14px] text-(--muted)">
          <Link href="/d/03/shop" className="transition-colors hover:text-(--ink)">
            Shop
          </Link>
          <Knot />
          <Link href={`/d/03/shop?c=${cat.id}`} className="transition-colors hover:text-(--ink)">
            {cat.label}
          </Link>
          <Knot />
          <span className="text-(--ink)" aria-current="page">
            {p.name}
          </span>
        </nav>
        <ProductView slug={p.slug} mode="page" />
        <Reviews slug={p.slug} wood={p.wood} />

        <section aria-labelledby="pairs-h" className="mt-28 md:mt-36">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="pairs-h" className="s3-serif text-[clamp(2rem,4vw,3.4rem)] leading-none">
              Pairs with
            </h2>
            <Link href={`/d/03/shop?c=${cat.id}`} className="s3-link text-[15px]">
              More {cat.label.toLowerCase()} in {CONTENT[p.wood].name.toLowerCase()}
            </Link>
          </div>
          <div className="-mx-4 mt-10 overflow-x-auto px-4 pb-4 sm:mx-0 sm:overflow-visible sm:px-0">
            <ul className="s3-meds s3-meds-row">
              {pairs.map((x) => (
                <Medallion key={x.slug} p={x} />
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

function Knot() {
  return (
    <span className="flex items-center gap-1.5" aria-hidden>
      <span className="h-px w-5 bg-(--thread)" />
      <span className="s3-knot !h-[7px] !w-[7px]" />
      <span className="h-px w-5 bg-(--thread)" />
    </span>
  );
}
