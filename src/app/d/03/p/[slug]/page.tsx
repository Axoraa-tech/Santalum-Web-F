import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { ProductDetail } from "../../_components/ProductDetail";
import { StrandStrip } from "../../_components/StrandStrip";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
}

/** A piece on its own page (for direct links). The URL decides the piece, so the body waits behind Suspense. */
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
  return (
    <div className="px-4 pb-28 pt-24 md:px-10 md:pt-32">
      <div className="mx-auto max-w-[1360px]">
        <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-3 text-[14px] text-(--muted)">
          <Link href="/d/03" className="transition-colors hover:text-(--ink)">
            The strand
          </Link>
          <span className="flex items-center gap-1.5" aria-hidden>
            <span className="h-px w-6 bg-(--thread)" />
            <span className="s3-knot !h-[7px] !w-[7px]" />
            <span className="h-px w-6 bg-(--thread)" />
          </span>
          <span className="text-(--ink)">{f.name}</span>
        </nav>
        <ProductDetail slug={f.slug} mode="page" />
        <StrandStrip current={f.slug} />
      </div>
    </div>
  );
}
