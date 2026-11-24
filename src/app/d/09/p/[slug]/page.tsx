import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { ProductCalm } from "../../_components/ProductCalm";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
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
  const f = getFamily(slug);
  if (!f) notFound();
  return <ProductCalm slug={f.slug} />;
}
