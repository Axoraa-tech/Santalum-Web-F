"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Photo } from "@/components/Photo";
import { toggleWishlist, useWishlist } from "@/lib/shop/account";
import { bag } from "@/lib/shop/bag";
import { CONTENT } from "@/lib/shop/content";
import { categoryOf, formatINR, getProduct, priceLabel, priceOf, type Product } from "@/lib/shop/products";
import { careLines, catNo } from "./content";
import { slipFlag } from "./store";

/** Size, weight or volume, set as a row of text choices with their prices. */
export function OptionPicker({ product, value, onChange, idBase }: { product: Product; value?: string; onChange: (id: string) => void; idBase: string }) {
  const o = product.options;
  if (!o) return null;
  const current = value ?? o.values[0].id;
  return (
    <div className="x5-opts" role="radiogroup" aria-labelledby={`${idBase}-opt`}>
      <span id={`${idBase}-opt`} className="x5-optsLabel">
        {o.name}
      </span>
      {o.values.map((v) => {
        const on = v.id === current;
        return (
          <button
            key={v.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className="x5-opt"
            onClick={() => onChange(v.id)}
            onKeyDown={(e) => {
              if (e.key !== "ArrowRight" && e.key !== "ArrowLeft" && e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
              e.preventDefault();
              const i = o.values.findIndex((x) => x.id === current);
              const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
              const next = o.values[(i + step + o.values.length) % o.values.length];
              onChange(next.id);
              const group = e.currentTarget.parentElement;
              requestAnimationFrame(() => group?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus());
            }}
          >
            <span>{v.label}</span>
            <span className="x5-optPrice">{formatINR(v.price)}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Quantity, one to nine. */
export function Qty({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  return (
    <div className="x5-qty" role="group" aria-label={`Quantity of ${label}`}>
      <span className="x5-optsLabel">Quantity</span>
      <button type="button" className="x5-qtyBtn" aria-label="One fewer" disabled={value <= 1} onClick={() => onChange(value - 1)}>
        −
      </button>
      <span className="x5-qtyN" aria-live="polite">
        {value}
      </span>
      <button type="button" className="x5-qtyBtn" aria-label="One more" disabled={value >= 9} onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

/** Add to bag; opens the order slip so the new line is seen being printed. */
export function AddLine({
  product,
  option,
  qty = 1,
  note,
  label = "Add to bag",
  compact = false,
}: {
  product: Product;
  option?: string;
  qty?: number;
  note?: string;
  label?: string;
  compact?: boolean;
}) {
  const [added, setAdded] = useState(false);

  useEffect(() => {
    if (!added) return;
    const t = window.setTimeout(() => setAdded(false), 2400);
    return () => window.clearTimeout(t);
  }, [added]);

  return (
    <button
      type="button"
      className={compact ? "x5-addSmall" : "x5-addBtn"}
      data-added={added || undefined}
      onClick={() => {
        bag.add(product.slug, { option, qty, note });
        setAdded(true);
        slipFlag.set(true);
      }}
    >
      <span aria-live="polite">{added ? "Added to the slip" : label}</span>
      {!compact && <span>{formatINR(priceOf(product, option) * qty)}</span>}
    </button>
  );
}

/** Quick add when the piece has no options; otherwise a link to choose one on the entry page. */
export function QuickAdd({ product }: { product: Product }) {
  if (product.options)
    return (
      <Link href={`/d/05/p/${product.slug}`} className="x5-addSmall x5-addChoose">
        Choose {product.options.name.toLowerCase()}
      </Link>
    );
  return <AddLine product={product} compact label="Add" />;
}

/** The wishlist, set as marking an entry in the margin. Works signed out too. */
export function MarkButton({ slug, name, withLabel = true }: { slug: string; name: string; withLabel?: boolean }) {
  const list = useWishlist();
  const on = list.includes(slug);
  return (
    <button
      type="button"
      className="x5-mark"
      aria-pressed={on}
      aria-label={on ? `Remove ${name} from your wishlist` : `Add ${name} to your wishlist`}
      title={on ? "In your wishlist" : "Add to your wishlist"}
      onClick={() => toggleWishlist(slug)}
    >
      <span className="x5-markBox" aria-hidden />
      {withLabel && <span>{on ? "Marked" : "Mark"}</span>}
    </button>
  );
}

/** The detail spread a catalogue row opens into. */
export function Entry({ product, onClose }: { product: Product; onClose: () => void }) {
  const [option, setOption] = useState<string | undefined>(product.options?.values[0].id);
  const no = catNo(product);
  const counterpart = product.counterpart ? getProduct(product.counterpart) : undefined;
  return (
    <div className="x5-entry">
      <div className="x5-entryPhotos">
        {product.shots.slice(0, 3).map((shot, i) => (
          <figure key={i} className={`x5-ep x5-ep${i}`} data-n={product.shots.length}>
            <div className="x5-epFrame">
              <Photo p={shot.photo} tone={shot.tone} sizes={i === 0 ? "(min-width: 768px) 28vw, 80vw" : "(min-width: 768px) 18vw, 50vw"} />
            </div>
            <figcaption className="x5-caption">
              <b>
                Plate {no}
                {String.fromCharCode(97 + i)}
              </b>
              {shot.photo.alt}.
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="x5-entryText">
        <p className="x5-entrySummary">{product.short}</p>
        <div className="x5-entryStory">
          {product.story.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>

        <div className="x5-entryCols">
          <div>
            <h4 className="x5-entryH">Details</h4>
            <dl className="x5-entryDl">
              <div>
                <dt>Category</dt>
                <dd>{categoryOf(product).label}</dd>
              </div>
              {product.edition && (
                <div>
                  <dt>Edition</dt>
                  <dd>
                    {product.edition.left} of {product.edition.size} remain
                  </dd>
                </div>
              )}
              {product.details.map((d) => (
                <div key={d.label}>
                  <dt>{d.label}</dt>
                  <dd>{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h4 className="x5-entryH">Care</h4>
            {careLines(product).map((line) => (
              <p key={line} className="x5-entryCare">
                {line}
              </p>
            ))}
          </div>
        </div>

        <OptionPicker product={product} value={option} onChange={setOption} idBase={`entry-${product.slug}`} />
        <div className="x5-entryActions">
          <AddLine product={product} option={option} />
          <MarkButton slug={product.slug} name={product.name} />
          <Link href={`/d/05/p/${product.slug}`} className="x5-textLink">
            Read the full entry
          </Link>
          <button type="button" className="x5-textLink" onClick={onClose}>
            Close
          </button>
        </div>
        {counterpart && (
          <p className="x5-entryAlso">
            Also in {CONTENT[counterpart.wood].name.toLowerCase()}:{" "}
            <Link href={`/d/05/p/${counterpart.slug}`} className="x5-inlineLink">
              {counterpart.name}, {priceLabel(counterpart).replace("From ", "from ")}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
