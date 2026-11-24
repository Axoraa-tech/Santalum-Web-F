import { Circle } from "./_components/Circle";
import { Gifting } from "./_components/Gifting";
import { Journey } from "./_components/Journey";
import { Making } from "./_components/Making";
import { Provenance } from "./_components/Provenance";
import { ThreadLine } from "./_components/ThreadLine";
import { Vault } from "./_components/Vault";
import { Woods } from "./_components/Woods";

/**
 * Design 03, Strand. The whole collection hangs on one 3D mala of 108 beads;
 * below it, a single brass thread runs on through the rest of the page.
 */
export default function StrandHome() {
  return (
    <>
      <Journey />
      <ThreadLine>
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
