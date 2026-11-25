import type { Metadata } from "next";
import { Desk } from "../_components/Account";
import { Footer } from "../_components/Footer";

export const metadata: Metadata = {
  title: "Membership desk — Santalum Maison",
  robots: { index: false },
};

export default function AccountPage() {
  return (
    <>
      <Desk />
      <Footer />
    </>
  );
}
