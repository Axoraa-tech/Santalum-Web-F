import Link from "next/link";
import { Photo } from "@/components/Photo";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, getProduct } from "@/lib/shop/products";
import type { OrderLine } from "@/lib/shop/orders";
import type { BagItem } from "@/lib/shop/bag";
import { firstShot } from "../shop/shots";

type Row = { key: string; slug: string; name: string; wood: "red" | "white"; optionLabel?: string; note?: string; qty: number; total: number };

export function rowsFromBag(items: BagItem[]): Row[] {
  return items.map((i) => ({
    key: i.key,
    slug: i.slug,
    name: i.product.name,
    wood: i.product.wood,
    optionLabel: i.optionValue?.label,
    note: i.note,
    qty: i.qty,
    total: i.total,
  }));
}

export function rowsFromOrder(lines: OrderLine[]): Row[] {
  return lines.map((l, n) => ({
    key: `${l.slug}-${l.option ?? ""}-${n}`,
    slug: l.slug,
    name: l.name,
    wood: l.wood,
    optionLabel: l.optionLabel,
    note: l.note,
    qty: l.qty,
    total: l.unitPrice * l.qty,
  }));
}

/** Pieces as round photographs with their count, as on the bag island. */
export function OrderItems({ rows, link = true, className = "" }: { rows: Row[]; link?: boolean; className?: string }) {
  return (
    <ul className={`space-y-4 ${className}`}>
      {rows.map((r) => {
        const p = getProduct(r.slug);
        const shot = p ? firstShot(p) : undefined;
        const meta = [r.optionLabel, CONTENT[r.wood].name].filter(Boolean).join(", ");
        const pic = (
          <span className="absolute inset-0 overflow-hidden rounded-full bg-(--mz-surface-2)">
            {shot && <Photo p={shot.photo} tone={shot.tone} sizes="64px" />}
          </span>
        );
        return (
          <li key={r.key} className="flex items-center gap-4">
            <span className="relative size-14 shrink-0">
              {link ? (
                <Link href={`/maison/shop/${r.slug}`} aria-label={r.name} className="absolute inset-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--mz-accent)">
                  {pic}
                </Link>
              ) : (
                pic
              )}
              <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-(--mz-ink) text-[11px] tabular-nums text-(--mz-bg)">{r.qty}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-medium leading-snug">{r.name}</span>
              <span className="block text-[13px] text-(--mz-ink-3)">{meta}</span>
              {r.note && <span className="mt-0.5 block text-[13px] leading-snug text-(--mz-ink-2)">{r.note}</span>}
            </span>
            <span className="self-start pt-0.5 text-[15px] tabular-nums">{formatINR(r.total)}</span>
          </li>
        );
      })}
    </ul>
  );
}
