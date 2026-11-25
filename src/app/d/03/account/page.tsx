import type { Metadata } from "next";
import { Account } from "../_components/Account";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

/** Sign in or create an account (beads on a thread); signed in: orders with their beads, saved pieces, addresses, profile. */
export default function AccountPage() {
  return <Account />;
}
