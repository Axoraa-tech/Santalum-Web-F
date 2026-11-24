import { WoodDisc } from "../Logo";
import { Pill } from "../Pill";

/** The 2011 Vault: twenty-one numbered pieces, shown as twenty-one slices. */
export function Vault() {
  return (
    <section className="px-5 py-28 md:px-10 md:py-40">
      <div className="mx-auto grid max-w-[1500px] items-center gap-14 lg:grid-cols-2">
        <div>
          <h2 className="font-display text-[clamp(2.6rem,5.2vw,5.2rem)] font-[350] leading-[0.95] tracking-[-0.03em]">
            The 2011 Vault
          </h2>
          <p className="mt-6 max-w-md text-[17px] leading-relaxed text-ink-2">
            Heartwood sourced in 2011 and set aside since. Twenty-one cuffs, each numbered and entered in our registry
            with its origin, the artisan&rsquo;s name and the day it left us.
          </p>
          <div className="mt-10">
            <Pill href="/maison/shop/vault-cuff" size="lg">
              See the edition
            </Pill>
          </div>
        </div>
        <ol className="grid grid-cols-7 gap-2.5 rounded-[2.5rem] border border-hair p-4 sm:gap-3.5 sm:p-6" aria-label="Twenty-one numbered pieces">
          {Array.from({ length: 21 }, (_, i) => (
            <li key={i} className="group relative aspect-square">
              <WoodDisc className="size-full transition-transform duration-700 ease-out-soft group-hover:-translate-y-1 group-hover:rotate-90" />
              <span className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="rounded-full bg-paper/85 px-1.5 text-[11px] tabular-nums text-ink sm:text-[12px]">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
