import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { FAMILIES, getFamily } from "@/lib/catalog";
import { Article } from "../../_components/Article";
import type { IndexItem } from "../../_components/content";
import { SideIndex } from "../../_components/SideIndex";

const SECTIONS: IndexItem[] = [
  { id: "entry", label: "The entry" },
  { id: "specs", label: "Specifications" },
  { id: "story", label: "Story" },
  { id: "care", label: "Care" },
  { id: "more", label: "Other entries" },
  { id: "colophon", label: "Colophon" },
];

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: `${f.name} — Index — Santalum Maison`, description: f.summary } : {};
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
  if (!getFamily(slug)) notFound();
  return (
    <div className="x5-page">
      <SideIndex items={SECTIONS} back heading="Contents" />
      <main className="x5-main">
        <Article key={slug} slug={slug} />
      </main>
    </div>
  );
}
