import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, getProduct, PRODUCTS } from "@/lib/shop/products";
import { s } from "../../_components/cls";
import { cx, shopHref } from "../../_components/data";
import { ProductBento } from "../../_components/ProductBento";
import { PairsWith } from "../../_components/Related";
import { Reviews } from "../../_components/Reviews";
import { WoodPage } from "../../_components/WoodPage";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProduct(slug);
  return p ? { title: p.name, description: p.short } : {};
}

/** A product laid out as a bento. The URL decides the piece, so the body sits behind Suspense. */
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className={cx(s.page, "min-h-svh")} />}>
      <Body params={params} />
    </Suspense>
  );
}

const CRUMB = cx(
  "inline-flex h-9 items-center rounded-full bg-[var(--b-tile)] px-4 text-[14px] transition-colors hover:bg-[var(--b-ink)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-[0.97]",
);

async function Body({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = getProduct(slug);
  if (!p) notFound();
  const cat = categoryOf(p);

  return (
    <WoodPage wood={p.wood} counterpart={p.counterpart}>
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2">
        <Link href="/d/06/shop" className={CRUMB}>
          {CONTENT[p.wood].name}
        </Link>
        <Link href={shopHref(cat.id)} className={CRUMB}>
          {cat.label}
        </Link>
        <span className={cx(s.mono, s.muted, "px-1 text-[11px]")} aria-current="page">
          {p.name}
        </span>
      </nav>
      <ProductBento slug={p.slug} mode="page" />
      <Reviews slug={p.slug} />
      <PairsWith slug={p.slug} />
    </WoodPage>
  );
}
