import type { Metadata } from "next";
import { NewCard } from "../../../_c/Card";
import { Gate } from "../../../_c/kit";

export const metadata: Metadata = { title: "New catalogue card" };

export default function Page() {
  return (
    <Gate>
      <NewCard />
    </Gate>
  );
}
