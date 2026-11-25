import type { Metadata } from "next";
import { Coupons } from "../../_ui/marketing";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return <Coupons />;
}
