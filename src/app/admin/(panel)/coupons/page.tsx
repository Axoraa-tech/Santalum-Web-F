import type { Metadata } from "next";
import { CouponsView } from "../../_components/Coupons";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Coupons" };

export default function Page() {
  return (
    <Gate>
      <CouponsView />
    </Gate>
  );
}
