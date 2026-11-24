"use client";

import Link from "next/link";
import { useState } from "react";
import { Photo } from "@/components/Photo";
import { CATEGORIES, FAMILIES, formatINR, getFamily, WOOD_NAMES, type Family, type Variant } from "@/lib/catalog";
import { switchWood, useWood, type Wood } from "@/lib/wood";
import { AddToBag } from "./bits";
import { ui } from "./store";

const CARE: Record<string, string> = {
  "heartwood-oil": "Store upright, away from heat and light. Dilute before use on skin and patch-test first.",
  "heartwood-powder": "Keep the jar closed and away from damp. Use a dry spoon. Patch-test before use on skin.",
  "japa-mala": "Take it off before bathing. Wipe with a soft dry cloth; the beads darken and smooth with use.",
  "bead-bracelet": "Take it off before bathing or swimming. Roll it off rather than pulling, to spare the cord.",
};
const CARE_DEFAULT = "Keep it dry and out of long direct sun. Wipe with a soft dry cloth; a drop of natural oil once a season keeps the surface fed.";

/** The full story of a piece: photos, both woods, price, story, details, care. Used by the overlay and the page. */
export function ProductDetail({ slug, mode }: { slug: string; mode: "overlay" | "page" }) {
  const wood = useWood();
  const f = getFamily(slug);
  if (!f) return null;
  const other: Wood = wood === "red" ? "white" : "red";
  const shown: Wood = f.variants[wood] ? wood : other;
  return <Detail key={`${slug}-${shown}`} f={f} v={f.variants[shown]!} wood={wood} shown={shown} mode={mode} />;
}

