"use client";

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getOption, getProduct, priceOf } from "@/lib/shop/products";
import { setWoodQuietly, useWood, type Wood } from "@/lib/wood";
import { DELIVERY_LINE, EASE, HOME, PROVENANCE_LINE, SHOP, WOOD_LABEL, otherWood, productHref, shopHref, splitName } from "./copy";
import { OptionPicker } from "./OptionPicker";
import { RatingSummaryLine } from "./Reviews";
import { s } from "./cls";
import { AddButton, ArrowIcon, QtyStepper, Swatch, WishButton } from "./ui";

/** How many of an edition are still to be placed, as an arc. */
function EditionGauge({ left, size }: { left: number; size: number }) {
  const C = 2 * Math.PI * 30;
  return (
    <span className="relative grid size-[76px] shrink-0 place-items-center">
      <svg viewBox="0 0 76 76" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="38" cy="38" r="30" fill="none" stroke="var(--o-line)" strokeWidth="3" />
        <circle cx="38" cy="38" r="30" fill="none" stroke="var(--m-accent)" strokeWidth="3" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - left / size)} />
      </svg>
      <span className="text-center leading-none">
        <span className={`${s.syne} block text-[20px] font-bold tabular-nums`}>{left}</span>
        <span className="block text-[11px] text-[var(--o-muted)]">of {size}</span>
      </span>
    </span>
  );
}

/**
 * The full page for one piece. The photo starts as a circle (a disc from the ring) and,
 * as you scroll, grows and un-masks into a rounded rectangle. The page belongs to the piece's wood.
 */
