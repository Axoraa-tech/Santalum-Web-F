import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, PRODUCTS } from "@/lib/shop/products";
import { Article } from "../../_components/Article";
import type { IndexItem } from "../../_components/content";
import { SideIndex } from "../../_components/SideIndex";

const SECTIONS: IndexItem[] = [
  { id: "entry", label: "The entry" },
  { id: "specs", label: "Specifications" },
  { id: "story", label: "Story" },
  { id: "care", label: "Care" },
  { id: "letters", label: "Letters" },
  { id: "queries", label: "Queries" },
  { id: "pairs", label: "Pairs with" },
  { id: "colophon", label: "Colophon" },
];

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: `${p.name} — Index — Santalum Maison`, description: p.short } : {};
}

/** A catalogue entry as an editorial article. The URL decides the piece, so the body sits behind Suspense. */
export default function EntryPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="x5-page" style={{ minHeight: "100svh" }} />}>
      <Body params={params} />
    </Suspense>
  );
}

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} back={{ href: "/d/05/shop", label: `Back to the ${p.wood} catalogue` }} heading="Contents" />
      <main className="x5-main">
        <Article key={slug} slug={slug} />
      </main>
    </div>
  );
}
