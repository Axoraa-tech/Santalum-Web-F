import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CATEGORIES, FAMILIES, getFamily } from "@/lib/catalog";
import { s } from "../../_components/cls";
import { ProductBento } from "../../_components/ProductBento";
import { Related } from "../../_components/Related";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
}

/** A product laid out as a bento. The URL decides the piece, so the body sits behind Suspense. */
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = getFamily(slug);
  if (!family) notFound();
  const cat = CATEGORIES.find((c) => c.key === family.category);

  return (
    <div className={s.page}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
        <Link
          href="/d/06#collection"
          className="inline-flex h-9 items-center rounded-full bg-white px-4 text-[14px] transition-colors hover:bg-[#141414] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]"
        >
          All pieces
        </Link>
        <span className={`${s.mono} ${s.muted} text-[11px]`}>{cat?.label}</span>
      </nav>
      <ProductBento slug={family.slug} mode="page" />
      <Related slug={family.slug} />
    </div>
  );
}
