import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, PRODUCTS } from "@/lib/shop/products";
import { ProductCalm } from "../../_components/ProductCalm";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** One piece, on a calm page whose sky is held at the hour the piece belongs to. */
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
  return <ProductCalm slug={p.slug} />;
}
