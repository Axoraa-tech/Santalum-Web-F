"use client";

import Link from "next/link";
import { useLayoutEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, featured, formatINR, getProduct, priceLabel, priceOf, productsFor, type Product } from "@/lib/shop/products";
import { setWoodQuietly } from "@/lib/wood";
import { careLines, catNo, countIn, DELIVERY_LINE, PROVENANCE_LINE, STORY_CLOSE } from "./content";
import { AddLine, MarkButton, OptionPicker, Qty } from "./Entry";
import { Letters } from "./Letters";
import { Stars } from "./Stars";
import { takePendingWood } from "./store";
import { useReviews } from "@/lib/shop/reviews";

/** Three pieces that sit well beside this one: the same category first, then the edition's selection. */
function pairsFor(p: Product): Product[] {
  const all = productsFor(p.wood).filter((x) => x.slug !== p.slug);
  const same = all.filter((x) => x.category === p.category);
  const rest = [...featured(p.wood, 26), ...all].filter((x) => x.slug !== p.slug && x.category !== p.category);
  return Array.from(new Set([...same, ...rest])).slice(0, 3);
}

/** The edition counter: one mark per number, the placed ones set in ink. */
function Ticks({ size, left }: { size: number; left: number }) {
  return (
    <div className="x5a-ticks" role="img" aria-label={`${size - left} of ${size} placed, ${left} remain`}>
      {Array.from({ length: size }, (_, i) => (
        <span key={i} data-placed={i < size - left || undefined} />
      ))}
    </div>
  );
}

