import Link from "next/link";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { countIn, DELIVERY_LINE, RETURNS_LINE } from "./content";
import { GridToggle } from "./GridOverlay";

/** The footer, set as a colophon on the twelve-column grid: the shop, the notes, the edition and how the page is made. */
export function Colophon() {
  return (
    <footer id="colophon" className="x5-colophon">
      <div className="x5-coGrid">
        <h2 className="x5-coTitle">Colophon</h2>

        <div className="x5-coBlock x5-coA">
          <h3>The shop</h3>
          <nav className="x5-coLinks" aria-label="Shop">
            <Link href="/d/05/shop">
              <WT red={`Shop, all ${countIn("red")} red pieces`} white={`Shop, all ${countIn("white")} white pieces`} />
            </Link>
            <Link href="/d/05/track">Track your order</Link>
            <Link href="/d/05/account">Your account</Link>
            <Link href="/d/05/checkout">Checkout</Link>
          </nav>
        </div>

        <div className="x5-coBlock x5-coB">
          <h3>Delivery</h3>
          <p>{DELIVERY_LINE} Every parcel is insured to its full value, and the record travels inside.</p>
        </div>

        <div className="x5-coBlock x5-coC">
          <h3>Returns</h3>
          <p>{RETURNS_LINE}</p>
        </div>

        <div className="x5-coBlock x5-coD">
          <h3>
            Care of <WT red="red" white="white" /> sandalwood
          </h3>
          <p>
            <WT red={CONTENT.red.care} white={CONTENT.white.care} />
          </p>
          <p>
            <WT red={CONTENT.red.regulation} white={CONTENT.white.regulation} />
          </p>
        </div>

        <div className="x5-coBlock x5-coE">
          <h3>In this edition</h3>
          <nav className="x5-coLinks" aria-label="Sections">
            <Link href="/d/05#essay">
              <WT red="Colour and weight" white="Scent and oil" />
            </Link>
            <Link href="/d/05#catalogue">
              <WT red="Selected in red" white="Selected in white" />
            </Link>
            <Link href="/d/05#provenance">
              <WT red="The batch record" white="The lot record" />
            </Link>
            <Link href="/d/05#vault">
              <WT red="The 2011 Vault" white="The 2011 Reserve" />
            </Link>
            <Link href="/d/05#circle">The Santalum Circle</Link>
          </nav>
        </div>

        <div className="x5-coBlock x5-coF">
          <h3>Paper and ink</h3>
          <p>
            Set in Schibsted Grotesk and Newsreader on a twelve-column grid.{" "}
            <WT
              red="This edition is printed on rose linen in a brown-black ink, with heartwood red as its one spot colour."
              white="This edition is printed on pale ivory in an umber ink, with antique brass as its one spot colour."
            />
          </p>
          <div className="x5-swatches" aria-hidden>
            <span style={{ background: "var(--paper)" }} />
            <span style={{ background: "var(--ink)" }} />
            <span style={{ background: "var(--grey)" }} />
            <span style={{ background: "var(--rule)" }} />
            <span style={{ background: "var(--spot)" }} />
          </div>
          <div className="x5-coLinks x5-coTools">
            <GridToggle />
            <a href="#top">Back to the top</a>
          </div>
        </div>
      </div>

      <p className="x5-coMark" aria-hidden>
        Santalum Maison<span className="x5-coMarkDot">.</span>
      </p>
      <div className="x5-coBase">
        <span>
          <WT red="Objects time cannot repeat." white="The fragrance lives in the heartwood." />
        </span>
        <span>© 2026 Santalum Maison, India</span>
      </div>
    </footer>
  );
}
