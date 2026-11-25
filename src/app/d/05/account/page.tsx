import type { Metadata } from "next";
import { AccountFile } from "../_components/Account";

export const metadata: Metadata = { title: "Your file — Index — Santalum Maison" };

/** The reader's file. Everything in it lives in this browser for now, so the page is drawn on the client. */
export default function AccountPage() {
  return (
    <div className="x5-page">
      <AccountFile />
    </div>
  );
}
