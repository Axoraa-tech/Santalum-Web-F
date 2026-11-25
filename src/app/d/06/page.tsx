import { W } from "@/components/maison/W";
import { s } from "./_components/cls";
import { CollectionBento } from "./_components/CollectionBento";
import { CraftBento } from "./_components/CraftBento";
import { HeroBento } from "./_components/HeroBento";
import { KeepBento } from "./_components/KeepBento";
import { ProvenanceBento } from "./_components/ProvenanceBento";
import { WoodsBento } from "./_components/WoodsBento";

/**
 * Home: one continuous board of live tiles. Each wood is a complete board of its own (copy,
 * pieces, steps, records, edition); both are rendered and CSS shows the current one, so a reload
 * in either wood paints the right board before hydration.
 */
export default function BentoHome() {
  return (
    <div className={s.page}>
      <HeroBento />
      <WoodsBento />
      <section id="collection" aria-label="The collection" className={s.section}>
        <W red={<CollectionBento wood="red" />} white={<CollectionBento wood="white" />} />
      </section>
      <section id="craft" aria-label="How it is made" className={s.section}>
        <W red={<CraftBento wood="red" />} white={<CraftBento wood="white" />} />
      </section>
      <section id="provenance" aria-label="Provenance" className={s.section}>
        <W red={<ProvenanceBento wood="red" />} white={<ProvenanceBento wood="white" />} />
      </section>
      <section id="edition" aria-label="The edition, gifting and the Santalum Circle" className={s.section}>
        <W red={<KeepBento wood="red" />} white={<KeepBento wood="white" />} />
      </section>
    </div>
  );
}
