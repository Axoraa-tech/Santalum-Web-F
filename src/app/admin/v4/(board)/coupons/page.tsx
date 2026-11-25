import type { Metadata } from "next";
import { Coupons } from "../../_ui/Coupons";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return (
    <Gate>
      <Coupons />
    </Gate>
  );
}
