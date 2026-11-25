import type { Metadata } from "next";
import { Reviews } from "../../_ui/Reviews";
import { Gate } from "../../_ui/kit";

export const metadata: Metadata = { title: "Review wall" };

export default function Page() {
  return (
    <Gate>
      <Reviews />
    </Gate>
  );
}
