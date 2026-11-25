import type { Metadata } from "next";
import { AccountStack } from "../_components/AccountStack";
import { PageFooter } from "../_components/PageFooter";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

export default function StackAccount() {
  return (
    <>
      <AccountStack />
      <PageFooter />
    </>
  );
}
