import type { Metadata } from "next";
import { Account } from "../_components/Account";

export const metadata: Metadata = { title: "Your account" };

export default function KineticAccountPage() {
  return <Account />;
}
