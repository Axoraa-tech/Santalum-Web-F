import type { Metadata } from "next";
import { ReviewBook } from "../../_c/Reviews";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Reviews" };

export default function Page() {
  return (
    <Gate>
      <ReviewBook />
    </Gate>
  );
}
