"use client";

import { usePathname, useRouter } from "next/navigation";
import { useHydrated } from "@/lib/shop/store";
import { useWood, type Wood } from "@/lib/wood";
import { categoriesIn, countIn } from "./content";
import { setPendingWood } from "./store";

const LINE: Record<Wood, { name: string; latin: string; what: string }> = {
  red: { name: "Red sandalwood", latin: "Pterocarpus santalinus", what: "Beads, turned objects, powder, gifts and jewellery." },
  white: { name: "White sandalwood", latin: "Santalum album", what: "Oil and attar, incense, chandan, beads, Mysuru carving and gifts." },
};

/** An address that names no piece: set as a missing entry in the index, with the way back into either edition. */
export function Missing() {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const router = useRouter();
  const wood = useWood();
  const slug = pathname.split("/").filter(Boolean).pop() ?? "";

  const open = (w: Wood) => {
    // the shop takes the chosen wood before it paints (see FollowCategory)
    if (w !== wood) setPendingWood(w);
    router.push("/d/05/shop");
  };

  return (
    <header id="missing" className="x5s-head x5n-head">
      <div className="x5a-meta">
        <p>
          <span>Entry</span>
          <br />
          Not in either edition
        </p>
        <p>
          <span>Looked up</span>
          <br />
          <i className="x5n-slug">{hydrated ? `/${slug}` : " "}</i>
        </p>
        <p>
          <span>The catalogue</span>
          <br />
          {countIn("red")} red, {countIn("white")} white
        </p>
        <p>
          <span>Status</span>
          <br />
          404, no such page
        </p>
      </div>
      <h1 className="x5s-title">
        No entry
        <br />
        <span className="x5s-titleWood">
          by that name<span className="x5-heroStop">.</span>
        </span>
      </h1>
      <p className="x5s-dek">
        The address points to a piece this catalogue does not list. It may have been renamed, or the link was cut short. Every piece is in one of the two editions
        below, numbered in catalogue order.
      </p>

      <ol className="x5n-rows">
        {(["red", "white"] as const).map((w) => (
          <li key={w}>
            <button type="button" className="x5-toShop x5n-row" data-w={w} onClick={() => open(w)}>
              <span className="x5-toShopN">{countIn(w)}</span>
              <span className="x5-toShopText">
                <b>{LINE[w].name}</b>
                <span>
                  <i>{LINE[w].latin}.</i> {LINE[w].what} {countIn(w)} pieces in {categoriesIn(w).length} categories.
                </span>
              </span>
              <span className="x5-toShopGo">Open the {w} catalogue</span>
            </button>
          </li>
        ))}
      </ol>
    </header>
  );
}
