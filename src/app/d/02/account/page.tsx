import type { Metadata } from "next";
import { Account } from "../_components/Account";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function OrbitAccountPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-5 pb-24 pt-28 md:px-10 md:pt-36">
      <Account />
    </div>
  );
}
