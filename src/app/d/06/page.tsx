import { s } from "./_components/cls";
import { CollectionBento } from "./_components/CollectionBento";
import { CraftBento } from "./_components/CraftBento";
import { HeroBento } from "./_components/HeroBento";
import { KeepBento } from "./_components/KeepBento";
import { ProvenanceBento } from "./_components/ProvenanceBento";
import { WoodsBento } from "./_components/WoodsBento";

/** Home: one continuous board of live tiles. */
export default function BentoHome() {
  return (
    <div className={s.page}>
      <HeroBento />
      <WoodsBento />
      <CollectionBento />
      <CraftBento />
      <ProvenanceBento />
      <KeepBento />
    </div>
  );
}
