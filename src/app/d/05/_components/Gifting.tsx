import Link from "next/link";
import { W, WT } from "@/components/maison/W";
import { CATEGORIES, PRICE_BANDS, priceLabel, productsFor, type Wood } from "@/lib/shop/products";
import { catNo, GIFT, sectionNo } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

function GiftText({ wood }: { wood: Wood }) {
  return (
    <div className="x5-giftText">
      {GIFT[wood].text.map((p) => (
        <p key={p}>{p}</p>
      ))}
    </div>
  );
}

function GiftBands({ wood }: { wood: Wood }) {
  const g = GIFT[wood];
  const cat = CATEGORIES[wood].find((c) => c.id === g.category)!;
  const items = productsFor(wood).filter((p) => p.category === g.category);
  return (
    <div className="x5-bands">
      <p className="x5-bandsHead">{g.bandsHead}</p>
      {PRICE_BANDS.map((b) => {
        const inBand = items.filter((p) => p.price >= b.min && p.price <= b.max);
        if (inBand.length === 0) return null;
        return (
          <div key={b.id} className="x5-bandRow">
            <p className="x5-bandLabel">{b.label}</p>
            <ul>
              {inBand.map((p) => (
                <li key={p.slug}>
                  <Link href={`/d/05/p/${p.slug}`} className="x5-bandLink">
                    <span className="x5-bandNo">{catNo(p)}</span>
                    <span>{p.name}</span>
                    <span className="x5-bandPrice">{priceLabel(p)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
      <Link href={`/d/05/shop?c=${cat.id}`} className="x5-bandsMore">
        All {items.length} gifts in {wood} sandalwood, in the catalogue
      </Link>
    </div>
  );
}

/** Gifting in the current wood: a photograph, the edition's gift line, four short paragraphs and the gifts by price. */
export function Gifting() {
  return (
    <section id="gifting" className="x5-section" aria-labelledby="gifting-title">
      <Head
        id="gifting-title"
        n={sectionNo("gifting")}
        title={
          <>
            Gifts in
            <br />
            <WT red="red" white="white" />
          </>
        }
        meta="Figure 15"
        dek={
          <p>
            <WT
              red="Gifts that are kept: boxes, desk sets for teams, and a casket made nine times a year."
              white="Gifts that are used: ritual sets, oil in a turned box, and trays packed by hand for weddings."
            />
          </p>
        }
      />

      <div className="x5-gift">
        <figure className="x5-giftFig">
          <div className="x5-giftFrame">
            <WPhoto red={GIFT.red.photo} white={GIFT.white.photo} sizes="(min-width: 768px) 40vw, 92vw" />
          </div>
          <figcaption className="x5-caption">
            <b>Fig. 15</b>
            <span>
              <WT red={GIFT.red.caption} white={GIFT.white.caption} />
            </span>
          </figcaption>
        </figure>

        <p className="x5-giftLine">
          <WT red={GIFT.red.line} white={GIFT.white.line} />
          <span className="x5-heroStop">.</span>
        </p>

        <W red={<GiftText wood="red" />} white={<GiftText wood="white" />} />
        <W red={<GiftBands wood="red" />} white={<GiftBands wood="white" />} />
      </div>
    </section>
  );
}
