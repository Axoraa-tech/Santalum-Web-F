import type { Metadata } from "next";
import { CouponBook } from "../../_c/Coupons";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return (
    <Gate>
      <CouponBook />
    </Gate>
  );
}
