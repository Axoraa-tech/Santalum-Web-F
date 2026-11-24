import { CircleSignup } from "./_components/CircleSignup";
import { CollectionIndex } from "./_components/CollectionIndex";
import { Gifting } from "./_components/Gifting";
import { Hero } from "./_components/Hero";
import { MakingDial } from "./_components/MakingDial";
import { Provenance } from "./_components/Provenance";
import { TwoWoods } from "./_components/TwoWoods";
import { Vault } from "./_components/Vault";

/** Design 02, Orbit: the collection as a ring of wooden discs, and circles all the way down. */
export default function OrbitHome() {
  return (
    <>
      <Hero />
      <CollectionIndex />
      <TwoWoods />
      <MakingDial />
      <Provenance />
      <Vault />
      <Gifting />
      <CircleSignup />
    </>
  );
}
