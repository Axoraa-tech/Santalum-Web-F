import { Catalogue } from "./_components/Catalogue";
import { Circle } from "./_components/Circle";
import { HOME_SECTIONS } from "./_components/content";
import { Essay } from "./_components/Essay";
import { Gifting } from "./_components/Gifting";
import { Hero } from "./_components/Hero";
import { Making } from "./_components/Making";
import { Provenance } from "./_components/Provenance";
import { SideIndex } from "./_components/SideIndex";
import { Specimens } from "./_components/Specimens";
import { Vault } from "./_components/Vault";

/** Design 05, "Index": the Maison as a Swiss editorial catalogue you read from cover to colophon. */
export default function IndexHome() {
  return (
    <div className="x5-page">
      <SideIndex items={HOME_SECTIONS} />
      <main className="x5-main">
        <Hero />
        <Specimens />
        <Essay />
        <Catalogue />
        <Making />
        <Provenance />
        <Vault />
        <Gifting />
        <Circle />
      </main>
    </div>
  );
}
