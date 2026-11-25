import type { Metadata } from "next";
import { Account } from "../_components/Account";

export const metadata: Metadata = { title: "Work-order file", robots: { index: false } };

export default function LatheAccountPage() {
  return <Account />;
}
