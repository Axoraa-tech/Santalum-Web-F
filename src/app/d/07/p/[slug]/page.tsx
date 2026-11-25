import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, PRODUCTS } from "@/lib/shop/products";
import { PageFooter } from "../../_components/PageFooter";
import { ProductStack } from "../../_components/ProductStack";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** The URL decides the piece, so the body waits for params behind Suspense. */
export default function StackProduct({ params }: { params: Promise<{ slug: string }> }) {
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
  // The page belongs to the piece's wood: its palette is fixed here even before the site's toggle catches up.
  return (
    <main data-s7-wood={p.wood}>
      <ProductStack key={p.slug} slug={p.slug} />
      <PageFooter />
    </main>
  );
}
