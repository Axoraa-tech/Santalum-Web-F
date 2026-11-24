import { Circle } from "./_components/Circle";
import { Collection } from "./_components/Collection";
import { Gifting } from "./_components/Gifting";
import { Heartwood } from "./_components/Heartwood";
import { Hero } from "./_components/Hero";
import { Making } from "./_components/Making";
import { Marquee } from "./_components/Marquee";
import { Provenance } from "./_components/Provenance";
import { Takeover } from "./_components/Takeover";
import { TwoWoods } from "./_components/TwoWoods";
import { Vault } from "./_components/Vault";

/** Design 10, Kinetic: type is the image. */
export default function KineticHome() {
  return (
    <>
      <Hero />
      <Marquee />
      <Heartwood />
      <TwoWoods />
      <Collection />
      <Making />
      <Provenance />
      <Vault />
      <Gifting />
      <Circle />
      <Takeover />
    </>
  );
}
