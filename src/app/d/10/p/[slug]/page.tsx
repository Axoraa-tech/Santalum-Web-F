import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, PRODUCTS } from "@/lib/shop/products";
import { WOOD_KEY } from "@/lib/wood-boot";
import { ProductMore } from "../../_components/ProductMore";
import { ProductView } from "../../_components/ProductView";
import { Reviews } from "../../_components/Reviews";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** A product as its own page: the same typographic view as the takeover, then pairs, its counterpart and the next piece. */
export default function KineticProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  return (
    <div className="pt-24 md:pt-32">
      {/* The page belongs to its piece's wood: set it before paint when the page is loaded directly (the effect in ProductView covers client navigation). */}
      <script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.wood=${JSON.stringify(p.wood)};localStorage.setItem(${JSON.stringify(WOOD_KEY)},${JSON.stringify(p.wood)})}catch(e){}` }} />
      <ProductView slug={slug} mode="page" />
      <Reviews slug={slug} />
      <ProductMore slug={slug} />
    </div>
  );
}
