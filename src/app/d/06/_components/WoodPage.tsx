"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, type ReactNode } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, getProduct, priceLabel, productsFor } from "@/lib/shop/products";
import { setWoodQuietly, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, other, shotsOf } from "./data";
import { Swatch } from "./ui";

/**
 * A product page belongs to its wood. On arrival the site quietly follows it. If the visitor then
 * flips the wood, the page swaps at once (CSS, in the same frame as <html data-wood>) to a board
 * for the same piece in the other wood, built from what the client already knows, while that
 * piece's page loads; without a counterpart it opens the other wood's shop.
 */
export function WoodPage({ wood, counterpart, children }: { wood: Wood; counterpart?: string; children: ReactNode }) {
  const router = useRouter();
  const current = useWood();
  const wrap = useRef<HTMLDivElement>(null);
  const target = counterpart ? `/d/06/p/${counterpart}` : "/d/06/shop";

  useEffect(() => {
    setWoodQuietly(wood);
    // only now may a mismatch between the page and <html data-wood> mean "the visitor switched"
    wrap.current?.setAttribute("data-armed", "");
    router.prefetch(target);
  }, [wood, target, router]);

  useEffect(() => {
    if (document.documentElement.dataset.wood === wood || current === wood) return;
    router.push(target);
  }, [current, wood, target, router]);

  return (
    <div ref={wrap} className="b6-pdpWrap" data-for={wood}>
      {/* the page wears its own wood's palette from the first paint, whatever wood was last chosen */}
      <div className={cx(s.page, "b6-pdpBody")} data-b6w={wood}>
        {children}
      </div>
      <Turning to={other(wood)} slug={counterpart} />
    </div>
  );
}

/** The other wood's piece, laid out like its page: photo, name, price, the rest still settling. */
function Turning({ to, slug }: { to: Wood; slug?: string }) {
  const p = slug ? getProduct(slug) : undefined;
  const c = CONTENT[to];
  const shot = p ? shotsOf(p)[0] : undefined;
  const pieces = productsFor(to).slice(0, 4);
  return (
    <div className={cx(s.page, "b6-pdpTurn")} aria-hidden>
      <div className="flex flex-wrap items-center gap-2">
        <span className="inline-flex h-9 items-center rounded-full bg-[var(--b-tile)] px-4 text-[14px]">{c.name}</span>
        {p && <span className="inline-flex h-9 items-center rounded-full bg-[var(--b-tile)] px-4 text-[14px]">{categoryOf(p).label}</span>}
      </div>
      <div className={cx(s.bento, s.prod)}>
        <div style={{ gridArea: "gl" }} className={cx(s.tile, s.t2, "min-h-[110vw] sm:min-h-[420px]")}>
          {shot ? (
            <Photo p={shot.photo} tone={shot.tone} sizes="(min-width:1024px) 58vw, 100vw" />
          ) : (
            <div className="grid h-full grid-cols-2 gap-1.5 p-1.5">
              {pieces.map((x) => (
                <span key={x.slug} className="relative overflow-hidden rounded-[22px]">
                  <Photo p={shotsOf(x)[0].photo} tone={shotsOf(x)[0].tone} sizes="30vw" />
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ gridArea: "th" }} className={cx(s.tile, "b6-settle h-[88px]")} />
        <div style={{ gridArea: "in" }} className={cx(s.tile, "flex flex-col p-5 sm:p-7")}>
          <span className={cx(s.mono, "inline-flex h-[30px] items-center gap-1.5 self-start rounded-full bg-accent-soft px-3 text-[11px]")}>
            <Swatch wood={to} size={11} />
            {c.name}
          </span>
          <p className={cx(s.display, "mt-6 text-[clamp(36px,8cqw,68px)]")}>{p ? p.name : `The ${c.short.toLowerCase()} shop`}</p>
          <p className={cx(s.mono, s.muted, "mt-2 text-[11px]")}>
            {c.name}, {c.latin}
          </p>
          {p && <p className={cx(s.monoWide, "mt-5 text-[26px] leading-none")}>{priceLabel(p)}</p>}
          <p className="mt-4 max-w-[46ch] text-[17px] leading-[1.5]">{p ? p.short : c.oneLine}</p>
          <div className="mt-auto flex items-center gap-2 pt-7">
            <span className="b6-settle block h-14 flex-1 rounded-full bg-[var(--b-tile2)]" />
            <span className="b6-settle block size-14 rounded-full bg-[var(--b-tile2)]" />
          </div>
        </div>
        <div style={{ gridArea: "lo" }} className="b6-plo">
          {[0, 1, 2].map((i) => (
            <div key={i} className={cx(s.tile, "b6-settle min-h-[220px]", i === 2 && "b6-pcol3")} style={{ animationDelay: `${i * 0.15}s` }} />
          ))}
        </div>
      </div>
    </div>
  );
}
