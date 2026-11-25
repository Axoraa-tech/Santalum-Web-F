import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PRODUCTS, featured, getProduct, productsFor, type Product } from "@/lib/shop/products";
import { OrbitRow } from "../../_components/OrbitRow";
import { ProductDisc } from "../../_components/ProductDisc";
import { ProductView } from "../../_components/ProductView";
import { Reviews } from "../../_components/Reviews";
import { s } from "../../_components/cls";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** Three pieces from the same wood: the same range first, then the featured ones. */
function pairsFor(p: Product): Product[] {
  const same = productsFor(p.wood).filter((x) => x.slug !== p.slug && x.category === p.category);
  const more = featured(p.wood).filter((x) => x.slug !== p.slug && x.category !== p.category);
  return [...same, ...more].slice(0, 3);
}

/** The URL decides the piece, so the body waits behind Suspense. */
export default function OrbitProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();
  const pairs = pairsFor(product);
  return (
    <>
      {/* keyed, so turning to the other wood's twin starts a fresh page (photo, option, quantity) */}
      <ProductView key={product.slug} slug={product.slug} />
      <section aria-labelledby="o2-pairs" className="px-5 pt-20 md:px-10 md:pt-28">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col gap-3 border-t border-[var(--o-line)] pt-10 md:flex-row md:items-end md:justify-between">
            <h2 id="o2-pairs" className={`${s.display} text-[clamp(2.4rem,4.6vw,4.4rem)]`}>
              Pairs with
            </h2>
            <p className="max-w-[420px] text-[16px] text-[var(--o-ink-2)]">
              {product.wood === "red" ? "Three more in red sandalwood, chosen to sit beside this one." : "Three more in white sandalwood, chosen to sit beside this one."}
            </p>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-14">
            {pairs.map((p, i) => (
              <li key={p.slug} className={i === 2 ? "max-md:col-span-2 max-md:mx-auto max-md:w-1/2" : ""}>
                <ProductDisc product={p} sizes="(min-width: 768px) 28vw, 44vw" />
              </li>
            ))}
          </ul>
        </div>
      </section>
      <Reviews slug={product.slug} name={product.name} />
      <OrbitRow current={product.slug} wood={product.wood} />
    </>
  );
}
