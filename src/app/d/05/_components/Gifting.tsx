"use client";

import Link from "next/link";
import { WT } from "@/components/maison/W";
import { formatINR } from "@/lib/catalog";
import { PHOTOS } from "@/lib/photos";
import { useWood } from "@/lib/wood";
import { familiesIn, sectionNo } from "./content";
import { Head } from "./Head";
import { WPhoto } from "./WPhoto";

const BANDS = [
  { label: `Under ${formatINR(2500)}`, test: (p: number) => p < 2500 },
  { label: `${formatINR(2500)} to ${formatINR(7500)}`, test: (p: number) => p >= 2500 && p <= 7500 },
  { label: `Above ${formatINR(7500)}`, test: (p: number) => p > 7500 },
];

/** Gifting: two columns of text beside a large photograph, and the catalogue regrouped by price. */
export function Gifting() {
  const wood = useWood();
  const all = familiesIn(wood);

  return (
    <section id="gifting" className="x5-section" aria-labelledby="gifting-title">
      <Head
        id="gifting-title"
        n={sectionNo("gifting")}
        title="Gifting"
        meta="Figure 15"
        dek={<p>Personal gifts, gifts for occasions, and corporate orders in quantity.</p>}
      />

      <div className="x5-gift">
        <figure className="x5-giftFig">
          <div className="x5-giftFrame">
            <WPhoto red={{ p: PHOTOS.boxCarved }} white={{ p: PHOTOS.giftLinen }} sizes="(min-width: 768px) 40vw, 92vw" />
          </div>
          <figcaption className="x5-caption">
            <b>Fig. 15</b>
            <WT red="A hand-carved box, ready to give." white="A gift wrapped in linen, in a wooden tray." />
          </figcaption>
        </figure>

        <p className="x5-giftLine">
          Give something that remains<span className="x5-heroStop">.</span>
        </p>

        <div className="x5-giftText">
          <p>
            A gift in sandalwood is kept. The presentation box is made for that: dovetailed, hand-finished, lined in raw cotton, with a
            brass clasp and a drawer for the certificate. Choose it empty, or ask us to fill it with a mala, powder or oil.
          </p>
          <p>
            Every gift leaves with its batch record, so the person who receives it knows what they hold. At checkout you can add a
            message and ask us to leave the prices off the slip.
          </p>
          <p>
            For companies, write with the number of pieces and the date you need them. We suggest pieces from this catalogue, quote per
            piece, and say plainly what can be made in time.
          </p>
          <p>
            Weddings, housewarmings and pujas ask for different things. A pair of coasters for a new home; a mala for someone who
            counts; a jar of powder for the morning tilak. The list below regroups the catalogue by what you mean to spend.
          </p>
        </div>

        <div className="x5-bands">
          <p className="x5-bandsHead">The catalogue by price, in <WT red="red" white="white" /> sandalwood</p>
          {BANDS.map((b) => {
            const items = all.filter(({ f }) => b.test(f.variants[wood]!.price));
            if (items.length === 0) return null;
            return (
              <div key={b.label} className="x5-bandRow">
                <p className="x5-bandLabel">{b.label}</p>
                <ul>
                  {items.map(({ f, no }) => (
                    <li key={f.slug}>
                      <Link href={`/d/05/p/${f.slug}`} className="x5-bandLink">
                        <span className="x5-bandNo">{no}</span>
                        <span>{f.name}</span>
                        <span className="x5-bandPrice">{formatINR(f.variants[wood]!.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
