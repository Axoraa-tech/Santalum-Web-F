import { Circle } from "./_components/Circle";
import { Gifting } from "./_components/Gifting";
import { Making } from "./_components/Making";
import { PartsList } from "./_components/PartsList";
import { Provenance } from "./_components/Provenance";
import { Story } from "./_components/Story";
import { TwoWoods } from "./_components/TwoWoods";
import { Vault } from "./_components/Vault";

/** Design 01, Lathe. The story on the lathe, then the same work in a technical-drawing language. */
export default function LathePage() {
  return (
    <>
      <Story />
      <TwoWoods />
      <PartsList />
      <Making />
      <Provenance />
      <Vault />
      <Gifting />
      <Circle />
    </>
  );
}
