import type { Metadata } from "next";
import { Gate } from "../../_ui/Shell";
import { Reviews } from "../../_views/Reviews";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return (
    <Gate>
      <Reviews />
    </Gate>
  );
}
