import type { Metadata } from "next";
import { Reviews } from "../../_ui/Reviews";
import { Gate } from "../../_ui/Shell";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return (
    <Gate>
      <Reviews />
    </Gate>
  );
}
