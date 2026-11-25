import type { Metadata } from "next";
import { Account } from "../_components/Account";
import { s } from "../_components/styles";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function AtlasAccountPage() {
  return (
    <main className={`${s.paper} min-h-svh pt-24 md:pt-28`}>
      <Account />
    </main>
  );
}
