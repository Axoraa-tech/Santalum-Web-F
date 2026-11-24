import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { ProductMore } from "../../_components/ProductMore";
import { ProductView } from "../../_components/ProductView";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
}

/** A product as its own page: the same typographic view as the takeover, then the next piece and the rest of the wood. */
export default function KineticProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getFamily(slug)) notFound();
  return (
    <div className="pt-24 md:pt-32">
      <ProductView slug={slug} mode="page" />
      <ProductMore slug={slug} />
    </div>
  );
}
