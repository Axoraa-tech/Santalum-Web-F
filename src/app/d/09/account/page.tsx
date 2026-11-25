import type { Metadata } from "next";
import { AccountDawn } from "../_components/Account";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

/** The account, under the sky of the visitor's own hour. */
export default function AccountPage() {
  return <AccountDawn />;
}
