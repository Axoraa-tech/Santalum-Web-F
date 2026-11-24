"use client";

import Link from "next/link";
import { Photo } from "@/components/Photo";
import { FAMILIES, formatINR } from "@/lib/catalog";
import { useWood } from "@/lib/wood";

/** Every piece in the current wood, strung on one thread; the one you are looking at is the large bead. */
export function StrandStrip({ current }: { current: string }) {
  const wood = useWood();
  const list = FAMILIES.filter((f) => f.variants[wood]);
  return (
    <section aria-labelledby="strip-h" className="mt-28 md:mt-36">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="strip-h" className="s3-serif text-[clamp(2rem,4vw,3.4rem)] leading-none">
          Every piece on the strand
        </h2>
        <p className="text-[14px] text-(--muted)">
          {list.length} pieces in {wood} sandalwood
        </p>
      </div>
      <div className="relative -mx-4 mt-10 overflow-x-auto px-4 pb-16 md:-mx-10 md:px-10">
        <ul className="relative flex min-w-max items-center gap-7 md:gap-9">
          <span className="absolute -left-10 -right-10 top-1/2 h-px bg-(--thread)" aria-hidden />
          {list.map((f) => {
            const on = f.slug === current;
            const v = f.variants[wood]!;
            return (
              <li key={f.slug} className="relative">
                <Link
                  href={`/d/03/p/${f.slug}`}
                  aria-current={on ? "page" : undefined}
                  className="group relative block"
                >
                  <span
                    className={`relative block overflow-hidden rounded-full border-[3px] transition-transform duration-500 group-hover:scale-105 group-active:scale-95 ${
                      on ? "h-32 w-32 border-(--m-accent) md:h-40 md:w-40" : "h-20 w-20 border-(--linen) md:h-24 md:w-24"
                    }`}
                  >
                    <Photo p={v.shots[0].photo} tone={v.shots[0].tone} sizes="160px" />
                  </span>
                  <span className="absolute left-1/2 top-full mt-3 w-max max-w-[11rem] -translate-x-1/2 text-center text-[13px] leading-tight">
                    <span className="block transition-colors group-hover:text-(--m-accent)">{f.name}</span>
                    <span className="mt-0.5 block text-(--muted)">{formatINR(v.price)}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
