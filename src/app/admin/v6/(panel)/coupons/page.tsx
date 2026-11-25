import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Coupons } from "../../_views/Coupons";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return (
    <Gate>
      <Coupons />
    </Gate>
  );
}
