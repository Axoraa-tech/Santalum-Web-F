import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductTile } from "@/components/maison/ProductTile";
import { ProductView } from "@/components/maison/ProductView";
import { W } from "@/components/maison/W";
import { FAMILIES, getFamily } from "@/lib/catalog";

export function generateStaticParams() {
  return FAMILIES.map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const f = getFamily(slug);
  return f ? { title: f.name, description: f.summary } : {};
}

/** The URL decides the product, so the page body sits behind Suspense (keeps navigation instant). */
export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <Product params={params} />
    </Suspense>
  );
}

async function Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = getFamily(slug);
  if (!family) notFound();

  const related = FAMILIES.filter((f) => f.slug !== family.slug && f.category === family.category);
  const more = (related.length >= 3 ? related : [...related, ...FAMILIES.filter((f) => f.slug !== family.slug && f.category !== family.category)]).slice(0, 3);

  return (
    <>
      <ProductView slug={family.slug} />
      <section className="mx-auto max-w-[1500px] px-5 pt-32 md:px-10">
        <h2 className="font-display text-[clamp(2.2rem,4vw,3.6rem)] font-[350] leading-none tracking-[-0.03em]">You may also like</h2>
        <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-14 md:grid-cols-3 md:gap-x-8">
          {more.map((f, i) => (
            <div key={f.slug} className={i === 1 ? "md:mt-20" : ""}>
              <W red={<ProductTile family={f} wood="red" />} white={<ProductTile family={f} wood="white" />} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