export function ProductView({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const router = useRouter();
  const reduced = !!useReducedMotion();
  const [shotIdx, setShotIdx] = useState(0);
  const [option, setOption] = useState(product.options?.values[0].id ?? "");
  const [qty, setQty] = useState(1);
  const shot = product.shots[Math.min(shotIdx, product.shots.length - 1)];
  const [name, sub] = splitName(product.name);
  const longest = Math.max(...name.split(" ").map((w) => w.length));
  const cat = categoryOf(product);
  const c = CONTENT[product.wood];
  const twin = product.counterpart ? getProduct(product.counterpart) : undefined;
  const opt = getOption(product, option);

  // Where the knob leads from here: the same piece in the other wood, or that wood's shop.
  const away = product.counterpart ? productHref(product.counterpart) : SHOP;
  const [leavingFor, setLeaving] = useState<Wood | null>(null);
  // Only while the site really shows the other wood: a page brought back by Back (kept alive by the
  // router) sets its own wood again on return, and the cover must not still be up over it.
  const siteWood = useWood();
  const leaving = leavingFor && leavingFor === siteWood && leavingFor !== product.wood ? leavingFor : null;

  // The page belongs to its wood: arriving here sets the site to it, quietly. After that, any turn of
  // the knob (watched on <html data-wood>, so it is seen however the knob is turned) takes the visitor
  // to the twin piece; until that page arrives, a turning disc covers this one so the wrong wood never shows.
  useEffect(() => {
    setWoodQuietly(product.wood);
    router.prefetch(away);
    const root = document.documentElement;
    const mo = new MutationObserver(() => {
      const w: Wood = root.dataset.wood === "white" ? "white" : "red";
      if (w === product.wood) return setLeaving(null);
      setLeaving(w);
      router.push(away);
    });
    mo.observe(root, { attributes: true, attributeFilter: ["data-wood"] });
    return () => mo.disconnect();
  }, [product.wood, away, router]);

  const boxRef = useRef<HTMLDivElement>(null);
  const w = useMotionValue(560);
  const h = useMotionValue(700);
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      w.set(e.contentRect.width);
      h.set(e.contentRect.height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);

  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [0, 520], [0, 1], { clamp: true });
  const clip = useTransform(() => {
    const t = reduced ? 1 : p.get();
    const W = w.get();
    const H = h.get();
    const d = Math.min(W, H) * 0.86;
    const ix = ((W - d) / 2) * (1 - t);
    const iy = ((H - d) / 2) * (1 - t);
    const r = d / 2 + (28 - d / 2) * t;
    return `inset(${iy.toFixed(1)}px ${ix.toFixed(1)}px round ${r.toFixed(1)}px)`;
  });
  const imgScale = useTransform(p, [0, 1], [1.16, 1]);
  const ringOpacity = useTransform(p, [0, 0.4], [1, 0]);
  const ringScale = useTransform(p, [0, 0.4], [1, 1.06]);

  return (
    <article className="px-5 pb-10 pt-28 md:px-10 md:pt-32">
      <div className="mx-auto grid max-w-[1440px] gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-28">
            <div ref={boxRef} className="relative aspect-[4/5] w-full lg:aspect-auto lg:h-[calc(100svh-150px)] lg:min-h-[520px]">
              <motion.div className="absolute inset-0 overflow-hidden bg-[var(--o-floor)]" style={{ clipPath: clip }}>
                <motion.div className="absolute inset-0" style={{ scale: reduced ? 1 : imgScale }}>
                  <AnimatePresence initial={false}>
                    <motion.div key={shot.photo.id + shotIdx} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                      <Photo p={shot.photo} tone={shot.tone} sizes="(min-width: 1024px) 58vw, 100vw" priority />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>
              </motion.div>
              {/* orbit line around the disc, gone once the photo opens out */}
              <motion.div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center" style={{ opacity: ringOpacity, scale: ringScale }}>
                {/* a round frame for the turning ring, so its square box never widens the page as it spins */}
                <span className="block aspect-square w-[min(100%,calc(100svh-150px))] max-h-full overflow-hidden rounded-full">
                  <svg viewBox="0 0 100 100" className={`size-full ${s.spinSlow}`}>
                    <circle cx="50" cy="50" r="48.6" fill="none" stroke="var(--o-ink)" strokeWidth="0.15" strokeDasharray="0.6 1.6" />
                    <circle cx="50" cy="1.4" r="0.9" fill="var(--m-accent)" />
                  </svg>
                </span>
              </motion.div>
              {product.shots.length > 1 && (
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-2 rounded-full bg-[var(--o-bg)]/85 p-1.5 backdrop-blur-md" role="group" aria-label="Photographs">
                  {product.shots.map((sh, i) => (
                    <button
                      key={sh.photo.id + i}
                      type="button"
                      onClick={() => setShotIdx(i)}
                      aria-label={`Show photo ${i + 1}: ${sh.photo.alt}`}
                      aria-pressed={i === shotIdx}
                      className={`relative size-14 overflow-hidden rounded-full bg-[var(--o-floor)] transition-[box-shadow,transform] duration-300 hover:scale-105 ${
                        i === shotIdx ? "shadow-[0_0_0_2px_var(--o-bg),0_0_0_4px_var(--m-accent)]" : ""
                      }`}
                    >
                      <Photo p={sh.photo} tone={sh.tone} sizes="56px" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 lg:pt-6">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[14px]">
            <Link href={`${HOME}#ring`} className="group inline-flex h-9 items-center gap-2 rounded-full border border-[var(--o-line)] px-3.5 text-[var(--o-muted)] transition-colors hover:border-[var(--o-ink)] hover:text-[var(--o-ink)]">
              <ArrowIcon dir="left" className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              The ring
            </Link>
            <Link href={SHOP} className="inline-flex h-9 items-center rounded-full border border-[var(--o-line)] px-3.5 text-[var(--o-muted)] transition-colors hover:border-[var(--o-ink)] hover:text-[var(--o-ink)]">
              Shop
            </Link>
            <Link href={shopHref(cat.id)} className="inline-flex h-9 items-center rounded-full bg-[var(--o-ink)] px-3.5 font-semibold text-white transition-colors hover:bg-black">
              {cat.label}
            </Link>
          </nav>

          <p className="mt-8 flex items-start gap-2 text-[14px] leading-snug text-[var(--o-ink-2)]">
            <Swatch wood={product.wood} className="size-5" />
            <span className="min-w-0 pt-px">
              {WOOD_LABEL[product.wood]}, <i className="whitespace-nowrap">{c.latin}</i> <span className={`${s.deva} whitespace-nowrap text-[var(--o-muted)]`}>{c.sanskrit}</span>
            </span>
          </p>
          <h1
            className={`${s.display} mt-3 text-[length:var(--fm)] lg:text-[length:var(--fd)]`}
            style={{ "--fm": `min(16vw, ${(86 / (longest * 0.86)).toFixed(2)}vw)`, "--fd": `min(5.6rem, ${(36 / (longest * 0.86)).toFixed(2)}vw)` } as React.CSSProperties}
          >
            {name}
          </h1>
          {sub && <p className={`${s.syne} mt-3 text-[22px] font-semibold text-[var(--o-ink-2)]`}>{sub}</p>}
          <div className="mt-4">
            <RatingSummaryLine slug={product.slug} />
          </div>
          {product.badge && (
            <p className={`${s.syne} mt-4 inline-flex rounded-full border border-[var(--m-accent)] px-3 py-1 text-[13px] font-bold text-[var(--m-accent)]`}>{product.badge}</p>
          )}

          <p className="mt-6 text-[18px] leading-relaxed">{product.short}</p>

          <div className="mt-8 rounded-[32px] bg-[var(--o-stone)] p-5 md:p-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className={`${s.syne} text-[36px] font-bold tabular-nums tracking-[-0.03em]`} aria-live="polite">
                {formatINR(priceOf(product, option) * qty)}
              </p>
              <p className="text-right text-[14px] text-[var(--o-muted)]">
                {qty > 1 ? `${qty} × ${formatINR(priceOf(product, option))}` : opt ? opt.label : WOOD_LABEL[product.wood]}
              </p>
            </div>

            {product.options && (
              <div className="mt-5">
                <OptionPicker product={product} value={option} onChange={setOption} />
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-3">
              <QtyStepper value={qty} onChange={setQty} label={product.name} />
              <AddButton product={product} option={option || undefined} qty={qty} className="min-w-[200px] flex-1" />
              <WishButton slug={product.slug} name={product.name} className="size-14" />
            </div>
            <p className="mt-4 flex items-start gap-2.5 text-[14px] leading-snug text-[var(--o-ink-2)]">
              <span aria-hidden className="mt-1.5 size-2 shrink-0 rounded-full bg-[var(--m-accent)]" />
              {DELIVERY_LINE}
            </p>
          </div>

          {product.edition && (
            <div className="mt-6 flex items-center gap-4 rounded-full border border-[var(--o-line)] p-2 pr-6">
              <EditionGauge left={product.edition.left} size={product.edition.size} />
              <p className="text-[15px] leading-snug text-[var(--o-ink-2)]">
                <span className="font-semibold text-[var(--o-ink)]">Edition of {product.edition.size}.</span> {product.edition.left} still to be placed, each numbered and entered in the registry.
              </p>
            </div>
          )}

          <div className="mt-12 space-y-4 text-[17px] leading-relaxed text-[var(--o-ink-2)]">
            {product.story.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>

          <h2 className={`${s.syne} mt-12 text-[18px] font-bold`}>Details</h2>
          <dl className="mt-3 divide-y divide-[var(--o-line)] border-y border-[var(--o-line)]">
            <div className="flex justify-between gap-6 py-3 text-[15px]">
              <dt className="text-[var(--o-muted)]">Wood</dt>
              <dd className="text-right font-medium">
                <i>{c.latin}</i>, {c.origin.region}
              </dd>
            </div>
            {product.details.map((d) => (
              <div key={d.label} className="flex justify-between gap-6 py-3 text-[15px]">
                <dt className="text-[var(--o-muted)]">{d.label}</dt>
                <dd className="text-right font-medium">{d.value}</dd>
              </div>
            ))}
          </dl>

          <h2 className={`${s.syne} mt-10 text-[18px] font-bold`}>Care</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--o-ink-2)]">{product.care}</p>

          <div className="mt-10 flex items-start gap-4 rounded-[28px] border border-[var(--o-line)] p-5">
            <span aria-hidden className={`mt-0.5 size-10 shrink-0 rounded-full ${s.seal}`} />
            <div>
              <p className={`${s.syne} text-[16px] font-bold`}>Provenance</p>
              <p className="mt-1 text-[15px] leading-relaxed text-[var(--o-ink-2)]">{PROVENANCE_LINE[product.wood]}</p>
            </div>
          </div>

          {twin && (
            <Link href={productHref(twin.slug)} className="group mt-6 flex items-center gap-4 rounded-full bg-[var(--o-stone)] p-2 pr-5 transition-colors hover:bg-[var(--o-floor)]">
              <span className="relative flex shrink-0">
                <span className="relative size-14 overflow-hidden rounded-full border-2 border-[var(--o-stone)] bg-[var(--o-floor)]">
                  <Photo p={product.shots[0].photo} tone={product.shots[0].tone} sizes="56px" />
                </span>
                <span className="relative -ml-5 size-14 overflow-hidden rounded-full border-2 border-[var(--o-stone)] bg-[var(--o-floor)]">
                  <Photo p={twin.shots[0].photo} tone={twin.shots[0].tone} sizes="56px" />
                </span>
              </span>
              <span className="min-w-0 flex-1 text-[14px] leading-snug">
                <span className="block text-[var(--o-muted)]">Also in {WOOD_LABEL[otherWood(product.wood)].toLowerCase()}</span>
                <span className={`${s.syne} block text-[16px] font-bold group-hover:underline`}>{twin.name}</span>
              </span>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--o-card)] transition-transform duration-300 group-hover:rotate-[-45deg]">
                <ArrowIcon className="size-4" />
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* the knob was turned: the disc turns over to the other wood while its twin piece loads */}
      <AnimatePresence>
        {leaving && (
          <motion.div
            key="turning"
            role="status"
            aria-live="polite"
            className="fixed inset-0 z-[95] grid place-items-center bg-[var(--o-bg)]/90 px-5 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <div className="flex flex-col items-center text-center">
              <span className="relative grid size-[150px] place-items-center">
                <svg viewBox="0 0 150 150" className={`absolute inset-0 ${s.loader}`} aria-hidden>
                  <circle cx="75" cy="75" r="72" fill="none" stroke="var(--o-line)" strokeWidth="1.5" strokeDasharray="2 5" />
                  <circle cx="75" cy="3" r="3" fill="var(--m-accent)" />
                </svg>
                <motion.span
                  aria-hidden
                  className={`size-[112px] rounded-full shadow-[0_24px_50px_-24px_rgb(25_23_20/0.6)] ${leaving === "red" ? s.woodRed : s.woodWhite}`}
                  initial={reduced ? false : { rotate: -180, scale: 0.7 }}
                  animate={{ rotate: 0, scale: 1 }}
                  transition={{ duration: 0.9, ease: EASE }}
                />
              </span>
              <p className="mt-7 text-[15px] text-[var(--o-muted)]">Turning to {WOOD_LABEL[leaving].toLowerCase()}</p>
              <p className={`${s.display} mt-2 text-[clamp(2.2rem,5vw,3.6rem)]`}>{twin ? splitName(twin.name)[0] : `The ${leaving} shop`}</p>
              <Link href={away} className="mt-7 inline-flex h-12 items-center rounded-full border border-[var(--o-ink)] px-6 text-[15px] font-semibold transition-colors hover:bg-[var(--o-ink)] hover:text-white">
                {twin ? `Open the ${leaving} ${splitName(twin.name)[0]}` : `Open the ${leaving} shop`}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
}
