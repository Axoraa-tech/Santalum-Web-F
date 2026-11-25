import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { PRODUCTS, getProduct } from "@/lib/shop/products";
import { ProductPlate } from "../../_components/ProductPlate";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** A product as a plate from the atlas: a large photograph with its details on leader lines. */
export default function AtlasProductPage({ params }: { params: Promise<{ slug: string }> }) {
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
  return <ProductPlate slug={p.slug} />;
}
