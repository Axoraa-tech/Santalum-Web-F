import type { Metadata } from "next";
import { Bench } from "../_ui/Bench";
import { Gate } from "../_ui/kit";

export const metadata: Metadata = { title: "The bench" };

export default function Page() {
  return (
    <Gate>
      <Bench />
    </Gate>
  );
}
