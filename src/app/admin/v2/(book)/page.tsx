import type { Metadata } from "next";
import { Today } from "../_c/Today";
import { Gate } from "../_c/kit";

export const metadata: Metadata = { title: "Today" };

export default function Page() {
  return (
    <Gate>
      <Today />
    </Gate>
  );
}
