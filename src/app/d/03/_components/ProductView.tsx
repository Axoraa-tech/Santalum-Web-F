"use client";

import Link from "next/link";
import { useId, useLayoutEffect, useState, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getProduct, priceOf, type Product } from "@/lib/shop/products";
import { setWoodQuietly } from "@/lib/wood";
import { AddToBag, productHref, SHOP, WishBead } from "./bits";
import { ProductRating } from "./Reviews";
import { ui } from "./store";

/** A bead's diameter on screen for an option like "8 mm" (bead sizes only). */
function mm(label: string) {
  const m = label.match(/^(\d+)\s*mm$/);
  return m ? Number(m[1]) : null;
}

/**
 * The full story of a piece: every photograph, price that follows the chosen option, quantity, bag and wishlist,
 * story, details, care, the edition counter, provenance and delivery. Used by the product page and the strand's overlay.
 */
export function ProductView({ slug, mode }: { slug: string; mode: "overlay" | "page" }) {
  const p = getProduct(slug);
  if (!p) return null;
  return <Detail key={slug} p={p} mode={mode} />;
}

function Detail({ p, mode }: { p: Product; mode: "overlay" | "page" }) {
  const [shot, setShot] = useState(0);
  const [option, setOption] = useState<string | undefined>(p.options?.values[0].id);
  const [qty, setQty] = useState(1);
  const id = useId();
  const c = CONTENT[p.wood];
  const cat = categoryOf(p);
  const unit = priceOf(p, option);
  const Title = mode === "page" ? "h1" : "h2";
  const current = p.shots[shot] ?? p.shots[0];
  const counterpart = p.counterpart ? getProduct(p.counterpart) : undefined;
  const varies = p.options && new Set(p.options.values.map((v) => v.price)).size > 1;
  const batch = c.provenance.record[0];

  // the page belongs to its product's wood: the whole site follows it
  useLayoutEffect(() => {
    if (mode === "page") setWoodQuietly(p.wood);
  }, [mode, p.wood]);

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
      {/* photographs */}
      <div className="md:sticky md:top-24 md:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[999px_999px_28px_28px] bg-(--warm)">
          <Photo p={current.photo} tone={current.tone} sizes="(min-width: 768px) 50vw, 100vw" priority={mode === "page"} />
        </div>
        <div className="relative mt-6 flex items-center gap-4 px-2" role="group" aria-label="Photographs">
          <span className="absolute inset-x-0 top-1/2 h-px bg-(--thread)" aria-hidden />
          {p.shots.map((s, k) => (
            <button
              key={`${s.photo.id}-${k}`}
              type="button"
              onClick={() => setShot(k)}
              aria-pressed={k === shot}
              aria-label={`Photograph ${k + 1} of ${p.shots.length}: ${s.photo.alt}`}
              className={`relative h-16 w-16 overflow-hidden rounded-full border-[3px] transition-transform duration-500 hover:scale-105 active:scale-95 md:h-[72px] md:w-[72px] ${
                k === shot ? "border-(--m-accent)" : "border-(--linen)"
              }`}
            >
              <Photo p={s.photo} tone={s.tone} sizes="72px" />
            </button>
          ))}
          <span className="s3-knot relative ml-auto" aria-hidden />
        </div>
      </div>

      {/* the piece */}
      <div>
        <p className="flex flex-wrap items-center gap-3 text-[14px] text-(--muted)">
          <Link href={`${SHOP}?c=${cat.id}`} onClick={ui.closeProduct} className="s3-link text-(--muted)">
            {cat.label}
          </Link>
          {p.badge && <span className="s3-badge">{p.badge}</span>}
        </p>
        <Title className="s3-serif mt-3 text-balance text-[clamp(2.6rem,5.2vw,4.8rem)] leading-[0.94] tracking-[-0.01em]">{p.name}</Title>
        <p className="mt-3 text-[16px] text-(--muted)">
          {c.name}, <i>{c.latin}</i>
        </p>
        <ProductRating slug={p.slug} />
        <p className="s3-lede mt-5 max-w-[34rem]">{p.short}</p>

        {p.options && (
          <fieldset className="mt-8">
            <legend className="text-[14px] text-(--muted)">{p.options.name}</legend>
            <div className="relative mt-3 flex flex-wrap gap-2">
              {p.options.values.map((v) => {
                const d = p.options!.name === "Bead size" ? mm(v.label) : null;
                return (
                  <label key={v.id} className="s3-chip">
                    <input
                      type="radio"
                      name={`${id}-opt`}
                      value={v.id}
                      checked={option === v.id}
                      onChange={() => setOption(v.id)}
                      className="sr-only"
                    />
                    {d && <span className="s3-bead shrink-0" style={{ width: d * 1.5, height: d * 1.5 }} aria-hidden />}
                    <span>{v.label}</span>
                    {varies && <span className="text-[13px] opacity-70">{formatINR(v.price)}</span>}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        <div className="mt-7 border-y border-(--line) py-5">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <span className="s3-serif text-[36px] leading-none tabular-nums" aria-live="polite">
              {formatINR(unit)}
            </span>
            {qty > 1 && <span className="text-[15px] text-(--muted)">{formatINR(unit * qty)} for {qty}</span>}
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <div className="flex h-[46px] items-center rounded-full border border-(--ink)/20" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => setQty((n) => Math.max(1, n - 1))}
                disabled={qty <= 1}
                aria-label="One fewer"
                className="grid h-11 w-11 place-items-center rounded-full text-[18px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10 disabled:opacity-30"
              >
                −
              </button>
              <span className="w-7 text-center text-[16px] tabular-nums" aria-live="polite">
                {qty}
              </span>
              <button
                type="button"
                onClick={() => setQty((n) => Math.min(9, n + 1))}
                disabled={qty >= 9}
                aria-label="One more"
                className="grid h-11 w-11 place-items-center rounded-full text-[18px] transition-colors hover:bg-(--ink)/5 active:bg-(--ink)/10 disabled:opacity-30"
              >
                +
              </button>
            </div>
            <AddToBag slug={p.slug} option={option} qty={qty} />
            <WishBead slug={p.slug} name={p.name} />
          </div>
          <p className="mt-4 flex items-start gap-2.5 text-[15px] leading-[1.5] text-(--ink)/80">
            <span className="s3-knot mt-[6px] shrink-0" aria-hidden />
            Free delivery across India, 3–5 working days. Express {formatINR(350)}.
          </p>
        </div>

        {p.edition && <EditionCounter size={p.edition.size} left={p.edition.left} />}

        <div className="mt-10 max-w-[36rem] space-y-4 text-[16px] leading-[1.7] text-(--ink)/85">
          {p.story.map((s) => (
            <p key={s}>{s}</p>
          ))}
        </div>

        <dl className="mt-10 max-w-[36rem] border-l border-(--thread) pl-6">
          {p.details.map((d) => (
            <Row key={d.label} label={d.label}>
              {d.value}
            </Row>
          ))}
          <Row label="Care">{p.care}</Row>
          <Row label="Wood">
            {c.name}, <i>{c.latin}</i>, {c.origin.region}
          </Row>
          <Row label="Provenance">
            {p.wood === "red"
              ? `Leaves with its batch record: species, lot, origin, who finished it and when (for example, batch ${batch.value}).`
              : `Carries its lot on the label: where the wood came from and when it was distilled or carved (for example, lot ${batch.value}).`}
          </Row>
        </dl>

        {counterpart && (
          <Link
            href={productHref(counterpart.slug)}
            onClick={ui.closeProduct}
            className="group mt-10 flex max-w-[36rem] items-center gap-4 rounded-[24px] border border-(--line) p-4 transition-colors hover:border-(--ink)/40 active:bg-(--ink)/5"
          >
            <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[3px] border-(--warm) shadow-[0_0_0_1px_rgba(176,141,87,0.6)]">
              <Photo p={counterpart.shots[0].photo} tone={counterpart.shots[0].tone} sizes="64px" />
            </span>
            <span className="min-w-0">
              <span className="block text-[14px] text-(--muted)">Also in {CONTENT[counterpart.wood].name.toLowerCase()}</span>
              <span className="s3-serif mt-0.5 block text-[22px] leading-tight transition-colors group-hover:text-(--m-accent)">{counterpart.name}</span>
            </span>
            <span className="s3-bead ml-auto h-4 w-4 shrink-0" data-w={counterpart.wood} aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="relative py-3">
      <span className="s3-knot absolute -left-[29px] top-[19px]" aria-hidden />
      <dt className="text-[13px] text-(--muted)">{label}</dt>
      <dd className="mt-0.5 text-[16px] leading-[1.6]">{children}</dd>
    </div>
  );
}

/** "7 of 21 left": one bead for each number, the ones still to be placed filled. */
function EditionCounter({ size, left }: { size: number; left: number }) {
  return (
    <div className="mt-8 rounded-[24px] bg-(--warm) p-5">
      <p className="flex items-baseline justify-between gap-3">
        <span className="s3-serif text-[24px] leading-none">
          {left} of {size} left
        </span>
        <span className="text-[14px] text-(--muted)">Numbered, entered in the registry</span>
      </p>
      <div className="relative mt-4 flex flex-wrap gap-[5px]" aria-hidden>
        {Array.from({ length: size }, (_, i) => (
          <span key={i} className={`s3-bead h-3 w-3 ${i < size - left ? "opacity-25" : ""}`} />
        ))}
      </div>
    </div>
  );
}
