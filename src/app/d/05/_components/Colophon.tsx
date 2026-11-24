import Link from "next/link";
import { GridToggle } from "./GridOverlay";

/** The footer, set as a colophon on the twelve-column grid. */
export function Colophon() {
  return (
    <footer id="colophon" className="x5-colophon">
      <div className="x5-coGrid">
        <h2 className="x5-coTitle">Colophon</h2>

        <div className={`x5-coBlock x5-coA`}>
          <h3>Typefaces</h3>
          <p>Headlines and interface in Schibsted Grotesk, from regular to black.</p>
          <p>
            Text in Newsreader, which changes its drawing with size: finer for <em>large pull quotes</em>, sturdier for small reading text.
          </p>
        </div>

        <div className={`x5-coBlock x5-coB`}>
          <h3>Paper and ink</h3>
          <p>Set on an off-white ground, #FCFCFA, in ink #111111 with rules in #E4E3DE.</p>
          <p>One spot colour follows the wood: red heartwood in the red edition, brass in the white.</p>
          <div className="x5-swatches" aria-hidden>
            <span style={{ background: "#fcfcfa" }} />
            <span style={{ background: "#111111" }} />
            <span style={{ background: "#6f6f6b" }} />
            <span style={{ background: "#e4e3de" }} />
            <span style={{ background: "var(--spot)" }} />
          </div>
        </div>

        <div className={`x5-coBlock x5-coC`}>
          <h3>Credits</h3>
          <p>Objects designed by Santalum Maison and made by hand in India.</p>
          <p>Photographs are placeholders from Unsplash, to be replaced with the Maison&apos;s own photography.</p>
        </div>

        <div className={`x5-coBlock x5-coD`}>
          <h3>In this issue</h3>
          <nav className="x5-coLinks" aria-label="Sections">
            <Link href="/d/05#essay">From the heartwood</Link>
            <Link href="/d/05#catalogue">Catalogue</Link>
            <Link href="/d/05#provenance">Provenance</Link>
            <Link href="/d/05#vault">The 2011 Vault</Link>
          </nav>
        </div>

        <div className={`x5-coBlock x5-coE`}>
          <h3>Orders</h3>
          <nav className="x5-coLinks" aria-label="Orders">
            <Link href="/d/05#gifting">Gifting and corporate orders</Link>
            <Link href="/d/05#circle">The Santalum Circle</Link>
            <Link href="/d/05/checkout">Checkout</Link>
          </nav>
        </div>

        <div className={`x5-coBlock x5-coF`}>
          <h3>This page</h3>
          <div className="x5-coLinks">
            <GridToggle />
            <a href="#top">Back to the top</a>
          </div>
        </div>
      </div>

      <p className="x5-mark" aria-hidden>
        Santalum Maison<span className="x5-markDot">.</span>
      </p>
      <div className="x5-coBase">
        <span>Objects time cannot repeat.</span>
        <span>© 2026 Santalum Maison, India</span>
      </div>
    </footer>
  );
}
