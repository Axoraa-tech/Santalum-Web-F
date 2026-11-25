import type { Metadata } from "next";
import { ReviewsView } from "../../_components/Reviews";
import { Gate } from "../../_components/Shell";

export const metadata: Metadata = { title: "Reviews and questions" };

export default function Page() {
  return (
    <Gate>
      <ReviewsView />
    </Gate>
  );
}
