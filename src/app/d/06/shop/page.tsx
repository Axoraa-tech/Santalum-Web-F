import type { Metadata } from "next";
import { Suspense } from "react";
import { s } from "../_components/cls";
import { ShopBoard } from "../_components/ShopView";

export const metadata: Metadata = { title: "Shop" };

/** The shop. `?c=` deep-links a category; it is read on the server so the board renders with it. */
export default function ShopPage({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  return (
    <div className={s.page}>
      <Suspense fallback={<div className="min-h-svh" />}>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Body({ searchParams }: { searchParams: Promise<{ c?: string | string[] }> }) {
  const { c } = await searchParams;
  return <ShopBoard c={typeof c === "string" ? c : undefined} />;
}