/** A catalogue entry as an editorial article: huge name, every photograph on the grid, specifications as a table. */
export function Article({ slug }: { slug: string }) {
  const product = getProduct(slug)!;
  const wood = product.wood;
  const c = CONTENT[wood];
  const [option, setOption] = useState<string | undefined>(product.options?.values[0].id);
  const [qty, setQty] = useState(1);

  // The page belongs to its product's wood: the site follows it.
  useLayoutEffect(() => {
    takePendingWood();
    setWoodQuietly(product.wood);
  }, [product.wood]);

  const list = productsFor(wood);
  const no = catNo(product);
  const prev = no > 1 ? list[no - 2] : null;
  const next = no < list.length ? list[no] : null;
  const counterpart = product.counterpart ? getProduct(product.counterpart) : undefined;
  const pairs = pairsFor(product);
  const unit = priceOf(product, option);
  const plates = product.shots;
  const { summary } = useReviews(slug);

  return (
    <article className="x5a-article" data-wood-page={wood}>
      <header id="entry" className="x5a-head">
        <div className="x5a-meta">
          <p>
            <span>Entry</span>
            <br />
            No. {no} of {list.length} in {wood} sandalwood
          </p>
          <p>
            <span>Category</span>
            <br />
            <Link href={`/d/05/shop?c=${product.category}`} className="x5a-metaLink">
              {categoryOf(product).label}
            </Link>
          </p>
          <p>
            <span>{product.edition ? "Edition" : "Note"}</span>
            <br />
            {product.edition ? `${product.edition.left} of ${product.edition.size} remain` : (product.badge ?? "Made to order in small batches")}
          </p>
          <p>
            <span>Price</span>
            <br />
            {product.options ? `${formatINR(unit)}, ${product.options.values.find((v) => v.id === option)?.label}` : formatINR(unit)}
          </p>
        </div>
        <h1 className="x5a-name">
          <span className="x5a-nameInner">{product.name}</span>
        </h1>
        <p className="x5a-woodLine">
          {c.name}, <i>{c.latin}</i>
        </p>
        {summary.count > 0 && (
          <a href="#letters" className="x5a-rated">
            <Stars value={summary.avg} />
            <b>{summary.avg.toFixed(1)}</b>
            <span>
              from {summary.count} {summary.count === 1 ? "letter" : "letters"} to the editor
            </span>
          </a>
        )}
      </header>

      <div className="x5a-photos" data-n={plates.length}>
        {plates.map((shot, i) => (
          <figure key={i} className={`x5a-fig x5a-fig${i}`}>
            <div className="x5a-frame">
              <Photo p={shot.photo} tone={shot.tone} priority={i === 0} sizes={i === 0 ? "(min-width: 768px) 45vw, 92vw" : "(min-width: 768px) 28vw, 46vw"} />
            </div>
            <figcaption className="x5a-caption">
              <b>
                Plate {no}
                {String.fromCharCode(97 + i)}
              </b>
              {shot.photo.alt}.
            </figcaption>
          </figure>
        ))}
      </div>

      <p className="x5a-standfirst">{product.short}</p>

      <section id="specs" className="x5a-block" aria-labelledby="specs-title">
        <div className="x5a-side">
          <h2 id="specs-title" className="x5a-blockTitle">
            Specifications
          </h2>
          <p className="x5a-bigPrice" aria-live="polite">
            {formatINR(unit * qty)}
          </p>
          <p className="x5a-sideNote">
            {qty > 1 ? `${qty} at ${formatINR(unit)}. ` : ""}
            {priceLabel(product).startsWith("From") ? `${priceLabel(product)}, by ${product.options?.name.toLowerCase()}.` : "One price."}
          </p>
          {product.edition && (
            <div className="x5a-edition">
              <p>
                <b>{product.edition.left}</b> of {product.edition.size} remain
              </p>
              <Ticks size={product.edition.size} left={product.edition.left} />
            </div>
          )}
        </div>
        <div className="x5a-blockBody">
          <table className="x5a-table">
            <caption className="sr-only">Specifications of {product.name}</caption>
            <tbody>
              <tr>
                <th scope="row">Wood</th>
                <td>
                  {c.name}, <i>{c.latin}</i>
                </td>
              </tr>
              <tr>
                <th scope="row">Origin</th>
                <td>{c.origin.region}</td>
              </tr>
              <tr>
                <th scope="row">Category</th>
                <td>{categoryOf(product).label}</td>
              </tr>
              {product.details.map((d) => (
                <tr key={d.label}>
                  <th scope="row">{d.label}</th>
                  <td>{d.value}</td>
                </tr>
              ))}
              {product.options?.values.map((v) => (
                <tr key={v.id} data-current={v.id === option || undefined}>
                  <th scope="row">
                    {product.options!.name}, {v.label}
                  </th>
                  <td className="x5a-num">{formatINR(v.price)}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">Record</th>
                <td>{PROVENANCE_LINE[wood]}</td>
              </tr>
            </tbody>
          </table>

          <div className="x5a-buy">
            <OptionPicker product={product} value={option} onChange={setOption} idBase={`p-${product.slug}`} />
            <Qty value={qty} onChange={setQty} label={product.name} />
            <div className="x5a-order">
              <AddLine product={product} option={option} qty={qty} />
              <MarkButton slug={product.slug} name={product.name} />
            </div>
            <p className="x5a-orderNote">{DELIVERY_LINE}</p>
          </div>
        </div>
      </section>

      <section id="story" className="x5a-block" aria-labelledby="story-title">
        <div className="x5a-side">
          <h2 id="story-title" className="x5a-blockTitle">
            Story
          </h2>
          <p className="x5a-sa" lang="sa" aria-label={`${c.name} in Sanskrit: ${c.sanskrit}`}>
            {c.sanskrit}
          </p>
          <p className="x5a-sideNote">
            {c.name}, <i>{c.latin}</i>. At home, {c.localName.toLowerCase()}.
          </p>
        </div>
        <div className="x5a-story">
          {product.story.map((p, i) => (
            <p key={i} className={i === 0 ? "x5a-storyFirst" : undefined}>
              {p}
            </p>
          ))}
          <p className="x5a-storyClose">{STORY_CLOSE[wood]}</p>
        </div>
      </section>

      <section id="care" className="x5a-block" aria-labelledby="care-title">
        <h2 id="care-title" className="x5a-blockTitle">
          Care
        </h2>
        <ol className="x5a-care">
          {careLines(product).map((line, i) => (
            <li key={line}>
              <span className="x5a-careN">{i + 1}</span>
              {line}
            </li>
          ))}
        </ol>
      </section>

      <Letters slug={product.slug} name={product.name} />

      <nav id="pairs" className="x5a-block" aria-labelledby="pairs-title">
        <h2 id="pairs-title" className="x5a-blockTitle">
          Pairs with
        </h2>
        <div className="x5a-blockBody">
          <ol className="x5a-more">
            {pairs.map((p) => (
              <li key={p.slug}>
                <Link href={`/d/05/p/${p.slug}`} className="x5a-moreLink">
                  <span className="x5a-moreNo">{catNo(p)}</span>
                  <span className="x5a-moreThumb" aria-hidden>
                    <Photo p={p.shots[0].photo} tone={p.shots[0].tone} sizes="72px" />
                  </span>
                  <span className="x5a-moreName">{p.name}</span>
                  <span className="x5a-moreCat">{categoryOf(p).label}</span>
                  <span className="x5a-num">{priceLabel(p)}</span>
                </Link>
              </li>
            ))}
          </ol>

          {counterpart && (
            <Link href={`/d/05/p/${counterpart.slug}`} className="x5a-counter" data-wood-to={counterpart.wood}>
              <span className="x5a-counterThumb" aria-hidden>
                <Photo p={counterpart.shots[0].photo} tone={counterpart.shots[0].tone} sizes="120px" />
              </span>
              <span className="x5a-counterText">
                <span>Also in {CONTENT[counterpart.wood].name.toLowerCase()}</span>
                <b>{counterpart.name}</b>
                <span>
                  {priceLabel(counterpart)}. {CONTENT[counterpart.wood].oneLine}
                </span>
              </span>
            </Link>
          )}

          <div className="x5a-pager">
            {prev ? (
              <Link href={`/d/05/p/${prev.slug}`} className="x5a-pagerLink">
                <span>Previous entry, No. {no - 1}</span>
                <b>{prev.name}</b>
              </Link>
            ) : (
              <Link href="/d/05/shop" className="x5a-pagerLink">
                <span>First entry</span>
                <b>The catalogue</b>
              </Link>
            )}
            {next ? (
              <Link href={`/d/05/p/${next.slug}`} className="x5a-pagerLink x5a-pagerNext">
                <span>Next entry, No. {no + 1}</span>
                <b>{next.name}</b>
              </Link>
            ) : (
              <Link href="/d/05/shop" className="x5a-pagerLink x5a-pagerNext">
                <span>End of the {wood} catalogue</span>
                <b>All {countIn(wood)} pieces</b>
              </Link>
            )}
          </div>
        </div>
      </nav>
    </article>
  );
}
