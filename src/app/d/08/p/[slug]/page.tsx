import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { ProductPlate } from "../../_components/ProductPlate";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
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
  const f = getFamily(slug);
  if (!f) notFound();
  return <ProductPlate slug={f.slug} />;
}
