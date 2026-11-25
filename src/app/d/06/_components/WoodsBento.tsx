"use client";

import { motion } from "motion/react";
import { Photo } from "@/components/Photo";
import { W, WT } from "@/components/maison/W";
import { PHOTOS } from "@/lib/photos";
import { CONTENT } from "@/lib/shop/content";
import { productsFor } from "@/lib/shop/products";
import { useHydrated } from "@/lib/shop/store";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx } from "./data";
import { views } from "./store";
import { Corner, Swatch } from "./ui";

const DESC: Record<Wood, string> = {
  red: "Deep red, dense and fine-grained, with almost no scent. From the Seshachalam hills of the Eastern Ghats, and regulated internationally under CITES Appendix II.",
  white: "Pale gold and fragrant; the oil forms in the heartwood after fifteen years or more. Grown in the dry forests of the south, carved and distilled in Mysuru.",
};

const fact = (w: Wood, label: string) => CONTENT[w].facts.find((f) => f.label === label)?.value ?? "";

/**
 * The two woods. The wood you are looking at takes the large tile; switching re-flows the row.
 * Before hydration the layout follows <html data-wood> (CSS); after, `data-w` drives it so motion
 * can animate the re-flow.
 */
export function WoodsBento() {
  const wood = useWood();
  const hydrated = useHydrated();
  const rows: [string, string, string][] = [
    ["Colour", "Brick red to near black", "Pale gold"],
    ["Scent", fact("red", "Scent"), "Warm, long-lasting"],
    ["Oil", "None", "In the heartwood"],
    ["Grows in", "Eastern Ghats", "Karnataka, the south"],
    ["Shop", `${productsFor("red").length} pieces`, `${productsFor("white").length} pieces`],
  ];

  return (
    <section id="woods" aria-label="The two woods" data-w={hydrated ? wood : undefined} className={cx(s.bento, s.woods, s.section)}>
      <WoodTile w="red" />
      <WoodTile w="white" />

      <motion.div layout style={{ gridArea: "cm", borderRadius: 28 }} className={cx(s.tile, "p-5 sm:p-6")}>
        <motion.div layout="position">
          <h2 className="text-[20px] font-medium leading-none tracking-[-0.03em]">
            <WT red="Red, beside white" white="White, beside red" />
          </h2>
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[30%] pb-2">
                  <span className="sr-only">Property</span>
                </th>
                {(["red", "white"] as const).map((w) => (
                  <th key={w} scope="col" className={cx("pb-2 align-bottom", w === "red" ? "b6-colr" : "b6-colw")}>
                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                      <Swatch wood={w} size={12} /> {CONTENT[w].short}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, r, w]) => (
                <tr key={k} className="border-t border-[var(--b-line)]">
                  <th scope="row" className={cx(s.mono, s.muted, "py-2 pr-2 text-[10.5px] font-normal")}>
                    {k}
                  </th>
                  <td className="b6-colr py-2 pr-2 text-[13.5px] leading-tight">{r}</td>
                  <td className="b6-colw py-2 text-[13.5px] leading-tight">{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      <motion.div layout style={{ gridArea: "qt", borderRadius: 28 }} className={cx(s.tile, s.tint, "flex items-end p-5")}>
        <motion.p layout="position" className="text-[clamp(18px,7.4cqw,27px)] font-medium leading-[1.08] tracking-[-0.035em]">
          <WT red="Dense enough that a small piece feels heavy in the hand." white="Four thousand years found its way to you." />
        </motion.p>
      </motion.div>
    </section>
  );
}

function WoodTile({ w }: { w: Wood }) {
  const c = CONTENT[w];
  const id = `woods-${w}`;
  const open = () => views.open({ kind: "story", id: w, from: id, img: true });
  const on = (
    <div>
      <p className="mt-3 hidden text-[15px] leading-[1.5] text-[var(--b-ink2)] @min-[420px]:block">{DESC[w]}</p>
      <div className="mt-3">
        <span className={cx(s.mono, "inline-flex h-[30px] items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[11px]")}>
          <span className="size-1.5 rounded-full bg-accent" aria-hidden />
          Showing this wood
        </span>
      </div>
    </div>
  );
  const off = (
    <div className="mt-3">
      <button type="button" className={cx(s.btn, s.btnSm)} onClick={() => switchWood(w)}>
        Show {c.short.toLowerCase()}
      </button>
    </div>
  );
  return (
    <motion.div layoutId={id} style={{ gridArea: w === "red" ? "rd" : "wt", borderRadius: 28 }} className={cx(s.tile, s.t2, s.opener, "min-h-[300px]")}>
      <motion.div layoutId={`${id}-img`} className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
        <div className={s.zoom}>
          <Photo p={w === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog} sizes="(min-width:1024px) 60vw, 100vw" />
        </div>
      </motion.div>
      <Corner icon="expand" />
      <button type="button" className={s.hit} onClick={open} aria-label={`Read about ${c.name.toLowerCase()}`} />

      <motion.div layout="position" className="absolute bottom-2 left-2 z-[3] w-[min(440px,calc(100%-16px))] rounded-[20px] bg-[var(--b-tile)] p-4 @min-[420px]:p-5">
        <p className="flex items-center gap-2 text-[clamp(19px,5cqw,30px)] font-medium leading-none tracking-[-0.035em]">
          <Swatch wood={w} size={14} />
          {c.name}
        </p>
        <p className={cx(s.mono, s.muted, "mt-2 text-[10.5px]")}>
          {c.latin}, {c.sanskrit}, {c.kannada}
        </p>
        {w === "red" ? <W red={on} white={off} /> : <W red={off} white={on} />}
      </motion.div>
    </motion.div>
  );
}
