import type { Metadata } from "next";
import { ContentBook } from "../../_c/Content";
import { Gate } from "../../_c/kit";

export const metadata: Metadata = { title: "Content" };

export default function Page() {
  return (
    <Gate>
      <ContentBook />
    </Gate>
  );
}
