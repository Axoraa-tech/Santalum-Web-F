import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { ProductWall } from "../../_components/ProductWall";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: `${f.name} — Santalum Maison`, description: f.summary } : {};
}

/** The URL decides the piece, so the wall sits behind Suspense. */
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getFamily(slug)) notFound();
  return <ProductWall slug={slug} />;
}
