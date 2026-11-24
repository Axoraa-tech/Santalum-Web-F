"use client";

import { motion } from "motion/react";
import { Photo } from "@/components/Photo";
import { WOOD_NAMES } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { switchWood, useWood } from "@/lib/wood";
import type { Wood } from "@/lib/wood-boot";
import { s } from "./cls";
import { cx, familiesIn } from "./data";
import { views } from "./store";
import { Corner, Swatch } from "./ui";

const DESC: Record<Wood, string> = {
  red: "Deep red, dense and fine-grained, with almost no scent. From the Eastern Ghats, mainly Andhra Pradesh. Regulated internationally under CITES Appendix II.",
  white: "Pale gold and fragrant; the oil is in the heartwood. From the dry forests of southern India, with Mysuru in Karnataka as its traditional craft centre.",
};

/** The two woods. The wood you are looking at takes the large tile; switching re-flows the row. */
export function WoodsBento() {
  const wood = useWood();
  const rows: [string, string, string][] = [
    ["Colour", "Deep red", "Pale gold"],
    ["Scent", "Almost none", "Fragrant"],
    ["Oil", "None", "In the heartwood"],
    ["Grows in", "Eastern Ghats", "Southern India"],
    ["Pieces", String(familiesIn("red").length), String(familiesIn("white").length)],
  ];

  return (
    <section id="woods" aria-label="The two woods" data-w={wood} className={cx(s.bento, s.woods, s.section)}>
      <WoodTile w="red" on={wood === "red"} />
      <WoodTile w="white" on={wood === "white"} />

      <motion.div layout style={{ gridArea: "cm", borderRadius: 28 }} className={cx(s.tile, "p-5 sm:p-6")}>
        <motion.div layout="position">
          <h2 className="text-[20px] font-medium leading-none tracking-[-0.03em]">Side by side</h2>
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr>
                <th scope="col" className="w-[30%] pb-2">
                  <span className="sr-only">Property</span>
                </th>
                {(["red", "white"] as const).map((w) => (
                  <th key={w} scope="col" className={cx("pb-2 align-bottom transition-opacity duration-500", wood === w ? "" : "opacity-45")}>
                    <span className="flex items-center gap-1.5 text-[13px] font-medium">
                      <Swatch wood={w} size={12} /> {w === "red" ? "Red" : "White"}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(([k, r, w]) => (
                <tr key={k} className="border-t border-black/[0.07]">
                  <th scope="row" className={cx(s.mono, s.muted, "py-2 pr-2 text-[10.5px] font-normal")}>
                    {k}
                  </th>
                  <td className={cx("py-2 pr-2 text-[13.5px] leading-tight transition-opacity duration-500", wood === "red" ? "" : "opacity-45")}>{r}</td>
                  <td className={cx("py-2 text-[13.5px] leading-tight transition-opacity duration-500", wood === "white" ? "" : "opacity-45")}>{w}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      <motion.div layout style={{ gridArea: "qt", borderRadius: 28 }} className={cx(s.tile, s.tint, "flex items-end p-5")}>
        <motion.p layout="position" className="text-[clamp(18px,7.4cqw,27px)] font-medium leading-[1.08] tracking-[-0.035em]">
          Four thousand years found its way to you.
        </motion.p>
      </motion.div>
    </section>
  );
}

function WoodTile({ w, on }: { w: Wood; on: boolean }) {
  const n = WOOD_NAMES[w];
  const id = `woods-${w}`;
  const open = () => views.open({ kind: "story", id: w, from: id, img: true });
  return (
    <motion.div
      layoutId={id}
      style={{ gridArea: w === "red" ? "rd" : "wt", borderRadius: 28 }}
      className={cx(s.tile, s.t2, s.opener, "min-h-[300px]")}
    >
      <motion.div layoutId={`${id}-img`} className="absolute inset-0 overflow-hidden" style={{ borderRadius: 28 }}>
        <div className={s.zoom}>
          <Photo p={w === "red" ? PHOTOS.redGrain : PHOTOS.whiteLog} sizes="(min-width:1024px) 60vw, 100vw" />
        </div>
      </motion.div>
      <Corner icon="expand" />
      <button type="button" className={s.hit} onClick={open} aria-label={`Read about ${n.common.toLowerCase()}`} />

      <motion.div
        layout="position"
        className="absolute bottom-2 left-2 z-[3] w-[min(440px,calc(100%-16px))] rounded-[20px] bg-white p-4 @min-[420px]:p-5"
      >
        <p className="flex items-center gap-2 text-[clamp(19px,5cqw,30px)] font-medium leading-none tracking-[-0.035em]">
          <Swatch wood={w} size={14} />
          {n.common}
        </p>
        <p className={cx(s.mono, s.muted, "mt-2 text-[10.5px]")}>
          {n.latin}, {n.sa}
        </p>
        {on && <p className="mt-3 hidden text-[15px] leading-[1.5] text-[#2b2b29] @min-[420px]:block">{DESC[w]}</p>}
        <div className="mt-3">
          {on ? (
            <span className={cx(s.mono, "inline-flex h-[30px] items-center gap-1.5 rounded-full bg-accent-soft px-3 text-[11px]")}>
              <span className="size-1.5 rounded-full bg-accent" aria-hidden />
              Showing this wood
            </span>
          ) : (
            <button type="button" className={cx(s.btn, s.btnSm)} onClick={() => switchWood(w)}>
              Show {w === "red" ? "red" : "white"}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
