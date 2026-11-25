"use client";

import Link from "next/link";
import { WT } from "@/components/maison/W";
import { CONTENT } from "@/lib/shop/content";
import { formatINR, productsFor } from "@/lib/shop/products";
import { DELIVERY } from "@/lib/shop/bag";
import { f } from "./cls";
import { ROOMS } from "./rooms";

/** The footer for every page outside the corridor: the museum's back wall, with the notes a visitor needs. */
export function Footer() {
  return (
    <footer className={f.foot}>
      <div className={f.top}>
        <p className={f.line}>
          <WT red="Objects time cannot repeat." white="The fragrance lives in the heartwood." />
        </p>
        <Link href="/d/04" className={f.back}>
          <WT red="Back to the red rooms" white="Back to the white rooms" />
        </Link>
      </div>
      <div className={f.cols}>
        <div>
          <h2 className={f.h}>Visit</h2>
          <ul className={f.list}>
            <li>
              <Link href="/d/04/shop">
                Shop <WT red={`${productsFor("red").length} red pieces`} white={`${productsFor("white").length} white pieces`} />
              </Link>
            </li>
            <li>
              <Link href="/d/04/track">Track your order</Link>
            </li>
            <li>
              <Link href="/d/04/account">Your account</Link>
            </li>
            <li>
              <Link href="/d/04/checkout">The register</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className={f.h}>Rooms</h2>
          <ul className={f.list}>
            {ROOMS.slice(0, 8).map((r) => (
              <li key={r.id}>
                <Link href={`/d/04#${r.id}`}>
                  <WT red={r.red} white={r.white} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={f.notes}>
          <h2 className={f.h}>Notes</h2>
          <dl>
            <div>
              <dt>Delivery</dt>
              <dd>
                Free across India, 3 to 5 working days. Express, 1 to 2 days, {formatINR(DELIVERY.express.price)}. Every
                parcel is insured to its full value.
              </dd>
            </div>
            <div>
              <dt>Returns</dt>
              <dd>Unused pieces within 14 days, in their packaging. Numbered editions are final.</dd>
            </div>
            <div>
              <dt>Care</dt>
              <dd>
                <WT red={CONTENT.red.care} white={CONTENT.white.care} />
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <p className={f.legal}>
        <span>{CONTENT.red.closing}</span>
        <span>
          © 2026 Santalum Maison.{" "}
          <WT red="Red sandalwood from documented lots in the Eastern Ghats." white="White sandalwood from documented lots in Karnataka." />
        </span>
      </p>
    </footer>
  );
}
