import { Circle } from "./_components/Circle";
import { Gifting } from "./_components/Gifting";
import { Journey } from "./_components/Journey";
import { Making } from "./_components/Making";
import { Provenance } from "./_components/Provenance";
import { ShopBand } from "./_components/ShopBand";
import { ThreadLine } from "./_components/ThreadLine";
import { Vault } from "./_components/Vault";
import { Woods } from "./_components/Woods";

/**
 * Design 03, Strand. The current wood's eight featured pieces hang on one 3D mala of 108 beads;
 * below it, a single brass thread runs on through the rest of the page, starting with the way into the shop.
 */
export default function StrandHome() {
  return (
    <>
      <Journey />
      <ThreadLine>
        <ShopBand />
        <Woods />
        <Making />
        <Provenance />
        <Vault />
        <Gifting />
        <Circle />
      </ThreadLine>
    </>
  );
}