function Detail({ f, v, wood, shown, mode }: { f: Family; v: Variant; wood: Wood; shown: Wood; mode: "overlay" | "page" }) {
  const [shot, setShot] = useState(0);
  const cat = CATEGORIES.find((c) => c.key === f.category)?.label;
  const Title = mode === "page" ? "h1" : "h2";
  const current = v.shots[shot] ?? v.shots[0];
  const onStrand = FAMILIES.filter((x) => x.variants[wood]);
  const i = onStrand.findIndex((x) => x.slug === f.slug);
  const prev = i > 0 ? onStrand[i - 1] : null;
  const next = i >= 0 && i < onStrand.length - 1 ? onStrand[i + 1] : null;

  return (
    <div className="grid gap-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-14 lg:gap-20">
      {/* photographs */}
      <div className="md:sticky md:top-24 md:self-start">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[999px_999px_28px_28px] bg-(--warm)">
          <Photo p={current.photo} tone={current.tone} sizes="(min-width: 768px) 50vw, 100vw" priority={mode === "page"} />
        </div>
        <div className="relative mt-6 flex items-center gap-4 px-2" role="group" aria-label="Photographs">
          <span className="absolute inset-x-0 top-1/2 h-px bg-(--thread)" aria-hidden />
          {v.shots.map((s, k) => (
            <button
              key={`${s.photo.id}-${k}`}
              type="button"
              onClick={() => setShot(k)}
              aria-pressed={k === shot}
              aria-label={`Photograph ${k + 1} of ${v.shots.length}: ${s.photo.alt}`}
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
        <p className="text-[14px] text-(--muted)">
          {[cat, f.edition].filter(Boolean).join(", ")}
        </p>
        <Title className="s3-serif mt-3 text-balance text-[clamp(2.6rem,5.2vw,4.8rem)] leading-[0.94] tracking-[-0.01em]">{f.name}</Title>
        <p className="s3-lede mt-5 max-w-[34rem]">{f.summary}</p>

        <fieldset className="mt-9">
          <legend className="text-[13px] text-(--muted)">Wood</legend>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["red", "white"] as Wood[]).map((w) => {
              const vv = f.variants[w];
              const on = shown === w;
              return (
                <button
                  key={w}
                  type="button"
                  disabled={!vv}
                  aria-pressed={on}
                  onClick={() => w !== wood && switchWood(w)}
                  className={`flex items-center gap-3 rounded-[22px] border p-3.5 text-left transition-colors duration-300 active:scale-[0.99] ${
                    on ? "border-(--ink) bg-(--warm)" : "border-(--line) hover:border-(--ink)/40"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  <span className="s3-bead h-7 w-7 shrink-0" data-w={w} aria-hidden />
                  <span className="min-w-0">
                    <span className="block text-[15px] leading-tight">{WOOD_NAMES[w].common}</span>
                    <span className="mt-0.5 block text-[13px] text-(--muted)">{vv ? formatINR(vv.price) : "Not made in this wood"}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>
        <p className="mt-4 text-[15px] text-(--ink)/75">{v.note}</p>
        {shown !== wood && (
          <p className="mt-2 text-[14px] text-(--m-accent)">
            This piece is made in {WOOD_NAMES[shown].common.toLowerCase()} only.
          </p>
        )}

        <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-4 border-y border-(--line) py-5">
          <span className="s3-serif text-[34px] leading-none">{formatINR(v.price)}</span>
          <AddToBag slug={f.slug} wood={wood} />
        </div>

        <div className="mt-10 max-w-[36rem] space-y-4 text-[16px] leading-[1.7] text-(--ink)/85">
          {f.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <dl className="mt-10 max-w-[36rem] border-l border-(--thread) pl-6">
          {f.details.map((d) => (
            <div key={d.label} className="relative py-3">
              <span className="s3-knot absolute -left-[29px] top-[19px]" aria-hidden />
              <dt className="text-[13px] text-(--muted)">{d.label}</dt>
              <dd className="mt-0.5 text-[16px]">{d.value}</dd>
            </div>
          ))}
          <div className="relative py-3">
            <span className="s3-knot absolute -left-[29px] top-[19px]" aria-hidden />
            <dt className="text-[13px] text-(--muted)">Care</dt>
            <dd className="mt-0.5 text-[16px] leading-[1.6]">{CARE[f.slug] ?? CARE_DEFAULT}</dd>
          </div>
          <div className="relative py-3">
            <span className="s3-knot absolute -left-[29px] top-[19px]" aria-hidden />
            <dt className="text-[13px] text-(--muted)">Wood</dt>
            <dd className="mt-0.5 text-[16px]">
              {WOOD_NAMES[shown].common}, <i>{WOOD_NAMES[shown].latin}</i>, {WOOD_NAMES[shown].origin}
            </dd>
          </div>
        </dl>

        {(prev || next) && (
          <nav aria-label="Neighbours on the strand" className="mt-12 grid grid-cols-2 gap-3">
            {[prev, next].map((n, k) =>
              n ? (
                mode === "page" ? (
                  <Link
                    key={n.slug}
                    href={`/d/03/p/${n.slug}`}
                    className={`group rounded-[22px] border border-(--line) p-4 transition-colors hover:border-(--ink)/40 ${k === 1 ? "text-right" : ""}`}
                  >
                    <span className="block text-[13px] text-(--muted)">{k === 0 ? "Before it on the strand" : "After it on the strand"}</span>
                    <span className="s3-serif mt-1 block text-[20px] leading-tight transition-colors group-hover:text-(--m-accent)">{n.name}</span>
                  </Link>
                ) : (
                  <button
                    key={n.slug}
                    type="button"
                    onClick={() => ui.openProduct(n.slug)}
                    className={`group rounded-[22px] border border-(--line) p-4 text-left transition-colors hover:border-(--ink)/40 ${k === 1 ? "text-right" : ""}`}
                  >
                    <span className="block text-[13px] text-(--muted)">{k === 0 ? "Before it on the strand" : "After it on the strand"}</span>
                    <span className="s3-serif mt-1 block text-[20px] leading-tight transition-colors group-hover:text-(--m-accent)">{n.name}</span>
                  </button>
                )
              ) : (
                <span key={k} />
              ),
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
