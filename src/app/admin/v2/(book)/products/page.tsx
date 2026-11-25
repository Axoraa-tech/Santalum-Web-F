import type { Metadata } from "next";
import { Catalogue } from "../../_c/Catalogue";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Catalogue" };

export default function Page() {
  return (
    <Gate>
      <Catalogue />
    </Gate>
  );
}
